<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authentication | https://docs.langchain.com/oss/javascript/langchain/mcp/auth -->

# 认证

使用不记名令牌、OAuth 2.1 或 LangChain 中的每用户凭据对 MCP 连接进行身份验证。

大多数远程 MCP 服务器需要身份验证。 `servers` 下的每个 HTTP 或 SSE 服务器都有自己的 `authProvider` 和 `headers`，`MCPAdapter` 将提供程序对象按原样交给 MCP SDK 传输，并随每个请求发送标头。 Stdio 服务器两者都不采用。使用 [header or token provider](#bearer-token) 作为您的应用程序管理的凭据，或使用 [OAuth client provider](#oauth-authentication) 作为 OAuth 2.1。当每次运行都应作为其调用者到达服务器时，请使用 [per-user authentication](#per-user-authentication)。

> [!注意]
>
> 此页面需要 `@langchain/mcp-adapters` 2.0 或更高版本。如果您从 1.x 升级，请参阅 [migration guide](/oss/javascript/migrate/langchain-mcp-adapters#authentication)。

## 不记名令牌

对于固定 API 密钥，请发送静态 `Authorization` 标头。对于您的应用程序发行或轮换的令牌，请将 `AuthProvider` (`{ token, onUnauthorized? }`) 作为 `authProvider` 传递。

该示例使用应用程序提供的`tokenStore`。实现`current()`来读取令牌，并实现`refresh()`来保存较新的令牌并报告是否成功。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter, UnauthorizedError } from "@langchain/mcp-adapters";

const adapter = new MCPAdapter({
  servers: {
    // A fixed API key, sent as a header.
    search: {
      url: "https://search.example.com/mcp",
      headers: { Authorization: `Bearer ${process.env.SEARCH_API_KEY}` },
    },
    // A token your app issues and rotates.
    crm: {
      url: "https://crm.example.com/mcp",
      authProvider: {
        token: async () => tokenStore.current(),
        onUnauthorized: async () => {
          // Throw when no newer token exists: over SSE, the SDK calls this
          // again every time a reconnect is rejected.
          if (!(await tokenStore.refresh())) {
            throw new UnauthorizedError("No newer token for the CRM server");
          }
        },
      },
    },
  },
});
```

* **`token()`**：在每个请求之前运行并返回当前令牌。
* **`onUnauthorized()`**：可选。在请求重试一次之前，在 401 上运行。通过 SSE，每次重新连接被拒绝时，SDK 都会再次调用它，没有上限。当您没有更新的令牌时，抛出`UnauthorizedError`。如果没有`onUnauthorized`，401 与 SDK 的 `UnauthorizedError` 连接失败。参见[Handle authentication errors](#handle-authentication-errors)。

每个指定服务器都会打开自己的连接，因此一个适配器中的服务器独立进行身份验证，正如本示例中的两台服务器所做的那样。

适配器重新导出 `AuthProvider` 和 `OAuthClientProvider` 类型，因此您可以在不导入 SDK 的情况下键入提供程序。

## OAuth 认证

OAuth 允许用户授权您的应用程序访问 MCP 服务器。将 `OAuthClientProvider` 传递为 `authProvider`。 SDK 处理发现、客户端注册、代码交换和令牌刷新。您的应用程序提供提供者的存储、浏览器重定向和回调处理程序。

添加 `@modelcontextprotocol/client` 2.2.0 或更高版本作为直接依赖项。适配器依赖于相同的范围，因此您的应用程序和适配器共享一份 SDK 副本。回调传输，`SdkHttpError`和`SseError`来自它。使用 SDK 的 [OAuth client guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/clients/oauth.md) 实现您的提供程序。为您的回调路由配置其`redirectUrl`，并存储客户端信息、令牌、PKCE 验证程序和发现状态。包含 `invalidateCredentials()`，因此拒绝的刷新凭据可以触发新的登录。对于每个用户和 MCP 服务器，将每个提供程序及其存储分开。下面的示例还将每个挂起的登录绑定到经过身份验证的应用程序会话。从应用程序的会话中间件读取用户和会话 ID，而不是从回调查询参数中读取。

下面的 `createMcpSession()` 帮助器连接了这些步骤：

1. 调用`listTools()`发现工具。如果需要登录，则将用户的浏览器重定向到返回的`authorizationUrl`。
2. 在您的回拨路线中，在同一会话中拨打`completeLogin()`。它在交换代码之前检查调用者并消耗待处理的`state`。
3. 使用退回的工具。交换后，助手会使用保存的令牌重试发现。

> **会话助手**
>
> 此示例在一个 Node.js 进程中保留挂起的登录状态。对于多个进程或重新启动，请使用有期限的共享存储。检查状态、用户、会话和服务器，并在一个原子操作中使用记录。 SDK 不验证`state`。
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { randomUUID } from "node:crypto";
> import {
>   MCPAdapter,
>   MCPClientError,
>   UnauthorizedError,
>   type OAuthClientProvider,
> } from "@langchain/mcp-adapters";
> import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
>
> function createMcpSession(
>   serverUrl: string,
>   userId: string,
>   sessionId: string,
>   authProvider: OAuthClientProvider,
> ) {
>   let pendingState: string | undefined;
>   let authorizationUrl: URL | undefined;
>
>   authProvider.state = () => (pendingState = randomUUID());
>   authProvider.redirectToAuthorization = (url) => {
>     authorizationUrl = url;
>   };
>
>   const adapter = new MCPAdapter({
>     servers: { crm: { url: serverUrl, authProvider } },
>   });
>
>   function causedByUnauthorized(error: unknown): boolean {
>     // Discovery wraps UnauthorizedError in MCPClientError, and wraps it
>     // again when an HTTP connection falls back to SSE. Walk a few hops.
>     let current: unknown = error;
>     for (let depth = 0; depth <= 3; depth += 1) {
>       if (UnauthorizedError.isInstance(current)) return true;
>       if (!(current instanceof Error)) return false;
>       current = current.cause;
>     }
>     return false;
>   }
>
>   async function listTools() {
>     // Reuse the pending login instead of starting another redirect.
>     if (authorizationUrl) return { authorizationUrl };
>     try {
>       return { tools: await adapter.listTools() };
>     } catch (error) {
>       if (
>         MCPClientError.isInstance(error) &&
>         causedByUnauthorized(error) &&
>         authorizationUrl
>       ) {
>         return { authorizationUrl };
>       }
>       throw error;
>     }
>   }
>
>   async function completeLogin(
>     callbackUrl: URL,
>     callbackUserId: string,
>     callbackSessionId: string,
>   ) {
>     const params = callbackUrl.searchParams;
>     if (
>       callbackUserId !== userId ||
>       callbackSessionId !== sessionId ||
>       !pendingState ||
>       params.get("state") !== pendingState
>     ) {
>       throw new Error("Invalid OAuth callback");
>     }
>     // No await between checking and consuming state: only one callback wins.
>     pendingState = undefined;
>
>     const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
>       authProvider,
>     });
>     try {
>       await transport.finishAuth(params);
>     } catch {
>       // SDK errors can contain text supplied by the authorization server.
>       throw new Error("OAuth login failed");
>     } finally {
>       authorizationUrl = undefined;
>       await transport.close();
>     }
>     return listTools();
>   }
>
>   return { listTools, completeLogin, close: () => adapter.close() };
> }
> ```

要开始发现，请传递您的提供商和经过身份验证的调用者的身份：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const crm = createMcpSession(
  "https://crm.example.com/mcp",
  userId,
  sessionId,
  authProvider,
);
const result = await crm.listTools();
// If result.authorizationUrl is present, redirect the browser there.
// Otherwise, pass result.tools to your agent.
```

保持 `crm` 可用于该应用程序的会话，直到回调完成。不要与其他会话共享其提供程序。### 完成重定向

用户登录后，授权服务器重定向到您的提供商的`redirectUrl`。在该路由中，检索相同的 `crm` 实例以及调用者经过验证的用户和会话 ID，然后完成登录：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result = await crm.completeLogin(new URL(req.url, "http://localhost"), userId, sessionId);
// The helper exchanges the code and retries discovery using saved tokens.
// Pass result.tools to your agent, or redirect if another login is required.
```

帮助程序将完整查询传递给 `finishAuth()`，以便 SDK 可以验证授权服务器的 `iss` 参数。它拒绝交换之前丢失、不匹配或已消耗的状态。使用其工具时保持适配器打开，然后在应用程序会话结束时调用`await crm.close()`。

对于配置了 `transport: "sse"` 的服务器，请在回调帮助器中使用 `SSEClientTransport`。对于无需用户的机器对机器访问，请使用 SDK 的 `ClientCredentialsProvider` 而不是浏览器登录。

## 处理身份验证错误

因凭据而被拒绝的连接会抛出 `MCPClientError`。 SDK 错误位于其 `cause` 链下一层，或者当 HTTP 连接回退到 SSE 时位于两层。此示例遍历几个级别并处理由于以下任一原因导致的 HTTP 身份验证失败：* **`UnauthorizedError`**：SDK无法自行恢复。需要 OAuth 登录，或者令牌提供商没有 `onUnauthorized`。
* **HTTP 401**（通过 SSE 的 `SdkHttpError` 和 `status: 401`，或 `SseError` 和 `code: 401`）：服务器拒绝凭据，或者未提供任何凭据。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPClientError, UnauthorizedError } from "@langchain/mcp-adapters";
import { SdkHttpError, SseError } from "@modelcontextprotocol/client";

