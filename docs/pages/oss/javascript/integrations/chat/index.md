<!-- langchain-docs: Chat model integrations | https://docs.langchain.com/oss/javascript/integrations/chat/index -->

# Chat model integrations

Integrate with chat models using LangChain JavaScript.

[Chat models](/oss/javascript/langchain/models) are language models that use a sequence of [messages](/oss/javascript/langchain/messages) as inputs and return messages as outputs <Tooltip>(as opposed to plaintext)</Tooltip>.

## Install and use

<Tip>
  See [this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install).
</Tip>

<AccordionGroup>
  <Accordion title="OpenAI">
    Install:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatOpenAI } from "@langchain/openai";

    const model = new ChatOpenAI({ model: "gpt-5.4-mini" });
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="Anthropic">
    Install:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    ANTHROPIC_API_KEY=your-api-key
    ```

    Instantiate the model:

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
    Install:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GOOGLE_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatGoogle } from "@langchain/google";

    const model = new ChatGoogle("gemini-2.5-flash");
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>

  <Accordion title="MistralAI">
    Install:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    MISTRAL_API_KEY=your-api-key
    ```

    Instantiate the model:

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
    Install:

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

    Add environment variables:

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    GROQ_API_KEY=your-api-key
    ```

    Instantiate the model:

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { ChatGroq } from "@langchain/groq";

    const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0
    });
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    await model.invoke("Hello, world!")
    ```
  </Accordion>
</AccordionGroup>

## Featured models

<Info>
  **While these LangChain classes support the indicated advanced feature**, you may need to refer to provider-specific documentation to learn which hosted models or backends support the feature.
</Info>

