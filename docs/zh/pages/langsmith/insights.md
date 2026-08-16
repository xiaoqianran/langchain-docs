<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Discover errors and usage patterns with Insights | https://docs.langchain.com/langsmith/insights -->

# 通过 Insights 发现错误和使用模式

Insights 会自动分析您的跟踪，以检测使用模式、常见代理行为和故障模式，因此您无需手动查看数千条跟踪。

Insights 使用分层分类来理解您的数据并突出显示可操作的趋势。

<Note>
Insights 适用于 LangSmith Plus 和 Enterprise [plans](/langsmith/pricing-plans)。
</Note>

## 先决条件

- 在您的工作区中为 Insights 设置的 [model configuration](/langsmith/model-configurations)。
- [Permissions](/langsmith/organization-workspace-operations#projects) 在 LangSmith 中创建规则（生成新的见解报告所需）。
- [Permissions](/langsmith/organization-workspace-operations#projects) 查看 LangSmith 中的跟踪项目（需要查看现有的见解报告）。

## 生成您的第一份见解报告

<Tabs>
  <Tab title="UI" icon="layout-dashboard">

1. 导航至左侧菜单中的**跟踪项目**，然后选择一个跟踪项目。
1. 单击右上角的 **+New**，然后单击 **New Insights Report** 以生成有关项目的新见解。
1. 输入您的作业名称。
1. 如果您还没有在工作区设置中为 Insights [configure a model](/langsmith/model-configurations) 进行操作。
1. 回答引导性问题，将见解报告重点关注您想要了解的有关代理的信息，然后单击 **运行作业**。

<Tip>切换到手动模式[configure the job manually](#configure-a-job)。</Tip>这将启动后台洞察报告。报告最多可能需要 30 分钟才能完成。

  </Tab>
  <Tab title="SDK" icon="code">

您可以使用 [Python SDK](/langsmith/smith-python-sdk) 对存储在 LangSmith 外部的数据生成见解报告。这使您可以分析来自生产系统、日志或其他来源的聊天历史记录。

当您调用`generate_insights()`时，SDK将：

1. 将您的聊天记录作为痕迹上传到新的LangSmith项目。
1. 针对这些上传的跟踪生成洞察报告。
1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-insights) 中返回结果的链接。

<CodeGroup>

```python Python
import os
from langsmith import Client

client = Client()

chat_histories = [
    [
        {"role": "user", "content": "how are you"},
        {"role": "assistant", "content": "good!"},
    ],
    [
        {"role": "user", "content": "do you like art"},
        {"role": "assistant", "content": "only Tarkovsky"},
    ],
]

report = client.generate_insights(
    chat_histories=chat_histories,
    name="Customer Support Topics - March 2024",
    instructions="What are the main topics and questions users are asking about?",
    openai_api_key=os.environ["OPENAI_API_KEY"],  # optional if already set as workspace secret
)

# client.poll_insights(report=report)
```
</CodeGroup>

  </Tab>
</Tabs>

<Note>
    对于 OpenAI 模型，生成超过 1,000 个线程的见解通常需要 1.00-\2.00 美元，对于当前 Anthropic 模型，通常需要 3.00-4.00 美元。成本随着采样线程的数量和每个线程的大小而变化。
</Note>

## 理解结果

工作完成后，您可以导航到 **见解** 选项卡，您将在其中看到见解报告表。每个报告都包含对跟踪项目的特定跟踪样本生成的见解。

<Frame caption="Insights Reports for a single tracing project"><img src="/langsmith/images/insights-job-results.png" /></Frame>

单击进入您的作业即可查看组织为一组自动生成的类别的跟踪。您可以深入查看类别和子类别以查看底层跟踪、反馈和运行统计信息。

<Frame caption="Common topics of conversations with the https://chat.langchain.com chatbot"><img src="/langsmith/images/insights-nav.gif" /></Frame>

### 执行摘要

在每个报告的顶部，您都会找到一个执行摘要，其中显示了在跟踪中发现的最重要的模式。这包括：

- 主要调查结果以百分比显示每种模式出现的频率。
- 可点击的参考文献（例如#1、#2、#3）来追踪被识别为与您的问题特别相关的代理。

### 顶级类别

您的跟踪会自动分组为代表数据中最广泛模式的顶级类别。

分布条显示每种模式发生的频率，从而可以轻松发现多于或少于预期发生的行为。

每个类别都有一个简短的描述，并显示其包含的跟踪的聚合指标，包括：

- 典型的跟踪统计数据（如错误率、延迟、成本）
- 评估者的反馈分数
- [Attributes](#attributes) 提取为工作的一部分

### 子类别

单击任何类别都会显示子类别的细分，这使您可以更详细地了解该跟踪类别中的交互模式。在 [Chat Langchain](https://chat.langchain.com) 示例中，**数据和检索** 下有诸如 **矢量存储** 和 **数据摄取** 之类的子类别。

### 单独的痕迹

您可以通过单击查看跟踪表来查看分配给每个类别或子类别的跟踪。从那里，您可以单击任何跟踪来查看完整的对话详细信息。

## 配置作业

您可以使用自动生成的流程或手动配置来创建见解报告。

### 自动生成配置

1. 打开 **New Insights** 并确保 **自动** 开关处于活动状态。
2. 回答有关代理的目的、您想要了解的内容以及跟踪的结构的自然语言问题。 Insights 会将您的答案转换为配置草案（作业名称、摘要提示、属性和采样默认值）。
3. 选择一个提供商，然后单击“**生成配置**”进行预览或“**运行作业**”立即启动。

**提供有用的背景**为了获得最佳结果，请为每个提示写一两句话，为 Insights 提供所需的上下文 - 您要学习的内容、哪些信号或字段最重要，以及您已经知道的任何内容都是无用的。您对代理的功能及其跟踪的结构越清楚，Insights 就越能以具体、可操作且与您对数据的推理方式一致的方式对示例进行分组。

**描述你的踪迹**

解释一下您的数据是如何组织的：这些是单轮对话还是多轮对话？哪些输入和输出包含关键信息？这有助于 Insights 生成专注于重要事项的摘要提示和属性。如果需要，您还可以直接从 [summary prompt](#summary-prompt) 部分指定变量。

### 选择型号

Insights 使用两种模型：

- **思维模型**：执行聚类步骤（能力更强，成本更高）。
- **摘要模型**：生成每个跟踪摘要（更快、成本更低）。这两个模型都是从您在工作区中配置的提供程序中选择的。当您的 [model configurations](/langsmith/model-configurations) 中的 Insights 启用了特定模型时，您可以单独选择它们。如果未配置单独的模型，您可以选择一个提供程序（OpenAI 或 Anthropic），Insights 会使用该提供程序的默认模型。

为了获得最佳结果，请为这两个角色使用来自同一提供商的模型。

### 手动配置

手动配置为您提供了更多控制权，例如，预定义您希望数据分组的类别或定位与特定反馈分数和过滤器匹配的跟踪。

#### 选择轨迹

- **样本大小**：要分析的最大迹线数（限制为 1,000）。
- **时间范围**：从该时间范围采样迹线。
- **过滤器**：附加跟踪过滤器。当您调整过滤器时，您将看到有多少跟踪符合您的条件。

#### 类别

默认情况下，顶级类别是从底层跟踪自下而上自动生成的。

在某些情况下，您预先知道您感兴趣的特定类别，并希望作业将跟踪存储到这些预定义的类别中。配置的 **Categories** 部分允许您通过枚举要使用的顶级类别的名称和描述来执行此操作。

子类别仍然由预定义顶级类别中的算法自动生成。

当作业完成时，发现的顶级类别会自动保存回配置 - 但前提是配置没有预先定义类别。这意味着后续计划的运行将重用这些类别以保持一致性。

#### 摘要提示

该工作的第一步是创建每个跟踪的简短摘要。然后对这些摘要进行分类。

在摘要中提取正确的信息对于获得有用的类别至关重要。

您可以编辑用于生成这些摘要的提示。编辑提示时要考虑的两件事是：- 摘要说明：跟踪摘要中未包含的任何信息都不会影响生成的类别，因此请确保提供明确的说明，说明从每个跟踪中提取哪些信息很重要。
- 跟踪内容：使用小胡子格式来指定将每个跟踪的哪些部分传递给摘要器。具有大量输入和输出的大型走线可能既昂贵又嘈杂。减少提示以仅包含跟踪中最相关的部分可以改善结果。

您必须至少使用以下模板变量之一指定每个跟踪的哪些部分发送到摘要生成器：

|变量|描述 |示例|
| ---| ---| ---|
| `run.inputs` |最近一次 root 运行的输入 | `{{run.inputs}}` |
| `run.outputs` |最近一次 root 运行的输出 | `{{run.outputs}}` |
| `run.error` |错误字符串，如果运行失败 | `{{run.error}}` |
| `run.feedback` |所有反馈分数均以 JSON blob 形式 | `{{run.feedback}}` |
| `run.feedback.<key>` |按键的具体反馈分数 | `{{run.feedback.correctness}}` |
| `all_thread_messages` |线程的完整消息历史记录（仅适用于具有 [threads](/langsmith/threads) 的项目）| `{{all_thread_messages}}` |

您可以使用点表示法访问嵌套字段。例如，`{{run.inputs.foo.bar}}` 仅包含上次运行输入中 `foo` 内的 `bar` 字段。<Note>
对于具有[threads](/langsmith/threads)的项目，Insights 会分析完整的对话。仅每个线程最近运行的根用于 `run.*` 变量。使用`all_thread_messages`访问完整的对话历史记录。
</Note>

#### 属性

除了摘要之外，您还可以定义要从每个跟踪中提取的其他字符串、数字和布尔属性。
这些属性将影响分类步骤——具有相似属性值的迹线往往会被分类在一起。
您还可以查看每个类别的这些属性的聚合。

例如，您可能希望从每个跟踪中提取属性`user_satisfied: boolean`，以将算法引导至区分正面和负面用户体验的类别，并查看每个类别的平均用户满意度。

#### 过滤属性

您可以在布尔属性上使用 `filter_by` 参数来在生成见解之前预过滤跟踪。启用后，分析中仅包含属性计算结果为 `true` 的跟踪。当您希望将见解报告集中在特定的跟踪子集上时，这非常有用。例如，仅分析错误、仅检查英语对话或仅包含满足特定质量标准的跟踪。

**它是如何工作的：**
- 在为 Insights 创建配置时将 `"filter_by": true` 添加到任何布尔属性。
- LLM 在汇总期间根据属性描述评估每条踪迹。
- 在生成见解之前，排除属性为 `false` 或缺失的跟踪。

## 安排洞察报告

安排 Insights 报告定期自动运行。创建或编辑配置时，使用 **Schedule** 部分选择：

- **每日**：每天 8:00 UTC 运行。
- **每周一**：每周一 8:00 UTC 运行。
- **自定义**：输入您自己的 cron 表达式（采用 UTC）。

每次计划的运行都会使用您保存的配置生成一份新报告。时间范围是动态计算的。例如，“最近 24 小时”始终分析执行时的最近 24 小时窗口。

## 保存你的配置您可以选择使用 **另存为** 按钮保存配置以供将来重复使用。
如果您想要比较一段时间内的见解报告以识别用户和代理行为的变化，这尤其有用。

创建新的见解报告时，从窗格左上角的下拉列表中以前保存的配置中进行选择。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/insights.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>