<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a custom frontend for a Managed Deep Agent | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-custom-frontend -->

# 为托管深度代理构建自定义前端

使用 LangChain 前端 SDK 和 LangGraph SDK 从您自己的 Web 或 Python 应用程序调用托管 Deep Agents 部署。

自定义前端是您编写的任何直接调用部署而不是通过 [channel](/langsmith/javascript/managed-deep-agents-channels) 或 [LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development#start-local-studio) 到达代理的应用程序。当代理属于您控制的产品界面（例如支持控制台、内部仪表板或面向客户的聊天页面）时，请使用其中之一。

托管 Deep Agents 部署在 [LangSmith Agent Server](/langsmith/agent-server-overview) 上运行，因此前端与每个代理服务器客户端使用的相同线程、运行和流端点进行通信。代理方面没有任何改变来支持这一点。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

## 选择身份模式

前端代码的运行位置决定了它可以使用哪种 [identity](/langsmith/javascript/managed-deep-agents-identity) 模式。 LangSmith API 密钥授予对整个工作区的访问权限，因此它绝不能到达浏览器。|前端 |凭证存在于 |身份模式|
| - | - | - |
|浏览器应用程序（React、Vue、Svelte、Angular）|用户的浏览器 | [Supabase](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-supabase) |
|转发浏览器请求的服务器路由或代理 |您的服务器 | [LangSmith API key](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-a-langsmith-api-key) 或 [your own backend](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-your-own-backend) |
| Python 应用程序（Streamlit、Gradio、Dash）|您的服务器 | LangSmith API 密钥 |
| `mda dev` 本地开发 |无需任何凭证 |任何|

通过后端身份，浏览器永远不会调用部署。您的 API 对用户进行身份验证，然后使用入口密钥调用部署。 Supabase 和后端身份还为每个登录用户提供私有线程。 API 密钥默认情况并非如此：持有密钥的每个调用者共享相同的线程空间。

> [!警告]
>
> 任何拥有 LangSmith API 密钥的人都可以访问部署和工作区中的所有其他资源。在浏览器 JavaScript 中发布一个，会将其暴露给每个访问者。当浏览器调用部署时，使用Supabase。否则，将凭据保留在服务器路由浏览器调用上。

## 连接到部署

前端需要两个值。**部署 API URL。** `mda deploy` 打印 LangSmith 部署仪表板 URL，而不是 API URL。打开该仪表板，然后从部署详细信息视图中复制 **API URL**。由 [⟦T7⟧](/langsmith/javascript/managed-deep-agents-local-development) 启动的本地服务器在 CLI 打印的 URL 处提供相同的路由。

**助理 ID。** 客户端从 [agent definition](/langsmith/javascript/managed-deep-agents-agent-definition#parameters) 传递代理的 `name`，托管 Deep Agents 也用作图 ID：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

export const agent = defineDeepAgent({
  name: "research-assistant", // [!code highlight]
  model: "openai:gpt-6.1-sol",
});
```

客户将名为 `research-assistant` 的代理地址称为 `assistantId: "research-assistant"`。重命名代理会更改客户端发送的值，因此请将名称视为部署公共接口的一部分。

## 构建一个 Web 前端

[LangChain frontend SDKs](/oss/javascript/langchain/frontend/overview) 将浏览器应用程序连接到代理服务器部署。 `useStream` 将消息、工具调用、中断和线程状态公开为反应值：

|框架|套餐 |切入点|
| - | - | - |
|反应 | `@langchain/react` | `useStream` |
|视图 | `@langchain/vue` | `useStream` |
|苗条 | `@langchain/svelte` | `useStream` |
|角度| `@langchain/angular` | `injectStream` |

前端是一个 Web 应用程序，因此无论代理是用 Python 还是 TypeScript 编写的，这些示例都是 TypeScript。

将挂钩指向部署 API URL 和代理名称：

```tsx Chat.tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { useStream } from "@langchain/react";
import { useState } from "react";

export function Chat() {
  const [input, setInput] = useState("");
  const stream = useStream({
    apiUrl: import.meta.env.VITE_DEPLOYMENT_API_URL,
    assistantId: "research-assistant",
    defaultHeaders: { Authorization: `Bearer ${accessToken}` },
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
````defaultHeaders` 携带登录用户从您的身份验证流程获取的 Supabase 访问令牌。对于默认 API 密钥，请传递 `apiKey`，SDK 将其作为 `x-api-key` 发送。仅通过在服务器上运行的代码执行此操作。

这些模式不变地适用于托管 Deep Agents 部署：[tool-call rendering](/oss/javascript/langchain/frontend/tool-calling)、[generative UI](/oss/javascript/langchain/frontend/generative-ui-overview)、[human-in-the-loop approval](/oss/javascript/langchain/frontend/human-in-the-loop)、[queued submissions](/oss/javascript/langchain/frontend/message-queues) 和 [durable rejoin](/oss/javascript/langchain/frontend/join-rejoin)。

### 处理授权中断

当代理需要调用者未授予的[user-owned connection](/langsmith/javascript/managed-deep-agents-connections)时，运行会暂停，并且`stream.interrupt`携带凭证门有效负载。浏览器前端呈现同意链接并以 `stream.respond` 继续。有关有效负载形状和工作示例，请参阅[Handle the authorization interrupt](/langsmith/javascript/managed-deep-agents-connections#handle-the-authorization-interrupt)。

## 构建一个 Python 前端

Streamlit、Gradio 和 Dash 在服务器上渲染，因此 LangSmith API 密钥不会出现在浏览器中，并且 API 密钥默认即可工作，无需额外设置。这三个都使用相同的 [LangGraph SDK](https://reference.langchain.com/python/langgraph-sdk) 客户端，因此下面的连接代码适用于其中任何一个。

将 SDK 与您的应用程序框架一起安装：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add langgraph-sdk streamlit
```

创建一个客户端，然后针对线程流式运行：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk import get_sync_client

client = get_sync_client(
    url=DEPLOYMENT_API_URL,
    api_key=LANGSMITH_API_KEY,
)

thread = client.threads.create()

for chunk in client.runs.stream(
    thread["thread_id"],
    "research-assistant",
    input={"messages": [{"role": "user", "content": "Summarize this week's incidents."}]},
    stream_mode="messages",
):
    ...
```

三个细节控制着循环的行为方式：* **`api_key`**：设置`x-api-key`标头。通过 `headers={"x-api-key": ...}` 反而会引发 `ValueError: Cannot set reserved header 'x-api-key'`。
* **环境回退**：当省略`api_key`时，客户端尝试`LANGGRAPH_API_KEY`，然后`LANGSMITH_API_KEY`，然后`LANGCHAIN_API_KEY`。对于 Supabase 或后端身份，显式传递 `api_key=None` 并将令牌放入 `headers` 中，或者杂散环境变量附加第二个凭据。
* **`messages/partial`**：携带到目前为止的整个消息，而不是增量。替换每个事件上呈现的文本而不是附加，否则输出会重复。

### 流式传输至 Streamlit 聊天

该应用程序为每个浏览器会话保留一个线程，并在每个事件到达时重写助手气泡：

```python app.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import streamlit as st
from langgraph_sdk import get_sync_client

ASSISTANT_ID = "research-assistant"


@st.cache_resource
def get_agent_client():
    return get_sync_client(
        url=os.environ["DEPLOYMENT_API_URL"],
        api_key=os.environ["LANGSMITH_API_KEY"],
    )


def text_of(message):
    return "".join(
        block.get("text", "")
        for block in message.get("content", [])
        if block.get("type") == "text"
    )


client = get_agent_client()

if "thread_id" not in st.session_state:
    st.session_state.thread_id = client.threads.create()["thread_id"]
    st.session_state.history = []

for role, text in st.session_state.history:
    st.chat_message(role).markdown(text)

if prompt := st.chat_input("Message the agent"):
    st.session_state.history.append(("user", prompt))
    st.chat_message("user").markdown(prompt)

    with st.chat_message("assistant"):
        placeholder = st.empty()
        answer = ""
        for chunk in client.runs.stream(
            st.session_state.thread_id,
            ASSISTANT_ID,
            input={"messages": [{"role": "user", "content": prompt}]},
            stream_mode="messages",
        ):
            if chunk.event != "messages/partial":
                continue
            for message in chunk.data:
                if message.get("type") == "ai":
                    answer = text_of(message)
                    placeholder.markdown(answer)  # [!code highlight]

    st.session_state.history.append(("assistant", answer))
```

突出显示的行替换每个事件上的气泡内容。附加到那里会产生重复的文本，因为每个事件都会从头开始重复该消息。

`text_of` 读取内容块而不是纯字符串。代理消息以类型块列表的形式到达，因此期望 `message["content"]` 为文本的前端不会渲染任何内容。 Web SDK 将每个事件反序列化为公开 `text` 访问器的消息对象，这就是上面的 React 示例读取为 `message.text` 的原因。 LangGraph SDK 生成纯字典，因此 Python 前端会自行提取文本。Gradio 和 Dash 使用相同的客户端和相同的循环。将 Streamlit 占位符替换为流原语：`gr.ChatInterface` 的生成器函数，或 Dash 的 `dcc.Interval` 回调。

## 另请参阅

* [Identity](/langsmith/javascript/managed-deep-agents-identity)：配置调用者如何对部署进行身份验证。
* [Frontend overview](/oss/javascript/langchain/frontend/overview)：消息渲染、工具调用、中断和生成 UI 模式。
* [Connections](/langsmith/javascript/managed-deep-agents-connections)：处理 UI 中的凭证授权中断。
* [MCP endpoint](/langsmith/javascript/managed-deep-agents-mcp-endpoint)：将代理暴露给MCP客户端而不是调用API。
* [Channels](/langsmith/javascript/managed-deep-agents-channels)：从 Slack 或您自己的 HTTP 服务到达代理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-custom-frontend.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。