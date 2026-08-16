<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: View trace counts across your organization | https://docs.langchain.com/langsmith/self-host-organization-charts -->

# 查看整个组织的跟踪计数

<Note>
此功能在 Helm Chart 0.9.5 及更高版本中可用。
</Note>

LangSmith 自动生成并同步自托管安装的组织使用图表。

这些图表可在 `Settings > Usage and billing > Usage graph` 下找到：

* 按工作空间使用：这按工作空间计算跟踪（根运行）
* 组织使用情况：这对组织的所有跟踪（根运行）进行计数

图表每 5 分钟刷新一次，以包含任何新的工作区。请注意，图表不可编辑。

## 以编程方式获取跟踪计数

您可以使用两种不同的方法以编程方式检索跟踪计数：

### 方法一：使用LangSmith REST API

如果您的自托管安装使用在线密钥，则可以使用 [LangSmith REST API](/langsmith/smith-api/orgs/get-org-usage) 获取组织使用数据。

```bash
curl -X GET "https://your-langsmith-instance.com/api/v1/orgs/current/billing/usage" \
  -H "Accept: application/json" \
  -H "X-API-Key: your-api-key" \
  -G \
  -d "starting_on=2025-09-01T00:00:00Z" \
  -d "ending_before=2025-10-01T00:00:00Z" \
  -d "on_current_plan=true"
```

### 方法2：使用PostgreSQL支持查询

对于使用离线密钥的安装或当您需要更详细的导出功能时，您可以直接针对 PostgreSQL 数据库运行支持查询。所有可用的脚本都在[support queries repository](https://github.com/langchain-ai/helm/tree/main/charts/langsmith/scripts/support_queries/postgres)中。

```bash
sh run_support_query_pg.sh "postgres://postgres:postgres@localhost:5432/postgres" \
  --input support_queries/postgres/pg_get_historic_trace_counts_daily.sql \
  --output trace_counts.csv
```

有关运行支持查询的更多详细信息，请参阅 [Run support queries against PostgreSQL](/langsmith/script-running-pg-support-queries) 指南。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-organization-charts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>