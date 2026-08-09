<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/langsmith/observability -->

# 朗史密斯可观测性

使用 LangSmith 检测您的 LLM 申请、调查痕迹并监控生产中的性能。

<div>
  <div>
    <h1>朗史密斯可观测性</h1>

    LangSmith Observability 为您的 LLM 应用程序提供全面的可见性：从单个跟踪到整个生产范围的性能指标。

    <Callout icon="plug">
      LangSmith 与许多框架和提供商合作。浏览 [available integrations](/langsmith/integrations) 连接您的堆栈，包括 OpenAI、Anthropic、CrewAI、Vercel AI SDK、Pydantic AI 等。
    </Callout>

    <h2>开始</h2>

    <Steps>
      <Step title="Create an account" icon="user-plus">
        在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=snippets-langsmith-account-api-key-quickstart)注册（无需信用卡）。
        您可以使用 **Google**、**GitHub** 或 **电子邮件** 登录。
      </Step>

      <Step title="Create an API key" icon="key">
        转到您的 [Settings page](https://smith.langchain.com/settings) → **API 密钥** → **创建 API 密钥**。
        复制密钥并安全保存。
      </Step>
    </Steps>

    一旦您的帐户和 API 密钥准备就绪，请设置跟踪：

    <CardGroup>
      <Card title="Set up tracing" icon="settings" href="/langsmith/observability-quickstart">
        使用环境变量、框架集成或 SDK 在几分钟内将跟踪添加到您的应用程序。
      </Card>

      <Card title="Trace a RAG application" icon="notebook" href="/langsmith/observability-llm-tutorial">
        按照分步教程从头到尾检测检索增强生成应用程序。
      </Card>
    </CardGroup><h2>调查监控</h2>

    <CardGroup>
      <Card title="View traces" icon="route" href="/langsmith/filter-traces-in-application">
        通过 UI 或 API 过滤、导出、共享和比较跟踪。
      </Card>

      <Card title="Monitor performance" icon="chart-area" href="/langsmith/dashboards">
        构建仪表板并设置警报以跟踪质量并尽早发现问题。
      </Card>

      <Card title="Configure automations" icon="robot" href="/langsmith/rules">
        通过规则、网络钩子和在线评估实现工作流程自动化。
      </Card>

      <Card title="Collect feedback" icon="users" href="/langsmith/attach-user-feedback">
        使用队列或内联注释对输出进行注释并收集用户反馈。
      </Card>
    </CardGroup>

    <Card title="Find and fix failures with Engine" icon="https://mintcdn.com/langchain-5e9cc07a/auWE6_dMRp183OCf/images/brand/engine-icon-no-bg-dark.svg?fit=max&auto=format&n=auWE6_dMRp183OCf&q=85&s=dd41aef3ce789c1a04ea3c37b5903eac" href="/langsmith/engine-overview">
      自动检测跟踪中重复出现的问题，诊断其根本原因，并使用 LangSmith Engine 解决它们。
    </Card>

    术语和核心概念请参考[Observability concepts](/langsmith/observability-concepts)。有关跟踪定价、保留和限制，请参阅[Usage and billing](/langsmith/usage-and-billing)。

    <Note>
      要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。
    </Note>
  </div>
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>