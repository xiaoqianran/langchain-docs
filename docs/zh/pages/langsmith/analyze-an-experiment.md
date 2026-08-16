<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Analyze an experiment | https://docs.langchain.com/langsmith/analyze-an-experiment -->

# 分析一个实验

本页描述了在 LangSmith 中使用 [_experiments_](/langsmith/evaluation-concepts#experiment) 的一些基本任务：

- **[Analyze a single experiment](#analyze-a-single-experiment)**：查看和解释实验结果、自定义列、过滤数据和比较运行。
- **[Set a baseline in the Experiments tab view](#set-a-baseline-in-the-experiments-tab-view)**：为您想要超越的数据集设置基线。
- **[Filter and group by models, prompts, and tools in the Experiments tab view](#filter-and-group-by-models-prompts-and-tools-in-the-experiments-tab-view)**：使用**模型**、**提示**和**工具**列在**实验**选项卡视图中对实验进行过滤和分组。
- **[Download experiment results as a CSV](#download-experiment-results-as-a-csv)**：导出您的实验数据以供外部分析和共享。
- **[Rename an experiment](#rename-an-experiment)**：更新 Playground 和实验视图中的实验名称。

## 分析单个实验

运行实验后，您可以使用LangSmith的实验视图来分析结果并深入了解实验的性能。

### 打开实验视图

要打开实验视图，

1. 从打开 **实验** 选项卡视图的 **数据集和实验** 页面中选择相关的 [_dataset_](/langsmith/evaluation-concepts#datasets)。
2. 单击要查看的实验所在的行。

![Open experiment view](/langsmith/images/select-experiment.png)

### 查看实验结果

#### 自定义列默认情况下，实验视图显示数据集中每个[example](/langsmith/evaluation-concepts#examples)的输入、输出和参考输出、评估的反馈分数以及成本、令牌计数、延迟和状态等实验指标。

您可以单击视图右上角的**列**图标来自定义列，以便更轻松地解释实验结果：

- **将输入、输出和参考输出**中的字段分解为各自的列。如果您有很长的输入/输出/参考输出并且想要显示重要字段，这尤其有用。
- **隐藏和重新排序列**以创建用于分析的重点视图。
- **控制反馈分数的小数精度**。默认情况下，LangSmith 以小数点精度 2 表示数字反馈分数，但您可以将此设置自定义为最多 6 位小数。
- **将实验中的数字反馈分数的热图阈值**设置为高、中、低，这会影响分数片呈现为红色或绿色的阈值：

![Column heatmap configuration](/langsmith/images/column-heat-map.png)

<Tip>
您可以为整个数据集设置默认配置，也可以为自己临时保存设置。
</Tip>

#### 排序和过滤要按反馈分数对行进行排序，请单击列标题中的 **排序依据** 图标。

![Sort column](/langsmith/images/column-sort.png)

要过滤行，请单击列标题中的 <Icon icon="dots-vertical"/> 图标并配置过滤器设置。

![Filter column](/langsmith/images/column-filter.png)

#### 表格视图

选择实验视图右上角的三个表视图图标之一：

- **紧凑**：将每次运行显示为单行，以便快速比较分数。
- **完整**：显示每次运行的完整输出。
- **差异**：显示参考输出和每次运行的输出之间的文本差异。

![Diff view](/langsmith/images/diff-mode.png)

####查看痕迹

单击实验视图中的任意行可打开详细信息面板，其中显示跟踪以及该运行的反馈、输入、输出和属性。

![View trace](/langsmith/images/view-trace.png)

要查看整个跟踪项目，请单击实验视图右上角的 **查看项目** 图标。

#### 查看评估器运行

通过将鼠标悬停在评估器分数上，您可以查看有关该评估器运行的其他详细信息。对于 [LLM-as-a-judge evaluators](/langsmith/llm-as-judge)，单击 **Source** 链接查看所使用的提示，或单击 **Evaluator Trace** 在新的浏览器选项卡中打开跟踪。对于使用 [repetitions](/langsmith/repetition) 进行的实验，请单击总平均分数以查看所有单独运行的链接。

![View evaluator runs](/langsmith/images/evaluator-run.png)

#### 跟踪实验进度对于从 Playground 或通过 SDK 运行的实验，实验标题中的进度条会实时跟踪完成情况。实验表的 **Progress** 列中显示相同的进度。进度反映了运行和评估状态。将鼠标悬停在进度条上可查看已完成的运行数和评估的运行数。

<Note>
通过 SDK 运行的实验的进度跟踪需要：

- Python：`langsmith>=0.8.16`
- 打字稿：`langsmith>=0.7.8`
</Note>

### 按元数据对结果进行分组

您可以将元数据添加到示例中以对其进行分类和组织。例如，如果您正在评估问答数据集的事实准确性，元数据可能包括每个问题所属的主题领域。可以添加元数据 [via the UI](/langsmith/manage-datasets-in-application#edit-example-metadata) 或 [via the SDK](/langsmith/manage-datasets-programmatically#update-single-example)。

要按元数据分析结果，请使用实验视图右上角的 **分组依据** 图标，然后选择所需的元数据键。这显示每个元数据组的平均反馈分数、延迟、总令牌和成本。<Info>
您只能按 2025 年 2 月 20 日之后创建的实验的示例元数据进行分组。该日期之前的任何实验仍可以按元数据进行分组，但前提是元数据位于实验跟踪本身上。
</Info>

### 重复

如果您使用 [_repetitions_](/langsmith/repetition) 运行实验，请单击任意行以打开详细信息面板。 **重复摘要**显示指标表、所有反馈分数，并允许您切换输出或查看各个重复及其跟踪。

![Repetitions](/langsmith/images/repetitions.png)

### 与另一个实验比较

在实验视图的右上角，您可以选择另一个实验进行比较。这将打开一个比较视图，您可以在其中查看两个实验的比较情况。要了解有关比较视图的更多信息，请参阅[how to compare experiment results](/langsmith/compare-experiment-results)。

## 在“实验”选项卡视图中设置基线

虽然您可能会运行数十个测试，但您通常会尝试超越一个特定的基准。设置_基线_将您的结果锚定在这个参考点上，这使您可以在拥挤的实验列表中识别改进或回归。

通过指定基线，您可以：- 突出显示参考：明确标记您的最佳性能运行，以便在您迭代时它在 **实验** 选项卡视图的顶部保持可见。
- 查看即时差异：自动查看所有实验的性能增量，这意味着您不一定需要执行手动并排选择。
- 加速评估：快速确定新的迭代是否满足或超过您当前的性能标准。

<img
  className="block dark:hidden"
  src="/langsmith/images/baseline-experiment-view-light.png"
  alt="The Experiments tab view with an experiment marked as the baseline at the top of the table. Scores show against the baseline on the rows of other experiments."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/baseline-experiment-view-dark.png"
  alt="The Experiments tab view with an experiment marked as the baseline at the top of the table. Scores show against the baseline on the rows of other experiments."
/>

要设置数据集的基线：

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-analyze-an-experiment) 中，导航至左侧菜单中的 **数据集和实验** 选项。
1. 从表中选择要使用的数据集。
1. 在 **实验** 选项卡视图中，将鼠标悬停在实验行上以在该行的右端显示 **设置基线** 按钮。单击以选择您的基线实验。

您的基线实验将固定在表格顶部，并且其名称旁边有 **Baseline** 标签。将实验设置为基线后，表格将显示每列的每个实验相对于基线的分数。当您选择多个实验进行比较时，基线实验将是要进行比较的默认源实验。## 在“实验”选项卡视图中按模型、提示和工具进行过滤和分组

实验表包括 **模型**、**提示** 和 **工具** 列，显示每个实验使用的模型、提示和工具，使您更容易一目了然地了解运行之间发生的变化。

当您从 Playground 运行实验时，这些列会自动填充。通过 SDK 运行实验时，将带有 `models`、`prompts` 和 `tools` 键的 `metadata` 对象传递给 `evaluate()`：

```python
results = client.evaluate(
    target,
    data="my-dataset",
    evaluators=[...],
    metadata={
        "models": "openai:gpt-5.4-mini",
        "prompts": ["my-org/my-prompt:abc12345"],
        "tools": [{"name": "web_search", "description": "Search the web for information"}],
    },
)
```

有关使用元数据的示例，请参阅[how to evaluate an LLM application](/langsmith/evaluate-llm-application#run-the-evaluation)。

仅当数据集中至少有一个实验设置了字段时，才会显示这些列。填充后，单击这些列中的值即可对实验进行筛选或分组。

<img
  className="block dark:hidden"
  src="/langsmith/images/metadata-columns-light.png"
  alt="The Experiments tab view with metadata columns for models, prompts, and tools."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/metadata-columns-dark.png"
  alt="The Experiments tab view with metadata columns for models, prompts, and tools."
/>

您还可以按模型、模型提供程序、提示、提示提交、工具和 **实验** 选项卡视图左上角的其他实验元数据进行过滤和分组：

<img
  className="block dark:hidden"
  src="/langsmith/images/metadata-group-by-light.png"
  alt="The Experiments tab view with metadata columns for models, prompts, and tools."
/>

<img
  className="hidden dark:block"
  src="/langsmith/images/metadata-group-by-dark.png"
  alt="The Experiments tab view with metadata columns for models, prompts, and tools."
/>

## 将实验结果下载为 CSV

LangSmith 可让您将实验结果下载为 CSV 文件，以供外部分析和共享。单击实验视图右上角的 **下载为 CSV** 图标。<Note>
CSV 导出始终包含所有列，无论您在实验视图中应用了任何列自定义、排序或过滤。列可见性设置仅影响屏幕显示，不会反映在下载的文件中。
</Note>

<Note>
实验结果的下载限制为 5,000 行。
</Note>

## 重命名实验

<Note>
每个工作区的实验名称必须是唯一的。
</Note>

您可以在 LangSmith UI 中的以下位置重命名实验：

- **实验视图**：使用实验名称旁边的铅笔图标重命名实验。

  ![Edit name in experiment view](/langsmith/images/rename-in-experiment-view.png)

- **游乐场**：自动分配格式为`pg::prompt-name::model::uuid`（例如`pg::gpt-5.4-mini::897ee630`）的默认名称。您可以在运行实验后立即重命名实验，方法是在 Playground 表标题中编辑其名称。

  ![Edit name in playground](/langsmith/images/rename-in-playground.png)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/analyze-an-experiment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>