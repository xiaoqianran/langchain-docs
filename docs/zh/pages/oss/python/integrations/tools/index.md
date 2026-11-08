<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool integrations | https://docs.langchain.com/oss/python/integrations/tools/index -->

# 工具集成

使用 LangChain Python 与工具集成。

[Tools](/oss/python/langchain/tools) 是设计为由模型调用的实用程序：它们的输入被设计为由模型生成，其输出被设计为传递回模型。

工具包是要一起使用的工具的集合。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

## 搜索

下表显示了以某种形式执行在线搜索的工具：|工具/工具包 |免费/付费|返回数据 |
| - | - | - |
| [Amazon Bedrock AgentCore Web Search](/oss/python/integrations/tools/bedrock_agentcore_web_search) |按使用付费 (AWS) |标题、URL、发布日期、摘录 |
| [BrightData SERP](https://docs.brightdata.com/scraping-automation/serp-api/introduction) |按成功请求付费 | URL、摘要、标题、搜索排名 |
| [cloro](https://cloro.dev/docs) |每月 500 个免费积分，无卡 | URL、片段、标题、答案 |
| [ContextSearch](https://docs.context.dev) |免费套餐可用 | URL、标题、描述、页面内容 |
| [Crawleo](https://crawleo.dev/integrations/langchain) |付费| URL、片段、副驾驶答案、侧边栏、标题、发布日期、站点链接、页面内容 |
| [CrustAPI](https://crustapi.com/docs) |每月 3,000 个免费积分，无卡 | URL、标题、摘要、地图、新闻、购物、图像、视频、地点、学者、专利、LinkedIn |
| [Diffbot](https://github.com/diffbot/langchain-diffbot) |免费| URL、片段、标题、日期、知识图（组织、新闻、人物、地点、交易）|
| [Exa Search](/oss/python/integrations/tools/exa_search) |每月 1000 次免费搜索 |网址、作者、标题、发布日期 |
| [Firecrawl Search](https://docs.firecrawl.dev/integrations/langchain) |每月 1,000 个免费积分 | URL、标题、描述、日期、新闻、图像 |
| [Google Search](/oss/python/integrations/tools/google_search) |付费| URL、片段、标题 |
| [iFlow Search](https://platform.iflow.cn/) |付费| URL、标题、摘要、日期 |
| [Keenable](https://docs.keenable.ai/integrations/langchain) |提供免费无钥匙套餐 |标题、URL、摘要（页面文本）、发布日期、索引日期；用于获取的页面降价|
| [Linkup Search](https://github.com/LinkupPlatform/langchain-linkup) |每月 2000 次免费搜索 |网址、内容、来源 || [Octen](https://docs.octen.ai) |付费|标题、URL、突出显示、作者、时间\_published |
| [Mixpeek](https://docs.mixpeek.com/agent-integrations/langchain) |免费套餐可用 |多模态搜索结果（视频、图像、音频、文档）|
| [Nia Toolkit](https://github.com/nozomio-labs/nia-langchain) |免费套餐可用 |代码、文档、元数据、来源 |
| [Nimble Search](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 |网址、内容、标题 |
| [Nimble Web Search Agents](https://docs.nimbleway.com/integrations/connectors/langchain#agent-api-v2-web-search-agents) |免费试用 |研究答案，来源|
| [Oxylabs Web API Search](https://github.com/oxylabs/langchain-oxylabs#web-api) |免费试用，然后按月计划 | URL、标题、片段 |
| [Parallel Search](/oss/python/integrations/tools/parallel_search) |付费|网址、标题、摘录 |
| [Perplexity Search](/oss/python/integrations/tools/perplexity_search) |付费（每月免费套餐）| URL、标题、摘要、日期、上次更新 |
| [Search1API Search](https://www.search1api.com/docs/integrations/langchain#search) |注册即可获得 100 个免费积分，无需信用卡 | URL、标题、片段、内容、图像 |
| [SearchApi](https://www.searchapi.io/docs/google) |每月 100 次免费搜索 | URL、片段、标题、答案框、知识图 |
| [Scavio](https://scavio.dev/docs/langchain) | 50 个免费积分即可开始 | URL、标题、片段、知识图、产品、视频、成绩单、社交帖子和个人资料、职位发布和薪资、房地产列表、旅行和酒店库存、应用程序商店列表、广告库创意、软件评论、本地业务数据、监管备案、提取的页面内容 |
| [TalorData SERP](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) |付费|标题、URL、摘要、位置、知识图谱、答案框、AI 概述 || [Tavily Search](/oss/python/integrations/tools/tavily_search) |每月 1000 次免费搜索 | URL、内容、标题、图像、答案 |
| [Webz News Search](https://docs.webz.io/docs/webz/news-search-api-mcp) |每月免费 5 美元（约 1,400 次搜索），然后即用即付 |标题、URL、主图像、发布日期、内容摘录、分数、情绪、主题、人物、组织、位置、股票代码、政治偏见、域名排名 |
| [Apify](https://docs.apify.com/integrations/langchain) |免费套餐，按次付费（因演员而异）| Actor 输出（因 Actor 而异）|
| [Xpoz](https://www.xpoz.ai/docs) |免费套餐可用 |帖子、用户个人资料、评论、参与度指标（Twitter/X、Instagram、Reddit、TikTok）|
| [You.com Search](https://you.com/docs/integrations/langchain) |注册时可获赠 100 美元积分 | URL、标题、页面内容 |
| [Querit](https://querit.com/docs) |注册后每月可免费搜索 1000 次 | URL、片段、标题、页面\_年龄、站点\_名称、站点\_图标 |
| [SerpApi Search Tools](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) |每月 250 次免费搜索 | URL、标题、摘要、答案框、知识图、AI 概述 |

## 代码解释器

下表显示了可用作代码解释器的工具：|工具/工具包 |支持的语言 |沙盒寿命 |支持文件上传 |返回类型 |支持自托管 |
| - | - | - | - | - | - |
| [Amazon Bedrock AgentCore Code Interpreter](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | Python、JavaScript、TypeScript |可配置（最长 8 小时）| ✅ |文本、图像、文件 | ❌ |
| [Azure Container Apps dynamic sessions](/oss/python/integrations/tools/azure_dynamic_sessions) |蟒蛇 | 1 小时 | ✅ |文字、图像 | ❌ |
| [Capsule Code Interpreter](https://github.com/mavdol/langchain-capsule) | Python、JavaScript |无状态或基于会话 | ✅（REPL 工具）|文字| ✅ |

## 生产力

下表显示了可用于在生产力工具中自动执行任务的工具：|工具/工具包 |定价|
| - | - |
| [Gmail Toolkit](/oss/python/integrations/tools/google_gmail) |免费，每个用户每秒的配额单位限制为 250 |
| [GoodSender Toolkit](https://goodsender.com/docs) |免费套餐（100,000 封电子邮件/月），无需信用卡 |
| [AgentLine Toolkit](https://docs.agentline.cloud) |一次性 2 美元/号码，每分钟通话 0.10 美元，即用即付 |
| [AgentMail Toolkit](https://docs.agentmail.to/) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentmail.to) |
| [AgenticEmail Toolkit](https://agenticemail.dev/docs) |免费套餐可用，之后有 [paid plans](https://agenticemail.dev/pricing) |
| [AgentPhone Toolkit](https://docs.agentphone.to) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentphone.to) |
| [e2a](https://e2a.dev) |免费套餐可用，之后有 [flat-rate paid plans](https://e2a.dev) |
| [Pidgeon Toolkit](https://pidgeon.ai/docs/langchain) |免费套餐（3 个收件箱，每月发送 3,000 封电子邮件），之后带有 [paid plans](https://pidgeon.ai/pricing) |
| [ReplyLayer Toolkit](https://replylayer.ai/docs/guides/langchain) |公测：免费沙盒试用，之后有[paid tiers](https://replylayer.ai/pricing) |
| [Verifly](https://verifly.email/docs) |免费套餐可用 |
| [Simplepages Toolkit](https://simplepages.ai/mcp) |可用免费层（草稿页），可通过 [paid plans](https://simplepages.ai/pricing) 发布 |

## 网页浏览

下表显示了可用于在 Web 浏览器中自动执行任务的工具：|工具/工具包 |定价|支持与浏览器交互 |
| - | - | - |
| [AgentQL Toolkit](https://docs.agentql.com/) |免费试用，之后可按量付费和统一费率计划 | ✅ |
| [Amazon Bedrock AgentCore Browser](/oss/python/integrations/tools/bedrock_agentcore_browser) |按使用付费 (AWS) | ✅ |
| [AproxPay](https://github.com/aproxpay/langchain-aproxpay) |通过 x402 按使用付费（USDC on Base）；没有注册 | ❌（获取 + CONNECT 会话通行证）|
| [Bowmark](https://bowmark.ai/docs/langchain) |免费 10 美元，然后按需付费 | ❌ |
| [BrightData Browser API](https://docs.brightdata.com/scraping-automation/scraping-browser/introduction) |即用即付，$2 试用积分 | ✅ |
| [BrightData Scraper Studio](https://docs.brightdata.com/datasets/scraper-studio/introduction) |每月 5,000 个免费积分，然后即用即付 | ❌ |
| [BrightData Unlocker](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) |按量付费 | ❌ |
| [BrightData Web Scraper API](https://docs.brightdata.com/datasets/scrapers/overview) |按量付费 | ❌ |
| [Browser Use](/oss/python/integrations/providers/browser_use) |按量付费 | ✅ |
| [Browserless](https://browserless.io) |免费套餐，之后提供基于使用的计划 | ✅ |
| [Context.dev](https://docs.context.dev) |免费套餐可用 | ❌ |
| [Stagehand](/oss/python/integrations/tools/stagehand) |开源/浏览器库按需付费 | ✅ |
| [Ceki](https://ceki.me) |自模式自由；市场 $0.01/分钟 USDC | ✅ |
| [ClawFetch](https://github.com/clawfetch/integrations#readme) |通过 x402 按次付费（USDC on Base，0.001 美元获取 0.02 美元研究）；没有注册 | ❌ |
| [Firecrawl](https://docs.firecrawl.dev) |免费套餐可用 | ❌ |
| [Hyperbrowser Browser Agent Tools](https://docs.hyperbrowser.ai/) |免费试用，享受固定费率计划和预付费积分 | ✅ |
| [Hyperbrowser Web Scraping Tools](https://docs.hyperbrowser.ai/) |免费试用，享受固定费率计划和预付费积分 | ❌ |
| [Manifest](https://omfang.io/manifest-docs) |免费套餐可用 | ❌ |
| [MrScraper](https://docs.mrscraper.com) |付费| ❌ |
| [W2A](https://w2a-protocol.org/docs) |免费（公共端点）| ❌ |
| [Nimble Extract](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 | ❌ || [Nimble Extract Templates](https://docs.nimbleway.com/integrations/connectors/langchain#extract-templates) |免费试用 | ❌ |
| [Nimble Crawl and Map](https://docs.nimbleway.com/integrations/connectors/langchain#crawl-and-map) |免费试用 | ❌ |
| [NodeProxy](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) |每次解析 $0.002 USDC（Base 上的 x402）| \~\$0.002 USDC ❌ |
| [Oxylabs Web API Scrape](https://github.com/oxylabs/langchain-oxylabs#web-api) |免费试用，然后按月计划 | ❌ |
| [Oxylabs Web Scraper API](https://github.com/oxylabs/langchain-oxylabs) |免费试用，享受固定费率计划和预付费积分 | ❌ |
| [ProxyClaw](https://proxyclaw.ai/docs) |免费套餐可用 | ❌ |
| [ProxyHat](https://docs.proxyhat.com) |付费| ❌ |
| [Skim](https://skim402.com/docs) |按次付费（在 Base 上以 USDC 读取 0.002 美元/次）| ❌ |
| [Search1API Crawl](https://www.search1api.com/docs/integrations/langchain#crawl) |注册即可获得 100 个免费积分，无需信用卡 | ❌ |
| [Spidra](https://docs.spidra.io) |免费试用 | ❌ |

## 数据库

下表显示了可用于自动执行数据库中的任务的工具：

|工具/工具包 |允许的操作 |
| - | - |
| [MCP Toolbox](/oss/python/integrations/tools/mcp_toolbox) |任何SQL操作|
| [Drasi Toolkit](https://github.com/drasi-project/langchain-drasi) |实时数据库变更检测|
| [Sail SQL Toolkit](https://docs.lakesail.com/sail/latest/guide/integrations/langchain.html) |针对 Sail (Spark Connect) 的 SQL 查询、架构列表和查询检查 |
| [Stardog](https://github.com/stardog-union/stardog-langchain) | SPARQL SELECT 和模式自省 |

## 金融

下表显示了可用于执行付款、购买等金融交易的工具：|工具/工具包 |定价|能力|
| - | - | - |
| [Ampersend](https://docs.ampersend.ai) |付费|通过自动 x402 付款处理来支付和使用远程 AI 代理服务。 |
| [Ausca](https://github.com/auscahq/ausca/tree/main/python/langchain-ausca) | 0.10 美元至 1.35 美元 USDC/看涨期权 (x402) |按每次调用支付文档 OCR、文档分析、媒体转录、浏览器会话和代理收件箱的费用，每次调用美元上限严格且没有 API 密钥；该工具工厂适用于任何 x402 v2 资源。 |
| [FlipCoin](https://github.com/flipcoin-fun/flipcoin-langchain) |免费|通过 LMSR AMM 或 CLOB 订单簿在预测市场上交易 YES/NO 股票。 |
| [LatAm Synth](https://github.com/jmendozapuche/langchain-latam-synth) | Apify 免费套餐，然后按使用付费 |为拉丁美洲金融科技应用程序生成隐私安全的综合金融用户、储蓄目标和交易。 |
| [Axiora](https://axiora.dev/docs) |免费 API 密钥 |来自 EDINET 文件、健康评分、筛查和英文文件翻译的日本上市公司财务数据。 |
| [Delegare](https://docs.delegare.dev) |付费|通过具有内置预算护栏的 AP2 指令授权和执行多轨支付。 |
| [DexPaprika](https://docs.dexpaprika.com) |免费（无钥匙）|搜索代币、矿池和 DEX；读取链上 DEX 上的代币市场数据、资金池流动性和 OHLCV 价格历史记录。 || [PaySafe](https://paysafe-agent.com) |前 100 次 API 调用免费 |基于 x402 的防火墙，具有用于提示注入检测的自动来源标记。 |
| [Privy](/oss/python/integrations/tools/privy) |免费|创建具有可配置权限的钱包并快速执行交易。 |
| [Toolstem](https://toolstem.com) | \$0.01 USDC/看涨期权 (x402) |金融情报和 SEC EDGAR 工具，在 Base 上提供按次付费 x402 小额支付。 |
| [Uniswap V2](https://github.com/Conrad-sudo/langchain-uniswap-v2) |免费|获取实时 Uniswap V2 互换报价，并在任何 EVM 链上准备未签名的互换、批准和流动性交易。 |
| [ERC20](https://github.com/Conrad-sudo/langchain-erc20) |免费|读取 ERC20 余额、配额和元数据，并准备传输、批准和本机包装/解开，作为任何 EVM 链上 EOA 或智能合约钱包的执行计划。 |

## AI 工作流程优化

以下工具通过减少令牌使用和执行结构化 SOP 来优化 AI 代理工作流程：

|工具/工具包 |定价|主要特点|
| - | - | - |
| [HuangtingFlux](https://huangtingflux.com/integrations/langchain) |免费（公共 MCP 服务器）|通过 3 阶段 SOP 减少 40% 的令牌：输入压缩、滚动汇总、输出细化 |
| [ZeroGPU](https://docs.zerogpu.ai) |基于使用 |将分类、摘要、提取和 PII 编辑卸载到专门构建的小型模型 |

## 集成平台以下平台通过统一的界面提供对多种工具和服务的访问：

|工具/工具包 |集成数量 |定价|主要特点|
| - | - | - | - |
| [Composio](/oss/python/integrations/tools/composio) | 500+ |免费套餐可用 | OAuth 处理、事件驱动的工作流程、多用户支持 |
| [Scalekit](https://docs.scalekit.com/agentkit/quickstart/) | 500+ |免费套餐可用 |委托 OAuth、令牌库、多用户支持、LangSmith 跟踪 |

## 安全

下表显示了可用于安全相关任务的工具：|工具/工具包 |定价|能力|
| - | - | - |
| [URLCheck](https://urlcheck.dev) |每天 100 个免费请求 |在代理导航之前验证 URL 安全性。支持可选的意图感知风险分析。返回可操作的访问指令（ALLOW/DENY/RETRY\_LATER）。 |
| [Bidda](https://bidda.com/developers) |免费探索层 |通过主要来源引用进行来源验证的监管和合规情报查找。 |
| [AI Identity](https://ai-identity.co/docs) |免费套餐可用 |每个代理的加密 API 密钥、范围内的策略实施以及通过工具和 LLM 调用前面的网关进行防篡改的审核日志记录。 |
| [Aidress](https://aidress.ai) |提供免费无钥匙套餐 |在委派工作或转移价值之前，验证对方代理的信任评分、能力和交易历史记录。通过能力发现，加上不记名密钥的发行和轮换。 |
| [RelayShield](https://api.relayshield.net/developers) |付费|在执行高影响力的代理操作之前，对 MCP 服务器注册表风险和提示注入违规进行检查。 |
| [SidClaw](https://docs.sidclaw.com/docs/integrations/langchain) |提供免费托管套餐 | LangChain 工具调用的策略评估、人工审批工作流程和防篡改审计跟踪。 |
| [Tonic Textual](https://textual.tonic.ai) |需要帐号 |检测、提取、合成或标记文本、JSON、HTML 和文件中的 PII。 || [ERC-8004](https://github.com/Conrad-sudo/langchain-erc8004) |免费|在将工作委派给 ERC-8004 代理之前对其进行审查：根据其发布的注册文件验证其链上身份，读取指定审阅者的声誉反馈，并准备注册表写入作为执行计划。 |
| [Fizzl](https://fizzl.eu/agents/python/) |免费快速检查；每次调用完整支票 $0.01–$0.02 (x402) |在代理签名之前检查交易、代币批准或签名（绿色/橙色/红色，说明原因，加上交易模拟）、购买之前的代币、钱包的开放批准以及支付之前的已付费 x402 端点。 |

## 媒体生成

下表显示了生成视频、图像或音频资源的工具：|工具/工具包 |定价|能力|
| - | - | - |
| [Magic Hour](https://docs.magichour.ai) |免费套餐（400 积分 + 100/天）|使用 Sora 2、Veo 3.1、Kling 3.0、WAN 2.2、GPT-image、Nano Banana Pro 进行文本到视频、图像到视频和图像生成。同步和异步，返回 URL 或本地下载。 |
| [PopNow](https://popnow.ai/docs/langchain) |以美元即用即付，每次通话首先报价 |使用 Nano Banana、GPT Image、Seedream、Kling、MiniMax H3、Seedance、Wan、Suno 和 Gemini TTS 进行图像生成和编辑、文本到视频、图像到视频、音乐和文本到语音。同步和异步，返回 URL。 |

## 所有工具和工具包|整合 |下载 |
| :- | :- |
| [⟦T0⟧](/oss/python/integrations/tools/google_imagen) | [  ⟦T369⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T1⟧](/oss/python/integrations/tools/google_gmail) | [  ⟦T370⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T2⟧](/oss/python/integrations/tools/google_calendar) | [  ⟦T371⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T3⟧](/oss/python/integrations/tools/google_cloud_texttospeech) | [  ⟦T372⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T4⟧](/oss/python/integrations/tools/google_search) | [  ⟦T373⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T5⟧](/oss/python/integrations/tools/bedrock_agentcore_browser) | [  ⟦T374⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T6⟧](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | [  ⟦T375⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T7⟧](/oss/python/integrations/tools/bedrock_agentcore_web_search) | [  ⟦T376⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T8⟧](/oss/python/integrations/tools/tavily_crawl) | [  ⟦T377⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T9⟧](/oss/python/integrations/tools/tavily_extract) | [  ⟦T378⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T10⟧](/oss/python/integrations/tools/tavily_map) | [  ⟦T379⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T11⟧](/oss/python/integrations/tools/tavily_search) | [  ⟦T380⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T12⟧](/oss/python/integrations/tools/azure_logic_apps) | [  ⟦T381⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T13⟧](/oss/python/integrations/tools/azure_ai) | [  ⟦T382⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T14⟧](/oss/python/integrations/tools/azure_ai_services) | [  ⟦T383⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T15⟧](/oss/python/integrations/tools/databricks) | [  ⟦T384⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T16⟧](/oss/python/integrations/tools/composio) | [  ⟦T385⟧](https://pypi.org/project/composio-langchain/) |
| [⟦T17⟧](/oss/python/integrations/tools/ibm_watsonx_sql) | [  ⟦T386⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T18⟧](/oss/python/integrations/tools/ibm_watsonx) | [  ⟦T387⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T19⟧](/oss/python/integrations/tools/perplexity_search) | [  ⟦T388⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T20⟧](/oss/python/integrations/tools/oracleai) | [  ⟦T389⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T21⟧](/oss/python/integrations/tools/exa_search) | [  ⟦T390⟧](https://pypi.org/project/langchain-exa/) |
| [⟦T22⟧](/oss/python/integrations/tools/parallel_extract) | [  ⟦T391⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T23⟧](/oss/python/integrations/tools/parallel_findall) | [  ⟦T392⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T24⟧](/oss/python/integrations/tools/parallel_monitor) | [  ⟦T393⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T25⟧](/oss/python/integrations/tools/parallel_search) | [  ⟦T394⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T26⟧](/oss/python/integrations/tools/parallel_task) | [  ⟦T395⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T27⟧](/oss/python/integrations/tools/azure_dynamic_sessions) | [  ⟦T396⟧](https://pypi.org/project/langchain-azure-dynamic-sessions/) |
| [⟦T28⟧](https://docs.scalekit.com/agentkit/quickstart/) | [  ⟦T397⟧](https://pypi.org/project/scalekit-sdk-python/) |
| [⟦T29⟧](/oss/python/integrations/tools/upstage_groundedness_check) | [  ⟦T398⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T30⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T399⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T31⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | [  ⟦T400⟧](https://pypi.org/project/m3-memory/) |
| [⟦T32⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T401⟧](https://pypi.org/project/semantica/) |
| [⟦T33⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T402⟧](https://pypi.org/project/semantica/) |
| [⟦T34⟧](https://github.com/emmanuelorta/crawlcheck-core/tree/main/sdk-python#langchain-and-llamaindex-1100) | [  ⟦T403⟧](https://pypi.org/project/crawlcheck/) |
| [⟦T35⟧](/oss/python/integrations/tools/stripe) | [  ⟦T404⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T36⟧](https://github.com/memgraph/langchain-memgraph) | [  ⟦T405⟧](https://pypi.org/project/langchain-memgraph/) |
| [⟦T37⟧](/oss/python/integrations/tools/stripe) | [  ⟦T406⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T38⟧](https://github.com/gazoy/langchain-foliant#readme) | [  ⟦T407⟧](https://pypi.org/project/langchain-foliant/) |
| [⟦T39⟧](/oss/python/integrations/tools/google_drive) | [  ⟦T408⟧](https://pypi.org/project/langchain-googledrive/) |
| [⟦T40⟧](https://bowmark.ai/docs/langchain) | [  ⟦T409⟧](https://pypi.org/project/langchain-bowmark/) |
| [⟦T41⟧](https://pypi.org/project/langchain-compass/) | [  ⟦T410⟧](https://pypi.org/project/langchain-compass/) |
| [⟦T42⟧](https://fizzl.eu/agents/python/) | [  ⟦T411⟧](https://pypi.org/project/fizzl/) |
| [⟦T43⟧](/oss/python/integrations/tools/mcp_toolbox) | [  ⟦T412⟧](https://pypi.org/project/toolbox-langchain/) |
| [⟦T44⟧](https://adeu.ai) | [  ⟦T413⟧](https://pypi.org/project/langchain-adeu/) |
| [⟦T45⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain-python) | [  ⟦T414⟧](https://pypi.org/project/langchain-arcmira/) |
| [⟦T46⟧](/oss/python/integrations/tools/cdp_agentkit) | [  ⟦T415⟧](https://pypi.org/project/coinbase-agentkit-langchain/) |
| [⟦T47⟧](https://docs.firecrawl.dev) | [  ⟦T416⟧](https://pypi.org/project/langchain-firecrawl/) |
| [⟦T48⟧](https://github.com/LinkupPlatform/langchain-linkup) | [  ⟦T417⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T49⟧](https://docs.pexafy.com/langchain) | [  ⟦T418⟧](https://pypi.org/project/langchain-pexafy/) |
| [⟦T50⟧](https://pidgeon.ai/docs/langchain) | [  ⟦T419⟧](https://pypi.org/project/langchain-pidgeon/) |
| [⟦T51⟧](https://scavio.dev/docs/langchain) | [  ⟦T420⟧](https://pypi.org/project/langchain-scavio/) |
| [⟦T52⟧](https://github.com/ScrapeGraphAI/langchain-scrapegraph) | [  ⟦T421⟧](https://pypi.org/project/langchain-scrapegraph/) |
| [⟦T53⟧](https://github.com/Shikenso-Analytics/langchain-taiga) | [  ⟦T422⟧](https://pypi.org/project/langchain-taiga/) |
| [⟦T54⟧](https://pypi.org/project/langchain-alex/) | [  ⟦T423⟧](https://pypi.org/project/langchain-alex/) |
| [⟦T55⟧](https://github.com/botsrated/botsrated/tree/main/integrations/langchain) | [  ⟦T424⟧](https://pypi.org/project/langchain-botsrated/) |
| [⟦T56⟧](https://docs.brightdata.com/scraping-automation/serp-api/introduction) | [  ⟦T425⟧](https://pypi.org/project/langchain-brightdata/) || [⟦T57⟧](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) | [  ⟦T426⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T58⟧](https://docs.brightdata.com/datasets/scrapers/overview) | [  ⟦T427⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T59⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T428⟧](https://pypi.org/project/langchain-decodo/) |
| [⟦T60⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T429⟧](https://pypi.org/project/langchain-decodo/) |
| [⟦T61⟧](https://docs.dexpaprika.com) | [  ⟦T430⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T62⟧](https://github.com/rocosen/langchain-flashdata) | [  ⟦T431⟧](https://pypi.org/project/langchain-flashdata/) |
| [⟦T63⟧](https://docs.hindsight.vectorize.io/sdks/integrations/langgraph) | [  ⟦T432⟧](https://pypi.org/project/hindsight-langgraph/) |
| [⟦T64⟧](https://github.com/agentbeacon-hq/clients) | [  ⟦T433⟧](https://pypi.org/project/langchain-openpath/) |
| [⟦T65⟧](https://replylayer.ai/docs/guides/langchain) | [  ⟦T434⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T66⟧](https://pypi.org/project/langchain-send21/) | [  ⟦T435⟧](https://pypi.org/project/langchain-send21/) |
| [⟦T67⟧](https://serpex.dev/docs) | [  ⟦T436⟧](https://pypi.org/project/langchain-serpex-python/) |
| [⟦T68⟧](https://synmerco.com/docs) | [  ⟦T437⟧](https://pypi.org/project/synmerco-langchain/) |
| [⟦T69⟧](https://urlpipe.dev/integrations/langchain) | [  ⟦T438⟧](https://pypi.org/project/langchain-urlpipe/) |
| [⟦T70⟧](https://github.com/ADS4GPTs/ads4gpts) | [  ⟦T439⟧](https://pypi.org/project/ads4gpts-langchain/) |
| [⟦T71⟧](https://github.com/thyn-ai/algenta-integrations/tree/main/python/langchain-algenta#readme) | [  ⟦T440⟧](https://pypi.org/project/langchain-algenta/) |
| [⟦T72⟧](https://anakin.io/docs/documentation) | [  ⟦T441⟧](https://pypi.org/project/langchain-anakin/) |
| [⟦T73⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T442⟧](https://pypi.org/project/langchain-atomicmail/) |
| [⟦T74⟧](https://cloro.dev/docs/) | [  ⟦T443⟧](https://pypi.org/project/langchain-cloro/) |
| [⟦T75⟧](https://docs.dexpaprika.com) | [  ⟦T444⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T76⟧](https://e2a.dev) | [  ⟦T445⟧](https://pypi.org/project/e2a/) |
| [⟦T77⟧](https://github.com/MehdiZare/langchain-fmp-data) | [  ⟦T446⟧](https://pypi.org/project/langchain-fmp-data/) |
| [⟦T78⟧](https://docs.goodmem.ai) | [  ⟦T447⟧](https://pypi.org/project/langchain-goodmem/) |
| [⟦T79⟧](https://dev.writer.com/home/introduction) | [  ⟦T448⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T80⟧](https://github.com/edtool79-collab/hirepulse-open-source#langchain-and-crewai-gateway-tools-030) | [  ⟦T449⟧](https://pypi.org/project/hirepulse-tools/) |
| [⟦T81⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T450⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T82⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T451⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T83⟧](https://10ml.com/perfume-mcp-server) | [  ⟦T452⟧](https://pypi.org/project/langchain-10ml-perfume/) |
| [⟦T84⟧](https://langchain-prolog.readthedocs.io/en/stable/) | [  ⟦T453⟧](https://pypi.org/project/langchain-prolog/) |
| [⟦T85⟧](https://pypi.org/project/langchain-swarmmemo/) | [  ⟦T454⟧](https://pypi.org/project/langchain-swarmmemo/) |
| [⟦T86⟧](https://www.maximem.ai/) | [  ⟦T455⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T87⟧](https://github.com/tanod-labs/integrations/tree/main/langchain) | [  ⟦T456⟧](https://pypi.org/project/langchain-tanod/) |
| [⟦T88⟧](https://github.com/sriram7737/pramagent) | [  ⟦T457⟧](https://pypi.org/project/pramagent/) |
| [⟦T89⟧](https://github.com/econdash/econdash-python/blob/main/packages/langchain-econdash/README.md) | [  ⟦T458⟧](https://pypi.org/project/langchain-econdash/) |
| [⟦T90⟧](https://github.com/verdixapi/langchain-verdix#readme) | [  ⟦T459⟧](https://pypi.org/project/langchain-verdix/) |
| [⟦T91⟧](https://docs.apiverve.com/integrations/langchain) | [  ⟦T460⟧](https://pypi.org/project/langchain-apiverve/) |
| [⟦T92⟧](https://github.com/datumline/datumline-agent-guard#langchain) | [  ⟦T461⟧](https://pypi.org/project/datumline-agent-guard/) |
| [⟦T93⟧](https://you.com/docs/integrations/langchain) | [  ⟦T462⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T94⟧](https://gatecoreai.com/docs/) | [  ⟦T463⟧](https://pypi.org/project/gatecore-langchain/) |
| [⟦T95⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | [  ⟦T464⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T96⟧](https://github.com/beepboop2025/langchain-financial-evidence#readme) | [  ⟦T465⟧](https://pypi.org/project/langchain-financial-evidence/) |
| [⟦T97⟧](https://github.com/colesmcintosh/langchain-salesforce) | [  ⟦T466⟧](https://pypi.org/project/langchain-salesforce/) |
| [⟦T98⟧](https://github.com/twittrapi/langchain-twittrapi#readme) | [  ⟦T467⟧](https://pypi.org/project/langchain-twittrapi/) |
| [⟦T99⟧](https://www.newscatcherapi.com/docs/web-search-api/integrations/langchain) | [  ⟦T468⟧](https://pypi.org/project/langchain-catchall/) ​​|
| [⟦T100⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T469⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T101⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T470⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T102⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T471⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T103⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T472⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T104⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T473⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T105⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T474⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T106⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T475⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T107⟧](https://github.com/olostep-api/langchain-olostep#readme) | [  ⟦T476⟧](https://pypi.org/project/langchain-olostep/) |
| [⟦T108⟧](https://mesharc.dev/docs/langchain) | [  ⟦T477⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T109⟧](https://mesharc.dev/docs/langchain) | [  ⟦T478⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T110⟧](https://agentsearchhq.com/blog/add-web-search-to-langchain-agent?utm_source=langchain-docs\&utm_medium=integration-listing\&utm_campaign=promo-oct26) | [  ⟦T479⟧](https://pypi.org/project/langchain-agentsearch/) |
| [⟦T111⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T480⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T112⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T481⟧](https://pypi.org/project/langchain-hyperbrowser/) || [⟦T113⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T482⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T114⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T483⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T115⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T484⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T116⟧](https://github.com/Minns-ai/langgraph-minnsdb#readme) | [  ⟦T485⟧](https://pypi.org/project/langgraph-minnsdb/) |
| [⟦T117⟧](https://docs.mrscraper.com) | [  ⟦T486⟧](https://pypi.org/project/langchain-mrscraper/) |
| [⟦T118⟧](https://github.com/Thordata/langchain-thordata) | [  ⟦T487⟧](https://pypi.org/project/langchain-thordata/) |
| [⟦T119⟧](https://github.com/robocorp/robocorp) | [  ⟦T488⟧](https://pypi.org/project/langchain-robocorp/) |
| [⟦T120⟧](https://docs.ampersend.ai) | [  ⟦T489⟧](https://pypi.org/project/langchain-ampersend/) |
| [⟦T121⟧](https://github.com/lachy3433/langchain-contextfetch#readme) | [  ⟦T490⟧](https://pypi.org/project/langchain-contextfetch/) |
| [⟦T122⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T491⟧](https://pypi.org/project/langchain-clawfetch/) |
| [⟦T123⟧](https://omfang.io/manifest-docs) | [  ⟦T492⟧](https://pypi.org/project/manifest-api/) |
| [⟦T124⟧](https://snap-render.com) | [  ⟦T493⟧](https://pypi.org/project/langchain-snaprender/) |
| [⟦T125⟧](https://webextract.dev/docs/langchain) | [  ⟦T494⟧](https://pypi.org/project/langchain-webextract/) |
| [⟦T126⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/gpt-image) | [  ⟦T495⟧](https://pypi.org/project/langchain-gpt-image-acedatacloud/) |
| [⟦T127⟧](https://www.lians.ai) | [  ⟦T496⟧](https://pypi.org/project/lians-sdk/) |
| [⟦T128⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/happyhorse) | [  ⟦T497⟧](https://pypi.org/project/langchain-happyhorse-acedatacloud/) |
| [⟦T129⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/nano-banana) | [  ⟦T498⟧](https://pypi.org/project/langchain-nano-banana-acedatacloud/) |
| [⟦T130⟧](https://specstream.ai/docs/langchain) | [  ⟦T499⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T131⟧](https://docs.zerogpu.ai) | [  ⟦T500⟧](https://pypi.org/project/langchain-zerogpu/) |
| [⟦T132⟧](https://docs.hydrafetch.com) | [  ⟦T501⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T133⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T502⟧](https://pypi.org/project/langchain-getyoutubetranscript/) |
| [⟦T134⟧](https://github.com/ourresearch/langchain-openalex#readme) | [  ⟦T503⟧](https://pypi.org/project/langchain-openalex/) |
| [⟦T135⟧](https://www.search1api.com/docs/integrations/langchain) | [  ⟦T504⟧](https://pypi.org/project/search1api-langchain/) |
| [⟦T136⟧](https://github.com/wayza-protocol/wayza-js/tree/main/packages/langchain-wayza) | [  ⟦T505⟧](https://pypi.org/project/langchain-wayza/) |
| [⟦T137⟧](https://docs.upload-post.com/guides/langchain) | [  ⟦T506⟧](https://pypi.org/project/langchain-upload-post/) |
| [⟦T138⟧](https://mixpeek.com/docs/agent-integrations/langchain) | [  ⟦T507⟧](https://pypi.org/project/langchain-mixpeek/) |
| [⟦T139⟧](https://kavel.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T508⟧](https://pypi.org/project/langchain-kavel/) |
| [⟦T140⟧](https://pinkwallet.com/agentic/connect/langchain/) | [  ⟦T509⟧](https://pypi.org/project/langchain-pink/) |
| [⟦T141⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T510⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T142⟧](https://optionsahoy.com/for-agents) | [  ⟦T511⟧](https://pypi.org/project/optionsahoy-langchain/) |
| [⟦T143⟧](/oss/python/integrations/tools/discord) | [  ⟦T512⟧](https://pypi.org/project/langchain-discord/) |
| [⟦T144⟧](https://blopus.ai/docs/) | [  ⟦T513⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T145⟧](https://blopus.ai/docs/) | [  ⟦T514⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T146⟧](https://docs.valyu.ai/home) | [  ⟦T515⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T147⟧](https://veida.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T516⟧](https://pypi.org/project/langchain-veida/) |
| [⟦T148⟧](https://github.com/fodda-ai/langchain-fodda#readme) | [  ⟦T517⟧](https://pypi.org/project/langchain-fodda/) |
| [⟦T149⟧](https://flowspeech.io/docs) | [  ⟦T518⟧](https://pypi.org/project/langchain-flowspeech/) |
| [⟦T150⟧](https://mnki.com/docs/integrations#frameworks) | [  ⟦T519⟧](https://pypi.org/project/langchain-mnki/) |
| [⟦T151⟧](https://github.com/tanvoai/langchain-tanvo#readme) | [  ⟦T520⟧](https://pypi.org/project/langchain-tanvo/) |
| [⟦T152⟧](https://github.com/EXboys/langchain-skilllite) | [  ⟦T521⟧](https://pypi.org/project/langchain-skilllite/) |
| [⟦T153⟧](https://github.com/Conrad-sudo/langchain-uniswap-v2) | [  ⟦T522⟧](https://pypi.org/project/langchain-uniswap-v2/) |
| [⟦T154⟧](https://skim402.com/docs) | [  ⟦T523⟧](https://pypi.org/project/langchain-skim/) |
| [⟦T155⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-py) | [  ⟦T524⟧](https://pypi.org/project/pushary-langgraph/) |
| [⟦T156⟧](https://github.com/dong7812/dompruner-py) | [  ⟦T525⟧](https://pypi.org/project/dompruner/) |
| [⟦T157⟧](https://pypi.org/project/ddg-langchain/) | [  ⟦T526⟧](https://pypi.org/project/ddg-langchain/) |
| [⟦T158⟧](https://docs.gnews.io/langchain) | [  ⟦T527⟧](https://pypi.org/project/langchain-gnews/) |
| [⟦T159⟧](https://docs.gnews.io/langchain) | [  ⟦T528⟧](https://pypi.org/project/langchain-gnews/) |
| [⟦T160⟧](https://pypi.org/project/langchain-gaip/) | [  ⟦T529⟧](https://pypi.org/project/langchain-gaip/) |
| [⟦T161⟧](https://graciousquotes.com/developers/langchain/) | [  ⟦T530⟧](https://pypi.org/project/langchain-graciousquotes/) |
| [⟦T162⟧](https://opedd.com/for-ai-agents) | [  ⟦T531⟧](https://pypi.org/project/langchain-opedd/) |
| [⟦T163⟧](https://agentsvc.io/docs/langchain) | [  ⟦T532⟧](https://pypi.org/project/agentsvc/) |
| [⟦T164⟧](https://precleared.dev/docs/langchain) | [  ⟦T533⟧](https://pypi.org/project/precleared/) |
| [⟦T165⟧](https://emaki.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T534⟧](https://pypi.org/project/langchain-emaki/) |
| [⟦T166⟧](https://docs.anchorbrowser.io/introduction) | [  ⟦T535⟧](https://pypi.org/project/langchain-anchorbrowser/) || [⟦T167⟧](https://github.com/oxylabs/langchain-oxylabs) | [  ⟦T536⟧](https://pypi.org/project/langchain-oxylabs/) |
| [⟦T168⟧](https://proxmint.com/docs/langchain) | [  ⟦T537⟧](https://pypi.org/project/langchain-proxmint/) |
| [⟦T169⟧](https://aidress.ai) | [  ⟦T538⟧](https://pypi.org/project/langchain-aidress/) |
| [⟦T170⟧](https://github.com/printfriendly/langchain-printfriendly#readme) | [  ⟦T539⟧](https://pypi.org/project/langchain-printfriendly/) |
| [⟦T171⟧](https://reserp.ai/docs) | [  ⟦T540⟧](https://pypi.org/project/langchain-reserp/) |
| [⟦T172⟧](https://github.com/daytonaio/daytona) | [  ⟦T541⟧](https://pypi.org/project/langchain-daytona-data-analysis/) |
| [⟦T173⟧](https://docs.1claw.xyz/docs/integrations/langchain) | [  ⟦T542⟧](https://pypi.org/project/langchain-1claw/) |
| [⟦T174⟧](https://github.com/TheSuperColony/langchain-supercolony) | [  ⟦T543⟧](https://pypi.org/project/langchain-supercolony/) |
| [⟦T175⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/seedance) | [  ⟦T544⟧](https://pypi.org/project/langchain-seedance-acedatacloud/) |
| [⟦T176⟧](https://github.com/Conrad-sudo/langchain-erc20) | [  ⟦T545⟧](https://pypi.org/project/langchain-erc20/) |
| [⟦T177⟧](https://docs.dappier.com/) | [  ⟦T546⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T178⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#alfrescotoolkit) | [  ⟦T547⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T179⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#documentumtoolkit) | [  ⟦T548⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T180⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#filenetp8toolkit) | [  ⟦T549⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T181⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#onbasetoolkit) | [  ⟦T550⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T182⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md) | [  ⟦T551⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T183⟧](https://github.com/mavdol/langchain-capsule) | [  ⟦T552⟧](https://pypi.org/project/langchain-capsule/) |
| [⟦T184⟧](https://github.com/agent-help-network/agent-help-network/blob/main/clients/langchain-ahn/README.md) | [  ⟦T553⟧](https://pypi.org/project/langchain-ahn/) |
| [⟦T185⟧](https://github.com/tokportal/langchain-tokportal) | [  ⟦T554⟧](https://pypi.org/project/langchain-tokportal/) |
| [⟦T186⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T555⟧](https://pypi.org/project/langchain-talordata/) |
| [⟦T187⟧](https://github.com/jmendozapuche/langchain-latam-synth) | [  ⟦T556⟧](https://pypi.org/project/langchain-latam-synth/) |
| [⟦T188⟧](/oss/python/integrations/tools/tableau) | [  ⟦T557⟧](https://pypi.org/project/langchain-tableau/) |
| [⟦T189⟧](https://cosmergon.com) | [  ⟦T558⟧](https://pypi.org/project/langchain-cosmergon/) |
| [⟦T190⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | [  ⟦T559⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T191⟧](https://docs.memoryrouter.ai/langchain) | [  ⟦T560⟧](https://pypi.org/project/langchain-memoryrouter/) |
| [⟦T192⟧](https://paysafe-agent.com) | [  ⟦T561⟧](https://pypi.org/project/langchain-paysafe/) |
| [⟦T193⟧](https://axiora.dev/docs) | [  ⟦T562⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T194⟧](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) | [  ⟦T563⟧](https://pypi.org/project/serpapi-search-tools/) |
| [⟦T195⟧](https://alphai.io/developers) | [  ⟦T564⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T196⟧](https://alphai.io/developers) | [  ⟦T565⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T197⟧](https://alphai.io/developers) | [  ⟦T566⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T198⟧](https://alphai.io/developers) | [  ⟦T567⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T199⟧](https://greencalculus.com/guides/emission-factors-langchain/) | [  ⟦T568⟧](https://pypi.org/project/langchain-greencalculus/) |
| [⟦T200⟧](https://api.relayshield.net/developers) | [  ⟦T569⟧](https://pypi.org/project/langchain-relayshield/) |
| [⟦T201⟧](https://strale.dev/docs) | [  ⟦T570⟧](https://pypi.org/project/langchain-strale/) |
| [⟦T202⟧](https://www.ictinnovations.com/) | [  ⟦T571⟧](https://pypi.org/project/langchain-ictfax/) |
| [⟦T203⟧](https://github.com/getanyapi-com/integrations/tree/main/langchain-anyapi) | [  ⟦T572⟧](https://pypi.org/project/langchain-anyapi/) |
| [⟦T204⟧](https://docs.keenable.ai) | [  ⟦T573⟧](https://pypi.org/project/langchain-keenable/) |
| [⟦T205⟧](https://github.com/lfg-gm/langchain-lfg#readme) | [  ⟦T574⟧](https://pypi.org/project/langchain-lfg/) |
| [⟦T206⟧](https://www.agentrails.io/docs) | [  ⟦T575⟧](https://pypi.org/project/langchain-x402/) |
| [⟦T207⟧](https://github.com/authzed/langchain-spicedb) | [  ⟦T576⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T208⟧](https://github.com/Layrcake-dev/langchain-layrcake#readme) | [  ⟦T577⟧](https://pypi.org/project/langchain-layrcake/) |
| [⟦T209⟧](https://gandr.ai/docs) | [  ⟦T578⟧](https://pypi.org/project/gandr-langchain/) |
| [⟦T210⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T579⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T211⟧](https://github.com/valthera/langchain-valthera) | [  ⟦T580⟧](https://pypi.org/project/langchain-valthera/) |
| [⟦T212⟧](https://docs.spidra.io) | [  ⟦T581⟧](https://pypi.org/project/langchain-spidra/) |
| [⟦T213⟧](https://tablejourney.com/agents/#langchain) | [  ⟦T582⟧](https://pypi.org/project/langchain-tablejourney/) |
| [⟦T214⟧](https://github.com/yumaheymans/langchain-carejobs#readme) | [  ⟦T583⟧](https://pypi.org/project/langchain-carejobs/) |
| [⟦T215⟧](https://github.com/e7217/langchain-naver-community) | [  ⟦T584⟧](https://pypi.org/project/langchain-naver-community/) |
| [⟦T216⟧](https://docs.scraperapi.com/) | [  ⟦T585⟧](https://pypi.org/project/langchain-scraperapi/) |
| [⟦T217⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T586⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T218⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T587⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T219⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T588⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T220⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T589⟧](https://pypi.org/project/langchain-scrapingbee/) || [⟦T221⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T590⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T222⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T591⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T223⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T592⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T224⟧](https://preclick.ai/) | [  ⟦T593⟧](https://pypi.org/project/langchain-urlcheck/) |
| [⟦T225⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T594⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T226⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T595⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T227⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T596⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T228⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T597⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T229⟧](https://querit.com/docs) | [  ⟦T598⟧](https://pypi.org/project/langchain-querit/) |
| [⟦T230⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T599⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T231⟧](https://github.com/plivo-dev/langchain-plivo-tools) | [  ⟦T600⟧](https://pypi.org/project/langchain-plivo-tools/) |
| [⟦T232⟧](https://github.com/vectara/langchain-vectara) | [  ⟦T601⟧](https://pypi.org/project/langchain-vectara/) |
| [⟦T233⟧](https://www.xpoz.ai/docs) | [  ⟦T602⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T234⟧](https://docs.lakesail.com/sail/latest/guide/integrations/langchain.html) | [  ⟦T603⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T235⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/suno) | [  ⟦T604⟧](https://pypi.org/project/langchain-suno-acedatacloud/) |
| [⟦T236⟧](https://docs.agentql.com/home) | [  ⟦T605⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T237⟧](https://docs.yutori.com) | [  ⟦T606⟧](https://pypi.org/project/langchain-yutori/) |
| [⟦T238⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T607⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T239⟧](https://github.com/permitio/langchain-permit) | [  ⟦T608⟧](https://pypi.org/project/langchain-permit/) |
| [⟦T240⟧](https://docs.agentql.com/home) | [  ⟦T609⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T241⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T610⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T242⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T611⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T243⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T612⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T244⟧](https://github.com/Amitgb14/langchain_jenkins) | [  ⟦T613⟧](https://pypi.org/project/langchain-jenkins/) |
| [⟦T245⟧](https://docs.lakesail.com/sail/main/guide/integrations/langchain/) | [  ⟦T614⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T246⟧](https://github.com/gridpin/gridpin/tree/main/integrations/langchain) | [  ⟦T615⟧](https://pypi.org/project/langchain-gridpin/) |
| [⟦T247⟧](https://www.xpoz.ai/docs) | [  ⟦T616⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T248⟧](https://www.agentfetch.dev) | [  ⟦T617⟧](https://pypi.org/project/langchain-agentfetch/) |
| [⟦T249⟧](https://github.com/fastaf-co/fastaf-integrations/tree/main/langchain-fastaf) | [  ⟦T618⟧](https://pypi.org/project/langchain-fastaf/) |
| [⟦T250⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T619⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T251⟧](https://docs.proxyhat.com) | [  ⟦T620⟧](https://pypi.org/project/langchain-proxyhat/) |
| [⟦T252⟧](https://platform.iflow.cn/) | [  ⟦T621⟧](https://pypi.org/project/iflow-search-langchain/) |
| [⟦T253⟧](https://docs.livetennisapi.com) | [  ⟦T622⟧](https://pypi.org/project/langchain-livetennis/) |
| [⟦T254⟧](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) | [  ⟦T623⟧](https://pypi.org/project/nodeproxy-tools/) |
| [⟦T255⟧](https://docs.webz.io/docs/webz/news-search-api-mcp) | [  ⟦T624⟧](https://pypi.org/project/langchain-webz/) |
| [⟦T256⟧](https://lumify.ai/docs/ai) | [  ⟦T625⟧](https://pypi.org/project/langchain-lumify/) |
| [⟦T257⟧](https://docs.ipay.sh) | [  ⟦T626⟧](https://pypi.org/project/langchain-pr402/) |
| [⟦T258⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T627⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T259⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T628⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T260⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T629⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T261⟧](https://docs.opengradient.ai/) | [  ⟦T630⟧](https://pypi.org/project/langchain-opengradient/) |
| [⟦T262⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T631⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T263⟧](https://asyntai.com/documentation/integrations/langchain/) | [  ⟦T632⟧](https://pypi.org/project/langchain-asyntai/) |
| [⟦T264⟧](https://lyrenth.com/docs/integrations) | [  ⟦T633⟧](https://pypi.org/project/langchain-lyrenth/) |
| [⟦T265⟧](https://crustapi.com/docs) | [  ⟦T634⟧](https://pypi.org/project/langchain-crustapi/) |
| [⟦T266⟧](https://useagentgate.com/docs) | [  ⟦T635⟧](https://pypi.org/project/langchain-agentgate/) |
| [⟦T267⟧](https://github.com/stardog-union/stardog-langchain) | [  ⟦T636⟧](https://pypi.org/project/langchain-stardog/) |
| [⟦T268⟧](https://github.com/auscahq/ausca/tree/main/python/langchain-ausca) | [  ⟦T637⟧](https://pypi.org/project/langchain-ausca/) |
| [⟦T269⟧](https://github.com/Scottcjn/langchain-rustchain) | [  ⟦T638⟧](https://pypi.org/project/langchain-rustchain-tools/) |
| [⟦T270⟧](https://docs.sidclaw.com/docs/integrations/langchain) | [  ⟦T639⟧](https://pypi.org/project/langchain-sidclaw/) |
| [⟦T271⟧](https://github.com/Toloka/tendem-mcp/tree/main/integrations/langchain-tendem#readme) | ⟦T1384​​⟧ |
| [⟦T272⟧](https://api.netnestdesign.com/docs) | [  ⟦T641⟧](https://pypi.org/project/langchain-netnest/) |
| [⟦T273⟧](https://pinchwork.dev) | [  ⟦T642⟧](https://pypi.org/project/pinchwork/) |
| [⟦T274⟧](https://docs.agentmail.to/welcome) | [  ⟦T643⟧](https://pypi.org/project/langchain-agentmail/) || [⟦T275⟧](https://github.com/meetdewey/langchain-dewey) | [  ⟦T644⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T276⟧](https://kerq.dev/docs) | [  ⟦T645⟧](https://pypi.org/project/langchain-kerq/) |
| [⟦T277⟧](https://w2a-protocol.org/) | [  ⟦T646⟧](https://pypi.org/project/langchain-w2a/) |
| [⟦T278⟧](https://www.football-charts.com/developers) | [  ⟦T647⟧](https://pypi.org/project/langchain-footballcharts/) |
| [⟦T279⟧](https://modexia.software/docs) | [  ⟦T648⟧](https://pypi.org/project/langchain-modexia/) |
| [⟦T280⟧](https://agenticemail.dev/docs) | [  ⟦T649⟧](https://pypi.org/project/langchain-agenticemail/) |
| [⟦T281⟧](https://www.clawmessenger.com/blog/langchain-imessage-integration) | [  ⟦T650⟧](https://pypi.org/project/langchain-claw-messenger/) |
| [⟦T282⟧](https://ictpbx.com) | [  ⟦T651⟧](https://pypi.org/project/langchain-ictpbx/) |
| [⟦T283⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-ask) | [  ⟦T652⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T284⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search) | [  ⟦T653⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T285⟧](https://github.com/oddsrelay/langchain-oddsrelay) | [  ⟦T654⟧](https://pypi.org/project/langchain-oddsrelay/) |
| [⟦T286⟧](https://docs.context.dev) | [  ⟦T655⟧](https://pypi.org/project/langchain-context/) |
| [⟦T287⟧](https://www.searchapi.io/docs/google) | [  ⟦T656⟧](https://pypi.org/project/langchain-searchapi/) |
| [⟦T288⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T657⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T289⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T658⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T290⟧](https://proxyclaw.ai/docs) | [  ⟦T659⟧](https://pypi.org/project/langchain-proxyclaw/) |
| [⟦T291⟧](https://quanticdata.io/docs/) | [  ⟦T660⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T292⟧](https://docs.octen.ai) | [  ⟦T661⟧](https://pypi.org/project/langchain-octen/) |
| [⟦T293⟧](https://docs.hashlock.markets/) | [  ⟦T662⟧](https://pypi.org/project/langchain-hashlock/) |
| [⟦T294⟧](/oss/python/integrations/tools/privy) | [  ⟦T663⟧](https://pypi.org/project/langchain-privy/) |
| [⟦T295⟧](https://ai-identity.co/docs) | [  ⟦T664⟧](https://pypi.org/project/langchain-ai-identity/) |
| [⟦T296⟧](https://synoppy.com/docs) | [  ⟦T665⟧](https://pypi.org/project/langchain-synoppy/) |
| [⟦T297⟧](https://bidda.com/developers) | [  ⟦T666⟧](https://pypi.org/project/langchain-bidda/) |
| [⟦T298⟧](https://docs.magichour.ai) | [  ⟦T667⟧](https://pypi.org/project/langchain-magic-hour/) |
| [⟦T299⟧](https://instanode.dev/docs) | [  ⟦T668⟧](https://pypi.org/project/langchain-instanode/) |
| [⟦T300⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T669⟧](https://pypi.org/project/langchain-aproxpay/) |
| [⟦T301⟧](https://simplepages.ai/mcp) | [  ⟦T670⟧](https://pypi.org/project/langchain-simplepages/) |
| [⟦T302⟧](https://github.com/tilotech/tilores-langchain) | [  ⟦T671⟧](https://pypi.org/project/tilores-langchain/) |
| [⟦T303⟧](https://docs.agentphone.ai/welcome) | [  ⟦T672⟧](https://pypi.org/project/langchain-agentphone/) |
| [⟦T304⟧](https://ceki.me) | [  ⟦T673⟧](https://pypi.org/project/langchain-ceki/) |
| [⟦T305⟧](https://www.ictlms.net) | [  ⟦T674⟧](https://pypi.org/project/langchain-ictexam/) |
| [⟦T306⟧](https://github.com/nozomio-labs/nia-langchain) | [  ⟦T675⟧](https://pypi.org/project/langchain-nia/) |
| [⟦T307⟧](https://verifly.email/docs) | [  ⟦T676⟧](https://pypi.org/project/langchain-verifly/) |
| [⟦T308⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T677⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T309⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T678⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T310⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T679⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T311⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T680⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T312⟧](https://github.com/witanmarkets/langchain-witan#readme) | [  ⟦T681⟧](https://pypi.org/project/langchain-witan/) |
| [⟦T313⟧](https://docs.bodo.ai/) | [  ⟦T682⟧](https://pypi.org/project/langchain-bodo/) |
| [⟦T314⟧](https://coworkingview.com/en/mcp) | [  ⟦T683⟧](https://pypi.org/project/langchain-coworkingview/) |
| [⟦T315⟧](https://github.com/Keirolabs-API/langchain-keiro) | [  ⟦T684⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T316⟧](https://github.com/flipcoin-fun/flipcoin-langchain) | [  ⟦T685⟧](https://pypi.org/project/langchain-flipcoin/) |
| [⟦T317⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T686⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T318⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T687⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T319⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T688⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T320⟧](https://signatrust.net/docs/api) | [  ⟦T689⟧](https://pypi.org/project/langchain-signatrust/) |
| [⟦T321⟧](https://github.com/synapsoft-DA/langchain-synapsoft) | [  ⟦T690⟧](https://pypi.org/project/langchain-synapsoft/) |
| [⟦T322⟧](https://goodsender.com/docs) | [  ⟦T691⟧](https://pypi.org/project/langchain-goodsender/) |
| [⟦T323⟧](https://github.com/drasi-project/langchain-drasi) | [  ⟦T692⟧](https://pypi.org/project/langchain-drasi/) |
| [⟦T324⟧](https://unirateapi.com) | [  ⟦T693⟧](https://pypi.org/project/langchain-unirate/) |
| [⟦T325⟧](https://docs.blindfold.dev) | [  ⟦T694⟧](https://pypi.org/project/langchain-blindfold/) |
| [⟦T326⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T695⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T327⟧](https://docs.agentline.cloud/introduction) | [  ⟦T696⟧](https://pypi.org/project/langchain-agentline/) |
| [⟦T328⟧](https://docs.delegare.dev/introduction) | [  ⟦T697⟧](https://pypi.org/project/langchain-delegare/) || [⟦T329⟧](https://toolstem.com) | [  ⟦T698⟧](https://pypi.org/project/langchain-toolstem/) |
| [⟦T330⟧](https://nextmail.sh/docs/python/langchain) | [  ⟦T699⟧](https://pypi.org/project/langchain-nextmail/) |
| [⟦T331⟧](https://github.com/itulo/eu-nordic-open-data-mcp/tree/main/packages/langchain-eu-nordic-open-data) | [  ⟦T700⟧](https://pypi.org/project/langchain-eu-nordic-open-data/) |
| [⟦T332⟧](https://pypi.org/project/langchain-surgemesh/) | [  ⟦T701⟧](https://pypi.org/project/langchain-surgemesh/) |
| [⟦T333⟧](https://pypi.org/project/langchain-arche/) | [  ⟦T702⟧](https://pypi.org/project/langchain-arche/) |
| [⟦T334⟧](https://github.com/seanmarkwei/langgraph-agentram) | [  ⟦T703⟧](https://pypi.org/project/langgraph-agentram/) |
| [⟦T335⟧](https://pypi.org/project/langchain-groundtruth/) | [  ⟦T704⟧](https://pypi.org/project/langchain-groundtruth/) |
| [⟦T336⟧](https://github.com/scoutwyze-max/scoutwyze-compute/blob/main/examples/README.md) | [  ⟦T705⟧](https://pypi.org/project/scoutwyze-compute/) |
| [⟦T337⟧](https://github.com/lv-analytics/liquidvision-mcp/tree/main/integrations/langchain) | [  ⟦T706⟧](https://pypi.org/project/langchain-liquidvision/) |
| [⟦T338⟧](https://tokenusage.dev/langchain) | [  ⟦T707⟧](https://pypi.org/project/langchain-tokenusage-dev/) |
| [⟦T339⟧](https://pypi.org/project/langchain-alterlab/) | [  ⟦T708⟧](https://pypi.org/project/langchain-alterlab/) |
| [⟦T340⟧](https://sealkeeper.run/docs/langchain) | [  ⟦T709⟧](https://pypi.org/project/langchain-sealkeeper/) |
| [⟦T341⟧](https://pypi.org/project/langchain-finzdata/) | [  ⟦T710⟧](https://pypi.org/project/langchain-finzdata/) |
| [⟦T342⟧](https://hlido.eu/docs/) | [  ⟦T711⟧](https://pypi.org/project/hlido-trust/) |
| [⟦T343⟧](https://tempguru.co/ai-agents) | [  ⟦T712⟧](https://pypi.org/project/tempguru/) |
| [⟦T344⟧](https://github.com/Walkover-Web-Solution/viasocket-apps/tree/main/python#langchain) | [  ⟦T713⟧](https://pypi.org/project/viasocket/) |
| [⟦T345⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T714⟧](https://pypi.org/project/langchain-hyperresearch/) |
| [⟦T346⟧](https://sofya.co/docs/langchain) | [  ⟦T715⟧](https://pypi.org/project/langchain-sofya/) |
| [⟦T347⟧](https://lanerouter.com/docs#langchain) | [  ⟦T716⟧](https://pypi.org/project/langchain-lanerouter/) |
| [⟦T348⟧](https://github.com/rascal-3/chainanalyzer-mcp/tree/main/packages/langchain-chainanalyzer) | [  ⟦T717⟧](https://pypi.org/project/langchain-chainanalyzer/) |
| [⟦T349⟧](https://github.com/Jona1245/agentdatahub-python#readme) | [  ⟦T718⟧](https://pypi.org/project/agentdatahub/) |
| [⟦T350⟧](https://github.com/etfiq/etfiq-connectors/tree/main/langchain-etfiq) | [  ⟦T719⟧](https://pypi.org/project/langchain-etfiq/) |
| [⟦T351⟧](https://github.com/octogen-ai/octogen-dev/tree/main/integrations/langchain#readme) | [  ⟦T720⟧](https://pypi.org/project/langchain-storerouter/) |
| [⟦T352⟧](https://github.com/arcnm/langchain-arcnm#readme) | [  ⟦T721⟧](https://pypi.org/project/langchain-arcnm/) |
| [⟦T353⟧](https://github.com/Solvecha/solvecha-skills/tree/main/python) | [  ⟦T722⟧](https://pypi.org/project/solvecha/) |
| [⟦T354⟧](https://github.com/stophydotdev/stophy/tree/main/sdk/packages/langchain) | [  ⟦T723⟧](https://pypi.org/project/langchain-stophy/) |
| [⟦T355⟧](https://github.com/video-gen/langchain-videogen#readme) | [  ⟦T724⟧](https://pypi.org/project/langchain-videogen/) |
| [⟦T356⟧](https://github.com/nohosa001-pixel/x402-cleanweb-agent/tree/main/packages/langchain-x402-cleanweb#readme) |不适用 |
| [⟦T357⟧](https://x402check.dev) |不适用 |
| [⟦T358⟧](https://agentlair.dev/docs) |不适用 |
| [⟦T359⟧](https://github.com/kochetkov-ma/langchain-brewpage#readme) |不适用 |
| [⟦T360⟧](https://browserless.io) |不适用 |
| [⟦T361⟧](https://cleave.fi/docs/agents/langchain) |不适用 |
| [⟦T362⟧](https://github.com/faxforagents/langchain-faxforagents/blob/main/README.md) |不适用 |
| [⟦T363⟧](https://github.com/fokals/langchain-fokals#readme) |不适用 |
| [⟦T364⟧](https://github.com/Sandeep85Das/langchain-frame) |不适用 |
| [⟦T365⟧](https://huangtingflux.com/integrations/langchain) |不适用 |
| [⟦T366⟧](https://popnow.ai/docs/langchain) |不适用 |
| [⟦T367⟧](https://sidequestpays.com/docs#langchain) |不适用 |
| [⟦T368⟧](/oss/python/integrations/tools/stagehand) |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。