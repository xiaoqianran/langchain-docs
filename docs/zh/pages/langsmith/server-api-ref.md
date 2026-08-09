<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent Server API reference for LangSmith Deployment | https://docs.langchain.com/langsmith/server-api-ref -->

# LangSmith 部署的代理服务器 API 参考

代理服务器 API 参考可在 `/docs` 端点的每个 [deployment](/langsmith/deployment) 内使用（例如 `http://localhost:8124/docs`）。

在侧边栏的 **代理服务器 API** 部分中浏览完整的 API 参考，或查看下面的端点组：

* [Assistants](/langsmith/agent-server-api/assistants) - 配置的图实例
* [Threads](/langsmith/agent-server-api/threads) - 一组运行的累积输出
* [Thread Runs](/langsmith/agent-server-api/thread-runs) - 在线程上调用图形/助手
* [Stateless Runs](/langsmith/agent-server-api/stateless-runs) - 无状态持久性的调用
* [Crons](/langsmith/agent-server-api/crons) - 按计划定期运行
* [Store](/langsmith/agent-server-api/store) - 用于长期记忆的持久键值存储
* [A2A](/langsmith/agent-server-api/a2a) - 代理到代理协议端点
* [MCP](/langsmith/agent-server-api/mcp) - 模型上下文协议端点
* [System](/langsmith/agent-server-api/system) - 健康检查和服务器信息

## 身份验证

对于部署到 LangSmith，需要进行身份验证。将每个请求的 `X-Api-Key` 标头传递给代理服务器。标头的值应设置为部署代理服务器的组织的有效 LangSmith API 密钥。

`curl`命令示例：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl --request POST \
  --url http://localhost:8124/assistants/search \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: LANGSMITH_API_KEY' \
  --data '{
  "metadata": {},
  "limit": 10,
  "offset": 0
}'
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/server-api-ref.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>