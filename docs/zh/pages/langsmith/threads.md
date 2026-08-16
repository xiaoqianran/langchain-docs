<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure threads | https://docs.langchain.com/langsmith/threads -->

# 配置线程

许多法学硕士应用程序都有一个类似聊天机器人的界面，用户和法学硕士应用程序可以在其中进行多轮对话。为了跟踪这些对话，您可以在LangSmith中使用[_threads_](/langsmith/observability-concepts#threads)。

## 将跟踪分组到线程中

要将跟踪关联到一个线程中，您需要传入一个特殊的 `metadata` 键，其中该值是该线程的唯一标识符。键名应该是以下之一：

- `session_id`
- `thread_id`

该值可以是您想要的任何字符串，但我们建议使用 **UUID v7** 线程 ID。

[LangSmith SDK](/langsmith/reference) 导出 `uuid7` 帮助器（Python v0.4.43+、JS v0.3.80+）：

- **Python**：`from langsmith import uuid7`
- **JS/TS**：`import { uuid7 } from 'langsmith'`

有关说明，请参阅[Add metadata and tags to traces](/langsmith/add-metadata-tags)。

<Warning>
**重要提示：**为了确保过滤和令牌计数在整个线程中正确工作，您必须在 **所有运行**（包括跟踪中的子运行）上设置线程元数据（`session_id` 或 `thread_id`）。

如果子运行没有 thread_id 元数据，则在以下情况下不会包含它们：

- 按线程过滤运行。
- 计算线程的令牌使用情况。
- 聚合整个线程的成本。创建子运行时（例如，使用 `@traceable` 进行嵌套函数或创建子范围），请确保将线程元数据传播到所有子运行。
</Warning>

### 示例

此示例演示如何使用结构化消息格式记录和检索对话历史记录以维护长时间运行的聊天。

该示例设置一个 `THREAD_ID` 并通过 `metadata` 将其传递到跟踪包装器，从而将该会话中的每次运行链接到 LangSmith 中的同一线程。对话历史记录在轮次之间保留在本地 - 将基于文件的或内存中的存储替换为生产中的数据库或缓存。 `get_chat_history` 标志控制管道是继续现有线程还是启动新线程：

<CodeGroup>

```python Python expandable wrap
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import openai
from langsmith import traceable, Client, uuid7
from langsmith.wrappers import wrap_openai

# Initialize clients
langsmith_client = Client()
client = wrap_openai(openai.Client())

# Configuration
THREAD_ID = str(uuid7())

# Using a local directory to store thread history. For production use, use a persistent storage solution.
THREADS_DIR = os.path.join(os.path.dirname(__file__), "threads")

# gets a history of all LLM calls in the thread to construct conversation history
def get_thread_history(thread_id: str) -> list:
    path = os.path.join(THREADS_DIR, f"{thread_id}.json")
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_thread_history(thread_id: str, messages: list):
    os.makedirs(THREADS_DIR, exist_ok=True)
    with open(os.path.join(THREADS_DIR, f"{thread_id}.json"), "w") as f:
        json.dump(messages, f, indent=2, default=str)


@traceable(name="Chat Bot", metadata={"thread_id": THREAD_ID})
def chat_pipeline(messages: list, get_chat_history: bool = False):
    # Whether to continue an existing thread or start a new one
    if get_chat_history:
        history_messages = get_thread_history(THREAD_ID)
        # Get existing conversation history and append new messages
        all_messages = history_messages + messages
    else:
        all_messages = messages

    # Invoke the model
    chat_completion = client.chat.completions.create(
        model="gpt-5.4-mini", messages=all_messages
    )

    response_message = chat_completion.choices[0].message
    print("Response from model:", response_message)

    full_conversation = all_messages + [{"role": response_message.role, "content": response_message.content}]
    save_thread_history(THREAD_ID, full_conversation)

    return {"messages": full_conversation}


# Format message
messages = [
    {
        "content": "Hi, my name is Sally",
        "role": "user"
    }
]

# Call the chat pipeline
result = chat_pipeline(messages, get_chat_history=False)
```

```typescript TypeScript expandable wrap
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";
import { uuid7 } from "langsmith";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config();

// Initialize client
const client = wrapOpenAI(new OpenAI());

// Configuration
const THREAD_ID = uuid7();

// Using a local directory to store thread history. For production use, use a persistent storage solution.
const THREADS_DIR = path.join(__dirname, "threads");

type Message = { role: string; content: string };

// Gets a history of all LLM calls in the thread to construct conversation history
function getThreadHistory(threadId: string): Message[] {
  const filePath = path.join(THREADS_DIR, `${threadId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveThreadHistory(threadId: string, messages: Message[]): void {
  fs.mkdirSync(THREADS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(THREADS_DIR, `${threadId}.json`),
    JSON.stringify(messages, null, 2)
  );
}

const chatPipeline = traceable(
  async function chatPipeline({ messages, get_chat_history = false }: { messages: Message[]; get_chat_history?: boolean }) {
    // Whether to continue an existing thread or start a new one
    if (get_chat_history) {
      const historyMessages = getThreadHistory(THREAD_ID);
      // Get existing conversation history and append new messages
      messages = [...historyMessages, ...messages];
    }

    // Invoke the model
    const chatCompletion = await client.chat.completions.create({
      model: "gpt-5.4-mini",
      messages,
    });

    const responseMessage = chatCompletion.choices[0].message;
    console.log("Response from model:", responseMessage);

    const fullConversation: Message[] = [
      ...messages,
      { role: responseMessage.role, content: responseMessage.content ?? "" },
    ];
    saveThreadHistory(THREAD_ID, fullConversation);

    return { messages: fullConversation };
  },
  { name: "Chat Bot", metadata: { thread_id: THREAD_ID } }
);

// Format message
const messages: Message[] = [{ role: "user", content: "Hi! My name is Sally" }];

// Call the chat pipeline
await chatPipeline({ messages, get_chat_history: false });
```

```java Java expandable wrap
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.tracing.TraceConfig;
import com.langchain.smith.tracing.Tracing;
import com.langchain.smith.wrappers.openai.OpenAITracing;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionAssistantMessageParam;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.ChatCompletionMessageParam;
import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

class ThreadsChatPipeline {
  private static final String THREAD_ID = "01990f3e-7f97-74c5-a9b6-8d3f7e8e2f11";

  private static final class OpenAiResources {
    private static final LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Map<String, Object> threadMetadata = new HashMap<>();

    static {
      threadMetadata.put("thread_id", THREAD_ID);
    }

    private static final OpenAIClient openai =
        OpenAITracing.wrapOpenAI(
            OpenAIOkHttpClient.fromEnv(),
            TraceConfig.builder()
                .client(langsmith)
                .executor(executor)
                .metadata(threadMetadata)
                .build());

    private static final List<ChatCompletionMessageParam> threadHistory = new ArrayList<>();

    static final Function<ChatRequest, Map<String, List<ChatCompletionMessageParam>>> CHAT_PIPELINE =
        Tracing.traceFunction(
            request -> {
              List<ChatCompletionMessageParam> allMessages = new ArrayList<>();
              if (request.getChatHistory()) {
                allMessages.addAll(threadHistory);
              }
              allMessages.addAll(request.getMessages());

              ChatCompletion chatCompletion =
                  openai
                      .chat()
                      .completions()
                      .create(
                          ChatCompletionCreateParams.builder()
                              .model(ChatModel.GPT_5_CHAT_LATEST)
                              .messages(allMessages)
                              .build());

              String content = chatCompletion.choices().get(0).message().content().orElse("");
              List<ChatCompletionMessageParam> fullConversation = new ArrayList<>(allMessages);
              fullConversation.add(
                  ChatCompletionMessageParam.ofAssistant(
                      ChatCompletionAssistantMessageParam.builder().content(content).build()));
              threadHistory.clear();
              threadHistory.addAll(fullConversation);

              return Collections.singletonMap("messages", fullConversation);
            },
            TraceConfig.builder()
                .name("Chat Bot")
                .client(langsmith)
                .executor(executor)
                .metadata(threadMetadata)
                .build());

    private OpenAiResources() {}

    static ExecutorService executor() {
      return executor;
    }
  }

  static Function<ChatRequest, Map<String, List<ChatCompletionMessageParam>>> chatPipeline() {
    return OpenAiResources.CHAT_PIPELINE;
  }

  public static void main(String[] args) throws InterruptedException {
    try {
      List<ChatCompletionMessageParam> messages =
          Collections.singletonList(
              ChatCompletionMessageParam.ofUser(
                  ChatCompletionUserMessageParam.builder()
                      .content("Hi, my name is Sally")
                      .build()));
      chatPipeline().apply(new ChatRequest(messages, false));
    } finally {
      OpenAiResources.executor().shutdown();
      if (!OpenAiResources.executor().awaitTermination(10, TimeUnit.SECONDS)) {
        throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
      }
    }
  }

  static class ChatRequest {
    private final List<ChatCompletionMessageParam> messages;
    private final boolean getChatHistory;

    ChatRequest(List<ChatCompletionMessageParam> messages, boolean getChatHistory) {
      this.messages = messages;
      this.getChatHistory = getChatHistory;
    }

    List<ChatCompletionMessageParam> getMessages() {
      return messages;
    }

    boolean getChatHistory() {
      return getChatHistory;
    }
  }
}
```
```kotlin Kotlin expandable wrap
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
import com.langchain.smith.tracing.TraceConfig
import com.langchain.smith.tracing.traceable
import com.langchain.smith.wrappers.openai.wrapOpenAI
import com.openai.client.okhttp.OpenAIOkHttpClient
import com.openai.models.ChatModel
import com.openai.models.chat.completions.ChatCompletionAssistantMessageParam
import com.openai.models.chat.completions.ChatCompletionCreateParams
import com.openai.models.chat.completions.ChatCompletionMessageParam
import com.openai.models.chat.completions.ChatCompletionUserMessageParam
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

val threadId = "01990f3e-7f97-74c5-a9b6-8d3f7e8e2f11"
val langsmith by lazy { LangsmithOkHttpClient.fromEnv() }
val executor by lazy { Executors.newSingleThreadExecutor() }
val threadMetadata by lazy { mapOf("thread_id" to threadId) }
val openai by lazy {
    wrapOpenAI(
        OpenAIOkHttpClient.fromEnv(),
        TraceConfig.builder()
            .client(langsmith)
            .executor(executor)
            .metadata(threadMetadata)
            .build(),
    )
}
val threadHistory = mutableListOf<ChatCompletionMessageParam>()

data class ChatRequest(
    val messages: List<ChatCompletionMessageParam>,
    val getChatHistory: Boolean = false,
)

val chatPipeline by lazy {
    traceable(
        { request: ChatRequest ->
            val allMessages =
                if (request.getChatHistory) {
                    threadHistory + request.messages
                } else {
                    request.messages
                }

            val chatCompletion =
                openai.chat().completions().create(
                    ChatCompletionCreateParams.builder()
                        .model(ChatModel.GPT_5_CHAT_LATEST)
                        .messages(allMessages)
                        .build(),
                )

            val content = chatCompletion.choices()[0].message().content().orElse("")
            val fullConversation =
                allMessages +
                    ChatCompletionMessageParam.ofAssistant(
                        ChatCompletionAssistantMessageParam.builder().content(content).build(),
                    )
            threadHistory.clear()
            threadHistory.addAll(fullConversation)

            mapOf("messages" to fullConversation)
        },
        TraceConfig.builder()
            .name("Chat Bot")
            .client(langsmith)
            .executor(executor)
            .metadata(threadMetadata)
            .build(),
    )
}

fun main() {
    try {
        val messages =
            listOf(
                ChatCompletionMessageParam.ofUser(
                    ChatCompletionUserMessageParam.builder()
                        .content("Hi, my name is Sally")
                        .build(),
                ),
            )
        chatPipeline(ChatRequest(messages))
    } finally {
        executor.shutdown()
        check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
            "Timed out waiting for LangSmith traces to submit"
        }
    }
}
```
</CodeGroup>

Java 和 Kotlin 示例使用专用执行器。关闭执行器并等待终止可确保后台跟踪提交在进程退出之前完成。

拨打以下电话以继续对话。通过传递 `get_chat_history=True` / `get_chat_history: true` / `getChatHistory = true`，您可以从中断处继续对话。这意味着 LLM 接收整个消息历史记录并对其做出响应，而不仅仅是响应最新消息：

<CodeGroup>

```python Python
# Format message
messages = [
    {
        "content": "What is my name",
        "role": "user"
    }
]

# Call the chat pipeline
result = chat_pipeline(messages, get_chat_history=True)
```

```typescript TypeScript
// Continue the conversation.
const messages: Message[] = [{ role: "user", content: "What is my name" }];

await chatPipeline({ messages, get_chat_history: true });
``````java Java
List<ChatCompletionMessageParam> messages =
    Collections.singletonList(
        ChatCompletionMessageParam.ofUser(
            ChatCompletionUserMessageParam.builder()
                .content("What is my name")
                .build()));

ThreadsChatPipeline.chatPipeline().apply(new ThreadsChatPipeline.ChatRequest(messages, true));
```

```kotlin Kotlin
val messages =
    listOf(
        ChatCompletionMessageParam.ofUser(
            ChatCompletionUserMessageParam.builder()
                .content("What is my name")
                .build(),
        ),
    )

chatPipeline(ChatRequest(messages, getChatHistory = true))
```
</CodeGroup>

继续谈话。由于包含了过去的消息，法学硕士将记住该对话：

<CodeGroup>

```python Python
# Continue the conversation.
messages = [
    {
        "content": "What was the first message I sent you?",
        "role": "user"
    }
]

chat_pipeline(messages, get_chat_history=True)
```

```typescript TypeScript
// Continue the conversation.
const messages: Message[] = [{ role: "user", content: "What was the first message I sent you?" }];

await chatPipeline({ messages, get_chat_history: true });
```

```java Java
List<ChatCompletionMessageParam> messages =
    Collections.singletonList(
        ChatCompletionMessageParam.ofUser(
            ChatCompletionUserMessageParam.builder()
                .content("What was the first message I sent you?")
                .build()));

ThreadsChatPipeline.chatPipeline().apply(new ThreadsChatPipeline.ChatRequest(messages, true));
```
```kotlin Kotlin
val messages =
    listOf(
        ChatCompletionMessageParam.ofUser(
            ChatCompletionUserMessageParam.builder()
                .content("What was the first message I sent you?")
                .build(),
        ),
    )

chatPipeline(ChatRequest(messages, getChatHistory = true))
```
</CodeGroup>

## 查看主题

您可以通过单击任意 [project details](https://smith.langchain.com/tracing) 页面中的 **线程** 选项卡来查看 [UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-threads) 中的线程。该表显示每个线程的第一个输入、最后一个输出、启动时间、回合数、延迟 (P50/P99)、令牌使用情况、成本和反馈分数。

右侧面板显示项目的汇总统计信息，包括线程和跟踪计数、令牌使用总数和中位数、错误率和 P50/P99 延迟。

<Callout type="info" icon="feather">
使用线程视图中的**[Chat](/langsmith/chat)**来分析对话线程，了解用户情绪，识别痛点并跟踪问题是否得到解决。
</Callout>

然后您可以单击进入特定线程。您可以通过三种不同的方式查看线程：- **消息**视图（测试版）：对话层。将每一轮扫描为聊天式线程，显示用户和助理消息、工具调用和子代理活动。
- **回合**视图：每回合摘要。将每个回合视为显示其输入和输出的卡片，并具有展开/折叠和可自定义的输入/输出字段。
- **详细信息**视图：调试层。深入研究特定运行以检查输入、输出、元数据、计时、错误和子运行。周围的线程上下文保持可见，因此您可以看到运行在更广泛的对话中的位置。

使用页面顶部的按钮或键盘快捷键`M`（消息）、`T`（转弯）和`D`（详细信息）在视图之间切换。虽然“消息”视图处于测试阶段，但线程侧面板默认为“详细信息”视图。右侧面板显示线程的统计信息，包括轮数、第一次和最后一次启动时间、P50/P99 延迟以及按输入和输出令牌划分的成本细分。有关每个视图的完整描述，请参阅[View traces](/langsmith/view-traces)。

### 查看反馈

反馈分数在项目的 **Threads** 选项卡上的线程表的 **Feedback** 列中可见。在线程中，打开“消息”视图，然后单击轮次元数据行中的 **LLM 调用** 链接，转至该运行的“详细信息”视图，您可以在其中查看该运行的反馈。您还可以在那里看到[thread-level feedback](/langsmith/online-evaluations-multi-turn)。

### 保存线程级过滤器

<Note>
线程过滤器会查看所有运行，如果至少有 1 个运行与过滤器匹配，则显示线程。
</Note>

在项目的 **线程** 选项卡上，您可以使用 **添加过滤器** 按钮保存常用过滤器：[Set a filter](/langsmith/filter-traces-in-application#create-and-apply-filters)，然后单击 **保存视图**。

## 相关

- [Observability concepts](/langsmith/observability-concepts#threads)：线程背景以及它们与运行和跟踪的关系。
- [Add metadata and tags to traces](/langsmith/add-metadata-tags)：如何传递`thread_id`和其他元数据键。
- [Filter traces](/langsmith/filter-traces-in-application)：在跟踪 UI 中按线程元数据过滤。
- [Set up multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)：评估线程而不是单独的运行。
- [Log user feedback using the SDK](/langsmith/attach-user-feedback)：将反馈附加到线程内的运行。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/threads.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>