<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up LLM-as-a-judge online evaluators | https://docs.langchain.com/langsmith/online-evaluations-llm-as-judge -->

# 设置 LLM 法官在线评估员

[Online evaluations](/langsmith/evaluation-concepts#online-evaluations) 提供您生产轨迹的实时反馈。这对于持续监控应用程序的性能非常有用，以识别问题、衡量改进并确保长期稳定的质量。

**[LLM-as-a-judge](/langsmith/evaluation-concepts#llm-as-judge)** 评估者使用 LLM 来评估痕迹，作为类人判断的可扩展替代品。本指南涵盖了评估单次运行的**运行级别**评估器。要评估整个对话线程，请参阅[multi-turn online evaluators](/langsmith/online-evaluations-multi-turn)。

<Note>当在线评估器在跟踪内的任何运行上运行时，跟踪将自动升级到[extended data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)。此升级将影响跟踪定价，但可确保保留符合您的评估标准的跟踪（通常是对分析最有价值的跟踪）以供调查。 </Note>

## 查看在线评估器

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-online-evaluations-llm-as-judge) 中，前往 **Tracing Projects** 选项卡并选择一个跟踪项目。要查看该项目的现有在线评估程序，请单击“**评估程序**”选项卡。

## 添加在线评估器1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-online-evaluations-llm-as-judge)中，导航至**追踪**页面，选择追踪项目。
2. 单击**评估者**选项卡。
3. 单击**+ 评估器** 打开**添加评估器** 面板。
4. 选择以下选项之一：
   * **从头开始创建**：选择**LLM-as-a-Judge Evaluator**。
   * **附加现有评估器**：选择工作区中已有的评估器以重用它。
   * **从模板创建**：从现成的评估器开始。
5. 指定您的评估员。

## 对触发评估器的运行应用过滤器

您可以将过滤器应用于触发评估器的运行。您可能希望根据以下条件应用评估器：

* 运行时，[user left feedback](/langsmith/attach-user-feedback) 指示响应不令人满意。
* 调用特定工具的运行。请参阅[filtering for tool calls](/langsmith/filter-traces-in-application#example-filtering-for-tool-calls)了解更多信息。
* 与特定元数据片段匹配的运行（例如，如果您使用 `plan_type` 记录跟踪并且只想对来自企业客户的跟踪运行评估）。请参阅[adding metadata to your traces](/langsmith/add-metadata-tags)了解更多信息。

[Filters on evaluators](/langsmith/filter-traces-in-application) 的工作方式与过滤项目中的跟踪时相同。<Tip>
  当您为评估器创建过滤器时，检查运行通常很有帮助。打开评估器配置面板后，您可以检查运行并向其应用过滤器。您应用于运行表的任何过滤器都将自动反映在评估器的过滤器中。
</Tip>

<Tip>
  如果您在此项目上还有一个 Webhook 自动化规则，并且希望 Webhook 负载包含此评估者的分数，请向 Webhook 规则添加反馈过滤器，而不是依赖规则排序。例如，对 `has(feedback_key, "answer_usefulness")` 进行过滤，以便仅在分数存在后才触发 Webhook。详情请参阅[Ensuring evaluations complete before the webhook fires](/langsmith/webhooks#ensuring-evaluations-complete-before-the-webhook-fires)。
</Tip>

## 配置采样率

配置采样率以控制触发自动化操作的过滤运行的百分比。例如，为了控制成本，您可能需要设置一个过滤器以仅将求值器应用于 10% 的迹线。为此，您可以将采样率设置为 0.1。

## 对过去的运行应用规则

通过切换 **应用到过去的运行** 并输入“回填自”日期，将规则应用于过去的运行。这只有在创建规则时才有可能。

<Note>
  回填作为后台作业进行处理，因此您不会立即看到结果。
</Note>为了跟踪回填的进度，您可以通过前往跟踪项目中的 **Evaluators** 选项卡并单击您创建的评估器的日志按钮来查看评估器的日志。在线评估器日志类似于[automation rule logs](/langsmith/rules#view-logs-for-your-automations)。

1. 添加评估者姓名。
2. （可选）过滤您想要应用评估器的运行或配置采样率。
3. 选择**应用评估程序**。

## 设置支出限额

您可以限制该评估者每周附加项目和数据集的 LLM 成本。默认情况下，适用组织范围的评估者限制。组织管理员可以通过在**高级**下的**支出限制**字段中设置自定义值来覆盖特定评估者的此设置。要删除覆盖并再次继承组织默认值，请单击“**重置为组织默认值**”。当每周支出达到有效限制时，LangSmith 会暂停该项目或数据集的评估程序，直到在世界标准时间星期一上午 12 点重置限制或手动增加限制。

详情请参阅[Track and limit evaluator spend](/langsmith/evaluator-spend)。

## 配置 LLM-as-a-judge 评估器

查看[LLM-as-a-judge evaluators](/langsmith/llm-as-judge#evaluator-templates)了解更多信息。

## 将多模式内容映射到评估器如果您的跟踪包含图像、音频或文档等多模式内容，您可以将此内容包含在评估器提示中。有两种方法：

* **使用跟踪中的 Base64 编码内容**：如果您的应用程序将多模式内容记录为跟踪中的 Base64 编码数据（例如，在运行的输入或输出中），您可以使用模板变量在评估器提示中直接引用此内容。评估器将从跟踪中提取 base64 数据并将其传递给 LLM。
* **使用痕迹中的附件**：与[offline evaluations with attachments](/langsmith/evaluate-with-attachments)类似，您可以在在线评估中使用痕迹中的附件。由于您的跟踪已经包含通过 SDK 记录的附件，因此您可以直接在评估器中引用它们。

  1. 从数据集页面选择 **+ Evaluator**。
  2. 在 **模板变量** 编辑器中，为附件添加一个变量以包括：
     * 如果要包含特定附件，可以使用建议的变量名称，例如`{{attachment.file_name}}`，这将在附件列表中映射带有`file_name`的文件，将其传递给评估器。
     * 如果要包含所有附件，请使用 `{{attachments}`}\` 变量。

  <img alt="Edit evaluator modal with an image attachment selected for the input." />

  <img alt="Edit evaluator modal with an image attachment selected for the input." />然后，评估者可以在评估跟踪时访问这些附件。这对于需要执行以下操作的评估人员非常有用：

* 验证图像描述是否与跟踪中的实际图像匹配。
* 检查转录是否准确反映了音频输入。
* 验证从文档中提取的文本是否正确。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-llm-as-judge.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>