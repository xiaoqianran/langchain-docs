<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool integrations | https://docs.langchain.com/oss/python/integrations/tools/index -->

# 工具集成

使用 LangChain Python 与工具集成。

[Tools](/oss/python/langchain/tools) 是设计为由模型调用的实用程序：它们的输入被设计为由模型生成，其输出被设计为传递回模型。

工具包是要一起使用的工具的集合。

## 搜索

下表显示了以某种形式执行在线搜索的工具：

|工具/工具包 |免费/付费|返回数据 || --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [BrightData SERP](https://docs.brightdata.com/scraping-automation/serp-api/introduction) |按成功请求付费 | URL、摘要、标题、搜索排名 || [cloro](https://docs.cloro.dev) |付费| URL、片段、标题、答案 |
| [Crawleo](https://crawleo.dev/integrations/langchain) |付费| URL、片段、副驾驶答案、侧边栏、标题、发布日期、站点链接、页面内容 || [CrustAPI](https://crustapi.com/docs) |每月 3,000 个免费积分，无卡 | URL、标题、摘要、地图、新闻、购物、图像、视频、地点、学者、专利、LinkedIn |
| [Exa Search](/oss/python/integrations/tools/exa_search) |每月 1000 次免费搜索 |网址、作者、标题、发布日期 || [Google Search](/oss/python/integrations/tools/google_search) |付费| URL、片段、标题 |
| [iFlow Search](https://platform.iflow.cn/) |付费| URL、标题、摘要、日期 || [Keenable](https://docs.keenable.ai) |提供免费无钥匙套餐 |标题、URL、描述、发布日期、索引日期；用于获取的页面降价 |
| [Linkup Search](https://github.com/LinkupPlatform/langchain-linkup) |每月 2000 次免费搜索 |网址、内容、来源 || [Octen](https://docs.octen.ai) |付费|标题、URL、突出显示、作者、时间\_published |
| [Mixpeek](https://docs.mixpeek.com/agent-integrations/langchain) |免费套餐可用 |多模态搜索结果（视频、图像、音频、文档）|| [Nia Toolkit](https://github.com/nozomio-labs/nia-langchain) |免费套餐可用 |代码、文档、元数据、来源 |
| [Nimble Search](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 |网址、内容、标题 |
| [Nimble Web Search Agents](https://docs.nimbleway.com/integrations/connectors/langchain#agent-api-v2-web-search-agents) |免费试用 |研究答案，来源|| [Parallel Search](/oss/python/integrations/tools/parallel_search) |付费|网址、标题、摘录 |
| [Perplexity Search](/oss/python/integrations/tools/perplexity_search) |付费（每月免费套餐）| URL、标题、摘要、日期、上次更新 || [Search1API Search](https://www.search1api.com/docs/integrations/langchain#search) |注册即可获得 100 个免费积分，无需信用卡 | URL、标题、片段、内容、图像 |
| [SearchApi](https://www.searchapi.io/docs/google) |每月 100 次免费搜索 | URL、片段、标题、答案框、知识图 || [Scavio](https://scavio.dev/docs/langchain) | 50 个免费积分即可开始 | URL、标题、片段、知识图、产品、视频、成绩单、社交帖子和个人资料、职位发布和薪资、房地产列表、旅行和酒店库存、应用程序商店列表、广告库创意、软件评论、本地业务数据、监管备案、提取的页面内容 |
| [SERPdive](https://serpdive.com/docs) |每月 1000 个免费积分 | URL、标题、日期、页面内容、答案 || [TalorData SERP](https://www.talordata.com/docs) |付费|标题、URL、摘要、位置、知识图谱、答案框、AI 概述 |
| [Tavily Search](/oss/python/integrations/tools/tavily_search) |每月 1000 次免费搜索 | URL、内容、标题、图像、答案 || [Apify](https://docs.apify.com/platform/integrations/langchain) |免费套餐，按次付费（因演员而异）| Actor 输出（因 Actor 而异）|
| [Xpoz](https://www.xpoz.ai/docs) |免费套餐可用 |帖子、用户个人资料、评论、参与度指标（Twitter/X、Instagram、Reddit、TikTok）|| [You.com Search](https://you.com/docs/integrations/langchain) |注册时可获赠 100 美元积分 | URL、标题、页面内容 |
| [Querit](https://querit.com/docs) |注册后每月可免费搜索 1000 次 | URL、片段、标题、页面\_年龄、站点\_名称、站点\_图标 || [SerpApi Search Tools](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) |每月 250 次免费搜索 | URL、标题、摘要、答案框、知识图、AI 概述 |

## 代码解释器

下表显示了可用作代码解释器的工具：

|工具/工具包 |支持的语言 |沙盒寿命 |支持文件上传 |返回类型 |支持自托管 |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------- | -------------------- | ------------------- | -------------------- |
| [Amazon Bedrock AgentCore Code Interpreter](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | Python、JavaScript、TypeScript |可配置（最长 8 小时）| ✅ |文本、图像、文件 | ❌ || [Azure Container Apps dynamic sessions](/oss/python/integrations/tools/azure_dynamic_sessions) |蟒蛇 | 1 小时 | ✅ |文字、图像 | ❌ |
| [Capsule Code Interpreter](https://github.com/mavdol/langchain-capsule) | Python、JavaScript |无状态或基于会话 | ✅（REPL 工具）|文字| ✅ |

## 生产力

下表显示了可用于在生产力工具中自动执行任务的工具：

|工具/工具包 |定价|
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| [Gmail Toolkit](/oss/python/integrations/tools/google_gmail) |免费，每个用户每秒的配额单位限制为 250 |
| [GoodSender Toolkit](https://goodsender.com/docs) |免费套餐（100,000 封电子邮件/月），无需信用卡 |
| [AgentLine Toolkit](https://docs.agentline.cloud) |一次性 2 美元/号码，每分钟通话 0.10 美元，即用即付 |
| [AgentMail Toolkit](https://docs.agentmail.to/) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentmail.to) || [AgenticEmail Toolkit](https://agenticemail.dev/docs) |免费套餐可用，之后有 [paid plans](https://agenticemail.dev/pricing) |
| [AgentPhone Toolkit](https://docs.agentphone.to) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentphone.to) |
| [e2a](https://e2a.dev) |免费套餐可用，之后有 [flat-rate paid plans](https://e2a.dev) |
| [ReplyLayer Toolkit](https://replylayer.ai/docs/guides/langchain) |内测：免费沙盒试用，之后有[paid tiers](https://replylayer.ai/pricing) |
| [Verifly](https://verifly.email/docs) |免费套餐可用 |

## 网页浏览

下表显示了可用于在 Web 浏览器中自动执行任务的工具：|工具/工具包 |定价|支持与浏览器交互 |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| [AgentQL Toolkit](https://docs.agentql.com/) |免费试用，之后可按量付费和统一费率计划 | ✅ |
| [Amazon Bedrock AgentCore Browser](/oss/python/integrations/tools/bedrock_agentcore_browser) |按使用付费 (AWS) | ✅ |
| [AproxPay](https://github.com/aproxpay/langchain-aproxpay) |通过 x402 按使用付费（USDC on Base）；没有注册 | ❌（获取 + CONNECT 会话通行证）|
| [BrightData Unlocker](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) |按量付费 | ❌ |
| [BrightData Web Scraper API](https://github.com/luminati-io/langchain-brightdata) |按量付费 | ❌ || [Browserless](https://browserless.io) |免费套餐，之后提供基于使用的计划 | ✅ |
| [Ceki](https://ceki.me) |自模式自由；市场 $0.01/分钟 USDC | ✅ |
| [Firecrawl](https://docs.firecrawl.dev) |免费套餐可用 | ❌ |
| [Hyperbrowser Browser Agent Tools](https://docs.hyperbrowser.ai/) |免费试用，享受固定费率计划和预付费积分 | ✅ |
| [Hyperbrowser Web Scraping Tools](https://docs.hyperbrowser.ai/) |免费试用，享受固定费率计划和预付费积分 | ❌ |
| [Manifest](https://omfang.io/manifest-docs) |免费套餐可用 | ❌ || [MrScraper](https://docs.mrscraper.com) |付费| ❌ |
| [W2A](https://w2a-protocol.org/docs) |免费（公共端点）| ❌ |
| [Nimble Extract](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 | ❌ |
| [Nimble Extract Templates](https://docs.nimbleway.com/integrations/connectors/langchain#extract-templates) |免费试用 | ❌ |
| [Nimble Crawl and Map](https://docs.nimbleway.com/integrations/connectors/langchain#crawl-and-map) |免费试用 | ❌ |
| [NodeProxy](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) |每次解析 $0.002 USDC（Base 上的 x402）| \~\$0.002 USDC ❌ |
| [Oxylabs Web Scraper API](https://github.com/oxylabs/langchain-oxylabs) |免费试用，享受固定费率计划和预付费积分 | ❌ || [ProxyClaw](https://docs.proxyclaw.ai) |免费套餐可用 | ❌ |
| [ProxyHat](https://docs.proxyhat.com) |付费| ❌ |
| [Skim](https://skim402.com/docs) |按次付费（在 Base 上以 USDC 读取 0.002 美元/次）| ❌ |
| [Search1API Crawl](https://www.search1api.com/docs/integrations/langchain#crawl) |注册即可获得 100 个免费积分，无需信用卡 | ❌ |
| [Spidra](https://docs.spidra.io) |免费试用 | ❌ |

## 数据库

下表显示了可用于自动执行数据库中的任务的工具：|工具/工具包 |允许的操作 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [MCP Toolbox](/oss/python/integrations/tools/mcp_toolbox) |任何SQL操作 |
| [Drasi Toolkit](https://github.com/drasi-project/langchain-drasi) |实时数据库变更检测|
| [Sail SQL Toolkit](https://docs.lakesail.com/sail/main/guide/integrations/langchain/) |针对 Sail (Spark Connect) 的 SQL 查询、架构列表和查询检查 |
| [Stardog](https://github.com/stardog-union/stardog-langchain) | SPARQL SELECT 和模式自省 |

## 金融

下表显示了可用于执行付款、购买等金融交易的工具：|工具/工具包 |定价|能力|
| ------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Ampersend](https://docs.ampersend.ai) |付费|通过自动 x402 付款处理来支付和使用远程 AI 代理服务。                                                                                                      |
| [FlipCoin](https://github.com/flipcoin-fun/flipcoin-langchain) |免费|通过 LMSR AMM 或 CLOB 订单簿在预测市场上交易 YES/NO 股票。                                                                                                          || [Axiora](https://axiora.dev/docs) |免费 API 密钥 |来自 EDINET 文件、健康评分、筛查和英文文件翻译的日本上市公司财务数据。                                                                  |
| [Delegare](https://docs.delegare.dev) |付费|通过具有内置预算护栏的 AP2 指令授权和执行多轨支付。                                                                                         |
| [DexPaprika](https://docs.dexpaprika.com) |免费（无钥匙）|搜索代币、矿池和 DEX；读取链上 DEX 上的代币市场数据、资金池流动性和 OHLCV 价格历史记录。                                                             |
| [PaySafe](https://paysafe-agent.com) |前 100 次 API 调用免费 |基于 x402 的防火墙，具有用于提示注入检测的自动来源标记。                                                                                            || [Privy](/oss/python/integrations/tools/privy) |免费|创建具有可配置权限的钱包并快速执行交易。                                                                                                   |
| [Toolstem](https://toolstem.com) | \$0.01 USDC/看涨期权 (x402) |金融情报和 SEC EDGAR 工具，在 Base 上提供按次付费 x402 小额支付。                                                                                            |
| [Uniswap V2](https://github.com/Conrad-sudo/langchain-uniswap-v2) |免费|获取实时 Uniswap V2 互换报价，并在任何 EVM 链上准备未签名的互换、批准和流动性交易。                                                            |
| [ERC20](https://github.com/Conrad-sudo/langchain-erc20) |免费|读取 ERC20 余额、配额和元数据，并准备传输、批准和本机包装/解开，作为任何 EVM 链上 EOA 或智能合约钱包的执行计划。 |

## AI 工作流程优化

以下工具通过减少令牌使用和执行结构化 SOP 来优化 AI 代理工作流程：|工具/工具包 |定价|主要特点|
| ------------------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| [HuangtingFlux](https://huangtingflux.com/integrations/langchain) |免费（公共 MCP 服务器）|通过 3 阶段 SOP 减少 40% 的令牌：输入压缩、滚动汇总、输出细化 |
| [ZeroGPU](https://docs.zerogpu.ai) |基于使用 |将分类、摘要、提取和 PII 编辑卸载到专门构建的小型模型 |

## 集成平台

以下平台通过统一的界面提供对多种工具和服务的访问：|工具/工具包 |集成数量 |定价|主要特点|
| -------------------------------------------------------------------- | ---------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| [Composio](/oss/python/integrations/tools/composio) | 500+ |免费套餐可用 | OAuth 处理、事件驱动的工作流程、多用户支持 |
| [Scalekit](https://docs.scalekit.com/agentkit/overview/) | 80+ |免费套餐可用 |委托 OAuth、令牌库、多用户支持、LangSmith 跟踪 |

## 安全

下表显示了可用于安全相关任务的工具：|工具/工具包 |定价|能力|
| --------------------------------------------------------------------------- | ------------------------ | | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [URLCheck](https://urlcheck.dev) |每天 100 个免费请求 |在代理导航之前验证 URL 安全性。支持可选的意图感知风险分析。返回可操作的访问指令 (ALLOW/DENY/RETRY\_LATER)。                                |
| [Bidda](https://bidda.com/developers) |免费探索层 |通过主要来源引用进行来源验证的监管和合规情报查找。                                                                                            || [AI Identity](https://ai-identity.co/docs) |免费套餐可用 |每个代理的加密 API 密钥、范围内的策略实施以及通过工具和 LLM 调用前面的网关进行防篡改的审核日志记录。                                            |
| [Aidress](https://aidress.ai) |提供免费无钥匙套餐 |在委派工作或转移价值之前，验证对方代理的信任评分、能力和交易历史记录。通过能力发现，加上不记名密钥的发行和轮换。 |
| [RelayShield](https://api.relayshield.net/developers) |付费|在执行高影响力的代理操作之前，对 MCP 服务器注册表风险和提示注入违规进行检查。                                                                                           |
| [SidClaw](https://docs.sidclaw.com/docs/integrations/langchain) |提供免费托管套餐 | LangChain 工具调用的策略评估、人工审批工作流程和防篡改审计跟踪。                                                                                  || [Tonic Textual](https://textual.tonic.ai) |需要帐号 |检测、提取、合成或标记文本、JSON、HTML 和文件中的 PII。                                                                                                            |

## 所有工具和工具包

<div>
  |整合|下载 |
  | :---------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T0⟧](/oss/python/integrations/tools/google_imagen) | <span><a href="https://pypi.org/project/langchain-google-vertexai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T1⟧](/oss/python/integrations/tools/bedrock_agentcore_browser) | <span><a href="https://pypi.org/project/langchain-aws/"><img alt="Downloads per month" /></a></span>|
  | [⟦T2⟧](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | <span><a href="https://pypi.org/project/langchain-aws/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T3⟧](/oss/python/integrations/tools/google_gmail) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|| [⟦T4⟧](/oss/python/integrations/tools/google_calendar) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T5⟧](/oss/python/integrations/tools/google_cloud_texttospeech) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T6⟧](/oss/python/integrations/tools/google_search) | <span><a href="https://pypi.org/project/langchain-google-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T7⟧](/oss/python/integrations/tools/databricks) | <span><a href="https://pypi.org/project/databricks-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T8⟧](/oss/python/integrations/tools/azure_logic_apps) | <span><a href="https://pypi.org/project/langchain-azure-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T9⟧](/oss/python/integrations/tools/azure_ai) | <span><a href="https://pypi.org/project/langchain-azure-ai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T10⟧](/oss/python/integrations/tools/azure_ai_services) | <span><a href="https://pypi.org/project/langchain-azure-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T11⟧](/oss/python/integrations/tools/tavily_crawl) | <span><a href="https://pypi.org/project/langchain-tavily/"><img alt="Downloads per month" /></a></span>|
  | [⟦T12⟧](/oss/python/integrations/tools/tavily_extract) | <span><a href="https://pypi.org/project/langchain-tavily/"><img alt="Downloads per month" /></a></span>|
  | [⟦T13⟧](/oss/python/integrations/tools/tavily_map) | <span><a href="https://pypi.org/project/langchain-tavily/"><img alt="Downloads per month" /></a></span>|
  | [⟦T14⟧](/oss/python/integrations/tools/tavily_search) | <span><a href="https://pypi.org/project/langchain-tavily/"><img alt="Downloads per month" /></a></span>|
  | [⟦T15⟧](/oss/python/integrations/tools/ibm_watsonx_sql) | <span><a href="https://pypi.org/project/langchain-ibm/"><img alt="Downloads per month" /></a></span>|| [⟦T16⟧](/oss/python/integrations/tools/ibm_watsonx) | <span><a href="https://pypi.org/project/langchain-ibm/"><img alt="Downloads per month" /></a></span>|
  | [⟦T17⟧](/oss/python/integrations/tools/perplexity_search) | <span><a href="https://pypi.org/project/langchain-perplexity/"><img alt="Downloads per month" /></a></span> |
  | [⟦T18⟧](/oss/python/integrations/tools/composio) | <span><a href="https://pypi.org/project/composio-langchain/"><img alt="Downloads per month" /></a></span> |
  | [⟦T19⟧](/oss/python/integrations/tools/exa_search) | <span><a href="https://pypi.org/project/langchain-exa/"><img alt="Downloads per month" /></a></span> |
  | [⟦T20⟧](/oss/python/integrations/tools/oracleai) | <span><a href="https://pypi.org/project/langchain-oracledb/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T21⟧](/oss/python/integrations/tools/azure_dynamic_sessions) | <span><a href="https://pypi.org/project/langchain-azure-dynamic-sessions/"><img alt="Downloads per month" /></a></span> |
  | [⟦T22⟧](/oss/python/integrations/tools/upstage_groundedness_check) | <span><a href="https://pypi.org/project/langchain-upstage/"><img alt="Downloads per month" /></a></span>|
  | [⟦T23⟧](https://docs.scalekit.com/agentkit/overview/) | <span><a href="https://pypi.org/project/scalekit-sdk-python/"><img alt="Downloads per month" /></a></span>|
  | [⟦T24⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | <span><a href="https://pypi.org/project/m3-memory/"><img alt="Downloads per month" /></a></span>|
  | [⟦T25⟧](https://docs.apify.com/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-apify/"><img alt="Downloads per month" /></a></span> |
  | [⟦T26⟧](https://github.com/ScrapeGraphAI/langchain-scrapegraph) | <span><a href="https://pypi.org/project/langchain-scrapegraph/"><img alt="Downloads per month" /></a></span>|| [⟦T27⟧](https://github.com/memgraph/langchain-memgraph) | <span><a href="https://pypi.org/project/langchain-memgraph/"><img alt="Downloads per month" /></a></span> |
  | [⟦T28⟧](/oss/python/integrations/tools/mcp_toolbox) | <span><a href="https://pypi.org/project/toolbox-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T29⟧](https://docs.brightdata.com/scraping-automation/serp-api/introduction) | <span><a href="https://pypi.org/project/langchain-brightdata/"><img alt="Downloads per month" /></a></span> |
  | [⟦T30⟧](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) | <span><a href="https://pypi.org/project/langchain-brightdata/"><img alt="Downloads per month" /></a></span>|
  | [⟦T31⟧](https://github.com/luminati-io/langchain-brightdata) | <span><a href="https://pypi.org/project/langchain-brightdata/"><img alt="Downloads per month" /></a></span> |
  | [⟦T32⟧](https://adeu.ai) | <span><a href="https://pypi.org/project/langchain-adeu/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T33⟧](https://e2a.dev) | <span><a href="https://pypi.org/project/e2a/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T34⟧](/oss/python/integrations/tools/stripe) | <span><a href="https://pypi.org/project/stripe-agent-toolkit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T35⟧](/oss/python/integrations/tools/parallel_extract) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span> |
  | [⟦T36⟧](/oss/python/integrations/tools/parallel_findall) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](/oss/python/integrations/tools/parallel_monitor) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span>|| [⟦T38⟧](/oss/python/integrations/tools/parallel_search) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](/oss/python/integrations/tools/parallel_task) | <span><a href="https://pypi.org/project/langchain-parallel/"><img alt="Downloads per month" /></a></span> |
  | [⟦T40⟧](/oss/python/integrations/tools/google_drive) | <span><a href="https://pypi.org/project/langchain-googledrive/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T41⟧](https://github.com/LinkupPlatform/langchain-linkup) | <span><a href="https://pypi.org/project/langchain-linkup/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T42⟧](https://madeonsol.com/api-docs) | <span><a href="https://pypi.org/project/madeonsol-x402/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T43⟧](https://github.com/Shikenso-Analytics/langchain-taiga) | <span><a href="https://pypi.org/project/langchain-taiga/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T44⟧](/oss/python/integrations/tools/cdp_agentkit) | <span><a href="https://pypi.org/project/coinbase-agentkit-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T45⟧](https://pypi.org/project/langchain-compass/) | <span><a href="https://pypi.org/project/langchain-compass/"><img alt="Downloads per month" /></a></span> |
  | [⟦T46⟧](https://scavio.dev/docs/langchain) | <span><a href="https://pypi.org/project/langchain-scavio/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T47⟧](https://dev.writer.com/home/introduction) | <span><a href="https://pypi.org/project/langchain-writer/"><img alt="Downloads per month" /></a></span>|| [⟦T48⟧](https://docs.hindsight.vectorize.io/sdks/integrations/langgraph) | <span><a href="https://pypi.org/project/hindsight-langgraph/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T49⟧](https://www.lians.ai) | <span><a href="https://pypi.org/project/lians-sdk/"><img alt="Downloads per month" /></a></span> |
  | [⟦T50⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | <span><a href="https://pypi.org/project/langchain-nimble/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T51⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | <span><a href="https://pypi.org/project/langchain-nimble/"><img alt="Downloads per month" /></a></span> |
  | [⟦T52⟧](https://replylayer.ai/docs/guides/langchain) | <span><a href="https://pypi.org/project/langchain-replylayer/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T53⟧](https://you.com/docs/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-youdotcom/"><img alt="Downloads per month" /></a></span>|
  | [⟦T54⟧](https://github.com/ADS4GPTs/ads4gpts) | <span><a href="https://pypi.org/project/ads4gpts-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T55⟧](https://crustapi.com/docs) | <span><a href="https://pypi.org/project/langchain-crustapi/"><img alt="Downloads per month" /></a></span> |
  | [⟦T56⟧](https://github.com/daytonaio/daytona) | <span><a href="https://pypi.org/project/langchain-daytona-data-analysis/"><img alt="Downloads per month" /></a></span>|
  | [⟦T57⟧](https://omfang.io/manifest-docs) | <span><a href="https://pypi.org/project/manifest-api/"><img alt="Downloads per month" /></a></span>|| [⟦T58⟧](https://docs.proxyhat.com) | <span><a href="https://pypi.org/project/langchain-proxyhat/"><img alt="Downloads per month" /></a></span>|
  | [⟦T59⟧](https://github.com/colesmcintosh/langchain-salesforce) | <span><a href="https://pypi.org/project/langchain-salesforce/"><img alt="Downloads per month" /></a></span> |
  | [⟦T60⟧](https://serpdive.com/docs) | <span><a href="https://pypi.org/project/langchain-serpdive/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T61⟧](https://opedd.com/for-ai-agents) | <span><a href="https://pypi.org/project/langchain-opedd/"><img alt="Downloads per month" /></a></span> |
  | [⟦T62⟧](https://docs.spidra.io) | <span><a href="https://pypi.org/project/langchain-spidra/"><img alt="Downloads per month" /></a></span>|
  | [⟦T63⟧](https://github.com/Conrad-sudo/langchain-uniswap-v2) | <span><a href="https://pypi.org/project/langchain-uniswap-v2/"><img alt="Downloads per month" /></a></span>|
  | [⟦T64⟧](https://langchain-prolog.readthedocs.io/en/stable/) | <span><a href="https://pypi.org/project/langchain-prolog/"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](https://lumify.ai/docs/ai) | <span><a href="https://pypi.org/project/langchain-lumify/"><img alt="Downloads per month" /></a></span> |
  | [⟦T66⟧](https://api.relayshield.net/developers) | <span><a href="https://pypi.org/project/langchain-relayshield/"><img alt="Downloads per month" /></a></span>|| [⟦T67⟧](https://aidress.ai) | <span><a href="https://pypi.org/project/langchain-aidress/"><img alt="Downloads per month" /></a></span> |
  | [⟦T68⟧](https://github.com/robocorp/robocorp) | <span><a href="https://pypi.org/project/langchain-robocorp/"><img alt="Downloads per month" /></a></span>|
  | [⟦T69⟧](https://docs.ampersend.ai) | <span><a href="https://pypi.org/project/langchain-ampersend/"><img alt="Downloads per month" /></a></span> |
  | [⟦T70⟧](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) | <span><a href="https://pypi.org/project/serpapi-search-tools/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T71⟧](https://docs.zerogpu.ai) | <span><a href="https://pypi.org/project/langchain-zerogpu/"><img alt="Downloads per month" /></a></span>|
  | [⟦T72⟧](https://mixpeek.com/docs/agent-integrations/langchain) | <span><a href="https://pypi.org/project/langchain-mixpeek/"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](https://optionsahoy.com/for-agents) | <span><a href="https://pypi.org/project/optionsahoy-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T74⟧](https://github.com/Perseus-Computing-LLC/langchain-perseus-vault) | <span><a href="https://pypi.org/project/langchain-perseus-vault/"><img alt="Downloads per month" /></a></span>|
  | [⟦T75⟧](https://ilovevideoeditor.com/docs/api-guide) | <span><a href="https://pypi.org/project/langchain-ilovevideoeditor/"><img alt="Downloads per month" /></a></span>|
  | [⟦T76⟧](https://bidda.com/developers) | <span><a href="https://pypi.org/project/langchain-bidda/"><img alt="Downloads per month" /></a></span>|| [⟦T77⟧](https://paysafe-agent.com) | <span><a href="https://pypi.org/project/langchain-paysafe/"><img alt="Downloads per month" /></a></span>|
  | [⟦T78⟧](https://github.com/oxylabs/langchain-oxylabs) | <span><a href="https://pypi.org/project/langchain-oxylabs/"><img alt="Downloads per month" /></a></span> |
  | [⟦T79⟧](https://docs.dexpaprika.com) | <span><a href="https://pypi.org/project/langchain-dexpaprika/"><img alt="Downloads per month" /></a></span>|
  | [⟦T80⟧](https://www.agentfetch.dev) | <span><a href="https://pypi.org/project/langchain-agentfetch/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T81⟧](https://flowspeech.io/docs) | <span><a href="https://pypi.org/project/langchain-flowspeech/"><img alt="Downloads per month" /></a></span>|
  | [⟦T82⟧](https://querit.com/docs) | <span><a href="https://pypi.org/project/langchain-querit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T83⟧](https://www.hyperbrowser.ai/docs/home) | <span><a href="https://pypi.org/project/langchain-hyperbrowser/"><img alt="Downloads per month" /></a></span>|
  | [⟦T84⟧](https://www.hyperbrowser.ai/docs/home) | <span><a href="https://pypi.org/project/langchain-hyperbrowser/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T85⟧](https://www.clawmessenger.com/blog/langchain-imessage-integration) | <span><a href="https://pypi.org/project/langchain-claw-messenger/"><img alt="Downloads per month" /></a></span>|
  | [⟦T86⟧](https://www.search1api.com/docs/integrations/langchain) | <span><a href="https://pypi.org/project/search1api-langchain/"><img alt="Downloads per month" /></a></span>|| [⟦T87⟧](https://docs.talordata.com) | <span><a href="https://pypi.org/project/langchain-talordata/"><img alt="Downloads per month" /></a></span>|
  | [⟦T88⟧](https://github.com/aproxpay/langchain-aproxpay) | <span><a href="https://pypi.org/project/langchain-aproxpay/"><img alt="Downloads per month" /></a></span>|
  | [⟦T89⟧](https://www.maximem.ai/) | <span><a href="https://pypi.org/project/maximem-synap-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T90⟧](https://docs.livetennisapi.com) | <span><a href="https://pypi.org/project/langchain-livetennis/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T91⟧](https://docs.lakesail.com/sail/main/guide/integrations/langchain/) | <span><a href="https://pypi.org/project/langchain-sail/"><img alt="Downloads per month" /></a></span>|
  | [⟦T92⟧](https://anakin.io/docs/documentation) | <span><a href="https://pypi.org/project/langchain-anakin/"><img alt="Downloads per month" /></a></span>|
  | [⟦T93⟧](https://github.com/EXboys/langchain-skilllite) | <span><a href="https://pypi.org/project/langchain-skilllite/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T94⟧](/oss/python/integrations/tools/unstructured_transform) | <span><a href="https://pypi.org/project/langchain-unstructured-transform/"><img alt="Downloads per month" /></a></span>|
  | [⟦T95⟧](https://github.com/sriram7737/pramagent) | <span><a href="https://pypi.org/project/pramagent/"><img alt="Downloads per month" /></a></span>|
  | [⟦T96⟧](https://docs.anchorbrowser.io/introduction)​​ | <span><a href="https://pypi.org/project/langchain-anchorbrowser/"><img alt="Downloads per month" /></a></span> || [⟦T97⟧](https://docs.valyu.ai/home) | <span><a href="https://pypi.org/project/langchain-valyu/"><img alt="Downloads per month" /></a></span> |
  | [⟦T98⟧](https://docs.mrscraper.com) | <span><a href="https://pypi.org/project/langchain-mrscraper/"><img alt="Downloads per month" /></a></span>|
  | [⟦T99⟧](https://github.com/fidacy/fidacy-open) | <span><a href="https://pypi.org/project/langchain-fidacy/"><img alt="Downloads per month" /></a></span> |
  | [⟦T100⟧](https://github.com/TheSuperColony/langchain-supercolony) | <span><a href="https://pypi.org/project/langchain-supercolony/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T101⟧](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) | <span><a href="https://pypi.org/project/nodeproxy-tools/"><img alt="Downloads per month" /></a></span> |
  | [⟦T102⟧](https://docs.scraperapi.com/) | <span><a href="https://pypi.org/project/langchain-scraperapi/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T103⟧](https://github.com/Conrad-sudo/langchain-erc20) | <span><a href="https://pypi.org/project/langchain-erc20/"><img alt="Downloads per month" /></a></span>|
  | [⟦T104⟧](https://github.com/e7217/langchain-naver-community) | <span><a href="https://pypi.org/project/langchain-naver-community/"><img alt="Downloads per month" /></a></span>|
  | [⟦T105⟧](https://www.newscatcherapi.com/docs/web-search-api/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-catchall/"><img alt="Downloads per month" /></a></span>|
  | [⟦T106⟧](/oss/python/integrations/tools/discord) | <span><a href="https://pypi.org/project/langchain-discord/"><img alt="Downloads per month" /></a></span>|| [⟦T107⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | <span><a href="https://pypi.org/project/langchain-polaris/"><img alt="Downloads per month" /></a></span>|
  | [⟦T108⟧](https://strale.dev/docs) | <span><a href="https://pypi.org/project/langchain-strale/"><img alt="Downloads per month" /></a></span> |
  | [⟦T109⟧](https://docs.dappier.com/) | <span><a href="https://pypi.org/project/langchain-dappier/"><img alt="Downloads per month" /></a></span> |
  | [⟦T110⟧](/oss/python/integrations/tools/tableau) | <span><a href="https://pypi.org/project/langchain-tableau/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T111⟧](https://github.com/mavdol/langchain-capsule) | <span><a href="https://pypi.org/project/langchain-capsule/"><img alt="Downloads per month" /></a></span>|
  | [⟦T112⟧](https://docs.keenable.ai) | <span><a href="https://pypi.org/project/langchain-keenable/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T113⟧](https://github.com/dong7812/dompruner-py) | <span><a href="https://pypi.org/project/dompruner/"><img alt="Downloads per month" /></a></span>|
  | [⟦T114⟧](https://www.agentrails.io/docs) | <span><a href="https://pypi.org/project/langchain-x402/"><img alt="Downloads per month" /></a></span>|
  | [⟦T115⟧](https://axiora.dev/docs) | <span><a href="https://pypi.org/project/langchain-axiora/"><img alt="Downloads per month" /></a></span>|| [⟦T116⟧](https://cloro.dev/docs/) | <span><a href="https://pypi.org/project/langchain-cloro/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T117⟧](https://pinchwork.dev) | <span><a href="https://pypi.org/project/pinchwork/"><img alt="Downloads per month" /></a></span>|
  | [⟦T118⟧](https://github.com/MehdiZare/langchain-fmp-data) | <span><a href="https://pypi.org/project/langchain-fmp-data/"><img alt="Downloads per month" /></a></span>|
  | [⟦T119⟧](https://www.xpoz.ai/docs) | <span><a href="https://pypi.org/project/langchain-xpoz/"><img alt="Downloads per month" /></a></span>|
  | [⟦T120⟧](https://docs.yutori.com) | <span><a href="https://pypi.org/project/langchain-yutori/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T121⟧](https://github.com/authzed/langchain-spicedb) | <span><a href="https://pypi.org/project/langchain-spicedb/"><img alt="Downloads per month" /></a></span> |
  | [⟦T122⟧](https://textual.tonic.ai) | <span><a href="https://pypi.org/project/langchain-textual/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T123⟧](https://docs.agentql.com/home) | <span><a href="https://pypi.org/project/langchain-agentql/"><img alt="Downloads per month" /></a></span>|
  | [⟦T124⟧](https://github.com/valthera/langchain-valthera) | <span><a href="https://pypi.org/project/langchain-valthera/"> <img alt="Downloads per month" /></a></span> || [⟦T125⟧](https://docs.firecrawl.dev) | <span><a href="https://pypi.org/project/langchain-firecrawl/"><img alt="Downloads per month" /></a></span>|
  | [⟦T126⟧](https://synmerco.com/docs) | <span><a href="https://pypi.org/project/synmerco-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T127⟧](/oss/python/integrations/tools/privy) | <span><a href="https://pypi.org/project/langchain-privy/"><img alt="Downloads per month" /></a></span>|
  | [⟦T128⟧](https://skim402.com/docs) | <span><a href="https://pypi.org/project/langchain-skim/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T129⟧](https://github.com/Amitgb14/langchain_jenkins) | <span><a href="https://pypi.org/project/langchain-jenkins/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T130⟧](https://serpex.dev/docs) | <span><a href="https://pypi.org/project/langchain-serpex-python/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T131⟧](https://github.com/Scottcjn/langchain-rustchain) | <span><a href="https://pypi.org/project/langchain-rustchain-tools/"><img alt="Downloads per month" /></a></span>|
  | [⟦T132⟧](https://github.com/permitio/langchain-permit) | <span><a href="https://pypi.org/project/langchain-permit/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T133⟧](https://docs.ipay.sh) | <span><a href="https://pypi.org/project/langchain-pr402/"> <img alt="Downloads per month" /></a></span> || [⟦T134⟧](https://platform.iflow.cn/) | <span><a href="https://pypi.org/project/iflow-search-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T135⟧](https://docs.opengradient.ai/) | <span><a href="https://pypi.org/project/langchain-opengradient/"><img alt="Downloads per month" /></a></span> |
  | [⟦T136⟧](https://docs.blindfold.dev) | <span><a href="https://pypi.org/project/langchain-blindfold/"><img alt="Downloads per month" /></a></span>|
  | [⟦T137⟧](https://github.com/vectara/langchain-vectara) | <span><a href="https://pypi.org/project/langchain-vectara/"><img alt="Downloads per month" /></a></span>|
  | [⟦T138⟧](https://w2a-protocol.org/) | <span><a href="https://pypi.org/project/langchain-w2a/"><img alt="Downloads per month" /></a></span> |
  | [⟦T139⟧](https://selfheal.dev/docs) | <span><a href="https://pypi.org/project/graceful-fail/"><img alt="Downloads per month" /></a></span> |
  | [⟦T140⟧](https://hashlock.markets/docs) | <span><a href="https://pypi.org/project/langchain-hashlock/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T141⟧](https://agenticemail.dev/docs) | <span><a href="https://pypi.org/project/langchain-agenticemail/"><img alt="Downloads per month" /></a></span>|
  | [⟦T142⟧](https://github.com/meetdewey/langchain-dewey) | <span><a href="https://pypi.org/project/langchain-dewey/"> <img alt="Downloads per month" /></a></span> || [⟦T143⟧](https://docs.octen.ai) | <span><a href="https://pypi.org/project/langchain-octen/"><img alt="Downloads per month" /></a></span>|
  | [⟦T144⟧](https://kerq.dev/docs) | <span><a href="https://pypi.org/project/langchain-kerq/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T145⟧](https://instanode.dev/docs) | <span><a href="https://pypi.org/project/langchain-instanode/"><img alt="Downloads per month" /></a></span>|
  | [⟦T146⟧](https://github.com/stardog-union/stardog-langchain) | <span><a href="https://pypi.org/project/langchain-stardog/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T147⟧](https://crawleo.dev/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-crawleo/"><img alt="Downloads per month" /></a></span>|
  | [⟦T148⟧](https://crawleo.dev/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-crawleo/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T149⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span> |
  | [⟦T150⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T151⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|| [⟦T152⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T153⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T154⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T155⟧](https://github.com/diffbot/langchain-diffbot) | <span><a href="https://pypi.org/project/langchain-diffbot/"><img alt="Downloads per month" /></a></span>|
  | [⟦T156⟧](https://docs.sidclaw.com/docs/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-sidclaw/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T157⟧](https://cosmergon.com) | <span><a href="https://pypi.org/project/langchain-cosmergon/"><img alt="Downloads per month" /></a></span>|
  | [⟦T158⟧](https://modexia.software/docs) | <span><a href="https://pypi.org/project/langchain-modexia/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T159⟧](https://preclick.ai/) | <span><a href="https://pypi.org/project/langchain-urlcheck/"><img alt="Downloads per month" /></a></span>|
  | [⟦T160⟧](https://www.searchapi.io/docs/google) | <span><a href="https://pypi.org/project/langchain-searchapi/"> <img alt="Downloads per month" /></a></span> || [⟦T161⟧](https://synoppy.com/docs) | <span><a href="https://pypi.org/project/langchain-synoppy/"><img alt="Downloads per month" /></a></span>|
  | [⟦T162⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T163⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|
  | [⟦T164⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|
  | [⟦T165⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|
  | [⟦T166⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|
  | [⟦T167⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|
  | [⟦T168⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T169⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span> |
  | [⟦T170⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T171⟧](https://www.scrapingbee.com/documentation/langchain/) | <span><a href="https://pypi.org/project/langchain-scrapingbee/"><img alt="Downloads per month" /></a></span>|| [⟦T172⟧](https://hlido.eu/docs/) | <span><a href="https://pypi.org/project/hlido-trust/"> <img alt="Downloads per month" />⟦T1384​​⟧</span> |
  | [⟦T173⟧](https://sibfly.com) | <span><a href="https://pypi.org/project/langchain-sibfly/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T174⟧](https://docs.agentline.cloud/introduction) | <span><a href="https://pypi.org/project/langchain-agentline/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T175⟧](https://docs.agentmail.to/welcome) | <span><a href="https://pypi.org/project/langchain-agentmail/"><img alt="Downloads per month" /></a></span>|
  | [⟦T176⟧](https://docs.agentphone.ai/welcome) | <span><a href="https://pypi.org/project/langchain-agentphone/"><img alt="Downloads per month" /></a></span>|
  | [⟦T177⟧](https://toolstem.com) | <span><a href="https://pypi.org/project/langchain-toolstem/"><img alt="Downloads per month" /></a></span>|
  | [⟦T178⟧](https://github.com/nozomio-labs/nia-langchain) | <span><a href="https://pypi.org/project/langchain-nia/"><img alt="Downloads per month" /></a></span>|
  | [⟦T179⟧](https://goodsender.com/docs) | <span><a href="https://pypi.org/project/langchain-goodsender/"><img alt="Downloads per month" /></a></span>|
  | [⟦T180⟧](https://verifly.email/docs) | <span><a href="https://pypi.org/project/langchain-verifly/"> <img alt="Downloads per month" /></a></span> || [⟦T181⟧](https://signatrust.net/docs/api) | <span><a href="https://pypi.org/project/langchain-signatrust/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T182⟧](https://docs.igpt.ai/docs/api-reference/ask) | <span><a href="https://pypi.org/project/langchain-igpt/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T183⟧](https://docs.igpt.ai/docs/api-reference/search) | <span><a href="https://pypi.org/project/langchain-igpt/"><img alt="Downloads per month" /></a></span>|
  | [⟦T184⟧](https://snap-render.com) | <span><a href="https://pypi.org/project/langchain-snaprender/"><img alt="Downloads per month" /></a></span>|
  | [⟦T185⟧](https://tempguru.co/ai-agents) | <span><a href="https://pypi.org/project/tempguru/"><img alt="Downloads per month" /></a></span>|
  | [⟦T186⟧](https://github.com/tilotech/tilores-langchain) | <span><a href="https://pypi.org/project/tilores-langchain/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T187⟧](https://proxyclaw.ai/docs) | <span><a href="https://pypi.org/project/langchain-proxyclaw/"><img alt="Downloads per month" /></a></span>|
  | [⟦T188⟧](https://github.com/flipcoin-fun/flipcoin-langchain) | <span><a href="https://pypi.org/project/langchain-flipcoin/"><img alt="Downloads per month" /></a></span>|
  | [⟦T189⟧](https://ceki.me) | <span><a href="https://pypi.org/project/langchain-ceki/"><img alt="Downloads per month" /></a></span> || [⟦T190⟧](https://docs.delegare.dev/introduction) | <span><a href="https://pypi.org/project/langchain-delegare/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T191⟧](https://docs.goodmem.ai) | <span><a href="https://pypi.org/project/langchain-goodmem/"><img alt="Downloads per month" /></a></span>|
  | [⟦T192⟧](https://github.com/Keirolabs-API/langchain-keiro) | <span><a href="https://pypi.org/project/langchain-keiro/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T193⟧](https://github.com/drasi-project/langchain-drasi) | <span><a href="https://pypi.org/project/langchain-drasi/"><img alt="Downloads per month" /></a></span>|
  | [⟦T194⟧](https://unirateapi.com) | <span><a href="https://pypi.org/project/langchain-unirate/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T195⟧](https://ai-identity.co/docs) | <span><a href="https://pypi.org/project/langchain-ai-identity/"><img alt="Downloads per month" /></a></span> |
  | [⟦T196⟧](https://docs.camb.ai/introduction) | <span><a href="https://pypi.org/project/langchain-camb/"><img alt="Downloads per month" /></a></span>|
  | [⟦T197⟧](https://docs.bodo.ai/) | <span><a href="https://pypi.org/project/langchain-bodo/"><img alt="Downloads per month" /></a></span>|
  | [⟦T198⟧](https://github.com/synapsoft-DA/langchain-synapsoft) | <span><a href="https://pypi.org/project/langchain-synapsoft/"> <img alt="Downloads per month" /></a></span> || [⟦T199⟧](https://muapi.ai/docs/introduction) | <span><a href="https://pypi.org/project/muapi-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T200⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | <span><a href="https://pypi.org/project/langchain-scrapeless/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T201⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | <span><a href="https://pypi.org/project/langchain-scrapeless/"><img alt="Downloads per month" /></a></span>|
  | [⟦T202⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | <span><a href="https://pypi.org/project/langchain-scrapeless/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T203⟧](https://dynamicfeed.ai/integrations) | <span><a href="https://pypi.org/project/dynamicfeed-tools/"><img alt="Downloads per month" /></a></span>|
  | [⟦T204⟧](https://lex-mex.xyz) | <span><a href="https://pypi.org/project/langchain-lexmex/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T205⟧](https://agentlair.dev/docs) | <span>不适用</span> |
  | [⟦T206⟧](https://browserless.io) | <span>不适用</span> || [⟦T207⟧](https://huangtingflux.com/integrations/langchain) | <span>不适用</span> |

  \| [⟦T208⟧](https://agentram.dev/langchain-agent-memory-tutorial.html) | <span><a href="https://pypi.org/project/langgraph-agentram/"><img alt="Downloads per month" /></a></span>|
  \| [⟦T209⟧](https://docs.1claw.xyz/docs/integrations/langchain) | <span><a href="https://pypi.org/project/langchain-1claw/"> <img alt="Downloads per month" /></a></span> |
  \| [⟦T210⟧](https://useagentgate.com/docs) | <span><a href="https://pypi.org/project/langchain-agentgate/"><img alt="Downloads per month" /></a></span>|
</div>

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>