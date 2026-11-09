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
| [Gmail Toolkit](/oss/python/integrations/tools/google_gmail) |免费，每个用户每秒的配额单位限制为 250 个 |
| [GoodSender Toolkit](https://goodsender.com/docs) |免费套餐（100,000 封电子邮件/月），无需信用卡 |
| [AgentLine Toolkit](https://docs.agentline.cloud) |一次性 2 美元/号码，每分钟通话 0.10 美元，即用即付 |
| [AgentMail Toolkit](https://docs.agentmail.to/) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentmail.to) |
| [AgenticEmail Toolkit](https://agenticemail.dev/docs) |免费套餐可用，之后有 [paid plans](https://agenticemail.dev/pricing) |
| [AgentPhone Toolkit](https://docs.agentphone.to) |免费套餐可用，之后有 [pay-as-you-go pricing](https://agentphone.to) |
| [e2a](https://e2a.dev) |免费套餐可用，之后有 [flat-rate paid plans](https://e2a.dev) |
| [Pidgeon Toolkit](https://pidgeon.ai/docs/langchain) |免费套餐（3 个收件箱，每月发送 3,000 封电子邮件），之后带有 [paid plans](https://pidgeon.ai/pricing) |
| [ReplyLayer Toolkit](https://replylayer.ai/docs/guides/langchain) |公测：免费沙盒试用，之后有[paid tiers](https://replylayer.ai/pricing) |
| [Verifly](https://verifly.email/docs) |免费套餐可用 |
| [Simplepages Toolkit](https://simplepages.ai/mcp) |提供免费层（草稿页），使用 [paid plans](https://simplepages.ai/pricing) 进行发布 |

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
| [MCP Toolbox](/oss/python/integrations/tools/mcp_toolbox) |任何SQL操作 |
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
| [Axiora](https://axiora.dev/docs) |免费 API 密钥 |来自 EDINET 文件、健康评分、筛查和英文文件翻译的日本上市公司财务信息。 |
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
| [Tonic Textual](https://textual.tonic.ai) |需要帐号 |检测、提取、合成或标记文本、JSON、HTML 和文件中的 PII。 || [ERC-8004](https://github.com/Conrad-sudo/langchain-erc8004) |免费|在将工作委派给 ERC-8004 代理之前对其进行审查：根据其发布的注册文件验证其链上身份，读取指定审阅者的声誉反馈，并将注册表写入准备为执行计划。 |
| [Fizzl](https://fizzl.eu/agents/python/) |免费快速检查；每次调用完整支票 $0.01–$0.02 (x402) |在代理签名之前检查交易、代币批准或签名（绿色/橙色/红色，并说明原因，加上交易模拟）、购买之前的代币、钱包的开放批准以及支付之前的已付费 x402 端点。 |

## 媒体生成

下表显示了生成视频、图像或音频资源的工具：|工具/工具包 |定价|能力|
| - | - | - |
| [Magic Hour](https://docs.magichour.ai) |免费套餐（400 积分 + 100/天）|使用 Sora 2、Veo 3.1、Kling 3.0、WAN 2.2、GPT-image、Nano Banana Pro 进行文本到视频、图像到视频和图像生成。同步和异步，返回 URL 或本地下载。 |
| [PopNow](https://popnow.ai/docs/langchain) |以美元即用即付，每次通话首先报价 |使用 Nano Banana、GPT Image、Seedream、Kling、MiniMax H3、Seedance、Wan、Suno 和 Gemini TTS 进行图像生成和编辑、文本到视频、图像到视频、音乐和文本到语音。同步和异步，返回 URL。 |

## 所有工具和工具包|整合|下载 |
| :-| :-|
| [⟦T0⟧](/oss/python/integrations/tools/google_imagen) | [  ⟦T374⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T1⟧](/oss/python/integrations/tools/google_gmail) | [  ⟦T375⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T2⟧](/oss/python/integrations/tools/google_calendar) | [  ⟦T376⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T3⟧](/oss/python/integrations/tools/google_cloud_texttospeech) | [  ⟦T377⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T4⟧](/oss/python/integrations/tools/google_search) | [  ⟦T378⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T5⟧](/oss/python/integrations/tools/bedrock_agentcore_browser) | [  ⟦T379⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T6⟧](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | [  ⟦T380⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T7⟧](/oss/python/integrations/tools/bedrock_agentcore_web_search) | [  ⟦T381⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T8⟧](/oss/python/integrations/tools/tavily_crawl) | [  ⟦T382⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T9⟧](/oss/python/integrations/tools/tavily_extract) | [  ⟦T383⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T10⟧](/oss/python/integrations/tools/tavily_map) | [  ⟦T384⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T11⟧](/oss/python/integrations/tools/tavily_search) | [  ⟦T385⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T12⟧](/oss/python/integrations/tools/azure_logic_apps) | [  ⟦T386⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T13⟧](/oss/python/integrations/tools/azure_ai) | [  ⟦T387⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T14⟧](/oss/python/integrations/tools/azure_ai_services) | [  ⟦T388⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T15⟧](/oss/python/integrations/tools/databricks) | [  ⟦T389⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T16⟧](/oss/python/integrations/tools/composio) | [  ⟦T390⟧](https://pypi.org/project/composio-langchain/) |
| [⟦T17⟧](/oss/python/integrations/tools/ibm_watsonx_sql) | [  ⟦T391⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T18⟧](/oss/python/integrations/tools/ibm_watsonx) | [  ⟦T392⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T19⟧](/oss/python/integrations/tools/perplexity_search) | [  ⟦T393⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T20⟧](/oss/python/integrations/tools/oracleai) | [  ⟦T394⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T21⟧](/oss/python/integrations/tools/exa_search) | [  ⟦T395⟧](https://pypi.org/project/langchain-exa/) |
| [⟦T22⟧](/oss/python/integrations/tools/parallel_extract) | [  ⟦T396⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T23⟧](/oss/python/integrations/tools/parallel_findall) | [  ⟦T397⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T24⟧](/oss/python/integrations/tools/parallel_monitor) | [  ⟦T398⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T25⟧](/oss/python/integrations/tools/parallel_search) | [  ⟦T399⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T26⟧](/oss/python/integrations/tools/parallel_task) | [  ⟦T400⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T27⟧](/oss/python/integrations/tools/azure_dynamic_sessions) | [  ⟦T401⟧](https://pypi.org/project/langchain-azure-dynamic-sessions/) |
| [⟦T28⟧](https://docs.scalekit.com/agentkit/quickstart/) | [  ⟦T402⟧](https://pypi.org/project/scalekit-sdk-python/) |
| [⟦T29⟧](/oss/python/integrations/tools/upstage_groundedness_check) | [  ⟦T403⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T30⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T404⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T31⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | [  ⟦T405⟧](https://pypi.org/project/m3-memory/) |
| [⟦T32⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T406⟧](https://pypi.org/project/semantica/) |
| [⟦T33⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T407⟧](https://pypi.org/project/semantica/) |
| [⟦T34⟧](https://github.com/emmanuelorta/crawlcheck-core/tree/main/sdk-python#langchain-and-llamaindex-1100) | [  ⟦T408⟧](https://pypi.org/project/crawlcheck/) |
| [⟦T35⟧](/oss/python/integrations/tools/stripe) | [  ⟦T409⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T36⟧](https://github.com/memgraph/langchain-memgraph) | [  ⟦T410⟧](https://pypi.org/project/langchain-memgraph/) |
| [⟦T37⟧](/oss/python/integrations/tools/stripe) | [  ⟦T411⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T38⟧](https://github.com/gazoy/langchain-foliant#readme) | [  ⟦T412⟧](https://pypi.org/project/langchain-foliant/) |
| [⟦T39⟧](/oss/python/integrations/tools/google_drive) | [  ⟦T413⟧](https://pypi.org/project/langchain-googledrive/) |
| [⟦T40⟧](https://bowmark.ai/docs/langchain) | [  ⟦T414⟧](https://pypi.org/project/langchain-bowmark/) |
| [⟦T41⟧](https://pypi.org/project/langchain-compass/) | [  ⟦T415⟧](https://pypi.org/project/langchain-compass/) |
| [⟦T42⟧](https://fizzl.eu/agents/python/) | [  ⟦T416⟧](https://pypi.org/project/fizzl/) |
| [⟦T43⟧](/oss/python/integrations/tools/mcp_toolbox) | [  ⟦T417⟧](https://pypi.org/project/toolbox-langchain/) |
| [⟦T44⟧](https://adeu.ai) | [  ⟦T418⟧](https://pypi.org/project/langchain-adeu/) |
| [⟦T45⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain-python) | [  ⟦T419⟧](https://pypi.org/project/langchain-arcmira/) |
| [⟦T46⟧](/oss/python/integrations/tools/cdp_agentkit) | [  ⟦T420⟧](https://pypi.org/project/coinbase-agentkit-langchain/) |
| [⟦T47⟧](https://docs.firecrawl.dev) | [  ⟦T421⟧](https://pypi.org/project/langchain-firecrawl/) |
| [⟦T48⟧](https://github.com/LinkupPlatform/langchain-linkup) | [  ⟦T422⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T49⟧](https://docs.pexafy.com/langchain) | [  ⟦T423⟧](https://pypi.org/project/langchain-pexafy/) |
| [⟦T50⟧](https://pidgeon.ai/docs/langchain) | [  ⟦T424⟧](https://pypi.org/project/langchain-pidgeon/) |
| [⟦T51⟧](https://scavio.dev/docs/langchain) | [  ⟦T425⟧](https://pypi.org/project/langchain-scavio/) |
| [⟦T52⟧](https://github.com/ScrapeGraphAI/langchain-scrapegraph) | [  ⟦T426⟧](https://pypi.org/project/langchain-scrapegraph/) |
| [⟦T53⟧](https://github.com/Shikenso-Analytics/langchain-taiga) | [  ⟦T427⟧](https://pypi.org/project/langchain-taiga/) |
| [⟦T54⟧](https://pypi.org/project/langchain-alex/) | [  ⟦T428⟧](https://pypi.org/project/langchain-alex/) |
| [⟦T55⟧](https://github.com/botsrated/botsrated/tree/main/integrations/langchain) | [  ⟦T429⟧](https://pypi.org/project/langchain-botsrated/) |
| [⟦T56⟧](https://docs.brightdata.com/scraping-automation/serp-api/introduction) | [  ⟦T430⟧](https://pypi.org/project/langchain-brightdata/) || [⟦T57⟧](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) | [  ⟦T431⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T58⟧](https://docs.brightdata.com/datasets/scrapers/overview) | [  ⟦T432⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T59⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T433⟧](https://pypi.org/project/langchain-decodo/) |
| [⟦T60⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T434⟧](https://pypi.org/project/langchain-decodo/) |
| [⟦T61⟧](https://docs.dexpaprika.com) | [  ⟦T435⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T62⟧](https://github.com/rocosen/langchain-flashdata) | [  ⟦T436⟧](https://pypi.org/project/langchain-flashdata/) |
| [⟦T63⟧](https://docs.hindsight.vectorize.io/sdks/integrations/langgraph) | [  ⟦T437⟧](https://pypi.org/project/hindsight-langgraph/) |
| [⟦T64⟧](https://github.com/agentbeacon-hq/clients) | [  ⟦T438⟧](https://pypi.org/project/langchain-openpath/) |
| [⟦T65⟧](https://replylayer.ai/docs/guides/langchain) | [  ⟦T439⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T66⟧](https://pypi.org/project/langchain-send21/) | [  ⟦T440⟧](https://pypi.org/project/langchain-send21/) |
| [⟦T67⟧](https://serpex.dev/docs) | [  ⟦T441⟧](https://pypi.org/project/langchain-serpex-python/) |
| [⟦T68⟧](https://synmerco.com/docs) | [  ⟦T442⟧](https://pypi.org/project/synmerco-langchain/) |
| [⟦T69⟧](https://urlpipe.dev/integrations/langchain) | [  ⟦T443⟧](https://pypi.org/project/langchain-urlpipe/) |
| [⟦T70⟧](https://github.com/ADS4GPTs/ads4gpts) | [  ⟦T444⟧](https://pypi.org/project/ads4gpts-langchain/) |
| [⟦T71⟧](https://github.com/thyn-ai/algenta-integrations/tree/main/python/langchain-algenta#readme) | [  ⟦T445⟧](https://pypi.org/project/langchain-algenta/) |
| [⟦T72⟧](https://anakin.io/docs/documentation) | [  ⟦T446⟧](https://pypi.org/project/langchain-anakin/) |
| [⟦T73⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T447⟧](https://pypi.org/project/langchain-atomicmail/) |
| [⟦T74⟧](https://cloro.dev/docs/) | [  ⟦T448⟧](https://pypi.org/project/langchain-cloro/) |
| [⟦T75⟧](https://docs.dexpaprika.com) | [  ⟦T449⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T76⟧](https://e2a.dev) | [  ⟦T450⟧](https://pypi.org/project/e2a/) |
| [⟦T77⟧](https://github.com/MehdiZare/langchain-fmp-data) | [  ⟦T451⟧](https://pypi.org/project/langchain-fmp-data/) |
| [⟦T78⟧](https://docs.goodmem.ai) | [  ⟦T452⟧](https://pypi.org/project/langchain-goodmem/) |
| [⟦T79⟧](https://dev.writer.com/home/introduction) | [  ⟦T453⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T80⟧](https://github.com/edtool79-collab/hirepulse-open-source#langchain-and-crewai-gateway-tools-030) | [  ⟦T454⟧](https://pypi.org/project/hirepulse-tools/) |
| [⟦T81⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T455⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T82⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T456⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T83⟧](https://10ml.com/perfume-mcp-server) | [  ⟦T457⟧](https://pypi.org/project/langchain-10ml-perfume/) |
| [⟦T84⟧](https://langchain-prolog.readthedocs.io/en/stable/) | [  ⟦T458⟧](https://pypi.org/project/langchain-prolog/) |
| [⟦T85⟧](https://pypi.org/project/langchain-swarmmemo/) | [  ⟦T459⟧](https://pypi.org/project/langchain-swarmmemo/) |
| [⟦T86⟧](https://www.maximem.ai/) | [  ⟦T460⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T87⟧](https://github.com/tanod-labs/integrations/tree/main/langchain) | [  ⟦T461⟧](https://pypi.org/project/langchain-tanod/) |
| [⟦T88⟧](https://github.com/sriram7737/pramagent) | [  ⟦T462⟧](https://pypi.org/project/pramagent/) |
| [⟦T89⟧](https://github.com/econdash/econdash-python/blob/main/packages/langchain-econdash/README.md) | [  ⟦T463⟧](https://pypi.org/project/langchain-econdash/) |
| [⟦T90⟧](https://github.com/verdixapi/langchain-verdix#readme) | [  ⟦T464⟧](https://pypi.org/project/langchain-verdix/) |
| [⟦T91⟧](https://docs.apiverve.com/integrations/langchain) | [  ⟦T465⟧](https://pypi.org/project/langchain-apiverve/) |
| [⟦T92⟧](https://specstream.ai/docs/langchain) | [  ⟦T466⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T93⟧](https://github.com/datumline/datumline-agent-guard#langchain) | [  ⟦T467⟧](https://pypi.org/project/datumline-agent-guard/) |
| [⟦T94⟧](https://you.com/docs/integrations/langchain) | [  ⟦T468⟧](https://pypi.org/project/langchain-youdotcom/) ​​|
| [⟦T95⟧](https://gatecoreai.com/docs/) | [  ⟦T469⟧](https://pypi.org/project/gatecore-langchain/) |
| [⟦T96⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | [  ⟦T470⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T97⟧](https://github.com/beepboop2025/langchain-financial-evidence#readme) | [  ⟦T471⟧](https://pypi.org/project/langchain-financial-evidence/) |
| [⟦T98⟧](https://github.com/colesmcintosh/langchain-salesforce) | [  ⟦T472⟧](https://pypi.org/project/langchain-salesforce/) |
| [⟦T99⟧](https://reefapi.com/docs/langchain) | [  ⟦T473⟧](https://pypi.org/project/langchain-reefapi/) |
| [⟦T100⟧](https://github.com/twittrapi/langchain-twittrapi#readme) | [  ⟦T474⟧](https://pypi.org/project/langchain-twittrapi/) |
| [⟦T101⟧](https://www.newscatcherapi.com/docs/web-search-api/integrations/langchain) | [  ⟦T475⟧](https://pypi.org/project/langchain-catchall/) |
| [⟦T102⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T476⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T103⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T477⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T104⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T478⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T105⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T479⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T106⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T480⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T107⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T481⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T108⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T482⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T109⟧](https://github.com/olostep-api/langchain-olostep#readme) | [  ⟦T483⟧](https://pypi.org/project/langchain-olostep/) |
| [⟦T110⟧](https://mesharc.dev/docs/langchain) | [  ⟦T484⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T111⟧](https://mesharc.dev/docs/langchain) | [  ⟦T485⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T112⟧](https://agentsearchhq.com/blog/add-web-search-to-langchain-agent?utm_source=langchain-docs\&utm_medium=integration-listing\&utm_campaign=promo-oct26) | [  ⟦T486⟧](https://pypi.org/project/langchain-agentsearch/) || [⟦T113⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T487⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T114⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T488⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T115⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T489⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T116⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T490⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T117⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T491⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T118⟧](https://github.com/Minns-ai/langgraph-minnsdb#readme) | [  ⟦T492⟧](https://pypi.org/project/langgraph-minnsdb/) |
| [⟦T119⟧](https://docs.mrscraper.com) | [  ⟦T493⟧](https://pypi.org/project/langchain-mrscraper/) |
| [⟦T120⟧](https://github.com/Thordata/langchain-thordata) | [  ⟦T494⟧](https://pypi.org/project/langchain-thordata/) |
| [⟦T121⟧](https://github.com/robocorp/robocorp) | [  ⟦T495⟧](https://pypi.org/project/langchain-robocorp/) |
| [⟦T122⟧](https://docs.ampersend.ai) | [  ⟦T496⟧](https://pypi.org/project/langchain-ampersend/) |
| [⟦T123⟧](https://github.com/lachy3433/langchain-contextfetch#readme) | [  ⟦T497⟧](https://pypi.org/project/langchain-contextfetch/) |
| [⟦T124⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T498⟧](https://pypi.org/project/langchain-clawfetch/) |
| [⟦T125⟧](https://omfang.io/manifest-docs) | [  ⟦T499⟧](https://pypi.org/project/manifest-api/) |
| [⟦T126⟧](https://snap-render.com) | [  ⟦T500⟧](https://pypi.org/project/langchain-snaprender/) |
| [⟦T127⟧](https://webextract.dev/docs/langchain) | [  ⟦T501⟧](https://pypi.org/project/langchain-webextract/) |
| [⟦T128⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/gpt-image) | [  ⟦T502⟧](https://pypi.org/project/langchain-gpt-image-acedatacloud/) |
| [⟦T129⟧](https://www.lians.ai) | [  ⟦T503⟧](https://pypi.org/project/lians-sdk/) |
| [⟦T130⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/happyhorse) | [  ⟦T504⟧](https://pypi.org/project/langchain-happyhorse-acedatacloud/) |
| [⟦T131⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/nano-banana) | [  ⟦T505⟧](https://pypi.org/project/langchain-nano-banana-acedatacloud/) |
| [⟦T132⟧](https://specstream.ai/docs/langchain) | [  ⟦T506⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T133⟧](https://docs.zerogpu.ai) | [  ⟦T507⟧](https://pypi.org/project/langchain-zerogpu/) |
| [⟦T134⟧](https://docs.hydrafetch.com) | [  ⟦T508⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T135⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T509⟧](https://pypi.org/project/langchain-getyoutubetranscript/) |
| [⟦T136⟧](https://github.com/ourresearch/langchain-openalex#readme) | [  ⟦T510⟧](https://pypi.org/project/langchain-openalex/) |
| [⟦T137⟧](https://www.search1api.com/docs/integrations/langchain) | [  ⟦T511⟧](https://pypi.org/project/search1api-langchain/) |
| [⟦T138⟧](https://github.com/wayza-protocol/wayza-js/tree/main/packages/langchain-wayza) | [  ⟦T512⟧](https://pypi.org/project/langchain-wayza/) |
| [⟦T139⟧](https://docs.upload-post.com/guides/langchain) | [  ⟦T513⟧](https://pypi.org/project/langchain-upload-post/) |
| [⟦T140⟧](https://mixpeek.com/docs/agent-integrations/langchain) | [  ⟦T514⟧](https://pypi.org/project/langchain-mixpeek/) |
| [⟦T141⟧](https://kavel.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T515⟧](https://pypi.org/project/langchain-kavel/) |
| [⟦T142⟧](https://pinkwallet.com/agentic/connect/langchain/) | [  ⟦T516⟧](https://pypi.org/project/langchain-pink/) |
| [⟦T143⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T517⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T144⟧](https://optionsahoy.com/for-agents) | [  ⟦T518⟧](https://pypi.org/project/optionsahoy-langchain/) |
| [⟦T145⟧](/oss/python/integrations/tools/discord) | [  ⟦T519⟧](https://pypi.org/project/langchain-discord/) |
| [⟦T146⟧](https://blopus.ai/docs/) | [  ⟦T520⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T147⟧](https://blopus.ai/docs/) | [  ⟦T521⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T148⟧](https://docs.valyu.ai/home) | [  ⟦T522⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T149⟧](https://veida.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T523⟧](https://pypi.org/project/langchain-veida/) |
| [⟦T150⟧](https://github.com/fodda-ai/langchain-fodda#readme) | [  ⟦T524⟧](https://pypi.org/project/langchain-fodda/) |
| [⟦T151⟧](https://flowspeech.io/docs) | [  ⟦T525⟧](https://pypi.org/project/langchain-flowspeech/) |
| [⟦T152⟧](https://mnki.com/docs/integrations#frameworks) | [  ⟦T526⟧](https://pypi.org/project/langchain-mnki/) |
| [⟦T153⟧](https://github.com/tanvoai/langchain-tanvo#readme) | [  ⟦T527⟧](https://pypi.org/project/langchain-tanvo/) |
| [⟦T154⟧](https://github.com/EXboys/langchain-skilllite) | [  ⟦T528⟧](https://pypi.org/project/langchain-skilllite/) |
| [⟦T155⟧](https://github.com/Conrad-sudo/langchain-uniswap-v2) | [  ⟦T529⟧](https://pypi.org/project/langchain-uniswap-v2/) |
| [⟦T156⟧](https://skim402.com/docs) | [  ⟦T530⟧](https://pypi.org/project/langchain-skim/) |
| [⟦T157⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-py) | [  ⟦T531⟧](https://pypi.org/project/pushary-langgraph/) |
| [⟦T158⟧](https://github.com/dong7812/dompruner-py) | [  ⟦T532⟧](https://pypi.org/project/dompruner/) |
| [⟦T159⟧](https://pypi.org/project/ddg-langchain/) | [  ⟦T533⟧](https://pypi.org/project/ddg-langchain/) |
| [⟦T160⟧](https://docs.gnews.io/langchain) | [  ⟦T534⟧](https://pypi.org/project/langchain-gnews/) |
| [⟦T161⟧](https://docs.gnews.io/langchain) | [  ⟦T535⟧](https://pypi.org/project/langchain-gnews/) |
| [⟦T162⟧](https://pypi.org/project/langchain-gaip/) | [  ⟦T536⟧](https://pypi.org/project/langchain-gaip/) |
| [⟦T163⟧](https://graciousquotes.com/developers/langchain/) | [  ⟦T537⟧](https://pypi.org/project/langchain-graciousquotes/) |
| [⟦T164⟧](https://opedd.com/for-ai-agents) | [  ⟦T538⟧](https://pypi.org/project/langchain-opedd/) |
| [⟦T165⟧](https://agentsvc.io/docs/langchain) | [  ⟦T539⟧](https://pypi.org/project/agentsvc/) |
| [⟦T166⟧](https://precleared.dev/docs/langchain) | [  ⟦T540⟧](https://pypi.org/project/precleared/) || [⟦T167⟧](https://emaki.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T541⟧](https://pypi.org/project/langchain-emaki/) |
| [⟦T168⟧](https://docs.anchorbrowser.io/introduction) | [  ⟦T542⟧](https://pypi.org/project/langchain-anchorbrowser/) |
| [⟦T169⟧](https://github.com/oxylabs/langchain-oxylabs) | [  ⟦T543⟧](https://pypi.org/project/langchain-oxylabs/) |
| [⟦T170⟧](https://proxmint.com/docs/langchain) | [  ⟦T544⟧](https://pypi.org/project/langchain-proxmint/) |
| [⟦T171⟧](https://aidress.ai) | [  ⟦T545⟧](https://pypi.org/project/langchain-aidress/) |
| [⟦T172⟧](https://github.com/printfriendly/langchain-printfriendly#readme) | [  ⟦T546⟧](https://pypi.org/project/langchain-printfriendly/) |
| [⟦T173⟧](https://reserp.ai/docs) | [  ⟦T547⟧](https://pypi.org/project/langchain-reserp/) |
| [⟦T174⟧](https://github.com/daytonaio/daytona) | [  ⟦T548⟧](https://pypi.org/project/langchain-daytona-data-analysis/) |
| [⟦T175⟧](https://docs.1claw.xyz/docs/integrations/langchain) | [  ⟦T549⟧](https://pypi.org/project/langchain-1claw/) |
| [⟦T176⟧](https://github.com/TheSuperColony/langchain-supercolony) | [  ⟦T550⟧](https://pypi.org/project/langchain-supercolony/) |
| [⟦T177⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/seedance) | [  ⟦T551⟧](https://pypi.org/project/langchain-seedance-acedatacloud/) |
| [⟦T178⟧](https://github.com/Conrad-sudo/langchain-erc20) | [  ⟦T552⟧](https://pypi.org/project/langchain-erc20/) |
| [⟦T179⟧](https://docs.dappier.com/) | [  ⟦T553⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T180⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#alfrescotoolkit) | [  ⟦T554⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T181⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#documentumtoolkit) | [  ⟦T555⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T182⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#filenetp8toolkit) | [  ⟦T556⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T183⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#onbasetoolkit) | [  ⟦T557⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T184⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md) | [  ⟦T558⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T185⟧](https://github.com/mavdol/langchain-capsule) | [  ⟦T559⟧](https://pypi.org/project/langchain-capsule/) |
| [⟦T186⟧](https://github.com/agent-help-network/agent-help-network/blob/main/clients/langchain-ahn/README.md) | [  ⟦T560⟧](https://pypi.org/project/langchain-ahn/) |
| [⟦T187⟧](https://github.com/tokportal/langchain-tokportal) | [  ⟦T561⟧](https://pypi.org/project/langchain-tokportal/) |
| [⟦T188⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T562⟧](https://pypi.org/project/langchain-talordata/) |
| [⟦T189⟧](https://github.com/jmendozapuche/langchain-latam-synth) | [  ⟦T563⟧](https://pypi.org/project/langchain-latam-synth/) |
| [⟦T190⟧](/oss/python/integrations/tools/tableau) | [  ⟦T564⟧](https://pypi.org/project/langchain-tableau/) |
| [⟦T191⟧](https://cosmergon.com) | [  ⟦T565⟧](https://pypi.org/project/langchain-cosmergon/) |
| [⟦T192⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | [  ⟦T566⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T193⟧](https://docs.memoryrouter.ai/langchain) | [  ⟦T567⟧](https://pypi.org/project/langchain-memoryrouter/) |
| [⟦T194⟧](https://paysafe-agent.com) | [  ⟦T568⟧](https://pypi.org/project/langchain-paysafe/) |
| [⟦T195⟧](https://axiora.dev/docs) | [  ⟦T569⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T196⟧](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) | [  ⟦T570⟧](https://pypi.org/project/serpapi-search-tools/) |
| [⟦T197⟧](https://alphai.io/developers) | [  ⟦T571⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T198⟧](https://alphai.io/developers) | [  ⟦T572⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T199⟧](https://alphai.io/developers) | [  ⟦T573⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T200⟧](https://alphai.io/developers) | [  ⟦T574⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T201⟧](https://greencalculus.com/guides/emission-factors-langchain/) | [  ⟦T575⟧](https://pypi.org/project/langchain-greencalculus/) |
| [⟦T202⟧](https://api.relayshield.net/developers) | [  ⟦T576⟧](https://pypi.org/project/langchain-relayshield/) |
| [⟦T203⟧](https://strale.dev/docs) | [  ⟦T577⟧](https://pypi.org/project/langchain-strale/) |
| [⟦T204⟧](https://www.ictinnovations.com/) | [  ⟦T578⟧](https://pypi.org/project/langchain-ictfax/) |
| [⟦T205⟧](https://github.com/getanyapi-com/integrations/tree/main/langchain-anyapi) | [  ⟦T579⟧](https://pypi.org/project/langchain-anyapi/) |
| [⟦T206⟧](https://docs.keenable.ai) | [  ⟦T580⟧](https://pypi.org/project/langchain-keenable/) |
| [⟦T207⟧](https://github.com/lfg-gm/langchain-lfg#readme) | [  ⟦T581⟧](https://pypi.org/project/langchain-lfg/) |
| [⟦T208⟧](https://www.agentrails.io/docs) | [  ⟦T582⟧](https://pypi.org/project/langchain-x402/) |
| [⟦T209⟧](https://github.com/authzed/langchain-spicedb) | [  ⟦T583⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T210⟧](https://github.com/Layrcake-dev/langchain-layrcake#readme) | [  ⟦T584⟧](https://pypi.org/project/langchain-layrcake/) |
| [⟦T211⟧](https://gandr.ai/docs) | [  ⟦T585⟧](https://pypi.org/project/gandr-langchain/) |
| [⟦T212⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T586⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T213⟧](https://github.com/valthera/langchain-valthera) | [  ⟦T587⟧](https://pypi.org/project/langchain-valthera/) |
| [⟦T214⟧](https://docs.spidra.io) | [  ⟦T588⟧](https://pypi.org/project/langchain-spidra/) |
| [⟦T215⟧](https://tablejourney.com/agents/#langchain) | [  ⟦T589⟧](https://pypi.org/project/langchain-tablejourney/) |
| [⟦T216⟧](https://github.com/yumaheymans/langchain-carejobs#readme) | [  ⟦T590⟧](https://pypi.org/project/langchain-carejobs/) |
| [⟦T217⟧](https://github.com/e7217/langchain-naver-community) | [  ⟦T591⟧](https://pypi.org/project/langchain-naver-community/) |
| [⟦T218⟧](https://docs.scraperapi.com/) | [  ⟦T592⟧](https://pypi.org/project/langchain-scraperapi/) |
| [⟦T219⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T593⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T220⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T594⟧](https://pypi.org/project/langchain-scrapingbee/) || [⟦T221⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T595⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T222⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T596⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T223⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T597⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T224⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T598⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T225⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T599⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T226⟧](https://preclick.ai/) | [  ⟦T600⟧](https://pypi.org/project/langchain-urlcheck/) |
| [⟦T227⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T601⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T228⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T602⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T229⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T603⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T230⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T604⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T231⟧](https://querit.com/docs) | [  ⟦T605⟧](https://pypi.org/project/langchain-querit/) |
| [⟦T232⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T606⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T233⟧](https://github.com/plivo-dev/langchain-plivo-tools) | [  ⟦T607⟧](https://pypi.org/project/langchain-plivo-tools/) |
| [⟦T234⟧](https://github.com/vectara/langchain-vectara) | [  ⟦T608⟧](https://pypi.org/project/langchain-vectara/) |
| [⟦T235⟧](https://www.xpoz.ai/docs) | [  ⟦T609⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T236⟧](https://docs.lakesail.com/sail/latest/guide/integrations/langchain.html) | [  ⟦T610⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T237⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/suno) | [  ⟦T611⟧](https://pypi.org/project/langchain-suno-acedatacloud/) |
| [⟦T238⟧](https://docs.agentql.com/home) | [  ⟦T612⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T239⟧](https://docs.yutori.com) | [  ⟦T613⟧](https://pypi.org/project/langchain-yutori/) |
| [⟦T240⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T614⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T241⟧](https://github.com/permitio/langchain-permit) | [  ⟦T615⟧](https://pypi.org/project/langchain-permit/) |
| [⟦T242⟧](https://docs.agentql.com/home) | [  ⟦T616⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T243⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T617⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T244⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T618⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T245⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T619⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T246⟧](https://github.com/Amitgb14/langchain_jenkins) | [  ⟦T620⟧](https://pypi.org/project/langchain-jenkins/) |
| [⟦T247⟧](https://docs.lakesail.com/sail/main/guide/integrations/langchain/) | [  ⟦T621⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T248⟧](https://github.com/gridpin/gridpin/tree/main/integrations/langchain) | [  ⟦T622⟧](https://pypi.org/project/langchain-gridpin/) |
| [⟦T249⟧](https://www.xpoz.ai/docs) | [  ⟦T623⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T250⟧](https://www.agentfetch.dev) | [  ⟦T624⟧](https://pypi.org/project/langchain-agentfetch/) |
| [⟦T251⟧](https://github.com/fastaf-co/fastaf-integrations/tree/main/langchain-fastaf) | [  ⟦T625⟧](https://pypi.org/project/langchain-fastaf/) |
| [⟦T252⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T626⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T253⟧](https://docs.proxyhat.com) | [  ⟦T627⟧](https://pypi.org/project/langchain-proxyhat/) |
| [⟦T254⟧](https://platform.iflow.cn/) | [  ⟦T628⟧](https://pypi.org/project/iflow-search-langchain/) |
| [⟦T255⟧](https://docs.livetennisapi.com) | [  ⟦T629⟧](https://pypi.org/project/langchain-livetennis/) |
| [⟦T256⟧](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) | [  ⟦T630⟧](https://pypi.org/project/nodeproxy-tools/) |
| [⟦T257⟧](https://docs.webz.io/docs/webz/news-search-api-mcp) | [  ⟦T631⟧](https://pypi.org/project/langchain-webz/) |
| [⟦T258⟧](https://lumify.ai/docs/ai) | [  ⟦T632⟧](https://pypi.org/project/langchain-lumify/) |
| [⟦T259⟧](https://docs.ipay.sh) | [  ⟦T633⟧](https://pypi.org/project/langchain-pr402/) |
| [⟦T260⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T634⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T261⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T635⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T262⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T636⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T263⟧](https://docs.opengradient.ai/) | [  ⟦T637⟧](https://pypi.org/project/langchain-opengradient/) |
| [⟦T264⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T638⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T265⟧](https://asyntai.com/documentation/integrations/langchain/) | [  ⟦T639⟧](https://pypi.org/project/langchain-asyntai/) |
| [⟦T266⟧](https://lyrenth.com/docs/integrations) | ⟦T1384​​⟧ |
| [⟦T267⟧](https://crustapi.com/docs) | [  ⟦T641⟧](https://pypi.org/project/langchain-crustapi/) |
| [⟦T268⟧](https://useagentgate.com/docs) | [  ⟦T642⟧](https://pypi.org/project/langchain-agentgate/) |
| [⟦T269⟧](https://github.com/stardog-union/stardog-langchain) | [  ⟦T643⟧](https://pypi.org/project/langchain-stardog/) |
| [⟦T270⟧](https://github.com/auscahq/ausca/tree/main/python/langchain-ausca) | [  ⟦T644⟧](https://pypi.org/project/langchain-ausca/) |
| [⟦T271⟧](https://github.com/Scottcjn/langchain-rustchain) | [  ⟦T645⟧](https://pypi.org/project/langchain-rustchain-tools/) |
| [⟦T272⟧](https://docs.sidclaw.com/docs/integrations/langchain) | [  ⟦T646⟧](https://pypi.org/project/langchain-sidclaw/) |
| [⟦T273⟧](https://github.com/Toloka/tendem-mcp/tree/main/integrations/langchain-tendem#readme) | [  ⟦T647⟧](https://pypi.org/project/langchain-tendem/) |
| [⟦T274⟧](https://api.netnestdesign.com/docs) | [  ⟦T648⟧](https://pypi.org/project/langchain-netnest/) || [⟦T275⟧](https://pinchwork.dev) | [  ⟦T649⟧](https://pypi.org/project/pinchwork/) |
| [⟦T276⟧](https://docs.agentmail.to/welcome) | [  ⟦T650⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T277⟧](https://github.com/meetdewey/langchain-dewey) | [  ⟦T651⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T278⟧](https://kerq.dev/docs) | [  ⟦T652⟧](https://pypi.org/project/langchain-kerq/) |
| [⟦T279⟧](https://w2a-protocol.org/) | [  ⟦T653⟧](https://pypi.org/project/langchain-w2a/) |
| [⟦T280⟧](https://www.football-charts.com/developers) | [  ⟦T654⟧](https://pypi.org/project/langchain-footballcharts/) |
| [⟦T281⟧](https://modexia.software/docs) | [  ⟦T655⟧](https://pypi.org/project/langchain-modexia/) |
| [⟦T282⟧](https://agenticemail.dev/docs) | [  ⟦T656⟧](https://pypi.org/project/langchain-agenticemail/) |
| [⟦T283⟧](https://www.clawmessenger.com/blog/langchain-imessage-integration) | [  ⟦T657⟧](https://pypi.org/project/langchain-claw-messenger/) |
| [⟦T284⟧](https://ictpbx.com) | [  ⟦T658⟧](https://pypi.org/project/langchain-ictpbx/) |
| [⟦T285⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-ask) | [  ⟦T659⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T286⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search) | [  ⟦T660⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T287⟧](https://github.com/oddsrelay/langchain-oddsrelay) | [  ⟦T661⟧](https://pypi.org/project/langchain-oddsrelay/) |
| [⟦T288⟧](https://docs.context.dev) | [  ⟦T662⟧](https://pypi.org/project/langchain-context/) |
| [⟦T289⟧](https://www.searchapi.io/docs/google) | [  ⟦T663⟧](https://pypi.org/project/langchain-searchapi/) |
| [⟦T290⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T664⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T291⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T665⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T292⟧](https://proxyclaw.ai/docs) | [  ⟦T666⟧](https://pypi.org/project/langchain-proxyclaw/) |
| [⟦T293⟧](https://quanticdata.io/docs/) | [  ⟦T667⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T294⟧](https://docs.octen.ai) | [  ⟦T668⟧](https://pypi.org/project/langchain-octen/) |
| [⟦T295⟧](https://docs.hashlock.markets/) | [  ⟦T669⟧](https://pypi.org/project/langchain-hashlock/) |
| [⟦T296⟧](/oss/python/integrations/tools/privy) | [  ⟦T670⟧](https://pypi.org/project/langchain-privy/) |
| [⟦T297⟧](https://ai-identity.co/docs) | [  ⟦T671⟧](https://pypi.org/project/langchain-ai-identity/) |
| [⟦T298⟧](https://synoppy.com/docs) | [  ⟦T672⟧](https://pypi.org/project/langchain-synoppy/) |
| [⟦T299⟧](https://bidda.com/developers) | [  ⟦T673⟧](https://pypi.org/project/langchain-bidda/) |
| [⟦T300⟧](https://docs.magichour.ai) | [  ⟦T674⟧](https://pypi.org/project/langchain-magic-hour/) |
| [⟦T301⟧](https://instanode.dev/docs) | [  ⟦T675⟧](https://pypi.org/project/langchain-instanode/) |
| [⟦T302⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T676⟧](https://pypi.org/project/langchain-aproxpay/) |
| [⟦T303⟧](https://simplepages.ai/mcp) | [  ⟦T677⟧](https://pypi.org/project/langchain-simplepages/) |
| [⟦T304⟧](https://github.com/tilotech/tilores-langchain) | [  ⟦T678⟧](https://pypi.org/project/tilores-langchain/) |
| [⟦T305⟧](https://docs.agentphone.ai/welcome) | [  ⟦T679⟧](https://pypi.org/project/langchain-agentphone/) |
| [⟦T306⟧](https://ceki.me) | [  ⟦T680⟧](https://pypi.org/project/langchain-ceki/) |
| [⟦T307⟧](https://www.ictlms.net) | [  ⟦T681⟧](https://pypi.org/project/langchain-ictexam/) |
| [⟦T308⟧](https://github.com/nozomio-labs/nia-langchain) | [  ⟦T682⟧](https://pypi.org/project/langchain-nia/) |
| [⟦T309⟧](https://verifly.email/docs) | [  ⟦T683⟧](https://pypi.org/project/langchain-verifly/) |
| [⟦T310⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T684⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T311⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T685⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T312⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T686⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T313⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T687⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T314⟧](https://github.com/witanmarkets/langchain-witan#readme) | [  ⟦T688⟧](https://pypi.org/project/langchain-witan/) |
| [⟦T315⟧](https://docs.bodo.ai/) | [  ⟦T689⟧](https://pypi.org/project/langchain-bodo/) |
| [⟦T316⟧](https://coworkingview.com/en/mcp) | [  ⟦T690⟧](https://pypi.org/project/langchain-coworkingview/) |
| [⟦T317⟧](https://github.com/Keirolabs-API/langchain-keiro) | [  ⟦T691⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T318⟧](https://github.com/flipcoin-fun/flipcoin-langchain) | [  ⟦T692⟧](https://pypi.org/project/langchain-flipcoin/) |
| [⟦T319⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T693⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T320⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T694⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T321⟧](https://github.com/scrapeless-ai/langchain-scrapeless) | [  ⟦T695⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T322⟧](https://signatrust.net/docs/api) | [  ⟦T696⟧](https://pypi.org/project/langchain-signatrust/) |
| [⟦T323⟧](https://github.com/synapsoft-DA/langchain-synapsoft) | [  ⟦T697⟧](https://pypi.org/project/langchain-synapsoft/) |
| [⟦T324⟧](https://goodsender.com/docs) | [  ⟦T698⟧](https://pypi.org/project/langchain-goodsender/) |
| [⟦T325⟧](https://github.com/drasi-project/langchain-drasi) | [  ⟦T699⟧](https://pypi.org/project/langchain-drasi/) |
| [⟦T326⟧](https://unirateapi.com) | [  ⟦T700⟧](https://pypi.org/project/langchain-unirate/) |
| [⟦T327⟧](https://docs.blindfold.dev) | [  ⟦T701⟧](https://pypi.org/project/langchain-blindfold/) |
| [⟦T328⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T702⟧](https://pypi.org/project/langchain-hugging-bay/) || [⟦T329⟧](https://docs.agentline.cloud/introduction) | [  ⟦T703⟧](https://pypi.org/project/langchain-agentline/) |
| [⟦T330⟧](https://docs.delegare.dev/introduction) | [  ⟦T704⟧](https://pypi.org/project/langchain-delegare/) |
| [⟦T331⟧](https://toolstem.com) | [  ⟦T705⟧](https://pypi.org/project/langchain-toolstem/) |
| [⟦T332⟧](https://nextmail.sh/docs/python/langchain) | [  ⟦T706⟧](https://pypi.org/project/langchain-nextmail/) |
| [⟦T333⟧](https://github.com/itulo/eu-nordic-open-data-mcp/tree/main/packages/langchain-eu-nordic-open-data) | [  ⟦T707⟧](https://pypi.org/project/langchain-eu-nordic-open-data/) |
| [⟦T334⟧](https://pypi.org/project/langchain-surgemesh/) | [  ⟦T708⟧](https://pypi.org/project/langchain-surgemesh/) |
| [⟦T335⟧](https://pypi.org/project/langchain-arche/) | [  ⟦T709⟧](https://pypi.org/project/langchain-arche/) |
| [⟦T336⟧](https://github.com/seanmarkwei/langgraph-agentram) | [  ⟦T710⟧](https://pypi.org/project/langgraph-agentram/) |
| [⟦T337⟧](https://pypi.org/project/langchain-groundtruth/) | [  ⟦T711⟧](https://pypi.org/project/langchain-groundtruth/) |
| [⟦T338⟧](https://github.com/scoutwyze-max/scoutwyze-compute/blob/main/examples/README.md) | [  ⟦T712⟧](https://pypi.org/project/scoutwyze-compute/) |
| [⟦T339⟧](https://github.com/lv-analytics/liquidvision-mcp/tree/main/integrations/langchain) | [  ⟦T713⟧](https://pypi.org/project/langchain-liquidvision/) |
| [⟦T340⟧](https://tokenusage.dev/langchain) | [  ⟦T714⟧](https://pypi.org/project/langchain-tokenusage-dev/) |
| [⟦T341⟧](https://pypi.org/project/langchain-alterlab/) | [  ⟦T715⟧](https://pypi.org/project/langchain-alterlab/) |
| [⟦T342⟧](https://sealkeeper.run/docs/langchain) | [  ⟦T716⟧](https://pypi.org/project/langchain-sealkeeper/) |
| [⟦T343⟧](https://pypi.org/project/langchain-finzdata/) | [  ⟦T717⟧](https://pypi.org/project/langchain-finzdata/) |
| [⟦T344⟧](https://hlido.eu/docs/) | [  ⟦T718⟧](https://pypi.org/project/hlido-trust/) |
| [⟦T345⟧](https://tempguru.co/ai-agents) | [  ⟦T719⟧](https://pypi.org/project/tempguru/) |
| [⟦T346⟧](https://github.com/Walkover-Web-Solution/viasocket-apps/tree/main/python#langchain) | [  ⟦T720⟧](https://pypi.org/project/viasocket/) |
| [⟦T347⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T721⟧](https://pypi.org/project/langchain-hyperresearch/) |
| [⟦T348⟧](https://sofya.co/docs/langchain) | [  ⟦T722⟧](https://pypi.org/project/langchain-sofya/) |
| [⟦T349⟧](https://lanerouter.com/docs#langchain) | [  ⟦T723⟧](https://pypi.org/project/langchain-lanerouter/) |
| [⟦T350⟧](https://github.com/rascal-3/chainanalyzer-mcp/tree/main/packages/langchain-chainanalyzer) | [  ⟦T724⟧](https://pypi.org/project/langchain-chainanalyzer/) |
| [⟦T351⟧](https://github.com/Jona1245/agentdatahub-python#readme) | [  ⟦T725⟧](https://pypi.org/project/agentdatahub/) |
| [⟦T352⟧](https://github.com/alion-io/alion-sdk/tree/main/langchain#readme) | [  ⟦T726⟧](https://pypi.org/project/langchain-alion/) |
| [⟦T353⟧](https://github.com/etfiq/etfiq-connectors/tree/main/langchain-etfiq) | [  ⟦T727⟧](https://pypi.org/project/langchain-etfiq/) |
| [⟦T354⟧](https://channel3.ai/docs/langchain) | [  ⟦T728⟧](https://pypi.org/project/langchain-channel3/) |
| [⟦T355⟧](https://github.com/octogen-ai/octogen-dev/tree/main/integrations/langchain#readme) | [  ⟦T729⟧](https://pypi.org/project/langchain-storerouter/) |
| [⟦T356⟧](https://github.com/arcnm/langchain-arcnm#readme) | [  ⟦T730⟧](https://pypi.org/project/langchain-arcnm/) |
| [⟦T357⟧](https://github.com/Solvecha/solvecha-skills/tree/main/python) | [  ⟦T731⟧](https://pypi.org/project/solvecha/) |
| [⟦T358⟧](https://github.com/stophydotdev/stophy/tree/main/sdk/packages/langchain) | [  ⟦T732⟧](https://pypi.org/project/langchain-stophy/) |
| [⟦T359⟧](https://github.com/Bosco-Labs/bosco-labs-data/tree/main/langchain-bosco) | [  ⟦T733⟧](https://pypi.org/project/langchain-bosco/) |
| [⟦T360⟧](https://github.com/video-gen/langchain-videogen#readme) | [  ⟦T734⟧](https://pypi.org/project/langchain-videogen/) |
| [⟦T361⟧](https://github.com/nohosa001-pixel/x402-cleanweb-agent/tree/main/packages/langchain-x402-cleanweb#readme) |不适用 |
| [⟦T362⟧](https://x402check.dev) |不适用 |
| [⟦T363⟧](https://agentlair.dev/docs) |不适用 |
| [⟦T364⟧](https://github.com/kochetkov-ma/langchain-brewpage#readme) |不适用 |
| [⟦T365⟧](https://browserless.io) |不适用 |
| [⟦T366⟧](https://cleave.fi/docs/agents/langchain) |不适用 |
| [⟦T367⟧](https://github.com/faxforagents/langchain-faxforagents/blob/main/README.md) |不适用 |
| [⟦T368⟧](https://github.com/fokals/langchain-fokals#readme) |不适用 |
| [⟦T369⟧](https://github.com/Sandeep85Das/langchain-frame) |不适用 |
| [⟦T370⟧](https://huangtingflux.com/integrations/langchain) |不适用 |
| [⟦T371⟧](https://popnow.ai/docs/langchain) |不适用 |
| [⟦T372⟧](https://sidequestpays.com/docs#langchain) |不适用 |
| [⟦T373⟧](/oss/python/integrations/tools/stagehand) |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。