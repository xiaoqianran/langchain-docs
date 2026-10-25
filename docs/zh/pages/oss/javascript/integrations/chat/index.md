<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Chat model integrations | https://docs.langchain.com/oss/javascript/integrations/chat/index -->

# 聊天模型集成

使用 LangChain JavaScript 与聊天模型集成。

[Chat models](/oss/javascript/langchain/models) 是使用 [messages](/oss/javascript/langchain/messages) 序列作为输入并返回消息作为输出（与纯文本相反）的语言模型（较旧的模型不遵循聊天模型接口，而是使用将字符串作为输入并返回字符串作为输出的接口。这些模型通常不包含前缀“Chat”在其名称中或包含“LLM”作为后缀。）。

## 安装和使用

> [!提示]
>
> 参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。

> **OpenAI**
>
> 安装：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/openai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/openai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/openai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> OPENAI_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { ChatOpenAI } from "@langchain/openai";
>
> const model = new ChatOpenAI({ model: "gpt-5.4-mini" });
> ```
>
> ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> await model.invoke("Hello, world!")
> ```

> **Anthropic**
>
> 安装：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm i @langchain/anthropic @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/anthropic @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/anthropic @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ANTHROPIC_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { ChatAnthropic } from "@langchain/anthropic";
>
> const model = new ChatAnthropic({
> model: "claude-sonnet-4-6",
> temperature: 0
> });
> ```
>
> ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> await model.invoke("Hello, world!")
> ```

> **谷歌双子座**
>
> 安装：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/google @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/google @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/google @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> GOOGLE_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { ChatGoogle } from "@langchain/google";
>
> const model = new ChatGoogle("gemini-2.5-flash");
> ```
>
> ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> await model.invoke("Hello, world!")
> ```

