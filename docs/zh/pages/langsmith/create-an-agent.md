<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an agent | https://docs.langchain.com/langsmith/create-an-agent -->

# 创建代理

在跟踪之前注册代理，选择其标识符，并使用 UI、Python SDK 或 REST API 配置环境。

在 LangSmith 中创建 [agent](/langsmith/agent-registry#agent) 为其提供标识符和 [environments](/langsmith/agent-environments) 作为其跟踪。创建一次，然后使用其标识符和环境来发送代码中的跟踪。

如果您的代理在 LangSmith 之外运行，请首先使用 UI、SDK 或 API 在 LangSmith 中创建其记录。这个记录组织了它的痕迹。您的代码仍然在您托管的地方运行。 LangChain `create_agent` 等框架函数构建在代码中运行的代理。他们不创建其 LangSmith 记录。

> [!注意]
>
> [LangSmith Cloud](/langsmith/cloud) 上提供基于代理的工作区。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。要检查您的工作区是否基于代理，请查看左上角的控件。在基于代理的工作区中，它是一个为您的工作区命名的工作区切换器。在[project-based](/langsmith/observability-concepts#tracing-projects)工作区中，它显示LangSmith徽标。

## 比较四种路线

可以通过四种方式创建代理，这四种方式的不同之处在于标识符的设置方式以及代理启动的环境：|方法|你做什么|标识符 |创作时的环境 |
| - | - | - | - |
| [Studio](/langsmith/build-an-agent) |描述一个代理并让LangSmith Chat 在LangSmith 中构建它 |为您生成 |独自生产|
| [UI](#name-an-agent-traced-from-outside-langsmith) |在LangSmith中输入代理名称和ID来创建代理记录 |你设定吧|所有四个 |
| [SDK or API](#create-an-agent-programmatically) |通过 SDK 调用或 API 请求创建代理记录 |你设定吧|所有四个 |
| [Deployment](/langsmith/deploy-to-agent-environment) |将您的代理代码部署到 LangSmith |您传递的或从部署名称派生的代理 ID |所有四个 |

并不是每个特工都能拥有[deployment](/langsmith/deployment)。部署代理代码会从一开始就通过部署创建代理。使用 SDK 或 API 或通过 [**Connect an agent**](#name-an-agent-traced-from-outside-langsmith) 对话框创建的代理一开始无需部署，但稍后您可以进行 [deploy to it](/langsmith/deploy-to-agent-environment) 部署。 Studio 中构建的代理无法进行部署，因为它在 Studio 运行时上运行。部署后，代理的概述会显示 **部署** 部分。

当第一次将跟踪寻址到某个环境时，Studio 中内置的代理就会获得其其他环境。关于这四个是什么，请参见[Agent environments](/langsmith/agent-environments#environment-names)。

当LangSmith通过这些流程构建或部署代理时，它会处理注册。重用该代理进行跟踪。不要为同一部署创建单独的外部代理。## 标识符规则

标识符长度为1～63个字符，由小写字母、数字和连字符组成。它必须以字母开头并以字母或数字结尾，因此 `support-agent` 和 `billing-v2` 有效。其他任何事情都会被拒绝。

这些规则适用于您提供值的任何位置：**代理 ID** 字段、SDK 和 API 创建请求以及您部署到的代理 ID。 Studio 会生成一个标识符。没有代理 ID 的部署会从部署名称中派生一个 ID，并在已采用该值时附加后缀，因此部署的代理最终会得到一个接近部署名称而不是等于部署名称的标识符。

创建代理后，标识符无法更改。显示名称即可。对于哪个值是哪个，请参阅[Identifiers and display names](/langsmith/agent-registry#identifiers-and-display-names)。

## 从新的代理菜单开始

两个控件可打开新代理菜单：代理列表上的 **+ 代理**，以及代理切换器中搜索框旁边的 **+** 按钮，该按钮悬停时会显示 **新代理** 工具提示。切换器按钮仅对具有 `projects:create` 权限的用户显示。菜单分为三个流程：* **构建** > **无代码**：打开 Studio，您可以在其中描述代理，然后 LangSmith Chat 起草它。参见[Build an agent with LangSmith Studio](/langsmith/build-an-agent)。
* **构建** > **使用代码**：打开 **使用代码构建** 窗格。 **由 LangSmith** 托管，涵盖 [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)，它会在您部署时创建代理并需要付费计划。 **自行托管**涵盖使用 [open source frameworks](/oss/python/langchain/overview) 进行构建，然后使用下面的 UI 或 API 创建代理的 LangSmith 记录。
* **连接** > **连接现有代理**：打开 **连接代理** 对话框，您可以在其中命名从外部跟踪的代理 LangSmith。请参阅下一节。

## 指定从外部追踪到的特工 LangSmith

在 UI 中创建外部代理需要 `projects:create` 权限。要注册它，请从两个位置之一打开 **连接代理** 对话框：

* **在新代理菜单中连接现有代理**。
* **连接代理**，当未选择代理时，位于跟踪上的代理列表下方。该对话框采用 **代理名称** 以及在其自己的字段中的 **代理 ID**，并注意该 ID 用于 URL 和 API 调用，以后无法更改。单击**连接代理**。 LangSmith 创建代理并打开它。从新的代理菜单中，它打开代理的跟踪页面。要发送第一条轨迹，请参阅[tracing quickstart](/langsmith/observability-quickstart)。

创建后，将代码配置为[send traces to the agent and environment](/langsmith/log-traces-to-agent)。对于需要 `project_name` 的集成，请使用 [compatibility configuration](#use-an-environment-project)。

## 以编程方式创建代理

代理创建 API 在 LangSmith 中使用所有四种环境创建代理记录。在发送跟踪之前调用一次，而不是每次代理运行时调用它。

将 [personal access token or service key](/langsmith/create-account-api-key) 与 [⟦T12⟧ permission](/langsmith/organization-workspace-operations#projects) 一起使用。跟踪密钥无法调用代理创建 API。创建代理后，您的代码可以使用跟踪密钥来提交跟踪。

将 `LANGSMITH_API_KEY` 设置为设置凭据。将 `LANGSMITH_WORKSPACE_ID` 设置为目标工作区 ID，并将 `LANGSMITH_ENDPOINT` 设置为您的 [region's API URL](/langsmith/create-account-api-key#configure-the-sdk)。

> [选项卡] Python
>
> 安装LangSmith v0.14.12 或更高版本：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pip install -U "langsmith>=0.14.12"
> ```
>
> 创建代理并打印其标识符：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langsmith import Client
>
> client = Client()
> agent = client.agents.create(
>     id="support-agent",
>     name="Support agent",
>     source_type="EXTERNAL",
> )
> print(agent.id)  # Use as LANGSMITH_AGENT_ID
> ```

> [选项卡] 休息
>
> 使用任何语言的 REST API 来注册代理。包括`source_type: "EXTERNAL"`：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl --fail-with-body --request POST "$LANGSMITH_ENDPOINT/api/v1/agents" \
>   --header "x-api-key: $LANGSMITH_API_KEY" \
>   --header "x-tenant-id: $LANGSMITH_WORKSPACE_ID" \
>   --header "Content-Type: application/json" \
>   --data '{"id":"support-agent","name":"Support agent","source_type":"EXTERNAL"}'
> ````id` 是不可变的代理标识符。 `name` 是其可编辑的显示名称。创建响应包括 `environments`，以及每个环境的 `tracer_session_name` 和 `tracer_session_id`。

如果标识符已经存在，则创建返回`409`。检查其身份后重用现有代理，或选择其他标识符。将创作保留在您的设置步骤中。当您的代码需要配置时检索现有代理。

## 配置代理跟踪

使用代理标识符和环境作为跟踪目标：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-tracing-api-key>"
export LANGSMITH_AGENT_ID="support-agent"
export LANGSMITH_AGENT_ENVIRONMENT="local"
```

使用创建返回的标识符，而不是显示名称。从代码运行的环境中删除旧目标变量（`LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 和 `LANGCHAIN_SESSION`）。 SDK版本和代码配置请参见[Log traces to an agent](/langsmith/log-traces-to-agent)。

## 配置需要项目名称的集成

某些集成仍然需要 `project_name` 或 `LANGSMITH_PROJECT` 设置。对于这些集成，请使用所选代理环境的`tracer_session_name`。这是 LangSmith 返回的兼容性值，而不是要创建的其他资源。

使用可以读取其环境的凭据检索代理。使用Python SDK：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import Client

client = Client()
agent = client.agents.retrieve("support-agent")
production = next(env for env in agent.environments if env.environment == "PRODUCTION")
print(production.tracer_session_name)  # Use as LANGSMITH_PROJECT
print(production.tracer_session_id)  # Use with APIs that take a project ID
```使用 REST，使用与创建请求相同的身份验证标头来调用 `GET /api/v1/agents/support-agent`。在`environments`中，选择`PRODUCTION`、`STAGING`、`DEVELOPMENT`或`LOCAL`，然后读取其`tracer_session_name`或`tracer_session_id`。

将所选环境的 `tracer_session_name` 复制到集成的目标设置中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROJECT="<environment-tracer-session-name>"
```

使用返回的值，而不是从代理 ID 或显示名称中派生它。例如，集成可能会将此设置称为 `project_name`、`projectName`、`LANGCHAIN_PROJECT` 或 `Langsmith-Project`。将每个示例目标（包括代码和副本目标中的覆盖）替换为目标工作区中所选环境的 `tracer_session_name`。

如果集成支持 [agent addressing](/langsmith/log-traces-to-agent)，请改为设置代理 ID 和环境，例如 `LANGSMITH_AGENT_ID` 和 `LANGSMITH_AGENT_ENVIRONMENT`。不要将这些变量与旧目标变量组合。

## 设置疑难解答* **创建返回`403`**：在目标工作空间中使用具有`projects:create`权限的PAT或服务密钥。跟踪密钥无法调用代理创建 API。
* **跟踪报告丢失的代理**：首先创建代理，然后使用其确切的标识符和环境重试跟踪。
* **创建返回`409`**：标识符已被使用。存档的代理还保留其标识符。
* **跟踪出现在错误的位置**：检查工作区、区域、环境以及代码中的任何目标覆盖。使用代理标识符，而不是其显示名称。

## 另请参阅

* [Agent Registry](/langsmith/agent-registry)
* [Agent environments](/langsmith/agent-environments)
* [Build an agent with LangSmith Studio](/langsmith/build-an-agent)
* [Deploy to an agent environment](/langsmith/deploy-to-agent-environment)
* [Log traces to an agent](/langsmith/log-traces-to-agent)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。