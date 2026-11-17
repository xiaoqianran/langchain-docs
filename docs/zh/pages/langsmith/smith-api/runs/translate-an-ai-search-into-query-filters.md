<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Translate an ai search into query filters | https://docs.langchain.com/langsmith/smith-api/runs/translate-an-ai-search-into-query-filters -->

# 将 ai 搜索转换为查询过滤器

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/ai-search/parse
将自然语言搜索转换为运行、跟踪或线程查询 API 的范围、过滤器、语义标准和时间范围，而无需运行搜索。没有创建任何资源。将返回的字段发送到按范围命名的查询API，具有相同的项目。
当省略范围时，它将从搜索中推断出来并默认为跟踪。搜索的时间段设置min_start_time或max_start_time；搜索未提及的范围将被省略，以便您可以保留自己的时间范围。
需要为组织启用 AI 搜索并对每个项目进行读取访问。返回单个 JSON 响应。