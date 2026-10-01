<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete runs | https://docs.langchain.com/langsmith/smith-api/run/delete-runs -->

# 删除运行

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/runs/delete
DELETE with body Payload — 删除请求有效负载标识的运行。

按跟踪 ID 删除运行，或删除某个时间范围内的每次运行。

提供 `session_id` 和 `trace_ids` 以删除已知的跟踪列表，或者
`metadata` 与 `start_time` 删除当时匹配的痕迹
继续。添加`end_time`来限制范围；两个边界都设置了 `metadata`
是可选的，省略它会删除该范围内开始的所有跟踪。