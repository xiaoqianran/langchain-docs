<!-- langchain-docs: Update a user's traits | https://docs.langchain.com/langsmith/smith-api/users/update-a-users-traits -->

# Update a user's traits

/langsmith/langsmith-platform-openapi.json patch /api/v1/platform/sessions/{session_id}/users/{user_id}
Merges `traits` into the stored traits of an existing user of your application in a tracing project: keys you send overwrite stored values, keys you do not send are kept, and a key sent as `null` is removed. `traits` is a JSON object of at most 50 keys per request; `name` and `email` must be strings or null. The merged traits may be at most 16384 bytes as stored. Every successful update sets `updated_at`. Updating a user that does not exist returns 404 and never creates it. Because the response includes the stored traits, the caller needs permission to read runs as well as create them. URL-encode `user_id` in the path, so that a `/` in it is sent as `%2F`.