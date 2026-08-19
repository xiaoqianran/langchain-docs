<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage evaluators | https://docs.langchain.com/langsmith/evaluators -->

# 管理评估者

LangSmith中的[Evaluators](/langsmith/evaluation-concepts#evaluators)是[workspace-level](/langsmith/administration-overview#workspaces)资源。您可以将单个评估器附加到多个[tracing projects](/langsmith/observability-concepts#projects)和[datasets](/langsmith/evaluation-concepts#datasets)，因此您可以在整个工作中应用一致的评估逻辑，而无需每次都重新创建它。

<Tip>
[LangSmith Engine](/langsmith/engine) 针对检测到的问题建议自定义评估程序，并且可以一键部署它们。
</Tip>

## 查看评估者

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluators) 中，选择左侧边栏中的 **评估器** 以查看工作区中的所有评估器。

评估者表显示以下列：|专栏 |描述 |
|--------|-------------|
|名称 |评估人姓名|
|类型 | **法学硕士作为法官**或**代码**。综合分数评估器的范围仅限于单个跟踪项目和数据集，因此不会出现在此处。 |
|反馈键|评估者产生的反馈键 |
|项目和数据集 |跟踪此评估器附加到的项目和数据集 |
|评估器跟踪计数（本周）|该评估器在过去一周运行的跟踪数。仅在启用支出跟踪时显示； **–** 适用于代码评估者或没有附加规则的评估者。 |
|花费（本周）|该评估员过去一周的预计美元支出。仅在启用支出跟踪时显示； **–** 适用于代码评估者或没有附加规则的评估者。 |
|消费状态 |评估者是否**低于限制**、**无限制**，或者已达到一个或多个配置的支出限制。仅在启用支出跟踪时显示； **–** 适用于代码评估者。 |
|创建者 |创建评估器的工作区成员 |
|更新于 |上次修改评估器的时间 |
|创建于 |评估器何时创建 |

## 创建一个评估器您可以在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluators) 中创建评估器，也可以使用 [SDK](#create-an-evaluator-with-the-sdk) 以编程方式创建评估器。无论哪种方式创建的评估器都是工作区级别的资源，显示在 **评估器** 表中。

### 在 UI 中创建评估器

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluators)中，选择左侧边栏中的**评估器**。
1. 单击 **+ Evaluator** 打开新的评估器面板。
1. 该面板可让您：
   - **从头开始创建**：构建新的 [LLM-as-a-Judge](/langsmith/llm-as-judge) 或 [Code](/langsmith/online-evaluations-code) 评估器。
   - **添加LangChain Tuned Evaluator**：将[specialized judge managed by LangChain](/langsmith/tuned-evaluators)附加到兼容的跟踪项目，无需配置提示、模型或API密钥。
   - **从模板创建**：从现成的评估器（也称为预构建评估器）开始，以实现常见的评估模式。 **推荐**部分首先显示流行的模板，然后是按以下类别组织的模板：|类别 |描述 |
     |----------|-------------|
     |安全|检测泄漏、注入和对抗性输入。 |
     |安全|评估内容的安全性和适度性。 |
     |品质 |测量输出质量和准确性。 |
     |对话 |评估对话质量和用户体验。 |
     |轨迹 |评估代理工具的使用和决策路径。 |
     |图像评估|评估图像内容质量和安全性。 |
     |语音评估|评估语音和音频交互质量。 |

