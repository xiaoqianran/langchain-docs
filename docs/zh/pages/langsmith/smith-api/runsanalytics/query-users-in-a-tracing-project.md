<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query users in a tracing project | https://docs.langchain.com/langsmith/smith-api/runsanalytics/query-users-in-a-tracing-project -->

# 查询追踪项目中的用户

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/runs/users/query
使用正文有效负载进行 GET — 未创建资源。返回按最近匹配的已完成根运行排序的用户，并使用光标分页。成本和令牌使用情况汇总了携带用户的metadata.user_id 的窗口运行。活动窗口默认为 7 天，且不得超过 31 天。 Continuation保持固定的活动窗口但不提供快照；并发活动更改可能会导致跳过或重复用户。
统计信息尚不可用的用户的 stats_status=pending 且 trace_count 和 error_count 为空。再次查询，获取统计数据； stats_status=ready 表示统计数据已返回，但它们可能仍滞后于最近的活动。其他不可用的指标被省略。后端查询失败仍然返回错误。