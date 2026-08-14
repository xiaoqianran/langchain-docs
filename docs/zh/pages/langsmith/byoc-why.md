<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Why BYOC | https://docs.langchain.com/langsmith/byoc-why -->

# 为什么要自带设备

将 LangSmith BYOC 与自托管 LangSmith 进行比较，以确定哪种部署模型适合您的组织。

BYOC 适用于希望获得数据所有权和自托管网络隔离的组织，而无需花费工程时间自行构建和运营完整的LangSmith 平台。数据平面保留在您的 AWS 账户中，LangChain 管理LangSmith 基础设施。

## BYOC 提供什么

* **更快地实现价值**：您配置一个 AWS 账户和所需的角色，然后 LangChain 处理其余的配置流程。
* **客户拥有的数据**：数据库、对象存储和计算在您拥有的基础设施中运行。
* **私有网络**：数据平面在您的 AWS 账户内运行，可以私下连接到您的系统，而无需公开它们。
* **符合 SaaS 的架构**：数据平面是使用经过尝试和测试的架构来配置的。
* **开箱即用的监控**：LangChain 可以了解数据平面的运行状况和指标，并可以主动识别、调查和修复问题。* **减少平台维护**：您的工程团队可以花更多的时间通过 LangSmith 推动价值，并减少管理 LangSmith 基础设施、升级、扩展和运营偏差的时间。
* **自动升级**：您会收到自动升级到最新版本的 LangSmith。
* **降低多环境和多区域部署的障碍**：跨环境、帐户或区域运行多个LangSmith数据平面，而无需每次从头开始重建架构。

## 比较 BYOC 和自托管

下表对两种部署模型进行了比较：|尺寸|自带设备 |自托管 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **主要值** |客户拥有的数据平面，具有托管的LangSmith运营模式|最大限度地控制整个LangSmith部署|
| **实现价值的时间** |更快：配置帐户和角色，然后LangChain配置支持的数据平面架构 |更长：您设计、配置、连接、保护和运营整个堆栈 || **运营** | LangChain拥有更多的产品运营模式、升级路径、可支撑的基础架构模式 |您拥有整个堆栈的部署、升级、扩展、监控和事件响应|
| **架构** |标准化、接近LangChain SaaS生产架构 |更灵活，但更容易偏离支持的模式 |
| **最适合** |需要数据隔离和专用网络，但又不想自己操作每个LangSmith组件的团队 |需要全栈所有权、不受支持的基础架构模式或无法使用托管控制平面的团队 |

## 从自托管迁移到 BYOC

您可以从现有的自托管部署迁移到 BYOC。今天不会迁移跟踪，但可以复制用户、角色、数据集、实验、提示、注释队列配置、自动化规则和仪表板。

要计划迁移，[contact the LangChain sales team](https://www.langchain.com/contact-sales)。

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [BYOC architecture](/langsmith/byoc-architecture)
* [Self-hosted LangSmith](/langsmith/self-hosted)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-why.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>