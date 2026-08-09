<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model fallbacks | https://docs.langchain.com/langsmith/llm-gateway-fallbacks -->

# 模型回退

当主模型速率限制、错误或返回另一个配置的状态代码时，自动重试备份模型配置的请求。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

当主模型返回您标记为可重试的错误（例如速率限制或提供程序中断）时，模型回退会针对一个或多个备份 [model configurations](/langsmith/model-configurations) 重试请求。无需在每个代理中构建重试逻辑，而是在 LangSmith 中定义一次回退顺序并通过单个网关路由调用它。

## 它是如何工作的

后备配置具有：

* **名字**：暴露在路线`https://gateway.smith.langchain.com/routes/{name}`。客户端调用此 URL，而不是特定于提供者的路径。
* **一个或多个后备链**：每个都是 [model configurations](/langsmith/model-configurations) 的有序列表，按优先级顺序进行尝试。
* **触发器**：上游 HTTP 状态代码，应导致网关移至链中的下一个模型。例如，`429`表示速率限制，或`500`、`502`、`503`、`504`表示其他提供商错误。

对于每个请求，网关：1. 从请求路径确定传输格式，并仅考虑该格式的链（参见[Wire formats](#wire-formats)）。
2. 选择其中一条链（参见[Selecting a chain](#selecting-a-chain)）。
3. 调用链的第一个模型配置。
4. 如果响应状态与配置的触发器匹配，则丢弃该响应并调用链中的下一个模型配置。
5. 重复，直到候选者返回非触发响应，或者链耗尽——在这种情况下，最后一个候选者的响应将返回给调用者。

链中的每个配置都可以指向不同的提供者和模型。在第一次尝试和任何回退中，网关都会使用其配置的模型名称调用候选者，替换客户端发送的值。客户端的模型字段仅从与路径的[wire format](#wire-formats)匹配的链中选择要使用的链。如果没有链匹配，网关将使用为该有线格式定义的第一个链作为默认值。

## 有线格式

每个链要么与 OpenAI 兼容，要么与 Anthropic 兼容，因为网关将相同的请求正文转发给其中的每个候选者：|链格式|型号配置提供商| `/routes/{name}` 上的路径 |
| -------------------- | ------------------------------------------ | ------------------------------------------------- |
|兼容 OpenAI | **OpenAI 兼容端点** | `POST /v1/chat/completions`、`POST /v1/responses` |
|人类兼容 | **人为** | `POST /v1/messages` |

只有这两种提供者类型可以串联。为其他提供商（例如 Azure OpenAI 或 Bedrock）保存的 [model configuration](/langsmith/model-configurations) 不符合条件。要访问使用 OpenAI API 的主机，请将其保存为 **OpenAI 兼容端点**及其基本 URL。

您调用的路径选择格式，网关仅考虑该格式的链。任何其他路径都会返回`501 Not Implemented`。

单个后备配置可以容纳两种有线格式的链，因此一条路由可以同时服务于 OpenAI 兼容和 Anthropic 兼容的客户端。混合格式是可选的：仅具有 OpenAI 兼容链的配置为 `/v1/messages` 调用返回 `502`，而仅具有 Anthropic 兼容链的配置为 `/v1/chat/completions` 调用返回 `502`。

## 创建后备配置<Warning>
  创建和管理后备配置需要 `organization:manage` 权限。有关完整权限细分，请参阅[access control](/langsmith/llm-gateway-access)。
</Warning>

1. 转至 **设置 → 网关 → LLM 网关**，然后选择 **模型回退** 选项卡。
2. 单击**创建配置**。
3. 输入**配置名称**。这将成为网关 URL `https://gateway.smith.langchain.com/routes/{name}` 中的`{name}`。
4. 选择配置所属的**工作区**。 [Model configurations](/langsmith/model-configurations) 是工作区范围的，因此只有该工作区的配置可添加到链中。工作区以后无法更改 - 删除并重新创建配置即可移动它。
5. 在 **回退触发器** 下，查看应触发回退的 HTTP 状态代码。该列表预先填充了其他提供商有机会提供服务的临时代码（例如 `429`、`500` 和 `503`）；根据需要添加或删除代码。6. 在 **模型后备链** 下，单击 **添加链**，然后按照网关应尝试的顺序添加两到五个模型配置。链条的第一个模型修复了它的[wire format](#wire-formats)；只能遵循该格式的配置。网关按格式对链进行分组，每组中的第一个链是该格式的**默认**，当请求的模型未选择另一个链时，它会使用该格式。
7. 单击**创建配置**。

## 拨打电话

在您想要的 [wire format](#wire-formats) 路径上以与调用 [custom provider](/langsmith/llm-gateway-custom-providers) 相同的方式调用该路线：

<CodeGroup>
  ```bash OpenAI-compatible theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/routes/my-route/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"messages":[{"role":"user","content":"ping"}]}'
  ```

  ```bash Anthropic-compatible theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/routes/my-route/v1/messages \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"max_tokens":1024,"messages":[{"role":"user","content":"ping"}]}'
  ```
</CodeGroup>

网关按顺序尝试所选链中的每个模型配置，直到其中一个在没有触发状态的情况下做出响应。每次尝试都会根据 [spend policies](/langsmith/llm-gateway-spend-policies) 进行跟踪和计数，因此回退的请求会记录每个候选人尝试过的一次调用。

## 选择一条链

一项配置可以容纳多个后备链，当不同的模型系列需要不同的后备行为时，这非常有用。在与请求的[wire format](#wire-formats)匹配的链中，网关通过请求正文的`model`字段选择一个链，按以下顺序：1. 如果 `model` 与链的 **别名** 匹配，则使用该链。
2. 否则，如果 `model` 与链的**主**（第一个）模型配置的底层模型名称匹配，则使用该链。
3. 如果 `model` 被省略，或者两者都不匹配，则使用该格式的第一个（默认）链。

别名是可选的，并在创建配置时为每个链设置。这是一个面向呼叫者的名称，因此客户可以在不知道哪个模型支持它的情况下请求`"model": "heavy"`。

链中的每个模型配置都可以指向不同的主机，因此链可以在同一模型的单独部署之间进行故障转移（例如，从主端点到备份），而不会出现单个主机作为故障点的情况。

例如，具有三个链的配置：|链条|格式|型号（按优先顺序）|
| -------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1（默认 OpenAI 兼容）|兼容 OpenAI | OpenAI 上的 `gpt-5.5` → Azure OpenAI 上的 `gpt-5.5` → 自托管端点上的 `llama-3.3-70b` |
| 2 |兼容 OpenAI | OpenAI 上的`gpt-4o-mini` → Fireworks 上的`kimi-k2` |
| 3（默认 Anthropic 兼容）|人类兼容 | `claude-sonnet-4-6` 论人择 → `claude-haiku-4-5` 论人择 |

* 带有 `"model": "gpt-5.5"` 的 `/v1/chat/completions` 请求使用链 1，该链从 OpenAI 故障转移到 Azure OpenAI，再到自托管端点。
* 带有 `"model": "gpt-4o-mini"` 的 `/v1/chat/completions` 请求使用链 2，该链从 OpenAI 故障转移到 Fireworks。
* 具有无法识别或省略模型的 `/v1/chat/completions` 请求使用链 1，这是该格式的默认值。
* `/v1/messages` 请求使用链 3，无论其 `model` 是什么，因为它是唯一与 Anthropic 兼容的链。链 1 和链 2 永远不符合该路径的条件。

## 后续步骤* [Custom model providers](/langsmith/llm-gateway-custom-providers)：直接调用相同的模型配置，一次一个，没有后备链。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：在后备路由的同时应用成本限制。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-fallbacks.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>