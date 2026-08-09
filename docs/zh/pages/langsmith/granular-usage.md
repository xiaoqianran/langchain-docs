<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Granular billable usage | https://docs.langchain.com/langsmith/granular-usage -->

# 细粒度的计费使用

检索按工作区、项目、用户或 API 密钥细分的详细跟踪和 LangSmith 部署使用数据。

<Note>
  **跟踪使用情况：** 对于 LangSmith [Cloud](/langsmith/cloud)，精细的可计费跟踪数据收集于 2026 年 1 月 5 日开始。在此日期之前提取的跟踪数据不可用。

  对于[Self-hosted](/langsmith/self-hosted)实例，当通过以下环境变量启用该功能时或在[upgrading to a version with it enabled by default](/langsmith/self-hosted-changelog#langsmith-0-13-12)之后，跟踪数据收集开始。

  ```env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  DEFAULT_ORG_FEATURE_ENABLE_GRANULAR_USAGE_REPORTING=true
  GRANULAR_USAGE_TABLE_ENABLED=true
  ```

  从自托管版本 0.16.0 开始，不再跟踪 [Self-hosted](/langsmith/self-hosted) 部署的长期跟踪使用情况。对于这些部署，**仅限长期**保留过滤器始终显示零结果。

  **LangSmith 部署使用** 使用单独的数据源。更多详情请参阅[LangSmith Deployment section](/langsmith/granular-usage#langsmith-deployment-usage-kind%3Dlangsmith_deployments)。
</Note>

LangSmith 提供精细的计费使用 API，可让您检索按工作区、项目、用户或 API 密钥细分的详细使用数据。同一端点支持两个计费域，通过 `kind` 查询参数选择：

* **跟踪使用**（`kind=traces`，默认）：摄取的跟踪数量。
* **LangSmith 部署使用** (`kind=langsmith_deployments`)：[LangSmith Deployment](/langsmith/billing) 的节点执行、代理运行和代理正常运行时间。两种类型共享相同的查询参数（时间范围、工作区过滤器、分组维度）并返回相同的时间桶形状。数据源是独立的，因此一种返回的记录不会出现在另一种中。

这些 API 使您能够：

* 跟踪不同团队或[workspaces](/langsmith/administration-overview)的使用情况。
* 识别哪些用户或[API keys](/langsmith/create-account-api-key#api-keys)消耗最多的痕迹或运行最多的代理。
* 分析一段时间内的使用模式。
* 导出使用数据以供内部报告。

## 先决条件

* 您必须拥有 [⟦T18⟧ permission](/langsmith/organization-workspace-operations) 才能访问精细的使用数据。
* 您只能查看您具有读取访问权限的工作区的使用情况。

## 在用户界面中查看

您还可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-granular-usage)中查看详细的使用数据：1. 导航至 **设置** > **计费和使用情况**
2. 选择 **粒度使用** 选项卡
3. 在 **LangSmith Traces** 和 **LangSmith Deployments** 子选项卡之间切换以查看每个域。活动子选项卡反映在 URL（`?tab=traces` 或 `?tab=deployments`）中，因此您可以为页面添加书签以登陆到同一视图上。
4. 使用控件来：
   * 选择时间范围（最近 7 天、30 天、3 个月、6 个月、1 年或自定义）
   * 按工作区、项目、用户或 API 密钥分组
   * 过滤到特定工作区
   * 在 **LangSmith Traces** 选项卡上，可选择按保留层筛选 (`All Retention` / `Long-lived only` / `Short-lived only`)
5. 单击 **导出 CSV** 以下载活动选项卡的数据。

时间范围和工作区过滤器在两个子选项卡之间共享，切换选项卡会保留您选择的内容。 **LangSmith 部署** 选项卡显示三张统计卡（执行的节点总数/代理运行总数/代理正常运行时间总数（秒））以及垂直堆叠的每个指标一张图表，因为这三个指标使用不同的单位。

## 查询参数

粒度使用端点接受以下查询参数：|参数|类型 |必填|描述 |
| ---------------- | -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `start_time` |日期时间 |是的 |时间范围的开始（ISO 8601 格式）。                                                                                   |
| `end_time` |日期时间 |是的 |时间范围结束。必须在`start_time`之后。                                                                           |
| `workspace_ids` | UUID 数组 |是的 |将结果过滤到特定工作区。                                                                                       |
| `kind` |字符串|没有 | `traces`（默认）或`langsmith_deployments`。选择计费域。                                                  |
| `group_by` |字符串|没有 |分组依据的维度。其中之一：`workspace`、`project`、`user`、`api_key`。默认值：`workspace`。                              || `trace_tier` |字符串|没有 |仅痕量截留过滤器：`longlived` 或 `shortlived`。省略所有保留。 `kind=langsmith_deployments` 时忽略。 |

### 日粒度合约

使用数据以天为粒度进行聚合。端点在 API 层将窗口标准化为全天：

* `start_time` 向下舍入至当天的 UTC 午夜。
* `end_time` 向上舍入到下一个 UTC 午夜（已在午夜时无操作）。
* 与请求窗口重叠的任何一天都包含在内。

因此，从 `2026-01-01T12:00:00Z` 到 `2026-01-02T12:00:00Z` 的 24 小时窗口会返回完整的 1 月 1 日和 1 月 2 日存储桶的使用情况。

### 跨步

每个响应中的`stride`字段指示用于聚合的时间桶大小，根据请求的时间范围计算。每天是最少的。子日窗犹斗一日。

|时间范围 |聚合|迈步|
| ----------------------- | ----------- | ----------- |
|长达 31 天 |每日 | `days: 1` |
| 32–93 天（~3 个月）|每周 | `days: 7` |
| 94–366 天（\~1 年）|每月 | `days: 30` |
|超过 366 天 |每年 | `days: 365` |

### 兼容性

`kind=langsmith_deployments` 与 `group_by=trace_tier` 结合返回 `400 Bad Request`。保留层仅适用于跟踪。## API 端点

```
GET /api/v1/orgs/current/billing/granular-usage
```

省略 `kind` 的现有调用者将继续以与以往相同的响应形状获取跟踪使用情况。

### 跟踪使用情况 (`kind=traces`)

#### 回应

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "stride": {
    "days": 1,
    "hours": 0
  },
  "usage": [
    {
      "time_bucket": "2026-01-15T00:00:00Z",
      "dimensions": {
        "workspace_id": "uuid",
        "workspace_name": "My Workspace"
      },
      "traces": 1500
    }
  ]
}
```

#### 示例：按工作区获取跟踪使用情况

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import httpx
  from datetime import datetime, timedelta, timezone

  client = httpx.Client(
      base_url="https://api.smith.langchain.com",
      headers={"x-api-key": "<your-api-key>"}
  )

  end_time = datetime.now(timezone.utc)
  start_time = end_time - timedelta(days=30)

  response = client.get(
      "/api/v1/orgs/current/billing/granular-usage",
      params={
          "start_time": start_time.isoformat(),
          "end_time": end_time.isoformat(),
          "workspace_ids": ["<workspace-id>"],
          "group_by": "workspace",
      },
  )

  data = response.json()
  for record in data["usage"]:
      print(f"{record['time_bucket']}: {record['traces']} traces")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const response = await fetch(
    `https://api.smith.langchain.com/api/v1/orgs/current/billing/granular-usage?` +
    new URLSearchParams({
      start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date().toISOString(),
      workspace_ids: "<workspace-id>",
      group_by: "workspace",
    }),
    {
      headers: {
        "x-api-key": "<your-api-key>",
      },
    }
  );

  const data = await response.json();
  for (const record of data.usage) {
    console.log(`${record.time_bucket}: ${record.traces} traces`);
  }
  ```

  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -X GET "https://api.smith.langchain.com/api/v1/orgs/current/billing/granular-usage?\
  start_time=2026-01-01T00:00:00Z&\
  end_time=2026-01-15T00:00:00Z&\
  workspace_ids=<workspace-id>&\
  group_by=workspace" \
    -H "x-api-key: <your-api-key>"
  ```
