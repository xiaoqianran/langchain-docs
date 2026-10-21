<!-- langchain-docs: Deploy to Cloud | https://docs.langchain.com/langsmith/deploy-to-cloud-overview -->

# Deploy to Cloud

Deploy LangSmith agents to LangChain-managed Cloud infrastructure on AWS and GCP.

[LangSmith Cloud](/langsmith/cloud) is a **managed platform for deploying your agents**. LangChain hosts and operates the [control plane](/langsmith/control-plane), [data plane](/langsmith/data-plane), [Agent Server](/langsmith/agent-server) runtime, and supporting databases on AWS and GCP. Push code to a connected GitHub repository or invoke the `langgraph deploy` CLI, and the platform handles build, provisioning, scaling, and ongoing operations. Deployments come in [two types](/langsmith/cloud-platform-features#deployment-types):

* **Serverless**: Scales to zero when idle. Suits background agents, testing, and latency-tolerant production workloads.
* **Dedicated**: Stays on and autoscales across replicas. Suits latency-sensitive production workloads.

Agent deployments running on Cloud require a [Plus plan or above](https://www.langchain.com/pricing). Before creating your first agent deployment, verify that your application runs locally with `langgraph dev`. Refer to [Local development and testing](/langsmith/local-dev-testing).

> **[Deploy on Cloud](/langsmith/deploy-to-cloud)**
>
> Step-by-step setup guide for creating, configuring, and managing Cloud deployments from the LangSmith UI or the `langgraph deploy` CLI.

> **[Cloud platform features](/langsmith/cloud-platform-features)**
>
> Reference for Cloud-only platform behavior: data regions, static IPs, payload limits, deployment types, and managed database provisioning.

> **[Quickstart](/langsmith/deployment-quickstart)**
>
> Deploy your first LangGraph application to Cloud in a few minutes.

To deploy a code-first Deep Agent without standing up your own Agent Server, [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview) offers a CLI-first managed runtime in public beta.

## Next steps

> **[Run the quickstart](/langsmith/deployment-quickstart)**
>
> Deploy a starter LangGraph application end-to-end.

> **[Read the full deploy guide](/langsmith/deploy-to-cloud)**
>
> Configure environment variables, secrets, revisions, and deployment settings.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud-overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).