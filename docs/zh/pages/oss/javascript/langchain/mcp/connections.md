<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connections | https://docs.langchain.com/oss/javascript/langchain/mcp/connections -->

# Connections

LangChain 中的连接生命周期、多服务器、部署扩展、协议时代和 MCP 缓存。

[⟦T5⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter) 发现 MCP 工具并保持其连接打开，以便您的代理可以在呼叫中重复使用它们。使用 `listTools()` 或 `listToolsets()` 发现工具，并在应用程序使用完它们后关闭适配器。

选择适配器保持打开状态的时间：

|情况|图案|前往 |
| - | - | - |
|脚本或代理调用 |创建适配器，运行代理，然后在 `finally` | 中关闭[Connection lifecycle](#connection-lifecycle) |
|长寿工人|重复使用一个适配器并在关机期间将其关闭 | [Scale a deployment](#scale-a-deployment) |

有关每个服务器的连接选项，请参阅[Transports](/oss/javascript/langchain/mcp#transports)。

## 连接生命周期

构建适配器可在不打开连接的情况下验证其配置。 `listTools()`、`listToolsets()`、`getClient()` 以及资源方法在运行发现时进行连接。当您的代理使用这些工具时，请保持适配器打开。

要发现工具、运行代理并释放连接，请将 MCP 服务器的 HTTP URL 传递到 `runAgent`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

async function runAgent(serverUrl: string) {
  const adapter = new MCPAdapter({
    servers: { weather: { url: serverUrl } },
  });

  try {
    const tools = await adapter.listTools();
    const agent = createAgent({
      model: "claude-sonnet-5",
      tools,
    });
    const result = await agent.invoke({
      messages: [{ role: "user", content: "What is the weather in Oslo?" }],
    });
    console.log(result.messages.at(-1)?.text);
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/54f2fa78-9b4c-445a-94a2-27f4cdaa4e67/r">
  为此示例打开公共 LangSmith 运行。
</Card>`close()` 中止正在进行的适配器工作、关闭其连接并清除其缓存。您可以再次调用`listTools()`打开新的连接，但使用新返回的工具。先前退回的工具保留其已关闭的客户。

## 多个服务器

`servers` 中的每个命名条目都有自己的连接、身份验证和[protocol mode](#protocol-eras)。一个适配器可以连接到 HTTP 和 stdio 服务器。

要从两种传输方式发现工具，请将日历服务器的 HTTP URL 和文件服务器的脚本路径传递给 `listServerTools`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";

async function listServerTools(calendarUrl: string, filesServerPath: string) {
  const adapter = new MCPAdapter({
    servers: {
      calendar: { url: calendarUrl },
      files: { command: "node", args: [filesServerPath] },
    },
  });

  try {
    const toolsets = await adapter.listToolsets();
    console.log(toolsets.calendar.map((tool) => tool.name));

    const fileTools = await adapter.listTools("files");
    console.log(fileTools.map((tool) => tool.name));
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/637a53d2-a23e-4691-b70c-7bf3d8de9755/r">
  为此示例打开公共 LangSmith 运行。
</Card>

`listToolsets()` 按服务器名称对工具进行分组。 `listTools()` 返回一个数组；传递服务器名称或名称数组来选择它返回的工具。选择会过滤结果，但发现仍然会联系每个已配置的服务器。未选择的服务器出现故障可能会使呼叫失败。

默认情况下，适配器会为其工具名称添加服务器名称前缀，例如 `calendar_search` 和 `files_search`。设置 `prefixToolNameWithServerName: false` 以保留原始名称。如果所选工具包含重复名称，则`listTools()`抛出异常。OpenAI 和 Anthropic 工具名称 (`^[a-zA-Z0-9_-]+$`) 中仅接受字母、数字、`_` 和 `-`，OpenAI 最多 64 个字符，Anthropic 最多 128 个字符。适配器不会重命名违反这些限制的前缀名称，因此请保持服务器名称简短且不含点和空格。

在顶层设置`defaultToolTimeout`（以毫秒为单位），将其应用于每个服务器的工具；它战胜了服务器自己的`defaultToolTimeout`。

## 扩展部署

在图工厂之外的模块范围内创建适配器。每个工厂调用都可以发现当前的工具目录并使用共享连接构建代理：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

const servers = {
  weather: { url: "https://example.com/mcp" },
};
const adapter = new MCPAdapter({ servers });

export async function makeGraph() {
  const tools = await adapter.listTools([], { cacheMode: "refresh" });
  return createAgent({
    model: "claude-sonnet-5",
    tools,
  });
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/d5c9bc74-bbab-4f0f-97bd-e9982ee4b050/r">
  为此示例打开公共 LangSmith 运行。
</Card>

在运行过程中保持适配器打开。在活动运行完成后，在应用程序关闭期间关闭它。对于使用不同用户凭据的运行，请参阅[Per-user authentication](/oss/javascript/langchain/mcp/auth#per-user-authentication)。

默认情况下，发现会引发连接失败。设置`onConnectionError: "ignore"`，或提供正常返回的回调，以继续其余服务器。即使使用`cacheMode: "refresh"`，非身份验证失败也会在以后的发现中跳过该连接。关闭适配器以清除跳过的连接，然后再次发现。身份验证失败将在下次发现时重试。Stdio 服务器支持 `restart` 设置，HTTP 和 SSE 服务器在配置 `mode: "legacy"` 时支持 `reconnect` 设置。重启后，再次调用`listTools()`，使用返回的工具；重新启动之前返回的工具保持关闭的连接。

现代 MCP 服务器不保留会话，因此它们的副本可以在任何负载均衡器后面运行。会话遗留服务器仍然需要到一个副本的粘性路由。运行多个副本的现代服务器必须在它们之间共享一个`requestState`签名密钥，否则到达不同副本的引出答案将被拒绝。请参阅 MCP TypeScript SDK 文档中的 [Protect ⟦T35⟧ with the codec](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/servers/input-required.md#protect-requeststate-with-the-codec)。

## 缓存

MCP SDK 为工具列表提供内存缓存。重复发现可以避免网络请求，同时服务器的 `ttlMs` 提示仍然有效。如果没有肯定的`ttlMs`，发现会再次获取列表。

使用`cacheMode`控制`listTools()`和`listToolsets()`如何读取响应缓存：

* **`"use"`**（默认）：当可用时提供有效的缓存工具列表，否则获取并存储它。
* **`"refresh"`**：获取新的工具列表并更新缓存。
* **`"bypass"`**：获取新的工具列表，而不读取或更新响应缓存。要从所有已配置的服务器刷新工具，请传递空的服务器选择数组和发现选项：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const tools = await adapter.listTools([], { cacheMode: "refresh" });
```

当服务器描述符未更改时，适配器还会重用转换后的LangChain工具包装器。重新发现返回当前工具；它不会更新现有代理的工具列表。使用返回的工具构建下一个代理。

## 协议时代

适配器为每个服务器单独协商 MCP 协议。默认的 `mode: "auto"` 支持同一适配器中的现代和传统服务器。

传统时代从`initialize`握手开始。现代时代使用`server/discover`来发现服务器功能。当您需要特定时代时覆盖`mode`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";

async function listToolsAcrossEras(modernUrl: string, legacyUrl: string) {
  const adapter = new MCPAdapter({
    servers: {
      current: { url: modernUrl, mode: "modern" },
      legacy: { url: legacyUrl, mode: "legacy" },
    },
  });

  try {
    const tools = await adapter.listTools();
    console.log(tools.map((tool) => tool.name));
  } finally {
    await adapter.close();
  }
}
```

每个服务器的`mode`独立控制其协商：

* **`"auto"`**（默认）：尝试当前协议并回退到仅旧服务器。
* **`"modern"`**：需要协议版本 `2026-07-28` 并失败，而不是使用旧版 MCP。
* **`"legacy"`**：跳过现代探测并使用旧版客户端界面。在 `"auto"` 模式下，通过 SSE 在相同的 URL 上重试使用 404 或 405 应答 Streamable HTTP 请求的 URL 服务器，然后将尾随的 `/mcp` 替换为 `/sse`。在 `"legacy"` 模式下，任何 4xx 都会回退，除非 `automaticSSEFallback: false`。

`setLoggingLevel()` 是遗留的，当连接的服务器协商现代协议时抛出；在每个现代服务器上设置`logLevel`。

## 另请参阅

* [Authentication](/oss/javascript/langchain/mcp/auth)：承载、OAuth 和每用户凭据。

* [Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop)：暂停和恢复工具调用。

* [MCP specification](https://modelcontextprotocol.io/specification/latest)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/connections.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>