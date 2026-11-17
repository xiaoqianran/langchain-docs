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
| [⟦T1⟧](/oss/javascript/integrations/tools/dalle) | [  ⟦T80⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T2⟧](/oss/javascript/integrations/tools/openai) | [  ⟦T81⟧](https://www.npmjs.com/package/@langchain/openai) |
| [⟦T3⟧](/oss/javascript/integrations/tools/openapi) | [  ⟦T82⟧](https://www.npmjs.com/package/@langchain/langgraph) |
| [⟦T4⟧](/oss/javascript/integrations/tools/anthropic) | [  ⟦T83⟧](https://www.npmjs.com/package/@langchain/anthropic) |
| [⟦T5⟧](/oss/javascript/integrations/tools/google) | [  ⟦T84⟧](https://www.npmjs.com/package/@langchain/google) |
| [⟦T6⟧](/oss/javascript/integrations/tools/tavily_crawl) | [  ⟦T85⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T7⟧](/oss/javascript/integrations/tools/tavily_extract) | [  ⟦T86⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T8⟧](/oss/javascript/integrations/tools/tavily_get_research) | [  ⟦T87⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T9⟧](/oss/javascript/integrations/tools/tavily_map) | [  ⟦T88⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T10⟧](/oss/javascript/integrations/tools/tavily_research) | [  ⟦T89⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T11⟧](/oss/javascript/integrations/tools/tavily_search) | [  ⟦T90⟧](https://www.npmjs.com/package/@langchain/tavily) |
| [⟦T12⟧](/oss/javascript/integrations/tools/oracleai) | [  ⟦T91⟧](https://www.npmjs.com/package/@oracle/langchain-oracledb) |
| [⟦T13⟧](/oss/javascript/integrations/tools/exa_search) | [  ⟦T92⟧](https://www.npmjs.com/package/@langchain/exa) |
| [⟦T14⟧](/oss/javascript/integrations/tools/composio) | [  ⟦T93⟧](https://www.npmjs.com/package/@composio/langchain) |
| [⟦T15⟧](https://pilotfish.gai.ventures/docs/open) | [  ⟦T94⟧](https://www.npmjs.com/package/@gaiventures/pilotfish-mcp) |
| [⟦T16⟧](/oss/javascript/integrations/tools/mcp_toolbox) | [  ⟦T95⟧](https://www.npmjs.com/package/@toolbox-sdk/core) |
| [⟦T17⟧](/oss/javascript/integrations/tools/ibm) | [  ⟦T96⟧](https://www.npmjs.com/package/@langchain/ibm) |
| [⟦T18⟧](https://fizzl.eu/agents/langchain-js/) | [  ⟦T97⟧](https://www.npmjs.com/package/fizzl-langchain) |
| [⟦T19⟧](https://proompteng.github.io/bilig/) | [  ⟦T98⟧](https://www.npmjs.com/package/@bilig/workpaper) |
| [⟦T20⟧](https://github.com/Walkover-Web-Solution/viasocket-apps#langchain) | [  ⟦T99⟧](https://www.npmjs.com/package/viasocket-apps) |
| [⟦T21⟧](/oss/javascript/integrations/tools/perplexity_search) | [  ⟦T100⟧](https://www.npmjs.com/package/@langchain/perplexity) |
| [⟦T22⟧](https://vericto.com/docs/langchain) | [  ⟦T101⟧](https://www.npmjs.com/package/@vericto/sdk) |
| [⟦T23⟧](https://serpex.dev/docs) | [  ⟦T102⟧](https://www.npmjs.com/package/langchain-serpex-js) |
| [⟦T24⟧](/oss/javascript/integrations/tools/decodo) | [  ⟦T103⟧](https://www.npmjs.com/package/@decodo/langchain-ts) |
| [⟦T25⟧](https://agentsvc.io/docs/langchain) | [  ⟦T104⟧](https://www.npmjs.com/package/agentsvc) |
| [⟦T26⟧](https://precleared.dev/docs/langchain) | [  ⟦T105⟧](https://www.npmjs.com/package/precleared) |
| [⟦T27⟧](https://docs.pexafy.com/langchain) | [  ⟦T106⟧](https://www.npmjs.com/package/langchain-pexafy) |
| [⟦T28⟧](https://agentsearchhq.com/blog/add-web-search-to-langchain-js-agent) | [  ⟦T107⟧](https://www.npmjs.com/package/@agentsearchhq/langchain) |
| [⟦T29⟧](https://safeprompt.dev/docs/langchain) | [  ⟦T108⟧](https://www.npmjs.com/package/@safeprompt.dev/langchain) |
| [⟦T30⟧](https://github.com/Algiras/agentum-skills/tree/main/packages/agentum-langchain) | [  ⟦T109⟧](https://www.npmjs.com/package/agentum-langchain) |
| [⟦T31⟧](https://channel3.ai/docs/langchain) | [  ⟦T110⟧](https://www.npmjs.com/package/@channel3/agent-toolkit) |
| [⟦T32⟧](https://databazaar.io/integrations?utm_source=langchain\&utm_campaign=integration-listing#langchain) | [  ⟦T111⟧](https://www.npmjs.com/package/databazaar-agent-tools) |
| [⟦T33⟧](https://github.com/letsbuild-math/cultmath-agent-tools) | [  ⟦T112⟧](https://www.npmjs.com/package/@cultmath/agent-tools) |
| [⟦T34⟧](https://github.com/MSG91/m91-sdk#langchain) | [  ⟦T113⟧](https://www.npmjs.com/package/@msg91comm/m91) |
| [⟦T35⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T114⟧](https://www.npmjs.com/package/@atomicmail/langchain) |
| [⟦T36⟧](https://github.com/zerohourzulu/continuity/blob/main/packages/remote-tools/README.md#langchain-tools) | [  ⟦T115⟧](https://www.npmjs.com/package/@ramex-labs/continuity-remote) |
| [⟦T37⟧](https://www.pipe0.com/docs/sdks/integrations/langchain) | [  ⟦T116⟧](https://www.npmjs.com/package/@pipe0/langchain) |
| [⟦T38⟧](https://github.com/Instant-Expert/integrations/tree/main/js/langchain-instant-expert#readme) | [  ⟦T117⟧](https://www.npmjs.com/package/langchain-instant-expert) |
| [⟦T39⟧](https://github.com/acarchidi/agentforge-tools#langchain-js) | [  ⟦T118⟧](https://www.npmjs.com/package/agentforge-tools) |
| [⟦T40⟧](https://www.respan.ai/docs/documentation/overview) | [  ⟦T119⟧](https://www.npmjs.com/package/@respan/instrumentation-langchain) |
| [⟦T41⟧](https://github.com/grokbot1233/agentreader/tree/master/packages/agentreader-langchain) | [  ⟦T120⟧](https://www.npmjs.com/package/@axiomworks/agentreader-langchain) |
| [⟦T42⟧](https://webextract.dev/docs/langchain) | [  ⟦T121⟧](https://www.npmjs.com/package/@webextract/langchain) |
| [⟦T43⟧](https://github.com/fidacy/fidacy-open) | [  ⟦T122⟧](https://www.npmjs.com/package/@fidacy/langchain) |
| [⟦T44⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T123⟧](https://www.npmjs.com/package/@tubeagentkit/langchain-getyoutubetranscript) |
| [⟦T45⟧](/oss/javascript/integrations/tools/falkordb) | [  ⟦T124⟧](https://www.npmjs.com/package/@falkordb/langchain-ts) |
| [⟦T46⟧](https://github.com/User0856/snaprender-integrations/tree/main/langchain) | [  ⟦T125⟧](https://www.npmjs.com/package/langchain-snaprender) |
| [⟦T47⟧](/oss/javascript/integrations/tools/azure_dynamic_sessions) | [  ⟦T126⟧](https://www.npmjs.com/package/@langchain/azure-dynamic-sessions) |
| [⟦T48⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T127⟧](https://www.npmjs.com/package/langchain-talordata) |
| [⟦T49⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-js) | [  ⟦T128⟧](https://www.npmjs.com/package/@pushary/langgraph) |
| [⟦T50⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T129⟧](https://www.npmjs.com/package/@clawfetch/langchain) |
| [⟦T51⟧](https://github.com/brianbooms/plugin-steward) | [  ⟦T130⟧](https://www.npmjs.com/package/@brianbooms/steward-mcp) |
| [⟦T52⟧](https://github.com/satohubai/sato-hub-integrations/tree/main/packages/satohub-langchain-tools#readme) | [  ⟦T131⟧](https://www.npmjs.com/package/satohub-langchain-tools) |
| [⟦T53⟧](https://github.com/ai-worker227/aiworker-examples/tree/main/langchain) | [  ⟦T132⟧](https://www.npmjs.com/package/aiworker-langchain-tools) |
| [⟦T54⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain) | [  ⟦T133⟧](https://www.npmjs.com/package/@arcmira/langchain) |
| [⟦T55⟧](https://github.com/sproutsdata-ai/sproutsdata-js/tree/main/packages/langchain#readme) | [  ⟦T134⟧](https://www.npmjs.com/package/@sproutsdata.ai/langchain) |
| [⟦T56⟧](https://github.com/gentlegiant96202/mercedes-benz-service-reminder-mcp#readme) | [  ⟦T135⟧](https://www.npmjs.com/package/mercedes-benz-service-reminder-mcp) |
| [⟦T57⟧](https://you.com/docs/integrations/langchain) | [  ⟦T136⟧](https://www.npmjs.com/package/@youdotcom-oss/langchain) || [⟦T58⟧](https://toolstem.com) | [  ⟦T137⟧](https://www.npmjs.com/package/langchain-toolstem) |
| [⟦T59⟧](https://oceanalt.com/en/developers/langchain) | [  ⟦T138⟧](https://www.npmjs.com/package/@oceanalt/langchain) |
| [⟦T60⟧](https://docs.corsair.dev/mcp-adapters/langchain) | [  ⟦T139⟧](https://www.npmjs.com/package/@corsair-dev/langchain) |
| [⟦T61⟧](/oss/javascript/integrations/tools/clicksend) | [  ⟦T140⟧](https://www.npmjs.com/package/@clicksend/langchain-clicksend-mcp) |
| [⟦T62⟧](https://ceki.me) | [  ⟦T141⟧](https://www.npmjs.com/package/@ceki/langchain-ceki) |
| [⟦T63⟧](https://docs.magichour.ai) | [  ⟦T142⟧](https://www.npmjs.com/package/langchain-magic-hour) |
| [⟦T64⟧](https://platform.iflow.cn) | [  ⟦T143⟧](https://www.npmjs.com/package/@iflow-ai/search-langchain) |
| [⟦T65⟧](https://docs.thecontextcompany.com/frameworks/langchain-langgraph) | [  ⟦T144⟧](https://www.npmjs.com/package/@contextcompany/langchain) |
| [⟦T66⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T145⟧](https://www.npmjs.com/package/langchain-aproxpay) |
| [⟦T67⟧](/oss/javascript/integrations/tools/jigsawstack) | [  ⟦T146⟧](https://www.npmjs.com/package/@langchain/jigsawstack) |
| [⟦T68⟧](https://github.com/codexvritra/signa/tree/main/sdk/langchain) | [  ⟦T147⟧](https://www.npmjs.com/package/signa-langchain) |
| [⟦T69⟧](/oss/javascript/integrations/tools/nia) | [  ⟦T148⟧](https://www.npmjs.com/package/@nozomioai/langchain-nia) |
| [⟦T70⟧](https://x402check.dev) | [  ⟦T149⟧](https://www.npmjs.com/package/x402check-langchain) |
| [⟦T71⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T150⟧](https://www.npmjs.com/package/@hyperresearch/langchain) |
| [⟦T72⟧](/oss/javascript/integrations/tools/lambda_agent) |不适用 |
| [⟦T73⟧](https://browserless.io) |不适用 |
| [⟦T74⟧](/oss/javascript/integrations/tools/json) |不适用 |
| [⟦T75⟧](https://docs.notte.cc/integrations/langchain) |不适用 |
| [⟦T76⟧](https://sidequestpays.com/docs#langchain) |不适用 |
| [⟦T77⟧](/oss/javascript/integrations/tools/sql) |不适用 |
| [⟦T78⟧](/oss/javascript/integrations/tools/vectorstore) |不适用 |
| [⟦T79⟧](/oss/javascript/integrations/tools/webbrowser) |不适用 |

> [!注意]
>
> 如果您想编写自己的工具，请参阅[Create tools](/oss/javascript/langchain/tools#create-tools)。如果您想贡献集成，请参阅[Build a new integration](/oss/javascript/contributing/integrations-langchain)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。