<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Models | https://docs.langchain.com/oss/javascript/langchain/models -->

# 型号

[LLMs](https://en.wikipedia.org/wiki/Large_language_model) 是强大的人工智能工具，可以像人类一样解释和生成文本。他们用途广泛，足以编写内容、翻译语言、总结和回答问题，而无需针对每项任务进行专门培训。

除了文本生成之外，许多模型还支持：

* <Icon icon="hammer" /> [Tool calling](#tool-calling) - 调用外部工具（如数据库查询或 API 调用）并在其响应中使用结果。
* <Icon icon="layout-grid" /> [Structured output](#structured-output) - 模型的响应被限制为遵循定义的格式。
* <Icon icon="photo" /> [Multimodality](#multimodal) - 处理并返回除文本之外的数据，例如图像、音频和视频。
* <Icon icon="brain" /> [Reasoning](#reasoning) - 模型执行多步骤推理以得出结论。

模型是[agents](/oss/javascript/langchain/agents)的推理引擎。它们驱动代理的决策过程，确定调用哪些工具、如何解释结果以及何时提供最终答案。

您选择的模型的质量和功能直接影响代理的基线可靠性和性能。不同的模型擅长不同的任务——一些模型更擅长遵循复杂的指令，另一些模型更擅长结构化推理，还有一些模型支持更大的上下文窗口来处理更多信息。LangChain 的标准模型接口使您可以访问许多不同的提供商集成，这使得您可以轻松地在模型之间进行试验和切换，以找到最适合您的用例的模型。

有关特定于提供商的集成信息和功能，请参阅提供商的 [chat model page](/oss/javascript/integrations/chat)。

<Tip>
  [LangSmith](/langsmith/observability) 跟踪每个模型调用，以便您可以比较提供程序、检查工具路由和调试故障。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。
</Tip>

## 基本用法

模型可以通过两种方式使用：

1. **使用代理** - 创建[agent](/oss/javascript/langchain/agents#model)时可以动态指定模型。
2. **独立** - 可以直接调用模型（在代理循环之外）执行文本生成、分类或提取等任务，无需代理框架。

相同的模型界面适用于两种上下文，这使您可以灵活地从简单开始并根据需要扩展到更复杂的基于代理的工作流程。

### 初始化模型

在 LangChain 中开始使用独立模型的最简单方法是使用 `initChatModel` 从您选择的 [chat model provider](/oss/javascript/integrations/chat) 中初始化一个模型（示例如下）：<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/javascript/integrations/chat/openai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/openai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/openai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.OPENAI_API_KEY = "your-api-key";

      const model = await initChatModel("gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatOpenAI } from "@langchain/openai";

      const model = new ChatOpenAI({
        model: "gpt-5.5",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/javascript/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/anthropic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/anthropic
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/anthropic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/anthropic
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.ANTHROPIC_API_KEY = "your-api-key";

      const model = await initChatModel("claude-sonnet-4-6");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatAnthropic } from "@langchain/anthropic";

      const model = new ChatAnthropic({
        model: "claude-sonnet-4-6",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/javascript/integrations/chat/azure/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/azure
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/azure
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/azure
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/azure
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.AZURE_OPENAI_API_KEY = "your-api-key";
      process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
      process.env.OPENAI_API_VERSION = "your-api-version";

      const model = await initChatModel("azure_openai:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { AzureChatOpenAI } from "@langchain/openai";

      const model = new AzureChatOpenAI({
        model: "gpt-5.5",
        azureOpenAIApiKey: "your-api-key",
        azureOpenAIApiEndpoint: "your-endpoint",
        azureOpenAIApiVersion: "your-api-version"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/javascript/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/google-genai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/google-genai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/google-genai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.GOOGLE_API_KEY = "your-api-key";

      const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Bedrock Converse">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/javascript/integrations/chat/bedrock_converse/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/aws
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/aws
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/aws
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = await initChatModel("bedrock:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatBedrockConverse } from "@langchain/aws";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = new ChatBedrockConverse({
        model: "gpt-5.5",
        region: "us-east-2"
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Why do parrots talk?");
```

有关更多详细信息，请参阅[⟦T68⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel)，包括有关如何传递模型[parameters](#parameters)的信息。

### 支持的提供商和模型LangChain通过专用集成包支持所有主要模型提供商。每个提供程序包都实现相同的标准接口，因此您可以交换提供程序而无需重写应用程序逻辑。新模型名称立即生效——无需更新 LangChain——因为提供商包将模型名称直接传递到提供商的 API。

浏览[full list of supported providers](/oss/javascript/integrations/providers/overview)，或参阅[Providers and models](/oss/javascript/concepts/providers-and-models)，了解提供者、包和模型名称如何在 LangChain 中协同工作的概念概述。

### 关键方法

<Card title="Invoke" href="#invoke" icon="send">
  该模型将消息作为输入，并在生成完整响应后输出消息。
</Card>

<Card title="Stream" href="#stream" icon="broadcast">
  调用模型，但实时生成输出。
</Card>

<Card title="Batch" href="#batch" icon="grip-vertical">
  批量向模型发送多个请求，以实现更高效的处理。
</Card>

<Info>
  除了聊天模型之外，LangChain还提供对其他相邻技术的支持，例如嵌入模型和向量存储。详情请参阅[integrations page](/oss/javascript/integrations/providers/overview)。
</Info>

## 参数

聊天模型采用可用于配置其行为的参数。支持的全套参数因型号和提供商而异，但标准参数包括：<ParamField type="string">
  您想要与提供商一起使用的特定模型的名称或标识符。您还可以使用“:”格式在单个参数中指定模型及其提供者，例如“openai:o1”。
</ParamField>

<ParamField type="string">
  与模型提供者进行身份验证所需的密钥。这通常是在您注册访问模型时发出的。通常通过设置<Tooltip>环境变量</Tooltip>来访问。
</ParamField>

<ParamField type="number">
  控制模型输出的随机性。数字越高，反应越有创意；较低的值使它们更具确定性。
</ParamField>

<ParamField type="number">
  限制响应中<Tooltip>tokens</Tooltip>的总数，有效控制输出的长度。
</ParamField>

<ParamField type="number">
  取消请求之前等待模型响应的最长时间（以秒为单位）。
</ParamField><ParamField type="number">
  如果由于网络超时或速率限制等问题导致请求失败，系统将尝试重新发送请求的最大次数。重试使用带有抖动的指数退避。网络错误、速率限制 (429) 和服务器错误 (5xx) 会自动重试。不会重试 401（未经授权）或 404 等客户端错误。对于不可靠网络上长时间运行的 [agent](/oss/javascript/deepagents/overview) 任务，请考虑将其增加到 10-15。
</ParamField>

使用 `initChatModel`，将这些参数作为内联参数传递：

```typescript Initialize using model parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const model = await initChatModel(
    "claude-sonnet-4-6",
    { temperature: 0.7, timeout: 30, maxTokens: 1000, maxRetries: 6 }
)
```

### 连接弹性

LangChain聊天模型通过指数退避自动重试失败的API请求。默认情况下，模型针对网络错误、速率限制 (429) 和服务器错误 (5xx) 最多重试 **6 次**。不会重试 401（未经授权）或 404 等客户端错误。

您可以在创建模型时调整 `maxRetries` 和 `timeout`，然后将该实例传递给 `createAgent`、`createDeepAgent`，或将其独立调用：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatAnthropic } from "@langchain/anthropic";

const model = new ChatAnthropic({
  model: "google_genai:gemini-3.6-flash",
  maxRetries: 10, // Increase for unreliable networks (default: 6)
  timeout: 120_000, // Milliseconds; increase for slow connections
});
```

<Tip>
  对于不可靠网络上长时间运行的代理图，请考虑更高的 `max_retries`（例如 10-15）和 [checkpointer](/oss/javascript/langgraph/persistence)，以便在发生故障时保留进度。
</Tip><Info>
  每个聊天模型集成可能具有用于控制特定于提供者的功能的附加参数。

  例如，[⟦T75⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)有`use_responses_api`来指示是否使用OpenAI Responses或Completions API。

  要查找给定聊天模型支持的所有参数，请前往 [chat model integrations](/oss/javascript/integrations/chat) 页面。
</Info>

***

## 调用

必须调用聊天模型才能生成输出。共有三种主要的调用方法，每种方法适合不同的用例。

### 调用

调用模型最直接的方法是将 [⟦T77⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#invoke) 与单个消息或消息列表一起使用。

```typescript Single message theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Why do parrots have colorful feathers?");
console.log(response);
```

可以向聊天模型提供消息列表来表示对话历史记录。每条消息都有一个角色，模型使用该角色来指示对话中消息的发送者。

有关角色、类型和内容的更多详细信息，请参阅 [messages](/oss/javascript/langchain/messages) 指南。

```typescript Object format theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const conversation = [
  { role: "system", content: "You are a helpful assistant that translates English to French." },
  { role: "user", content: "Translate: I love programming." },
  { role: "assistant", content: "J'adore la programmation." },
  { role: "user", content: "Translate: I love building applications." },
];

const response = await model.invoke(conversation);
console.log(response);  // AIMessage("J'adore créer des applications.")
```

```typescript Message objects theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage, AIMessage, SystemMessage } from "langchain";

const conversation = [
  new SystemMessage("You are a helpful assistant that translates English to French."),
  new HumanMessage("Translate: I love programming."),
  new AIMessage("J'adore la programmation."),
  new HumanMessage("Translate: I love building applications."),
];

const response = await model.invoke(conversation);
console.log(response);  // AIMessage("J'adore créer des applications.")
```

<Info>
  如果您的调用的返回类型是字符串，请确保您使用的是聊天模型而不是 LLM。传统的文本完成法学硕士直接返回字符串。 LangChain聊天模型以“Chat”为前缀，例如[⟦T78⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)(/oss/integrations/chat/openai)。
</Info>

### 流大多数模型可以在生成输出内容时流式传输。通过逐步显示输出，流式传输显着改善了用户体验，特别是对于较长的响应。

调用 [⟦T79⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#stream) 返回一个 <Tooltip>iterator</Tooltip>，它在生成输出块时生成它们。您可以使用循环来实时处理每个块：

<CodeGroup>
  ```typescript Basic text streaming theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const stream = await model.stream("Why do parrots have colorful feathers?");
  for await (const chunk of stream) {
    console.log(chunk.text)
  }
  ```

  ```typescript Stream tool calls, reasoning, and other content theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const stream = await model.stream("What color is the sky?");
  for await (const chunk of stream) {
    for (const block of chunk.contentBlocks) {
      if (block.type === "reasoning") {
        console.log(`Reasoning: ${block.reasoning}`);
      } else if (block.type === "tool_call_chunk") {
        console.log(`Tool call chunk: ${block}`);
      } else if (block.type === "text") {
        console.log(block.text);
      } else {
        ...
      }
    }
  }
  ```
</CodeGroup>

与 [⟦T80⟧](#invoke) 不同，[⟦T80⟧](#invoke) 在模型完成生成完整响应后返回单个 [⟦T81⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage)，`stream()` 返回多个 [⟦T83⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessageChunk) 对象，每个对象包含输出文本的一部分。重要的是，流中的每个块都被设计为通过求和收集成完整的消息：

```typescript Construct AIMessage theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
let full: AIMessageChunk | null = null;
for await (const chunk of stream) {
  full = full ? full.concat(chunk) : chunk;
  console.log(full.text);
}

// The
// The sky
// The sky is
// The sky is typically
// The sky is typically blue
// ...

console.log(full.contentBlocks);
// [{"type": "text", "text": "The sky is typically blue..."}]
```

生成的消息可以被视为与使用[⟦T84⟧](#invoke)生成的消息相同，例如，它可以聚合到消息历史记录中并作为会话上下文传递回模型。

<Warning>
  仅当程序中的所有步骤都知道如何处理块流时，流式处理才有效。例如，不支持流式传输的应用程序需要将整个输出存储在内存中才能进行处理。
</Warning><Accordion title="Advanced streaming topics">
  <Accordion title="Streaming events">
    LangChain 聊天模型还可以使用流语义事件
    \[`streamEvents()`]\[BaseChatModel.streamEvents]。

    这简化了基于事件类型和其他元数据的过滤，并将在后台聚合完整消息。请参阅下面的示例。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const stream = await model.streamEvents("Hello");
    for await (const event of stream) {
        if (event.event === "on_chat_model_start") {
            console.log(`Input: ${event.data.input}`);
        }
        if (event.event === "on_chat_model_stream") {
            console.log(`Token: ${event.data.chunk.text}`);
        }
        if (event.event === "on_chat_model_end") {
            console.log(`Full message: ${event.data.output.text}`);
        }
    }
    ```

    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Input: Hello
    Token: Hi
    Token:  there
    Token: !
    Token:  How
    Token:  can
    Token:  I
    ...
    Full message: Hi there! How can I help today?
    ```

    有关事件类型和其他详细信息，请参阅[⟦T86⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#streamEvents)参考。
  </Accordion>

  <Accordion title="&#x22;Auto-streaming&#x22; chat models">
    LangChain 通过在某些情况下自动启用流模式来简化聊天模型的流，即使您没有显式调用流方法。当您使用非流式调用方法但仍希望流式传输整个应用程序（包括聊天模型的中间结果）时，这特别有用。

    例如，在[LangGraph agents](/oss/javascript/langchain/agents)中，您可以在节点内调用`model.invoke()`，但如果运行在流模式下，LangChain会自动委托给流。

    #### 它是如何工作的当您使用`invoke()`聊天模式时，如果LangChain检测到您正在尝试对整个应用程序进行流式传输，则会自动切换到内部流式传输模式。就使用 invoke 的代码而言，调用的结果将是相同的；然而，当聊天模型被流式传输时，LangChain将负责调用LangChain回调系统中的[⟦T89⟧](https://reference.langchain.com/javascript/interfaces/_langchain_core.callbacks_base.BaseCallbackHandlerMethods.html#onLlmNewToken)事件。

    回调事件允许 LangGraph `stream()` 和 `streamEvents()` 实时显示聊天模型的输出。
  </Accordion>
</Accordion>

### 批次

将一组独立请求批量发送到模型可以显着提高性能并降低成本，因为处理可以并行完成：

```typescript Batch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const responses = await model.batch([
  "Why do parrots have colorful feathers?",
  "How do airplanes fly?",
  "What is quantum computing?",
  "Why do parrots have colorful feathers?",
  "How do airplanes fly?",
  "What is quantum computing?",
]);
for (const response of responses) {
  console.log(response);
}
```

<Tip>
  当使用`batch()`处理大量输入时，您可能需要控制最大并行调用数。这可以通过设置 [⟦T94⟧](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableConfig) 字典中的 `maxConcurrency` 属性来完成。

  ```typescript Batch with max concurrency theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  model.batch(
    listOfInputs,
    {
      maxConcurrency: 5,  // Limit to 5 parallel calls
    }
  )
  ```

  有关受支持属性的完整列表，请参阅 [⟦T95⟧](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableConfig) 参考。
</Tip>

有关批处理的更多详细信息，请参阅[reference](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#batch)。

***

## 工具调用

模型可以请求调用执行从数据库获取数据、搜索网络或运行代码等任务的工具。工具是以下各项的配对：1. 模式，包括工具名称、描述和/或参数定义（通常是 JSON 模式）
2. 要执行的函数或<Tooltip>coroutine</Tooltip>。

<Note>
  您可能听说过“函数调用”这个术语。我们可以将其与“工具调用”互换使用。
</Note>

以下是用户和模型之间的基本工具调用流程：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant U as User
    participant M as Model
    participant T as Tools

    U->>M: "What's the weather in SF and NYC?"
    M->>M: Analyze request & decide tools needed

    par Parallel Tool Calls
        M->>T: getWeather("San Francisco")
        M->>T: getWeather("New York")
    end

    par Tool Execution
        T-->>M: SF weather data
        T-->>M: NYC weather data
    end

    M->>M: Process results & generate response
    M->>U: "SF: 72°F sunny, NYC: 68°F cloudy"
```

要使您定义的工具可供模型使用，您必须使用 [⟦T96⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#bindTools) 绑定它们。在后续调用中，模型可以根据需要选择调用任何绑定的工具。

一些模型提供者提供<Tooltip>内置工具</Tooltip>，可以通过模型或调用参数启用（例如[⟦T97⟧](/oss/javascript/integrations/chat/openai)、[⟦T98⟧](/oss/javascript/integrations/chat/anthropic)）。详情请查看相应的[provider reference](/oss/javascript/integrations/providers/overview)。

<Tip>
  有关创建工具的详细信息和其他选项，请参阅[tools guide](/oss/javascript/langchain/tools)。
</Tip>

```typescript Binding user tools theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";
import { ChatOpenAI } from "@langchain/openai";

const getWeather = tool(
  (input) => `It's sunny in ${input.location}.`,
  {
    name: "get_weather",
    description: "Get the weather at a location.",
    schema: z.object({
      location: z.string().describe("The location to get the weather for"),
    }),
  },
);

const model = new ChatOpenAI({ model: "gpt-5.5" });
const modelWithTools = model.bindTools([getWeather]);  // [!code highlight]

const response = await modelWithTools.invoke("What's the weather like in Boston?");
const toolCalls = response.tool_calls || [];
for (const tool_call of toolCalls) {
  // View tool calls made by the model
  console.log(`Tool: ${tool_call.name}`);
  console.log(`Args: ${tool_call.args}`);
}
```

绑定用户定义的工具时，模型的响应包括执行工具的**请求**。当与[agent](/oss/javascript/langchain/agents)分开使用模型时，您可以执行请求的工具并将结果返回给模型以供后续推理使用。使用[agent](/oss/javascript/langchain/agents)时，代理循环将为您处理工具执行循环。

下面，我们展示了一些使用工具调用的常见方法。<AccordionGroup>
  <Accordion title="Tool execution loop" icon="refresh">
    当模型返回工具调用时，您需要执行工具并将结果传递回模型。这会创建一个对话循环，模型可以在其中使用工具结果生成最终响应。 LangChain 包含为您处理此编排的[agent](/oss/javascript/langchain/agents) 抽象。

    以下是如何执行此操作的简单示例：

    ```typescript Tool execution loop theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    // Bind (potentially multiple) tools to the model
    const modelWithTools = model.bindTools([get_weather])

    // Step 1: Model generates tool calls
    const messages = [{"role": "user", "content": "What's the weather in Boston?"}]
    const ai_msg = await modelWithTools.invoke(messages)
    messages.push(ai_msg)

    // Step 2: Execute tools and collect results
    for (const tool_call of ai_msg.tool_calls) {
        // Execute the tool with the generated arguments
        const tool_result = await get_weather.invoke(tool_call)
        messages.push(tool_result)
    }

    // Step 3: Pass results back to model for final response
    const final_response = await modelWithTools.invoke(messages)
    console.log(final_response.text)
    // "The current weather in Boston is 72°F and sunny."
    ```

    该工具返回的每个[⟦T99⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)都包含一个与原始工具调用匹配的`tool_call_id`，帮助模型将结果与请求关联起来。
  </Accordion>

  <Accordion title="Forcing tool calls" icon="asterisk">
    默认情况下，模型可以根据用户的输入自由选择要使用的绑定工具。但是，您可能想要强制选择一个工具，确保模型使用特定工具或给定列表中的**任何**工具：

    <CodeGroup>
      ```typescript Force use of any tool theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      const modelWithTools = model.bindTools([tool_1], { toolChoice: "any" })
      ```

      ```typescript Force use of specific tools theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      const modelWithTools = model.bindTools([tool_1], { toolChoice: "tool_1" })
      ```
    </CodeGroup>
  </Accordion>

  <Accordion title="Parallel tool calls" icon="stack-2">
    许多模型支持在适当的时候并行调用多个工具。这允许模型同时从不同来源收集信息。

    ```typescript Parallel tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const modelWithTools = model.bind_tools([get_weather])

    const response = await modelWithTools.invoke(
        "What's the weather in Boston and Tokyo?"
    )


    // The model may generate multiple tool calls
    console.log(response.tool_calls)
    // [
    //   { name: 'get_weather', args: { location: 'Boston' }, id: 'call_1' },
    //   { name: 'get_time', args: { location: 'Tokyo' }, id: 'call_2' }
    // ]


    // Execute all tools (can be done in parallel with async)
    const results = []
    for (const tool_call of response.tool_calls || []) {
        if (tool_call.name === 'get_weather') {
            const result = await get_weather.invoke(tool_call)
            results.push(result)
        }
    }
    ```

    该模型根据所请求操作的独立性智能地确定何时适合并行执行。<Tip>
      大多数支持工具调用的模型默认启用并行工具调用。有些（包括[OpenAI](/oss/javascript/integrations/chat/openai)和[Anthropic](/oss/javascript/integrations/chat/anthropic)）允许您禁用此功能。为此，请设置 `parallel_tool_calls=False`：

      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      model.bind_tools([get_weather], parallel_tool_calls=False)
      ```
    </Tip>
  </Accordion>

  <Accordion title="Streaming tool calls" icon="rss">
    当流响应时，工具调用通过[⟦T102⟧](https://reference.langchain.com/javascript/langchain-core/messages/ContentBlock/Tools/ToolCallChunk)逐步构建。这使您可以在工具调用生成时查看它们，而不是等待完整的响应。

    ```typescript Streaming tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const stream = await modelWithTools.stream(
        "What's the weather in Boston and Tokyo?"
    )
    for await (const chunk of stream) {
        // Tool call chunks arrive progressively
        if (chunk.tool_call_chunks) {
            for (const tool_chunk of chunk.tool_call_chunks) {
            console.log(`Tool: ${tool_chunk.get('name', '')}`)
            console.log(`Args: ${tool_chunk.get('args', '')}`)
            }
        }
    }

    // Output:
    // Tool: get_weather
    // Args:
    // Tool:
    // Args: {"loc
    // Tool:
    // Args: ation": "BOS"}
    // Tool: get_time
    // Args:
    // Tool:
    // Args: {"timezone": "Tokyo"}
    ```

    您可以积累块来构建完整的工具调用：

    ```typescript Accumulate tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    let full: AIMessageChunk | null = null
    const stream = await modelWithTools.stream("What's the weather in Boston?")
    for await (const chunk of stream) {
        full = full ? full.concat(chunk) : chunk
        console.log(full.contentBlocks)
    }
    ```
  </Accordion>
</AccordionGroup>

***

## 结构化输出

可以请求模型以与给定模式匹配的格式提供响应。这对于确保输出可以轻松解析并在后续处理中使用非常有用。 LangChain 支持多种模式类型和方法来强制结构化输出。

<Tip>
  要了解结构化输出，请参阅[Structured output](/oss/javascript/langchain/structured-output)。
</Tip>

<Tabs>
  <Tab title="Zod">
    [zod schema](https://zod.dev/) 是定义输出模式的首选方法。请注意，当提供 zod 架构时，模型输出也将使用 zod 的解析方法针对该架构进行验证。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";

    const Movie = z.object({
      title: z.string().describe("The title of the movie"),
      year: z.number().describe("The year the movie was released"),
      director: z.string().describe("The director of the movie"),
      rating: z.number().describe("The movie's rating out of 10"),
    });

    const modelWithStructure = model.withStructuredOutput(Movie);

    const response = await modelWithStructure.invoke("Provide details about the movie Inception");
    console.log(response);
    // {
    //   title: "Inception",
    //   year: 2010,
    //   director: "Christopher Nolan",
    //   rating: 8.8,
    // }
    ```
  </Tab>

  <Tab title="JSON Schema">
    为了最大程度地控制或互操作性，您可以提供原始 JSON 架构。```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const jsonSchema = {
      "title": "Movie",
      "description": "A movie with details",
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The title of the movie",
        },
        "year": {
          "type": "integer",
          "description": "The year the movie was released",
        },
        "director": {
          "type": "string",
          "description": "The director of the movie",
        },
        "rating": {
          "type": "number",
          "description": "The movie's rating out of 10",
        },
      },
      "required": ["title", "year", "director", "rating"],
    }

    const modelWithStructure = model.withStructuredOutput(
      jsonSchema,
      { method: "jsonSchema" },
    )

    const response = await modelWithStructure.invoke("Provide details about the movie Inception")
    console.log(response)  // {'title': 'Inception', 'year': 2010, ...}
    ```
  </Tab>

  <Tab title="Standard Schema">
    还支持实现 [Standard Schema](https://standardschema.dev/) 规范的库中的任何模式。标准 Schema 对象在运行时通过 schema 的 `~standard.validate()` 方法进行验证。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as v from "valibot";
    import { toStandardJsonSchema } from "@valibot/to-json-schema";

    const Movie = toStandardJsonSchema(
      v.object({
        title: v.pipe(v.string(), v.description("The title of the movie")),
        year: v.pipe(v.number(), v.description("The year the movie was released")),
        director: v.pipe(v.string(), v.description("The director of the movie")),
        rating: v.pipe(v.number(), v.description("The movie's rating out of 10")),
      })
    );

    const modelWithStructure = model.withStructuredOutput(Movie);

    const response = await modelWithStructure.invoke("Provide details about the movie Inception");
    console.log(response);
    // {
    //   title: "Inception",
    //   year: 2010,
    //   director: "Christopher Nolan",
    //   rating: 8.8,
    // }
    ```
  </Tab>
</Tabs>

<Note>
  **结构化输出的关键考虑因素：**

  * **方法参数**：一些提供商支持不同的方法（`'jsonSchema'`、`'functionCalling'`、`'jsonMode'`）
  * **包含原始数据**：使用 [⟦T107⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#withStructuredOutput) 获取解析输出和原始数据 [⟦T108⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage)
  * **验证**：Zod 和 Standard Schema 对象提供自动验证，而 JSON Schema 需要手动验证
  * **标准模式**：支持任何实现 [Standard Schema](https://standardschema.dev/) 规范的模式库，并在运行时进行验证

  请参阅您的 [provider's integration page](/oss/javascript/integrations/providers/overview) 了解支持的方法和配置选项。
</Note>

<Accordion title="Example: Message output alongside parsed structure">
  返回原始 [⟦T109⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 对象以及解析后的表示以访问响应元数据（例如 [token counts](#token-usage)）可能很有用。为此，请在调用 [⟦T111⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#withStructuredOutput) 时设置 [⟦T110⟧](https://reference.langchain.com/javascript/classes/_langchain_core.language_models_chat_models.BaseChatModel.html#withStructuredOutput)：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";

  const Movie = z.object({
    title: z.string().describe("The title of the movie"),
    year: z.number().describe("The year the movie was released"),
    director: z.string().describe("The director of the movie"),
    rating: z.number().describe("The movie's rating out of 10"),
    title: z.string().describe("The title of the movie"),
    year: z.number().describe("The year the movie was released"),
    director: z.string().describe("The director of the movie"),  // [!code highlight]
    rating: z.number().describe("The movie's rating out of 10"),
  });

  const modelWithStructure = model.withStructuredOutput(Movie, { includeRaw: true });

  const response = await modelWithStructure.invoke("Provide details about the movie Inception");
  console.log(response);
  // {
  //   raw: AIMessage { ... },
  //   parsed: { title: "Inception", ... }
  // }
  ```
</Accordion>

<Accordion title="Example: Nested structures">
  模式可以嵌套：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";

  const Actor = z.object({
    name: z.string(),
    role: z.string(),
  });

  const MovieDetails = z.object({
    title: z.string(),
    year: z.number(),
    cast: z.array(Actor),
    genres: z.array(z.string()),
    budget: z.number().nullable().describe("Budget in millions USD"),
  });

  const modelWithStructure = model.withStructuredOutput(MovieDetails);
  ```
</Accordion>

***

## 高级主题

### 模型简介

<Info>
  模型配置文件需要`langchain>=1.1`。
</Info>LangChain聊天模型可以通过`profile`属性公开支持的特性和功能的字典：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model.profile;
// {
//   maxInputTokens: 400000,
//   imageInputs: true,
//   reasoningOutput: true,
//   toolCalling: true,
//   ...
// }
```

请参阅[API reference](https://reference.langchain.com/javascript/langchain-core/language_models/profile/ModelProfile) 中的完整字段集。

大部分模型配置文件数据均由 [models.dev](https://github.com/sst/models.dev) 项目提供支持，这是一个提供模型功能数据的开源计划。该数据通过附加字段进行扩充，以便与 LangChain 一起使用。随着上游项目的发展，这些增强功能与上游项目保持一致。

模型配置文件数据允许应用程序动态地处理模型功能。例如：

1. [Summarization middleware](/oss/javascript/langchain/middleware/built-in#summarization)可以根据模型的上下文窗口大小触发摘要。
2. `createAgent`中的[Structured output](/oss/javascript/langchain/structured-output)策略可以自动推断（例如，通过检查对本机结构化输出功能的支持）。
3. 模型输入可以根据支持的[modalities](#multimodal)和最大输入令牌进行门控。
4. [Deep Agents Code](/oss/deepagents/code) 将 [interactive model switcher](/oss/deepagents/code/providers#which-models-appear-in-the-switcher) 过滤到配置文件报告 `tool_calling` 支持和文本 I/O 的模型，并在选择器详细视图中显示上下文窗口大小和功能标志。

<Accordion title="Modify profile data">
  如果模型配置文件数据丢失、过时或不正确，则可以更改。

  **选项 1（快速修复）**

  您可以使用任何有效的配置文件实例化聊天模型：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const customProfile = {
  maxInputTokens: 100_000,
  toolCalling: true,
  structuredOutput: true,
  // ...
  };
  const model = initChatModel("...", { profile: customProfile });
  ```**选项 2（修复上游数据）**

  数据的主要来源是[models.dev](https://models.dev/)项目。这些数据与 LangChain [integration packages](/oss/javascript/integrations/providers/overview) 中的附加字段和覆盖合并，并随这些包一起提供。

  模型配置文件数据可以通过以下过程更新：

  1.（如果需要）通过拉取请求将[models.dev](https://models.dev/)处的源数据更新到其[repository on GitHub](https://github.com/sst/models.dev)。
  2.（如果需要）通过向 LangChain [integration package](/oss/javascript/integrations/providers/overview) 发出拉取请求来更新 `langchain-<package>/profiles.toml` 中的其他字段和覆盖。
</Accordion>

<Warning>
  模型配置文件是测试版功能。配置文件的格式可能会发生变化。
</Warning>

### 多式联运

某些模型可以处理和返回非文本数据，例如图像、音频和视频。您可以通过提供 [content blocks](/oss/javascript/langchain/messages#message-content) 将非文本数据传递给模型。

<Tip>
  所有具有底层多模态能力的LangChain聊天模型都支持：

  1. 跨提供商标准格式的数据（参见[our messages guide](/oss/javascript/langchain/messages)）
  2.OpenAI[chat completions](https://platform.openai.com/docs/api-reference/chat)格式
  3. 该特定提供者原生的任何格式（例如，Anthropic 模型接受 Anthropic 原生格式）
</Tip>

详情请参阅消息指南[multimodal section](/oss/javascript/langchain/messages#multimodal)。<Tooltip href="https://models.dev/">某些模型</Tooltip>可以返回多模式数据作为其响应的一部分。如果调用这样做，生成的 [⟦T117⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 将具有多模式类型的内容块。

```typescript Multimodal output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke("Create a picture of a cat");
console.log(response.contentBlocks);
// [
//   { type: "text", text: "Here's a picture of a cat" },
//   { type: "image", data: "...", mimeType: "image/jpeg" },
// ]
```

有关特定提供商的详细信息，请参阅[integrations page](/oss/javascript/integrations/providers/overview)。

### 推理

许多模型能够执行多步骤推理来得出结论。这涉及将复杂的问题分解为更小、更易于管理的步骤。

**如果得到底层模型的支持，**您可以展示此推理过程，以更好地理解模型如何得出最终答案。

<CodeGroup>
  ```typescript Stream reasoning output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const stream = model.stream("Why do parrots have colorful feathers?");
  for await (const chunk of stream) {
      const reasoningSteps = chunk.contentBlocks.filter(b => b.type === "reasoning");
      console.log(reasoningSteps.length > 0 ? reasoningSteps : chunk.text);
  }
  ```

  ```typescript Complete reasoning output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const response = await model.invoke("Why do parrots have colorful feathers?");
  const reasoningSteps = response.contentBlocks.filter(b => b.type === "reasoning");
  console.log(reasoningSteps.map(step => step.reasoning).join(" "));
  ```
</CodeGroup>

根据模型的不同，您有时可以指定推理中应投入的工作量。同样，您可以请求模型完全关闭推理。这可以采取分类推理“层”的形式（例如，`'low'`或`'high'`）或整数代币预算。

有关详细信息，请参阅相应聊天模型的[integrations page](/oss/javascript/integrations/providers/overview)或[reference](https://reference.langchain.com/python/integrations/)。

### 本地模特LangChain支持在您自己的硬件上本地运行模型。这对于以下场景非常有用：数据隐私至关重要、您想要调用自定义模型，或者您想要避免使用基于云的模型时产生的成本。

[Ollama](/oss/javascript/integrations/chat/ollama) 是在本地运行聊天和嵌入模型的最简单方法之一。

### 提示缓存

许多提供商提供即时缓存功能，以减少重复处理相同令牌的延迟和成本。您可以在三个级别上使用缓存：

* **隐式提供程序缓存：** 如果请求命中缓存，提供程序会自动传递成本节省，无需配置。示例：[OpenAI](/oss/javascript/integrations/chat/openai) 和 [Gemini](/oss/javascript/integrations/chat/google_generative_ai)。
* **提供程序级显式控制：** 提供程序允许您手动指示缓存点，以实现更好的控制或保证节省成本。这些反映了底层提供者/API 行为。示例：
  * [⟦T120⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)（通过`prompt_cache_key`）
  *人为内容块[⟦T122⟧](/oss/javascript/integrations/chat/anthropic#prompt-caching)
  * [Gemini](https://reference.langchain.com/python/integrations/langchain_google_genai/)。

<Warning>
  通常仅在高于最小输入令牌阈值时才进行提示缓存。详情请参阅[provider pages](/oss/javascript/integrations/chat)。
</Warning>

缓存使用情况将反映在模型响应的[usage metadata](/oss/javascript/langchain/messages#token-usage)中。

### 服务器端工具使用一些提供商支持服务器端 [tool-calling](#tool-calling) 循环：模型可以与网络搜索、代码解释器和其他工具交互，并在单个对话轮中分析结果。

如果模型调用服务器端工具，则响应消息的内容将包括表示工具的调用和结果的内容。访问响应的[content blocks](/oss/javascript/langchain/messages#standard-content-blocks)将返回服务器端工具调用并以与提供者无关的格式返回结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { initChatModel } from "langchain";

const model = await initChatModel("gpt-5.4-mini");
const modelWithTools = model.bindTools([{ type: "web_search" }])

const message = await modelWithTools.invoke("What was a positive news story from today?");
console.log(message.contentBlocks);
```

这代表一个对话轮次；没有像客户端[tool-calling](#tool-calling)那样需要传入关联的[ToolMessage](/oss/javascript/langchain/messages#tool-message)对象。

请参阅您给定提供商的[integration page](/oss/javascript/integrations/chat)，了解可用工具和使用详细信息。

### 基本 URL 和代理设置

您可以为实施 OpenAI Chat Completions API 的提供商配置自定义基本 URL。

<Warning>
  `model_provider="openai"`（或直接使用`ChatOpenAI`）以官方 OpenAI API 规范为目标。可能无法提取或保留来自路由器和代理的提供商特定字段。

  对于 OpenRouter 和 LiteLLM，更喜欢专用集成：

  * [OpenRouter via ⟦T125⟧](/oss/javascript/integrations/chat/openrouter) (`langchain-openrouter`)
  * [LiteLLM via ⟦T127⟧ / ⟦T128⟧](/oss/javascript/integrations/chat) (`langchain-litellm`)
</Warning><Accordion title="Custom base URL" icon="link">
  许多模型提供商提供与 OpenAI 兼容的 API（例如，[Together AI](https://www.together.ai/)、[vLLM](https://github.com/vllm-project/vllm)）。您可以通过指定适当的 `base_url` 参数来将 `initChatModel` 与这些提供程序一起使用：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  model = initChatModel(
      "MODEL_NAME",
      {
          modelProvider: "openai",
          baseUrl: "BASE_URL",
          apiKey: "YOUR_API_KEY",
      }
  )
  ```

  <Note>
    当使用直接聊天模型类实例化时，参数名称可能因提供者而异。详情请查看相应的[reference](/oss/javascript/integrations/providers/overview)。
  </Note>
</Accordion>

### 对数概率

通过在初始化模型时设置 `logprobs` 参数，某些模型可以配置为返回表示给定标记的可能性的标记级对数概率：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const model = new ChatOpenAI({
    model: "gpt-5.5",
    logprobs: true,
});

const responseMessage = await model.invoke("Why do parrots talk?");

responseMessage.response_metadata.logprobs.content.slice(0, 5);
```

### 代币使用

许多模型提供程序返回令牌使用信息作为调用响应的一部分。如果可用，此信息将包含在相应模型生成的 [⟦T133⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 对象中。有关更多详细信息，请参阅[messages](/oss/javascript/langchain/messages)指南。

### 调用配置

调用模型时，您可以使用 [⟦T135⟧](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableConfig) 对象通过 `config` 参数传递附加配置。这提供了对执行行为、回调和元数据跟踪的运行时控制。

常见的配置选项包括：

```typescript Invocation with config theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await model.invoke(
    "Tell me a joke",
    {
        runName: "joke_generation",      // Custom name for this run
        tags: ["humor", "demo"],          // Tags for categorization
        metadata: {"user_id": "123"},     // Custom metadata
        callbacks: [my_callback_handler], // Callback handlers
    }
)
```

这些配置值在以下情况下特别有用：* 使用[LangSmith](/langsmith/observability)跟踪进行调试
* 实现自定义日志记录或监控
* 控制生产中的资源使用
* 跟踪复杂管道中的调用

<Accordion title="Key configuration attributes">
  <ParamField type="string">
    在日志和跟踪中标识此特定调用。不被子调用继承。
  </ParamField>

  <ParamField type="string[]">
    所有子调用继承的标签，用于调试工具中的过滤和组织。
  </ParamField>

  <ParamField type="object">
    用于跟踪其他上下文的自定义键值对，由所有子调用继承。
  </ParamField>

  <ParamField type="number">
    控制使用`batch()`时的最大并行调用数。
  </ParamField>

  <ParamField type="CallbackHandler[]">
    用于在执行期间监视和响应事件的处理程序。
  </ParamField>

  <ParamField type="number">
    链的最大递归深度，以防止复杂管道中的无限循环。
  </ParamField>
</Accordion>

<Tip>
  有关所有支持的属性，请参阅完整的 [⟦T137⟧](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableConfig) 参考。
</Tip>

### 动态模型选择

根据当前 <Tooltip>state</Tooltip> 和上下文，在 <Tooltip>runtime</Tooltip> 选择动态模型。这可以实现复杂的路由逻辑和成本优化。

要使用动态模型，请使用 `wrapModelCall` 创建中间件来修改请求中的模型：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, createMiddleware } from "langchain";

const basicModel = new ChatOpenAI({ model: "gpt-5.4-mini" });
const advancedModel = new ChatOpenAI({ model: "gpt-5.5" });

const dynamicModelSelection = createMiddleware({
  name: "DynamicModelSelection",
  wrapModelCall: (request, handler) => {
    // Choose model based on conversation complexity
    const messageCount = request.messages.length;

    return handler({
        ...request,
        model: messageCount > 10 ? advancedModel : basicModel,
    });
  },
});

const agent = createAgent({
  model: "gpt-5.4-mini", // Base model (used when messageCount ≤ 10)
  tools,
  middleware: [dynamicModelSelection],
});
```有关中间件和高级模式的更多详细信息，请参阅[middleware documentation](/oss/javascript/langchain/middleware)。

<Tip>
  型号配置详情请参见[Models](/oss/javascript/langchain/models)。有关动态模型选择模式，请参阅[Dynamic model in middleware](/oss/javascript/langchain/middleware#dynamic-model)。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>