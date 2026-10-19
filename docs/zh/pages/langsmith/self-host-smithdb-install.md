<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Install LangSmith with SmithDB | https://docs.langchain.com/langsmith/self-host-smithdb-install -->

# 使用 SmithDB 安装 LangSmith

通过分阶段 Helm 更新在自托管 LangSmith Kubernetes 安装上启用 SmithDB。

本指南分阶段在 LangSmith Kubernetes 安装上启用 SmithDB，以便您可以验证每个更改。每个阶段都是一个 Helm 更新，会滚动受影响的 pod。 ClickHouse 始终保持原位。

迁移历史 ClickHouse 数据是可选的。除非迁移，否则无法通过 SmithDB 支持的查询访问 ClickHouse 中留下的历史记录。

## 开始之前* 在开始之前通过 [Support Portal](https://support.langchain.com/) 联系 LangChain，以便团队可以审查您的基础设施计划。
* 在开始之前设置[SmithDB observability](/langsmith/self-host-smithdb-observability)。以下步骤使用指标来验证每个阶段。
* 从 Kubernetes 上正在运行的 LangSmith 安装开始。对于LangSmith 0.17 上的新安装，请参阅[Install without ClickHouse](#install-without-clickhouse)。
* 一次升级一个主要版本，直到安装满足 [cloud support](/langsmith/self-host-smithdb#cloud-support) 最低要求：AWS (EKS) 和 GCP (GKE) 上使用 Helm 图表 `0.16.14` 或更高版本的 LangSmith 0.16，或 Azure (AKS) 上的 LangSmith 0.17。沿[upgrade guide](/langsmith/self-host-upgrades)行驶。
* 保留当前安装的 Helm 值。本指南向其中添加 SmithDB 配置。
* 确认您可以直接或通过 GitOps 工作流程将 LangSmith Helm 版本应用到集群。
* 查看 [SDK migration guide](/langsmith/smithdb-sdk-migration) 并规划您的 SDK 升级以及此安装。

您可以稍后禁用 SmithDB。要将查询和摄取流量返回到 ClickHouse 并禁用 SmithDB 服务，请参阅[Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting#disable-or-reset-smithdb)。

## 安装顺序

### 步骤 1. 准备支持基础设施

按照[Prepare SmithDB supporting infrastructure](/langsmith/self-host-smithdb-infrastructure)提供：* 专用的 PostgreSQL 18 或更高版本元存储
* 具有工作负载身份或等效凭证的专用对象存储
* SmithDB 的缓存存储：网络连接磁盘或本地 SSD，以获得最佳缓存性能
* 网络连接和包含元存储连接详细信息的 Kubernetes Secret

记录 Helm 图表所需的对象存储配置、元存储 Secret 和键映射、服务帐户身份以及缓存设置。

在此步骤结束时，SmithDB Helm 值的共享基础设施部分可能如下所示。保持 SmithDB 禁用直到第 3 步。

从 [Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage) 添加适合您的版本的缓存值。在 LangSmith 0.17 通常是一行，`smithdb.cache.storageClassName`。任一版本上的本地 SSD 还需要此处显示的节点选择器和容忍度。

<Accordion title="SmithDB infrastructure Helm values">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  smithdb:
    serviceAccount:
      annotations:
        IDENTITY_ANNOTATION_KEY: IDENTITY_ANNOTATION_VALUE

    config:
      existingSecretName: smithdb-metastore
      metastore:
        hostSecretKey: smithdb_metastore_db_host
        databaseSecretKey: smithdb_metastore_db_name
        usernameSecretKey: smithdb_metastore_db_username
        passwordSecretKey: smithdb_metastore_db_password
        port: "5432"
        useSsl: true
      objectStore:
        type: OBJECT_STORE_TYPE
        bucket: BUCKET_NAME
  ```

  将身份和对象存储占位符替换为您的提供商的值。对于 Azure，还要向每个 SmithDB 工作负载添加 `azure.workload.identity/use: "true"` 标签。参见[Configure Blob Storage access](/langsmith/self-host-smithdb-infrastructure#configure-blob-storage-access)。

  <CodeGroup>
    ```yaml AWS theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME

      config:
        objectStore:
          type: s3
          bucket: BUCKET_NAME
          s3:
            region: AWS_REGION
    ```

    ```yaml GCP theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: GSA_NAME@PROJECT_ID.iam.gserviceaccount.com

      config:
        objectStore:
          type: gcs
          bucket: BUCKET_NAME
    ```

    ```yaml Azure theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: CLIENT_ID

      config:
        objectStore:
          type: azure
          bucket: CONTAINER_NAME
          azure:
            accountName: STORAGE_ACCOUNT_NAME
            accessKeySecretKey: ""
    ```
  </CodeGroup>
</Accordion>

### 步骤2.升级到所需的LangSmith版本SmithDB 需要 [Cloud support](/langsmith/self-host-smithdb#cloud-support) 中列出的 LangSmith 版本。在启用 SmithDB 之前升级到它。保留现有的 ClickHouse 配置并禁用 SmithDB：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  enabled: false
```

应用升级并验证现有 LangSmith Pod 是否正在运行并且迁移作业是否已完成。在继续之前解决升级失败的问题。

### 步骤 3. 配置和部署 SmithDB 服务

在启用 SmithDB 之前，请选择 [deployment mode](/langsmith/self-host-smithdb-scale#choose-a-deployment-mode) 和从 [Configure SmithDB for scale](/langsmith/self-host-smithdb-scale) 中经过测试的基线。配置其副本计数以及每个副本的 CPU、内存和缓存大小，并确认集群可以配置总数。

将步骤 1 中准备的基础设施值和您选择的规模基准合并到现有 LangSmith 值中。保持现有 ClickHouse 配置不变，然后启用 SmithDB 服务而不更改 LangSmith 摄取或查询：

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

应用图表，然后确认每个 SmithDB pod 正在运行并且元存储迁移作业已完成：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pods -n NAMESPACE | grep smithdb
kubectl get job -n NAMESPACE HELM_RELEASE-smithdb-metastore-migration
```

SmithDB 组件在启动时验证元存储和对象存储连接，因此正在运行的 pod 已经确认了两者。卡在 `Pending` 或 `CrashLoopBackOff` 的 Pod 则不会。参见[Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting#supporting-infrastructure)。

在这些检查通过之前，请勿启用 LangSmith 集成标志。### 步骤 4. 启用双重摄取

开始写入 SmithDB，同时继续写入 ClickHouse：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  langsmith:
    ingestion:
      enabled: true
    migration:
      enabled: false
    query:
      enabled: false
```

按以下顺序验证双摄取路径：

1. **路由**：`sdb_ingestion_enabled`为`true`，`sdb_query_enabled`为`false`。
2. **流量**：当流量到达时，`ingest_flush_count` 增加。平坦计数器意味着写入未到达对象存储。
3. **容量**：`langsmith_asynq_ingestion_queue_pending`在包括流量高峰的时期保持较低且稳定。持续增长意味着摄入量不足。在步骤5或步骤6之前用[Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)解决。

检查路由：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -s https://LANGSMITH_HOST/api/v1/info | jq '.instance_flags | {sdb_ingestion_enabled, sdb_query_enabled}'
```

写入必须始终持续到达 ClickHouse。 [SmithDB metrics reference](/langsmith/self-host-smithdb-metrics) 涵盖了其余的摄取指标。

### 步骤 5. 选择如何处理历史数据

一旦双重摄取稳定，请决定是否需要通过 SmithDB 支持的查询访问 ClickHouse 历史记录：

* **迁移**：按照[Migrate ClickHouse history to SmithDB](/langsmith/self-host-smithdb-migrate)，然后返回此处进行查询割接。
* **将其留在 ClickHouse**：跳过迁移。现有数据保留在 ClickHouse 中，但在割接后无法通过LangSmith 查询，除非查询被引导回 ClickHouse。

### 步骤 6. 将查询切换到 SmithDB在双摄取正常且任何 ClickHouse 迁移完成后，启用 SmithDB 支持的查询：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  langsmith:
    ingestion:
      enabled: true
    migration:
      enabled: false
    query:
      enabled: true
```

现在确认两个标志报告`true`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -s https://LANGSMITH_HOST/api/v1/info | jq '.instance_flags | {sdb_ingestion_enabled, sdb_query_enabled}'
```

然后在 LangSmith UI 和 API 中验证跟踪、项目、过滤器和时间范围，并继续监控摄取和查询错误。

<Warning>
  不要在 LangSmith 0.16 上禁用或删除 ClickHouse。在 0.17 上，从现有安装中停用 ClickHouse 是一个单独的过程；考虑之前请通过[Support Portal](https://support.langchain.com/)联系LangChain。
</Warning>

## 不使用 ClickHouse 安装

在 LangSmith 0.17 上，新安装可以运行 SmithDB 作为其唯一的跟踪存储。完成步骤 1，然后安装 LangSmith 0.17，禁用 ClickHouse 并启用两个 SmithDB 路径，代替步骤 2 到 6：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
clickhouse:
  enabled: false
smithdb:
  enabled: true
  langsmith:
    ingestion:
      enabled: true
    migration:
      enabled: false
    query:
      enabled: true
```

该图表至少需要一个摄取后端和一个查询后端，因此两个 SmithDB 标志都必须打开。这仅适用于新安装。

## 故障排除

如果安装过程中或安装后出现故障，请参阅[Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting)或通过[Support Portal](https://support.langchain.com/)联系LangChain。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-install.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>