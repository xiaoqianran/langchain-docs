<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: API formats | https://docs.langchain.com/langsmith/llm-gateway-api-formats -->

# API 格式

使用 OpenAI 聊天完成、Anthropic 消息或 OpenAI 响应请求通过 LLM 网关跨提供商调用模型。

标准LLM网关API支持三种请求和响应格式。选择您的应用程序已使用的格式，然后通过同一端点调用自带密钥或网关积分模型。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

## 比较API格式

| API格式 |基本网址 |提示端点|兼容客户端|
| ----------------------- | ---------------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| OpenAI 聊天完成 | `https://gateway.smith.langchain.com/v1` | `POST /chat/completions` | OpenAI 兼容聊天完成客户端 |
| Anthropic 留言 | `https://gateway.smith.langchain.com` | `POST /v1/messages` | Anthropic 给客户留言 |
| OpenAI 回复 | `https://gateway.smith.langchain.com/v1` | `POST /responses` | OpenAI兼容响应客户端 |

所有格式均使用工作区范围的 LangSmith API 密钥进行身份验证。将其作为提供商 API 密钥或`Authorization: Bearer` 令牌传递。对于自带钥匙型号，请将`model`设置为`<provider>/<model>`，例如`openai/gpt-5.4-mini`或`anthropic/claude-sonnet-4-6`。对于 Gateway Credits 模型，请传递支持的模型名称，例如 `moonshotai/kimi-k3`。

## 使用聊天完成

