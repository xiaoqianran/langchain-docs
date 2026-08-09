<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Chat model integrations | https://docs.langchain.com/oss/javascript/integrations/chat/index -->

# 聊天模型集成

使用 LangChain JavaScript 与聊天模型集成。

[Chat models](/oss/javascript/langchain/models) 是使用[messages](/oss/javascript/langchain/messages) 序列作为输入并返回消息作为输出<Tooltip>（与纯文本相对）</Tooltip> 的语言模型。

## 安装和使用

<Tip>
  参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。
</Tip>

<AccordionGroup>
  <Accordion title="OpenAI">
    安装：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/openai @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatOpenAI } from "@langchain/openai";

    const model = new ChatOpenAI({ model: "gpt-5.4-mini" });
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="Anthropic">
    安装：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i @langchain/anthropic @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/anthropic @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/anthropic @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    ANTHROPIC_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatAnthropic } from "@langchain/anthropic";

    const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    temperature: 0
    });
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="Google Gemini">
    安装：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/google @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/google @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatGoogle } from "@langchain/google";

    const model = new ChatGoogle("gemini-2.5-flash");
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="MistralAI">
    安装：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/mistralai @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/mistralai @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/mistralai @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    MISTRAL_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatMistralAI } from "@langchain/mistralai";

    const model = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0
    });
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="Groq">
    安装：

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/groq @langchain/core
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/groq @langchain/core
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/groq @langchain/core
      ```
    </CodeGroup>

    添加环境变量：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GROQ_API_KEY=your-api-key
    ```

    实例化模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatGroq } from "@langchain/groq";

    const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0
    });
    ``````javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>
</AccordionGroup>

## 特色型号

<Info>
  **虽然这些 LangChain 类支持指定的高级功能**，但您可能需要参考特定于提供商的文档来了解哪些托管模型或后端支持该功能。
</Info>

