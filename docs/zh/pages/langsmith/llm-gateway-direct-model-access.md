<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Direct model access | https://docs.langchain.com/langsmith/llm-gateway-direct-model-access -->

# 直接模型访问

直接通过提供商特定的 LLM 网关路径访问提供商 API，无需使用网关标准化层。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

直接模型访问通过特定于提供商的网关路径公开每个提供商 API。网关仍然处理身份验证、提供商机密、策略和跟踪，但它不会将请求和响应转换为另一个提供商的 API 格式。

直接模型访问是默认使用的路径[LangChain and Deep Agents](#configure-langchain-and-deep-agents)。对于其他客户端，当您需要提供程序的本机请求和响应行为时使用它。要以一种 API 格式跨提供者调用模型，请改用 [standard endpoint](/langsmith/llm-gateway-api-formats)。

## 选择提供商路径

将提供程序路径附加到您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway) 基本 URL，例如 `https://eu.gateway.smith.langchain.com/anthropic`，以便在 GCP EU 中直接访问 Anthropic：

|供应商|网关路径|
| - | - |
| Anthropic | `/anthropic` |
| AWS 基岩 | `/bedrock` |
| Azure 铸造厂 | `/azure` |
|巴斯坦| `/baseten` |
|烟花| `/fireworks` |
|谷歌双子座 | `/gemini` |
| Gemini 企业代理平台（Vertex AI）| `/vertex` |
| OpenAI | `/openai` |
|缩小| `/scaledown` |
|类型安全 | `/typesafe` |
| xAI | `/xai` |每个路径都使用存储在调用者工作区中的提供者密钥。对于秘密名称，请参阅[Provider authentication](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)。

[Gateway Credits models](/langsmith/llm-gateway-credits) 使用标准端点而不是特定于提供商的路径。这些托管模型不需要您自己的提供商机密。

## 配置提供商 SDK

将每个提供商 SDK 的基本 URL 设置为其直接网关路径，并使用您的 LangSmith API 密钥作为提供商 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
export BASE_URL="https://gateway.smith.langchain.com"

export ANTHROPIC_BASE_URL="$BASE_URL/anthropic"
export OPENAI_BASE_URL="$BASE_URL/openai/v1"
export GOOGLE_GEMINI_BASE_URL="$BASE_URL/gemini"

export ANTHROPIC_API_KEY="$LANGSMITH_API_KEY"
export OPENAI_API_KEY="$LANGSMITH_API_KEY"
export GEMINI_API_KEY="$LANGSMITH_API_KEY"
export GOOGLE_API_KEY="$LANGSMITH_API_KEY"
```

网关解析实际的提供者密钥提供者秘密，因此提供者密钥不需要存储在本地。

```python OpenAI SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.environ["LANGSMITH_API_KEY"],
)
response = client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[{"role": "user", "content": "ping"}],
)
print(response.choices[0].message.content)
```

```python Anthropic SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import anthropic

client = anthropic.Anthropic(
    base_url=os.environ["ANTHROPIC_BASE_URL"],
    api_key=os.environ["LANGSMITH_API_KEY"],
)
message = client.messages.create(
    model="claude-opus-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "ping"}],
)
print(message.content[0].text)
```

直接路径使用提供程序的本机模型名称，不带提供程序前缀。

## 创建嵌入

网关通过直接路径将嵌入请求路由到 OpenAI、Azure Foundry 和 Gemini Enterprise Agent Platform。使用这些路径生成具有与其他网关请求相同的工作区凭据、策略和跟踪的向量。 [standard endpoint](/langsmith/llm-gateway-api-formats) 不接受嵌入请求。

在发送请求之前配置提供商的[workspace credentials](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)。使用您的 LangSmith API 密钥（而不是提供商密钥）对网关进行身份验证。这些示例使用 US Cloud 主机名。要使用其他区域，请将其替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway) 主机名。|供应商|嵌入端点 |请求格式|
| - | - | - |
| OpenAI | `POST /openai/v1/embeddings` | `model` 和 `input`。 |
| Azure 铸造厂 | `POST /azure/v1/embeddings` | `model`（部署名称）和`input`。 |
| Gemini企业代理平台 | `POST /vertex/v1/publishers/google/models/{model}:embedContent` | `content.parts`。 |
| Gemini企业代理平台| `POST /vertex/v1/publishers/google/models/{model}:batchEmbedContents` | `requests`，每个包含`content.parts`。 |
| Gemini企业代理平台 | `POST /vertex/v1/publishers/google/models/{model}:predict` | `instances`，每个包含`content`。仅`gemini-embedding-*`型号。 |

### 致电 OpenAI 或 Azure Foundry

对于 OpenAI，将 `model` 设置为不带 `openai/` 前缀的嵌入模型 ID。对于 Azure Foundry，请使用 [configured Foundry resource](/langsmith/llm-gateway-provider-authentication#configure-azure-foundry) 上的部署名称，而不是底层模型 ID。

```bash OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/openai/v1/embeddings \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "text-embedding-3-small",
    "input": "The quick brown fox"
  }'
