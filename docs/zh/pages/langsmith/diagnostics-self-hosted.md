<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshooting for self-hosted deployments | https://docs.langchain.com/langsmith/diagnostics-self-hosted -->

# 自托管部署故障排除

本页面提供诊断步骤，帮助您在联系支持之前解决自托管 [LangSmith Deployment](/langsmith/deployment) 的问题。系统地遵循以下步骤来识别和解决常见部署问题。

<Callout icon="headset" iconType="solid" color="#9333ea">
如果您完成这些诊断步骤但仍然需要帮助，请参阅本指南末尾的[Support](#support)，了解有关在联系之前需要收集哪些内容的信息。
</Callout>

## 先决条件

在开始诊断步骤之前，请确保您已：

- `kubectl` 访问您的 Kubernetes 集群。
- 查看 Pod、部署、服务等的适当权限。
- 熟悉您的[Helm chart configuration](/langsmith/kubernetes#configure-your-helm-charts:)。

## 步骤 1.了解您的部署

验证已部署的内容并了解系统的基线状态。这可以帮助您了解正常操作是什么样的，并在出现问题时识别偏差。

执行以下命令，查看所有已部署的 Kubernetes 资源。

<Note>
运行本部分中的命令时，请确保您位于正确的命名空间中。或者，使用 `-n` 标志显式指定命名空间。例如：`kubectl get deployments -n langsmith`。
</Note>

列出所有部署：

```bash
kubectl get deployments
```

列出所有 Pod：

```bash
kubectl get pods
```

列出所有服务：

```bash
kubectl get services
```列出所有`lgps`资源（仅在创建[Agent Server](/langsmith/agent-server)后出现）：

```bash
kubectl get lgps
```

### 关键部署组件

您的部署包括以下核心组件：

- **`langsmith-frontend`**：您在其中创建代理服务器部署的 LangSmith 前端 UI。该应用程序对`langsmith-host-backend`进行API调用。 [control plane](/langsmith/control-plane) 的一部分。
- **`langsmith-host-backend`**：LangSmith部署[control plane](/langsmith/control-plane)接收来自`langsmith-frontend`的请求并将部署请求保存到控制平面Postgres数据库。
- **`langsmith-listener`**：LangSmith部署[data plane](/langsmith/data-plane)的一部分。通过 HTTP API 轮询 `langsmith-host-backend` 来创建、更新或删除部署。将任务排队以供工作进程处理。
- **`langsmith-redis`**：[Redis](/langsmith/data-plane#redis)实例充当`langsmith-listener`的任务队列。侦听器将任务放入此处，工作人员从该队列中提取任务。
- **`langsmith-operator`**：`lgps` Kubernetes 运算符，用于协调 `lgps` 资源的底层 Kubernetes 资源。数据平面基础设施的一部分。

<Note>
根据您的配置，您的部署中可能存在其他组件。有关概述，请参阅[LangSmith Deployment components](/langsmith/components)。
</Note>

## 步骤 2. 启用调试日志记录排除问题时，第一步通常是启用调试级别日志记录，以收集有关系统中发生的情况的更详细信息。

### 用于控制平面或数据平面部署

如果您在控制平面部署（例如，`langsmith-host-backend`）或数据平面部署（例如，`langsmith-listener`）方面遇到问题，请使用 `LOG_LEVEL=DEBUG` 环境变量重新安装 Helm 图表。将以下内容添加到您的 `values.yaml` 文件中：

```yaml
extraEnv:
  - name: LOG_LEVEL
    value: DEBUG
```

### 对于代理服务器部署

如果问题出在单个代理服务器部署上：

1. 导航到 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-diagnostics-self-hosted) 中的 **部署** 选项卡。
1. 在部署视图中，选择 **+ 新修订**。
1. 添加新的环境变量`LOG_LEVEL`，并将其设置为`DEBUG`。

<Note>
您还可以在部署视图的 UI 中找到调试日志，单击“**服务器日志**”，然后为“**日志级别：信息**”下拉列表选择“**调试**”。
</Note>

### 对于普遍存在的问题

如果您不确定问题的根源，请在各处（控制平面、数据平面和所有代理服务器部署）启用 `DEBUG` 日志记录。

### 查看应用程序日志

跟踪每个 Pod 的日志以了解基线行为：

```bash
kubectl logs -f <pod_name>
```

然后查找这些日志行：- **`langsmith-listener`**：`Reconciling projects...`（每 10 秒出现一次）
- **`langsmith-operator`**：`Starting reconciliation`（定期出现）

在健康的部署中，您不应该看到任何错误。所有日志都应显得正常且常规。

### 解释调试日志

查找以下问题指标：

- 异常或堆栈跟踪。
- 错误消息（单词`"ERROR"`）。
- 与正常操作不同的异常模式。

根据您发现的错误：

- **配置问题**：如果您怀疑配置问题，请向运行[⟦T36⟧](/langsmith/kubernetes)的人员提出问题。
- **用户代码错误**：如果您怀疑用户代码中存在错误（例如，LangGraph OSS 图形实现），请向创建 [⟦T37⟧](/langsmith/application-structure#configuration-file) 文件的代理服务器应用程序的所有者提出问题。

## 步骤 3. 描述部署和 Pod

描述 Kubernetes 资源可揭示应用程序日志中可能不会出现的错误事件和状态。这些错误通常是由配置或基础设施问题而不是应用程序代码错误引起的。描述资源还显示其配置（例如环境变量），这有助于调试。

运行以下命令来描述您的资源。

描述 Kubernetes 部署：

```bash
kubectl describe deployment <deployment_name>
```描述一个 Kubernetes Pod：

```bash
kubectl describe pod <pod_name>
```

描述`lgps`资源（仅在创建代理服务器后相关）：

```bash
kubectl describe lgps <lgps_name>
```

### 解释结果

查看输出的 `Events:` 部分并验证一切正常。出现的常见问题包括：

- 活动或就绪探测失败
- 图像拉取错误
- 资源限制（CPU、内存）
- 卷安装问题
- 配置错误

确保没有错误事件并且所有事件都表明运行正常。

## 其他资源

有关更多故障排除信息，请参阅：

- [Troubleshooting](/langsmith/troubleshooting)：一般故障排除指南，包含常见问题的解决方案。
- [Self-hosted overview](/langsmith/self-hosted)：系统架构和组件交互的详细信息。

## 支持

如果您已执行这些诊断步骤但仍需要帮助，请在联系支持之前收集以下信息：

- [diagnostic steps](#step-1-understand-your-deployment) 的输出。
- 您的 Helm 图表配置。
- 相关错误消息和日志。
- 问题发生时您尝试执行的操作的描述。

准备好这些信息将有助于[support](https://support.langchain.com)团队更快地诊断和解决您的问题。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/diagnostics-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>