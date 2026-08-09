<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bulk export trace data | https://docs.langchain.com/langsmith/data-export -->

# 批量导出跟踪数据

以 Parquet 格式将 LangSmith 跟踪数据导出到与 S3 兼容的存储桶。

<Info>
  **适用计划限制**

  对于2026年8月3日之后注册的客户，批量导出仅适用于[LangSmith Enterprise plan](https://www.langchain.com/pricing-langsmith)。在 2026 年 8 月 3 日或之前注册的客户可以在 2027 年 2 月 1 日之前使用 Plus 或 Enterprise 套餐的批量导出功能。
</Info>

LangSmith 的批量数据导出功能可让您以 [Parquet](https://parquet.apache.org/docs/overview/) 格式将跟踪数据从特定项目和日期范围导出到 S3 兼容存储桶，与 [Run data format](/langsmith/run-data-format) 中的字段匹配。这对于 BigQuery、Snowflake、Redshift 或 Jupyter Notebooks 等工具中的离线分析非常有用。

本页介绍如何：

* 创建导出目的地
* 创建和配置导出作业，包括计划导出和字段过滤
* 监控导出进度

**开始之前：** 导出可能需要一些时间，具体取决于数据量，并且 LangSmith 限制了可以同时运行的导出数量。批量导出有 72 小时的运行时超时 - 有关详细信息，请参阅[Automatic retry behavior](/langsmith/data-export-monitor#automatic-retry-behavior)。一旦启动，LangSmith 就会自动处理编排和[resilience of the export process](/langsmith/data-export-monitor#failure-modes-and-retry-policy)。

## 1. 创建目的地目的地告诉 LangSmith 将导出的数据写入何处。在提出此请求之前，您需要：

* 您的 [LangSmith API key](/langsmith/create-account-api-key) 和 [workspace ID](/langsmith/set-up-hierarchy#set-up-a-workspace)。
* 向 LangSmith 授予**写入访问权限**的 S3 或 S3 兼容存储桶（请参阅[Permissions required](/langsmith/data-export-destinations#permissions-required)）。
* 存储桶名称、前缀以及 AWS 区域（对于 AWS S3）或终端节点 URL（对于 GCS、MinIO 或其他 S3 兼容提供商）。
* 存储桶的访问密钥和秘密密钥。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/destinations' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "destination_type": "s3",
    "display_name": "My S3 Destination",
    "config": {
      "bucket_name": "your-s3-bucket-name",
      "prefix": "root_folder_prefix",
      "region": "your aws s3 region",
      "endpoint_url": "your endpoint url for s3 compatible buckets"
    },
    "credentials": {
      "access_key_id": "YOUR_S3_ACCESS_KEY_ID",
      "secret_access_key": "YOUR_S3_SECRET_ACCESS_KEY"
    }
  }'
```

凭证以加密形式安全存储。 API 将在保存之前验证目标和凭据是否有效。如果请求失败，请参考[Debug destination errors](/langsmith/data-export-destinations#debug-destination-errors)。

保存响应中的`id`；创建导出作业时您将需要它。

请参阅 [Manage bulk export destinations](/langsmith/data-export-destinations) 了解权限设置、特定于提供商的配置（AWS S3、GCS、MinIO）和凭证选项。

## 2. 创建导出作业

导出作业以项目（或工作区中的所有实验）和日期范围为目标。您将需要：

* 从[previous step](#1-create-a-destination)前往目的地`id`。
* 项目 ID (`session_id`) 或 `"all_experiments": true` — 从 [**Tracing Projects** list](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-data-export) 中的单个项目视图复制项目 ID。
* UTC ISO 8601 格式的 `start_time` 和 `end_time`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "your_destination_id",
    "session_id": "project_uuid",
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-01-03T00:00:00Z",
    "format_version": "v2_beta"
  }'
````start_time` 包含在内，`end_time` 包含在内。导出将包括 `run.start_time >= start_time` 和 `run.start_time < end_time` 的所有运行。

保存响应中的`id`以监控导出进度。

您可以选择添加 `filter` 表达式来缩小导出的运行集。请参阅我们的 [filter query language](/langsmith/trace-query-syntax#filter-query-language) 和 [examples](/langsmith/export-traces#use-filter-query-language) 了解语法。不设置 `filter` 字段将导出所有运行。

<Note>
  **LangSmith 云限制：每个工作区每小时 250 个批量导出创建**

  在 [LangSmith cloud](/langsmith/cloud) 上，每个工作区每小时最多可以创建 250 个批量导出。该预算包括一次性导出和由 [scheduled bulk exports](#schedule-recurring-exports) 生成的导出，因此具有许多活动计划的工作区会自动消耗部分每小时预算。

  如果您的工作区达到限制，新的创建请求将被拒绝并返回 429，直到较早的创建时间超过滚动 60 分钟窗口。要提高限制，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。

  [Self-hosted LangSmith](/langsmith/self-hosted) 默认情况下不强制执行此限制。
</Note>

### 导出所有实验

<Note>
  [Self-hosted](/langsmith/self-hosted)：目前仅适用于`v0.16.1rc1` [preview release](/langsmith/release-versions#preview)。在生产环境中运行之前，请等待 `v0.16.1` 稳定版本。
</Note>要导出工作区中的每个实验而不是使用 `session_id` 定位单个项目，请设置 `all_experiments: true`。每当您对数据集运行评估时，LangSmith 都会创建一个实验，任何具有 `reference_dataset_id` 集的跟踪项目都符合条件。

`all_experiments` 和 `session_id` 互斥 — 设置为 1。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "your_destination_id",
    "all_experiments": true,
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-02-01T00:00:00Z",
    "format_version": "v2_beta"
  }'
```

LangSmith 在运行时解析实验会话集，因此导出会选取您在提交作业后但在协调器开始处理之前创建的任何实验。

相同的 `all_experiments` 标志适用于 [scheduled exports](#schedule-recurring-exports) — 包括 `interval_hours` 并省略 `end_time`，而不是提供 `end_time`。

<Note>
  **云限制：每次导出 250 个实验**

  在[LangSmith cloud](/langsmith/cloud)上，每个`all_experiments`导出最多包含250个实验。要导出更多：

  * 查询已完成的`all_experiments`导出以查看包含哪些跟踪项目，然后使用`session_id`为其余实验创建标准批量导出。
  * 或者，通过 [support.langchain.com](https://support.langchain.com) 联系支持人员，请求更高的工作空间限制。

  [Self-hosted LangSmith](/langsmith/self-hosted) 没有每次出口限制。
</Note>

### 安排定期导出

<Note>
  需要 LangSmith Helm 版本 >= `0.10.42`（应用程序版本 >= `0.10.109`）
</Note>计划导出收集定期运行并导出到配置的目标。要创建计划导出，请包含 `interval_hours` 并省略 `end_time`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "your_destination_id",
    "session_id": "project_uuid",
    "start_time": "2024-01-01T00:00:00Z",
    "interval_hours": 1,
    "format_version": "v2_beta"
  }'
```

* `interval_hours` 必须介于 1 和 168（1 周）之间（含 1 和 168）。
* 对于定期出口，必须省略`end_time`；一次性出口仍然需要它。
* 每个生成的导出都涵盖 `start_time` 到 `start_time + interval_hours`，然后在每次后续运行中前进 `interval_hours`。由于`end_time`是独占的，连续导出不会重叠。
* 生成的导出以 `end_time + 10 minutes` 运行，以考虑最近使用 `end_time` 提交的运行。
* 生成的导出已填充 `source_bulk_export_id` 属性。如果需要，必须单独取消它们 - 取消源导出**不会**取消已生成的导出。
* 要停止计划导出，[cancel it](/langsmith/data-export-monitor#stop-an-export)。

<Note>
  **LangSmith 云限制：每个工作区 200 个计划批量导出**

  在 [LangSmith cloud](/langsmith/cloud) 上，每个工作区一次最多可以有 200 个活动**计划**（重复）批量导出。即，使用 `interval_hours` 值配置的导出。该限制限制了**计划**的数量，而不是它们运行的​​次数：已生成数千次历史导出运行的计划仍算作一次。一次性（非经常性）批量出口不受此限制。

  如果您的工作空间达到限制，新计划的导出请求将被拒绝，并显示 `429`，直到您 [cancel](/langsmith/data-export-monitor#stop-an-export) 现有计划。要提高限制，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。

  [Self-hosted LangSmith](/langsmith/self-hosted) 默认情况下不强制执行此限制。
</Note>

**示例**

如果使用 `start_time=2025-07-16T00:00:00Z` 和 `interval_hours=6` 创建计划批量导出：

|出口|开始时间 |结束时间 |运行于 |
| ------ | -------------------- | -------------------- | -------------------- |
| 1 | 2025-07-16T00:00:00Z | 2025-07-16T06:00:00Z | 2025-07-16T06:10:00Z |
| 2 | 2025-07-16T06:00:00Z | 2025-07-16T12:00:00Z | 2025-07-16T12:10:00Z |
| 3 | 2025-07-16T12:00:00Z | 2025-07-16T18:00:00Z | 2025-07-16T18:10:00Z |

### 限制导出字段

<Note>
  需要 LangSmith Helm 版本 >= `0.12.11`（应用程序版本 >= `0.12.42`）。支持一次性导出和定期导出。
</Note>

您可以通过使用 `export_fields` 参数限制包含哪些字段来提高导出速度并减小文件大小。如果省略 `export_fields`，则包含除 `feedbacks` 之外的所有字段。反馈评论是可选的。要包含它们，请将 `feedbacks` 以及其他相关字段显式添加到 `export_fields`。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "bulk_export_destination_id": "your_destination_id",
    "session_id": "project_uuid",
    "start_time": "2024-01-01T00:00:00Z",
    "end_time": "2024-01-03T00:00:00Z",
    "export_fields": ["id", "name", "run_type", "start_time", "end_time", "status", "total_tokens", "total_cost"],
    "format_version": "v2_beta"
  }'
```

<Tip>
  排除 `inputs` 和 `outputs` 可以显着提高导出性能并减小文件大小，特别是对于大型运行。仅当您需要进行分析时才包含这些字段。
</Tip>

### 压缩

设置 `compression` 字段来控制导出的 Parquet 文件的压缩方式。当省略时，LangSmith 使用 `zstandard`。

允许的值：`zstandard`、`gzip`、`snappy`、`none`。加载到 BigQuery 时使用 `snappy`，请参阅 [Export trace data to BigQuery](/langsmith/big-query-bulk-export)。

<Note>
  在[Self-hosted LangSmith](/langsmith/self-hosted)上，默认为`gzip`。设置 `FF_BULK_EXPORT_DEFAULT_COMPRESSION` 环境变量以更改默认值。
</Note>

### 可导出字段

默认情况下，批量导出包含每次运行的以下字段：

**标识符和层次结构：**|领域|描述 |
| ---------------------- | ---------------------------------------------------- |
| `id` |运行 ID |
| `tenant_id` |工作区/租户 ID |
| `session_id` |项目/会话 ID |
| `trace_id` |跟踪 ID |
| `parent_run_id` |家长跑步ID |
| `parent_run_ids` |所有父运行 ID 的列表 |
| `reference_example_id` |如果数据集的一部分，请参考示例 |

**基本元数据：**|领域 |描述 |
| -------------- | ------------------------------------------------------ |
| `name` |运行名称 |
| `run_type` |运行类型（例如“链”、“llm”、“工具”）|
| `start_time` |开始时间戳 (UTC) |
| `end_time` |结束时间戳 (UTC) |
| `status` |运行状态（例如“成功”、“错误”）|
| `is_root` |这是否是根级别运行 |
| `dotted_order` |分层排序字符串 |
| `trace_tier` |跟踪层/保留级别 |

**运行数据：**

|领域 |描述 |
| ---------| ----------------------- |
| `inputs` |运行输入 (JSON) |
| `outputs` |运行输出 (JSON) |
| `error` |如果失败，会出现错误消息 |
| `extra` |额外元数据 (JSON) |
| `events` |运行事件 (JSON) |

**标签和反馈：**|领域 |描述 |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `tags` |标签列表 |
| `feedback_stats` |反馈统计（JSON）。有关聚合限制，请参阅以下注释。 |
| `feedbacks` |反馈意见和键 (JSON) |

<Note>
  **`feedback_stats`聚合限制**

  `feedback_stats` 字段仅包含字符串类型反馈的值细分。非字符串值（数字、布尔值、复杂类型）的反馈不包括在这些细分中。要分析非字符串反馈值，请单独导出原始反馈数据。
</Note>

**代币使用和成本：**|领域 |描述 |
| ------------------- | ---------------------- |
| `total_tokens` |代币总数 |
| `prompt_tokens` |提示令牌计数 |
| `completion_tokens` |完成令牌计数 |
| `total_cost` |总成本|
| `prompt_cost` |即时费用 |
| `completion_cost` |竣工成本|
| `first_token_time` |第一个代币的时间 |

### 分区方案

使用以下 Hive 分区结构将数据导出到您的存储桶中：

```
<bucket>/<prefix>/export_id=<export_id>/tenant_id=<tenant_id>/session_id=<session_id>/runs/year=<year>/month=<month>/day=<day>
```

## 3. 监控您的出口

使用 [previous step](#2-create-an-export-job) 中的 `id` 轮询导出状态：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request GET \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/{export_id}' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID'
```

响应中的 `status` 字段将为 `CREATED`、`RUNNING`、`COMPLETED`、`FAILED`、`CANCELLED` 或 `TIMEDOUT` 之一。导出可能需要一些时间，具体取决于数据量。一旦状态为 `COMPLETED`，Parquet 文件就在您的存储桶中可用。

请参阅 [Monitor and troubleshoot bulk exports](/langsmith/data-export-monitor) 了解如何列出运行、停止导出和诊断故障。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-export.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>