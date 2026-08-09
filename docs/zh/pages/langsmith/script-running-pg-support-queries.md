<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run support queries against PostgreSQL | https://docs.langchain.com/langsmith/script-running-pg-support-queries -->

# 针对 PostgreSQL 运行支持查询

此 Helm 存储库包含用于生成 LangSmith UI 当前不直接支持的输出的查询（例如，在单个查询中获取多个组织的跟踪计数）。

此命令采用包含嵌入名称和密码（可以从对机密管理器的调用中传递）的 PostgreSQL 连接字符串，并从输入文件执行查询。以下示例使用 `support_queries/postgres` 目录中的 `pg_get_historic_trace_counts_daily.sql` 输入文件。

## 先决条件

确保您准备好以下工具/物品。

1.kubectl

   * [https://kubernetes.io/docs/tasks/tools/](https://kubernetes.io/docs/tasks/tools/)

2.PostgreSQL客户端

   * [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

3.PostgreSQL数据库连接：

   * 主持人
   * 端口
   * 用户名
     * 如果使用捆绑版本，则为`postgres`
   * 密码
     * 如果使用捆绑版本，则为`postgres`
   * 数据库名称
     * 如果使用捆绑版本，则为`postgres`

4. 从将运行迁移脚本的计算机连接到 PostgreSQL 数据库。

   * 如果您使用捆绑版本，您可能需要将 postgresql 服务端口转发到您的本地计算机。
   * 运行 `kubectl port-forward svc/langsmith-postgres 5432:5432` 将 postgresql 服务端口转发到本地计算机。5. 运行支持查询的脚本

   * 下载[PostgreSQL support query script](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/scripts/run_support_query_pg.sh)

## 运行查询脚本

运行以下命令来运行所需的查询：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh <postgres_url> --input path/to/query.sql
```

例如，如果您使用带有端口转发的捆绑版本，则命令可能如下所示：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh "postgres://postgres:postgres@localhost:5432/postgres" --input support_queries/postgres/pg_get_historic_trace_counts_daily.sql
```

这将按工作区 ID 和组织 ID 输出每日跟踪计数。要将其提取到文件中，请添加标志 `--output path/to/file.csv`

## 导出使用数据

所有导出方法都会生成相同的数据：所有工作区和组织中的 LangSmith 跟踪计数、LangSmith 部署节点使用情况以及队列运行计数。

<Note>
  UI 和 API 导出需要以下两项：

  * `organization:manage` 许可。
  * 来电者的电子邮件必须在`USAGE_EXPORT_ADMIN_EMAILS`中列出，或者`ORG_ADMINS_INSTALLATION_USAGE_EXPORT_ENABLED`必须设置为`true`。

  ```env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  USAGE_EXPORT_ADMIN_EMAILS='["admin@example.com", "admin2@example.com"]'
  ORG_ADMINS_INSTALLATION_USAGE_EXPORT_ENABLED=true
  ```
</Note>

### 从 UI 导出（推荐）

1. 导航到 **设置** > **使用情况和计费** > **使用情况导出**。
2. 单击**导出使用情况数据**。
3. 将下载包含所有使用数据的 ZIP 文件。

### 通过API导出

如果您更喜欢以编程方式导出使用情况数据，可以直接调用导出 API 端点。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -OJ \
  -H "X-API-Key: <your_api_key>" \
  https://<langsmith_url>/api/v1/orgs/current/usage/backfill-export
```

### 通过 SQL 脚本导出您还可以直接针对 PostgreSQL 数据库运行 SQL 脚本以导出使用数据。这需要数据库访问凭据 - 不适用应用程序级权限。

导出跟踪使用情况（需要 Helm 图表版本 0.11.4 或更高版本）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh <postgres_url> \
  --input support_queries/postgres/pg_usage_traces_full_export.sql \
  --output ls_export.csv
```

导出节点使用情况（需要 Helm 图表版本 0.11.4 或更高版本）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh <postgres_url> \
  --input support_queries/postgres/pg_usage_nodes_full_export.sql \
  --output lgp_export.csv
```

要导出队列运行计数（需要 Helm 图表版本 0.13.25 或更高版本）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh <postgres_url> \
  --input support_queries/postgres/pg_usage_agent_builder_full_export.sql \
  --output ab_export.csv
```

导出使用情况快照（每日实体计数，例如工作区、项目、数据集、提示和活动用户）：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sh run_support_query_pg.sh <postgres_url> \
  --input support_queries/postgres/pg_usage_snapshots_full_export.sql \
  --output usage_snapshots_export.csv
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/script-running-pg-support-queries.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>