<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a user | https://docs.langchain.com/langsmith/smith-api/users/create-a-user -->

# 创建用户

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/sessions/{session_id}/users
存储一个跟踪项目的应用程序用户及其特征，例如 `name` 和 `email`。 `user_id` 是您的运行在 `metadata.user_id` 中发送的 ID：1 到 512 个字符。 `traits` 是一个可选的 JSON 对象，每个请求最多 50 个键，存储 16384 字节，没有空值； `name` 和 `email` 必须是字符串。创建已存在的用户会返回 409，并且永远不会更改存储的特征。