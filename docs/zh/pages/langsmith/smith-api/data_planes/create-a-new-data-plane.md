<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a new data plane | https://docs.langchain.com/langsmith/smith-api/data_planes/create-a-new-data-plane -->

# 创建一个新的数据平面

/langsmith/langsmith-platform-openapi.json 发布 /orgs/current/data-planes
创建一个新的数据平面对象。保留渲染的数据平面规范，并返回 202，数据平面处于 status=requested 状态。需要启用 BYOC 的组织和组织管理员。
使用组织分配的外部 ID 来代入 AWS 角色。创建数据平面之前，在角色的信任策略中配置该 ID。