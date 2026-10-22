<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/langsmith/observability -->

# LangSmith 可观测性

使用 LangSmith 检测您的 LLM 申请、调查痕迹并监控生产中的性能。

# LangSmith 可观测性

LangSmith 可观察性为您的 LLM 申请提供全面的可见性：从单个跟踪到整个生产范围的性能指标。痕迹是您的代理在生产中所做的事情的记录。使用它们来调试故障、监控质量并构建您评估的数据集。

LangSmith 可与许多框架和提供商合作。浏览 [available integrations](/langsmith/integrations) 连接您的堆栈，包括 OpenAI、Anthropic、CrewAI、Vercel AI SDK、Pydantic AI 等。

## 开始吧

**1.创建帐户**

在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=snippets-langsmith-account-api-key-quickstart)注册（无需信用卡）。
您可以使用 **Google**、**GitHub** 或 **电子邮件** 登录。

**2.创建 API 密钥**

转到您的 [Settings page](https://smith.langchain.com/settings) > **API 密钥** > **创建 API 密钥**。
复制密钥并安全保存。

一旦您的帐户和 API 密钥准备就绪，请设置跟踪：

> **[Set up tracing](/langsmith/observability-quickstart)**
>
> 使用环境变量、框架集成或 SDK 在几分钟内将跟踪添加到您的应用程序。

> **[Trace a RAG application](/langsmith/observability-llm-tutorial)**
>
> 按照分步教程从头到尾安装检索增强生成应用程序。

## 调查和监控> **[View traces](/langsmith/view-traces)**
>
> 在“消息”、“轮数”和“详细信息”视图中检查线程和运行。

> **[Monitor performance](/langsmith/dashboards)**
>
> 构建仪表板并设置警报以跟踪质量并尽早发现问题。

> **[Configure automations](/langsmith/rules)**
>
> 通过规则、网络钩子和在线评估实现工作流程自动化。

> **[Collect feedback](/langsmith/attach-user-feedback)**
>
> 使用队列或内联注释对输出进行注释并收集用户反馈。

> **[Find and fix failures with Engine](/langsmith/engine)**
>
> 自动检测跟踪中重复出现的问题，诊断其根本原因，并使用 LangSmith 引擎解决它们。

术语和核心概念请参考[Observability concepts](/langsmith/observability-concepts)。有关跟踪定价、保留和限制，请参阅[Usage and billing](/langsmith/usage-and-billing)。

> [!注意]
>
> 要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。