<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: CopilotKit | https://docs.langchain.com/oss/python/langchain/frontend/integrations/copilotkit -->

# 副驾驶套件

将 CopilotKit 与 LangGraph、Deep Agents 以及 React 与自定义端点、Python AG-UI 桥和结构化生成 UI 结合使用

[CopilotKit](https://www.copilotkit.ai/) 提供了完整的 React 聊天运行时，并且当您希望代理返回**结构化 UI 有效负载**而不仅仅是纯文本时，它与 LangGraph 配合得特别好。在此模式中，您的 LangGraph 部署同时服务于图形 API 和自定义 CopilotKit 端点，而前端将辅助消息解析为动态 React 组件。

在服务器上，[copilotkit](https://pypi.org/project/copilotkit/) 包提供 [⟦T12⟧](https://docs.copilotkit.ai)，因此 LangGraph 图形、LangChain 代理或 [Deep Agent](/oss/python/deepagents/overview) 可以使用 [Agent UI (AG-UI)](https://docs.ag-ui.com/) 有线协议，将工具和消息事件流式传输到聊天 UI，并读取或写入共享的 **CopilotKit** 状态切片，并使用帮助程序在图形前面安装与 CopilotKit 兼容的 HTTP 端点。

当您需要以下情况时，此方法很有用：

* 一个现成的聊天运行时，而不是自己连接`stream.messages`
* 一个自定义服务器端点，可以在部署的图表旁边添加特定于提供者的行为
* 从受限组件注册表呈现的结构化生成 UI

[CopilotKit for LangGraph](https://docs.copilotkit.ai/langgraph) 还在相同的中间件和客户端之上记录了 [generative UI](https://docs.copilotkit.ai/langgraph/generative-ui)、[human in the loop](https://docs.copilotkit.ai/langgraph/human-in-the-loop) (HITL) 和 [shared state](https://docs.copilotkit.ai/langgraph/shared-state)。<Info>
  有关 CopilotKit 特定的 API、UI 模式和运行时配置，请参阅
  [CopilotKit docs](https://docs.copilotkit.ai/langgraph)。有关 Deep Agent 演练，请参阅
  CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents)。
</Info>

<ExampleEmbed />

## 它是如何工作的

从较高的层面来看，CopilotKit 位于 React 应用程序和 LangGraph 部署之间。前端将对话状态发送到与图形 API 一起安装的自定义 `/api/copilotkit` 路由，该路由将请求转发到 LangGraph，响应会返回辅助消息和组件注册表可以呈现的任何结构化 UI 负载。

1. **像平常一样部署图**使用 LangSmith 或使用 LangGraph 开发服务器。
2. **使用 HTTP 应用程序扩展部署**，该应用程序在图形 API 旁边安装 CopilotKit 路由。
3. **将前端包装在 `CopilotKit`** 中并将其指向自定义运行时 URL。
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
  UI --> ENDPOINT
  ENDPOINT --> GRAPH
  GRAPH --> ENDPOINT
  ENDPOINT --> UI
  UI --> RENDER
```

## 您在 Python 服务器上获得的内容

[copilotkit](https://pypi.org/project/copilotkit/) 和相关软件包桥接 LangGraph 部署和 CopilotKit 客户端。|组件|角色 |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `CopilotKitMiddleware` |将 CopilotKit 和 AG-UI 状态和请求合并到您的代理中，包括前端 [tool calls](/oss/python/langchain/agents#tools) 和上下文。将其添加到 [create\_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 或 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 的 `middleware` 列表中。 |
| `CopilotKitState`（子类）| [Custom state](/oss/python/langchain/short-term-memory)：扩展`CopilotKitState`，因此 CopilotKit 键是图状态的一部分。                                                                                                                                                                                                                                                         |
| `LangGraphAGUIAgent` |将已编译的图与运行时的名称和描述捆绑在一起。                                                                                                                                                                                                                                                                                                                   || `add_langgraph_fastapi_endpoint`（来自[ag-ui-langgraph](https://pypi.org/project/ag-ui-langgraph/)）|连接 **FastAPI** 应用程序，以便 CopilotKit 可以在同一 [LangGraph](/oss/python/langgraph/overview) 进程上运行您的图表。当您添加 [custom ⟦T22⟧ app in ⟦T23⟧](#extend-the-langgraph-deployment-with-a-custom-endpoint) 而不是单独的 HTTP 服务器时使用它。                                                                                                     |

当您将 [create\_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 添加到 `middleware` 列表时，`CopilotKitMiddleware` 与 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 和来自 [create\_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的图表是相同的中间件。对于具有 `CopilotKitState` 和 FastAPI 桥的 `create_agent` 图，请遵循下面的 [Python ⟦T28⟧ example](#extend-the-langgraph-deployment-with-a-custom-endpoint)。结构化生成 UI（例如来自客户端的 `useAgentContext` 和 `output_schema`）需要额外的中间件将 Copilot 状态映射到 [structured output](/oss/python/langchain/agents#structured-output) 策略，如同一部分中的可扩展 `src/middleware.py` 示例。

将 `app` 安装在 `langgraph.json` 中的 `http` 键上遵循通常的 [LangGraph or LangSmith deployment](/oss/python/langgraph/deploy)，因此一个进程向 CopilotKit 客户端提供图形和相同的 FastAPI 应用程序。

## 安装

对于后端端点：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add copilotkit ag-ui-langgraph fastapi uvicorn
```

中间件包位于 Deep Agents 堆栈旁边。使用您的 [chat model](/oss/python/integrations/chat) 包安装它（本示例使用 OpenAI）：

<CodeGroup>
  ```python pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U deepagents copilotkit langchain-openai
  ```

  ```python uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add deepagents copilotkit langchain-openai
  ```
</CodeGroup>

对于前端应用程序：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bun add @copilotkit/react-core @copilotkit/react-ui @hashbrownai/core @hashbrownai/react
```

## 将 CopilotKit 与深度代理结合使用将 `CopilotKitMiddleware` 添加到传递给 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 的 `middleware` 列表中。该中间件允许 CopilotKit 路由前端工具调用并将聊天状态与您的图表对齐。将任何其他[middleware you configure](/oss/python/deepagents/customization#middleware)保留在同一列表中。

然后，编译后的图表就可以插入 CopilotKit 或 AG-UI 感知进程（例如，[FastAPI pattern below](#extend-the-langgraph-deployment-with-a-custom-endpoint)）或 CopilotKit 文档中的指南（例如 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents)）。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware
from langgraph.checkpoint.memory import MemorySaver


def get_weather(location: str) -> str:
    """Return a simple weather string for a location."""
    return f"The weather in {location} is sunny."


agent = create_deep_agent(
    model="openai:gpt-5.5",
    tools=[get_weather],
    middleware=[CopilotKitMiddleware()],  # AG-UI, frontend tools, and context
    system_prompt="You are a helpful research assistant.",
    checkpointer=MemorySaver(),
)
```

## 使用自定义端点扩展 LangGraph 部署

关键思想是 LangGraph 部署不仅仅服务于图。它还可以加载 HTTP 应用程序，让您可以在部署本身旁边安装额外的路由。

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
        graph=agent,
    ),
    path="/",
)
```

这个自定义应用程序是重要的扩展点：它安装了 CopilotKit 感知的运行时，而无需替换底层的 LangGraph 部署。

在 Python 中，等效的工作发生在中间件中：规范化 CopilotKit 上下文并将 `output_schema` 从 `useAgentContext(...)` 转发到模型的结构化输出配置中。

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

结果是完全分离关注点：* LangGraph仍然拥有图执行和持久化
* CopilotKit 拥有面向聊天的运行时合约
* 您的自定义端点将它们在一个部署中粘合在一起

当您使用 [CopilotKit](https://docs.copilotkit.ai) 运行时适配器时，将 CopilotKit `runtimeUrl` 指向 FastAPI（或其他）应用程序公开的路线，而不仅仅是原始图形 REST 表面。

请遵循节点 **CopilotRuntime** 中的 [LangGraphHttpAgent](https://docs.copilotkit.ai/langgraph) 或 `LangGraphAgent` 的 CopilotKit 文档； **Python** 图形和中间件仍然定义工具行为和代理逻辑。
:::

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
```该注册表成为代理和 UI 之间的合同。该模型不会生成任意 JSX。它正在生成必须针对您公开的组件和道具进行验证的结构化数据。

## 将助手消息渲染为动态 UI

一旦助理响应到达，自定义消息渲染器就会决定如何显示它。在这个例子中：

* 助理消息根据 UI 套件架构解析为结构化 JSON
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

## 资源

* CopilotKit 文档中的 [Deep Agents and CopilotKit](https://docs.copilotkit.ai/langgraph/deep-agents) — 端到端 Next.js、开发服务器和 **Deep Agent** 路径
* [CopilotKit: LangGraph features](https://docs.copilotkit.ai/langgraph) — 生成式 UI、HITL、共享状态
* [LangGraph deployment](/oss/python/langgraph/deploy) — 生产和开发服务器

## 最佳实践* **保持自定义端点的精简：** 使用它来使 CopilotKit 适应您的图形部署，而不是重复图形内已有的业务逻辑
* **显式发送架构：** `useAgentContext` 应在每次页面安装时描述 UI 契约
* **注册受约束的组件集：**仅公开您实际希望模型使用的组件和道具
* **将渲染视为解析步骤：** 在渲染之前根据您的模式解析助手内容
* **保持用户消息简单：** 只有辅助消息需要结构化渲染器；用户消息可以保持正常的聊天气泡

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/frontend/integrations/copilotkit.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>