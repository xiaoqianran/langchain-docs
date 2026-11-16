<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Chat model integrations | https://docs.langchain.com/oss/python/integrations/chat/index -->

# 聊天模型集成

使用 LangChain Python 与聊天模型集成。

[Chat models](/oss/python/langchain/models) 是使用 [messages](/oss/python/langchain/messages) 序列作为输入并返回消息作为输出的语言模型（与传统的明文 LLM 不同）（较旧的模型不遵循聊天模型接口，而是使用将字符串作为输入并返回字符串作为输出的接口。这些模型通常不包含前缀“Chat”在其名称中或包含“LLM”作为后缀。）。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

## 特色型号

> [!注意]
>
> **虽然这些 LangChain 类支持指定的高级功能**，但您可能需要参考特定于提供商的文档来了解哪些托管模型或后端支持该功能。|型号|流 | [Tool calling](/oss/python/langchain/tools) | [Structured output](/oss/python/langchain/structured-output/) | [Multimodal](/oss/python/langchain/messages#multimodal) |下载 |
| :-| :-| :-| :-| :-| :-|
| [⟦T0⟧](/oss/python/integrations/chat/azure_chat_openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T131⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T1⟧](/oss/python/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T132⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T2⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| ✅ | ✅ | ✅ | ✅ | [  ⟦T133⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T3⟧](/oss/python/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T134⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T4⟧](/oss/python/integrations/chat/google_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T135⟧](https://pypi.org/project/langchain-google-genai/) |
| [⟦T5⟧](/oss/python/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T136⟧](https://pypi.org/project/langchain-ollama/) |
| [⟦T6⟧](/oss/python/integrations/chat/groq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T137⟧](https://pypi.org/project/langchain-groq/) |
| [⟦T7⟧](/oss/python/integrations/chat/huggingface) | ❌ | ✅ | ✅ | ✅ | [  ⟦T138⟧](https://pypi.org/project/langchain-huggingface/) |
| [⟦T8⟧](/oss/python/integrations/chat/litellm) | ✅ | ✅ | ✅ | ✅ | [  ⟦T139⟧](https://pypi.org/project/langchain-litellm/) |
| [⟦T9⟧](/oss/python/integrations/chat/mistralai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T140⟧](https://pypi.org/project/langchain-mistralai/) |
| [⟦T10⟧](/oss/python/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T141⟧](https://pypi.org/project/langchain-xai/) |
| [⟦T11⟧](/oss/python/integrations/chat/openrouter) | ✅ | ✅ | ✅ | ✅ | [  ⟦T142⟧](https://pypi.org/project/langchain-openrouter/) |
| [⟦T12⟧](/oss/python/integrations/chat/deepseek) | ✅ | ✅ | ✅ | ❌ | [  ⟦T143⟧](https://pypi.org/project/langchain-deepseek/) |
| [⟦T13⟧](/oss/python/integrations/chat/cohere) | | | | | [  ⟦T144⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T14⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | ✅ | ✅ | ✅ | ✅ | [  ⟦T145⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T15⟧](/oss/python/integrations/chat/databricks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T146⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T16⟧](/oss/python/integrations/chat/together) | ✅ | ✅ | ✅ | ✅ | [  ⟦T147⟧](https://pypi.org/project/langchain-together/) |
| [⟦T17⟧](/oss/python/integrations/chat/amazon_nova) | ✅ | ✅ | ✅ | | [  ⟦T148⟧](https://pypi.org/project/langchain-amazon-nova/) |

有关更多选项，请参阅下面的[full list of chat model integrations](#all-chat-models)。

## 路由器和代理

路由器和代理使您可以通过单个 API 和凭证访问来自多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退等功能。|供应商|整合|描述 |
| - | - | - |
| [OpenRouter](https://openrouter.ai/) | [⟦T18⟧](/oss/python/integrations/chat/openrouter) |统一访问来自OpenAI、Anthropic、Google、Meta 等的模型 |
| [LiteLLM](https://www.litellm.ai/) | [⟦T19⟧](/oss/python/integrations/chat/litellm) | OpenAI、Anthropic、Azure、Hugging Face 等的统一接口，具有路由和回退功能 |

## 聊天完成 API

某些模型提供商提供与 OpenAI 的 [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) 兼容的端点。在这种情况下，您可以将 [⟦T20⟧](/oss/python/integrations/chat/openai) 与自定义 `base_url` 结合使用来连接到这些端点以实现基本聊天功能。

> [!警告]
>
> `ChatOpenAI` 仅针对 [official OpenAI API specifications](https://github.com/openai/openai-openapi)。来自第三方提供商的非标准响应字段（例如，`reasoning_content`、`reasoning`、`reasoning_details`）**不会提取或保留**。当您需要访问非标准功能时，请使用特定于提供商的包。
>
> 例如，OpenRouter 有专用的 LangChain 集成。设置和使用请参阅[⟦T26⟧ guide](/oss/python/integrations/chat/openrouter)。

## 所有聊天模型|型号|流 | [Tool calling](/oss/python/langchain/tools) | [Structured output](/oss/python/langchain/structured-output/) | [Multimodal](/oss/python/langchain/messages#multimodal) |下载 |
| :-| :-| :-| :-| :-| :-|
| [⟦T27⟧](/oss/python/integrations/chat/azure_chat_openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T149⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T28⟧](/oss/python/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T150⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T29⟧](/oss/python/integrations/chat/vllm) | | | | | [  ⟦T151⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T30⟧](/oss/python/integrations/chat/google_anthropic_vertex) | | | | | [  ⟦T152⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T31⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| ✅ | ✅ | ✅ | ✅ | [  ⟦T153⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T32⟧](/oss/python/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T154⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T33⟧](/oss/python/integrations/chat/anthropic_functions) | | | | | [  ⟦T155⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T34⟧](/oss/python/integrations/chat/google_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T156⟧](https://pypi.org/project/langchain-google-genai/) |
| [⟦T35⟧](/oss/python/integrations/chat/bedrock) | ✅ | ✅ | ✅ | ✅ | [  ⟦T157⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T36⟧](/oss/python/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T158⟧](https://pypi.org/project/langchain-ollama/) |
| [⟦T37⟧](/oss/python/integrations/chat/groq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T159⟧](https://pypi.org/project/langchain-groq/) |
| [⟦T38⟧](/oss/python/integrations/chat/huggingface) | ❌ | ✅ | ✅ | ✅ | [  ⟦T160⟧](https://pypi.org/project/langchain-huggingface/) |
| [⟦T39⟧](/oss/python/integrations/chat/litellm) | ✅ | ✅ | ✅ | ✅ | [  ⟦T161⟧](https://pypi.org/project/langchain-litellm/) |
| [⟦T40⟧](/oss/python/integrations/chat/mistralai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T162⟧](https://pypi.org/project/langchain-mistralai/) |
| [⟦T41⟧](/oss/python/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T163⟧](https://pypi.org/project/langchain-xai/) |
| [⟦T42⟧](/oss/python/integrations/chat/openrouter) | ✅ | ✅ | ✅ | ✅ | [  ⟦T164⟧](https://pypi.org/project/langchain-openrouter/) |
| [⟦T43⟧](/oss/python/integrations/chat/deepseek) | ✅ | ✅ | ✅ | ❌ | [  ⟦T165⟧](https://pypi.org/project/langchain-deepseek/) |
| [⟦T44⟧](/oss/python/integrations/chat/cohere) | | | | | [  ⟦T166⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T45⟧](/oss/python/integrations/chat/fireworks) | ✅ | ✅ | ✅ | ✅ | [  ⟦T167⟧](https://pypi.org/project/langchain-fireworks/) |
| [⟦T46⟧](/oss/python/integrations/chat/azure_ai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T168⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T47⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | ✅ | ✅ | ✅ | ✅ | [  ⟦T169⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T48⟧](/oss/python/integrations/chat/databricks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T170⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T49⟧](/oss/python/integrations/chat/ibm_watsonx) | ✅ | ✅ | ✅ | ✅ | [  ⟦T171⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T50⟧](/oss/python/integrations/chat/perplexity) | ✅ | ❌ | ✅ | ❌ | [  ⟦T172⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T51⟧](/oss/python/integrations/chat/cerebras) | ✅ | ✅ | ✅ | ❌ | [  ⟦T173⟧](https://pypi.org/project/langchain-cerebras/) |
| [⟦T52⟧](/oss/python/integrations/chat/baseten) | | | | | [  ⟦T174⟧](https://pypi.org/project/langchain-baseten/) |
| [⟦T53⟧](/oss/python/integrations/chat/together) | ✅ | ✅ | ✅ | ✅ | [  ⟦T175⟧](https://pypi.org/project/langchain-together/) |
| [⟦T54⟧](/oss/python/integrations/chat/oci_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T176⟧](https://pypi.org/project/langchain-oci/) |
| [⟦T55⟧](/oss/python/integrations/chat/oci_data_science) | ✅ | | | | [  ⟦T177⟧](https://pypi.org/project/langchain-oci/) |
| [⟦T56⟧](/oss/python/integrations/chat/parallel) | ✅ | ❌ | ✅ | ❌ | [  ⟦T178⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T57⟧](/oss/python/integrations/chat/qwen) | ✅ | ✅ | ✅ | ✅ | [  ⟦T179⟧](https://pypi.org/project/langchain-qwq/) || [⟦T58⟧](/oss/python/integrations/chat/qwq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T180⟧](https://pypi.org/project/langchain-qwq/) |
| [⟦T59⟧](/oss/python/integrations/chat/upstage) | | | | | [  ⟦T181⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T60⟧](/oss/python/integrations/chat/sambanova) | ✅ | ✅ | ✅ | ✅ | [  ⟦T182⟧](https://pypi.org/project/langchain-sambanova/) |
| [⟦T61⟧](https://github.com/ArcadiaLin/langchain-moonshot) | ✅ | ✅ | ✅ | ✅ | [  ⟦T183⟧](https://pypi.org/project/langchain-moonshot/) |
| [⟦T62⟧](https://github.com/cloudflare/langchain-cloudflare) | ❌ | ✅ | ✅ | ❌ | [  ⟦T184⟧](https://pypi.org/project/langchain-cloudflare/) |
| [⟦T63⟧](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T185⟧](https://pypi.org/project/langchain-naver/) |
| [⟦T64⟧](https://github.com/domondi1/inferrail/blob/main/docs/recipes/agent-run-budget.md?ref=langchain-docs#langchain) | ✅ | ✅ | ✅ | ❌ | [  ⟦T186⟧](https://pypi.org/project/inferrail/) |
| [⟦T65⟧](https://github.com/nebius/langchain-nebius) | ✅ | ✅ | ✅ | ✅ | [  ⟦T187⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T66⟧](https://docs.digitalocean.com/products/ai-platform/) | | | | | [  ⟦T188⟧](https://pypi.org/project/langchain-gradient/) |
| [⟦T67⟧](https://docs.donkey-kit.dev/frameworks/langgraph) | ✅ | ✅ | | | [  ⟦T189⟧](https://pypi.org/project/donkey-kit/) |
| [⟦T68⟧](/oss/python/integrations/chat/amazon_nova) | ✅ | ✅ | ✅ | | [  ⟦T190⟧](https://pypi.org/project/langchain-amazon-nova/) |
| [⟦T69⟧](https://docs.empiriolabs.ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T191⟧](https://pypi.org/project/langchain-empiriolabs/) |
| [⟦T70⟧](https://dev.writer.com/home/introduction) | ✅ | ✅ | ✅ | ❌ | [  ⟦T192⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T71⟧](https://docs.ai21.com/home) | ✅ | ✅ | ✅ | ❌ | [  ⟦T193⟧](https://pypi.org/project/langchain-ai21/) |
| [⟦T72⟧](https://github.com/AceDataCloud/LangChain) | ✅ | ✅ | | | [  ⟦T194⟧](https://pypi.org/project/langchain-acedatacloud/) |
| [⟦T73⟧](/oss/python/integrations/chat/crusoe) | ✅ | ✅ | ✅ | ❌ | [  ⟦T195⟧](https://pypi.org/project/langchain-crusoe/) |
| [⟦T74⟧](https://docs.flex.ai/inference-api/agents/langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T196⟧](https://pypi.org/project/langchain-flexai/) |
| [⟦T75⟧](https://github.com/danielpolok/langchain-model-router) | ✅ | ✅ | ✅ | | [  ⟦T197⟧](https://pypi.org/project/langchain-model-router/) |
| [⟦T76⟧](https://github.com/predictionguard/langchain-predictionguard) | | | | | [  ⟦T198⟧](https://pypi.org/project/langchain-predictionguard/) |
| [⟦T77⟧](https://github.com/diffbot/langchain-diffbot) | ✅ | ❌ | ❌ | ❌ | [  ⟦T199⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T78⟧](https://api.topxai.xyz/docs/use-topxai-with-langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T200⟧](https://pypi.org/project/langchain-topxai/) |
| [⟦T79⟧](https://docs.aimlapi.com/) | ✅ | ✅ | ✅ | ✅ | [  ⟦T201⟧](https://pypi.org/project/langchain-aimlapi/) |
| [⟦T80⟧](https://recallmem.dev/guides/langchain) | | | | | [  ⟦T202⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T81⟧](https://github.com/Obscurify-ai/langchain-obscurify) | ✅ | ✅ | ✅ | | [  ⟦T203⟧](https://pypi.org/project/langchain-obscurify/)​​ |
| [⟦T82⟧](https://docs.contextual.ai/) | ❌ | ❌ | ❌ | ❌ | [  ⟦T204⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T83⟧](https://heabsy.com/integrations/langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T205⟧](https://pypi.org/project/langchain-heabsy/) |
| [⟦T84⟧](https://docs.doubleword.ai/inference-api/intro-to-doubleword-inference) | ✅ | ✅ | ✅ | ❌ | [  ⟦T206⟧](https://pypi.org/project/langchain-doubleword/) |
| [⟦T85⟧](https://github.com/StudioPlatforms/aistupidlevel-sdk/blob/main/langchain-python/README.md) | ✅ | ✅ | ✅ | ❌ | [  ⟦T207⟧](https://pypi.org/project/langchain-aistupidlevel/) |
| [⟦T86⟧](https://github.com/lunary-ai/langchain-abso) | | | | | [  ⟦T208⟧](https://pypi.org/project/langchain-abso/) |
| [⟦T87⟧](https://github.com/modelscope/langchain-modelscope) | | | | | [  ⟦T209⟧](https://pypi.org/project/langchain-modelscope-integration/) |
| [⟦T88⟧](https://app.brainiall.com/docs) | | | | | [  ⟦T210⟧](https://pypi.org/project/langchain-brainiall/) |
| [⟦T89⟧](https://gitlab.com/bitkaio/langchain/kserve-provider) | ✅ | ✅ | ✅ | ✅ | [  ⟦T211⟧](https://pypi.org/project/langchain-kserve/) |
| [⟦T90⟧](https://hubris.pw/docs/integrations/langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T212⟧](https://pypi.org/project/langchain-hubris/) |
| [⟦T91⟧](https://docs.sarvam.ai/api/integration/langchain) | ✅ | ✅ | ✅ | ❌ | [  ⟦T213⟧](https://pypi.org/project/langchain-sarvamcloud/) |
| [⟦T92⟧](https://github.com/featherless-ai-integrations/langchain-featherless-ai) | ✅ | ❌ | ❌ | ❌ | [  ⟦T214⟧](https://pypi.org/project/langchain-featherless-ai/) || [⟦T93⟧](https://github.com/kineticadb/langchain-kinetica) | | | | | [  ⟦T215⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T94⟧](https://docs.yutori.com) | | | | | [  ⟦T216⟧](https://pypi.org/project/langchain-yutori/) |
| [⟦T95⟧](https://github.com/TheSongg/langchain-xinference) | ✅ | ✅ | ✅ | ❌ | [  ⟦T217⟧](https://pypi.org/project/langchain-xinference/) |
| [⟦T96⟧](https://docs.runpod.io/overview) | | | | | [  ⟦T218⟧](https://pypi.org/project/langchain-runpod/) |
| [⟦T97⟧](https://agenticspendguard.dev) | | | | | [  ⟦T219⟧](https://pypi.org/project/spendguard-sdk/) |
| [⟦T98⟧](https://github.com/staccDOTsol/langchain-openzoo) | ✅ | ✅ | ✅ | ✅ | [  ⟦T220⟧](https://pypi.org/project/langchain-openzoo/) |
| [⟦T99⟧](https://docs.apertis.ai/api/sdks/langchain/) | ✅ | ✅ | ✅ | ✅ | [  ⟦T221⟧](https://pypi.org/project/langchain-apertis/) |
| [⟦T100⟧](https://github.com/rajanshxrma/langchain-apple-foundation-models) | ✅ | ✅ | ✅ | ❌ | [  ⟦T222⟧](https://pypi.org/project/langchain-apple-foundation-models/) |
| [⟦T101⟧](https://github.com/pipeshift-org/langchain-pipeshift) | ✅ | ❌ | ❌ | ✅ | [  ⟦T223⟧](https://pypi.org/project/langchain-pipeshift/) |
| [⟦T102⟧](https://interfaze.ai/docs) | ✅ | ✅ | ✅ | ✅ | [  ⟦T224⟧](https://pypi.org/project/interfaze-langchain/) |
| [⟦T103⟧](https://developers.telnyx.com/docs/inference/models) | ✅ | ✅ | ✅ | ❌ | [  ⟦T225⟧](https://pypi.org/project/langchain-telnyx/) |
| [⟦T104⟧](https://github.com/greennode-ai/langchain-greennode) | ✅ | ✅ | ✅ | ✅ | [  ⟦T226⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T105⟧](https://github.com/Sandeep85Das/langchain-meragpt) | ✅ | ❌ | ❌ | ❌ | [  ⟦T227⟧](https://pypi.org/project/langchain-meragpt/) |
| [⟦T106⟧](https://thalam.ai/docs) | ✅ | ✅ | ✅ | ✅ | [  ⟦T228⟧](https://pypi.org/project/langchain-thalam/) |
| [⟦T107⟧](https://github.com/protagolabs/langchain-netmind) | ✅ | ✅ | ✅ | ❌ | [  ⟦T229⟧](https://pypi.org/project/langchain-netmind/) |
| [⟦T108⟧](https://neuralwatt.com) | ✅ | ✅ | ✅ | ❌ | [  ⟦T230⟧](https://pypi.org/project/langchain-neuralwatt/) |
| [⟦T109⟧](https://github.com/benfaircloth/langchain-seekrflow) | ✅ | ✅ | ✅ | ❌ | [  ⟦T231⟧](https://pypi.org/project/langchain-seekrflow/) |
| [⟦T110⟧](https://kalibr.systems/docs) | | | | | [  ⟦T232⟧](https://pypi.org/project/langchain-kalibr/) |
| [⟦T111⟧](https://www.runcrate.ai/docs/sdks/langchain?utm_source=langchain\&utm_medium=directory\&utm_campaign=integrations) | ✅ | ✅ | ✅ | | [  ⟦T233⟧](https://pypi.org/project/langchain-runcrate/) |
| [⟦T112⟧](https://github.com/Aribk7/langchain-revana#readme) | ✅ | ✅ | ✅ | | [  ⟦T234⟧](https://pypi.org/project/langchain-revana/) |
| [⟦T113⟧](https://github.com/dhruvil-codes/langchain-gmi#readme) | ✅ | ✅ | ✅ | | [  ⟦T235⟧](https://pypi.org/project/langchain-gmi/) |
| [⟦T114⟧](https://github.com/OutrunAIAPI/langchain-outrun#readme) | ✅ | ✅ | ✅ | | [  ⟦T236⟧](https://pypi.org/project/langchain-outrun/) |
| [⟦T115⟧](https://github.com/weare-linkrra/linkrra-synap/tree/main/langchain-linkrra#readme) | ✅ | ✅ | ✅ | | [  ⟦T237⟧](https://pypi.org/project/langchain-linkrra/) |
| [⟦T116⟧](https://docs.1claw.xyz) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T117⟧](https://www.api-route.com/docs/overview) | | | | |不适用 |
| [⟦T118⟧](https://auxen.ai) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T119⟧](https://github.com/ykoh42/exaone-integrations/tree/main/packages/langchain-exaone-py) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T120⟧](https://github.com/kris-holy/langchain-keln#readme) | ✅ | ✅ | ✅ | |不适用 |
| [⟦T121⟧](https://github.com/kosa8ai/langchain-llamay#readme) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T122⟧](https://github.com/optiq-bot/langchain-optiq) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T123⟧](https://cheaperinference.com/docs) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T124⟧](https://daoxe.com) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T125⟧](https://gptzzz.ai/docs/) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T126⟧](https://hop-base.com/en/docs) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T127⟧](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T128⟧](https://synthorai.io/docs/) | | | | |不适用 || [⟦T129⟧](https://tokenmix.ai/docs) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T130⟧](https://www.tuningengines.com/) | ✅ | ✅ | ✅ | ❌ |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/chat/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。