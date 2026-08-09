<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Providers and models | https://docs.langchain.com/oss/javascript/concepts/providers-and-models -->

# 提供者和模型

了解 LangChain 如何使用提供商为您提供适用于任何提供商的任何模型的单一 API

LangChain 为您提供了一个统一的 API，可以使用任何提供商的模型。安装提供程序包，选择模型名称，然后开始构建 - 无论您使用 OpenAI、Anthropic、Google 还是任何其他受支持的提供程序，相同的代码都可以工作。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    subgraph "Your code"
        A["LangChain API<br/>(invoke, stream, bind_tools)"]
    end

    subgraph "Providers"
        B["OpenAI"]
        C["Anthropic"]
        D["Google"]
        E["AWS Bedrock"]
        F["...and more"]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F

    classDef code fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef provider fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class A code
    class B,C,D,E,F provider
```

## 适用于任何模型的一个 API

每个LangChain聊天模型，无论提供商如何，都实现相同的接口。这意味着您可以：

* **交换提供商**，无需重写应用程序逻辑
* **使用相同的代码并排比较模型**
* **在所有提供商中使用高级功能**，如 [tool calling](/oss/javascript/langchain/tools)、[structured output](/oss/javascript/langchain/structured-output) 和 [streaming](/oss/javascript/langchain/streaming)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { initChatModel } from "langchain/chat_models/universal";

const openaiModel = await initChatModel("openai:gpt-5.5");
const anthropicModel = await initChatModel("anthropic:claude-opus-4-8");
const googleModel = await initChatModel("google-genai:gemini-3.1-pro-preview");

for (const model of [openaiModel, anthropicModel, googleModel]) {
    const response = await model.invoke("Explain quantum computing in one sentence.");
    console.log(response.text);
}
```

## 什么是提供商？

**提供商**是托管 AI 模型并通过 API 公开它们的公司或平台。示例包括 OpenAI、Anthropic、Google 和 AWS Bedrock。

在LangChain中，每个提供商都有一个专用的**集成包**（例如`langchain-openai`，`langchain-anthropic`），为该提供商的模型实现标准LangChain接口。这意味着：* **为每个提供程序提供专用包**，并提供适当的版本控制和依赖项管理
* **特定于提供商的功能**在您需要时可用（例如 OpenAI 的 Responses API、Anthropic 的扩展思维）
* **通过环境变量自动 API 密钥处理**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/openai       # For OpenAI models
npm install @langchain/anthropic    # For Anthropic models
npm install @langchain/google-genai # For Google models
```

有关提供程序包的完整列表，请参阅 [integrations page](/oss/javascript/integrations/providers/overview)。

## 查找型号名称

每个提供程序都支持您在初始化聊天模型时传递的特定模型名称。指定模型有两种方法：

<CodeGroup>
  ```typescript Provider prefix format theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { initChatModel } from "langchain/chat_models/universal";

  const model = await initChatModel("openai:gpt-5.5");
  ```

  ```typescript Direct class instantiation theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";

  const model = new ChatOpenAI({ model: "gpt-5.5" });
  ```
</CodeGroup>

当使用[⟦T10⟧](https://reference.langchain.com/javascript/langchain/chat_models/universal/initChatModel)和`provider:model`格式时，LangChain会自动解析Provider并加载正确的集成包。如果模型名称明确（例如，`"gpt-5.5"` 解析为 OpenAI），您还可以省略提供程序前缀。

要查找提供程序的可用模型名称，请参阅提供程序自己的文档。以下是一些受欢迎的提供商：|供应商|哪里可以找到型号名称 |
| :------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------- |
| [OpenAI](/oss/javascript/integrations/providers/openai) | [OpenAI models page](https://platform.openai.com/docs/models) |
| [Anthropic](/oss/javascript/integrations/providers/anthropic) | [Anthropic models page](https://docs.anthropic.com/en/docs/about-claude/models) |
| [Google](/oss/javascript/integrations/providers/google) | [Google AI models page](https://ai.google.dev/gemini-api/docs/models) |
| [AWS Bedrock](/oss/javascript/integrations/providers/aws) | [Bedrock supported models](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html) |

## 立即使用新模型

由于 LangChain 提供程序包将模型名称直接传递到提供程序的 API，因此您可以在提供程序发布新模型时使用它们（无需更新 LangChain）。只需传递新的型号名称：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const model = await initChatModel("google_genai:gemini-mythos");
```

只要您的提供程序包版本支持模型所需的 API 版本，新模型名称就会立即生效。在大多数情况下，模型版本是向后兼容的并且不需要包更新。

## 模型能力

不同的提供商和模型支持不同的功能。
有关聊天模型集成及其功能的列表，请参阅 [chat models integrations page](/oss/javascript/integrations/chat)。

## 路由器和代理**路由器**（也称为代理或网关）使您可以通过单个 API 和凭证访问来自多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退和负载平衡等功能。

|供应商|整合 |描述 |
| ：------------------------------------------------ | :---------------------------------------------------------------------------- | ：-------------------------------------------------------------------------- |
| [OpenRouter](https://openrouter.ai/) | [⟦T13⟧](/oss/javascript/integrations/chat/openrouter) |统一访问来自 OpenAI、Anthropic、Google、Meta 等的模型 |
| [FuturMix](https://futurmix.ai/) | [⟦T14⟧](https://futurmix.ai/) |适用于 22 种以上型号的统一 AI 网关，具有兼容 OpenAI 的 API 和 99.99% SLA |

当您想要执行以下操作时，路由器很有用：

* **使用单个 API 密钥和计费帐户访问许多提供商**
* **动态切换模型**，无需管理多个提供商凭据
* **使用后备模型**，如果主模型失败，会自动使用不同的模型重试

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { initChatModel } from "langchain/chat_models/universal";

const model = await initChatModel("openrouter:anthropic/claude-sonnet-4-6");
const response = await model.invoke("Hello!");
```## OpenAI 兼容端点

许多提供商提供与 OpenAI 的 [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) 兼容的端点。您可以使用 [⟦T15⟧](/oss/javascript/integrations/chat/openai) 和自定义 `base_url` 连接到这些：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    configuration: { baseURL: "https://your-provider.com/v1" },
    apiKey: "your-api-key",
    model: "provider-model-name",
});
```

<Warning>
  `ChatOpenAI` 仅针对 [official OpenAI API specifications](https://github.com/openai/openai-openapi)。不会提取或保留来自第三方提供商的非标准响应字段。当您需要访问非标准功能时，请使用专用的提供商包或路由器。
</Warning>

## 后续步骤

<CardGroup>
  <Card title="Models guide" icon="cpu" href="/oss/javascript/langchain/models">
    了解如何使用模型：调用、流、批处理、工具调用等。
  </Card>

  <Card title="Chat model integrations" icon="message" href="/oss/javascript/integrations/chat">
    浏览所有聊天模型集成及其功能。
  </Card>

  <Card title="All providers" icon="grid-dots" href="/oss/javascript/integrations/providers/overview">
    查看提供商包和集成的完整列表。
  </Card>

  <Card title="Agents" icon="robot" href="/oss/javascript/langchain/agents">
    构建使用模型作为推理引擎的代理。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/providers-and-models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>