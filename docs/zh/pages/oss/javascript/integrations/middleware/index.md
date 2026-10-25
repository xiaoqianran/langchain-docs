<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/javascript/integrations/middleware/index -->

# 中间件集成

使用 LangChain JavaScript 与中间件集成。

浏览不同提供商的可用中间件或为生态系统贡献自己的中间件。详细了解中间件在 [middleware overview](/oss/javascript/langchain/middleware/overview) 中的工作原理以及如何在 [Deep Agents docs](/oss/javascript/deepagents/customization#middleware) 中将中间件与 Deep Agents 一起使用。

## 分享你的中间件

中间件支持上下文工程、线束定制和运行时安全控制。它是 LangChain 中的一个有用的扩展点，我们喜欢强调社区用它构建的内容：

> **[Add an official integration](/oss/javascript/contributing/implement-langchain#middleware)**
>
> 按照贡献指南构建和发布中间件包。

> **[Share a community middleware](https://github.com/langchain-ai/docs)**
>
> 打开文档存储库的 PR，将您的中间件添加到下表中。

## 官方集成|供应商|可用的中间件 |来源 |下载 |
| :-| :-| :-| :-|
| [⟦T0⟧](/oss/javascript/integrations/middleware/aws) |提示缓存 | [⟦T1⟧](https://github.com/langchain-ai/langchain-aws) | [  ⟦T12⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T2⟧](https://github.com/contactkontey-dotcom/langchain-brydge#readme) |监督代理工具与 BRYDGE 的调用，并检查目标系统自己的记录，以报告每个操作是否在允许的情况下发生。 | [⟦T3⟧](https://github.com/contactkontey-dotcom/langchain-brydge) | [  ⟦T13⟧](https://www.npmjs.com/package/brydge-langchain) |
| [⟦T4⟧](https://recallmem.dev/guides/langchain) | create\_agent 代理的长期记忆：将 Recall 了解到的有关用户的信息添加到系统提示中并记录每次交换。 | [⟦T5⟧](https://github.com/recallmem/recall) | [  ⟦T14⟧](https://www.npmjs.com/package/@recall-memory/sdk) |
| [⟦T6⟧](https://recallmem.dev/guides/langchain) |聊天消息历史记录存储在 Recall 会话中，因此 Recall 还可以从中了解用户。 | [⟦T7⟧](https://github.com/recallmem/recall) | [  ⟦T15⟧](https://www.npmjs.com/package/@recall-memory/langchain) |
| [⟦T8⟧](/oss/javascript/integrations/middleware/anthropic) |提示缓存 | [⟦T9⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain/src/agents/middleware/provider/anthropic) |不适用 |

## 社区整合

> [!注意]
>
> 社区维护这些中间件集成。它们是在开源基础上贡献的，不由 LangChain 管理或维护。|中间件|描述 |来源 |
| - | - | - |
| [langchain-task-steering](https://github.com/edvinhallvaxhiu/langchain-task-steering) |用于有序任务管道的隐式状态机中间件，具有每个任务工具范围、动态提示注入和可组合完成验证。 | [⟦T10⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) |
| [Nuggets Authority](https://nuggets.life) |工具调用的预执行权限强制执行。在每个工具运行之前验证范围内的、签名的委托，拒绝失败时关闭，并为每个决定发出独立可验证的加密证明。 | [⟦T11⟧](https://github.com/NuggetsLtd/langchain-nuggets) |

有中间件可以分享吗？ [Open a PR](https://github.com/langchain-ai/docs) 将其添加到此处。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/middleware/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。