将OpenAI兼容客户端指向`https://gateway.smith.langchain.com/v1`。有关完整的请求和响应架构，请参阅[OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)。

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url="https://gateway.smith.langchain.com/v1",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  response = client.chat.completions.create(
      model="anthropic/claude-sonnet-4-6",
      messages=[{"role": "user", "content": "Hello!"}],
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";

  const client = new OpenAI({
    baseURL: "https://gateway.smith.langchain.com/v1",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const response = await client.chat.completions.create({
    model: "anthropic/claude-sonnet-4-6",
    messages: [{ role: "user", content: "Hello!" }],
  });
  ```
</CodeGroup>

## 使用消息

将Anthropic客户端指向`https://gateway.smith.langchain.com`。有关完整的请求和响应架构，请参阅[Anthropic Messages API](https://docs.anthropic.com/en/api/messages)。

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/v1/messages \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"openai/gpt-5.4-mini","max_tokens":1024,"messages":[{"role":"user","content":"Hello!"}]}'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  import anthropic

  client = anthropic.Anthropic(
      base_url="https://gateway.smith.langchain.com",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  message = client.messages.create(
      model="openai/gpt-5.4-mini",
      max_tokens=1024,
      messages=[{"role": "user", "content": "Hello!"}],
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import Anthropic from "@anthropic-ai/sdk";

  const client = new Anthropic({
    baseURL: "https://gateway.smith.langchain.com",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const message = await client.messages.create({
    model: "openai/gpt-5.4-mini",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello!" }],
  });
  ```
</CodeGroup>

## 使用响应

将OpenAI兼容客户端指向`https://gateway.smith.langchain.com/v1`。有关完整的请求和响应架构，请参阅[OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)。

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/v1/responses \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-sonnet-4-6","input":"Hello!"}'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url="https://gateway.smith.langchain.com/v1",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  response = client.responses.create(
      model="anthropic/claude-sonnet-4-6",
      input="Hello!",
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";

  const client = new OpenAI({
    baseURL: "https://gateway.smith.langchain.com/v1",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const response = await client.responses.create({
    model: "anthropic/claude-sonnet-4-6",
    input: "Hello!",
  });
  ```
</CodeGroup>

## 启用提示缓存

OpenAI 模型（聊天完成和响应）自动支持隐式提示缓存，无需额外参数。

Anthropic 型号和一些较旧的 OpenAI 型号需要显式选择加入以提示缓存。通过任何标准网关端点调用这些模型时，在请求正文中传递特定于提供商的字段。

<Note>
  显式缓存支持是一种临时措施，正在制定网关级缓存策略。以下字段将传递到上游提供商。
</Note>

### Anthropic 型号包含 `prompt_cache_options` 和 `ttl` 值：

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/v1/responses \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "anthropic/claude-opus-5",
        "input": "Hello!",
        "prompt_cache_options": {"ttl": "30m"}
      }'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url="https://gateway.smith.langchain.com/v1",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  response = client.responses.create(
      model="anthropic/claude-opus-5",
      input="Hello!",
      extra_body={"prompt_cache_options": {"ttl": "30m"}},
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";

  const client = new OpenAI({
    baseURL: "https://gateway.smith.langchain.com/v1",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const response = await client.responses.create({
    model: "anthropic/claude-opus-5",
    input: "Hello!",
    // @ts-ignore — provider-specific field
    prompt_cache_options: { ttl: "30m" },
  });
  ```
</CodeGroup>

相同的字段适用于聊天完成端点：

```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "anthropic/claude-opus-5",
      "messages": [{"role": "user", "content": "Hello!"}],
      "prompt_cache_options": {"ttl": "30m"}
    }'
```

### 较旧的 OpenAI 型号

一些较旧的 OpenAI 型号支持通过 `prompt_cache_retention` 显式缓存控制。对于大多数型号，将其设置为`"in_memory"`。特别对于`gpt-5.5`，请使用`"24h"`：

```bash cURL (most older models) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/responses \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "openai/gpt-5.4-mini",
      "input": "Hello!",
      "prompt_cache_retention": "in_memory"
    }'
```

```bash cURL (gpt-5.5 specifically) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/responses \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "openai/gpt-5.5",
      "input": "Hello!",
      "prompt_cache_retention": "24h"
    }'
```

有关完整的 `prompt_cache_retention` 文档，请参阅 [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention)。

## 了解翻译行为

端点决定您的应用程序发送和接收的格式。型号 ID 确定上游提供商。

* 当提供商本身支持所选格式时，网关将保留该格式。
* 否则，网关将请求转换为提供商支持的格式，并将响应转换回来，包括流式响应。
* 翻译可以拒绝无法以目标提供者格式表示的字段。当需要提供者本机行为时使用[Direct model access](/langsmith/llm-gateway-direct-model-access)。

无论格式如何，每个请求都会解析相同的提供者机密、策略和跟踪配置。

## 列出型号

调用 `GET /v1/models` 列出为工作区配置的提供程序和 [Gateway Credits](/langsmith/llm-gateway-credits) 提供的可用模型。网关返回单个OpenAI兼容列表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/models \
    -H "Authorization: Bearer $LANGSMITH_API_KEY"
```

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "object": "list",
  "data": [
    {"id": "openai/gpt-5.4-mini", "object": "model"},
    {"id": "fireworks/accounts/fireworks/models/glm-5p2", "object": "model"},
    {"id": "anthropic/claude-opus-5", "object": "model"},
    {"id": "moonshotai/kimi-k3", "object": "model"}
  ]
}
```自带密钥模型 ID 使用 `<provider>/<model>` 形式。托管模型使用响应中显示的 slug。拨打电话时完全按照显示的方式传递任一 ID。省略未配置密钥的自带密钥提供程序；托管模型不需要提供商机密。

## 使用区域网关

将 `gateway.smith.langchain.com` 替换为您的 LangSmith 区域的主机名：

|地区 |网关主机名 |
| -------- | ---------------------------------- |
|基仕伯美国 | `gateway.smith.langchain.com` |
| GCP 欧盟 | `eu.gateway.smith.langchain.com` |
|基仕伯亚太区 | `apac.gateway.smith.langchain.com` |
| AWS 美国 | `aws.gateway.smith.langchain.com` |

为所选 API 格式保留相同的路径。

## 使用 BYOC 数据平面

LLM 网关也可在 [BYOC](/langsmith/byoc) 上使用，它在您的数据平面内运行，因此模型请求及其跟踪保留在您的 VPC 中。将网关主机名替换为您的 [data plane endpoint](/langsmith/byoc-usage#find-your-data-plane-endpoint) 并使用 `/gateway` 作为路径前缀：

| API格式 |基本网址 |提示端点|
| ----------------------- | -------------------------------------- | ------------------------ |
| OpenAI 聊天完成 | `https://<data_plane_host>/gateway/v1` | `POST /chat/completions` |
| Anthropic 留言 | `https://<data_plane_host>/gateway` | `POST /v1/messages` |
| OpenAI 回应 | `https://<data_plane_host>/gateway/v1` | `POST /responses` |使用作用域为该数据平面中的工作区的 API 密钥进行身份验证。将其作为 `Authorization: Bearer` 令牌传递：

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://<data_plane_host>/gateway/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-sonnet-4-6","messages":[{"role":"user","content":"Hello!"}]}'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url="https://<data_plane_host>/gateway/v1",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  response = client.chat.completions.create(
      model="anthropic/claude-sonnet-4-6",
      messages=[{"role": "user", "content": "Hello!"}],
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";

  const client = new OpenAI({
    baseURL: "https://<data_plane_host>/gateway/v1",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const response = await client.chat.completions.create({
    model: "anthropic/claude-sonnet-4-6",
    messages: [{ role: "user", content: "Hello!" }],
  });
  ```
</CodeGroup>

或者将其作为提供商 API 密钥传递。例如，Anthropic消息请求发送`X-Api-Key`标头中的密钥：

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://<data_plane_host>/gateway/v1/messages \
      -H "X-Api-Key: $LANGSMITH_API_KEY" \
      -H "Anthropic-Version: 2023-06-01" \
      -H "Content-Type: application/json" \
      -d '{"model":"openai/gpt-5.4-mini","max_tokens":1024,"messages":[{"role":"user","content":"Hello!"}]}'
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  import anthropic

  client = anthropic.Anthropic(
      base_url="https://<data_plane_host>/gateway",
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  message = client.messages.create(
      model="openai/gpt-5.4-mini",
      max_tokens=1024,
      messages=[{"role": "user", "content": "Hello!"}],
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import Anthropic from "@anthropic-ai/sdk";

  const client = new Anthropic({
    baseURL: "https://<data_plane_host>/gateway",
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const message = await client.messages.create({
    model: "openai/gpt-5.4-mini",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello!" }],
  });
  ```
</CodeGroup>

提供者机密、模型 ID、策略和跟踪的行为与云上相同。

<Warning>
  默认情况下，数据平面配置有专用终端节点，因此您需要专用连接才能到达基本 URL，例如 Tailscale、AWS PrivateLink 或 VPC 对等互连。
</Warning>

## 处理错误|状态或症状 |意义|
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `400 Bad Request` |请求格式错误、模型 ID 不可用或格式不正确，或者请求无法翻译。 |
| `401 Unauthorized` | LangSmith API 密钥丢失或无效。                                                                         |
| `403 Forbidden` |该密钥没有所需的网关权限。                                                              |
| `429 Too Many Requests` |已达到网关速率限制或上游提供商速率限制。                                                 || `GET /v1/models` | 中没有出现带有提供商前缀的模型提供者可能未配置或可能未返回模型目录。                                         |

有关特定于设置的分辨率，请参阅[Quickstart](/langsmith/llm-gateway-quickstart)。

## 另请参阅

* [Quickstart](/langsmith/llm-gateway-quickstart)：发出您的第一个请求并查看其跟踪。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：绕过格式转换并使用提供商原生 API。
* [Model fallbacks](/langsmith/llm-gateway-fallbacks)：针对备份模型重试请求。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-api-formats.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>