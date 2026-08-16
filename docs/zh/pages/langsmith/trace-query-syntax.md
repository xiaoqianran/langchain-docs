<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace query syntax | https://docs.langchain.com/langsmith/trace-query-syntax -->

# 跟踪查询语法

[LangSmith SDK](https://reference.langchain.com/python/langsmith/) 和 [REST API](/langsmith/smith-api-ref) 允许您使用一组过滤器参数和结构化过滤器查询语言以编程方式过滤、查询和导出 [runs](/langsmith/observability-concepts#runs)。此页面记录了过滤器参数和查询语言，以及常见查询的示例。

有关将这些过滤器与 SDK 相结合的可运行的端到端示例，请参阅[Query traces using the SDK](/langsmith/export-traces)。

## 过滤参数

|按键|描述 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project_id` / `project_name` |要获取的项目作为单个项目或项目列表运行。                                                                                                                                                  || `trace_id` |获取属于特定跟踪一部分的运行。                                                                                                                                                                                  |
| `run_type` |获取[type of run](/langsmith/run-data-format#run-types)，例如`llm`、`chain`、`tool`、`retriever`。                                                                                                                              |
| `dataset_name` / `dataset_id` |获取与指定数据集中的示例行关联的运行。这对于比较给定数据集上的提示或模型非常有用。                                                                              |
| `reference_example_id` |获取与特定示例行关联的运行。这对于比较给定输入的提示或模型很有用。                                                                                                   || `parent_run_id` |获取给定运行的子级运行。这对于使用上下文管理器获取分组在一起的运行或获取代理轨迹非常有用。                                                                  |
| `error` |获取出错或未出错的运行。                                                                                                                                                                                      |
| `run_ids` |使用给定的运行 ID 列表获取运行。注意：**这将忽略所有其他过滤参数。** |
| `filter` |获取与给定结构化过滤器语句匹配的运行。欲了解更多详情，请参阅[filter query language](#filter-query-language)部分。                                                                         || `trace_filter` |应用于跟踪的根运行的过滤器。与 `filter` 一起使用可按根运行的属性缩小范围。                                                                                                                       |
| `tree_filter` |过滤器应用于跟踪树（根、同级或子级）中的任何运行。与 `filter` 一起使用可按跟踪内任何运行的属性缩小范围。                                                                                   |
| `is_root` |仅返回根运行。                                                                                                                                                                                                         |
| `select` |选择要在响应中返回的字段。默认情况下，返回所有字段。请参阅[run data format](/langsmith/run-data-format)了解可用字段。                                                                                                                                              || `query`（_实验_）|自然语言查询，将您的查询转换为过滤语句。                                                                                                                                                   |

<Note>
**性能提示**：传递 `select` 参数并从列表中排除 `inputs` 和 `outputs` 可以显着提高查询性能并减少响应大小，特别是对于大型运行。
</Note>

## 过滤查询语言

LangSmith 支持使用过滤器查询语言的过滤功能，以允许在获取运行时进行复杂的过滤操作。当通过 SDK 或 API 以编程方式查询跟踪时，这特别有用。例如，在[evaluation](/langsmith/evaluation)管道、监控脚本或检查先前[traces](/langsmith/observability-concepts#traces)的代理工作流程中。

### 比较器

过滤语法基于应用于运行对象字段的比较器函数：|比较器|描述 |示例|
| ---------- | -------------------------------------------------------------------- | -------- |
| `eq` |等于 | `eq(run_type, "llm")` |
| `neq` |不等于 | `neq(status, "error")` |
| `gt` |大于 | `gt(latency, "5s")` |
| `gte` |大于或等于| `gte(latency, 1.5)` |
| `lt` |小于| `lt(start_time, "2024-01-01T00:00:00Z")` |
| `lte` |小于或等于 | `lte(feedback_score, 0.5)` |
| `has` |检查运行是否包含标签或元数据键值 | `has(tags, "production")` |
| `search` |在所有字符串字段中搜索子字符串 | `search("invoice")` |
| `in` |检查字段值是否在列表中 | `in(metadata_key, ["session_id", "thread_id"])` |

### 逻辑运算符

使用`and`和`or`组合多个比较器：

```text
and(eq(run_type, "llm"), gt(latency, "2s"))
or(eq(status, "error"), and(eq(feedback_key, "score"), lt(feedback_score, 0.5)))
```

### 可过滤字段|领域|类型 |笔记|
| ----------------- | ---------------- | -----|
| `id` |字符串（UUID）|运行 ID |
| `name` |字符串|运行名称 |
| `run_type` |字符串| `llm`、`chain`、`tool`、`retriever`、`embedding`、`prompt`、`parser` 之一 |
| `status` |字符串| `"success"`、`"error"` 或 `"pending"`。使用它来过滤错误与成功的运行。 |
| `start_time` | ISO 8601 字符串 |例如`"2024-01-15T00:00:00Z"` |
| `end_time` | ISO 8601 字符串 | |
| `latency` |持续时间字符串或数字|秒，例如`"5s"`、`"1.5s"` 或 `1.5`。仅支持 `s` 后缀。 |
| `tags` |字符串列表 |使用`has(tags, "value")` |
| `metadata_key` |字符串|输入运行的元数据字典 |
| `metadata_value` |字符串|运行元数据字典中的值 |
| `feedback_key` |字符串|反馈分数名称 |
| `feedback_score` |数量 |反馈分数的数值 |

### 值格式- **字符串**：用双引号或单引号括起来，`eq(name, "MyChain")`或`eq(name, 'MyChain')`。
- **时间戳**：ISO 8601 格式，`"2024-06-01T00:00:00Z"`。
- **持续时间**：秒，可以是数字或带有 `s` 后缀、`"5s"`、`"1.5s"`、`"90s"` 或 `1.5` 的字符串。不支持其他单位后缀（`m`、`h`）。
- **列表**：JSON 数组语法，`["session_id", "thread_id"]`。

## 快速参考示例

以下示例仅显示过滤字符串。将字符串作为 `client.list_runs()` 或 `/runs/query` API 端点中的 `filter`、`trace_filter` 或 `tree_filter` 参数传递。

<Tip>
有关包含 Python、TypeScript 和 Java 代码的完整 SDK 示例，请参阅[Query traces using the SDK](/langsmith/export-traces#use-filter-query-language)。
</Tip>

### 按运行名称过滤

```text
eq(name, "my_chain")
```

### 按错误状态过滤

```text
# Runs that errored
eq(status, "error")

# Runs that did not error
eq(status, "success")
```

### 按延迟过滤

```text
# Runs slower than 5 seconds
gt(latency, "5s")

# Runs faster than 1 second
lt(latency, "1s")
```

### 按时间范围过滤

```text
and(gt(start_time, "2024-01-01T00:00:00Z"), lt(start_time, "2024-02-01T00:00:00Z"))
```

### 按标签过滤

```text
has(tags, "production")

# Multiple tags (any match)
or(has(tags, "production"), has(tags, "staging"))
```

### 按元数据键或值过滤

```text
# Runs with a "user_id" metadata key
eq(metadata_key, "user_id")

# Runs with a specific user ID value
and(eq(metadata_key, "user_id"), eq(metadata_value, "usr_abc123"))

# Runs from the production environment
and(eq(metadata_key, "environment"), eq(metadata_value, "production"))
```

### 按线程 ID 过滤

```text
and(in(metadata_key, ["session_id", "thread_id"]), eq(metadata_value, "<your_thread_id>"))
```

### 按反馈分数过滤

```text
# Runs with a "thumbs_up" score of 1
and(eq(feedback_key, "thumbs_up"), eq(feedback_score, 1))

# Runs with a "correctness" score below 0.5
and(eq(feedback_key, "correctness"), lt(feedback_score, 0.5))
```

### 跨所有字符串字段的全文搜索

```text
search("my search term")
```

### 组合条件

```text
# Errors that started after a specific time
and(gt(start_time, "2024-06-01T00:00:00Z"), eq(status, "error"))

# Slow LLM runs with low correctness feedback
and(gt(latency, "10s"), eq(feedback_key, "correctness"), lt(feedback_score, 0.5))

# Complex: errors OR low score, both starting after a timestamp
and(gt(start_time, "2023-07-15T12:34:56Z"), or(eq(status, "error"), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))
```

### 使用trace_filter和tree_filter

`filter` 适用于返回的运行。 `trace_filter` 适用于跟踪的根运行。 `tree_filter` 适用于跟踪树中任何位置的任何运行。

```text
# filter: the run you want
eq(name, "RetrieveDocs")

# trace_filter: condition on the root run (e.g. human feedback on the overall trace)
and(eq(feedback_key, "user_score"), eq(feedback_score, 1))

# tree_filter: condition on any run in the trace tree
eq(name, "ExpandQuery")
```<Note>
`tree_filter` 应用相同的查询语法在跟踪树中的任何位置运行。对于任意嵌套子运行字段上的谓词，例如返回的 `inputs`、`outputs` 或 `extra` 有效负载路径，首先使用服务器端过滤器缩小候选范围，然后使用子运行合并根跟踪并在本地遍历它们。参见[Query trace trees with child-run predicates](/langsmith/export-traces#query-trace-trees-with-child-run-predicates)。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-query-syntax.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>