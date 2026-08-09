<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Remote MCP | https://docs.langchain.com/langsmith/langsmith-remote-mcp -->

# LangSmith 远程 MCP

通过 OAuth 将 MCP 兼容客户端连接到 LangSmith，或使用 LangSmith API 密钥对编程客户端进行身份验证。

LangSmith 远程 MCP 是由 LangSmith 托管的 [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) 服务器。它公开了与 [standalone LangSmith MCP Server](/langsmith/langsmith-mcp-server) 相同的工具（对话历史记录、提示、运行和跟踪、数据集、实验、计费），无需单独部署。交互式 MCP 客户端通过 OAuth 连接，无需 API 密钥或标头配置；编程客户端可以通过 `X-Api-Key` 标头使用 LangSmith API 密钥进行身份验证。

远程 MCP 可在所有 LangSmith Cloud 区域以及运行 v0.16 或更高版本的 [self-hosted LangSmith](/langsmith/self-hosted) 部署上使用（自托管还需要配置签名 JWKS — 请参阅 [Self-hosted LangSmith](#self-hosted-langsmith)）。早期版本上的自托管部署应继续使用 [standalone LangSmith MCP Server](/langsmith/langsmith-mcp-server)。

## 端点

**朗史密斯云：**

<table>
  <thead>
    <tr>
      <th>地区</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>GCP 美国</td>
    </tr>

    <tr>
      <td>GCP 欧盟</td>
    </tr>

    <tr>
      <td>GCP 亚太地区</td>
    </tr>

    <tr>
      <td>AWS 美国</td>
    </tr>
  </tbody>
</table>服务器通过同一主机上的 [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414) 处的 `/.well-known/oauth-authorization-server` 发现其 OAuth 元数据的其余部分，因此兼容的 MCP 客户端只需要上面的 URL。

**自托管 LangSmith：**

`https://<your-langsmith-host>/api/mcp`，其中 `<your-langsmith-host>` 是您的 LangSmith 实例的主机名。

## 身份验证

远程 MCP 支持两种身份验证方法。对交互式 MCP 客户端（Claude Code、Cursor 等）使用 **OAuth**，对无法完成基于浏览器登录的编程或无头客户端使用 **API 密钥**。

### OAuth

带有 [Dynamic Client Registration (RFC 7591)](https://datatracker.ietf.org/doc/html/rfc7591) 的 OAuth 2.1 是交互式客户端的默认设置。兼容的 MCP 客户端在首次使用时自动注册 — 无需配置客户端 ID，也无需管理 API 密钥。

注册后：

1. 客户端在浏览器中打开授权 URL。
2. 您登录 LangSmith（或使用现有会话）并同意。
3. 客户端收到访问令牌和刷新令牌。
4. 访问令牌过期后由客户端自动刷新。

该会话的范围仅限于您的 LangSmith 用户和工作区权限 - 通过 MCP 服务器的调用只能查看您的帐户有权查看的内容。

### API 密钥在每个请求的 `X-Api-Key` 标头中发送 [LangSmith API key](/langsmith/create-account-api-key)。这适合后端服务、脚本和 SDK，例如 [AI SDK](#ai-sdk)，其中交互式 OAuth 流程不实用。

请求被授权为拥有 API 密钥的用户，范围仅限于该密钥的工作区和权限，与该密钥在 LangSmith API 中其他地方的授权相同。接受 `workspace_id` 参数的工具可以针对特定的工作空间；否则使用密钥自己的工作空间。

<Note>
  `X-Api-Key` 标头特定于远程 MCP。 [standalone LangSmith MCP Server](/langsmith/langsmith-mcp-server) 使用不同的标头，`LANGSMITH-API-KEY`。
</Note>

## 快速入门

### 克劳德·代码

将服务器添加到项目的 `.mcp.json` （或运行 `claude mcp add --transport http -s user langsmith https://api.smith.langchain.com/mcp` 以在用户范围内安装它）：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "langsmith": {
      "type": "http",
      "url": "https://api.smith.langchain.com/mcp"
    }
  }
}
```

然后运行 `/mcp` 并选择 **langsmith** 以完成 OAuth 流程。工具以 `mcp__langsmith__<tool_name>` 形式提供。

### 深度特工代码 (`dcode`)

将服务器添加到您的用户级 `~/.deepagents/.mcp.json` 文件，以使其在每个 Deep Agents Code 项目中可用，或将其添加到仅适用于该项目的项目级 `.mcp.json` 文件。请参阅 [Deep Agents Code MCP tools docs](/oss/deepagents/code/mcp-tools) 了解发现位置和优先规则。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "langsmith": {
      "url": "https://api.smith.langchain.com/mcp",
      "transport": "http",
      "auth": "oauth"
    }
  }
}
```

然后通过以下两种方式之一完成 OAuth 登录流程：* 在 Deep Agents Code TUI 中，运行 `/mcp`，选择 **langsmith**，然后按照登录提示操作。
* 从你的 shell 中运行：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode mcp login langsmith
  ```

启动 `dcode`，或重新启动活动会话，以加载 LangSmith MCP 工具。在交互式会话中，运行`/mcp`来检查服务器状态和加载的工具。

### 光标

添加到您的光标`mcp.json`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "LangSmith": {
      "url": "https://api.smith.langchain.com/mcp"
    }
  }
}
```

首次使用时，光标将提示您完成 OAuth 流程。

### LangSmith CLI

[LangSmith CLI](/langsmith/langsmith-cli) 针对同一个 OAuth 服务器进行身份验证，因此 `langsmith auth login` 通过 OAuth 设备流让您登录 — 无需 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# LangSmith Cloud
langsmith auth login

