<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom model providers | https://docs.langchain.com/langsmith/llm-gateway-custom-providers -->

# 自定义模型提供者

通过 LLM 网关将请求路由到自定义 OpenAI 或 Anthropic 兼容端点，例如自托管开源模型。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

除了 [built-in providers](/langsmith/llm-gateway-direct-model-access#choose-a-provider-path) 之外，LLM 网关还可以将请求代理到您自己配置的**任何 OpenAI 兼容或 Anthropic 兼容端点**，例如通过推理服务器（vLLM、Ollama 等）提供服务的自托管开源模型。

## 它是如何工作的

自定义提供程序由 [model configuration](/langsmith/model-configurations) 定义，您保存在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-gateway-custom-providers) 的 **设置 → 模型配置** 下。您在该配置中选择的提供商设置网关与上游对话的格式：

|配置提供者|电线格式 |端点示例 |
| ------------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| **OpenAI 兼容端点** |开放人工智能 | `POST /v1/chat/completions`、`POST /v1/responses` |
| **人为** |人择信息 | `POST /v1/messages`、`POST /v1/messages/count_tokens` |

网关使用配置中的以下选项：* **基本 URL**：网关将请求转发到的上游端点。
* A **模型名称**：您的上游期望的模型标识符。
* **API 密钥**：存储为 [workspace secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)，从未由客户端发送。

您可以通过两种路由之一按名称寻址已保存的配置，具体取决于您是希望调用者选择模型还是希望强制执行已配置的模型：

|路线 |请求正文中的型号名称 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `https://gateway.smith.langchain.com/providers/{configName}` |按原样转发到上游——客户端选择模型。                   |
| `https://gateway.smith.langchain.com/models/{configName}` |使用配置的模型名称覆盖 — 客户端的值将被忽略。 |

两条路由查找相同的配置，解析相同的密钥，并代理到相同的上游 URL；它们的区别仅在于是否强制使用型号名称。<Note>
  `{configName}` 是工作区[model configuration](/langsmith/model-configurations) 中的配置名称。如果名称包含非 URL 安全的字符（例如 `/` 或空格），请在路径中对它们进行 URL 编码。例如，名为 `meta-llama/Llama-3.1-8B-Instruct` 的配置将变为 `https://gateway.smith.langchain.com/providers/meta-llama%2FLlama-3.1-8B-Instruct/v1/chat/completions`。
</Note>

## 1. 创建自定义提供程序配置

1. 将上游端点的 API 密钥添加为 **设置 → 集成 → 提供商机密** 下的工作区机密。为其指定一个描述性名称（例如，`MY_PROVIDER_API_KEY`）。
2. 转到 **设置 → 模型配置** 并使用 **OpenAI Compatible Endpoint** 或 **Anthropic** 作为提供者创建配置。
3. 将 **基本 URL** 设置为您的上游端点（例如，`https://my-inference-server.example.com/v1`），将 **模型名称** 设置为端点所需的模型标识符。
4. 将 **API Key Name** 设置为您创建的密钥。
5. 使用**名称**保存配置。该名称是您将在网关路由中使用的名称。

<Note>
  仅当您通过`/models/{configName}`调用配置时，您保存的**模型名称**才有意义。通过 `/providers/{configName}`，客户端的 `model` 字段原封不动地发送，因此单个配置可以服务于上游支持的任何模型（例如，拉入共享 Ollama 实例的任何模型）。
</Note>

## 2. 拨打电话按名称调用保存的配置（以下示例中的`my-custom-openai-endpoint`和`my-anthropic-endpoint`）。

### 任何型号：`/providers/{configName}`

当上游提供多个模型并且您希望调用者选择哪一个时，请使用此路由：

<CodeGroup>
  ```bash OpenAI-compatible theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/providers/my-custom-openai-endpoint/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"ping"}]}'
  ```

  ```bash Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/providers/my-anthropic-endpoint/v1/messages \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"claude-sonnet-4-6","max_tokens":1024,"messages":[{"role":"user","content":"ping"}]}'
  ```
</CodeGroup>

网关将请求体的`model`字段原样转发给上游。

### 型号之一：`/models/{configName}`

使用此路由将通过此配置的每个调用固定到单个模型，无论客户端请求什么，这对于为团队或应用程序强制执行模型行为非常有用：

<CodeGroup>
  ```bash OpenAI-compatible theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/models/my-custom-openai-endpoint/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"messages":[{"role":"user","content":"ping"}]}'
  ```

  ```bash Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/models/my-anthropic-endpoint/v1/messages \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"max_tokens":1024,"messages":[{"role":"user","content":"ping"}]}'
  ```
</CodeGroup>

网关使用保存的配置中的模型名称覆盖请求正文的 `model` 字段，因此客户端传递的任何值（或根据示例省略它）都会被忽略。要为来自同一上游的多个固定模型提供服务，请为每个模型创建一个配置（每个配置都有自己的名称和 `/models/{configName}` 路由）。

## 后续步骤

* [Model fallbacks](/langsmith/llm-gateway-fallbacks)：链接这些配置，以便在出现速率限制或错误时由备份接管。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：对定制提供商应用成本限制。
* [Data protection](/langsmith/llm-gateway-data-protection)：在敏感数据到达端点之前对其进行编辑。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-custom-providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>