<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith control plane | https://docs.langchain.com/langsmith/control-plane -->

# LangSmith 控制平面

*控制平面*是 LangSmith 管理部署的部分。它包括控制平面 UI（用户在其中创建和更新[Agent Servers](/langsmith/agent-server)）以及控制平面 API（支持 UI 并提供编程访问）。

当您通过控制平面进行更新时，更新将存储在控制平面状态中。 [data plane](/langsmith/data-plane)“监听器”通过调用控制平面 API 轮询这些更新。控制平面从不直接连接到数据平面。

## 控制平面 UI

从控制平面 UI，您可以：

* 查看未完成部署的列表。
* 查看单个部署的详细信息。
* 创建一个新的部署。
* 更新部署。
* 更新部署的环境变量。
* 查看部署的构建和服务器日志。
* 查看部署指标，例如 CPU 和内存使用情况。
* 删除部署。

控制平面 UI 嵌入在 [LangSmith](https://docs.smith.langchain.com) 中。

## 控制平面API

本节介绍控制平面API的数据模型。该 API 用于创建、更新和删除部署。更多详情请参阅[control plane API reference](/langsmith/api-ref-control-plane)。

### 集成集成是 `git` 存储库提供程序（例如 GitHub）的抽象。它包含连接 `git` 存储库并从其部署所需的所有元数据。

### 部署

部署是代理服务器的一个实例。单个部署可以有多个修订。

### 修订

修订版是部署的迭代。创建新部署时，会自动创建初始修订。要部署代码更改或更新部署的机密，必须创建新的修订版。

### 听众

监听器是["listener" application](/langsmith/data-plane#listener-application)的一个实例。侦听器包含有关应用程序的元数据（例如版本）以及有关应用程序可以部署到的计算基础设施的元数据（例如 Kubernetes 命名空间）。

## 控制平面特性

本节介绍控制平面的各种功能。对于特定于平台的行为，例如云部署类型或自托管资源自定义，请参阅 [Cloud platform features](/langsmith/cloud-platform-features) 或 [Deploy to self-hosted](/langsmith/deploy-to-self-hosted-overview)。

### 异步部署

用于部署和修订的基础设施是异步配置和部署的。它们在提交后不会立即部署。目前，部署可能需要长达几分钟的时间。* 创建新部署时，会为该部署创建一个新数据库。数据库创建是一次性步骤。此步骤会导致部署的初始修订版的部署时间更长。
* 为部署创建后续修订版时，没有数据库创建步骤。与初始修订版的部署时间相比，后续修订版的部署时间要快得多。
* 每个修订版的部署过程都包含一个构建步骤，该步骤可能需要几分钟的时间。

控制平面和[data plane](/langsmith/data-plane)“监听器”应用程序协调以实现异步部署。

### 监控

部署准备就绪后，控制平面会监视部署并记录各种指标，例如：

* 部署的CPU和内存使用情况。
* 容器重新启动的次数。
* 副本数量（这将随着 [autoscaling](/langsmith/data-plane#autoscaling) 的增加而增加）。
* [PostgreSQL](/langsmith/data-plane#postgresql) CPU、内存使用率和磁盘使用率。
* [Agent Server queue](/langsmith/agent-server#task-queue) 待处理/活动运行计数。
* [Agent Server API](/langsmith/agent-server) 成功响应计数、错误响应计数和延迟。

这些指标在控制平面 UI 中显示为图表。

### LangSmith 集成为每个部署自动创建一个 [LangSmith](/langsmith/observability) 跟踪项目。跟踪项目与部署同名。创建部署时，不需要指定`LANGCHAIN_TRACING`和`LANGSMITH_API_KEY`/`LANGCHAIN_API_KEY`环境变量；它们由控制平面自动设置。

删除部署时，跟踪和跟踪项目不会被删除。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/control-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>