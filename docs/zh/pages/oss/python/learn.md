<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Learn | https://docs.langchain.com/oss/python/learn -->

# 学习

帮助您入门的教程、概念指南和资源。

在文档的 **学习** 部分，您将找到一系列教程、概念概述和其他资源，以帮助您使用托管 Deep Agents、Deep Agents、LangChain 和 LangGraph 构建功能强大的应用程序。

## 教程

以下是按框架组织的常见用例教程。

### 托管Deep Agents

[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)是构建和部署深度代理的推荐方法。您写代理； LangSmith 运行线束和运行时。

> [卡][Deep research](/oss/python/deepagents/deep-research)
>
> 使用托管 Deep Agents 或 Deep Agents SDK 构建多步骤网络研究代理。

> [卡][Content builder](/oss/python/deepagents/content-builder)
>
> 使用托管 Deep Agents 或 Deep Agents SDK 构建具有品牌声音、技能和图像工具的内容编写代理。

### Deep Agents

为了在使用与 [Managed Deep Agents](#managed-deep-agents) 相同的 Deep Agents 工具时获得最大灵活性，请自行使用 Deep Agents SDK 和主机代理，或运行自定义 [LangSmith Deployment](/langsmith/deployment)。

> [卡][Deep research](/oss/python/deepagents/deep-research)
>
> 使用托管 Deep Agents 或 Deep Agents SDK 构建多步骤网络研究代理。

> [卡][Content builder](/oss/python/deepagents/content-builder)
>
> 使用托管 Deep Agents 或 Deep Agents SDK 构建具有品牌声音、技能和图像工具的内容编写代理。> [卡][Data analysis](/oss/python/deepagents/data-analysis)
>
> 构建一个数据分析代理，使用 Deep Agents SDK 将报告发送到 Slack。

### LangChain

[LangChain](/oss/python/langchain/overview) [agent](/oss/python/langchain/agents) 实现使简单用例变得容易上手。

> [卡][Semantic Search](/oss/python/langchain/knowledge-base)
>
> 使用 LangChain 组件在 PDF 上构建语义搜索引擎。

> [卡片] [RAG Agent](/oss/python/deepagents/rag)
>
> 创建检索增强生成 (RAG) 代理。

> [卡][SQL Agent](/oss/python/langchain/sql-agent)
>
> 构建 SQL 代理以通过人机交互审核与数据库进行交互。

> [卡片][Voice Agent](/oss/python/langchain/voice-agent)
>
> 建立一个可以说话和倾听的代理。

### LangGraph

LangChain 的 [agent](/oss/python/langchain/agents) 实现使用 [LangGraph](/oss/python/langgraph/overview) 原语。
如果需要更深入的定制，可以直接在LangGraph中实现代理。

> [卡][Custom RAG Agent](/oss/python/langgraph/agentic-rag)
>
> 使用 LangGraph 原语构建 RAG 代理以进行细粒度控制。

> [卡][Custom SQL Agent](/oss/python/langgraph/sql-agent)
>
> 直接在LangGraph中实现SQL代理以获得最大的灵活性。

### 多代理

这些教程演示了 [multi-agent patterns](/oss/python/langchain/multi-agent)，将 LangChain 代理与 LangGraph 工作流程混合。

> [卡][Subagents: Personal assistant](/oss/python/langchain/multi-agent/subagents-personal-assistant)
>
> 建立一个私人助理，将权力委托给子代理。

> [卡][Handoffs: Customer support](/oss/python/langchain/multi-agent/handoffs-customer-support)
>
> 构建一个客户支持工作流程，其中单个代理可以在不同状态之间转换。> [卡][Router: Knowledge base](/oss/python/langchain/multi-agent/router-knowledge-base)
>
> 建立一个多源知识库，将查询路由给专业代理。

> [卡][Skills: SQL assistant](/oss/python/langchain/multi-agent/skills-sql-assistant)
>
> 构建一个使用按需上下文加载逐步加载专业技能的代理。

## 概念概述

这些指南解释了LangChain和LangGraph的核心概念和API。

> [卡][Memory](/oss/python/concepts/memory)
>
> 了解线程内和线程间交互的持久性。

> [卡][Context engineering](/oss/python/concepts/context)
>
> 学习为人工智能应用程序提供完成任务所需的正确信息和工具的方法。

> [卡][Graph API](/oss/python/langgraph/graph-api)
>
> 探索 LangGraph 的声明式图形构建 API。

> [卡][Functional API](/oss/python/langgraph/functional-api)
>
> 从另一个框架包装代理以进行 LangSmith 部署。

## 其他资源

> [卡][LangChain Academy](https://academy.langchain.com/)
>
> 提升您的 LangChain 技能的课程和练习。

> [卡][Case Studies](/oss/python/langgraph/case-studies)
>
> 了解团队如何在生产中使用 LangChain 和 LangGraph。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/learn.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。