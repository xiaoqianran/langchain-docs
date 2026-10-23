<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage evaluators | https://docs.langchain.com/langsmith/evaluators -->

# 管理评估者

在 LangSmith 的工作区级别查看和管理评估器。

LangSmith中的[Evaluators](/langsmith/evaluation-concepts#evaluators)是[workspace-level](/langsmith/administration-overview#workspaces)资源。您可以将单个评估器附加到多个[trace containers](/langsmith/observability-concepts#trace-containers)和[datasets](/langsmith/evaluation-concepts#datasets)，因此您可以在整个工作中应用一致的评估逻辑，而无需每次都重新创建它。

评估者所关注的内容取决于您的工作空间的组织方式。

> [!注意]
>
> **基于代理的工作区。** 如果您的工作区按 [agent and environment](/langsmith/agents) 组织跟踪，则本部分适用。要进行检查，请查看左上角的控件：它为您的工作区命名。如果它显示 LangSmith 徽标，并且侧边栏具有带有应用程序选择器的 **应用程序** 部分，则您的工作区是基于项目的。跳过本节并阅读[Tracing projects](/langsmith/observability-concepts#tracing-projects)。

评估器附加到 [agent](/langsmith/agents) 的 [environment](/langsmith/agent-environments#environment-names)。将其单独附加到 **生产** 以对生产流量进行评分，而无需对本地运行进行评分。> [!注意]
>
> **基于项目的工作区。** 如果您的工作区按 [tracing project](/langsmith/observability-concepts#tracing-projects) 组织跟踪，则本部分适用。要进行检查，请查看左上角的控件。在基于项目的工作区中，它显示 LangSmith 徽标，侧边栏有一个带有应用程序选择器的 **Application** 部分。如果控件显示您的工作区名称，则您的工作区是基于代理的。跳过本节并阅读[Agents](/langsmith/agents)。

评估器附加到[tracing project](/langsmith/observability-concepts#tracing-projects)。

> [!提示]
>
> 评估器分数是 [LangSmith Engine](/langsmith/engine) 的高优先级信号：在选择要分析的内容时，它会拉出低分跟踪，因此将评估器附加到项目会加剧引擎在那里发现的问题。

## 查看评估者

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-evaluators) 中，选择左侧边栏中的 **评估器** 以查看工作区中的所有评估器。

评估者表显示以下列：|专栏 |描述 |
| - | - |
|名称 |评估人姓名|
|类型 | **法学硕士作为法官**或**代码**。综合分数评估器的范围仅限于单个跟踪项目和数据集，因此不会出现在此处。 |
|反馈键|评估者产生的反馈键 |
|项目和数据集 |跟踪此评估器附加到的项目和数据集。在基于代理的工作区中，此列是 **环境和数据集**，并列出代理环境和数据集。 |
|评估器跟踪计数（本周）|该评估器在过去一周运行的跟踪数。仅在启用支出跟踪时显示； **–** 适用于代码评估者或没有附加规则的评估者。 |
|花费（本周）|该评估员过去一周的预计美元支出。仅在启用支出跟踪时显示； **–** 适用于代码评估者或没有附加规则的评估者。 |
|消费状态 |评估者是否**低于限制**、**无限制**，或者已达到一个或多个配置的支出限制。仅在启用支出跟踪时显示； **–** 适用于代码评估者。 |
|创建者 |创建评估器的工作区成员 |
|更新于 |上次修改评估器的时间 ||创建于 |评估器何时创建 |

## 创建一个评估器

您可以在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-evaluators) 中创建评估器，也可以使用 [SDK](#create-an-evaluator-with-the-sdk) 以编程方式创建评估器。无论哪种方式创建的评估器都是工作区级别的资源，显示在 **评估器** 表中。

### 在 UI 中创建评估器

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-evaluators)中，选择左侧边栏中的**评估器**。
2. 单击 **+ Evaluator** 打开新的评估器面板。
3. 该面板可让您：
   * **从头开始创建**：构建新的 [LLM-as-a-Judge](/langsmith/llm-as-judge)、[Decision Model](/langsmith/decision-model-evaluator) 或 [Code](/langsmith/online-evaluations-code) 评估器。
   * **添加 LangChain 调整评估器**：将 [specialized judge managed by LangChain](/langsmith/tuned-evaluators) 附加到兼容的跟踪项目，无需配置提示、模型或 API 密钥。
   * **从模板创建**：从现成的评估器（也称为预构建评估器）开始，以实现常见的评估模式。 **推荐**部分首先列出了流行的模板。其余的按类别分组：安保、安全、质量、对话、轨迹、图像评估和语音评估。有关每个模板的得分，请参阅[Prebuilt evaluator templates](#prebuilt-evaluator-templates)。您还可以直接从[tracing project](/langsmith/observability-concepts#tracing-projects)、代理环境或[dataset](/langsmith/evaluation-concepts#datasets) 添加评估器。在此流程中，您还可以从工作区**附加现有评估器**，或创建一个 [Composite](/langsmith/composite-evaluators-ui) 评估器。请参阅[Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)和[Automatically run evaluators on experiments](/langsmith/bind-evaluator-to-dataset)。

### 使用 SDK 创建评估器

使用 LangSmith SDK 以编程方式创建评估器。该 SDK 适用于 [Python](/langsmith/smith-python-sdk) 和 [TypeScript](/langsmith/smith-js-ts-sdk)。通过 SDK 创建的评估器与在 UI 中创建的评估器一起显示在 **评估器** 表中。

SDK尚不支持[decision model evaluators](/langsmith/decision-model-evaluator)。要创建一个，请使用 UI。

> [!注意]
>
> 通过 SDK 管理评估器需要 `langsmith>=0.9.8`（Python、PyPI）或 `langsmith>=0.7.16`（TypeScript、npm）。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

要创建 LLM 作为法官评估器并检索、更新、列出或删除评估器，请参阅[Manage evaluators with the SDK](/langsmith/manage-evaluators-sdk)。

## 预构建的评估器模板

预构建的评估器模板是用于常见检查的现成评估器，例如幻觉、提示注入和任务完成。每个模板都是一个起点。您可以在将其保存到工作区之前编辑其提示和评分架构。大多数模板是[LLM-as-a-judge](/langsmith/llm-as-judge)评估器，其提示来自开源[openevals](https://github.com/langchain-ai/openevals)包。有两个例外：断言使用LangSmith中定义的提示，而精确匹配是[code evaluator](/langsmith/online-evaluations-code)。

每个 LLM-as-a-judge 模板都会在其反馈键下写下一个分数，并在 `comment` 上写下法官的推理。语言和支持意图返回不带 `comment` 的标签。

`true` 分数并不总是意味着通过。检测到问题的模板在发现问题时返回 `true`：安全模板、幻觉、感知错误、图像模板和音频质量。其余的在输出通过时返回`true`。每个表中的 **Score** 列说明了 `true` 的含义。

模板在读取数据方面有所不同：* **整个线程**：对话和轨迹模板读取线程中的每条消息。当您将其添加到跟踪项目时，LangSmith 将其配置为线程级评估器。欲了解更多信息，请参阅[Set up multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)。
* **参考输出**：正确性、断言和精确匹配将输出与参考输出进行比较，参考输出来自 [dataset](/langsmith/evaluation-concepts#datasets) 示例。
* **计划**：除了线程消息之外，计划遵守还会读取 `plan` 变量。
* **附件**：图像和语音模板读取运行的附件。有关更多信息，请参阅[Evaluate with attachments](/langsmith/evaluate-with-attachments)。

### 安全

安全模板可检测泄漏、注入和对抗性输入。|模板|得分多少 |分数 |
| - | - | - |
| PII 泄露 |输入或输出是否包含可能识别或伤害个人的个人信息。 | `pii_leakage`（布尔值）：当找到 PII 时，`true`。 |
|立即注射 |输入是否包含针对 AI 系统的嵌入式指令。仅读取输入。 | `prompt_injection`（布尔值）：`true` 当发现注入尝试时。 |
|代码注入|输入是否包含嵌入在数据中的可执行代码。仅读取输入。 | `code_injection`（布尔值）：当发现注入尝试时，`true`。 |

### 安全

安全模板评估内容的安全性和适度性。

|模板|得分多少 |分数 |
| - | - | - |
|毒性|内容是否含有人身攻击、仇恨言论等有毒成分。 | `toxicity`（布尔值）：当发现有毒内容时，`true`。 |
|偏见与公平 |内容是否包含刻板印象、排他性语言或歧视性框架。 | `fairness`（布尔值）：当发现偏见或违反公平性时，`true`。 |

### 质量

质量模板衡量输出质量和准确性。|模板|得分多少 |分数 |
| - | - | - |
|幻觉|输出是否包含输入上下文不支持的主张，例如矛盾、推测性细节或不准确的事实。 | `hallucination`（布尔值）：当输出包含幻觉时，`true`。 |
|正确性|输出是否准确、完整并与参考输出一致。 | `correctness`（布尔值）：当输出正确时，`true`。 |
|断言|输出是否满足参考输出中的每个断言。法官从参考输出中读取一个`assertions`列表，其中每个条目都有一个`key`和一个`comment`。缺失或空的列表得分 `false`。 | `assertions_passed`（布尔值）：仅当每个断言都通过时才`true`。 |
|简洁|输出如何有效地传达所请求的信息，惩罚对冲、寒暄、元评论和冗余。 | `conciseness`（数字，0 到 10）：当输出仅包含基本信息时，`10`。 |
|代码检查器 |代码是否解决输入中的每个要求、处理边缘情况以及运行时不会出现错误。 | `code_checker`（布尔值）：当代码完整且正确时，`true`。 ||答案相关性 |输出是否直接解决输入问题而没有偏离主题。 | `answer_relevance`（布尔值）：当输出相关时，`true`。 |
|精确匹配|运行的输出是否完全等于参考输出。该模板作为代码运行并且不进行 LLM 调用。 | `exact_match`（布尔值）：当输出匹配时，`true`。 |

### 对话

对话模板评估整个线程的对话质量和用户体验。

|模板|得分多少 |分数 |
| - | - | - |
|感知错误 |用户信号（例如沮丧或重复纠正）是否表明用户感知到代理犯了错误。 | `perceived_error`（布尔值）：`true` 当用户察觉到导致严重挫败的错误时。 |
|语言 |对话的主要语言。 | `language`（字符串）：英文语言名称，如`Spanish`。 |
|支持意向 |支持对话的主要目的。 | `intent`（类别）：`Account & Billing`、`Order Management`、`Technical Support`、`Product Inquiry`、`Policy Inquiry`、`Status Check`、`Complaint & Feedback`、`Escalation` 之一，或`Other`。 |
|用户满意度|用户的语气和满意度指标是否表明用户感到满意。 | `user_satisfaction`（布尔值）：`true` 当用户表现满意时。 ||语气|座席的语气是否适合上下文并且一致。 | `agent_tone`（布尔值）：当语气合适时，`true`。 |
|任务完成 |代理是否完全完成了对话中的每个用户请求。 | `task_completion`（布尔值）：`true` 当每个请求完成时。 |
|知识保留|代理是否保留并应用了对话早期的事实，没有矛盾或忽略了上下文。 | `knowledge_retention`（布尔值）：`true` 当智能体保留早期事实时。 |

### 轨迹

轨迹模板评估整个线程中代理工具的使用和决策路径。

|模板|得分多少 |分数 |
| - | - | - |
|计划遵守 |特工的行动是否遵循其宣布的计划。 | `plan_adherence`（布尔值）：`true` 当代理遵循计划时。 |
|工具选择|代理是否以合理的顺序选择了正确的工具，没有不必要的电话。 | `tool_selection`（布尔值）：`true` 当刀具选择准确且高效时。 |
|轨迹精度|代理的路径是否合乎逻辑、显示出明显的进展并且相当有效。 | `trajectory_accuracy`（布尔值）：`true` 当轨迹准确且高效时。 |

### 图像评估图像模板评估图像内容的质量和安全性。

|模板|得分多少 |分数 |
| - | - | - |
|露骨内容 |图像是否包含裸露、性内容或暴力画面。 | `explicit_content`（布尔值）：当发现显式内容时，`true`。 |
|敏感图像|图像是否包含有害、冒犯性或不适当的符号或描述。 | `sensitive_imagery`（布尔值）：当发现敏感图像时，`true`。 |

### 语音评估

语音模板评估语音和音频交互质量。|模板|得分多少 |分数 |
| - | - | - |
|音频质量 |音频是否包含会降低聆听体验的削波、失真或故障。 | `audio_quality`（布尔值）：发现质量问题时`true`。 |
|转录准确度 |语音转文本转录是否准确反映口头内容。 | `transcription_accuracy`（布尔值）：当转录准确时，`true`。 |
|用户中断|代理是否妥善处理用户中断。 | `user_interrupts`（布尔值）：`true` 当中断得到妥善处理时。 |
|声音影响 |代理人的声音温暖、韵律、情绪语气是否恰当、自然。 | `vocal_affect`（布尔值）：当声音效果合适时，`true`。 |

## 查看评估者详细信息

单击表中的任何评估器以打开其详细信息视图。详细信息视图有四个选项卡：* **概述**：评估者的反馈配置和提示或代码定义。
* **跟踪**：此评估器在所有附加资源上处理的跟踪。
* **日志**：该评估器在所有附加资源上的执行日志。
* **项目和数据集**（基于代理的工作区中的**环境和数据集**）：此评估器附加到的跟踪项目、代理环境和数据集，每个附件的 [weekly spend and limit](/langsmith/evaluator-spend)。

## 编辑评估器

打开评估器。在 **概述** 选项卡中，单击 **编辑评估器** 图标以打开 **配置评估器** 面板。更新评估器的配置。单击**保存**。

由于评估器是共享的，因此更改适用于其附加的每个跟踪容器和数据集。

## 管理评估者跟踪保留

当在线评估器对跟踪进行评分时，它会将反馈附加到跟踪。这可以将跟踪自动升级到[extended retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)，具体取决于评估器的保留设置。延长保留时间可以使迹线保持更长的时间，但成本更高。当您在 [tracing project](/langsmith/observability-concepts#tracing-projects) 或代理环境上设置在线评估器时，您可以选择退出此升级，以便评分跟踪保持基本保留。仅当项目的[default retention](/langsmith/billing#change-project-level-default-retention)为[base tier](/langsmith/usage-and-billing#how-it-works)时，此控件才可用。如果项目默认为延长保留 ([set at the project or workspace level](/langsmith/data-purging-compliance#data-retention))，则评估者评分的轨迹将遵循该默认值，并且该选项将被锁定。

要选择不延长评分迹线的保留时间：

1. 当您使用[create](#create-an-evaluator)或[edit](#edit-an-evaluator)在线评估器时，请将源设置为[tracing project](/langsmith/observability-concepts#tracing-projects)或代理环境，而不是[dataset](/langsmith/evaluation-concepts#datasets)。
2. 展开评估器配置面板中的**高级**部分。
3. 清除**延长迹线保留**。

该更改适用于保存评估器后评分的轨迹。现有的评分跟踪保留其当前的保留级别。

上述的 **扩展跟踪保留** 切换适用于跟踪级和线程级（多轮）在线评估器。有关多轮评估器的更多信息，请参阅[Set up multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)。

## 包括扩展统计数据

使用 **在 [run-level evaluator](/langsmith/online-evaluations-llm-as-judge) 中包含扩展统计数据（反馈、成本、令牌）** 来评估运行中的反馈统计数据、令牌使用情况或成本数据。 `feedback_stats`字段包含反馈统计信息，包括每个反馈键的数量和平均值。此选项不适用于[multi-turn (thread-level) evaluators](/langsmith/online-evaluations-multi-turn)。LangSmith 为启用此选项的评估者获取附加数据。仅当您的评估逻辑或提示需要这些字段时才启用它。

要包含扩展统计数据：

1. 当您使用 [create](#create-an-evaluator) 或 [edit](#edit-an-evaluator) 运行级别评估器时，请展开评估器配置面板中的 **高级** 部分。
2. 选择**包括扩展统计数据（反馈、成本、代币）**。

### 访问扩展统计数据

[Code evaluators](/langsmith/online-evaluations-code)接收`run`对象中的这些字段，包括`feedback_stats`、`total_tokens`和`total_cost`。无论您是否启用扩展统计数据，他们还会在 `run["feedback"]` 中收到 [individual feedback records](/langsmith/feedback-data-format)。对于 [LLM-as-a-judge evaluators](/langsmith/online-evaluations-llm-as-judge)，将相应的 `run.*` 字段映射到提示变量。例如，将 `{{correctness_average}}` 映射到 `run.feedback_stats.correctness.avg` 以在提示中包含 `correctness` 反馈平均值。可用的`run.*`字段还包括提示和完成令牌、成本和详细信息字段。有关完整运行数据架构，请参阅[Run data format](/langsmith/run-data-format)。

## 链评估器

链式评估器是一种在线评估器，仅在另一个评估器已经评分的运行时触发。链接允许您使用更具体的评估器或为需要它的运行保留更昂贵的评估器。例如，仅当较早的 `correctness` 分数低于阈值时，您才可以运行 [LLM-as-a-judge evaluator](/langsmith/online-evaluations-llm-as-judge)。第二个评估器必须是运行级别评估器，因为 [multi-turn (thread-level) evaluators](/langsmith/online-evaluations-multi-turn) 无法过滤反馈。第一个求值器可以是任一类型。多轮评估器将其反馈附加到线程中的最后一次运行，因此链接到它的第二个评估器评估该运行，而不是整个线程。

将第二个评估器链接到第一个评估器上：

1. 创建或打开第二个求值器并展开其过滤器。有关更多信息，请参阅 [Apply a filter to runs that trigger the evaluator](/langsmith/online-evaluations-llm-as-judge#apply-a-filter-to-runs-that-trigger-the-evaluator)（LLM 法官评估者）或 [Create a filter](/langsmith/online-evaluations-code#3-create-a-filter)（代码评估者）。

2. 过滤第一个评估者的反馈键。过滤器匹配键而不是生成它的评估器，因此来自具有该键的任何源的反馈都会触发第二个评估器，包括[user feedback](/langsmith/attach-user-feedback)。使用只有第一个评估者生成的密钥。
   * 要在每次运行时触发第一个评估者评分，请仅对键进行过滤：

     ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     eq(feedback_key, "correctness")
     ```

   * 要仅在分数满足条件时触发，请将键与 `feedback_score` 比较结合起来。例如，仅当 `correctness` 低于 `0.5` 时触发：

     ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     and(eq(feedback_key, "correctness"), lt(feedback_score, 0.5))
     ```

3. 如果第二个评估者读取第一个分数，[include extended stats](#include-extended-stats)。 LLM 法官评估者需要它，代码评估者使用它来可靠地读取分数。有关更多信息，请参阅[Read the first score](#read-the-first-score)。4. 保存评估器。

第二个评估器仅在第一个评估器的分数附加到它之后才选择运行，因此评估器运行的顺序并不重要。有关完整的过滤器语法，请参阅[Trace query syntax](/langsmith/trace-query-syntax)。

### 读取第一个乐谱

第二个评估器如何读取第一个评估器的分数取决于其类型：

* **LLM 作为法官评估者**：[Include extended stats](#include-extended-stats)，然后将提示变量映射到`run.feedback_stats.<feedback_key>.avg`。例如，将 `{{correctness_average}}` 映射到 `run.feedback_stats.correctness.avg`。
* **代码评估器**：读取`run["feedback"]`中的[feedback record](/langsmith/feedback-data-format)，其`key`是第一个评估器的反馈键，并使用其`score`。 `run["feedback"]` 在评估器进程的每批运行中最多保留 100 条反馈记录，并且最旧的记录首先被删除，因此当批次包含许多反馈记录时，分数可能会丢失。要可靠地读取分数，请包括扩展统计数据并从 `run["feedback_stats"]["<feedback_key>"]["avg"]` 读取平均值。

`avg` 字段对运行中具有该键的每个反馈记录进行平均，因此仅当运行有一个具有该键的记录时，它才等于第一个评估者的分数。具有相同键的另一记录（例如用户反馈）会改变平均值。

## 删除评估器当评估器附加到跟踪容器或数据集时，您无法删除它。要删除评估器：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-evaluators)中，选择左侧边栏中的**评估器**。
2. 选择您要删除的评估者。
3. 打开 **项目和数据集** 选项卡（基于代理的工作区中的**环境和数据集**）。对于其中列出的每个附件，在行右侧的 **操作** 菜单中选择 **分离**。
4. 返回**评估者**页面，单击页面顶部的**删除**。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluators.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。