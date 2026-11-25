<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use annotation queues | https://docs.langchain.com/langsmith/annotation-queues -->

# 使用注释队列

*注释队列*为人类审阅者提供了一个集中的工作流程，用于将反馈附加到特定的[runs](/langsmith/observability-concepts#runs)或[threads](/langsmith/observability-concepts#threads)。虽然您始终可以[annotate traces inline](/langsmith/annotate-traces-inline)，但注释队列可让您将运行和线程分组在一起、规定细则并跟踪审阅者进度。通过查看整个线程，您可以评估完整的多轮对话，捕获单次运行无法捕获的质量信号。

> [!注意]
>
> 您还可以使用 SDK 以编程方式管理注释队列和反馈配置。参考[Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk)。

LangSmith支持两种队列样式：

* [**Single-run annotation queues**](#single-run-annotation-queues) 一次呈现一个队列项目，可以是一次运行，也可以是一个线程，并让审阅者提交您配置的任何标题反馈。对于 [LangSmith Engine proposed as offline examples](/langsmith/engine-issues#add-offline-examples) 的 **运行** 项目，单次运行队列还会显示 [assertions](/langsmith/assertions)，以便在保存它们进行离线评估之前进行查看。
* [**Pairwise annotation queues (PAQs)**](#pairwise-annotation-queues) 并排呈现两次运行，以便审阅者可以根据您定义的标题项目快速决定哪个输出更好（或者它们是否等效）。

> [!提示]
>
> 有关使用注释队列的演示，请观看 [Getting started with annotation queues](#video-guide) 视频指南。

## 单次运行注释队列单次运行队列一次显示一项，并让审阅者提交您配置的任何标题反馈。它们可以直接从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-annotation-queues) 中的 **注释队列** 页面创建。队列可以包含运行项和线程项的混合。 *线程项目*代表整个对话，并根据与运行项目相同的标准进行审核。

运行项和线程项支持不同的功能：

|能力|运行项目 |主题项目 |
| - | - | - |
|评分标准反馈 |是的 |是的 |
|审稿人笔记|是的 |没有 |
|断言|仅限引擎建议的运行 |没有 |
|添加到数据集|是的 |是的 |
|默认数据集 |是的 |没有 |
|自动化规则|是的 |是的 |

### 创建单次运行队列

1. 在左侧边栏中，单击 **注释队列**。
2. 单击左上角的**+注释队列**，打开**创建注释队列**面板。

#### 基本细节1. 填写队列的**名称**和**描述**。
2. （可选）选择一个**代理**。
3. （可选）**选择默认数据集**，以简化将审核的运行导出到 LangSmith [workspace](/langsmith/administration-overview#workspaces) 中的数据集的过程。当您在运行项目上使用 **添加到数据集** 时，将应用默认数据集；线程项不支持默认数据集。

#### 注释栏

反馈标题是审阅者为每个队列项目填写的有序项目列表。每个标题项目都使用 [feedback tag](/langsmith/set-up-feedback-criteria) 并添加特定于队列的说明、该项目是否是必需的以及早期答案的可选条件。您可以在评分细则中定义申请的良好回复，因此每个审阅者都会根据相同的标准对项目进行评分。

> [!注意]
>
> LangSmith 云和自托管 LangSmith v0.18 或更高版本上提供了评分细则条件、评分细则复制、多选反馈标签和共享审阅者注释。早期的自托管版本不包含这些功能。您可以在 **创建注释队列** 面板的 **反馈评分细则** 部分中构建评分细则。要更改现有单次运行队列的标题，请打开队列并单击右上角的**标题**。仅当您可以编辑队列时才会出现此按钮。

要构建一个标题：

1. 为您的注释者起草一些高级**说明**，这些说明将显示在每个项目的侧栏中。

2. 单击“**添加评分项**”并选择反馈标签。该菜单首先列出**在其他队列中使用**的标签，然后列出**所有标签**。在搜索框中键入内容以过滤工作区的标签，或单击 **+ 新建** 以创建标签。要从您已经构建的标题开始，请参阅[Copy a rubric from another queue](#copy-a-rubric-from-another-queue)。

   每个标题项目显示其标签的类型，例如**分类·2 个选项**。使用 [multi-select](/langsmith/set-up-feedback-criteria#allow-multiple-selections) 标签的项目还会显示 **多选** 徽章。

3. 为每个项目添加描述。如果该项目使用分类标签，还请添加每个类别的简短描述。

4. （可选）对于自由格式项目，输入 **Regex 验证器**，例如 `CASE-\d+`。每个答案都必须匹配才能保存。

5. （可选）选择 **必填** 以使审阅者填写该项目，然后才能将队列项目标记为已完成。6. （可选）单击“**添加逻辑**”以根据先前的答案显示或要求该项目。详情请参见[Add conditions to rubric items](#add-conditions-to-rubric-items)。

7. 如果您使用 **Rubric** 按钮打开了评分细则，请单击 **Save**。

审阅者可以在用户界面的右侧窗格中看到**说明**和标题项。

对于自由文本反馈，请添加使用自由格式反馈标签的评分项。每个答案仅对撰写该答案的审阅者可见。该项目在 CSV 导出中拥有自己的列，并且可以触发 [condition](#add-conditions-to-rubric-items)。要让审阅者编写其他审阅者可以阅读的注释，请打开 [shared reviewer notes](#collaborator-settings)。

#### 数据格式化

数据格式设置选择审阅者看到的运行项目的布局。它们不适用于线程项目。

> [!注意]
>
> 默认视图和 **经典跟踪视图** 设置在 LangSmith 云和自托管 LangSmith v0.18 或更高版本上可用。早期的自托管版本对每个队列都使用经典布局。

每个队列使用两种布局之一：* **默认视图**：在跑步的[trajectory](/langsmith/view-traces#trajectory-view)中打开跑步项目，滚动到正在评分的回合。审阅者按照跟踪中出现的方式阅读对话，而不是原始输入和输出。该视图是只读的。参考输出和附件移至运行的 [**Details**](/langsmith/view-traces#details-view) 面板。有关完整审核流程，请参阅[Review a single-run queue](#review-a-single-run-queue)。
* **经典跟踪视图**：默认关闭。启用后，运行项目将以经典布局打开，审阅者可以在其中编辑运行的输入、输出和消息。启用它还会显示这些设置：

  * 一个选择器，可隐藏运行输入和输出中选定的 JSON 路径。从样本运行构建的复选框中选择字段，或输入路径。保存队列后将出现选择器。
  * **显示反馈**：显示正在运行的反馈。
  * **显示元数据**：显示运行的元数据。

#### 协作者设置

设置审阅者的数量或您想要将项目保留给协作者的最长时间。当某个项目有多个注释者时，您可以选择将该项目保留在队列中，直到所有审阅者将其标记为已完成。在这些设置中，“运行”指的是任何队列项目，包括线程项目。设置如下：* **所有工作区成员都会审核每次运行**：启用后，项目将保留在队列中，直到每个 [workspace](/langsmith/administration-overview#workspaces) 成员将其审核标记为已完成。

* **启用运行预订**：预订项目会将其锁定一段时间内供您审阅。当项目被保留时，其他审阅者可以查看它，但无法添加反馈或注释。如果所有工作区成员都查看每次运行，则预约将被禁用。

  如果审阅者查看了某个项目然后离开而未将其标记为已完成，则预订将在指定的**预订长度**后过期。然后，该项目被释放回队列中，并可以由另一位审阅者保留。

* **每次运行的审阅者数量**：这决定了必须将项目标记为已完成才能从队列中删除的审阅者数量。

  * 审稿人无法查看其他审稿人留下的评分细则反馈。
  * 只有当[**Let reviewers leave notes for each other**](#collaborator-settings)打开时，审稿人才能阅读彼此的笔记。

  > [!注意]
  >
  > 当启用“使用分配的审阅者”时，**每次运行的审阅者数量**设置将被隐藏（见下文）。* **使用指定的审阅者**：启用此切换以使用特定工作区成员而不是基于计数的阈值。启用后：

  * 将出现一个多选用户选择器，以便您可以选择特定的工作区成员作为指定的审阅者。
  * 仅当每个指定的审阅者都提交了审阅后，项目才会被标记为“**已完成**”。队列项目会经历三种状态：**需要审核**、**需要其他人审核**和**已完成**。
  * 未分配的工作区成员仍然可以对项目进行注释，但他们的提交不计入完成。
  * 任何工作区成员都可以在队列设置中编辑分配的审阅者列表。

  > [!注意]
  >
  > 当您将新分配的审阅者添加到已完成项目的队列时，这些项目不会恢复为待处理状态。如果您删除指定的审阅者，他们尚未审阅的任何项目都会重新计算其完成状态。* **让审阅者互相留言**：默认关闭。审阅者注释是审阅者之间的消息，例如有关某个项目的问题或上下文，而不是对该项目的反馈。启用后，每个运行项目都会在审阅窗格中获得一个 **审阅者注释** 按钮。审稿人用它来撰写自己的注释并阅读其他审稿人的注释，每个注释都有其作者和时间。如需反馈，请使用自由格式 [rubric item](#annotation-rubric)。

  当共享关闭时，新队列没有注释框。在关闭共享的旧队列中，每个审阅者的私人注释显示为标题末尾的 `note` 标题项，标记为“只有您可以看到您的注释”。将队列导出为 CSV 时，注释会显示在其自己的列中，其中列出了每个审阅者的注释。

由于这些设置，每个审阅者可见的项目数可能与队列总大小不同。

### 编辑队列的设置

1. 打开要编辑的注释队列的 **编辑注释队列** 面板。您可以通过两种方式访问​​该面板：* 在 **注释队列** 列表中，单击队列行右侧的 **操作** 图标。从下拉列表中选择**编辑**。
   * 在注释队列视图中，单击右上角的 **设置** 图标。

2. 在 **编辑注释队列** 面板中，修改您在队列创建期间配置的任何设置，然后单击 **保存**。

### 从另一个队列复制一个标题

复制一个标题以在另一个队列中重用其项目，而不是重建它们。复制可用于标题为空的单运行队列。

要复制标题：

1. 在空白的**反馈评分细则**部分中，单击**复制现有评分细则**。选择器列出了工作区的其他单次运行队列，最近更新的最先列出。使用 **搜索队列...** 来过滤列表。
2. 选择源队列。预览会列出每个项目的键、类型、要求和条件。
3. 单击“**复制 *N* 个项目**”，其中 *N* 是要复制的项目数。

每个复制的项目都保留其说明、类别描述、要求、条件、正则表达式验证器和反馈标签。复制链接现有标签而不是创建新标签。源队列不会改变。大多数标题都完整复制。如果源评分标准包含 LangSmith 无法复制的项目（例如在较旧的评分标准或通过 API 创建的评分标准中），预览会使这些项目变暗，并在 **条件** 列中显示原因：

* **重复键**：源标题中的另一个项目具有相同的键，忽略大小写和间距。
* **无反馈标签**：该项目没有反馈标签。
* **断言项**：该项是一个断言。
* **保留用于注释**：该项目使用 `note` 键，该键保留用于审阅者注释。

如果复制的项目对未复制的项目有条件，LangSmith 会删除该条件并将其列在预览中。没有任何条件的项目将成为可选项目。

### 向标题项目添加条件

条件显示或要求基于先前项目的答案的标题项目，因此审阅者仅在申请时才能看到后续问题。例如，仅当审阅者将 `correctness` 标记为失败时才显示 `failure_reason` 项目。条件可用于单次运行队列。

条件只能引用标题中位于其上方的项目。第一个标题不能有条件。

添加条件：

1. 在评分细则项上，单击“**添加逻辑**”。2. 在 **何时** 行中，选择一个较早的项目、一个运算符，以及一个值（如果该运算符需要）：

   * **是**：前面的答案是您选择的值。
   * **是其中之一**：之前的答案是您选择的任何值。
   * **为空**：前面的项目没有答案。
   * **不为空**：前面的项目有答案。

   没有类别的项目，例如自由格式的项目，仅支持 **为空** 和 **不为空**。对于多选项目，如果任何选择匹配，**是**并且**是**之一。

3. （可选）单击 **+ 添加条件** 以添加更多条件。要连接条件，请选择 ** 和 ** 以要求每个条件。选择**或**以需要任何一项。

4. 在 **Then** 行中，选择该项目会发生什么：

   * **需要**：始终显示，一旦条件成立则需要。
   * **显示**：隐藏，直到条件成立，然后可选。
   * **显示并要求**：隐藏，直到条件成立，然后要求。

折叠的标题项用简单的英语总结了其逻辑，例如“当准确性是两个值之一时显示”。其他项目所依赖的项目将它们列在**影响**下。当审阅者处理某个项目时，LangSmith 会根据保存的答案检查条件。当对早期答案的更改隐藏了某个项目时，LangSmith 会删除隐藏项目的答案，因此反馈永远不会包含审阅者看不到的问题的答案。

如果您删除其他项目所依赖的项目，LangSmith 会要求您确认并删除引用该项目的条件。没有剩余条件的从属项目变为可选。

> [!注意]
>
> LangSmith 将条件存储在队列中并将其应用到查看窗格中。直接通过 API 或 SDK 编写的反馈不会根据条件进行检查。要以编程方式管理条件，请参阅 SDK 指南中的[Add conditions to rubric items](/langsmith/annotation-queues-sdk#add-conditions-to-rubric-items)。

### 将运行和线程分配到单运行队列

有多种方法可以用项目填充单次运行队列：

* **从详细信息视图**：在[agent environment](/langsmith/agent-environments)的**跟踪**页面上，单击任意行以打开[Details view](/langsmith/view-traces#details-view)中的侧面板。该面板提供两个操作，每个操作都有固定的范围：* **添加到** ：在运行标题中，打开此菜单并选择 **添加到注释队列**。这会将您选择的运行添加为运行项目。
  * **将线程添加到注释队列** ：在 **轨迹**、**转弯** 和 **详细信息** 选项卡旁边，单击 图标。这会将整个线程添加为线程项。

  这两个操作都会打开一个弹出窗口，您可以在其中选择现有队列或创建新队列。

  ![Details view side panel showing the Add to icon in the run header with its menu open, and the Add thread to annotation queue icon next to the view tabs.](https://mintcdn.com/langchain-5e9cc07a/2JD80Bfuvagi9E_N/langsmith/images/details-view-add-to-annotation-queue-light.png?fit=max\&auto=format\&n=2JD80Bfuvagi9E_N\&q=85\&s=bf8ef7a2a75b2dfc0f6b8c236f00f1da)

  > [!注意]
  >
  > 线程操作仅在使用 `thread_id` / `session_id` 元数据检测的运行中显示。如果没有该元数据，面板将自行打开运行，并且只有运行操作可用。

* **从“跟踪”或“运行”选项卡**：在代理环境的 **跟踪** 页面上，选择 **跟踪** 或 **运行** 选项卡。使用行复选框选择一项或多项。单击页面底部的 **添加到注释队列**。使用 **添加内容** 将每个选择作为 **选定的运行** 或作为其 **整个线程** 排队。

  ![View of the runs table with runs selected. Add to Annotation Queue button at the bottom of the page.](https://mintcdn.com/langchain-5e9cc07a/XAjVplP-0MXBU4mY/langsmith/images/multi-select-annotation-queue-light.png?fit=max\&auto=format\&n=XAjVplP-0MXBU4mY\&q=85\&s=7a158b4656431ec3484955a282f7ab36)* **从“线程”选项卡**：在代理环境的 **跟踪** 页面上，选择 **线程** 选项卡。使用行复选框选择一项或多项。单击页面底部的 **添加到注释队列**。选定的线程将添加为线程项目。

  ![Threads tab with selected threads and the Add to Annotation Queue bulk action.](https://mintcdn.com/langchain-5e9cc07a/XAjVplP-0MXBU4mY/langsmith/images/threads-tab-add-to-annotation-queue-light.png?fit=max\&auto=format\&n=XAjVplP-0MXBU4mY\&q=85\&s=afc074fae70055e8c5d6c86380fec8e0)

* **自动化规则**：[Set up a rule](/langsmith/rules)自动将与过滤器（例如错误或低用户分数）匹配的**运行**或**线程**分配到队列中。

  > [!注意]
  >
  > 规则入队的内容取决于其[item type](/langsmith/rules#set-the-item-type-to-runs-or-threads)。项目类型为 **Runs** 的规则将运行项目排入队列。一旦线程空闲，项目类型为 **Threads** 的规则会将整个对话作为线程项目排队。

* **数据集和实验**：在数据集中选择一个或多个[experiments](/langsmith/evaluation-concepts#experiment)，然后单击**注释**。选择 **添加到注释队列**，然后选择一个现有队列或创建一个新队列。实验注释流程添加运行项目。

  ![Selected experiments with the Annotate button at the bottom of the page.](https://mintcdn.com/langchain-5e9cc07a/XAjVplP-0MXBU4mY/langsmith/images/annotate-experiment-light.png?fit=max\&auto=format\&n=XAjVplP-0MXBU4mY\&q=85\&s=12a78322893a51bb468f6da8b9f40d35)

> [!注意]
>
> 您可以在单个操作中最多将 **100** 运行或线程添加到注释队列。要排队更多，请以 100 或更少的批次重复添加流程。手动将运行或线程添加到队列中不会更改跟踪保留。每个跟踪都会保留为其项目配置的保留，除非另一个操作将其扩展。

自动化规则的工作方式有所不同：**扩展数据保留**切换是[on by default](/langsmith/rules#configure-retention-for-rule-actions)，用于**添加到注释队列**操作。运行规则升级包含每个匹配运行的整个跟踪，线程规则升级匹配线程中的每个跟踪。如果工作区[disables extended trace retention](/langsmith/data-purging-compliance#disable-extended-trace-retention)，规则仍将项目添加到队列中而不升级跟踪。对于完全保留模型，请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

### 查看单次运行队列

1. 在左侧边栏中，单击 **注释队列**。

   队列列表包括“分配的审阅者”列，显示分配给每个队列的审阅者。要仅查看分配给您的队列，请单击列表顶部的“**分配给我**”过滤器。

2. 单击您要查看的队列。这将带您集中、循环地查看队列中需要审核的项目。左侧面板列出了队列项目（运行和线程）并显示每个项目的状态（**需要审核**、**需要其他人审核**、**已完成**）。单击“**概述**”以打开完整的队列列表。3. 查看当前项目：

   * **运行项目**：中心窗格在轨迹视图中显示运行。线程中的运行在分级转弯上打开，并加载较早和较晚的转弯。线程外的运行会显示其跟踪中的每条消息，并标记代理的轮次。单击 **查看项目** 打开运行的 **详细信息** 面板，其中包含运行详细信息、参考输出和附件。

     子运行显示输入和输出而不是轨迹。轨迹不可用的运行会执行相同的操作，例如在没有 [query SmithDB](/langsmith/self-host-smithdb-features) 的自托管安装上。此视图将每个中间工具调用折叠成一行，并在输出下方列出参考输出和附件。填写评分细则的 [**Feedback**](/langsmith/observability-concepts#feedback) 项目，或将项目标记为已审核。如果队列已打开 [shared reviewer notes](#collaborator-settings)，请单击 **审阅者注释** 添加您的注释并阅读其他审阅者的注释。要构建数据集，请单击 **添加到数据集** 将运行保存为示例。对于 [LangSmith Engine proposed as offline examples](/langsmith/engine-issues#add-offline-examples) 的运行，审核侧面板还显示建议的 [**Assertions**](/langsmith/assertions)。在将它们保存为示例的预期输出之前，请检查并编辑它们。一旦运行有断言，中心窗格就会显示运行的输入，并将断言作为其参考输出。

     两种视图都是只读的。要在将运行添加到数据集之前编辑运行的输入和输出，请为队列启用 [**Classic Trace View**](#data-formatting)。
   * **话题项**：中心窗格显示话题的对话记录。阅读文字记录并对其标题 **反馈** 标准进行评分。单击“**查看项目**”以打开对话预览中的线程。作为示例，要将完整对话添加到数据集，请单击“**添加到数据集**”，然后选择一个数据集。要从选取器创建数据集，请单击“**新建数据集**”。要了解线程示例包含哪些内容，请参阅[Create and manage datasets in the UI](/langsmith/manage-datasets-in-application#manually-from-an-agent-environment)。

   当您填写标题项目时：* 对于 [multi-select](/langsmith/set-up-feedback-criteria#allow-multiple-selections) 商品，请选择每个适用的类别。清除选择会删除该反馈。
   * 对于超过 10 个类别的项目，请在搜索框中键入以查找类别。
   * 当您回答前面的项目时，带有 [conditions](#add-conditions-to-rubric-items) 的项目会出现或成为必填项。如果对先前答案的更改隐藏了某个项目，LangSmith 会删除您对该项目的答案。
   * 已回答的项目显示复选标记。必填项目显示红色星号。
   * 要完成该项目，请单击 **下一步（标记为已完成）**。在**需要审核**中的最后一项上，按钮显示**完成**。如果您在填写显示的每个必填项目之前单击它，LangSmith 会列出仍然缺少的项目。

   要从所有工作区成员的队列中删除当前项目，请单击 **从队列中删除**（左侧面板中项目上的图标，或 <kbd>⌘ ⌫</kbd>），然后确认。当其他审阅者已完全保留项目时，您无法删除该项目。

   > [!注意]
   >
   > 对于话题项，您可以提交评分标准反馈并使用 **添加到数据集**。审稿人注释和断言不可用。请参阅 [capability table](#single-run-annotation-queues) 来比较运行项和线程项功能。查看注释队列时提交的反馈和注释不会更改跟踪的 [retention tier](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

   > [!提示]
   >
   > 使用每个选项旁边的键盘快捷键可以更快地查看项目。

### 自定义审阅窗格

自定义视图将中间窗格中的默认跟踪视图替换为您向 LangSmith 聊天描述的显示，例如没有工具调用的聊天记录。一个视图可以服务多个队列。有关更多信息，请参阅[Build custom views for annotation queues](/langsmith/annotation-queue-custom-views)。

## 成对注释队列

成对注释队列 (PAQ) 并排显示两个运行，以便审阅者可以根据您定义的标题项目快速确定哪个输出更好（或者它们是否等效）。它们专为两个实验（通常是基线与候选模型）之间的快速 A/B 比较而设计，并且必须从**数据集和实验**页面创建。成对队列仅使用运行比较；它们不会将线程项排入队列。

### 创建一个成对队列

1. 转到**数据集和实验**，打开数据集，然后选择**要比较的**两个实验**。2. 单击**注释**。在弹出窗口中，选择 **添加到成对注释队列**。 （在恰好选择了两个实验之前，该按钮将被禁用。）

   ![Popover showing the "Add to Pairwise Annotation Queue" card highlighted after two experiments are selected.](https://mintcdn.com/langchain-5e9cc07a/jimZt8pd1vc7LfPM/langsmith/images/pairwise-annotation-queue-popup.png?fit=max\&auto=format\&n=jimZt8pd1vc7LfPM\&q=85\&s=ef08b7166abce2d890ba4b9be8cae927)

3. 决定是将实验发送到现有的成对队列还是创建一个新队列。

4. 提供队列详细信息：
   * **基本详细信息**（名称和描述）
   * **针对成对评分量身定制的说明和评分标准**
   * **协作者设置**（审阅者数量、预订、预订时长）

5. 提交表单以创建队列。 LangSmith 立即将两个实验的运行配对并填充队列。

默认情况下，创建或填充成对注释队列不会更改跟踪保留。运行会保留添加到队列之前的 [retention tier](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

PAQ 的主要区别：* **实验**：您必须预先提供两个实验会话。 LangSmith 自动按时间顺序配对它们的运行，并在创建过程中填充队列。
* **Rubric**：成对的Rubric 项目仅需要反馈键和（可选）描述。注释者决定运行 A、运行 B 或两者对于每个标题项是否更好。
* **数据集**：成对队列不使用默认数据集，因为比较跨越两个实验。
* **预订和审阅者**：适用相同的协作者控制。保留有助于防止两个人同时判断相同的比较。

### 向成对队列添加更多比较

如果稍后需要添加更多比较，请返回**数据集和实验**，再次选择两个实验，然后选择**添加到成对注释队列**以附加新对。

选择两个实验并创建 PAQ 会自动配对运行。扩充现有 PAQ 时，LangSmith 保留历史比较并将新对添加到队列中。

### 查看成对队列1. 从**注释队列**中，选择要查看的成对队列。
2. 每个队列项目在左侧显示运行 A，在右侧显示运行 B，以及您的评分标准。
3. 对于每个评分细则项目：
   * 选择**A 更好**、**B 更好**或**等于**。 UI 在后台记录了两次运行的二进制反馈。
   * 使用热键`A`、`B`或`E`锁定您的选择。
4. 完成所有评分标准项目后，按 **完成**（或在最后一个评分标准项目上按 `Enter`）前进到下一个比较。
5. 可选操作：
   * 留下与任一运行相关的评论。
   * 如果您需要稍后重新访问，请重新排队比较。
   * 打开详细信息视图进行更深入的调试。

预订、审阅者阈值和评论的行为与单次运行队列中的行为相同，使团队能够使用不同的队列类型，而无需修改现有工作流程。

![Pairwise review screen showing runs side-by-side with the feedback pane containing A/B/Equal buttons and keyboard shortcuts.](https://mintcdn.com/langchain-5e9cc07a/jimZt8pd1vc7LfPM/langsmith/images/pairwise-annotation-queue-review-feedback-pane.png?fit=max\&auto=format\&n=jimZt8pd1vc7LfPM\&q=85\&s=b144d168c4f4fd1f624c1d0fd5ce7e3e)> [!提示]
>
> 考虑将已经有用户反馈（例如，反对）的运行路由到单运行队列中进行分类，并路由到成对队列中，以便与更强的基线进行头对头比较。这可以帮助您快速识别回归。要了解有关如何从 LLM 申请中获取用户反馈的更多信息，请按照 [attaching user feedback](/langsmith/attach-user-feedback) 上的指南进行操作。

## 视频指南

[YouTube video player](https://www.youtube.com/embed/rxKYHA-2KS0?si=V4EnrUmzJaUVJh0m)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotation-queues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。