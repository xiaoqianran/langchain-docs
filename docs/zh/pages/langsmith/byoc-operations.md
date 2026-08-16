<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC operations | https://docs.langchain.com/langsmith/byoc-operations -->

# BYOC 操作

LangChain 在配置后操作您的数据平面，包括升级、扩展、监控和安全修补。大多数维护都是非中断性的，不需要您执行任何操作。

## 自动缩放

LangChain 随着负载变化缩放数据平面，因此您无需调整大小或调整它：

- **无状态LangSmith服务**：通过水平 Pod 自动缩放器进行水平缩放，随着 Pod 需求的变化，Karpenter 进行配置和删除节点容量。
- **数据库**：LangChain 大小和比例 RDS 和 ElastiCache。

## 高可用性

默认情况下，数据平面是为了实现高可用性而配置的。 VPC 跨越您所在区域的可用区，RDS 和 ElastiCache 运行具有自动故障转移功能的多可用区。

<Note>
要运行没有高可用性的数据平面，请联系 LangChain 团队。
</Note>

## 实例大小

数据平面为数据库和节点组配置了默认实例大小。要在较小的实例上运行数据平面，请联系 LangChain 团队。

## LangSmith 升级

LangChain 每周升级一次数据平面中的 LangSmith 版本。升级是滚动的、逐个副本的，因此不会出现整个服务停机。有两种机制可确保升级不停机：

- **水平 Pod 自动缩放**：LangSmith 服务运行多个副本，由水平 Pod 自动缩放器调整大小，因此一次替换几个 Pod，而其余副本继续提供流量。
- **Pod 中断预算**：Pod 中断预算限制了一次可以有多少个服务副本不可用，因此滚动更新和节点消耗都不会导致服务低于保持可用所需的容量。

<Note>
对发布渠道的支持即将推出。
</Note>

## 支持服务升级

Istio、KEDA 和 ClickHouse Operator 等后台服务定期升级。这些升级是非侵入式的，预计不会出现服务中断。

## Kubernetes 集群升级

托管数据平面的 EKS 集群需要定期升级，以保持安全性、兼容性和对新功能的访问。 LangChain 在 AWS 支持终止日期之前主动执行这些升级，并与您协调窗口。

集群升级分为两种：- **控制平面升级**：涵盖 Kubernetes API 服务器以及 AWS 与之一起管理的组件。这些对于您的工作负载是透明的，并且不会重新启动 Pod。
- **节点组升级**：使用 make-before-break 语义将节点一一滚动。在更新的版本上配置新节点，Pod 移动到它们上，迁移完成后旧节点将终止。 Pod 中断预算适用于排水，因此每个服务都保持可用，尽管您可能会在各个 Pod 重新启动时看到短暂的连接重置。没有数据丢失。

## 维护窗口

任何可能导致停机的维护或升级（例如重新启动 RDS 或 ElastiCache）都发生在 LangChain 提前与您协调的计划维护时段内。

## 可观察性

您可以将可观察性工具部署到集群中，例如 Datadog 代理或 OpenTelemetry 收集器，以及您自己的安全监控代理，只要它们不干扰 LangSmith 工作负载即可。

LangSmith 服务发出日志、指标和跟踪的方式与自托管相同，因此适用相同的配置。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。

## 故障排除LangChain 团队无法长期访问您的数据，只能管理您的数据平面的基础设施。当故障排除需要访问数据时，有两种路径：

- **您运行查询**：您自己运行查询，并在与 LangChain 共享输出之前验证和清理输出。
- **打破玻璃访问**：您将特定工程师列入许可名单以执行该操作。您可以随时撤销该访问权限。

<Note>
如果需要打破玻璃进入，LangChain 团队会提供说明。
</Note>

## 审计

- **LangSmith 审核日志**：对数据平面资源的操作记录在数据平面中，并可在数据平面端点访问。控制平面操作（例如创建用户）在控制平面中进行审核。有关如何访问两者的信息，请参阅[Audit logs](/langsmith/audit-logs)。
- **EKS 审核日志**：发送到您帐户中的 CloudWatch，以便您可以监控所运行的命令。
- **VPC 流日志**：记录在您账户的 S3 存储桶中。

您有责任对这些日志设置警报。

## 另请参阅

- [BYOC architecture](/langsmith/byoc-architecture)
- [Using BYOC](/langsmith/byoc-usage)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-operations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>