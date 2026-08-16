<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy Google ADK agents | https://docs.langchain.com/langsmith/deploy-google-adk -->

# 部署 Google ADK 代理

本指南向您展示如何使用 [⟦T11⟧](https://pypi.org/project/deployments-wrap-sdk/) 包在 [LangSmith Agent Server](/langsmith/agent-server) 上部署 [Google Agent Development Kit (ADK)](https://github.com/google/adk-python) 代理。

`deployments-wrap-sdk` 提供了一个瘦包装器，可将已配置的 ADK `Runner` 转换为 LangGraph 兼容图，因此您可以部署 ADK 代理，而无需自己编写 [Functional API](/oss/python/langgraph/functional-api) 胶水。包装纸：

- 将 ADK 会话桥接到代理服务器的[checkpoint persistence](/langsmith/agent-server#persistence)，因此会话状态可以在重新启动后继续存在并在运行期间恢复。
- 通过LangGraph的流管道转发ADK令牌事件，因此部分令牌显示在[⟦T14⟧](/langsmith/streaming)和[LangSmith Studio](/langsmith/studio)中。
- 设置`LANGSMITH_TRACING`时，自动为ADK启用[LangSmith tracing](/langsmith/trace-with-google-adk)。

## 先决条件

- Python 3.11+
- [LangGraph CLI](/langsmith/cli) 用于本地开发和部署
- LangSmith API 密钥，请参阅[Create an account and API key](https://docs.langchain.com/langsmith/create-account-api-key)
- 如果您使用Gemini型号，请提供Google AI API密钥，请参阅[Google AI Studio](https://aistudio.google.com/api-keys)

## 安装

安装带有 `google-adk` 附加组件的软件包。额外的内容引入了 `google-adk` 以及包装器所需的其他依赖项：

```bash
pip install "deployments-wrap-sdk[google-adk]"
```

<Note>
PyPI 发行版名称为`deployments-wrap-sdk`，但 Python 导入路径为`saf_sdk`。两者都指同一个包。
</Note>

## 快速入门这个最小的示例构建了一个代理，该代理返回输入作为其响应，并且不需要模型 API 密钥。该代理绕过 LLM 调用，以便您可以在连接真实模型之前验证部署是否正常工作。

创建`agent.py`：

```python agent.py
from google.adk.agents import Agent
from google.adk.models.llm_response import LlmResponse
from google.adk.runners import Runner
from google.genai.types import Content, Part
from saf_sdk.adk import LangsmithSessionService, wrap


def echo_callback(callback_context, llm_request):
    """Return the user's message instead of calling a real model."""
    user_text = ""
    if callback_context.user_content and callback_context.user_content.parts:
        for part in callback_context.user_content.parts:
            if part.text:
                user_text += part.text
    return LlmResponse(
        content=Content(role="model", parts=[Part(text=f"echo: {user_text}")])
    )


agent = wrap(
    Runner(
        agent=Agent(
            name="echo_agent",
            model="gemini-2.5-flash",
            instruction="Echo the user message.",
            before_model_callback=echo_callback,
        ),
        app_name="adk_echo",
        session_service=LangsmithSessionService(),
    )
)
```

有两件事是必不可少的：

1. **将`LangsmithSessionService()`**传递为跑步者的`session_service`。如果您忘记了，`wrap()` 会引发 `TypeError`。代理服务器需要此挂钩通过其检查指针加载和保存 ADK 会话状态。
2. **将包装的`agent`**导出为模块级变量。代理服务器在提供图形服务时导入此符号。

对于真正的代理，删除`before_model_callback`并直接配置模型。例如，通过设置 `model="gemini-2.5-flash"` 和 `GOOGLE_API_KEY` 设置来使用 Gemini，或者通过 ADK 的 LiteLLM 适配器使用 Claude/OpenAI（`google.adk.models.lite_llm.LiteLlm`，可通过 `google-adk[extensions]` 获得）。

## 功能和限制

`wrap()` 将 ADK 运行时的定义子集桥接到代理服务器。在移植现有 ADK 代理之前，请检查以下边界，因为某些 ADK 功能会保持不变，而其他功能则故意不支持。

### 支持- **代理原语**：`Agent`、`SequentialAgent` 和 `ParallelAgent`，包括通过 `sub_agents` 参数进行嵌套子代理委托。
- **工具**：Python函数工具和`LongRunningFunctionTool`。
- **模型**：直接使用 Gemini 模型，以及 ADK 的 LiteLLM 适配器支持的任何模型（`google.adk.models.lite_llm.LiteLlm`，可通过 `google-adk[extensions]` 获得）。在部署上设置提供商的 API 密钥。
- **令牌流**：ADK 部分事件通过 LangGraph 的异步回调管理器转发，因此令牌块到达使用 `stream_mode="messages"` 和 Studio 聊天视图的客户端。
- **结构化输出**：配置有 `output_schema` 和 `output_key` 的代理除了 `messages` 之外，还公开图形响应上的键入值。
- **会话持久性**：`LangsmithSessionService` 将 ADK 会话状态存储在部署的检查点存储中。状态在重新启动后仍然存在，并在同一线程的每个后续回合中加载。
- **跟踪**：当`LANGSMITH_TRACING=true`时，包装器自动调用`configure_google_adk()`（参见[Enable tracing](#enable-tracing)）。
- **身份验证**：如果启用代理服务器[authentication](/langsmith/auth)，则经过身份验证的用户 ID 将变为 ADK 的`user_id`。否则用户 ID 为`"anonymous"`。

### 不支持- **多模式输入**：包装器仅将 `messages[-1].content` 作为单个文本部分转发。入站图像、文件、音频或内联二进制块不会传递到 ADK 运行程序。
- **每轮多条新消息**：只有`messages`中的最后一项被视为新用户消息。对话历史记录是从 ADK 会话状态重建的，而不是从 LangGraph 消息列表重建的。
- **双向/直播**：包装器硬编码`RunConfig(streaming_mode=StreamingMode.SSE)`。 ADK的`Runner.run_live()`以及用于音频或语音代理的双向流模式不会被调用，因此无法通过`wrap()`部署实时音频和语音代理。
- **非文本输出部分**：仅从 ADK 事件收集 `part.text` 值。代理生成的内联图像、音频或文件不会显示在图表的 `messages` 输出上。
- **中间事件作为消息**：响应作为包含串联文本的 `AIMessage` 发出。工具调用、工具结果和中间子代理轮次不会在图表的 `messages` 字段中作为单独的项目公开。请改为在 [LangSmith traces](/langsmith/observability) 中检查它们。- **替代 ADK 会话服务**：`runner.session_service` 必须是 `LangsmithSessionService`。 ADK 的 `InMemorySessionService`、`DatabaseSessionService` 和 `VertexAiSessionService` 会被 `TypeError` 拒绝，因为会话状态保存在 LangGraph 检查点中。
- **本机LangGraph中断**：包装器不公开LangGraph的`interrupt`或`Command(resume=...)`机制。基于 `LongRunningFunctionTool` 构建的人机交互流程遵循 ADK 自己的模式：该工具返回诸如 `pending_approval` 之类的状态，代理回复，后续轮流解决待处理的呼叫。

## 项目布局

一个可部署的项目需要三个文件：

```
my-adk-agent/
├── agent.py              # exports the wrapped agent
├── langgraph.json        # Agent Server config
└── pyproject.toml        # Python dependencies
```

[⟦T67⟧](/langsmith/application-structure#configuration-file-concepts) 将 Agent Server 指向导出的符号：

```json langgraph.json
{
  "$schema": "https://langgra.ph/schema.json",
  "dependencies": ["."],
  "graphs": {
    "adk_echo": "./agent.py:agent"
  },
  "env": ".env"
}
```

`pyproject.toml` 声明依赖项：

```toml pyproject.toml
[project]
name = "my-adk-agent"
version = "0.0.1"
requires-python = ">=3.11"
dependencies = [
    "deployments-wrap-sdk[google-adk]>=0.0.1",
]
```

## 安装依赖项

```bash
pip install -e .
```

## 本地运行

使用[LangGraph CLI](/langsmith/cli)启动本地代理服务器：

```bash
langgraph dev
```

这为位于 `http://127.0.0.1:2024` 的客服人员提供服务，并打开 [LangSmith Studio](/langsmith/studio)，以便您可以与客服人员聊天。直接使用`curl`发送请求：

```bash
# Create a thread
THREAD=$(curl -s -X POST http://127.0.0.1:2024/threads \
  -H "Content-Type: application/json" -d '{}' | python -c "import sys, json; print(json.load(sys.stdin)['thread_id'])")

# Run the agent and wait for the final response
curl -s -X POST "http://127.0.0.1:2024/threads/$THREAD/runs/wait" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "adk_echo",
    "input": {"messages": [{"type": "human", "content": "Hello"}]}
  }'
```

## 部署到LangSmith

代理在本地运行后，将其部署到 LangSmith 和 `langgraph deploy`：

```bash
langgraph deploy --name my-adk-agent
```

环境配置、部署类型、修订管理请参考[Deploy to cloud](/langsmith/deploy-to-cloud)。对于自托管设置，请参阅[Self-hosted deployments](/langsmith/self-hosted)。

## 启用跟踪每当启用 LangSmith 跟踪时，`wrap()` 都会自动调用 `langsmith.integrations.google_adk.configure_google_adk()`，因此您需要做的就是在部署上设置环境变量：

```bash .env
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=my-adk-agent     # optional
GOOGLE_API_KEY=your-google-api-key
```

[Traces](/langsmith/observability) 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-deploy-google-adk) 中显示代理调用、工具调用和 LLM 交互。有关底层跟踪集成的更多信息，请参阅[Trace Google ADK applications](/langsmith/trace-with-google-adk)。

## API 参考

### `wrap(runner)`

包装已配置的 `google.adk.runners.Runner` 并返回 LangGraph `Pregel` 图表，该图表可以从模块导出并由代理服务器提供服务。

|论证|类型 |描述 |
|---|---|---|
| `runner` | `google.adk.runners.Runner` |配置好的 ADK 运行器。它的 `session_service` **必须** 是 `LangsmithSessionService`。 |

**返回：** 一个名为 `runner.app_name` 的 `Pregel` 图。

**加薪：** `TypeError` 如果 `runner.session_service` 不是 `LangsmithSessionService`。

如果 `runner.agent` 定义了 `output_key`，则除了 `messages` 之外，该键的值也会在图的输出中公开。这就是 ADK 结构化输出代理（`output_schema=...`、`output_key=...`）与 Studio 和 `/runs/wait` 响应配合使用的原因。

### `LangsmithSessionService`

由代理服务器的检查点存储支持的`google.adk.sessions.BaseSessionService`实现。包装器自动管理会话生命周期。它在线程的第一轮创建一个会话，在后续轮次中从检查点加载它，并在运行完成时写回更新的会话。

根据 `Runner` 使用新实例：```python
session_service = LangsmithSessionService()
```

您不需要直接调用其方法； `wrap()` 驱动它们完成 ADK 的正常会话生命周期。

### `ADKInput`

包装代理的默认输入架构。

|领域|类型 |描述 |
|---|---|---|
| `messages` | `list[AnyMessage]` | （必填）对话消息；包装器将 `messages[-1].content` 作为新用户消息发送到 ADK 运行器。 |
| `state_delta` | `dict[str, Any] \| None` | （可选）传递到 `runner.run_async(state_delta=...)` 以改变本轮的 ADK 会话状态。 |

### `ADKOutput`

包装代理的默认输出架构。

|领域|类型 |描述 |
|---|---|---|
| `messages` | `list[AnyMessage]` |代理的响应消息，通过 LangGraph 的 `add_messages` 减速器附加到线程。 |

将 `messages` 公开为键入字段（而不是普通的 `dict`）可以让 Studio 检测图表是否与聊天兼容并启用聊天模式切换。

## 它是如何工作的

当跑步到达时：1. 包装图从运行配置中读取 `thread_id` 并将其用作 ADK `session_id`。如果启用[authentication](/langsmith/auth)，则经过身份验证的用户的id将成为ADK`user_id`；否则用户 ID 为`"anonymous"`。
2. 包装器将之前的会话（如果有）从LangGraph 检查点加载到`LangsmithSessionService`，然后要求运行器处理最新消息。
3. 运行器发出 ADK 事件。包装器通过 LangGraph 的异步回调管理器转发部分令牌事件，以便它们通过 `stream_mode="messages"` 流出，并收集响应消息的最终文本。
4. 运行完成后，包装器序列化 ADK 会话并通过 `entrypoint.final(save=...)` 将其保存到检查点。同一线程上的下一次运行将从该状态恢复。

这意味着 ADK 自己的会话/状态语义被端到端保留，同时部署获得标准代理服务器功能：持久运行、流式传输、多线程持久性和跟踪。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-google-adk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>