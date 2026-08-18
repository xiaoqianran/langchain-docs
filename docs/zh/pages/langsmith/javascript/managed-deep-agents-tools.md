<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom tools to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-tools -->

# 将自定义工具添加到托管Deep Agents

托管 Deep Agents 支持 Deep Agents `tools` 配置界面。



在您的项目中定义LangChain工具，将它们导入到`agent.ts`中，然后将它们传递给`defineDeepAgent`。


要从远程 MCP 服务器加载工具，请使用 [MCP connector](/langsmith/javascript/managed-deep-agents-mcp-connectors)。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将代理入口点保留在项目根目录，并在`tools/`下编写工具：



```text
my-agent/
  agent.ts
  tools/
    customer.ts
```


## 添加创作工具

使用编写的工具来处理业务逻辑、私有 API、数据库访问以及属于代理项目的其他代码。托管 Deep Agents 将源代码复制到已编译的版本中，并将工具传递给 Deep Agents。

有关LangChain工具定义的更多信息，请参阅[Tools](/oss/javascript/langchain/tools)。

## 添加工具模块



```ts tools/customer.ts
import { tool } from "langchain";
import { z } from "zod";

export const lookupCustomer = tool(
  async ({ customerId }) => `Customer ${customerId} is on the enterprise plan.`,
  {
    name: "lookup_customer",
    description: "Look up a customer record by ID.",
    schema: z.object({
      customerId: z.string().describe("Customer ID from the CRM."),
    }),
  },
);
```


## 将工具附加到代理

将工具导入到项目根代理条目中，并将它们传递到`tools`列表中。



```ts agent.ts
import { defineDeepAgent } from "managed-deepagents";

import { lookupCustomer } from "./tools/customer";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-5.5",
  tools: [lookupCustomer],
});
```


`mda dev` 和 `mda deploy` 将项目文件复制到已编译的版本中。



您的导入工作方式应该与在普通本地 TypeScript 项目中的工作方式相同。


使用清晰、独特的工具名称以避免冲突。

## 人机交互在敏感工具调用之前暂停代理，以便人们可以批准、编辑或拒绝它们。



在代理定义中设置 `interruptOn`，并可选择设置 `permissions` 以控制工具和文件系统访问。




```ts agent.ts
import { defineDeepAgent } from "managed-deepagents";

import { lookupCustomer } from "./tools/customer";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-5.5",
  tools: [lookupCustomer],
  interruptOn: {
    lookup_customer: true,
  },
});
```




`interruptOn` 字段应用与 LangChain 的 [human-in-the-loop middleware](/oss/javascript/langchain/guardrails#human-in-the-loop) 相同的中断行为。


有关决策类型（批准、编辑、拒绝）、条件中断和权限规则，请参阅 Deep Agents [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop) 和 [Permissions](/oss/javascript/deepagents/permissions) 指南。

### 响应中断

当运行遇到中断时，它会暂停并等待人类响应，然后再继续。

- **在本地开发期间**，`mda dev` 在 LangSmith Studio 中运行代理，它会显示中断，以便您可以检查挂起的工具调用并恢复运行。

- **在已部署的代理上**，通过 LangGraph 服务器 API 使用恢复负载恢复暂停的运行。参见[Human-in-the-loop using server API](/langsmith/add-human-in-the-loop)。


<Note>
在公开测试期间，托管 Deep Agents 是 CLI 优先，并且尚未记录编程调用。要从您自己的应用程序以编程方式恢复运行，请联系您的 LangChain 团队。
</Note>

人机交互需要持久的线程状态来暂停和恢复。托管运行时拥有检查指针，因此不需要额外的设置。

## 使用秘密和上下文工具可以从环境变量中读取部署机密。将`mda dev`的本地值放入`.env`； `mda deploy` 将非保留的 `.env` 值作为托管部署机密转发。

对于每次运行的值（例如请求元数据或功能标志），请使用工具的正常 LangChain 运行时上下文模式。参见[how to access context from within your tools](/oss/javascript/langchain/tools#access-context)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>