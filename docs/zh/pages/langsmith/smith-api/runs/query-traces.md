<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query traces | https://docs.langchain.com/langsmith/smith-api/runs/query-traces -->

# 查询轨迹

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/traces/query
返回单个跟踪项目的跟踪（根运行）的分页列表。每个项目都包含跟踪的根运行以及 `trace_aggregates` 下的可选跟踪范围聚合（`total_tokens`、`total_cost`、`first_token_time`），因此客户端永远不必按 `trace_id` 进行合并。

跟踪在`start_time`窗口内扫描：`min_start_time`默认为请求前24小时，`max_start_time`默认为请求时间。明确设置以加宽或缩小窗口。

支持过滤器（`trace_filter`、`tree_filter`）、光标分页（`cursor`）和字段投影（`selects`）。

自托管部署需要 LangSmith `v0.16` 或更高版本。