您还可以直接从 [tracing project](/langsmith/observability-concepts#projects) 或 [dataset](/langsmith/evaluation-concepts#datasets) 添加评估器。在此流程中，您还可以从工作区**附加现有评估器**，或创建一个 [Composite](/langsmith/composite-evaluators-ui) 评估器。请参阅[Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)和[Automatically run evaluators on experiments](/langsmith/bind-evaluator-to-dataset)。

### 使用 SDK 创建评估器

使用 LangSmith SDK 以编程方式创建评估器。该 SDK 适用于 [Python](/langsmith/smith-python-sdk) 和 [TypeScript](/langsmith/smith-js-ts-sdk)。通过 SDK 创建的评估器与在 UI 中创建的评估器一起显示在 **评估器** 表中。

<Note>
通过 SDK 管理评估器需要 `langsmith>=0.9.8`（Python、PyPI）或 `langsmith>=0.7.16`（TypeScript、npm）。
</Note>

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()

    created = await client.evaluators.create(
        name="Correctness evaluator",
        type="code",
        code_evaluator={
            "code": "def perform_eval(run, example):\n    return {'score': 1}",
            "language": "python",
        },
    )
    print("Created evaluator:", created.evaluator.id)


asyncio.run(main())
```
```typescript TypeScript
import { Client } from "langsmith";

const client = new Client();

const created = await client.evaluators.create({
  name: "Correctness evaluator",
  type: "code",
  code_evaluator: {
    code: "def perform_eval(run, example):\n    return {'score': 1}",
    language: "python",
  },
});
console.log("Created evaluator:", created.evaluator?.id);
```
</CodeGroup>要创建 LLM 作为法官评估器并检索、更新、列出或删除评估器，请参阅[Manage evaluators with the SDK](/langsmith/manage-evaluators-sdk)。

## 查看评估者详细信息

单击表中的任何评估器以打开其详细信息视图。详细信息视图有四个选项卡：

- **概述**：评估者的反馈配置和提示或代码定义。
- **跟踪**：此评估器在所有附加资源上处理的跟踪。
- **日志**：该评估器在所有附加资源上的执行日志。
- **项目和数据集**：此评估器附加到的跟踪项目和数据集，每个附件的 [weekly spend and limit](/langsmith/evaluator-spend)。

## 编辑评估器

打开评估器。在 **概述** 选项卡中，单击 **编辑评估器** <Icon icon="pencil"/> 图标以打开 **配置评估器** 面板。更新评估器的配置。单击**保存**。

由于评估器是共享的，因此更改适用于其附加的所有跟踪项目和数据集。

## 管理评估者跟踪保留当在线评估器对跟踪进行评分时，它会将反馈附加到跟踪中。这可以将跟踪自动升级到[extended retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)，具体取决于评估器的保留设置。延长保留时间可以使迹线保持更长的时间，但成本更高。当您在 [tracing project](/langsmith/observability-concepts#projects) 上设置在线评估器时，您可以选择退出此升级，以便评分跟踪保留在项目的基本保留中。

仅当项目的[default retention](/langsmith/billing#change-project-level-default-retention)为[base tier](/langsmith/usage-and-billing#how-it-works)时，此控件才可用。如果项目默认为延长保留 ([set at the project or workspace level](/langsmith/data-purging-compliance#data-retention))，则评估者评分的跟踪将遵循该默认值，并且该选项将被锁定。

要选择不延长评分迹线的保留时间：

1. 当您使用[create](#create-an-evaluator)或[edit](#edit-an-evaluator)在线评估器时，请将源设置为[tracing project](/langsmith/observability-concepts#projects)，而不是[dataset](/langsmith/evaluation-concepts#datasets)。
1. 展开评估器配置面板中的**高级**部分。
1. 清除**延长迹线保留**。

该更改适用于保存评估器后评分的轨迹。现有的评分跟踪保留其当前的保留级别。

上述 **扩展跟踪保留** 切换适用于跟踪级别和线程级别（多轮）在线评估器。有关多轮评估器的更多信息，请参阅[Set up multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)。

## 包括扩展统计数据使用 **在 [run-level evaluator](/langsmith/online-evaluations-llm-as-judge) 中包含扩展统计数据（反馈、成本、令牌）** 来评估运行中的反馈统计数据、令牌使用情况或成本数据。 `feedback_stats`字段包含反馈统计信息，包括每个反馈键的数量和平均值。此选项不适用于[multi-turn (thread-level) evaluators](/langsmith/online-evaluations-multi-turn)。

LangSmith 为启用此选项的评估者获取附加数据。仅当您的评估逻辑或提示需要这些字段时才启用它。

要包含扩展统计数据：

1. 当您使用 [create](#create-an-evaluator) 或 [edit](#edit-an-evaluator) 运行级别评估器时，请展开评估器配置面板中的 **高级** 部分。
1. 选择**包括扩展统计信息（反馈、成本、代币）**。

### 访问扩展统计数据

[Code evaluators](/langsmith/online-evaluations-code)接收`run`对象中的这些字段，包括`feedback_stats`、`total_tokens`、`total_cost`。无论您是否启用扩展统计数据，他们还会在 `run["feedback"]` 中收到 [individual feedback records](/langsmith/feedback-data-format)。对于 [LLM-as-a-judge evaluators](/langsmith/online-evaluations-llm-as-judge)，将相应的 `run.*` 字段映射到提示变量。例如，将 `{{correctness_average}}` 映射到 `run.feedback_stats.correctness.avg` 以在提示中包含 `correctness` 反馈平均值。可用的`run.*`字段还包括提示和完成令牌、成本和详细信息字段。有关完整运行数据架构，请参阅[Run data format](/langsmith/run-data-format)。

### 链评估器扩展统计数据可用于链接评估器，其中代码评估器读取另一个评估器已经生成的分数。根据第一个评估者的反馈键（例如，`has(feedback_key, "answer_usefulness")`）筛选第二个评估者，然后启用扩展统计信息。过滤器使代码评估器仅在分数存在后运行，并且扩展统计数据使分数在 `run["feedback_stats"]["answer_usefulness"]["avg"]` 处可读。

过滤器匹配反馈键而不是生成反馈键的评估器，因此来自任何具有该键的源的反馈都会触发代码评估器。要配置过滤器，请参阅[Apply a filter to runs that trigger the evaluator](/langsmith/online-evaluations-code#configure-online-evaluators)。

## 删除评估器

当评估器附加到跟踪项目或数据集时，您无法将其删除。要删除评估器：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-evaluators)中，选择左侧边栏中的**评估器**。
1. 选择您要删除的评估者。
1. 打开 **项目和数据集** 选项卡。对于每个附加的跟踪项目和数据集，在行右侧的 **操作** 菜单中选择 **分离**。
1. 返回**评估者**页面，点击页面顶部的**删除**。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluators.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>