<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List a team's workspace grants | https://docs.langchain.com/langsmith/smith-api/teams/list-a-teams-workspace-grants -->

# 列出团队的工作空间补助

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/platform/orgs/current/teams/{team_id}/workspaces
列出组织范围内的团队有权访问的工作区及其在每个工作区中的角色。
工作区范围内的团队返回 400，因为它对其自己的工作区的访问权限已设置
当它被创建时。页面携带 next_cursor，它是发送回的值
光标指向下一页，读取完最后一页后为 null。光标这个
该团队的端点没有问题，从第一页重新开始。需求
组织：团队：阅读。