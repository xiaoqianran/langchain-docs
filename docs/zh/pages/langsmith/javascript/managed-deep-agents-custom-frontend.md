<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a custom frontend for a Managed Deep Agent | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-custom-frontend -->

# 为托管深度代理构建自定义前端

从您自己的浏览器或服务器应用程序调用托管 Deep Agents 部署，而不是通过通道或 LangSmith Studio 访问代理。

自定义前端是您编写的任何直接调用部署而不是通过 [channel](/langsmith/javascript/managed-deep-agents-channels) 或 [LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development#start-local-studio) 到达代理的应用程序。当代理属于您控制的产品界面（例如支持控制台、内部仪表板或面向客户的聊天页面）时，请使用其中之一。

托管 Deep Agents 部署在 [LangSmith Agent Server](/langsmith/agent-server-overview) 上运行。前端与每个代理服务器客户端使用的相同线程、运行和流端点进行通信。

> [!注意]
>
> 托管 Deep Agents 于 [LangSmith Cloud](/langsmith/cloud) **公开 [beta](/langsmith/release-stages)**。

## 选择身份提供商

对部署的每个请求都会命名一个调用者，并且前端提供该名称。哪个[identity provider](/langsmith/javascript/managed-deep-agents-identity)适合取决于前端代码运行的位置，而不是其编写的语言。|前端从哪里调用部署 |身份提供商|
| - | - |
|用户的浏览器 |外部身份验证提供者。浏览器发送访问令牌，部署会验证它。参见[Supabase](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-supabase)。 |
|您自己的服务器，已对用户进行身份验证 | [Your own backend](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-your-own-backend)。您的服务器断言共享入口机密背后的用户 ID。 |
|您自己的服务器，没有自己的最终用户帐户 | [LangSmith API key](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-a-langsmith-api-key) 默认值。密钥本身就是调用者。 |

任一服务器行都适合任何语言的服务器渲染应用程序。 Streamlit、Gradio 和 Dash 在服务器上运行其代码，Next.js 路由处理程序和 Express 代理也是如此。指向 [⟦T3⟧](/langsmith/javascript/managed-deep-agents-local-development#understand-local-behavior) 的前端在您配置提供程序之前运行，因为本地服务器提供测试用户。

> [!警告]
>
> LangSmith API 密钥可到达工作区中的每个资源，而不仅仅是此部署，因此它绝不能在浏览器 JavaScript 中发布。当浏览器直接调用部署时使用外部身份验证提供程序，当您自己的服务器代表用户调用它时使用后端身份。

## 连接到部署

前端需要两个值。**部署 API URL。** `mda deploy` 打印 LangSmith 部署仪表板 URL，而不是 API URL。打开该仪表板，然后从部署详细信息视图中复制 **API URL**。由 [⟦T5⟧](/langsmith/javascript/managed-deep-agents-local-development) 启动的本地服务器在 CLI 打印的 URL 处提供相同的路由。

**助理ID。** 客户端从[agent definition](/langsmith/javascript/managed-deep-agents-agent-definition#parameters)传递代理的`name`。 Managed Deep Agents 也使用该名称作为图形 ID：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

export const agent = defineDeepAgent({
  name: "research-assistant", // [!code highlight]
  model: "openai:gpt-5.5",
});
```

客户端使用相同的字符串对名为 `research-assistant` 的代理进行寻址。重命名代理会更改客户端发送的值，因此请将名称视为部署公共接口的一部分。

## 构建一个 Web 前端

[LangChain frontend SDKs](/oss/javascript/langchain/frontend/overview) 将浏览器应用程序连接到代理服务器部署。 `useStream` 将消息、工具调用、中断和线程状态公开为反应值：

|框架|套餐 |切入点|
| - | - | - |
|反应 | `@langchain/react` | `useStream` |
|视图 | `@langchain/vue` | `useStream` |
|苗条| `@langchain/svelte` | `useStream` |
|角度| `@langchain/angular` | `injectStream` |

前端在浏览器中运行，因此即使代理是用 Python 编写的，这些示例也是 TypeScript。

在外部身份验证提供程序下，浏览器从登录会话发送访问令牌。该令牌会轮换，因此只要会话发生变化就重新读取它，而不是在挂载时捕获它一次：```ts useAuthHeaders.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useEffect, useState } from "react";

import { supabase } from "./supabase";

export function useAuthHeaders() {
  const [headers, setHeaders] = useState<Record<string, string>>();

  useEffect(() => {
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      setHeaders(token ? { Authorization: `Bearer ${token}` } : undefined);
    };

    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => void refresh()); // [!code highlight]
    return () => data.subscription.unsubscribe();
  }, []);

  return headers;
}
```

突出显示的订阅会在登录、注销和令牌刷新时触发。如果没有它，挂钩将保存在挂载时捕获的令牌，一旦该令牌过期，请求就会开始失败并返回 401。

将流指向部署 API URL、代理名称和这些标头：

```tsx Chat.tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";
import { useState } from "react";

import { useAuthHeaders } from "./useAuthHeaders";

export function Chat() {
  const [input, setInput] = useState("");
  const headers = useAuthHeaders();
  const stream = useStream({
    apiUrl: import.meta.env.VITE_DEPLOYMENT_API_URL,
    assistantId: "research-assistant",
    defaultHeaders: headers,
  });

  return (
    <main>
      {stream.messages.map((message) => (
        <p key={message.id}>{message.text}</p>
      ))}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          stream.submit({ messages: [{ type: "human", content: input }] });
          setInput("");
        }}
      >
        <input value={input} onChange={(event) => setInput(event.target.value)} />
        <button type="submit" disabled={stream.isLoading}>
          Send
        </button>
      </form>
    </main>
  );
}
```

在后端身份下，浏览器永远不会到达部署。将 `apiUrl` 指向您自己的服务器，并从那里转发代理服务器路由，并在每个上游请求上标记 `x-mda-ingress-secret` 和您的身份验证层解析的用户 ID。有关标头和共享密钥，请参阅[Configure identity with your own backend](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-your-own-backend)。

相同的前端模式适用于托管 Deep Agents 部署。请参阅 [tool-call rendering](/oss/javascript/langchain/frontend/tool-calling)、[generative UI](/oss/javascript/langchain/frontend/generative-ui-overview)、[human-in-the-loop approval](/oss/javascript/langchain/frontend/human-in-the-loop)、[queued submissions](/oss/javascript/langchain/frontend/message-queues) 和 [durable rejoin](/oss/javascript/langchain/frontend/join-rejoin)。

### 处理授权中断

当代理需要调用者未授予的[user-owned connection](/langsmith/javascript/managed-deep-agents-connections)时，运行会暂停，并且`stream.interrupt`携带凭证门有效负载。浏览器前端呈现同意链接并以 `stream.respond` 继续。有关有效负载形状和工作示例，请参阅[Handle the authorization interrupt](/langsmith/javascript/managed-deep-agents-connections#handle-the-authorization-interrupt)。

## 另请参阅* [Identity](/langsmith/javascript/managed-deep-agents-identity)：配置调用者如何对部署进行身份验证。
* [Frontend overview](/oss/javascript/langchain/frontend/overview)：消息渲染、工具调用、中断和生成式 UI 模式。
* [Connections](/langsmith/javascript/managed-deep-agents-connections)：处理 UI 中的凭证授权中断。
* [MCP endpoint](/langsmith/javascript/managed-deep-agents-mcp-endpoint)：将代理暴露给MCP客户端而不是调用API。
* [Channels](/langsmith/javascript/managed-deep-agents-channels)：从 Slack 或您自己的 HTTP 服务到达代理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-custom-frontend.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。