<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Include HTTP headers in server logs | https://docs.langchain.com/langsmith/configurable-logs -->

# 在服务器日志中包含 HTTP 标头

默认情况下，出于隐私原因，[Agent Server](/langsmith/agent-server) 会忽略服务器日志中的 HTTP 标头。但是，记录请求和相关 ID 可以帮助您跨分布式系统调试问题和跟踪请求。您可以通过修改 [⟦T2⟧](/langsmith/application-structure#configuration-file) 文件中的 `logging_headers` 部分来选择记录所有 API 调用的标头。

```json
{
  "$schema": "https://langgra.ph/schema.json",
  "http": {
    "logging_headers": {
      "includes": ["request-id", "x-purchase-id", "*-trace-*"],
      "excludes": ["authorization", "x-api-key", "x-organization-id", "x-user-id"]
    }
  }
}
```

`includes` 和 `excludes` 列表接受精确的标头名称或 glob 模式，使用 `*` 作为通配符来匹配任意数量的字符（不区分大小写）。为了您的安全，不支持其他模式类型。

请注意，排除项优先于包含项。例如，如果包含 `*-id` 但排除 `x-user-id`，则不会记录 `x-user-id` 标头。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configurable-logs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>