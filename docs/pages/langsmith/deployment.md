<!-- langchain-docs: LangSmith Agent Server | https://docs.langchain.com/langsmith/deployment -->

# LangSmith Agent Server

Deploy and manage agents with durable execution, real-time streaming, and horizontal scaling.

**LangSmith Agent Server** is a workflow orchestration runtime purpose-built for agent workloads. Agent Server hosting provides infrastructure and deployment management for running agents in production at scale. Deploy to Cloud, BYOC, or your own infrastructure, or run a standalone Agent Server without a control plane.

> [!NOTE]
>
> LangSmith Deployment is now **LangSmith Agent Server**.

> [!NOTE]
>
> This page covers how your **agents** run in production with **LangSmith Agent Server**.
>
> Where you run LangSmith for observability, evaluation, and prompt engineering is separate; refer to [Platform setup](/langsmith/platform-setup) for details.

## Deployable products

LangSmith Agent Server is framework-agnostic, which means you can deploy agents built with:

> [card] [LangGraph (and LangChain)](/langsmith/deployment-quickstart)
>
> Use the LangGraph CLI and app templates to deploy an application to LangSmith.

> [card] [Google ADK](/langsmith/deploy-google-adk)
>
> Deploy Google Agent Development Kit (ADK) agent as a LangGraph with the `deployments-wrap-sdk` package.

> [card] [Other frameworks](/langsmith/deploy-other-frameworks)
>
> Deploy Claude Agent SDK, Strands, CrewAI, AutoGen, and other agent frameworks with the Functional API or `deployments-wrap-sdk`.

> [card] [Looking to deploy Deep Agents?](/langsmith/python/managed-deep-agents-overview)
>
> Use Managed Deep Agents: the managed runtime for deploying code-first Deep Agents.

## Agent Server hosting environments

Pick an environment based on where you want the [control plane](/langsmith/control-plane) and [data plane](/langsmith/data-plane) (Agent Servers and their databases) to run. All infrastructure types use the same [Agent Server](/langsmith/agent-server) runtime.

> [card] [Cloud](/langsmith/deploy-to-cloud-overview)
>
> Fully managed by LangChain on AWS, Azure, and GCP. Create deployments from GitHub in the LangSmith UI or with [`langgraph deploy`](/langsmith/cli#deploy). Requires a [Plus plan or above](https://www.langchain.com/pricing).

> [card] [Self-hosted with control plane](/langsmith/deploy-with-control-plane)
>
> Run the LangSmith Agent Server control plane and Agent Servers in your own Kubernetes cluster, alongside self-hosted LangSmith. Requires the [Enterprise plan](https://www.langchain.com/pricing) with Agent Server hosting enabled.

> [card] [Hybrid](/langsmith/hybrid)
>
> LangChain-managed control plane with Agent Servers and their data plane in your infrastructure. Traces flow to LangSmith Cloud or self-hosted LangSmith.

> [card] [Standalone server](/langsmith/deploy-standalone-server)
>
> Deploy Agent Server with Docker, Compose, or Kubernetes. Bring your own PostgreSQL, Redis, and LangSmith license; no control plane. Optional [LangSmith tracing](/langsmith/observability) to Cloud or a self-hosted instance.

## Common setups

* **Managed hosting for your agents.** LangSmith Agent Server on [Cloud](/langsmith/deploy-to-cloud-overview). LangChain hosts the control plane, data plane, and databases. Pairs with LangSmith Cloud.
* **Agents in your VPC, control plane managed.** LangSmith Agent Server via [Hybrid](/langsmith/hybrid). LangChain hosts the control plane; you host Agent Servers and their data plane. Pairs with LangSmith Cloud or self-hosted LangSmith.
* **Full data residency or air-gapped.** [Self-hosted Agent Server hosting](/langsmith/deploy-with-control-plane). You host the control plane and Agent Servers in your own infrastructure alongside self-hosted LangSmith.
* **Agent runtime only, no control plane.** [Standalone Agent Server](/langsmith/deploy-standalone-server). Run Agent Server containers with Docker or Kubernetes without a control plane, optionally sending traces to LangSmith Cloud or self-hosted.

For where the LangSmith platform runs, see [Platform setup](/langsmith/platform-setup).

## Understand deployment pricing

Deployments on LangSmith Cloud are billed on the compute and database resources that each deployment requests.

> [!NOTE]
>
> Deployments on LangSmith Cloud require a Plus or Enterprise plan. For more information, see the [pricing page](https://www.langchain.com/pricing).

> [card] [LangSmith Agent Server billing](/langsmith/billing#langsmith-deployment-billing)
>
> See the rates, the hourly cost of each deployment size, and ways to reduce deployment costs.

## After deployment

Once deployed, agents work with [Agent Server](/langsmith/assistants)'s execution model: **assistants** for configuration, **threads** for state, and **runs** for workloads. For capabilities, tutorials, server customization, and operations, see [Agent Server](/langsmith/develop-agents-overview).

> [card] [Update prompts and contexts without redeploying](/langsmith/prompt-context-hub)
>
> Manage the prompts and versioned contexts your deployed agents pull at runtime, so you can change behavior without a full deploy.

> [card] [Interact with your deployment using RemoteGraph](/langsmith/use-remote-graph)
>
> Call your deployed graph from client code as if it were a local compiled graph.

> [card] [Find and fix failures with Engine](/langsmith/engine)
>
> Once agents are in production, use LangSmith Engine to detect recurring failures in their traces, diagnose root causes, and resolve them.

## Full-stack web apps

Ship a LangChain.js agent and chat UI together as a single web app. The Vite example uses LangSmith Agent Server as the agent backend behind a separate UI. Other examples embed the agent inside the web framework's route handlers and ship to the host platform.

> [card] [Full-stack web apps](/langsmith/deploy-frameworks-and-platforms)
>
> Ship a LangChain.js chat app: embed the agent in Next.js, SvelteKit, Nuxt, Cloudflare Workers, or Deno Deploy (no Agent Server required), or pair LangSmith Agent Server with a Vite + React UI.
>
> ![LangSmith](https://mintcdn.com/langchain-5e9cc07a/ZPKed1feKJ8F6LVo/images/providers/light/langchain.svg?fit=max\&auto=format\&n=ZPKed1feKJ8F6LVo\&q=85\&s=b910ed9cd0b6b8adb4b6da400882e92c)
>
> ![Next.js](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nextjs.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=4f3336e9534db50f25f87173a41322d5)
>
> ![SvelteKit](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/svelte.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=07e7e35c40e4522f739feea9ef3e33b7)
>
> ![Nuxt](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nuxt.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=5d965ed1f93f51ac604e66b935a65368)
>
> ![Cloudflare Workers](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/cloudflare.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=ae129fcbfc78ccaece42b1c4d3699311)
>
> ![Deno Deploy](https://mintcdn.com/langchain-5e9cc07a/Tz8fh3A43FeUPf69/images/providers/light/deno.svg?fit=max\&auto=format\&n=Tz8fh3A43FeUPf69\&q=85\&s=8d213b0000104542fcaa7ab160595224)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).