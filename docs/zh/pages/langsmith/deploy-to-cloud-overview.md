<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy to Cloud | https://docs.langchain.com/langsmith/deploy-to-cloud-overview -->

# 部署到云端

将 LangSmith 代理部署到 AWS 和 GCP 上由 LangChain 托管的云基础设施。

[LangSmith Cloud](/langsmith/cloud) 是一个**用于部署代理的托管平台**。 LangChain 托管并运行 [control plane](/langsmith/control-plane)、[data plane](/langsmith/data-plane)、[Agent Server](/langsmith/agent-server) 运行时以及 AWS 和 GCP 上的支持数据库。将代码推送到连接的 GitHub 存储库或调用 `langgraph deploy` CLI，平台将处理构建、配置、扩展和持续操作。部署来自[two types](/langsmith/cloud-platform-features#deployment-types)：

* **无服务器**：空闲时扩展到零。适合后台代理、测试和延迟容忍的生产工作负载。
* **专用**：保持跨副本并自动缩放。适合对延迟敏感的生产工作负载。

在云上运行的代理部署需要[Plus plan or above](https://www.langchain.com/pricing)。在创建第一个代理部署之前，请验证您的应用程序是否使用 `langgraph dev` 在本地运行。参考[Local development and testing](/langsmith/local-dev-testing)。

> **[Deploy on Cloud](/langsmith/deploy-to-cloud)**
>
> 从 LangSmith UI 或 `langgraph deploy` CLI 创建、配置和管理云部署的分步设置指南。

> **[Cloud platform features](/langsmith/cloud-platform-features)**
>
> 仅云平台行为的参考：数据区域、静态 IP、负载限制、部署类型和托管数据库配置。

> **[Quickstart](/langsmith/deployment-quickstart)**
>
> 在几分钟内将您的第一个 LangGraph 应用程序部署到云。为了部署代码优先的深度代理而无需建立自己的代理服务器，[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)在公共测试版中提供了 CLI 优先的托管运行时。

## 后续步骤

> **[Run the quickstart](/langsmith/deployment-quickstart)**
>
> 端到端部署入门 LangGraph 应用程序。

> **[Read the full deploy guide](/langsmith/deploy-to-cloud)**
>
> 配置环境变量、机密、修订和部署设置。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。