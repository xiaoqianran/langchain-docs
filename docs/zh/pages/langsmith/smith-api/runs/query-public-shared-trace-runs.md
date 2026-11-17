<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query public shared trace runs | https://docs.langchain.com/langsmith/smith-api/runs/query-public-shared-trace-runs -->

# 查询公共共享跟踪运行

/langsmith/langsmith-platform-openapi.json post /api/v2/public/{share_token}/runs/query
使用正文有效负载进行 GET — 未创建资源。 Returns all runs within the trace identified by the share token. The share token supplies the tenant, project, and trace scope.

Self-hosted deployments require LangSmith `v0.16` or later.