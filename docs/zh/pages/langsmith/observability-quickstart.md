<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tracing quickstart | https://docs.langchain.com/langsmith/observability-quickstart -->

# 跟踪快速入门

只需几分钟即可将 LangSmith 跟踪添加到 LLM 申请中。

LangSmith 通过捕获 [*traces*](/langsmith/observability-concepts#traces) 为您提供 LLM 申请的端到端可见性；请求期间运行的每个步骤的完整记录，从传入的输入到返回的最终输出。

在本快速入门中，您将向 AI 助手添加跟踪并在 LangSmith 中查看结果。

<Tip>
  如果您使用 [LangChain](https://docs.langchain.com/oss/python/langchain/overview) 或 [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) 进行构建，则可以使用单个环境变量启用 LangSmith 跟踪。请参阅[trace with LangChain](/langsmith/trace-with-langchain)或[trace with LangGraph](/langsmith/trace-with-langgraph)。
</Tip>

## 先决条件

在开始之前，请确保您拥有：

* **LangSmith帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart)注册或登录。
* **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
* **OpenAI API 密钥**：从 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 生成。

此示例使用 OpenAI 作为 LLM 提供商。您可以根据自己的提供商进行调整。

## 1. 设置您的环境

1、创建项目目录，安装依赖，并配置所需的环境变量：

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     mkdir ls-quickstart && cd ls-quickstart
     python -m venv .venv && source .venv/bin/activate
     pip install -U langsmith openai
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     mkdir ls-quickstart-ts && cd ls-quickstart-ts
     npm init -y
     npm install langsmith openai
     npm install -D typescript tsx
     ```

     ```kotlin Java/Kotlin (Gradle) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     implementation("com.langchain.smith:langsmith-java:0.1.0-alpha.28")
     ```
   </CodeGroup>

2. 在 shell 中导出环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_TRACING=true
   export LANGSMITH_API_KEY="<your-langsmith-api-key>"
   export OPENAI_API_KEY="<your-openai-api-key>"
   ```要将跟踪发送到特定项目，请使用[⟦T11⟧ environment variable](/langsmith/log-traces-to-project)。如果未设置，LangSmith 将在跟踪摄取时自动创建默认跟踪项目。

   <Note>
     如果您的帐户位于美国以外的区域（默认），还需将 `LANGSMITH_ENDPOINT` 设置为您所在区域的 API URL。如果没有这个，您的 API 密钥将不会被识别，并且请求将无法通过身份验证。

     <table>
       <thead>
         <tr>
           <th>地区</th>
         </tr>
       </thead>

       <tbody>
         <tr>
           <td>GCP 美国</td>
         </tr>

         <tr>
           <td>GCP 欧盟</td>
         </tr>

         <tr>
           <td>GCP 亚太地区</td>
         </tr>

         <tr>
           <td>AWS 美国</td>
         </tr>
       </tbody>
     </table>

     例如，欧盟账户：`export LANGSMITH_ENDPOINT="https://eu.api.smith.langchain.com"`。不要在 URL 中添加尾部斜杠，因为这可能会导致身份验证错误。
   </Note>

   如果您使用Anthropic，请使用[Anthropic wrapper](/langsmith/trace-anthropic)。如果您使用的是 Google Gemini，请使用 [Gemini wrapper](/langsmith/trace-with-google-gemini)。对于其他提供商，请使用 [⟦T14⟧ decorator](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 手动跟踪呼叫。

## 2. 构建应用程序

以下应用程序使用两个LangSmith工具来添加跟踪：* **OpenAI 包装器**：包装 OpenAI 客户端，因此每个 LLM 调用都会自动记录为嵌套范围。
* **可跟踪包装器**：包装函数，使其输入、输出和任何嵌套跨度在 LangSmith 中显示为单个跟踪。在 Python 中使用 `@traceable`，在 TypeScript 和 Kotlin 中使用 `traceable`，在 Java 中使用 `Tracing.traceFunction`。

`assistant` 函数调用工具 (`get_context`) 来检索相关上下文，然后将该上下文传递给模型。在这两个函数上使用可跟踪包装器可以在一次跟踪中捕获完整的管道，并将工具调用和 LLM 调用作为嵌套跨度。

使用以下代码创建一个名为 `app.py`、`index.ts`、`App.java` 或 `App.kt` 的文件：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from openai import OpenAI
  from langsmith.wrappers import wrap_openai
  from langsmith import traceable

  client = wrap_openai(OpenAI())  # log every OpenAI call automatically

  @traceable(run_type="tool")  # trace this as a tool span
  def get_context(question: str) -> str:
      # In a real app, this would query a knowledge base or vector store
      return "LangSmith traces are stored for 14 days on the Developer plan."

  @traceable  # capture the full pipeline as a single trace
  def assistant(question: str) -> str:
      context = get_context(question)
      response = client.chat.completions.create(
          model="gpt-5.4-mini",
          messages=[
              {
                  "role": "system",
                  "content": f"Answer using the context below.\n\nContext: {context}",
              },
              {"role": "user", "content": question},
          ],
      )
      return response.choices[0].message.content

  if __name__ == "__main__":
      print(assistant("How long are LangSmith traces stored?"))
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { wrapOpenAI } from "langsmith/wrappers";
  import { traceable } from "langsmith/traceable";

  const client = wrapOpenAI(new OpenAI()); // log every OpenAI call automatically

  const getContext = traceable(
      async function getContext(question: string): Promise<string> { // trace this as a tool span
          // In a real app, this would query a knowledge base or vector store
          return "LangSmith traces are stored for 14 days on the Developer plan.";
      },
      { run_type: "tool" }
  );

  const assistant = traceable(async function assistant(question: string) { // capture the full pipeline as a single trace
      const context = await getContext(question);
      const response = await client.chat.completions.create({
          model: "gpt-5.4-mini",
          messages: [
              {
                  role: "system",
                  content: `Answer using the context below.\n\nContext: ${context}`,
              },
              { role: "user", content: question },
          ],
      });
      return response.choices[0]?.message?.content ?? null;
  });

  (async () => {
      console.log(await assistant("How long are LangSmith traces stored?"));
  })();
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import com.langchain.smith.wrappers.openai.OpenAITracing;
  import com.openai.client.OpenAIClient;
  import com.openai.client.okhttp.OpenAIOkHttpClient;
  import com.openai.models.ChatModel;
  import com.openai.models.chat.completions.ChatCompletion;
  import com.openai.models.chat.completions.ChatCompletionCreateParams;
  import com.openai.models.chat.completions.ChatCompletionMessageParam;
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam;
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
  import java.util.function.Function;

  class ObservabilityQuickstartApp {
    public static void main(String[] args) {
      new ObservabilityQuickstartRunner().run();
    }

    private static final class ObservabilityQuickstartRunner {
      private final OpenAIClient client =
          OpenAITracing.wrapOpenAI(OpenAIOkHttpClient.fromEnv());

      private final Function<String, String> getContext =
          Tracing.traceFunction(
              question -> "LangSmith traces are stored for 14 days on the Developer plan.",
              TraceConfig.builder().name("get_context").runType(RunType.TOOL).build());

      private final Function<String, String> assistant =
          Tracing.traceFunction(
              question -> {
                String context = getContext.apply(question);
                ChatCompletion response =
                    client.chat()
                        .completions()
                        .create(
                            ChatCompletionCreateParams.builder()
                                .model(ChatModel.GPT_5_CHAT_LATEST)
                                .addMessage(
                                    ChatCompletionMessageParam.ofSystem(
                                        ChatCompletionSystemMessageParam.builder()
                                            .content(
                                                "Answer using the context below.\n\nContext: " + context)
                                            .build()))
                                .addMessage(
                                    ChatCompletionMessageParam.ofUser(
                                        ChatCompletionUserMessageParam.builder()
                                            .content(question)
                                            .build()))
                                .build());
                return response.choices().get(0).message().content().orElse("");
              },
              TraceConfig.builder().name("assistant").build());

      void run() {
        System.out.println(assistant.apply("How long are LangSmith traces stored?"));
      }
    }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.traceable
  import com.langchain.smith.wrappers.openai.wrapOpenAI
  import com.openai.client.okhttp.OpenAIOkHttpClient
  import com.openai.models.ChatModel
  import com.openai.models.chat.completions.ChatCompletionCreateParams
  import com.openai.models.chat.completions.ChatCompletionMessageParam
  import com.openai.models.chat.completions.ChatCompletionSystemMessageParam
  import com.openai.models.chat.completions.ChatCompletionUserMessageParam
  import kotlin.jvm.optionals.getOrNull

  val client = wrapOpenAI(OpenAIOkHttpClient.fromEnv())

  val getContext =
      traceable(
          { _: String -> "LangSmith traces are stored for 14 days on the Developer plan." },
          TraceConfig.builder().name("get_context").runType(RunType.TOOL).build(),
      )

  val assistant =
      traceable(
          { question: String ->
              val context = getContext(question)
              val response =
                  client.chat().completions().create(
                      ChatCompletionCreateParams.builder()
                          .model(ChatModel.GPT_5_CHAT_LATEST)
                          .addMessage(
                              ChatCompletionMessageParam.ofSystem(
                                  ChatCompletionSystemMessageParam.builder()
                                      .content("Answer using the context below.\n\nContext: $context")
                                      .build(),
                              ),
                          )
                          .addMessage(
                              ChatCompletionMessageParam.ofUser(
                                  ChatCompletionUserMessageParam.builder()
                                      .content(question)
                                      .build(),
                              ),
                          )
                          .build(),
                  )
              response.choices()[0].message().content().getOrNull().orEmpty()
          },
          TraceConfig.builder().name("assistant").build(),
      )

  println(assistant("How long are LangSmith traces stored?"))
  ```
</CodeGroup>

## 3. 运行应用程序

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  python app.py
  ```

  ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npx tsx index.ts
  ```

  ```bash Java/Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  ./gradlew run
  ```
</CodeGroup>

## 4. 查看您的踪迹

在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart)中，转到**跟踪**并选择您的**默认**项目。单击 `assistant` 行打开跟踪。 **消息** 选项卡显示发送到模型的对话。选择 **详细信息** 选项卡可查看完整的运行树，包括带有 `get_context` 工具调用的 `assistant` 函数以及嵌套在其中的 OpenAI 调用。

<img alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." />

<img alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." />外部跨度捕获 `assistant` 函数的输入和输出。嵌套的 **get\_context** 范围记录工具调用，而 **ChatOpenAI** 范围记录发送到模型的确切提示和返回的响应。

<Tip>
  您还可以使用[LangSmith CLI](/langsmith/langsmith-cli)从终端检查痕迹。
</Tip>

## 后续步骤

* [Tracing integrations](/langsmith/integrations)：LangChain、LangGraph、Anthropic 和其他提供商。
* [Trace an LLM application](/langsmith/observability-llm-tutorial)：完整的生命周期教程，从原型设计到生产。
* [Filter traces](/langsmith/filter-traces-in-application)：搜索和导航大型跟踪项目。
* [Log to a specific project](/langsmith/log-traces-to-project)：将跟踪发送到指定项目而不是**默认**。

<Callout type="info" icon="feather">
  记录跟踪后，使用 **[Chat](/langsmith/chat)** 对其进行分析，并获得 AI 支持的应用程序性能洞察。
</Callout>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>