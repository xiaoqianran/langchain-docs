<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use annotation queues | https://docs.langchain.com/langsmith/annotation-queues -->

# 使用注释队列

_注释队列_为人类审阅者提供了一个集中的工作流程，用于将反馈附加到特定的[runs](/langsmith/observability-concepts#runs)或[threads](/langsmith/observability-concepts#threads)。虽然您始终可以内联注释 [traces](/langsmith/observability-concepts#traces)，但注释队列可让您将运行和线程分组在一起、规定细则并跟踪审阅者进度。通过查看整个线程，您可以评估完整的多轮对话，捕获单次运行无法捕获的质量信号。

<Info>
您还可以使用 SDK 以编程方式管理注释队列和反馈配置。参见[Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk)。
</Info>

要自定义运行输出在审核期间的显示方式，[configure custom output rendering for annotation queues](/langsmith/custom-output-rendering#for-annotation-queues)。

LangSmith支持两种队列样式：

- [**Single-run annotation queues**](#single-run-annotation-queues) 一次呈现一个队列项目，可以是一次运行，也可以是一个线程，并让审阅者提交您配置的任何标题反馈。对于**运行**项目，单运行队列还支持[assertions](/langsmith/assertions)来捕获离线评估的验收标准。
- [**Pairwise annotation queues (PAQs)**](#pairwise-annotation-queues) 并排呈现两次运行，以便审阅者可以根据您定义的标题项目快速决定哪个输出更好（或者它们是否等效）。

<Tip>
有关使用注释队列的演示，请观看 [Getting started with annotation queues](#video-guide) 视频指南。
</Tip>

## 单次运行注释队列单次运行队列一次显示一项，并让审阅者提交您配置的任何标题反馈。它们可以直接从 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-annotation-queues) 中的 **注释队列** 部分创建。队列可以包含运行项和线程项的混合。 _线程项_代表整个对话，并根据与运行项相同的标准进行审核。

运行项和线程项支持不同的功能：

|能力|运行项目 |主题项目 |
| ---| ---| ---|
|评分标准反馈 |是的 |是的 |
|审稿人笔记|是的 |没有 |
|断言|是的 |没有 |
|添加到数据集|是的 |没有 |
|默认数据集 |是的 |没有 |
|自动化规则|是的 |是的 |

### 创建单次运行队列

1. 导航至左侧导航栏中的**注释队列**。
1. 单击左上角的**+注释队列**，打开**创建注释队列**面板。

#### 基本细节1. 填写队列的**名称**和**描述**。
1. （可选）选择一个**应用程序**。
1. （可选）**选择默认数据集**，以简化将审核的运行导出到 LangSmith [workspace](/langsmith/administration-overview#workspaces) 中的数据集的过程。当您在运行项目上使用 **添加到数据集** 时，将应用默认数据集；线程项不支持添加到数据集。

#### 注释栏

1. 为您的注释者起草一些高级**说明**，这些说明将显示在每个项目的侧栏中。
1. 单击 **+ 添加反馈标题** 将反馈键添加到注释队列。注释者将看到每个项目的这些反馈键。
1. 如果反馈类型是分类的，请添加每个类别的描述以及每个类别的简短描述。

    审阅者可以在用户界面的右侧窗格中看到**说明**和**反馈**详细信息。

#### 协作者设置设置审阅者的数量或您想要将项目保留给协作者的最长时间。当某个项目有多个注释者时，您可以选择将该项目保留在队列中，直到所有审阅者将其标记为**完成**。在这些设置中，“运行”指的是任何队列项目，包括线程项目。设置如下：

- **所有工作区成员审阅每次运行**：启用后，项目将保留在队列中，直到每个 [workspace](/langsmith/administration-overview#workspaces) 成员将其审阅标记为 **完成**。

- **启用运行预订**：预订项目会将其锁定一段时间内供您审阅。当项目被保留时，其他审阅者可以查看它，但无法添加反馈或注释。如果所有工作区成员都查看每次运行，则预约将被禁用。

    如果审阅者查看了某个项目，然后离开而没有将其标记为**完成**，则预订将在指定的**预订长度**后过期。然后，该项目将被释放回队列中，并可由另一位审阅者保留。<Note>
        点击项目注释的**重新排队**只会将当前项目移动到当前用户队列的末尾；它不会影响任何其他用户的队列顺序。它还将释放当前用户对该项目的预订。
    </Note>

- **每次运行的审阅者数量**：这确定必须将项目标记为 **完成** 才能从队列中删除的审阅者数量。

    - 审稿人无法查看其他审稿人留下的反馈。
    - 所有评论者都可以看到对项目的评论。

    <Note>
    当启用“使用分配的审阅者”时，**每次运行的审阅者数量**设置将被隐藏（见下文）。
    </Note>

- **使用分配的审阅者**：启用此切换以使用特定工作区成员而不是基于计数的阈值。启用后：- 将出现一个多选用户选择器，以便您可以选择特定的工作区成员作为指定的审阅者。
    - 仅当每个指定的审阅者都提交了审阅时，项目才会被标记为“**已完成**”。队列项目会经历三种状态：**需要审核** → **需要其他人审核** → **已完成**。
    - 未分配的工作区成员仍然可以对项目进行注释，但他们的提交不计入完成。
    - 任何工作区成员都可以在队列设置中编辑分配的审阅者列表。

    <Note>
    当您将新分配的审阅者添加到已完成项目的队列时，这些项目不会恢复为待处理。如果您删除指定的审阅者，他们尚未审阅的任何项目都会重新计算其完成状态。
    </Note>

由于这些设置，每个审阅者可见的项目数可能与队列总大小不同。

### 编辑队列的设置

1. 打开要编辑的注释队列的 **编辑注释队列** 面板。您可以通过两种方式访问​​该面板：- 在 **注释队列** 列表中，单击队列行右侧的 **操作** 图标 <Icon icon="dots-vertical"/>。从下拉列表中选择<Icon icon="pencil"/> **编辑**。
    - 在注释队列视图中，单击右上角的 **设置** 图标 <Icon icon="settings"/>。

2. 在 **编辑注释队列** 面板中，修改您在队列创建期间配置的任何设置，然后单击 **保存**。

### 将运行和线程分配到单运行队列

有多种方法可以用项目填充单次运行队列：

- **从详细信息视图**：在 [tracing project](/langsmith/observability-concepts#projects) 中，单击任意行以打开 [Details view](/langsmith/view-traces#details-view) 中的侧面板。单击 **+ 添加**，然后单击右上角的 **添加到注释队列**。在弹出窗口中的“**添加内容**”下，选择“**选定的运行**”（当前运行）或“**整个线程**”（运行所属的完整对话）。

    您可以添加任何中间 [run](/langsmith/observability-concepts#runs) 作为运行项，但不能添加根运行。 **整个线程** 要求运行是线程的一部分（使用 `thread_id` / `session_id` 元数据进行检测）。

    <img
      className="block dark:hidden"
      src="/langsmith/images/add-to-annotation-queue-what-to-add-light.png"
      alt="Add to Annotation Queue popover with What to add tabs for Selected run and Entire thread, and a queue picker."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/add-to-annotation-queue-what-to-add-dark.png"
      alt="Add to Annotation Queue popover with What to add tabs for Selected run and Entire thread, and a queue picker."
    />

    <Note>
    如果 **整个线程** 选项不可用或 **线程** 选项卡为空，则不会使用 `thread_id` / `session_id` 元数据对运行进行检测。
    </Note>- **从“跟踪”或“运行”选项卡**：在跟踪项目中，选择 **跟踪** 或 **运行** 选项卡。使用行复选框选择一项或多项。单击页面底部的 **添加到注释队列**。使用 **添加内容** 将每个选择作为 **选定的运行** 或作为其 **整个线程** 排队。

    <img
      className="block dark:hidden"
      src="/langsmith/images/multi-select-annotation-queue-light.png"
      alt="View of the runs table with runs selected. Add to Annotation Queue button at the bottom of the page."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/multi-select-annotation-queue-dark.png"
      alt="View of the runs table with runs selected. Add to Annotation Queue button at the bottom of the page."
    />

- **从“线程”选项卡**：在跟踪项目中，选择“**线程**”选项卡。使用行复选框选择一项或多项。单击页面底部的 **添加到注释队列**。选定的线程将添加为线程项目。

    <img
      className="block dark:hidden"
      src="/langsmith/images/threads-tab-add-to-annotation-queue-light.png"
      alt="Threads tab with selected threads and the Add to Annotation Queue bulk action."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/threads-tab-add-to-annotation-queue-dark.png"
      alt="Threads tab with selected threads and the Add to Annotation Queue bulk action."
    />

- **自动化规则**：[Set up a rule](/langsmith/rules)自动将与过滤器（例如错误或低用户分数）匹配的**运行**或**线程**分配到队列中。<Note>
    规则入队的内容取决于其[item type](/langsmith/rules#set-the-item-type-to-runs-or-threads)。项目类型为 **Runs** 的规则将运行项目排入队列。一旦线程空闲，项目类型为 **Threads** 的规则会将整个对话作为线程项目排队。
    </Note>
- **数据集和实验**：在数据集中选择一个或多个[experiments](/langsmith/evaluation-concepts#experiment)，然后单击**<Icon icon="pencil"/>注释**。选择 **添加到注释队列**，然后选择现有队列或创建一个新队列。实验注释流程添加运行项目。

    <img
      className="block dark:hidden"
      src="/langsmith/images/annotate-experiment-light.png"
      alt="Selected experiments with the Annotate button at the bottom of the page."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/annotate-experiment-dark.png"
      alt="Selected experiments with the Annotate button at the bottom of the page."
    />

<Note>
您可以在单个操作中最多将 **100** 运行或线程添加到注释队列。要排队更多，请以 100 或更少的批次重复添加流程。

默认情况下，手动将运行或线程添加到注释队列不会更改跟踪保留。跟踪会保留为其项目配置的保留，除非另一个操作显式延长保留。由 [automation rule](/langsmith/rules) 执行的添加有所不同：默认情况下，为注释队列操作启用规则的 **扩展数据保留** 切换。运行规则升级包含每个匹配运行的整个跟踪，线程规则升级匹配线程中的每个跟踪。对于完全保留模型，请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades)。
</Note>### 查看单次运行队列

1. 通过左侧导航栏导航至 **注释队列** 部分。

    队列列表包括“分配的审阅者”列，显示分配给每个队列的审阅者。要仅查看分配给您的队列，请单击列表顶部的“**分配给我**”过滤器。

1. 单击您要查看的队列。这将带您集中、循环地查看队列中需要审核的项目。左侧面板列出了队列项目（运行和线程）并显示每个项目的状态（**需要审核**、**需要其他人审核**、**已完成**）。使用 **查看所有项目** 打开完整队列列表。

1. 查看当前项目：- **运行项目**：检查中心窗格中的输入和输出。添加 **审阅者注释**，对 [**Feedback**](/langsmith/observability-concepts#feedback) 标准进行评分，或将项目标记为已审阅。要构建数据集，请编辑运行的输入和输出以创建更正的参考示例，然后单击 **添加到数据集**。您可以直接在审阅侧面板中 [write **Assertions**](/langsmith/assertions) 并将它们保存为示例的预期输出，而不是手动制作校正后的参考输出。
    - **话题项目**：中心窗格显示该话题的对话记录。阅读文字记录并对相同的**反馈**键进行评分。使用 **查看项目** 在对话中打开线程。

    单击“**删除**”可从所有用户的队列中删除该项目，无论当前的预订或队列设置如何。

    <Note>
    主题项目仅支持标题反馈。请参阅 [capability table](#single-run-annotation-queues) 了解运行项和线程项之间的差异。
    </Note>

    <img
      className="block dark:hidden"
      src="/langsmith/images/annotation-queue-thread-review-light.png"
      alt="Annotation queue reviewing a thread item with the conversation transcript and rubric feedback pane."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/annotation-queue-thread-review-dark.png"
      alt="Annotation queue reviewing a thread item with the conversation transcript and rubric feedback pane."
    />

    查看注释队列时提交的反馈和注释不会更改跟踪的 [retention tier](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

    <Tip>
        使用每个选项旁边的键盘快捷键可以更快地查看项目。
    </Tip>

## 成对注释队列成对注释队列 (PAQ) 并排显示两个运行，以便审阅者可以根据您定义的标题项目快速确定哪个输出更好（或者它们是否等效）。它们专为两个实验（通常是基线与候选模型）之间的快速 A/B 比较而设计，并且必须从**数据集和实验**页面创建。成对队列仅使用运行比较；它们不会将线程项排入队列。

### 创建一个成对队列

1. 导航到**数据集和实验**，打开数据集，然后选择**要比较的**两个实验**。
1. 单击**注释**。在弹出窗口中，选择 **添加到成对注释队列**。 （在恰好选择了两个实验之前，该按钮将被禁用。）

    ![Popover showing the "Add to Pairwise Annotation Queue" card highlighted after two experiments are selected.](/langsmith/images/pairwise-annotation-queue-popup.png)

1. 决定是将实验发送到现有的成对队列还是创建一个新队列。
1. 提供队列详细信息：
    - **基本详细信息**（名称和描述）
    - **说明和评分标准**专为配对评分而定制
    - **协作者设置**（审阅者数量、预订、预订时长）
1. 提交表单以创建队列。 LangSmith 立即将两个实验的运行配对并填充队列。默认情况下，创建或填充成对注释队列不会更改跟踪保留。运行会保留添加到队列之前的[retention tier](/langsmith/usage-and-billing#data-retention-auto-upgrades)。

PAQ 的主要区别：

- **实验**：您必须预先提供两个实验会话。 LangSmith 自动按时间顺序配对它们的运行，并在创建过程中填充队列。
- **Rubric**：成对的Rubric项目仅需要反馈键和（可选）描述。注释者决定运行 A、运行 B 或两者对于每个标题项是否更好。
- **数据集**：成对队列不使用默认数据集，因为比较跨越两个实验。
- **预订和审阅者**：适用相同的协作者控制。保留有助于防止两个人同时判断相同的比较。

### 向成对队列添加更多比较

如果稍后需要添加更多比较，请返回**数据集和实验**，再次选择两个实验，然后选择**添加到成对注释队列**以附加新对。选择两个实验并创建 PAQ 会自动配对运行。扩充现有 PAQ 时，LangSmith 保留历史比较并将新对添加到队列中。

### 查看成对队列

1. 从**注释队列**中，选择要查看的成对队列。
1. 每个队列项目在左侧显示运行 A，在右侧显示运行 B，以及您的评分标准。
1. 对于每个评分标准项目：
    - 选择**A 更好**、**B 更好**或**等于**。 UI 在后台记录了两次运行的二进制反馈。
    - 使用热键`A`、`B`或`E`锁定您的选择。
1. 完成所有评分标准项目后，按 **完成**（或在最后一个评分标准项目上按 `Enter`）前进到下一个比较。
1. 可选操作：
    - 留下与任一运行相关的评论。
    - 如果您需要稍后重新访问，请重新排队比较。
    - 打开详细信息视图以进行更深入的调试。

预留、审阅者阈值和评论的行为与单次运行队列中的行为相同，使团队能够使用不同的队列类型，而无需修改其现有工作流程。

    ![Pairwise review screen showing runs side-by-side with the feedback pane containing A/B/Equal buttons and keyboard shortcuts.](/langsmith/images/pairwise-annotation-queue-review-feedback-pane.png)<Check>
考虑将已经有用户反馈（例如，反对）的运行路由到单运行队列中进行分类，并路由到成对队列中，以便与更强的基线进行头对头比较。这可以帮助您快速识别回归。要了解有关如何从 LLM 申请中获取用户反馈的更多信息，请按照 [attaching user feedback](/langsmith/attach-user-feedback) 上的指南进行操作。
</Check>

## 视频指南

<iframe
  className="w-full aspect-video rounded-xl"
  src="https://www.youtube.com/embed/rxKYHA-2KS0?si=V4EnrUmzJaUVJh0m"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotation-queues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>