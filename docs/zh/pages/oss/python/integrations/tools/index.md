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
| [AgentSearch](https://agentsearchhq.com/blog/langchain-agent-search-then-read-page) |免费（每个 IP 每天 25 次搜索，无 API 密钥）；通过 x402 按通话付费 |网址、标题、内容；页面文本摘录 |
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
| [iFlow Search](https://platform.iflow.cn/) |付费| URL、标题、摘要、日期 || [Keenable](https://docs.keenable.ai/integrations/langchain) |提供免费无钥匙套餐 |标题、URL、摘要（页面文本）、发布日期、索引日期；用于获取的页面降价 |
| [Linkup Search](https://github.com/LinkupPlatform/langchain-linkup) |每月 2000 次免费搜索 |网址、内容、来源 |
| [Octen](https://docs.octen.ai) |付费|标题、URL、突出显示、作者、发布时间 |
| [Mixpeek](https://docs.mixpeek.com/agent-integrations/langchain) |免费套餐可用 |多模态搜索结果（视频、图像、音频、文档）|
| [Nia Toolkit](https://github.com/nozomio-labs/nia-langchain) |免费套餐可用 |代码、文档、元数据、来源 |
| [Nimble Search](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 |网址、内容、标题 |
| [Nimble Web Search Agents](https://docs.nimbleway.com/integrations/connectors/langchain#agent-api-v2-web-search-agents) |免费试用 |研究答案，来源|
| [Olostep Search](https://docs.olostep.com/integrations/langchain) | 500 个免费积分，然后付费计划 | URL、标题、描述、页面内容 |
| [Oxylabs Web API Search](https://github.com/oxylabs/langchain-oxylabs#web-api) |免费试用，然后按月计划 | URL、标题、片段 |
| [Parallel Search](/oss/python/integrations/tools/parallel_search) |付费|网址、标题、摘录 |
| [Perplexity Search](/oss/python/integrations/tools/perplexity_search) |付费（每月免费套餐）| URL、标题、摘要、日期、上次更新 |
| [Search1API Search](https://www.search1api.com/docs/integrations/langchain#search) |注册即可获得 100 个免费积分，无需信用卡 | URL、标题、片段、内容、图像 |
| [SearchApi](https://www.searchapi.io/docs/google) |每月 100 次免费搜索 | URL、片段、标题、答案框、知识图 || [Scavio](https://scavio.dev/docs/langchain) | 50 个免费积分即可开始 | URL、标题、片段、知识图、产品、视频、成绩单、社交帖子和个人资料、职位发布和薪资、房地产列表、旅行和酒店库存、应用程序商店列表、广告库创意、软件评论、本地业务数据、监管备案、提取的页面内容 |
| [TalorData SERP](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) |付费|标题、URL、摘要、位置、知识图谱、答案框、AI 概述 |
| [Tavily Search](/oss/python/integrations/tools/tavily_search) |每月 1000 次免费搜索 | URL、内容、标题、图像、答案 |
| [Webz News Search](https://docs.webz.io/docs/webz/news-search-api-mcp) |每月免费 5 美元（约 1,400 次搜索），然后即用即付 |标题、URL、主图像、发布日期、内容摘录、分数、情绪、主题、人物、组织、位置、股票代码、政治偏见、域名排名 |
| [Apify](https://docs.apify.com/integrations/langchain) |免费套餐，按次付费（因演员而异）| Actor 输出（因 Actor 而异）|
| [Xpoz](https://www.xpoz.ai/docs) |免费套餐可用 |帖子、用户个人资料、评论、参与度指标（Twitter/X、Instagram、Reddit、TikTok）|
| [You.com Search](https://you.com/docs/integrations/langchain) |注册时可获赠 100 美元积分 | URL、标题、页面内容 |
| [Querit](https://querit.com/docs) |注册后每月可免费搜索 1000 次 | URL、片段、标题、页面年龄、站点名称、站点图标 || [SerpApi Search Tools](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) |每月 250 次免费搜索 | URL、标题、摘要、答案框、知识图、AI 概述 |

## 代码解释器

下表显示了可用作代码解释器的工具：

|工具/工具包 |支持的语言 |沙盒寿命 |支持文件上传 |返回类型 |支持自托管 |
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
| [AgentMail Toolkit](https://docs.agentmail.to/) |免费套餐可用，之后使用 [pay-as-you-go pricing](https://agentmail.to) |
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
| [Oya Browser](https://oyabrowser.com/docs/sdk) |免费桌面应用程序和 1 小时云浏览器；付费云和自托管| ✅ || [W2A](https://w2a-protocol.org/docs) |免费（公共端点）| ❌ |
| [Nimble Extract](https://docs.nimbleway.com/integrations/connectors/langchain) |免费试用 | ❌ |
| [Nimble Extract Templates](https://docs.nimbleway.com/integrations/connectors/langchain#extract-templates) |免费试用 | ❌ |
| [Nimble Crawl and Map](https://docs.nimbleway.com/integrations/connectors/langchain#crawl-and-map) |免费试用 | ❌ |
| [NodeProxy](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) |每次解析 $0.002 USDC（Base 上的 x402）| \~\$0.002 USDC ❌ |
| [Olostep](https://docs.olostep.com/integrations/langchain) | 500 个免费积分，然后付费计划 | ❌ |
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
| [Vericto](https://github.com/vericto/langchain-vericto) |在运行之前检查每个 SQL 语句是否符合确定性护栏规则；受保护的 `SQLDatabase` 拒绝被阻止的语句 |

＃＃ 金融下表显示了可用于执行付款、购买等金融交易的工具：

|工具/工具包 |定价|能力|
| - | - | - |
| [Ampersend](https://docs.ampersend.ai) |付费|通过自动 x402 付款处理来支付和使用远程 AI 代理服务。 |
| [Ausca](https://github.com/auscahq/ausca/tree/main/python/langchain-ausca) | 0.10 美元至 1.35 美元 USDC/看涨期权 (x402) |按每次调用支付文档 OCR、文档分析、媒体转录、浏览器会话和代理收件箱的费用，每次调用美元上限严格且没有 API 密钥；该工具工厂适用于任何 x402 v2 资源。 |
| [FlipCoin](https://github.com/flipcoin-fun/flipcoin-langchain) |免费|通过 LMSR AMM 或 CLOB 订单簿在预测市场上交易 YES/NO 股票。 |
| [LatAm Synth](https://github.com/jmendozapuche/langchain-latam-synth) | Apify 免费套餐，然后按使用付费 |为拉丁美洲金融科技应用程序生成隐私安全的综合金融用户、储蓄目标和交易。 |
| [Axiora](https://axiora.dev/docs) |免费 API 密钥 |来自 EDINET 文件、健康评分、筛查和英文文件翻译的日本上市公司财务数据。 |
| [Delegare](https://docs.delegare.dev) |付费|通过具有内置预算护栏的 AP2 指令授权和执行多轨支付。 || [DexPaprika](https://docs.dexpaprika.com) |免费（无钥匙）|搜索代币、矿池和 DEX；读取链上 DEX 上的代币市场数据、资金池流动性和 OHLCV 价格历史记录。 |
| [PaySafe](https://paysafe-agent.com) |前 100 次 API 调用免费 |基于 x402 的防火墙，具有用于提示注入检测的自动来源标记。 |
| [Privy](/oss/python/integrations/tools/privy) |免费|创建具有可配置权限的钱包并快速执行交易。 |
| [Toolstem](https://toolstem.com) | \$0.01 USDC/看涨期权 (x402) |金融情报和 SEC EDGAR 工具，在 Base 上提供按次付费 x402 小额支付。 |
| [Uniswap V2](https://github.com/Conrad-sudo/langchain-uniswap-v2) |免费|获取实时 Uniswap V2 互换报价，并在任何 EVM 链上准备未签名的互换、批准和流动性交易。 |
| [ERC20](https://github.com/Conrad-sudo/langchain-erc20) |免费|读取 ERC20 余额、配额和元数据，并准备传输、批准和本机包装/解开，作为任何 EVM 链上 EOA 或智能合约钱包的执行计划。 |

## AI 工作流程优化

以下工具通过减少令牌使用和执行结构化 SOP 来优化 AI 代理工作流程：|工具/工具包 |定价|主要特点|
| - | - | - |
| [HuangtingFlux](https://huangtingflux.com/integrations/langchain) |免费（公共 MCP 服务器）|通过 3 阶段 SOP 减少 40% 的令牌：输入压缩、滚动汇总、输出细化 |
| [ZeroGPU](https://docs.zerogpu.ai) |基于使用 |将分类、摘要、提取和 PII 编辑卸载到专门构建的小型模型 |

## 集成平台

以下平台通过统一的界面提供对多种工具和服务的访问：

|工具/工具包 |集成数量 |定价|主要特点|
| - | - | - | - |
| [Composio](/oss/python/integrations/tools/composio) | 500+ |免费套餐可用 | OAuth 处理、事件驱动的工作流程、多用户支持 |
| [Scalekit](https://docs.scalekit.com/agentkit/quickstart/) | 500+ |免费套餐可用 |委托 OAuth、令牌库、多用户支持、LangSmith 跟踪 |

## 安全

下表显示了可用于安全相关任务的工具：|工具/工具包 |定价|能力|
| - | - | - |
| [URLCheck](https://urlcheck.dev) |每天 100 个免费请求 |在代理导航之前验证 URL 安全性。支持可选的意图感知风险分析。返回可操作的访问指令（ALLOW/DENY/RETRY_LATER）。 |
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
| [⟦T1⟧](/oss/python/integrations/tools/google_imagen) | [  ⟦T410⟧](https://pypi.org/project/langchain-google-vertexai/) |
| [⟦T2⟧](/oss/python/integrations/tools/google_gmail) | [  ⟦T411⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T3⟧](/oss/python/integrations/tools/google_calendar) | [  ⟦T412⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T4⟧](/oss/python/integrations/tools/google_cloud_texttospeech) | [  ⟦T413⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T5⟧](/oss/python/integrations/tools/google_search) | [  ⟦T414⟧](https://pypi.org/project/langchain-google-community/) |
| [⟦T6⟧](/oss/python/integrations/tools/bedrock_agentcore_browser) | [  ⟦T415⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T7⟧](/oss/python/integrations/tools/bedrock_agentcore_code_interpreter) | [  ⟦T416⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T8⟧](/oss/python/integrations/tools/bedrock_agentcore_web_search) | [  ⟦T417⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T9⟧](/oss/python/integrations/tools/tavily_crawl) | [  ⟦T418⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T10⟧](/oss/python/integrations/tools/tavily_extract) | [  ⟦T419⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T11⟧](/oss/python/integrations/tools/tavily_map) | [  ⟦T420⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T12⟧](/oss/python/integrations/tools/tavily_search) | [  ⟦T421⟧](https://pypi.org/project/langchain-tavily/) |
| [⟦T13⟧](/oss/python/integrations/tools/azure_logic_apps) | [  ⟦T422⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T14⟧](/oss/python/integrations/tools/azure_ai) | [  ⟦T423⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T15⟧](/oss/python/integrations/tools/azure_ai_services) | [  ⟦T424⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T16⟧](/oss/python/integrations/tools/databricks) | [  ⟦T425⟧](https://pypi.org/project/databricks-langchain/) |
| [⟦T17⟧](/oss/python/integrations/tools/composio) | [  ⟦T426⟧](https://pypi.org/project/composio-langchain/) |
| [⟦T18⟧](/oss/python/integrations/tools/ibm_watsonx_sql) | [  ⟦T427⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T19⟧](/oss/python/integrations/tools/ibm_watsonx) | [  ⟦T428⟧](https://pypi.org/project/langchain-ibm/) |
| [⟦T20⟧](/oss/python/integrations/tools/perplexity_search) | [  ⟦T429⟧](https://pypi.org/project/langchain-perplexity/) |
| [⟦T21⟧](/oss/python/integrations/tools/oracleai) | [  ⟦T430⟧](https://pypi.org/project/langchain-oracledb/) |
| [⟦T22⟧](/oss/python/integrations/tools/exa_search) | [  ⟦T431⟧](https://pypi.org/project/langchain-exa/) |
| [⟦T23⟧](/oss/python/integrations/tools/parallel_extract) | [  ⟦T432⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T24⟧](/oss/python/integrations/tools/parallel_findall) | [  ⟦T433⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T25⟧](/oss/python/integrations/tools/parallel_monitor) | [  ⟦T434⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T26⟧](/oss/python/integrations/tools/parallel_search) | [  ⟦T435⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T27⟧](/oss/python/integrations/tools/parallel_task) | [  ⟦T436⟧](https://pypi.org/project/langchain-parallel/) |
| [⟦T28⟧](/oss/python/integrations/tools/azure_dynamic_sessions) | [  ⟦T437⟧](https://pypi.org/project/langchain-azure-dynamic-sessions/) |
| [⟦T29⟧](https://docs.scalekit.com/agentkit/quickstart/) | [  ⟦T438⟧](https://pypi.org/project/scalekit-sdk-python/) |
| [⟦T30⟧](/oss/python/integrations/tools/upstage_groundedness_check) | [  ⟦T439⟧](https://pypi.org/project/langchain-upstage/) |
| [⟦T31⟧](https://docs.apify.com/integrations/langchain) | [  ⟦T440⟧](https://pypi.org/project/langchain-apify/) |
| [⟦T32⟧](https://github.com/skynetcmd/m3-memory/blob/main/docs/integrations/LANGCHAIN.md) | [  ⟦T441⟧](https://pypi.org/project/m3-memory/) |
| [⟦T33⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T442⟧](https://pypi.org/project/semantica/) |
| [⟦T34⟧](https://docs.getsemantica.ai/integrations/langchain) | [  ⟦T443⟧](https://pypi.org/project/semantica/) |
| [⟦T35⟧](https://github.com/emmanuelorta/crawlcheck-core/tree/main/sdk-python#langchain-and-llamaindex-1100) | [  ⟦T444⟧](https://pypi.org/project/crawlcheck/) |
| [⟦T36⟧](/oss/python/integrations/tools/stripe) | [  ⟦T445⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T37⟧](https://github.com/memgraph/langchain-memgraph) | [  ⟦T446⟧](https://pypi.org/project/langchain-memgraph/) |
| [⟦T38⟧](/oss/python/integrations/tools/stripe) | [  ⟦T447⟧](https://pypi.org/project/stripe-agent-toolkit/) |
| [⟦T39⟧](https://github.com/gazoy/langchain-foliant#readme) | [  ⟦T448⟧](https://pypi.org/project/langchain-foliant/) |
| [⟦T40⟧](/oss/python/integrations/tools/google_drive) | [  ⟦T449⟧](https://pypi.org/project/langchain-googledrive/) |
| [⟦T41⟧](https://bowmark.ai/docs/langchain) | [  ⟦T450⟧](https://pypi.org/project/langchain-bowmark/) |
| [⟦T42⟧](https://pypi.org/project/langchain-compass/) | [  ⟦T451⟧](https://pypi.org/project/langchain-compass/) |
| [⟦T43⟧](https://fizzl.eu/agents/python/) | [  ⟦T452⟧](https://pypi.org/project/fizzl/) |
| [⟦T44⟧](/oss/python/integrations/tools/mcp_toolbox) | [  ⟦T453⟧](https://pypi.org/project/toolbox-langchain/) |
| [⟦T45⟧](https://adeu.ai) | [  ⟦T454⟧](https://pypi.org/project/langchain-adeu/) |
| [⟦T46⟧](https://github.com/arcmira/integrations/tree/master/packages/langchain-python) | [  ⟦T455⟧](https://pypi.org/project/langchain-arcmira/) |
| [⟦T47⟧](/oss/python/integrations/tools/cdp_agentkit) | [  ⟦T456⟧](https://pypi.org/project/coinbase-agentkit-langchain/) |
| [⟦T48⟧](https://docs.firecrawl.dev) | [  ⟦T457⟧](https://pypi.org/project/langchain-firecrawl/) |
| [⟦T49⟧](https://github.com/LinkupPlatform/langchain-linkup) | [  ⟦T458⟧](https://pypi.org/project/langchain-linkup/) |
| [⟦T50⟧](https://docs.pexafy.com/langchain) | [  ⟦T459⟧](https://pypi.org/project/langchain-pexafy/) |
| [⟦T51⟧](https://pidgeon.ai/docs/langchain) | [  ⟦T460⟧](https://pypi.org/project/langchain-pidgeon/) |
| [⟦T52⟧](https://scavio.dev/docs/langchain) | [  ⟦T461⟧](https://pypi.org/project/langchain-scavio/) |
| [⟦T53⟧](https://github.com/ScrapeGraphAI/langchain-scrapegraph) | [  ⟦T462⟧](https://pypi.org/project/langchain-scrapegraph/) |
| [⟦T54⟧](https://github.com/Shikenso-Analytics/langchain-taiga) | [  ⟦T463⟧](https://pypi.org/project/langchain-taiga/) |
| [⟦T55⟧](https://pypi.org/project/langchain-alex/) | [  ⟦T464⟧](https://pypi.org/project/langchain-alex/) |
| [⟦T56⟧](https://github.com/botsrated/botsrated/tree/main/integrations/langchain) | [  ⟦T465⟧](https://pypi.org/project/langchain-botsrated/) || [⟦T57⟧](https://docs.brightdata.com/scraping-automation/serp-api/introduction) | [  ⟦T466⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T58⟧](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction) | [  ⟦T467⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T59⟧](https://docs.brightdata.com/datasets/scrapers/overview) | [  ⟦T468⟧](https://pypi.org/project/langchain-brightdata/) |
| [⟦T60⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T469⟧](https://pypi.org/project/langchain-decodo/) |
| [⟦T61⟧](https://github.com/Decodo/langchain/tree/master/libs/partners/decodo) | [  ⟦T470⟧](https://pypi.org/project/langchain-decodo/) ​​|
| [⟦T62⟧](https://docs.dexpaprika.com) | [  ⟦T471⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T63⟧](https://github.com/rocosen/langchain-flashdata) | [  ⟦T472⟧](https://pypi.org/project/langchain-flashdata/) |
| [⟦T64⟧](https://docs.hindsight.vectorize.io/sdks/integrations/langgraph) | [  ⟦T473⟧](https://pypi.org/project/hindsight-langgraph/) |
| [⟦T65⟧](https://github.com/agentbeacon-hq/clients) | [  ⟦T474⟧](https://pypi.org/project/langchain-openpath/) |
| [⟦T66⟧](https://replylayer.ai/docs/guides/langchain) | [  ⟦T475⟧](https://pypi.org/project/langchain-replylayer/) |
| [⟦T67⟧](https://pypi.org/project/langchain-send21/) | [  ⟦T476⟧](https://pypi.org/project/langchain-send21/) |
| [⟦T68⟧](https://serpex.dev/docs) | [  ⟦T477⟧](https://pypi.org/project/langchain-serpex-python/) |
| [⟦T69⟧](https://synmerco.com/docs) | [  ⟦T478⟧](https://pypi.org/project/synmerco-langchain/) |
| [⟦T70⟧](https://urlpipe.dev/integrations/langchain) | [  ⟦T479⟧](https://pypi.org/project/langchain-urlpipe/) |
| [⟦T71⟧](https://github.com/ADS4GPTs/ads4gpts) | [  ⟦T480⟧](https://pypi.org/project/ads4gpts-langchain/) |
| [⟦T72⟧](https://github.com/thyn-ai/algenta-integrations/tree/main/python/langchain-algenta#readme) | [  ⟦T481⟧](https://pypi.org/project/langchain-algenta/) |
| [⟦T73⟧](https://anakin.io/docs/documentation) | [  ⟦T482⟧](https://pypi.org/project/langchain-anakin/) |
| [⟦T74⟧](https://docs.atomicmail.ai/langchain) | [  ⟦T483⟧](https://pypi.org/project/langchain-atomicmail/) |
| [⟦T75⟧](https://cloro.dev/docs/) | [  ⟦T484⟧](https://pypi.org/project/langchain-cloro/) |
| [⟦T76⟧](https://docs.dexpaprika.com) | [  ⟦T485⟧](https://pypi.org/project/langchain-dexpaprika/) |
| [⟦T77⟧](https://e2a.dev) | [  ⟦T486⟧](https://pypi.org/project/e2a/) |
| [⟦T78⟧](https://github.com/MehdiZare/langchain-fmp-data) | [  ⟦T487⟧](https://pypi.org/project/langchain-fmp-data/) |
| [⟦T79⟧](https://docs.goodmem.ai) | [  ⟦T488⟧](https://pypi.org/project/langchain-goodmem/) |
| [⟦T80⟧](https://dev.writer.com/home/introduction) | [  ⟦T489⟧](https://pypi.org/project/langchain-writer/) |
| [⟦T81⟧](https://github.com/edtool79-collab/hirepulse-open-source#langchain-and-crewai-gateway-tools-030) | [  ⟦T490⟧](https://pypi.org/project/hirepulse-tools/) |
| [⟦T82⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T491⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T83⟧](https://docs.nimbleway.com/integrations/connectors/langchain) | [  ⟦T492⟧](https://pypi.org/project/langchain-nimble/) |
| [⟦T84⟧](https://10ml.com/perfume-mcp-server) | [  ⟦T493⟧](https://pypi.org/project/langchain-10ml-perfume/) |
| [⟦T85⟧](https://langchain-prolog.readthedocs.io/en/stable/) | [  ⟦T494⟧](https://pypi.org/project/langchain-prolog/) |
| [⟦T86⟧](https://pypi.org/project/langchain-swarmmemo/) | [  ⟦T495⟧](https://pypi.org/project/langchain-swarmmemo/) |
| [⟦T87⟧](https://www.maximem.ai/) | [  ⟦T496⟧](https://pypi.org/project/maximem-synap-langchain/) |
| [⟦T88⟧](https://github.com/tanod-labs/integrations/tree/main/langchain) | [  ⟦T497⟧](https://pypi.org/project/langchain-tanod/) |
| [⟦T89⟧](https://github.com/sriram7737/pramagent) | [  ⟦T498⟧](https://pypi.org/project/pramagent/) |
| [⟦T90⟧](https://github.com/econdash/econdash-python/blob/main/packages/langchain-econdash/README.md) | [  ⟦T499⟧](https://pypi.org/project/langchain-econdash/) |
| [⟦T91⟧](https://github.com/verdixapi/langchain-verdix#readme) | [  ⟦T500⟧](https://pypi.org/project/langchain-verdix/) |
| [⟦T92⟧](https://docs.apiverve.com/integrations/langchain) | [  ⟦T501⟧](https://pypi.org/project/langchain-apiverve/) |
| [⟦T93⟧](https://specstream.ai/docs/langchain) | [  ⟦T502⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T94⟧](https://github.com/datumline/datumline-agent-guard#langchain) | [  ⟦T503⟧](https://pypi.org/project/datumline-agent-guard/) |
| [⟦T95⟧](https://you.com/docs/integrations/langchain) | [  ⟦T504⟧](https://pypi.org/project/langchain-youdotcom/) |
| [⟦T96⟧](https://gatecoreai.com/docs/) | [  ⟦T505⟧](https://pypi.org/project/gatecore-langchain/) |
| [⟦T97⟧](https://github.com/SpaceFrontiers/machinelibrary-integrations/tree/main/python/langchain-machinelibrary) | [  ⟦T506⟧](https://pypi.org/project/langchain-machinelibrary/) |
| [⟦T98⟧](https://github.com/beepboop2025/langchain-financial-evidence#readme) | [  ⟦T507⟧](https://pypi.org/project/langchain-financial-evidence/) |
| [⟦T99⟧](https://github.com/colesmcintosh/langchain-salesforce) | [  ⟦T508⟧](https://pypi.org/project/langchain-salesforce/) |
| [⟦T100⟧](https://reefapi.com/docs/langchain) | [  ⟦T509⟧](https://pypi.org/project/langchain-reefapi/) |
| [⟦T101⟧](https://www.newscatcherapi.com/docs/web-search-api/integrations/langchain) | [  ⟦T510⟧](https://pypi.org/project/langchain-catchall/) |
| [⟦T102⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T511⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T103⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T512⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T104⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T513⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T105⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T514⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T106⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T515⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T107⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T516⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T108⟧](https://github.com/diffbot/langchain-diffbot) | [  ⟦T517⟧](https://pypi.org/project/langchain-diffbot/) |
| [⟦T109⟧](https://github.com/olostep-api/langchain-olostep#readme) | [  ⟦T518⟧](https://pypi.org/project/langchain-olostep/) |
| [⟦T110⟧](https://mesharc.dev/docs/langchain) | [  ⟦T519⟧](https://pypi.org/project/langchain-mesharc/) || [⟦T111⟧](https://mesharc.dev/docs/langchain) | [  ⟦T520⟧](https://pypi.org/project/langchain-mesharc/) |
| [⟦T112⟧](https://agentsearchhq.com/blog/langchain-agent-search-then-read-page) | [  ⟦T521⟧](https://pypi.org/project/langchain-agentsearch/) |
| [⟦T113⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T522⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T114⟧](https://www.hyperbrowser.ai/docs/home) | [  ⟦T523⟧](https://pypi.org/project/langchain-hyperbrowser/) |
| [⟦T115⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T524⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T116⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T525⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T117⟧](https://github.com/WaveSpeedAI/langchain-wavespeed) | [  ⟦T526⟧](https://pypi.org/project/langchain-wavespeed/) |
| [⟦T118⟧](https://github.com/Minns-ai/langgraph-minnsdb#readme) | [  ⟦T527⟧](https://pypi.org/project/langgraph-minnsdb/) |
| [⟦T119⟧](https://docs.mrscraper.com) | [  ⟦T528⟧](https://pypi.org/project/langchain-mrscraper/) |
| [⟦T120⟧](https://github.com/Thordata/langchain-thordata) | [  ⟦T529⟧](https://pypi.org/project/langchain-thordata/) |
| [⟦T121⟧](https://github.com/robocorp/robocorp) | [  ⟦T530⟧](https://pypi.org/project/langchain-robocorp/) |
| [⟦T122⟧](https://docs.ampersend.ai) | [  ⟦T531⟧](https://pypi.org/project/langchain-ampersend/) |
| [⟦T123⟧](https://github.com/lachy3433/langchain-contextfetch#readme) | [  ⟦T532⟧](https://pypi.org/project/langchain-contextfetch/) |
| [⟦T124⟧](https://github.com/clawfetch/integrations#readme) | [  ⟦T533⟧](https://pypi.org/project/langchain-clawfetch/) |
| [⟦T125⟧](https://omfang.io/manifest-docs) | [  ⟦T534⟧](https://pypi.org/project/manifest-api/) |
| [⟦T126⟧](https://github.com/User0856/snaprender-integrations/tree/main/langchain) | [  ⟦T535⟧](https://pypi.org/project/langchain-snaprender/) |
| [⟦T127⟧](https://webextract.dev/docs/langchain) | [  ⟦T536⟧](https://pypi.org/project/langchain-webextract/) |
| [⟦T128⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/gpt-image) | [  ⟦T537⟧](https://pypi.org/project/langchain-gpt-image-acedatacloud/) |
| [⟦T129⟧](https://www.lians.ai) | [  ⟦T538⟧](https://pypi.org/project/lians-sdk/) |
| [⟦T130⟧](https://github.com/hanshs474/langchain-freeimagetovideo) | [  ⟦T539⟧](https://pypi.org/project/langchain-freeimagetovideo/) |
| [⟦T131⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/happyhorse) | [  ⟦T540⟧](https://pypi.org/project/langchain-happyhorse-acedatacloud/) |
| [⟦T132⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/nano-banana) | [  ⟦T541⟧](https://pypi.org/project/langchain-nano-banana-acedatacloud/) |
| [⟦T133⟧](https://specstream.ai/docs/langchain) | [  ⟦T542⟧](https://pypi.org/project/langchain-specstream/) |
| [⟦T134⟧](https://docs.zerogpu.ai) | [  ⟦T543⟧](https://pypi.org/project/langchain-zerogpu/) |
| [⟦T135⟧](https://docs.hydrafetch.com) | [  ⟦T544⟧](https://pypi.org/project/langchain-hydrafetch/) |
| [⟦T136⟧](https://github.com/tubeagentkit/langchain-getyoutubetranscript#readme) | [  ⟦T545⟧](https://pypi.org/project/langchain-getyoutubetranscript/) |
| [⟦T137⟧](https://github.com/ourresearch/langchain-openalex#readme) | [  ⟦T546⟧](https://pypi.org/project/langchain-openalex/) |
| [⟦T138⟧](https://www.search1api.com/docs/integrations/langchain) | [  ⟦T547⟧](https://pypi.org/project/search1api-langchain/) |
| [⟦T139⟧](https://github.com/wayza-protocol/wayza-js/tree/main/packages/langchain-wayza) | [  ⟦T548⟧](https://pypi.org/project/langchain-wayza/) |
| [⟦T140⟧](https://docs.upload-post.com/guides/langchain) | [  ⟦T549⟧](https://pypi.org/project/langchain-upload-post/) |
| [⟦T141⟧](https://mixpeek.com/docs/agent-integrations/langchain) | [  ⟦T550⟧](https://pypi.org/project/langchain-mixpeek/) |
| [⟦T142⟧](https://kavel.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T551⟧](https://pypi.org/project/langchain-kavel/) |
| [⟦T143⟧](https://aigifmaker.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T552⟧](https://pypi.org/project/langchain-aigifmaker/) |
| [⟦T144⟧](https://pinkwallet.com/agentic/connect/langchain/) | [  ⟦T553⟧](https://pypi.org/project/langchain-pink/) |
| [⟦T145⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T554⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T146⟧](https://optionsahoy.com/for-agents) | [  ⟦T555⟧](https://pypi.org/project/optionsahoy-langchain/) |
| [⟦T147⟧](/oss/python/integrations/tools/discord) | [  ⟦T556⟧](https://pypi.org/project/langchain-discord/) |
| [⟦T148⟧](https://blopus.ai/docs/) | [  ⟦T557⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T149⟧](https://blopus.ai/docs/) | [  ⟦T558⟧](https://pypi.org/project/langchain-blopus/) |
| [⟦T150⟧](https://linkdigest.dev/docs#frameworks) | [  ⟦T559⟧](https://pypi.org/project/linkdigest-mcp/) |
| [⟦T151⟧](https://docs.valyu.ai/home) | [  ⟦T560⟧](https://pypi.org/project/langchain-valyu/) |
| [⟦T152⟧](https://veida.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T561⟧](https://pypi.org/project/langchain-veida/) |
| [⟦T153⟧](https://github.com/fodda-ai/langchain-fodda#readme) | [  ⟦T562⟧](https://pypi.org/project/langchain-fodda/) |
| [⟦T154⟧](https://flowspeech.io/docs) | [  ⟦T563⟧](https://pypi.org/project/langchain-flowspeech/) |
| [⟦T155⟧](https://mnki.com/docs/integrations#frameworks) | [  ⟦T564⟧](https://pypi.org/project/langchain-mnki/) |
| [⟦T156⟧](https://github.com/tanvoai/langchain-tanvo#readme) | [  ⟦T565⟧](https://pypi.org/project/langchain-tanvo/) |
| [⟦T157⟧](https://github.com/EXboys/langchain-skilllite) | [  ⟦T566⟧](https://pypi.org/project/langchain-skilllite/) |
| [⟦T158⟧](https://github.com/Conrad-sudo/langchain-uniswap-v2) | [  ⟦T567⟧](https://pypi.org/project/langchain-uniswap-v2/) |
| [⟦T159⟧](https://skim402.com/docs) | [  ⟦T568⟧](https://pypi.org/project/langchain-skim/) |
| [⟦T160⟧](https://pushary.com/docs/agents/build/langgraph?utm_source=langchain\&utm_medium=integration-directory\&utm_campaign=pushary-langgraph-py) | [  ⟦T569⟧](https://pypi.org/project/pushary-langgraph/) |
| [⟦T161⟧](https://github.com/dong7812/dompruner-py) | [  ⟦T570⟧](https://pypi.org/project/dompruner/) |
| [⟦T162⟧](https://pypi.org/project/ddg-langchain/) | [  ⟦T571⟧](https://pypi.org/project/ddg-langchain/) |
| [⟦T163⟧](https://docs.gnews.io/langchain) | [  ⟦T572⟧](https://pypi.org/project/langchain-gnews/) |
| [⟦T164⟧](https://docs.gnews.io/langchain) | [  ⟦T573⟧](https://pypi.org/project/langchain-gnews/) || [⟦T165⟧](https://pypi.org/project/langchain-gaip/) | [  ⟦T574⟧](https://pypi.org/project/langchain-gaip/) |
| [⟦T166⟧](https://graciousquotes.com/developers/langchain/) | [  ⟦T575⟧](https://pypi.org/project/langchain-graciousquotes/) |
| [⟦T167⟧](https://opedd.com/for-ai-agents) | [  ⟦T576⟧](https://pypi.org/project/langchain-opedd/) |
| [⟦T168⟧](https://agentsvc.io/docs/langchain) | [  ⟦T577⟧](https://pypi.org/project/agentsvc/) |
| [⟦T169⟧](https://precleared.dev/docs/langchain) | [  ⟦T578⟧](https://pypi.org/project/precleared/) |
| [⟦T170⟧](https://emaki.readthedocs.io/en/latest/integrations/langchain/) | [  ⟦T579⟧](https://pypi.org/project/langchain-emaki/) |
| [⟦T171⟧](https://docs.anchorbrowser.io/introduction) | [  ⟦T580⟧](https://pypi.org/project/langchain-anchorbrowser/) |
| [⟦T172⟧](https://github.com/oxylabs/langchain-oxylabs) | [  ⟦T581⟧](https://pypi.org/project/langchain-oxylabs/) |
| [⟦T173⟧](https://proxmint.com/docs/langchain) | [  ⟦T582⟧](https://pypi.org/project/langchain-proxmint/) |
| [⟦T174⟧](https://aidress.ai) | [  ⟦T583⟧](https://pypi.org/project/langchain-aidress/) |
| [⟦T175⟧](https://github.com/printfriendly/langchain-printfriendly#readme) | [  ⟦T584⟧](https://pypi.org/project/langchain-printfriendly/) |
| [⟦T176⟧](https://reserp.ai/docs) | [  ⟦T585⟧](https://pypi.org/project/langchain-reserp/) |
| [⟦T177⟧](https://github.com/daytonaio/daytona) | [  ⟦T586⟧](https://pypi.org/project/langchain-daytona-data-analysis/) |
| [⟦T178⟧](https://docs.1claw.xyz/docs/integrations/langchain) | [  ⟦T587⟧](https://pypi.org/project/langchain-1claw/) |
| [⟦T179⟧](https://github.com/TheSuperColony/langchain-supercolony) | [  ⟦T588⟧](https://pypi.org/project/langchain-supercolony/) |
| [⟦T180⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/seedance) | [  ⟦T589⟧](https://pypi.org/project/langchain-seedance-acedatacloud/) |
| [⟦T181⟧](https://github.com/Conrad-sudo/langchain-erc20) | [  ⟦T590⟧](https://pypi.org/project/langchain-erc20/) |
| [⟦T182⟧](https://docs.dappier.com/) | [  ⟦T591⟧](https://pypi.org/project/langchain-dappier/) |
| [⟦T183⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#alfrescotoolkit) | [  ⟦T592⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T184⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#documentumtoolkit) | [  ⟦T593⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T185⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#filenetp8toolkit) | [  ⟦T594⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T186⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md#onbasetoolkit) | [  ⟦T595⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T187⟧](https://github.com/OpenDMA/langchain-opendma/blob/main/docs/Toolkit.md) | [  ⟦T596⟧](https://pypi.org/project/langchain-opendma/) |
| [⟦T188⟧](https://github.com/mavdol/langchain-capsule) | [  ⟦T597⟧](https://pypi.org/project/langchain-capsule/) |
| [⟦T189⟧](https://github.com/agent-help-network/agent-help-network/blob/main/clients/langchain-ahn/README.md) | [  ⟦T598⟧](https://pypi.org/project/langchain-ahn/) |
| [⟦T190⟧](https://github.com/tokportal/langchain-tokportal) | [  ⟦T599⟧](https://pypi.org/project/langchain-tokportal/) |
| [⟦T191⟧](https://docs.talordata.com/serp-api/integration/sdk-integration/how-to-set-up-talordata-with-langchain) | [  ⟦T600⟧](https://pypi.org/project/langchain-talordata/) |
| [⟦T192⟧](https://github.com/jmendozapuche/langchain-latam-synth) | [  ⟦T601⟧](https://pypi.org/project/langchain-latam-synth/) |
| [⟦T193⟧](/oss/python/integrations/tools/tableau) | [  ⟦T602⟧](https://pypi.org/project/langchain-tableau/) |
| [⟦T194⟧](https://cosmergon.com) | [  ⟦T603⟧](https://pypi.org/project/langchain-cosmergon/) |
| [⟦T195⟧](https://github.com/Veroq-ai/polaris-sdks/tree/main/python/langchain_polaris) | [  ⟦T604⟧](https://pypi.org/project/langchain-polaris/) |
| [⟦T196⟧](https://docs.memoryrouter.ai/langchain) | [  ⟦T605⟧](https://pypi.org/project/langchain-memoryrouter/) |
| [⟦T197⟧](https://paysafe-agent.com) | [  ⟦T606⟧](https://pypi.org/project/langchain-paysafe/) |
| [⟦T198⟧](https://axiora.dev/docs) | [  ⟦T607⟧](https://pypi.org/project/langchain-axiora/) |
| [⟦T199⟧](https://serpapi.github.io/serpapi-search-tools-python/docs/sdk-examples/langchain.html) | [  ⟦T608⟧](https://pypi.org/project/serpapi-search-tools/) |
| [⟦T200⟧](https://alphai.io/developers) | [  ⟦T609⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T201⟧](https://alphai.io/developers) | [  ⟦T610⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T202⟧](https://alphai.io/developers) | [  ⟦T611⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T203⟧](https://alphai.io/developers) | [  ⟦T612⟧](https://pypi.org/project/langchain-alphai/) |
| [⟦T204⟧](https://greencalculus.com/guides/emission-factors-langchain/) | [  ⟦T613⟧](https://pypi.org/project/langchain-greencalculus/) |
| [⟦T205⟧](https://api.relayshield.net/developers) | [  ⟦T614⟧](https://pypi.org/project/langchain-relayshield/) |
| [⟦T206⟧](https://strale.dev/docs) | [  ⟦T615⟧](https://pypi.org/project/langchain-strale/) |
| [⟦T207⟧](https://www.ictinnovations.com/) | [  ⟦T616⟧](https://pypi.org/project/langchain-ictfax/) |
| [⟦T208⟧](https://github.com/getanyapi-com/integrations/tree/main/langchain-anyapi) | [  ⟦T617⟧](https://pypi.org/project/langchain-anyapi/) |
| [⟦T209⟧](https://docs.keenable.ai) | [  ⟦T618⟧](https://pypi.org/project/langchain-keenable/) |
| [⟦T210⟧](https://github.com/lfg-gm/langchain-lfg#readme) | [  ⟦T619⟧](https://pypi.org/project/langchain-lfg/) |
| [⟦T211⟧](https://www.agentrails.io/docs) | [  ⟦T620⟧](https://pypi.org/project/langchain-x402/) |
| [⟦T212⟧](https://github.com/authzed/langchain-spicedb) | [  ⟦T621⟧](https://pypi.org/project/langchain-spicedb/) |
| [⟦T213⟧](https://github.com/Layrcake-dev/langchain-layrcake#readme) | [  ⟦T622⟧](https://pypi.org/project/langchain-layrcake/) |
| [⟦T214⟧](https://gandr.ai/docs) | [  ⟦T623⟧](https://pypi.org/project/gandr-langchain/) |
| [⟦T215⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T624⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T216⟧](https://github.com/valthera/langchain-valthera) | [  ⟦T625⟧](https://pypi.org/project/langchain-valthera/) |
| [⟦T217⟧](https://docs.spidra.io) | [  ⟦T626⟧](https://pypi.org/project/langchain-spidra/) |
| [⟦T218⟧](https://tablejourney.com/agents/#langchain) | [  ⟦T627⟧](https://pypi.org/project/langchain-tablejourney/) || [⟦T219⟧](https://github.com/yumaheymans/langchain-carejobs#readme) | [  ⟦T628⟧](https://pypi.org/project/langchain-carejobs/) |
| [⟦T220⟧](https://github.com/e7217/langchain-naver-community) | [  ⟦T629⟧](https://pypi.org/project/langchain-naver-community/) |
| [⟦T221⟧](https://docs.scraperapi.com/) | [  ⟦T630⟧](https://pypi.org/project/langchain-scraperapi/) |
| [⟦T222⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T631⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T223⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T632⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T224⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T633⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T225⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T634⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T226⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T635⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T227⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T636⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T228⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T637⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T229⟧](https://preclick.ai/) | [  ⟦T638⟧](https://pypi.org/project/langchain-urlcheck/) |
| [⟦T230⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T639⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T231⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T640⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T232⟧](https://www.scrapingbee.com/documentation/langchain/) | [  ⟦T641⟧](https://pypi.org/project/langchain-scrapingbee/) |
| [⟦T233⟧](https://www.scrapingbee.com/documentation/langchain/) | ⟦T1384​​⟧ |
| [⟦T234⟧](https://querit.com/docs) | [  ⟦T643⟧](https://pypi.org/project/langchain-querit/) |
| [⟦T235⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T644⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T236⟧](https://github.com/plivo-dev/langchain-plivo-tools) | [  ⟦T645⟧](https://pypi.org/project/langchain-plivo-tools/) |
| [⟦T237⟧](https://github.com/vectara/langchain-vectara) | [  ⟦T646⟧](https://pypi.org/project/langchain-vectara/) |
| [⟦T238⟧](https://www.xpoz.ai/docs) | [  ⟦T647⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T239⟧](https://docs.lakesail.com/sail/latest/guide/integrations/langchain.html) | [  ⟦T648⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T240⟧](https://github.com/AceDataCloud/LangChain/tree/main/packages/suno) | [  ⟦T649⟧](https://pypi.org/project/langchain-suno-acedatacloud/) |
| [⟦T241⟧](https://docs.agentql.com/home) | [  ⟦T650⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T242⟧](https://docs.yutori.com) | [  ⟦T651⟧](https://pypi.org/project/langchain-yutori/) |
| [⟦T243⟧](https://github.com/Conrad-sudo/langchain-erc8004) | [  ⟦T652⟧](https://pypi.org/project/langchain-erc8004/) |
| [⟦T244⟧](https://github.com/permitio/langchain-permit) | [  ⟦T653⟧](https://pypi.org/project/langchain-permit/) |
| [⟦T245⟧](https://docs.agentql.com/home) | [  ⟦T654⟧](https://pypi.org/project/langchain-agentql/) |
| [⟦T246⟧](https://clearsigned.com/integrations#langchain) | [  ⟦T655⟧](https://pypi.org/project/langchain-clearsigned/) |
| [⟦T247⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T656⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T248⟧](https://github.com/Mart-API/langchain-mart#readme) | [  ⟦T657⟧](https://pypi.org/project/langchain-mart/) |
| [⟦T249⟧](https://github.com/Amitgb14/langchain_jenkins) | [  ⟦T658⟧](https://pypi.org/project/langchain-jenkins/) |
| [⟦T250⟧](https://docs.lakesail.com/sail/main/guide/integrations/langchain/) | [  ⟦T659⟧](https://pypi.org/project/langchain-sail/) |
| [⟦T251⟧](https://github.com/gridpin/gridpin/tree/main/integrations/langchain) | [  ⟦T660⟧](https://pypi.org/project/langchain-gridpin/) |
| [⟦T252⟧](https://www.xpoz.ai/docs) | [  ⟦T661⟧](https://pypi.org/project/langchain-xpoz/) |
| [⟦T253⟧](https://www.agentfetch.dev) | [  ⟦T662⟧](https://pypi.org/project/langchain-agentfetch/) |
| [⟦T254⟧](https://github.com/fastaf-co/fastaf-integrations/tree/main/langchain-fastaf) | [  ⟦T663⟧](https://pypi.org/project/langchain-fastaf/) |
| [⟦T255⟧](https://github.com/makash/feedmyagent-skill/tree/main/integrations/langchain) | [  ⟦T664⟧](https://pypi.org/project/langchain-feedmyagent/) |
| [⟦T256⟧](https://docs.proxyhat.com) | [  ⟦T665⟧](https://pypi.org/project/langchain-proxyhat/) |
| [⟦T257⟧](https://platform.iflow.cn/) | [  ⟦T666⟧](https://pypi.org/project/iflow-search-langchain/) |
| [⟦T258⟧](https://docs.livetennisapi.com) | [  ⟦T667⟧](https://pypi.org/project/langchain-livetennis/) |
| [⟦T259⟧](https://github.com/pgalyen1987/NodeProxy/tree/main/integrations) | [  ⟦T668⟧](https://pypi.org/project/nodeproxy-tools/) |
| [⟦T260⟧](https://docs.webz.io/docs/webz/news-search-api-mcp) | [  ⟦T669⟧](https://pypi.org/project/langchain-webz/) |
| [⟦T261⟧](https://lumify.ai/docs/ai) | [  ⟦T670⟧](https://pypi.org/project/langchain-lumify/) |
| [⟦T262⟧](https://docs.ipay.sh) | [  ⟦T671⟧](https://pypi.org/project/langchain-pr402/) |
| [⟦T263⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T672⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T264⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T673⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T265⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T674⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T266⟧](https://docs.opengradient.ai/) | [  ⟦T675⟧](https://pypi.org/project/langchain-opengradient/) |
| [⟦T267⟧](https://github.com/CHANGCHINFU/langchain-truthbear) | [  ⟦T676⟧](https://pypi.org/project/langchain-truthbear/) |
| [⟦T268⟧](https://asyntai.com/documentation/integrations/langchain/) | [  ⟦T677⟧](https://pypi.org/project/langchain-asyntai/) |
| [⟦T269⟧](https://lyrenth.com/docs/integrations) | [  ⟦T678⟧](https://pypi.org/project/langchain-lyrenth/) |
| [⟦T270⟧](https://crustapi.com/docs) | [  ⟦T679⟧](https://pypi.org/project/langchain-crustapi/) |
| [⟦T271⟧](https://useagentgate.com/docs) | [  ⟦T680⟧](https://pypi.org/project/langchain-agentgate/) |
| [⟦T272⟧](https://github.com/stardog-union/stardog-langchain) | [  ⟦T681⟧](https://pypi.org/project/langchain-stardog/) || [⟦T273⟧](https://github.com/auscahq/ausca/tree/main/python/langchain-ausca) | [  ⟦T682⟧](https://pypi.org/project/langchain-ausca/) |
| [⟦T274⟧](https://github.com/Scottcjn/langchain-rustchain) | [  ⟦T683⟧](https://pypi.org/project/langchain-rustchain-tools/) |
| [⟦T275⟧](https://docs.sidclaw.com/docs/integrations/langchain) | [  ⟦T684⟧](https://pypi.org/project/langchain-sidclaw/) |
| [⟦T276⟧](https://github.com/Toloka/tendem-mcp/tree/main/integrations/langchain-tendem#readme) | [  ⟦T685⟧](https://pypi.org/project/langchain-tendem/) |
| [⟦T277⟧](https://pinchwork.dev) | [  ⟦T686⟧](https://pypi.org/project/pinchwork/) |
| [⟦T278⟧](https://docs.agentmail.to/welcome) | [  ⟦T687⟧](https://pypi.org/project/langchain-agentmail/) |
| [⟦T279⟧](https://github.com/meetdewey/langchain-dewey) | [  ⟦T688⟧](https://pypi.org/project/langchain-dewey/) |
| [⟦T280⟧](https://kerq.dev/docs) | [  ⟦T689⟧](https://pypi.org/project/langchain-kerq/) |
| [⟦T281⟧](https://w2a-protocol.org/) | [  ⟦T690⟧](https://pypi.org/project/langchain-w2a/) |
| [⟦T282⟧](https://www.football-charts.com/developers) | [  ⟦T691⟧](https://pypi.org/project/langchain-footballcharts/) |
| [⟦T283⟧](https://modexia.software/docs) | [  ⟦T692⟧](https://pypi.org/project/langchain-modexia/) |
| [⟦T284⟧](https://agenticemail.dev/docs) | [  ⟦T693⟧](https://pypi.org/project/langchain-agenticemail/) |
| [⟦T285⟧](https://www.clawmessenger.com/blog/langchain-imessage-integration) | [  ⟦T694⟧](https://pypi.org/project/langchain-claw-messenger/) |
| [⟦T286⟧](https://ictpbx.com) | [  ⟦T695⟧](https://pypi.org/project/langchain-ictpbx/) |
| [⟦T287⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-ask) | [  ⟦T696⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T288⟧](https://docs.igpt.ai/docs/sdks/langchain#igpt-search) | [  ⟦T697⟧](https://pypi.org/project/langchain-igpt/) |
| [⟦T289⟧](https://github.com/oddsrelay/langchain-oddsrelay) | [  ⟦T698⟧](https://pypi.org/project/langchain-oddsrelay/) |
| [⟦T290⟧](https://docs.context.dev) | [  ⟦T699⟧](https://pypi.org/project/langchain-context/) |
| [⟦T291⟧](https://www.searchapi.io/docs/google) | [  ⟦T700⟧](https://pypi.org/project/langchain-searchapi/) |
| [⟦T292⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T701⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T293⟧](https://crawleo.dev/integrations/langchain) | [  ⟦T702⟧](https://pypi.org/project/langchain-crawleo/) |
| [⟦T294⟧](https://proxyclaw.ai/docs) | [  ⟦T703⟧](https://pypi.org/project/langchain-proxyclaw/) |
| [⟦T295⟧](https://quanticdata.io/docs/) | [  ⟦T704⟧](https://pypi.org/project/langchain-quanticdata/) |
| [⟦T296⟧](https://docs.octen.ai) | [  ⟦T705⟧](https://pypi.org/project/langchain-octen/) |
| [⟦T297⟧](https://docs.hashlock.markets/) | [  ⟦T706⟧](https://pypi.org/project/langchain-hashlock/) |
| [⟦T298⟧](/oss/python/integrations/tools/privy) | [  ⟦T707⟧](https://pypi.org/project/langchain-privy/) |
| [⟦T299⟧](https://ai-identity.co/docs) | [  ⟦T708⟧](https://pypi.org/project/langchain-ai-identity/) |
| [⟦T300⟧](https://synoppy.com/docs) | [  ⟦T709⟧](https://pypi.org/project/langchain-synoppy/) |
| [⟦T301⟧](https://bidda.com/developers) | [  ⟦T710⟧](https://pypi.org/project/langchain-bidda/) |
| [⟦T302⟧](https://docs.magichour.ai) | [  ⟦T711⟧](https://pypi.org/project/langchain-magic-hour/) |
| [⟦T303⟧](https://github.com/twittrapi/langchain-twittrapi#readme) | [  ⟦T712⟧](https://pypi.org/project/langchain-twittrapi/) |
| [⟦T304⟧](https://instanode.dev/docs) | [  ⟦T713⟧](https://pypi.org/project/langchain-instanode/) |
| [⟦T305⟧](https://github.com/aproxpay/langchain-aproxpay) | [  ⟦T714⟧](https://pypi.org/project/langchain-aproxpay/) |
| [⟦T306⟧](https://simplepages.ai/mcp) | [  ⟦T715⟧](https://pypi.org/project/langchain-simplepages/) |
| [⟦T307⟧](https://github.com/tilotech/tilores-langchain) | [  ⟦T716⟧](https://pypi.org/project/tilores-langchain/) |
| [⟦T308⟧](https://docs.agentphone.ai/welcome) | [  ⟦T717⟧](https://pypi.org/project/langchain-agentphone/) |
| [⟦T309⟧](https://ceki.me) | [  ⟦T718⟧](https://pypi.org/project/langchain-ceki/) |
| [⟦T310⟧](https://www.ictlms.net) | [  ⟦T719⟧](https://pypi.org/project/langchain-ictexam/) |
| [⟦T311⟧](https://github.com/nozomio-labs/nia-langchain) | [  ⟦T720⟧](https://pypi.org/project/langchain-nia/) |
| [⟦T312⟧](https://verifly.email/docs) | [  ⟦T721⟧](https://pypi.org/project/langchain-verifly/) |
| [⟦T313⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T722⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T314⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T723⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T315⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T724⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T316⟧](https://github.com/JosejuX/rapidapi-metadata-extractor/tree/main/langchain-webmetadata-extractor) | [  ⟦T725⟧](https://pypi.org/project/langchain-webmetadata-extractor/) |
| [⟦T317⟧](https://github.com/witanmarkets/langchain-witan#readme) | [  ⟦T726⟧](https://pypi.org/project/langchain-witan/) |
| [⟦T318⟧](https://docs.bodo.ai/) | [  ⟦T727⟧](https://pypi.org/project/langchain-bodo/) |
| [⟦T319⟧](https://coworkingview.com/en/mcp) | [  ⟦T728⟧](https://pypi.org/project/langchain-coworkingview/) |
| [⟦T320⟧](https://github.com/fxmacrodata/langchain-fxmacrodata?utm_source=langchain\&utm_medium=integration\&utm_campaign=langchain-fxmacrodata\&utm_content=directory-listing#readme) | [  ⟦T729⟧](https://pypi.org/project/langchain-fxmacrodata/) |
| [⟦T321⟧](https://github.com/Keirolabs-API/langchain-keiro) | [  ⟦T730⟧](https://pypi.org/project/langchain-keiro/) |
| [⟦T322⟧](https://github.com/flipcoin-fun/flipcoin-langchain) | [  ⟦T731⟧](https://pypi.org/project/langchain-flipcoin/) |
| [⟦T323⟧](https://signatrust.net/docs/api) | [  ⟦T732⟧](https://pypi.org/project/langchain-signatrust/) |
| [⟦T324⟧](https://github.com/synapsoft-DA/langchain-synapsoft) | [  ⟦T733⟧](https://pypi.org/project/langchain-synapsoft/) |
| [⟦T325⟧](https://goodsender.com/docs) | [  ⟦T734⟧](https://pypi.org/project/langchain-goodsender/) |
| [⟦T326⟧](https://github.com/kynto2001-ctrl/apexrunner-tools#riskshield-block-dangerous-trades-before-they-execute) | [  ⟦T735⟧](https://pypi.org/project/apexrunner-tools/) || [⟦T327⟧](https://github.com/drasi-project/langchain-drasi) | [  ⟦T736⟧](https://pypi.org/project/langchain-drasi/) |
| [⟦T328⟧](https://unirateapi.com) | [  ⟦T737⟧](https://pypi.org/project/langchain-unirate/) |
| [⟦T329⟧](https://docs.blindfold.dev) | [  ⟦T738⟧](https://pypi.org/project/langchain-blindfold/) |
| [⟦T330⟧](https://pypi.org/project/langchain-hugging-bay/0.1.0/) | [  ⟦T739⟧](https://pypi.org/project/langchain-hugging-bay/) |
| [⟦T331⟧](https://docs.agentline.cloud/introduction) | [  ⟦T740⟧](https://pypi.org/project/langchain-agentline/) |
| [⟦T332⟧](https://docs.delegare.dev/introduction) | [  ⟦T741⟧](https://pypi.org/project/langchain-delegare/) |
| [⟦T333⟧](https://nestdaddy.com/blog/langchain-live-web-search-news) | [  ⟦T742⟧](https://pypi.org/project/langchain-nestdaddy/) |
| [⟦T334⟧](https://toolstem.com) | [  ⟦T743⟧](https://pypi.org/project/langchain-toolstem/) |
| [⟦T335⟧](https://docs.scrapeless.com/en/integrations/langchain/) | [  ⟦T744⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T336⟧](https://docs.scrapeless.com/en/integrations/langchain/) | [  ⟦T745⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T337⟧](https://docs.scrapeless.com/en/integrations/langchain/) | [  ⟦T746⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T338⟧](https://docs.scrapeless.com/en/integrations/langchain/) | [  ⟦T747⟧](https://pypi.org/project/langchain-scrapeless/) |
| [⟦T339⟧](https://nextmail.sh/docs/python/langchain) | [  ⟦T748⟧](https://pypi.org/project/langchain-nextmail/) |
| [⟦T340⟧](https://github.com/itulo/eu-nordic-open-data-mcp/tree/main/packages/langchain-eu-nordic-open-data) | [  ⟦T749⟧](https://pypi.org/project/langchain-eu-nordic-open-data/) |
| [⟦T341⟧](https://pypi.org/project/langchain-surgemesh/) | [  ⟦T750⟧](https://pypi.org/project/langchain-surgemesh/) |
| [⟦T342⟧](https://acg.devlab.group/docs/integrations/langchain) | [  ⟦T751⟧](https://pypi.org/project/langchain-agent-commerce/) |
| [⟦T343⟧](https://pypi.org/project/langchain-arche/) | [  ⟦T752⟧](https://pypi.org/project/langchain-arche/) |
| [⟦T344⟧](https://github.com/seanmarkwei/langgraph-agentram) | [  ⟦T753⟧](https://pypi.org/project/langgraph-agentram/) |
| [⟦T345⟧](https://scrape.ly/docs/langchain) | [  ⟦T754⟧](https://pypi.org/project/langchain-scrapely/) |
| [⟦T346⟧](https://pypi.org/project/langchain-groundtruth/) | [  ⟦T755⟧](https://pypi.org/project/langchain-groundtruth/) |
| [⟦T347⟧](https://github.com/scoutwyze-max/scoutwyze-compute/blob/main/examples/README.md) | [  ⟦T756⟧](https://pypi.org/project/scoutwyze-compute/) |
| [⟦T348⟧](https://github.com/lv-analytics/liquidvision-mcp/tree/main/integrations/langchain) | [  ⟦T757⟧](https://pypi.org/project/langchain-liquidvision/) |
| [⟦T349⟧](https://github.com/reachdog/langchain-reachdog/tree/main/libs/reachdog) | [  ⟦T758⟧](https://pypi.org/project/langchain-reachdog/) |
| [⟦T350⟧](https://tokenusage.dev/langchain) | [  ⟦T759⟧](https://pypi.org/project/langchain-tokenusage-dev/) |
| [⟦T351⟧](https://docs.maqpna.com/sdk/framework-adapters/#langchain) | [  ⟦T760⟧](https://pypi.org/project/kosa8-maqpna/) |
| [⟦T352⟧](https://pypi.org/project/langchain-alterlab/) | [  ⟦T761⟧](https://pypi.org/project/langchain-alterlab/) |
| [⟦T353⟧](https://sealkeeper.run/docs/langchain) | [  ⟦T762⟧](https://pypi.org/project/langchain-sealkeeper/) |
| [⟦T354⟧](https://pypi.org/project/langchain-finzdata/) | [  ⟦T763⟧](https://pypi.org/project/langchain-finzdata/) |
| [⟦T355⟧](https://hlido.eu/docs/) | [  ⟦T764⟧](https://pypi.org/project/hlido-trust/) |
| [⟦T356⟧](https://github.com/mobilebox-dev/mobilebox/tree/main/packages/python/langchain-mobilebox#readme) | [  ⟦T765⟧](https://pypi.org/project/langchain-mobilebox/) |
| [⟦T357⟧](https://bhived.ai/docs/integrations/langchain) | [  ⟦T766⟧](https://pypi.org/project/langchain-bhived/) |
| [⟦T358⟧](https://onlinecompiler.io/docs/langchain) | [  ⟦T767⟧](https://pypi.org/project/langchain-onlinecompiler/) |
| [⟦T359⟧](https://www.easytranscriber.com/docs/langchain) | [  ⟦T768⟧](https://pypi.org/project/langchain-easytranscriber/) |
| [⟦T360⟧](https://tempguru.co/ai-agents) | [  ⟦T769⟧](https://pypi.org/project/tempguru/) |
| [⟦T361⟧](https://github.com/Walkover-Web-Solution/viasocket-apps/tree/main/python#langchain) | [  ⟦T770⟧](https://pypi.org/project/viasocket/) |
| [⟦T362⟧](https://github.com/AdsCrawl/langchain-adscrawl) | [  ⟦T771⟧](https://pypi.org/project/langchain-adscrawl/) |
| [⟦T363⟧](https://github.com/screwtapeai/pay-safely) | [  ⟦T772⟧](https://pypi.org/project/screwtape-pay-safely/) |
| [⟦T364⟧](https://github.com/cyberwareX/langchain-cyberwarex#readme) | [  ⟦T773⟧](https://pypi.org/project/langchain-cyberwarex/) |
| [⟦T365⟧](https://hyperresearch.ai/docs/answers/langchain) | [  ⟦T774⟧](https://pypi.org/project/langchain-hyperresearch/) |
| [⟦T366⟧](https://sofya.co/docs/langchain) | [  ⟦T775⟧](https://pypi.org/project/langchain-sofya/) |
| [⟦T367⟧](https://adapterspot.com/en/api/langchain/) | [  ⟦T776⟧](https://pypi.org/project/langchain-adapterspot/) |
| [⟦T368⟧](https://lanerouter.com/docs#langchain) | [  ⟦T777⟧](https://pypi.org/project/langchain-lanerouter/) |
| [⟦T369⟧](https://github.com/rascal-3/chainanalyzer-mcp/tree/main/packages/langchain-chainanalyzer) | [  ⟦T778⟧](https://pypi.org/project/langchain-chainanalyzer/) |
| [⟦T370⟧](https://github.com/ihouse-corp/langchain-askjapan#readme) | [  ⟦T779⟧](https://pypi.org/project/langchain-askjapan/) |
| [⟦T371⟧](https://vericto.com/docs/langchain) | [  ⟦T780⟧](https://pypi.org/project/langchain-vericto/) |
| [⟦T372⟧](https://github.com/Jona1245/agentdatahub-python#readme) | [  ⟦T781⟧](https://pypi.org/project/agentdatahub/) |
| [⟦T373⟧](https://github.com/alion-io/alion-sdk/tree/main/langchain#readme) | [  ⟦T782⟧](https://pypi.org/project/langchain-alion/) |
| [⟦T374⟧](https://github.com/etfiq/etfiq-connectors/tree/main/langchain-etfiq) | [  ⟦T783⟧](https://pypi.org/project/langchain-etfiq/) |
| [⟦T375⟧](https://channel3.ai/docs/langchain) | [  ⟦T784⟧](https://pypi.org/project/langchain-channel3/) |
| [⟦T376⟧](https://github.com/octogen-ai/octogen-dev/tree/main/integrations/langchain#readme) | [  ⟦T785⟧](https://pypi.org/project/langchain-storerouter/) |
| [⟦T377⟧](https://www.trezalabs.com/integrations/langchain) | [  ⟦T786⟧](https://pypi.org/project/langchain-treza/) |
| [⟦T378⟧](https://github.com/Mattbusel/langchain-tensorust/blob/main/docs/index.md) | [  ⟦T787⟧](https://pypi.org/project/langchain-tensorust/) |
| [⟦T379⟧](https://github.com/arcnm/langchain-arcnm#readme) | [  ⟦T788⟧](https://pypi.org/project/langchain-arcnm/) |
| [⟦T380⟧](https://github.com/outcrawlai/langchain-outcrawl#readme) | [  ⟦T789⟧](https://pypi.org/project/langchain-outcrawl/) || [⟦T381⟧](https://github.com/browsa-io/browsa/tree/main/integrations/langchain-browsa#readme) | [  ⟦T790⟧](https://pypi.org/project/langchain-browsa/) |
| [⟦T382⟧](https://github.com/waynehamadi/langchain-datacircle) | [  ⟦T791⟧](https://pypi.org/project/langchain-datacircle/) |
| [⟦T383⟧](https://github.com/Solvecha/solvecha-skills/tree/main/python) | [  ⟦T792⟧](https://pypi.org/project/solvecha/) |
| [⟦T384⟧](https://github.com/stophydotdev/stophy/tree/main/sdk/packages/langchain) | [  ⟦T793⟧](https://pypi.org/project/langchain-stophy/) |
| [⟦T385⟧](https://github.com/Bosco-Labs/bosco-labs-data/tree/main/langchain-bosco) | [  ⟦T794⟧](https://pypi.org/project/langchain-bosco/) |
| [⟦T386⟧](https://github.com/video-gen/langchain-videogen#readme) | [  ⟦T795⟧](https://pypi.org/project/langchain-videogen/) |
| [⟦T387⟧](https://github.com/Vovala14/CAEL/tree/codex/agent-provenance/examples/agent_provenance) | [  ⟦T796⟧](https://pypi.org/project/cael-provenance-bridge/) |
| [⟦T388⟧](https://socialscrape.dev/docs/langchain) | [  ⟦T797⟧](https://pypi.org/project/langchain-socialscrape/) |
| [⟦T389⟧](https://github.com/nohosa001-pixel/x402-cleanweb-agent/tree/main/packages/langchain-x402-cleanweb#readme) |不适用 |
| [⟦T390⟧](https://x402check.dev) |不适用 |
| [⟦T391⟧](https://agentlair.dev/docs) |不适用 |
| [⟦T392⟧](https://github.com/asindotdev/langchain-asin#readme) |不适用 |
| [⟦T393⟧](https://github.com/automdev/langchain-autom#readme) |不适用 |
| [⟦T394⟧](https://github.com/kochetkov-ma/langchain-brewpage#readme) |不适用 |
| [⟦T395⟧](https://browserless.io) |不适用 |
| [⟦T396⟧](https://github.com/capturekitdev/langchain-capturekit#readme) |不适用 |
| [⟦T397⟧](https://github.com/chartquery/langchain-chartquery#readme) |不适用 |
| [⟦T398⟧](https://cleave.fi/docs/agents/langchain) |不适用 |
| [⟦T399⟧](https://github.com/faxforagents/langchain-faxforagents/blob/main/README.md) |不适用 |
| [⟦T400⟧](https://github.com/fokals/langchain-fokals#readme) |不适用 |
| [⟦T401⟧](https://github.com/Sandeep85Das/langchain-frame) |不适用 |
| [⟦T402⟧](https://huangtingflux.com/integrations/langchain) |不适用 |
| [⟦T403⟧](https://api.kaer.ai/docs/langchain) |不适用 |
| [⟦T404⟧](https://movoa.readthedocs.io/en/latest/integrations/langchain/) |不适用 |
| [⟦T405⟧](https://github.com/piloterr/langchain-piloterr#readme) |不适用 |
| [⟦T406⟧](https://popnow.ai/docs/langchain) |不适用 |
| [⟦T407⟧](https://docs.scrapeunblocker.com/sdks/langchain) |不适用 |
| [⟦T408⟧](https://sidequestpays.com/docs#langchain) |不适用 |
| [⟦T409⟧](/oss/python/integrations/tools/stagehand) |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/tools/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。