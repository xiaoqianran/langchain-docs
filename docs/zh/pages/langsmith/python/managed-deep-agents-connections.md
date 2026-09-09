<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage connections | https://docs.langchain.com/langsmith/python/managed-deep-agents-connections -->

# 管理连接

连接将托管深度代理链接到外部服务，例如 GitHub、Notion 或 Tavily。该凭证位于您的 LangSmith 工作区中。在编写的工具或 MCP 服务器定义中使用 `connections.get(...)` 在运行时解析它。

连接让您：

- **将凭据保留在项目之外**：`mda deploy` 在每次部署时收集 `.env` 值作为部署机密。连接值仍保留在工作区中。
- **为每个呼叫者提供自己的身份**：用户拥有的连接可以解析发出请求的人的凭据，因此代理可以读取该人的文档并以他们的名义进行操作。环境变量为每个人保留一个值。
- **跳过 OAuth 管道**：托管 Deep Agents 运行授权往返，因此项目不需要回调路由、令牌存储或同意屏幕。这些流由您的托管深度代理自动处理。- **跨代理重复使用一个 slug**：连接属于工作区，因此多个部署可以解析相同的 slug。每个部署都在该 slug 下保存自己的凭据：从每个项目根运行 `mda connections create <slug>` 一次。轮换部署的值会在下次运行时生效，无需重新部署。

将凭证存储在 LangSmith 中以便在托管 Deep Agents 中使用需要一个命令：

```bash
uv run mda connections create organization-tavily --secret-from-env TAVILY_API_KEY
```
阅读它只需一行：

```python
api_key = await connections.get("organization-tavily", {"type": "agent"})
```




本页的其余部分介绍了围绕这些步骤的两个选择：谁拥有凭证以及服务如何进行身份验证。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 选择凭证所有者

每个 `connections.get(...)` 调用名称谁拥有它解析的凭证：|业主|决定|使用时 |
| --- | --- | --- |
| `agent` |属于部署的一份凭证。每个呼叫者都使用它。 |每个呼叫者都需要相同的功能：使用 Tavily（共享知识库）进行网络搜索，或发布到一个团队频道。 |
| `user` |呼叫者自己的凭据。每个人都授权自己的帐户。 |代理充当提出问题的人：搜索只有他们可以看到的 Notion 页面、以他们的名义提交问题或以他们的身份发送电子邮件。 |

```python
tavily_key = await connections.get("organization-tavily", {"type": "agent"})
notion_token = await connections.get("engineering-notion", {"type": "user"})
```




`connections.get(...)` 将凭证值解析为字符串。

