<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted Sandbox architecture | https://docs.langchain.com/langsmith/self-host-sandbox-architecture -->

# 自托管沙盒架构

了解自托管 LangSmith 沙箱如何使用 microVM、Kubernetes 主机和共享存储来运行和恢复工作负载。

[LangSmith Sandboxes](/langsmith/sandboxes) 在专用 Kubernetes 节点池上的隔离 microVM 中运行代码。本指南解释了组件在哪里运行、请求如何到达沙箱以及主机重新启动后哪种状态仍然存在。

有关支持的平台、先决条件和安装说明，请参阅[Enable Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)。下面的架构描述了`sandbox-host`运行时。不同 Helm 版本的存储安装和配置选项可能有所不同。

<CardGroup>
  <Card title="Scaling and capacity" icon="arrows-maximize" href="/langsmith/self-host-sandbox-scaling">
    调整主机池大小、配置自动缩放以及规划内存和缓存容量。
  </Card>

  <Card title="Upgrades and operations" icon="server" href="/langsmith/self-host-sandbox-operations">
    了解主机耗尽、故障恢复和生产监控。
  </Card>
</CardGroup>

## 了解部署模型

沙箱是 Firecracker microVM，而不是 Kubernetes Pod。每个 `sandbox-host` pod 管理多个 microVM，每个 microVM 都有自己的来宾内核。 Kubernetes 调度主机； LangSmith 在其上放置沙箱。主机 Deployment 使用所需的 pod 反关联性在每个节点上最多放置一个主机 pod。其节点选择器和容忍度针对专用的、支持 KVM 的节点池。添加沙箱不会创建另一个 Pod。

<Frame>
  <SandboxDiagram name="architecture" />
</Frame>

### 了解组件故障的影响

每个组件都有不同的故障范围。规划恢复时，区分临时不可用和存储数据丢失。

<div>
  |组件|它在哪里运行以及它包含什么 |如果不可用或丢失 |
  | - | - | - |
  | `platform-backend` |现有LangSmith节点池。验证和授权请求、选择主机并代理流量。不保持持久沙箱状态。 | <span>API 不可用</span><br />当服务不可用时，沙箱 API 和代理流量失败。重新启动它不会删除沙盒磁盘。 |
  | PostgreSQL |现有LangSmith数据库。保存沙箱记录、主机注册表和放置。 | <span>API 不可用</span><br />中断会阻止需要沙箱记录或放置的操作。<br /><br /><span>持久数据面临风险</span><br />丢失数据库内容需要恢复这些记录，而不仅仅是重新启动主机。 || `sandbox-host` |专用沙盒节点池，每个节点一个 pod。保存正在运行的 microVM 及其内存。 | <span>受影响的一台主机</span><br />突然丢失会停止该主机的沙箱并丢失运行内存。持久磁盘保留在共享存储上。 |
  | JuiceFS 客户端 |每个主机 Pod 内主机拥有的安装。将虚拟机连接到共享存储并管理本地缓存。 | <span>受影响的一台主机</span><br />安装失败会隔离该主机并停止其虚拟机。重新启动需要工作共享存储。 |
  | Kubernetes API | Kubernetes 控制平面。保留主机租赁和主机部署。 | <span>池范围内的中断</span><br />无法续订租约的主机最终会自我隔离。集群范围内的长时间中断可能会导致整个池停止运行。 |
  | JuiceFS Redis |专用元数据存储。保存文件树、文件大小以及到数据块的映射。 | <span>池范围中断</span><br />中断会导致跨主机的文件系统操作停止或失败。<br /><br /><span>持久数据面临风险</span><br />丢失的元数据需要从备份中恢复。仅靠对象存储无法重建文件系统。 ||对象存储 |共享桶或容器。保存磁盘映像、节省的内存和快照的数据块。 | <span>池范围中断</span><br />中断会阻止未缓存的读取和上传。新主机可能无法准备就绪。<br /><br /><span>持久数据面临风险</span><br />删除的数据块需要从受影响的磁盘和快照的备份中恢复。 |
  |节点本地缓存 |每个沙箱节点。保存 JuiceFS 数据块的一次性副本。 | <span>仅缓存重建</span><br />持久数据保留在共享存储上。主机再次获取缓存的副本，在缓存预热时 I/O 速度会变慢。 |
</div>

