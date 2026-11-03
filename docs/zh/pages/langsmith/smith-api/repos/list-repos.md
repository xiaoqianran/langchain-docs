<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List repos | https://docs.langchain.com/langsmith/smith-api/repos/list-repos -->

# 列出存储库

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/repos
获取所有回购。

带有 page_size 和光标的页面：从上一个响应传递 next_cursor
作为光标，直到 next_cursor 为空。限制和偏移参数是
仍然接受，但不能与光标组合。