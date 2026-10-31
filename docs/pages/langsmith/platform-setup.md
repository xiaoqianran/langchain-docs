<!-- langchain-docs: Set up LangSmith | https://docs.langchain.com/langsmith/platform-setup -->

# Set up LangSmith

Host and manage LangSmith infrastructure for observability, evaluation, and prompt engineering.

Set up **LangSmith** for [observability](/langsmith/observability), [evaluation](/langsmith/evaluation), and [prompt engineering](/langsmith/prompt-context-hub#prompts). LangSmith offers Cloud, Bring Your Own Cloud (BYOC), and Self-hosted options. Choose the option that matches where your data has to live and who runs the infrastructure.

> [!NOTE]
>
> If you also want to deploy agents in production, you can use [**LangSmith Deployment**](/langsmith/deployment) with Cloud, BYOC, or Self-hosted.

> [card] [Cloud](/langsmith/cloud)
>
> Fully managed observability, evaluation, and prompt engineering.

> [card] [BYOC](/langsmith/byoc)
>
> Full control over your data, while LangChain manages the infrastructure.

> [card] [Self-hosted](/langsmith/self-hosted)
>
> Full control with observability, evaluation, and prompt engineering in your infrastructure.

Self-hosted and BYOC are available on the [Enterprise plan](/langsmith/pricing-plans). [Get a demo](https://www.langchain.com/contact-sales) to learn more.

## Compare Cloud, BYOC, and Self-hosted

| Feature | **Cloud** | **BYOC** | **Self-hosted** |
| - | - | - | - |
| **Who runs the infrastructure** | LangChain | LangChain runs the control plane, you run your data planes | You |
| **Where sensitive data lives** | LangChain's cloud | Your VPC | Your VPC |
| **Upgrades and patches** | Automatic | Automatic | Manual |
| **Scaling** | Automatic | Automatic, managed by LangChain | Manual |

Cloud, BYOC, and Self-hosted support [LangSmith Deployment](/langsmith/deployment) for agent workloads. Refer to the [LangSmith Deployment overview](/langsmith/deployment) to pick a topology (Cloud managed, BYOC, Hybrid, self-hosted with control plane, or standalone).

## Common setups

* **Fastest to start, managed everything.** [LangSmith Cloud](/langsmith/cloud) paired with [LangSmith Deployment](/langsmith/deployment) on Cloud. LangChain hosts the platform, and, when you use LangSmith Deployment, also hosts your [Agent Servers](/langsmith/agent-server).
* **Bring Your Own Cloud.** Data stays in your VPC, and LangChain manages the infrastructure. Refer to the [BYOC overview](/langsmith/byoc).
* **Observability data must stay in your infrastructure.** Self-hosted LangSmith, paired with any LangSmith Deployment topology, including [self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane) for agent workloads.
* **Managed observability, agents in your VPC.** LangSmith Cloud paired with [Hybrid](/langsmith/hybrid) LangSmith Deployment. Traces and evaluations stay on SaaS while agent workloads stay in your infrastructure.
* **Observability only, no agent hosting.** LangSmith Cloud or self-hosted, without LangSmith Deployment. Run your agents wherever you already run apps and send traces to LangSmith.

## Related

> [card] [Account setup](/langsmith/admin)
>
> Create an account, manage API keys, and choose a pricing tier.

> [card] [Plans and pricing](https://www.langchain.com/pricing)
>
> Compare LangSmith plans and tiers.

> [card] [Observability](/langsmith/observability)
>
> Trace and monitor your LLM applications.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/platform-setup.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).