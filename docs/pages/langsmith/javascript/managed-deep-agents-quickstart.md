<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-quickstart -->

# Managed Deep Agents quickstart

Create and deploy your first Managed Deep Agent with the mda CLI.

Create an agent project, test it locally in [LangSmith Studio](/langsmith/studio), and deploy it to managed LangSmith infrastructure with the [`mda` CLI](/langsmith/javascript/managed-deep-agents-cli). The project folder contains your agent's model, instructions, and tools. Managed Deep Agents supplies the [Deep Agents harness](/oss/javascript/deepagents/overview) and hosted runtime.

<Note>
  Managed Deep Agents is in **public [beta](/langsmith/release-stages)** and available on [LangSmith Cloud](/langsmith/cloud) in the US region only.
</Note>

## Prerequisites

Before you start, make sure you have:

* An organization with Managed Deep Agents public beta access.

* A [LangSmith API key](/langsmith/create-account-api-key).

* Node.js and npm.

* An API key for your model provider of choice.

## Create and deploy an agent

<Steps>
  <Step title="Install the package">
    Install `managed-deepagents`. The package includes the `mda` CLI.

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install managed-deepagents
    ```
  </Step>

  <Step title="Create a project">
    Create a project and open its directory:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda init research-assistant
    cd research-assistant
    ```

    The files you edit in this quickstart are:

    * **`agent.ts`**: Defines and exports the agent. See [Agent definition](/langsmith/javascript/managed-deep-agents-agent-definition).

    * **[`instructions.md`](/langsmith/javascript/managed-deep-agents-instructions)**: Contains the prompt that describes how the agent should behave.

    * **`.env`**: Stores API keys for local development and deployment. Do not commit this file.

    For all generated files, see [Project structure](/langsmith/javascript/managed-deep-agents-project-structure).
  </Step>

  <Step title="Add API keys">
    Add your LangSmith API key and model provider API key to `.env`:

    ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
    OPENAI_API_KEY=<OPENAI_API_KEY>
    ```

    This example uses an [OpenAI chat model](/oss/javascript/integrations/chat/openai). If you choose another model provider, add the API key required by that provider instead. `mda deploy` uses the LangSmith API key to deploy the agent and adds the provider key to the deployment.
  </Step>

  <Step title="Configure the agent">
    Open `agent.ts` and set the agent name and model:

    ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { defineDeepAgent } from "managed-deepagents";

    export const agent = defineDeepAgent({
      name: "research-assistant",
      model: "openai:gpt-5.5",
    });
    ```

    The model handles the agent's language understanding and reasoning. The agent name is also the default deployment name. For model concepts and provider options, see [Models](/oss/javascript/langchain/models).
  </Step>

  <Step title="Edit the instructions">
    Open `instructions.md` and describe how the agent should behave:

    ```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Research assistant

    You are a careful research assistant. Use internet search to find sources,
    keep notes, and return concise answers with citations.
    ```

    When you deploy, Managed Deep Agents syncs these instructions to [LangSmith Context Hub](/langsmith/use-the-context-hub), where you can update them without redeploying the agent.
  </Step>

  <Step title="Add an internet search tool">
    A tool is a function the agent can call to retrieve data or take an action. Choose your model provider's server-side search or create a [custom LangChain tool](/oss/javascript/langchain/tools) with Tavily.

    <Tabs>
      <Tab title="Provider search (recommended)">
        OpenAI provides a built-in web search tool that runs server-side, so it does not require another package or API key. Add it directly to the agent:

        ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { defineDeepAgent } from "managed-deepagents";

        export const agent = defineDeepAgent({
          name: "research-assistant",
          model: "openai:gpt-5.5",
          tools: [{ type: "web_search_preview" }],
        });
        ```
      </Tab>

      <Tab title="Tavily (any provider)">
        Add a [Tavily API key](https://app.tavily.com) to `.env`:

        ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        TAVILY_API_KEY=<TAVILY_API_KEY>
        ```

        Install the Tavily client:

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        npm install @langchain/tavily
        ```

        Create a custom `internet_search` tool:

        ```ts tools/search.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { TavilySearch } from "@langchain/tavily";
        import { tool } from "langchain";
        import { z } from "zod";

        export const internetSearch = tool(
          async ({ query, maxResults = 5, topic = "general" }) => {
            const tavilySearch = new TavilySearch({
              maxResults,
              tavilyApiKey: process.env.TAVILY_API_KEY,
              topic,
            });
            return tavilySearch._call({ query });
          },
          {
            name: "internet_search",
            description: "Search the internet for relevant sources.",
            schema: z.object({
              query: z.string().describe("The search query."),
              maxResults: z.number().optional().default(5),
              topic: z.enum(["general", "news", "finance"]).optional().default("general"),
            }),
          },
        );
        ```

        Import the tool and add it to the agent:

        ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { defineDeepAgent } from "managed-deepagents";

        import { internetSearch } from "./tools/search";

        export const agent = defineDeepAgent({
          name: "research-assistant",
          model: "openai:gpt-5.5",
          tools: [internetSearch],
        });
        ```
      </Tab>
    </Tabs>

    For more information, see [Custom tools](/langsmith/javascript/managed-deep-agents-tools).
  </Step>

  <Step title="Run locally">
    Install the project dependencies and start the agent:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install
    mda dev .
    ```

    `mda dev` loads the API keys from `.env`, starts a local Agent Server, and opens the agent in LangSmith Studio. Send messages in Studio to inspect model responses and tool calls. For more information, see [Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development).
  </Step>

  <Step title="Deploy the agent">
    Deploy the project:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```

    Managed Deep Agents packages the project and runs it as a hosted deployment on [LangSmith Agent Server](/langsmith/agent-server). When deployment finishes, the CLI prints the deployment dashboard URL. Open it to view and test the deployed agent.

    For deployment options and secrets handling, see [Deploy a Managed Deep Agent](/langsmith/javascript/managed-deep-agents-deploy). To inspect the agent's execution after it runs, use [LangSmith observability](/langsmith/observability-quickstart).
  </Step>
