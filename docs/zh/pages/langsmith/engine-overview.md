<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine | https://docs.langchain.com/langsmith/engine-overview -->

# LangSmith 发动机

LangSmith 引擎是代理工程的代理，将生产跟踪转化为整个开发生命周期的修复程序、评估程序和数据集。

LangSmith Engine 是用于代理工程的LangSmith Agent。它从生产跟踪到发现重复出现的问题，诊断其根本原因，并在开发生命周期的每个阶段推动修复。

每个问题都经过一个闭环：在跟踪中检测到重复出现的问题，诊断根本原因，提出修复建议，部署评估器来捕获回归，如果问题在关闭后重新出现，引擎会自动重新打开它。

## 引擎的整个生命周期

对于每个问题，引擎都会显示贡献的痕迹，提出修复方案，生成自定义评估器以防止回归，并根据生产痕迹输入创建地面实况数据集示例。

<CardGroup>
  <Card title="Build: Open a pull request" icon="git-pull-request" href="/langsmith/engine#open-a-pull-request">
    通过在连接的存储库中打开拉取请求来应用建议的修复。引擎可以对使用Deep Agents、LangChain和LangGraph构建的代理提出代码更改建议。
  </Card><Card title="Test: Generate evaluators and datasets" icon="database" href="/langsmith/engine#add-offline-examples">
    部署自定义评估器来捕获回归，并从生产跟踪中创建地面实况数据集示例以进行离线评估。
  </Card>

  <Card title="Monitor: Detect recurring issues" icon="chart-line" href="/langsmith/engine#browse-and-filter-issues">
    按计划扫描您的跟踪项目，以发现、确定优先级并诊断重复出现的问题。
  </Card>
</CardGroup>

## 引擎如何运行

引擎每 6 小时扫描每个连接的跟踪项目，按严重性对问题进行聚类和优先级排序。它使用 LangChain 托管推理并按 LangChain 计算单元 (LCU) 收费。每个检测到的问题都标有 [issue category](/langsmith/engine-issue-categories)，例如 **无声工具错误** 或 **幻觉**。有关设置、成本和完整的问题工作流程，请参阅[Find and fix your agent's issues](/langsmith/engine)。有关 Engine 如何处理您的数据、其 GitHub 和模型子处理器控制及其合规性状况，请参阅 [Engine security](/langsmith/engine-security)。有关引擎如何在自托管部署中运行的信息，请参阅[Engine on self-hosted](/langsmith/engine-self-hosted)。

## 开始吧

<CardGroup>
  <Card title="Set up Engine" icon="settings" href="/langsmith/engine#set-up-engine">
    为您的组织启用引擎并为跟踪项目配置它。
  </Card>

  <Card title="Engine issue categories" icon="tag" href="/langsmith/engine-issue-categories">
    引擎分配给检测到的问题的故障类别的参考，以及描述和检测方法。
  </Card>

  <Card title="Engine webhook events" icon="webhook" href="/langsmith/engine-webhooks">
    将检测到的问题转发到您的事件管理、寻呼或聊天工具中。
  </Card>
</CardGroup>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>