<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/javascript/integrations/middleware/index -->

# 中间件集成

使用 LangChain JavaScript 与中间件集成。

浏览不同提供商的可用中间件或为生态系统贡献自己的中间件。详细了解中间件在 [middleware overview](/oss/javascript/langchain/middleware/overview) 中的工作原理以及如何在 [Deep Agents docs](/oss/javascript/deepagents/customization#middleware) 中将中间件与 Deep Agents 一起使用。

## 分享你的中间件

中间件支持上下文工程、线束定制和运行时安全控制。它是 LangChain 中的一个有用的扩展点，我们喜欢强调社区用它构建的内容：

<CardGroup>
  <Card title="Add an official integration" icon="package" href="/oss/javascript/contributing/implement-langchain#middleware">
    按照贡献指南构建和发布中间件包。
  </Card>

  <Card title="Share a community middleware" icon="users" href="https://github.com/langchain-ai/docs">
    打开文档存储库的 PR，将您的中间件添加到下表中。
  </Card>
</CardGroup>

## 官方集成<div>
  |供应商|可用的中间件 |来源 |下载 |
  | :---------------------------------------------------------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
  | [⟦T0⟧](/oss/javascript/integrations/middleware/aws) |提示缓存 | [⟦T1⟧](https://github.com/langchain-ai/langchain-aws) | <span><a href="https://www.npmjs.com/package/@langchain/aws"><img alt="Downloads per month" /></a></span> |
  | [⟦T2⟧](/oss/javascript/integrations/middleware/anthropic) |提示缓存 | [⟦T3⟧](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain/src/agents/middleware/provider/anthropic) | <span>N/A</span> |
</div>

## 社区整合

<Note>
  社区维护这些中间件集成。它们是在开源基础上贡献的，不由 LangChain 管理或维护。
</Note>|中间件|描述 |来源 |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [langchain-task-steering](https://github.com/edvinhallvaxhiu/langchain-task-steering) |用于有序任务管道的隐式状态机中间件，具有每个任务工具范围、动态提示注入和可组合完成验证。                                                           | [⟦T4⟧](https://github.com/edvinhallvaxhiu/langchain-task-steering) || [Nuggets Authority](https://nuggets.life) |工具调用的预执行权限强制执行。在每个工具运行之前验证范围内的、签名的委托，拒绝时失败，并为每个决定发出独立可验证的加密证明。 | [⟦T5⟧](https://github.com/NuggetsLtd/langchain-nuggets) |

有中间件可以分享吗？ [Open a PR](https://github.com/langchain-ai/docs) 将其添加到此处。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/middleware/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>