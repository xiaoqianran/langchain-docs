<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Auth-aware tool responses | https://docs.langchain.com/langsmith/fleet/auth-format -->

# Auth-aware 工具响应

格式化工具响应以触发 OAuth 流程并自动恢复执行。

有些[tools](/langsmith/fleet/tools)需要用户授权（例如Google、Slack、GitHub）。 LangSmith Fleet 包含中间件，用于检测工具何时需要授权并暂停运行，并向用户发出明确的提示。用户完成身份验证后，会自动重试相同的工具调用。

## 返回形状以请求身份验证

如果工具检测到缺少授权，则返回包含以下字段的 JSON 字符串：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "auth_required": true,
  "auth_url": "https://auth.example.com/start",
  "auth_id": "opaque-tracking-id"
}
```

* `auth_required`：设置为`true` 表示需要中断。
* `auth_url`：应将用户重定向到授权位置。
* `auth_id`：可选的相关 ID，用于跟踪身份验证会话。

当 Fleet 检测到此响应时，它会中断运行，向用户显示身份验证 UI，并在授权完成后自动重试工具调用。

如果您希望自定义工具重用相同的身份验证所需的中断 + UI，请确保您的工具返回相同形状的 JSON。

<Note>
  仅返回此 JSON 作为工具的输出。避免包含额外的文本或内容。队列解析响应以触发身份验证流程。
</Note>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/auth-format.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>