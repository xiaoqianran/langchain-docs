<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to MCP servers | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-mcp-connectors -->

# 连接到 MCP 服务器

将托管深度代理连接到远程 [Model Context Protocol (MCP)](/oss/javascript/deepagents/mcp) 服务器，以将其工具添加到代理中。 Managed Deep Agents 创建 MCP 客户端并加载工具。

大多数远程 MCP 服务器需要身份验证。 [connection](/langsmith/javascript/managed-deep-agents-connections) 提供它，并将连接声明为用户所有，使每个调用者授权自己的帐户。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

在 `tools/` 正下方的模块中声明 MCP 服务器：



```text
my-agent/
  agent.ts
  tools/
    mcp.ts
```

该模块必须导出名为 `mcp`。


## 添加 MCP 服务器



使用 `defineMcp` 声明一台或多台远程服务器：

```ts tools/mcp.ts
import { defineMcp } from "managed-deepagents";

export const mcp = defineMcp({
  servers: {
    langchainDocs: {
      transport: "http",
      url: "https://docs.langchain.com/mcp",
    },
  },
});
```


托管 Deep Agents 支持可流式 HTTP (`"http"`) 和旧版 SSE (`"sse"`) 传输。不支持 Stdio MCP 服务器。通过 HTTP 公开 stdio 服务器或将其操作实现为 [authored tool](/langsmith/javascript/managed-deep-agents-tools)。

## 选择工具

默认情况下，托管Deep Agents公开每个服务器的每个工具。要仅公开选定的工具，请在该服务器的配置中设置允许列表：



```ts
{
  transport: "http",
  url: "https://docs.langchain.com/mcp",
  includeTools: ["search_docs_by_lang_chain"],
}
```

要公开除选定工具之外的所有工具，请将 `includeTools` 替换为 `excludeTools`。


您可以同时使用这两个选项。拒绝列表在允许列表之后应用，并且同一工具不能出现在两个列表中。选择在 Managed Deep Agents 前缀之前使用原始 MCP 工具名称。默认情况下，工具名称以服务器名称为前缀以避免冲突。例如，来自 `langchainDocs` 服务器的 `search_docs_by_lang_chain` 工具公开为 `langchainDocs__search_docs_by_lang_chain`。

## 配置 MCP 服务器

每个服务器都支持以下核心选项：

|选项 |描述 |
| --- | --- |
| `transport` |必需的。对流式 HTTP 使用 `http`，对旧版 SSE 使用 `sse`。 |
| `url` |必需的。远程 MCP 端点 URL。 |
| `headers` |发送到服务器的静态标头。 |
| `include_tools` / `includeTools` |要公开的原始 MCP 工具名称。 |
| `exclude_tools` / `excludeTools` |要隐藏的原始 MCP 工具名称。 |
| `default_tool_timeout` / `defaultToolTimeout` |每个工具调用的超时时间，对于 Python 以秒为单位，对于 TypeScript 以毫秒为单位。 |
| `automatic_sse_fallback` / `automaticSSEFallback` |对于 HTTP，允许客户端回退到 SSE。 |
| `reconnect` |对于 SSE，配置重新连接行为。 |

MCP 定义还接受以下选项：

|选项 |默认 |描述 |
| --- | --- | --- |
| `prefix_tool_name_with_server_name` / `prefixToolNameWithServerName` | `true` |每个工具都带有前缀 `{server}__`。 |
| `throw_on_load_error` / `throwOnLoadError` | `true` |加载失败而不是从部分工具集开始。 |

## 将 MCP 与其他功能进行比较- **MCP 服务器** 提供远程托管工具。
- **[Authored tools](/langsmith/javascript/managed-deep-agents-tools)** 在项目中实现应用程序逻辑并通过代理定义传递。
- **[Channels](/langsmith/javascript/managed-deep-agents-channels)** 接收启动代理运行并传递响应的外部消息。

## 使用需要身份验证的 MCP 服务器

如果 MCP 服务器需要凭据，请在服务器配置上声明连接并在工作区中创建该连接。

- **MCP OAuth**：对于通告 OAuth 并支持自动客户端注册的服务器，请使用`mda connections create <slug>`（从 MCP 声明推断）或`mda connections create <slug> --mcp <url>` 创建。您不提供客户端 ID 或密码。
- **不透明机密或通用 OAuth**：对于静态 API 密钥，或您自己注册的 BYOT OAuth 应用程序，创建不透明机密或通用 OAuth 连接，然后将服务器的 `connection` 选项设置为 `connections.get(...)`。

有关创建模式、所有者和运行时授权，请参阅[Manage connections](/langsmith/javascript/managed-deep-agents-connections)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-mcp-connectors.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>