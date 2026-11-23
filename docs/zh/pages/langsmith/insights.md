<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Discover usage patterns and failure modes with Insights | https://docs.langchain.com/langsmith/insights -->

# 通过 Insights 发现使用模式和故障模式

使用 LangSmith 见解不断对代理的跟踪进行分类，跟踪使用模式和故障模式如何随时间变化，并共享结果。

Insights 不断将代理的跟踪分为类别和子类别，以便您可以了解用户的请求、代理的行为方式以及失败的位置，而无需一一查看跟踪。您可以通过询问有关流量的问题来开始洞察。 Insights 根据最近的跟踪构建类别，然后在新对话到达时为其分配新对话，因此其图表和指标保持最新状态。

代理的见解页面列出了代理拥有的每个见解，并标有其所属的 [environment](/langsmith/agent-environments)。您在 UI 中创建的见解将转到 **生产**。

> [!注意]
>
> Insights 适用于 LangSmith Plus 和 Enterprise [plans](/langsmith/pricing-plans)。在自托管 LangSmith 上，连续 Insights 需要 v0.18 或更高版本以及 [SmithDB](/langsmith/self-host-smithdb)。其他自托管安装会生成 [batch reports](/langsmith/insights-batch-reports)。要检查您的安装使用哪种模式，请参阅[Check whether Insights runs continuously](/langsmith/self-host-insights-chat#check-whether-insights-runs-continuously)。

## 洞察如何运作

每个见解分两个阶段进行：1. **构建类别**：Insights 总结最近跟踪的样本，默认情况下最多 7 天的 500 条跟踪，并将摘要分组为顶级类别和子类别。第一次构建在您创建洞察时开始，最多可能需要 30 分钟。
2. **对新对话进行分类**：Insights 在对话到达时对其进行采样。对于每个采样的对话，它都会编写一个摘要，提取任何[attributes](#add-attributes)，并分配最适合的类别和子类别。对话是[thread](/langsmith/threads)，或者不属于线程的跟踪。 Insights 在线程空闲了环境的[thread idle time](/langsmith/rules#set-the-thread-idle-time)（默认情况下为 10 分钟）后对其进行分析。

类别不会自行改变。当您[refresh categories](#refresh-categories)时，已有类别的跟踪将保留它，新的对话将使用刷新的类别。

每个洞察都运行在 Insights 创建和管理的三个[automation rules](/langsmith/rules)上。这些规则不会出现在环境的 **在线评估程序** 选项卡上。在 LangSmith 云上，它们计入工作区可以打开的自动化规则的最大数量，以及其规则超出限制 [pauses](#check-the-status-of-an-insight) 的洞察。

## 先决条件* Insights 的模型访问：Insights 使用的每个模型提供商的 API 密钥，保存在您的工作区中。要检查或添加密钥，请在创建见解时单击“**配置**”，或在现有见解上单击“**编辑**”，然后单击 [Select models](#select-models) 部分中的 **API 密钥**。有关工作区范围的模型设置，请参阅[model configurations](/langsmith/model-configurations)。
* [Permissions](/langsmith/organization-workspace-operations#projects) 查看代理环境。如果访问策略限制您可以在环境中看到哪些跟踪，则 Insights 不会显示该环境的见解。
* `rules:create` 创建见解和刷新其类别的权限，`rules:update` 编辑它们的权限，`rules:delete` 删除它们的权限。

## 创建洞察> [选项卡] 用户界面
>
> 创建见解：
>
> 1. 在[agent switcher](/langsmith/navigate-agents)中选择您的代理，然后单击左侧菜单中的**见解**。
> 2. 如果见解已列出见解，请单击 **新见解**。
> 3. 在**您想了解用户的哪些信息？**下，输入一个问题，例如“用户最常询问什么？”
> 4. （可选）单击 **配置** 以更改第一次构建之前的设置。参见[Configure an insight](#configure-an-insight)。
> 5. 单击**运行分析**。
>
> 见解为见解命名并根据您的问题编写其摘要说明，然后开始构建类别。构建运行时，Insights 会显示其步骤：收集跟踪、汇总跟踪、将跟踪分组到类别以及保存类别。构建完成后，洞察力开始对新对话进行分类。> [标签] SDK
>
> 您可以使用 [Python SDK](/langsmith/smith-python-sdk) 创建对存储在 LangSmith 外部的聊天历史记录的洞察，例如生产日志。
>
> 当您调用`generate_insights()`时，SDK：
>
> 1. 将您的聊天记录上传到LangSmith作为痕迹。
>
> 2. 深入了解这些痕迹并开始构建其类别。
>
> 3. 返回一个对象，其`link`在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-insights)中打开洞察。在构建完成之前，该链接会显示其进度。
>
>> [!注意]
>>
>> 如果工作区没有提供者的密钥，`generate_insights()` 会将您传递的密钥保存为工作区机密。 SDK 每次调用最多上传 1,000 条聊天记录。
>
> ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import os
> from langsmith import Client
>
> client = Client()
>
> chat_histories = [
>     [
>         {"role": "user", "content": "how are you"},
>         {"role": "assistant", "content": "good!"},
>     ],
>     [
>         {"role": "user", "content": "do you like art"},
>         {"role": "assistant", "content": "only Tarkovsky"},
>     ],
> ]
>
> report = client.generate_insights(
>     chat_histories=chat_histories,
>     name="Customer Support Topics - March 2024",
>     instructions="What are the main topics and questions users are asking about?",
>     openai_api_key=os.environ["OPENAI_API_KEY"],  # optional if already set as workspace secret
> )
>
> # client.poll_insights(report=report)
> ```
>
> 要等待构建完成，请将报告传递给`poll_insights()`。

> [选项卡] CLI
>
> [LangSmith CLI](/langsmith/langsmith-cli) 从 JSON 配置文件创建洞察并开始构建其类别：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langsmith insights create --project "<environment-tracer-session-name>" --config insights.json --wait
> ```
>
> 将 `<environment-tracer-session-name>` 替换为洞察分析的代理环境的 [⟦T10⟧](/langsmith/create-an-agent#use-an-environment-project)。
>
> 有关文件格式以及刷新、列出和更新见解的命令，请参阅 [Manage insights](/langsmith/langsmith-cli#manage-insights)。

## 阅读见解

见解为每个见解显示一张卡片，其中包含过去 14 天内的顶级类别。单击卡片以打开见解。开放式洞察显示其上次对跟踪进行分类时的[status](#check-the-status-of-an-insight)，以及所选时间范围的这些视图：

* **顶级类别**：每个类别中已分类的跟踪数。单击某个类别可将图表和表格聚焦在该类别上。
* **随时间变化的类别**：每个类别的每日计数（UTC）。 **趋势**为每个类别画一条线，而**数量**将类别堆叠到分类总数中。 **类别已更新**标记显示洞察类别上次更改的时间。
* **细分表**：每个类别的描述、跟踪计数、数字和布尔[attribute](#add-attributes)值、反馈分数、错误率、P50 和 P99 延迟、P50 代币和 P50 成本。布尔属性显示该属性为 true 的迹线的百分比。字符串属性不会出现在表中。展开类别以查看其子类别。单击子类别或没有子类别的类别，以在新选项卡中打开其跟踪。

要更改时间范围，请使用**共享**旁边的范围菜单。它显示最近 7 天、14 天或 30 天，默认为 14 天。计数仅包括见解分类的跟踪。例如，在 10% 的采样率下，它们大约覆盖了十分之一的流量。使用它们来比较类别并跟踪趋势，而不是衡量总量。

### 检查见解的状态

见解名称下的状态行说明它是否对新对话进行分类，以及如果不分类该怎么办：

* **构建类别**：第一个构建正在运行。状态命名其当前步骤。
* **持续分析**：洞察力是实时的。状态显示其采样率。
* **暂停**：[sampling rate](#choose-runs) 为 0%，或者缺少某些洞察的自动化规则。如果比率为 0%，请设置更高的比率。如果缺少规则，则工作区已达到其规则限制：关闭或删除未使用的规则，然后单击“**刷新类别**”以重新创建它们。
* **关闭**：洞察力不分析新对话，例如一次性批量报告中保存的配置。设置启动采样率。
* **未上线**：洞察需要构建才能开始。单击“**构建类别**”或“**刷新类别**”。如果上次构建没有发现可分类的痕迹，请检查洞察的[filters](#choose-runs)。如果第一次构建失败，Insights 会在见解位置显示错误，例如模型 API 密钥丢失或无效。单击 **Review** 修复设置，或点击 **Dismiss** 删除失败的构建。

### 早期批次报告的见解

在连续分析之前创建的批量报告中保存的配置显示为见解。那些按计划运行的对话会对新对话进行分类。在您设置采样率之前，其他选项都是**关闭**。时间表不再启动报告。

过去的报告不再作为报告页面打开。每个报告分类的对话显示在该报告涵盖的日期的匹配见解的图表中。要阅读过去报告的执行摘要和类别统计数据，请使用[⟦T11⟧](/langsmith/langsmith-cli#manage-insights)。

## 配置洞察

要更改现有见解，请打开它并单击“**编辑**”。要在第一次构建之前设置这些选项，请在 [create the insight](#create-an-insight) 时单击 **配置**。

编辑会应用于保存后分析的对话，并且已有类别的跟踪会保留该类别。更改见解的类别会保存见解并开始构建，因此按钮显示**保存并运行**。

### 选择运行* **添加过滤器（可选）**：选择条件以仅包含某些运行。 Insights 始终分析根运行。在过滤器下方，见解显示上周有多少对话与它们匹配。
* **选择采样率**：Insights 分析的传入对话的百分比。速率越高，结果越具有代表性，但成本也越高。 0% 暂停洞察力。

如果您未设置费率，Insights 会从上周的匹配对话中选择一个，目标是每周约 1,000 个对话。如果匹配的对话少于 1,000 个，则匹配率为 100%。 Insights 设置此速率一次，并且不会随着流量变化而调整。

### 选择型号

Insights 使用两种模型：

* **汇总模型**：汇总每条轨迹并提取属性。具有大上下文窗口的快速模型效果很好。
* **分类模型**：将跟踪分组并为其分配新跟踪。具有强大推理能力的模型效果很好。

选择“**推荐**”以使用工作区的默认 Insights 模型，或选择“**自定义**”以选择每个模型。要查看默认值，请转到 **设置** > **工作区** > **模型** > **功能访问** 并找到 **见解（摘要）** 和 **见解（思考）** 行。如果某行没有默认模型，Insights 将使用该行可用的第一个模型。如果没有可用模型，Insights 将使用 OpenAI 模型，该模型需要工作区中的 OpenAI API 密钥。欲了解更多信息，请参阅[Feature Access](/langsmith/model-configurations#feature-access)。

单击 **API 密钥** 以检查工作区是否具有每个模型提供程序的密钥。

### 创建类别

默认情况下，**AI Suggested** 在第一个构建中具有 Insights 查找类别和子类别。要自行设置顶级类别，请选择**自定义**并添加最多 10 个类别，每个类别都有名称和描述。 Insights 仍然会在每个版本中找到其中的子类别。

编辑见解时，您可以添加、删除或重命名其类别。保存开始使用新类别进行构建。

### 添加属性

属性捕获细目表为每个类别报告的每个跟踪的属性，例如情绪或用户满意度。要添加属性，请单击“**添加属性**”并设置：* **名称**：属性的名称。对于数字和布尔属性，这是细分表中的列名称。
* **类型**：**布尔值**、**数字**或**字符串**。
* **Insights 应该寻找什么？**：属性的描述，汇总模型使用该描述来提取它。
* **过滤器**：仅适用于布尔属性。选择此选项后，“见解”仅对属性正确的跟踪进行分类和计数，例如，将见解集中于客服人员犯错误的对话。

### 删除见解

要删除见解，请打开它，单击“**编辑**”，然后单击其设置底部的“**删除**”。删除洞察会阻止它对新跟踪进行分类。已分类的痕迹保留其类别。

## 刷新类别

类别不会自动刷新。要从最近跟踪的新样本重建洞察的类别，请打开洞察并单击 **刷新类别**。新对话将继续使用当前类别，直到构建完成。当它运行时，洞察会显示**刷新类别**。如果构建失败，洞察将显示**刷新失败**并保留其当前类别。如果构建找不到可用的类别，则会显示**类别未更新**。

## 分享见解

要分享见解，请打开它并单击 **分享**：

* **复制链接**：复制您所看到的见解的链接，包括时间范围和任何选定的类别。
* **下载 CSV**：下载每个类别和子类别及其所有统计数据，无论表格显示什么。
* **下载 PDF**：下载图表和完整细分。图表数据加载完成后，此选项可用。

## 将更新发送到 Slack

Insights 可以将有关见解的更新发布到 Slack 频道。这需要一个连接到您的 LangSmith 组织的 Slack 工作区。如果未连接，洞察设置的 **Slack 通知** 部分将显示 **连接 Slack** 按钮。在自托管 LangSmith 上，操作员必须首先[configure a Slack app](/langsmith/self-host-slack)。

要将更新发送到 Slack：1. 在见解的设置中，转到 **Slack 通知** 并选择一个渠道。
2. 打开您想要的更新：
   * **类别就绪**：首次构建见解的类别以及每次刷新它们时发布。
   * **摘要**：按计划发布最重要的类别及其变化方式。选择**每日**或**每周**，然后选择日期和时间。该时间表使用您首次设置的浏览器的时区。
3. 单击“**保存**”。

每次更新都会显示见解的名称、涵盖的时间段、见解分类的跟踪数以及采样率。它列出了前五个类别及其跟踪计数，以及最多三个关键变化：出现的类别，或其跟踪份额自上一时期以来变化了 5 个百分点或更多。 **在 LangSmith** 中打开** 打开更新涵盖的日期的见解。

要停止更新，请关闭这两个选项并保存。

## 管理成本

Insights 会为其分析的每个对话调用您的模型，因此其成本取决于：* **采样率和流量**：每个采样的对话都会对摘要模型进行一次调用，对分类模型进行一次调用。由于采样率不会根据流量进行调整，因此流量峰值会增加成本。
* **对话大小**：较长的对话会向摘要模型发送更多令牌。
* **类别构建**：每个构建都会汇总最多 500 个跟踪，并将它们与分类模型进行分组。

为了降低成本，请降低[sampling rate](#choose-runs)、添加过滤器或[select](#select-models)更小的型号。

## 限制

* Insights 为每条轨迹分配一个最适合的类别，即使没有类别与其完全匹配。
* Insights 读取跟踪的输入、输出、错误、反馈和线程消息。它不读取跟踪元数据。
* 代理环境最多可容纳 100 个见解。
* 工作区一次最多可以为三个见解构建类别。

## 另请参阅

* [Generate batch Insights reports on self-hosted LangSmith](/langsmith/insights-batch-reports)
* [Manage insights with the LangSmith CLI](/langsmith/langsmith-cli#manage-insights)
* [How Engine differs from Insights](/langsmith/engine#how-engine-differs-from-insights)
* [Configure model access](/langsmith/model-configurations)
* [Set up thread-level online evaluators](/langsmith/online-evaluations-multi-turn)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/insights.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。