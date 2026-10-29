<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tracing quickstart | https://docs.langchain.com/langsmith/observability-quickstart -->

# 跟踪快速入门

在几分钟内将 LangSmith 跟踪添加到代理。

LangSmith 通过捕获 [*traces*](/langsmith/observability-concepts#traces) 为您提供对代理的端到端可见性；请求期间运行的每个步骤的完整记录，从传入的输入到返回的最终输出。

在本快速入门中，您将向 AI 助手添加跟踪并在 LangSmith 中查看结果。

跟踪属于工作空间内的[agent and one of its environments](/langsmith/agents)。本快速入门在 LangSmith 中创建代理，然后配置代码以将跟踪发送到其标识符和环境。兼容性说明涵盖旧工作区和自托管 LangSmith。

> [!提示]
>
> 如果您使用 [LangChain](https://docs.langchain.com/oss/python/langchain/overview) 或 [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) 进行构建，则可以使用单个环境变量启用 LangSmith 跟踪。请参阅[trace with LangChain](/langsmith/trace-with-langchain)或[trace with LangGraph](/langsmith/trace-with-langgraph)。

## 先决条件

在开始之前，请确保您拥有：

* **LangSmith帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart)注册或登录。
* **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
* **模型提供商 API 密钥**：从 Gemini 的 [OpenAI dashboard](https://platform.openai.com/account/api-keys)、[Claude Console](https://platform.claude.com/settings/keys) 或 [Google AI Studio](https://aistudio.google.com/apikey) 生成一个。

在每个步骤的选项卡中选择您的提供商。 Anthropic 和 Gemini 示例仅使用 Python 和 TypeScript，因为 LangSmith Java SDK 仅包装 OpenAI 客户端。

## 1. 设置您的环境1. 为代理代码创建目录，安装依赖项并配置所需的环境变量：

   **OpenAI**

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
   implementation("com.langchain.smith:langsmith-java:0.1.0-beta.27")
   ```

   **Anthropic**

   ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   mkdir ls-quickstart && cd ls-quickstart
   python -m venv .venv && source .venv/bin/activate
   pip install -U langsmith anthropic
   ```

   ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   mkdir ls-quickstart-ts && cd ls-quickstart-ts
   npm init -y
   npm install langsmith @anthropic-ai/sdk
   npm install -D typescript tsx
   ```

   **双子座**

   ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   mkdir ls-quickstart && cd ls-quickstart
   python -m venv .venv && source .venv/bin/activate
   pip install -U langsmith google-genai
   ```

   ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   mkdir ls-quickstart-ts && cd ls-quickstart-ts
   npm init -y
   npm install langsmith @google/genai
   npm install -D typescript tsx
   ```

2. 在 shell 中导出环境变量：

   **OpenAI**

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_TRACING=true
   export LANGSMITH_API_KEY="<your-langsmith-api-key>"
   export OPENAI_API_KEY="<your-openai-api-key>"
   ```

   **Anthropic**

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_TRACING=true
   export LANGSMITH_API_KEY="<your-langsmith-api-key>"
   export ANTHROPIC_API_KEY="<your-anthropic-api-key>"
   ```

   **双子座**

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_TRACING=true
   export LANGSMITH_API_KEY="<your-langsmith-api-key>"
   export GEMINI_API_KEY="<your-gemini-api-key>"
   ```

   在发送跟踪之前，请在LangSmith中创建代理：

   1. 在 [agent-based workspace](/langsmith/agents) 中，打开 **+ Agent**，选择 **Observability**，并使用 **Agent name** 和 **Agent ID** 创建一个 Agent。这需要`projects:create`许可。如果代理已存在，请重用它。
   2. 复制 **代理 ID** 并选择环境：`local`、`development`、`staging` 或 `production`。
   3. 在运行代理之前配置[agent addressing](/langsmith/log-traces-to-agent)：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      export LANGSMITH_AGENT_ID="<your-agent-id>"
      export LANGSMITH_AGENT_ENVIRONMENT="production"
      ```

   注册代理一次，而不是每次跟踪。从代码运行的环境中删除 `LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 和 `LANGCHAIN_SESSION`。请勿将旧目标设置与代理寻址结合起来。要使用 SDK 调用或 API 请求创建代理，请参阅 [Create an agent programmatically](/langsmith/create-an-agent#create-an-agent-programmatically)。> **基于项目的工作区和自托管 LangSmith**
   >
   > 代理寻址可在 LangSmith 云上基于代理的工作区中使用。在基于项目的工作区（包括自托管 LangSmith）中，将 `LANGSMITH_PROJECT` 设置为跟踪项目名称，而不是设置两个代理变量。

   > [!注意]
   >
   > 如果您的帐户位于美国以外的区域（默认），还需将 `LANGSMITH_ENDPOINT` 设置为您所在区域的 API URL。如果没有这个，您的 API 密钥将不会被识别，并且请求将无法通过身份验证。
   >
   > <table>
   > <thead>
   > <tr>
   > <th>地区</th>
   >
   > <th>
   > 网址
   > </th>
   > </tr>
   > </thead>
   >
   > <tbody>
   > <tr>
   > <td>GCP 美国</td>
   >
   > <td>
   > `https://api.smith.langchain.com`
   > </td>
   > </tr>
   >
   > <tr>
   > <td>GCP 欧盟</td>
   >
   > <td>
   > `https://eu.api.smith.langchain.com`
   > </td>
   > </tr>
   >
   > <tr>
   > <td>GCP 亚太地区</td>
   >
   > <td>
   > `https://apac.api.smith.langchain.com`
   > </td>
   > </tr>
   >
   > <tr>
   > <td>AWS 美国</td>
   >
   > <td>
   > `https://aws.api.smith.langchain.com`
   > </td>
   > </tr>
   > </tbody>> </table>
   >
   > 例如欧盟账户：`export LANGSMITH_ENDPOINT="https://eu.api.smith.langchain.com"`。

   对于其他提供商，请使用 [⟦T37⟧ decorator](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 手动跟踪呼叫。

## 2. 构建应用程序

以下应用程序使用两个LangSmith工具来添加跟踪：

* **提供程序包装器**：包装 [OpenAI](/langsmith/trace-openai)、[Anthropic](/langsmith/trace-anthropic) 或 [Gemini](/langsmith/trace-with-google-gemini) 客户端，以便每个 LLM 调用都会自动记录为嵌套范围。 Gemini 包装位于[beta](/langsmith/release-stages)。
* **可跟踪包装器**：包装函数，使其输入、输出和任何嵌套跨度在 LangSmith 中显示为单个跟踪。在 Python 中使用 `@traceable`，在 TypeScript 和 Kotlin 中使用 `traceable`，在 Java 中使用 `Tracing.traceFunction`。

`assistant` 函数调用工具 (`get_context`) 来检索相关上下文，然后将该上下文传递给模型。在这两个函数上使用可跟踪包装器可以在一次跟踪中捕获完整的管道，并将工具调用和 LLM 调用作为嵌套跨度。

使用以下代码创建名为 `app.py`、`index.ts`、`App.java` 或 `App.kt` 的文件：

**OpenAI**

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
        model="gpt-6-luna",
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

```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
        model: "gpt-6-luna",
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
                              .model(ChatModel.GPT_5_5)
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
                        .model(ChatModel.GPT_5_5)
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

**Anthropic**

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from anthropic import Anthropic
from langsmith.wrappers import wrap_anthropic
from langsmith import traceable

client = wrap_anthropic(Anthropic())  # log every Anthropic call automatically

@traceable(run_type="tool")  # trace this as a tool span
def get_context(question: str) -> str:
    # In a real app, this would query a knowledge base or vector store
    return "LangSmith traces are stored for 14 days on the Developer plan."

@traceable  # capture the full pipeline as a single trace
def assistant(question: str) -> str:
    context = get_context(question)
    response = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1024,
        system=f"Answer using the context below.\n\nContext: {context}",
        messages=[{"role": "user", "content": question}],
    )
    return "".join(block.text for block in response.content if block.type == "text")

if __name__ == "__main__":
    print(assistant("How long are LangSmith traces stored?"))
```

```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic } from "langsmith/wrappers/anthropic";
import { traceable } from "langsmith/traceable";

const client = wrapAnthropic(new Anthropic()); // log every Anthropic call automatically

const getContext = traceable(
    async function getContext(question: string): Promise<string> { // trace this as a tool span
        // In a real app, this would query a knowledge base or vector store
        return "LangSmith traces are stored for 14 days on the Developer plan.";
    },
    { run_type: "tool" }
);

const assistant = traceable(async function assistant(question: string) { // capture the full pipeline as a single trace
    const context = await getContext(question);
    const response = await client.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 1024,
        system: `Answer using the context below.\n\nContext: ${context}`,
        messages: [{ role: "user", content: question }],
    });
    const block = response.content[0];
    return block?.type === "text" ? block.text : null;
});

(async () => {
    console.log(await assistant("How long are LangSmith traces stored?"));
})();
```

**双子座**

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from google import genai
from langsmith.wrappers import wrap_gemini
from langsmith import traceable

client = wrap_gemini(genai.Client())  # log every Gemini call automatically

@traceable(run_type="tool")  # trace this as a tool span
def get_context(question: str) -> str:
    # In a real app, this would query a knowledge base or vector store
    return "LangSmith traces are stored for 14 days on the Developer plan."

@traceable  # capture the full pipeline as a single trace
def assistant(question: str) -> str:
    context = get_context(question)
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=question,
        config={"system_instruction": f"Answer using the context below.\n\nContext: {context}"},
    )
    return response.text

if __name__ == "__main__":
    print(assistant("How long are LangSmith traces stored?"))
```

```ts TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { GoogleGenAI } from "@google/genai";
import { wrapGemini } from "langsmith/wrappers/gemini";
import { traceable } from "langsmith/traceable";

const client = wrapGemini(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })); // log every Gemini call automatically

const getContext = traceable(
    async function getContext(question: string): Promise<string> { // trace this as a tool span
        // In a real app, this would query a knowledge base or vector store
        return "LangSmith traces are stored for 14 days on the Developer plan.";
    },
    { run_type: "tool" }
);

const assistant = traceable(async function assistant(question: string) { // capture the full pipeline as a single trace
    const context = await getContext(question);
    const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: question,
        config: { systemInstruction: `Answer using the context below.\n\nContext: ${context}` },
    });
    return response.text ?? null;
});

