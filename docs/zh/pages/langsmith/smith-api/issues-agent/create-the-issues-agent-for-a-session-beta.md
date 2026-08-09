<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create the issues agent for a session (Beta) | https://docs.langchain.com/langsmith/smith-api/issues-agent/create-the-issues-agent-for-a-session-beta -->

# 为会话创建问题代理（Beta）

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/platform/sessions/{session_id}/issues-agent
**测试版：** 该端点正在积极开发中，可能会发生变化，恕不另行通知。

为给定的跟踪器会话配置问题代理并排队
初始扫描。如果会话的代理已存在，则失败。