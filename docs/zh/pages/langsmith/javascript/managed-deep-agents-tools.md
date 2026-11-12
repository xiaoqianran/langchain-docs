<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom tools to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-tools -->

# 将自定义工具添加到托管Deep Agents

为托管深度代理项目定义创作工具。

Custom tools are application code the agent can call for fetching real-time data, querying databases, executing code, and taking actions.与 [instructions](/langsmith/javascript/managed-deep-agents-instructions) 和 [skills](/langsmith/javascript/managed-deep-agents-skills) 不同，MDA 不会自动发现它们。

To load tools from a remote MCP server, see [Connect to MCP servers](/langsmith/javascript/managed-deep-agents-mcp-connectors).

> [!注意]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud) and [Bring Your Own Cloud (BYOC)](/langsmith/byoc).使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。

Put authored tools under `tools/`, import them into the agent entry, and pass them to the agent definition:

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
  tools/
    customer.ts
```

完整的项目布局请参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

To load tools from a remote MCP server without importing them into the agent entry, use an [MCP connector](/langsmith/javascript/managed-deep-agents-mcp-connectors) instead.

MCP connectors are declared under `tools/` as well, so the `tools/mcp.ts` file name is reserved for that declaration.

## 添加工具

Use authored tools for business logic, private APIs, database access, and other code that belongs in your agent project.

**1.定义工具模块**

```ts tools/customer.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

Use clear, unique tool names to avoid collisions. For more about LangChain tool definitions, see [Tools](/oss/javascript/langchain/tools).

**2.将工具附加到代理**将工具导入到项目根代理条目中并将其传递到`tools`列表中：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

import { lookupCustomer } from "./tools/customer";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-6.1-sol",
  tools: [lookupCustomer],
});
```

您的导入工作方式应该与在普通本地 TypeScript 项目中的工作方式相同。

**3.添加人机交互（可选）**

在敏感工具调用之前暂停代理，以便人们可以批准、编辑或拒绝它们。

在代理定义中设置`interruptOn`，并可以选择设置`permissions`来控制工具和文件系统访问：

```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";

import { lookupCustomer } from "./tools/customer";

export const agent = defineDeepAgent({
  name: "support-agent",
  model: "openai:gpt-6.1-sol",
  tools: [lookupCustomer],
  interruptOn: {
    lookup_customer: true,
  },
});
```

`interruptOn` 字段应用与 LangChain 的 [human-in-the-loop middleware](/oss/javascript/langchain/guardrails#human-in-the-loop) 相同的中断行为。

有关决策类型（批准、编辑、拒绝）、条件中断和权限规则，请参阅 Deep Agents [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop) 和 [Permissions](/oss/javascript/deepagents/permissions) 指南。

要恢复暂停的运行，请参阅[Respond to an interrupt](#respond-to-an-interrupt)。

要在 Slack 中暂停您自己的工具帖子的表单，请参阅 [Agent-owned interrupts](/langsmith/javascript/managed-deep-agents-agent-owned-interrupts)。

有关暂停营销活动更改以获得 Slack 批准的完整项目，请参阅 [paid media agent template](/langsmith/javascript/managed-deep-agents-paid-media-agent)。

## 使用秘密和上下文

工具从环境变量中读取固定配置，例如区域或端点 URL。将 `mda dev` 的本地值放入 `.env` 中。 `mda deploy` 将非保留的 `.env` 值作为托管部署机密转发。相反，凭证属于 [connection](/langsmith/javascript/managed-deep-agents-connections)。连接将值保留在您的 LangSmith 工作区而不是项目中。它还可以为每个调用者解析不同的凭据。参见[Use tools that require authentication](#use-tools-that-require-authentication)。

有关每次运行的值，例如请求元数据或功能标志，请参阅 [Access runtime context](#access-runtime-context)。

## 部署

`mda dev`和`mda deploy`将项目文件复制到已编译的版本中，包括`tools/`下的模块。工具未同步到 Context Hub；他们附带代理代码。

## 何时使用工具

|概念 |亲切 |它如何到达代理|
| - | - | - |
| **工具** |申请代码|导入并传入代理定义 |
| **[MCP connectors](/langsmith/javascript/managed-deep-agents-mcp-connectors)** |托管配置|在MCP模块中`tools/`下声明；没有导入到代理条目|
| **[Skills](/langsmith/javascript/managed-deep-agents-skills)** |托管上下文 |代理在相关时加载的程序 |
| **[Instructions](/langsmith/javascript/managed-deep-agents-instructions)** |托管上下文 |永远在线的系统提示 |

欲了解更多信息，请参阅[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 响应中断

当运行遇到中断时，它会暂停并等待人类响应，然后再继续。

* **During local development**, `mda dev` runs the agent in LangSmith Studio, which surfaces the interrupt so you can inspect the pending tool call and resume the run.* **在已部署的代理上**，通过代理服务器 API 使用恢复负载恢复暂停的运行。参见[Human-in-the-loop using server API](/langsmith/add-human-in-the-loop)。

人机交互需要持久的线程状态来暂停和恢复。托管运行时拥有检查指针，因此不需要额外的设置。

## 使用需要身份验证的工具

如果工具需要 API 密钥或 OAuth 令牌，请在运行时使用 [connection](/langsmith/javascript/managed-deep-agents-connections) 进行解析。 `connections.get(...)` 采用连接 slug 和凭证所有者，并将凭证作为字符串返回。

第二个参数选择所有者。传递 `{"type": "agent"}` 以获得整个部署共享的一个凭证，例如团队搜索密钥。传递`{"type": "user"}`作为呼叫者自己的凭证，因此代理充当他们的角色。欲了解更多信息，请参阅[Choose a credential owner](/langsmith/javascript/managed-deep-agents-connections#choose-a-credential-owner)。

该工具解析调用者自己的 GitHub 凭证：

```ts tools/get-github-user.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { connections } from "managed-deepagents";
import { z } from "zod";

export const getGitHubUser = tool(
  async () => {
    // Replace `frontend-github` with the name of your connection.
    const accessToken = await connections.get("frontend-github", { type: "user" });
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub request failed with status ${response.status}`);
    }
    const user = (await response.json()) as { login: string };
    return user.login;
  },
  {
    name: "get_github_user",
    description: "Get the authenticated caller's GitHub login.",
    schema: z.object({}),
  },
);
```

用户拥有的连接需要每个调用者的授权。未授权服务的人的第一次运行会在[⟦T24⟧ interrupt](/langsmith/javascript/managed-deep-agents-connections#handle-the-authorization-interrupt) 上暂停。 Slack 和 LangSmith Studio 为调用者完成该中断。

使用 `mda connections create` 创建连接本身。创建模式、本地开发、授权中断请参见[Manage connections](/langsmith/javascript/managed-deep-agents-connections)。

## 访问运行时上下文对于每次运行的值（例如请求元数据或功能标志），请使用工具的正常 LangChain 运行时上下文模式。参见[how to access context from within your tools](/oss/javascript/langchain/tools#access-context)。

Managed Deep Agents 添加的调用者、通道和沙箱字段，请参阅[Runtime](/langsmith/javascript/managed-deep-agents-runtime)。

要从工具读取或写入线程沙箱中的文件，请使用`runtime.backend`。参见[Read and write sandbox files from code](/langsmith/javascript/managed-deep-agents-sandboxes#read-and-write-sandbox-files-from-code)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。