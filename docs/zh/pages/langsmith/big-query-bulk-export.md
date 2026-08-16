<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Export trace data to BigQuery | https://docs.langchain.com/langsmith/big-query-bulk-export -->

# 将跟踪数据导出到 BigQuery

<Info>
**适用计划限制**

对于2026年8月3日之后注册的客户，批量导出仅适用于[LangSmith Enterprise plan](https://www.langchain.com/pricing-langsmith)。在 2026 年 8 月 3 日或之前注册的客户可以在 2027 年 2 月 1 日之前使用 Plus 或 Enterprise 套餐的批量导出功能。
</Info>

LangSmith 可以将跟踪数据以 Parquet 格式导出到 Google Cloud Storage (GCS) 存储桶。从那里，您可以将其作为外部表（从 GCS 就地查询）或本机表（复制到 BigQuery 存储中）加载到 BigQuery 中。

本指南涵盖：

- 为 LangSmith 设置 GCS 存储桶和 HMAC 凭据。
- 创建批量导出目的地和导出作业。
- 将导出的数据加载到 BigQuery 中。

有关批量导出配置选项的完整详细信息，请参阅[Bulk export trace data](/langsmith/data-export) 和 [Manage bulk export destinations](/langsmith/data-export-destinations)。

## 先决条件

- LangSmith [Tracing project](https://smith.langchain.com/projects) 中的数据。
- [⟦T9⟧ CLI installed](https://docs.cloud.google.com/sdk/docs/install-sdk)。 （您还可以使用 Google Cloud 控制台进行设置。）

## 1.创建GCS桶

为 LangSmith 导出创建专用的 GCS 存储桶。使用专用存储桶可以更轻松地授予范围权限，而不会影响其他数据：

```bash
gcloud storage buckets create gs://YOUR_BUCKET_NAME \
  --location=US \
  --uniform-bucket-level-access
```

选择靠近您的 BigQuery 数据集的区域，以最大程度地减少延迟并避免跨区域出站费用。## 2. 创建服务帐户并授予访问权限

创建一个 GCP 服务帐户，LangSmith 将使用该帐户将数据写入 GCS：

```bash
gcloud iam service-accounts create langsmith-bulk-export \
  --display-name="LangSmith Bulk Export"
```

授予服务帐户对您的存储桶的写入权限。所需的最低权限为`storage.objects.create`。授予 `storage.objects.delete` 是可选的，但建议这样做。 LangSmith 使用它来清理在目标验证期间创建的临时测试文件。如果没有此权限，您的存储桶中可能会保留 `tmp/` 文件夹。

“存储对象管理员”预定义角色涵盖所有必需和推荐的权限：

```bash
gcloud storage buckets add-iam-policy-binding gs://YOUR_BUCKET_NAME \
  --member="serviceAccount:langsmith-bulk-export@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

要改为使用最小自定义角色，请仅授予：

- `storage.objects.create`（必填）
- `storage.objects.delete`（可选，用于测试文件清理）
- `storage.objects.get`（可选但推荐，用于文件大小验证）
- `storage.multipartUploads.create`（可选但推荐，用于大文件上传）

## 3. 生成 HMAC 密钥

LangSmith 使用 S3 兼容的 XML API 连接到 GCS，这需要 HMAC 密钥而不是服务帐户 JSON 密钥。

为您的服务帐户生成 HMAC 密钥：

```bash
gcloud storage hmac create \
  langsmith-bulk-export@YOUR_PROJECT.iam.gserviceaccount.com
```

保存输出中的 `accessId` 和 `secret`。您还可以在 GCP Console 中的**云存储→设置→互操作性→为服务帐户创建密钥**下生成 HMAC 密钥。

## 4. 创建批量导出目的地在 LangSmith 中创建一个指向您的 GCS 存储桶的目标。将 `endpoint_url` 设置为 `https://storage.googleapis.com` 以使用 GCS S3 兼容 API。

您将需要 [LangSmith API key](/langsmith/create-account-api-key) 和 [workspace ID](/langsmith/set-up-hierarchy#set-up-a-workspace)。

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "GCS for BigQuery",
    "config": {
      "bucket_name": "YOUR_BUCKET_NAME",
      "prefix": "YOUR_PREFIX",
      "endpoint_url": "https://storage.googleapis.com"
    },
    "credentials": {
      "access_key_id": "YOUR_HMAC_ACCESS_ID",
      "secret_access_key": "YOUR_HMAC_SECRET"
    }
  }'
```

`prefix` 是存储桶内的路径，LangSmith 将写入导出的文件。例如，`langsmith-exports` 或 `data/traces`。选择适合您的存储桶布局的任何值。

LangSmith 通过在保存目标之前执行测试写入来验证凭据。如果请求返回`400`错误，请参阅[Debug destination errors](/langsmith/data-export-destinations#debug-destination-errors)。

保存响应中的`id`；您将在下一步中需要它。

### 临时验证文件

在目标创建期间（和 [credential rotation](#credential-rotation)），LangSmith 将临时 `.txt` 文件写入 `YOUR_PREFIX/tmp/` 以验证写入访问权限，然后尝试将其删除。删除是尽力而为：如果服务帐户缺少 `storage.objects.delete`，则不会删除该文件，并且 `tmp/` 文件夹仍保留在您的存储桶中。

`tmp/` 文件夹不会影响导出，但它将包含在广泛的 GCS URI glob 中（例如，`gs://YOUR_BUCKET_NAME/YOUR_PREFIX/*`）。

## 5. 创建批量导出作业

创建针对特定项目的导出。使用 `format_version: v2_beta` 来实现 BigQuery 兼容性 - 它会生成 BigQuery 正确处理的 UTC 时区感知时间戳。您将需要项目 ID (`session_id`)，您可以从 [**Tracing Projects** list](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-big-query-bulk-export) 的项目视图中复制该 ID。

**一次性导出：**

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "YOUR_DESTINATION_ID",
    "session_id": "YOUR_PROJECT_ID",
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-02-01T00:00:00Z",
    "format_version": "v2_beta",
    "compression": "snappy"
  }'
```

**计划（定期）导出：**

```bash
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "YOUR_DESTINATION_ID",
    "session_id": "YOUR_PROJECT_ID",
    "start_time": "2024-01-01T00:00:00Z",
    "interval_hours": 24,
    "format_version": "v2_beta",
    "compression": "snappy"
  }'
```

批量导出默认为`zstandard`压缩。此示例设置 `snappy`，因为 Snappy 速度快且受到 BigQuery 的广泛支持。所有可用选项，请参阅[Bulk export trace data](/langsmith/data-export#2-create-an-export-job)，包括字段过滤和过滤表达式。

<Note>
在[Self-hosted LangSmith](/langsmith/self-hosted)上，默认为`gzip`。设置 `FF_BULK_EXPORT_DEFAULT_COMPRESSION` 环境变量以更改默认值。
</Note>

### 输出文件结构

导出的文件使用 Hive 分区的路径结构登陆 GCS：

```
gs://YOUR_BUCKET_NAME/YOUR_PREFIX/export_id=<uuid>/tenant_id=<uuid>/session_id=<uuid>/resource=runs/year=<year>/month=<month>/day=<day>/<filename>.parquet
```

当启用 Hive 分区检测时，路径中的分区列（`export_id`、`tenant_id`、`session_id`、`resource`、`year`、`month`、`day`）可用作 BigQuery 中的可查询列。

## 6. 将数据加载到 BigQuery 中

BigQuery 提供两种访问导出数据的方法。两者都需要首先授予 BigQuery 服务帐户对 GCS 存储桶的读取权限。根据您的需求选择：- **外部表：**数据保留在 GCS 中，BigQuery 就地查询它。 BigQuery 中没有存储成本，但查询性能比本机存储慢。参考[Required roles](https://docs.cloud.google.com/bigquery/docs/query-cloud-storage-data#required-roles)。
- **本机表：**数据复制到 BigQuery 存储中。查询速度更快并完全支持 BigQuery 功能，但会产生 BigQuery 存储成本。参考[Required permissions](https://docs.cloud.google.com/bigquery/docs/cloud-storage-transfer#required_permissions)。

### 创建表

<Tabs>
  <Tab title="External table">
    外部表直接从 GCS 查询数据，无需将其复制到 BigQuery 中。

    1. 在 BigQuery 控制台的 **Explorer** 窗格中展开您的项目和数据集。
    1. 单击数据集的 **操作** 菜单（三个点）并选择 **创建表**。
    1. 在**来源**下：
       - 将**创建表自**设置为**Google Cloud Storage**。
       - 将文件路径设置为`gs://YOUR_BUCKET_NAME/YOUR_PREFIX/export_id=*`。使用 `export_id=*` 将 BigQuery 范围限定为 Hive 分区的导出目录，并排除 LangSmith 在目标验证期间写入的 `tmp/` 文件夹（请参阅 [Temporary validation file](#temporary-validation-file)）。
       - 将**文件格式**设置为**Parquet**。
    1. 勾选**源数据分区**，然后：
       - 将 **源 URI 前缀** 设置为 `gs://YOUR_BUCKET_NAME/YOUR_PREFIX`。
       - 将**分区推断模式**设置为**自动推断类型**。
    1. 在**目的地**下：- 选择您的项目和数据集。
       - 输入表名称，例如`langsmith_runs`。
       - 将**表类型**设置为**外部表**。
    1. 在**架构**下，启用**自动检测**。
    1. 单击“**创建表**”。

    分区路径列（`export_id`、`tenant_id`、`session_id`、`resource`、`year`、`month`、`day`）可用作可查询列。在查询中过滤 `year`、`month` 或 `day` 以启用分区修剪。
  </Tab>
  <Tab title="Native table">
    本机表将 Parquet 数据传输到 BigQuery 存储中，以获得完整的查询性能。

    1. 转到 Google Cloud 控制台中的[Data Transfer page](https://console.cloud.google.com/bigquery/transfers)，然后选择 **+ 创建传输**。
    1. 对于 **来源类型**，选择 **Google 云存储**。
    1. 输入**传输名称**。如有必要，您可以随时编辑传输。
    1. 选择**计划选项**。如果您不想重复导出，可以选择**按需**并手动触发导出。1. 在 BigQuery 控制台的 **Explorer** 窗格中展开您的项目和数据集。
    1. 单击数据集的 **操作** 菜单（三个点）并选择 **创建表**。
    1. 在**来源**下：
       - 将**创建表自**设置为**Google Cloud Storage**。
       - 将文件路径设置为`gs://YOUR_BUCKET_NAME/YOUR_PREFIX/export_id=*`。使用 `export_id=*` 会排除 LangSmith 在目标验证期间写入的 `tmp/` 文件夹（请参阅 [Temporary validation file](#temporary-validation-file)）。
       - 将**文件格式**设置为**Parquet**。
    1. 勾选**源数据分区**，然后：
       - 将 **源 URI 前缀** 设置为 `gs://YOUR_BUCKET_NAME/YOUR_PREFIX`。
       - 将**分区推断模式**设置为**自动推断类型**。
    1. 在**目的地**下：
       - 选择您的项目和数据集。
       - 输入表名称，例如`langsmith_runs`。
       - 将**表类型**设置为**本机表**。
    1. 在**高级选项**下，将新表的**写入首选项**设置为**如果为空则写入**。
    1. 单击“**创建表**”。

    BigQuery 运行加载作业来复制数据。 Hive 分区列在表中显示为常规列。有关可用数据列的完整列表，请参阅[Exportable fields](/langsmith/data-export#exportable-fields)。
  </Tab>
</Tabs>

## 凭证轮换

要在不中断活动导出的情况下轮换 HMAC 密钥：1. **在 GCP 中为同一服务帐户生成新的 HMAC 密钥**。
2. **使用新凭证调用 PATCH 端点**：

   ```bash
   curl --request PATCH \
     --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations/YOUR_DESTINATION_ID' \
     --header 'Content-Type: application/json' \
     --header 'X-API-Key: YOUR_API_KEY' \
     --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
     --data '{
       "credentials": {
         "access_key_id": "NEW_HMAC_ACCESS_ID",
         "secret_access_key": "NEW_HMAC_SECRET"
       }
     }'
   ```

   LangSmith 在保存之前通过测试写入来验证新凭据。在此验证期间，新的 `tmp/` 文件可能会出现在您的存储桶中（请参阅[Temporary validation file](#temporary-validation-file)）。

3. **保持旧的 HMAC 密钥处于活动状态**，直到所有正在进行的导出运行完成。两个凭证集在过渡窗口期间同时有效。
4. 一旦您确认没有正在进行的运行正在使用旧的 HMAC 密钥，请在 GCP 中删除它们。

有关完整详细信息，请参阅[Rotate destination credentials](/langsmith/data-export-destinations#rotate-destination-credentials)。

## 故障排除|症状|可能的原因 |修复 |
|---------|--------------|-----|
| `400 Access denied` 关于目的地创建 | HMAC 凭证缺乏写入权限 |验证服务帐户在存储桶上有`storage.objects.create` |
| `400 Key ID you provided does not exist` | HMAC 访问 ID 无效 |在 GCP 中重新生成 HMAC 密钥 |
| `400 Invalid endpoint` |端点 URL 格式错误 |准确使用`https://storage.googleapis.com`|
| BigQuery 表不显示任何行 |出口尚未完成 |使用`GET /api/v1/bulk-exports/{export_id}`检查导出状态 |
| BigQuery 分区修剪不起作用 |源 URI 前缀不正确 |确保源 URI 前缀在第一个分区键之前结束，例如`gs://BUCKET/PREFIX` |
| BigQuery 拾取 `tmp/` 文件 |广泛的文件路径 glob |在文件路径中使用 `export_id=*` 而不是 `*` |

有关其他错误代码和导出状态详细信息，请参阅[Monitor and troubleshoot bulk exports](/langsmith/data-export-monitor)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/big-query-bulk-export.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>