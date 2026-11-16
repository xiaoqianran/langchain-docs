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

## 所有工具和工具包|整合|下载 |
| :-| :-|
| [⟦T1⟧](/oss/javascript/integrations/tools/dalle) | [  ⟦T79⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T2⟧](/oss/javascript/integrations/tools/openai) | [  ⟦T80⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T3⟧](/oss/javascript/integrations/tools/openapi) | [  ⟦T81⟧](https://www.npmjs.com/package/@langchain/langgraph) |
| [⟦T4⟧](/oss/javascript/integrations/tools/anthropic) | [  ⟦T82⟧](https://www.npmjs.com/package/@langchain/anthropic) |
| [⟦T5⟧](/oss/javascript/integrations/tools/google) | [  ⟦T83⟧](https://www.npmjs.com/package/@langchain/google) |
| [⟦T6⟧](/oss/javascript/integrations/tools/tavily_crawl) | [  ⟦T84⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T7⟧](/oss/javascript/integrations/tools/tavily_extract) | [  ⟦T85⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T8⟧](/oss/javascript/integrations/tools/tavily_get_research) | [  ⟦T86⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T9⟧](/oss/javascript/integrations/tools/tavily_map) | [  ⟦T87⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T10⟧](/oss/javascript/integrations/tools/tavily_research) | [  ⟦T88⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T11⟧](/oss/javascript/integrations/tools/tavily_search) | [  ⟦T89⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T12⟧](/oss/javascript/integrations/tools/oracleai) | [  ⟦T90⟧](https://www.npmjs.com/package/@oracle/langchain-oracledb) |
| [⟦T13⟧](/oss/javascript/integrations/tools/exa_search) | [  ⟦T91⟧](https://www.npmjs.com/package/@langchain/exa) |
| [⟦T14⟧](/oss/javascript/integrations/tools/composio) | [  ⟦T92⟧](https://www.npmjs.com/package/@composio/langchain) |
| [⟦T15⟧](/oss/javascript/integrations/tools/mcp_toolbox) | [  ⟦T93⟧](https://www.npmjs.com/package/@toolbox-sdk/core) |
| [⟦T16⟧](/oss/javascript/integrations/tools/ibm) | [  ⟦T94⟧](https://www.npmjs.com/package/@langchain/ibm) |
| [⟦T17⟧](https://fizzl.eu/agents/langchain-js/) | [  ⟦T95⟧](https://www.npmjs.com/package/fizzl-langchain) |
| [⟦T18⟧](https://proompteng.github.io/bilig/) | [  ⟦T96⟧](https://www.npmjs.com/package/@bilig/workpaper) |
| [⟦T19⟧](https://github.com/Walkover-Web-Solution/viasocket-apps#langchain) | [  ⟦T97⟧](https://www.npmjs.com/package/viasocket-apps) |
| [⟦T20⟧](/oss/javascript/integrations/tools/perplexity_search) | [  ⟦T98⟧](https://www.npmjs.com/package/@langchain/perplexity) |
| [⟦T21⟧](https://vericto.com/docs/langchain) | [  ⟦T99⟧](https://www.npmjs.com/package/@vericto/sdk) |
| [⟦T22⟧](https://serpex.dev/docs) | [  ⟦T100⟧](https://www.npmjs.com/package/langchain-serpex-js) |
| [⟦T23⟧](/oss/javascript/integrations/tools/decodo) | [  ⟦T101⟧](https://www.npmjs.com/package/@decodo/langchain-ts) |
| [⟦T24⟧](https://agentsvc.io/docs/langchain) | [  ⟦T102⟧](https://www.npmjs.com/package/agentsvc) |
| [⟦T25⟧](https://precleared.dev/docs/langchain) | [  ⟦T103⟧](https://www.npmjs.com/package/precleared) |
| [⟦T26⟧](https://docs.pexafy.com/langchain) | [  ⟦T104⟧](https://www.npmjs.com/package/langchain-pexafy) |
| [⟦T27⟧](https://agentsearchhq.com/blog/add-web-search-to-langchain-js-agent) | [  ⟦T105⟧](https://www.npmjs.com/package/@agentsearchhq/langchain) |
| [⟦T28⟧](https://safeprompt.dev/docs/langchain) | [  ⟦T106⟧](https://www.npmjs.com/package/@safeprompt.dev/langchain) |
| [⟦T29⟧](https://github.com/Algiras/agentum-skills/tree/main/packages/agentum-langchain) | [  ⟦T107⟧](https://www.npmjs.com/package/agentum-langchain) |
| [⟦T30⟧](https://channel3.ai/docs/langchain) | [  ⟦T108⟧](https://www.npmjs.com/package/@channel3/agent-toolkit) |
| [⟦T31⟧](https://databazaar.io/integrations?utm_source=langchain\&utm_campaign=integration-listing#langchain) | [  ⟦T109⟧](https://www.npmjs.com/package/databazaar-agent-tools) |
| [⟦T32⟧](https://github.com/letsbuild-math/cultmath-agent-tools) | [  ⟦T110⟧](https://www.npmjs.com/package/@cultmath/agent-tools) |
| [⟦T33⟧](https://github.com/MSG91/m91-sdk#langchain) | [  ⟦T111⟧](https://www.npmjs.com/package/@msg91comm/m91) |
| [⟦T34⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T112⟧](https://www.npmjs.com/package/@atomicmail/langchain) |
| [⟦T35⟧](https://github.com/zerohourzulu/continuity/blob/main/packages/remote-tools/README.md#langchain-tools) | [  ⟦T113⟧](https://www.npmjs.com/package/@ramex-labs/continuity-remote) |
| [⟦T36⟧](https://www.pipe0.com/docs/sdks/integrations/langchain) | [  ⟦T114⟧](https://www.npmjs.com/package/@pipe0/langchain) |
| [⟦T37⟧](https://github.com/Instant-Expert/integrations/tree/main/js/langchain-instant-expert#readme) | [  ⟦T115⟧](https://www.npmjs.com/package/langchain-instant-expert) |
| [⟦T38⟧](https://github.com/acarchidi/agentforge-tools#langchain-js) | [  ⟦T116⟧](https://www.npmjs.com/package/agentforge-tools) |
| [⟦T39⟧](https://www.respan.ai/docs/documentation/overview) | [  ⟦T117⟧](https://www.npmjs.com/package/@respan/instrumentation-langchain) |
| [⟦T40⟧](https://github.com/grokbot1233/agentreader/tree/master/packages/agentreader-langchain) | [  ⟦T118⟧](https://www.npmjs.com/package/@axiomworks/agentreader-langchain) |
| [⟦T41⟧](https://webextract.dev/docs/langchain) | [  ⟦T119⟧](https://www.npmjs.com/package/@webextract/langchain) |
| [⟦T42⟧](https://github.com/fidacy/fidacy-open) | [  ⟦T120⟧](https://www.npmjs.com/package/@fidacy/langchain) |
| [⟦T43⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T121⟧](https://www.npmjs.com/package/@tubeagentkit/langchain-getyoutubetranscript) |
| [⟦T44⟧](/oss/javascript/integrations/tools/falkordb) | [  ⟦T122⟧](https://www.npmjs.com/package/@falkordb/langchain-ts) |
| [⟦T45⟧](https://github.com/User0856/snaprender-integrations/tree/main/langchain) | [  ⟦T123⟧](https://www.npmjs.com/package/langchain-snaprender) |
| [⟦T46⟧](/oss/javascript/integrations/tools/azure_dynamic_sessions) | [  ⟦T124⟧](https://www.npmjs.com/package/@langchain/azure-dynamic-sessions) |
| [⟦T47⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T125⟧](https://www.npmjs.com/package/langchain-talordata) |
| [⟦T48⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-js) | [  ⟦T126⟧](https://www.npmjs.com/package/@pushary/langgraph) |
| [⟦T49⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T127⟧](https://www.npmjs.com/package/@clawfetch/langchain) |
| [⟦T50⟧](https://github.com/brianbooms/plugin-steward) | [  ⟦T128⟧](https://www.npmjs.com/package/@brianbooms/steward-mcp) |
| [⟦T51⟧](https://github.com/satohubai/sato-hub-integrations/tree/main/packages/satohub-langchain-tools#readme) | [  ⟦T129⟧](https://www.npmjs.com/package/satohub-langchain-tools) |
| [⟦T52⟧](https://github.com/ai-worker227/aiworker-examples/tree/main/langchain) | [  ⟦T130⟧](https://www.npmjs.com/package/aiworker-langchain-tools) |
| [⟦T53⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain) | [  ⟦T131⟧](https://www.npmjs.com/package/@arcmira/langchain) |
| [⟦T54⟧](https://github.com/sproutsdata-ai/sproutsdata-js/tree/main/packages/langchain#readme) | [  ⟦T132⟧](https://www.npmjs.com/package/@sproutsdata.ai/langchain) |
| [⟦T55⟧](https://github.com/gentlegiant96202/mercedes-benz-service-reminder-mcp#readme) | [  ⟦T133⟧](https://www.npmjs.com/package/mercedes-benz-service-reminder-mcp) |
| [⟦T56⟧](https://you.com/docs/integrations/langchain) | [  ⟦T134⟧](https://www.npmjs.com/package/@youdotcom-oss/langchain) |
| [⟦T57⟧](https://toolstem.com) | [  ⟦T135⟧](https://www.npmjs.com/package/langchain-toolstem) || [⟦T58⟧](https://oceanalt.com/en/developers/langchain) | [  ⟦T136⟧](https://www.npmjs.com/package/@oceanalt/langchain) |
| [⟦T59⟧](https://docs.corsair.dev/mcp-adapters/langchain) | [  ⟦T137⟧](https://www.npmjs.com/package/@corsair-dev/langchain) |
| [⟦T60⟧](/oss/javascript/integrations/tools/clicksend) | [  ⟦T138⟧](https://www.npmjs.com/package/@clicksend/langchain-clicksend-mcp) |
| [⟦T61⟧](https://ceki.me) | [  ⟦T139⟧](https://www.npmjs.com/package/@ceki/langchain-ceki) |
| [⟦T62⟧](https://docs.magichour.ai) | [  ⟦T140⟧](https://www.npmjs.com/package/langchain-magic-hour) |
| [⟦T63⟧](https://platform.iflow.cn) | [  ⟦T141⟧](https://www.npmjs.com/package/@iflow-ai/search-langchain) |
| [⟦T64⟧](https://docs.thecontextcompany.com/frameworks/langchain-langgraph) | [  ⟦T142⟧](https://www.npmjs.com/package/@contextcompany/langchain) |
| [⟦T65⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T143⟧](https://www.npmjs.com/package/langchain-aproxpay) |
| [⟦T66⟧](/oss/javascript/integrations/tools/jigsawstack) | [  ⟦T144⟧](https://www.npmjs.com/package/@langchain/jigsawstack) |
| [⟦T67⟧](https://github.com/codexvritra/signa/tree/main/sdk/langchain) | [  ⟦T145⟧](https://www.npmjs.com/package/signa-langchain) |
| [⟦T68⟧](/oss/javascript/integrations/tools/nia) | [  ⟦T146⟧](https://www.npmjs.com/package/@nozomioai/langchain-nia) |
| [⟦T69⟧](https://x402check.dev) | [  ⟦T147⟧](https://www.npmjs.com/package/x402check-langchain) |
| [⟦T70⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T148⟧](https://www.npmjs.com/package/@hyperresearch/langchain) |
| [⟦T71⟧](/oss/javascript/integrations/tools/lambda_agent) |不适用 |
| [⟦T72⟧](https://browserless.io) |不适用 |
| [⟦T73⟧](/oss/javascript/integrations/tools/json) |不适用 |
| [⟦T74⟧](https://docs.notte.cc/integrations/langchain) |不适用 |
| [⟦T75⟧](https://sidequestpays.com/docs#langchain) |不适用 |
| [⟦T76⟧](/oss/javascript/integrations/tools/sql) |不适用 |
| [⟦T77⟧](/oss/javascript/integrations/tools/vectorstore) |不适用 |
| [⟦T78⟧](/oss/javascript/integrations/tools/webbrowser) |不适用 |

> [!注意]
>
> 如果您想编写自己的工具，请参阅[Create tools](/oss/javascript/langchain/tools#create-tools)。如果您想贡献集成，请参阅[Build a new integration](/oss/javascript/contributing/integrations-langchain)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。