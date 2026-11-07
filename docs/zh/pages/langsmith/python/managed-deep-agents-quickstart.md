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

* Python 和 `uv`。

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

按顺序执行快速入门步骤：使用`mda`初始化项目，配置模型和说明，添加页面所示的搜索，在LangSmith Studio中测试，并使用`mda` CLI进行部署。停下来询问仪表板操作或凭证何时只能由用户在 LangSmith UI 中完成。

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

本快速入门默认使用 OpenAI。对于 Google、Anthropic 或 Microsoft Foundry，请改为设置匹配值。 `mda deploy` 将提供程序密钥添加到部署中。您也可以使用任何 [other chat provider](/oss/python/integrations/chat/)。

> [!警告]
>
> 不要将 `.env` 文件提交到版本控制中。它包含秘密。

**3.设置LangSmith**

托管 Deep Agents 在 LangSmith 上运行。您的 LangSmith API 密钥使用 `mda dev` 验证本地开发，使用 `mda deploy` 部署代理，并在 [LangSmith Studio](/langsmith/studio) 中打开代理，以便您可以与其聊天并检查跟踪。

[Sign up for LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-managed-deep-agents-quickstart) 如果您还没有帐户。

要创建 LangSmith API 密钥，请打开 [Settings](https://smith.langchain.com/settings)，转到 **API 密钥**，然后单击 **创建 API 密钥**。欲了解更多详情，请参阅[Create an account and API key](/langsmith/create-account-api-key)。在 [BYOC](/langsmith/byoc) 上，登录您自己的数据平面并在其中创建密钥。还将 `LANGSMITH_ENDPOINT` 设置为数据平面的 API URL。参见[Select a BYOC data plane](/langsmith/python/managed-deep-agents-deploy#select-a-byoc-data-plane)。

将您的 LangSmith API 密钥添加到 `.env`：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
```

**4.编辑说明**

打开 `instructions.md` 并描述代理应该如何表现：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Research assistant

You are a careful research assistant. Use internet search to find sources,
keep notes, and return concise answers with citations.
```

部署时，托管 Deep Agents 会将这些指令同步到 [LangSmith Context Hub](/langsmith/python/managed-deep-agents-context-hub)，您可以在其中更新它们，而无需重新部署代理。

**5.配置您的模型并搜索**

现在设置模型和内置网络搜索工具。 Google、OpenAI、Anthropic 和 Microsoft Foundry 提供服务器端搜索，无需单独的搜索包或搜索 API 密钥。传递与您的模型匹配的提供程序工具字典：

打开`agent.py`：

```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_deep_agent

# OpenAI's built-in web search — no extra install or API key needed
agent = define_deep_agent(
    name="research-assistant",
    model="openai:gpt-5.5",
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

代理名称也是默认部署名称。有关模型概念和提供程序选项，请参阅[Models](/oss/python/langchain/models)。> [手风琴] 使用其他提供商？
>
> 您可以使用 Tavily 搜索工具。将密钥存储在 [connection](/langsmith/python/managed-deep-agents-connections) 中，以便它位于您的 LangSmith 工作区而不是项目中。
>
> 该手风琴使用连接头 `research-tavily`。对于 `mda dev`，代理拥有的连接从 `MDA_DEV_<SLUG>` 读取其值。将 [Tavily API key](https://app.tavily.com) 添加到 `.env` 作为 `MDA_DEV_RESEARCH_TAVILY`：
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
> 创建自定义 `internet_search` 工具。 `connections.get(...)` 在运行时解析密钥，因此本地和部署上的工具代码是相同的：
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
>     model="openai:gpt-5.5",
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
> 稍后轮换该值会在下次运行时生效，无需重新部署。有关更多创作工具，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。有关其他创建模式和每个调用者凭据，请参阅[Manage connections](/langsmith/python/managed-deep-agents-connections)。

**6。本地运行**

安装项目依赖项并启动代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv sync
uv run mda dev
```

`mda dev` 从 `.env` 加载 API 密钥，启动本地代理服务器，并在 LangSmith Studio 中打开代理。

在 Studio 中，发送：

```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
What were the main announcements from the latest LangChain release?
```您应该看到代理调用网络搜索工具，然后返回引用来源的简洁答案。如果搜索从未出现在跟踪中，请确认提供程序工具字典与您在`agent.py`或`agent.ts`中设置的模型匹配。

在 [agent-based workspace](/langsmith/agent-registry) 中，在您注册代理之前，跟踪将导致错误。详情请参见[Trace local runs](/langsmith/python/managed-deep-agents-local-development#trace-local-runs)。

**7.部署代理**

在 [BYOC](/langsmith/byoc) 上，将 `--push-to <image-repository>` 添加到此步骤中的每个命令。 BYOC 数据平面从您管理的注册表中的映像进行部署。

通过运行以下命令来部署项目：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run mda deploy
```

托管 Deep Agents 打包项目并将其作为托管部署在 [LangSmith Agent Server](/langsmith/agent-server) 上运行。部署完成后，CLI 会打印部署仪表板 URL。

打开该网址。您应该看到部署处于就绪状态。发送上一步中的相同研究问题，并通过搜索工具调用确认托管代理返回答案。有关部署选项和机密处理的信息，请参阅[Deploy a Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy)。要在代理运行后检查其执行情况，请使用[LangSmith observability](/langsmith/observability-quickstart)。

## 后续步骤

> [卡][Tutorial](/langsmith/python/managed-deep-agents-tutorial)
>
> 添加自定义 Tavilly 搜索工具、持久内存和每日日程安排。

> [卡][Design agent template](/langsmith/python/managed-deep-agents-design-agent)
>
> 部署LangChain的开源设计代理，而不是从头开始搭建脚手架。> [卡][Paid media agent template](/langsmith/python/managed-deep-agents-paid-media-agent)
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