<!-- langchain-docs: Deploy the open-source design agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-design-agent -->

# Deploy the open-source design agent

Deploy Content Studio, an open-source design agent, to Slack as a Managed Deep Agents project.

[Content Studio](https://github.com/langchain-ai/design-agent) is an open-source design agent built on Managed Deep Agents. Your team requests work in Slack, and the agent returns finished files in the thread.

> [!NOTE]
>
> Managed Deep Agents is in [beta](/langsmith/release-stages) on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc). Use Managed Deep Agents CLI and SDK v0.10 or later for BYOC.

[We Open Sourced Our Design Brain](https://www.youtube.com/embed/emId9_O2sU8)

## Deploy the agent

Before you start, make sure you have:

* A [LangSmith Cloud](/langsmith/cloud) account and a [personal access token](/langsmith/create-account-api-key) (`lsv2_pt_…`) that can deploy. A service key cannot set up the Slack app.
* A key for your model provider. On the [LLM Gateway](/langsmith/llm-gateway), the agent uses your LangSmith key instead.
* Permission to install apps in your Slack workspace, or a workspace admin who can approve the agent's Slack app.

To deploy with a coding agent such as Claude Code, Codex, or Cursor, paste this prompt. It installs the agent, checks the setup, and asks before anything that bills or deploys.

Deploy the design agent with your coding agent

Deploy the open-source design agent to my Slack workspace with Managed Deep Agents.

1. Install it with `curl -fsSL https://raw.githubusercontent.com/langchain-ai/design-agent/main/install.sh | bash`, then work in the `design-agent` folder it creates.
2. Read `AGENTS.md` and follow the `design-agent-deploy` skill.
3. Tell me which keys you need. I will type them myself with `uv run design-agent config set <KEY>` in my terminal; never ask me to paste a key in chat.
4. Run `uv run design-agent doctor` and fix what it flags. Its `mda-deploy` line lists what a deploy still needs.
5. Have me run the first deploy, `uv run mda deploy --agent-server-type dedicated`, in my own terminal: it builds the agent's computer and sets up the Slack app (hosting is billed). Ask me before later deploys.
6. When it is live, walk me through messaging the agent in Slack and sending a first request.

To deploy it yourself:

**1. Install the project**

The installer installs uv if needed, then clones the repository and sets it up.

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSL https://raw.githubusercontent.com/langchain-ai/design-agent/main/install.sh | bash
cd design-agent
```

**2. Add your keys**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run design-agent config set LANGSMITH_API_KEY ANTHROPIC_API_KEY
```

The command asks for each key and keeps it hidden. On the [LLM Gateway](/langsmith/llm-gateway), skip the provider key and run `uv run design-agent config set DESIGN_AGENT_MODEL=langsmith:anthropic/claude-opus-5-5` instead.

`mda deploy` forwards every key in `.env` as a deployment secret, except `LANGSMITH_API_KEY`, which signs the deploy. `LANGSMITH_*` variables set in your shell win over `.env` for the deploy itself: if your shell sets any of them, such as `LANGSMITH_ENDPOINT`, set `LANGSMITH_API_KEY` there too.

**3. Deploy**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run mda deploy --agent-server-type dedicated
```

The first deploy builds the agent's computer, with Chrome, FFmpeg, and HyperFrames, from `sandbox/setup.sh`, which takes 10 to 15 minutes. Later deploys rebuild it only when that file changes. A dedicated [Agent Server](/langsmith/agent-server) keeps running between messages, which the agent's background work and check-ins need.

The first deploy also provisions the agent's Slack app. When the command prints a Slack link, open it in a browser signed in to Slack and approve the app; the command waits for you. A workspace admin may need to approve the app first.

**4. Send a first request**

After the first deploy, the agent sends you a direct message. Reply there, or invite it to a channel and mention it with a request, such as a launch graphic for a product. Progress updates and finished files appear in the same thread.

![A Slack thread. A person asks Content Studio for a product launch graphic for Managed Deep Agents. The agent marks its steps done, attaches four versions of the graphic in landscape and square, light and dark, and explains the idea behind the design.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/design-agent-slack-thread.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=871ad43952fcb1cbadfd9c960ca4c516)

Example Slack thread: progress updates, then finished files.

## Customize the design agent

Most changes are edits to files in the repository. Common ones:

* **Brand pack**: Your colors, fonts, logos, and voice live in `workspace/brand/`. Ask your coding agent to build the pack from your website and brand guide.
* **Skills**: Each workflow is a folder in `skills/`. Add one for a request your team makes often, such as a weekly newsletter header.
* **Instructions**: The always-on prompt is `instructions.md`. Keep it short, and put workflows in skills.
* **MCP servers**: Copy `config/mcp.example.toml` to `config/mcp.toml` and turn on servers such as Notion or GitHub. Each person signs in as themselves through a [workspace connection](/langsmith/python/managed-deep-agents-connections).
* **Models**: Set `DESIGN_AGENT_MODEL` with `uv run design-agent config set`. Any LangChain chat model with tool calling works, and the main agent picks the model and effort of each background helper per task. `DESIGN_AGENT_IMAGE_MODEL` picks the image model, from OpenAI, Google, or any OpenAI-compatible images endpoint.

To try a change and ship it, use these [`mda` commands](/langsmith/python/managed-deep-agents-cli):

| Command | What it does |
| - | - |
| `uv run mda dev` | Runs the agent locally and opens it in [LangSmith Studio](/langsmith/studio) |
| `uv run mda deploy --name design-agent-test --agent-server-type dedicated` | Deploys a separate copy to test changes without touching the one your team uses |
| `uv run mda deploy` | Ships your changes to the deployment your team uses |
| `uv run mda logs` | Tails the logs of the deployed agent |
| `uv run mda build` | Compiles what would ship into `.mda/build/` without deploying |

For more information, see [Customization](https://github.com/langchain-ai/design-agent/blob/main/docs/customization.md) in the repository.

## Explore the project

Each managed capability is a file or folder at the root of the repository:

| Path | In this agent | Learn more |
| - | - | - |
| `agent.py` | Builds the agent with `define_deep_agent` from one shared assembly of model, tools, middleware, and subagents | [Agent definition](/langsmith/python/managed-deep-agents-agent-definition) |
| `instructions.md` | A short always-on prompt, with workflows kept in skills | [Instructions](/langsmith/python/managed-deep-agents-instructions) |
| `skills/` | 35 skills and a design wiki, synced to Context Hub and loaded only when a job needs them | [Skills](/langsmith/python/managed-deep-agents-skills) |
| `sandbox/` | A pinned recipe for the Linux machine each thread clones, with Chrome, FFmpeg, HyperFrames, D2, and your fonts | [Sandboxes](/langsmith/python/managed-deep-agents-sandboxes) |
| `channels/slack.py` | The managed Slack app for mentions, DMs, thread replies, files, and approval cards | [Slack channel](/langsmith/python/managed-deep-agents-channels-slack) |
| `memory.py` | Team memory everyone shares and personal memory for each person | [Memory](/langsmith/python/managed-deep-agents-memory) |
| `tools/mcp.py` | MCP servers from `config/mcp.toml`, with each person signed in as themselves | [MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors) |
| `schedules/housekeeping.py` | Runs every 15 minutes to sweep work a restart stopped, with no model call | [Schedules](/langsmith/python/managed-deep-agents-schedules) |
| `identity.py` | Authenticates API callers with a LangSmith API key | [Identity](/langsmith/python/managed-deep-agents-identity) |
| `src/design_agent/` | Application code the agent entry imports, such as host tools and middleware | [Tools](/langsmith/python/managed-deep-agents-tools) |

## Architecture

Managed Deep Agents provides the Slack app, identity, schedules, and a sandbox per thread. The repository adds the design workflows, brand pack, and rendering tools.

![A Slack thread goes to the main agent on Managed Deep Agents, which reads skills and a wiki, keeps team and personal memory, uses managed tools and MCP servers, and works in a sandbox per thread with async subagents, then posts the film back to the same thread.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/design-agent-architecture-light.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=bb8dc7cf8ad2027a6f82c379c725550b)

Request path from Slack through the agent and sandbox back to the thread.

Long jobs like video generation run in the background. The main agent hands each part to an async [subagent](/langsmith/python/managed-deep-agents-subagents) on the same sandbox, picks that job's model and effort, and stays free to talk. When a helper finishes, a new run wakes the main agent. A one-time [schedule](/langsmith/python/managed-deep-agents-schedules) wakes the main agent for check-ins and when a watched render fails or stalls.

The brand pack in `workspace/brand/` is the source of colors, fonts, logos, and voice. The agent checks each render against that pack before posting.

## See also

* [Design agent repository](https://github.com/langchain-ai/design-agent)
* [Run the demo locally, with no API keys](https://github.com/langchain-ai/design-agent#try-it-locally)
* [Paid media agent template](/langsmith/python/managed-deep-agents-paid-media-agent)
* [Deploy with Managed Deep Agents, in the repository](https://github.com/langchain-ai/design-agent/blob/main/docs/deploy-mda.md)
* [Managed Deep Agents project structure](/langsmith/python/managed-deep-agents-project-structure)
* [Deploy a Managed Deep Agents project](/langsmith/python/managed-deep-agents-deploy)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-design-agent.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).