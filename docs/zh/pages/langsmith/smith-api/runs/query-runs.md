<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Query runs | https://docs.langchain.com/langsmith/smith-api/runs/query-runs -->

# 查询运行

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/runs/query
返回给定项目在最小/最大开始时间内运行的分页列表。支持过滤器、光标分页和`selects`选择要返回的字段。

当`ai_search`设置时，需要`Accept: text/event-stream`；没有它的请求将返回 406。AI 搜索在将查询路由到 v1 后端并在那里返回 501 的部署中不可用。

自托管部署需要 LangSmith `v0.16` 或更高版本。