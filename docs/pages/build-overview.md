<!-- langchain-docs: Build | https://docs.langchain.com/build-overview -->

# Build

Build agents with LangChain, LangGraph, Deep Agents, Managed Deep Agents, and Fleet.

<div>
  <div>
    <h1>Build</h1>

    The LangChain open source stack provides the building blocks you need to design, test, and ship agents. Each layer is yours to configure: the model, the tools, the context and memory an agent works from, and the harness around the model loop.

    <h2>Choose your starting point</h2>

    Deep Agents, LangChain, and LangGraph share the same open source stack, so choose based on how much control you need. For managed hosting or no-code, start with Managed Deep Agents or Fleet:

    <Tabs>
      <Tab title="Python">
        <CardGroup>
          <Card title="Deep Agents" href="/oss/python/deepagents/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/deep-agents-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=1cc68f66a9e7550331cc0875f1ba53af">
            Build agents for complex, long-running tasks. A complete agent harness with planning, subagents, a virtual filesystem, and long-term memory built in. The fastest way to start.
          </Card>

          <Card title="Managed Deep Agents" href="/langsmith/python/managed-deep-agents-overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/deep-agents-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=1cc68f66a9e7550331cc0875f1ba53af">
            Build deep agents with managed deployment infrastructure. You write the agent; LangSmith runs the harness and runtime.
          </Card>

          <Card title="LangChain" href="/oss/python/langchain/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/langchain-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=663b30f85baf99ad708b97e05da2a5a4">
            A minimal, configurable agent framework. Compose exactly what you need from models, tools, prompts, and middleware.
          </Card>

          <Card title="LangGraph" href="/oss/python/langgraph/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/langgraph-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=b997e1a7487d507a36556eedbfd99f81">
            Low-level orchestration for stateful, long-running agents: durable execution, streaming, memory, and human-in-the-loop.
          </Card>

          <Card title="Prefer no-code?" href="/langsmith/fleet" icon="wand" type="tip">
            Build and run agents without writing code using LangSmith Fleet.
          </Card>
        </CardGroup>
      </Tab>

      <Tab title="TypeScript">
        <CardGroup>
          <Card title="Deep Agents" href="/oss/javascript/deepagents/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/deep-agents-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=1cc68f66a9e7550331cc0875f1ba53af">
            Build agents for complex, long-running tasks. A complete agent harness with planning, subagents, a virtual filesystem, and long-term memory built in. The fastest way to start.
          </Card>

          <Card title="Managed Deep Agents" href="/langsmith/javascript/managed-deep-agents-overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/deep-agents-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=1cc68f66a9e7550331cc0875f1ba53af">
            Build deep agents with managed deployment infrastructure. You write the agent; LangSmith runs the harness and runtime.
          </Card>

          <Card title="LangChain" href="/oss/javascript/langchain/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/langchain-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=663b30f85baf99ad708b97e05da2a5a4">
            A minimal, configurable agent framework. Compose exactly what you need from models, tools, prompts, and middleware.
          </Card>

          <Card title="LangGraph" href="/oss/javascript/langgraph/overview" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/langgraph-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=b997e1a7487d507a36556eedbfd99f81">
            Low-level orchestration for stateful, long-running agents: durable execution, streaming, memory, and human-in-the-loop.
          </Card>

          <Card title="Prefer no-code?" href="/langsmith/fleet" icon="wand" type="tip">
            Build and run agents without writing code using LangSmith Fleet.
          </Card>
        </CardGroup>
      </Tab>
    </Tabs>

    <h2>Use a ready-made agent</h2>

    <CardGroup>
      <Card title="Deep Agents Code" href="/oss/deepagents/code/overview" icon="code">
        Open source terminal coding agent (`dcode`) built on the Deep Agents SDK. Switch models mid-session, customize skills and memory, and approve shell execution from the CLI.
      </Card>
    </CardGroup>

    <h2>Explore</h2>

    <Tabs>
      <Tab title="Python">
        <CardGroup>
          <Card title="Integrations" href="/oss/python/integrations/providers/overview" icon="plug">
            Connect to model providers, vector stores, retrievers, and other components.
          </Card>

          <Card title="Learn" href="/oss/python/learn" icon="book">
            Follow tutorials and conceptual guides for common agent patterns and use cases.
          </Card>

          <Card title="Reference" href="/oss/python/reference/overview" icon="code">
            API references, error codes, release notes, and migration guides.
          </Card>

          <Card title="Contribute" href="/oss/python/contributing/overview" icon="heart-plus">
            Contribute documentation, code, and integrations to the LangChain ecosystem.
          </Card>
        </CardGroup>
      </Tab>

      <Tab title="TypeScript">
        <CardGroup>
          <Card title="Integrations" href="/oss/javascript/integrations/providers/overview" icon="plug">
            Connect to model providers, vector stores, retrievers, and other components.
          </Card>

          <Card title="Learn" href="/oss/javascript/learn" icon="book">
            Follow tutorials and conceptual guides for common agent patterns and use cases.
          </Card>

          <Card title="Reference" href="/oss/javascript/reference/overview" icon="code">
            API references, error codes, release notes, and migration guides.
          </Card>

          <Card title="Contribute" href="/oss/javascript/contributing/overview" icon="heart-plus">
            Contribute documentation, code, and integrations to the LangChain ecosystem.
          </Card>
        </CardGroup>
      </Tab>
    </Tabs>
  </div>
