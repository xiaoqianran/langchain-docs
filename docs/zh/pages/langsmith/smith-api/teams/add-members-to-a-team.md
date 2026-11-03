<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add members to a team | https://docs.langchain.com/langsmith/smith-api/teams/add-members-to-a-team -->

# 添加成员到团队

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/teams/{team_id}/members
将组织成员添加到团队并返回每个身份的状态：
添加时已创建，已是成员时未更改，失败时
当它不是该组织中的组织身份时。一个工作区
范围内的团队只接受属于其工作区成员的人员，并且还记录
他们的工作空间身份。组织范围内的团队记录每个人的工作空间
在它被授予的每个工作空间中都有身份。其他身份依然
补充道。工作空间范围内的团队需要工作空间：团队：管理成员
工作区，组织范围的团队需要组织：团队：管理成员。