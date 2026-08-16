<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Filter traces | https://docs.langchain.com/langsmith/filter-traces-in-application -->

# 过滤痕迹

跟踪项目可以跨[threads](/langsmith/observability-concepts#threads)、[traces](/langsmith/observability-concepts#traces)和[runs](/langsmith/observability-concepts#runs)积累大量数据。 LangSmith 的过滤工具可让您精确导航和分析数据。

此页面涵盖：

- [Applying filters from the filter bar](#create-and-apply-filters) 和 **过滤器快捷方式** 面板
- [Filtering by attributes, full-text content, and key-value pairs](#specific-filtering-techniques)
- [Saving and copying filter configurations](#save-a-filter)
- [Filtering within the Details view](#filter-runs-in-the-details-view)
- [Advanced filters](#advanced-filters) 用于过滤根或子运行属性

如果您通过 [API](/langsmith/smith-api/run/query-runs) 或 [SDK](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.list_runs) 以编程方式导出数据进行分析，请改为参阅 [exporting traces guide](/langsmith/export-traces)。

## 创建并应用过滤器

### 按运行属性过滤

有两种方法可以过滤跟踪项目中的数据：

1. **过滤器**：位于**追踪**项目页面的左上角。您可以在此处构建和管理过滤条件。
    - 第一个下拉菜单过滤默认值和[saved views](#save-a-filter)。
    - 按**线程**、**跟踪**或**运行**进行快速过滤。
    - **将过滤器**添加到属性或全文搜索的[configure a filter based](#specific-filtering-techniques)。

1. **过滤器快捷方式**：位于**跟踪**项目页面的右侧边栏。过滤器快捷方式栏提供对基于项目运行中最常出现的属性的过滤器的快速访问。

### 过滤运算符可用的过滤运算符取决于您要过滤的属性的数据类型。以下是常见运算符的概述：

- **is**：与过滤器值完全匹配
- **不是**：过滤器值的负匹配
- **包含**：过滤器值部分匹配
- **不包含**：过滤器值的负部分匹配
- **是其中之一**：匹配列表中的任何值
- `>` / `<`：适用于数字字段

## 具体过滤技巧

### 运行过滤器（跨度）

要过滤运行（跨度），请将默认值从 **Traces** 更改为 **Runs**。例如，如果您想按 **运行名称** 过滤运行或按 **运行类型** 过滤，则可以执行此操作。

运行元数据和标签对于过滤也很有用。这些依赖于管道所有部分的良好标记。要了解更多信息，请参阅[Add metadata and tags to traces](/langsmith/add-metadata-tags)。

当您指定更多过滤器时，您可以单独单击每个过滤器来更新您正在搜索的属性。

### 基于输入和输出的过滤器

您可以根据线程、跟踪或运行的输入和输出中的内容过滤跟踪数据。要过滤输入或输出，您可以使用**<Icon icon="zoom"/>全文搜索**过滤器，它将匹配任一字段中的关键字。要进行更有针对性的搜索，您可以使用 **{<Icon icon="arrow-down-right"/>} 输入** 或 **<Icon icon="arrow-up-left"/> 输出** 过滤器，它们仅根据相应字段匹配内容。

<Note>
为了提高性能，LangSmith 为全文搜索索引最多 250 个字符的数据。如果您的搜索查询超出此限制，我们建议改用[Input/Output key-value search](/langsmith/filter-traces-in-application#filter-based-on-input-%2F-output-key-value-pairs)。
</Note>

您还可以指定多个以匹配提供的所有术语，方法是：

- 通过**全文搜索**包含由空格分隔的多个术语。
- 添加第一个过滤器后，使用 <Icon icon="plus"/> 按钮添加多个过滤器。

LangSmith 分割文本并以任意顺序匹配任何部分关键字匹配。 LangSmith 从搜索中排除常见停用词（从 nltk 停用词列表以及其他一些常见 JSON 关键字）。

<Note>
令牌的长度必须至少为 2 个字符才能编制索引。单字符标记（例如，`a`、`x`）从搜索中排除。
</Note>

<img
    className="block dark:hidden"
    src="/langsmith/images/filter-bar-search-light.png"
    alt="LangSmith filter bar showing full-text search and input/output filters with example search terms for python, tensorflow, embedding, fine, and tune"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/filter-bar-search-dark.png"
    alt="LangSmith filter bar showing full-text search and input/output filters with example search terms for python, tensorflow, embedding, fine, and tune"
/>根据图像中的过滤器，系统将在输入或输出中搜索`python`和`tensorflow`，并在输入中搜索`embedding`以及输出中的`fine`和`tune`。

您可以根据需要从过滤器路径中删除过滤器，这会将搜索范围扩大到剩余的过滤器。

### 根据输入/输出键值对进行过滤

除了全文搜索之外，您还可以根据输入和输出中的特定键值对进行过滤。这允许更精确的过滤，特别是在处理结构化数据时。

<Note>
LangSmith 每次运行最多可索引 100 个唯一键，以保持数据井然有序且可搜索。每个键的每个值的字符数限制为 250 个字符。如果您的数据超出其中任一限制，则文本将不会被索引。这有助于确保快速、可靠的性能。
</Note>

基于键值对进行过滤，例如匹配以下输入：

```json
{
  "input": "What is the capital of France?"
}
```

1. 选择**添加过滤器**。
1. 从第一个下拉列表中选择 **Input**，将 **Key** 保留为第二个下拉列表，然后选择 **input** 作为键。
1. 单击 **+ Value** 并输入值：`What is the capital of France?` 作为值。您还可以通过使用点表示法选择嵌套键名称来匹配嵌套键。例如，要匹配输出中的嵌套键：

```json
{
  "documents": [
    {
      "page_content": "The capital of France is Paris",
      "metadata": {},
      "type": "Document"
    }
  ]
}
```

选择 **Output Key**，输入 `documents.page_content` 作为键，输入 `The capital of France is Paris` 作为值。这会将嵌套键 `documents.page_content` 与指定值匹配。

您可以添加多个键值过滤器来创建更复杂的查询。您还可以使用右侧的**过滤快捷键**根据常用键值对快速过滤：

<img
    className="block dark:hidden"
    src="/langsmith/images/filter-shortcut-pane-light.png"
    alt="LangSmith filter shortcuts panel showing quick access to common key-value pair filters"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/filter-shortcut-pane-dark.png"
    alt="LangSmith filter shortcuts panel showing quick access to common key-value pair filters"
/>

### 示例：过滤工具调用

想要搜索包含特定工具调用的跟踪是很常见的。工具调用通常在 LLM 运行的输出中指示。要过滤工具调用，您可以使用 **Output Key** 过滤器。

虽然此示例将向您展示如何过滤工具调用，但您可以应用相同的逻辑来过滤输出中的任何键值对。

在本例中，我们假设这是您要过滤的输出：

```json
{
  "generations": [
    [
      {
        "text": "",
        "type": "ChatGeneration",
        "message": {
          "lc": 1,
          "type": "constructor",
          "id": [],
          "kwargs": {
            "type": "ai",
            "id": "run-ca7f7531-f4de-4790-9c3e-960be7f8b109",
            "tool_calls": [
              {
                "name": "Plan",
                "args": {
                  "steps": [
                    "Research LangGraph's node configuration capabilities",
                    "Investigate how to add a Python code execution node",
                    "Find an example or create a sample implementation of a code execution node"
                  ]
                },
                "id": "toolu_01XexPzAVknT3gRmUB5PK5BP",
                "type": "tool_call"
              }
            ]
          }
        }
      }
    ]
  ],
  "llm_output": null,
  "run": null,
  "type": "LLMResult"
}
```

在示例中，KV 搜索会将每个嵌套 JSON 路径映射为可用于搜索和过滤的键值对。

LangSmith 会将其分解为以下一组可搜索的键值对：|关键|价值|
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `generations.type` | `ChatGeneration` |
| `generations.message.type` | `constructor` |
| `generations.message.kwargs.type` | `ai` |
| `generations.message.kwargs.id` | `run-ca7f7531-f4de-4790-9c3e-960be7f8b109` |
| `generations.message.kwargs.tool_calls.name` | `Plan` |
| `generations.message.kwargs.tool_calls.args.steps` | `Research LangGraph's node configuration capabilities` |
| `generations.message.kwargs.tool_calls.args.steps` | `Investigate how to add a Python code execution node` |
| `generations.message.kwargs.tool_calls.args.steps` | `Find an example or create a sample implementation of a code execution node` |
| `generations.message.kwargs.tool_calls.id` | `toolu_01XexPzAVknT3gRmUB5PK5BP` |
| `generations.message.kwargs.tool_calls.type` | `tool_call` |
| `type` | `LLMResult` |要搜索特定工具调用，您可以使用以下 **输出键** 搜索，同时删除根运行过滤器：

`generations.message.kwargs.tool_calls.name` = `Plan`

这将匹配根和非根运行，其中 `tool_calls` 名称为 `Plan`。

### 对键值对进行负向过滤

不同类型的否定过滤可以应用于 **\{x} 元数据**、**<Icon icon="arrow-down-right"/> 输入** 和 **<Icon icon="arrow-up-left"/> 输出** 字段，以从结果中排除特定运行。

例如，要查找元数据键 `phone` 不等于 `1234567890` 的所有运行：

1. 将 **Metadata Key** 运算符设置为 `is`，将 **Key** 字段设置为 `phone`。
1. 将 **Value** 运算符设置为 `is not`，将 **Value** 字段设置为 `1234567890`。

这将匹配元数据键 `phone` 与除 `1234567890` 之外的任何值的所有运行。

要查找没有特定元数据键的运行：将 **Key** 运算符设置为 `is not`。例如，将 `Key` 运算符设置为 `is not`，并以 `phone` 作为键，将匹配元数据中没有 `phone` 字段的所有运行。您还可以过滤既没有特定键也没有特定值的运行。要查找元数据既没有键 `phone` 也没有任何具有值 `1234567890` 的字段的运行，请将 **Key** 运算符设置为 `is not`，键为 `phone`，将 **Value** 运算符设置为 `is not`，值 `1234567890`。

最后，您还可以过滤没有特定键但具有特定值的运行。要查找没有 `phone` 键但其他键有 `1234567890` 值的运行，请将 **Key** 运算符设置为 `is not`，键为 `phone`，将 **Value** 运算符设置为 `is`，值 `1234567890`。

<Tip>
您可以使用 `does not contain` 运算符代替 `is not` 来执行子字符串匹配。
</Tip>

## 保存过滤器

保存过滤器允许您存储和重复使用常用的过滤器配置。保存的过滤器特定于跟踪项目。

构建过滤器后，单击 **另存为** 按钮进行保存。这将弹出一个对话框来指定过滤器的名称和描述。

保存过滤器后，它会在视图下拉列表中作为快速过滤器供您使用。

### 更新已保存的过滤器在下拉列表中选择过滤器后，您可以对过滤器参数进行任何更改。然后，单击 **保存** 以更新过滤器。

### 删除已保存的过滤器

单击下拉列表中已保存过滤器旁边的 <Icon icon="dots-vertical"/> 图标，然后使用垃圾桶 <Icon icon="trash"/> 图标删除过滤器。

## 复制过滤器

您可以复制构建的过滤器以与同事共享，稍后重复使用，或者在[API](/langsmith/smith-api/run/query-runs)或[SDK](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.list_runs)中以编程方式运行查询。

复制过滤器：

1. 在 UI 中创建它。
1. 单击过滤栏中的<Icon icon="copy"/>图标。如果您构建了树或跟踪过滤器，您也可以复制它们。
1. 这将为您提供一个表示 LangSmith 查询语言中的过滤器的字符串。例如：`and(eq(is_root, true), and(eq(feedback_key, "user_score"), eq(feedback_score, 1)))`。

有关查询语言语法的更多信息，请参阅[Trace query syntax](/langsmith/trace-query-syntax#filter-query-language)。

## 过滤器在“详细信息”视图中运行

您还可以直接在[Details view](/langsmith/view-traces#details-view)中应用过滤器，这对于筛选具有大量运行的轨迹非常有用。此处可以应用主运行表视图中可用的相同过滤器。默认情况下，仅显示与过滤器匹配的运行。要在跟踪树的更广泛上下文中查看匹配的运行，请将视图选项从“仅过滤”切换为“显示全部”或“最相关”。

<img
    className="block dark:hidden"
    src="/langsmith/images/trace-view-filter-light.png"
    alt="LangSmith trace view showing filter options with 'Filtered Only', 'Show All', and 'Most relevant' view modes"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/trace-view-filter-dark.png"
    alt="LangSmith trace view showing filter options with 'Filtered Only', 'Show All', and 'Most relevant' view modes"
/>

## 使用LangSmith查询语言手动指定原始查询

如果您有 [copied a previously constructed filter](#copy-a-filter)，您可能需要在将来的会话中手动应用此原始查询。

为此，您可以单击“详细信息”视图中过滤器弹出窗口底部的“**切换到原始查询**”。您可以从那里将原始查询粘贴到文本框中。

<Note>
这会将该查询添加到现有查询中，而不是覆盖它。
</Note>

## 高级过滤器

### 过滤根属性上的运行（跨度）

一个常见的概念是过滤属于其根运行具有某些属性的跟踪的一部分的运行。一个示例是过滤特定类型的运行，其根运行具有与其关联的正（或负）反馈。为此：1. 单击线程/跟踪/运行切换中的 **运行**。
1. 添加另一条过滤规则。然后，您可以单击过滤器下拉列表底部的**高级**过滤器链接。
1. 将打开一个模式，您可以在其中添加 **Trace** 过滤器。这些过滤器将应用于您已过滤的各个运行的所有父运行的跟踪。

### 筛选其子运行具有某些属性的运行（跨度）

您可能想要搜索具有特定类型子运行的运行。例如，搜索具有名称为 `Foo` 的子运行的所有跟踪。当 `Foo` 并不总是被调用，但您想要分析它被调用的情况时，这很有用。

1. 单击线程/跟踪/运行切换中的 **运行**。
1. 添加另一条过滤规则。然后，您可以单击过滤器下拉列表底部的**高级**过滤器链接。
1. 将打开一个模式，您可以在其中添加**树**过滤器。这将使您指定的规则应用于您已过滤的各个运行的所有子运行。

### 示例：过滤树中包含工具调用过滤器的所有运行扩展[tool call filtering example](#example-filtering-for-tool-calls)，如果您想过滤所有运行_其树包含_工具过滤器调用，您可以在**高级**过滤器设置中使用树过滤器。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/filter-traces-in-application.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>