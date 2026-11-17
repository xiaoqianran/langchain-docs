<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query traces | https://docs.langchain.com/langsmith/smith-api/runs/query-traces -->

# 查询轨迹

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/traces/query
返回单个跟踪项目的跟踪（根运行）的分页列表。每个项目都包含跟踪的根运行以及 `trace_aggregates` 下的可选跟踪范围聚合（`total_tokens`、`total_cost`、`first_token_time`），因此客户端永远不必按 `trace_id` 进行合并。

跟踪在`start_time`窗口内扫描：`min_start_time`默认为请求前24小时，`max_start_time`默认为请求时间。明确设置以加宽或缩小窗口。

支持过滤器（`trace_filter`、`tree_filter`）、光标分页（`cursor`）和字段投影（`selects`）。

`ai_search` 不能与`sem_filter` 组合使用。启用完整的人工智能搜索后，`ai_search`将自然语言转换为查询过滤器和时间范围，并且不能与显式过滤器表达式组合。否则，`ai_search` 保留遗留的纯语义行为。使用 `sem_filter` 与结构化过滤器相结合进行纯语义匹配。人工智能搜索需要组织同意。
当需要语义匹配时，需要`Accept: text/event-stream`；没有它的请求将返回 406。AI 搜索在将查询路由到 v1 后端并在那里返回 501 的部署中不可用。

自托管部署需要 LangSmith `v0.16` 或更高版本。