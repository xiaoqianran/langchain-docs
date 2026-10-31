<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/javascript/integrations/middleware/index -->

# Middleware integrations

Integrate with middleware using LangChain JavaScript.

Browse available middleware for different providers or contribute your own to the ecosystem. Learn more about how middleware works in the [middleware overview](/oss/javascript/langchain/middleware/overview) and how to use middleware with Deep Agents in the [Deep Agents docs](/oss/javascript/deepagents/customization#middleware).

## Share your middleware

Middleware enables context engineering, harness customization, and runtime safety controls. It is a useful extension point in LangChain and we love highlighting what the community builds with it:

> [card] [Add an official integration](/oss/javascript/contributing/implement-langchain#middleware)
>
> Follow the contributing guide to build and publish a middleware package.

> [card] [Share a community middleware](https://github.com/langchain-ai/docs)
>
> Open a PR to the docs repo to add your middleware to the table below.

## Official integrations

| Provider | Middleware available | Source | Downloads |
| :- | :- | :- | :- |
| [`AWS middleware`](/oss/javascript/integrations/middleware/aws) | Prompt caching | [`langchain-ai/langchain-aws`](https://github.com/langchain-ai/langchain-aws) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/aws?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/aws) |
| [`RecallMiddleware`](https://recallmem.dev/guides/langchain) | Long-term memory for create\_agent agents: adds what Recall learned about the user to the system prompt and records each exchange. | [`recallmem/recall`](https://github.com/recallmem/recall) | [  ![Downloads per month](https://img.shields.io/npm/dm/@recall-memory/sdk?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@recall-memory/sdk) |
| [`BrydgeMiddleware`](https://github.com/contactkontey-dotcom/langchain-brydge#readme) | Supervises an agent's tool calls with BRYDGE and checks the destination system's own records to report whether each action happened as permitted. | [`contactkontey-dotcom/langchain-brydge`](https://github.com/contactkontey-dotcom/langchain-brydge) | [  ![Downloads per month](https://img.shields.io/npm/dm/brydge-langchain?style=flat-square\&label=%20&)](https://www.npmjs.com/package/brydge-langchain) |
| [`RecallChatMessageHistory`](https://recallmem.dev/guides/langchain) | Chat message history stored in a Recall session, so Recall also learns about the user from it. | [`recallmem/recall`](https://github.com/recallmem/recall) | [  ![Downloads per month](https://img.shields.io/npm/dm/@recall-memory/langchain?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@recall-memory/langchain) |
| [`RuthlessSchemaGuard`](https://github.com/moltbot-den/openentity/tree/main/integrations/langchain) | Agent middleware that validates tool and HTTP responses against Pydantic or JSON Schema and raises on violations. | [`moltbot-den/openentity`](https://github.com/moltbot-den/openentity/tree/main/integrations/langchain) | [  ![Downloads per month](https://img.shields.io/npm/dm/@openentity/langchain?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@openentity/langchain) |
| [`Anthropic`](/oss/javascript/integrations/middleware/anthropic) | Prompt caching | [`langchain-ai/langchainjs`](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain/src/agents/middleware/provider/anthropic) | N/A |

## Community integrations

> [!NOTE]
>
> The community maintains these middleware integrations. They are contributed on an open-source basis and are not managed or maintained by LangChain.

| Middleware | Description | Source |
| - | - | - |
| [langchain-task-steering](https://github.com/edvinhallvaxhiu/langchain-task-steering) | Implicit state-machine middleware for ordered task pipelines with per-task tool scoping, dynamic prompt injection, and composable completion validation. | [`edvinhallvaxhiu/langchain-task-steering`](https://github.com/edvinhallvaxhiu/langchain-task-steering) |
| [Nuggets Authority](https://nuggets.life) | Pre-execution authority enforcement for tool calls. Verifies a scoped, signed delegation before each tool runs, fails closed on deny, and emits an independently verifiable cryptographic proof of every decision. | [`NuggetsLtd/langchain-nuggets`](https://github.com/NuggetsLtd/langchain-nuggets) |

Have a middleware to share? [Open a PR](https://github.com/langchain-ai/docs) to add it here.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/middleware/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).