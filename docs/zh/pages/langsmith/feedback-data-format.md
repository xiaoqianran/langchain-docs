<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Feedback data format | https://docs.langchain.com/langsmith/feedback-data-format -->

# 反馈数据格式

<Check>
  在深入了解此内容之前，阅读以下内容可能会有所帮助：

  * [Conceptual guide on tracing and feedback](/langsmith/observability-concepts)
</Check>

**反馈**是 LangSmith 存储特定迹线或中间运行（跨度）评估的标准和分数的方法。反馈可以通过多种方式产生，例如：

1. LLM申请中的[Sent up along with a trace](/langsmith/attach-user-feedback)
2. 由用户在应用程序[inline](/langsmith/annotate-traces-inline)或[annotation queue](/langsmith/annotation-queues)中生成
3. 由自动评估器在[offline evaluation](/langsmith/evaluate-llm-application)期间生成
4. 由[online evaluator](/langsmith/online-evaluations-llm-as-judge)生成

反馈以简单的格式存储，包含以下字段：|字段名称 |类型 |描述 |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id` | UUID |记录本身的唯一标识符 |
| `created_at` |日期时间 |创建记录时的时间戳 |
| `modified_at` |日期时间 |上次修改记录的时间戳 |
| `session_id` | UUID |运行所属的实验或跟踪项目的唯一标识符。创建运行反馈时需要。 |
| `run_id` | UUID |会话中特定运行的唯一标识符 || `start_time` |日期时间 |反馈所针对的运行的开始时间。可选，但提供它可以让 LangSmith 更快地处理反馈。        |
| `key` |字符串|描述反馈标准的键，例如`'correctness'` |
| `score` |数量 |与反馈键相关的数字分数 |
| `value` |字符串|保留用于存储与分数关联的值。对于分类反馈很有用。                                  |
| `comment` |字符串|与记录相关的任何评论或注释。这可以作为给出分数的理由。                    |
| `correction` |对象|保留用于存储更正详细信息（如果有）|
| `feedback_source` |对象|包含反馈源信息的对象 || `feedback_source.type` |字符串|反馈来源的类型，例如`'api'`、`'app'`、`'evaluator'` |
| `feedback_source.metadata` |对象|目前保留用于附加元数据 |
| `feedback_source.user_id` | UUID |提供反馈的用户的唯一标识符|

以下是采用上述格式的反馈记录的 JSON 表示形式：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "created_at": "2024-05-05T23:23:11.077838",
  "modified_at": "2024-05-05T23:23:11.232962",
  "session_id": "c919298b-0af2-4517-97a2-0f98ed4a48f8",
  "run_id": "e26174e5-2190-4566-b970-7c3d9a621baa",
  "key": "correctness",
  "score": 1.0,
  "value": null,
  "comment": "I gave this score because the answer was correct.",
  "correction": null,
  "id": "62104630-c7f5-41dc-8ee2-0acee5c14224",
  "feedback_source": {
    "type": "app",
    "metadata": null,
    "user_id": "ad52b092-1346-42f4-a934-6e5521562fab"
  }
}
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/feedback-data-format.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>