<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add members to a user group | https://docs.langchain.com/langsmith/smith-api/user-groups/add-members-to-a-user-group -->

# 添加成员到用户组

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/orgs/current/user-groups/{user_group_id}/members
将组织成员添加到用户组并返回每个身份的状态：
添加时已创建，已是成员时未更改，失败时
当它不是该组织中的组织身份时。一个工作区
范围用户组仅接受属于其工作区成员的人员，并且还记录
他们的工作空间身份。组织范围内的用户组记录每个人的工作空间
在它被授予的每个工作空间中都有身份。其他身份依然
补充道。工作空间范围内的用户组需要其中的工作空间：用户组：管理成员
工作区，组织范围的用户组需要组织：用户组：管理成员。