<div>
  |型号|流 | [Tool Calling](/oss/javascript/langchain/tools/) | [⟦T30⟧](/oss/javascript/langchain/models#structured-output) | [⟦T31⟧](/oss/javascript/langchain/messages#multimodal) |下载 |
  | :---------------------------------------------------------------------------------- | :------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- || [⟦T32⟧](/oss/javascript/integrations/chat/openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/openai"><img alt="Downloads per month" /></a></span>|
  | [⟦T33⟧](/oss/javascript/integrations/chat/anthropic) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/anthropic"><img alt="Downloads per month" /></a></span>|
  | [⟦T34⟧](/oss/javascript/integrations/chat/bedrock_converse) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/aws"><img alt="Downloads per month" /></a></span>|
  | [⟦T35⟧](/oss/javascript/integrations/chat/groq) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/groq"> <img alt="Downloads per month" /></a></span> || [⟦T36⟧](/oss/javascript/integrations/chat/ollama) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/ollama"> <img alt="Downloads per month" /></a></span> |
  | [⟦T37⟧](/oss/javascript/integrations/chat/mistral) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/mistralai"><img alt="Downloads per month" /></a></span>|
  | [⟦T38⟧](/oss/javascript/integrations/chat/cohere) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/cohere"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](/oss/javascript/integrations/chat/google) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/google"> <img alt="Downloads per month" /></a></span> || [⟦T40⟧](/oss/javascript/integrations/chat/xai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/xai"><img alt="Downloads per month" /></a></span>|
  | [⟦T41⟧](/oss/javascript/integrations/chat/cloudflare_workersai) | <span>✅</span> | <span>❌</span> | <span>❌</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare"><img alt="Downloads per month" /></a></span>|
  | [⟦T42⟧](/oss/javascript/integrations/chat/fireworks) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/fireworks"><img alt="Downloads per month" /></a></span>|
  | [⟦T43⟧](/oss/javascript/integrations/chat/togetherai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/together-ai"> <img alt="Downloads per month" /></a></span> || [⟦T44⟧](/oss/javascript/integrations/chat/perplexity) | <span>✅</span> | <span>❌</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/perplexity"><img alt="Downloads per month" /></a></span>|
</div>

有关更多选项，请参阅下面的[full list of chat model integrations](#all-chat-models)。

## 路由器和代理

路由器和代理使您可以通过单个 API 和凭证访问来自多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退等功能。

|供应商|整合 |描述 |
| ------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [OpenRouter](https://openrouter.ai/) | [⟦T45⟧](/oss/javascript/integrations/chat/openrouter) |统一访问来自OpenAI、Anthropic、Google、Meta 等的模型 |
| [FuturMix](https://futurmix.ai/) | [⟦T46⟧](https://futurmix.ai/) |适用于 22 种以上型号的统一 AI 网关，具有OpenAI 兼容 API 和 99.99% SLA |## 聊天完成 API

某些模型提供商提供与 OpenAI（旧版）[Chat Completions API](https://platform.openai.com/docs/guides/completions) 兼容的端点。在这种情况下，您可以使用 [⟦T47⟧](/oss/javascript/integrations/chat/openai) 和自定义 `base_url` 连接到这些端点。请注意，`ChatOpenAI` 可能不完全支持基于聊天完成 API 构建的功能；在这种情况下，请考虑使用特定于提供者的类（如果可用）。

[Auxen](https://auxen.ai) 托管专用的每客户 LLM 端点，并具有与 OpenAI 兼容的聊天完成 API。将 `ChatOpenAI` 与自定义基本 URL 和每个实例 API 密钥结合使用。

## 所有聊天模型<div>
  |型号|流 | [Tool Calling](/oss/javascript/langchain/tools/) | [⟦T51⟧](/oss/javascript/langchain/models#structured-output) | [⟦T52⟧](/oss/javascript/langchain/messages#multimodal) |下载 |
  | :---------------------------------------------------------------------------------- | :------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
  | [⟦T53⟧](/oss/javascript/integrations/chat/azure) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/openai"><img alt="Downloads per month" /></a></span>|| [⟦T54⟧](/oss/javascript/integrations/chat/openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/openai"> <img alt="Downloads per month" /></a></span> |
  | [⟦T55⟧](/oss/javascript/integrations/chat/anthropic) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/anthropic"><img alt="Downloads per month" /></a></span>|
  | [⟦T56⟧](/oss/javascript/integrations/chat/google_generative_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/google-genai"> <img alt="Downloads per month" /></a></span> |
  | [⟦T57⟧](/oss/javascript/integrations/chat/bedrock_converse) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>​​✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/aws"><img alt="Downloads per month" /></a></span>|| [⟦T58⟧](/oss/javascript/integrations/chat/google_vertex_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/google-vertexai"><img alt="Downloads per month" /></a></span> |
  | [⟦T59⟧](/oss/javascript/integrations/chat/groq) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/groq"> <img alt="Downloads per month" /></a></span> |
  | [⟦T60⟧](/oss/javascript/integrations/chat/ollama) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/ollama"><img alt="Downloads per month" /></a></span>|
  | [⟦T61⟧](/oss/javascript/integrations/chat/mistral) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/mistralai"><img alt="Downloads per month" /></a></span>|| [⟦T62⟧](/oss/javascript/integrations/chat/cohere) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/cohere"><img alt="Downloads per month" /></a></span>|
  | [⟦T63⟧](/oss/javascript/integrations/chat/google) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/google"><img alt="Downloads per month" /></a></span>|
  | [⟦T64⟧](/oss/javascript/integrations/chat/xai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/xai"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](/oss/javascript/integrations/chat/deepseek) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/deepseek"><img alt="Downloads per month" /></a></span>|| [⟦T66⟧](/oss/javascript/integrations/chat/openrouter) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/openrouter"><img alt="Downloads per month" /></a></span>|
  | [⟦T67⟧](/oss/javascript/integrations/chat/cerebras) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/cerebras"><img alt="Downloads per month" /></a></span>|
  | [⟦T68⟧](/oss/javascript/integrations/chat/baidu_qianfan) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://www.npmjs.com/package/@langchain/baidu-qianfan"><img alt="Downloads per month" /></a></span>|
  | [⟦T69⟧](/oss/javascript/integrations/chat/cloudflare_workersai) | <span>✅</span> | <span>❌</span> | <span>❌</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare"><img alt="Downloads per month" /></a></span>|| [⟦T70⟧](/oss/javascript/integrations/chat/ibm) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/ibm"> <img alt="Downloads per month" /></a></span> |
  | [⟦T71⟧](/oss/javascript/integrations/chat/fireworks) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/fireworks"><img alt="Downloads per month" /></a></span>|
  | [⟦T72⟧](/oss/javascript/integrations/chat/yandex) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://www.npmjs.com/package/@langchain/yandex"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](/oss/javascript/integrations/chat/togetherai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@langchain/together-ai"><img alt="Downloads per month" /></a></span>|| [⟦T74⟧](/oss/javascript/integrations/chat/perplexity) | <span>✅</span> | <span>❌</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://www.npmjs.com/package/@langchain/perplexity"><img alt="Downloads per month" /></a></span> |
  | [⟦T75⟧](https://scx.ai/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@scx-ai/langchain"> <img alt="Downloads per month" /></a></span> |
  | [⟦T76⟧](https://gitlab.com/bitkaio/langchain/kserve-provider) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://www.npmjs.com/package/@bitkaio/langchain-kserve"><img alt="Downloads per month" /></a></span>|| [⟦T77⟧](/oss/javascript/integrations/chat/fake) | <span /> | <span /> | <span /> | <span /> | <span>不适用</span> |
  | [⟦T78⟧](https://futurmix.ai/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>不适用</span> |
  | [⟦T79⟧](https://auxen.ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> |
</div><Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>