<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create and manage datasets in the UI | https://docs.langchain.com/langsmith/manage-datasets-in-application -->

# 在 UI 中创建和管理数据集

[*Datasets*](/langsmith/evaluation-concepts#datasets) 使您能够使用一致的数据随着时间的推移执行可重复的评估。数据集由[*examples*](/langsmith/evaluation-concepts#examples)组成，它存储输入、输出和可选的参考输出。

本页概述了 [UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-manage-datasets-in-application) 中[creating](#create-a-dataset-and-add-examples) 和 [managing](#manage-a-dataset) 数据集的各种方法。

## 创建数据集并添加示例

以下部分介绍了在 LangSmith 中创建数据集并向其添加示例的不同方法。根据您的工作流程，您可以手动整理示例、自动从跟踪中捕获示例、导入文件，甚至生成合成数据：

* [Manually from a tracing project](#manually-from-a-tracing-project)
* [Automatically from a tracing project](#automatically-from-a-tracing-project)
* [From examples in an annotation queue](#from-examples-in-an-annotation-queue)
* [From the Playground](#from-the-playground)
* [Import a dataset from a CSV or JSONL file](#import-a-dataset-from-a-csv-or-jsonl-file)
* [Create a new dataset from the dataset page](#create-a-new-dataset-from-the-datasets-%26-experiments-page)
* [Add synthetic examples created by an LLM via the Datasets UI](#add-synthetic-examples-created-by-an-llm)

### 从跟踪项目手动

构建数据集的常见模式是将应用程序中的显着跟踪转换为数据集示例。这种方法要求你有[configured tracing to LangSmith](/langsmith/observability-concepts)。

<Check>
  构建数据集的技术是过滤最有趣的跟踪，例如标记有不良用户反馈的跟踪，并将它们添加到数据集。有关如何过滤跟踪的提示，请参阅 [Filter traces](/langsmith/filter-traces-in-application) 指南​​。
</Check>有两种方法可以手动将数据从跟踪项目添加到数据集。导航到 **跟踪项目** 并选择一个项目。

1. 从运行表中选择多项运行。在 **运行** 选项卡上，多选运行。在页面底部，单击<Icon icon="database" /> **添加到数据集**。
2. 在 **运行** 选项卡上，从表中选择运行。在单个运行详细信息页面上，选择右上角的 **添加到** -> **数据集**。

   当您从运行详细信息页面选择数据集时，将会弹出一个模式，让您知道是否应用了任何 [transformations](/langsmith/dataset-transformations) 或者架构验证是否失败。

   然后，您可以选择编辑运行，然后再将其添加到数据集。

### 自动从跟踪项目

您可以使用 [run rules](/langsmith/rules) 根据某些条件自动将轨迹添加到数据集。例如，您可以添加具有特定用例的 [tagged](/langsmith/observability-concepts#tags) 或具有 [low feedback score](/langsmith/observability-concepts#feedback) 的所有跟踪。

### 来自注释队列中的示例

<Check>
  如果您依靠主题专家来构建有意义的数据集，请使用 [annotation queues](/langsmith/annotation-queues) 为审阅者提供简化的视图。在将跟踪添加到数据集之前，人工审阅者可以选择修改跟踪的输入/输出/参考输出。
</Check>您可以选择使用默认数据集配置注释队列，但您可以使用屏幕底部的数据集切换器将运行添加到任何数据集。选择正确的数据集后，单击 **添加到数据集** 或按热键 `D` 将运行添加到其中。

您对注释队列中的运行所做的任何修改都将保留到数据集，并且与运行关联的所有元数据也将被复制。

<Note>
  **添加到数据集**仅适用于**运行**队列项目。注释队列中的[Thread](/langsmith/observability-concepts#threads)项目支持评分反馈，但不支持数据集导出。
</Note>

<Tip>
  您还可以使用 [automation rules](/langsmith/rules) 设置规则，将满足特定条件的运行添加到注释队列。
</Tip>

### 来自游乐场

在[**Playground**](/langsmith/prompt-engineering-concepts#playground)页面：

1. 选择**设置评估**。

2. 如果您要启动新数据集或从现有数据集中进行选择，请单击 **+新建**。

   <Note>
     具有嵌套键的数据集不支持在 Playground 中内联创建数据集。为了添加/编辑带有嵌套键的示例，您必须编辑[from the datasets page](/langsmith/manage-datasets-in-application#create-a-new-dataset-from-the-datasets-%26-experiments-page)。
   </Note>

3. 编辑示例：* 使用 **+Row** 将新示例添加到数据集中。
   * 使用表格右侧的 **⋮** 下拉列表删除示例。
   * 如果您要创建无参考数据集，请使用列中的 **x** 按钮删除 **参考输出** 列。请注意，此操作不可逆。

### 从 CSV 或 JSONL 文件导入数据集

在 **数据集和实验** 页面上，单击 **+新建数据集**，然后 **从 CSV 或 JSONL 文件导入** 现有数据集。

### 从数据集和实验页面创建一个新数据集

1. 从左侧菜单导航至 **数据集和实验** 页面。
2. 单击 **+ 新数据集**。
3. 在 **新建数据集** 页面上，选择 **从头开始创建** 选项卡。
4. 添加数据集的名称和描述。
5. （可选）创建 [dataset schema](#create-a-dataset-schema) 来验证您的数据集。
6. 单击**创建**，这将创建一个空数据集。
7. 要添加内联示例，请在数据集页面上转到 **示例** 选项卡。单击 **+ 示例**。
8. 在 JSON 中定义示例并单击 **提交**。有关数据集分割的更多详细信息，请参阅[Create and manage dataset splits](#create-and-manage-dataset-splits)。

### 添加法学硕士创建的综合示例如果您有现有示例并在数据集上定义了 [schema](#create-a-dataset-schema)，则当您单击 **+ 示例** 时，会出现一个选项 <Icon icon="sparkles" /> **添加 AI 生成的示例**。这将使用法学硕士来创建[synthetic](/langsmith/evaluation-concepts#building-datasets)示例。

在**生成示例**中，执行以下操作：

1. 单击窗格右上角的 **API Key**，将您的 OpenAI API 密钥设置为 [workspace secret](/langsmith/administration-overview#workspaces)。如果您的工作区已经设置了 OpenAI API 密钥，则可以跳过此步骤。

2. 选择<Tooltip>few-shot Examples</Tooltip>：切换**自动**或**手动**参考示例。您可以从数据集中手动选择这些示例，也可以使用自动选择选项。

3. 输入您要生成的综合示例的数量。

4. 单击**生成**。

   <img alt="The AI-Generated Examples configuration window. Selections for manual and automatic and number of examples to generate." />

   <img alt="The AI-Generated Examples configuration window. Selections for manual and automatic and number of examples to generate." />

5. 示例将出现在**选择生成的示例**页面上。选择要添加到数据集中的示例，并可以选择在最终确定之前对其进行编辑。单击**保存示例**。

6. 每个示例都将根据您指定的数据集模式进行验证，并在源元数据中标记为**合成**。

   <img alt="Select generated examples page with generated examples selected and Save examples button." />

   <img alt="Select generated examples page with generated examples selected and Save examples button." />

## 管理数据集

### 创建数据集模式LangSmith 数据集存储任意 JSON 对象。我们建议（但不要求）您为数据集定义架构，以确保它们符合特定的 JSON 架构。数据集模式是使用标准 [JSON schema](https://json-schema.org/) 定义的，另外还添加了一些 [prebuilt types](/langsmith/dataset-json-types)，可以更轻松地键入消息和工具等常见原语。

架构中的某些字段具有 `+ Transformations` 选项。转换是预处理步骤，如果启用，则会在您将示例添加到数据集时更新它们。例如，`convert to OpenAI messages`转换会将类似消息的对象（例如LangChain消息）转换为OpenAI消息格式。

有关可用转换的完整列表，请参阅[Dataset transformations reference](/langsmith/dataset-transformations)。

<Note>
  如果您计划从 LangChain [ChatModels](/oss/python/langchain/models) 或使用 [LangSmith OpenAI wrapper](/langsmith/annotate-code) 的 OpenAI 调用收集数据集中的生产跟踪，我们提供预构建的聊天模型架构，可将消息和工具转换为行业标准 openai 格式，可在下游与任何模型一起进行测试。您还可以自定义模板设置以匹配您的用例。

  请参阅[dataset transformations reference](/langsmith/dataset-transformations)了解更多信息。
</Note>

### 创建和管理数据集分割有关何时以及为何使用拆分的概述，请参阅[Dataset organization](/langsmith/evaluation-concepts#dataset-organization)。

要在 UI 中创建和管理拆分：

1. 在数据集中选择示例。
2. 单击“**添加到拆分**”。
3. 从出现的弹出菜单中，您可以选择和取消选择所选示例的拆分，或者创建新的拆分。

<img alt="Add to Split" />

### 编辑示例元数据

要将元数据添加到您的示例中：

1. 单击示例，然后单击弹出窗口右上角的“**编辑**”。
2. 在此页面中，更新或删除现有元数据，或添加新元数据。

您可以使用它来存储有关示例的信息，例如标签或版本信息，然后您可以在分析实验结果时使用[group by](/langsmith/analyze-an-experiment#group-results-by-metadata)，或者在SDK中调用`list_examples`时使用[filter by](/langsmith/manage-datasets-programmatically#list-examples-by-metadata)。

### 过滤器示例

您可以按拆分、元数据键/值过滤示例，或对示例执行全文搜索。这些过滤选项位于示例表的左上角：* **按拆分筛选**：选择拆分 > 选择要作为筛选依据的拆分。
* **按元数据过滤**：过滤器 > 从下拉列表中选择 **元数据** > 选择要过滤的元数据键和值。
* **全文搜索**：过滤器 > 从下拉列表中选择 **全文** > 输入您的搜索条件。

您可以添加多个过滤器，只有满足所有过滤器的示例才会显示在表中。

<img alt="Filters Applied to Examples" />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-datasets-in-application.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>