<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure additional self-hosted features | https://docs.langchain.com/langsmith/self-host-additional-features -->

# 配置额外的自托管功能

选择要安装的可选自托管 LangSmith 功能，例如沙箱、引擎、队列和 LangSmith 部署，以及安装顺序。

[Self-hosted LangSmith](/langsmith/self-hosted) 支持基本安装之外的可选功能。首先完成[Kubernetes installation](/langsmith/kubernetes)。它已经包括可观察性和评估，以及[Insights and Chat](/langsmith/self-host-insights-chat)。然后仅遵循您的用例所需的指南。

## 选择附加功能

每个功能都有自己的设置指南。仅遵循您需要的功能的指南。当一个功能依赖于另一个功能时，请先设置依赖关系。* **[Sandboxes](/langsmith/enable-self-hosted-sandboxes)**：运行隔离的代码工作负载。它的指南涵盖了支持 KVM 的节点、JuiceFS 存储和可选服务 URL。
* **[Engine](/langsmith/engine-self-hosted)**：诊断重复出现的问题并提出修复建议。引擎需要沙箱、具有引擎权利的许可证、模型配置以及 Helm 图表版本 0.16.0 或更高版本。 [Air-gapped installations](/langsmith/engine-self-hosted#air-gapped-installations) 和您自己的模型提供程序需要 Helm 图表版本 0.17.0 或更高版本。
* **[Fleet](/langsmith/enable-self-hosted-fleet)**：创建和管理无代码代理。其指南涵盖车队服务以及可选工具和触发器。
* **[LLM Gateway](/langsmith/llm-gateway-self-hosted)**：路由模型调用并应用策略。它需要 Helm Chart 0.17.1 或更高版本。它的指南涵盖服务连接、提供商配置和您的第一次网关调用。
* **[LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform)**：通过LangSmith UI 部署和管理代理服务器。它的指南涵盖了 KEDA、入口、控制平面和数据平面。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-additional-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>