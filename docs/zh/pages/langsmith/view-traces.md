<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: View traces | https://docs.langchain.com/langsmith/view-traces -->

# 查看痕迹

使用消息视图或详细信息视图检查 LangSmith 中的代理线程。

在跟踪项目中，使用 **Threads**、**Traces** 或 **Runs** 选项卡来更改表中显示的内容。单击任意行以打开侧面板。

侧面板围绕 [threads](/langsmith/observability-concepts#threads) 组织，作为主要导航单元。 UI 没有将每个 [run](/langsmith/observability-concepts#runs) 视为孤立的对象，而是使周围的对话保持可见，以便您可以了解运行在代理更广泛的执行中的位置。

<Note>
  “线程”选项卡和“转弯”视图仅适用于使用 `thread_id` 元数据字段进行检测的运行。如果没有线程检测，您将看到单独运行的跟踪，并且无法访问 Turns 视图。
</Note>

侧面板顶部提供三个视图：* [**Messages**](#messages-view) (**beta**)：对话层。将 [trajectory](/langsmith/observability-concepts#trajectories) 扫描为输入、输出、推理、工具调用和子代理活动。使用它来查找要查找的位置。按`M`切换到该视图。
* [**Turns**](#turns-view)：每回合摘要。将线程中的每一圈视为显示其输入和输出的卡片，并可展开/折叠。当您想要结构概览而不需要完整的对话渲染时，请使用此选项。按`T`切换到该视图。
* [**Details**](#details-view)：调试层。深入研究特定运行以检查输入、输出、计时、令牌计数、错误和元数据。使用它可以了解执行过程中特定点发生的情况。按`D`切换到该视图。

<Note>
  对于没有任何可呈现消息的线程，“消息”选项卡处于禁用状态。消息视图位于 **[beta](/langsmith/release-stages)** - 侧面板默认为详细信息视图。
</Note>

使用“消息”视图在对话中定位自己并确定重点，然后切换到“详细信息”视图以检查特定运行：

<Steps>
  <Step title="Start in the Messages view">
    打开线程并切换到消息视图以查看轨迹。
  </Step><Step title="Investigate">
    扫描轨迹以识别意外行为，例如，错误的工具结果、意外的子代理切换、延迟峰值。
  </Step>

  <Step title="Inspect the run">
    单击相关消息或工具调用，以在生成该消息或工具的确切运行中打开“详细信息”视图。检查其输入、输出、时间、错误和元数据。
  </Step>

  <Step title="Return to the trajectory">
    切换回消息视图以继续扫描对话。
  </Step>
</Steps>

## 消息视图

<Note>消息视图位于 **[beta](/langsmith/release-stages)**。侧板默认为[Details view](#details-view).</Note>

在深入研究特定运行之前，使用消息视图扫描完整的[trajectory](/langsmith/observability-concepts#trajectories)并识别意外行为，例如错误的工具结果、意外的子代理切换或延迟峰值。

### 消息视图显示的内容

轨迹中的每个转弯都会呈现为包含模型响应的单个块，该工具将其称为触发的，以及这些工具返回的结果。您可以扫描完整轨迹并读取代理的行为，而无需打开子运行。

每个块的元数据行显示：* **令牌使用量：** 调用的令牌总数
* **费用：** 通话总费用
* **型号名称**
* **LLM 调用** 链接到 [Details view](#details-view) 中相应的运行（仅当 AI 消息具有可见文本时显示）

当模型使用扩展思维时，**思维**块会与辅助消息内联显示，默认情况下是折叠的。单击以展开该回合模型的思路链。

**子代理**作为不同的操作内嵌在对话中。单击子代理可打开该子代理消息的嵌套视图。单击返回返回到父线程。

**工具调用**与触发它们的辅助消息一起出现。每个工具调用卡都包含一个在 [Details view](#details-view) 中运行的链接。当代理同时进行多个工具调用时，无论是重复使用相同的工具还是并行地调用多个不同的工具，这些调用都会折叠成单个分组行。展开组以查看每个单独的呼叫。

要将线程下载为 Markdown 文件，请使用消息视图中的下载按钮。导出的文件包括完整的对话记录，包括人类和人工智能的轮流、工具调用和工具结果，其格式适合在任何 Markdown 查看器中阅读。### 自定义消息视图

您可以使用各个运行的元数据键来控制运行在“消息”视图中的显示方式。

* `ls_agent_type`：控制来自类似代理运行的消息的显示位置。接受的值：

  |价值|消息查看行为 |
  | ------------ | ------------------------------------------------------------------------------------------ |
  | `"root"` |来自此运行的消息出现在主消息视图中。                       |
  | `"subagent"` |来自此运行的消息在对话线程中显示为子代理操作。 |

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  @traceable(metadata={"ls_agent_type": "root"})
  def my_agent():
      ...
  ```

* `ls_message_format`：覆盖自动格式检测。接受的值：
  * `"langchain"`: 解析为LangChain消息格式
  * `"completions"`：解析为 OpenAI Chat Completions 格式
  * `"responses"`：解析为 OpenAI Responses API 格式
  * `"anthropic"`: 解析为 Anthropic 消息格式* `LS_MESSAGE_VIEW_EXCLUDE`：从消息视图中排除单个运行。从 `langsmith`（Python 和 JS）导入常量，或使用文字字符串 `"ls_message_view_exclude"`。代码示例请参考[Exclude runs from the Messages view](/langsmith/messages-view-integrations#exclude-runs-from-the-messages-view)。
  * 对于 `@traceable` / `traceable()`：在标记运行的跟踪上下文中执行的子运行继承排除。
  * 对于 `wrap_openai` / `wrapOpenAI`、`wrapAISDK`、`RunTree.createChild` 和 LangChain `RunnableConfig`：为要隐藏的每个运行设置密钥。在这些表面上不保证子运行的继承。

对于自动设置此元数据的集成，请参阅[Messages view integrations](/langsmith/messages-view-integrations)。

## 转动视图

使用 Turns 视图一次一圈地扫描线程的结构，而无需使用 Messages 视图呈现完整的对话。线程中的每一轮都显示为一张卡片，显示根运行的输入和输出。单击卡片的 V 形以展开或折叠其内容。

转弯视图在以下情况下很有用：

* 该线程没有可呈现的消息（例如，来自消息视图不支持的集成的跟踪）。
* 在决定钻哪一圈之前，您需要快速了解螺纹的结构。
* 您希望查看每轮的原始输入和输出，而不需要标准化为聊天式对话。单击任何回合即可在生成它的运行处打开 [Details view](#details-view)。

### 自定义转弯视图

默认情况下，LangSmith 使用启发式方法选择要在每个回合卡上显示的输入和输出字段。要覆盖显示的字段，请单击线程顶部的“格式”按钮打开格式窗格，选择要显示的特定输入和输出路径，然后保存。您的选择对于该项目仍然有效。

## 详情查看

详细信息视图是调试层。当您单击特定的运行时，周围的线程上下文仍然可用，因此您可以了解该运行在更广泛的对话中的位置。检查输入、输出、元数据、计时、错误和子运行，而不会丢失线程的跟踪。

### 自定义详细信息视图

在运行中设置 `run_type="llm"` 会导致详细信息视图呈现该运行的令牌计数和延迟。完整的消息格式规范，请参阅[Log an LLM trace](/langsmith/log-llm-trace)。

当运行的 `run_type` 为 `tool` 时，工具消息会自动展开。

在运行时设置 `run_type="retriever"` 会导致详细信息视图呈现每个检索到的文档及其内联内容和元数据。所需的返回格式请参考[Log retriever traces](/langsmith/log-retriever-trace)。

### 行动从详细信息视图中，您还可以：

* **共享跟踪：** 生成跟踪的公共链接。请参阅[Manage a trace](/langsmith/manage-trace#share-a-trace)。
* **查看服务器日志：** 访问与 LangSmith 部署生成的跟踪关联的服务器日志。参见[Manage a trace](/langsmith/manage-trace#view-server-logs)。
* **添加到数据集：** 将运行保存为数据集中的示例，以便在评估中使用。参见[Manage datasets in the application](/langsmith/manage-datasets-in-application#manually-from-a-tracing-project)。
* **添加到注释队列：** 将运行或其整个[thread](/langsmith/observability-concepts#threads)发送到队列以供人工审核和反馈。请参阅[Annotation queues](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/view-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>