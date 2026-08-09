<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Google integrations | https://docs.langchain.com/oss/javascript/integrations/providers/google -->

# 谷歌集成

使用 LangChain JavaScript 与 Google 集成。

LangChain通过`@langchain/google`包提供与[Google AI Studio](https://aistudio.google.com/)和[Google Cloud Vertex AI](https://cloud.google.com/vertex-ai)的集成。

<Info>
  正在寻找旧版 `@langchain/google-genai` 或 `@langchain/google-vertexai` 套件？它们在[long-term support](#legacy-packages)下维护，但不再推荐用于新项目。
</Info>

## 聊天模型

[⟦T12⟧](/oss/javascript/integrations/chat/google) 类是访问 Gemini 模型（例如 `gemini-2.5-pro`、`gemini-2.5-flash` 和 `gemini-3.1-pro-preview`）以及像 Gemma 这样的开放模型的推荐方式。它在单一界面中支持 Google AI Studio 和 Vertex AI

<Tip>
  参见[this section for general instructions on installing LangChain packages](/oss/javascript/langchain/install)。
</Tip>

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

配置您的 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY=your-api-key
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogle } from "@langchain/google";

const model = new ChatGoogle("gemini-2.5-flash");

const res = await model.invoke([
  ["human", "What would be a good company name for a company that makes colorful socks?"],
]);
```

`ChatGoogle` 支持工具调用、结构化输出、多模态输入（图像、音频、视频）、推理/思考、图像生成、文本转语音以及 Gemini 特定的原生工具，例如 Google 搜索基础和代码执行。

<CardGroup>
  <Card title="ChatGoogle" icon="message-chatbot" href="/oss/javascript/integrations/chat/google">
    完整的聊天模型文档，包括设置、调用、流式传输、结构化输出等。
  </Card>

  <Card title="Gemini native tools" icon="tool" href="/oss/javascript/integrations/tools/google">
    Google 搜索、代码执行、URL 上下文、Google 地图、文件搜索、计算机使用和 MCP 服务器。
  </Card>
</CardGroup>

### Vertex AI 上的第三方模型[Anthropic](/oss/javascript/integrations/chat/anthropic) 克劳德型号也可通过
[Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude)
平台。参见[using Claude on Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude)
有关启用模型访问和要使用的模型名称的更多信息。

### Postgres 矢量存储 (Cloud SQL)

[PostgresVectorStore](/oss/javascript/integrations/vectorstores/google_cloudsql_pg) 模块来自
[⟦T17⟧](https://www.npmjs.com/package/@langchain/google-cloud-sql-pg)包提供了使用CloudSQL for PostgreSQL进行存储的方法
向量嵌入。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/google-cloud-sql-pg @langchain/core
```

## 旧包

以下软件包是在现有用户的长期支持下维护的。新项目应该使用`@langchain/google`代替。

### `@langchain/google-genai`

`@langchain/google-genai`包提供了[⟦T21⟧](/oss/javascript/integrations/chat/google_generative_ai)和[⟦T22⟧](/oss/javascript/integrations/embeddings/google_generative_ai)用于通过Google AI Studio访问Gemini模型。该软件包基于已弃用的 Google SDK 构建，不会接收新功能。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/google-genai @langchain/core
```

### `@langchain/google-vertexai`

`@langchain/google-vertexai` 软件包为 Node.js 上的 Vertex AI 提供 [⟦T25⟧](/oss/javascript/integrations/chat/google_vertex_ai)、[⟦T26⟧](/oss/javascript/integrations/embeddings/google_vertex_ai) 和 [⟦T27⟧](/oss/javascript/integrations/llms/google_vertex_ai)。它依赖于[⟦T28⟧](#%40langchain%2Fgoogle-gauth)进行身份验证。该软件包已被 `@langchain/google` 内置的用于聊天的 Vertex AI 支持取代。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/google-vertexai @langchain/core
```

### `@langchain/google-vertexai-web`

`@langchain/google-vertexai-web` 包为浏览器和 Edge 运行时提供相同的 Vertex AI 聊天、嵌入和 LLM 类。在 Web 环境中运行时安装此软件包（不是 `@langchain/google-vertexai`）。这取决于[⟦T33⟧](#%40langchain%2Fgoogle-webauth)。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/google-vertexai-web @langchain/core
```

请参阅 [Vertex AI chat](/oss/javascript/integrations/chat/google_vertex_ai) 页面了解 `GOOGLE_WEB_CREDENTIALS` 和 Web 导入路径。

### `@langchain/google-webauth`[⟦T36⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google-webauth) 软件包为旧版 Vertex AI 集成提供浏览器和 Edge 身份验证。它会与 `@langchain/google-vertexai-web` 一起自动安装 — 不要将其与 `@langchain/google-gauth` 一起安装。

在`GOOGLE_WEB_CREDENTIALS`（或已弃用的`GOOGLE_VERTEX_AI_WEB_CREDENTIALS`）中设置服务帐户JSON。您还可以将 `apiKey` 或 `authOptions` 传递给模型构造函数，或设置 `API_KEY` 环境变量。

### `@langchain/google-gauth`

[⟦T45⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google-gauth) 包为基于 [⟦T46⟧](#%40langchain%2Fgoogle-common) 构建的旧版 Google 集成提供 Node.js 身份验证。当您添加 `@langchain/google-vertexai` 时，它会自动安装 - 您通常**不**直接安装或导入 `@langchain/google-gauth`。

在 Node.js 上，凭据按以下顺序解析：

1. `apiKey`传递给模型构造函数
2. `authOptions`传递给模型构造函数
3. `API_KEY`环境变量
4. `GOOGLE_APPLICATION_CREDENTIALS`路径中的服务帐户JSON
5.应用程序默认凭据（例如在`gcloud auth application-default login`之后，或在Google Cloud上）

不要在同一个项目中使用`@langchain/google-gauth`和`@langchain/google-webauth`。

统一的[⟦T56⟧](/oss/javascript/integrations/chat/google)包直接使用`google-auth-library`，不需要`@langchain/google-gauth`或`@langchain/google-webauth`。

### `@langchain/google-cloud-sql-pg`

[⟦T61⟧](https://www.npmjs.com/package/@langchain/google-cloud-sql-pg) 软件包为 Cloud SQL for PostgreSQL 提供 [⟦T62⟧](/oss/javascript/integrations/vectorstores/google_cloudsql_pg) 和 [⟦T63⟧](/oss/javascript/integrations/document_loaders/web_loaders/google_cloudsql_pg)。它与上面的 Gemini 聊天包是分开的。

### `@langchain/google-common`[⟦T65⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-google-common) 包为[⟦T66⟧](/oss/javascript/integrations/chat/google_vertex_ai) 等遗留集成提供共享的 Gemini 客户端抽象。它不包含授权代码，并且**不是**独立的软件包 - 不要直接安装或导入它。

<Tip>
  要从 `@langchain/google-genai` 或 `@langchain/google-vertexai` 迁移到 `@langchain/google`，请参阅 [ChatGoogle](/oss/javascript/integrations/chat/google) 页面了解设置说明。 `ChatGoogle` 类提供等效功能，可统一访问 Google AI Studio 和 Vertex AI。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/providers/google.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>