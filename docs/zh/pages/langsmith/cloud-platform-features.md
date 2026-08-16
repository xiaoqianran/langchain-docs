<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Cloud platform features | https://docs.langchain.com/langsmith/cloud-platform-features -->

# 云平台功能

本页面介绍仅适用于 [Cloud](/langsmith/cloud) 部署的平台功能。对于自托管等效项，请参阅 [Deploy to self-hosted](/langsmith/deploy-to-self-hosted-overview)。

## 数据区域

可以在两个数据区域创建部署：美国和欧盟。

部署的数据区域由创建部署的LangSmith 组织的数据区域隐含。部署和部署的底层数据库无法在数据区域之间迁移。

## 静态IP地址

2025 年 1 月 6 日之后创建的部署中的所有流量均通过 NAT 网关。该 NAT 网关有多个静态 IP 地址，具体取决于数据区域。有关静态 IP 地址列表，请参阅[Allowlist IP addresses table](/langsmith/deploy-to-cloud#allowlist-ip-addresses)。

## 负载大小

发送到云部署的所有请求的最大负载大小为 25 MB。负载大于 25 MB 的请求会返回 `413 Payload Too Large` 错误。

## 部署类型

控制平面提供两种部署类型：无服务器和专用。每个都有三种尺寸可供选择：小号、中号和大号。仍采用先前定价的组织将继续创建开发和生产部署，直至 2026 年 10 月 1 日。这些类型不包括扩展到零。要使用 CLI 选择它们，请传递 `--deployment-type dev` 或 `--deployment-type prod`。有关定价和过渡时间表，请参阅[Manage billing](/langsmith/billing#langsmith-deployment-billing)。有关 `--deployment-type` 值的完整列表，请参阅 [⟦T4⟧](/langsmith/cli#deploy)。

| **部署类型** | **缩放** | **数据库** | **最适合** |
|---|---|---|---|
|无服务器|不活动后缩放至零，在下一个请求时唤醒 |共享、多租户 |后台或延迟容忍代理以及开发/测试部署 |
|专注|始终在线、跨副本自动缩放 |专用，具有自动备份和高可用性|关键路径中的生产工作负载|

<Warning>
**不可变部署类型**
一旦创建部署，部署类型就无法更改。您仍然可以更改其[size](#sizes)。
</Warning>

### 无服务器无服务器部署针对后台和延迟容忍代理以及开发、测试和预览分支进行了成本优化。无服务器部署在一段时间不活动后会扩展到零，并在下一个请求时唤醒。在配置资源时对计算进行计费，包括在部署缩减之前的空闲时间。这使得它非常适合间歇性运行或可以容忍短暂启动延迟的代理，因为在部署开始时，缩减后的第一个请求需要更长的时间来响应。

对于需要持续低延迟或保证正常运行时间的工作负载，请改用专用。无服务器部署在共享的多租户基础架构上运行。

<Note>
扩展到零是在 [beta](/langsmith/release-stages) 中，最初仅适用于基于新的基于使用的定价的部署。随着功能的推出，缩小之前的不活动窗口可能会发生变化。有关定价和过渡时间表，请参阅[Manage billing](/langsmith/billing#langsmith-deployment-billing)。
</Note>

Agent Server 具有容错能力：它会自动从短暂的 Redis 或 Postgres 中断中恢复，并重试失败的后台运行。

＃＃＃ 投入的专用部署始终在线，专为关键路径中的生产工作负载而构建，例如面向客户的应用程序。每个专用部署都有自己的数据库，具有自动备份和高可用性，并随着负载的增加跨副本自动扩展。详情请参见[Scaling](#scaling)。

专用部署的资源可以根据用例和容量限制逐案增加。通过 [support.langchain.com](https://support.langchain.com) 联系支持人员以请求增加资源。

### 尺寸

Serverless 和 Dedicated 均提供三种大小：小型、中型和大型。每个大小都会设置为部署配置的计算和内存，较大的大小会自动缩放到更多副本。下表显示了每个尺寸包含的资源：

|资源 |无服务器 S |无服务器 M |无服务器 L |专用S|专用M|专用L|
|---|---|---|---|---|---|---|
|运行时计算 (vCPU) | 1 | 2 | 4 | 3 | 5 | 10 | 10
|运行时内存 (GiB) | 2 | 5 | 9 | 6 | 12 | 12 24 |
|数据库计算 (vCPU) | — | — | — | 1 | 2 | 4 |
|数据库内存 (GiB) | — | — | — | 4 | 8 | 16 | 16
|存储|共享|共享|共享|自动缩放 |自动缩放|自动缩放|<Note>
运行时计算和内存是跨部署容器调配的总 vCPU 和内存，四舍五入到最接近的整体单位。无服务器部署使用共享的多租户数据库，因此没有专用的数据库资源。专用存储是一种随着使用量而增长的自动缩放磁盘。
</Note>

有关每种尺寸的价格，请参阅[pricing page](https://www.langchain.com/pricing)，其中包含部署成本计算器。有关无服务器和专用部署的计费方式，请参阅[Manage billing](/langsmith/billing#langsmith-deployment-billing)。

## 数据库配置

控制平面和 [data plane](/langsmith/data-plane) 侦听器应用程序协调起来，为每个云部署自动创建一个 Postgres 数据库。该数据库充当部署的[persistence layer](/oss/python/langgraph/persistence#memory-store)。

实现LangGraph应用时，无需配置[checkpointer](/oss/python/langgraph/persistence#checkpointer-libraries)。会自动为图表配置检查点。为图表配置的任何检查点都将替换为自动配置的检查点。

无法直接访问数据库。对数据库的所有访问都通过[Agent Server](/langsmith/agent-server) 进行。

在删除部署本身之前，数据库永远不会被删除。

对于自托管部署，请参阅[custom PostgreSQL configuration](/langsmith/self-hosted-platform-features#custom-postgresql)。

## 缩放云部署自动扩展；您不直接配置队列工作线程、副本或池大小。专用部署根据 CPU 利用率、内存利用率和挂起运行的数量添加和删除副本，最多可达其大小的最大值。每个指标都是独立评估的，并且部署可以扩展以满足需要最多副本的需求。 [Queue workers](/langsmith/agent-server#runtime-architecture) 在挂起的运行计数上进行扩展，而 [API servers](/langsmith/agent-server#runtime-architecture) 在 CPU 和内存上进行扩展，因此读取流量不会减慢运行提交，反之亦然。延迟缩小以避免突发负载下的颠簸。

自动缩放会更改副本数量，但每个副本可用的 CPU 和内存由部署的 [size](#sizes) 固定。如果部署持续承受 CPU 或内存压力，请将其升级到更大的大小。尺寸更改会作为新版本推出，无需停机；部署类型无法更改。

应用程序级扩展杠杆（持久性模式、异步模式、避免同步阻塞、使用`/join`而不是轮询）适用于云，与自托管相同。基本概念参见[Scaling on self-hosted](/langsmith/agent-server-scale)；其中的 Helm 和资源配置不适用于 Cloud。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud-platform-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>