<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Dataset prebuilt JSON schema types | https://docs.langchain.com/langsmith/dataset-json-types -->

# 数据集预构建的 JSON 模式类型

LangSmith 建议您在数据集模式的输入和输出上设置模式，以确保数据一致性，并且您的示例采用正确的格式进行下游处理，例如运行评估。

为了更好地支持LLM工作流程，LangSmith支持一些不同的预定义预构建类型。这些架构由 LangSmith API 公开托管，并且可以使用 [JSON Schema references](https://json-schema.org/understanding-json-schema/structuring#dollarref) 在数据集架构中定义。可用模式表如下所示|类型 | JSON 架构参考链接 |用途 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
|留言 | [https://api.smith.langchain.com/public/schemas/v1/message.json](https://api.smith.langchain.com/public/schemas/v1/message.json) |表示发送到聊天模型的消息，遵循 OpenAI 标准格式。                                           |
|工具| [https://api.smith.langchain.com/public/schemas/v1/tooldef.json](https://api.smith.langchain.com/public/schemas/v1/tooldef.json) |可用于聊天模型进行函数调用的工具定义，以OpenAI的 JSON Schema 启发的函数格式定义。 |

LangSmith 允许您定义一系列转换，从跟踪中收集上述预构建类型并将它们添加到数据集中。有关可用转换的更多信息，请参阅我们的 [reference](/langsmith/dataset-transformations)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/dataset-json-types.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>