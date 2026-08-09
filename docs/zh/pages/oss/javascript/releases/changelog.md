<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Changelog | https://docs.langchain.com/oss/javascript/releases/changelog -->

# 变更日志

我们的 JavaScript/TypeScript 包的更新和改进日志

<Callout icon="rss">
  **订阅**：我们的变更日志包括一个 [RSS feed](https://docs.langchain.com/oss/javascript/releases/changelog/rss.xml)，可以与 [Slack](https://slack.com/help/articles/218688467-Add-RSS-feeds-to-Slack)、[email](https://zapier.com/apps/email/integrations/rss/1441/send-new-rss-feed-entries-via-email)、Discord 机器人（如 [Readybot](https://readybot.io/) 或 [RSS Feeds to Discord Bot](https://rss.app/en/bots/rssfeeds-discord-bot)）以及其他订阅工具集成。
</Callout>

<Update label="Mar 24, 2026">
  ## `deepagents` v1.9.0-alpha.0

  `deepagents` v1.9.0 的 Alpha 版本。

  * **[Async subagents](/oss/javascript/deepagents/async-subagents)**：深度代理可以启动非阻塞后台任务，因此用户可以在子代理同时工作的同时继续与代理交互。子代理需要[LangSmith Deployment](/langsmith/deployment)。* **[Backend](/oss/javascript/deepagents/backends) 协议 v2**：我们引入了新的 v2 后端协议 (`BackendProtocolV2`)，并对 Deep Agents 后端接口进行了向后兼容的更改。主要变化：
    * **结构化结果类型**：所有方法现在都返回结构化 `Result` 对象（例如 `ReadResult`、`LsResult`、`GrepResult`、`GlobResult`），并通过 `error` 字段进行一致的错误处理，而不是返回原始值或引发异常。
    * **多模式文件支持**：`read()`返回带有`.content`字段的`ReadResult`而不是纯字符串。对于二进制文件（图像、PDF、音频、视频），完整的原始 `Uint8Array` 内容通过 `readRaw()` 返回，使代理能够在本地处理多模式文件。
    * **简化方法名称**：`lsInfo` -> `ls`、`grepRaw` -> `grep`、`globInfo` -> `glob`。
    * **向后兼容**：现有的 v1 后端可以使用 `adaptBackendProtocol` 适应 v2 接口。 v1 接口（`BackendProtocolV1`、`SandboxBackendProtocolV1`）已弃用，但为了兼容性而保留。
</Update>

<Update label="Jan 14, 2026">
  ## v1.1.0

  ### `@langchain/langgraph`

  引入 **StateSchema** - 一种更干净、与库无关的方式来定义图形状态，可与任何 [Standard Schema](https://github.com/standard-schema/standard-schema) 兼容的验证库一起使用。

  ### 标准 JSON 模式支持LangGraph 现在支持[Standard JSON Schema](https://standardschema.dev/json-schema)，这是由 Zod 4、Valibot、ArkType 和其他模式库实现的开放规范。这意味着您可以使用您喜欢的验证库而无需锁定：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { z } from "zod"; // or valibot, arktype, etc.
  import { StateSchema, ReducedValue, MessagesValue } from "@langchain/langgraph";

  const AgentState = new StateSchema({
    messages: MessagesValue,
    currentStep: z.string(),
    count: z.number().default(0),
    history: new ReducedValue(
      z.array(z.string()).default(() => []),
      {
        inputSchema: z.string(),
        reducer: (current, next) => [...current, next],
      }
    ),
  });

  // Type-safe state and update types
  type State = typeof AgentState.State;
  type Update = typeof AgentState.Update;

  const graph = new StateGraph(AgentState)
    .addNode("agent", (state) => ({ count: state.count + 1 }))
    .addEdge(START, "agent")
    .addEdge("agent", END)
    .compile();
  ```

  ### 新状态值原语

  * **ReducedValue**：使用自定义缩减器定义字段以累积值。支持类型安全减速器输入的单独输入和输出模式。
  * **UntrackedValue**：定义执行期间存在但从未设置检查点的瞬态 - 对于数据库连接、缓存或仅运行时配置有用。
  * **MessagesValue**：使用标准消息缩减器预构建的 `ReducedValue` 用于聊天消息。

  ### 类型助手导出

  用于在图形生成器外部键入函数的新导出类型实用程序：

  * `GraphNode<Schema, Nodes?, Config?>` - 具有完全推理的类型节点函数
  * `ConditionalEdgeRouter<Schema, Nodes?>` - 类型条件边缘路由器

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Type standalone node functions
  const myNode: GraphNode<typeof AgentState> = (state, config) => {
    return { count: state.count + 1 };
  };

  // Use schema type helpers directly
  const processState = (state: typeof AgentState.State) => {
    console.log(state.count);
  };
  ```

  现有的 `Annotation` 和基于 zod 的 API 继续保持不变 - `StateSchema` 对于那些喜欢模式优先定义的人来说是一个额外的选项。

  <Card title="Learn more about StateSchema" icon="book" href="/oss/javascript/langgraph/graph-api#schema">
    请参阅使用 StateSchema、ReducedValue 和 UntrackedValue 定义图状态的完整文档。
  </Card><Card title="Learn about type utilities" icon="code" href="/oss/javascript/langgraph/graph-api#type-utilities">
    使用 GraphNode 和 ConditionalEdgeRouter 在图形生成器外部键入函数。
  </Card>
</Update>

<Update label="Dec 12, 2025">
  ## v1.2.0

  ### `langchain`

  * [Structured output](/oss/javascript/langchain/structured-output)：添加了在使用`providerStrategy`进行结构化输出时手动设置`strict`模式的功能。

  ### `@langchain/openai`

  * **新的提供商内置工具：** 支持由提供商在服务器端执行的文件搜索、网页搜索、代码解释器、图像生成、计算机使用、shell 和 MCP 连接器工具。请参阅 [Server-side tool use](/oss/javascript/langchain/tools#server-side-tool-use) 和 [OpenAI](/oss/javascript/integrations/chat/openai) 聊天集成。
  * **内容审核：** `ChatOpenAI` 上的新 `moderateContent` 选项用于检测和处理不安全内容。
  * 优选 GPT-5.2 Pro 模型的响应 API。

  ## v1.3.0

  ### `@langchain/anthropic`

  * **新的提供商内置工具：** 支持由提供商在服务器端执行的文本编辑器、Web 获取、计算机使用、工具搜索和 MCP 工具集工具。请参阅 [Server-side tool use](/oss/javascript/langchain/tools#server-side-tool-use) 和 [Anthropic](/oss/javascript/integrations/chat/anthropic) 聊天集成。
  * 外露式 `ChatAnthropicInput` 型，提高型式安全性。

  ## v1.1.0

  ### `@langchain/ollama`

  * **本机结构化输出：** 通过 `withStructuredOutput` 添加了对本机结构化输出的支持。
  * 支持自定义`baseUrl`配置。

  ## v1.0.0

  ### `@langchain/community`* Jira 文档加载器更新为使用 v3 API。
  * LanceDB：添加了`similaritySearch()`和`similaritySearchWithScore()`支持。
  * Elasticsearch 混合搜索支持。
  * 新`GoogleCalendarDeleteTool`。
  * 针对 LlamaCppEmbeddings、PrismaVectorStore、IBM WatsonX 的各种错误修复以及安全性改进。

  ### 其他包

  * **@langchain/xai：** 本机实时搜索支持。
  * **@langchain/tavily:** 添加了 Tavily 的研究端点。
  * **@langchain/mongodb:** 新的 MongoDB LLM 缓存。
  * **@langchain/mcp-adapters:** 添加了 `onConnectionError` 选项。
  * **@langchain/google-common:** `withStructuredOutput` 中的`jsonSchema` 方法支持。
  * **@langchain/core:** 安全修复、美人鱼图中更好的子图嵌套、运行 ID 的 UUID7。
</Update>

<Update label="Nov 25, 2025">
  ## v1.1.0* [Model profiles](/oss/javascript/langchain/models#model-profiles)：聊天模型现在通过`.profile` getter 公开支持的特性和功能。这些数据来源于[models.dev](https://models.dev)，一个提供模型能力数据的开源项目。
  * [Model retry middleware](/oss/javascript/langchain/middleware/built-in#model-retry)：新的中间件，用于通过可配置的指数退避自动重试失败的模型调用，从而提高代理可靠性。
  * [Content moderation middleware](/oss/javascript/langchain/middleware/built-in#provider-specific-middleware)：OpenAI 内容审核中间件，用于检测和处理代理交互中的不安全内容。支持检查用户输入、模型输出和工具结果。
  * [Summarization middleware](/oss/javascript/langchain/middleware/built-in#summarization)：更新为支持使用模型配置文件进行上下文感知摘要的灵活触发点。
  * [Structured output](/oss/javascript/langchain/structured-output)：现在可以从模型配置文件推断`ProviderStrategy` 支持（本机结构化输出）。
  * [⟦T51⟧ for ⟦T52⟧](/oss/javascript/langchain/middleware/custom#dynamic-prompt)：支持将`SystemMessage`实例直接传递给`createAgent`的`systemPrompt`参数，以及用于扩展系统消息的新`concat`方法。启用缓存控制和结构化内容块等高级功能。
  * [Dynamic system prompt middleware](/oss/javascript/langchain/short-term-memory)：`dynamicSystemPromptMiddleware` 的返回值现在纯粹是累加的。当返回 [⟦T58⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 或 `string` 时，它们会与现有系统消息合并而不是替换它们，从而更容易组合多个修改提示的中间件。* **兼容性改进：** 修复了结构化输出和工具模式中 Zod v4 验证错误的错误处理，确保正确显示详细的错误消息。
</Update>

<Update label="Oct 20, 2025">
  ## v1.0.0

  ### `langchain`

  * [Release notes](/oss/javascript/releases/langchain-v1)
  * [Migration guide](/oss/javascript/migrate/langchain-v1)

  ### `langgraph`

  * [Release notes](/oss/javascript/releases/langgraph-v1)
  * [Migration guide](/oss/javascript/migrate/langgraph-v1)

  <Callout icon="speakerphone">
    如果您遇到任何问题或有反馈，请[open an issue](https://github.com/langchain-ai/docs/issues/new?template=01-langchain.yml)以便我们改进。要查看 v0.x 文档，[go to the archived content](https://github.com/langchain-ai/langchainjs/tree/v0.3/docs/core_docs/docs)。
  </Callout>
</Update>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/releases/changelog.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>