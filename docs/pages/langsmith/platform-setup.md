<!-- langchain-docs: Set up LangSmith | https://docs.langchain.com/langsmith/platform-setup -->

# Set up LangSmith

Host and manage LangSmith infrastructure for observability, evaluation, and prompt engineering.

<div>
  <div>
    <h1>Set up LangSmith</h1>

    Set up **LangSmith** for [observability](/langsmith/observability), [evaluation](/langsmith/evaluation), and [prompt engineering](/langsmith/prompt-context-hub#prompts). LangSmith offers two hosting models: fully managed Cloud, or Self-hosted (Enterprise) for full control.

    If you also want to deploy agents in production, you can use [**LangSmith Deployment**](/langsmith/deployment) with either hosting model.

    <CardGroup>
      <Card title="Cloud" href="/langsmith/cloud" icon="cloud">
        Fully managed observability, evaluation, and prompt engineering.
      </Card>

      <Card title="Self-hosted" href="/langsmith/self-hosted" icon="server">
        **(Enterprise)** Full control with observability, evaluation, and prompt engineering in your infrastructure.
      </Card>
    </CardGroup>

    <Callout>
      Self-hosted is available on the [Enterprise plan](/langsmith/pricing-plans). [Get a demo](https://www.langchain.com/contact-sales) to learn more.
    </Callout>

    <h2>Compare Cloud and Self-hosted</h2>

    | Feature                                          | **Cloud**                           | **Self-hosted**                      |
    | ------------------------------------------------ | ----------------------------------- | ------------------------------------ |
    | **Infrastructure location**                      | LangChain's cloud                   | Your infrastructure                  |
    | **Who manages updates**                          | LangChain                           | You                                  |
    | **Observability data location**                  | LangChain cloud                     | Your infrastructure                  |
    | **Pairs with LangSmith Deployment**              | Yes                                 | When you enable LangSmith Deployment |
    | **[Pricing](https://www.langchain.com/pricing)** | Plus tier                           | Enterprise                           |
    | **Best for**                                     | Quick setup, managed infrastructure | Full control, data isolation         |

    Both hosting models support [LangSmith Deployment](/langsmith/deployment) for agent workloads. Refer to the [LangSmith Deployment overview](/langsmith/deployment) to pick a topology (Cloud managed, Hybrid, self-hosted with control plane, or standalone).

    <h2>Common setups</h2>

    * **Fastest to start, managed everything.** [LangSmith Cloud](/langsmith/cloud) paired with [LangSmith Deployment](/langsmith/deployment) on Cloud. LangChain hosts the platform, and, when you use LangSmith Deployment, also hosts your [Agent Servers](/langsmith/agent-server).
    * **Observability data must stay in your infrastructure.** Self-hosted LangSmith, paired with any LangSmith Deployment topology, including [self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane) for agent workloads.
    * **Managed observability, agents in your VPC.** LangSmith Cloud paired with [Hybrid](/langsmith/hybrid) LangSmith Deployment. Traces and evaluations stay on SaaS while agent workloads stay in your infrastructure.
    * **Observability only, no agent hosting.** LangSmith Cloud or self-hosted, without LangSmith Deployment. Run your agents wherever you already run apps and send traces to LangSmith.

    <h2>Related</h2>

    <CardGroup>
      <Card title="Account setup" href="/langsmith/admin" icon="user-cog">
        Create an account, manage API keys, and choose a pricing tier.
      </Card>

      <Card title="Plans and pricing" href="https://www.langchain.com/pricing" icon="credit-card">
        Compare LangSmith plans and tiers.
      </Card>

      <Card title="Observability" href="/langsmith/observability" icon="chart-line">
        Trace and monitor your LLM applications.
      </Card>
    </CardGroup>
  </div>
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/platform-setup.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>