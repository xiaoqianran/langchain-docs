<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy to Cloud | https://docs.langchain.com/langsmith/deploy-to-cloud-overview -->

# 部署到云端

将 LangSmith 代理部署到 AWS 和 GCP 上由 LangChain 托管的云基础设施。

[LangSmith Cloud](/langsmith/cloud) 是一个**用于部署代理的托管平台**。 LangChain 托管和运行 [control plane](/langsmith/control-plane)、[data plane](/langsmith/data-plane)、[Agent Server](/langsmith/agent-server) 运行时以及 AWS 和 GCP 上的支持数据库。将代码推送到连接的 GitHub 存储库或调用 `langgraph deploy` CLI，平台将处理构建、配置、扩展和持续操作。部署有两种类型：无服务器，一种轻量级、完全托管的选项，在一段时间不活动后可扩展到零；以及用于生产工作负载的专用、始终在线的基础设施。详情请参见[Deployment types](/langsmith/cloud-platform-features#deployment-types)。

<Callout icon="clipboard-check">
  在云上运行的代理部署需要[Plus plan or above](https://www.langchain.com/pricing)。在创建第一个代理部署之前，请验证您的应用程序是否使用 `langgraph dev` 在本地运行。参考[Local development and testing](/langsmith/local-dev-testing)。
</Callout>

<CardGroup>
  <Card title="Deploy on Cloud" icon="cloud" href="/langsmith/deploy-to-cloud">
    从 LangSmith UI 或 `langgraph deploy` CLI 创建、配置和管理云部署的分步设置指南。
  </Card>

  <Card title="Cloud platform features" icon="settings" href="/langsmith/cloud-platform-features">
    仅云平台行为的参考：数据区域、静态 IP、负载限制、部署类型和托管数据库配置。
  </Card>

  <Card title="Quickstart" icon="bolt" href="/langsmith/deployment-quickstart">
    在几分钟内将您的第一个 LangGraph 应用程序部署到云。
  </Card>
</CardGroup>为了部署代码优先的深度代理而无需建立自己的代理服务器，[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)在私人测试版中提供了 CLI 优先的托管运行时。

## 后续步骤

<CardGroup>
  <Card title="Run the quickstart" icon="bolt" href="/langsmith/deployment-quickstart">
    端到端部署入门 LangGraph 应用程序。
  </Card>

  <Card title="Read the full deploy guide" icon="book" href="/langsmith/deploy-to-cloud">
    配置环境变量、机密、修订和部署设置。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>