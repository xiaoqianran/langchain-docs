<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to MCP servers | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-mcp-connectors -->

# 连接到 MCP 服务器

MCP 连接器将远程[Model Context Protocol (MCP)](/oss/javascript/deepagents/mcp) 服务器中的工具添加到托管深度代理中。托管 Deep Agents 创建 MCP 客户端、加载工具并将它们添加到代理。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

在 `connectors/` 正下方的模块中声明 MCP 服务器：



```text
my-agent/
  agent.ts
  connectors/
    mcp.ts
```

该模块必须导出名为 `connector`。


## 添加 MCP 连接器

使用 `connectors.mcp` 声明一台或多台远程服务器：



```ts connectors/mcp.ts
import { connectors } from "managed-deepagents";

export const connector = connectors.mcp({
  mcpServers: {
    langchainDocs: {
      transport: "http",
      url: "https://docs.langchain.com/mcp",
    },
  },
});
```


托管 Deep Agents 支持可流式 HTTP (`"http"`) 和旧版 SSE (`"sse"`) 传输。不支持 Stdio MCP 服务器。通过 HTTP 公开 stdio 服务器或将其操作实现为 [authored tool](/langsmith/javascript/managed-deep-agents-tools)。

## 选择工具

默认情况下，连接器公开每个服务器的每个工具。要仅公开选定的工具，请在该服务器的配置中设置允许列表：



```ts
{
  transport: "http",
  url: "https://docs.langchain.com/mcp",
  includeTools: ["search_docs_by_lang_chain"],
}
```

要公开除选定工具之外的所有工具，请将 `includeTools` 替换为 `excludeTools`。


您可以同时使用这两个选项。拒绝列表在允许列表之后应用，并且同一工具不能出现在两个列表中。选择在 Managed Deep Agents 前缀之前使用原始 MCP 工具名称。默认情况下，工具名称以服务器名称为前缀以避免冲突。例如，来自 `langchainDocs` 服务器的 `search_docs_by_lang_chain` 工具公开为 `langchainDocs__search_docs_by_lang_chain`。

## 配置连接

每个服务器接受以下选项：

|选项 |描述 |
| ---| ---|
| `transport` |必需的。对流式 HTTP 使用 `http`，对旧版 SSE 使用 `sse`。 |
| `url` |必需的。远程 MCP 端点 URL。 |
| `headers` |要发送到服务器的静态标头，例如授权标头。 |
| `include_tools` / `includeTools` |要公开的原始 MCP 工具名称。 |
| `exclude_tools` / `excludeTools` |要隐藏的原始 MCP 工具名称。 |
| `default_tool_timeout` / `defaultToolTimeout` |每个工具调用的超时时间，对于 Python 以秒为单位，对于 TypeScript 以毫秒为单位。 |
| `automatic_sse_fallback` / `automaticSSEFallback` |对于 HTTP，允许客户端回退到 SSE。 |
| `reconnect` |对于 SSE，配置重新连接行为。 |

连接器还接受以下选项：

|选项 |默认 |描述 |
| ---| ---| ---|
| `prefix_tool_name_with_server_name` / `prefixToolNameWithServerName` | `true` |每个工具都带有前缀 `{server}__`。 |
| `throw_on_load_error` / `throwOnLoadError` | `true` |加载失败而不是从部分工具集开始。 |如果服务器需要凭据，请从环境变量中读取它们并通过`headers`传递它们。将本地值保留在`.env`中；托管 Deep Agents 将符合条件的值作为部署机密转发。不要在连接器声明中对凭据进行硬编码。

## 将连接器与其他功能区分开来

- **MCP 连接器** 添加由远程 MCP 服务器托管的工具。
- **[Authored tools](/langsmith/javascript/managed-deep-agents-tools)** 在项目中实现应用程序逻辑并通过代理定义传递。
- **[Channels](/langsmith/javascript/managed-deep-agents-channels)** 接收启动代理运行并传递响应的外部消息。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-mcp-connectors.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>