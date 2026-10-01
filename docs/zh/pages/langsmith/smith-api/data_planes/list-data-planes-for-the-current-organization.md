<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: List data planes for the current organization | https://docs.langchain.com/langsmith/smith-api/data_planes/list-data-planes-for-the-current-organization -->

# 列出当前组织的数据平面

/langsmith/langsmith-platform-openapi.json 获取 /orgs/current/data-planes
返回调用者组织在所有生命周期状态中拥有的最多 50 个数据平面。按状态优先级排序（首先是活动的），然后是最新的。需要为组织启用 BYOC。