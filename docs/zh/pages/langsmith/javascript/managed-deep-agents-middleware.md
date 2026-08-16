<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom middleware to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-middleware -->

# 将自定义中间件添加到托管Deep Agents

托管Deep Agents支持正常的Deep Agents`middleware`配置界面。



将LangChain中间件添加到`defineDeepAgent`以监视工具调用、添加护栏、编辑数据、重试瞬时故障或自定义模型调用。


<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将代理入口点保留在项目根目录并将自定义中间件保留在`middleware/`下：



```text
my-agent/
  agent.ts
  middleware/
    audit.ts
```


托管运行时仍然拥有 `backend`、`store`、`checkpointer`、`memory`、`skills` 和系统提示符。中间件应该关注围绕模型调用、工具调用和生命周期挂钩的代理行为。

有关更深入的钩子、状态和上下文详细信息，请参阅[custom middleware](/oss/javascript/langchain/middleware/custom)。

## 使用预构建的中间件

您可以直接在代理定义中使用LangChain [prebuilt middleware](/oss/javascript/langchain/middleware/built-in)。



```ts agent.ts
import { defineDeepAgent } from "managed-deepagents";
import { modelCallLimitMiddleware, piiMiddleware } from "langchain";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-5.5",
  middleware: [
    piiMiddleware("email", { strategy: "redact", applyToInput: true }),
    modelCallLimitMiddleware({ runLimit: 50 }),
  ],
});
```


中间件是横切行为的正确场所，例如 PII 处理、速率限制、重试策略、模型回退、动态模型选择和工具调用监控。


## 添加自定义中间件模块

对于更高级的选项，您还可以定义[custom middleware](/oss/javascript/langchain/middleware/custom)。



```ts middleware/audit.ts
import { createMiddleware } from "langchain";

export const logToolCalls = createMiddleware({
  name: "LogToolCalls",
  wrapToolCall: async (request, handler) => {
    console.log(`Calling tool: ${request.toolCall.name}`);
    const result = await handler(request);
    console.log(`Finished tool: ${request.toolCall.name}`);
    return result;
  },
});
```



将中间件导入项目根代理条目并将其传递到`middleware`列表中。



```ts agent.ts
import { defineDeepAgent } from "managed-deepagents";

import { logToolCalls } from "./middleware/audit";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-5.5",
  middleware: [logToolCalls],
});
````mda dev` 和 `mda deploy` 将项目文件复制到已编译的版本中。



您的中间件导入的工作方式应该与普通本地 TypeScript 项目中的工作方式相同。


## 使用运行时上下文

中间件可以通过正常的 LangChain 运行时 API 读取每次运行的上下文。使用用户 ID、组织 ID、功能标志、请求元数据或默认情况下不应成为模型提示一部分的凭据的上下文。

例如，请参阅[Custom middleware](/oss/javascript/langchain/middleware/custom)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-middleware.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>