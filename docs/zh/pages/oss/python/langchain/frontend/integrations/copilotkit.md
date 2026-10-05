<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: CopilotKit | https://docs.langchain.com/oss/python/langchain/frontend/integrations/copilotkit -->

# 副驾驶套件

将 CopilotKit 与 LangGraph、Deep Agents 结合使用，并将 React 与自定义端点、Python AG-UI 桥、结构化生成 UI 和消息传递平台通道结合使用

[CopilotKit](https://www.copilotkit.ai/) 提供完整的 React 聊天运行时，并且当您希望代理返回 **结构化 UI 负载** 而不仅仅是纯文本时，它与 LangGraph 配合得特别好。前端与 CopilotKit 运行时 URL 进行通信，并将辅助消息解析为动态 React 组件。

在此模式中，您的 LangGraph 部署为图形 API 和 AG-UI FastAPI 桥提供服务。一个小型 Node CopilotKit 运行时位于该桥的前面，是 React 客户端所调用的。

在服务器上，[copilotkit](https://pypi.org/project/copilotkit/) 包提供 [⟦T23⟧](https://docs.copilotkit.ai)，因此 LangGraph 图、LangChain 代理或 [Deep Agent](/oss/python/deepagents/overview) 可以使用 [Agent UI (AG-UI)](https://docs.ag-ui.com/) 线路协议、将工具和消息事件流式传输到聊天 UI，以及读取或写入共享 **CopilotKit** 状态切片。 TypeScript 设置通常将 CopilotKit 运行时安装在图形 API 旁边。 Python 设置在部署上安装 AG-UI FastAPI 桥，并在其前面的 Node 中运行 CopilotKit 运行时。

当您需要以下情况时，此方法很有用：* 一个现成的聊天运行时，而不是自己连接`stream.messages`
* 自定义服务器端点，可以在部署的图表旁边添加特定于提供者的行为
* 从受限组件注册表呈现的结构化生成 UI

[CopilotKit for LangGraph](https://docs.copilotkit.ai/langgraph) 还在相同的中间件和客户端之上记录了 [generative UI](https://docs.copilotkit.ai/langgraph/generative-ui)、[human in the loop](https://docs.copilotkit.ai/langgraph/human-in-the-loop) (HITL) 和 [shared state](https://docs.copilotkit.ai/langgraph/shared-state)。

<Info>
  有关 CopilotKit 特定的 API、UI 模式和运行时配置，请参阅
  [CopilotKit docs](https://docs.copilotkit.ai/langgraph)。有关 Deep Agent 演练，请参阅
  CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents)。
</Info>

<ExampleEmbed />

## 它是如何工作的

从较高的层面来看，CopilotKit 位于 React 应用程序和 LangGraph 部署之间。

前端将对话状态发送到 Node CopilotKit 运行时。该运行时调用 LangGraph 部署上的 AG-UI FastAPI 桥接器，响应会返回助手消息以及组件注册表可以呈现的任何结构化 UI 有效负载。1. **像平常一样部署图表**使用LangSmith或使用LangGraph开发服务器。
2. **使用 HTTP 应用程序扩展部署**，该应用程序将 AG-UI FastAPI 桥安装在图形 API 旁边。
3. **运行 Node CopilotKit 运行时**，将 `HttpAgent` 指向该桥，然后根据运行时 URL 将前端包装在 `CopilotKit` 中。
4. **注册动态 UI 组件**并在渲染时将助手响应解析到这些组件中。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
  init: {
    "fontFamily": "monospace",
    "flowchart": {
      "curve": "curve"
    }
  }
}%%
graph LR
  USER["User input"]
  UI["CopilotKit React app"]
  ENDPOINT["/api/copilotkit"]
  GRAPH["LangGraph deployment"]
  RENDER["Hashbrown UI kit"]

  USER --> UI
  UI --> RUNTIME
  RUNTIME --> GRAPH
  GRAPH --> RUNTIME
  RUNTIME --> UI
  UI --> RENDER
```

在 Python 上，CopilotKit 运行时是一个单独的 Node 进程。 LangGraph 部署仅托管图形 API 和 AG-UI FastAPI 桥。参见[Add the CopilotKit runtime](#add-the-copilotkit-runtime)。

## 您在 Python 服务器上获得的内容

[copilotkit](https://pypi.org/project/copilotkit/) 和相关软件包桥接 LangGraph 部署和 CopilotKit 客户端。|组件|角色 |
| - | - |
| `CopilotKitMiddleware` |将 CopilotKit 和 AG-UI 状态和请求合并到您的代理中，包括前端 [tool calls](/oss/python/langchain/agents#tools) 和上下文。将其添加到 [create\_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 或 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 的 `middleware` 列表中。 |
| `CopilotKitState`（子类）| [Custom state](/oss/python/langchain/short-term-memory)：扩展`CopilotKitState`，因此 CopilotKit 键是图状态的一部分。 |
| `LangGraphAGUIAgent` |将已编译的图与运行时的名称和描述捆绑在一起。 |
| `add_langgraph_fastapi_endpoint`（来自[ag-ui-langgraph](https://pypi.org/project/ag-ui-langgraph/)）|在与您的图表相同的 [LangGraph](/oss/python/langgraph/overview) 进程上连接 **FastAPI** AG-UI 桥。使用 [custom ⟦T33⟧ app in ⟦T34⟧](#extend-the-langgraph-deployment-with-a-custom-endpoint) 安装它。 React 客户端仍然需要一个单独的节点 [CopilotKit runtime](#add-the-copilotkit-runtime) 通过 AG-UI 调用此桥。 |

当您将 `middleware` 列表添加到 `middleware` 列表时，`CopilotKitMiddleware` 与 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 以及来自 [create\_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的图表是相同的中间件。对于具有 `CopilotKitState` 和 FastAPI 桥的 `create_agent` 图，请遵循下面的 [Python ⟦T39⟧ example](#extend-the-langgraph-deployment-with-a-custom-endpoint)。结构化生成 UI（例如来自客户端的 `useAgentContext` 和 `output_schema`）需要额外的中间件将 Copilot 状态映射到 [structured output](/oss/python/langchain/agents#structured-output) 策略，如同一部分中的可扩展 `src/middleware.py` 示例。

将`app`安装在`langgraph.json`中的`http`键上遵循通常的[LangGraph or LangSmith deployment](/oss/python/langgraph/deploy)：一个进程服务于图形API和AG-UI FastAPI桥。 CopilotKit React 客户端与调用该桥的 Node 运行时进行通信。

＃＃ 安装对于后端端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add copilotkit ag-ui-langgraph fastapi uvicorn
```

中间件包位于 Deep Agents 堆栈旁边。使用您的 [chat model](/oss/python/integrations/chat) 软件包安装它（本示例使用 OpenAI）：

<CodeGroup>
  ```python pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U deepagents copilotkit langchain-openai
  ```

  ```python uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add deepagents copilotkit langchain-openai
  ```
</CodeGroup>

前端调用的 CopilotKit 运行时是一个 Node 包，因此 Python 设置还需要一个小型 Node 服务器。下面的引脚是已知的良好引脚对。如果升级 `@copilotkit/runtime`，请安装发布列为依赖项的 `@ag-ui/client` 版本，以便 `HttpAgent` 类型匹配：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @copilotkit/runtime@1.73.3 @ag-ui/client@0.0.59
```

对于前端应用程序：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @copilotkit/react-core @copilotkit/react-ui @hashbrownai/core @hashbrownai/react
```

## 将 CopilotKit 与深度代理结合使用

将 `CopilotKitMiddleware` 添加到传递给 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 的 `middleware` 列表中。该中间件允许 CopilotKit 路由前端工具调用并将聊天状态与您的图表对齐。将任何其他[middleware you configure](/oss/python/deepagents/customization#middleware)保留在同一列表中。

然后，编译后的图表就可以插入 CopilotKit 或 AG-UI 感知进程（例如，[FastAPI pattern below](#extend-the-langgraph-deployment-with-a-custom-endpoint)）或 CopilotKit 文档中的指南（例如 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents)）。如果您将导出代理列在 `langgraph.json` 的 `graphs` 下，则不要传递该代理上的检查指针。 [FastAPI example below](#extend-the-langgraph-deployment-with-a-custom-endpoint) 仅在 AG-UI 路由副本上附加检查点。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware


def get_weather(location: str) -> str:
    """Return a simple weather string for a location."""
    return f"The weather in {location} is sunny."


agent = create_deep_agent(
    model="openai:gpt-5.5",
    tools=[get_weather],
    middleware=[CopilotKitMiddleware()],  # AG-UI, frontend tools, and context
    system_prompt="You are a helpful research assistant.",
)
```

## 使用自定义端点扩展LangGraph部署关键思想是LangGraph部署不仅仅服务于图。它还可以加载 HTTP 应用程序，让您可以在部署本身旁边安装额外的路由。

在 `langgraph.json` 中，将 `http.app` 指向您的自定义应用程序入口点：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "copilotkit_shadify": "./main.py:agent"
  },
  "http": {
    "app": "./main.py:app"
  }
}
```

在 Python 中，创建一个 `FastAPI` 应用程序并通过 CopilotKit 的 AG-UI 桥公开 LangGraph 代理：

```python main.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any, TypedDict

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, CopilotKitState, LangGraphAGUIAgent
from fastapi import FastAPI
from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver

from src.middleware import apply_structured_output_schema, normalize_context


class AgentState(CopilotKitState):
    pass


class AgentContext(TypedDict, total=False):
    output_schema: dict[str, Any]


agent = create_agent(
    model="openai:gpt-5.5",
    middleware=[
        normalize_context,
        CopilotKitMiddleware(),
        apply_structured_output_schema,
    ],
    context_schema=AgentContext,
    state_schema=AgentState,
    system_prompt=(
        "You are a helpful UI assistant. Build visual responses using the "
        "available components."
    ),
)

app = FastAPI()

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="copilotkit_shadify",
        description="A UI assistant that returns structured component payloads.",
        # The AG-UI bridge reads graph state, so this route needs a checkpointer.
        graph=agent.copy(update={"checkpointer": MemorySaver()}),
    ),
    path="/",
)
```

AG-UI 桥在每次运行时都会读取图的状态，因此 FastAPI 路由后面的图需要一个检查点。保持检查指针关闭 `agent` 本身：`agent` 也列在 `graphs` 下，并且 `langgraph dev` 拒绝加载带有自己检查指针的列出图，因为 LangGraph API 处理列出图的持久性。带有 `MemorySaver` 的副本仅服务于 FastAPI 路由。它的线程存在于进程内存中，因此它们不会在重新启动后继续存在，不会在副本之间共享，并且不会出现在部署的线程 API 中。对于此路线上的生产交通，请改为通过耐用的[checkpointer](/oss/python/langgraph/persistence)。

这个自定义应用程序是重要的扩展点：它安装了 AG-UI FastAPI 桥，而无需替换底层 LangGraph 部署。 Node CopilotKit 运行时保持独立；参见[Add the CopilotKit runtime](#add-the-copilotkit-runtime)。在 Python 中，等效的工作发生在中间件中：规范化 CopilotKit 上下文并将 `output_schema` 从 `useAgentContext(...)` 转发到模型的结构化输出配置中。 Hashbrown 生成的模式没有顶级`title`，而OpenAI 集成需要命名结构化输出模式，因此中间件会在缺少`title` 和`description` 时填充它们。

```python expandable src/middleware.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import json
from collections.abc import Mapping

from langchain.agents.middleware import before_agent, wrap_model_call
from langchain.agents.structured_output import ProviderStrategy


@wrap_model_call
async def apply_structured_output_schema(request, handler):
    schema = None
    runtime = getattr(request, "runtime", None)
    runtime_context = getattr(runtime, "context", None)

    if isinstance(runtime_context, Mapping):
        schema = runtime_context.get("output_schema")

    if schema is None and isinstance(getattr(request, "state", None), dict):
        copilot_context = request.state.get("copilotkit", {}).get("context")
        if isinstance(copilot_context, list):
            for item in copilot_context:
                if isinstance(item, dict) and item.get("description") == "output_schema":
                    schema = item.get("value")
                    break

    if isinstance(schema, str):
        try:
            schema = json.loads(schema)
        except json.JSONDecodeError:
            schema = None

    if isinstance(schema, dict):
        # OpenAI uses the top-level title as the structured output name.
        schema = {
            **schema,
            "title": schema.get("title") or "CopilotKitStructuredOutput",
            "description": schema.get("description")
            or "Structured response schema for the CopilotKit preview.",
        }
        request = request.override(
            response_format=ProviderStrategy(schema=schema, strict=True),
        )

    return await handler(request)


@before_agent
def normalize_context(state, runtime):
    copilotkit_state = state.get("copilotkit", {})
    context = copilotkit_state.get("context")

    if isinstance(context, list):
        normalized = [
            item.model_dump() if hasattr(item, "model_dump") else item
            for item in context
        ]
        return {"copilotkit": {**copilotkit_state, "context": normalized}}

    return None
```

结果是完全分离关注点：

* LangGraph仍然拥有图执行和持久化
* CopilotKit 拥有面向聊天的运行时合约
* 您的自定义端点将它们在一个部署中粘合在一起

### 添加 CopilotKit 运行时

FastAPI 路由使用 AG-UI 协议，而不是 CopilotKit 运行时协议，因此前端无法直接调用它：将 `runtimeUrl` 指向 FastAPI 路由会失败，并显示 `runtime_info_fetch_failed`。在小型 Node 服务器中运行 [CopilotKit runtime](https://docs.copilotkit.ai/langgraph) 并将 `HttpAgent` 指向 FastAPI 路由。 Python 图形和中间件仍然定义工具行为和代理逻辑。

```ts server.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createServer } from "node:http";

import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

// The FastAPI route is mounted at the root of the LangGraph deployment.
const agentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL || "http://127.0.0.1:2024";

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({ url: agentUrl }),
  },
});

createServer(
  createCopilotNodeListener({
    runtime,
    basePath: "/api/copilotkit",
    cors: true,
  }),
).listen(4000);
```

启动 LangGraph 部署旁边的运行时：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun server.ts
```

运行时在端口 4000 上提供 `/api/copilotkit`。通过设置 `VITE_RUNTIME_URL=http://localhost:4000/api/copilotkit` 或将 `/api/copilotkit` 从开发服务器代理到端口 4000，将前端指向它。该运行时是基本的应用内集成。 [Channels](#channels) 不使用 FastAPI 路由：它通过部署的图形 API 使用 `LangGraphAgent` 连接到图形。

## 构建前端应用程序

在前端，将您的应用程序包装在 `CopilotKit` 中并将其指向自定义运行时 URL：

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useAgentContext } from "@copilotkit/react-core/v2";
import { s } from "@hashbrownai/core";

import { useChatKit } from "@/components/chat/chat-kit";
import { chatTheme } from "@/lib/chat-theme";

export function App() {
  return (
    <CopilotKit runtimeUrl={import.meta.env.VITE_RUNTIME_URL ?? "/api/copilotkit"}>
      <Page />
    </CopilotKit>
  );
}

function Page() {
  const chatKit = useChatKit();

  useAgentContext({
    description: "output_schema",
    value: s.toJsonSchema(chatKit.schema),
  });

  return <CopilotChat {...chatTheme} />;
}
```

这里有两个重要的部分：

* `runtimeUrl="/api/copilotkit"` 将聊天发送到您的自定义后端路由，而不是直接发送到原始 LangGraph API
* `useAgentContext(...)` 将 UI 模式发送给代理，以便模型知道它应该生成什么结构化输出格式

## 注册动态组件

组件注册表位于`useChatKit()`。您可以在此处定义允许代理发出的组件集，例如卡片、行、列、图表、代码块和按钮。

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { s } from "@hashbrownai/core";
import { exposeComponent, exposeMarkdown, useUiKit } from "@hashbrownai/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Row, Column } from "@/components/ui/layout";
import { SimpleChart } from "@/components/ui/simple-chart";

export function useChatKit() {
  return useUiKit({
    components: [
      exposeMarkdown(),
      exposeComponent(Card, {
        name: "card",
        description: "Card to wrap generative UI content.",
        children: "any",
      }),
      exposeComponent(Row, {
        name: "row",
        props: {
          gap: s.string("Tailwind gap size") as never,
        },
        children: "any",
      }),
      exposeComponent(Column, {
        name: "column",
        children: "any",
      }),
      exposeComponent(SimpleChart, {
        name: "chart",
        props: {
          labels: s.array("Category labels", s.string("A label")),
          values: s.array("Numeric values", s.number("A value")),
        },
        children: false,
      }),
      exposeComponent(CodeBlock, {
        name: "code_block",
        props: {
          code: s.streaming.string("The code to display"),
          language: s.string("Programming language") as never,
        },
        children: false,
      }),
      exposeComponent(Button, {
        name: "button",
        children: "text",
      }),
    ],
  });
}
```

该注册表成为代理和 UI 之间的合同。该模型不会生成任意 JSX。它正在生成必须针对您公开的组件和道具进行验证的结构化数据。

## 将助手消息渲染为动态 UI

一旦助理响应到达，自定义消息渲染器就会决定如何显示它。在这个例子中：* 助理消息根据 UI 套件架构解析为结构化 JSON
* 有效的结构化输出被渲染为真实的 React 组件
* 用户消息呈现为普通聊天气泡

```tsx theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { AssistantMessage } from "@ag-ui/core";
import type { RenderMessageProps } from "@copilotkit/react-ui";
import { useJsonParser } from "@hashbrownai/react";
import { memo } from "react";

import { useChatKit } from "@/components/chat/chat-kit";
import { Squircle } from "@/components/squircle";

const AssistantMessageRenderer = memo(function AssistantMessageRenderer({
  message,
}: {
  message: AssistantMessage;
}) {
  const kit = useChatKit();
  const { value } = useJsonParser(message.content ?? "", kit.schema);

  if (!value) return null;

  return (
    <div className="group/msg mt-2 flex w-full justify-start">
      <div className="magic-text-output w-full px-1 py-1">{kit.render(value)}</div>
    </div>
  );
});

export function CustomMessageRenderer({ message }: RenderMessageProps) {
  if (message.role === "assistant") {
    return <AssistantMessageRenderer message={message} />;
  }

  return (
    <div className="flex w-full justify-end">
      <Squircle className="w-full max-w-[64ch] px-4 py-3">
        <pre>{typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2)}</pre>
      </Squircle>
    </div>
  );
}
```

这种渲染器模式使集成感觉很原生：

* CopilotKit 处理聊天状态和传输
* 自定义渲染器决定助手负载如何变成 UI
* [Hashbrown](https://hashbrown.dev/) 将经过验证的结构化数据转化为具体的 React 元素

## 频道

为应用内副驾驶提供支持的同一代理也可以在 Slack 和其他消息平台中作为机器人运行。 [CopilotKit Channels](https://docs.copilotkit.ai/channels) 通过托管 CopilotKit Intelligence 连接将您的 LangChain 代理连接到消息平台：智能保存平台凭据和消息传递，而您的进程运行代理。

<Note>
  通道需要 `@copilotkit/channels` 0.6.1 和 `@copilotkit/runtime` 1.65.0（作为测试对一起安装），以及长期运行的主机上的 Node.js 22 或更高版本。通道连接的 LangChain 部署可以是 Python 或 TypeScript。
</Note><Info>
  本页展示了通道如何与 LangChain 代理配合使用。有关使用 LangGraph 后端的完整 Slack 演练，请参阅 [Connect and run your agent in Slack](https://docs.copilotkit.ai/slack/langgraph-typescript/connect)。有关其他代理后端和平台覆盖范围，请参阅[Channels overview](https://docs.copilotkit.ai/channels)。
</Info>

### 它是如何组合在一起的

CopilotKit Intelligence 拥有平台连接（Slack、Microsoft Teams 等）及其凭据。您的长期运行的 Channels 侦听器拥有代理、工具和应用程序逻辑。每个回合都遵循相同的路径：

1. 有人在 Slack 中向您的应用程序发送消息。
2. Intelligence 使用为通道配置的凭据接收平台事件。
3. 持久的 Intelligence 网关连接将轮流转交给您的 Channels 侦听器。
4. 侦听器在 [AG-UI](https://docs.ag-ui.com/) 上运行您的 LangChain 代理并呈现回复。
5. 智能将结果作为本机 Slack Block Kit 发送回。

平台凭证永远不会进入代理进程。在 [CopilotKit Intelligence](https://docs.copilotkit.ai/slack/intelligence) 中创建托管通道并连接 Slack：Intelligence 存储 Slack 凭据并为您提供侦听器的 **通道代码** (`CHANNEL_CODE`) 和项目范围的 **Intelligence API 密钥** (`INTELLIGENCE_API_KEY`)。

### 安装

安装经过测试的 SDK 对，然后安装 TypeScript 工具：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install --save-exact @copilotkit/channels@0.6.1 @copilotkit/runtime@1.65.0
  npm install -D tsx typescript @types/node
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add --save-exact @copilotkit/channels@0.6.1 @copilotkit/runtime@1.65.0
  pnpm add -D tsx typescript @types/node
  ``````bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add --exact @copilotkit/channels@0.6.1 @copilotkit/runtime@1.65.0
  yarn add -D tsx typescript @types/node
  ```
</CodeGroup>

使用 NodeNext TypeScript 配置：

```json icon="settings" title="tsconfig.json" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["*.ts", "*.tsx"]
}
```

### 连接您的LangChain代理

为每个对话返回一个新的代理，由线程键入，因此 Slack 线程之间不会发生状态泄漏。 LangGraph 服务器使用 LangGraph API，因此请使用 `@copilotkit/runtime/langgraph` 中的 `LangGraphAgent`，而不是 `HttpAgent`。将其指向[deployment you already run](#extend-the-langgraph-deployment-with-a-custom-endpoint)：

```ts icon="robot" title="agent.ts" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

// A fresh agent per conversation, keyed by thread.
export function makeAgent(threadId: string) {
  const agent = new LangGraphAgent({
    deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL!,
    graphId: "copilotkit_shadify", // the graph you deployed above
  });
  agent.threadId = threadId;
  return agent;
}
```

### 运行 Channel 监听器

使用 Intelligence 中的 `Code` 声明通道，并将每条消息转发给代理。创建 Node 侦听器是连接 Channel 的过程。在创建侦听器之前注册进程拆卸，以便在连接窗口期间按 Ctrl-C 仍然可以干净地停止通道。

```ts icon="server" title="channel.ts" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createServer } from "node:http";

import { createChannel } from "@copilotkit/channels";
import { CopilotKitIntelligence, CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

import { makeAgent } from "./agent.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// `name` must match the Channel Code shown in CopilotKit Intelligence.
const channel = createChannel({
  name: required("CHANNEL_CODE"),
  identifyUser: "platform",
  agent: makeAgent,
});

// Each incoming message starts a turn; runAgent streams the reply back.
channel.onMessage(async ({ thread, message }) => {
  await thread.runAgent({
    prompt: message.contentParts?.length
      ? [
          ...(message.text ? [{ type: "text" as const, text: message.text }] : []),
          ...message.contentParts,
        ]
      : message.text,
    context: [{ description: "Originating platform", value: message.platform }],
  });
});

const intelligence = new CopilotKitIntelligence({
  apiKey: required("INTELLIGENCE_API_KEY"),
});

const runtime = new CopilotRuntime({
  agents: {},
  intelligence,
  channels: [channel],
});

// Wire teardown before the listener exists, because creating it starts the
// Channel. A Ctrl-C during the connect window then still tears it down.
let teardown: (() => Promise<void>) | undefined;
const shutdown = async () => {
  await teardown?.();
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const listener = createCopilotNodeListener({
  runtime,
  basePath: "/api/copilotkit",
});
const channels = listener.channels;
const server = createServer(listener);
teardown = async () => {
  await channels.stop();
  if (server.listening) server.close();
};

// Creating the listener starts the Channel; there is no `channel.start()`.
// `ready()` is optional; inspect `status()` before reporting the Channel online.
await channels.ready({ timeoutMs: 30_000 });
if (channels.status().overall !== "online") {
  throw new Error("Slack Channel is not online");
}

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`Slack Channel online; listening on :${port}`);
});
```

设置运行时机密，然后启动该过程：

```bash .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
INTELLIGENCE_API_KEY=<project-api-key>
CHANNEL_CODE=support-slack
LANGGRAPH_DEPLOYMENT_URL=http://127.0.0.1:2024
PORT=3000
```

```bash Terminal theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
node --env-file=.env --import tsx channel.ts
```

一旦进程连接，通道就会在 Intelligence 中从 **等待运行时** 变为 **在线**。

### 其他平台

Managed Slack 已普遍可用。托管团队是受控集成目标。 Channels SDK 还附带适用于 Teams、Discord、Telegram 和 WhatsApp 的直接适配器。有关当前平台列表和每个平台的设置，请参阅[Channels overview](https://docs.copilotkit.ai/slack)。

＃＃ 资源* CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents) — 端到端 Next.js、开发服务器和 **Deep Agent** 路径
* [CopilotKit: LangGraph features](https://docs.copilotkit.ai/langgraph) — 生成式 UI、HITL、共享状态
* [LangGraph deployment](/oss/python/langgraph/deploy) — 生产和开发服务器

## 最佳实践

* **保持自定义端点的精简：** 使用它来使 CopilotKit 适应您的图形部署，而不是重复图形内已有的业务逻辑
* **显式发送模式：** `useAgentContext` 应在每次页面安装时描述 UI 契约
* **注册受约束的组件集：**仅公开您实际希望模型使用的组件和道具
* **将渲染视为解析步骤：** 在渲染之前根据您的模式解析助手内容
* **保持用户消息简单：** 只有辅助消息需要结构化渲染器；用户消息可以保持正常的聊天气泡

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/copilotkit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>