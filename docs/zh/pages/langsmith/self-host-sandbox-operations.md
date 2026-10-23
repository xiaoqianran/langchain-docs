<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Operate self-hosted Sandboxes | https://docs.langchain.com/langsmith/self-host-sandbox-operations -->

# 运行自托管沙箱

规划自托管沙箱升级，了解主机消耗和故障恢复，保护共享存储并监控生产能力。

主机池及其共享存储上的自托管沙箱操作中心。主机更换影响运行工作负载；存储故障可能会影响整个池。使用本指南来规划升级并区分可恢复的中断和持久数据的丢失。

从 [Sandbox architecture](/langsmith/self-host-sandbox-architecture) 和 [capacity planning](/langsmith/self-host-sandbox-scaling) 开始。遵循[self-hosted upgrade guide](/langsmith/self-host-upgrades)了解全平台升级流程和发布要求。

## 了解滚动升级

`sandbox-host` 镜像打包了主机守护进程和运行时工件，包括 Firecracker、来宾工件和 JuiceFS 客户端。将 `images.sandboxHostImage.tag` 设置为 LangSmith 版本的运行时映像。升级较旧的存储布局时，请遵循特定于版本的说明。

主机部署使用`maxSurge: 0`和`maxUnavailable: 1`。 Kubernetes 在创建替代主机之前终止主机，然后等待替代主机准备就绪。所需的每节点一主机放置和共享主机端口可防止两个主机 Pod 占用同一节点。

**推出**健康的四主机池在每次替换期间具有三台就绪主机。时间表是说明性的；耗尽和启动持续时间取决于工作负载和存储。

正常部署会暂时删除一台主机的容量。对于单主机池，创建沙箱的请求将失败，直到替换主机准备就绪。现有未就绪的主机或基础设施故障可能会进一步减少容量； `maxUnavailable` 不能保证不发生无关的中断。

对于主机拥有的 JuiceFS 挂载，启动包括挂载文件系统并在打开主机侦听器之前检查存储访问。无法访问存储块的替代方案会进展而不是接受沙箱流量。

> [!警告]
>
> 滚动升级不是实时迁移或不间断执行。耗尽主机上的沙箱会暂停，并且它们打开的连接可能会断开。应用程序必须处理重新连接和中断的工作。

## 遵循主机排水

主机正常关闭会在 Pod 退出之前尝试挂起持久沙箱：

**1.停止新展示位置**

主机进入耗尽状态并通知平台后端。新的沙箱放置使用其他准备好的主机。

**2.保存正在运行的沙箱**主机在挂起该虚拟机时停止路由到每个沙箱。它尝试将虚拟机的内存保存到 JuiceFS 并报告沙箱已停止。

**3.释放主机**

主机在停止工作负载的同时不断更新租约。一旦虚拟机停止，它就会释放租约并拆除其存储挂载。

**4.按需恢复**

稍后的启动或唤醒请求会将沙箱放置在可用的兼容主机上。完整保存的内存映像允许进程恢复；否则恢复使用持久文件系统。

当替换主机准备就绪时，已停止的沙箱不会全部重新启动。它们保持停止状态，直到明确启动或通过唤醒它们的请求路径到达。

受影响沙箱的开放执行流、隧道和服务连接需要重新连接。保存的内存映像不会保留客户端的网络连接。

### 预算足够的时间来耗尽

`sandboxes.sandboxHost.deployment.terminationGracePeriodSeconds` 默认为 `300`。当宽限期到期时，Kubernetes 可以终止主机，即使主机尚未完成保存每个沙箱的内存。测量具有代表性沙箱密度和内存使用情况的排水管。检查关闭摘要以了解耗尽持续时间以及成功暂停或未能暂停的沙箱数量。增加主机无法及时保存每个沙箱内存时的宽限期，并使节点维护耗尽超时时间长于该期限。

不完全的耗尽可能会丢失运行内存，并需要对受影响的沙箱进行崩溃恢复。增加超时并不能解决存储不可用或容量不足的问题。

### 协调节点维护

节点更换和 Kubernetes 升级也会终止主机 Pod。配置节点维护过程以遵循正常关闭并避免同时耗尽多个沙箱主机。

启用 `sandboxes.sandboxHost.pdb.enabled` 使用图表的 PodDisruptionBudget 进行自愿驱逐。其默认预算允许一台不可用的主机。 PDB 不能防止节点故障、直接 Pod 删除或每个特定于提供程序的维护操作。保持节点自动缩放与主机自动缩放器一致。如果您的节点自动缩放程序支持逐出保护，请防止其在例行整合期间独立逐出活动主机 Pod。在删除空节点之前，让主机缩小规模耗尽工作负载。检查自动缩放器的行为，而不是假设一个注释适用于每个提供者。

不要通过删除多个主机 Pod 或增加超出您测试的容量的中断来加速部署。

### 诊断停滞的推出

比较所需的、就绪的和更新的主机数量。然后检查 pod 事件和节点配置：