(async () => {
    console.log(await assistant("How long are LangSmith traces stored?"));
})();
```

## 3. 运行应用程序

```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python app.py
```

```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx tsx index.ts
```

```bash Java/Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./gradlew run
```

## 4. 查看您的踪迹在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-quickstart)中，选择您的代理，转到**跟踪**，然后选择在设置过程中配置的环境。在基于项目的工作区中，打开名为 `LANGSMITH_PROJECT` 的项目。欲了解更多信息，请参阅[Navigate agents](/langsmith/navigate-agents)。

单击`assistant`行打开跟踪。 **轨迹**选项卡显示发送到模型的对话。选择 **详细信息** 选项卡可查看完整的运行树，包括带有 `get_context` 工具调用的 `assistant` 函数以及嵌套在其中的模型调用。

![LangSmith UI showing a trace with an outer agent span and a nested LLM call span.](https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/trace-quickstart-app.png?fit=max\&auto=format\&n=EKYgNtnIIDPnseTv\&q=85\&s=35b19b5e1e978d13cdbb61058334eeb4)

外部跨度捕获 `assistant` 函数的输入和输出。嵌套 **get\_context** 范围（TypeScript 中的 **getContext**）记录工具调用，模型范围（**ChatOpenAI**、**ChatAnthropic** 或 **ChatGoogleGenerativeAI**）记录发送到模型的确切提示和返回的响应。

> [!提示]
>
> 您还可以使用[LangSmith CLI](/langsmith/langsmith-cli)从终端检查痕迹。

## 后续步骤

* [Tracing integrations](/langsmith/integrations)：LangChain、LangGraph、Anthropic 和其他提供商。
* [Trace an agent](/langsmith/observability-llm-tutorial)：完整的生命周期教程，从原型设计到生产。
* [Filter traces](/langsmith/filter-traces)：在代理环境中搜索痕迹。
* [Log traces to an agent](/langsmith/log-traces-to-agent)：通过代码或环境变量配置代理和环境。
* [Agents](/langsmith/agents)：工作空间如何组织代理及其环境。记录跟踪后，使用 **[Chat](/langsmith/chat)** 对其进行分析，并获得人工智能支持的代理性能洞察。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。