<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Chat model integrations | https://docs.langchain.com/oss/python/integrations/chat/index -->

# 聊天模型集成

使用 LangChain Python 与聊天模型集成。

[Chat models](/oss/python/langchain/models) 是使用一系列 [messages](/oss/python/langchain/messages) 作为输入并返回消息作为输出 <Tooltip>（与传统的纯文本 LLM 相对）</Tooltip> 的语言模型。

## 特色型号

<Info>
  **虽然这些 LangChain 类支持指定的高级功能**，但您可能需要参考特定于提供商的文档以了解哪些托管模型或后端支持该功能。
</Info>

<div>
  |型号|流 | [Tool calling](/oss/python/langchain/tools) | [Structured output](/oss/python/langchain/structured-output/) | [Multimodal](/oss/python/langchain/messages#multimodal) |下载 |
  | :- | :- | :- | :- | :- | :- |
  | [⟦T0⟧](/oss/python/integrations/chat/azure_chat_openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T1⟧](/oss/python/integrations/chat/openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T2⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T3⟧](/oss/python/integrations/chat/anthropic) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-anthropic/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T4⟧](/oss/python/integrations/chat/google_generative_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-google-genai/"><img alt="Downloads per month" /></a></span>|| [⟦T5⟧](/oss/python/integrations/chat/ollama) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-ollama/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T6⟧](/oss/python/integrations/chat/groq) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-groq/"><img alt="Downloads per month" /></a></span>|
  | [⟦T7⟧](/oss/python/integrations/chat/litellm) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-litellm/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T8⟧](/oss/python/integrations/chat/huggingface) | <span>❌</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-huggingface/"><img alt="Downloads per month" /></a></span>|
  | [⟦T9⟧](/oss/python/integrations/chat/openrouter) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openrouter/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T10⟧](/oss/python/integrations/chat/mistralai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-mistralai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T11⟧](/oss/python/integrations/chat/xai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-xai/">​​<img alt="Downloads per month" /></a></span>|
  | [⟦T12⟧](/oss/python/integrations/chat/deepseek) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-deepseek/"><img alt="Downloads per month" /></a></span>|
  | [⟦T13⟧](/oss/python/integrations/chat/databricks) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/databricks-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T14⟧](/oss/python/integrations/chat/cohere) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|| [⟦T15⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"><img alt="Downloads per month" /></a></span>|
  | [⟦T16⟧](/oss/python/integrations/chat/together) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-together/"><img alt="Downloads per month" /></a></span>|
  | [⟦T17⟧](/oss/python/integrations/chat/amazon_nova) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span /> | <span><a href="https://pypi.org/project/langchain-amazon-nova/"> <img alt="Downloads per month" /></a></span> |
</div>

有关更多选项，请参阅下面的[full list of chat model integrations](#all-chat-models)。

## 路由器和代理

路由器和代理使您可以通过单个 API 和凭证访问多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退等功能。

|供应商|整合 |描述 |
| - | - | - |
| [OpenRouter](https://openrouter.ai/) | [⟦T18⟧](/oss/python/integrations/chat/openrouter) |统一访问来自OpenAI、Anthropic、Google、Meta 等的模型 |
| [LiteLLM](https://www.litellm.ai/) | [⟦T19⟧](/oss/python/integrations/chat/litellm) | OpenAI、Anthropic、Azure、Hugging Face 等的统一接口，具有路由和回退功能 |

## 聊天完成 API

某些模型提供商提供与 OpenAI 的 [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) 兼容的端点。在这种情况下，您可以将 [⟦T20⟧](/oss/python/integrations/chat/openai) 与自定义 `base_url` 结合使用来连接到这些端点以实现基本聊天功能。<Warning>
  `ChatOpenAI` 仅针对 [official OpenAI API specifications](https://github.com/openai/openai-openapi)。来自第三方提供商的非标准响应字段（例如，`reasoning_content`、`reasoning`、`reasoning_details`）**不会提取或保留**。当您需要访问非标准功能时，请使用特定于提供商的包。

  例如，OpenRouter 有专用的 LangChain 集成。设置和使用请参阅[⟦T26⟧ guide](/oss/python/integrations/chat/openrouter)。
</Warning>

## 所有聊天模型

<div>
  |型号|流 | [Tool calling](/oss/python/langchain/tools) | [Structured output](/oss/python/langchain/structured-output/) | [Multimodal](/oss/python/langchain/messages#multimodal) |下载 |
  | :- | :- | :- | :- | :- | :- |
  | [⟦T27⟧](/oss/python/integrations/chat/azure_chat_openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T28⟧](/oss/python/integrations/chat/openai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T29⟧](/oss/python/integrations/chat/vllm) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T30⟧](/oss/python/integrations/chat/google_anthropic_vertex) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T31⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T32⟧](/oss/python/integrations/chat/anthropic) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-anthropic/"><img alt="Downloads per month" /></a></span>|
  | [⟦T33⟧](/oss/python/integrations/chat/anthropic_functions) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-anthropic/"><img alt="Downloads per month" /></a></span>|| [⟦T34⟧](/oss/python/integrations/chat/google_generative_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-google-genai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T35⟧](/oss/python/integrations/chat/bedrock) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-aws/"><img alt="Downloads per month" /></a></span>|
  | [⟦T36⟧](/oss/python/integrations/chat/ollama) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-ollama/"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](/oss/python/integrations/chat/groq) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-groq/"><img alt="Downloads per month" /></a></span> |
  | [⟦T38⟧](/oss/python/integrations/chat/litellm) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-litellm/"><img alt="Downloads per month" /></a></span> |
  | [⟦T39⟧](/oss/python/integrations/chat/huggingface) | <span>❌</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-huggingface/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T40⟧](/oss/python/integrations/chat/openrouter) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openrouter/"><img alt="Downloads per month" /></a></span> |
  | [⟦T41⟧](/oss/python/integrations/chat/mistralai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-mistralai/"><img alt="Downloads per month" /></a></span> |
  | [⟦T42⟧](/oss/python/integrations/chat/xai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-xai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T43⟧](/oss/python/integrations/chat/deepseek) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-deepseek/"> <img alt="Downloads per month" /></a></span> || [⟦T44⟧](/oss/python/integrations/chat/databricks) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/databricks-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T45⟧](/oss/python/integrations/chat/fireworks) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-fireworks/"><img alt="Downloads per month" /></a></span> |
  | [⟦T46⟧](/oss/python/integrations/chat/cohere) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-cohere/"><img alt="Downloads per month" /></a></span>|
  | [⟦T47⟧](/oss/python/integrations/chat/azure_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-azure-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T48⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-nvidia-ai-endpoints/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T49⟧](/oss/python/integrations/chat/ibm_watsonx) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-ibm/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T50⟧](/oss/python/integrations/chat/perplexity) | <span>✅</span> | <span>❌</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a></span>|
  | [⟦T51⟧](/oss/python/integrations/chat/cerebras) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-cerebras/"><img alt="Downloads per month" /></a></span>|
  | [⟦T52⟧](/oss/python/integrations/chat/baseten) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-baseten/"><img alt="Downloads per month" /></a></span>|
  | [⟦T53⟧](https://github.com/ArcadiaLin/langchain-moonshot) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-moonshot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T54⟧](/oss/python/integrations/chat/oci_generative_ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-oci/"><img alt="Downloads per month" /></a></span>|| [⟦T55⟧](/oss/python/integrations/chat/oci_data_science) | <span>✅</span> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-oci/"><img alt="Downloads per month" /></a></span>|
  | [⟦T56⟧](/oss/python/integrations/chat/qwen) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-qwq/"><img alt="Downloads per month" /></a></span> |
  | [⟦T57⟧](/oss/python/integrations/chat/qwq) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-qwq/"><img alt="Downloads per month" /></a></span> |
  | [⟦T58⟧](/oss/python/integrations/chat/together) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-together/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T59⟧](/oss/python/integrations/chat/sambanova) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-sambanova/"><img alt="Downloads per month" /></a></span>|
  | [⟦T60⟧](/oss/python/integrations/chat/upstage) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-upstage/"><img alt="Downloads per month" /></a></span>|
  | [⟦T61⟧](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-naver/"><img alt="Downloads per month" /></a></span>|
  | [⟦T62⟧](https://github.com/cloudflare/langchain-cloudflare) | <span>❌</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-cloudflare/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T63⟧](https://github.com/nebius/langchain-nebius) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-nebius/"><img alt="Downloads per month" /></a></span>|
  | [⟦T64⟧](/oss/python/integrations/chat/parallel) | <span>✅</span> | <span>❌</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](https://github.com/domondi1/inferrail/blob/main/docs/recipes/agent-run-budget.md?ref=langchain-docs#langchain) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/inferrail/"><img alt="Downloads per month" /></a></span>|| [⟦T66⟧](https://docs.digitalocean.com/products/ai-platform/) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-gradient/"><img alt="Downloads per month" /></a></span>|
  | [⟦T67⟧](/oss/python/integrations/chat/amazon_nova) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span /> | <span><a href="https://pypi.org/project/langchain-amazon-nova/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T68⟧](https://dev.writer.com/home/introduction) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-writer/"><img alt="Downloads per month" /></a></span>|
  | [⟦T69⟧](https://hubris.pw/docs/integrations/langchain) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-hubris/"><img alt="Downloads per month" /></a></span>|
  | [⟦T70⟧](https://docs.aimlapi.com/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-aimlapi/"><img alt="Downloads per month" /></a></span>|
  | [⟦T71⟧](/oss/python/integrations/chat/crusoe) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-crusoe/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T72⟧](https://docs.ai21.com/home) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-ai21/"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](https://docs.doubleword.ai/inference-api/intro-to-doubleword-inference) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-doubleword/"><img alt="Downloads per month" /></a></span>|
  | [⟦T74⟧](https://github.com/diffbot/langchain-diffbot) | <span>✅</span> | <span>❌</span> | <span>❌</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-diffbot/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T75⟧](https://github.com/staccDOTsol/langchain-openzoo) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-openzoo/"> <img alt="Downloads per month" /></a></span> || [⟦T76⟧](https://github.com/predictionguard/langchain-predictionguard) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-predictionguard/"><img alt="Downloads per month" /></a></span>|
  | [⟦T77⟧](https://docs.flex.ai/inference-api/agents/langchain) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-flexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T78⟧](https://docs.contextual.ai/) | <span>❌</span> | <span>❌</span> | <span>❌</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-contextual/"><img alt="Downloads per month" /></a></span> |
  | [⟦T79⟧](https://github.com/kineticadb/langchain-kinetica) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-kinetica/"><img alt="Downloads per month" /></a></span> |
  | [⟦T80⟧](https://app.brainiall.com/docs) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-brainiall/"><img alt="Downloads per month" /></a></span>|
  | [⟦T81⟧](https://github.com/TheSongg/langchain-xinference) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-xinference/"><img alt="Downloads per month" /></a></span>|
  | [⟦T82⟧](https://github.com/rajanshxrma/langchain-apple-foundation-models) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-apple-foundation-models/"><img alt="Downloads per month" /></a></span>|
  | [⟦T83⟧](https://docs.apertis.ai/api/sdks/langchain/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-apertis/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T84⟧](https://gitlab.com/bitkaio/langchain/kserve-provider) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-kserve/"><img alt="Downloads per month" /></a></span>|
  | [⟦T85⟧](https://docs.sarvam.ai/api/integration/langchain) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-sarvamcloud/"> <img alt="Downloads per month" /></a></span> || [⟦T86⟧](https://docs.yutori.com) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-yutori/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T87⟧](https://github.com/featherless-ai-integrations/langchain-featherless-ai) | <span>✅</span> | <span>❌</span> | <span>❌</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-featherless-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T88⟧](https://github.com/lunary-ai/langchain-abso) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-abso/"><img alt="Downloads per month" /></a></span>|
  | [⟦T89⟧](https://interfaze.ai/docs) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/interfaze-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T90⟧](https://github.com/modelscope/langchain-modelscope) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-modelscope-integration/"><img alt="Downloads per month" /></a></span>|
  | [⟦T91⟧](https://github.com/pipeshift-org/langchain-pipeshift) | <span>✅</span> | <span>❌</span> | <span>❌</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-pipeshift/"><img alt="Downloads per month" /></a></span> |
  | [⟦T92⟧](https://docs.runpod.io/overview) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-runpod/"><img alt="Downloads per month" /></a></span>|
  | [⟦T93⟧](https://alephant.io/) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-alephantai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T94⟧](https://docs.empiriolabs.ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-empiriolabs/"><img alt="Downloads per month" /></a></span>|
  | [⟦T95⟧](https://duelagents.com) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-duel/"> <img alt="Downloads per month" /></a></span> || [⟦T96⟧](https://neuralwatt.com) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-neuralwatt/"><img alt="Downloads per month" /></a></span>|
  | [⟦T97⟧](https://thalam.ai/docs) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-thalam/"><img alt="Downloads per month" /></a></span>|
  | [⟦T98⟧](https://github.com/benfaircloth/langchain-seekrflow) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-seekrflow/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T99⟧](https://developers.telnyx.com/docs/inference/models) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span><a href="https://pypi.org/project/langchain-telnyx/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T100⟧](https://kalibr.systems/docs) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/langchain-kalibr/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T101⟧](https://github.com/protagolabs/langchain-netmind) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>⟦T1384​​⟧<img alt="Downloads per month" /></a></span>|
  | [⟦T102⟧](https://github.com/greennode-ai/langchain-greennode) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span><a href="https://pypi.org/project/langchain-greennode/"><img alt="Downloads per month" /></a></span> |
  | [⟦T103⟧](https://agenticspendguard.dev) | <span /> | <span /> | <span /> | <span /> | <span><a href="https://pypi.org/project/spendguard-sdk/"><img alt="Downloads per month" /></a></span>|
  | [⟦T104⟧](https://docs.1claw.xyz) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> |
  | [⟦T105⟧](https://auxen.ai) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> || [⟦T106⟧](https://cheaperinference.com/docs) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>不适用</span> |
  | [⟦T107⟧](https://www.api-route.com/docs/overview) | <span /> | <span /> | <span /> | <span /> | <span>不适用</span> |
  | [⟦T108⟧](https://daoxe.com) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>不适用</span> |
  | [⟦T109⟧](https://futurmix.ai/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>不适用</span> |
  | [⟦T110⟧](https://gptzzz.ai/docs/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>不适用</span> |
  | [⟦T111⟧](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> |
  | [⟦T112⟧](https://synthorai.io/docs/) | <span /> | <span /> | <span /> | <span /> | <span>不适用</span> |
  | [⟦T113⟧](https://tokenmix.ai/docs) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> |
  | [⟦T114⟧](https://www.tuningengines.com/) | <span>✅</span> | <span>✅</span> | <span>✅</span> | <span>❌</span> | <span>不适用</span> |
</div>

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/chat/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>