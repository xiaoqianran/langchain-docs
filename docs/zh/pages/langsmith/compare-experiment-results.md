<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to compare experiment results | https://docs.langchain.com/langsmith/compare-experiment-results -->

# 如何比较实验结果

当您迭代您的LLM申请时（例如更改模型或提示），您可能想要比较不同[*experiments*](/langsmith/evaluation-concepts#experiment)的结果。

LangSmith 支持比较视图，可让您识别不同实验之间的关键差异、回归和改进。

## 打开比较视图

1. 要访问实验比较视图，请导航至 **数据集和实验** 页面。
2. 选择一个数据集，这将打开 **实验** 选项卡。
3. 选择两个或多个实验，然后单击“**比较**”。

![The Experiments view in the UI with 3 experiments selected and the Compare button highlighted, in light mode.](https://mintcdn.com/langchain-5e9cc07a/1hHTBw6gWTjwKQ8j/langsmith/images/compare-select-light.png?fit=max\&auto=format\&n=1hHTBw6gWTjwKQ8j\&q=85\&s=a0afa6f50aa177479c59dfb5918e23b2)

## 调整表格显示

您可以在比较视图右上角的不同显示选项之间切换。

![Table display options, in light mode.](https://mintcdn.com/langchain-5e9cc07a/Tdk8epB4BZgbugRX/langsmith/images/comparison-table-display-options-light.png?fit=max\&auto=format\&n=Tdk8epB4BZgbugRX\&q=85\&s=3a2df7e04c17d1c97d3e377af178f7c6)

### 过滤器

单击该图标可将过滤器应用到比较视图以缩小特定示例的范围。过滤器的常见示例包括：

* 包含特定 `input` / `output` 的示例。
* 以状态 `success` 或 `error` 运行。
* 在 `latency` 中花费超过 x 秒的运行。
* 具体`metadata`、`tag`或`feedback`。In addition to applying filters on the overall experiment view, you can apply filters on individual columns as well. Select the  icon at the top of any column to view the available filters for that column's data.

### 栏目

Click the  icon to show or hide individual feedback keys or metrics in the comparison view.

### 表格视图

Select one of three table view icons at the top right of the comparison view:

* **Compact**: Shows a preview of the experiment results for each example.
* **Full**: Shows the full text of the input, output, and reference output for each run. If the output is too long to display in the table, you can click **Expand** to view the full content.
* **Diff**: Shows the text difference between experiment outputs for each run. This is only supported for 2 experiments at a time.更多详情请参见[View side-by-side diffs](#view-side-by-side-diffs)。

### 显示类型

There are three built-in experiment views that cover several display types: **Default**, **YAML**, **JSON**.

## 查看回归和改进在比较视图中，红色突出显示在任何反馈键上针对源实验的运行“回归”，而绿色突出显示运行“改进”。在每个反馈列的顶部，您可以看到有多少次运行比源实验做得更好或更差。

单击每列顶部的回归或改进按钮，仅显示该实验中回归或改进的运行。

![The comparison view comparing 4 experiments with the regressions and improvements in red and green respectively.](https://mintcdn.com/langchain-5e9cc07a/bhZ1YZGp3sIXMhGI/langsmith/images/regression-view-light.png?fit=max\&auto=format\&n=bhZ1YZGp3sIXMhGI\&q=85\&s=7328cf7a58d50e9c1af1c7b12cbd36fa)

## 查看并排差异

比较两个实验时，对于 JSON 和 YAML 显示样式，您可以打开实验差异模式来比较实验输出。 diff 模式突出显示输出之间的修改，对于结构化输出比较特别有用。

![The comparison diff mode in light.](https://mintcdn.com/langchain-5e9cc07a/Tdk8epB4BZgbugRX/langsmith/images/comparison-diff-view-light.png?fit=max\&auto=format\&n=Tdk8epB4BZgbugRX\&q=85\&s=2ddb234fd3779b443b9e41f7addeef21)

## 更新源实验和指标

要跟踪实验中的回归，您可以：

1. 在比较视图的顶部，将鼠标悬停在实验图标上，然后从下拉列表中选择 **设置为源实验**。您还可以从此下拉列表中添加或删除实验。默认情况下，第一个选定的实验被设置为源。

   ![Setting a source experiment from the experiment icons at the top of the Comparison view.](https://mintcdn.com/langchain-5e9cc07a/XfIIVcx3AjKjd794/langsmith/images/set-source-experiment-light.png?fit=max\&auto=format\&n=XfIIVcx3AjKjd794\&q=85\&s=8d251f120d6df74241555b9a859ad066)2. 在 **反馈** 列中，您可以配置每个反馈键是否分数越高越好。该首选项将被存储。默认情况下，分数越高越好。

   ![Dropdown for feedback metric column, configuring whether a higher score is better, in light mode.](https://mintcdn.com/langchain-5e9cc07a/3sTv76KEq6zVyh80/langsmith/images/comparison-feedback-score-light.png?fit=max\&auto=format\&n=3sTv76KEq6zVyh80\&q=85\&s=1d860f0f7de66370d9afb00985d9a757)

## 展开详细信息面板

单击任意行可打开该示例的详细信息面板以进行比较实验。

使用面板右上角的切换按钮在两种模式之间切换：

* **详细信息**：显示反馈键和分数，以及示例的指标摘要，以及每个实验的输入、输出和参考输出以及属性。

  ![An example in the expanded Comparing Experiments view, in light mode.](https://mintcdn.com/langchain-5e9cc07a/Tdk8epB4BZgbugRX/langsmith/images/expanded-view-details-light.png?fit=max\&auto=format\&n=Tdk8epB4BZgbugRX\&q=85\&s=ea0b5751150db5cdf34f1c7dbfd43fb0)

* **痕迹**：并排显示每个实验的痕迹。

  ![An example in the expanded Comparing Experiments view, in light mode.](https://mintcdn.com/langchain-5e9cc07a/Tdk8epB4BZgbugRX/langsmith/images/expanded-view-traces-light.png?fit=max\&auto=format\&n=Tdk8epB4BZgbugRX\&q=85\&s=a775783ae9395da8cc2daea6855bef53)

当比较两个以上的实验时，面板一次显示两个实验。使用标题切换您要比较的实验。

## 使用实验元数据作为图表标签

您可以根据[experiment metadata](/langsmith/filter-experiments-ui#background-add-metadata-to-your-experiments)为图表配置x轴标签。

从比较视图右上角的 **图表** 下拉列表中选择元数据键以更改 x 轴标签。

![x-axis dropdown highlighted with a list of the metadata attached to the experiment, in light mode.](https://mintcdn.com/langchain-5e9cc07a/PTrqmKVkPbIbL9pX/langsmith/images/metadata-in-charts-light.png?fit=max\&auto=format\&n=PTrqmKVkPbIbL9pX\&q=85\&s=5d854c56e536fc7e60f2cebc4f3d2711)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/compare-experiment-results.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。