连接是一个容器，它属于工作区而不是所有者。其中的凭证有所有者。没有 `--owner` 标志：您使用的 [create mode](#choose-a-create-mode) 设置所有者。

`connections.get(...)` 选择所有者。它不会创造一个。请求没有自己凭证的所有者无法运行 `agent`，并为 `user` 提出 [⟦T37⟧ interrupt](#handle-the-authorization-interrupt)。存储在不同所有者的同一 slug 下的凭证不满足查找。代理拥有的凭据属于项目的部署，因此在至少成功一次[⟦T39⟧](/langsmith/python/managed-deep-agents-deploy)后创建它们。部署仅读取其拥有的凭证。要解决第二个部署中的相同 slug，请从该项目根目录再次运行 `mda connections create <slug>`：在现有 slug 上，该命令会附加新的代理拥有的凭据，而不是失败。

### 识别来电者

用户拥有的连接根据托管Deep Agents附加到运行的调用者身份进行解析。该身份的来源取决于代理的调用方式：

|表面|来电者身份 |
| --- | --- |
| [Slack channel](/langsmith/python/managed-deep-agents-channels-slack) |发送消息的 Slack 用户。 |
| LangSmith 工作室 |已登录的LangSmith用户。 |
| SDK 客户端或自定义前端 |项目[identity declaration](/langsmith/python/managed-deep-agents-identity)验证的身份。 |

默认身份声明验证LangSmith API 密钥。该密钥对调用客户端（而不是个人）进行身份验证，因此提供该密钥的每个调用者都会解析为相同的身份。要为每个登录者提供自己的凭据，请声明 [Supabase identity](/langsmith/python/managed-deep-agents-identity#authenticate-end-users-with-supabase)。

代码永远不会将用户 ID 传递给 `connections.get(...)`。运行时解析调用者并返回该人的凭据。<Note>
Slack 和 Studio 为调用者完成授权往返。对自定义渠道的一流支持正在开发中。要立即针对呼叫者身份构建自定义前端，请参阅 [Handle the authorization interrupt](#handle-the-authorization-interrupt) 并联系 [LangChain team](https://forum.langchain.com/c/help/langsmith/)。
</Note>

## 选择创建模式

所有权决定代理使用凭证执行的操作。创建模式决定凭证如何到达工作区，并取决于外部服务如何进行身份验证：

|模式|使用时 |使用 | 创建凭证所有者 |
| --- | --- | --- | --- |
| **不透明的秘密** |该服务使用固定的 API 密钥或其他静态秘密。 | `--secret-from-env`、`--secret-from-file`、stdin 或交互式提示 |代理|
| **通用 OAuth** |您注册自己的 OAuth 应用程序 (BYOT)，例如使用 GitHub 或 Google。 |目录中的 `--oauth <service>`，或自定义提供商的 `--authorize-url` 和 `--token-url` |每个呼叫者或带有 [⟦T47⟧](#authorize-an-agent-owned-oauth-account) 的座席 |
| **MCP OAuth** | MCP 服务器通告 OAuth 并自动注册客户端。 | `--mcp <url>`，或者当项目已经声明用户拥有的 MCP 服务器时单独使用 slug |每个呼叫者或具有 [⟦T49⟧](#authorize-an-agent-owned-oauth-account) 的代理 |

例如：
```bash
# Opaque secret: store a fixed API key for the agent
uv run mda connections create organization-tavily --secret-from-env TAVILY_API_KEY

# General OAuth: register your own app, and let each caller authorize
uv run mda connections create frontend-github --oauth github \
  --client-id "********" --secret-from-env GITHUB_CLIENT_SECRET

# MCP OAuth: let the MCP server register a client for you
uv run mda connections create engineering-notion --mcp https://mcp.notion.com/mcp
```不要在一个命令中混合使用模式。例如，`--mcp`不能与`--oauth`、自定义端点、`--client-id`或秘密值组合。

### 命名连接

`mda connections create` 的第一个参数是一个 slug：您的连接名称，以及您的代码传递给 `connections.get(...)` 的名称。它不是提供商名称，而是 `--oauth`：

```bash
mda connections create frontend-github --oauth github
#                      ^ your slug      ^ catalog provider
```

Slug 在工作空间中是唯一的。使用小写字母、数字和单个连字符，并选择一个可标识连接指向哪个帐户的名称，例如 `organization-tavily` 或 `engineering-notion`。

## 创建一个不透明的秘密

为代理存储固定的秘密。从环境变量、文件、标准输入或提示中读取值。此模式适合自定义工具的 API 密钥，例如 Tavily 搜索密钥。使用 CLI 创建的不透明机密由代理拥有。

将源值放入 shell 环境或项目 `.env` 文件中，然后从该变量创建连接。从项目根运行命令。 CLI 需要 LangSmith API 密钥和工作区 ID。

```bash
uv run mda connections create organization-tavily --secret-from-env TAVILY_API_KEY
```




这会将 `TAVILY_API_KEY` 的值存储为代理拥有的秘密。运行时代码使用 `connections.get(...)` 来解析它。

其他提供价值的方式：- **`--secret-from-file PATH`**：从仅包含机密的文件中读取一个值。
- **stdin**：管道或重定向值，例如 `printf '%s' "$ACME_API_KEY" | mda connections create acme-api`。
- **交互式提示**：在 TTY 上省略值标志。 CLI 隐藏输入，因此秘密不会出现在屏幕上或 shell 历史记录中。

使用 CLI 创建的不透明机密始终归代理所有。对于每个调用者的凭据，请使用 [OAuth connection](#create-a-general-oauth-connection)。

颁发属于代理的密钥，而不是重复使用个人密钥。可以对专用密钥进行范围界定、轮换和撤销，而不会影响共享它的其他任何内容。

### 在自定义工具中使用不透明的秘密

以下工具解析代理的 `organization-tavily` 连接，然后将其发送到 Tavily API：

```python tools/search_web.py
import httpx
from langchain.tools import tool
from managed_deepagents import connections


@tool(parse_docstring=True)
async def search_web(query: str) -> str:
    """
    Search the web.

    Args:
        query: Search query.
    """
    api_key = await connections.get("organization-tavily", {"type": "agent"})
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={"api_key": api_key, "query": query, "max_results": 5},
        )
        response.raise_for_status()
        return response.text
```




请参阅 [Custom tools](/langsmith/python/managed-deep-agents-tools) 将工具添加到代理。

## 创建通用 OAuth 连接

注册自带应用程序 (BYOT) OAuth 客户端，以便调用者可以授予代理对提供商 API 的访问权限。将此模式用于您拥有 OAuth 应用程序注册的 REST 或 GraphQL API。对于自动发现并注册客户端的 MCP 服务器，请改用 [MCP OAuth](#create-an-mcp-oauth-connection)。

### 使用 OAuth 目录每个 OAuth 提供程序都需要相同的五个设置：授权 URL、令牌 URL、令牌端点身份验证方法、授权参数和默认范围。目录条目提供所有五个，因此 `--oauth <service>` 加上您自己的客户端 ID 和密钥就是整个配置。

目录并不是您可以使用的提供商的大门。对于它不涵盖的服务，[pass the endpoints yourself](#register-a-provider-with-custom-endpoints)。

列出目录：

```bash
uv run mda connections catalog
```




该命令打印每个服务的默认范围以及您注册应用程序的页面。它不调用 LangSmith，因此不需要工作区 ID 或 API 密钥。将第一列中的值传递给`--oauth`。| `--oauth`值|注册应用程序 |默认范围 |
| --- | --- | --- |
| `atlassian` | [Atlassian](https://developer.atlassian.com/console/myapps/) | `read:me` `offline_access` |
| `bitbucket` | [Bitbucket](https://bitbucket.org/account/settings/app-auth/) | `account` |
| `box` | [Box](https://app.box.com/developers/console) |无 |
| `click-up` | [ClickUp](https://app.clickup.com/settings/apps) |无 |
| `discord` | [Discord](https://discord.com/developers/applications) | `identify` `email` |
| `dropbox` | [Dropbox](https://www.dropbox.com/developers/apps) | `account_info.read` |
| `facebook` | [Facebook](https://developers.facebook.com/apps/) | `email` `public_profile` |
| `figma` | [Figma](https://www.figma.com/developers/apps) | `current_user:read` |
| `github` | [GitHub](https://github.com/settings/developers) | `read:user` |
| `gitlab` | [GitLab](https://gitlab.com/-/user_settings/applications) | `read_user` |
| `google` | [Google](https://console.cloud.google.com/apis/credentials) | `openid` `https://www.googleapis.com/auth/userinfo.email` |
| `hubspot` | [HubSpot](https://developers.hubspot.com/) | `oauth` |
| `huggingface` | [Hugging Face](https://huggingface.co/settings/applications/new) | `openid` `profile` `email` |
| `linear` | [Linear](https://linear.app/settings/api/applications/new) | `read` |
| `linkedin` | [LinkedIn](https://www.linkedin.com/developers/apps) | `openid` `profile` `email` |
| `notion-api` | [Notion API](https://www.notion.so/my-integrations) |无 |
| `patreon` | [Patreon](https://www.patreon.com/portal/registration/register-clients) | `identity` `identity[email]` |
| `reddit` | [Reddit](https://www.reddit.com/prefs/apps) | `identity` |
| `salesforce` | [Salesforce](https://login.salesforce.com/) | `api` `refresh_token` |
| `slack` | [Slack](https://api.slack.com/apps) | `chat:write` |
| `spotify` | [Spotify](https://developer.spotify.com/dashboard) | `user-read-email` |
| `twitch` | [Twitch](https://dev.twitch.tv/console/apps) | `user:read:email` |
| `x` | [X](https://developer.x.com/en/portal/dashboard) | `tweet.read` `users.read` `offline.access` |

没有默认范围的服务需要`--scope`。

<Accordion title="Some services run separate OAuth apps for their API and their MCP server">
观念就是其中之一。 `--oauth notion-api` 针对 Notion 的 REST API 注册应用程序，并且该应用程序未授权 Notion 的 MCP 服务器。要使用 MCP 服务器，请创建一个 [MCP OAuth connection](#create-an-mcp-oauth-connection)。当服务同时提供这两种服务时，请检查提供商的文档。
</Accordion>GitHub 需要 OAuth 客户端 ID 和客户端密钥。设置`GITHUB_CLIENT_SECRET`，然后创建连接。将 `********` 替换为客户端 ID：

```bash
uv run mda connections create frontend-github \
  --oauth github \
  --client-id "********" \
  --secret-from-env GITHUB_CLIENT_SECRET
```




创建时，CLI 会打印重定向 URI 以向提供程序注册。在调用者授权之前，在提供商的应用程序设置页面上注册该 URI。 URI 遵循您的 LangSmith 主机，例如生产中的 `https://api.smith.langchain.com/v1/agent-auth/oauth/callback`。

可选标志：

- **`--scope SCOPE`**：替换目录默认值。对每个范围重复此操作。
- **`--allowed-scope SCOPE`**：限制任何以后可能请求的授权。默认为 `--scope` 值，并且必须覆盖每个 `--scope`。
- **`--authorization-param KEY=VALUE`**：额外授权查询参数。对每个参数重复此操作。
- **`--auth-method METHOD`**：客户端如何向令牌端点进行身份验证：对于公共客户端，`client_secret_basic`、`client_secret_post` 或 `none`。默认为目录服务的方法。

### 使用自定义端点注册提供者

对于目录未涵盖的服务，传递两个端点以及客户端 ID 和范围：

```bash
uv run mda connections create acme \
  --authorize-url https://auth.acme.com/authorize \
  --token-url https://auth.acme.com/token \
  --client-id "********" \
  --secret-from-env ACME_CLIENT_SECRET \
  --scope read
```




大多数提供商会拒绝没有 `scope` 参数的授权请求。通过`--scope`进行手动注册，或者在目录涵盖提供商时使用`--oauth <service>`。

### 授权代理拥有的 OAuth 帐户当提供商发布自己的应用程序凭证（例如 Slack 机器人令牌、GitHub 应用程序安装令牌或 Notion 内部集成令牌）时，最好将该凭证存储为 [agent-owned secret](#create-an-opaque-secret)。应用程序凭证的范围仅限于应用程序，可以自行撤销，并且不依赖于任何人的帐户。

当提供商不提供应用程序身份且其 API 仅以个人身份进行身份验证时，请使用`--authorize`。

默认情况下，OAuth 连接在运行时从每个调用者收集授权。通过 `--authorize` 自行登录一次并存储部署的授权。然后，每个调用者都充当该帐户，并且没有调用者会看到授权提示：

```bash
uv run mda connections create support-linear \
  --oauth linear \
  --client-id "********" \
  --secret-from-env LINEAR_CLIENT_SECRET \
  --scope read --scope write \
  --authorize
```




CLI 为您登录的帐户启动授权流程，并存储部署的结果授权。运行时代码将其解析为代理拥有的凭据：

```python
access_token = await connections.get("support-linear", {"type": "agent"})
```




`--authorize` 仅适用于 OAuth 连接。将其与 `--oauth`、自定义端点或 `--mcp` 结合使用。从项目目录运行它，因为授权属于该项目的部署。当每个呼叫者都应充当一个共享帐户而不是他们自己时，请使用代理拥有的 OAuth 帐户。向问答代理授予读取权限的公司 Notion 帐户就是一个例子。

<Tip>
授权您的团队拥有的专用帐户，而不是您自己的帐户。您登录的帐户将成为客服人员为每个呼叫者采取的每项操作背后的身份。使用个人帐户会产生三项费用：

- 代理获得您对该提供商的完全访问权限。
- 提供商的审核日志显示您的姓名以及代理所做的事情。
- 当您自己的访问权限发生更改时，代理将停止工作。

通过这种方式获得的资助会与授权它的帐户（即使是专用帐户）保持联系。密码重置、撤销会话或停用帐户会结束授予，因此将该帐户视为生产基础设施。

为专用帐户提供代理所需的最窄 `--scope` 值。设置 `--allowed-scope` 以限制任何后续授权可以请求的内容。
</Tip>

### 在自定义工具中访问 OAuth 令牌

此工具解析经过身份验证的调用者的 GitHub 连接并调用 GitHub REST API：

```python tools/get_github_user.py
import httpx
from langchain.tools import tool
from managed_deepagents import connections


@tool
async def get_github_user() -> str:
    """Get the authenticated caller's GitHub login."""
    # Replace `frontend-github` with the name of your connection.
    access_token = await connections.get("frontend-github", {"type": "user"})
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        return response.json()["login"]
```




## 创建 MCP OAuth 连接对于支持 OAuth 客户端注册的远程 MCP 服务器，托管 Deep Agents 会发现服务器的 OAuth 元数据并自动注册客户端。您不提供客户端 ID 或客户端密钥。

### 首先声明MCP服务器

在`tools/mcp.py`中添加服务器并引用连接slug。

```python tools/mcp.py
from managed_deepagents import connections, define_mcp

mcp = define_mcp(
    servers={
        "notion": {
            "transport": "http",
            "url": "https://mcp.notion.com/mcp",
            "connection": connections.get("engineering-notion", {"type": "user"}),
        },
    },
)
```




有关更多信息，请参阅[Connect to MCP servers](/langsmith/python/managed-deep-agents-mcp-connectors)。

### 从项目声明创建

当 slug 与项目中的一个用户拥有的 MCP 连接完全匹配时，仅使用 slug 进行创建。 CLI 从 MCP 声明中读取服务器 URL：

```bash
uv run mda connections create engineering-notion
```




### 从显式 MCP URL 创建

当您想显式命名服务器 URL 时，或者当 slug 尚未在项目中声明时，请传递 `--mcp`：

```bash
uv run mda connections create engineering-notion --mcp https://mcp.notion.com/mcp
```




无方案值（例如 `mcp.notion.com/mcp`）存储为 `https://mcp.notion.com/mcp`。

如果服务器无法自动注册客户端，CLI 会这么说并指向您通用 OAuth（`--oauth` 或手动端点）。

`mda deploy` 将相同的推论应用于丢失的用户拥有的 MCP 连接。它保持现有连接不变，通过 OAuth 发现创建每个唯一的缺失 MCP 连接，并在发现或注册不可用时在部署之前失败。## 处理授权中断

托管 Deep Agents 为您运行 OAuth 往返。项目不需要回调路由，不需要令牌存储，不需要刷新逻辑，也不需要同意屏幕。运行暂停，调用者授予访问权限，然后使用该人的凭据恢复运行。

在第一次模型转动之前，托管 Deep Agents 检查运行所需的每个用户拥有的连接。如果调用者缺少一项或多项授权，凭证门将引发一个 LangGraph 中断。 Slack 和 LangSmith Studio 为调用者处理该中断。自定义前端从 LangChain 前端 SDK 读取相同的负载，并在调用者连接后恢复。

用户拥有的连接需要经过身份验证的调用者。匿名或仅代理运行无法完成凭证门。请参阅[Identify the caller](#identify-the-caller)了解该身份的来源。

### 中断负载

对于[⟦T152⟧](/oss/python/langchain/frontend/human-in-the-loop#setting-up-usestream) (`@langchain/react`、`@langchain/vue`、`@langchain/svelte`) 或`injectStream` (`@langchain/angular`)，待处理中断位于`stream.interrupt`。凭证门有效负载为`stream.interrupt.value`。

对于缺少的 OAuth 授权，`credentials` 中的每个条目都携带调用者完成同意的 URL：

```json
{
  "type": "credential_authorization_required",
  "message": "Connect the following integrations to continue.",
  "credentials": [
    {
      "slug": "engineering-notion",
      "kind": "oauth2",
      "connect_url": "https://api.smith.langchain.com/v1/agent-auth/...",
      "auth_id": "sess_abc123"
    }
  ]
}
```一个中断会列出每一项缺失的授权。在恢复之前处理每个条目。带有 `"kind": "secret"` 的条目代表用户拥有的 API 密钥，而不是 OAuth 授权。 Slack 和 Studio 不收集这些。有关更多信息，请参阅[Review current limitations](#review-current-limitations)。

|领域 |礼物给 |意义|
| --- | --- | --- |
| `type` |永远 |鉴别器。必须是`credential_authorization_required`。 |
| `message` |永远 |人类可读的摘要显示在待决拨款上方。 |
| `credentials` |永远 |每项缺失的拨款一项。 |
| `credentials[].slug` |永远 |连接slug 进行授权。 |
| `credentials[].kind` |永远 | `secret` 用于密码式 API 密钥，或 `oauth2` 用于 OAuth。 |
| `credentials[].connect_url` | `oauth2` |调用者完成同意的 HTTPS URL。 |
| `credentials[].auth_id` | `oauth2` |用于轮询状态的授权会话 ID。 |

### 读取 UI 中的中断

呈现此中断的前端是一个 Web 应用程序，因此无论代理是用 Python 还是 TypeScript 编写的，这些示例都是 TypeScript。

检测`stream.interrupt`上的凭证门负载，渲染连接卡，然后在存储每个授权后使用`stream.respond`恢复：

<CodeGroup>
```tsx React
import { useStream } from "@langchain/react";

type CredentialAuthorizationRequired = {
  type: "credential_authorization_required";
  message?: string;
  credentials: Array<{
    slug: string;
    kind: "oauth2" | "secret";
    connect_url?: string;
    auth_id?: string;
  }>;
};

function isCredentialAuthorization(
  value: unknown
): value is CredentialAuthorizationRequired {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "credential_authorization_required"
  );
}

export function Chat() {
  const stream = useStream({
    apiUrl: "https://your-deployment.example",
    assistantId: "agent",
  });

  const payload = stream.interrupt?.value;
  const credentialAuth = isCredentialAuthorization(payload) ? payload : null;

  return (
    <div>
      {/* messages … */}
      {credentialAuth && (
        <ConnectCard
          payload={credentialAuth}
          onComplete={async (connectedSlugs) => {
            await stream.respond(
              {
                type: "credential_authorization_completed",
                connected_slugs: connectedSlugs,
              },
              { interruptId: stream.interrupt?.id }
            );
          }}
        />
      )}
    </div>
  );
}
```

```vue Vue
<script setup lang="ts">
import { computed } from "vue";
import { useStream } from "@langchain/vue";

const stream = useStream({
  apiUrl: "https://your-deployment.example",
  assistantId: "agent",
});

const credentialAuth = computed(() => {
  const value = stream.interrupt.value?.value;
  return value?.type === "credential_authorization_required" ? value : null;
});

async function onComplete(connectedSlugs: string[]) {
  await stream.respond(
    {
      type: "credential_authorization_completed",
      connected_slugs: connectedSlugs,
    },
    { interruptId: stream.interrupt.value?.id }
  );
}
</script>

<template>
  <div>
    <!-- messages … -->
    <ConnectCard
      v-if="credentialAuth"
      :payload="credentialAuth"
      @complete="onComplete"
    />
  </div>
</template>
```

```svelte Svelte
<script lang="ts">
  import { useStream } from "@langchain/svelte";

  const stream = useStream({
    apiUrl: "https://your-deployment.example",
    assistantId: "agent",
  });

  $: payload = stream.interrupt?.value;
  $: credentialAuth =
    payload?.type === "credential_authorization_required" ? payload : null;

  async function onComplete(connectedSlugs: string[]) {
    await stream.respond(
      {
        type: "credential_authorization_completed",
        connected_slugs: connectedSlugs,
      },
      { interruptId: stream.interrupt?.id }
    );
  }
</script>

<div>
  <!-- messages … -->
  {#if credentialAuth}
    <ConnectCard payload={credentialAuth} onComplete={onComplete} />
  {/if}
</div>
```

```ts Angular
import { Component, computed } from "@angular/core";
import { injectStream } from "@langchain/angular";

@Component({
  selector: "app-chat",
  template: `
    <!-- messages … -->
    @if (credentialAuth(); as auth) {
      <app-connect-card
        [payload]="auth"
        (complete)="onComplete($event)"
      />
    }
  `,
})
export class ChatComponent {
  stream = injectStream({
    apiUrl: "https://your-deployment.example",
    assistantId: "agent",
  });

  credentialAuth = computed(() => {
    const value = this.stream.interrupt()?.value;
    return value?.type === "credential_authorization_required" ? value : null;
  });

  async onComplete(connectedSlugs: string[]) {
    await this.stream.respond(
      {
        type: "credential_authorization_completed",
        connected_slugs: connectedSlugs,
      },
      { interruptId: this.stream.interrupt()?.id }
    );
  }
}
```
</CodeGroup>

一般中断生命周期（`stream.interrupt`、恢复、检查点）请参见[Human-in-the-loop](/oss/python/langchain/frontend/human-in-the-loop)。### 处理 OAuth 授权 (`kind: "oauth2"`)

对于每个 OAuth 条目：

1. 显示 `slug` 和打开 `connect_url` 的连接控件（仅限 HTTPS；拒绝带有嵌入凭据的 URL）。
2. 长轮询代理身份验证，直到会话完成：

```http
GET /v1/agent-auth/oauth-authorization-sessions/{auth_id}?wait_seconds=25
```

响应`status`为`pending`、`completed`、`failed`或`expired`。当状态为`pending`时继续轮询。在 `completed` 上，标记该 slug 已连接。在 `failed` 或 `expired` 上，要求呼叫者开始新的运行以获取新的连接链路。

不要将访问令牌放入您的 UI 中。代理验证存储调用者的授权；代理通过`connections.get(...)`在简历上读取它。

### 恢复运行

连接`credentials`中的每个条目后，恢复：

```json
{
  "type": "credential_authorization_completed",
  "connected_slugs": ["engineering-notion"]
}
```

将该对象传递给`stream.respond(resume, { interruptId: stream.interrupt?.id })`，如上所示。如果在授权仍然丢失的情况下恢复，门会再次中断并带有新的有效负载。

### 内置 Slack 处理

当代理通过 Slack 通道运行时，Slack 会呈现包含 HTTPS `connect_url` 的 OAuth 条目。调用者打开链接，完成同意，Slack 恢复运行，因此没有人需要打开 LangSmith 来连接服务。

<Frame caption="Slack OAuth authorization prompt">
  **屏幕截图占位符：** 此处添加 Slack OAuth 授权提示屏幕截图。
</Frame>

## 检查并删除连接使用 `list` 或 `get` 检查连接元数据。 `list` 显示工作区中的每个连接，而不仅仅是该项目使用的连接：

```bash
uv run mda connections list
uv run mda connections get organization-tavily
uv run mda connections delete organization-tavily
```




将 `--json` 传递给 `list` 或 `get` 以获取机器可读的输出。将 `--yes` 传递给 `delete` 以跳过确认提示。

## 本地开发

对于`mda dev`，代理拥有的不透明连接读取`MDA_DEV_<SLUG>`。 CLI 将 slug 转换为大写并用下划线替换连字符。例如，`organization-tavily` 读取为 `MDA_DEV_ORGANIZATION_TAVILY`。

用户拥有的连接需要经过身份验证的调用者和代理身份验证。部署代理以端到端地执行[authorization interrupt](#handle-the-authorization-interrupt)。

## 查看当前限制

连接是托管 Deep Agents 公共测试版的一部分。当前版本存在以下差距：- **用户拥有的 API 密钥**：用户拥有的连接持有 OAuth 授权。 Slack 和 Studio 不会收集每个调用者的 API 密钥，并且 CLI 不会为其创建一个空槽。请改用代理拥有的密钥，或在自定义前端中收集密钥，如下节所述。
- **自定义渠道**：Slack 和 Studio 解析呼叫者身份并完成呼叫者的授权。自定义前端处理 [authorization interrupt](#handle-the-authorization-interrupt) 本身。
- **工作区 UI**：LangSmith 不在 UI 中列出连接。使用 `mda connections list` 和 `mda connections get` 作为连接元数据。
- **授予可见性**：`mda connections list` 是工作区范围的，不会报告哪些部署在 slug 下持有凭证。运行失败并显示 `no agent connection is set for slug '<slug>'` 意味着此部署不拥有其凭证，即使 `list` 显示段头也是如此。从项目根目录运行`mda connections create <slug>`来创建一个。

<Accordion title="Store a user-owned API key through Agent Auth">
带有`"kind": "secret"`的中断入口没有`connect_url`。要在自定义前端中收集一个，请提示输入隐藏输入的值，然后根据现有连接 slug 创建凭据：

```http
POST /v1/agent-auth/connections
```

```json
{
  "slug": "organization-tavily",
  "display_name": "organization-tavily",
  "credential": {
    "kind": "secret",
    "owner_type": "user",
    "owner_id": "<caller-identity-id>",
    "value": "<api-key>"
  }
}
```代理身份验证重用该 slug 的现有连接并附加调用者的秘密。秘密材料是只写的。成功创建后，将该 slug 标记为已连接并恢复运行。欲了解更多信息，请参阅[Set up Agent Auth](/langsmith/agent-auth)。
</Accordion>

## 另请参阅

- [Managed Deep Agents CLI reference](/langsmith/python/managed-deep-agents-cli)
- [Connect to MCP servers](/langsmith/python/managed-deep-agents-mcp-connectors)
- [Add custom tools](/langsmith/python/managed-deep-agents-tools)
- [Add identity to Managed Deep Agents](/langsmith/python/managed-deep-agents-identity)
- [Deploy an agent](/langsmith/python/managed-deep-agents-deploy)
- [Human-in-the-loop](/oss/python/langchain/frontend/human-in-the-loop)
- [Set up Agent Auth](/langsmith/agent-auth)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-connections.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>