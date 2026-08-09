<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom instrumentation | https://docs.langchain.com/langsmith/annotate-code -->

# 自定义仪器

直接检测您的代码以控制跟踪哪些函数以及它们在 LangSmith 中的显示方式。

直接将 [instrumentation](/langsmith/observability-concepts#manual-instrumentation) 添加到代码中，可以让您精确控制应用程序跟踪哪些函数、记录哪些输入和输出，以及如何构建 [trace](/langsmith/observability-concepts#traces) 层次结构。三种核心仪器方法是：

* [⟦T15⟧ decorator](#use-%40traceable-%2F-traceable)：推荐用于大多数情况
* [⟦T16⟧ context manager](#use-the-trace-context-manager-python-only)：仅限Python
* [⟦T17⟧ API](#use-the-runtree-api)：显式、低级控制

此页面还涵盖：

* [Specifying a custom run ID](#specify-a-custom-run-id)，对于在运行后立即附加反馈或与外部系统关联非常有用。
* [Ensuring all traces are submitted](#ensure-all-traces-are-submitted-before-exiting) 在进程退出之前。

对于LangChain（Python或JS/TS），请参考[LangChain-specific instructions](/langsmith/trace-with-langchain)。

<Callout icon="plug">
  如果您使用的是带有内置 LangSmith 集成的 LLM 提供商或代理框架，请参阅 [integrations overview](/langsmith/integrations)
</Callout>

## 先决条件

在跟踪之前，请设置以下环境变量：

* `LANGSMITH_TRACING=true`：启用跟踪。设置此选项可在不更改代码的情况下打开和关闭跟踪。<Note>
    `LANGSMITH_TRACING` 控制 `@traceable` 装饰器和 `trace` 上下文管理器。要在运行时为 `@traceable` 覆盖此设置而不更改环境变量，请使用 [⟦T23⟧](#use-the-trace-context-manager-python-only) (Python) 或将 `tracingEnabled` 直接传递给 `traceable` (JS/TS)。 [⟦T26⟧ objects](#use-the-runtree-api) 不受任何这些控制措施的影响；他们总是在发布数据时将数据发送给 LangSmith。
  </Note>

* `LANGSMITH_API_KEY`：您的[LangSmith API key](/langsmith/create-account-api-key)。

* 默认情况下，LangSmith 将跟踪记录到名为 `default` 的项目。要登录到不同的项目，请设置`LANGSMITH_PROJECT`。更多详情请参阅[Log traces to a specific project](/langsmith/log-traces-to-project)。

## 使用 `@traceable` / `traceable`

将 [⟦T32⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) (Python)、[⟦T33⟧](https://reference.langchain.com/javascript/langsmith/traceable) (TypeScript)、`traceable` (Kotlin) 或 `Tracing.traceFunction` (Java) 应用于任何函数以使其成为跟踪运行。 LangSmith 自动处理跨嵌套调用的上下文传播。

以下示例跟踪一个简单的管道：`run_pipeline` 调用 `format_prompt` 构建消息，`invoke_llm` 调用模型，以及 `parse_output` 提取结果。

每个函数都被单独跟踪，并且因为它们是从 `run_pipeline` 内部调用的（也被跟踪），LangSmith 会自动将它们嵌套为子运行。 `invoke_llm` 使用 `run_type="llm"` 将其标记为 LLM 调用，以便 LangSmith 可以正确呈现令牌计数和延迟：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable
  from openai import Client

  openai = Client()

  @traceable
  def format_prompt(subject):
    return [
        {
            "role": "system",
            "content": "You are a helpful assistant.",
        },
        {
            "role": "user",
            "content": f"What's a good name for a store that sells {subject}?"
        }
    ]

  @traceable(run_type="llm")
  def invoke_llm(messages):
    return openai.chat.completions.create(
        messages=messages, model="gpt-5.4-mini", temperature=0
    )

  @traceable
  def parse_output(response):
    return response.choices[0].message.content

  @traceable
  def run_pipeline():
    messages = format_prompt("colorful socks")
    response = invoke_llm(messages)
    return parse_output(response)

  run_pipeline()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable } from "langsmith/traceable";
  import OpenAI from "openai";

  const openai = new OpenAI();

  const formatPrompt = traceable((subject: string) => {
    return [
      {
        role: "system" as const,
        content: "You are a helpful assistant.",
      },
      {
        role: "user" as const,
        content: `What's a good name for a store that sells ${subject}?`,
      },
    ];
  },{ name: "formatPrompt" });

  const invokeLLM = traceable(
    async ({ messages }: { messages: { role: string; content: string }[] }) => {
        return openai.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: messages,
            temperature: 0,
        });
    },
    { run_type: "llm", name: "invokeLLM" }
  );

  const parseOutput = traceable(
    (response: any) => {
        return response.choices[0].message.content;
    },
    { name: "parseOutput" }
  );

  const runPipeline = traceable(
    async () => {
        const messages = await formatPrompt("colorful socks");
        const response = await invokeLLM({ messages });
        return parseOutput(response);
    },
    { name: "runPipeline" }
  );

  await runPipeline();
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import com.openai.client.OpenAIClient;
  import com.openai.client.okhttp.OpenAIOkHttpClient;
  import com.openai.models.ChatModel;
  import com.openai.models.chat.completions.ChatCompletion;
  import com.openai.models.chat.completions.ChatCompletionCreateParams;
  import com.openai.models.chat.completions.ChatCompletionMessageParam;
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam;
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
  import java.util.Arrays;
  import java.util.List;
  import java.util.function.Function;

  public class TraceablePipeline {
    public static void main(String[] args) {
      new TraceablePipelineRunner().run();
    }

    private static final class TraceablePipelineRunner {
      private final OpenAIClient openai = OpenAIOkHttpClient.fromEnv();

      private final Function<String, List<ChatCompletionMessageParam>> formatPrompt =
          Tracing.traceFunction(
              subject ->
                  Arrays.asList(
                      ChatCompletionMessageParam.ofSystem(
                          ChatCompletionSystemMessageParam.builder()
                              .content("You are a helpful assistant.")
                              .build()),
                      ChatCompletionMessageParam.ofUser(
                          ChatCompletionUserMessageParam.builder()
                              .content("What's a good name for a store that sells " + subject + "?")
                              .build())),
              TraceConfig.builder().name("format_prompt").build());

      private final Function<List<ChatCompletionMessageParam>, ChatCompletion> invokeLlm =
          Tracing.traceFunction(
              messages ->
                  openai.chat()
                      .completions()
                      .create(
                          ChatCompletionCreateParams.builder()
                              .model(ChatModel.GPT_5_CHAT_LATEST)
                              .messages(messages)
                              .temperature(0.0)
                              .build()),
              TraceConfig.builder().name("invoke_llm").runType(RunType.LLM).build());

      private final Function<ChatCompletion, String> parseOutput =
          Tracing.traceFunction(
              response -> response.choices().get(0).message().content().orElse(""),
              TraceConfig.builder().name("parse_output").build());

      private final Function<String, String> runPipeline =
          Tracing.traceFunction(
              subject -> parseOutput.apply(invokeLlm.apply(formatPrompt.apply(subject))),
              TraceConfig.builder().name("run_pipeline").build());

      void run() {
        runPipeline.apply("colorful socks");
      }
    }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.traceable
  import com.openai.client.okhttp.OpenAIOkHttpClient
  import com.openai.models.ChatModel
  import com.openai.models.chat.completions.ChatCompletion
  import com.openai.models.chat.completions.ChatCompletionCreateParams
  import com.openai.models.chat.completions.ChatCompletionMessageParam
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam
  import kotlin.jvm.optionals.getOrNull

  val openai = OpenAIOkHttpClient.fromEnv()

  val formatPrompt =
      traceable(
          { subject: String ->
              listOf(
                  ChatCompletionMessageParam.ofSystem(
                      ChatCompletionSystemMessageParam.builder()
                          .content("You are a helpful assistant.")
                          .build(),
                  ),
                  ChatCompletionMessageParam.ofUser(
                      ChatCompletionUserMessageParam.builder()
                          .content("What's a good name for a store that sells $subject?")
                          .build(),
                  ),
              )
          },
          TraceConfig.builder().name("format_prompt").build(),
      )

  val invokeLlm =
      traceable(
          { messages: List<ChatCompletionMessageParam> ->
              openai.chat().completions().create(
                  ChatCompletionCreateParams.builder()
                      .model(ChatModel.GPT_5_CHAT_LATEST)
                      .messages(messages)
                      .temperature(0.0)
                      .build(),
              )
          },
          TraceConfig.builder().name("invoke_llm").runType(RunType.LLM).build(),
      )

  val parseOutput =
      traceable(
          { response: ChatCompletion ->
              response.choices()[0].message().content().getOrNull().orEmpty()
          },
          TraceConfig.builder().name("parse_output").build(),
      )

  val runPipeline =
      traceable(
          { subject: String -> parseOutput(invokeLlm(formatPrompt(subject))) },
          TraceConfig.builder().name("run_pipeline").build(),
      )

  println(runPipeline("colorful socks"))
  ```
</CodeGroup>在 [UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-annotate-code) 中，您将找到 `run_pipeline` 跟踪，其中 `format_prompt`、`invoke_llm` 和 `parse_output` 作为嵌套子运行。

<Note>
  当您使用 `traceable` 包装同步函数时（例如上例中的 `formatPrompt`），请在调用它时使用 `await` 关键字以确保正确记录跟踪。
</Note>

## 使用 `trace` 上下文管理器（仅限 Python）

在 Python 中，您可以使用 `trace` 上下文管理器将跟踪记录到 LangSmith。这在以下情况下很有用：

1. 您想要记录特定代码块的跟踪。
2. 您想要控制跟踪的输入、输出和其他属性。
3. 使用装饰器或包装器是不可行的。
4. 上述任何一项或全部。

上下文管理器与 `traceable` 装饰器和 `wrap_openai` 包装器无缝集成，因此您可以在同一应用程序中一起使用它们。

以下示例显示了所有三个一起使用的情况。 `wrap_openai` 包装 OpenAI 客户端，以便自动跟踪其调用。 `my_tool` 使用 `@traceable` 与 `run_type="tool"` 以及自定义 `name` 来正确显示在跟踪中。 `chat_pipeline`本身没有装饰；相反，`ls.trace` 包装调用，让您显式传递项目名称和输入，并通过 `rt.end()` 手动设置输出：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import openai
import langsmith as ls
from langsmith.wrappers import wrap_openai

client = wrap_openai(openai.Client())

@ls.traceable(run_type="tool", name="Retrieve Context")
def my_tool(question: str) -> str:
    return "During this morning's meeting, we solved all world conflict."

def chat_pipeline(question: str):
    context = my_tool(question)
    messages = [
        { "role": "system", "content": "You are a helpful assistant. Please respond to the user's request only based on the given context." },
        { "role": "user", "content": f"Question: {question}\nContext: {context}"}
    ]
    chat_completion = client.chat.completions.create(
        model="gpt-5.4-mini", messages=messages
    )
    return chat_completion.choices[0].message.content

app_inputs = {"input": "Can you summarize this morning's meetings?"}

with ls.trace("Chat Pipeline", "chain", project_name="my_test", inputs=app_inputs) as rt:
    output = chat_pipeline("Can you summarize this morning's meetings?")
    rt.end(outputs={"output": output})
```

## 使用`RunTree` API另一种更明确地将跟踪记录记录到 LangSmith 的方法是通过 `RunTree` API。此 API 使您可以更好地控制跟踪。您可以手动创建运行和子运行来组装跟踪。您仍然需要设置`LANGSMITH_API_KEY`，但`LANGSMITH_TRACING`对于此方法不是必需的。

对于大多数用例，不建议使用此方法；与自动处理上下文传播的`@traceable`相比，手动管理跟踪上下文很容易出错。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import openai
  from langsmith.run_trees import RunTree

  # This can be a user input to your app
  question = "Can you summarize this morning's meetings?"

  # Create a top-level run
  pipeline = RunTree(
    name="Chat Pipeline",
    run_type="chain",
    inputs={"question": question}
  )
  pipeline.post()

  # This can be retrieved in a retrieval step
  context = "During this morning's meeting, we solved all world conflict."
  messages = [
    { "role": "system", "content": "You are a helpful assistant. Please respond to the user's request only based on the given context." },
    { "role": "user", "content": f"Question: {question}\nContext: {context}"}
  ]

  # Create a child run
  child_llm_run = pipeline.create_child(
    name="OpenAI Call",
    run_type="llm",
    inputs={"messages": messages},
  )
  child_llm_run.post()

  # Generate a completion
  client = openai.Client()
  chat_completion = client.chat.completions.create(
    model="gpt-5.4-mini", messages=messages
  )

  # End the runs and log them
  child_llm_run.end(outputs=chat_completion)
  child_llm_run.patch()
  pipeline.end(outputs={"answer": chat_completion.choices[0].message.content})
  pipeline.patch()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { RunTree } from "langsmith";

  // This can be a user input to your app
  const question = "Can you summarize this morning's meetings?";

  const pipeline = new RunTree({
    name: "Chat Pipeline",
    run_type: "chain",
    inputs: { question }
  });
  await pipeline.postRun();

  // This can be retrieved in a retrieval step
  const context = "During this morning's meeting, we solved all world conflict.";
  const messages = [
    { role: "system", content: "You are a helpful assistant. Please respond to the user's request only based on the given context." },
    { role: "user", content: `Question: ${question}Context: ${context}` }
  ];

  // Create a child run
  const childRun = await pipeline.createChild({
    name: "OpenAI Call",
    run_type: "llm",
    inputs: { messages },
  });
  await childRun.postRun();

  // Generate a completion
  const client = new OpenAI();
  const chatCompletion = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: messages,
  });

  // End the runs and log them
  childRun.end(chatCompletion);
  await childRun.patchRun();
  pipeline.end({ outputs: { answer: chatCompletion.choices[0].message.content } });
  await pipeline.patchRun();
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.LangsmithClient;
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
  import com.langchain.smith.tracing.RunTree;
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.openai.client.OpenAIClient;
  import com.openai.client.okhttp.OpenAIOkHttpClient;
  import com.openai.models.ChatModel;
  import com.openai.models.chat.completions.ChatCompletion;
  import com.openai.models.chat.completions.ChatCompletionCreateParams;
  import com.openai.models.chat.completions.ChatCompletionMessageParam;
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam;
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
  import java.time.Instant;
  import java.util.Arrays;
  import java.util.Collections;
  import java.util.List;
  import java.util.concurrent.ExecutorService;
  import java.util.concurrent.Executors;
  import java.util.concurrent.TimeUnit;

  public class RunTreeExample {
      public static void main(String[] args) throws InterruptedException {
          LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
          OpenAIClient openai = OpenAIOkHttpClient.fromEnv();
          ExecutorService executor = Executors.newSingleThreadExecutor();

          try {
              String question = "Can you summarize this morning's meetings?";
              String runId = "01990f3e-7f97-74c5-a9b6-8d3f7e8e2f11";

              RunTree pipeline = RunTree.builder()
                  .id(runId)
                  .name("Chat Pipeline")
                  .runType(RunType.CHAIN)
                  .inputs(Collections.singletonMap("question", question))
                  .client(langsmith)
                  .executor(executor)
                  .build();
              pipeline.postRun();

              String context = "During this morning's meeting, we solved all world conflict.";
              List<ChatCompletionMessageParam> messages = Arrays.asList(
                  ChatCompletionMessageParam.ofSystem(
                      ChatCompletionSystemMessageParam.builder()
                          .content(
                              "You are a helpful assistant. Please respond to the user's " +
                                  "request only based on the given context.")
                          .build()),
                  ChatCompletionMessageParam.ofUser(
                      ChatCompletionUserMessageParam.builder()
                          .content("Question: " + question + "\nContext: " + context)
                          .build()));

              RunTree childRun = pipeline.createChild(
                  TraceConfig.builder().name("OpenAI Call").runType(RunType.LLM).build());
              childRun.setInputs(Collections.singletonMap("messages", messages));
              childRun.postRun();

              ChatCompletion chatCompletion = openai.chat().completions().create(
                  ChatCompletionCreateParams.builder()
                      .model(ChatModel.GPT_5_CHAT_LATEST)
                      .messages(messages)
                      .build());

              String answer = chatCompletion.choices().get(0).message().content().orElse("");
              System.out.println(answer);

              childRun.setOutputs(Collections.singletonMap("response", chatCompletion.toString()));
              childRun.setEndTime(Instant.now().toString());
              childRun.patchRun();

              pipeline.setOutputs(Collections.singletonMap(
                  "answer", answer));
              pipeline.setEndTime(Instant.now().toString());
              pipeline.patchRun();
          } finally {
              executor.shutdown();
              if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                  throw new IllegalStateException(
                      "Timed out waiting for LangSmith traces to submit");
              }
          }
      }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
  import com.langchain.smith.tracing.RunTree
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.openai.client.okhttp.OpenAIOkHttpClient
  import com.openai.models.ChatModel
  import com.openai.models.chat.completions.ChatCompletionCreateParams
  import com.openai.models.chat.completions.ChatCompletionMessageParam
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam
  import java.time.Instant
  import java.util.concurrent.Executors
  import java.util.concurrent.TimeUnit

  val langsmith = LangsmithOkHttpClient.fromEnv()
  val openai = OpenAIOkHttpClient.fromEnv()
  val executor = Executors.newSingleThreadExecutor()

  try {
      val question = "Can you summarize this morning's meetings?"
      val runId = "01990f3e-7f97-74c5-a9b6-8d3f7e8e2f11"

      val pipeline =
          RunTree.builder()
              .id(runId)
              .name("Chat Pipeline")
              .runType(RunType.CHAIN)
              .inputs(mapOf("question" to question))
              .client(langsmith)
              .executor(executor)
              .build()
      println("[run-tree-example] Posting parent run to LangSmith…")
      pipeline.postRun()

      val context = "During this morning's meeting, we solved all world conflict."
      val messages =
          listOf(
              ChatCompletionMessageParam.ofSystem(
                  ChatCompletionSystemMessageParam.builder()
                      .content(
                          "You are a helpful assistant. Please respond to the user's " +
                              "request only based on the given context.",
                      )
                      .build(),
              ),
              ChatCompletionMessageParam.ofUser(
                  ChatCompletionUserMessageParam.builder()
                      .content("Question: $question\nContext: $context")
                      .build(),
              ),
          )

      val childRun =
          pipeline.createChild(
              TraceConfig.builder().name("OpenAI Call").runType(RunType.LLM).build(),
          )
      childRun.inputs = mapOf("messages" to messages)
      println("[run-tree-example] Posting child run to LangSmith…")
      childRun.postRun()

      val chatCompletion =
          openai.chat().completions().create(
              ChatCompletionCreateParams.builder()
                  .model(ChatModel.GPT_5_CHAT_LATEST)
                  .messages(messages)
                  .build(),
          )

      val answer = chatCompletion.choices()[0].message().content().orElse("")
      println("[run-tree-example] Answer:")
      println(answer)

      childRun.outputs = mapOf("response" to chatCompletion.toString())
      childRun.endTime = Instant.now().toString()
      childRun.patchRun()

      pipeline.outputs =
          mapOf(
              "answer" to answer,
          )
      pipeline.endTime = Instant.now().toString()
      pipeline.patchRun()
  } finally {
      executor.shutdown()
      check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
          "Timed out waiting for LangSmith traces to submit"
      }
  }
  ```
</CodeGroup>

Java 和 Kotlin 示例使用自定义根运行 ID 和专用执行器。关闭执行器并等待终止可确保后台运行提交在进程退出之前完成。

## 用法示例

您可以扩展上一节中介绍的实用程序来跟踪任何代码。以下代码显示了一些示例扩展。

跟踪类中的任何公共方法：

```python expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Any, Callable, Type, TypeVar

T = TypeVar("T")

def traceable_cls(cls: Type[T]) -> Type[T]:
    """Instrument all public methods in a class."""
    def wrap_method(name: str, method: Any) -> Any:
        if callable(method) and not name.startswith("__"):
            return traceable(name=f"{cls.__name__}.{name}")(method)
        return method

    # Handle __dict__ case
    for name in dir(cls):
        if not name.startswith("_"):
            try:
                method = getattr(cls, name)
                setattr(cls, name, wrap_method(name, method))
            except AttributeError:
                # Skip attributes that can't be set (e.g., some descriptors)
                pass

    # Handle __slots__ case
    if hasattr(cls, "__slots__"):
        for slot in cls.__slots__:  # type: ignore[attr-defined]
            if not slot.startswith("__"):
                try:
                    method = getattr(cls, slot)
                    setattr(cls, slot, wrap_method(slot, method))
                except AttributeError:
                    # Skip slots that don't have a value yet
                    pass

    return cls

@traceable_cls
class MyClass:
    def __init__(self, some_val: int):
        self.some_val = some_val

    def combine(self, other_val: int):
        return self.some_val + other_val

# See trace: https://smith.langchain.com/public/882f9ecf-5057-426a-ae98-0edf84fdcaf9/r
MyClass(13).combine(29)
```

## 指定自定义运行ID默认情况下，LangSmith 为每次运行分配一个随机 ID。当您需要提前知道运行 ID（例如，在运行后立即附加 [feedback](/langsmith/attach-user-feedback)）、将 LangSmith 运行与来自外部系统的 ID 相关联或使用确定性 ID 使运行具有幂等性时，您可以覆盖此设置。

<Note>
  使用 **UUID v7** 作为自定义运行 ID。 UUIDv7 嵌入了时间戳，可保留跟踪中运行的正确时间顺序。 LangSmith SDK 导出一个 `uuid7` 帮助器（Python v0.4.43+、JS v0.3.80+）：

  * **Python**：`from langsmith import uuid7`
  * **JS/TS**: `import { uuid7 } from 'langsmith'`

  接受任何 UUID v7 字符串 - 如果您的系统已使用 UUID v7 标识符，您可以使用 SDK 帮助程序或您自己的字符串。
</Note>

使用以下其中一项：

* `@traceable`：调用 `@traceable` 函数时 (Python)，在 `langsmith_extra` 内传递 `run_id`，或在传递给 `traceable` 的配置对象中传递 `id` (TypeScript)：

  <CodeGroup>
    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langsmith import traceable, uuid7

    @traceable
    def my_pipeline(question: str) -> str:
        return "answer"

    run_id = uuid7()
    my_pipeline("What is the capital of France?", langsmith_extra={"run_id": run_id})

    # run_id can now be used to attach feedback, query the run, etc.
    ```

    ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { traceable } from "langsmith/traceable";
    import { uuid7 } from "langsmith";

    const runId = uuid7();

    const myPipeline = traceable(
    async (question: string) => {
        return "answer";
    },
    { name: "my-pipeline", id: runId }
    );

    await myPipeline("What is the capital of France?");

    // runId can now be used to attach feedback, query the run, etc.
    ```
  </CodeGroup>

* `trace` 上下文管理器（仅限 Python）：将 `run_id` 直接传递给 [trace](https://reference.langchain.com/python/langsmith/run_helpers/trace) 上下文管理器构造函数：

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import trace, uuid7

  run_id = uuid7()

  with trace("my-pipeline", run_id=run_id) as run:
      result = "answer"
      run.end(outputs={"result": result})

  # run_id can now be used to attach feedback, query the run, etc.
  ```

## 确保退出前所有跟踪都已提交LangSmith 在后台线程中执行跟踪，以避免阻碍您的生产应用程序。这意味着您的进程可能会在所有跟踪成功发布到 LangSmith 之前结束。请参考以下选项：

* 如果您使用LangChain，请参阅[LangChain tracing guide](/langsmith/trace-with-langchain#ensure-all-traces-are-submitted-before-exiting)。
* 如果您使用的是[LangSmith SDK](/langsmith/reference)独立版，则可以在退出前使用`flush`方法：

  <CodeGroup>
    ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langsmith import Client

    client = Client()

    @traceable(client=client)
    async def my_traced_func():
    # Your code here...
    pass

    try:
    await my_traced_func()
    finally:
    await client.flush()
    ```

    ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "langsmith";

    const langsmithClient = new Client({});

    const myTracedFunc = traceable(async () => {
    // Your code here...
    },{ client: langsmithClient });

    try {
    await myTracedFunc();
    } finally {
    await langsmithClient.flush();
    }
    ```
  </CodeGroup>

## 相关

* [Observability concepts](/langsmith/observability-concepts)：运行、跟踪和 LangSmith 数据模型的背景知识
* [Run (span) data format](/langsmith/run-data-format)：运行字段的架构参考，包括`dotted_order`、`trace_id`和`parent_run_id`
* [Log user feedback using the SDK](/langsmith/attach-user-feedback)：预先指定运行 ID 的常见用例
* [Access the current run (span) within a traced function](/langsmith/access-current-span)：从跟踪内部读取或修改活动运行
* [Log traces to a specific project](/langsmith/log-traces-to-project)：将跟踪路由到指定项目而不是`default`
* [Trace with API](/langsmith/trace-with-api)：SDK 的低级 REST API 替代品
* [Tracing Basics video](https://academy.langchain.com/pages/intro-to-langsmith-preview) 摘自朗史密斯入门课程

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotate-code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>