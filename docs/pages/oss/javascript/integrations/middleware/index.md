<!-- langchain-docs: Middleware integrations | https://docs.langchain.com/oss/javascript/integrations/middleware/index -->

# Middleware integrations

Integrate with middleware using LangChain JavaScript.

Browse available middleware for different providers or contribute your own to the ecosystem. Learn more about how middleware works in the [middleware overview](/oss/javascript/langchain/middleware/overview) and how to use middleware with Deep Agents in the [Deep Agents docs](/oss/javascript/deepagents/customization#middleware).

## Share your middleware

Middleware enables context engineering, harness customization, and runtime safety controls. It is a useful extension point in LangChain and we love highlighting what the community builds with it:

<CardGroup>
  <Card title="Add an official integration" icon="package" href="/oss/javascript/contributing/implement-langchain#middleware">
    Follow the contributing guide to build and publish a middleware package.
  </Card>

  <Card title="Share a community middleware" icon="users" href="https://github.com/langchain-ai/docs">
    Open a PR to the docs repo to add your middleware to the table below.
  </Card>
</CardGroup>

## Official integrations

<div>
  | Provider                                                         | Middleware available | Source                                                                                                                                      | Downloads                                                                                                   |
  | :--------------------------------------------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- |
  | [`AWS middleware`](/oss/javascript/integrations/middleware/aws)  | Prompt caching       | [`langchain-ai/langchain-aws`](https://github.com/langchain-ai/langchain-aws)                                                               | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span> |
  | [`Anthropic`](/oss/javascript/integrations/middleware/anthropic) | Prompt caching       | [`langchain-ai/langchainjs`](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain/src/agents/middleware/provider/anthropic) | <span>N/A</span>                                                                                            |
</div>

## Community integrations

<Note>
  The community maintains these middleware integrations. They are contributed on an open-source basis and are not managed or maintained by LangChain.
</Note>

| Middleware                                                                            | Description                                                                                                                                                                                                        | Source                                                                                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [langchain-task-steering](https://github.com/edvinhallvaxhiu/langchain-task-steering) | Implicit state-machine middleware for ordered task pipelines with per-task tool scoping, dynamic prompt injection, and composable completion validation.                                                           | [`edvinhallvaxhiu/langchain-task-steering`](https://github.com/edvinhallvaxhiu/langchain-task-steering) |
| [Nuggets Authority](https://nuggets.life)                                             | Pre-execution authority enforcement for tool calls. Verifies a scoped, signed delegation before each tool runs, fails closed on deny, and emits an independently verifiable cryptographic proof of every decision. | [`NuggetsLtd/langchain-nuggets`](https://github.com/NuggetsLtd/langchain-nuggets)                       |

Have a middleware to share? [Open a PR](https://github.com/langchain-ai/docs) to add it here.

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/middleware/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>