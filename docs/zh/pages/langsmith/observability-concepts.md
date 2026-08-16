<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Observability concepts | https://docs.langchain.com/langsmith/observability-concepts -->

# 可观察性概念

LangSmith 可观察性可让您记录、检查和分析 AI 代理所采取的每一步。本页介绍如何在 LangSmith 中构建和可视化数据，以及如何开始发送​​跟踪。

## LangSmith 如何构建和可视化数据

在LangSmith中，代理执行的每个工作单元，例如模型调用、工具调用或信息检索，都被记录为[_run_](#runs)。单个操作的运行被收集到[_trace_](#traces)中。您可以将多轮会话的跟踪链接在一起作为 [_thread_](#threads)。

[_trajectory_](#trajectories) 是另一种构建和可视化数据的方法。虽然线程对会话的跟踪进行分组并保留其嵌套结构，但轨迹将整个会话展平为有序的消息列表，显示代理从开始到结束所采取的路径。

<img
    className="block dark:hidden"
    src="/langsmith/images/thread-trajectory-light.png"
    alt="A thread groups a session's traces and keeps their nesting, while a trajectory flattens the same session into an ordered list of messages"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/thread-trajectory-dark.png"
    alt="A thread groups a session's traces and keeps their nesting, while a trajectory flattens the same session into an ordered list of messages"
/>

### 运行

_run_ 表示由代理执行的单个工作单元，例如调用 LLM、格式化提示或检索文档。如果您熟悉[OpenTelemetry](https://opentelemetry.io/)，您可以将运行视为一个跨度。

### 痕迹_trace_ 是单个操作的运行集合。例如，如果用户请求触发调用模型的代理，运行工具，然后再次调用模型，则所有这些运行都属于同一跟踪。运行通过唯一的跟踪 ID 绑定到跟踪。

<Note>每条轨迹最多可运行 25,000 次。一旦跟踪达到此限制，LangSmith 将拒绝您为该跟踪发送的任何其他运行。</Note>

### 话题

_thread_ 是表示单个多轮会话的跟踪序列。轮次是该会话中的一次交换：用户的消息以及代理响应时所做的一切。每个转弯都被记录为自己的轨迹。要将跟踪分组到线程中，请传递具有唯一值的 `thread_id` 元数据键。

[Learn how to configure threads](/langsmith/threads)。

### 轨迹

_trajectory_ 是一个平面、有序的消息列表，显示代理从开始到结束所采取的路径。

在 LangSmith 中，轨迹是线程中轨迹的投影。它包含会话期间交换的人类、AI 和工具消息，每个消息按照首次出现的顺序出现一次，并删除了运行的嵌套。

<Note>
[Messages view](/langsmith/view-traces#messages-view)，在 LangSmith UI 中渲染轨迹，位于 **[beta](/langsmith/release-stages)**。
</Note>

[Learn how trajectories render in the Messages view](/langsmith/messages-view-integrations)。### 比较迹线、线程和轨迹

|  |追踪|主题 |轨迹 |
| ---| ---| ---| ---|
|形状|运行树 |痕迹序列|扁平化、有序的消息列表 |
|包含 |每次运行，都有完整的输入和输出|每个链接跟踪中的每次运行 |每个链接跟踪中的每条消息均经过重复数据删除 |
|当 | 时伸手去拿它您正在调试为什么一项操作失败或运行缓慢 |您正在检查代理在回合中的行为方式，计时和嵌套完好无损 |您正在阅读会话中交换的内容，但没有执行详细信息 |

<Callout type="info" icon="feather">
使用 **[Chat](/langsmith/chat)** 分析跟踪、运行和线程。聊天可帮助您了解代理性能、调试问题并从对话线程中获取见解，而无需手动挖掘数据。
</Callout>

### 项目

_project_ 是与单个应用程序或服务相关的所有跟踪的容器。

[Log traces to a project](/langsmith/log-traces-to-project)。

## 痕量富集

### 反馈_反馈_允许您根据特定标准对个人跑步进行评分。每个反馈条目由标签和分数组成，并通过唯一的运行 ID 与运行绑定。反馈可以是连续的或离散的（分类的），标签可以在组织内的运行中重复使用。

有关如何存储反馈的更多信息，请参阅[Feedback data format guide](/langsmith/feedback-data-format)。

### 标签

_Tags_ 是您可以附加到运行的字符串，以便在 LangSmith UI 中对它们进行分类、过滤和分组。

[Learn how to attach tags to your traces](/langsmith/add-metadata-tags)。

### 元数据

_Metadata_ 是您可以附加到运行的键值对的集合。例如，应用程序版本、环境或任何其他上下文信息。与标签类似，您可以使用元数据来过滤和分组运行。

[Learn how to add metadata to your traces](/langsmith/add-metadata-tags)。

## 发送痕迹

有两种方法可以将跟踪数据发送到LangSmith。

### 集成

LangSmith _integrations_ 为流行的 LLM 提供商和代理框架提供自动跟踪（相当于一般可观察性中的自动检测）。当您使用受支持的框架（例如 LangChain、LangGraph、OpenAI、Anthropic 或 CrewAI）时，集成将捕获输入、输出和元数据，而无需手动更改代码。

[Browse all integrations](/langsmith/integrations)。

### 手动仪器_手动检测_允许您向任何代码添加跟踪，无论框架如何。当您未使用受支持的集成或需要对跟踪内容进行精细控制时，请使用它。 LangSmith提供了三种机制：

- `@traceable` / `traceable`：用于跟踪任何函数的装饰器
- `trace` 上下文管理器 (Python)：包装特定的代码块
- `RunTree` API：低级、显式跟踪构造

[Learn how to add manual instrumentation](/langsmith/annotate-code)。

## 数据保留

LangSmith (SaaS) 将跟踪数据保留 180 天。此后，痕迹将被永久删除，并保留有限的元数据用于使用情况统计。有关保留级别和定价的详细信息，请参阅[Usage and billing: Data retention](/langsmith/usage-and-billing#data-retention)。

<Note>
要使数据超出保留期限，请将其添加到[dataset](/langsmith/manage-datasets)。即使源跟踪被删除，数据集也会无限期地保留。
</Note>

要在过期日期之前删除跟踪，请参阅[Manage a trace](/langsmith/manage-trace#delete-a-trace)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-concepts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>