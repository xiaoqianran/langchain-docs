<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a team | https://docs.langchain.com/langsmith/smith-api/teams/create-a-team -->

# 创建一个团队

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/teams
创建一个组织范围内的团队。需要组织：团队：管理。工作空间范围
此处不创建团队：授予组织范围内的团队访问
工作空间在那里创建其工作空间范围的团队，因此工作空间_id 和
Parent_team_id 返回 400。