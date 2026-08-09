<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to compare experiment results | https://docs.langchain.com/langsmith/compare-experiment-results -->

# 如何比较实验结果

当您迭代您的LLM申请时（例如更改模型或提示），您可能想要比较不同[*experiments*](/langsmith/evaluation-concepts#experiment)的结果。

LangSmith 支持比较视图，可让您识别不同实验之间的关键差异、回归和改进。

## 打开比较视图

1. 要访问实验比较视图，请导航至 **数据集和实验** 页面。
2. 选择一个数据集，这将打开 **实验** 选项卡。
3. 选择两个或多个实验，然后单击“**比较**”。

<div>
  <img alt="The Experiments view in the UI with 3 experiments selected and the Compare button highlighted, in light mode." />

  <img alt="The Experiments view in the UI with 3 experiments selected and the Compare button highlighted, in dark mode." />
</div>

## 调整表格显示

您可以在比较视图右上角的不同显示选项之间切换。

<img alt="Table display options, in light mode." />

<img alt="Table display options, in dark mode." />

### 过滤器

单击 <Icon icon="filter-2" /> 图标将过滤器应用于比较视图以缩小特定示例的范围。过滤器的常见示例包括：

* 包含特定 `input` / `output` 的示例。
* 以状态 `success` 或 `error` 运行。
* 在 `latency` 中花费超过 x 秒的运行。
* 具体`metadata`、`tag`或`feedback`。除了在整个实验视图上应用过滤器之外，您还可以在各个列上应用过滤器。选择任意列顶部的 <Icon icon="dots-vertical" /> 图标可查看该列数据的可用过滤器。

### 栏目

单击 <Icon icon="columns-3" /> 图标可在比较视图中显示或隐藏各个反馈键或指标。

### 表格视图

选择比较视图右上角的三个表视图图标之一：

* **紧凑**：显示每个示例的实验结果预览。
* **完整**：显示每次运行的输入、输出和参考输出的全文。如果输出太长而无法在表格中显示，您可以单击**展开**来查看完整内容。
* **差异**：显示每次运行的实验输出之间的文本差异。一次仅支持 2 个实验。更多详情请参见[View side-by-side diffs](#view-side-by-side-diffs)。

### 显示类型

共有三个内置实验视图，涵盖多种显示类型：**默认**、**YAML**、**JSON**。

## 查看回归和改进在比较视图中，红色突出显示在任何反馈键上针对源实验的运行“回归”，而绿色突出显示运行“改进”。在每个反馈列的顶部，您可以看到有多少次运行比源实验做得更好或更差。

单击每列顶部的回归或改进按钮，仅显示该实验中回归或改进的运行。

<img alt="The comparison view comparing 4 experiments with the regressions and improvements in red and green respectively." />

<img alt="The comparison view comparing 4 experiments with the regressions and improvements in red and green respectively." />

## 查看并排差异

比较两个实验时，对于 JSON 和 YAML 显示样式，您可以打开实验差异模式来比较实验输出。 diff 模式突出显示输出之间的修改，对于结构化输出比较特别有用。

<div>
  <img alt="The comparison diff mode in light." />

  <img alt="The comparison diff mode in dark." />
</div>

## 更新源实验和指标

要跟踪实验中的回归，您可以：

1. 在比较视图的顶部，将鼠标悬停在实验图标上，然后从下拉列表中选择 **设置为源实验**。您还可以从此下拉列表中添加或删除实验。默认情况下，第一个选定的实验被设置为源。

   <img alt="Setting a source experiment from the experiment icons at the top of the Comparison view." />

   <img alt="Setting a source experiment from the experiment icons at the top of the Comparison view." />2. 在 **反馈** 列中，您可以配置每个反馈键是否分数越高越好。该首选项将被存储。默认情况下，分数越高越好。

   <img alt="Dropdown for feedback metric column, configuring whether a higher score is better, in light mode." />

   <img alt="Dropdown for feedback metric column, configuring whether a higher score is better, in dark mode." />

## 展开详细信息面板

单击任意行可打开该示例的详细信息面板以进行比较实验。

使用面板右上角的切换按钮在两种模式之间切换：

* **详细信息**：显示反馈键和分数，以及示例的指标摘要，以及每个实验的输入、输出和参考输出以及属性。

  <img alt="An example in the expanded Comparing Experiments view, in light mode." />

  <img alt="An example in the expanded Comparing Experiments view, in dark mode." />

* **痕迹**：并排显示每个实验的痕迹。

  <img alt="An example in the expanded Comparing Experiments view, in light mode." />

  <img alt="An example in the expanded Comparing Experiments view, in dark mode." />

当比较两个以上的实验时，面板一次显示两个实验。使用标题切换您要比较的实验。

## 使用实验元数据作为图表标签

您可以根据[experiment metadata](/langsmith/filter-experiments-ui#background-add-metadata-to-your-experiments)为图表配置x轴标签。

从比较视图右上角的 **图表** 下拉列表中选择元数据键以更改 x 轴标签。

<img alt="x-axis dropdown highlighted with a list of the metadata attached to the experiment, in light mode." />

<img alt="x-axis dropdown highlighted with a list of the metadata attached to the experiment, in dark mode." />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/compare-experiment-results.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>