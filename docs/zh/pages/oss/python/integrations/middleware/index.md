<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/python/integrations/middleware/index -->

# 中间件集成

使用 LangChain Python 与中间件集成。

浏览不同提供商的可用中间件或为生态系统贡献自己的中间件。详细了解中间件在 [middleware overview](/oss/python/langchain/middleware/overview) 中的工作原理以及如何在 [Deep Agents docs](/oss/python/deepagents/customization#middleware) 中将中间件与 Deep Agents 一起使用。

## 分享你的中间件

中间件支持上下文工程、线束定制和运行时安全控制。它是 LangChain 中的一个有用的扩展点，我们喜欢强调社区用它构建的内容：

<CardGroup>
  <Card title="Add an official integration" icon="package" href="/oss/python/contributing/implement-langchain#middleware">
    按照贡献指南构建和发布中间件包。
  </Card>

  <Card title="Share a community middleware" icon="users" href="https://github.com/langchain-ai/docs">
    打开文档存储库的 PR，将您的中间件添加到所有集成表中。
  </Card>
</CardGroup>

## 特色集成<div>
  |供应商|可用的中间件 |来源 |下载 |
  | :- | :- | :- | :- |
  | [⟦T0⟧](/oss/python/integrations/middleware/openai) |内容审核 | [⟦T1⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T2⟧](/oss/python/integrations/middleware/anthropic) |提示缓存、bash 工具、文本编辑器、内存和文件搜索 | [⟦T3⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic) | <span><a href="https://pypi.org/project/langchain-anthropic/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T4⟧](/oss/python/integrations/middleware/aws) |提示缓存和 AgentCore 付款 | [⟦T5⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/aws)、[⟦T6⟧](https://github.com/aws/bedrock-agentcore-sdk-python) | <span><a href="https://pypi.org/project/langchain-aws/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T7⟧](/oss/python/integrations/middleware/azure_ai) |文本审核、图像审核、提示屏蔽、受保护的材料和接地性 | [⟦T8⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-ai) | <span><a href="https://pypi.org/project/langchain-azure-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T9⟧](/oss/python/integrations/middleware/nvidia) |模型布线和 Nemotron 3 Ultra 线束优化 | [⟦T10⟧](https://github.com/langchain-ai/langchain-nvidia)、[⟦T11⟧](https://github.com/langchain-ai/deepagents) | <span>不适用</span> |
</div>

## 所有中间件<div>
  |供应商|可用的中间件 |来源 |下载 |
  | :- | :- | :- | :- |
  | [⟦T12⟧](/oss/python/integrations/middleware/openai) |内容审核 | [⟦T13⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/openai) | <span><a href="https://pypi.org/project/langchain-openai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T14⟧](/oss/python/integrations/middleware/anthropic) |提示缓存、bash 工具、文本编辑器、内存和文件搜索 | [⟦T15⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic) | <span><a href="https://pypi.org/project/langchain-anthropic/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T16⟧](/oss/python/integrations/middleware/aws) |提示缓存和 AgentCore 付款 | [⟦T17⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/aws)、[⟦T18⟧](https://github.com/aws/bedrock-agentcore-sdk-python) | <span><a href="https://pypi.org/project/langchain-aws/"><img alt="Downloads per month" /></a></span>|
  | [⟦T19⟧](/oss/python/integrations/middleware/azure_ai) |文本审核、图像审核、提示屏蔽、受保护的材料和接地性 | [⟦T20⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-ai) | <span><a href="https://pypi.org/project/langchain-azure-ai/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T21⟧](/oss/python/langchain/frontend/integrations/copilotkit) | CopilotKit 中间件和 FastAPI 桥，用于 Deep Agents、create\_agent 图表、AG-UI 以及 React 和运行时客户端 | [⟦T22⟧](https://github.com/CopilotKit/CopilotKit) | <span><a href="https://pypi.org/project/copilotkit/"><img alt="Downloads per month" /></a></span>|
  | [⟦T23⟧](https://github.com/alizahidraja/isnad) |代理输出的声明级来源和信任评级。在实时注册表中对索赔链（源、抓取器、模型）中的每个发送器进行评级，在最薄弱的环节限制链，并通过防篡改的审计跟踪隔离伪造的 (mawḍūʿ) 链。 | [⟦T24⟧](https://github.com/alizahidraja/isnad) | <span><a href="https://pypi.org/project/isnad/"> <img alt="Downloads per month" /></a></span> || [⟦T25⟧](https://tenuo.ai/langgraph#tenuomiddleware-langchain-1x-create_agent) | LangChain 代理的任务范围授权：每个工具调用都会根据签名的授权进行检查，该授权限制了哪些工具运行、使用哪些参数、运行多长时间，并且只有在委派工作时才能缩小范围。 | [⟦T26⟧](https://github.com/tenuo-ai/tenuo) | <span><a href="https://pypi.org/project/tenuo/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T27⟧](https://attenu.io/docs/example-langgraph/) |通过wrap\_tool\_call（子代理的权限是其父代理的权限的计算子集）对每个工具调用和子代理切换执行每个代理权限，并使用离线验证的哈希链审计日志| [⟦T28⟧](https://github.com/attenu-io/attenu-guard) | <span><a href="https://pypi.org/project/attenu-guard/"><img alt="Downloads per month" /></a></span>|
  | [⟦T29⟧](https://github.com/delphisecurity/xaidr#langchain-middleware) |用于 AI 代理的进程内运行时安全传感器。 LangChain 中间件涵盖输入、工具调用和输出边界，用于提示注入、越狱、DLP 和 A2A 协议扫描。 | [⟦T30⟧](https://github.com/delphisecurity/xaidr) | <span><a href="https://pypi.org/project/xaidr/"><img alt="Downloads per month" /></a></span>|
  | [⟦T31⟧](https://athroniaeth.github.io/piighost/getting-started/langchain/) |保护提示、工具调用和代理对话中的个人数据 (PII)。从模型中隐藏敏感值，然后在回复中和工具边界恢复真实值，因此工具和用户仍然可以获得真实数据。可插入的正则表达式、NER 和 LLM 检测器、线程一致的令牌以及逐个令牌的流恢复。 | [⟦T32⟧](https://github.com/Athroniaeth/piighost) | <span><a href="https://pypi.org/project/piighost/"><img alt="Downloads per month" /></a></span>|| [⟦T33⟧](https://github.com/highflame-ai/highflame-sdk) |运行时 AI 安全护栏（提示注入、PII/DLP、内容安全）通过 Highflame Shield（OWASP LLM Top 10）作为中间件应用。 | [⟦T34⟧](https://github.com/highflame-ai/highflame-sdk) | <span><a href="https://pypi.org/project/highflame/"><img alt="Downloads per month" /></a></span>|
  | [⟦T35⟧](https://github.com/mthamil107/prompt-shield) |运行时提示注入防火墙。使用块、标志和日志模式扫描检测器和输出扫描器的输入、工具结果和输出。 | [⟦T36⟧](https://github.com/mthamil107/prompt-shield) | <span><a href="https://pypi.org/project/prompt-shield-ai/"><img alt="Downloads per month" /></a></span>|
  | [⟦T37⟧](https://github.com/RauhanAhmed/langchain-dynamic-tools-middleware) |嵌入式代理中间件通过 zvec 提供 100 毫秒以下的混合密集和稀疏矢量工具检索。消除了超过 80% 的提示令牌开销，并且在伯克利函数调用排行榜 (BFCL) 基准测试中优于基于 LLM 的工具选择。 | [⟦T38⟧](https://github.com/RauhanAhmed/langchain-dynamic-tools-middleware) | <span><a href="https://pypi.org/project/langchain-dynamic-tools-middleware/"><img alt="Downloads per month" /></a></span>|
  | [⟦T39⟧](https://seekrit.dev/docs/guides/frameworks/langgraph#4-scope-a-key-to-one-tool) |每个模型调用和每个工具调用的范围秘密。凭据在代理代码中保留为占位符，并在 HTTP 边界处针对默认拒绝允许列表进行替换，因此未列出的工具无法访问凭据。 | [⟦T40⟧](https://github.com/seekritdev/python-sdk) | <span><a href="https://pypi.org/project/seekrit/"> <img alt="Downloads per month" /></a></span> || [⟦T41⟧](https://github.com/maskflow/maskflow/tree/main/packages/maskflow-langchain) |可逆 PII 匿名器/去匿名器，langchain-experimental 的 Presidio 匿名器的一个插件（相同的 .anonymize / .deanonymize / .deanonymizer\_mapping 和 JSON/YAML 保存加载）。添加了大多数工具遗漏的印度标识符（Aadhaar、PAN、GSTIN、UPI、IFSC、ABHA、名称、地址）、流感知去匿名器 Runnable，以及可选的泄漏防护回调，如果 PII 到达模型，该回调将导致调用失败。 | [⟦T42⟧](https://github.com/maskflow/maskflow/tree/main/packages/maskflow-langchain) | <span><a href="https://pypi.org/project/maskflow-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T43⟧](https://github.com/shane-rand/langchain-monty) |在 Pydantic 的 Monty Runtime 中提供代码解释 | [⟦T44⟧](https://github.com/shane-rand/langchain-monty) | <span><a href="https://pypi.org/project/langchain-monty/"> <img alt="Downloads per month" /></a></span> |
  | [⟦T45⟧](https://nuggets.life) |工具调用的预执行权限强制执行。在每个工具运行之前验证范围内的、签名的委托，拒绝失败时关闭，并为每个决定发出独立可验证的加密证明。 | [⟦T46⟧](https://github.com/NuggetsLtd/langchain-nuggets) | <span><a href="https://pypi.org/project/langchain-nuggets/"><img alt="Downloads per month" /></a></span>|
  | [⟦T47⟧](https://docs.tealtiger.ai/integrations/langchain) |确定性治理中间件。政策执行、成本限制、工具许可名单、FREEZE 规则和 SARIF 审计证据，治理路径中没有法学硕士。 | [⟦T48⟧](https://github.com/agentguard-ai/tealtiger/tree/main/packages/langchain-tealtiger) | <span><a href="https://pypi.org/project/langchain-tealtiger/"><img alt="Downloads per month" /></a></span>|| [⟦T49⟧](https://github.com/emanueleielo/compact-middleware) | Claude Code 的压缩引擎作为 LangChain 中间件。针对长时间运行代理的多级上下文压缩。 | [⟦T50⟧](https://github.com/emanueleielo/compact-middleware) | <span><a href="https://pypi.org/project/compact-middleware/"><img alt="Downloads per month" /></a></span>|
  | [⟦T51⟧](https://github.com/cisco-ai-defense/ai-defense-langchain-middleware) |运行时安全检查| [⟦T52⟧](https://github.com/cisco-ai-defense/ai-defense-langchain-middleware) | <span><a href="https://pypi.org/project/langchain-cisco-aidefense/"><img alt="Downloads per month" /></a></span>|
  | [⟦T53⟧](https://docs.ctrlrun.dev/guides/langchain-middleware) |通过wrap\_tool\_call 进行策略门控工具调用：被拒绝的调用永远不会到达工具，并且模型被告知哪个规则拒绝了它；效果键在共享存储的进程之间最多执行一次；引发的工具会导致效果未解决而不是重试；批准决定需要一个人；每项决定（包括拒绝）都有收据。 | [⟦T54⟧](https://github.com/CTRLRun/ctrlrun/tree/main/adapters/langchain) | <span><a href="https://pypi.org/project/ctrlrun-langchain/"><img alt="Downloads per month" /></a></span>|
  | [⟦T55⟧](https://github.com/wenhua6666668-oss/langchain-agenttrafficlab#automatic-task-time-routing-v03) |自动任务时间路由到可执行的 MCP 和提供商功能，并具有故障重新决策和结果报告。 | [⟦T56⟧](https://github.com/wenhua6666668-oss/langchain-agenttrafficlab) | <span><a href="https://pypi.org/project/langchain-agenttrafficlab/"><img alt="Downloads per month" /></a></span>|
  | [⟦T57⟧](https://github.com/johanity/langchain-router) |基于阶段的模型路由。路由执行转向快速模型，保留主要用于规划和恢复。 | [⟦T58⟧](https://github.com/johanity/langchain-router) | <span><a href="https://pypi.org/project/langchain-router/"><img alt="Downloads per month" /></a></span>|
  | [⟦T59⟧](https://runcycles.io) |模型调用、工具调用和代理循环的预执行预算权限 | [⟦T60⟧](https://github.com/runcycles/langchain-runcycles) | <span><a href="https://pypi.org/project/langchain-runcycles/"> <img alt="Downloads per month" /></a></span> || [⟦T61⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) |用于有序任务管道的隐式状态机中间件，具有每个任务工具范围、动态提示注入和可组合完成验证。 | [⟦T62⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) | <span><a href="https://pypi.org/project/langchain-task-steering/"><img alt="Downloads per month" /></a></span>|
  | [⟦T63⟧](https://github.com/emanueleielo/advisor-middleware) | Claude Code 的顾问模式为 LangChain 中间件。将快速执行者模型与强大的顾问模型配对，仅干预关键决策。 | [⟦T64⟧](https://github.com/emanueleielo/advisor-middleware) | <span><a href="https://pypi.org/project/advisor-middleware/"><img alt="Downloads per month" /></a></span>|
  | [⟦T65⟧](https://bastionsoft.com) |即时注入和越狱检测。在模型运行之前，筛选用户输入和工具结果，包括通过检索到的内容进行间接注入。在您自己的硬件上本地运行。 | [⟦T66⟧](https://github.com/bastion-soft/bastion-prompt-protection) | <span><a href="https://pypi.org/project/bastion-prompt-protection/"><img alt="Downloads per month" /></a></span>|
  | [⟦T67⟧](https://github.com/johanity/langchain-collapse) |预防性上下文管理。在连续的工具调用组填充上下文窗口之前折叠它们。 | [⟦T68⟧](https://github.com/johanity/langchain-collapse) | <span><a href="https://pypi.org/project/langchain-collapse/"><img alt="Downloads per month" /></a></span>|
  | [⟦T69⟧](https://github.com/TimurRakhmatullin86/langchain-promptfirewall#readme) | LangChain 的亚毫秒级 PII 检测和提示注入防火墙。零网络、零 GPU、通过 PyO3 的纯 Rust 核心。 | [⟦T70⟧](https://github.com/TimurRakhmatullin86/langchain-promptfirewall) | <span><a href="https://pypi.org/project/langchain-promptfirewall/"><img alt="Downloads per month" /></a></span>​​|| [⟦T71⟧](https://api.relayshield.net/developers) |当 RelayShield 报告风险时，强制预执行门会阻止 connect\_mcp\_server 和 install\_mcp\_package 工具调用。 | [⟦T72⟧](https://github.com/nzdsf2-gif/langchain-relayshield) | <span><a href="https://pypi.org/project/langchain-relayshield/"><img alt="Downloads per month" /></a></span>|
  | [⟦T73⟧](https://docs.neuraltrust.ai/integrations/langchain) | TrustGuard 评估中间件。允许、阻止、报告或转换代理输入、模型输出和可选工具流量。 | [⟦T74⟧](https://github.com/NeuralTrust/langchain-neuraltrust) | <span><a href="https://pypi.org/project/langchain-neuraltrust/"><img alt="Downloads per month" /></a></span>|
  | [⟦T75⟧](https://axiorank.com/docs/integrations/langchain) | AI 代理的安全网关：对工具调用进行评分，并针对允许、拒绝和编辑的策略进行模型轮换。 | [⟦T76⟧](https://github.com/AxioRank/langchain-axiorank) | <span><a href="https://pypi.org/project/langchain-axiorank/"><img alt="Downloads per month" /></a></span>|
  | [⟦T77⟧](https://docs.deepkeep.ai) | DeepKeep AI 防火墙对 LangChain 代理进行预审核和后审核。 | | <span><a href="https://pypi.org/project/langchain-deepkeep/"><img alt="Downloads per month" /></a></span> |
  | [⟦T78⟧](https://owasp.org/www-project-agent-memory-guard/) |针对 AI 代理内存中毒的运行时防御 (OWASP ASI06)。使用阻止、警告和剥离模式在本地扫描消息、模型响应和工具输出。 | [⟦T79⟧](https://github.com/OWASP/www-project-agent-memory-guard/tree/main/integrations/langchain-agent-memory-guard) | <span><a href="https://pypi.org/project/langchain-agent-memory-guard/"> <img alt="Downloads per month" /></a></span> || [⟦T80⟧](https://github.com/dshakes/distil) |可逆、经过认证的上下文压缩。在模型调用之前摘要大型工具输出和消息历史记录（工具和函数消息可逆，人类和系统无损，模型消息从未重写），并按字节精确恢复每个摘要。压缩上下文和完整上下文之间的决策等价性通过统计非劣效性门进行离线认证。 | [⟦T81⟧](https://github.com/dshakes/distil) | <span><a href="https://pypi.org/project/langchain-distil/"><img alt="Downloads per month" /></a></span>|
  | [⟦T82⟧](https://github.com/joy7758/persona-object-protocol/tree/main/integrations/langchain-pop) |适用于 LangChain 代理的便携式角色加载、遗留迁移和边界感知工具过滤。 | [⟦T83⟧](https://github.com/joy7758/persona-object-protocol/tree/main/integrations/langchain-pop) | <span><a href="https://pypi.org/project/langchain-pop/"><img alt="Downloads per month" /></a></span>|
  | [⟦T84⟧](https://docs.openbox.ai/getting-started/langgraph) | LangGraph和Deep Agents的实时治理。政策、护栏、HITL、OTel 挂钩治理和行为规则。 | [⟦T85⟧](https://github.com/OpenBox-AI/openbox-langgraph-sdk-python) | <span><a href="https://pypi.org/project/openbox-langgraph-sdk-python/"><img alt="Downloads per month" /></a></span>|
  | [⟦T86⟧](https://github.com/kenithphilip/Tessera) |当上下文包含不受信任的段时，门控工具会调用签名的信任标签和污点跟踪。 | [⟦T87⟧](https://github.com/kenithphilip/Tessera) | <span><a href="https://pypi.org/project/tessera-mesh/"><img alt="Downloads per month" /></a></span>|
  | [⟦T88⟧](https://github.com/IngmarVG-IB/langchain-dns-aid) |通过 DNS-AID 协议进行基于 DNS 的代理发现。启动时自动发布代理，关闭时自动取消发布，并提供发现工具。 | [⟦T89⟧](https://github.com/IngmarVG-IB/langchain-dns-aid) | <span><a href="https://pypi.org/project/langchain-dns-aid/"><img alt="Downloads per month" /></a></span>|| [⟦T90⟧](https://github.com/Enigma-Vault/NoPII/tree/main/integrations/langchain-nopii-middleware) |运行时 PII 标记化。检测出站提示中的个人数据，在请求到达 LLM 之前将其替换为确定性保管库令牌，并恢复响应中的原始值。 | [⟦T91⟧](https://github.com/Enigma-Vault/NoPII/tree/main/integrations/langchain-nopii-middleware) | <span><a href="https://pypi.org/project/langchain-nopii-middleware/"><img alt="Downloads per month" /></a></span>|
  | [⟦T92⟧](https://comply54.io/langchain) |根据非洲数据保护和金融部门法规（拒绝、升级、审计或允许）对人工智能代理执行运行时合规性执行。 | [⟦T93⟧](https://github.com/comply54/langchain-comply54) | <span><a href="https://pypi.org/project/langchain-comply54/"><img alt="Downloads per month" /></a></span>|
  | [⟦T94⟧](https://github.com/Text2SqlAgent/text2sql-framework) |使用递归工具替代 RAG：代理使用一个execute\_sql 工具来探索、写入、测试和自我更正。 | [⟦T95⟧](https://github.com/Text2SqlAgent/text2sql-framework) | <span><a href="https://pypi.org/project/text2sql-framework/"><img alt="Downloads per month" /></a></span>|
  | [⟦T96⟧](https://github.com/mahmoud661/langgraph-state-machine) | LangGraph React 代理的基于部分的流量控制。使用范围工具、提示、自动转换、分支和可选的每部分 LLM 覆盖将对话划分为离散阶段。 | [⟦T97⟧](https://github.com/mahmoud661/langgraph-state-machine) | <span><a href="https://pypi.org/project/langgraph-state-machine/"><img alt="Downloads per month" /></a></span> |
  | [⟦T98⟧](https://github.com/h2cker/vecr) |在模型调用之前使用结构化令牌的正则表达式保留白名单进行确定性 LLM 上下文压缩。 | [⟦T99⟧](https://github.com/h2cker/vecr) | <span><a href="https://pypi.org/project/vecr-compress/"><img alt="Downloads per month" /></a></span>|| [⟦T100⟧](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/integrations/langchain) |使用代理威胁规则对提示注入、工具中毒和不安全工具调用进行运行时检测。停止代理或阻止对关键发现的工具调用并保留审计跟踪。 | [⟦T101⟧](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/integrations/langchain) | <span>不适用</span> |
  | [⟦T102⟧](https://github.com/cloudthinker-ai/eager-tools) |通过在流块关闭时调度每个工具调用，将工具执行与 LLM 生成重叠，减少代理挂钟延迟。 | [⟦T103⟧](https://github.com/cloudthinker-ai/eager-tools) | <span>不适用</span> |
  | [⟦T104⟧](https://github.com/ExposureGuard/haldir/tree/main/integrations/langchain-haldir) | LangChain 代理的治理层，具有范围会话、加密秘密、哈希链审计和策略执行。 | [⟦T105⟧](https://github.com/ExposureGuard/haldir/tree/main/integrations/langchain-haldir) | <span>不适用</span> |
  | [⟦T106⟧](/oss/python/integrations/middleware/nvidia) |模型布线和 Nemotron 3 Ultra 线束优化 | [⟦T107⟧](https://github.com/langchain-ai/langchain-nvidia)、[⟦T108⟧](https://github.com/langchain-ai/deepagents) | <span>不适用</span> |
</div>

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/python/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/middleware/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>