</div>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/build-overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>


# 
Source: https://docs.langchain.com/index



<div>
  <div>
    <h1>The open agent engineering ecosystem</h1>

    LangChain provides open source, model-agnostic harnesses for building agents. LangSmith is the framework-agnostic platform for testing, deploying, monitoring, and improving your agents across the agent development lifecycle. You control every layer of your agent system, and keep improving it with what you learn in production.

    <h2>Agent development lifecycle</h2>

    <CardGroup>
      <Card title="Build" icon="hammer" href="/build-overview">
        Build agents with code using LangChain, LangGraph, and Deep Agents.
      </Card>

      <Card title="Test" icon="flask" href="/langsmith/evaluation">
        Evaluate agents with datasets, evaluations, and prompt engineering.
      </Card>

      <Card title="Deploy" icon="rocket" href="/langsmith/deployment">
        Deploy and serve agents at scale.
      </Card>

      <Card title="Monitor" icon="chart-line" href="/langsmith/observability">
        Trace, debug, and observe agents in production.
      </Card>
    </CardGroup>

    <h2>Products</h2>

    <CardGroup>
      <Card title="LLM Gateway" icon="route" href="/langsmith/llm-gateway">
        Route, control, and observe LLM traffic across providers.
      </Card>

      <Card title="No-code agents" icon="wand" href="/langsmith/fleet">
        Build and run agents without code using LangSmith Fleet.
      </Card>

      <Card title="Engine" icon="https://mintcdn.com/langchain-5e9cc07a/auWE6_dMRp183OCf/images/brand/engine-icon-no-bg-dark.svg?fit=max&auto=format&n=auWE6_dMRp183OCf&q=85&s=dd41aef3ce789c1a04ea3c37b5903eac" href="/langsmith/engine-overview">
        Find and fix recurring agent issues automatically with LangSmith Engine.
      </Card>

      <Card title="Deep Agents Code" icon="code" href="/oss/deepagents/code/overview">
        Code with an AI agent in your terminal using the open source `dcode` CLI.
      </Card>
    </CardGroup>

    <h2>Setup and governance</h2>

    <CardGroup>
      <Card title="LangSmith setup" icon="server" href="/langsmith/langsmith-setup-overview">
        Hosting on Cloud, BYOC, or Self-hosted, account setup, and governance.
      </Card>

      <Card title="Govern" icon="shield-check" href="/langsmith/govern-overview">
        Manage users, access control, policies, and compliance across your organization.
      </Card>
    </CardGroup>

    <h2>Resources</h2>

    <CardGroup>
      <Card title="LangChain Academy" icon="school" href="https://academy.langchain.com/">
        Take free courses on building and improving agents with LangSmith and our open-source frameworks.
      </Card>

      <Card title="Community forum" icon="messages" href="https://forum.langchain.com/">
        Ask questions, share solutions, and discuss best practices.
      </Card>

      <Card title="Support portal" icon="message-circle-question" href="https://support.langchain.com/">
        Submit tickets and track support requests.
      </Card>

      <Card title="Sign up for LangSmith" icon="tools" href="https://smith.langchain.com/">
        Start with LangSmith for free.
      </Card>

      <Card title="LangSmith status" icon="activity-heartbeat" href="https://status.smith.langchain.com/">
        Real-time status of LangSmith services and APIs.
      </Card>

      <Card title="Trust Center" icon="shield-lock" href="https://trust.langchain.com/">
        HIPAA, SOC 2 Type 2, and GDPR compliance details.
      </Card>
    </CardGroup>
  </div>
</div>