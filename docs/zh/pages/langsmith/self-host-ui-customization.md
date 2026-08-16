<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize the error support message | https://docs.langchain.com/langsmith/self-host-ui-customization -->

## 自定义错误支持消息

默认情况下，LangSmith 中的错误消息会将用户引导至[Support Portal](https://support.langchain.com)。您可以将其替换为您自己的支持联系信息。

设置后，整个 UI 中的所有错误和支持消息都将显示您的自定义文本，而不是默认的 LangChain 支持电子邮件。

<Note>
自定义消息仅呈现为**纯文本**。 HTML 标签不会被解释，并将显示为文字文本。
</Note>

```yaml Helm
config:
  customErrorSupportMessage: "For help, contact your internal IT team at helpdesk@example.com"
```

要恢复为默认行为，请删除该设置或将其设置为空字符串。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-ui-customization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>