> **米斯特拉尔人工智能**
>
> 安装：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/mistralai @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/mistralai @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/mistralai @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> MISTRAL_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { ChatMistralAI } from "@langchain/mistralai";
>
> const model = new ChatMistralAI({
> model: "mistral-large-latest",
> temperature: 0
> });
> ```
>
> ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> await model.invoke("Hello, world!")
> ```> **格罗克**
>
> 安装：
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install @langchain/groq @langchain/core
> ```
>
> ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add @langchain/groq @langchain/core
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add @langchain/groq @langchain/core
> ```
>
> 添加环境变量：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> GROQ_API_KEY=your-api-key
> ```
>
> 实例化模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { ChatGroq } from "@langchain/groq";
>
> const model = new ChatGroq({
> model: "openai/gpt-oss-120b",
> temperature: 0
> });
> ```
>
> ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> await model.invoke("Hello, world!")
> ```

## 特色型号

> [!注意]
>
> **虽然这些 LangChain 类支持指定的高级功能**，但您可能需要参考特定于提供商的文档以了解哪些托管模型或后端支持该功能。

|型号|流 | [Tool Calling](/oss/javascript/langchain/tools/) | [⟦T30⟧](/oss/javascript/langchain/models#structured-output) | [⟦T31⟧](/oss/javascript/langchain/messages#multimodal) |下载 |
| :-| :-| :-| :-| :-| :-|
| [⟦T32⟧](/oss/javascript/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T83⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T33⟧](/oss/javascript/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T84⟧](https://www.npmjs.com/package/@langchain/anthropic) |
| [⟦T34⟧](/oss/javascript/integrations/chat/bedrock_converse) | ✅ | ✅ | ✅ | ✅ | [  ⟦T85⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T35⟧](/oss/javascript/integrations/chat/groq) | ✅ | ✅ | ✅ | ❌ | [  ⟦T86⟧](https://www.npmjs.com/package/@langchain/groq) |
| [⟦T36⟧](/oss/javascript/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T87⟧](https://www.npmjs.com/package/@langchain/ollama) |
| [⟦T37⟧](/oss/javascript/integrations/chat/mistral) | ✅ | ✅ | ✅ | ✅ | [  ⟦T88⟧](https://www.npmjs.com/package/@langchain/mistralai) |
| [⟦T38⟧](/oss/javascript/integrations/chat/google) | ✅ | ✅ | ✅ | ✅ | [  ⟦T89⟧](https://www.npmjs.com/package/@langchain/google) |
| [⟦T39⟧](/oss/javascript/integrations/chat/cohere) | ✅ | ✅ | ✅ | ❌ | [  ⟦T90⟧](https://www.npmjs.com/package/@langchain/cohere) |
| [⟦T40⟧](/oss/javascript/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T91⟧](https://www.npmjs.com/package/@langchain/xai) |
| [⟦T41⟧](/oss/javascript/integrations/chat/fireworks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T92⟧](https://www.npmjs.com/package/@langchain/fireworks) |
| [⟦T42⟧](/oss/javascript/integrations/chat/cloudflare_workersai) | ✅ | ❌ | ❌ | ✅ | [  ⟦T93⟧](https://www.npmjs.com/package/@langchain/cloudflare) |
| [⟦T43⟧](/oss/javascript/integrations/chat/togetherai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T94⟧](https://www.npmjs.com/package/@langchain/together-ai) |
| [⟦T44⟧](/oss/javascript/integrations/chat/perplexity) | ✅ | ❌ | ✅ | ❌ | [  ⟦T95⟧](https://www.npmjs.com/package/@langchain/perplexity) |

有关更多选项，请参阅下面的[full list of chat model integrations](#all-chat-models)。

## 路由器和代理路由器和代理使您可以通过单个 API 和凭证访问多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退等功能。

|供应商|整合 |描述 |
| - | - | - |
| [OpenRouter](https://openrouter.ai/) | [⟦T45⟧](/oss/javascript/integrations/chat/openrouter) |统一访问来自OpenAI、Anthropic、Google、Meta 等的模型 |
| [FuturMix](https://futurmix.ai/) | [⟦T46⟧](https://futurmix.ai/) |适用于 22 种以上型号的统一 AI 网关，具有OpenAI 兼容 API 和 99.99% SLA |

## 聊天完成 API

某些模型提供商提供与 OpenAI（旧版）[Chat Completions API](https://platform.openai.com/docs/guides/completions) 兼容的端点。在这种情况下，您可以使用 [⟦T47⟧](/oss/javascript/integrations/chat/openai) 和自定义 `base_url` 连接到这些端点。请注意，`ChatOpenAI` 可能不完全支持基于聊天完成 API 构建的功能；在这种情况下，请考虑使用特定于提供者的类（如果可用）。

## 所有聊天模型|型号|流 | [Tool Calling](/oss/javascript/langchain/tools/) | [⟦T50⟧](/oss/javascript/langchain/models#structured-output) | [⟦T51⟧](/oss/javascript/langchain/messages#multimodal) |下载 |
| :-| :-| :-| :-| :-| :-|
| [⟦T52⟧](/oss/javascript/integrations/chat/azure) | ✅ | ✅ | ✅ | ✅ | [  ⟦T96⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T53⟧](/oss/javascript/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T97⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T54⟧](/oss/javascript/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T98⟧](https://www.npmjs.com/package/@langchain/anthropic) |
| [⟦T55⟧](/oss/javascript/integrations/chat/google_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T99⟧](https://www.npmjs.com/package/@langchain/google-genai) |
| [⟦T56⟧](/oss/javascript/integrations/chat/bedrock_converse) | ✅ | ✅ | ✅ | ✅ | [  ⟦T100⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T57⟧](/oss/javascript/integrations/chat/google_vertex_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T101⟧](https://www.npmjs.com/package/@langchain/google-vertexai) |
| [⟦T58⟧](/oss/javascript/integrations/chat/groq) | ✅ | ✅ | ✅ | ❌ | [  ⟦T102⟧](https://www.npmjs.com/package/@langchain/groq) |
| [⟦T59⟧](/oss/javascript/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T103⟧](https://www.npmjs.com/package/@langchain/ollama) |
| [⟦T60⟧](/oss/javascript/integrations/chat/mistral) | ✅ | ✅ | ✅ | ✅ | [  ⟦T104⟧](https://www.npmjs.com/package/@langchain/mistralai) |
| [⟦T61⟧](/oss/javascript/integrations/chat/google) | ✅ | ✅ | ✅ | ✅ | [  ⟦T105⟧](https://www.npmjs.com/package/@langchain/google) |
| [⟦T62⟧](/oss/javascript/integrations/chat/cohere) | ✅ | ✅ | ✅ | ❌ | [  ⟦T106⟧](https://www.npmjs.com/package/@langchain/cohere) |
| [⟦T63⟧](/oss/javascript/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T107⟧](https://www.npmjs.com/package/@langchain/xai) |
| [⟦T64⟧](/oss/javascript/integrations/chat/openrouter) | ✅ | ✅ | ✅ | ✅ | [  ⟦T108⟧](https://www.npmjs.com/package/@langchain/openrouter) |
| [⟦T65⟧](/oss/javascript/integrations/chat/deepseek) | ✅ | ✅ | ✅ | ❌ | [  ⟦T109⟧](https://www.npmjs.com/package/@langchain/deepseek) |
| [⟦T66⟧](/oss/javascript/integrations/chat/cerebras) | ✅ | ✅ | ✅ | ❌ | [  ⟦T110⟧](https://www.npmjs.com/package/@langchain/cerebras) |
| [⟦T67⟧](/oss/javascript/integrations/chat/fireworks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T111⟧](https://www.npmjs.com/package/@langchain/fireworks) |
| [⟦T68⟧](/oss/javascript/integrations/chat/baidu_qianfan) | | | | | [  ⟦T112⟧](https://www.npmjs.com/package/@langchain/baidu-qianfan) |
| [⟦T69⟧](/oss/javascript/integrations/chat/cloudflare_workersai) | ✅ | ❌ | ❌ | ✅ | [  ⟦T113⟧](https://www.npmjs.com/package/@langchain/cloudflare) |
| [⟦T70⟧](/oss/javascript/integrations/chat/togetherai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T114⟧](https://www.npmjs.com/package/@langchain/together-ai) |
| [⟦T71⟧](/oss/javascript/integrations/chat/ibm) | ✅ | ✅ | ✅ | ✅ | [  ⟦T115⟧](https://www.npmjs.com/package/@langchain/ibm) |
| [⟦T72⟧](/oss/javascript/integrations/chat/perplexity) | ✅ | ❌ | ✅ | ❌ | [  ⟦T116⟧](https://www.npmjs.com/package/@langchain/perplexity) |
| [⟦T73⟧](/oss/javascript/integrations/chat/yandex) | | | | | [  ⟦T117⟧](https://www.npmjs.com/package/@langchain/yandex) |
| [⟦T74⟧](https://interfaze.ai/docs) | ✅ | ✅ | ✅ | ✅ | [  ⟦T118⟧](https://www.npmjs.com/package/@interfaze-ai/langchain) |
| [⟦T75⟧](https://gitlab.com/bitkaio/langchain/kserve-provider) | ✅ | ✅ | ✅ | ✅ | [  ⟦T119⟧](https://www.npmjs.com/package/@bitkaio/langchain-kserve) |
| [⟦T76⟧](https://recallmem.dev/guides/langchain) | | | | | [  ⟦T120⟧](https://www.npmjs.com/package/@recall-memory/langchain) |
| [⟦T77⟧](https://scx.ai/) | ✅ | ✅ | ✅ | ✅ | [  ⟦T121⟧](https://www.npmjs.com/package/@scx-ai/langchain) |
| [⟦T78⟧](https://auxen.ai) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T79⟧](https://github.com/ykoh42/web-llm-adapters/blob/main/packages/langchain-web-llm/README.md) | ✅ | ✅ | ✅ | |不适用 |
| [⟦T80⟧](/oss/javascript/integrations/chat/fake) | | | | |不适用 |
| [⟦T81⟧](https://futurmix.ai/) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T82⟧](https://www.tuningengines.com/) | ✅ | ✅ | ✅ | ❌ |不适用 |> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。