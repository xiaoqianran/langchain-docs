<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up multi-turn online evaluators | https://docs.langchain.com/langsmith/online-evaluations-multi-turn -->

# 设置多轮在线评估器

多轮在线评估器允许您评估人类和代理之间的整个对话，而不仅仅是个人交流。他们测量线程中所有回合的端到端交互质量。

> [!提示]
>
> 要使用 LangChain 管理的线程级判断而不配置模型、API 密钥或提示，请参阅 [LangChain Tuned Evaluators](/langsmith/tuned-evaluators)。

要使用您自己的 Python 或 JavaScript 代码而不是 LLM 对线程进行评分，请使用高级代码评估器。有关更多信息，请参阅[Evaluate threads](/langsmith/advanced-code-evaluators#evaluate-threads)。

您可以使用多轮评估来衡量：

1. 语义意图：用户想要做什么。
2.语义结果：实际发生了什么，任务是否成功。
3. 轨迹：对话如何展开，包括工具调用的轨迹。

> [!注意]
>
> 在线评估器默认延长跟踪保留时间。当代理环境使用基本保留时，您可以[opt out for an individual evaluator](/langsmith/evaluators#manage-evaluator-trace-retention)。其他行动仍然可以延伸这些痕迹。如果[extended retention is disabled for the workspace](/langsmith/data-purging-compliance#disable-extended-trace-retention)，则无论保存的环境默认值如何，评估都会继续，无需新的保留升级。

## 它是如何工作的

多轮在线评估器遵循以下评估生命周期：1. **跟踪摄取**：对话中的每个轮次都作为单独的运行进行跟踪，并使用共享线程 ID 与线程关联。
2. **空闲时间检测**：摄取线程中的最后一个跟踪后，LangSmith 等待配置的空闲时间过去。此空闲期表示对话已完成并准备好进行评估。
3. **消息组装**：LangSmith从线程中的每个跟踪中收集`messages`并将它们组装成单个对话历史记录。如果每个跟踪仅包含最新消息，则 LangSmith 将各轮消息缝合在一起。如果每个跟踪包含完整的历史记录，LangSmith 会直接使用它。由于线程中的连续跟踪经常重新发送先前的历史记录，因此 LangSmith 会删除重叠消息，因此每个消息仅出现一次。结果是 OpenAI 聊天格式 (`{"role": ..., "content": ...}`) 的单个消息列表，这就是提示中的 `all_messages` 变量解析的内容。
4. **LLM 作为法官评估**：组装的对话将传递到您配置的 LLM 作为法官提示。评估者根据您的标准对整个线程进行评分：语义意图、结果或轨迹。5. **反馈记录**：评估者使用您配置的与线程关联的反馈键将反馈写入LangSmith。

此生命周期意味着多轮评估器每个完成的线程运行一次，而不是每个跟踪运行一次。如果您想要每条轨迹评估，请使用[run-level online evaluators](/langsmith/online-evaluations-llm-as-judge)。

## 先决条件

* 您的代理环境必须使用[threads](/langsmith/threads)。
* 线程中每个跟踪的顶级输入和输出必须有一个包含消息列表的 `messages` 键。我们支持[LangChain](/langsmith/log-llm-trace#messages-format)、[OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat/create)和[Anthropic Messages](https://platform.claude.com/docs/en/api/messages)格式的消息。
  * 如果每个跟踪的顶级输入和输出仅包含对话中的最新消息，LangSmith将自动将跨轮的消息组合成一个线程。
  * 如果每个跟踪的顶级输入和输出包含完整的对话历史记录，LangSmith将直接使用它。

> [!注意]
>
> 如果您的跟踪不遵循上述格式，线程级别评估器将无法工作。您需要更新跟踪LangSmith的方式，以确保每个跟踪的顶级输入和输出包含`messages`列表。
>
> 请参阅[troubleshooting](/langsmith/online-evaluations-multi-turn#troubleshooting)部分了解更多信息。

## 配置

创建多轮在线评估器：1. 选择您的代理，转到**跟踪**，然后选择环境。
2. 单击“**在线评估员**”选项卡，然后单击“**+ 评估员**”，并选择“**从头开始创建**”下的“**LLM-as-a-Judge Evaluator**”。
3. 指定您的评估员。
4. 在**触发**下，选择**线程**。
5. 应用**过滤器**或**采样率**。使用过滤器或抽样来控制评估者成本。例如，仅评估 *N* 圈下的线程或对所有线程的 10% 进行采样。
6. 配置其余设置：
   * [Check the idle time](#check-the-idle-time)
   * [Choose a model](#configure-your-model)
   * [Write the LLM-as-a-judge prompt](#configure-your-llm-as-a-judge-prompt)
   * [Set up feedback](#set-up-your-feedback-configuration)
7. 单击“**创建**”。您的评估者出现在**在线评估者**选项卡中。一旦空闲时间过去，您就可以测试此后创建的任何新线程。

### 检查空闲时间

在“高级”下，“线程空闲时间”显示环境的空闲时间：线程中最后一次跟踪之后、在线程被视为完成并准备好进行评估之前的时间量。该值应反映应用程序中用户交互的预期长度。空闲时间默认为 10 分钟，且不能设置低于 2 分钟。> [!注意]
>
> 空闲时间在代理环境上设置。它适用于该环境中的每个线程级求值器以及每个项目类型为 **Threads** 的 [automation rule](/langsmith/rules#set-the-thread-idle-time)。要更改它，请单击值旁边或环境的 **跟踪** 页面上的 **编辑跟踪设置** 图标。

> [!提示]
>
> 首次测试评估器时，请使用较短的空闲时间，以便您可以快速看到结果，但最少需要 2 分钟。验证后，增加它以匹配用户交互的预期长度。

### 配置你的模型

为您的评估者选择提供商和型号。线程往往会变长，因此使用具有大上下文窗口的模型以避免遇到限制。例如，OpenAI的GPT-5.4 mini和Gemini 2.5 Flash都有1M+ token上下文窗口。

### 配置您的 LLM 法官提示

定义您要评估的内容。评估器将此提示应用于线程。您还可以配置 `all_messages` 变量将组装对话的哪些部分传递给求值器：* 所有消息：以 OpenAI 聊天格式 (`{"role": ..., "content": ...}`) 的 JSON 消息对象列表的形式发送完整对话，每条消息呈现为缩进的 JSON 并用空行分隔。
* 人类和人工智能对：仅发送用户和助理消息，格式为`<user>...</user>`和`<assistant>...</assistant>`，不包括系统消息、工具调用和其他角色。
* 第一个人类和最后一个人工智能：仅发送第一条用户消息和最后一个助理回复。

### 设置您的反馈配置

配置反馈键的名称、要收集的反馈的格式，并可选择启用反馈推理。

> [!警告]
>
> **不建议**对线程级求值器和运行级求值器使用相同的反馈键，因为很难区分两者。

## 评估轨迹

`trajectory` 是线程求值器可以使用的变量之一，与 `all_messages`、`human_ai_pairs` 和 `first_human_last_ai` 一起使用。它解析为对话的[trajectory](/langsmith/observability-concepts#trajectories)：从开始到结束的扁平、有序的消息列表，包括工具调用及其结果。用它来对代理所采取的路径进行评分，例如它是否选择了正确的工具，遵循其计划，并没有浪费步骤到达目的地。> [!注意]
>
> 在 [LangSmith Cloud](/langsmith/cloud) 上，`trajectory` 变量在 GCP US、GCP EU、GCP APAC 和 AWS US 区域可用。
>
> 在 [BYOC](/langsmith/byoc) 上，`trajectory` 变量在 SmithDB 中存储和查询跟踪的数据平面上可用。
>
> 在 [switch queries to SmithDB](/langsmith/self-host-smithdb-install#step-6-switch-queries-to-smithdb) 之后，[Self-hosted](/langsmith/self-hosted) 安装支持 LangSmith v0.17 或更高版本上的 `trajectory` 变量。参见[SmithDB feature availability](/langsmith/self-host-smithdb-features)。

变量因法官收到的内容而异：

* **`all_messages`、`human_ai_pairs` 和 `first_human_last_ai`** 解析为根据线程中每个根运行的输入和输出组装的对话。子运行中发生的工作（例如中间模型调用、工具调用和工具结果）不包括在内，除非根运行自己的输入或输出包含它。 human_ai_pairs 和first_ human_last_ai 进一步缩小到仅用户和助理消息。
* **`trajectory`** 解析为从每个跟踪内的模型和工具调用构建的轨迹。其他视图忽略的工具调用和工具结果将被保留。

对于每个变量解析为的消息形状，请参阅[Thread message variables](/langsmith/prompt-template-format#thread-message-variables)。> [!警告]
>
> 轨迹通常比任何其他视图都大，因为它包含根运行和子运行。选择具有高上下文窗口的模型，如[Configure your model](#configure-your-model)中所述，并期望每次评估使用更高的令牌。

### 使用轨迹变量

请按照上述[configuration](#configuration)步骤操作。有两件事发生了变化：

1. 在**触发**下，选择**线程**。该变量仅适用于在代理环境上运行的评估器，而不是在数据集上。
2. 在提示中引用 `{{trajectory}}` 并将该变量映射到 `trajectory` 源。该变量必须命名为`trajectory`：指向该源的不同名称的变量将被拒绝。种子默认提示和映射已经执行此操作，因此新的评估器无需在此处进行任何更改。

仅当您尚未编辑默认提示时，在 **运行** 和 **线程** 之间切换 **触发器打开** 才会重新设定默认提示。编辑提示后，您的版本将被保留，并且您可以自己映射变量。`{{trajectory}}` 不能与 `{{all_messages}}`、`{{human_ai_pairs}}` 或 `{{first_human_last_ai}}` 一起出现。映射轨迹源后，变量源下拉列表中的其他源将被禁用，并且一旦映射其他源之一，轨迹源将被禁用。无论哪种方式，下拉列表都解释了轨迹变量和非轨迹变量不能一起使用。保存混合它们的评估器也会以同样的方式失败。

当评估器完成时，LangSmith 在您配置的反馈键下将反馈写入线程中最近的根运行，并将该反馈与线程关联。稍后要查找它，请参阅[View feedback](/langsmith/threads#view-feedback)。

有关您可以改编的完整提示，请参阅[Example with trajectory context](/langsmith/prompt-template-format#example-with-trajectory-context)。

> [!警告]
>
> 创建评估器时，选择是固定的。要在 `trajectory` 和其他线程变量之间移动现有赋值器，请将其删除并创建一个新变量。

### 设置和约束

使用 `trajectory` 的评估器支持以下设置：

* **过滤器**：限制评估器在哪些线程上运行。
* **采样率**：评估与您的过滤器匹配的线程的百分比。
* **空闲时间**：代理环境的线程空闲时间，适用于该环境上的每个线程级评估器。以下选项不可用，包含其中之一的配置将被拒绝：

* 数据集和实验作为来源。
* 回填现有线程。
* 跟踪过滤器和树过滤器。
* 少量示例、扩展统计数据和数据集修正。
* 相同自动化规则上的代码评估器，以及非评估器操作，例如将线程添加到注释队列。

轨迹不是运行，因此任何读取运行级别字段的选项都不可用。

## 限制

这些是线程级处理的当前限制（可能会发生变化）。它们适用于多轮在线评估器和项目类型为**线程**的[automation rules](/langsmith/rules#set-the-item-type-to-runs-or-threads)。如果您遇到任何这些限制，请联系我们。

* **运行时间必须少于一周**：当线程空闲时，只有过去 7 天内的运行才有资格进行评估。
* **一次最多处理 500 个线程**：单个执行最多处理 500 个匹配线程，按最近的活动排序。

## 故障排除

**检查评估者的状态**要检查评估器上次运行的时间，请在 **跟踪** 页面上打开代理环境的 **在线评估器** 选项卡，然后单击评估器行中的 **日志** 以查看其运行历史记录。

**检查发送给评估者的数据**

要检查发送到评估器的数据，请在 **跟踪** 页面上打开代理环境的 **在线评估器** 选项卡，单击您的评估器，然后单击 **跟踪** 选项卡。仅当您 [turned on tracing for the evaluator](/langsmith/evaluators#trace-evaluator-runs) 时，该选项卡才会显示痕迹。新的评估者从关闭跟踪开始。

在此选项卡中，您可以看到传递到 LLM-as-a-judge 评估器的输入。如果您的消息未正确传递，您将在输入中看到空白值。如果您的邮件未采用 [the expected formats](/langsmith/online-evaluations-multi-turn#prerequisites) 之一的格式，则可能会发生这种情况。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-multi-turn.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。