# Self-hosted (point at your instance's /api base)
langsmith auth login --api-url https://<your-langsmith-host>/api
```

CLI 打印激活 URL；打开它，批准，CLI 完成登录并将每个配置文件的令牌存储在 `~/.langsmith/config.json` 中。然后，它针对与远程 MCP 服务器相同的项目、跟踪、运行、数据集、实验和线程进行工作。

### 人工智能 SDK

对于从 [AI SDK](https://ai-sdk.dev/) 进行编程使用，请通过 `X-Api-Key` 标头和内置 `http`（可流式 HTTP）传输使用 API 密钥进行身份验证：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMCPClient } from "@ai-sdk/mcp";

const client = await createMCPClient({
  transport: {
    type: "http",
    url: "https://api.smith.langchain.com/mcp",
    headers: { "X-Api-Key": process.env.LANGSMITH_API_KEY! },
  },
});

const tools = await client.tools();
```

通过`tools`直接到达`streamText`或`generateText`。远程 MCP 是无状态的，并通过标准可流式 HTTP 传输以 JSON 进行响应，因此内置传输按原样工作 — 您不需要自定义传输。

### 其他客户任何支持 [Streamable HTTP transport](https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/transports/#streamable-http) 的 MCP 客户端都可以仅使用上面的 URL 进行连接 - 使用带有动态客户端注册的 OAuth 2.1，或`X-Api-Key` 标头中的 LangSmith API 密钥。

## 已知的客户端不兼容性

<Note>
  **OpenAI Codex CLI** 不适用于 LangSmith 远程 MCP。 Codex 在 OAuth 流程期间省略了 [MCP authorization spec](https://modelcontextprotocol.io/specification/draft/basic/authorization) 所需的 [RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707) `resource` 参数，因此登录似乎成功，但颁发的令牌未绑定到 LangSmith MCP，并且 `initialize` 失败并出现需要身份验证的错误。两个上游问题影响 Codex 中的令牌交换和授权请求（请参阅[openai/codex#20729](https://github.com/openai/codex/issues/20729) 和 [openai/codex#13891](https://github.com/openai/codex/issues/13891)）。同时，使用 Codex 中的[LangSmith CLI](/langsmith/langsmith-cli)。 LangSmith CLI 支持与 MCP 服务器相同的项目、跟踪、运行、数据集、实验和线程，并具有本机 OAuth 登录。
</Note>

## 可用工具

远程 MCP 暴露与 [standalone server](/langsmith/langsmith-mcp-server#available-tools) 相同的工具表面：

* **对话和话题：** `get_thread_history`
* **及时管理：** `list_prompts`、`get_prompt_by_name`、`push_prompt`
* **跟踪和运行：** `fetch_runs`、`list_projects`
* **数据集和示例：** `list_datasets`、`list_examples`、`read_dataset`、`read_example`、`create_dataset`、`update_examples`
* **实验和评估：** `list_experiments`、`run_experiment`
* **计费：** `get_billing_usage`有关参数和分页详细信息，请参阅[standalone server reference](/langsmith/langsmith-mcp-server#available-tools) - 两个服务器共享相同的工具实现。

## 重新验证

如果客户端丢失会话（例如，在撤销 LangSmith 帐户的访问权限后，或者刷新令牌无效），请从客户端触发重新身份验证：

* **克劳德代码：**运行`/mcp`，选择**langsmith**，选择重新验证。
* **光标：** 在 MCP 设置中禁用并重新启用服务器。
* **其他客户端：** 请查阅客户端的 MCP 设置 UI。

## 自托管 LangSmith

v0.16 或更高版本上的[Self-hosted LangSmith](/langsmith/self-hosted) 部署在`https://<your-langsmith-host>/api/mcp` 公开远程 MCP。启用后，身份验证和工具界面与 LangSmith Cloud 相同。

### 启用远程 MCP

设置 `config.hostname` 时，远程 MCP 及其 OAuth 授权服务器会自动连接，但它们保持**惰性 (404)** 直到您提供签名 JWKS。这是 LangSmith Cloud 为您处理的一项配置。要启用它：

1. **生成 Ed25519 (OKP) JWKS。** RSA 密钥被拒绝。例如，对于 [⟦T56⟧](https://smallstep.com/docs/step-cli/)：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   step crypto jwk create /dev/null /tmp/jwk.json --kty OKP --crv Ed25519 --no-password --insecure -f
   jq -c '{keys:[.]}' /tmp/jwk.json   # wrap the single key in a JWKS
   ```

2. **将其作为 `config.signingJwks`（存储在图表秘密中）提供给图表**，或作为 [existing secret](/langsmith/self-host-using-an-existing-secret) 中的密钥 `langsmith_signing_jwks`：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   config:
     hostname: "your-langsmith-host"
     signingJwks: |
       {"keys":[ ... ]}
   ```<Warning>
     不要直接通过 `commonEnv` 或 `extraEnv` 设置 `LANGSMITH_SIGNING_JWKS` — 图表已从机密中连接它，并且手动副本会导致安装失败并出现重复的环境变量错误。请使用 `config.signingJwks` 或 `config.existingSecretName` 代替。
   </Warning>

升级后，OAuth 发现端点和`/api/mcp` 上线。验证：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://<your-langsmith-host>/api/.well-known/oauth-protected-resource/mcp
```

对于早期版本的部署，请在您自己的环境中运行 [standalone LangSmith MCP Server](/langsmith/langsmith-mcp-server) 并将其 `LANGSMITH_ENDPOINT` 指向您的自托管实例。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-remote-mcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>