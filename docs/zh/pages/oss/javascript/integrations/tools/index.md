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

## 所有工具和工具包<div>
  |整合 |下载 |
  | :-| :-|
  | [⟦T1⟧](/oss/javascript/integrations/tools/dalle) | <span><a href="https://www.npmjs.com/package/@langchain/openai"><img alt="Downloads per month" /></a></span>|
  | [⟦T2⟧](/oss/javascript/integrations/tools/openai) | <span><a href="https://www.npmjs.com/package/@langchain/openai"> <img alt="Downloads per month" /></a></span> |
  | [⟦T3⟧](/oss/javascript/integrations/tools/openapi) | <span><a href="https://www.npmjs.com/package/@langchain/langgraph"><img alt="Downloads per month" /></a></span>|
  | [⟦T4⟧](/oss/javascript/integrations/tools/anthropic) | <span><a href="https://www.npmjs.com/package/@langchain/anthropic"> <img alt="Downloads per month" /></a></span> |
  | [⟦T5⟧](/oss/javascript/integrations/tools/google) | <span><a href="https://www.npmjs.com/package/@langchain/google"><img alt="Downloads per month" /></a></span>|
  | [⟦T6⟧](/oss/javascript/integrations/tools/tavily_crawl) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"><img alt="Downloads per month" /></a></span>|
  | [⟦T7⟧](/oss/javascript/integrations/tools/tavily_extract) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"><img alt="Downloads per month" /></a></span>|
  | [⟦T8⟧](/oss/javascript/integrations/tools/tavily_get_research) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"> <img alt="Downloads per month" /></a></span> |
  | [⟦T9⟧](/oss/javascript/integrations/tools/tavily_map) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"><img alt="Downloads per month" /></a></span>|
  | [⟦T10⟧](/oss/javascript/integrations/tools/tavily_research) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"> <img alt="Downloads per month" /></a></span> |
  | [⟦T11⟧](/oss/javascript/integrations/tools/tavily_search) | <span><a href="https://www.npmjs.com/package/@langchain/tavily"><img alt="Downloads per month" /></a></span>|
  | [⟦T12⟧](/oss/javascript/integrations/tools/oracleai) | <span><a href="https://www.npmjs.com/package/@oracle/langchain-oracledb"><img alt="Downloads per month" /></a></span>|
  | [⟦T13⟧](/oss/javascript/integrations/tools/exa_search) | <span><a href="https://www.npmjs.com/package/@langchain/exa"><img alt="Downloads per month" /></a></span>|
  | [⟦T14⟧](/oss/javascript/integrations/tools/composio) | <span><a href="https://www.npmjs.com/package/@composio/langchain"> <img alt="Downloads per month" /></a></span> |
  | [⟦T15⟧](/oss/javascript/integrations/tools/mcp_toolbox) | <span><a href="https://www.npmjs.com/package/@toolbox-sdk/core"><img alt="Downloads per month" /></a></span>|
  | [⟦T16⟧](https://docs.atomicmail.ai/langchain) | <span><a href="https://www.npmjs.com/package/@atomicmail/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T17⟧](/oss/javascript/integrations/tools/ibm) | <span><a href="https://www.npmjs.com/package/@langchain/ibm"><img alt="Downloads per month" /></a></span>|
  | [⟦T18⟧](https://proompteng.github.io/bilig/) | <span><a href="https://www.npmjs.com/package/@bilig/workpaper"><img alt="Downloads per month" /></a></span>|
  | [⟦T19⟧](/oss/javascript/integrations/tools/perplexity_search) | <span><a href="https://www.npmjs.com/package/@langchain/perplexity"><img alt="Downloads per month" /></a></span>|
  | [⟦T20⟧](https://github.com/zerohourzulu/continuity/blob/main/packages/remote-tools/README.md#langchain-tools) | <span><a href="https://www.npmjs.com/package/@ramex-labs/continuity-remote"><img alt="Downloads per month" /></a></span>|
  | [⟦T21⟧](https://github.com/fidacy/fidacy-open) | <span><a href="https://www.npmjs.com/package/@fidacy/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T22⟧](https://serpex.dev/docs) | <span><a href="https://www.npmjs.com/package/langchain-serpex-js"> <img alt="Downloads per month" /></a></span> |
  | [⟦T23⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-js) | <span><a href="https://www.npmjs.com/package/@pushary/langgraph"><img alt="Downloads per month" /></a></span>|
  | [⟦T24⟧](/oss/javascript/integrations/tools/decodo) | <span><a href="https://www.npmjs.com/package/@decodo/langchain-ts"> <img alt="Downloads per month" /></a></span> || [⟦T25⟧](https://github.com/satohubai/sato-hub-integrations/tree/main/packages/satohub-langchain-tools#readme) | <span><a href="https://www.npmjs.com/package/satohub-langchain-tools"><img alt="Downloads per month" /></a></span>|
  | [⟦T26⟧](https://github.com/ai-worker227/aiworker-examples/tree/main/langchain) | <span><a href="https://www.npmjs.com/package/aiworker-langchain-tools"><img alt="Downloads per month" /></a></span>|
  | [⟦T27⟧](https://www.pipe0.com/docs/sdks/integrations/langchain) | <span><a href="https://www.npmjs.com/package/@pipe0/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T28⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | <span><a href="https://www.npmjs.com/package/langchain-talordata"><img alt="Downloads per month" /></a></span>|
  | [⟦T29⟧](https://you.com/docs/integrations/langchain) | <span><a href="https://www.npmjs.com/package/@youdotcom-oss/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T30⟧](/oss/javascript/integrations/tools/azure_dynamic_sessions) | <span><a href="https://www.npmjs.com/package/@langchain/azure-dynamic-sessions"> <img alt="Downloads per month" /></a></span> |
  | [⟦T31⟧](https://docs.corsair.dev/mcp-adapters/langchain) | <span><a href="https://www.npmjs.com/package/@corsair-dev/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T32⟧](/oss/javascript/integrations/tools/falkordb) | <span><a href="https://www.npmjs.com/package/@falkordb/langchain-ts"> <img alt="Downloads per month" /></a></span> |
  | [⟦T33⟧](/oss/javascript/integrations/tools/clicksend) | <span><a href="https://www.npmjs.com/package/@clicksend/langchain-clicksend-mcp"><img alt="Downloads per month" /></a></span>|
  | [⟦T34⟧](https://docs.safeprompt.dev/langchain) | <span><a href="https://www.npmjs.com/package/@safeprompt.dev/langchain"> <img alt="Downloads per month" /></a></span> |
  | [⟦T35⟧](https://www.respan.ai/docs/documentation/overview) | <span><a href="https://www.npmjs.com/package/@respan/instrumentation-langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T36⟧](https://ceki.me) | <span><a href="https://www.npmjs.com/package/@ceki/langchain-ceki"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](https://docs.thecontextcompany.com/frameworks/langchain-langgraph) | <span><a href="https://www.npmjs.com/package/@contextcompany/langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T38⟧](https://docs.magichour.ai) | <span><a href="https://www.npmjs.com/package/langchain-magic-hour"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](https://toolstem.com) | <span><a href="https://www.npmjs.com/package/langchain-toolstem"><img alt="Downloads per month" /></a></span>|
  | [⟦T40⟧](/oss/javascript/integrations/tools/jigsawstack) | <span><a href="https://www.npmjs.com/package/@langchain/jigsawstack"><img alt="Downloads per month" /></a></span>|
  | [⟦T41⟧](https://github.com/aproxpay/langchain-aproxpay) | <span><a href="https://www.npmjs.com/package/langchain-aproxpay"><img alt="Downloads per month" /></a></span>|
  | [⟦T42⟧](https://platform.iflow.cn) | <span><a href="https://www.npmjs.com/package/@iflow-ai/search-langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T43⟧](https://snap-render.com) | <span><a href="https://www.npmjs.com/package/langchain-snaprender"><img alt="Downloads per month" /></a></span>|
  | [⟦T44⟧](https://github.com/codexvritra/signa/tree/main/sdk/langchain) | <span><a href="https://www.npmjs.com/package/signa-langchain"><img alt="Downloads per month" /></a></span>|
  | [⟦T45⟧](/oss/javascript/integrations/tools/nia) | <span><a href="https://www.npmjs.com/package/@nozomioai/langchain-nia"><img alt="Downloads per month" /></a></span>|
  | [⟦T46⟧](/oss/javascript/integrations/tools/lambda_agent) | <span>不适用</span> |
  | [⟦T47⟧](https://browserless.io) | <span>不适用</span> |
  | [⟦T48⟧](/oss/javascript/integrations/tools/json) | <span>不适用</span> |
  | [⟦T49⟧](https://docs.notte.cc/integrations/langchain) | <span>不适用</span> |
  | [⟦T50⟧](https://docs.pexafy.com/langchain) | <span>不适用</span> |
  | [⟦T51⟧](/oss/javascript/integrations/tools/sql) | <span>不适用</span> || [⟦T52⟧](/oss/javascript/integrations/tools/vectorstore) | <span>不适用</span> |
  | [⟦T53⟧](/oss/javascript/integrations/tools/webbrowser) | <span>不适用</span> |
</div>

<Info>
  如果您想编写自己的工具，请参阅[Create tools](/oss/javascript/langchain/tools#create-tools)。如果您想贡献集成，请参阅[Build a new integration](/oss/javascript/contributing/integrations-langchain)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>