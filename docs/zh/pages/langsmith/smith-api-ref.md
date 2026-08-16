<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith API reference | https://docs.langchain.com/langsmith/smith-api-ref -->

# LangSmith API 参考

LangSmith REST API 提供对 LangSmith 平台功能的编程访问，包括跟踪、数据集、实验、注释等。

在侧边栏的 **LangSmith REST API** 部分浏览完整的 API 参考。

## 身份验证

在每个请求中传递 `X-Api-Key` 标头。该值应该是有效的[LangSmith API key](/langsmith/create-account-api-key)。

```shell
curl --request GET \
  --url https://api.smith.langchain.com/api/v1/workspaces \
  --header 'X-Api-Key: LANGSMITH_API_KEY'
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smith-api-ref.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>