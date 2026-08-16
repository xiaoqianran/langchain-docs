<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Messages view integrations | https://docs.langchain.com/langsmith/messages-view-integrations -->

# 消息视图集成

<Note>
[Messages view](/langsmith/view-traces#messages-view) 位于 **[beta](/langsmith/release-stages)**。
</Note>

[Messages view](/langsmith/view-traces#messages-view) 将 [thread](/langsmith/observability-concepts#threads) 的 [traces](/langsmith/observability-concepts#traces) 渲染为 [trajectory](/langsmith/observability-concepts#trajectories)：按顺序显示用户提示、模型响应、工具调用和工具结果。消息视图需要两条运行元数据来呈现轨迹：

- **线程分组**：每次运行时的`thread_id`告诉LangSmith一组运行属于同一会话。
- **运行分类**：`ls_agent_type: "root"` 在作为主要对话的一部分运行的转弯标记的顶级运行上。标记为子代理的运行在线程中显示为子代理操作，而标记为中间件或压缩的运行当前已被过滤掉。

对于大多数 LangSmith 集成，两者均已为您设置。当您需要手动设置元数据时，以下示例涵盖了 [OpenAI Responses API in chaining mode](#openai-responses-api-with-chaining) 和标记自定义中间件或护栏。

## 支持的集成

以下集成会自动设置 `thread_id` 和 `ls_agent_type`：

- [Claude Code](/langsmith/trace-claude-code)
- [Claude Agent SDK](/langsmith/trace-claude-agent-sdk)
- [OpenAI Codex](/langsmith/trace-with-codex)
- [Cursor](/langsmith/trace-with-cursor)
- [Pi](/langsmith/trace-with-pi)
- [OpenCode](/langsmith/trace-with-opencode)
- [GitHub Copilot](/langsmith/trace-with-vscode-copilot)
- [Deep Agents](/langsmith/trace-deep-agents)
- [LangChain](/langsmith/trace-with-langchain)
- [LangGraph](/langsmith/trace-with-langgraph)
- OpenAI 聊天完成 (`wrap_openai`)
- OpenAI 响应 API，单次调用 (`wrap_openai`)链接模式下的 **OpenAI Responses API** (`previous_response_id`) 自动设置 `ls_agent_type`，但您可以自行设置 `thread_id`。欲了解更多详情，请参阅[OpenAI Responses API with chaining](#openai-responses-api-with-chaining)示例。

有关完整的 `ls_agent_type` 架构以及官方集成在非 root 运行时设置的其他值（`subagent`、`middleware`、`compaction`），请参阅 [Coding agent metadata contract](/langsmith/coding-agent-metadata-contract)。对于底层的线程分组机制，请参见[Configure threads](/langsmith/threads)。

## OpenAI 带链接的响应 API

当您通过传递 `previous_response_id` 链接对 OpenAI 响应 API 的调用时，OpenAI 会在服务器端存储对话状态，并且 LangSmith 包装器没有将调用分组到线程中的自然键。自己设置 `thread_id`，无论是每次调用还是在包装器初始化时。

<Note>
使用 [UUID v7](https://uuid7.com) 代替 `thread_id`。 LangSmith 的 SDK 导出 `uuid7` 帮助程序，并且 UUID v7 按创建时间排序，因此线程在列表视图中保持有序。
</Note>

### 每次调用元数据

每次调用时设置 `thread_id`。当一个包装的客户端服务多个线程时（例如，每个进程一个客户端，许多并发对话），请使用此选项。

<CodeGroup>

```python Python
import openai
from langsmith import uuid7
from langsmith.wrappers import wrap_openai

client = wrap_openai(openai.Client())
thread_id = str(uuid7())

res1 = client.responses.create(
    model="gpt-5.6",
    input="What is the capital of France?",
    store=True,
    langsmith_extra={"metadata": {"thread_id": thread_id}},
)

res2 = client.responses.create(
    model="gpt-5.6",
    input="And its population?",
    previous_response_id=resp1.id,
    store=True,
    langsmith_extra={"metadata": {"thread_id": thread_id}},
)
```

```typescript TypeScript
import OpenAI from "openai";
import { uuid7 } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers";

const client = wrapOpenAI(new OpenAI());
const threadId = uuid7();

const res1 = await client.responses.create({
  model: "gpt-5.6",
  input: "What is the capital of France?",
  metadata: { thread_id: threadId },
  store: true,
});

const res2 = await client.responses.create({
  model: "gpt-5.6",
  input: "And its population?",
  previous_response_id: res1.id,
  metadata: { thread_id: threadId },
  store: true,
});
```

</CodeGroup>

### 初始化时元数据包装客户端时设置一次`thread_id`。通过此包装器进行的每个调用都标记有相同的线程。当包装的客户端在其生命周期内只为一个线程提供服务时（例如，每个会话的工作线程），请使用此选项。

<CodeGroup>

```python Python
import openai
from langsmith import uuid7
from langsmith.wrappers import wrap_openai

thread_id = str(uuid7())

client = wrap_openai(
    openai.Client(),
    tracing_extra={"metadata": {"thread_id": thread_id}},
)

res1 = client.responses.create(
    model="gpt-5.6",
    input="What is the capital of France?",
    store=True,
)

res2 = client.responses.create(
    model="gpt-5.6",
    input="And its population?",
    previous_response_id=resp1.id,
    store=True,
)
```

```typescript TypeScript
import OpenAI from "openai";
import { uuid7 } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers";

const threadId = uuid7();

const client = wrapOpenAI(new OpenAI(), { metadata: { thread_id: threadId } });

const res1 = await client.responses.create({
  model: "gpt-5.6",
  input: "What is the capital of France?",
  store: true,
});

const res2 = await client.responses.create({
  model: "gpt-5.6",
  input: "And its population?",
  previous_response_id: res1.id,
  store: true,
});
```

</CodeGroup>

## 隐藏自定义中间件或护栏

当您围绕 LLM 或工具调用编写自己的护栏、策略检查或中间件函数时，请将其包装在 `@traceable` 中，并在元数据上设置 `ls_agent_type: "middleware"`。消息视图将这些内容从主要对话中过滤掉。

<CodeGroup>

```python Python
from langsmith import traceable

@traceable(
    run_type="llm",
    metadata={"ls_agent_type": "middleware"},
)
def entry_guardrail(prompt: str) -> dict:
    # Your guardrail logic
    return {"decision": "allow"}
```

```typescript TypeScript
import { traceable } from "langsmith/traceable";

const entryGuardrail = traceable(
  async (prompt: string) => {
    // Your guardrail logic
    return { decision: "allow" };
  },
  { run_type: "llm", metadata: { ls_agent_type: "middleware" } },
);
```

</CodeGroup>

## 从消息视图中排除运行

在运行的元数据上设置 `LS_MESSAGE_VIEW_EXCLUDE` 会告诉消息视图跳过该运行。钥匙的存在才是最重要的； `True`为约定值。过滤器在任何提取策略看到跟踪之前运行，因此排除的 LLM 或工具运行永远不会影响检测、消息提取或工具调用配对。

`LS_MESSAGE_VIEW_EXCLUDE`是从`langsmith`（Python和JS）导出的顶级常量，其值为字符串`"ls_message_view_exclude"`。更喜欢常量以避免拼写错误；文字字符串仍然有效。将其用于非会话轮次的 LLM 子跨度，例如分类调用、嵌入查找、安全过滤器或路由/护栏决策，您仍然希望在 LangSmith 中的其他位置可见，但不希望使会话记录变得混乱。

<Tabs>
  <Tab title="Python">

**1.在 `@traceable` 装饰器上**：排除整个函数的运行。

```python
from langsmith import LS_MESSAGE_VIEW_EXCLUDE, traceable

@traceable(run_type="llm", metadata={LS_MESSAGE_VIEW_EXCLUDE: True})
def classify_intent(query: str) -> str:
    # This LLM call is internal routing, not part of the chat
    return llm.predict(f"Classify the intent of: {query}")
```

**2.通过`trace`上下文管理器**：排除临时跨度。

```python
from langsmith import LS_MESSAGE_VIEW_EXCLUDE, trace

with trace(
    "safety_check",
    run_type="llm",
    metadata={LS_MESSAGE_VIEW_EXCLUDE: True},
) as run:
    result = safety_model.score(text)
    run.end(outputs={"score": result})
```

**3.从正在运行的函数内部**：在修补运行之前的任何点设置当前运行树上的密钥。

```python
from langsmith import LS_MESSAGE_VIEW_EXCLUDE, get_current_run_tree, traceable

@traceable(run_type="llm")
def maybe_internal(query: str) -> str:
    result = llm.predict(query)
    if _looks_like_routing(query):
        rt = get_current_run_tree()
        if rt is not None:
            rt.add_metadata({LS_MESSAGE_VIEW_EXCLUDE: True})
    return result
```

**4.使用 `wrap_openai` / `wrap_anthropic`** 时的每次调用：将 `langsmith_extra` 传递给包装的客户端调用。

```python
import openai
from langsmith import LS_MESSAGE_VIEW_EXCLUDE
from langsmith.wrappers import wrap_openai

client = wrap_openai(openai.Client())

resp = client.chat.completions.create(
    model="gpt-5.6",
    messages=[{"role": "user", "content": "Classify: ..."}],
    langsmith_extra={"metadata": {LS_MESSAGE_VIEW_EXCLUDE: True}},
)
```

**5. LangChain `RunnableConfig`**：排除链或聊天模型的单次调用。

```python
from langchain_openai import ChatOpenAI
from langsmith import LS_MESSAGE_VIEW_EXCLUDE

llm = ChatOpenAI(model="gpt-5.6")
result = llm.invoke(
    "Classify this query",
    config={"metadata": {LS_MESSAGE_VIEW_EXCLUDE: True}},
)
```

  </Tab>
  <Tab title="TypeScript">

**1.在 `traceable` 包装器**上：排除整个函数的运行。

```typescript
import { LS_MESSAGE_VIEW_EXCLUDE } from "langsmith";
import { traceable } from "langsmith/traceable";

const classifyIntent = traceable(
  async (query: string) => {
    return await llm.predict(`Classify the intent of: ${query}`);
  },
  {
    name: "classify_intent",
    run_type: "llm",
    metadata: { [LS_MESSAGE_VIEW_EXCLUDE]: true },
  },
);
```

**2.从正在运行的函数内部**：改变当前的运行树。

```typescript
import { LS_MESSAGE_VIEW_EXCLUDE } from "langsmith";
import { traceable, getCurrentRunTree } from "langsmith/traceable";

const maybeInternal = traceable(
  async (query: string) => {
    const result = await llm.predict(query);
    if (looksLikeRouting(query)) {
      const rt = getCurrentRunTree();
      rt.extra = rt.extra ?? {};
      rt.extra.metadata = { ...rt.extra.metadata, [LS_MESSAGE_VIEW_EXCLUDE]: true };
    }
    return result;
  },
  { run_type: "llm" },
);
```

**3.每次调用`wrapOpenAI`**：在调用时传递`langsmithExtra`。

```typescript
import { LS_MESSAGE_VIEW_EXCLUDE } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers";
import OpenAI from "openai";

const client = wrapOpenAI(new OpenAI());

const resp = await client.chat.completions.create(
  {
    model: "gpt-5.6",
    messages: [{ role: "user", content: "Classify: ..." }],
  },
  { langsmithExtra: { metadata: { [LS_MESSAGE_VIEW_EXCLUDE]: true } } },
);
```

**4. Vercel AI SDK 中间件**：通过 `wrapAISDK` 上的 `lsConfig.metadata` 传递密钥。中间件将其合并到每个发出的 LLM 运行中。

```typescript
import * as ai from "ai";
import { LS_MESSAGE_VIEW_EXCLUDE } from "langsmith";
import { wrapAISDK } from "langsmith/experimental/vercel";

const { generateText } = wrapAISDK(ai, {
  metadata: { [LS_MESSAGE_VIEW_EXCLUDE]: true },
});
```要仅排除某些调用而不排除其他调用，请正常使用 `wrapAISDK` 包装，然后从调用 AI SDK 的父级 `traceable` 内部对 `getCurrentRunTree()` 进行变异，或者使用带有 `createChild({ extra: { metadata: { [LS_MESSAGE_VIEW_EXCLUDE]: true } } })` 的子级 `RunTree`。

**5.手动`RunTree.createChild`**：当您手动构建运行时。

```typescript
import { LS_MESSAGE_VIEW_EXCLUDE } from "langsmith";
import { RunTree } from "langsmith/run_trees";

const parent = new RunTree({ name: "agent", run_type: "chain" });
const child = parent.createChild({
  name: "safety_check",
  run_type: "llm",
  extra: { metadata: { [LS_MESSAGE_VIEW_EXCLUDE]: true } },
});
```

  </Tab>
</Tabs>

### 注释

- 过滤器检查**是否存在密钥**，而不是真实性。 `{LS_MESSAGE_VIEW_EXCLUDE: false}` 仍然排除运行。完全省略该键以包含运行。
- 在 `@traceable` (Python) 或 `traceable` (JS) 父级内部执行的子运行通过共享跟踪上下文继承排除：Python 的 `_METADATA` `ContextVar` 和 JS 的 `AsyncLocalStorage`。子级自己的装饰器时间元数据位于继承值之上。
- 排除的运行仍显示在常规跟踪视图、运行资源管理器和指标中。只有消息视图会过滤掉它们。

## 手动仪器

如果您在没有 [Supported integrations](#supported-integrations) 中的包装器之一的情况下进行跟踪（例如，通过 `RunTree`、REST API 或提供商 SDK 周围的自定义包装器发出运行），请在每个 LLM 运行的元数据上设置 `ls_message_format` 以将跟踪路由到正确的提取器：|痕迹形状 |设置元数据 |
| ---| ---|
| LangChain 消息（构造函数信封）| `ls_message_format: "langchain"` |
| OpenAI 聊天完成 | `ls_message_format: "completions"` |
| OpenAI 响应 API | `ls_message_format: "responses"` |
| Anthropic 消息 API | `ls_message_format: "anthropic"` |

## 相关

- [Configure threads](/langsmith/threads)：`thread_id` 群体如何跨越LangSmith。
- [Coding agent metadata contract](/langsmith/coding-agent-metadata-contract)：完整的`ls_agent_type`架构。
- [View traces](/langsmith/view-traces#messages-view)：消息视图显示的内容以及如何自定义它。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/messages-view-integrations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>