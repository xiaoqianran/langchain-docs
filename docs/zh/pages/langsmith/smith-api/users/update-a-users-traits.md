<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update a user's traits | https://docs.langchain.com/langsmith/smith-api/users/update-a-users-traits -->

# 更新用户的特征

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/platform/sessions/{session_id}/users/{user_id}
将 `traits` 合并到跟踪项目中应用程序的现有用户的存储特征中：您发送的密钥将覆盖存储的值，保留您未发送的密钥，并且删除作为 `null` 发送的密钥。 `traits` 是一个 JSON 对象，每个请求最多包含 50 个键； `name` 和 `email` 必须是字符串或 null。合并后的特征最多可存储 16384 字节。每次成功的更新都会设置`updated_at`。更新不存在的用户会返回 404，并且永远不会创建它。由于响应包含存储的特征，因此调用者需要读取运行以及创建运行的权限。对路径中的`user_id`进行URL编码，以便其中的`/`作为`%2F`发送。