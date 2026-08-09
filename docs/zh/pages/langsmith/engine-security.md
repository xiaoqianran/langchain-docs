<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine security | https://docs.langchain.com/langsmith/engine-security -->

# LangSmith 引擎安全

LangSmith Engine 如何处理您的数据、GitHub 和模型子处理器控制来管理其访问及其合规性状态。

LangSmith Engine 是内置于 LangSmith 中的 AI 代理，可改进您构建的代理。引擎会审查 LangSmith 中已有的跟踪数据，显示问题并确定其优先级，并打开拉取请求并提供修复建议、建议的即时更改和评估。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

引擎是选择性加入、咨询性的，并且从不训练您的数据，并且它在 LangSmith 的 SOC 2 Type II 和 ISO 27001 控制下运行。本页介绍 Engine 如何处理您的数据、管理其 GitHub 和模型访问的控件以及 LangSmith Cloud 中 Engine 的合规性状况。有关引擎如何在自托管部署中运行的信息，请参阅[Engine on self-hosted](/langsmith/engine-self-hosted)。Engine 作为 LangSmith 的一部分提供，并继承了 LangSmith 的安全性和合规性态势，并具有涵盖以下部分中描述的 AI 推理层的附加控制。对于任何计划的组织，默认情况下引擎永远不会打开，只能由 [Organization Admin](/langsmith/rbac#organization-admin) 启用。对于 LangSmith 的平台级控制，包括数据加密和区域处理，请参阅[Regions FAQ](/langsmith/regions-faq) 和 [LangChain Trust Center](https://trust.langchain.com/)。

## 数据引擎使用什么

引擎对您已选择与 LangChain 共享的数据进行操作：您发送给 LangSmith 的跟踪数据，以及您通过 LangChain 管理的 GitHub 应用程序授予的 GitHub 存储库内容（请参阅[GitHub integration](#github-integration)）。启用引擎不会引入其他客户数据源。下表总结了引擎读取的内容、它所在的位置以及它支持的功能。| **数据来源** | **引擎读取什么** | **存储和持久性** | **启用** |
| ------------------------ | | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| LangSmith 工作区内容 |跟踪您存储在 LangSmith 中的数据和其他工作区内容，例如提示和求值器。                  |在您的 LangSmith 租户内。 [Trace retention](/langsmith/usage-and-billing#data-retention) 为 14 天（基本）或 400 天（扩展），根据项目选择。持续时间不可配置。 |问题检测、优先级排序和评估建议。 || GitHub 存储库 |来自您连接的存储库的源代码和存储库上下文（请参阅[GitHub integration](#github-integration)）。 |在每次分析运行期间，在由 LangChain 管理的隔离沙箱内进行处理，然后丢弃。                                                                                 |使用建议的代码修复来编写拉取请求。           |
|模型提供者（推理）|仅每个分析任务所需的内容。                                                                     |每个引擎模型提供商都实现零数据保留（请参阅[Model subprocessors](#model-subprocessors)）。                                                                                        |引擎推理和生成。                           |

<Note>
  引擎的读取范围可能会随着时间的推移而扩大。此页面已更新以反映重大变化。上次审核日期为 2026 年 6 月 25 日。
</Note>

发送到引擎的跟踪内容可以包括用户消息、工具输出和 PII，并且该内容会在每个分析任务的零数据保留下发送到模型子处理器。要在痕迹到达 LangSmith 之前删除敏感字段，请使用 [client-side masking](/langsmith/mask-inputs-outputs)。发动机输出是建议性的。它提出问题，提出拉取请求，并推荐评估资产，例如评估器和数据集示例。您的工程师和您的分支机构保护和审查政策决定运送什么。

## GitHub 集成

引擎通过 LangChain 管理的 GitHub 应用程序连接到您的源代码。仅支持 GitHub.com。尚不支持 GitLab、Bitbucket 和其他版本控制提供程序。

该应用程序的范围是：

* **对您在安装时选择的存储库的读取访问权限**。
* **写访问** 以从它创建的新分支打开拉取请求。推送到现有分支受您的分支保护规则的约束。

Access 使用 GitHub 的标准应用程序模型：每个操作都通过一个短暂的安装令牌运行，该令牌在一小时后过期，不能超出安装时授予的权限，并且无法访问您未选择的存储库。代币是在每次分析运行时铸造的，而不是作为长期凭证持有。源代码仅供引擎自动分析读取，正常运行时LangChain人员不会浏览。对于每次运行，选定的存储库都会克隆到隔离的、网络限制的沙箱中，仅用于该运行，并在运行完成时删除（如果运行中断，最多一小时内）。默认情况下，引擎自身的分析操作痕迹被屏蔽。

您可以随时通过从 GitHub 组织卸载应用程序来撤销 Engine 对 GitHub 的访问权限。

## 模型子处理器

Engine 的模型子处理器（目前为 OpenAI、Anthropic、Fireworks 和 Baseten）均在零数据保留下运行，并且根据合同禁止使用客户数据来训练或微调其模型。 [LangChain Trust Center](https://trust.langchain.com/)公布权威分处理商名单。

引擎不支持自带密钥 (BYOK)。

## 关键安全控制

Engine 在 LangSmith 的基线之上添加了以下控件：* **显式选择加入**：引擎默认情况下不会开启，只能由组织管理员启用。
* **咨询输出，人工掌舵**：引擎不会自动合并、自动部署或对您的系统采取破坏性操作。每个提议的更改都是一个拉取请求，遵循您的分支保护、审查和合并策略。建议的提示更改将写入 LangSmith 中的单独建议记录中，并且在授权用户明确应用它们之前不会修改任何提示。在这两条路径中，由人类决定运送什么。
* **每个引擎模型提供商的零数据保留**：推理供应商不会保留提示和完成。
* **不得使用客户数据来训练或微调任何模型**：此限制写入每个提供商合同中。
* **逻辑租户隔离**：引擎对数据的访问仅限于您的 LangSmith 租户。应用程序级控制可防止跨租户访问，这与 LangSmith Cloud 的租赁模型一致。每个分析运行都在其自己的隔离沙箱内执行。* **可审核性**：引擎将其工作作为 GitHub Pull 请求进行展示，并在 [Engine tab](/langsmith/engine) 的问题列表中提供支持上下文。代码更改流经您的分支保护、审查和自动构建控制，因此您的软件开发生命周期仍然是发布内容的记录系统。
* **客户端 PII 清理**：LangSmith 的 [client libraries](/langsmith/mask-inputs-outputs) 可以在将痕迹发送到 LangSmith 之前从痕迹中删除敏感内容。建议处理受监管数据的客户使用。
* **由 LangChain 管理的模型选择**：LangChain 选择用于这些子处理器中每个引擎任务的特定模型，并且可能会更改该集合中的选择，而无需单独通知。添加任何新的子处理者都遵循标准的子处理者更改通知流程。
* **撤销和删除**：您可以随时通过卸载应用程序来撤销 GitHub 访问权限，并通过[Engine settings](/langsmith/engine#configure-engine)中的**删除所有问题**删除引擎的发现结果。跟踪数据遵循您的 LangSmith [retention and purging](/langsmith/data-purging-compliance) 设置。

## 合规姿态Engine 在 LangSmith 的控制环境下运行，该环境每年根据 SOC 2 Type II 进行审核并通过 ISO 27001 认证。Engine 的模型子处理器列于[LangChain Trust Center](https://trust.langchain.com/)，这是采购和数据保护影响评估的权威来源。

## 人工智能固有的风险和缓解措施

以下风险是人工智能辅助代码生成所固有的。 LangChain 缓解了产品中的每个问题，并且您的代码审查工作流程提供了第二层防御。

* **不正确或幻觉的建议**：在任何代码落地之前，所有引擎输出都会经过正常的拉取请求审查和自动检查。
* **通过跟踪内容提示注入**：跟踪数据可以包括从外部源（例如 Web 工具输出）反映的对抗性内容。引擎从此类跟踪中产生的任何建议在代码落地之前仍然要经过人工拉取请求审查。小心处理来自不可信来源的痕迹。
* **超出范围的决策**：引擎仅对跟踪和连接的存储库进行推理。依赖于上下文引擎无法看到的问题（例如票务系统中的业务规则更改）仍然是人类的责任。

## 另请参阅* [Engine](/langsmith/engine-overview)
* [Configure Engine](/langsmith/engine)
* [Engine on self-hosted](/langsmith/engine-self-hosted)
* [Engine webhooks](/langsmith/engine-webhooks)
* [Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)
* [Data purging for compliance](/langsmith/data-purging-compliance)
* [Audit logs](/langsmith/audit-logs)
* [Regions FAQ](/langsmith/regions-faq)
* [LangChain Trust Center](https://trust.langchain.com/)

## 联系方式

对于安全问题，请联系[trust@langchain.dev](mailto:trust@langchain.dev)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-security.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>