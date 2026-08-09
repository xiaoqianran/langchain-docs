<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Implement a LangChain integration | https://docs.langchain.com/oss/javascript/contributing/implement-langchain -->

# 实现LangChain集成

集成包是用户可以安装以在其项目中使用的 Python 包。他们实现了一个或多个符合 LangChain 接口标准的组件。

LangChain组件是[⟦T0⟧](https://github.com/langchain-ai/langchain/tree/master/libs/core)中基类的子类。示例包括 [chat models](/oss/javascript/integrations/chat)、[tools](/oss/javascript/integrations/tools)、[retrievers](/oss/javascript/integrations/retrievers) 等。

您的集成包通常会实现至少其中一个组件的子类。展开下面的选项卡可查看每个选项卡的详细信息。

<Tabs>
  <Tab title="Chat Models">
    聊天模型是 [⟦T1⟧](https://reference.langchain.com/javascript/langchain-core/language_models/chat_models/BaseChatModel) 类的子类。它们实现了生成聊天完成、处理消息格式和管理模型参数的方法。

    <Warning>
      聊天模型集成指南目前正在开发中。同时，请阅读[chat model conceptual guide](/oss/javascript/langchain/models)了解LangChain聊天模型如何运作的详细信息。您还可以参考[LangChain repo](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers)中的现有集成
    </Warning>
  </Tab>

  <Tab title="Embeddings">
    嵌入模型是 [⟦T2⟧](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings) 类的子类。

    <Warning>
      嵌入模型集成指南目前正在开发中。同时，请阅读[embedding model conceptual guide](/oss/javascript/integrations/embeddings)了解LangChain嵌入模型如何运作的详细信息。
    </Warning>
  </Tab>

  <Tab title="Tools">
    工具的使用主要有两种方式：1. 定义“输入模式”或“参数模式”以与文本请求一起传递到聊天模型的工具调用功能，以便聊天模型可以生成“工具调用”或用于调用工具的参数。
    2. 进行上面生成的“工具调用”，并采取一些操作并返回一个响应，该响应可以作为 ToolMessage 传递回聊天模型。

    Tools 类必须继承自 [⟦T3⟧](https://reference.langchain.com/javascript/classes/_langchain_core.tools.StructuredTool.html) 基类。该接口有 3 个属性和 2 个方法，应在子类中实现。

    <Warning>
      工具集成指南目前正在开发中。同时，请阅读[tools conceptual guide](/oss/javascript/langchain/tools)详细了解LangChain工具的功能。
    </Warning>
  </Tab>

  <Tab title="Middleware">
    [Middleware](/oss/javascript/langchain/middleware/overview) 允许您通过挂钩模型调用、工具调用和代理生命周期事件来自定义代理行为。中间件类是 [⟦T4⟧](https://reference.langchain.com/javascript/langchain/index/AgentMiddleware) 基类的子类。

    在构建集成之前，请阅读 [custom middleware guide](/oss/javascript/langchain/middleware/custom) 了解挂钩、状态更新和中间件模式。

    中间件集成通常分为两类：|类型 |描述 |示例 |
    | -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
    | **特定于提供商** |利用提供商的独特能力 |提示缓存、本机工具执行、内容审核 |
    | **跨提供商** |适用于任何模型或工具 |速率限制、PII 检测、日志记录、护栏 |

    特定于提供商的中间件位于提供商的集成包中（例如`langchain-anthropic`）。跨提供商中间件可以作为独立包发布。

    您还可以使用这些现有的中间件集成作为参考：

    <CardGroup>
      <Card title="Anthropic middleware" icon="robot" href="/oss/javascript/integrations/middleware/anthropic">
        用于提示缓存、工具、内存和文件搜索的多个中间件类。
      </Card>

      <Card title="Custom middleware guide" icon="code" href="/oss/javascript/langchain/middleware/custom">
        有关挂钩、状态更新和模式的完整参考。
      </Card>
    </CardGroup>
  </Tab>

  <Tab title="Checkpointers">
    检查点在 LangGraph 中启用[persistence](/oss/javascript/langgraph/persistence)，允许代理在交互过程中保存和恢复状态。请参阅 [LangGraph repo](https://github.com/langchain-ai/langgraph/tree/main/libs) 中现有的检查点集成以获取实施示例。
  </Tab>

  <Tab title="Sandboxes">
    沙盒集成使 [Deep Agents](/oss/javascript/deepagents/overview) 能够在隔离环境中运行代码。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/implement-langchain.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>