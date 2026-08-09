<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get granular usage | https://docs.langchain.com/langsmith/smith-api/orgs/get-granular-usage -->

# 获取精细的使用情况

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/orgs/current/billing/capsular-usage
通过灵活的分组获取精细的使用情况数据。

`kind` 选择计费使用域：
- `traces`（默认）：跟踪计数。
- `langsmith_deployments`：LangSmith 部署指标（节点
  执行、代理运行、代理正常运行时间）。三个部署字段
  已填充且 `traces` 为 `0`。

`trace_tier`（仅对`kind=traces`有意义）选择性限制
结果为单一保留层（长期 = 延长保留期，
短暂=标准保留）。当`group_by=trace_tier`时，结果
每个保留层每个时间段分为一条记录。

`workspace_ids` 将结果过滤到指定的工作区。仅
包括用户具有读取访问权限的工作区。当省略时，所有
包括用户可以读取的工作区（避免枚举每个
URL 中的工作区 ID，可能超出代理标头限制）。