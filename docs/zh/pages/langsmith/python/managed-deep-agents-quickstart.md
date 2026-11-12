<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/python/managed-deep-agents-quickstart -->

# 托管 Deep Agents 快速入门

使用 mda CLI 创建并部署您的第一个托管深度代理。

创建并部署您的第一个托管深度代理：构建项目、配置模型和指令、添加搜索、在 [LangSmith Studio](/langsmith/studio) 中测试，并使用 [⟦T18⟧ CLI](/langsmith/python/managed-deep-agents-cli) 进行部署。托管 Deep Agents 提供 [Deep Agents harness](/oss/python/deepagents/overview) 和托管运行时。

在本快速入门之后，[tutorial](/langsmith/python/managed-deep-agents-tutorial) 在同一项目上添加了持久内存和每日计划。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

## 先决条件

要继续操作，您需要：

* Python and `uv`.

* 您选择的模型提供商的 API 密钥。

## 添加`managed-deep-agents`技能

[⟦T21⟧ skill](https://github.com/langchain-ai/langchain-skills/blob/main/config/skills/managed-deep-agents/SKILL.md) 引导编码代理使用 `mda` CLI 构建、测试和部署托管深度代理。要将其添加到当前项目，请运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill managed-deep-agents --yes
```

或者将此提示粘贴到您的编码代理中：

使用快速入门构建托管深度代理

按照托管 Deep Agents 快速入门，在此工作目录中创建并部署托管深度代理。

## 第 1 步：阅读指南获取并遵循 [https://docs.langchain.com/langsmith/managed-deep-agents-quickstart.md](https://docs.langchain.com/langsmith/managed-deep-agents-quickstart.md) 作为 CLI 命令、项目布局和部署步骤的真实来源。首选与该项目匹配的 Python 或 TypeScript 路径。

## 第二步：安装技能

如果 `managed-deep-agents` 技能尚不可用，请安装它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx skills add langchain-ai/langchain-skills --skill managed-deep-agents --yes
```

当该技能可用时，将其用于工作流程的其余部分。

## 步骤 3：先决条件和秘密

确认用户具有 LangSmith 访问权限以及任何所需的模型或搜索凭据。如果缺少所需的 API 密钥，请要求他们在 shell 或 `.env` 文件中设置它，然后等待。不要发明、硬编码或提交秘密。

## 步骤 4：搭建、配置、测试和部署

Follow the quickstart steps in order: initialize the project with `mda`, configure the model and instructions, add search as shown on the page, test in LangSmith Studio, and deploy with the `mda` CLI.当仪表板操作或凭证只能由用户在 LangSmith UI 中完成时，停下来询问。

## 规则* 关注快速入门。除非指南要求，否则请勿添加不相关的产品或重写生成的项目布局。
* 优先使用 `mda` CLI 和 `managed-deep-agents` 技能，而不是发明自定义部署路径。
* 当秘密、计划层限制或仅限 UI 的步骤不清楚时，询问而不是猜测。

## 创建并部署代理

**1.设置项目**

创建一个项目并打开其目录：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uvx --from managed-deepagents mda init research-assistant
cd research-assistant
```

您现在已经为您的代理准备好了所有的脚手架。

**2.添加您的密钥**

将您的模型提供商 API 密钥添加到 `.env`：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENAI_API_KEY=<OPENAI_API_KEY>
# ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
# GOOGLE_API_KEY=<GOOGLE_API_KEY>
# AZURE_AI_OPENAI_ENDPOINT=https://<resource>.services.ai.azure.com/openai/v1
# AZURE_OPENAI_API_KEY=<AZURE_OPENAI_API_KEY>
# AZURE_OPENAI_DEPLOYMENT_NAME=<AZURE_OPENAI_DEPLOYMENT_NAME>
```

本快速入门默认使用 OpenAI。 For Google, Anthropic, or Microsoft Foundry, set the matching values instead. `mda deploy` 将提供程序密钥添加到部署中。您也可以使用任何 [other chat provider](/oss/python/integrations/chat/)。

> [!警告]
>
> Do not commit the `.env` file into version control.它包含秘密。

**3. Set up LangSmith**

托管 Deep Agents 在 LangSmith 上运行。您的 LangSmith API 密钥使用 `mda dev` 验证本地开发，使用 `mda deploy` 部署代理，并在 [LangSmith Studio](/langsmith/studio) 中打开代理，以便您可以与其聊天并检查跟踪。

[Sign up for LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-managed-deep-agents-quickstart) 如果您还没有帐户。

To create a LangSmith API key, open [Settings](https://smith.langchain.com/settings), go to **API Keys**, and click **Create API Key**.欲了解更多详情，请参阅[Create an account and API key](/langsmith/create-account-api-key)。On [BYOC](/langsmith/byoc), sign in to your own data plane and create the key there. Set `LANGSMITH_ENDPOINT` to the data plane's API URL as well.参见[Select a BYOC data plane](/langsmith/python/managed-deep-agents-deploy#select-a-byoc-data-plane)。

将您的 LangSmith API 密钥添加到 `.env`：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
```

**4.编辑说明**

Open `instructions.md` and describe how the agent should behave:

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Research assistant

You are a careful research assistant. Use internet search to find sources,
keep notes, and return concise answers with citations.
```

When you deploy, Managed Deep Agents syncs these instructions to [LangSmith Context Hub](/langsmith/python/managed-deep-agents-context-hub), where you can update them without redeploying the agent.

**5.配置您的模型并搜索**

现在设置模型和内置网络搜索工具。 Google, OpenAI, Anthropic, and Microsoft Foundry offer server-side search without a separate search package or search API key.传递与您的模型匹配的提供程序工具字典：

Open `agent.py`:

```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

# OpenAI's built-in web search — no extra install or API key needed
agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-6.1-sol",
    tools=[{"type": "web_search"}],
)
```

```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

# Google's built-in search — no extra install or API key needed
agent = define_deep_agent(
    name="research-assistant",
    model="google_genai:gemini-3.6-flash",
    tools=[{"google_search": {}}],
)
```

```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

# Anthropic's built-in web search — no extra install or API key needed
agent = define_deep_agent(
    name="research-assistant",
    model="anthropic:claude-sonnet-4-6",
    tools=[{"type": "web_search_20260209", "name": "web_search"}],
)
```

```python Microsoft Foundry theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Install the required dependency: uv add langchain-azure-ai
import os

from langchain_azure_ai.chat_models import AzureAIOpenAIApiChatModel
from managed_deepagents import define_deep_agent

model = AzureAIOpenAIApiChatModel(
    endpoint=os.environ["AZURE_AI_OPENAI_ENDPOINT"],
    credential=os.environ["AZURE_OPENAI_API_KEY"],
    model=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
)

agent = define_deep_agent(
    name="research-assistant",
    model=model,
    tools=[{"type": "web_search"}],
)
```

代理名称也是默认部署名称。 For model concepts and provider options, see [Models](/oss/python/langchain/models).> [手风琴] 使用其他提供商？
>
> 您可以使用 Tavily 搜索工具。 Store the key in a [connection](/langsmith/python/managed-deep-agents-connections) so it lives in your LangSmith workspace rather than the project.
>
> This accordion uses the connection slug `research-tavily`. For `mda dev`, an agent-owned connection reads its value from `MDA_DEV_<SLUG>`. Add a [Tavily API key](https://app.tavily.com) to `.env` as `MDA_DEV_RESEARCH_TAVILY`:
>
> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> MDA_DEV_RESEARCH_TAVILY=<TAVILY_API_KEY>
> ```
>
> 安装 Tavilly 客户端：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv add tavily-python
> ```
>
> Create a custom `internet_search` tool. `connections.get(...)` resolves the key at runtime, so the tool code is the same locally and on the deployment:
>
> ```python tools/search.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from typing import Literal
>
> from langchain.tools import tool
> from managed_deepagents import connections
> from tavily import AsyncTavilyClient
>
>
> @tool
> async def internet_search(
>     query: str,
>     max_results: int = 5,
>     topic: Literal["general", "news", "finance"] = "general",
> ) -> dict:
>     """Search the internet for relevant sources."""
>     api_key = await connections.get("research-tavily", {"type": "agent"})
>     tavily_client = AsyncTavilyClient(api_key=api_key)
>     return await tavily_client.search(
>         query,
>         max_results=max_results,
>         topic=topic,
>     )
> ```
>
> 导入工具并将其添加到代理中：
>
> ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from managed_deepagents import define_deep_agent
>
> from tools.search import internet_search
>
> agent = define_deep_agent(
>     name="research-assistant",
>     model="openai:gpt-6.1-sol",
>     tools=[internet_search],
> )
> ```
>
> 在下一步中部署代理后，创建代理拥有的连接。代理拥有的凭据属于部署，因此此命令在第一次成功部署后出现：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> uv run mda connections create research-tavily --secret-from-env MDA_DEV_RESEARCH_TAVILY
> ```
>
> 稍后轮换该值会在下次运行时生效，无需重新部署。有关更多创作工具，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。 For other create modes and per-caller credentials, see [Manage connections](/langsmith/python/managed-deep-agents-connections).

**6。本地运行**

安装项目依赖项并启动代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv sync
uv run mda dev
```

`mda dev` loads the API keys from `.env`, starts a local Agent Server, and opens the agent in LangSmith Studio.

在 Studio 中，发送：

```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
What were the main announcements from the latest LangChain release?
```您应该看到代理调用网络搜索工具，然后返回引用来源的简洁答案。 If search never appears in the trace, confirm the provider tool dict matches the model you set in `agent.py` or `agent.ts`.

In an [agent-based workspace](/langsmith/agent-registry), tracing will result in errors until you register the agent.详情请参见[Trace local runs](/langsmith/python/managed-deep-agents-local-development#trace-local-runs)。

**7.部署代理**

On [BYOC](/langsmith/byoc), add `--push-to <image-repository>` to every command in this step. BYOC 数据平面从您管理的注册表中的映像进行部署。

通过运行以下命令来部署项目：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run mda deploy
```

Managed Deep Agents packages the project and runs it as a hosted deployment on [LangSmith Agent Server](/langsmith/agent-server).部署完成后，CLI 会打印部署仪表板 URL。

打开该网址。您应该看到部署处于就绪状态。发送上一步中的相同研究问题，并通过搜索工具调用确认托管代理返回答案。 For deployment options and secrets handling, see [Deploy a Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy). To inspect the agent's execution after it runs, use [LangSmith observability](/langsmith/observability-quickstart).

## 后续步骤

> [卡][Tutorial](/langsmith/python/managed-deep-agents-tutorial)
>
> 添加自定义 Tavilly 搜索工具、持久内存和每日日程安排。

> [卡][Design agent template](/langsmith/python/managed-deep-agents-design-agent)
>
> Deploy LangChain's open-source design agent instead of scaffolding from scratch.> [卡][Paid media agent template](/langsmith/python/managed-deep-agents-paid-media-agent)
>
> 部署 LangChain 的开源付费媒体代理以进行 Slack 活动分析。

> [卡][Custom tools](/langsmith/python/managed-deep-agents-tools)
>
> 从您的项目中添加创作的 LangChain 工具。

> [卡][Connections](/langsmith/python/managed-deep-agents-connections)
>
> 作为代理或呼叫者通过外部服务进行身份验证。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。