```

```bash Azure Foundry theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/azure/v1/embeddings \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "<deployment-name>",
    "input": "The quick brown fox"
  }'
```

两个端点都返回提供者的 OpenAI 格式嵌入响应，向量位于 `data[].embedding` 中。

### 呼叫Gemini企业代理平台

Gemini Enterprise Agent Platform 使用 Google 的本机请求和响应格式。

表中的短路径使用 [Gemini Enterprise Agent Platform credentials and workspace secrets](/langsmith/llm-gateway-provider-authentication#configure-gemini-enterprise-agent-platform) 中的项目和位置。您也可以在路径中指定它们：`/vertex/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:{action}`。网关接受`v1beta`和`v1beta1`下相同的路径形式。

```bash Single embedding theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/vertex/v1/publishers/google/models/gemini-embedding-2:embedContent \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "content": {"parts": [{"text": "The quick brown fox"}]}
  }'
```

```bash Batch embeddings theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/vertex/v1/publishers/google/models/gemini-embedding-2:batchEmbedContents \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "requests": [
      {"content": {"parts": [{"text": "Name 5 colors"}]}},
      {"content": {"parts": [{"text": "Name 5 animals"}]}}
    ]
  }'
```

```bash Predict embeddings theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl "https://gateway.smith.langchain.com/vertex/v1/projects/<project-id>/locations/us-central1/publishers/google/models/gemini-embedding-001:predict" \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "instances": [{"content": "The quick brown fox"}]
  }'
```将 `:predict` 示例中的 `<project-id>` 替换为您的 Google Cloud 项目 ID。选择模型可用的位置。 `:predict`路线仅接受以`gemini-embedding-`开头的型号ID。其他型号，包括`text-embedding-*`、`text-multilingual-embedding-*`、`multimodalembedding@001`，返回`501`。

从 `embedding.values` 读取`embedContent`、`embeddings[].values` `batchEmbedContents` 和`predictions[].embeddings.values` `predict` 的向量。

### 使用 LangChain 嵌入

使用直接网关基本 URL 和您的 LangSmith API 密钥显式配置 [OpenAIEmbeddings](/oss/python/integrations/embeddings/openai)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    base_url="https://gateway.smith.langchain.com/openai/v1",
    api_key=os.environ["LANGSMITH_API_KEY"],
)
vector = embeddings.embed_query("The quick brown fox")
```

下一节中聊天模型的 `LANGSMITH_GATEWAY` 设置不能替代配置嵌入客户端的基本 URL。

### 跟踪使用情况并应用策略

嵌入请求通过网关策略并在 LLM 运行时出现在 [gateway traces](/langsmith/llm-gateway-traces) 中。令牌的使用来自提供商的响应。嵌入请求不使用[fallback chains](/langsmith/llm-gateway-fallbacks)。

如果模型没有匹配的价格条目，[add a model price](/langsmith/cost-tracking#create-a-new-or-modify-an-existing-model-price-entry) 跟踪嵌入成本。

## 配置LangChain和Deep Agents

[LangChain](/oss/python/langchain/overview)聊天模型和[Deep Agents](/oss/python/deepagents/overview)，包括[Deep Agents Code](/oss/deepagents/code/overview)，通过`LANGSMITH_GATEWAY`环境变量到达这些提供者路径：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="lsv2_..."
export LANGSMITH_GATEWAY="true"
```

Deep Agents 代码还需要 `LANGSMITH_GATEWAY_API_KEY`。将其设置为相同的键：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
```

> [!注意]
>
> `LANGSMITH_GATEWAY` 支持需要以下最低 Python 包版本：`langchain-anthropic>=1.5.1`、`langchain-baseten>=0.2.3`、`langchain-fireworks>=1.5.1`、`langchain-google-genai>=4.3.2` 和 `langchain-openai>=1.4.1`。每个受支持的集成都会附加其自己的提供程序路径，因此 `ChatAnthropic` 调用 `https://gateway.smith.langchain.com/anthropic`，`ChatOpenAI` 调用 `https://gateway.smith.langchain.com/openai/v1`。要通过标准端点路由请求，请参阅[Send your first LLM Gateway request](/langsmith/llm-gateway-first-request#send-a-request-from-your-code)。

## 另请参阅

* [Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)：使用标准API跨提供商调用模型。
* [Set up the LLM Gateway](/langsmith/llm-gateway-admin-setup)：配置提供者机密和访问。
* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：查看网关痕迹出现的位置以及谁可以查看它们。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-direct-model-access.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。