<div>
  | Model                                                                               | Stream         | [Tool Calling](/oss/javascript/langchain/tools/) | [`withStructuredOutput()`](/oss/javascript/langchain/models#structured-output) | [`Multimodal`](/oss/javascript/langchain/messages#multimodal) | Downloads                                                                                                           |
  | :---------------------------------------------------------------------------------- | :------------- | :----------------------------------------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
  | [`ChatOpenAI`](/oss/javascript/integrations/chat/openai)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/openai">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatAnthropic`](/oss/javascript/integrations/chat/anthropic)                      | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/anthropic">  <img alt="Downloads per month" /></a></span>   |
  | [`ChatBedrockConverse`](/oss/javascript/integrations/chat/bedrock_converse)         | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span>         |
  | [`ChatGroq`](/oss/javascript/integrations/chat/groq)                                | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/groq">  <img alt="Downloads per month" /></a></span>        |
  | [`ChatOllama`](/oss/javascript/integrations/chat/ollama)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/ollama">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatMistralAI`](/oss/javascript/integrations/chat/mistral)                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/mistralai">  <img alt="Downloads per month" /></a></span>   |
  | [`ChatCohere`](/oss/javascript/integrations/chat/cohere)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/cohere">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatGoogle`](/oss/javascript/integrations/chat/google)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/google">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatXAI`](/oss/javascript/integrations/chat/xai)                                  | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/xai">  <img alt="Downloads per month" /></a></span>         |
  | [`ChatCloudflareWorkersAI`](/oss/javascript/integrations/chat/cloudflare_workersai) | <span>✅</span> | <span>❌</span>                                   | <span>❌</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare">  <img alt="Downloads per month" /></a></span>  |
  | [`ChatFireworks`](/oss/javascript/integrations/chat/fireworks)                      | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/fireworks">  <img alt="Downloads per month" /></a></span>   |
  | [`ChatTogetherAI`](/oss/javascript/integrations/chat/togetherai)                    | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/together-ai">  <img alt="Downloads per month" /></a></span> |
  | [`ChatPerplexity`](/oss/javascript/integrations/chat/perplexity)                    | <span>✅</span> | <span>❌</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/perplexity">  <img alt="Downloads per month" /></a></span>  |
</div>

See the [full list of chat model integrations](#all-chat-models) below for more options.

## Routers & proxies

Routers and proxies give you access to models from multiple providers through a single API and credential. They can simplify billing, let you switch between models without changing integrations, and offer features like automatic fallbacks.

| Provider                             | Integration                                                      | Description                                                                 |
| ------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [OpenRouter](https://openrouter.ai/) | [`ChatOpenRouter`](/oss/javascript/integrations/chat/openrouter) | Unified access to models from OpenAI, Anthropic, Google, Meta, and more     |
| [FuturMix](https://futurmix.ai/)     | [`ChatOpenAI`](https://futurmix.ai/)                             | Unified AI gateway for 22+ models with OpenAI-compatible API and 99.99% SLA |

## Chat Completions API

Certain model providers offer endpoints that are compatible with OpenAI's (legacy) [Chat Completions API](https://platform.openai.com/docs/guides/completions). In such case, you can use [`ChatOpenAI`](/oss/javascript/integrations/chat/openai) with a custom `base_url` to connect to these endpoints. Note that features built on top of the Chat Completions API may not be fully supported by `ChatOpenAI`; in such cases, consider using a provider-specific class if available.

[Auxen](https://auxen.ai) hosts dedicated per-customer LLM endpoints with an OpenAI-compatible Chat Completions API. Use `ChatOpenAI` with a custom base URL and per-instance API key.

## All chat models

<div>
  | Model                                                                               | Stream         | [Tool Calling](/oss/javascript/langchain/tools/) | [`withStructuredOutput()`](/oss/javascript/langchain/models#structured-output) | [`Multimodal`](/oss/javascript/langchain/messages#multimodal) | Downloads                                                                                                               |
  | :---------------------------------------------------------------------------------- | :------------- | :----------------------------------------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
  | [`AzureChatOpenAI`](/oss/javascript/integrations/chat/azure)                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/openai">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatOpenAI`](/oss/javascript/integrations/chat/openai)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/openai">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatAnthropic`](/oss/javascript/integrations/chat/anthropic)                      | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/anthropic">  <img alt="Downloads per month" /></a></span>       |
  | [`ChatGoogleGenerativeAI`](/oss/javascript/integrations/chat/google_generative_ai)  | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/google-genai">  <img alt="Downloads per month" /></a></span>    |
  | [`ChatBedrockConverse`](/oss/javascript/integrations/chat/bedrock_converse)         | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span>             |
  | [`ChatVertexAI`](/oss/javascript/integrations/chat/google_vertex_ai)                | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/google-vertexai">  <img alt="Downloads per month" /></a></span> |
  | [`ChatGroq`](/oss/javascript/integrations/chat/groq)                                | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/groq">  <img alt="Downloads per month" /></a></span>            |
  | [`ChatOllama`](/oss/javascript/integrations/chat/ollama)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/ollama">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatMistralAI`](/oss/javascript/integrations/chat/mistral)                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/mistralai">  <img alt="Downloads per month" /></a></span>       |
  | [`ChatCohere`](/oss/javascript/integrations/chat/cohere)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/cohere">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatGoogle`](/oss/javascript/integrations/chat/google)                            | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/google">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatXAI`](/oss/javascript/integrations/chat/xai)                                  | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/xai">  <img alt="Downloads per month" /></a></span>             |
  | [`ChatDeepSeek`](/oss/javascript/integrations/chat/deepseek)                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/deepseek">  <img alt="Downloads per month" /></a></span>        |
  | [`ChatOpenRouter`](/oss/javascript/integrations/chat/openrouter)                    | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/openrouter">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatCerebras`](/oss/javascript/integrations/chat/cerebras)                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/cerebras">  <img alt="Downloads per month" /></a></span>        |
  | [`ChatBaiduQianfan`](/oss/javascript/integrations/chat/baidu_qianfan)               | <span />       | <span />                                         | <span />                                                                       | <span />                                                      | <span><a href="https://www.npmjs.com/package/@langchain/baidu-qianfan">  <img alt="Downloads per month" /></a></span>   |
  | [`ChatCloudflareWorkersAI`](/oss/javascript/integrations/chat/cloudflare_workersai) | <span>✅</span> | <span>❌</span>                                   | <span>❌</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/cloudflare">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatWatsonx`](/oss/javascript/integrations/chat/ibm)                              | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/ibm">  <img alt="Downloads per month" /></a></span>             |
  | [`ChatFireworks`](/oss/javascript/integrations/chat/fireworks)                      | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/fireworks">  <img alt="Downloads per month" /></a></span>       |
  | [`ChatYandexGPT`](/oss/javascript/integrations/chat/yandex)                         | <span />       | <span />                                         | <span />                                                                       | <span />                                                      | <span><a href="https://www.npmjs.com/package/@langchain/yandex">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatTogetherAI`](/oss/javascript/integrations/chat/togetherai)                    | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/together-ai">  <img alt="Downloads per month" /></a></span>     |
  | [`ChatPerplexity`](/oss/javascript/integrations/chat/perplexity)                    | <span>✅</span> | <span>❌</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span><a href="https://www.npmjs.com/package/@langchain/perplexity">  <img alt="Downloads per month" /></a></span>      |
  | [`ChatSCX`](https://scx.ai/)                                                        | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@scx-ai/langchain">  <img alt="Downloads per month" /></a></span>          |
  | [`ChatKServe`](https://gitlab.com/bitkaio/langchain/kserve-provider)                | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span><a href="https://www.npmjs.com/package/@bitkaio/langchain-kserve">  <img alt="Downloads per month" /></a></span>  |
  | [`FakeListChatModel`](/oss/javascript/integrations/chat/fake)                       | <span />       | <span />                                         | <span />                                                                       | <span />                                                      | <span>N/A</span>                                                                                                        |
  | [`FuturMix`](https://futurmix.ai/)                                                  | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>✅</span>                                                | <span>N/A</span>                                                                                                        |
  | [`Auxen`](https://auxen.ai)                                                         | <span>✅</span> | <span>✅</span>                                   | <span>✅</span>                                                                 | <span>❌</span>                                                | <span>N/A</span>                                                                                                        |
</div>

<Info>
  If you'd like to contribute an integration, see [Contributing integrations](/oss/javascript/contributing#add-a-new-integration).
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>