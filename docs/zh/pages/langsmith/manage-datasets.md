<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage datasets | https://docs.langchain.com/langsmith/manage-datasets -->

# 管理数据集

LangSmith 提供用于管理和使用 [_datasets_](/langsmith/evaluation-concepts#datasets) 的工具。本页描述了数据集操作，包括：

- [Versioning datasets](#version-a-dataset) 跟踪随时间的变化。
- 用于评估的[Filtering](#evaluate-on-a-filtered-view-of-a-dataset)和[splitting](#evaluate-on-a-dataset-split)数据集。
- [Sharing datasets](#share-a-dataset) 公开。
- 各种格式的[Exporting datasets](#export-a-dataset)。

您还将学习如何从 [experiments](/langsmith/evaluation-concepts#experiment) [export filtered traces](#export-filtered-traces-from-experiment-to-dataset) 返回数据集以进行进一步分析和迭代。

<Tip>
  [LangSmith Engine](/langsmith/engine) 可以根据您的生产轨迹自动生成真实数据集示例。
</Tip>

## 数据集版本

在LangSmith中，数据集是版本化的。这意味着每次在数据集中添加、更新或删除示例时，都会创建数据集的新版本。

### 创建数据集的新版本

每当您在数据集中添加、更新或删除示例时，都会创建数据集的新[version](/langsmith/evaluation-concepts#dataset-organization)。这使您可以跟踪数据集随时间的变化并了解数据集的演变情况。

默认情况下，版本由更改的时间戳定义。当您在 **示例** 选项卡中单击数据集的特定版本（按时间戳）时，您将找到数据集在该时间点的状态。

![Version Datasets](/langsmith/images/version-dataset.png)请注意，在查看数据集的过去版本时，示例是只读的。您还将看到此版本的数据集和最新版本的数据集之间的操作。

<Note>
默认情况下，数据集的最新版本显示在 **示例** 选项卡中，所有版本的实验都显示在 **测试** 选项卡中。
</Note>

在**测试**选项卡中，您将找到在不同版本的数据集上运行的测试结果。

![Version Datasets](/langsmith/images/version-dataset-tests.png)

### 标记版本

您还可以标记数据集的版本，为它们提供更易于理解的名称，这对于标记数据集历史中的重要里程碑非常有用。

例如，您可以将数据集的一个版本标记为“prod”，并使用它针对您的 LLM 管道运行测试。

您可以通过单击 **示例** 选项卡中的 **+ 标记此版本**，在 UI 中标记数据集的版本。

![Tagging Datasets](/langsmith/images/tag-this-version.png)

您还可以使用 SDK 标记数据集的版本。以下是如何使用 [Python SDK](https://docs.smith.langchain.com/reference/python/reference) 标记数据集版本的示例：

```python
from langsmith import Client
from datetime import datetime

client = Client()
initial_time = datetime(2024, 1, 1, 0, 0, 0) # The timestamp of the version you want to tag

# You can tag a specific dataset version with a semantic name, like "prod"
client.update_dataset_tag(
    dataset_name=toxic_dataset_name, as_of=initial_time, tag="prod"
)
```

要对数据集的特定标记版本运行评估，请参阅[Evaluate on a specific dataset version section](#evaluate-on-a-specific-dataset-version)。

## 对特定数据集版本进行评估<Check>
在阅读本节之前，您可能会发现参考以下内容会有所帮助：

- [Version a dataset](#version-a-dataset)。
- [Fetching examples](/langsmith/manage-datasets-programmatically#fetch-examples)。
</Check>

### 使用`list_examples`

您可以使用 `evaluate` / `aevaluate` 传递可迭代的示例来对数据集的特定版本进行评估。使用 `list_examples` / `listExamples` 使用 `as_of` / `asOf` 从特定版本标记中获取示例，并将其传递到 `data` 参数中。

<CodeGroup>

```python Python
from langsmith import Client

ls_client = Client()

# Assumes actual outputs have a 'class' key.
# Assumes example outputs have a 'label' key.
def correct(outputs: dict, reference_outputs: dict) -> bool:
  return outputs["class"] == reference_outputs["label"]

results = ls_client.evaluate(
    lambda inputs: {"class": "Not toxic"},
    # Pass in filtered data here:
    data=ls_client.list_examples(
      dataset_name="Toxic Queries",
      as_of="latest",  # specify version here
    ),
    evaluators=[correct],
)
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";

await evaluate((inputs) => labelText(inputs["input"]), {
  data: langsmith.listExamples({
    datasetName: datasetName,
    asOf: "latest",
  }),
  evaluators: [correctLabel],
});
```

```java Java
import com.langchain.smith.models.examples.ExampleListParams;

ExampleListParams listParams = ExampleListParams.builder()
    .datasetId(datasetId)
    .asOf("latest")
var examples = client.examples().list(listParams);
```

</CodeGroup>

在 [Create and manage datasets programmatically](/langsmith/manage-datasets-programmatically#fetch-datasets) 页面上了解有关如何获取数据集视图的更多信息。

## 评估数据集的分割/过滤视图

<Check>
在阅读本节之前，您可能会发现参考以下内容会有所帮助：

- [Fetching examples](/langsmith/manage-datasets-programmatically#fetch-examples)。
- [Creating and managing dataset splits](/langsmith/manage-datasets-in-application#create-and-manage-dataset-splits)。
</Check>

### 评估数据集的过滤视图

您可以使用 `list_examples` / `listExamples` 方法对数据集中的 [fetch](/langsmith/manage-datasets-programmatically#fetch-examples) 示例子集进行评估。

一种常见的工作流程是获取具有特定元数据键值对的示例。

<CodeGroup>

```python Python
from langsmith import evaluate

results = evaluate(
    lambda inputs: label_text(inputs["text"]),
    data=client.list_examples(dataset_name=dataset_name, metadata={"desired_key": "desired_value"}),
    evaluators=[correct_label],
    experiment_prefix="Toxic Queries",
)
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";

await evaluate((inputs) => labelText(inputs["input"]), {
  data: langsmith.listExamples({
    datasetName: datasetName,
    metadata: {"desired_key": "desired_value"},
  }),
  evaluators: [correctLabel],
  experimentPrefix: "Toxic Queries",
});
```

```java Java
import com.langchain.smith.models.examples.ExampleListParams;

ExampleListParams listParams = ExampleListParams.builder()
    .datasetId(datasetId)
    .metadata("{\"desired_key\":\"desired_value\"}")
    .build();
var examples = client.examples().list(listParams);
```

</CodeGroup>

更多过滤功能请参考这篇[how-to guide](/langsmith/manage-datasets-programmatically#list-examples-by-structured-filter)。

### 评估数据集分割

您可以使用 `list_examples` / `listExamples` 方法对数据集的一个或多个 [splits](/langsmith/evaluation-concepts#dataset-organization) 进行评估。 `splits` 参数获取您想要评估的分割列表。

<CodeGroup>

```python Python
from langsmith import evaluate

results = evaluate(
    lambda inputs: label_text(inputs["text"]),
    data=client.list_examples(dataset_name=dataset_name, splits=["test", "training"]),
    evaluators=[correct_label],
    experiment_prefix="Toxic Queries",
)
```

```typescript TypeScript
import { evaluate } from "langsmith/evaluation";

await evaluate((inputs) => labelText(inputs["input"]), {
  data: langsmith.listExamples({
    datasetName: datasetName,
    splits: ["test", "training"],
  }),
  evaluators: [correctLabel],
  experimentPrefix: "Toxic Queries",
});
```

```java Java
import com.langchain.smith.models.examples.ExampleListParams;
import java.util.Arrays;
import java.util.List;

List<String> splits = Arrays.asList("test", "training");

ExampleListParams listParams = ExampleListParams.builder()
    .datasetId(datasetId)
    .splits(splits)
    .build();
var examples = client.examples().list(listParams);
```

</CodeGroup>有关获取数据集视图的更多详细信息，请参阅[fetching datasets](/langsmith/manage-datasets-programmatically#fetch-datasets)上的指南。

## 共享数据集

### 公开分享数据集

<Warning>
公开共享数据集将使任何有链接的人都可以访问**数据集示例、实验和相关运行以及对此数据集的反馈**，即使他们没有 LangSmith 帐户。确保您没有共享敏感信息。

此功能仅在LangSmith云托管版本中可用。
</Warning>

从 **数据集和实验** 选项卡中，选择一个数据集，单击 **⋮**（页面右上角），然后单击 **共享数据集**。这将打开一个对话框，您可以在其中复制数据集的链接。

![Share Dataset](/langsmith/images/share-dataset.gif)

### 取消共享数据集

1. 单击任何公开共享数据集右上角的“**公共**”，然后单击对话框中的“**取消共享**”，以单击“**取消共享**”。 ![Unshare Dataset](/langsmith/images/unshare-dataset.png)

2. 通过单击 **设置** -> **共享 URL** 或 [this link](https://smith.langchain.com/settings/shared)，导航到组织的公开共享数据集列表，然后单击要取消共享的数据集旁边的 **取消共享**。

![Unshare Trace List](/langsmith/images/unshare-trace-list.png)

## 导出数据集

您可以从 LangSmith UI 将 LangSmith 数据集导出为 CSV、JSONL 或 [OpenAI's fine tuning format](https://platform.openai.com/docs/guides/fine-tuning#example-format)。从 **数据集和实验** 选项卡中，选择一个数据集，单击 **⋮**（页面右上角），然后单击 **下载数据集**。

![Export Dataset Button](/langsmith/images/export-dataset-button.gif)

## 将过滤后的痕迹从实验导出到数据集

在 LangSmith 中运行 [offline evaluation](/langsmith/evaluation-concepts#offline-evaluations) 后，您可能希望将满足某些评估标准的 [traces](/langsmith/observability-concepts#traces) 导出到数据集。

### 查看实验痕迹

![Export filtered traces](/langsmith/images/export-filtered-trace-to-dataset.png)

为此，首先单击实验名称旁边的箭头。这将引导您进入包含实验生成的痕迹的项目。

![Export filtered traces](/langsmith/images/experiment-tracing-project.png)

从那里，您可以根据您的评估标准过滤痕迹。在此示例中，我们将过滤准确度得分大于 0.5 的所有跟踪。

![Export filtered traces](/langsmith/images/filtered-traces-from-experiment.png)

在项目上应用过滤器后，我们可以多选运行以添加到数据集，然后单击“**添加到数据集**”。

![Export filtered traces](/langsmith/images/add-filtered-traces-to-dataset.png)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-datasets.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>