<!-- langchain-docs: Build | https://docs.langchain.com/build-overview -->

# Build

Build agents with Managed Deep Agents, Deep Agents, LangChain, LangGraph, and Fleet.

# Build

The LangChain open source stack provides the building blocks you need to design, test, and ship agents. Each layer is yours to configure: the model, the tools, the context and memory an agent works from, and the harness around the model loop.

## Choose your starting point

Managed Deep Agents, Deep Agents, LangChain, and LangGraph share the same open source stack, so choose based on how much control you need. For managed hosting or no-code, start with Managed Deep Agents or Fleet:

> [tab] Python
>
> > [card] [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)
> >
> > Build deep agents with managed deployment infrastructure for complex, long-running tasks. A complete agent harness with
> > planning, subagents, a virtual filesystem, and long-term memory built in.
> > The fastest way to write your agent; LangSmith runs the harness and runtime.
>
> > [card] [Deep Agents](/oss/python/deepagents/overview)
> >
> > The same Deep Agents harness with maximum flexibility. Host agents yourself, or run a custom LangSmith Deployment when you need more control over the runtime.
>
> > [card] [LangChain](/oss/python/langchain/overview)
> >
> > A minimal, configurable agent framework. Compose exactly what you need from models, tools, prompts, and middleware.
>
> > [card] [LangGraph](/oss/python/langgraph/overview)
> >
> > Low-level orchestration for stateful, long-running agents: durable execution, streaming, memory, and human-in-the-loop.
>
> > [card] [Prefer no-code?](/langsmith/fleet)
> >
> > Build and run agents without writing code using LangSmith Fleet.

> [tab] TypeScript
>
> > [card] [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview)
> >
> > Build deep agents with managed deployment infrastructure for complex, long-running tasks. A complete agent harness with
> > planning, subagents, a virtual filesystem, and long-term memory built in.
> > The fastest way to write your agent; LangSmith runs the harness and runtime.
>
> > [card] [Deep Agents](/oss/javascript/deepagents/overview)
> >
> > The same Deep Agents harness with maximum flexibility. Host agents yourself, or run a custom LangSmith Deployment when you need more control over the runtime.
>
> > [card] [LangChain](/oss/javascript/langchain/overview)
> >
> > A minimal, configurable agent framework. Compose exactly what you need from models, tools, prompts, and middleware.
>
> > [card] [LangGraph](/oss/javascript/langgraph/overview)
> >
> > Low-level orchestration for stateful, long-running agents: durable execution, streaming, memory, and human-in-the-loop.
>
> > [card] [Prefer no-code?](/langsmith/fleet)
> >
> > Build and run agents without writing code using LangSmith Fleet.

## Use a ready-made agent

> [card] [Deep Agents Code](/oss/deepagents/code/overview)
>
> Open source terminal coding agent (`dcode`) built on the Deep Agents SDK. Switch models mid-session, customize skills and memory, and approve shell execution from the CLI.

## Explore

> [tab] Python
>
> > [card] [Integrations](/oss/python/integrations/providers/overview)
> >
> > Connect to model providers, vector stores, retrievers, and other components.
>
> > [card] [Learn](/oss/python/learn)
> >
> > Follow tutorials and conceptual guides for common agent patterns and use cases.
>
> > [card] [Reference](/oss/python/reference/overview)
> >
> > API references, error codes, release notes, and migration guides.
>
> > [card] [Contribute](/oss/python/contributing/overview)
> >
> > Contribute documentation, code, and integrations to the LangChain ecosystem.

> [tab] TypeScript
>
> > [card] [Integrations](/oss/javascript/integrations/providers/overview)
> >
> > Connect to model providers, vector stores, retrievers, and other components.
>
> > [card] [Learn](/oss/javascript/learn)
> >
> > Follow tutorials and conceptual guides for common agent patterns and use cases.
>
> > [card] [Reference](/oss/javascript/reference/overview)
> >
> > API references, error codes, release notes, and migration guides.
>
> > [card] [Contribute](/oss/javascript/contributing/overview)
> >
> > Contribute documentation, code, and integrations to the LangChain ecosystem.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/build-overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).


# 
Source: https://docs.langchain.com/index



# The open agent engineering ecosystem

LangChain provides open source, model-agnostic harnesses for building agents. LangSmith is the framework-agnostic platform for testing, deploying, monitoring, and improving your agents across the agent development lifecycle. You control every layer of your agent system, and keep improving it with what you learn in production.

## Agent development lifecycle

> [card] [Build](/build-overview)
>
> Build agents with Managed Deep Agents, Deep Agents, LangChain, and LangGraph.

> [card] [Test](/langsmith/evaluation)
>
> Evaluate agents with datasets, evaluations, and prompt engineering.

> [card] [Deploy](/langsmith/deployment)
>
> Deploy and serve agents at scale.

> [card] [Monitor](/langsmith/observability)
>
> Trace, debug, and observe agents in production.

> [card] [Agent Registry](/langsmith/agent-registry)
>
> (Cloud only) Register, organize, and govern every agent in one place, no matter where it is hosted.

## Products

> [card] [LLM Gateway](/langsmith/llm-gateway)
>
> Route, control, and observe LLM traffic across providers.

> [card] [No-code agents](/langsmith/fleet)
>
> Build and run agents without code using LangSmith Fleet.

> [card] [Engine](/langsmith/engine)
>
> Find and fix recurring agent issues automatically with LangSmith Engine.

> [card] [Deep Agents Code](/oss/deepagents/code/overview)
>
> Code with an AI agent in your terminal using the open source `dcode` CLI.

## Setup and governance

> [card] [LangSmith setup](/langsmith/langsmith-setup-overview)
>
> Hosting on Cloud, BYOC, or Self-hosted, account setup, and governance.

> [card] [Govern](/langsmith/govern-overview)
>
> Manage users, access control, policies, and compliance across your organization.

## Resources

> [card] [LangChain Academy](https://academy.langchain.com/)
>
> Take free courses on building and improving agents with LangSmith and our open-source frameworks.

> [card] [Community forum](https://forum.langchain.com/)
>
> Ask questions, share solutions, and discuss best practices.

> [card] [Support portal](https://support.langchain.com/)
>
> Submit tickets and track support requests.

> [card] [Sign up for LangSmith](https://smith.langchain.com/)
>
> Start with LangSmith for free.

> [card] [LangSmith status](https://status.smith.langchain.com/)
>
> Real-time status of LangSmith services and APIs.

> [card] [Trust Center](https://trust.langchain.com/)
>
> HIPAA, SOC 2 Type 2, and GDPR compliance details.