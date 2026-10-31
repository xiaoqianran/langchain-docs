<!-- langchain-docs: Implement a LangChain integration | https://docs.langchain.com/oss/javascript/contributing/implement-langchain -->

# Implement a LangChain integration

Integration packages are Python packages that users can install for use in their projects. They implement one or more components that adhere to the LangChain interface standards.

LangChain components are subclasses of base classes in [`langchain-core`](https://github.com/langchain-ai/langchain/tree/master/libs/core). Examples include [chat models](/oss/javascript/integrations/chat), [tools](/oss/javascript/integrations/tools), [retrievers](/oss/javascript/integrations/retrievers), and more.

Your integration package will typically implement a subclass of at least one of these components. Expand the tabs below to see details on each.

> [tab] Chat Models
>
> Chat models are subclasses of the [`BaseChatModel`](https://reference.langchain.com/javascript/langchain-core/language_models/chat_models/BaseChatModel) class. They implement methods for generating chat completions, handling message formatting, and managing model parameters.
>
> > [!WARNING]
> >
> > The chat model integration guide is currently WIP. In the meantime, read the [chat model conceptual guide](/oss/javascript/langchain/models) for details on how LangChain chat models function. You may also refer to existing integrations in the [LangChain repo](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers)

> [tab] Embeddings
>
> Embedding models are subclasses of the [`Embeddings`](https://reference.langchain.com/javascript/langchain-core/embeddings/Embeddings) class.
>
> > [!WARNING]
> >
> > The embedding model integration guide is currently WIP. In the meantime, read the [embedding model conceptual guide](/oss/javascript/integrations/embeddings) for details on how LangChain embedding models function.

> [tab] Tools
>
> Tools are used in 2 main ways:
>
> 1. To define an "input schema" or "args schema" to pass to a chat model's tool calling feature along with a text request, such that the chat model can generate a "tool call", or parameters to call the tool with.
> 2. To take a "tool call" as generated above, and take some action and return a response that can be passed back to the chat model as a ToolMessage.
>
> The Tools class must inherit from the [`BaseTool`](https://reference.langchain.com/javascript/langchain-core/tools/StructuredTool) base class. This interface has 3 properties and 2 methods that should be implemented in a subclass.
>
> > [!WARNING]
> >
> > The tools integration guide is currently WIP. In the meantime, read the [tools conceptual guide](/oss/javascript/langchain/tools) for details on how LangChain tools function.

> [tab] Middleware
>
> [Middleware](/oss/javascript/langchain/middleware/overview) lets you customize agent behavior by hooking into model calls, tool calls, and agent lifecycle events. Middleware classes subclass the [`AgentMiddleware`](https://reference.langchain.com/javascript/langchain/index/AgentMiddleware) base class.
>
> Read the [custom middleware guide](/oss/javascript/langchain/middleware/custom) to understand hooks, state updates, and middleware patterns before building an integration.
>
> Middleware integrations typically fall into two categories:
>
> | Type | Description | Examples |
> | - | - | - |
> | **Provider-specific** | Leverages a provider's unique capabilities | Prompt caching, native tool execution, content moderation |
> | **Cross-provider** | Works with any model or tool | Rate limiting, PII detection, logging, guardrails |
>
> Provider-specific middleware lives in the provider's integration package (for example `langchain-anthropic`). Cross-provider middleware can be published as a standalone package.
>
> You can also use these existing middleware integrations as reference:
>
> > [card] [Anthropic middleware](/oss/javascript/integrations/middleware/anthropic)
> >
> > Multiple middleware classes for prompt caching, tools, memory, and file search.
>
> > [card] [Custom middleware guide](/oss/javascript/langchain/middleware/custom)
> >
> > Full reference for hooks, state updates, and patterns.

> [tab] Checkpointers
>
> Checkpointers enable [persistence](/oss/javascript/langgraph/persistence) in LangGraph, allowing agents to save and resume state across interactions.
>
> See existing checkpointer integrations in the [LangGraph repo](https://github.com/langchain-ai/langgraph/tree/main/libs) for implementation examples.

> [tab] Sandboxes
>
> Sandbox integrations enable [Deep Agents](/oss/javascript/deepagents/overview) to run code in isolated environments.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/implement-langchain.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).