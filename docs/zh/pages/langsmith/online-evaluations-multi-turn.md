<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up multi-turn online evaluators | https://docs.langchain.com/langsmith/online-evaluations-multi-turn -->

# 设置多轮在线评估器

多轮在线评估器允许您评估人类和代理之间的整个对话，而不仅仅是个人交流。他们测量线程中所有回合的端到端交互质量。

您可以使用多轮评估来衡量：
1. 语义意图：用户想要做什么。
2.语义结果：实际发生了什么，任务是否成功。
3. 轨迹：对话如何展开，包括工具调用的轨迹。

<Note>多轮在线评估器可以默认延长跟踪保留时间。您可以在配置评估器时选择退出，以便跟踪保留项目的配置保留层。如果另一个操作显式延长保留时间或项目已使用延长保留时间，跟踪仍会升级。有关逐步选择退出的说明，请参阅[Manage evaluator trace retention](/langsmith/evaluators#manage-evaluator-trace-retention)。详情请参阅[data retention auto-upgrades](/langsmith/usage-and-billing#data-retention-auto-upgrades).</Note>

## 它是如何工作的

多轮在线评估器遵循以下评估生命周期：1. **跟踪摄取**：对话中的每个轮次都作为单独的运行进行跟踪，并使用共享线程 ID 与线程关联。
2. **空闲时间检测**：摄取线程中的最后一个跟踪后，LangSmith 等待配置的空闲时间过去。此空闲期表示对话已完成并准备好进行评估。
3. **消息组装**：LangSmith从线程中的每个跟踪中收集`messages`并将它们组装成单个对话历史记录。如果每个跟踪仅包含最新消息，则 LangSmith 将各轮消息缝合在一起。如果每个跟踪包含完整的历史记录，LangSmith 会直接使用它。由于线程中的连续跟踪经常重新发送先前的历史记录，因此 LangSmith 会删除重叠消息，因此每个消息仅出现一次。结果是 OpenAI 聊天格式 (`{"role": ..., "content": ...}`) 的单个消息列表，这就是提示中的 `all_messages` 变量解析的结果。
4. **LLM 作为法官评估**：组装的对话将传递到您配置的 LLM 作为法官提示。评估者根据您的标准对整个线程进行评分：语义意图、结果或轨迹。5. **反馈记录**：评估者使用您配置的与线程关联的反馈键将反馈写入LangSmith。

此生命周期意味着多轮评估器每个完成的线程运行一次，而不是每个跟踪运行一次。如果您想要每条迹线评估，请使用[run-level online evaluators](/langsmith/online-evaluations-llm-as-judge)。

## 先决条件

- 您的跟踪项目必须使用[threads](/langsmith/threads)。
- 线程中每个跟踪的顶级输入和输出必须有一个包含消息列表的 `messages` 键。我们支持[LangChain](/langsmith/log-llm-trace#messages-format)、[OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat/create)和[Anthropic Messages](https://platform.claude.com/docs/en/api/messages)格式的消息。
    - 如果每个跟踪的顶级输入和输出仅包含对话中的最新消息，LangSmith将自动将跨轮的消息组合成一个线程。
    - 如果每个跟踪的顶级输入和输出包含完整的对话历史记录，LangSmith将直接使用它。

<Note>
如果您的跟踪不遵循上述格式，线程级评估器将无法工作。您需要更新跟踪LangSmith的方式，以确保每个跟踪的顶级输入和输出包含`messages`列表。

请参阅[troubleshooting](/langsmith/online-evaluations-multi-turn#troubleshooting)部分了解更多信息。
</Note>

## 配置1. 导航到**跟踪**页面并选择一个跟踪项目。
2. 单击“**评估器**”选项卡，然后单击“**+ 评估器**”。在“从头开始创建”下选择“LLM 作为法官评估者”。在“**源**”下，选择“**线程**”。
3. **指定您的评估员**。
4. 应用**过滤器**或**采样率**。 <br />
使用过滤器或抽样来控制评估者成本。例如，仅评估 *N* 圈下的线程或对所有线程的 10% 进行采样。
5. **配置空闲时间**。 <br />
第一次配置线程级别评估器时，您将定义空闲时间 — 线程中最后一次跟踪之后、在线程被视为完成并准备好评估之前的时间量。该值应反映应用程序中用户交互的预期长度。它适用于项目中的所有评估者。
<Tip>
首次测试评估器时，请使用较短的空闲时间，以便您可以快速看到结果。验证后，增加它以匹配用户交互的预期长度。
</Tip>
6. **配置您的模型。**<br />选择您想要用于评估器的提供商和模型。线程往往会变长，因此您应该使用具有较高上下文窗口的模型，以避免遇到限制。例如，OpenAI 的 GPT-5.4 mini 或 Gemini 2.5 Flash 都是不错的选择，因为它们都有 1M+ 令牌上下文窗口。

7. **配置您的 LLM 法官提示。**<br />
定义您要评估的内容。该提示将用于评估线程。您还可以通过 `all_messages` 变量配置将组装对话的哪些部分传递给评估器，以控制它接收的内容：
    - 所有消息：以OpenAI聊天格式（`{"role": ..., "content": ...}`）将完整对话作为JSON消息对象列表发送，每条消息呈现为缩进的JSON并用空行分隔。
    - 人类和人工智能对：仅发送用户和助理消息，格式为`<user>...</user>`和`<assistant>...</assistant>`，不包括系统消息、工具调用和其他角色。
    - 第一个人类和最后一个人工智能：仅发送第一条用户消息和最后一个助理回复。9. **设置您的反馈配置**。<br />
配置反馈键的名称、要收集的反馈的格式，并可选择启用反馈推理。

<Warning>
我们不建议对线程级求值器和运行级求值器使用相同的反馈键，因为很难区分两者。
</Warning>

8. **保存您的评估器。**

保存后，您的评估器将出现在**评估器**选项卡中。保存后创建的任何新线程的空闲时间过去后，您可以对其进行测试。

## 限制

这些是多轮在线评估器的当前限制（可能会发生变化）。如果您遇到任何这些限制，请联系我们。

- **运行时间必须少于一周**：当线程空闲时，只有过去 7 天内的运行才有资格进行评估。
- **一次最多评估 500 个线程**：如果在五分钟内有超过 500 个线程标记为空闲，我们将自动对超过 500 个线程进行采样。
- **每个工作区最多 10 个多轮在线评估器**

## 故障排除**检查评估者的状态** <br />
您可以通过前往跟踪项目中的 **Evaluators** 选项卡并单击您创建的评估器的 **Logs** 按钮来查看其运行历史记录，从而检查评估器上次运行的时间。

**检查发送给评估器的数据** <br />
通过前往跟踪项目中的 **Evaluators** 选项卡、单击您创建的评估器并单击 **Evaluator Traces** 选项卡来检查发送到评估器的数据。

在此选项卡中，您可以看到传递到 LLM-as-a-judge 评估器的输入。如果您的消息未正确传递，您将在输入中看到空白值。如果您的消息未采用 [the expected formats](/langsmith/online-evaluations-multi-turn#prerequisites) 之一的格式，则可能会发生这种情况。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-multi-turn.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>