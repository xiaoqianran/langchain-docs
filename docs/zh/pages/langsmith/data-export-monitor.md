<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor and troubleshoot bulk exports | https://docs.langchain.com/langsmith/data-export-monitor -->

# 监控批量导出并排除故障

获得 [created an export job](/langsmith/data-export#2-create-an-export-job) 后，您可以使用此页面上的 API 来跟踪其进度、检查各个运行并在需要时停止它。本页还介绍了 LangSmith 如何自动处理失败，以及在用尽重试后导出失败时该怎么做。

此页面涵盖：

- [Monitoring export status](#monitor-export-status) 和 [listing runs](#list-runs-for-an-export) 用于特定导出。
- [Listing all exports](#list-all-exports) 在您的工作空间中。
- [Stopping an export](#stop-an-export)。
- [Failure modes and retry policy](#failure-modes-and-retry-policy)，包括自动重试行为、故障场景、状态生命周期、并发限制和进度跟踪。
- [Troubleshooting failed exports](#troubleshooting-failed-exports)。

<Note>
**对于自托管、GCP EU、GCP APAC 和 AWS US SaaS**

更新以下自托管安装、GCP EU (`eu.api.smith.langchain.com`)、GCP APAC (`apac.api.smith.langchain.com`) 或 AWS US (`aws.api.smith.langchain.com`) 请求中的 LangSmith URL。
</Note>

## 监控导出状态

要监控导出作业的状态，请使用以下 cURL 命令：

```bash
curl --request GET \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/{export_id}' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID'
```

将 `{export_id}` 替换为您要监控的导出的 ID。此命令检索指定导出作业的当前状态。

## 列出导出的运行

导出通常分为多个运行，这些运行对应于要导出的特定日期分区。
要列出与特定导出关联的所有运行，请使用以下 cURL 命令：

```bash
curl --request GET \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/{export_id}/runs' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID'
```此命令获取与指定导出相关的所有运行，提供运行 ID、状态、创建时间、导出的行等详细信息。

## 列出所有导出

要检索所有导出作业的列表，请使用以下 cURL 命令：

```bash
curl --request GET \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID'
```

此命令返回所有导出作业的列表及其当前状态和创建时间戳。

## 停止导出

要停止现有导出，请使用以下 cURL 命令：

```bash
curl --request PATCH \
  --url 'https://api.smith.langchain.com/api/v1/bulk-exports/{export_id}' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'X-Tenant-Id: YOUR_WORKSPACE_ID' \
  --data '{
    "status": "Cancelled"
}'
```

将 `{export_id}` 替换为您要取消的导出的 ID。请注意，作业一旦取消就无法重新启动，
您将需要创建一个新的导出作业。

## 失败模式和重试策略

LangSmith 批量导出自动处理瞬时故障和基础设施问题，以确保弹性。

每个批量导出都分为多个_runs_，其中每个运行处理[specific date partition](/langsmith/data-export#partitioning-scheme)的数据（通常按天组织）。运行是独立处理的，这使得：

- 不同时间段的并行处理。
- 每次运行的独立重试逻辑。
- 如果中断，则从特定检查点恢复。导出中的每个运行（日期范围）都有自己的 [failure handling](#failure-scenarios) 和 [retry budget](#automatic-retry-behavior)。如果在用尽所有重试后运行失败，则整个导出将标记为 `FAILED`。

### 自动重试行为

导出作业会自动重试暂时性失败，并具有以下行为：

- **最大重试次数**：每次运行 20 次重试（可能会发生变化）。
- **重试延迟**：两次尝试之间间隔 30 秒（固定，无指数退避）。
- **运行超时**：每次运行最多 4 小时。
- **总体工作流程超时**：整个导出为 72 小时。

### 失败场景|故障类型|原因 |自动重试？ |需要采取行动|
|--------------|--------|------------------|-----------------|
| **基础设施中断** | [Deployments](/langsmith/deployment)，服务器重启，worker崩溃 |是的，自动重新排队并进行剩余的重试。 |没有，作业会自动恢复。 |
| **运行超时** |单次运行超过4小时限制 |是的，最多重试 20 次（可能会发生变化）。 |如果持续存在，缩小日期范围，请添加过滤器，或[limit the exported fields](/langsmith/data-export#limit-exported-fields)。 |
| **工作流程超时** |全程出口超过72小时 |没有 |缩小导出范围（日期范围、过滤器）或分成较小的导出。 |
| **存储/目的地错误** | [Invalid credentials](/langsmith/data-export-destinations#credentials-configuration)、[missing bucket](/langsmith/data-export-destinations#configuration-fields)、[permission issues](/langsmith/data-export-destinations#permissions-required) |没有 |修复目标配置并创建新的导出。 |
| **目的地已删除** |出口过程中铲斗被移除 |没有 |重新创建目标并重新启动导出。 |
| **终端处理错误** |数据序列化问题，资源耗尽 |是的，最多重试 20 次（可能会发生变化）。 |检查运行错误详细信息；可能需要调查。 |

<Note>
任何单次运行失败（在所有重试都用尽之后）都会导致整个导出失败。
</Note>

### 导出状态生命周期

导出可以有以下状态：|状态 |描述 |
|--------|-------------|
| `CREATED` |导出已创建但尚未开始处理。 |
| `RUNNING` |导出正在积极处理运行。 |
| `COMPLETED` |所有运行均已成功导出。 |
| `FAILED` |一次或多次运行在用尽重试后失败。 |
| `CANCELLED` |导出已被用户手动取消。 |
| `TIMEDOUT` |导出超出了 48 小时工作流程超时。 |

各个运行可以具有相同的可能状态：`CREATED`、`RUNNING`、`COMPLETED`、`FAILED`、`CANCELLED` 或 `TIMEDOUT`。

### 并发和速率限制

为保证系统稳定性，导出受到以下限制：

- **每次导出的最大并发运行数**：45
- **每个工作区最大并发导出**：15

如果您正在运行多个导出，新的运行作业将排队，直到容量可用。

#### 自托管：调整批量导出并发性和负载大小

在 [LangSmith Self-hosted](/langsmith/self-hosted) 上，并发限制是默认值。要在批量导出期间调整 Pod 内存使用情况，请在 `langsmith-backend` 服务上配置以下环境变量：|环境变量 |默认 |描述 |
|---|---|---|
| `BULK_EXPORT_MAX_CONCURRENT_RUNS` | `5` |每个调度阶段在单个导出中并行排队的分区运行的最大数量。处理大型日期分区时减少内存以限制峰值内存。 |
| `DATA_EXPORT_RUN_LIMIT` | `500` |在导出窗口中分页时，从每个查询的运行存储中获取的页面大小（最大行数）。 |
| `DATA_EXPORT_MAX_BATCH_PAYLOAD_SIZE_KB` | `100000` (100 MB) |在导出运行期间刷新批次之前的最大累积负载大小 (KB)。减少以降低每个批次的内存占用量。 |

**示例：内存受限部署的保守设置**

```yaml
# In your Helm values
BULK_EXPORT_MAX_CONCURRENT_RUNS: "10"
DATA_EXPORT_RUN_LIMIT: "5"
DATA_EXPORT_MAX_BATCH_PAYLOAD_SIZE_KB: "512"
```

降低这些值会降低并行性，并可能增加总导出时间，但会降低每个 Pod 的峰值内存使用量。如果您在内存受限的节点上遇到内存不足 (OOM) 错误，这些设置可以提供帮助。

### 进度跟踪和可恢复性

导出系统维护每次运行的详细进度元数据：
- 数据流中的最新光标位置。
- 导出的行数。
- 写入的 Parquet 文件列表。这种进度跟踪可以：
- **优雅恢复**：如果运行被中断（例如，通过部署），它将从最后一个检查点恢复，而不是重新开始。
- **进度监控**：跟踪通过 API 导出的数据量。
- **高效重试**：失败的运行不会重新导出已成功写入的数据。

### 导出失败故障排除

如果导出失败，请按照下列步骤操作：

1. **查看导出状态**：使用[⟦T30⟧ endpoint](/langsmith/smith-api/bulk-exports/get-bulk-export)检索导出详情和状态。
2. **查看运行错误**：您可以使用[List Runs API](#list-runs-for-an-export)监控您的运行。每次运行都包含一个 `errors` 字段，其中包含通过重试尝试键入的详细错误消息（例如，`retry_0`、`retry_1`）。
3. **验证目的地访问**：确保您的[destination bucket](/langsmith/data-export-destinations#configuration-fields)仍然存在并且[credentials](/langsmith/data-export-destinations#credentials-configuration)有效。
4. **检查运行大小**：如果您看到超时错误，则您的日期分区可能包含太多数据。可能对[limit the exported fields](/langsmith/data-export#limit-exported-fields)有帮助。
5. **检查系统限制**：确保您没有达到 [concurrency limits](#concurrency-and-rate-limits)（每次导出 5 次运行，每个工作区 3 次导出）。

对于与存储相关的错误，您可以在重试导出之前使用 AWS CLI 或 gsutil 测试目标配置。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-export-monitor.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>