</CodeGroup>

#### 示例：获取用户的跟踪使用情况，仅过滤为长期保留

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  response = client.get(
      "/api/v1/orgs/current/billing/granular-usage",
      params={
          "start_time": start_time.isoformat(),
          "end_time": end_time.isoformat(),
          "workspace_ids": ["<workspace-id>"],
          "group_by": "user",
          "trace_tier": "longlived",
      },
  )

  data = response.json()
  for record in data["usage"]:
      user_email = record["dimensions"].get("user_email", "Unknown")
      print(f"{user_email}: {record['traces']} long-lived traces")
  ```
</CodeGroup>

### LangSmith 部署使用 (`kind=langsmith_deployments`)

每条记录都包含三个指标，因此一次获取即可为整个部署视图提供支持。

<Note>
  **LangSmith 部署使用情况** 与跟踪使用情况分开获取，并且可用于部署使用情况的完整保留窗口。

  对于自托管实例，部署使用端点是可选的。通过以下方式启用它：

  ```env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  REMOTE_METRICS_ROLLUP_ENABLED=true
  ```

  或者升级到默认启用它的 LangSmith 版本（请参阅[self-hosted changelog](/langsmith/self-hosted-changelog)）。
</Note>

#### 回应

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "stride": {
    "days": 1,
    "hours": 0
  },
  "usage": [
    {
      "time_bucket": "2026-01-15T00:00:00Z",
      "dimensions": {
        "workspace_id": "uuid",
        "workspace_name": "My Workspace"
      },
      "nodes_executed": 12500,
      "agent_runs": 320,
      "agent_uptime_seconds": 86400
    }
  ]
}
```|领域|描述 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nodes_executed` |时间段内执行的 LangGraph 节点总数。                                                                                                                                                                                      |
| `agent_runs` |时间段内代理运行总数（图形调用）。                                                                                                                                                                                || `agent_uptime_seconds` |总副本正常运行时间（以秒为单位）是跨部署副本的总和。用于开票的去重待机分钟数由计费管道单独计算；该字段是用于细分和分析的原始金额。 |

#### 示例：按工作区获取部署使用情况

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  response = client.get(
      "/api/v1/orgs/current/billing/granular-usage",
      params={
          "kind": "langsmith_deployments",
          "start_time": start_time.isoformat(),
          "end_time": end_time.isoformat(),
          "workspace_ids": ["<workspace-id>"],
          "group_by": "workspace",
      },
  )

  data = response.json()
  for record in data["usage"]:
      print(
          f"{record['time_bucket']}: "
          f"{record['nodes_executed']} nodes, "
          f"{record['agent_runs']} runs, "
          f"{record['agent_uptime_seconds']}s uptime"
      )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const response = await fetch(
    `https://api.smith.langchain.com/api/v1/orgs/current/billing/granular-usage?` +
    new URLSearchParams({
      kind: "langsmith_deployments",
      start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date().toISOString(),
      workspace_ids: "<workspace-id>",
      group_by: "workspace",
    }),
    {
      headers: {
        "x-api-key": "<your-api-key>",
      },
    }
  );

  const data = await response.json();
  for (const record of data.usage) {
    console.log(
      `${record.time_bucket}: ${record.nodes_executed} nodes, ` +
      `${record.agent_runs} runs, ${record.agent_uptime_seconds}s uptime`
    );
  }
  ```

  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -X GET "https://api.smith.langchain.com/api/v1/orgs/current/billing/granular-usage?\
  kind=langsmith_deployments&\
  start_time=2026-01-01T00:00:00Z&\
  end_time=2026-01-15T00:00:00Z&\
  workspace_ids=<workspace-id>&\
  group_by=workspace" \
    -H "x-api-key: <your-api-key>"
  ```
