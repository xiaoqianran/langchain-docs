<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy to self-hosted | https://docs.langchain.com/langsmith/deploy-to-self-hosted-overview -->

# 部署到自托管

自托管 LangSmith 部署在您操作的基础设施内运行 [Agent Server](/langsmith/agent-server)、控制平面、数据平面和支持数据库。

LangChain 发送容器镜像、Helm 图表和许可证；您提供 Kubernetes 集群（或 Docker 主机）、PostgreSQL、Redis 以及适合您环境的网络和可观察性工具。当您有数据驻留、监管限制、自定义网络或气隙要求时，自托管是最佳部署选项。

<Callout icon="clipboard-check" color="#4F46E5" iconType="regular">
自托管部署需要随该计划提供的 [Enterprise plan](https://www.langchain.com/pricing) 和 LangSmith 许可证密钥。有关设置指南，请参阅[Self-hosted LangSmith](/langsmith/self-hosted)。
</Callout>

## 拓扑结构

LangSmith 支持三种自托管拓扑，可在设置复杂性与控制平面功能之间进行权衡。 [platform features](/langsmith/self-hosted-platform-features)、[Agent Server metrics](/langsmith/self-hosted-agent-server-metrics) 和 [diagnostics](/langsmith/diagnostics-self-hosted) 的参考页适用于所有三个。

<CardGroup cols={2}>

<Card title="Full self-hosted platform" icon="buildings" href="/langsmith/deploy-with-control-plane">
完整的 LangSmith 平台 — [control plane](/langsmith/control-plane) UI 和 API、[data plane](/langsmith/data-plane) 侦听器、可观察性、评估和代理部署管理。最适合希望在自己的网络中获得 LangSmith 产品体验的团队。
</Card><Card title="Hybrid" icon="cloud-network" href="/langsmith/hybrid">
LangChain 托管控制平面以及基础设施中的数据平面（代理服务器和数据库）。当您需要托管部署工作流程但需要代理工作负载和客户数据保留在 VPC 内时，这是最佳选择。
</Card>

<Card title="Standalone server" icon="server" href="/langsmith/deploy-standalone-server">
最轻的选项 - 带有您自己的 PostgreSQL 和 Redis 的代理服务器容器（API + 队列工作线程）。没有控制平面，没有托管 UI。最适合将运行时嵌入现有基础设施或气隙运行。
</Card>

<Card title="Platform features" icon="list-check" href="/langsmith/self-hosted-platform-features">
仅自托管平台行为的参考：自定义 Postgres 和 Redis、侦听器和资源自定义。
</Card>

<Card title="Agent Server metrics" icon="chart-line" href="/langsmith/self-hosted-agent-server-metrics">
Agent Server 的 Prometheus 和 Datadog 导出，包括部署 UI 指标和内部指标。
</Card>

<Card title="Diagnostics" icon="stethoscope" href="/langsmith/diagnostics-self-hosted">
收集日志、检查状态并对自托管安装进行故障排除。
</Card>

</CardGroup>

## 谁管理什么

自托管将基础设施运营的所有权从LangChain转移给您的团队，这为您配置和操作层的方式提供了灵活性和控制：|                                              | **谁管理它** | **它在哪里运行** |
|--------------------------------------------------------|--------------------------------|----------------------------------------|
| LangSmith 平台（UI、API、数据存储）|你|您的基础设施|
|代理服务器运行时 |你|您的基础设施|
| PostgreSQL 和 Redis |你|您的基础设施|
|适用于您的应用程序的 CI/CD |你|您的 CI 环境 |
|升级、扩展和备份 |你|您的基础设施|

作为回报，您可以与您自己的[Postgres](/langsmith/self-hosted-platform-features#custom-postgresql)和[Redis](/langsmith/self-hosted-platform-features#custom-redis)、大小[CPU and memory](/langsmith/self-hosted-platform-features#resource-customization)集成以适应您的工作负载，并在现有网络和可观测性堆栈中进行操作。对应的云托管模型请参见[Deploy to Cloud](/langsmith/deploy-to-cloud-overview)。

## 后续步骤

<CardGroup cols={2}>

<Card title="Pick a topology" icon="git-fork" href="/langsmith/deploy-standalone-server">
比较独立服务器、完整平台和混合服务器以找到合适的选择。
</Card>

<Card title="Install the full platform" icon="book" href="/langsmith/deploy-self-hosted-full-platform">
使用控制平面和数据平面在 Kubernetes 上部署LangSmith。
</Card>

</CardGroup>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-self-hosted-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>