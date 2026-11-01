<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete workspace | https://docs.langchain.com/langsmith/smith-api/workspaces/delete-workspace -->

# 删除工作区

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/workspaces/{workspace_id}
删除工作区及其数据。

仅请求范围内的工作区（X-Tenant-Id 标头或 API 密钥的工作区）
可以删除；任何其他 ID 将返回 403。需要工作区删除权限。