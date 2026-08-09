<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Learn | https://docs.langchain.com/oss/python/learn -->

# 学习

帮助您入门的教程、概念指南和资源。

在文档的 **学习** 部分，您将找到一系列教程、概念概述和其他资源，以帮助您使用 LangChain 和 LangGraph 构建强大的应用程序。

## 教程

以下是按框架组织的常见用例教程。

### 深层特工

[Deep Agents](/oss/python/deepagents/overview) 包括用于管理上下文、虚拟文件系统和其他常见代理要求的内置功能。

<Card title="Data analysis" icon="chart-pie" href="/oss/python/deepagents/data-analysis">
  构建一个将报告发送到 Slack 的数据分析代理。
</Card>

<Card title="Deep research" icon="search" href="/oss/python/deepagents/deep-research">
  构建具有子代理委托和战略反思的多步骤网络研究代理。
</Card>

###LangChain

[LangChain](/oss/python/langchain/overview) [agent](/oss/python/langchain/agents) 实现使简单用例变得容易上手。

<Card title="Semantic Search" icon="search" href="/oss/python/langchain/knowledge-base">
  使用 LangChain 组件在 PDF 上构建语义搜索引擎。
</Card>

<Card title="RAG Agent" icon="user-search" href="/oss/python/deepagents/rag">
  创建检索增强生成 (RAG) 代理。
</Card>

<Card title="SQL Agent" icon="database" href="/oss/python/langchain/sql-agent">
  构建 SQL 代理以通过人机交互审核与数据库进行交互。
</Card>

<Card title="Voice Agent" icon="microphone" href="/oss/python/langchain/voice-agent">
  建立一个你能说、能听的代理。
</Card>

### 郎图LangChain的[agent](/oss/python/langchain/agents)实现使用[LangGraph](/oss/python/langgraph/overview)原语。
如果需要更深入的定制，可以直接在 LangGraph 中实现代理。

<Card title="Custom RAG Agent" icon="user-search" href="/oss/python/langgraph/agentic-rag">
  使用 LangGraph 原语构建 RAG 代理以进行细粒度控制。
</Card>

<Card title="Custom SQL Agent" icon="database" href="/oss/python/langgraph/sql-agent">
  直接在 LangGraph 中实现 SQL 代理以获得最大的灵活性。
</Card>

### 多代理

这些教程演示了[multi-agent patterns](/oss/python/langchain/multi-agent)，将 LangChain 代理与 LangGraph 工作流程混合在一起。

<Card title="Subagents: Personal assistant" icon="sitemap" href="/oss/python/langchain/multi-agent/subagents-personal-assistant">
  建立一个私人助理，将权力委托给子代理。
</Card>

<Card title="Handoffs: Customer support" icon="users" href="/oss/python/langchain/multi-agent/handoffs-customer-support">
  构建一个客户支持工作流程，其中单个代理可以在不同状态之间转换。
</Card>

<Card title="Router: Knowledge base" icon="share" href="/oss/python/langchain/multi-agent/router-knowledge-base">
  构建一个多源知识库，将查询路由给专业代理。
</Card>

<Card title="Skills: SQL assistant" icon="wand" href="/oss/python/langchain/multi-agent/skills-sql-assistant">
  构建一个使用按需上下文加载逐步加载专业技能的代理。
</Card>

## 概念概述

这些指南解释了 LangChain 和 LangGraph 的核心概念和 API。

<Card title="Memory" icon="brain" href="/oss/python/concepts/memory">
  了解线程内和线程间交互的持久性。
</Card>

<Card title="Context engineering" icon="notebook" href="/oss/python/concepts/context">
  了解为人工智能应用程序提供完成任务所需的正确信息和工具的方法。
</Card>

<Card title="Graph API" icon="topology-star" href="/oss/python/langgraph/graph-api">
  探索 LangGraph 的声明式图形构建 API。
</Card><Card title="Functional API" icon="code" href="/oss/python/langgraph/functional-api">
  将代理构建为单一功能。
</Card>

## 其他资源

<Card title="LangChain Academy" icon="school" href="https://academy.langchain.com/">
  提升您的 LangChain 技能的课程和练习。
</Card>

<Card title="Case Studies" icon="presentation" href="/oss/python/langgraph/case-studies">
  了解团队如何在生产中使用 LangChain 和 LangGraph。
</Card>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/learn.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>