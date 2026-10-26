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
| [⟦T0⟧](/oss/python/integrations/chat/azure_chat_openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T120⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T1⟧](/oss/python/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T121⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T2⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| ✅ | ✅ | ✅ | ✅ | [  ⟦T122⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T3⟧](/oss/python/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T123⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T4⟧](/oss/python/integrations/chat/google_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T124⟧](https://pypi.org/project/langchain-google-genai/) |
| [⟦T5⟧](/oss/python/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T125⟧](https://pypi.org/project/langchain-ollama/) |
| [⟦T6⟧](/oss/python/integrations/chat/groq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T126⟧](https://pypi.org/project/langchain-groq/) |
| [⟦T7⟧](/oss/python/integrations/chat/litellm) | ✅ | ✅ | ✅ | ✅ | [  ⟦T127⟧](https://pypi.org/project/langchain-litellm/) |
| [⟦T8⟧](/oss/python/integrations/chat/huggingface) | ❌ | ✅ | ✅ | ✅ | [  ⟦T128⟧](https://pypi.org/project/langchain-huggingface/) |
| [⟦T9⟧](/oss/python/integrations/chat/mistralai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T129⟧](https://pypi.org/project/langchain-mistralai/) |
| [⟦T10⟧](/oss/python/integrations/chat/openrouter) | ✅ | ✅ | ✅ | ✅ | [  ⟦T130⟧](https://pypi.org/project/langchain-openrouter/) |
| [⟦T11⟧](/oss/python/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T131⟧](https://pypi.org/project/langchain-xai/) |
| [⟦T12⟧](/oss/python/integrations/chat/deepseek) | ✅ | ✅ | ✅ | ❌ | [  ⟦T132⟧](https://pypi.org/project/langchain-deepseek/) |
| [⟦T13⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | ✅ | ✅ | ✅ | ✅ | [  ⟦T133⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T14⟧](/oss/python/integrations/chat/databricks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T134⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T15⟧](/oss/python/integrations/chat/cohere) | | | | | [  ⟦T135⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T16⟧](/oss/python/integrations/chat/together) | ✅ | ✅ | ✅ | ✅ | [  ⟦T136⟧](https://pypi.org/project/langchain-together/) |
| [⟦T17⟧](/oss/python/integrations/chat/amazon_nova) | ✅ | ✅ | ✅ | | [  ⟦T137⟧](https://pypi.org/project/langchain-amazon-nova/) |

有关更多选项，请参阅下面的[full list of chat model integrations](#all-chat-models)。

## 路由器和代理

路由器和代理使您可以通过单个 API 和凭证访问来自多个提供商的模型。它们可以简化计费，让您在不改变集成的情况下在模型之间切换，并提供自动回退等功能。|供应商|整合 |描述 |
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
| [⟦T27⟧](/oss/python/integrations/chat/azure_chat_openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T138⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T28⟧](/oss/python/integrations/chat/openai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T139⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T29⟧](/oss/python/integrations/chat/vllm) | | | | | [  ⟦T140⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T30⟧](/oss/python/integrations/chat/google_anthropic_vertex) | | | | | [  ⟦T141⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T31⟧](/oss/python/integrations/chat/google_vertex_ai)（已弃用）| ✅ | ✅ | ✅ | ✅ | [  ⟦T142⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T32⟧](/oss/python/integrations/chat/anthropic) | ✅ | ✅ | ✅ | ✅ | [  ⟦T143⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T33⟧](/oss/python/integrations/chat/anthropic_functions) | | | | | [  ⟦T144⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T34⟧](/oss/python/integrations/chat/google_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T145⟧](https://pypi.org/project/langchain-google-genai/) |
| [⟦T35⟧](/oss/python/integrations/chat/bedrock) | ✅ | ✅ | ✅ | ✅ | [  ⟦T146⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T36⟧](/oss/python/integrations/chat/ollama) | ✅ | ✅ | ✅ | ✅ | [  ⟦T147⟧](https://pypi.org/project/langchain-ollama/) |
| [⟦T37⟧](/oss/python/integrations/chat/groq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T148⟧](https://pypi.org/project/langchain-groq/) |
| [⟦T38⟧](/oss/python/integrations/chat/litellm) | ✅ | ✅ | ✅ | ✅ | [  ⟦T149⟧](https://pypi.org/project/langchain-litellm/) |
| [⟦T39⟧](/oss/python/integrations/chat/huggingface) | ❌ | ✅ | ✅ | ✅ | [  ⟦T150⟧](https://pypi.org/project/langchain-huggingface/) |
| [⟦T40⟧](/oss/python/integrations/chat/mistralai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T151⟧](https://pypi.org/project/langchain-mistralai/) |
| [⟦T41⟧](/oss/python/integrations/chat/openrouter) | ✅ | ✅ | ✅ | ✅ | [  ⟦T152⟧](https://pypi.org/project/langchain-openrouter/) |
| [⟦T42⟧](/oss/python/integrations/chat/xai) | ✅ | ✅ | ✅ | ❌ | [  ⟦T153⟧](https://pypi.org/project/langchain-xai/) |
| [⟦T43⟧](/oss/python/integrations/chat/deepseek) | ✅ | ✅ | ✅ | ❌ | [  ⟦T154⟧](https://pypi.org/project/langchain-deepseek/) |
| [⟦T44⟧](/oss/python/integrations/chat/fireworks) | ✅ | ✅ | ✅ | ✅ | [  ⟦T155⟧](https://pypi.org/project/langchain-fireworks/) |
| [⟦T45⟧](/oss/python/integrations/chat/azure_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T156⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T46⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | ✅ | ✅ | ✅ | ✅ | [  ⟦T157⟧](https://pypi.org/project/langchain-nvidia-ai-endpoints/) |
| [⟦T47⟧](/oss/python/integrations/chat/databricks) | ✅ | ✅ | ✅ | ❌ | [  ⟦T158⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T48⟧](/oss/python/integrations/chat/cohere) | | | | | [  ⟦T159⟧](https://pypi.org/project/langchain-cohere/) |
| [⟦T49⟧](/oss/python/integrations/chat/ibm_watsonx) | ✅ | ✅ | ✅ | ✅ | [  ⟦T160⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T50⟧](/oss/python/integrations/chat/perplexity) | ✅ | ❌ | ✅ | ❌ | [  ⟦T161⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T51⟧](/oss/python/integrations/chat/cerebras) | ✅ | ✅ | ✅ | ❌ | [  ⟦T162⟧](https://pypi.org/project/langchain-cerebras/) |
| [⟦T52⟧](/oss/python/integrations/chat/baseten) | | | | | [  ⟦T163⟧](https://pypi.org/project/langchain-baseten/) |
| [⟦T53⟧](/oss/python/integrations/chat/together) | ✅ | ✅ | ✅ | ✅ | [  ⟦T164⟧](https://pypi.org/project/langchain-together/) |
| [⟦T54⟧](/oss/python/integrations/chat/oci_generative_ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T165⟧](https://pypi.org/project/langchain-oci/) |
| [⟦T55⟧](/oss/python/integrations/chat/oci_data_science) | ✅ | | | | [  ⟦T166⟧](https://pypi.org/project/langchain-oci/) |
| [⟦T56⟧](/oss/python/integrations/chat/parallel) | ✅ | ❌ | ✅ | ❌ | [  ⟦T167⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T57⟧](/oss/python/integrations/chat/qwen) | ✅ | ✅ | ✅ | ✅ | [  ⟦T168⟧](https://pypi.org/project/langchain-qwq/) || [⟦T58⟧](/oss/python/integrations/chat/qwq) | ✅ | ✅ | ✅ | ✅ | [  ⟦T169⟧](https://pypi.org/project/langchain-qwq/) |
| [⟦T59⟧](https://github.com/ArcadiaLin/langchain-moonshot) | ✅ | ✅ | ✅ | ✅ | [  ⟦T170⟧](https://pypi.org/project/langchain-moonshot/) |
| [⟦T60⟧](/oss/python/integrations/chat/upstage) | | | | | [  ⟦T171⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T61⟧](/oss/python/integrations/chat/sambanova) | ✅ | ✅ | ✅ | ✅ | [  ⟦T172⟧](https://pypi.org/project/langchain-sambanova/) |
| [⟦T62⟧](https://github.com/cloudflare/langchain-cloudflare) | ❌ | ✅ | ✅ | ❌ | [  ⟦T173⟧](https://pypi.org/project/langchain-cloudflare/) |
| [⟦T63⟧](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T174⟧](https://pypi.org/project/langchain-naver/) |
| [⟦T64⟧](https://github.com/domondi1/inferrail/blob/main/docs/recipes/agent-run-budget.md?ref=langchain-docs#langchain) | ✅ | ✅ | ✅ | ❌ | [  ⟦T175⟧](https://pypi.org/project/inferrail/) |
| [⟦T65⟧](https://github.com/nebius/langchain-nebius) | ✅ | ✅ | ✅ | ✅ | [  ⟦T176⟧](https://pypi.org/project/langchain-nebius/) |
| [⟦T66⟧](https://docs.digitalocean.com/products/ai-platform/) | | | | | [  ⟦T177⟧](https://pypi.org/project/langchain-gradient/) |
| [⟦T67⟧](/oss/python/integrations/chat/amazon_nova) | ✅ | ✅ | ✅ | | [  ⟦T178⟧](https://pypi.org/project/langchain-amazon-nova/) |
| [⟦T68⟧](https://docs.empiriolabs.ai) | ✅ | ✅ | ✅ | ✅ | [  ⟦T179⟧](https://pypi.org/project/langchain-empiriolabs/) |
| [⟦T69⟧](https://dev.writer.com/home/introduction) | ✅ | ✅ | ✅ | ❌ | [  ⟦T180⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T70⟧](https://docs.ai21.com/home) | ✅ | ✅ | ✅ | ❌ | [  ⟦T181⟧](https://pypi.org/project/langchain-ai21/) |
| [⟦T71⟧](https://github.com/predictionguard/langchain-predictionguard) | | | | | [  ⟦T182⟧](https://pypi.org/project/langchain-predictionguard/) |
| [⟦T72⟧](https://github.com/diffbot/langchain-diffbot) | ✅ | ❌ | ❌ | ❌ | [  ⟦T183⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T73⟧](https://github.com/AceDataCloud/LangChain) | ✅ | ✅ | | | [  ⟦T184⟧](https://pypi.org/project/langchain-acedatacloud/) |
| [⟦T74⟧](/oss/python/integrations/chat/crusoe) | ✅ | ✅ | ✅ | ❌ | [  ⟦T185⟧](https://pypi.org/project/langchain-crusoe/) |
| [⟦T75⟧](https://docs.flex.ai/inference-api/agents/langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T186⟧](https://pypi.org/project/langchain-flexai/) |
| [⟦T76⟧](https://github.com/danielpolok/langchain-model-router) | ✅ | ✅ | ✅ | | [  ⟦T187⟧](https://pypi.org/project/langchain-model-router/) |
| [⟦T77⟧](https://docs.aimlapi.com/) | ✅ | ✅ | ✅ | ✅ | [  ⟦T188⟧](https://pypi.org/project/langchain-aimlapi/) |
| [⟦T78⟧](https://ai.topxea.com/docs/use-topxai-with-langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T189⟧](https://pypi.org/project/langchain-topxai/) |
| [⟦T79⟧](https://docs.contextual.ai/) | ❌ | ❌ | ❌ | ❌ | [  ⟦T190⟧](https://pypi.org/project/langchain-contextual/) |
| [⟦T80⟧](https://recallmem.dev/guides/langchain) | | | | | [  ⟦T191⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T81⟧](https://docs.doubleword.ai/inference-api/intro-to-doubleword-inference) | ✅ | ✅ | ✅ | ❌ | [  ⟦T192⟧](https://pypi.org/project/langchain-doubleword/) |
| [⟦T82⟧](https://github.com/lunary-ai/langchain-abso) | | | | | [  ⟦T193⟧](https://pypi.org/project/langchain-abso/) |
| [⟦T83⟧](https://github.com/StudioPlatforms/aistupidlevel-sdk/blob/main/langchain-python/README.md) | ✅ | ✅ | ✅ | ❌ | [  ⟦T194⟧](https://pypi.org/project/langchain-aistupidlevel/) |
| [⟦T84⟧](https://hubris.pw/docs/integrations/langchain) | ✅ | ✅ | ✅ | ✅ | [  ⟦T195⟧](https://pypi.org/project/langchain-hubris/) |
| [⟦T85⟧](https://app.brainiall.com/docs) | | | | | [  ⟦T196⟧](https://pypi.org/project/langchain-brainiall/) |
| [⟦T86⟧](https://github.com/kineticadb/langchain-kinetica) | | | | | [  ⟦T197⟧](https://pypi.org/project/langchain-kinetica/) |
| [⟦T87⟧](https://gitlab.com/bitkaio/langchain/kserve-provider) | ✅ | ✅ | ✅ | ✅ | [  ⟦T198⟧](https://pypi.org/project/langchain-kserve/) |
| [⟦T88⟧](https://docs.yutori.com) | | | | | [  ⟦T199⟧](https://pypi.org/project/langchain-yutori/) |
| [⟦T89⟧](https://github.com/featherless-ai-integrations/langchain-featherless-ai) | ✅ | ❌ | ❌ | ❌ | [  ⟦T200⟧](https://pypi.org/project/langchain-featherless-ai/) |
| [⟦T90⟧](https://docs.sarvam.ai/api/integration/langchain) | ✅ | ✅ | ✅ | ❌ | [  ⟦T201⟧](https://pypi.org/project/langchain-sarvamcloud/)​​ |
| [⟦T91⟧](https://github.com/TheSongg/langchain-xinference) | ✅ | ✅ | ✅ | ❌ | [  ⟦T202⟧](https://pypi.org/project/langchain-xinference/) |
| [⟦T92⟧](https://agenticspendguard.dev) | | | | | [  ⟦T203⟧](https://pypi.org/project/spendguard-sdk/) || [⟦T93⟧](https://docs.apertis.ai/api/sdks/langchain/) | ✅ | ✅ | ✅ | ✅ | [  ⟦T204⟧](https://pypi.org/project/langchain-apertis/) |
| [⟦T94⟧](https://github.com/rajanshxrma/langchain-apple-foundation-models) | ✅ | ✅ | ✅ | ❌ | [  ⟦T205⟧](https://pypi.org/project/langchain-apple-foundation-models/) |
| [⟦T95⟧](https://github.com/pipeshift-org/langchain-pipeshift) | ✅ | ❌ | ❌ | ✅ | [  ⟦T206⟧](https://pypi.org/project/langchain-pipeshift/) |
| [⟦T96⟧](https://docs.runpod.io/overview) | | | | | [  ⟦T207⟧](https://pypi.org/project/langchain-runpod/) |
| [⟦T97⟧](https://github.com/modelscope/langchain-modelscope) | | | | | [  ⟦T208⟧](https://pypi.org/project/langchain-modelscope-integration/) |
| [⟦T98⟧](https://alephant.io/) | | | | | [  ⟦T209⟧](https://pypi.org/project/langchain-alephantai/) |
| [⟦T99⟧](https://github.com/staccDOTsol/langchain-openzoo) | ✅ | ✅ | ✅ | ✅ | [  ⟦T210⟧](https://pypi.org/project/langchain-openzoo/) |
| [⟦T100⟧](https://developers.telnyx.com/docs/inference/models) | ✅ | ✅ | ✅ | ❌ | [  ⟦T211⟧](https://pypi.org/project/langchain-telnyx/) |
| [⟦T101⟧](https://interfaze.ai/docs) | ✅ | ✅ | ✅ | ✅ | [  ⟦T212⟧](https://pypi.org/project/interfaze-langchain/) |
| [⟦T102⟧](https://neuralwatt.com) | ✅ | ✅ | ✅ | ❌ | [  ⟦T213⟧](https://pypi.org/project/langchain-neuralwatt/) |
| [⟦T103⟧](https://github.com/greennode-ai/langchain-greennode) | ✅ | ✅ | ✅ | ✅ | [  ⟦T214⟧](https://pypi.org/project/langchain-greennode/) |
| [⟦T104⟧](https://thalam.ai/docs) | ✅ | ✅ | ✅ | ✅ | [  ⟦T215⟧](https://pypi.org/project/langchain-thalam/) |
| [⟦T105⟧](https://github.com/protagolabs/langchain-netmind) | ✅ | ✅ | ✅ | ❌ | [  ⟦T216⟧](https://pypi.org/project/langchain-netmind/) |
| [⟦T106⟧](https://kalibr.systems/docs) | | | | | [  ⟦T217⟧](https://pypi.org/project/langchain-kalibr/) |
| [⟦T107⟧](https://github.com/benfaircloth/langchain-seekrflow) | ✅ | ✅ | ✅ | ❌ | [  ⟦T218⟧](https://pypi.org/project/langchain-seekrflow/) |
| [⟦T108⟧](https://duelagents.com) | ✅ | ✅ | ✅ | ❌ | [  ⟦T219⟧](https://pypi.org/project/langchain-duel/) |
| [⟦T109⟧](https://docs.1claw.xyz) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T110⟧](https://www.api-route.com/docs/overview) | | | | |不适用 |
| [⟦T111⟧](https://auxen.ai) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T112⟧](https://cheaperinference.com/docs) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T113⟧](https://daoxe.com) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T114⟧](https://futurmix.ai/) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T115⟧](https://gptzzz.ai/docs/) | ✅ | ✅ | ✅ | ✅ |不适用 |
| [⟦T116⟧](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T117⟧](https://synthorai.io/docs/) | | | | |不适用 |
| [⟦T118⟧](https://tokenmix.ai/docs) | ✅ | ✅ | ✅ | ❌ |不适用 |
| [⟦T119⟧](https://www.tuningengines.com/) | ✅ | ✅ | ✅ | ❌ |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/chat/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。