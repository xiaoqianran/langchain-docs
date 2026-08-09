<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Changelog | https://docs.langchain.com/oss/python/releases/changelog -->

# 变更日志

Python 包的更新和改进日志

<Callout icon="rss">
  **订阅**：我们的变更日志包括一个 [RSS feed](https://docs.langchain.com/oss/python/releases/changelog/rss.xml)，可以与 [Slack](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack)、[email](https://zapier.com/apps/email/integrations/rss/1441/send-new-rss-feed-entries-via-email)、Discord 机器人（如 [Readybot](https://readybot.io/) 或 [RSS Feeds to Discord Bot](https://rss.app/en/bots/rssfeeds-discord-bot)）以及其他订阅工具集成。
</Callout>

<Update label="Jul 24, 2026">
  ## `deepagents` v0.7.0

  默认情况下，更精简、更可配置的线束。在默认代理轮流中，输入令牌下降 **65%** (5,395 → 1,895)，根据我们的 [revamped evaluation suite](https://www.langchain.com/blog/how-we-benchmark-deep-agents) 进行验证，没有质量回归。

  ### 优化

  * **默认情况下的精益提示**：编写的基本提示以空内容开头，并且工具使用散文已删除重复的工具模式。与默认代理的工具模式隔离，总描述标记下降 **43%** (4,005 → 2,302)；结合空基本提示和选择加入待办事项，默认代理回合的输入令牌下降 **65%** (5,395 → 1,895)。工具行为未改变。 （[#4859](https://github.com/langchain-ai/deepagents/pull/4859)、[#4979](https://github.com/langchain-ai/deepagents/pull/4979)、[#5009](https://github.com/langchain-ai/deepagents/pull/5009)）

  ### 特点* **[Override a default middleware instance](/oss/python/deepagents/customization#middleware)**：`middleware=`（或子代理`middleware`）实例（其`.name`与内置实例匹配）现在会就地替换该默认值，而不是在重复时出错。例如，传递您自己的 `SummarizationMiddleware(...)` 来更改令牌触发器或摘要模型，而无需禁用内置默认值。 ([#4251](https://github.com/langchain-ai/deepagents/pull/4251))
  * **文件系统工具**：新的[⟦T8⟧](/oss/python/deepagents/tools#built-in-harness-tools)工具删除文件或递归删除目录（[#3659](https://github.com/langchain-ai/deepagents/pull/3659)，[#3851](https://github.com/langchain-ai/deepagents/pull/3851)）； `write_file` 现在覆盖现有文件而不是出错 ([#4109](https://github.com/langchain-ai/deepagents/pull/4109))； `FilesystemMiddleware` 接受 [tool allowlist](/oss/python/deepagents/overview#virtual-filesystem-access) 以仅公开选定的内置工具（[#4325](https://github.com/langchain-ai/deepagents/pull/4325)、[#4698](https://github.com/langchain-ai/deepagents/pull/4698)）；读取和搜索针对开放模型进行了调整 - 分页 `read_file` 报告总行和剩余行以及下一个 `offset` ([#4540](https://github.com/langchain-ai/deepagents/pull/4540))，`grep`/`glob` 使用 `truncated` 标志返回部分结果，而不是挂在大树上 ([#4063](https://github.com/langchain-ai/deepagents/pull/4063))，以及`grep` 通过流式输出和可选上下文行（[#4570](https://github.com/langchain-ai/deepagents/pull/4570)、[#4706](https://github.com/langchain-ai/deepagents/pull/4706)）获得 1,000 场比赛的上限。
  * **更多提示缓存支持**：通过 `deepagents[aws]` 额外 ([#4108](https://github.com/langchain-ai/deepagents/issues/4108)) 进行基岩提示缓存，以及自动 Fireworks 提示缓存会话亲和性 ([#4598](https://github.com/langchain-ai/deepagents/pull/4598))。
  * **NVIDIA 支持**：内置 Nemotron 3 Ultra 线束配置文件以及 NIM 应用程序来源归属。 （[#4192](https://github.com/langchain-ai/deepagents/pull/4192)、[#4455](https://github.com/langchain-ai/deepagents/pull/4455)）

  ### 重大变更* **规划待办事项是可选的**：默认情况下，`create_deep_agent`不再包含`TodoListMiddleware`，因此`write_todos`工具、`todos`状态通道和待办事项规划提示将不存在，除非使用`middleware=[TodoListMiddleware()]`恢复。 （OpenAI Codex 线束配置文件仍会自动选择加入。）([#4929](https://github.com/langchain-ai/deepagents/pull/4929))
  * **删除后端兼容性垫片**：传递具体的 `BackendProtocol` 实例而不是工厂，使用显式 `namespace` 配置 `StoreBackend`，并使用当前的 `ls` / `glob` / `grep` / `ReadResult` API。删除的符号包括 `BackendFactory`、`BACKEND_TYPES`、`FileFormat` 和 `Unset`。新文件存储字符串`FileData.content`；较旧的 `list[str]` 内容保持可读并在下次写入时进行转换。 ([#4541](https://github.com/langchain-ai/deepagents/pull/4541))
  * **输出格式更改**：空的 `ls` / `glob` 输出现在是 `No files found` 而不是 `[]`，并且 `read_file` 不再呈现固定宽度的 `cat -n` 样式装订线 — 更新原始工具输出的任何解析器。 ([#4561](https://github.com/langchain-ai/deepagents/pull/4561))

  将以下提示复制到您的 AI 编码助手中，以迁移这些重大更改的代码库：

  <Prompt description="Migrate a deepagents codebase from v0.6.x to v0.7." icon="arrow-right">
    将此代码库从 `deepagents` v0.6.x 迁移到 v0.7 以考虑以下重大更改：1. `create_deep_agent`不再默认包含`TodoListMiddleware`。如果此代码库依赖于 `write_todos` 工具、`todos` 状态通道或待办事项计划提示，请通过从 `langchain.agents.middleware`（不是 `deepagents`）导入 `TodoListMiddleware` 并将其传递到 `create_deep_agent` 来恢复它：

       ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       from langchain.agents.middleware import TodoListMiddleware
       from deepagents import create_deep_agent

       agent = create_deep_agent(middleware=[TodoListMiddleware()])
       ```

    2. 后端兼容性垫片已删除：`BackendFactory`、`BACKEND_TYPES`、`FileFormat` 和 `Unset` 不再存在。用具体的 `BackendProtocol` 实例替换任何后端工厂，并向每个 `StoreBackend` 配置添加显式 `namespace`：

       ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       from deepagents import create_deep_agent
       from deepagents.backends import StoreBackend

       # Before (v0.6.x): factory callable, and StoreBackend with no explicit namespace
       agent = create_deep_agent(backend=lambda rt: StoreBackend())  # [!code --]

       # After (v0.7): concrete backend instance with an explicit namespace
       agent = create_deep_agent(backend=StoreBackend(namespace=lambda rt: (rt.server_info.user.identity,)))  # [!code ++]
       ```

       还更新调用以使用当前的 `ls`、`glob`、`grep` 和 `ReadResult` API。

    3. 工具输出格式已更改：空的`ls` / `glob` 输出现在是字符串`No files found`，而不是`[]`，并且`read_file`不再渲染固定宽度的`cat -n`样式行号装订线。更新解析这些工具输出的任何代码。

    在代码库中搜索已删除符号的用法以及依赖于旧输出格式的解析逻辑，应用必要的更改，并标记任何需要手动检查的内容。
  </Prompt>
</Update>

<Update label="May 12, 2026">
  ## `deepagents` v0.6.0* **[⟦T69⟧](/oss/python/deepagents/interpreters)**：（实验性）`deepagents` 现在支持通过作用域 QuickJS 运行时执行代码和编程工具调用。
  * 支持`stream_events` / `astream_events` 中的`version="v3"`。详情请参阅[event streaming](/oss/python/deepagents/event-streaming)指南。
  * **[⟦T74⟧](/oss/python/langgraph/pregel#deltachannel)（测试版）** ([blog](https://www.langchain.com/blog/delta-channels-evolving-agent-runtime))：Deep Agents 现在使用 `DeltaChannel` 来存储消息历史记录和代理文件。不是将完整的累积值重新序列化到每个检查点中，而是仅存储在每个步骤中写入的增量增量 - 随着线程变长，检查点大小保持较小。
  * **[Harness profiles](/oss/python/deepagents/profiles)**：注册每个提供商或每个模型的配置包 (`HarnessProfile`)，当选择模型时，`create_deep_agent` 自动应用 - 系统提示调整、工具覆盖、中间件更改和子代理默认值 - 无需修改调用站点。
  * **[⟦T78⟧](/oss/python/deepagents/backends#contexthubbackend)** ([blog](https://www.langchain.com/blog/introducing-context-hub))：由 LangSmith Hub 支持的新文件系统后端。代理文件（技能、记忆和其他持久上下文）存储为 Hub 提交，为您提供每次写入的版本历史记录和 LangSmith 本地持久性，而无需配置单独的 LangGraph 存储。
</Update>

<Update label="May 12, 2026">
  ## `langchain` v1.3.0

  此版本在 `stream_events` / `astream_events` 中为 `langchain` 代理添加了对 `version="v3"` 的支持。详情请参阅[event streaming](/oss/python/langchain/event-streaming)指南。
</Update><Update label="May 12, 2026">
  ## `langgraph` v1.2.0

  此版本增加了对节点执行的更细粒度的控制（超时、错误恢复和正常关闭）、一种可减少长时间运行线程的检查点开销的新通道类型，以及具有类型化、每通道投影的新的以内容块为中心的流 API (v3)。

  * **[⟦T85⟧](/oss/python/langgraph/pregel#deltachannel)（测试版）**：一种新的通道类型，仅存储每一步的增量增量，而不是重新序列化完整的累积值。对于随着时间的推移而变大的通道最有用，例如长时间运行的线程中的消息列表。使用 `snapshot_frequency=K` 每 K 步写入一个完整快照并限制读取延迟。

  * **[Per-node timeouts](/oss/python/langgraph/fault-tolerance#timeouts)**：将 `timeout=` 传递给 [⟦T88⟧](https://reference.langchain.com/python/langgraph/graph/state/StateGraph/add_node) 以限制单次尝试可以运行的时间。设置硬挂钟限制 (`run_timeout`)、进度重置的空闲限制 (`idle_timeout`)，或通过 [⟦T91⟧](https://reference.langchain.com/python/langgraph/types/TimeoutPolicy) 设置两者。当限制触发时，LangGraph 会提高 [⟦T92⟧](https://reference.langchain.com/python/langgraph/errors/NodeTimeoutError)，清除该尝试中的写入，并将重试策略移交给重试策略。仅限异步节点。

  * **[Node-level error handlers](/oss/python/langgraph/fault-tolerance#error-handling)**：将`error_handler=`传递给[⟦T94⟧](https://reference.langchain.com/python/langgraph/graph/state/StateGraph/add_node)以在所有重试都用尽后运行恢复功能。处理程序接收类型化的 [⟦T95⟧](https://reference.langchain.com/python/langgraph/errors/NodeError) 并可以返回 [⟦T96⟧](https://reference.langchain.com/python/langgraph/types/Command) 来更新状态并路由到不同的节点，这对于 Saga/补偿模式很有用。* **[Graceful shutdown](/oss/python/langgraph/fault-tolerance#graceful-shutdown)**：当前超级步完成后，协同停止正在进行的运行，并保存可恢复的检查点。创建一个[⟦T97⟧](https://reference.langchain.com/python/langgraph/runtime/RunControl)并从任何线程调用`request_drain()`；运行会引发`GraphDrained`，并且可以稍后使用相同的配置恢复。

  * **新的事件流 API（测试版）**：将 `version="v3"` 传递到 `stream_events()` / `astream_events()`，以实现以内容块为中心的协议，具有类型化、每通道投影（`run.values`、`run.messages`、`run.lifecycle`、`run.subgraphs`）以及选择加入用于更新、自定义事件、检查点、任务和调试的转换器。每次 LLM 调用，`run.messages` 都会生成一个 `ChatModelStream`，其中包含用于文本、推理、工具调用和使用的类型化子投影。 `version="v1"` 和 `version="v2"` 不变。

  超时和错误处理程序仅适用于 Python；重试策略在 Python 和 TypeScript 中继续有效。
</Update>

<Update label="Apr 7, 2026">
  ## `deepagents` v0.5.0

  * **[Async subagents](/oss/python/deepagents/async-subagents)**：深度代理可以启动非阻塞后台任务，因此用户可以在子代理同时工作的同时继续与代理交互。子代理需要[LangSmith Deployment](/langsmith/deployment)。

  * **多模式支持**：除了图像之外，`read_file` 工具现在还支持 PDF、音频和视频文件。* **后端更改**：我们对深度代理[backend protocol](https://github.com/langchain-ai/deepagents/blob/main/libs/deepagents/deepagents/backends/protocol.py)进行了向后兼容的更改：
    * 更新了[State and Store backends](/oss/python/deepagents/backends)中存储的文件格式以支持二进制文件。
    * 改进了从后端到工具的错误传播。
    * 您现在可以直接实例化`StateBackend()`和`StoreBackend()`。不推荐使用工厂指定（例如，`backend=(lambda rt: StateBackend(rt))`）。

  * **人择提示缓存改进**：我们进行了一些改进，以提高人择模型的提示缓存性能。
</Update>

<Update label="Mar 10, 2026">
  ## `langgraph` v1.1.0

  * **类型安全流 (`version="v2"`)**：将 `version="v2"` 传递到 `stream()` / `astream()`，以实现统一的 `StreamPart` 输出，每个块上都有 `type`、`ns` 和 `data` 键。每种模式都有自己的`TypedDict`，均可从`langgraph.types`导入。参见[streaming docs](/oss/python/langgraph/streaming#stream-output-format-v2)。

  * **类型安全调用 (`version="v2"`)**：将 `version="v2"` 传递给 `invoke()` / `ainvoke()` 以获取具有 `.value` 和 `.interrupts` 属性的 `GraphOutput` 对象。参见[invoke docs](/oss/python/langgraph/streaming#v2-invoke-format)。

  * **Pydantic 和数据类强制**：使用 `version="v2"`、`invoke()` 和 `values` 模式流输出会自动强制为您声明的 Pydantic 模型或数据类类型。* **修复了带有中断和子图的时间旅行**：重播不再重用过时的`RESUME`值，并且子图正确恢复父级历史状态的检查点。

  * **完全向后兼容**：`version="v2"` 是可选的。 `GraphOutput` 支持已弃用的字典式访问以进行逐步迁移。
</Update>

<Update label="Feb 10, 2026">
  ## `deepagents` v0.4.0

  * 可插拔沙箱的新集成包：[⟦T141⟧](https://pypi.org/project/langchain-modal/)、[⟦T142⟧](https://pypi.org/project/langchain-daytona/) 和 [⟦T143⟧](https://pypi.org/project/langchain-runloop/)。请参阅 [sandboxes guide](/oss/python/deepagents/sandboxes) 和示例 [data analysis tutorial](/oss/python/deepagents/data-analysis)。
  * [conversation history summarization](/oss/python/deepagents/context-engineering#summarization) 的更改：
    * 汇总现在通过 `wrap_model_call` 事件在模型节点中进行。因此，我们在图形状态中保留完整的消息历史记录。
    * 更准确的令牌计数。
    * 如果聊天模型引发[⟦T145⟧](https://reference.langchain.com/python/langchain-core/exceptions/ContextOverflowError)（在`langchain-core`中定义），现在将自动触发摘要。目前`langchain-anthropic`和`langchain-openai`支持此功能。
  * 我们现在默认使用前缀为 `"openai:"` 的模型字符串的响应 API。
    <Accordion title="Disable data retention with the Responses API">
      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain.chat_models import init_chat_model

      agent = create_deep_agent(
          model=init_chat_model(
              "openai:...",
              use_responses_api=True,
              store=False,
              include=["reasoning.encrypted_content"],
          )
      )
      ```
    </Accordion>
</Update>

<Update label="Dec 15, 2025">
  ## `langchain` v1.2.0* [⟦T151⟧](/oss/python/langchain/agents)：通过 [tools](/oss/python/langchain/tools) 上的新 [⟦T152⟧](https://reference.langchain.com/python/langchain/tools/#langchain.tools.BaseTool.extras) 属性简化了对特定于提供商的工具参数和定义的支持。示例：
    * 特定于提供商的配置，例如 Anthropic 的 [programmatic tool calling](/oss/python/integrations/chat/anthropic#programmatic-tool-calling) 和 [tool search](/oss/python/integrations/chat/anthropic#tool-search)。
    * 在客户端执行的内置工具，由 [Anthropic](/oss/python/integrations/chat/anthropic#built-in-tools)、[OpenAI](/oss/python/integrations/chat/openai#responses-api) 和其他提供商支持。
  * 支持代理 `response_format` 中严格的架构遵守（请参阅 [⟦T154⟧](/oss/python/langchain/structured-output#provider-strategy) 文档）。
</Update>

<Update label="Dec 8, 2025">
  ## `langchain-google-genai` v4.0.0

  我们重新编写了 Google GenAI 集成，以使用 Google 的综合 Generative AI SDK，该 SDK 提供了在同一接口下访问 Gemini API 和 Vertex AI Platform 的权限。这包括最小的重大更改以及 `langchain-google-vertexai` 中已弃用的软件包。

  详情请参阅完整的[release notes and migration guide](https://github.com/langchain-ai/langchain-google/discussions/1422)。
</Update>

<Update label="Nov 25, 2025">
  ## `langchain` v1.1.0* [Model profiles](/oss/python/langchain/models#model-profiles)：聊天模型现在通过 `.profile` 属性公开支持的特性和功能。这些数据来源于[models.dev](https://models.dev)，一个提供模型能力数据的开源项目。
  * [Summarization middleware](/oss/python/langchain/middleware/built-in#summarization)：更新为支持使用模型配置文件进行上下文感知摘要的灵活触发点。
  * [Structured output](/oss/python/langchain/structured-output)：现在可以从模型配置文件推断`ProviderStrategy` 支持（本机结构化输出）。
  * [⟦T160⟧ for ⟦T161⟧](/oss/python/langchain/middleware/custom#dynamic-prompt)：支持将`SystemMessage`实例直接传递到`create_agent`的`system_prompt`参数，从而启用缓存控制和结构化内容块等高级功能。
  * [Model retry middleware](/oss/python/langchain/middleware/built-in#model-retry)：新的中间件，用于通过可配置的指数退避自动重试失败的模型调用。
  * [Content moderation middleware](/oss/python/integrations/middleware/openai#content-moderation)：OpenAI 内容审核中间件，用于检测和处理代理交互中的不安全内容。支持检查用户输入、模型输出和工具结果。
</Update>

<Update label="Oct 20, 2025">
  ## v1.0.0

  ### `langchain`

  * [Release notes](/oss/python/releases/langchain-v1)
  * [Migration guide](/oss/python/migrate/langchain-v1)

  ### `langgraph`

  * [Release notes](/oss/python/releases/langgraph-v1)
  * [Migration guide](/oss/python/migrate/langgraph-v1)

  <Callout icon="speakerphone">
    如果您遇到任何问题或有反馈，请[open an issue](https://github.com/langchain-ai/docs/issues/new?template=01-langchain.yml)以便我们改进。要查看 v0.x 文档，[go to the archived content](https://github.com/langchain-ai/langchain/tree/v0.3/docs/docs) 和 [API reference](https://reference.langchain.com/v0.3/python/)。
  </Callout>
</Update>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/releases/changelog.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>