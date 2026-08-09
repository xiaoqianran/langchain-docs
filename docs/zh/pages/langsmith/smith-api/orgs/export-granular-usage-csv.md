<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Export granular usage csv | https://docs.langchain.com/langsmith/smith-api/orgs/export-granular-usage-csv -->

# 导出粒度使用 csv

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/orgs/current/billing/capsular-usage/export
将精细使用数据导出为 CSV。

`kind` 语义与 `/granular-usage` 相同。 CSV 的值列
因种类而异：
- `traces`：单`Traces` 列。
- `langsmith_deployments`: `Nodes Executed`, `Agent Runs`,
  `Agent Uptime (seconds)` 列。
不同类型的维度列是相同的。