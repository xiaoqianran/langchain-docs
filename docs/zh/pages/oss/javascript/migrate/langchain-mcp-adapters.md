<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Migrate to @langchain/mcp-adapters 2.0 | https://docs.langchain.com/oss/javascript/migrate/langchain-mcp-adapters -->

# 迁移到@langchain/mcp-adapters 2.0

从 @langchain/mcp-adapters 1.x 升级到 2.0，涵盖重命名的 API、更严格的配置、身份验证、诱导和工具结果更改。

<Prompt description="Migrate from @langchain/mcp-adapters 1.x to 2.0." icon="arrow-right">
  将此代码库从 `@langchain/mcp-adapters` 1.x 迁移到 2.0 并更新其对等依赖项。

  在 [https://docs.langchain.com/oss/javascript/migrate/langchain-mcp-adapters.md](https://docs.langchain.com/oss/javascript/migrate/langchain-mcp-adapters.md) 获取并阅读完整的迁移指南作为事实来源。搜索此代码库并应用所有相关的迁移更改，包括依赖项和测试更新。运行相关检查，然后总结更改并标记任何需要手动决策或无法验证的内容。如果您无法访问该指南，请在继续之前询问其内容。
</Prompt>

`@langchain/mcp-adapters` 2.0 在 MCP TypeScript SDK 2 客户端上重建适配器。它为每个服务器协商 MCP 协议时代，并通过 LangGraph 中断应答现代 MCP 启发。本指南涵盖了影响 1.x 代码的更改。有关功能文档，请参阅[Model Context Protocol (MCP)](/oss/javascript/langchain/mcp)。

## 重大变更* **默认情况下，工具名称以服务器名称为前缀。** `MCPAdapter`，包括已弃用的 `MultiServerMCPClient`，将工具命名为 `{server}_{tool}`（例如 `weather_get_forecast`），即使使用单个服务器，除非您设置 `prefixToolNameWithServerName`； 1.x 默认为`false`。设置 `prefixToolNameWithServerName: false` 以保留 1.x 名称。 `loadMcpTools` 仍默认为 `false`。更新引用工具名称的代码、提示和保存的示例。将`interruptOn`审批规则更新为前缀名称； `delete_repo` 的规则不再匹配 `github_delete_repo`。适配器不会验证服务器名称，较长的名称可能会超出模型提供程序的工具名称限制；参见[Multiple servers](/oss/javascript/langchain/mcp/connections#multiple-servers)。
* **重复的工具名称抛出。** 对于 `prefixToolNameWithServerName: false`、`listTools()` 和 `getTools()`，当两台服务器公开相同的工具名称或一台服务器列出同一个名称两次时，会抛出 `MCPClientError`。 1.x 返回了所有工具。保留前缀，或从 `listToolsets()` 中选择每个服务器的工具。
* **默认情况下，提取暂停运行。** 当现代服务器在工具调用期间请求输入时，适配器会引发 LangGraph [⟦T28⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 并且运行会停止，直到您使用 `createMCPElicitationResume` 恢复运行。仅当工具引发时才需要检查指针。在服务器上设置 `elicitation: false` 以保持 1.x 行为。参见[Elicitation](#elicitation)。* **工具内容始终是标准内容块。** 1.x 默认 `useStandardContentBlocks` 到 `false`。 2.0 删除了该选项，拒绝它，并始终返回标准块，因此图像携带 `data` 和 `mimeType` 而不是 `image_url` 数据 URL，音频使用 `mimeType` 而不是 `mime_type`。参见[Tool results](#tool-results)。
* **配置是严格的。** 构造适配器时会抛出未知的键和已删除的选项。参见[Removed options](#removed-options)。
* **服务器报告的工具错误会返回错误消息。** 对于代理的工具调用，带有 `isError` 的结果将作为 `ToolMessage` 和 `status: "error"` 返回。使用普通参数直接调用仍然会抛出异常。参见[Tool results](#tool-results)。
* **模型不再在单个文本块旁边看到 `structuredContent` 或 `_meta`。** 1.x 还将它们复制到文本块上，因此它们被序列化到内容中； 2.0 仅发送文本。从工件的 `mcp_structured_content` 和 `mcp_meta` 条目中读取它们，1.x 也将它们放置在其中。参见[Tool results](#tool-results)。

## 安装

升级适配器及其对等依赖项：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/mcp-adapters@^2.0.0 @langchain/core @langchain/langgraph
  ```
</CodeGroup>* **对等依赖性**：适配器需要 `@langchain/core` 1.2.6 或更高版本（原为 1.0.0）和 `@langchain/langgraph` 1.4.13 或更高版本（原为 1.4.10）。
* **MCP SDK**：适配器包括 MCP SDK 2 客户端。如果您的代码为 `loadMcpTools` 创建 SDK 客户端，请将 `@modelcontextprotocol/sdk` 导入替换为 `@modelcontextprotocol/client`。从 `@modelcontextprotocol/client/stdio` 导入 stdio 传输。如果您的代码导入了 SDK，则将 SDK 添加为直接依赖项，包括[complete an OAuth redirect](/oss/javascript/langchain/mcp/auth#complete-the-redirect)。
* **Zod 4**：适配器使用内部 Zod 4 依赖项验证配置，因此配置错误是 Zod 4 错误。
* **调试日志记录**：`DEBUG=@langchain/mcp-adapters:*` 不再发出日志。请改用 `onConnectionError` 和每服务器通知回调。

## 重命名的 API

之前：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  mcpServers: {
    math: { command: "node", args: ["./math-server.js"] },
  },
});
const tools = await client.getTools();
```

之后：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";

const adapter = new MCPAdapter({
  servers: {
    math: { command: "node", args: ["./math-server.js"] },
  },
});
const tools = await adapter.listTools();
```

| 1.x API |推荐2.0 API |
| - | - |
| `MultiServerMCPClient` | `MCPAdapter` |
| `mcpServers` 或平面服务器地图 | `servers` |
| `getTools(...)` | `listTools(...)`，可执行工具的平面列表 |
| `initializeConnections()` | `listToolsets()`，按服务器分组的工具 |
| `ClientConfig`型 | `MCPAdapterConfig` |

此表中的旧 API 仍然有效，但已弃用，并且将来可能会被删除。

其他 API 更改：* 从`adapter.config.servers`而不是`adapter.config.mcpServers`读取配置。这是一个快照；更改它不会重新配置适配器。
* `SSEConnection` 仅接受旧版 SSE。对 HTTP 使用 `StreamableHTTPConnection`，对任何传输使用 `Connection`。
* `ToolException` 和 `MCPClientError` 现已导出。使用 `ToolException.isInstance(error)` 和 `MCPClientError.isInstance(error)` 识别它们，它们检查品牌而不是错误的 `name`。
* `setLoggingLevel()` 仅限旧版本。如果它的目标服务器协商了现代协议，它会抛出异常，然后不设置任何级别。在每个现代服务器上设置`logLevel`。参见[Protocol eras](/oss/javascript/langchain/mcp/connections#protocol-eras)。现代服务器也拒绝`resources/subscribe`，因此在服务器的`resourceSubscriptions`选项中列出要监视的资源URI并在`onResourcesUpdated`中处理更新，而不是在客户端上调用`subscribeResource()`。

`getClient()` 现在从 `@modelcontextprotocol/client` 返回 SDK 2 `Client`。 `loadMcpTools(serverName, client)` 转换您自己构建的 SDK 客户端中的工具。 SDK `Client` 默认情况下会协商旧协议，因此如果其工具应通过中断引发，请使用 `versionNegotiation: { mode: "auto" }` 创建它。要通过`InMemoryTransport`将其连接到进程内服务器，请使用`serveStdio(factory, { transport: serverSide })`为该服务器提供服务； `server.connect()` 仅服务于旧协议。

## 删除选项

设置这些选项中的任何一个的配置现在都无法通过验证。 `loadMcpTools` 以相同的方式验证其选项：|选项|更换|
| - | - |
| `useStandardContentBlocks` |没有任何。工具内容始终是标准的LangChain内容块。删除该选项。 |
| `onRootsListChanged` |没有任何。删除该选项。 |
| `onCancelled` |没有任何。删除该选项。 |
| Stdio `encoding` |没有任何。删除该选项。 |
|顶级通知回调 |在每台服务器上设置它们。参见[Move callbacks onto servers](#move-callbacks-onto-servers)。 |

## 配置

### 将回调移动到服务器上

通知和进度回调从顶层移动到应该接收它们的服务器中。这适用于 `onMessage`、`onProgress`、`onInitialized`、`onPromptsListChanged`、`onResourcesListChanged`、`onResourcesUpdated` 和 `onToolsListChanged`。

之前：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const client = new MultiServerMCPClient({
  mcpServers: {
    everything: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-everything"],
    },
  },
  onProgress: (progress, source) => {
    console.log(source.type, progress.progress, progress.total);
  },
});
```

之后：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const adapter = new MCPAdapter({
  servers: {
    everything: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-everything"],
      onProgress: (progress, source) => {
        console.log(source.type, progress.progress, progress.total);
      },
    },
  },
});
```

工具挂钩（`beforeToolCall`、`afterToolCall`）和`onConnectionError` 保留顶级适配器选项。 `onProgress` 回调抛出或拒绝的错误现在将被忽略；在 1.x 中，被拒绝的 Promise 没有得到处理。

### 设置协议模式

现在，每个服务器采用`"auto"`（默认）、`"modern"`或`"legacy"`的`mode`，并独立协商。有关每种模式的作用，请参阅[Protocol eras](/oss/javascript/langchain/mcp/connections#protocol-eras)。

省略 `mode` 自动协商。设置 `mode: "modern"` 以要求现代协议，或设置 `mode: "legacy"` 以跳过探测已知的旧服务器。

这些选项需要设置它们的服务器上的`mode: "legacy"`：

* `onInitialized`
* `automaticSSEFallback`
* HTTP/SSE `reconnect`
* `onElicitation`设置 `automaticSSEFallback` 或 `reconnect` 的 1.x 服务器现在将无法验证，直到您添加 `mode: "legacy"`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const adapter = new MCPAdapter({
  servers: {
    legacy: {
      url: "https://legacy.example.com/sse",
      transport: "sse",
      mode: "legacy", // [!code ++]
      reconnect: { enabled: true, maxAttempts: 3, delayMs: 1000 },
    },
  },
});
```

`"auto"` 或 `"modern"` 模式下的 HTTP 连接不再恢复丢弃的响应流。如果您依赖流恢复，请使用`mode: "legacy"`。

SSE 仍然是传统传输，因此 SSE 服务器拒绝 `mode: "modern"`、`elicitation` 和 `logLevel`。 `"auto"` 模式下的自动 HTTP 到 SSE 回退仅限于 HTTP 404 和 405。

### 期待更严格的验证

* **配置**：Zod 4 验证拒绝未知的适配器和服务器选项、不适用于服务器模式或传输的选项、冲突的传输设置、空服务器映射以及同时设置 `servers` 和 `mcpServers`。重启并重新连接`maxAttempts`必须为非负整数，`delayMs`不得为负数。
* **挂钩**：在`beforeToolCall`和`afterToolCall`中，`state`被输入为`unknown`，因此在使用前将其缩小。参数覆盖必须是对象。合并的参数根据工具的输入架构进行验证，因此添加架构不允许的属性的覆盖会在将任何内容发送到服务器之前导致调用失败，并显示 `ToolException`。

＃＃ 验证* **两个提供者形状**：`authProvider`接受`AuthProvider`（`{ token, onUnauthorized? }`）以及`OAuthClientProvider`。 1.x 仅接受 OAuth 提供商。
* **标头优先级**：一旦提供者拥有令牌，它就优先于配置的 `Authorization` 标头。在此之前，将发送配置的标头。
* **OAuth 回调**：使用具有相同存储的提供程序，通过 SDK 的 `transport.finishAuth(params)` 完成重定向。该适配器没有`finishAuth`。
* **错误**：遍历适配器现在导出的`UnauthorizedError`的身份验证失败的`cause`链，或HTTP 401错误。当传统模式回退到 SSE 时，Discovery 将其包装在`MCPClientError` 中，两次；工具调用将其包装在`ToolException`中。
* **重试**：即使使用 `onConnectionError: "ignore"`，发现也会在下一次调用时重试身份验证失败。
* **覆盖**：工具目录对于不同的标头和提供程序对象是独立的。当提供程序对象背后的帐户发生更改时，重新创建适配器。方法级别 `authProvider` 替换已配置的方法级别，并且方法级别 `headers` 添加到每个服务器的已配置标头中，其中具有相同名称的已配置标头获胜。两者都适用于每个 HTTP/SSE 服务器，即使您仅从一台服务器选择工具也是如此。

有关完整指南，请参阅[Authentication](/oss/javascript/langchain/mcp/auth)。

## 启发启发是 2.0 中的新功能：1.x 没有启发支持。当服务器协商现代协议时，适配器默认将每一轮请求的输入作为一个 LangGraph [⟦T149⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt) 提出，其 `requests` 包含所有问题。请求输入的工具现在会暂停运行。

* **检查点**：工具仅在要求输入时才需要检查点。否则，直接调用仍然有效。
* **恢复**：回答`requests`中的每个键，然后将`createMCPElicitationResume(interrupt, responses)`作为LangGraph`Command`中的`resume`值传递。
* **重播**：恢复从头开始再次运行该工具，包括`beforeToolCall`。确保重复这项工作不会产生重复的副作用。
* **选择退出**：在单个现代服务器上或在 `loadMcpTools` 选项中设置 `elicitation: false`，以保持 1.x 行为。
* **旧服务器**：在具有 `mode: "legacy"` 的服务器上设置 `onElicitation` 处理程序。这个处理程序也是 2.0 中的新增内容。

有关中断负载、应答操作和完整示例，请参阅[Elicitation](/oss/javascript/langchain/mcp/tools#elicitation)。

### 采样和求根

通过这些中断只能回答启发。对 [sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) 或 [roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots) 的请求会使工具调用失败，并显示 `ToolException`，即使它们与引出一起到达也是如此。

## 工具结果* **标准内容块**：工具内容始终是标准的LangChain内容块。图像和音频公开`data`和`mimeType`。默认情况下，1.x 生成带有数据 URL 的 `image_url` 块，以及带有 `mime_type` 的音频块。
* **工件**：路由到工件的块保留其 MCP 格式，包括在 `afterToolCall` 中，它接收完整的工件列表，包括 `mcp_structured_content`、`mcp_meta` 和 `mcp_content` 条目。原始资源块和内容元数据保留在 `mcp_content` 条目中，否则转换会丢失它们。
* **嵌入资源**：转换结果不再获取资源 URI。当您需要获取资源时显式调用`readResource()`。当路由到模型内容时，嵌入的文本资源变成文本块。嵌入的二进制资源根据其 MIME 类型变成图像、音频或文件块。
* **资源链接**：`resource_link`块变成带有`url`、`mimeType`和资源元数据的`file`块。更新 1.x `source_type` 和 `mime_type` 字段的使用者。* **工具错误**：当服务器返回带有 `isError` 的结果时，适配器会为代理的工具调用返回带有 `status: "error"` 的 `ToolMessage`。使用普通参数直接调用仍然会抛出 `ToolException`，MCP 响应为 `error.result`。由于这些结果是返回而不是抛出，因此它们不再触发基于异常的处理，例如 `toolRetryMiddleware` 或 `ToolNode` `handleToolErrors` 函数。检查`ToolMessage.status`（例如在`wrapToolCall`）以重试。服务器的错误文本始终发送到模型，即使 `outputHandling` 将文本路由到工件也是如此。
* **其他失败**：连接和验证失败仍然会从工具中抛出。直接调用该工具会引发异常；在`createAgent`代理中，默认工具错误处理将其转换为带有`status: "error"`的`ToolMessage`。阅读异常的`message`了解详细信息； `cause` 并不总是被设置。
* **Hook 结果**：Hook 保留返回的 `ToolMessage` 和 LangGraph `Command` 对象，而不是压平或拒绝它们。 `afterToolCall` 仅收到成功结果。
* **资源读取**：`readResource()` 保留 SDK 内容元数据。使用 `"text" in content` 或 `"blob" in content` 缩小每个项目的范围。* **结构化内容**：具有单个文本块的结果会变成字符串 `content`，即使它带有 `structuredContent` 或 `_meta`。 1.x 将块与两者一起序列化到内容中，因此模型看到了它们。从 `mcp_structured_content` 和 `mcp_meta` 工件条目中读取它们。
* **工具模式**：工具输入模式在服务器声明它们时到达模型。 1.x 内联 `$ref` 定义和简化的复合模式：合并 `allOf`，扁平化 `anyOf` 和 `oneOf`，并删除 `if`/`then`/`else`、`not`， `$schema`和`unevaluatedProperties`。根据模型提供者检查来自具有复杂模式的服务器的工具。

## 生命周期* **分组发现**：`listToolsets()`返回从服务器名称到工具的映射，并且`listTools()`将其展平。
* **可重复使用关闭**：使用其工具时保持适配器打开，然后等待`close()`。关闭会停止主动发现和挂​​起的重新连接，并清除连接和缓存。发现新的工具以在事后重复使用适配器。
* **发现缓存**：`listTools([], { cacheMode: "refresh" })`刷新发现； `cacheMode: "bypass"` 跳过缓存。刷新失败可使之前返回的工具保持可用。
* **资源列表**：`listResources()` 和 `listResourceTemplates()` 现在会引发服务器错误，其中 1.x 对于出现故障的服务器返回 `[]`，并仅在 `DEBUG` 下记录错误。没有资源模板的服务器仍将它们列为`[]`。
* **重新连接失败**：耗尽的后台 stdio 重新启动尝试现在通过 `onConnectionError` 回调进行报告。

## 另请参阅

* [Model Context Protocol (MCP)](/oss/javascript/langchain/mcp)
* [Connections](/oss/javascript/langchain/mcp/connections)
* [Authentication](/oss/javascript/langchain/mcp/auth)
* [Tools](/oss/javascript/langchain/mcp/tools)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/migrate/langchain-mcp-adapters.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>