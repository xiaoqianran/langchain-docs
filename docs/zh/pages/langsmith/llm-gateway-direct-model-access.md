<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Direct model access | https://docs.langchain.com/langsmith/llm-gateway-direct-model-access -->

# 直接模型访问

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

直接模型访问通过特定于提供商的网关路径公开每个提供商 API。网关仍然处理身份验证、提供商机密、策略和跟踪，但它不会将请求和响应转换为另一个提供商的 API 格式。

对于跨提供商的模型调用，首选 [standard model access](/langsmith/llm-gateway-quickstart)。当您想要直接访问提供商的 API、保留其本机请求和响应行为并避免网关的标准化层时，请使用直接模型访问。

## 选择提供商路径

将提供商路径附加到您的区域网关基本 URL：

|供应商|网关路径|秘密名字|
| ---| ---| ---|
| Anthropic | `/anthropic` | `ANTHROPIC_API_KEY` |
| AWS 基岩 | `/bedrock` | `AWS_BEARER_TOKEN_BEDROCK` |
|巴斯坦| `/baseten` | `BASETEN_API_KEY` |
|烟花| `/fireworks` | `FIREWORKS_API_KEY` |
|谷歌双子座 | `/gemini` | `GOOGLE_API_KEY` |
|谷歌顶点人工智能 | `/vertex` | `VERTEX_SERVICE_ACCOUNT_JSON` |
| OpenAI | `/openai` | `OPENAI_API_KEY` |

[Gateway Credits models](/langsmith/llm-gateway-credits) 使用标准端点而不是特定于提供者的路径。这些托管模型不需要您自己的提供商秘密。

## 配置提供商 SDK

将每个提供商 SDK 的基本 URL 设置为其直接网关路径，并使用您的 LangSmith API 密钥作为提供商 API 密钥：

```bash
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
export BASE_URL="https://gateway.smith.langchain.com"

export ANTHROPIC_BASE_URL="$BASE_URL/anthropic"
export OPENAI_BASE_URL="$BASE_URL/openai/v1"
export GOOGLE_GEMINI_BASE_URL="$BASE_URL/gemini"

export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
export OPENAI_API_KEY="$LANGSMITH_API_KEY"
export GEMINI_API_KEY="$LANGSMITH_API_KEY"
export GOOGLE_API_KEY="$LANGSMITH_API_KEY"
```网关从工作区的提供者密钥中解析实际的提供者密钥，因此提供者密钥不需要存储在本地。

<CodeGroup>

```python OpenAI SDK
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.environ["LANGSMITH_API_KEY"],
)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "ping"}],
)
print(response.choices[0].message.content)
```

```python Anthropic SDK
import os

import anthropic

client = anthropic.Anthropic(
    base_url=os.environ["ANTHROPIC_BASE_URL"],
    api_key=os.environ["LANGSMITH_API_KEY"],
)
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "ping"}],
)
print(message.content[0].text)
```

</CodeGroup>

直接路径使用提供程序的本机模型名称，不带提供程序前缀。

## 配置LangChain和Deep Agents

[LangChain](/oss/python/langchain/overview)聊天模型和[Deep Agents](/oss/python/deepagents/overview)，包括[Deep Agents Code](/oss/deepagents/code/overview)，通过两个便利的环境变量支持直接网关路径：

```bash
export LANGSMITH_GATEWAY="true"
export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
```

这通过`https://gateway.smith.langchain.com`的提供商特定路径路由支持的聊天模型。要使用区域网关，请设置其 URL 而不是 `true`：

```bash
export LANGSMITH_GATEWAY="https://eu.gateway.smith.langchain.com"
export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
```

<Accordion title="Supported models and configuration precedence">

- 仅在 Python 中受支持。
- 支持的聊天模式：
  - [Anthropic](/oss/python/integrations/chat/anthropic) (`langchain-anthropic >= 1.5.1`)
  - [Baseten](/oss/python/integrations/chat/baseten) (`langchain-baseten >= 0.2.3`)
  - [Fireworks](/oss/python/integrations/chat/fireworks) (`langchain-fireworks >= 1.5.1`)
  - [Google Gemini](/oss/python/integrations/chat/google_generative_ai) (`langchain-google-genai >= 4.3.2`)
  - [OpenAI](/oss/python/integrations/chat/openai) (`langchain-openai >= 1.4.1`)
- 特定于提供商的基本 URL 优先于网关设置。例如，`OPENAI_API_BASE` 将 OpenAI 发送到该 URL，而所有其他受支持的提供商继续使用该网关。

</Accordion>

## 使用区域网关

如果您的 LangSmith 账户位于区域实例上，请使用相应的 [regional gateway](/langsmith/llm-gateway-api-formats#use-a-regional-gateway) 并附加提供程序路径。例如，在 GCP EU 中使用 `https://eu.gateway.smith.langchain.com/anthropic` 直接访问 Anthropic。

## 另请参阅- [Quickstart](/langsmith/llm-gateway-quickstart)：使用标准API跨提供商调用模型。
- [Admin setup](/langsmith/llm-gateway-admin-setup)：配置提供者机密和访问。
- [Traces, Engine, and access control](/langsmith/llm-gateway-access)：查看网关痕迹出现的位置以及谁可以查看它们。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-direct-model-access.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>