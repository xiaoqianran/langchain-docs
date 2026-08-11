<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Define a Managed Deep Agent | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-agent-definition -->

# 定义一个托管深度代理

配置托管深度代理的模型和核心功能。

代理定义选择托管深度代理的模型和核心功能。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

代理条目位于项目根目录：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
```

将代理定义导出为名为 `agent`。您也可以使用`agent.tsx`。

## 定义一个代理

使用`defineDeepAgent`：

<CodeGroup>
  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "openai:gpt-5.5",
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "anthropic:claude-sonnet-4-6",
  });
  ```

  ```ts Google Gemini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "google-genai:gemini-3.6-flash",
  });
  ```
</CodeGroup>|参数|它有什么作用 |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| [⟦T12⟧](#name) |设置代理和默认部署名称 |
| [⟦T13⟧](#model) |选择聊天模式 |
| [⟦T14⟧](#tools) |添加代理可以调用​​的工具 |
| [⟦T15⟧](#middleware) |添加有关模型调用、工具调用和代理生命周期的行为 |
| [⟦T16⟧](#subagents) |为委派任务定义专门代理 |
| [⟦T17⟧](#permissions) |控制文件系统工具的路径级访问
| [⟦T18⟧](#human-in-the-loop) |在选定的工具需要人工批准之前暂停 |
| [⟦T19⟧](#structured-output) |定义结构化输出模式 |

## 姓名

需要`name`。传递以字母开头且仅包含字母、数字、下划线或连字符的静态字符串，例如 `"research-assistant"`。MDA 使用该名称作为 LangGraph 助手 ID 和默认的 LangSmith 部署名称。您可以使用 `mda deploy --name` 覆盖部署名称，而无需更改代理定义。

## 型号

将 `model` 设置为代理使用的聊天模型。最简单的选项是 `provider:model` 字符串。将提供商的 API 密钥添加到 `.env`，以便模型在本地和部署中运行。

<CodeGroup>
  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "openai:gpt-5.5",
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "anthropic:claude-sonnet-4-6",
  });
  ```

  ```ts Google Gemini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { defineDeepAgent } from "managed-deepagents";

  export const agent = defineDeepAgent({
    name: "research-assistant",
    model: "google-genai:gemini-3.6-flash",
  });
  ```
</CodeGroup>

当您需要在代码中配置模型参数时，请传递LangChain聊天模型实例。有关型号选项和支持的提供程序，请参阅[Models](/oss/javascript/deepagents/models)。

### 使用LangSmith网关

您可以使用 [LangSmith Gateway](langsmith/llm-gateway) 来控制速率限制、回退等。

为了使用，您应该：

* 直接使用ChatOpenAI模型
* 设置基本url为`https://gateway.smith.langchain.com/v1`
* 将环境变量 `LANGSMITH_GATEWAY_API_KEY` 设置为您的 LangSmith API 密钥。

这应该看起来像（说明性的）：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineDeepAgent } from "managed-deepagents";
import { ChatOpenAI } from "@langchain/openai";

const apiKey =
  process.env.LANGSMITH_GATEWAY_API_KEY ?? "missing-langsmith-gateway-api-key";
const baseURL = "https://gateway.smith.langchain.com/v1";

export const agent = defineDeepAgent({
  name: "my-agent",
  model: new ChatOpenAI({
    model: "moonshotai/Kimi-K3",
    apiKey,
    configuration: { baseURL },
  }),
});
```

<Note>
  使用网关时，模型段应为`provider/model-name`。不使用网关时，通常为`provider:model-name`
</Note>

为了让您的项目从一开始就使用 Gateway，您可以在初始化代理时传递 `--gateway` 标志：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mda init my-agent --gateway
```

## 工具

传递`tools`数组中的工具，让代理调用应用程序逻辑或外部服务。在本地模块中定义工具，将它们导入到代理条目中，并将它们添加到定义中。参见[Custom tools](/langsmith/javascript/managed-deep-agents-tools)。要从远程 MCP 服务器添加工具而不将其导入代理条目，请使用 [MCP connectors](/langsmith/javascript/managed-deep-agents-mcp-connectors)。

## 中间件

在 `middleware` 数组中传递中间件，以添加有关模型调用、工具调用和代理生命周期的行为。中间件按数组顺序运行。

参见[Custom middleware](/langsmith/javascript/managed-deep-agents-middleware)。

## 子代理

当代理应该委托专门的或上下文繁重的工作时，在 `subagents` 中传递子代理定义。每个子代理可以有自己的提示、模型和工具。参见[Subagents](/oss/javascript/deepagents/subagents)。

## 权限

在`permissions`中传递文件系统权限规则来控制代理的内置文件系统工具可以读取或写入哪些路径。参见[Permissions](/oss/javascript/deepagents/permissions)。

## 人机交互

设置 `interruptOn` 在所选工具调用之前暂停。

将此用于需要人员在呼叫运行之前批准、编辑或拒绝呼叫的操作。参见[Human-in-the-loop](/langsmith/javascript/managed-deep-agents-tools#human-in-the-loop)。

## 结构化输出

当代理必须返回与模式匹配的数据而不是不受约束的文本响应时，设置`responseFormat`。

参见[Structured output](/oss/javascript/langchain/structured-output)。

通过项目文件而不是代理定义来配置系统提示、技能、内存、沙箱、身份、通道和计划。参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-agent-definition.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>