function authFailure(error: unknown): "login" | "rejected" | undefined {
  if (!MCPClientError.isInstance(error)) return undefined;

  let current: unknown = error;
  for (let depth = 0; depth <= 3; depth += 1) {
    if (UnauthorizedError.isInstance(current)) return "login";
    if (SdkHttpError.isInstance(current) && current.status === 401)
      return "rejected";
    if (SseError.isInstance(current) && current.code === 401)
      return "rejected";
    if (!(current instanceof Error)) return undefined;
    current = current.cause;
  }
  return undefined;
}
```

适配器重新导出`UnauthorizedError`。从 `@modelcontextprotocol/client` 导入 `SdkHttpError` 和 `SseError`。 `MCPClientError` 消息包含 SDK 的错误文本，因此请将其记录下来而不是向用户显示。

当服务器在工具调用期间拒绝凭据时，该工具会失败并显示 `ToolException`。在 `createAgent` 下，模型将其视为错误消息并继续运行。

即使 `onConnectionError` 跳过失败的服务器，发现也会在下次调用时重试由 `UnauthorizedError` 或 HTTP 401 导致的失败。稍后登录即可恢复，无需重新创建适配器。来自 `token()` 或 `onUnauthorized()` 的其他错误（例如失败的令牌存储请求）不计为身份验证失败。当 `onConnectionError` 在发生这些错误之一后跳过连接时，该连接将保持阻塞状态，直到 `close()` 清除它。

## 标头优先级

一旦提供者拥有令牌，它就会替换配置的 `Authorization` 标头。在此之前，标头已发送，因此静态 API 密钥可以回退到 OAuth。SDK 还将静态 `Authorization` 标头转发到授权服务器的发现、注册和令牌端点，而不仅仅是 MCP 服务器。不要将秘密 API 密钥与其授权服务器位于另一个源的 OAuth 提供程序配对。

## 每用户身份验证

在部署中，每次运行都应以启动它的用户身份到达 MCP 服务器，而不是使用一个共享凭据。在`listTools()`、`listToolsets()`、`getClient()`的选项或资源方法（`listResources()`、`listResourceTemplates()`和`readResource()`）中传递`authProvider`或`headers`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter, type AuthProvider } from "@langchain/mcp-adapters";

// A single-server adapter, because each user brings a different credential.
const crm = new MCPAdapter({
  servers: { crm: { url: "https://crm.example.com/mcp" } },
});

// Reuse one provider object per user: each object opens its own connection.
const providers = new Map<string, AuthProvider>();

function providerFor(userId: string): AuthProvider {
  let provider = providers.get(userId);
  if (!provider) {
    provider = { token: async () => tokenFor(userId) };
    providers.set(userId, provider);
  }
  return provider;
}

const tools = await crm.listTools(["crm"], {
  authProvider: providerFor(userId),
});
```

