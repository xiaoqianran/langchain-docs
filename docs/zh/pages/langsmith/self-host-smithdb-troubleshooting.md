<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshoot SmithDB | https://docs.langchain.com/langsmith/self-host-smithdb-troubleshooting -->

# SmithDB 故障排除

诊断 SmithDB 故障、收集故障排除上下文或禁用并重置自托管 LangSmith 上的 SmithDB 部署。

> [!注意]
>
> 在此页面上的所有内容中保持 ClickHouse 配置并可用。如果没有匹配记录的问题，请通过 [Support Portal](https://support.langchain.com/) 联系 LangChain。

使用此页面可以诊断 SmithDB 安装和迁移失败，在升级之前收集上下文，或将 SmithDB 退出部署：将流量返回到 ClickHouse，禁用 SmithDB 服务，并可选择删除 SmithDB 数据。

## 一般最佳实践

* 停止在当前安装或迁移阶段，直到您了解问题为止。
* 记录LangSmith和Helm图表版本以及最近的配置更改。
* 在删除或重新创建资源之前保留失败的作业、TaskDB 和相关日志。
* 故障排除时请勿删除 SmithDB 元存储或对象存储数据。

## 支持基础设施

大多数 SmithDB 安装失败可追溯到以下原因之一。对于每个依赖的配置，请参阅[Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)。**Pod 保持 `Pending`。** 在网络连接的缓存上，声明无法绑定。检查声明和 Pod 事件中是否有 StorageClass、区域或配额错误：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pvc -n NAMESPACE
kubectl describe pod -n NAMESPACE POD_NAME | grep -A5 Events
```

对于本地 SSD，将 pod 的 `ephemeral-storage` 请求与节点可分配容量进行比较：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get node NODE_NAME -o jsonpath='{.status.allocatable.ephemeral-storage}{"\n"}'
```

要么配置更大的节点，要么选择更小的层。节点还需要高于 pod 请求的空间，以用于图像、日志和 Kubernetes 预留。如果您在 0.17 上迁移到网络附加缓存并且 Pod 仍然请求节点存储，则来自旧值文件的 `ephemeral-storage` 覆盖仍然存在；删除它。无论缓存类型如何，迁移作业都会请求节点存储。

**对象存储访问被拒绝。** 工作负载身份绑定与 SmithDB 实际运行的 ServiceAccount 不匹配。信任策略必须命名发布命名空​​间和ServiceAccount名称，默认为`HELM_RELEASE-smithdb`。确认 pod 使用的是什么：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pod -n NAMESPACE POD_NAME -o jsonpath='{.spec.serviceAccountName}{"\n"}'
```

对于`create: false`，需要`name`。否则，pod 会回退到 `default` ServiceAccount，并且绑定永远不会应用。**元存储拒绝连接。** 检查数据库是否可从集群访问，`useSsl` 是否与服务器所需的内容匹配，以及 `smithdb.config.metastore` 中指定的密钥是否与密钥中实际存在的密钥匹配。

**摄取或查询失败，并出现 `Unavailable` 错误。** HTTP 代理或服务网格会阻止与 SmithDB pod IP 的连接。 `ingest-queue` 日志显示诸如 `closing SmithDB ingestion stream failed: rpc error: code = Unavailable` 之类的错误。允许[Pod network access](/langsmith/self-host-smithdb-infrastructure#pod-network-access)中描述的连接。然后重新启动`platform-backend`、`ingest-queue`、`queue`和SmithDB查询，因为更改之前打开的连接不断失败。

**缓存 I/O 速度慢。** 在本地 SSD 上，`emptyDir` 由启动磁盘而不是 SSD 支持。在网络连接的磁盘上，卷配置不足：确认 StorageClass 设置至少 7000 IOPS 和 1000 MiB/s。检查哪个设备支持正在运行的 pod 内的缓存文件系统：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl exec -n NAMESPACE POD_NAME -- df -h /data
```

对于本地 SSD，文件系统应使用本地 NVMe 设备，例如 `/dev/md0` 或 `/dev/nvme1n1`。对于网络磁盘，确认`/data`挂载了配置的声明。

## 迁移作业失败

迁移作业默认为`backoffLimit: 3`，允许在 Kubernetes 将其标记为失败之前重试。如果作业因配置不足而失败，请调整 `smithdb.migration.job.parallelism` 和 `smithdb.migration.job.resources`（`smithdb.migration.deployment.resources` on LangSmith 0.16）。保留TaskDB，仅删除迁移作业，然后运行正常的Helm升级。删除活动作业可能会因正在进行的写入而留下少量未跟踪的对象存储数据。重新创建的作业将恢复 TaskDB 中跟踪的进度。

> [!警告]
>
> 重置 SmithDB 元存储或对象存储时，也重置 TaskDB。禁用 SmithDB 时，默认情况下会删除图表管理的 TaskDB PVC。手动清除外部或保留的 TaskDB，否则过时的迁移状态可能会导致工作被跳过。

> [!警告]
>
> 对于验证失败、原因不明或配置不足以外的问题，请停止并升级。保持查询禁用并启用迁移。保留失败的作业、TaskDB、SmithDB 元存储和对象存储。通过[Support Portal](https://support.langchain.com/)联系LangChain。

## 禁用或重置 SmithDB

使用此部分将 LangSmith 流量路由回 ClickHouse 并禁用 SmithDB 服务。安装割接顺序请参见[Install LangSmith with SmithDB](/langsmith/self-host-smithdb-install)。> [!警告]
>
> 如果历史迁移处于活动状态或者必须保留其进度，请在禁用 SmithDB 之前停止。禁用迁移会删除图表管理的 TaskDB 资源，默认情况下还会删除其 PVC。如果您需要保留迁移进度，请通过 [Support Portal](https://support.langchain.com/) 联系 LangChain。

如果您稍后重新启用 SmithDB 摄取，则需要运行另一次迁移以使其恢复与 ClickHouse 同步。

### 步骤 1. 将流量路由回 ClickHouse

保持 SmithDB 服务启用，但禁用查询、提取和迁移：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  enabled: true
  langsmith:
    ingestion:
      enabled: false
    migration:
      enabled: false
    query:
      enabled: false
```

通过正常的部署工作流程应用图表并等待部署完成。在删除任何 SmithDB 工作负载之前，这会将所有查询和摄取流量路由回 ClickHouse。

### 步骤 2. 禁用 SmithDB 服务

第一次 Helm 更新完成后，禁用 SmithDB 服务，同时关闭集成标志：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  enabled: false
  langsmith:
    ingestion:
      enabled: false
    migration:
      enabled: false
    query:
      enabled: false
```

再次应用图表。将流量切换与工作负载移除分开，可以避免请求与 SmithDB 关闭竞争。

### 步骤 3.（可选）删除 SmithDB 数据> [!警告]
>
> 这种清理具有破坏性。仅在禁用 SmithDB 服务并且您不再需要数据来重新启用、诊断或恢复后才能继续。

（可选）删除专用的 SmithDB 对象存储数据和 PostgreSQL 元存储。清理后重新启用 SmithDB 需要重新创建其支持基础设施并从 ClickHouse 重新迁移数据。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-troubleshooting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。