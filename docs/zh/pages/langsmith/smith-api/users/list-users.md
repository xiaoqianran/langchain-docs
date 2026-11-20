<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List users | https://docs.langchain.com/langsmith/smith-api/users/list-users -->

# 列出用户

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/sessions/{session_id}/users
返回跟踪项目中应用程序用户的一页，最近更新的最先返回。 `page_size` 设置每页的用户数。要获取下一页，请将响应的 `next_cursor` 作为 `cursor` 传递，并使用相同的其他参数；最后一页`next_cursor`为空。 `user_id_prefix` 仅返回 `user_id` 以它开头的用户，按字面匹配并区分大小写。