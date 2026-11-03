<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List organization teams | https://docs.langchain.com/langsmith/smith-api/teams/list-organization-teams -->

# 列出组织团队

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams
按名称顺序列出组织的团队。一个页面带有next_cursor，即
作为下一页的光标发送回的值，最后一页为 null
已读。该端点未发出的游标，或为不同的端点发出的游标
过滤器，再次从第一页开始。组织范围的团队在以下情况下列出：
调用者有组织：团队：已读。工作区范围内的团队仅在以下位置列出
调用者拥有workspaces:teams:read 的工作空间。使用workspace_id，列表
拥有工作区自己的团队和授予其的组织范围的团队，
每个都有 role_id 和 role_name；当调用者有权限时，也会列出授予的团队
工作区：团队：在该工作区中读取。