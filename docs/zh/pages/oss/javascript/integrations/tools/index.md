<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool integrations | https://docs.langchain.com/oss/javascript/integrations/tools/index -->

# 工具集成

使用 LangChain JavaScript 与工具集成。

[Tools](/oss/javascript/langchain/tools) 是设计为由模型调用的实用程序：它们的输入被设计为由模型生成，其输出被设计为传递回模型。

[toolkit](/oss/javascript/langchain/tools#prebuilt-tools) 是一组旨在一起使用的工具。

## 网络搜索

下表显示了以某种形式执行在线搜索的工具：

|工具/工具包 |免费/付费|返回数据 |
| - | - | - |
| [Diffbot](https://github.com/diffbot/langchain-diffbot) |免费| URL、片段、标题、日期、知识图（组织、新闻、人物、地点、交易）|
| [Exa Search](/oss/javascript/integrations/tools/exa_search) |每月 1000 次免费搜索 |网址、作者、标题、发布日期 |
| [Nia Toolkit](/oss/javascript/integrations/tools/nia) |免费套餐可用 |代码、文档、元数据、来源 |
| [Perplexity Search](/oss/javascript/integrations/tools/perplexity_search) |付费（每月免费套餐）| URL、标题、摘要、日期、上次更新 |
| [TalorData SERP](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) |付费|标题、URL、摘要、位置、知识图谱、答案框、AI 概述 |
| [Tavily Search](/oss/javascript/integrations/tools/tavily_search) |每月 1000 次免费搜索 | URL、内容、标题、图像、答案 |

## 集成平台

以下平台通过统一的界面提供对多种工具和服务的访问：|工具/工具包 |集成数量 |定价|主要特点|
| - | - | - | - |
| [⟦T0⟧](/oss/javascript/integrations/tools/composio) | 500+ |免费套餐可用 | OAuth 处理、事件驱动的工作流程、多用户支持 |

## 媒体生成

下表显示了生成视频、图像或音频资源的工具：

|工具/工具包 |定价|能力|
| - | - | - |
| [Magic Hour](https://docs.magichour.ai) |免费套餐（400 积分 + 100/天）|使用 Sora 2、Veo 3.1、Kling 3.0、WAN 2.2、GPT-image、Nano Banana Pro 进行文本到视频、图像到视频和图像生成。同步和异步，返回 URL 或本地下载。 |

## 所有工具和工具包|整合 |下载 |
| :- | :- |
| [⟦T1⟧](/oss/javascript/integrations/tools/dalle) | [  ⟦T70⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T2⟧](/oss/javascript/integrations/tools/openai) | [  ⟦T71⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T3⟧](/oss/javascript/integrations/tools/openapi) | [  ⟦T72⟧](https://www.npmjs.com/package/@langchain/langgraph) |
| [⟦T4⟧](/oss/javascript/integrations/tools/anthropic) | [  ⟦T73⟧](https://www.npmjs.com/package/@langchain/anthropic) |
| [⟦T5⟧](/oss/javascript/integrations/tools/google) | [  ⟦T74⟧](https://www.npmjs.com/package/@langchain/google) |
| [⟦T6⟧](/oss/javascript/integrations/tools/tavily_crawl) | [  ⟦T75⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T7⟧](/oss/javascript/integrations/tools/tavily_extract) | [  ⟦T76⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T8⟧](/oss/javascript/integrations/tools/tavily_get_research) | [  ⟦T77⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T9⟧](/oss/javascript/integrations/tools/tavily_map) | [  ⟦T78⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T10⟧](/oss/javascript/integrations/tools/tavily_research) | [  ⟦T79⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T11⟧](/oss/javascript/integrations/tools/tavily_search) | [  ⟦T80⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T12⟧](/oss/javascript/integrations/tools/oracleai) | [  ⟦T81⟧](https://www.npmjs.com/package/@oracle/langchain-oracledb) |
| [⟦T13⟧](/oss/javascript/integrations/tools/exa_search) | [  ⟦T82⟧](https://www.npmjs.com/package/@langchain/exa) |
| [⟦T14⟧](/oss/javascript/integrations/tools/composio) | [  ⟦T83⟧](https://www.npmjs.com/package/@composio/langchain) |
| [⟦T15⟧](/oss/javascript/integrations/tools/mcp_toolbox) | [  ⟦T84⟧](https://www.npmjs.com/package/@toolbox-sdk/core) |
| [⟦T16⟧](/oss/javascript/integrations/tools/ibm) | [  ⟦T85⟧](https://www.npmjs.com/package/@langchain/ibm) |
| [⟦T17⟧](https://fizzl.eu/agents/langchain-js/) | [  ⟦T86⟧](https://www.npmjs.com/package/fizzl-langchain) |
| [⟦T18⟧](https://proompteng.github.io/bilig/) | [  ⟦T87⟧](https://www.npmjs.com/package/@bilig/workpaper) |
| [⟦T19⟧](https://github.com/Walkover-Web-Solution/viasocket-apps#langchain) | [  ⟦T88⟧](https://www.npmjs.com/package/viasocket-apps) |
| [⟦T20⟧](/oss/javascript/integrations/tools/perplexity_search) | [  ⟦T89⟧](https://www.npmjs.com/package/@langchain/perplexity) |
| [⟦T21⟧](https://serpex.dev/docs) | [  ⟦T90⟧](https://www.npmjs.com/package/langchain-serpex-js) |
| [⟦T22⟧](/oss/javascript/integrations/tools/decodo) | [  ⟦T91⟧](https://www.npmjs.com/package/@decodo/langchain-ts) |
| [⟦T23⟧](https://agentsvc.io/docs/langchain) | [  ⟦T92⟧](https://www.npmjs.com/package/agentsvc) |
| [⟦T24⟧](https://precleared.dev/docs/langchain) | [  ⟦T93⟧](https://www.npmjs.com/package/precleared) |
| [⟦T25⟧](https://docs.pexafy.com/langchain) | [  ⟦T94⟧](https://www.npmjs.com/package/langchain-pexafy) |
| [⟦T26⟧](https://agentsearchhq.com/#integrations?utm_source=langchain-docs-js\&utm_medium=integration-listing\&utm_campaign=promo-oct26) | [  ⟦T95⟧](https://www.npmjs.com/package/@agentsearchhq/langchain) |
| [⟦T27⟧](https://safeprompt.dev/docs/langchain) | [  ⟦T96⟧](https://www.npmjs.com/package/@safeprompt.dev/langchain) |
| [⟦T28⟧](https://databazaar.io/integrations?utm_source=langchain\&utm_campaign=integration-listing#langchain) | [  ⟦T97⟧](https://www.npmjs.com/package/databazaar-agent-tools) |
| [⟦T29⟧](https://github.com/MSG91/m91-sdk#langchain) | [  ⟦T98⟧](https://www.npmjs.com/package/@msg91comm/m91) |
| [⟦T30⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T99⟧](https://www.npmjs.com/package/@atomicmail/langchain) |
| [⟦T31⟧](https://github.com/zerohourzulu/continuity/blob/main/packages/remote-tools/README.md#langchain-tools) | [  ⟦T100⟧](https://www.npmjs.com/package/@ramex-labs/continuity-remote) |
| [⟦T32⟧](https://www.pipe0.com/docs/sdks/integrations/langchain) | [  ⟦T101⟧](https://www.npmjs.com/package/@pipe0/langchain) |
| [⟦T33⟧](https://github.com/Instant-Expert/integrations/tree/main/js/langchain-instant-expert#readme) | [  ⟦T102⟧](https://www.npmjs.com/package/langchain-instant-expert) |
| [⟦T34⟧](https://www.respan.ai/docs/documentation/overview) | [  ⟦T103⟧](https://www.npmjs.com/package/@respan/instrumentation-langchain) |
| [⟦T35⟧](https://webextract.dev/docs/langchain) | [  ⟦T104⟧](https://www.npmjs.com/package/@webextract/langchain) |
| [⟦T36⟧](https://github.com/fidacy/fidacy-open) | [  ⟦T105⟧](https://www.npmjs.com/package/@fidacy/langchain) |
| [⟦T37⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T106⟧](https://www.npmjs.com/package/@tubeagentkit/langchain-getyoutubetranscript) |
| [⟦T38⟧](/oss/javascript/integrations/tools/falkordb) | [  ⟦T107⟧](https://www.npmjs.com/package/@falkordb/langchain-ts) |
| [⟦T39⟧](https://snap-render.com) | [  ⟦T108⟧](https://www.npmjs.com/package/langchain-snaprender) |
| [⟦T40⟧](/oss/javascript/integrations/tools/azure_dynamic_sessions) | [  ⟦T109⟧](https://www.npmjs.com/package/@langchain/azure-dynamic-sessions) |
| [⟦T41⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T110⟧](https://www.npmjs.com/package/langchain-talordata) |
| [⟦T42⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-js) | [  ⟦T111⟧](https://www.npmjs.com/package/@pushary/langgraph) |
| [⟦T43⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T112⟧](https://www.npmjs.com/package/@clawfetch/langchain) |
| [⟦T44⟧](https://github.com/brianbooms/plugin-steward) | [  ⟦T113⟧](https://www.npmjs.com/package/@brianbooms/steward-mcp) |
| [⟦T45⟧](https://github.com/satohubai/sato-hub-integrations/tree/main/packages/satohub-langchain-tools#readme) | [  ⟦T114⟧](https://www.npmjs.com/package/satohub-langchain-tools) |
| [⟦T46⟧](https://github.com/ai-worker227/aiworker-examples/tree/main/langchain) | [  ⟦T115⟧](https://www.npmjs.com/package/aiworker-langchain-tools) |
| [⟦T47⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain) | [  ⟦T116⟧](https://www.npmjs.com/package/@arcmira/langchain) |
| [⟦T48⟧](https://github.com/gentlegiant96202/mercedes-benz-service-reminder-mcp#readme) | [  ⟦T117⟧](https://www.npmjs.com/package/mercedes-benz-service-reminder-mcp) |
| [⟦T49⟧](https://you.com/docs/integrations/langchain) | [  ⟦T118⟧](https://www.npmjs.com/package/@youdotcom-oss/langchain) |
| [⟦T50⟧](https://toolstem.com) | [  ⟦T119⟧](https://www.npmjs.com/package/langchain-toolstem) |
| [⟦T51⟧](https://docs.corsair.dev/mcp-adapters/langchain) | [  ⟦T120⟧](https://www.npmjs.com/package/@corsair-dev/langchain) |
| [⟦T52⟧](/oss/javascript/integrations/tools/clicksend) | [  ⟦T121⟧](https://www.npmjs.com/package/@clicksend/langchain-clicksend-mcp) |
| [⟦T53⟧](https://ceki.me) | [  ⟦T122⟧](https://www.npmjs.com/package/@ceki/langchain-ceki) |
| [⟦T54⟧](https://docs.magichour.ai) | [  ⟦T123⟧](https://www.npmjs.com/package/langchain-magic-hour) |
| [⟦T55⟧](https://platform.iflow.cn) | [  ⟦T124⟧](https://www.npmjs.com/package/@iflow-ai/search-langchain) |
| [⟦T56⟧](https://docs.thecontextcompany.com/frameworks/langchain-langgraph) | [  ⟦T125⟧](https://www.npmjs.com/package/@contextcompany/langchain) |
| [⟦T57⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T126⟧](https://www.npmjs.com/package/langchain-aproxpay) || [⟦T58⟧](/oss/javascript/integrations/tools/jigsawstack) | [  ⟦T127⟧](https://www.npmjs.com/package/@langchain/jigsawstack) |
| [⟦T59⟧](https://github.com/codexvritra/signa/tree/main/sdk/langchain) | [  ⟦T128⟧](https://www.npmjs.com/package/signa-langchain) |
| [⟦T60⟧](/oss/javascript/integrations/tools/nia) | [  ⟦T129⟧](https://www.npmjs.com/package/@nozomioai/langchain-nia) |
| [⟦T61⟧](https://x402check.dev) | [  ⟦T130⟧](https://www.npmjs.com/package/x402check-langchain) |
| [⟦T62⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T131⟧](https://www.npmjs.com/package/@hyperresearch/langchain) |
| [⟦T63⟧](/oss/javascript/integrations/tools/lambda_agent) |不适用 |
| [⟦T64⟧](https://browserless.io) |不适用 |
| [⟦T65⟧](/oss/javascript/integrations/tools/json) |不适用 |
| [⟦T66⟧](https://docs.notte.cc/integrations/langchain) |不适用 |
| [⟦T67⟧](/oss/javascript/integrations/tools/sql) |不适用 |
| [⟦T68⟧](/oss/javascript/integrations/tools/vectorstore) |不适用 |
| [⟦T69⟧](/oss/javascript/integrations/tools/webbrowser) |不适用 |

> [!注意]
>
> 如果您想编写自己的工具，请参阅[Create tools](/oss/javascript/langchain/tools#create-tools)。如果您想贡献集成，请参阅[Build a new integration](/oss/javascript/contributing/integrations-langchain)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。