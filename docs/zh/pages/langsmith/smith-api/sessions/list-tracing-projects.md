<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List tracing projects | https://docs.langchain.com/langsmith/smith-api/sessions/list-tracing-projects -->

# 列出跟踪项目

/langsmith/langsmith-platform-openapi.json 获取 /api/v2/sessions
返回工作区的跟踪项目和实验的页面。传递响应的 next_cursor 作为光标来获取下一页；最后一页的 next_cursor 为空。游标仅在与返回它的请求具有相同查询参数的情况下才有效。