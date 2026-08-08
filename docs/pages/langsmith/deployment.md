<!-- langchain-docs: LangSmith Deployment | https://docs.langchain.com/langsmith/deployment -->

# LangSmith Deployment

Deploy and manage agents with durable execution, real-time streaming, and horizontal scaling.

**LangSmith Deployment** is a workflow orchestration runtime purpose-built for agent workloads. It provides the managed infrastructure agents need to run reliably in production at scale, supporting the full lifecycle from local development to deployment.

<Note>
  This page covers how your **agents** run in production with **LangSmith Deployment**.

  Where you run LangSmith for observability, evaluation, and prompt engineering is separate; refer to [Platform setup](/langsmith/platform-setup) for details.
</Note>

## Deployable products

LangSmith Deployment is framework-agnostic which means you can deploy agents built with:

<CardGroup>
  <Card title="LangGraph (and LangChain)" href="/langsmith/deployment-quickstart" icon="chart-dots-3">
    Use the LangGraph CLI and app templates to deploy an application to LangSmith.
  </Card>

  <Card title="Google ADK" href="/langsmith/deploy-google-adk" icon="google">
    Deploy Google Agent Development Kit (ADK) agent as a LangGraph with the `deployments-wrap-sdk` package.
  </Card>

  <Card title="Other frameworks" href="/langsmith/deploy-other-frameworks" icon="packages">
    Deploy Claude Agent SDK, Strands, CrewAI, AutoGen, and other agent frameworks with the Functional API or `deployments-wrap-sdk`.
  </Card>

  <Card title="Looking to deploy Deep Agents?" href="/langsmith/python/managed-deep-agents-overview" type="tip">
    Use Managed Deep Agents: the managed runtime for deploying code-first Deep Agents.
  </Card>
</CardGroup>

## LangSmith Deployment environments

Pick an environment based on where you want the [control plane](/langsmith/control-plane) and [data plane](/langsmith/data-plane) (Agent Servers and their databases) to run. All infrastructure types use the same [Agent Server](/langsmith/agent-server) runtime.

<CardGroup>
  <Card title="Cloud" href="/langsmith/deploy-to-cloud-overview" icon="cloud">
    Fully managed by LangChain on AWS and GCP. Create deployments from GitHub in the LangSmith UI or with [`langgraph deploy`](/langsmith/cli#deploy). Requires a [Plus plan or above](https://www.langchain.com/pricing).
  </Card>

  <Card title="Self-hosted with control plane" href="/langsmith/deploy-with-control-plane" icon="buildings">
    Run the LangSmith Deployment control plane and Agent Servers in your own Kubernetes cluster, alongside self-hosted LangSmith. Requires the [Enterprise plan](https://www.langchain.com/pricing) with LangSmith Deployment enabled.
  </Card>

  <Card title="Hybrid" href="/langsmith/hybrid" icon="cloud-network">
    LangChain-managed control plane with Agent Servers and their data plane in your infrastructure. Traces flow to LangSmith Cloud or self-hosted LangSmith.
  </Card>

  <Card title="Standalone server" href="/langsmith/deploy-standalone-server" icon="server">
    Deploy Agent Server with Docker, Compose, or Kubernetes. Bring your own PostgreSQL, Redis, and LangSmith license; no control plane. Optional [LangSmith tracing](/langsmith/observability) to Cloud or a self-hosted instance.
  </Card>
</CardGroup>

## Common setups

* **Managed hosting for your agents.** LangSmith Deployment on [Cloud](/langsmith/deploy-to-cloud-overview). LangChain hosts the control plane, data plane, and databases. Pairs with LangSmith Cloud.
* **Agents in your VPC, control plane managed.** LangSmith Deployment via [Hybrid](/langsmith/hybrid). LangChain hosts the control plane; you host Agent Servers and their data plane. Pairs with LangSmith Cloud or self-hosted LangSmith.
* **Full data residency or air-gapped.** [Self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane). You host the control plane and Agent Servers in your own infrastructure alongside self-hosted LangSmith.
* **Agent runtime only, no control plane.** [Standalone Agent Server](/langsmith/deploy-standalone-server). Run Agent Server containers with Docker or Kubernetes without a control plane, optionally sending traces to LangSmith Cloud or self-hosted.

For where the LangSmith platform runs, see [Platform setup](/langsmith/platform-setup).

## After deployment

Once deployed, agents work with [Agent Server](/langsmith/assistants)'s execution model: **assistants** for configuration, **threads** for state, and **runs** for workloads. For capabilities, tutorials, server customization, and operations, see [Agent Server](/langsmith/develop-agents-overview).

<CardGroup>
  <Card title="Update prompts and contexts without redeploying" icon="edit" href="/langsmith/prompt-context-hub">
    Manage the prompts and versioned contexts your deployed agents pull at runtime, so you can change behavior without a full deploy.
  </Card>

  <Card title="Interact with your deployment using RemoteGraph" icon="link" href="/langsmith/use-remote-graph">
    Call your deployed graph from client code as if it were a local compiled graph.
  </Card>
</CardGroup>

<CardGroup>
  <Card title="Find and fix failures with Engine" icon="https://mintcdn.com/langchain-5e9cc07a/oHF6ZolKSFmH17u5/images/brand/engine-icon-dark.png?fit=max&auto=format&n=oHF6ZolKSFmH17u5&q=85&s=739a487161804691a14c36c2768d278d" href="/langsmith/engine-overview">
    Once agents are in production, use LangSmith Engine to detect recurring failures in their traces, diagnose root causes, and resolve them.
  </Card>
</CardGroup>

## Full-stack web apps

Ship a LangChain.js agent and chat UI together as a single web app. The Vite example uses LangSmith Deployment as the agent backend behind a separate UI. Other examples embed the agent inside the web framework's route handlers and ship to the host platform.

<Card title="Full-stack web apps" href="/langsmith/deploy-frameworks-and-platforms" icon="code">
  Ship a LangChain.js chat app: embed the agent in Next.js, SvelteKit, Nuxt, Cloudflare Workers, or Deno Deploy (no Agent Server required), or pair LangSmith Deployment with a Vite + React UI.

  <div>
    <span>
      <img alt="LangSmith" />
    </span>

    <span>
      <img alt="Next.js" />
    </span>

    <span>
      <img alt="SvelteKit" />
    </span>

    <span>
      <img alt="Nuxt" />
    </span>

    <span>
      <img alt="Cloudflare Workers" />
    </span>

    <span>
      <img alt="Deno Deploy" />
    </span>
  </div>
</Card>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>