</Steps>

## Next steps

<CardGroup>
  <Card title="Tutorial" icon="book" href="/langsmith/javascript/managed-deep-agents-tutorial">
    Build a scheduled research agent from an empty directory.
  </Card>

  <Card title="Identity" icon="fingerprint" href="/langsmith/javascript/managed-deep-agents-identity">
    Authenticate callers and provide private threads.
  </Card>

  <Card title="Memory" icon="brain" href="/langsmith/javascript/managed-deep-agents-memory">
    Persist preferences across threads with Context Hub `/memories`.
  </Card>

  <Card title="Evals" icon="flask" href="/langsmith/javascript/managed-deep-agents-evals">
    Author Harbor tasks and compile the managed agent for Harbor.
  </Card>

  <Card title="Custom tools" icon="tool" href="/langsmith/javascript/managed-deep-agents-tools">
    Add authored LangChain tools from your project source.
  </Card>

  <Card title="Custom middleware" icon="code" href="/langsmith/javascript/managed-deep-agents-middleware">
    Add built-in or custom middleware around model and tool calls.
  </Card>

  <Card title="Schedules" icon="calendar" href="/langsmith/javascript/managed-deep-agents-schedules">
    Run agents on managed cron schedules.
  </Card>

  <Card title="Deploy an agent" icon="upload" href="/langsmith/javascript/managed-deep-agents-deploy">
    Test and deploy Managed Deep Agents with `mda`.
  </Card>

  <Card title="CLI reference" icon="terminal" href="/langsmith/javascript/managed-deep-agents-cli">
    Review `mda init`, `mda evals`, `mda dev`, and `mda deploy`.
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-quickstart.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>