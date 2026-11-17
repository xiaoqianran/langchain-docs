<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query threads | https://docs.langchain.com/langsmith/smith-api/threads/query-threads -->

# 查询线程

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/threads/query
使用正文有效负载进行 GET — 未创建资源。返回跟踪项目中与作为请求负载传递的查询匹配的线程。
结果按给定时间范围和可选过滤器进行过滤，并使用基于光标的分页。

`ai_search` 不能与 `sem_filter` 组合。启用完整的人工智能搜索后，`ai_search`将自然语言转换为查询过滤器和时间范围，并且不能与显式过滤器表达式组合。否则，`ai_search` 保留遗留的纯语义行为。使用 `sem_filter` 与结构化过滤器相结合进行纯语义匹配。人工智能搜索需要组织同意。
当需要语义匹配时，需要`Accept: text/event-stream`；没有它的请求将返回 406。AI 搜索在将查询路由到 v1 后端并在那里返回 501 的部署中不可用。

自托管部署需要 LangSmith `v0.16` 或更高版本。