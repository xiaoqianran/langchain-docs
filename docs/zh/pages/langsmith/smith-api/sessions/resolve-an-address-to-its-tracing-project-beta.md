<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Resolve an address to its tracing project (Beta) | https://docs.langchain.com/langsmith/smith-api/sessions/resolve-an-address-to-its-tracing-project-beta -->

# 解析其跟踪项目的地址（Beta）

/langsmith/langsmith-platform-openapi.json 获取 /api/v1/sessions/resolutions
**测试版：** 该端点正在积极开发中，可能会发生变化，恕不另行通知。返回跟踪项目（会话）的地址名称。地址是一个代理（`id` 和 `environment`）、一个实验（`id`）或一个评估者（无`id`：评估者跟踪在每个工作区共享一个项目）。发送大写的`kind`和`environment`，如所列；它们的匹配不区分大小写，而 Agent `id` 区分大小写。不存在的地址或者您无法读取其项目的地址是 404。将返回的 `session_id` 传递到任何采用项目（会话）ID 的端点。 BYOC 数据平面尚不支持此功能，并且出现 501。