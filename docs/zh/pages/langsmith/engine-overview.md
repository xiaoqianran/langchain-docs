<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine | https://docs.langchain.com/langsmith/engine-overview -->

# LangSmith发动机

LangSmith Engine 是代理工程的代理，将生产跟踪转化为整个开发生命周期中跟踪的问题、修复和数据集。

LangSmith Engine 是用于代理工程的LangSmith Agent。它从生产跟踪到发现重复出现的问题，诊断其根本原因，并在开发生命周期的每个阶段推动修复。

每个问题都经过一个闭环：在跟踪中检测到重复出现的问题，诊断根本原因，提出修复建议，当匹配相同模式的新跟踪到达时跟踪问题，如果问题在关闭后重新出现，引擎会自动重新打开它。

## 引擎的整个生命周期

对于每个问题，引擎都会显示贡献的跟踪，提出修复方案，通过附加与相同故障模式匹配的新跟踪来保持问题最新，并根据生产跟踪输入创建地面实况数据集示例。

<CardGroup>
  <Card title="Build: Open a pull request" icon="git-pull-request" href="/langsmith/engine#open-a-pull-request">
    通过在连接的存储库中打开拉取请求来应用建议的修复。引擎可以对使用Deep Agents、LangChain和LangGraph构建的代理提出代码更改建议。
  </Card><Card title="Test: Generate datasets" icon="database" href="/langsmith/engine#add-offline-examples">
    从生产跟踪中创建地面实况数据集示例以进行离线评估，以便您可以在发布之前验证修复。
  </Card>

  <Card title="Monitor: Track recurring issues" icon="chart-line" href="/langsmith/engine#filter-and-sort-issues">
    按计划扫描您的跟踪项目，以显示、确定优先级并诊断重复出现的问题，并在每个问题出现时向其添加新的匹配跟踪。
  </Card>
</CardGroup>

## 引擎如何运行

引擎按照动态计划扫描每个连接的跟踪项目，以平衡成本和性能。它按严重性和LangChain标准单位 (LSU) 中的费用对问题进行聚类和优先级排序。

LangSmith 云使用 LangChain 托管推理。自托管部署可以使用 LangSmith Intelligence 或他们自己的模型提供商。 See [Engine on self-hosted](/langsmith/engine-self-hosted) for installation and model-provider options, and [Engine security](/langsmith/engine-security) for data handling and access controls.

有关设置、成本和问题工作流程，请参阅[Find and fix your agent's issues](/langsmith/engine)。在 LangSmith 云上，[Red Teaming](/langsmith/engine#beta-proactively-detect-issues-with-red-teaming) 还可以在故障到达生产之前使用合成请求测试部署。

## 开始吧

<CardGroup>
  <Card title="Set up Engine" icon="settings" href="/langsmith/engine#set-up-engine">
    为您的组织启用引擎并为跟踪项目或代理环境配置它。
  </Card>

  <Card title="Engine notifications" icon="bell" href="/langsmith/engine-notifications">
    Send detected issues to Slack or to your incident-management, paging, or chat tools through webhooks.
  </Card>
</CardGroup>***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>