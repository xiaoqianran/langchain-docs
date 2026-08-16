<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run (span) data format | https://docs.langchain.com/langsmith/run-data-format -->

# 运行（span）数据格式

LangSmith 将每个 [run](/langsmith/observability-concepts) 存储为结构化记录。了解此格式在导出跟踪、查询 API 或构建集成时非常有用。

|字段名称 |类型 |描述 |
| -------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **`id`** | UUID |跨度的唯一标识符。                                                                                               |
| **`name`** |字符串|与运行关联的名称。                                                                                             |
| **`inputs`** |对象|提供给运行的输入图。对于使用 `run_type='llm'` 运行，这通常包含发送到模型的消息对象的 `messages` 数组。                                                                                   || **`run_type`** |字符串| [Type of run](#run-types)，例如`'llm'`、`'chain'`、`'tool'`。                                                            |
| **`start_time`** |日期时间 |跑步的开始时间。                                                                                                        |
| **`end_time`** |日期时间 |运行的结束时间。                                                                                                          |
| **`extra`** |对象|任何额外的信息都会运行。                                                                                                    |
| **`error`** |字符串|如果运行遇到错误，则会出现错误消息。                                                                                |
| **`outputs`** |对象|运行生成的输出图。对于使用 `run_type='llm'` 的运行，这通常包含模型返回的消息对象的 `messages` 数组。                                                                                 || **`events`** |对象数组 |与运行关联的事件对象的列表。这与使用流式传输执行的运行相关。                           |
| **`tags`** |字符串数组 |与运行相关的标记或标签。                                                                                       |
| **`trace_id`** | UUID |运行所属跟踪的唯一标识符。这也是跟踪 | 的根运行的 `id` 字段
| **`dotted_order`** |字符串| [Ordering string](#what-is-dotted_order)，分层。格式：`<run_start_time>Z<run_uuid>`.`<child_run_start_time>Z<child_run_uuid>`... |
| **`status`** |字符串|运行执行的当前状态，例如`'error'`、`'pending'`、`'success'` |
| **`child_run_ids`** | UUID 数组 |所有子运行的 ID 列表。                                                                                               |
| **`direct_child_run_ids`** | UUID 数组 |此运行的直接子级的 ID 列表。                                                                                  || **`parent_run_ids`** | UUID 数组 |所有父运行的 ID 列表。                                                                                              |
| **`feedback_stats`** |对象|本次运行的反馈统计数据汇总 |
| **`reference_example_id`** | UUID |与运行关联的参考示例的 ID。这通常仅在评估运行时出现。                          |
| **`total_tokens`** |整数 |运行处理的令牌总数。                                                                                  |
| **`prompt_tokens`** |整数 |运行提示中的令牌数量。                                                                                    |
| **`completion_tokens`** |整数 |完成运行时的令牌数。                                                                                |
| **`total_cost`** |小数 |与处理运行相关的总成本。                                                                                || **`prompt_cost`** |小数 |与运行的提示部分相关的成本。                                                                              |
| **`completion_cost`** |小数 |与完成运行相关的成本。                                                                               |
| **`first_token_time`** |日期时间 |生成模型输出的第一个标记的时间。仅适用于使用 `run_type="llm"` 并启用流式传输的运行。 |
| **`session_id`** |字符串|运行的会话标识符，也称为跟踪项目 ID。                                                         |
| **`in_dataset`** |布尔 |指示运行是否包含在数据集中。                                                                           |
| **`parent_run_id`** | UUID |父运行的唯一标识符。                                                                                          |
| `execution_order`（已弃用）|整数 |此运行在跟踪中执行的顺序。                                                                    || `serialized` |对象|执行运行的对象的序列化状态（如果适用）。                                                               |
| `manifest_id`（已弃用）| UUID |与跨度关联的清单的标识符。                                                                           |
| `manifest_s3_id` | UUID |清单的 S3 标识符。                                                                                               |
| `inputs_s3_urls` |对象|输入的 S3 URL。                                                                                                       |
| `outputs_s3_urls` |对象|输出的 S3 URL。                                                                                                      |
| `price_model_id` | UUID |应用于运行的定价模型的标识符。                                                                          || `app_path` |字符串|此运行的应用程序 (UI) 路径。                                                                                           |
| `last_queued_at` |日期时间 |上次跨度已排队。                                                                                                |
| `share_token` |字符串|用于共享运行数据访问权限的令牌。                                                                                   |

以下是采用上述格式的运行的 JSON 表示形式的示例：

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "name": "string",
  "inputs": {},
  "run_type": "llm",
  "start_time": "2024-04-29T00:49:12.090000",
  "end_time": "2024-04-29T00:49:12.459000",
  "extra": {},
  "error": "string",
  "execution_order": 1,
  "serialized": {},
  "outputs": {},
  "parent_run_id": "f8faf8c1-9778-49a4-9004-628cdb0047e5",
  "manifest_id": "82825e8e-31fc-47d5-83ce-cd926068341e",
  "manifest_s3_id": "0454f93b-7eb6-4b9d-a203-f1261e686840",
  "events": [{}],
  "tags": ["foo"],
  "inputs_s3_urls": {},
  "outputs_s3_urls": {},
  "trace_id": "df570c03-5a03-4cea-8df0-c162d05127ac",
  "dotted_order": "20240429T004912090000Z497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "status": "string",
  "child_run_ids": ["497f6eca-6276-4993-bfeb-53cbbbba6f08"],
  "direct_child_run_ids": ["497f6eca-6276-4993-bfeb-53cbbbba6f08"],
  "parent_run_ids": ["f8faf8c1-9778-49a4-9004-628cdb0047e5"],
  "feedback_stats": {
    "correctness": {
      "n": 1,
      "avg": 1.0
    }
  },
  "reference_example_id": "9fb06aaa-105f-4c87-845f-47d62ffd7ee6",
  "total_tokens": 0,
  "prompt_tokens": 0,
  "completion_tokens": 0,
  "total_cost": 0.0,
  "prompt_cost": 0.0,
  "completion_cost": 0.0,
  "price_model_id": "0b5d9575-bec3-4256-b43a-05893b8b8440",
  "first_token_time": null,
  "session_id": "1ffd059c-17ea-40a8-8aef-70fd0307db82",
  "app_path": "string",
  "last_queued_at": null,
  "in_dataset": true,
  "share_token": "d0430ac3-04a1-4e32-a7ea-57776ad22c1c"
}
```

## 运行类型

`run_type` 字段标识跨度代表的操作类型。 LangSmith 使用它在跟踪 UI 中应用适当的渲染并启用特定于类型的功能。|运行类型 |描述 |
|----------|-------------|
| `chain` |步骤的序列或组合。 |
| `llm` |对语言模型的调用。 |
| `embedding` |嵌入 API 调用。 （在 UI 中显示为 `chain` 图标。）
| `prompt` | [prompt template](/langsmith/prompt-template-format)，在将输入传递给模型之前对其进行格式化。 |
| `tool` |模型调用的函数或外部操作。 |
| `retriever` |获取相关文档或上下文的查找。 |
| `parser` |将原始模型输出转换为结构化格式的输出解析器。 |

使用 [⟦T68⟧](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 或 [⟦T69⟧](/langsmith/annotate-code#use-the-runtree-api) 进行检测时设置 [⟦T67⟧](https://reference.langchain.com/python/langsmith/schemas/RunBase/run_type)：

<CodeGroup>
```python Python
from langsmith import traceable

@traceable(run_type="tool")
def my_tool(query: str) -> str:
    ...
```
```typescript TypeScript
import { traceable } from "langsmith/traceable";

const myTool = traceable(
  async (query: string): Promise<string> => {
    // ...
  },
  { run_type: "tool" }
);
```
</CodeGroup>

某些运行类型在 LangSmith UI 中具有专门的跟踪视图：

- [Log LLM calls](/langsmith/log-llm-trace)
- [Log retriever traces](/langsmith/log-retriever-trace)

## 什么是`dotted_order`？

运行的点分顺序是一个可排序的键，它完全指定其在跟踪层次结构中的位置。

举个例子：

```python
import langsmith as ls

@ls.traceable
def grandchild():
    p("grandchild")

@ls.traceable
def child():
    grandchild()

@ls.traceable
def parent():
    child()
```

如果您打印每个阶段的 ID，您可能会得到以下信息：

```python
parent	run_id=0e01bf50-474d-4536-810f-67d3ee7ea3e7	trace_id=0e01bf50-474d-4536-810f-67d3ee7ea3e7  parent_run_id=null	dotted_order=20240919T171648521691Z0e01bf50-474d-4536-810f-67d3ee7ea3e7
child	run_id=a8024e23-5b82-47fd-970e-f6a5ba3f5097	trace_id=0e01bf50-474d-4536-810f-67d3ee7ea3e7  parent_run_id=0e01bf50-474d-4536-810f-67d3ee7ea3e7	dotted_order=20240919T171648521691Z0e01bf50-474d-4536-810f-67d3ee7ea3e7.20240919T171648523407Za8024e23-5b82-47fd-970e-f6a5ba3f5097
grandchild	run_id=0ec6b845-18b9-4aa1-8f1b-6ba3f9fdefd6	trace_id=0e01bf50-474d-4536-810f-67d3ee7ea3e7  parent_run_id=a8024e23-5b82-47fd-970e-f6a5ba3f5097	dotted_order=20240919T171648521691Z0e01bf50-474d-4536-810f-67d3ee7ea3e7.20240919T171648523407Za8024e23-5b82-47fd-970e-f6a5ba3f5097.20240919T171648523563Z0ec6b845-18b9-4aa1-8f1b-6ba3f9fdefd6
```

注意一些不变量：* `id` 等于点分顺序的最后 36 个字符（最后 `'Z'` 之后的后缀）。例如，请参阅孙子中的`0ec6b845-18b9-4aa1-8f1b-6ba3f9fdefd6`。
* `trace_id` 等于点顺序中的第一个 UUID（即 `dotted_order.split('.')[0].split('Z')[1]`）
* 如果`parent_run_id`存在，则为点分顺序倒数第二个UUID。例如，请参见孙子中的`a8024e23-5b82-47fd-970e-f6a5ba3f5097`。
* 如果您在点上分割`dotted_order`，则每个段的格式为 (`<run_start_time>Z<run_id>`)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/run-data-format.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>