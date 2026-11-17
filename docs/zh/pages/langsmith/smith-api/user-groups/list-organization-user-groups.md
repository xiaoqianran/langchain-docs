<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List organization user groups | https://docs.langchain.com/langsmith/smith-api/user-groups/list-organization-user-groups -->

# 列出组织用户组

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/user-groups
按名称顺序列出组织的用户组。一个页面带有next_cursor，即
作为下一页的光标发送回的值，最后一页为 null
已读。该端点未发出的游标，或为不同的端点发出的游标
过滤器，再次从第一页开始。组织范围内的用户组在以下情况下列出：
调用者有组织：用户组：读取。工作区范围内的用户组仅在以下位置列出
调用者拥有工作空间的工作空间：用户组：读取。使用workspace_id，列表
拥有工作区自己的用户组和授予其中的组织范围的用户组，
每个都有 role_id 和 role_name；当调用者有权限时，也会列出授予的用户组
工作区：用户组：在该工作区中读取。