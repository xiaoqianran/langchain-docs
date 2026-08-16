<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: A2A endpoint in Agent Server | https://docs.langchain.com/langsmith/server-a2a -->

# 代理服务器中的 A2A 端点

[Agent2Agent (A2A)](https://a2a-protocol.org/latest/) 是 Google 的协议，用于实现对话式 AI 代理之间的通信。 [LangSmith implements A2A support](https://docs.langchain.com/langsmith/server-api-ref#tag/a2a/post/a2a/{assistant_id})，允许您的代理通过标准化协议与其他 A2A 兼容代理进行通信。

A2A 端点在 [Agent Server](/langsmith/agent-server) 的 `/a2a/{assistant_id}` 中可用。

## 支持的方法

Agent Server支持以下A2A RPC方法：

- **消息/发送**：向助手发送消息并接收完整回复
- **消息/流**：使用服务器发送事件 (SSE) 实时发送消息和流响应
- **tasks/get**：检索先前创建的任务的状态和结果

## 代理卡发现

每个助手都会自动公开一个 A2A 代理卡，该卡描述其功能并提供其他代理连接所需的信息。您可以使用以下方式检索任何助理的代理卡：

```
GET /.well-known/agent-card.json?assistant_id={assistant_id}
```

座席卡包含助理的姓名、描述、可用技能、支持的输入/输出模式以及用于通信的 A2A 端点 URL。

## 要求

要使用 A2A，请确保安装了以下依赖项：

* `langgraph-api >= 0.4.21`

安装：

```bash
pip install "langgraph-api>=0.4.21"
```

## 使用概述

要启用 A2A：* 升级以使用 langgraph-api>=0.4.21。
* 使用基于消息的状态结构部署您的代理。
* 使用端点与其他 A2A 兼容代理连接。

## 创建 A2A 兼容代理

此示例创建一个与 A2A 兼容的代理，该代理使用 OpenAI 的 API 处理传入消息并维护会话状态。代理定义基于消息的状态结构并处理 A2A 协议的消息格式。

为了与 [A2A "text" parts](https://a2a-protocol.org/dev/specification/#651-textpart-object) 兼容，代理必须具有处于状态的 `messages` 密钥。

A2A 协议使用两个标识符来保持会话的连续性：
* `contextId`：将消息分组到对话线程中（如会话 ID）
* `taskId`：识别该对话中的每个单独请求

在第一条消息中，省略 `contextId` 和 `taskId` - 代理将生成并返回它们。对于对话中的所有后续消息，请包含先前响应中的 `contextId` 和 `taskId` 以保持线程连续性。

**LangSmith 跟踪：** Langsmith 部署 A2A 端点会自动将 A2A `contextId` 转换为 `thread_id` 以进行 LangSmith 跟踪，将对话中的所有消息分组到单个线程下。

例如：

```python
"""LangGraph A2A conversational agent.

Supports the A2A protocol with messages input for conversational interactions.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, TypedDict

from langgraph.graph import StateGraph
from langgraph.runtime import Runtime
from openai import AsyncOpenAI


class Context(TypedDict):
    """Context parameters for the agent."""
    my_configurable_param: str


@dataclass
class State:
    """Input state for the agent.

    Defines the initial structure for A2A conversational messages.
    """
    messages: List[Dict[str, Any]]


async def call_model(state: State, runtime: Runtime[Context]) -> Dict[str, Any]:
    """Process conversational messages and returns output using OpenAI."""
    # Initialize OpenAI client
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Process the incoming messages
    latest_message = state.messages[-1] if state.messages else {}
    user_content = latest_message.get("content", "No message content")

    # Create messages for OpenAI API
    openai_messages = [
        {
            "role": "system",
            "content": "You are a helpful conversational agent. Keep responses brief and engaging."
        },
        {
            "role": "user",
            "content": user_content
        }
    ]

    try:
        # Make OpenAI API call
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=openai_messages,
            max_tokens=100,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content

    except Exception as e:
        ai_response = f"I received your message but had trouble processing it. Error: {str(e)[:50]}..."

    # Create a response message
    response_message = {
        "role": "assistant",
        "content": ai_response
    }

    return {
        "messages": state.messages + [response_message]
    }


# Define the graph
graph = (
    StateGraph(State, context_schema=Context)
    .add_node(call_model)
    .add_edge("__start__", "call_model")
    .compile()
)
```

## 代理到代理的通信一旦您的代理通过`langgraph dev`或[deployed to production](/langsmith/deployment)在本地运行，您就可以使用A2A协议促进它们之间的通信。

此示例演示了两个代理如何通过向彼此的 A2A 端点发送 JSON-RPC 消息来进行通信。该脚本模拟多轮对话，其中每个代理处理对方的响应并继续对话。

```python
#!/usr/bin/env python3
"""Agent-to-Agent conversation simulation using the LangGraph A2A endpoint."""

import asyncio
import aiohttp
import os
import uuid


def extract_text(result: dict) -> str:
    """Best-effort extraction of response text from an A2A result."""
    for art in result.get("result", {}).get("artifacts", []) or []:
        for part in art.get("parts", []) or []:
            if part.get("kind") == "text" and part.get("text"):
                return part["text"]

    msg = (result.get("result", {}).get("status", {}) or {}).get("message", {}) or {}
    for part in msg.get("parts", []) or []:
        if part.get("kind") == "text" and part.get("text"):
            return part["text"]

    return "(no text found)"


async def send_message(session, port, assistant_id, text, context_id=None, task_id=None):
    """Send an A2A message. Returns (response_text, returned_context_id, returned_task_id)."""
    url = f"http://127.0.0.1:{port}/a2a/{assistant_id}"

    message = {
        "role": "user",
        "parts": [{"kind": "text", "text": text}],
        "messageId": str(uuid.uuid4()),
    }

    # A2A multi-turn continuity: reuse contextId and taskId across turns/agents
    if context_id:
        message["contextId"] = context_id
    if task_id:
        message["taskId"] = task_id

    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {"message": message},
    }

    headers = {"Accept": "application/json"}
    async with session.post(url, json=payload, headers=headers) as response:
        result = await response.json()

    returned_context_id = result.get("result", {}).get("contextId") or context_id
    returned_task_id = result.get("result", {}).get("id")
    return extract_text(result), returned_context_id, returned_task_id


async def simulate_conversation():
    """Simulate a conversation between two agents."""

    #Assistant IDs
    agent_a_id = os.getenv("AGENT_A_ID")
    agent_b_id = os.getenv("AGENT_B_ID")

    if not agent_a_id or not agent_b_id:
        print("Set AGENT_A_ID and AGENT_B_ID environment variables")
        return

    message = "Hello! Let's have a conversation."
    context_id = None
    task_id = None

    async with aiohttp.ClientSession() as session:
        for i in range(3):
            print(f"--- Round {i + 1} ---")

            message, context_id, task_id = await send_message(
                session, 2024, agent_a_id, message,
                context_id=context_id,
                task_id=task_id,
            )
            print(f"🔵 Agent A: {message}")

            message, context_id, task_id = await send_message(
                session, 2025, agent_b_id, message,
                context_id=context_id,
                task_id=task_id,
            )
            print(f"🔴 Agent B: {message}\n")


if __name__ == "__main__":
    asyncio.run(simulate_conversation())
```

有关完整的工作示例，请参阅：
- [Two LangGraph agents communicating](https://github.com/langchain-samples/A2A-langgraph) - 使用 A2A 协议的两个 LangGraph 代理示例
- [Google ADK agent with LangChain agent](https://github.com/langchain-samples/A2A-google-adk) - Google ADK 代理使用 A2A 协议与 LangChain 代理交互的示例

## 分布式追踪

当多个座席通过 A2A 进行通信时，LangSmith 可以将所有 [traces](/langsmith/observability-concepts#traces) 分组为一个 [thread](/langsmith/observability-concepts#threads)，从而为您提供整个多座席对话的统一视图。

### contextId 如何映射到 thread_id

代理服务器 A2A 端点自动将 A2A `contextId` 转换为 `thread_id` 以进行 LangSmith 跟踪。这意味着对话中所有参与代理的每条消息都被分组在 LangSmith 中的同一线程下，而无需您进行任何额外配置。

该流程的工作原理如下：1. 在第一条消息中，客户端省略了`contextId`。服务器生成一个并在响应中返回它。
1. 客户端在所有后续消息中传递`contextId`，以保持会话的连续性。
1. Agent Server 将LangSmith [metadata](/langsmith/add-metadata-tags) 中的`contextId` 映射到`thread_id`，因此所有回合都出现在同一个线程中。

### 跨多个代理进行跟踪

当来自不同框架的代理通过 A2A 进行通信时，您可以通过在所有代理之间共享相同的 `thread_id` 来统一其在 LangSmith 中的跟踪。使用第一个代理返回的 `contextId` 作为所有后续请求的 `thread_id`。

以下代码片段演示了关键概念。有关两个代理的完整可运行实现，请参阅[Google ADK + LangChain example](https://github.com/langchain-samples/A2A-google-adk/blob/main/test_agent_conversation.py)。

```python
import asyncio
import aiohttp
import uuid


async def send_message(session, url, text, context_id=None, task_id=None, thread_id=None):
    """Send an A2A message and return (response_text, context_id, task_id)."""

    # --- 1. Build the message ---
    # On follow-up turns, include contextId and taskId inside the message object
    # so the server associates them with the ongoing conversation.
    message = {
        "role": "user",
        "parts": [{"kind": "text", "text": text}],
        "messageId": str(uuid.uuid4()),
    }
    if context_id:
        message["contextId"] = context_id
    if task_id:
        message["taskId"] = task_id

    # --- 2. Set thread_id in metadata ---
    # thread_id goes at the top level of the JSON-RPC payload, not inside params.
    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {"message": message},
        "metadata": {"thread_id": thread_id},
    }

    async with session.post(url, json=payload, headers={"Accept": "application/json"}) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}: {await response.text()}")
        result = await response.json()

    if "error" in result:
        raise RuntimeError(result["error"].get("message", "Unknown error"))

    result_obj = result.get("result", {})
    returned_context_id = result_obj.get("contextId") or context_id
    returned_task_id = result_obj.get("id")
    text_out = next(
        (
            part.get("text", "")
            for art in result_obj.get("artifacts", []) or []
            for part in art.get("parts", []) or []
            if part.get("kind") == "text"
        ),
        "(no text)",
    )
    return text_out, returned_context_id, returned_task_id


async def run_conversation(agent_a_url, agent_b_url):
    # --- 3. Share thread_id across agents ---
    # Generate a shared thread_id upfront. Once the server returns a contextId,
    # use that instead — this keeps the A2A context and LangSmith thread in sync.
    thread_id = str(uuid.uuid4())
    context_id = None
    task_id = None
    message = "Hello! Let's collaborate."

    async with aiohttp.ClientSession() as session:
        for _ in range(3):
            message, context_id, task_id = await send_message(
                session, agent_a_url, message,
                context_id=context_id, task_id=task_id,
                thread_id=context_id or thread_id,
            )

            # Passing the same thread_id to every agent groups all traces in LangSmith
            message, context_id, task_id = await send_message(
                session, agent_b_url, message,
                context_id=context_id, task_id=task_id,
                thread_id=context_id or thread_id,
            )


asyncio.run(run_conversation(
    "http://localhost:2024/a2a/<agent_a_assistant_id>",
    "http://localhost:2025/a2a/<agent_b_assistant_id>",
))
```

**1.构建消息**：在后续轮次中将 `contextId` 和 `taskId` 包含在 `message` 对象内，以便服务器可以将它们与正在进行的对话相关联。在第一条消息中省略它们，因为服务器会生成一个 `contextId` 并在响应中返回它。

**2.在元数据中设置 thread_id**：在 JSON-RPC 有效负载的顶级 `metadata` 字段中传递 `thread_id`，而不是在 `params` 内。**3.跨代理共享 thread_id**：在第一条消息之前生成随机 `thread_id`。服务器返回 `contextId` 后，将其用作所有后续请求的 `thread_id`，这使 A2A 对话上下文和 LangSmith 线程保持同步。将相同的 `thread_id` 传递给每个代理，以便所有跟踪都分组到一个线程中。

### 在非LangGraph代理中接收thread_id

[previous section](#tracing-across-multiple-agents)覆盖客户端——发送消息时传播`thread_id`。如果您的代理之一不是基于 LangGraph 构建的，它还需要在接收端提取并附加 `thread_id`，以便其跟踪落在同一个 LangSmith 线程中。使用 `langsmith.integrations.otel.configure()` 设置自动跟踪，并从传入的 A2A 请求元数据中提取 `thread_id` 以将跟踪分组到同一线程中。

```python
from fastapi import FastAPI, Request
from langsmith.integrations.otel import configure as configure_otel
from opentelemetry import trace
import json

# --- 1. Configure OTel ---
# Set up automatic tracing to LangSmith for your non-LangGraph agent.
configure_otel(project_name="my-a2a-project")
tracer = trace.get_tracer(__name__)

app = FastAPI()

@app.middleware("http")
async def set_thread_id_middleware(request: Request, call_next):
    thread_id = None
    if request.method == "POST":
        body_bytes = await request.body()
        if body_bytes:
            # --- 2. Extract thread_id from incoming A2A metadata ---
            try:
                body = json.loads(body_bytes)
                thread_id = body.get("metadata", {}).get("thread_id")
            except Exception:
                pass
            # Re-inject the body so downstream handlers can still read it
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive

    # --- 3. Attach thread_id to the trace ---
    # langsmith.metadata.thread_id groups this trace with others in the same thread.
    with tracer.start_as_current_span("agent") as span:
        if thread_id:
            span.set_attribute("langsmith.metadata.thread_id", thread_id)
        return await call_next(request)
```

在此中间件之后，在`app`上注册您的代理路由。

<Note>
在您的环境中设置 `LANGSMITH_API_KEY` 和可选的 `LANGSMITH_PROJECT` 以启用跟踪。对话中的所有代理应使用同一项目，以便他们的痕迹一起可见。
</Note>

### 查看LangSmith中的踪迹

运行多代理对话后，打开 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-server-a2a) 并导航到 **Threads**。所有参与代理的所有回合都将出现在一个线程下，由共享的`thread_id`标识。## 禁用 A2A

要禁用 A2A 端点，请在 `langgraph.json` 配置文件中将 `disable_a2a` 设置为 `true`：

```json
{
  "$schema": "https://langgra.ph/schema.json",
  "http": {
    "disable_a2a": true
  }
}
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/server-a2a.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>