有关防护、恢复行为和存储保护的信息，请参阅 [Understand failure impact](/langsmith/self-host-sandbox-operations#understand-failure-impact)。

一台当选的主机观察池健康状况并运行 [host autoscaler](/langsmith/self-host-sandbox-scaling#understand-the-two-scaling-layers)。其他主机继续提供沙箱服务，但不拥有领导权。

### 检查一个沙箱节点

主机 Pod 运行沙箱守护进程和 Firecracker 进程。在具有主机拥有的 JuiceFS 安装的部署中，它还运行 JuiceFS 客户端。守护进程通过`vsock`连接到每个访客内部的代理。

<Frame>
  <SandboxDiagram name="node" />
</Frame>主机在端口 `19190` 上使用主机网络。平台后端连接主机的节点地址；客户端使用 LangSmith API 或 [service URLs](/langsmith/sandbox-service-urls)，而不是直接使用主机侦听器。将主机侦听器保留在专用网络上。

主机 Pod 需要虚拟化、网络和安装的特权访问权限。使用专用节点并限制对它们的管理访问。来宾隔离不会使主机 Pod 成为非特权工作负载。

## 遵循请求

创建沙箱在到达主机之前会经过平台后端。后续命令、文件和服务请求遵循相同的授权边界。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'TWK Lausanne, Inter', 'fontSize': '15px', 'lineColor': '#40668D', 'primaryColor': '#E5F4FF', 'primaryTextColor': '#030710', 'primaryBorderColor': '#006DDD', 'actorBkg': '#E5F4FF', 'actorBorder': '#006DDD', 'actorTextColor': '#030710', 'actorLineColor': '#40668D', 'signalColor': '#40668D', 'signalTextColor': '#030710'}, 'sequence': {'width': 130, 'actorMargin': 30, 'mirrorActors': false, 'wrap': true}}}%%
sequenceDiagram
    accTitle: Create and use a self-hosted sandbox
    accDescr: The client calls the platform backend, which records and places the sandbox. The selected host prepares its filesystem and boots a microVM. Later requests pass through the backend and host to the guest.
    participant C as Client
    participant P as Platform<br/>backend
    participant D as PostgreSQL
    participant H as Sandbox<br/>host
    participant V as MicroVM
    C->>P: Create sandbox
    P->>P: Authenticate<br/>and authorize
    P->>D: Record sandbox<br/>and assign host
    P->>H: Create
    H->>H: Prepare disk<br/>on JuiceFS
    H->>V: Warm restore<br/>or cold boot
    V->>H: Guest ready
    H->>P: Created
    P->>D: Mark ready
    P->>C: Ready
    C->>P: Execute / files /<br/>service URL
    P->>P: Authenticate<br/>and authorize
    P->>H: Authorized request
    H->>V: Forward to guest
    V->>H: Response
    H->>P: Response
    P->>C: Response
```

放置会考虑已提交的 CPU，并在负载接近负载最小的候选主机时优先选择沙箱的前一个主机。返回该主机可以重用缓存的数据。这是一种偏好，而不是保证沙箱保留在一个节点上。

<Note>
  利用率目标控制扩展，而不是准入。繁忙的池仍然可以在现有主机上放置工作。如果没有就绪的主机，创建会失败并显示 `NoSandboxHostsAvailable`，而不是在容量队列中等待。参见[Plan for bursts](/langsmith/self-host-sandbox-scaling#plan-for-bursts)。
</Note>

## 跟踪持久状态

JuiceFS 将文件系统的元数据与其内容分开：* **Redis 元数据**：目录条目、文件大小以及从文件到数据块的映射。
* **对象存储**：磁盘映像、保存的内存映像和快照的数据块。
* **本地缓存**：各个节点上数据块的副本。节点替换会丢失该缓存，而不是共享文件系统。

<Warning>
  JuiceFS Redis 是持久存储，而不是LangSmith 缓存 Redis。如果没有元数据，对象存储本身无法重建文件系统。保护两个存储，使用 `noeviction` 进行元数据 Redis，并测试恢复。参见[Protect sandbox storage](/langsmith/self-host-sandbox-operations#protect-sandbox-storage)。
</Warning>

### 区分挂起和崩溃

持久沙箱可以在不同的兼容主机上恢复，因为它的磁盘和成功保存的内存位于共享存储上。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'TWK Lausanne, Inter', 'fontSize': '15px', 'lineColor': '#40668D', 'primaryTextColor': '#030710', 'textColor': '#030710', 'edgeLabelBackground': '#F2FAFF'}, 'flowchart': {'nodeSpacing': 80, 'rankSpacing': 100, 'curve': 'linear'}}}%%
flowchart TB
    accTitle: Persistent sandbox lifecycle
    accDescr: Provisioning leads to running. A graceful stop saves memory and moves to stopped. A later start or wake restores on a compatible host. Host loss instead requires fencing and a cold boot from persisted disk, without the previous running memory.
    P[Provisioning] --> R[Running]
    R -->|Graceful stop| S[Stopped: memory saved]
    S -->|Start or wake| R
    R -->|Host loss| F[Wait for fencing]
    F -->|Cold boot from disk| R
    S -->|Delete| D[Deleted]
    R -->|Delete| D
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef alert fill:#F8E8E6,stroke:#634643,stroke-width:2px,color:#634643
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:1px,color:#2F4B68
    class P,R process
    class S output
    class F alert
    class D neutral
```

* **Graceful stop**：主机节省VM内存并停止VM。稍后的启动或唤醒请求可以从该映像恢复正在运行的进程。
* **主机丢失**：运行内存丢失。恢复会等待防护窗口，然后另一台主机才能从持久磁盘启动沙箱。
* **删除**：删除沙箱而不是将其移动到另一台主机。单独捕获的[snapshot](/langsmith/sandbox-snapshots)有自己的生命周期。恢复内存需要完整、兼容的内存映像。它不是实时迁移，也不保留开放的客户端连接。突然发生故障后，未刷新的写入和内存中的工作可能会丢失。这些持久性保证不适用于临时沙箱存储。

## 另请参阅

* [Enable Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)
* [Scale self-hosted Sandboxes](/langsmith/self-host-sandbox-scaling)
* [Operate self-hosted Sandboxes](/langsmith/self-host-sandbox-operations)
* [Sandbox permissions](/langsmith/sandbox-permissions)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sandbox-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>