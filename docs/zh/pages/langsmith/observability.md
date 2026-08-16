<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/langsmith/observability -->

# LangSmith 可观测性

<div class="home-page mx-auto max-w-8xl px-0 lg:px-5" style={{ paddingBottom: "8rem" }}>
<div class="mdx-content prose prose-gray dark:prose-invert mx-4 pt-10">
<h1 class="flex whitespace-pre-wrap group font-semibold text-2xl sm:text-3xl mt-8">LangSmith 可观察性</h1>

LangSmith 可观察性为您的 LLM 申请提供全面的可见性：从单个跟踪到整个生产范围的性能指标。

<Callout icon="plug" color="#4F46E5" iconType="regular">
LangSmith 可与许多框架和提供商合作。浏览 [available integrations](/langsmith/integrations) 连接您的堆栈，包括 OpenAI、Anthropic、CrewAI、Vercel AI SDK、Pydantic AI 等。
</Callout>

<h2 class="flex whitespace-pre-wrap group font-semibold">开始</h2>

<Steps>
    <Step title="Create an account" icon="user-plus">
        在[smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=snippets-langsmith-account-api-key-quickstart)注册（无需信用卡）。
        您可以使用 **Google**、**GitHub** 或 **电子邮件** 登录。
    </Step>
    <Step title="Create an API key" icon="key">
        转到您的 [Settings page](https://smith.langchain.com/settings) → **API 密钥** → **创建 API 密钥**。
        复制密钥并安全保存。
    </Step>
</Steps>

一旦您的帐户和 API 密钥准备就绪，请设置跟踪：

<CardGroup cols={2}>
  <Card
    title="Set up tracing"
    icon="settings"
    href="/langsmith/observability-quickstart"
    arrow="true"
  >
    使用环境变量、框架集成或 SDK 在几分钟内将跟踪添加到您的应用程序。
  </Card>

  <Card
    title="Trace a RAG application"
    icon="notebook"
    href="/langsmith/observability-llm-tutorial"
    arrow="true"
  >
    按照分步教程从头到尾检测检索增强生成应用程序。
  </Card>
</CardGroup>

<h2 class="flex whitespace-pre-wrap group font-semibold">调查监控</h2>

<CardGroup cols={2}>
  <Card
    title="View traces"
    icon="route"
    href="/langsmith/filter-traces-in-application"
    arrow="true"
  >
    通过 UI 或 API 过滤、导出、共享和比较跟踪。
  </Card>

  <Card
    title="Monitor performance"
    icon="chart-area"
    href="/langsmith/dashboards"
    arrow="true"
  >
    构建仪表板并设置警报以跟踪质量并尽早发现问题。
  </Card><Card
    title="Configure automations"
    icon="robot"
    href="/langsmith/rules"
    arrow="true"
  >
    通过规则、网络钩子和在线评估实现工作流程自动化。
  </Card>

  <Card
    title="Collect feedback"
    icon="users"
    href="/langsmith/attach-user-feedback"
    arrow="true"
  >
    使用队列或内联注释对输出进行注释并收集用户反馈。
  </Card>
</CardGroup>

<Card
    title="Find and fix failures with Engine"
    icon="/images/brand/engine-icon-no-bg-dark.svg"
    href="/langsmith/engine-overview"
    arrow="true"
>
    自动检测跟踪中重复出现的问题，诊断其根本原因，并使用 LangSmith 引擎解决它们。
</Card>

术语和核心概念请参考[Observability concepts](/langsmith/observability-concepts)。有关跟踪定价、保留和限制，请参阅[Usage and billing](/langsmith/usage-and-billing)。

<Note>
要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。
</Note>
</div>
</div>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>