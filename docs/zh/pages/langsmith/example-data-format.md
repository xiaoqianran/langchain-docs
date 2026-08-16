<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Example data format | https://docs.langchain.com/langsmith/example-data-format -->

# 数据格式示例

<Check>
在深入了解此内容之前，阅读以下内容可能会有所帮助：

* [Conceptual guide on evaluation](/langsmith/evaluation-concepts)
</Check>

LangSmith 将示例存储在数据集中，如下所示：

|字段名称 |类型 |描述 |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **id** | UUID |该示例的唯一标识符。                                                                                |
| **姓名** |字符串|示例的名称。                                                                                          |
| **创建\_at** |日期时间 |创建此示例的时间 |
| **修改\_at** |日期时间 |上次修改此示例的时间 || **输入** |对象|该示例的输入映射。                                                                                  |
| **输出** |对象|运行生成的映射或输出集。                                                                     |
| **数据集\_id** | UUID |示例所属的数据集 |
| **源\_run\_id** | UUID |如果此示例是从 LangSmith [⟦T0⟧](/langsmith/run-data-format) 创建的，则所述运行的 ID |
| **元数据** |对象|可以存储在示例中的附加、用户或 SDK 定义信息的映射。                            |

要了解有关如何在评估中使用示例的更多信息，请阅读我们关于 [evaluating LLM applications](/langsmith/evaluate-llm-application) 的操作指南。

<Tip>
`outputs` 字段还可以保存 [assertions](/langsmith/assertions)，自由格式声明审阅者写的正确答案。离线评估者从`reference_outputs["assertions"]`读取它们。
</Tip>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/example-data-format.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>