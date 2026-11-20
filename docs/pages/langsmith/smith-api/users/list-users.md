<!-- langchain-docs: List users | https://docs.langchain.com/langsmith/smith-api/users/list-users -->

# List users

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/sessions/{session_id}/users
Returns one page of the users of your application in a tracing project, most recently updated first. `page_size` sets the number of users per page. To get the next page, pass the response's `next_cursor` as `cursor` with the same other parameters; `next_cursor` is null on the last page. `user_id_prefix` returns only users whose `user_id` starts with it, matched literally and case-sensitively.