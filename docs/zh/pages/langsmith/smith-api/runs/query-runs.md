<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query runs | https://docs.langchain.com/langsmith/smith-api/runs/query-runs -->

# 查询运行

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/runs/query
返回给定项目在最小/最大开始时间内运行的分页列表。支持过滤器、光标分页和`selects`选择要返回的字段。

`ai_search` 不能与`sem_filter` 组合。启用完整的人工智能搜索后，`ai_search`将自然语言转换为查询过滤器和时间范围，并且不能与显式过滤表达式组合。否则，`ai_search` 保留遗留的纯语义行为。使用 `sem_filter` 与结构化过滤器相结合进行纯语义匹配。人工智能搜索需要组织同意。
当需要语义匹配时，需要`Accept: text/event-stream`；没有它的请求将返回 406。AI 搜索在将查询路由到 v1 后端并在那里返回 501 的部署中不可用。

自托管部署需要 LangSmith `v0.16` 或更高版本。