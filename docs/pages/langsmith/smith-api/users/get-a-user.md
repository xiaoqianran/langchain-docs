<!-- langchain-docs: Get a user | https://docs.langchain.com/langsmith/smith-api/users/get-a-user -->

# Get a user

/langsmith/langsmith-platform-openapi.json get /api/v1/platform/sessions/{session_id}/users/{user_id}
Returns one user of your application and its traits in a tracing project. URL-encode `user_id` in the path, so that a `/` in it is sent as `%2F`.