* **主机停留`Pending`**：检查节点池限制、基础设施配额、区域容量、节点选择器、污点和资源请求。
* **主机启动但未准备就绪**：检查 KVM 可用性、运行时日志以及对 JuiceFS 元数据和对象存储的访问。
* **主机保持终止**：在更改宽限期之前检查耗尽进度和存储延迟。如果所需的副本超出可安排的容量，则部署可能无法满足其可用性下限。先恢复容量。 The `sandbox-host.smith.langchain.com/autoscale-override` Deployment annotation can temporarily pin the host count when autoscaling is enabled. Use it only after evaluating remaining capacity, and remove the override afterward. A lower target does not fix the underlying capacity shortage.

## 计划机器变更

内存快照包括CPU和虚拟机状态。不要假设已保存的虚拟机可以在不同的 CPU 型号或不兼容的主机内核之间恢复。 [Firecracker's snapshot compatibility guidance](https://github.com/firecracker-microvm/firecracker/blob/main/docs/snapshotting/snapshot-support.md#where-can-i-resume-my-snapshots) requires matching hardware and software configurations, with limited, explicitly caveated exceptions.

Keep a consistent CPU model in the sandbox pool. Treat changes to the CPU vendor or model, host kernel, or sandbox runtime as transitions that require restore testing. A newer CPU or kernel does not automatically make a destination compatible. Compatibility in one direction does not establish compatibility in reverse.

### Example transitions, not a support matrix> [!注意]
>
> 这些是基于文档的示例，而不是经过测试的 LangSmith 兼容性矩阵或支持平台的扩展。每个风险较低的候选人仍然需要验证您的确切部署。保持公开的 CPU 模型和功能、主机内核和沙箱运行时一致。确认目的地符合[Sandbox platform and KVM requirements](/langsmith/enable-self-hosted-sandboxes)。

这些示例涉及主机节点更改，而不是对已保存的 microVM 来宾配置的更改。

|云|需要验证的低风险候选人 |不要假定内存恢复兼容性 |
| - | - | - |
|亚马逊AWS |将 `m6i.metal` 节点替换为具有相同公开 CPU 配置和软件版本的另一个节点。 [M6i instances](https://aws.amazon.com/ec2/instance-types/m6i/)使用Intel Ice Lake处理器。 | `m6i.metal`（冰湖）→ `m5n.metal`（喀斯喀特湖）。 Firecracker 明确将此方向标识为不兼容。另请参阅[M5n processor specifications](https://aws.amazon.com/ec2/instance-types/m5/)。 |
| GCP |替换 N2 节点或调整其大小，同时保留相同的公开 CPU 平台、内核和运行时。验证实际的 CPU，而不是依赖机器系列名称。 | Ice Lake 上的 N2 节点 → Cascade Lake 上的 N2 节点。 [N2 series](https://docs.cloud.google.com/compute/docs/general-purpose-machines#n2_series) 包括两个平台；留在 N2 内并不会建立内存兼容性。 ||天蓝色| `Standard_D16ds_v6` → `Standard_D32ds_v6`，具有相同的内核和运行时。两个 [Ddsv6 sizes](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/ddsv6-series) 均列出了 Intel Xeon Platinum 8573C (Emerald Rapids)。与列出的处理器相匹配使其成为测试的候选者，而不是保证。 |即使没有更改 SKU，Dsv3 节点替换也会暴露不同的 CPU 型号。 [Dsv3 series](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dsv3-series) 列出了从 Haswell 到 Emerald Rapids 的多代产品。 |

匹配的 SKU 或系列不足以作为证据。提供商的安置和可用的处理器可能会有所不同。例如，[Google's CPU platform documentation](https://docs.cloud.google.com/compute/docs/cpu-platforms)描述了具有多个CPU平台的机器类型以及平台选择的工作原理。

> [!警告]
>
> x86-64 内存快照无法在 Arm CPU 上恢复。指令集的改变还需要架构兼容的客户软件；在 Arm 上启动相同的 x86-64 文件系统并不是恢复策略。不要将 CPU 架构更改视为普通的节点大小调整。

### 在推出前验证转换

要验证源到目标的转换：1. 确认目标公开`/dev/kvm`并满足支持的平台要求。
2. 记录源节点和目标节点暴露的CPU型号和特性、主机内核以及`sandbox-host`镜像版本。
3. 使用与目标配置匹配的隔离测试容量。恢复暂停在源节点上的持久沙箱，并从那里捕获的内存快照单独创建沙箱。 Confirm both run on a target node, not the original host.
4. 验证内存状态是否存在，然后执行代表性工作负载路径。 A successful VM boot alone does not establish compatibility.
5. 如果转出需要回滚，则测试反向。 Do not assume that a snapshot captured on the target can resume on an older source configuration.

如果恢复不兼容，请计划冷启动和内存中工作的丢失，而不是依赖内存迁移。 Persistent disk recovery is separate from memory restore.需要持久进程的应用程序应将其写入持久存储，而不是仅依赖于保存的进程内存。

## Understand failure impact|活动 | Platform behavior | Workload impact |
| - | - | - |
|主机崩溃或节点丢失 |在另一台主机上启动受影响的沙箱之前等待隔离。 |受影响的一台主机运行内存丢失。持久沙箱在稍后启动或唤醒请求时从持久磁盘中恢复。 |
| Kubernetes API 访问权限长时间丢失 |无法续签租约的主机会自我隔离以避免发生冲突。 |一台主机或整个池 可以停止一台主机上或跨池的工作负载，具体取决于中断情况。 |
|主机拥有的 JuiceFS 挂载失败 |主机在退出之前停止接受工作并停止其虚拟机。 |一台受影响的主机受影响的沙箱失去运行内存；恢复需要工作共享存储。 |
| Redis 元数据不可用 |文件系统操作停止或失败；持续的挂载运行状况故障可能会导致主机停止运行。 |池范围内的中断 沙箱创建和运行工作负载可能会在整个池中失败。 |
|对象存储不可用或受到限制 |未缓存的读取和上传会停止或失败；新主机可能无法准备就绪。 |池范围内的中断 I/O 缓慢或失败，并减少了就绪容量。 ||没有准备好的主机 |创建沙箱的请求失败并显示 `NoSandboxHostsAvailable`。 |沙箱创建受到影响 客户端必须在容量可用后重试。 |
|元数据或对象数据丢失 |仅恢复主机无法恢复文件系统。 |持续数据丢失 从经过测试的备份中恢复后备存储。 |

防护可防止替换主机在旧主机可能仍在运行时写入持久沙箱的磁盘。因此，宿主消失后不会立即恢复。不要通过手动更改沙箱所有权或删除共享存储状态来绕过该延迟。

## 保护沙箱存储

JuiceFS 元数据存储和对象存储形成一个持久文件系统。将它们与平台的缓存和队列 Redis 分开保护。* **Dedicated metadata Redis**: Use `noeviction`, high availability, persistence, and backups. Do not flush or recreate it as part of cache maintenance.
* **Memory headroom**: Alert before Redis reaches its memory limit. With `noeviction`, writes fail when memory is exhausted rather than evicting filesystem metadata.
* **Object retention**: Do not apply lifecycle rules that delete live JuiceFS objects or move them to an inaccessible storage tier.
* **Recovery testing**: Test restoring filesystem metadata and object data together. A replica improves availability but does not replace backups.
* **Private access**: Keep storage and host endpoints private. Use the installation guide's identity and secret configuration for your environment.

Choose backup frequency and retention for your recovery objectives. Do not assume an object-store backup alone contains the file tree needed to recover a sandbox.

## 监控池

The host exposes Prometheus metrics on its internal `/metrics` endpoint. Scrape it through your private monitoring infrastructure, not public ingress.平台监控设置请参见[Export LangSmith telemetry](/langsmith/export-backend)。

当选的主机导出这些池指标：|公制|意义|
| - | - |
| `langsmith_sandbox_host_pool_assigned_cpu_millicores` | CPU 致力于就绪主机上的沙箱。 |
| `langsmith_sandbox_host_pool_capacity_cpu_millicores` |就绪主机的 CPU 容量。 |
| `langsmith_sandbox_host_pool_ready_hosts` |池中准备就绪的主机。 |
| `langsmith_sandbox_host_pool_desired_replicas` |自动缩放处于活动状态时的副本目标。 |

还可以监控主机 Pod 就绪情况、`Pending` Pod、节点内存和磁盘压力、存储延迟、Redis 内存和驱逐、沙箱启动失败以及耗尽持续时间。所需主机和就绪主机之间的持续差距要求检查节点配置和主机启动，而不仅仅是工作负载需求。

### 检查生产准备情况

在运行生产工作负载之前：* 确认专用节点公开 KVM 并匹配主机选择器和容忍度。
* 为来宾、主机运行时、JuiceFS 和 Kubernetes 开销预留内存。
* 协调主机限制、节点限制、基础设施配额和工作区配额。
* 使用冷缓存测试从最小池大小的扩展。
* 测试负载下一台主机丢失和一次一台主机升级。
* 验证执行流或服务连接断开时的应用程序行为。
* 测量耗尽持续时间并设置兼容的 Pod 和节点关闭超时。
* 确认元数据 Redis 使用`noeviction` 并已测试备份和恢复过程。
* 监控对象存储访问、元数据容量以及所需主机和就绪主机之间的差距。

## 另请参阅

* [Sandbox architecture and lifecycle](/langsmith/self-host-sandbox-architecture)
* [Scale self-hosted Sandboxes](/langsmith/self-host-sandbox-scaling)
* [Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)
* [Upgrade self-hosted LangSmith](/langsmith/self-host-upgrades)
* [Plan platform disaster recovery](/langsmith/self-host-disaster-recovery)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sandbox-operations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。