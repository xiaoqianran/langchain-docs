<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/langsmith/observability -->

# LangSmith Observability

<div class="home-page mx-auto max-w-8xl px-0 lg:px-5" style={{ paddingBottom: "8rem" }}>
<div class="mdx-content prose prose-gray dark:prose-invert mx-4 pt-10">
<h1 class="flex whitespace-pre-wrap group font-semibold text-2xl sm:text-3xl mt-8">LangSmith Observability</h1>

LangSmith Observability provides full visibility into your LLM application: from individual traces to production-wide performance metrics.

<Callout icon="plug" color="#4F46E5" iconType="regular">
LangSmith works with many frameworks and providers. Browse [available integrations](/langsmith/integrations) to connect your stack including OpenAI, Anthropic, CrewAI, Vercel AI SDK, Pydantic AI, and more.
</Callout>

<h2 class="flex whitespace-pre-wrap group font-semibold">Get started</h2>

<Steps>
    <Step title="Create an account" icon="user-plus">
        Sign up at [smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=snippets-langsmith-account-api-key-quickstart) (no credit card required).
        You can log in with **Google**, **GitHub**, or **email**.
    </Step>
    <Step title="Create an API key" icon="key">
        Go to your [Settings page](https://smith.langchain.com/settings) → **API Keys** → **Create API Key**.
        Copy the key and save it securely.
    </Step>
</Steps>

Once your account and API key are ready, set up tracing:

<CardGroup cols={2}>
  <Card
    title="Set up tracing"
    icon="settings"
    href="/langsmith/observability-quickstart"
    arrow="true"
  >
    Add tracing to your app in minutes with environment variables, framework integrations, or the SDK.
  </Card>

  <Card
    title="Trace a RAG application"
    icon="notebook"
    href="/langsmith/observability-llm-tutorial"
    arrow="true"
  >
    Follow a step-by-step tutorial to instrument a retrieval-augmented generation app from start to finish.
  </Card>
</CardGroup>

<h2 class="flex whitespace-pre-wrap group font-semibold">Investigate and monitor</h2>

<CardGroup cols={2}>
  <Card
    title="View traces"
    icon="route"
    href="/langsmith/filter-traces-in-application"
    arrow="true"
  >
    Filter, export, share, and compare traces via the UI or API.
  </Card>

  <Card
    title="Monitor performance"
    icon="chart-area"
    href="/langsmith/dashboards"
    arrow="true"
  >
    Build dashboards and set alerts to track quality and catch issues early.
  </Card>

  <Card
    title="Configure automations"
    icon="robot"
    href="/langsmith/rules"
    arrow="true"
  >
    Automate workflows with rules, webhooks, and online evaluations.
  </Card>

  <Card
    title="Collect feedback"
    icon="users"
    href="/langsmith/attach-user-feedback"
    arrow="true"
  >
    Annotate outputs and gather user feedback using queues or inline annotation.
  </Card>
</CardGroup>

<Card
    title="Find and fix failures with Engine"
    icon="/images/brand/engine-icon-no-bg-dark.svg"
    href="/langsmith/engine-overview"
    arrow="true"
>
    Automatically detect recurring issues in your traces, diagnose their root cause, and resolve them with LangSmith Engine.
</Card>

For terminology and core concepts, refer to [Observability concepts](/langsmith/observability-concepts). For trace pricing, retention, and limits, see [Usage and billing](/langsmith/usage-and-billing).

<Note>
To set up a LangSmith instance, visit the [Platform setup section](/langsmith/platform-setup) to choose between cloud, hybrid, or self-hosted. All options include observability, evaluation, prompt engineering, and deployment.
</Note>
</div>
</div>

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
</Callout>
</div>