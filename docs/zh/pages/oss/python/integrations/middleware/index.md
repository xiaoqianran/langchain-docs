<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/python/integrations/middleware/index -->

# 中间件集成

使用 LangChain Python 与中间件集成。

浏览不同提供商的可用中间件或为生态系统贡献自己的中间件。了解有关中间件如何在 [middleware overview](/oss/python/langchain/middleware/overview) 中工作以及如何在 [Deep Agents docs](/oss/python/deepagents/customization#middleware) 中将中间件与 Deep Agents 结合使用的更多信息。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

## 分享你的中间件

中间件支持上下文工程、线束定制和运行时安全控制。它是 LangChain 中的一个有用的扩展点，我们喜欢强调社区用它构建的内容：

> **[Add an official integration](/oss/python/contributing/implement-langchain#middleware)**
>
> 按照贡献指南构建和发布中间件包。

> **[Share a community middleware](https://github.com/langchain-ai/docs)**
>
> 打开文档存储库的 PR，将您的中间件添加到所有集成表中。

## 特色集成|供应商|可用的中间件 |来源 |下载 |
| :-| :-| :-| :-|
| [⟦T0⟧](/oss/python/integrations/middleware/openai) |内容审核、模型路由和工具风险控制 | [⟦T1⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/openai) | [  ⟦T141⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T2⟧](/oss/python/integrations/middleware/anthropic) |提示缓存、bash 工具、文本编辑器、内存和文件搜索 | [⟦T3⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic) | [  ⟦T142⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T4⟧](/oss/python/integrations/middleware/aws) |提示缓存和 AgentCore 付款 | [⟦T5⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/aws)、[⟦T6⟧](https://github.com/aws/bedrock-agentcore-sdk-python) | [  ⟦T143⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T7⟧](/oss/python/integrations/middleware/azure_ai) |文本审核、图像审核、提示屏蔽、受保护的材料和接地性 | [⟦T8⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-ai) | [  ⟦T144⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T9⟧](/oss/python/integrations/middleware/nvidia) |模型布线和 Nemotron 3 Ultra 线束优化 | [⟦T10⟧](https://github.com/langchain-ai/langchain-nvidia)、[⟦T11⟧](https://github.com/langchain-ai/deepagents) |不适用 |

## 所有中间件|供应商|可用的中间件 |来源 |下载 |
| :-| :-| :-| :-|
| [⟦T12⟧](/oss/python/integrations/middleware/openai) |内容审核、模型路由和工具风险控制 | [⟦T13⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/openai) | [  ⟦T145⟧](https://pypi.org/project/langchain-openai/) |
| [⟦T14⟧](/oss/python/integrations/middleware/anthropic) |提示缓存、bash 工具、文本编辑器、内存和文件搜索 | [⟦T15⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic) | [  ⟦T146⟧](https://pypi.org/project/langchain-anthropic/) |
| [⟦T16⟧](/oss/python/integrations/middleware/aws) |提示缓存和 AgentCore 付款 | [⟦T17⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/aws)、[⟦T18⟧](https://github.com/aws/bedrock-agentcore-sdk-python) | [  ⟦T147⟧](https://pypi.org/project/langchain-aws/) |
| [⟦T19⟧](/oss/python/integrations/middleware/azure_ai) |文本审核、图像审核、提示屏蔽、受保护的材料和接地性 | [⟦T20⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-ai) | [  ⟦T148⟧](https://pypi.org/project/langchain-azure-ai/) |
| [⟦T21⟧](/oss/python/langchain/frontend/integrations/copilotkit) |用于 Deep Agents 的 CopilotKit 中间件和 FastAPI 桥接器、create\_agent 图表、AG-UI 以及 React 和运行时客户端 | [⟦T22⟧](https://github.com/CopilotKit/CopilotKit) | [  ⟦T149⟧](https://pypi.org/project/copilotkit/) |
| [⟦T23⟧](https://tenuo.ai/langchain) | LangChain 代理的任务范围授权，将每个任务限制为其所需的工具、参数值和时间，在执行前强制执行，委托代理接收父级权限的子集。 | [⟦T24⟧](https://github.com/tenuo-ai/tenuo) | [  ⟦T150⟧](https://pypi.org/project/tenuo/) |
| [⟦T25⟧](https://github.com/alizahidraja/isnad) |代理输出的声明级来源和信任评级。在实时注册表中对索赔链（来源、抓取工具、模型）中的每个发送器进行评级，在最薄弱的环节限制链，并隔离伪造的 (mawḍūʿ) 链——具有防篡改的审计跟踪。 | [⟦T26⟧](https://github.com/alizahidraja/isnad) | [  ⟦T151⟧](https://pypi.org/project/isnad/) || [⟦T27⟧](https://github.com/TahaK29/deepagents-graph-memory) |适用于 Deep Agents 的图形上下文中间件和工具，使用嵌入式 LadybugDB 记录和调用工作流程结果。 | [⟦T28⟧](https://github.com/TahaK29/deepagents-graph-memory) | [  ⟦T152⟧](https://pypi.org/project/deepagents-graph-memory/) |
| [⟦T29⟧](https://attenu.io/docs/example-langgraph/) |通过wrap\_tool\_call（子代理的权限是其父代理的权限的计算子集）对每个工具调用和子代理切换执行每个代理权限，并使用离线验证的哈希链审计日志| [⟦T30⟧](https://github.com/attenu-io/attenu-guard) | [  ⟦T153⟧](https://pypi.org/project/attenu-guard/) |
| [⟦T31⟧](https://github.com/highflame-ai/highflame-sdk) |运行时 AI 安全护栏（提示注入、PII/DLP、内容安全）通过 Highflame Shield（OWASP LLM Top 10）作为中间件应用。 | [⟦T32⟧](https://github.com/highflame-ai/highflame-sdk) | [  ⟦T154⟧](https://pypi.org/project/highflame/) |
| [⟦T33⟧](https://github.com/Thanatos9404/llmslim/blob/main/docs/integrations/LANGCHAIN.md#agents-shorten-long-tool-output-langchain-1x) |代理中间件会在模型首次看到长工具结果之前将其缩短一次，以便稍后的模型调用重新发送相同的字节。本地，无模型调用。 | [⟦T34⟧](https://github.com/Thanatos9404/llmslim) | [  ⟦T155⟧](https://pypi.org/project/llmslim/) |
| [⟦T35⟧](https://athroniaeth.github.io/piighost/getting-started/langchain/) |保护提示、工具调用和代理对话中的个人数据 (PII)。从模型中隐藏敏感值，然后在回复中和工具边界恢复真实值，因此工具和用户仍然可以获得真实数据。可插入的正则表达式、NER 和 LLM 检测器、线程一致的令牌以及逐个令牌的流恢复。 | [⟦T36⟧](https://github.com/Athroniaeth/piighost) | [  ⟦T156⟧](https://pypi.org/project/piighost/) || [⟦T37⟧](https://github.com/Cygnux-Labs/Tracekit/blob/main/docs/integrations/langchain.md) | Tracekit 要求单独的签名者在运行之前允许、拒绝或保留某个人的每个代理工具调用，并将每个调用和结果记录在一个可离线验证的已签名的哈希链日志中。 | [⟦T38⟧](https://github.com/Cygnux-Labs/Tracekit) | [  ⟦T157⟧](https://pypi.org/project/tracekit-ai/) |
| [⟦T39⟧](https://docs.vulnify.io/sdks/adapters/?utm_source=github\&utm_medium=directory\&utm_campaign=langchain-docs#langchain-create_agent-middleware) |工具调用的运行时授权，包括允许、审查或阻止决策、风险评分、可选的人工批准以及阻止调用的错误 ToolMessages。 | [⟦T40⟧](https://github.com/vulnify/vulnify-sdk-python) | [  ⟦T158⟧](https://pypi.org/project/vulnify/) |
| [⟦T41⟧](https://github.com/cisco-ai-defense/ai-defense-langchain-middleware) |运行时安全检查| [⟦T42⟧](https://github.com/cisco-ai-defense/ai-defense-langchain-middleware) | [  ⟦T159⟧](https://pypi.org/project/langchain-cisco-aidefense/) |
| [⟦T43⟧](https://github.com/mthamil107/prompt-shield) |运行时提示注入防火墙。使用块、标志和日志模式扫描检测器和输出扫描器的输入、工具结果和输出。 | [⟦T44⟧](https://github.com/mthamil107/prompt-shield) | [  ⟦T160⟧](https://pypi.org/project/prompt-shield-ai/) |
| [⟦T45⟧](https://github.com/sriram1983007-dev/langchain-sra-riskgate#readme) |在运行之前检查稳定币支付工具调用，并保留或拒绝那些违反支出、接收者或资产规则的调​​用。 | [⟦T46⟧](https://github.com/sriram1983007-dev/langchain-sra-riskgate) | [  ⟦T161⟧](https://pypi.org/project/langchain-sra-riskgate/) |
| [⟦T47⟧](https://github.com/delphisecurity/xaidr#langchain-middleware) |用于 AI 代理的进程内运行时安全传感器。 LangChain 中间件涵盖输入、工具调用和输出边界，用于提示注入、越狱、DLP 和 A2A 协议扫描。 | [⟦T48⟧](https://github.com/delphisecurity/xaidr) | [  ⟦T162⟧](https://pypi.org/project/xaidr/) |
| [⟦T49⟧](https://github.com/emanueleielo/compact-middleware) | Claude Code 的压缩引擎作为 LangChain 中间件。针对长时间运行代理的多级上下文压缩。 | [⟦T50⟧](https://github.com/emanueleielo/compact-middleware) | [  ⟦T163⟧](https://pypi.org/project/compact-middleware/) || [⟦T51⟧](https://pypi.org/project/langgraph-goat/) | langgraph-goat 记录候选计划、分数以及每个计划被选择或拒绝作为 LangGraph 代理计划的原因，然后为调试和最终用户透明度提供自然​​语言解释。 | [⟦T52⟧](https://github.com/Samsung/langgraph-goat) | [  ⟦T164⟧](https://pypi.org/project/langgraph-goat/) |
| [⟦T53⟧](https://docs.neuraltrust.ai/integrations/langchain) | TrustGuard 评估中间件。允许、阻止、报告或转换代理输入、模型输出和可选工具流量。 | [⟦T54⟧](https://github.com/NeuralTrust/langchain-neuraltrust) | [  ⟦T165⟧](https://pypi.org/project/langchain-neuraltrust/) |
| [⟦T55⟧](https://docs.openbox.ai/getting-started/langgraph) | LangGraph和Deep Agents的实时治理。政策、护栏、HITL、OTel 挂钩治理和行为规则。 | [⟦T56⟧](https://github.com/OpenBox-AI/openbox-langgraph-sdk-python) | [  ⟦T166⟧](https://pypi.org/project/openbox-langgraph-sdk-python/) |
| [⟦T57⟧](/oss/python/integrations/middleware/scaledown) |对话摘要、上下文和工具结果压缩以及结构化提取 | [⟦T58⟧](https://github.com/scaledown-team/langchain-scaledown/tree/main/libs/scaledown) | [  ⟦T167⟧](https://pypi.org/project/langchain-scaledown/) |
| [⟦T59⟧](https://seekrit.dev/docs/guides/frameworks/langgraph#4-scope-a-key-to-one-tool) |每个模型调用和每个工具调用的范围秘密。凭据在代理代码中保留为占位符，并在 HTTP 边界处针对默认拒绝允许列表进行替换，因此未列出的工具无法访问凭据。 | [⟦T60⟧](https://github.com/seekritdev/python-sdk) | [  ⟦T168⟧](https://pypi.org/project/seekrit/) |
| [⟦T61⟧](https://github.com/shane-rand/langchain-monty) |在 Pydantic 的 Monty 运行时内提供代码解释 | [⟦T62⟧](https://github.com/shane-rand/langchain-monty) | [  ⟦T169⟧](https://pypi.org/project/langchain-monty/) || [⟦T63⟧](https://github.com/provared/provared/tree/main/python/integrations/provared-langchain) | Checks each tool call through wrap\_tool\_call against a passkey-signed permission, runs the tool only if allowed, and writes a signed, hash-chained receipt that can be verified offline. | [⟦T64⟧](https://github.com/provared/provared/tree/main/python/integrations/provared-langchain) | [  ⟦T170⟧](https://pypi.org/project/provared-langchain/) |
| [⟦T65⟧](https://submilli.ai/docs/tutorials/connect-deepagents/) |代码模式中间件，根据策略在 submilli-server 上运行代理编写的 TypeScript 程序，并可以调用代理自己的工具。 | [⟦T66⟧](https://github.com/submilli/submilli-python) | [  ⟦T171⟧](https://pypi.org/project/langchain-submilli/) |
| [⟦T67⟧](https://nuggets.life) |工具调用的预执行权限强制执行。 Verifies a scoped, signed delegation before each tool runs, fails closed on deny, and emits an independently verifiable cryptographic proof of every decision. | [⟦T68⟧](https://github.com/NuggetsLtd/langchain-nuggets) | [  ⟦T172⟧](https://pypi.org/project/langchain-nuggets/) |
| [⟦T69⟧](https://runcycles.io) |模型调用、工具调用和代理循环的预执行预算权限 | [⟦T70⟧](https://github.com/runcycles/langchain-runcycles) | [  ⟦T173⟧](https://pypi.org/project/langchain-runcycles/) |
| [⟦T71⟧](https://github.com/acgs-ai/langchain-acgs#readme) |在运行之前检查每个代理工具调用是否符合 ACGS 构成规则；被阻止的呼叫将被拒绝，审核规则会暂停客服人员。 | [⟦T72⟧](https://github.com/acgs-ai/langchain-acgs) | [  ⟦T174⟧](https://pypi.org/project/langchain-acgs/) |
| [⟦T73⟧](https://github.com/TimurRakhmatullin86/langchain-promptfirewall#readme) | LangChain 的亚毫秒级 PII 检测和提示注入防火墙。 Zero network, zero GPU, pure Rust core via PyO3. | [⟦T74⟧](https://github.com/TimurRakhmatullin86/langchain-promptfirewall) | [  ⟦T175⟧](https://pypi.org/project/langchain-promptfirewall/) |
| [⟦T75⟧](https://github.com/johanity/langchain-router) | Phase-based model routing.路由执行转向快速模型，保留主要用于规划和恢复。 | [⟦T76⟧](https://github.com/johanity/langchain-router) | [  ⟦T176⟧](https://pypi.org/project/langchain-router/) || [⟦T77⟧](https://docs.tealtiger.ai/integrations/langchain) |确定性治理中间件。政策执行、成本限制、工具许可名单、FREEZE 规则和 SARIF 审计证据，治理路径中没有法学硕士。 | [⟦T78⟧](https://github.com/agentguard-ai/tealtiger/tree/main/packages/langchain-tealtiger) | [  ⟦T177⟧](https://pypi.org/project/langchain-tealtiger/) |
| [⟦T79⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) |用于有序任务管道的隐式状态机中间件，具有每个任务工具范围、动态提示注入和可组合完成验证。 | [⟦T80⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) | [  ⟦T178⟧](https://pypi.org/project/langchain-task-steering/) |
| [⟦T81⟧](https://github.com/Sandeep85Das/langchain-meragpt) |使用来自 meraGPT Decider 1 的校准概率的类型化决策（是/否、选择、分数），作为 Runnable、工具和代理中间件。 | [⟦T82⟧](https://github.com/Sandeep85Das/langchain-meragpt) | [  ⟦T179⟧](https://pypi.org/project/langchain-meragpt/) |
| [⟦T83⟧](https://bastionsoft.com) |即时注入和越狱检测。在模型运行之前，筛选用户输入和工具结果，包括通过检索到的内容进行间接注入。在您自己的硬件上本地运行。 | [⟦T84⟧](https://github.com/bastion-soft/bastion-prompt-protection) | [  ⟦T180⟧](https://pypi.org/project/bastion-prompt-protection/) |
| [⟦T85⟧](https://github.com/bharatkhanna-dev/langchain-turn-window#readme) |跨提供商LangChain代理中间件在每次模型调用之前保留最新的人工锚定对话，同时将工具调用和工具结果消息保持在一起。 | [⟦T86⟧](https://github.com/bharatkhanna-dev/langchain-turn-window) | [  ⟦T181⟧](https://pypi.org/project/langchain-turn-window/) |
| [⟦T87⟧](https://github.com/info-alphanimble/langchain-wity#readme) |关于一次性文本的固定选项问题，每个选项都有一个概率，用于模型路由、工具风险检查和分类。 | [⟦T88⟧](https://github.com/info-alphanimble/langchain-wity) | [  ⟦T182⟧](https://pypi.org/project/langchain-wity/) || [⟦T89⟧](https://github.com/emanueleielo/advisor-middleware) | Claude Code 的顾问模式为 LangChain 中间件。将快速执行者模型与强大的顾问模型配对，仅干预关键决策。 | [⟦T90⟧](https://github.com/emanueleielo/advisor-middleware) | [  ⟦T183⟧](https://pypi.org/project/advisor-middleware/) |
| [⟦T91⟧](https://github.com/RauhanAhmed/langchain-dynamic-tools-middleware) |嵌入式代理中间件通过 zvec 提供 100 毫秒以下的混合密集和稀疏向量工具检索。消除了超过 80% 的提示令牌开销，并且在伯克利函数调用排行榜 (BFCL) 基准测试中优于基于 LLM 的工具选择。 | [⟦T92⟧](https://github.com/RauhanAhmed/langchain-dynamic-tools-middleware) | [  ⟦T184⟧](https://pypi.org/project/langchain-dynamic-tools-middleware/) |
| [⟦T93⟧](https://github.com/wenhua6666668-oss/langchain-agenttrafficlab#automatic-task-time-routing-v03) |自动任务时间路由到可执行的 MCP 和提供商功能，并具有故障重新决策和结果报告。 | [⟦T94⟧](https://github.com/wenhua6666668-oss/langchain-agenttrafficlab) | [  ⟦T185⟧](https://pypi.org/project/langchain-agenttrafficlab/) |
| [⟦T95⟧](https://loopgrid.io/integrations/langchain/) |本机 LangChain AgentMiddleware，用于通过 LoopGrid Core 签署决策证据、策略执行、人工批准和受保护的工具执行。 | [⟦T96⟧](https://github.com/loopgridio/loopgrid-langchain) | [  ⟦T186⟧](https://pypi.org/project/loopgrid-langchain/) |
| [⟦T97⟧](https://recallmem.dev/guides/langchain) |聊天消息历史记录存储在 Recall 会话中，因此 Recall 还可以从中了解用户。 | [⟦T98⟧](https://github.com/recallmem/recall) | [  ⟦T187⟧](https://pypi.org/project/langchain-recall/) |
| [⟦T99⟧](https://recallmem.dev/guides/langchain) | create\_agent 代理的长期记忆：将 Recall 了解到的有关用户的信息添加到系统提示中并记录每次交换。 | [⟦T100⟧](https://github.com/recallmem/recall) | [  ⟦T188⟧](https://pypi.org/project/langchain-recall/) || [⟦T101⟧](https://github.com/johanity/langchain-collapse) |预防性上下文管理。在连续的工具调用组填充上下文窗口之前折叠它们。 | [⟦T102⟧](https://github.com/johanity/langchain-collapse) | [  ⟦T189⟧](https://pypi.org/project/langchain-collapse/) |
| [⟦T103⟧](https://api.relayshield.net/developers) |当 RelayShield 报告风险时，强制预执行门会阻止 connect\_mcp\_server 和 install\_mcp\_package 工具调用。 | [⟦T104⟧](https://github.com/nzdsf2-gif/langchain-relayshield) | [  ⟦T190⟧](https://pypi.org/project/langchain-relayshield/) |
| [⟦T105⟧](https://github.com/kenithphilip/Tessera) |当上下文包含不受信任的段时，门控工具会调用签名的信任标签和污点跟踪。 | [⟦T106⟧](https://github.com/kenithphilip/Tessera) | [  ⟦T191⟧](https://pypi.org/project/tessera-mesh/) |
| [⟦T107⟧](https://github.com/maskflow/maskflow/tree/main/packages/maskflow-langchain) |可逆 PII 匿名器/去匿名器，langchain-experimental 的 Presidio 匿名器的一个插件（相同的 .anonymize / .deanonymize / .deanonymizer\_mapping 和 JSON/YAML 保存加载）。添加了大多数工具遗漏的印度标识符（Aadhaar、PAN、GSTIN、UPI、IFSC、ABHA、名称、地址）、流感知去匿名器 Runnable，以及可选的泄漏防护回调，如果 PII 到达模型，该回调将导致调用失败。 | [⟦T108⟧](https://github.com/maskflow/maskflow/tree/main/packages/maskflow-langchain) | [  ⟦T192⟧](https://pypi.org/project/maskflow-langchain/) || [⟦T109⟧](https://docs.ctrlrun.dev/guides/langchain-middleware) |通过wrap\_tool\_call 进行策略门控工具调用：被拒绝的调用永远不会到达工具，并且模型被告知哪个规则拒绝了它；效果键在共享存储的进程之间最多执行一次；引发的工具会导致效果未解决而不是重试；批准决定需要一个人；每项决定（包括拒绝）都有收据。 | [⟦T110⟧](https://github.com/CTRLRun/ctrlrun/tree/main/adapters/langchain) | [  ⟦T193⟧](https://pypi.org/project/ctrlrun-langchain/) |
| [⟦T111⟧](https://docs.deepkeep.ai) | DeepKeep AI 防火墙对 LangChain 代理进行预审核和后审核。 | | [  ⟦T194⟧](https://pypi.org/project/langchain-deepkeep/) |
| [⟦T112⟧](https://axiorank.com/docs/integrations/langchain) | AI 代理的安全网关：对工具调用进行评分，并针对允许、拒绝和编辑的策略进行模型轮换。 | [⟦T113⟧](https://github.com/AxioRank/langchain-axiorank) | [  ⟦T195⟧](https://pypi.org/project/langchain-axiorank/) |
| [⟦T114⟧](https://github.com/joy7758/persona-object-protocol/tree/main/integrations/langchain-pop) |适用于 LangChain 代理的便携式角色加载、遗留迁移和边界感知工具过滤。 | [⟦T115⟧](https://github.com/joy7758/persona-object-protocol/tree/main/integrations/langchain-pop) | [  ⟦T196⟧](https://pypi.org/project/langchain-pop/) |
| [⟦T116⟧](https://github.com/dshakes/distil) |可逆、经过认证的上下文压缩。在模型调用之前摘要大型工具输出和消息历史记录（工具和函数消息可逆，人类和系统无损，模型消息从未重写），并按字节精确恢复每个摘要。压缩上下文和完整上下文之间的决策等价性通过统计非劣效性门进行离线认证。 | [⟦T117⟧](https://github.com/dshakes/distil) | [  ⟦T197⟧](https://pypi.org/project/langchain-distil/) || [⟦T118⟧](https://owasp.org/www-project-agent-memory-guard/) |针对 AI 代理内存中毒的运行时防御 (OWASP ASI06)。使用阻止、警告和剥离模式在本地扫描消息、模型响应和工具输出。 | [⟦T119⟧](https://github.com/OWASP/www-project-agent-memory-guard/tree/main/integrations/langchain-agent-memory-guard) | [  ⟦T198⟧](https://pypi.org/project/langchain-agent-memory-guard/) |
| [⟦T120⟧](https://comply54.io/langchain) |根据非洲数据保护和金融部门法规（拒绝、升级、审计或允许）对人工智能代理执行运行时合规性执行。 | [⟦T121⟧](https://github.com/comply54/langchain-comply54) | [  ⟦T199⟧](https://pypi.org/project/langchain-comply54/) |
| [⟦T122⟧](https://github.com/Enigma-Vault/NoPII/tree/main/integrations/langchain-nopii-middleware) |运行时 PII 标记化。检测出站提示中的个人数据，在请求到达 LLM 之前将其替换为确定性保管库令牌，并恢复响应中的原始值。 | [⟦T123⟧](https://github.com/Enigma-Vault/NoPII/tree/main/integrations/langchain-nopii-middleware) | [  ⟦T200⟧](https://pypi.org/project/langchain-nopii-middleware/) |
| [⟦T124⟧](https://github.com/Text2SqlAgent/text2sql-framework) |使用递归工具替代 RAG：代理使用一个execute\_sql 工具来探索、写入、测试和自我更正。 | [⟦T125⟧](https://github.com/Text2SqlAgent/text2sql-framework) | [  ⟦T201⟧](https://pypi.org/project/text2sql-framework/) |
| [⟦T126⟧](https://github.com/IngmarVG-IB/langchain-dns-aid) |通过 DNS-AID 协议进行基于 DNS 的代理发现。启动时自动发布代理，关闭时自动取消发布，并提供发现工具。 | [⟦T127⟧](https://github.com/IngmarVG-IB/langchain-dns-aid) | [  ⟦T202⟧](https://pypi.org/project/langchain-dns-aid/) |
| [⟦T128⟧](https://github.com/mahmoud661/langgraph-state-machine) | LangGraph React 代理的基于部分的流量控制。使用范围工具、提示、自动转换、分支和可选的每部分 LLM 覆盖将对话分为离散阶段。 | [⟦T129⟧](https://github.com/mahmoud661/langgraph-state-machine)​​ | [  ⟦T203⟧](https://pypi.org/project/langgraph-state-machine/) || [⟦T130⟧](https://github.com/h2cker/vecr) |在模型调用之前使用结构化令牌的正则表达式保留白名单进行确定性 LLM 上下文压缩。 | [⟦T131⟧](https://github.com/h2cker/vecr) | [  ⟦T204⟧](https://pypi.org/project/vecr-compress/) |
| [⟦T132⟧](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/integrations/langchain) |使用代理威胁规则对提示注入、工具中毒和不安全工具调用进行运行时检测。停止代理或阻止对关键发现的工具调用并保留审计跟踪。 | [⟦T133⟧](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/integrations/langchain) |不适用 |
| [⟦T134⟧](https://github.com/cloudthinker-ai/eager-tools) |通过在流块关闭时调度每个工具调用，将工具执行与 LLM 生成重叠，减少代理挂钟延迟。 | [⟦T135⟧](https://github.com/cloudthinker-ai/eager-tools) |不适用 |
| [⟦T136⟧](https://github.com/ExposureGuard/haldir/tree/main/integrations/langchain-haldir) | LangChain 代理的治理层，具有范围会话、加密秘密、哈希链审计和策略执行。 | [⟦T137⟧](https://github.com/ExposureGuard/haldir/tree/main/integrations/langchain-haldir) |不适用 |
| [⟦T138⟧](/oss/python/integrations/middleware/nvidia) |模型布线和 Nemotron 3 Ultra 线束优化 | [⟦T139⟧](https://github.com/langchain-ai/langchain-nvidia)、[⟦T140⟧](https://github.com/langchain-ai/deepagents) |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/middleware/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。