<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Filter traces | https://docs.langchain.com/langsmith/filter-traces -->

# 过滤痕迹

通过在搜索栏中编写过滤器查询来查找 LangSmith 跟踪项目中的特定线程、跟踪和运行。

过滤将 [trace container](/langsmith/observability-concepts#trace-containers) 中的 [runs](/langsmith/observability-concepts#runs) 缩小到需要注意的范围，例如出错的对话、缓慢的工具调用或以低反馈分数运行的对话。在搜索栏中编写查询，然后选择与查询匹配的 [trace](/langsmith/observability-concepts#traces) 或 [thread](/langsmith/observability-concepts#threads) 层次结构中运行的查询。

> [!注意]
>
> 追踪项目有两种过滤体验。检查项目的顶部，看看哪一个适合您：
>
> * **左侧带有范围选择器的单个搜索栏**：请参阅[Filter traces](/langsmith/filter-traces)。
> * **构建滤波器芯片的添加滤波器按钮**：参考[Filter traces (ClickHouse)](/langsmith/filter-traces-in-application)。

此页面涵盖：

* 搜索栏中的[Building a query](#build-a-query)
* [Choosing what a filter matches](#choose-what-a-filter-matches) 带瞄准镜
* [Query syntax](#query-syntax) 和 [fields](#fields) 可用于过滤
* [Examples](#examples) 复制和改编
* [Filtering in one click](#filter-with-shortcuts) 来自 **快捷方式** 面板
* [Saving a filter](#save-a-filter) 作为视图
* [Filtering the runs inside a trace](#filter-the-runs-in-a-trace)
* [Searching with AI](#search-with-ai) 采用自然语言而不是字段值（测试版）
* [What full-text search indexes](#full-text-search-indexing)
* [Troubleshooting a query](#troubleshoot-a-query)要以编程方式查询运行，请参阅[Query traces using the SDK](/langsmith/export-traces)。 SDK 和 REST API 使用单独的结构化查询语言，记录在 [Trace query syntax](/langsmith/trace-query-syntax) 中。要将搜索栏查询翻译成该语言，请参阅 [UI-to-API operator map](/langsmith/trace-query-syntax#ui-to-api-operator-map)。

## 构建查询

查询由子句组成，每个子句将一个字段与一个运算符和一个值配对：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
status:error
```

![The search bar of a tracing project, with the scope selector reading 'in root run' and a status:error clause. The suggestion list below it is open, with AI search, marked Beta and described as Search in plain language, highlighted at the top, followed by fields grouped under Run attributes, Content, and Identity. Navigate, Select, and Docs hints run along the bottom of the list](https://mintcdn.com/langchain-5e9cc07a/MoWOdSpeRhP-SZId/langsmith/images/filter-search-bar-light.png?fit=max\&auto=format\&n=MoWOdSpeRhP-SZId\&q=85\&s=bf265b28335ab17802f0a5d1a25d8e0a)

要构建查询，请单击搜索栏并开始输入：

**1.选择一个字段**

输入字段名称或从建议列表中选择一个。建议按类别分组，**最近**列出之前运行的查询。使用箭头键在列表中移动，然后按 `Enter` 进行选择。

如果您的组织可以使用 AI 搜索，**AI 搜索** 将显示在建议列表的顶部。参见[Search with AI](#search-with-ai)。

**2.选择运营商**

输入 `:` 查看该字段支持的运算符，每个运算符都有一个示例。

**3.输入一个值**

对于值LangSmith索引的字段，例如运行名称和标签，建议列表提供项目中最常见的值。

每个完成的条款都成为酒吧中的一个筹码。单击芯片进行编辑，或单击其删除图标将其删除。继续在一个芯片后输入以添加另一个子句。搜索栏外部的两个控件也会影响结果：

* **时间范围控制**与查询一起应用。结果必须在时间范围内并且与查询匹配。
* **线程、跟踪和运行选择** 设置表中每一行代表的内容，并且还确定查询可以使用哪个 [scopes](#choose-what-a-filter-matches)。

> [!注意]
>
> 搜索栏使用本页描述的语法，这不是 SDK 和 REST API 接受的结构化查询语言。有关该语言，请参阅[Trace query syntax](/langsmith/trace-query-syntax)。

## 选择过滤器匹配的内容

跟踪是运行树，线程是一系列跟踪。诸如 `status:error` 之类的子句是不明确的，除非您说出它适用于该层次结构中的哪个运行：启动跟踪的运行、跟踪中任何位置的任何运行或整个线程。搜索栏左侧的范围选择器就是您所说的地方。

有四种范围可供选择：

* **线程**：匹配整个线程。
* **根运行**：仅匹配条目运行。
* **单次运行**：匹配运行本身。
* **任何运行**：匹配树中的任何位置。

范围下拉列表根据示例跟踪预览每个选项，因此您可以在选择之前查看它涵盖哪些运行：

![The scope dropdown open on the Threads selection, offering Any run, Root run, and Thread with a one-line description of each. Beside the options is a preview of a sample thread showing three agent turns with the LLM and tool runs nested inside the second turn](https://mintcdn.com/langchain-5e9cc07a/Y2pGSOoQY1-mM7bz/langsmith/images/filter-scope-selector-light.png?fit=max\&auto=format\&n=Y2pGSOoQY1-mM7bz\&q=85\&s=d1b578063b0147c56a9c2adb325ac7d7)提供的范围以及默认选择的范围取决于表选择：

|餐桌选择|默认范围 |可用范围 |
| - | - | - |
| **话题** |任意运行 |线程、根运行、任意运行 |
| **痕迹** |根运行|根运行，任意运行 |
| **运行** |单跑 |单次运行、根运行、任意运行 |

要以简单的语言描述您想要的内容而不是编写查询语法，请使用 [AI search](#search-with-ai)。

### 合并范围

要一次过滤多个范围，请单击最后一行末尾的 **添加过滤范围** 图标。这将添加一行及其自己的范围选择器和搜索栏，标记为 **AND**。行与 `AND` 组合，因此线程、跟踪或运行必须满足表中出现的每一行。

每个范围最多包含一行，因此 **Threads** 和 **Runs** 选择接受三个过滤器行，而 **Traces** 接受两个过滤器行。一旦每个可用范围都在使用中，**添加过滤器范围**就会被禁用。要删除行，请单击其旁边的“**删除过滤器**”。

例如，在 **Threads** 视图中，查找长度超过 20 圈且包含失败的工具调用的线程：

|范围 |查询 |
| - | - |
|主题 | `turn_count:>20` |
|任意运行 | `run_type:tool AND status:error` |

![Two filter rows in the search bar. The first is scoped to 'in thread' with a turn_count greater than 20 clause, and ends with the AI search icon. The second, labeled AND, is scoped to 'in any run' with run_type tool AND status error, and ends with the Add filter scope icon. Below the bar, the Threads selection is active](https://mintcdn.com/langchain-5e9cc07a/Y2pGSOoQY1-mM7bz/langsmith/images/filter-multiple-scopes-light.png?fit=max\&auto=format\&n=Y2pGSOoQY1-mM7bz\&q=85\&s=88e8c40858fe0476193550eb93c343be)

### 表选择不能使用的范围更改表选择可能会在新选择不支持的范围内留下一行，例如从 **Runs** 切换到 **Threads** 后出现 **Single run** 行。该行保持可见，并带有 **未应用** 标记，并且其查询被保留但不应用。更改行的范围或返回兼容的表选择以再次应用它。

## 查询语法

### 运算符

字段接受的运算符取决于其类型。

|操作员|语法 |比赛|
| - | - | - |
|是 | `field:value` |值的精确匹配。 |
|不是| `-field:value` |除了完全匹配之外的一切。 |
|比赛| `field:~value` |该领域的全文搜索。引用该值以搜索短语。 |
|不匹配| `-field:~value` |全文搜索不匹配的所有内容。 |
|通配符 | `field:value*` |一种模式，其中 `*` 代表任意字符序列。 |
|存在 | `field:*` |记录设置字段的位置。 |
|不存在 | `-field:*` |记录未设置该字段的情况。 |
|比较| `field:>value` |高于给定值的值。还接受 `>=`、`<` 和 `<=`。 |
|包含范围 | `field:[10 TO 20]` |值从 10 到 20，包括两个界限。 ||独家系列| `field:{10 TO 20}` | 10 到 20 之间的值，不包括两个界限。 |
|混合系列| `field:[10 TO 20}` |值从 10 到 20（但不包括 20）。交换分隔符以反转包含的边界。 |

某些字段仅接受这些运算符的子集：

* **全文字段**：`input`、`output`、`metadata` 和 `error` 仅接受 `~`。
* **比较和范围运算符**：这些适用于数字字段（例如 `latency` 和 `total_tokens`）、时间戳字段（例如 `first_token_time`）以及数字 [⟦T44⟧ paths](#match-a-json-key)。

要匹配多个值中的任何一个，请将子句与 `OR` 组合，例如 `status:error OR status:interrupted`。不支持在一个子句中列出多个值。

### 合并子句

将子句与 `AND`、`OR`、`NOT` 和括号组合：

* **`AND`**：两个子句必须匹配。两个子句之间的空格充当 `AND`，因此 `status:error run_type:llm` 和 `status:error AND run_type:llm` 是等效的。
* **`OR`**：任一子句必须匹配。
* **`NOT`**：否定后面的子句。 `-` 前缀执行相同的操作，因此 `NOT status:error` 和 `-status:error` 是等效的。
* **括号**：分组子句以控制优先级。

`AND` 比 `OR` 结合更紧密，因此 `a OR b AND c` 与 `a OR (b AND c)` 匹配。分组条款来改变这一点：`(a OR b) AND c`。

关键字不区分大小写。

### 引用值用双引号包含空格、冒号或包含字面匹配字符的值：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
name:"docs agent"
tags:"env:prod"
```

引用还会关闭通配符匹配，因此 `name:"docs*"` 匹配文字字符串 `docs*`。作为引用的替代方法，可以使用反斜杠转义字符，如 `name:docs\ agent` 所示。

在运行范围中，包含空格的不带引号的值分为两个子句，因此 `name:docs agent` 匹配名称为 `docs` 且索引内容包含 `agent` 的运行。

### 不命名字段的搜索

在 **单次运行**、**根运行** 和 **任何运行** 范围中，裸术语搜索每个 [indexed field](#full-text-search-indexing)：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
"capital of France"
```

**Thread** 范围不支持裸词搜索。

## 字段

建议列表将字段分组。可用字段取决于过滤器行的[scope](#choose-what-a-filter-matches)。

### 运行字段

这些字段在 **单次运行**、**根运行** 和 **任何运行** 范围中可用。

**运行属性**

|领域|描述 |
| - | - |
| `name` |运行名称。支持通配符。 |
| `status` |运行状态：`pending`、`success`、`error`或`interrupted`。 |
| `run_type` | [type of run](/langsmith/run-data-format#run-types)，例如 `llm`、`chain`、`tool` 或 `retriever`。 |
| `tags` |运行标签。如果运行中的任何标记匹配，则子句匹配。 |

**内容**|领域|描述 |
| - | - |
| `input` |运行输入。使用 `~` 搜索文本，或使用 `input.<key>` 匹配 JSON 键。 |
| `output` |运行输出。使用 `~` 搜索文本，或使用 `output.<key>` 匹配 JSON 键。 |
| `metadata` |运行元数据。使用 `metadata.<key>` 匹配 JSON 键，或使用 `~` 搜索元数据值。 |
| `error` |错误文本。使用`~`搜索文本。 |
| `attachments` |附件名称。 |

**身份**

|领域|描述 |
| - | - |
| `id`、`trace_id`、`thread_id`、`parent_run_id` |按 ID 匹配特定运行、跟踪、线程或父运行。 |
| `ls_user_id` |运行所属的 LangSmith 用户。 |

**性能**

|领域|描述 |
| - | - |
| `latency` |运行持续时间（以秒为单位）。 |
| `first_token_time` |当第一个代币产生时。 |
| `prompt_tokens`、`completion_tokens`、`total_tokens` |运行的令牌计数。 |
| `prompt_cost`、`completion_cost`、`total_cost` |运行成本。 |
| `prompt_token_details`、`completion_token_details` |代币故障。使用点符号寻址组件，例如 `prompt_token_details.cache_read` 或 `completion_token_details.reasoning`。 |
| `prompt_cost_details`、`completion_cost_details` |成本细分，与代币细分具有相同的组成部分。 |

**反馈**

|领域|描述 |
| - | - |
| `feedback` |跑步反馈。请参阅[Filter on feedback](#filter-on-feedback)。 |元数据和标签通常是最高效的过滤字段，因为您可以控制其中的内容。参见[Add metadata and tags to traces](/langsmith/add-metadata-tags)。

### 线程字段

**Thread** 范围对整个线程的属性进行过滤，因此它支持一组不同的字段。建议列表标记组**线程属性**。

|领域|描述 |
| - | - |
| `thread_id` |线程 ID。 |
| `turn_count` |旋入螺纹。 |
| `num_errored_turns` |以错误结束的回合。 |
| `thread_duration` |第一个回合开始到最后一个回合结束。 |
| `trace_latency_p50` |中值转弯延迟。 |
| `trace_latency_p99` | P99 转弯延迟。 |
| `total_tokens` |跨线程的令牌。 |
| `total_cost` |整个线程的成本。 |
| `prompt_token_details`、`completion_token_details`、`prompt_cost_details`、`completion_cost_details` |整个线程的令牌和成本细分。 |

> [!注意]
>
> `name`、`status` 和 `input` 等运行字段在 **Thread** 范围内不可用。要按线程包含的运行的属性过滤线程，请在 **任何运行** 范围中添加第二个过滤器行。参见[Combine scopes](#combine-scopes)。

### 匹配 JSON 键

`input`、`output` 和 `metadata` 保存 JSON。用点符号寻址其中的键：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata.env:production
input.user_id:abc123
output.status:success
```

嵌套路径的工作方式相同，例如 `metadata.config.temperature:0.7`。引用包含点的键，如 `metadata."my.key":production` 中。只有 `metadata` 路径支持比较和范围运算符，并且仅当值为数字时：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata.retries:>=3
```

### 过滤反馈

使用点符号寻址反馈键及其子字段之一：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
feedback.correctness.score:>=0.5
feedback.relevance.value:pass
feedback.quality.comment:~helpful
```

可用的子字段为 `key`、`score`、`value`、`comment`、`source` 和 `error`。在 **Thread** 范围内，仅 `key`、`score` 和 `value` 可用。

要匹配包含任何反馈的记录，请使用`feedback:*`。要匹配带有特定反馈键（无论其值如何）的记录，请使用 `feedback.<key>:*`。比较值需要命名子字段，因此 `feedback.correctness:0.5` 无效。

将反馈条件与 `feedback:{...}` 分组：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
feedback:{correctness.score:>0.5}
```

## 示例

要复制和调整的查询。除非另有说明，否则每个表都假定其表选择的默认范围。

**错误的 LLM 调用也很慢。**使用 **运行** 选择：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
run_type:llm AND status:error AND latency:>10
```

**运行您的评估器得分较低。** 使用 **运行** 选择：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
run_type:llm AND feedback.correctness.score:<0.5
```

**生产流量未成功。** 使用 **Traces** 选择：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata.env:production AND -status:success
```

**提及某个主题但出错的对话。** 使用 **主题** 选择：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
input:~"refund" AND status:error
```**调用特定工具的跟踪。** 将 **Traces** 选择与 **Any run** 范围结合使用，因此该子句会与跟踪中的每个运行而不是条目运行相匹配：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
run_type:tool AND name:search_documents
```

**昂贵的痕迹。** 使用 **痕迹** 选择：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
total_cost:>0.5
```

## 使用快捷方式过滤

表左侧的“快捷方式”面板列出了项目中最常见的值，按“状态”、“运行名称”、“运行类型”、“标签”、“元数据”和“反馈”分组。这些组对应于 `status`、`name`、`run_type`、`tags`、`metadata` 和 `feedback` 字段。选择一个值会将匹配子句添加到搜索栏，因此最常见的过滤器只需单击一下即可，而不是键入查询。

每个组标题显示其有多少值处于活动状态。使用 **反馈** 组中的搜索框查找反馈键。

![The Shortcuts panel to the left of the runs table, with Status, Run Name, Run Type, and Tag groups. The error value is checked, the Status group header reads '1 active', and the search bar above holds the matching status:error clause](https://mintcdn.com/langchain-5e9cc07a/ehnk1iZnpoz5HhfY/langsmith/images/filter-shortcuts-panel-light.png?fit=max\&auto=format\&n=ehnk1iZnpoz5HhfY\&q=85\&s=30bd1a16e36e4b87c5c1cebdf41e9944)

要为表格提供更多空间，请单击“**隐藏快捷方式**”，然后单击“**显示快捷方式**”以恢复面板。右侧的**统计**面板以同样的方式折叠，带有**隐藏统计信息**和**显示统计信息**。

## 保存过滤器保存的视图存储一个过滤器以供重复使用。视图属于一个[environment](/langsmith/agent-environments)，而不是创建它的人，因此任何有权访问该环境的人都可以选择它。 **暂存**中不提供**生产**中保存的视图，并且必须在每个环境中保存您想要在每个环境中使用的过滤器。

保存当前过滤器：

1. [Build the query](#build-a-query)。
2. 单击**保存视图**。
3. 输入名称和描述，然后保存。

然后，该视图将显示在 **视图** 下拉列表中与 **默认视图** 一起。每个条目都会列出其过滤器使用的范围，一目了然地显示它是否适用于当前的表选择。

要更新已保存的视图，请选择它，更改查询，然后单击“**保存视图**”。要重命名或删除视图，请在 **视图** 下拉列表中单击该视图旁边的图标。

要放弃未保存的更改并返回到所选视图，请单击 **重置**。

### 使用先前语法保存的视图

在此过滤体验发布之前保存的视图将继续有效。选择一个会将其过滤器转换为本页上的语法，并且LangSmith会提示您保存翻译后的视图。

## 过滤跟踪中的运行在开放跟踪内进行过滤会突出显示匹配的运行，这就是您在大型跟踪中找到重要运行的方法。打开线程或跟踪以到达[Details view](/langsmith/view-traces#details-view)，然后使用运行列表上方的**过滤运行**。

匹配的运行会在适当的位置突出显示，并且跟踪的其余部分在它们周围保持可见，因此匹配会保留解释它的上下文。在 **任何运行** 范围中应用的过滤器会自动延续，因此从表中打开线程或跟踪会突出显示与其匹配的运行。

![The Details view of a thread. The Turns pane on the left holds a filter reading input contains list, and the runs matching it are highlighted within the surrounding trace tree, which stays fully visible. The selected run is shown on the right](https://mintcdn.com/langchain-5e9cc07a/ehnk1iZnpoz5HhfY/langsmith/images/filter-trace-highlighting-light.png?fit=max\&auto=format\&n=ehnk1iZnpoz5HhfY\&q=85\&s=1638cfd18a0072c77491bb83a9afef53)

此搜索栏接受与项目页面上的 **单次运行** 范围相同的字段和语法。它没有范围选择器，因为它始终与开放跟踪中的各个运行相匹配。要删除过滤器，请单击过滤器框中的清除图标。

应用过滤器时，运行列表上方图标后面的**可见性**选项、**最相关**和**显示全部**将被禁用。

## 使用人工智能搜索

人工智能搜索将简单语言描述转变为搜索。描述您想要什么，LangSmith 确定过滤器、表格选择、时间范围以及有关对话中发生的情况的任何条件。例如：

* `threads with more than 5 turns where the user got confused`
* `llm calls that errored in the last 2 days`
* `threads where agent didn't complete the task and spent more than $1`描述可以将 [query syntax](#query-syntax) 表达的条件（例如状态、成本、延迟或回合数）与取决于消息含义的条件（例如用户是否感到沮丧或代理是否完成了任务）结合起来。

> [!注意]
>
> AI 搜索位于 [beta](/langsmith/release-stages) 中，并且可在所有 [LangSmith Cloud](/langsmith/cloud) SaaS 实例上使用。一旦组织管理员启用它，它就可以在**线程**、**跟踪**和**运行**选项中工作。请参阅[Enable AI search](#enable-ai-search)。

使用 AI 进行搜索：

1. 通过以下方式之一打开AI搜索：

   * 单击第一个过滤器行中的 **AI 搜索** 图标。
   * 选择搜索栏建议列表顶部的 **AI 搜索**。您输入的任何文本都会作为描述的开头。

   如果已应用过滤器，LangSmith 将在字段中填充过滤器的描述，以便您可以对其进行优化。
2. 描述您正在寻找什么。虽然该字段为空，但其下方的提示提供了示例。选择示例即可填充字段而无需搜索，因此您可以先对其进行编辑。
3. 按`Enter`，或单击**搜索**按钮。

当您搜索时，LangSmith 会解释描述并应用结果：* **过滤器**：结构化条件成为匹配[scopes](#choose-what-a-filter-matches)中的过滤器。关于对话含义的条件，例如`the user got confused`，成为与每个[trajectory](#what-ai-search-matches)匹配的AI条件。
* **表选择**：LangSmith 切换到符合描述的 **线程**、**跟踪** 或 **运行** 选择。
* **时间范围**：描述中的时间段，如`in the last 2 days`，更新时间范围控制。

在搜索栏下方，**显示结果：**列出了 LangSmith 在每个范围中应用的内容，因此您可以检查它如何读取描述。如果描述不明确，LangSmith 显示 **您是说吗？** 并提供可供选择的选项，而不是搜索。

输入新的描述不会清除表格，因此当前结果保持可见，直到您再次搜索。要编写新描述，请单击 **清除 AI 搜索**。

当结果包含 AI 条件时，它们会包含一个 **置信度** 列，以百分比形式显示每个线程、跟踪或运行的匹配程度。没有分数的结果显示破折号。

### 编辑应用的过滤器要调整LangSmith应用的内容，请单击 **AI 搜索** 芯片上的 **退出 AI 搜索**。搜索栏返回到[filter rows](#build-a-query)，其中包含已应用的过滤器，您可以直接对其进行编辑。 AI 条件保持为只读行。如需返回AI搜索，请再次打开；如果您没有更改过滤器，LangSmith 会恢复您最后的描述。

结果必须匹配每个应用的过滤器、AI 条件和时间范围。描述最多可达 2,000 字节。

### 使用 SDK 进行 AI 搜索

SDK 流式查询方法接受运行、跟踪和线程的`ai_search`。 LangSmith 以与 UI 相同的方式解释描述：结构化条件成为过滤器，描述中的时间段设置时间范围，并且有关对话的条件与每个轨迹进行匹配。您调用的方法设置范围。 SDK中的AI搜索与UI具有相同的[organization opt-in and data-handling requirements](#enable-ai-search)。

> [!注意]
>
> 以下示例需要 `langsmith>=0.14.14`（对于 Python）或 `langsmith>=0.11.3`（对于 TypeScript）。

> [选项卡] Python
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langsmith import Langsmith
>
> client = Langsmith()
>
> for thread in client.threads.streaming.query_items(
>     project_id="<project-id>",
>     ai_search="threads where the agent didn't complete the task and spent more than $1",
> ):
>     print(thread.thread_id)
> ```
>
> 要搜索运行或轨迹，请调用匹配方法：
>
> * **运行**：`client.runs.streaming.query_v2_items(project_ids=["<project-id>"], ai_search="llm calls that errored in the last 2 days")`
> * **痕迹**：`client.traces.streaming.query_items(project_id="<project-id>", ai_search="traces where the user got confused")`
>
> 对于`AsyncLangsmith`，以相同的方法使用`async for`。> [选项卡] TypeScript
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import Langsmith from "langsmith";
>
> const client = new Langsmith();
>
> for await (const thread of client.threads.streaming.queryItems({
>   project_id: "<project-id>",
>   ai_search: "threads where the agent didn't complete the task and spent more than $1",
> })) {
>   console.log(thread.thread_id);
> }
> ```
>
> 要搜索运行或轨迹，请调用匹配方法：
>
> * **运行**：`client.runs.streaming.queryV2Items({ project_ids: ["<project-id>"], ai_search: "llm calls that errored in the last 2 days" })`
> * **痕迹**：`client.traces.streaming.queryItems({ project_id: "<project-id>", ai_search: "traces where the user got confused" })`

当您通过`ai_search`时：

* 描述必须非空且最多 2,000 个 UTF-8 字节。
* 请勿同时通过 `filter`、`trace_filter`、`tree_filter` 或 `thread_filter`。 LangSmith 根据描述构建这些内容，设置两者的请求将返回 HTTP `400`。其他参数（例如所选字段和页面大小）照常应用。
* 描述中的时间段取代了`min_start_time`和`max_start_time`。 Bounds 描述没有提到保留您传递的值或方法的默认值。

`query_v2_items` / `queryV2Items` 和 `query_items` / `queryItems` 方法遵循分页游标并返回组装的运行、跟踪或线程。较低级别的 `query_v2` / `queryV2` 和 `query` 方法返回服务器发送的包含 JSON 补丁的事件。

AI搜索需要`Accept: text/event-stream`，这是流媒体方法自动设置的。将 `ai_search` 传递给非流式查询将返回 HTTP `406`。将查询路由到旧版 v1 后端的部署返回 HTTP `501`。

终端使用请参见[Search with AI using the CLI](/langsmith/langsmith-cli#search-with-ai)。

### 查看结果匹配的原因当您从 AI 搜索结果中打开线程、跟踪或运行时，LangSmith 会在[Trajectory view](/langsmith/view-traces#trajectory-view) 中与描述匹配的消息处打开它，以便您可以了解其匹配的原因。线程在第一个匹配的跟踪处打开。查看比赛需要查看运行输入和输出的权限。

视图顶部的工具栏显示描述、结果的匹配置信度和 **M 的证据 N**。 LangSmith 突出显示每条匹配的消息并将其标记为 **M 的证据 N**。该计数仅包括 LangSmith 可以在对话中找到的匹配项。无法找到的匹配项，例如轨迹视图未显示的消息或对话中重复的文本，不会显示。

使用工具栏中的向上和向下箭头在匹配项之间移动，并使用 图标离开证据模式。

### 人工智能搜索限制* **保存的视图**：包含 AI 搜索的过滤器无法保存为 [view](#save-a-filter)。退出 AI 搜索并删除 AI 条件以保存剩余的筛选器。选择已保存的视图会清除 AI 搜索。
* **链接**：AI 搜索描述不存储在页面 URL 中，因此复制的链接不包含它。
* **最近**：包含 AI 搜索的过滤器不会出现在搜索栏建议列表中的 **最近** 下。
* **统计**： **统计** 面板显示 **不可用于 AI 搜索的统计**，而 **快捷方式** 面板隐藏值计数。要删除 AI 条件并恢复统计信息，请单击 **统计** 面板中的 **清除 AI 过滤器**。
* **速率限制**：每个工作区的 AI 搜索请求速率受到限制。

### AI 搜索匹配什么

搜索的 AI 条件在 [trajectory](/langsmith/observability-concepts#trajectories) 上运行：LangSmith 根据跟踪构建的人类、AI 和工具消息的有序列表。它将描述的对话部分与每个轨迹进行匹配，然后返回关联轨迹匹配的线程、跟踪或运行。LangSmith 从 LLM 运行构建轨迹消息，因此超过运行的 AI 条件仅返回 LLM 运行。针对另一种运行类型（例如具有 **单次运行** 范围的 `run_type:tool`）的运行本身的过滤器不会返回任何结果。 **任何运行** 过滤器仍然有效，因为它与跟踪中的其他运行相匹配。

AI 条件仅读取轨迹。轨迹不包含的条件，例如运行状态、成本、延迟或转弯计数，将变为 [structured filters](#edit-the-applied-filters)。检查 **显示结果：** 以确认条件已应用为过滤器；如果不是，则[write it as a query](#build-a-query)，例如`status:error`或`name:docs_agent`。

AI 条件读取主要代理的对话。它不读取子代理、中间件或压缩消息的内容，因此它无法将描述与它们内部发生的情况进行匹配。

如果 AI 搜索未返回您期望的线程、跟踪或运行，请检查 **显示结果：** 下列出的时间范围和过滤器，它们与 AI 条件一起应用。如果两者都不排除它，LangSmith可能无法正确地将其轨迹解析为轨迹。

### 启用人工智能搜索在组织管理员启用人工智能搜索之前，人工智能搜索将处于关闭状态。它在 LangChain 托管推理上运行，因此不需要模型提供程序 API 密钥。启用它适用于组织的每个成员。

启用 AI 搜索确认您有权允许将组织的跟踪数据传输到美国并在美国进行处理（包括通过[LangChain's subprocessors](https://trust.langchain.com/subprocessors)），并且您了解托管和数据驻留的影响。

> [!警告]
>
> 请勿使用 AI 搜索受保护的健康信息 (PHI)。目前，您的组织与 LangChain 签署的任何业务伙伴协议 (BAA) 均不涵盖人工智能搜索。

从组织设置启用 AI 搜索需要组织管理员权限。要启用它：

1. 转到组织设置中的 **设置** > **AI 搜索**。
2. 打开**启用AI搜索**。

要选择退出，请关闭开关。

您还可以从跟踪页面启用人工智能搜索。在启用之前，AI 搜索字段会显示 **管理员必须选择启用 AI 搜索** 来代替搜索字段。单击通知打开启用对话框：* **组织管理员**：单击 **启用 AI 搜索**。然后，AI 搜索字段会接受描述。
* **其他成员**：点击**请求管理员启用人工智能搜索**。 LangSmith 向组织管理员发送电子邮件，对话框确认请求已提交。

## 全文搜索索引

`~` 运算符和 [bare-term searches](#search-without-naming-a-field) 与派生搜索索引匹配，而不是与存储的运行数据匹配。 LangSmith 通过从运行输入、输出和错误中的字符串值递归地提取搜索标记来构建该索引。对象键没有索引，并且值既不会因其长度而被拒绝或截断。

以下限制适用于该索引：* **每个字段的标记**：LangSmith 为每个索引字段保留最多 2,000 个不同的搜索标记，从最多 200,000 个不同的候选者中选择。
* **嵌套深度**：LangSmith 处理嵌套数据的最大深度为 30。
* **令牌长度**：搜索令牌的长度为 2 到 44 个 ASCII 文本字符。超出该范围的字符串不会被索引，并且非 ASCII 文本是按其占用的空间而不是字符数来衡量的。
* **排除的内容**：URL、图像数据 URL、纯数字标记以及常见停用词（例如“the”和“of”）不会被索引。

这些限制仅管理搜索索引。运行数据被完整存储，因此索引遗漏的值在跟踪本身中仍然可见。

元数据和关键路径单独索引。键路径过滤不受全文令牌限制的约束，并且 LangSmith 目前未发布单独的限制。诸如 `input.<key>` 或 `metadata.<key>` 之类的过滤器会在特定路径中查找值，因此它仍然可以匹配全文索引省略的值。参考[Match a JSON key](#match-a-json-key)。

## 查询故障排除**搜索栏将查询标记为无效。** 搜索栏会在您键入时进行验证，并内联命名问题，包括未知的字段名称、不平衡的引号或括号以及用空格与其冒号分隔的运算符。修正它指向的子句。

**查询有效，但没有匹配任何内容。** 按顺序完成这些操作：

1. **检查时间范围。** 它与查询一起应用，因此如果匹配运行落在窗口之外，正确的过滤器仍然不会返回任何内容。
2. **检查范围。** 针对错误的层次结构级别进行测试的子句是最常见的原因。在 **Root run** 范围内过滤 `run_type:llm` 上的跟踪仅匹配其条目运行是 LLM 调用的跟踪，这很少是您想要的。将该行切换到 **任意运行**。
3. **检查“未应用”标志。** 当前表选择不支持的范围内的行将被保留，但不会应用。
4. **检查该值是否已编入索引。** 全文搜索会跳过 URL、停用词、纯数字标记以及非常短或非常长的标记。相反，过滤[JSON key](#match-a-json-key)，不受这些限制。

## 另请参阅

* [View traces](/langsmith/view-traces)
* [Threads](/langsmith/threads)
* [Add metadata and tags to traces](/langsmith/add-metadata-tags)
* [Trace query syntax](/langsmith/trace-query-syntax) 用于 SDK 和 REST API 查询语言
* [Query traces using the SDK](/langsmith/export-traces)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/filter-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。