</CodeGroup>

## CSV 导出

```
GET /api/v1/orgs/current/billing/granular-usage/export
```

与数据端点相同的查询参数，包括`kind`。返回一个 CSV 文件，每个（时间段、维度）元组一行。所有维度列始终存在；仅填充与所选 `group_by` 匹配的列。

对于`kind=traces`，值列是`Traces`。对于 `kind=langsmith_deployments`，值列为 `Nodes Executed`、`Agent Runs` 和 `Agent Uptime (seconds)`。|专栏 |出现时间 |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
|时间桶开始|永远 |
|时间桶结束|永远 |
|工作区 ID/名称 |始终（在 `group_by=workspace` 时填充）|
|项目编号/名称 |始终（在 `group_by=project` 时填充）|
|用户 ID / 电子邮件 |始终（在 `group_by=user` 时填充）|
| API 密钥 短密钥 |始终（在 `group_by=api_key` 时填充）|
|痕迹| `kind=traces` |
|执行的节点/代理运行/代理正常运行时间（秒）| `kind=langsmith_deployments` |

值以 `=`、`+`、`-`、`@`、制表符或回车符开头的单元格带有制表符前缀，以中和 Excel/Google Sheets/LibreOffice 中的电子表格公式计算。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  response = client.get(
      "/api/v1/orgs/current/billing/granular-usage/export",
      params={
          "kind": "langsmith_deployments",
          "start_time": start_time.isoformat(),
          "end_time": end_time.isoformat(),
          "workspace_ids": ["<workspace-id>"],
          "group_by": "workspace",
      },
  )

  with open("deployment_usage_report.csv", "wb") as f:
      f.write(response.content)
  ```

  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -X GET "https://api.smith.langchain.com/api/v1/orgs/current/billing/granular-usage/export?\
  kind=langsmith_deployments&\
  start_time=2026-01-01T00:00:00Z&\
  end_time=2026-01-15T00:00:00Z&\
  workspace_ids=<workspace-id>&\
  group_by=workspace" \
    -H "x-api-key: <your-api-key>" \
    -o deployment_usage_report.csv
  ```
</CodeGroup>## 分组选项

`group_by` 参数决定如何聚合使用数据：

|价值|描述 |返回尺寸 |可用于 |
| ----------- | ------------------ | -------------------------------- | ------------- |
| `workspace` |按工作区分组 | `workspace_id`、`workspace_name` |两种 |
| `project` |按项目分组 | `project_id`、`project_name` |两种 |
| `user` |按用户分组 | `user_id`、`user_email` |两种 |
| `api_key` |按 API 密钥分组 | `api_key_short_key` |两种 |

对于跟踪使用，“项目”指的是[LangSmith tracer session](/langsmith/observability-concepts)。对于部署使用，“项目”是指 LangSmith 部署项目（已部署的代理）。

## 相关资源

* [Manage billing in your account](/langsmith/billing)
* [Organization and workspace operations](/langsmith/organization-workspace-operations)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/granular-usage.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>