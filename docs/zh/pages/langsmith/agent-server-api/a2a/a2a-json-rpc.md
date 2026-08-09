<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: A2A JSON-RPC | https://docs.langchain.com/langsmith/agent-server-api/a2a/a2a-json-rpc -->

# A2A JSON-RPC

/langsmith/agent-server-openapi.json 发布 /a2a/{assistant_id}
使用基于 JSON-RPC 2.0 的代理到代理 (A2A) 协议与助手进行通信。
该端点接受 JSON-RPC 信封并基于 `method` 进行调度。

**支持的方法：**
- `message/send`：发送消息并等待最终的Task结果。
- `message/stream`：发送消息并接收服务器发送事件 (SSE) JSON-RPC 响应。
- `tasks/get`：通过ID获取任务的当前状态。
- `tasks/cancel`：请求取消（当前不支持；返回错误）。

**LangGraph 映射：**
- `message.contextId` 映射到 LangGraph `thread_id`。

**注释：**
- 仅支持`text`和`data`部件； `file` 零件不是。
- 如果省略`message.contextId`，则会创建一个新上下文。
- 文本部分要求助理输入模式包含 `messages` 字段。