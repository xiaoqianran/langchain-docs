<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Delete tracer session | https://docs.langchain.com/langsmith/smith-api/tracer-sessions/delete-tracer-session -->

# 删除跟踪器会话

/langsmith/langsmith-platform-openapi.json 删除 /api/v1/sessions/{session_id}
删除特定项目。

接受删除时返回 202。清理异步运行。
位置标识受影响的项目，而不是清理状态端点。
对于具有读取访问权限的调用者，该 URL 上的 GET 将返回 200 以及项目
当它仍然可用时，或者在项目被删除后出现 404。 404 确实
不确认后台跟踪清理已完成。轮询清理
不支持完成。