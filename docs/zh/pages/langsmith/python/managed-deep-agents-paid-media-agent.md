<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy the open-source paid media agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-paid-media-agent -->

# 部署开源付费媒体代理

将开源付费媒体代理部署到 Slack 作为托管 Deep Agents 项目，用于活动分析、计划报告和审核更改。

[paid media agent](https://github.com/langchain-ai/paid-media-agent) 是使用 Managed Deep Agents 构建的用于跨渠道广告分析的开源代理。您的团队在 Slack 中提出问题，代理通过连接的 Google Ads、Meta Ads、LinkedIn Ads、Reddit Ads、X Ads 和 OpenAI Ads 帐户进行回答。

它比较各个帐户的支出和转化，通过支持数据解释绩效变化，发布每周和每月报告，并准备预算或营销活动更改，这些更改将暂停，直到审核者批准为止。付费媒体维基涵盖归因、平台差异和预算决策。项目中的业务上下文提供目标和转换定义。

> [!注意]
>
> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

## 部署代理

在开始之前，请确保您拥有：* 一个[LangSmith Cloud](/langsmith/cloud)帐户。使用个人访问令牌（以 `lsv2_pt_` 开头的 [API key](/langsmith/create-account-api-key)），或在首次部署时使用浏览器登录。服务密钥无法设置 Slack 应用程序。
* 您的模型提供商的密钥。在 [LLM Gateway](/langsmith/llm-gateway) 上，代理会使用您的 LangSmith 密钥。
* 用于 Google Ads、Meta Ads、LinkedIn Ads、TikTok Ads、Pinterest Ads、Snap Ads、Reddit Ads 和 Google Analytics 的 [Pipeboard](https://pipeboard.co/integrations) 帐户。检查 [Pipeboard pricing](https://pipeboard.co/pricing) 的计划限制。 X 广告和 OpenAI 广告使用单独的密钥并保持只读状态。
* 在 Slack 工作区中安装应用程序的权限，或可以批准代理的 Slack 应用程序的工作区管理员。

要使用编码代理（例如 Claude Code、Codex 或 Cursor）进行部署，请粘贴此提示。它会安装代理、检查设置并在计费或部署任何内容之前进行询问。

使用您的编码代理部署付费媒体代理

使用 Managed Deep Agents 将开源付费媒体代理部署到我的 Slack 工作区。1. 使用 `curl -fsSL https://raw.githubusercontent.com/langchain-ai/paid-media-agent/main/install.sh | bash` 安装它，然后在它创建的 `paid-media-agent` 文件夹中工作。
2. 阅读`AGENTS.md`并遵循`paid-media-onboarding`技巧。
3.运行`uv run paid-media-agent demo --with-proposal`检查安装情况。
4. 告诉我您需要哪些钥匙。我将在终端或设置控制台 (`uv run paid-media-agent setup`) 中使用 `uv run paid-media-agent config set <KEY>` 自行输入它们；永远不要让我在聊天中粘贴密钥。
5. 帮助我连接我的广告帐户并编写我的业务背景。
6. 运行`uv run paid-media-agent mda check`，直到没有任何阻碍。然后让我在自己的终端中运行第一个部署`uv run paid-media-agent mda deploy --yes`，因为它设置了 Slack 应用程序。
7. 当它上线时，引导我在 Slack 中向应用程序发送消息并询问第一个问题。

自行部署：

**1.安装项目**

如果需要，安装程序会安装 uv，然后克隆存储库并进行设置。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSL https://raw.githubusercontent.com/langchain-ai/paid-media-agent/main/install.sh | bash
cd paid-media-agent
uv run paid-media-agent demo --with-proposal
```

该演示分析合成帐户并模拟预算变化，无需任何密钥。

**2.添加您的密钥**

在 Pipeboard 中，连接您的广告平台并在 **设置** > **API 令牌** 下创建令牌。然后保存你的密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run paid-media-agent config set LANGSMITH_API_KEY ANTHROPIC_API_KEY PIPEBOARD_API_TOKEN
```

该命令要求提供每个密钥并将其隐藏。设置控制台`uv run paid-media-agent setup`在浏览器中执行相同的操作。在 [LLM Gateway](/langsmith/llm-gateway) 上，跳过提供程序密钥并运行 `uv run paid-media-agent config set PAID_MEDIA_MODEL=langsmith:anthropic/claude-opus-5-5`。要使用浏览器而不是 LangSmith 键登录，请省略 `LANGSMITH_API_KEY`。**3.连接您的广告帐户**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run paid-media-agent accounts discover --add
```

该命令会查找您的 Pipeboard 令牌到达的每个广告帐户，并为每个帐户提供一个别名。 X 广告和 OpenAI 广告使用自己的密钥并保持只读状态。设置转到`.env`，帐户映射到`config/accounts.toml`。 Git 会忽略这两个文件。

**4.添加您的业务背景**

代理会从 `workspace/skills/company-context/` 读取您的目标、转化定义和营销活动简介。从[template](https://github.com/langchain-ai/paid-media-agent/blob/main/docs/customization.md#business-context)开始，或者要求您的编码代理遵循`.agents/skills/paid-media-org-onboarding/SKILL.md`。在第一次实际分析之前添加此上下文。

**5.部署**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv run paid-media-agent mda deploy --yes
```

该命令首先检查项目：当密钥丢失时它会停止，并在代理根据演示数据进行应答时发出警告。然后它会部署项目的副本，而无需本地工作文件。它还将安装Python工具和PDF库的`sandbox/setup.sh`构建到快照中。沙箱很小，因此不需要单独的发布步骤。

在您自己的终端中运行第一个部署，因为它会设置 Slack 应用程序。选择LangSmith管理的应用程序。如果该命令打印链接，请打开它并批准该应用程序用于您的工作区。部署会等待，直到 Slack 报告批准已完成。工作区管理员可能需要批准该应用程序。

**6。问第一个问题**在 Slack 中，在 **应用程序** 下找到该应用程序并向其发送消息，或邀请其加入频道并提及它。问一个问题，例如您上个月在欧洲和美国花费了多少钱。代理读取连接的帐户，计算代码中的指标，并在线程中回答改变结论的警告。

![A Slack thread. A person asks the paid media agent how much was spent on Europe versus the US in August. The agent answers with totals and a per-platform split, then lists caveats: one platform has no country-level data, some countries fall outside both groups, and the split is by delivery geography.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/paid-media-agent-slack-thread.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=7ca6de1fc65a35c7fa9582a29e601d14)

包含支出比较和注意事项的 Slack 线程示例。

## 定制付费媒体代理

大多数更改都是对存储库中的文件进行编辑。常见的：* **业务背景**：目标、转化定义和营销活动简介位于 `workspace/skills/company-context/`。
* **报告**：每周和每月报告从 `schedules/` 开始，每周一和每月第一天 13:00 UTC。在计划中设置`deliver_to`，将结果发布到 Slack 通道。
* **报告设计**：颜色、排版和布局位于 `workspace/skills/report-design/DESIGN.md`。要求您的编码代理遵循 `.agents/skills/paid-media-design/SKILL.md` 以使渲染器保持同步。
* **Slack 应用**：在`channels/slack.py` 中设置名称、描述和触发器。
* **内存**：内存默认关闭。当每个呼叫者都可以分享代理学到的内容时，添加`memory.py`以打开[memory](/langsmith/python/managed-deep-agents-memory)。
* **实时更改**：写入广告帐户需要来自 `config/write-policy.example.toml`、[release checks](https://github.com/langchain-ai/paid-media-agent/blob/main/docs/operations/live-write-runbook.md) 和授权审核者的写入策略。待处理的提案存在于部署过程中，默认的无服务器部署可能会缩小规模并在批准之前丢失一个提案，因此在打开实时更改之前使用 `--deployment-type dedicated` 进行部署。

要尝试更改并发货，请使用这些 [⟦T31⟧ commands](/langsmith/python/managed-deep-agents-cli)：|命令 |它有什么作用 |
| - | - |
| `uv run mda dev` |在本地运行代理并在[LangSmith Studio](/langsmith/studio)中打开它 |
| `uv run paid-media-agent mda deploy --yes --name paid-media-agent-test` |部署一个单独的副本来测试更改，而无需触及您的团队使用的副本 |
| `uv run paid-media-agent mda deploy --yes` |检查项目，然后将更改发送到团队使用的部署 |
| `uv run mda logs` |追踪已部署代理的日志 |
| `uv run mda build` |编译无需部署即可发送到 `.mda/build/` 的内容 |

有关更多信息，请参阅存储库中的 [deploy guide](https://github.com/langchain-ai/paid-media-agent/blob/main/docs/deploy-mda.md)、[Customization](https://github.com/langchain-ai/paid-media-agent/blob/main/docs/customization.md) 和 [Operations](https://github.com/langchain-ai/paid-media-agent/blob/main/OPERATIONS.md)。

## 探索项目

每个托管功能都是存储库根目录下的一个文件或文件夹：|路径|在此代理|了解更多 |
| - | - | - |
| `agent.py` |使用 `define_deep_agent` 从模型、工具、中间件和审批策略的一个共享组件构建代理 | [Agent definition](/langsmith/python/managed-deep-agents-agent-definition) |
| `instructions.md` |永远在线的提示| [Instructions](/langsmith/python/managed-deep-agents-instructions) |
| `skills/` |分析、报告、报告设计和变更建议的技能，以及付费媒体维基，用 `workspace/skills/` 编辑 | [Skills](/langsmith/python/managed-deep-agents-skills) |
| `sandbox/` | Python 3.13，带有 ripgrep、jq 和 PDF 库，由 `mda deploy` 构建 | [Sandboxes](/langsmith/python/managed-deep-agents-sandboxes) |
| `channels/slack.py` |用于提及、DM、话题和批准按钮的托管 Slack 应用程序 | [Slack channel](/langsmith/python/managed-deep-agents-channels-slack) |
| `schedules/` |周报、月报以及每日内务管理 | [Schedules](/langsmith/python/managed-deep-agents-schedules) |
| `identity.py` |使用 LangSmith API 密钥对调用者进行身份验证 | [Identity](/langsmith/python/managed-deep-agents-identity) |
| `src/paid_media_agent/` |代理入口导入的应用程序代码，例如广告平台工具、指标和报告渲染 | [Tools](/langsmith/python/managed-deep-agents-tools) |

## 架构

托管 Deep Agents 提供 Slack 应用程序、身份、计划和每个线程的沙箱。该存储库添加了广告平台工具、分析技能和审批政策。

![A Slack question or a weekly or monthly report reaches the main agent on Managed Deep Agents. The agent reads skills and a wiki, calls ad platform tools whose keys stay on the host, works in a sandbox per thread, and answers in the same Slack thread, where a proposed change waits for approval. Managed Deep Agents provides Slack, identity, schedules, durable runs, tracing, and mda deploy.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/paid-media-agent-architecture-light.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=8dde78cdd8ba52ede4592e8737518ec0)

从 Slack 或调度通过代理返回线程的请求路径。模型决定研究什么。代码计算指标并根据源数据检查报告数字。大型工具结果保留在文件中。该模型读取带有源、日期窗口和数据质量标志的摘要。

活动更改从提案开始：之前和之后的值、原因以及检查和撤消它的计划。运行暂停，审批者列表中的审阅者批准或拒绝 Slack 中的具体提案。编辑提出了需要自己批准的新提案。

![A Slack approval card for a new Google Search campaign. It lists the campaign type, bidding strategy, a daily budget of 30 dollars, the market, and network settings, notes that the campaign starts paused, and ends with Approve all, Edit details, and Reject buttons.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/paid-media-agent-approval-card.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=32d06c5e2f2e75bdffc0844e6608122b)

拟议的活动变更的宽松审批卡。

批准后，主机在接触帐户之前检查每个门，进行更改，然后读回以记录收据。默认情况下，实时更改处于关闭状态。要打开它们，请按照[live-write runbook](https://github.com/langchain-ai/paid-media-agent/blob/main/docs/operations/live-write-runbook.md)操作。

![Five steps from left to right. Propose: before and after values, a reason, and how to check and undo it. Approve: a reviewer on the approver list approves the exact proposal in Slack. Check gates: kill switch, writes turned on, a released tool, and a signed approval; if any gate fails, the proposal is rejected and nothing changes. Execute: one change with the approved payload and no automatic retries. Verify: read the object back and record a receipt that is verified, failed, or unknown. An edit at the approval step loops back to a new proposal.](https://mintcdn.com/langchain-5e9cc07a/iUeSEP3j6ExFou6p/langsmith/images/paid-media-agent-approval-flow-light.png?fit=max\&auto=format\&n=iUeSEP3j6ExFou6p\&q=85\&s=d645d87066e0670192d3c376488596cf)

操作员启用写入后实时写入的批准路径。

## 另请参阅

* [Paid media agent repository](https://github.com/langchain-ai/paid-media-agent)
* [Design agent template](/langsmith/python/managed-deep-agents-design-agent)
* [Managed Deep Agents project structure](/langsmith/python/managed-deep-agents-project-structure)
* [Deploy a Managed Deep Agents project](/langsmith/python/managed-deep-agents-deploy)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-paid-media-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。