在此示例中，实现 `tokenFor(userId)` 来检索经过身份验证的用户的令牌。

返回的工具通过该用户的连接调用服务器。这些规则适用于方法级身份验证：* **适配器范围覆盖**：方法选项中的 `authProvider` 或 `headers` 适用于适配器拥有的每个 HTTP 和 SSE 服务器，而不仅仅是您指定的服务器。当不同的用户需要不同的凭据时，请使用单服务器适配器。
* **标头优先级**：服务器配置的标头优先于同名方法级标头，无论大小写如何。传递每个用户 `Authorization` 标头时，请从服务器配置中忽略该标头。提供者令牌仍然优先于任一标头。
* **每个提供者对象一个连接**：每个不同的提供者对象都有自己的连接，一直保留到`close()`。每个用户重用一个提供程序对象，而不是每次调用创建一个提供程序对象。
* **隔离目录**：目录由提供者对象和标头作为键控，因此一个用户永远不会收到另一用户的缓存工具列表。当同一提供者对象背后的帐户发生更改时，重新创建适配器。

从传入请求中解析用户，例如使用 LangGraph 服务器上的 [custom auth handler](/langsmith/auth)。

## 另请参阅

* [Migrate to ⟦T83⟧ 2.0](/oss/javascript/migrate/langchain-mcp-adapters)
* [MCP authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization)
* [MCP TypeScript SDK OAuth client guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/clients/oauth.md)
* [Custom authentication for a LangGraph server](/langsmith/auth)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。