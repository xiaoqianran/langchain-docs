<!-- langchain-docs: Create a user | https://docs.langchain.com/langsmith/smith-api/users/create-a-user -->

# Create a user

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/sessions/{session_id}/users
Stores a user of your application and its traits, such as `name` and `email`, for one tracing project. `user_id` is the ID your runs send in `metadata.user_id`: 1 to 512 characters. `traits` is an optional JSON object of at most 50 keys per request and 16384 bytes as stored, with no null values; `name` and `email` must be strings. Creating a user that already exists returns 409 and never changes the stored traits.