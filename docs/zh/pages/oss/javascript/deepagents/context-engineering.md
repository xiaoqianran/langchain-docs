<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context engineering in Deep Agents | https://docs.langchain.com/oss/javascript/deepagents/context-engineering -->

# Deep Agents 中的上下文工程

控制深度代理可以访问的上下文以及如何在长时间运行的任务中管理它

上下文工程以正确的格式提供正确的信息和工具，以便您的深度代理能够可靠地完成任务。

深度代理可以访问多种上下文。
一些资源在启动时提供给代理；其他的在运行时变得可用，例如用户输入。
深度代理包括用于管理长时间运行的会话中的上下文的内置机制。

此页面概述了您的深度代理可以访问和管理的不同类型的上下文。

<Tip>
  环境工程新手？请参阅[conceptual overview](/oss/javascript/concepts/context)了解不同类型的上下文以及何时使用它们。
</Tip>

## 上下文类型|上下文类型 |你控制什么 |范围 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| **[Input context](#input-context)** |代理启动时的提示包含哪些内容（系统提示、内存、技能） |静态，每次运行均应用 |
| **[Runtime context](#runtime-context)** |调用时传递的静态配置（用户元数据、API 密钥、连接）|每次运行，传播到子代理 |
| **[Context compression](#context-compression)** |内置卸载和汇总，将上下文保持在窗口限制内 |当接近极限时自动 |
| **[Context isolation](#context-isolation-with-subagents)** |使用子代理隔离繁重的工作，仅将结果返回给主代理 |每个子代理，当被委托时 |
| **[Long-term memory](#long-term-memory)** |使用虚拟文件系统跨线程持久存储|对话中持续存在 |

## 输入上下文输入上下文是在启动时提供给深度代理的信息，该信息成为其系统提示的一部分。最终的提示由几个来源组成：

<CardGroup>
  <Card title="System prompt" icon="message-2" href="#system-prompt">
    您提供的自定义说明以及内置代理指导。
  </Card>

  <Card title="Memory" icon="database" href="#memory">
    配置时始终加载持久 `AGENTS.md` 文件。
  </Card>

  <Card title="Skills" icon="tool" href="#skills">
    相关时加载按需功能（渐进式披露）。
  </Card>

  <Card title="Tool prompts" icon="list" href="#tool-prompts">
    使用内置工具或自定义工具的说明。
  </Card>
</CardGroup>

###系统提示

您的自定义系统提示符位于内置系统提示符之前，其中包括文件系统工具和子代理的指南。用它来定义代理的角色、行为和知识：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: `You are a research assistant specializing in scientific literature.
    Always cite sources. Use subagents for parallel research on different topics.`,
  });
  ```
</CodeGroup>`systemPrompt` 参数是静态的，这意味着它在每次调用时都不会改变。
对于某些用例，您可能需要动态提示：例如，告诉模型“您具有管理员访问权限”与“您具有只读访问权限”，或者注入用户首选项，例如来自 [long-term memory](#long-term-memory) 的“用户更喜欢简洁的响应”。
如果您的提示取决于上下文或 `runtime.store`，请使用 `dynamicSystemPromptMiddleware` 构建上下文感知指令。
您的中间件可以读取`request.runtime.context`和`request.runtime.store`。
有关 [Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack) 和添加 [custom middleware](/oss/javascript/langchain/middleware)，请参阅 [Customization](/oss/javascript/deepagents/customization#middleware)。有关示例，请参阅 [LangChain context engineering](/oss/javascript/langchain/context-engineering#system-prompt) 指南。

当工具单独使用上下文或`runtime.store`时，你**不需要**需要中间件；工具直接接收`runtime`对象（包括`runtime.context`和`runtime.store`）。仅当系统提示本身必须根据请求而变化时才添加中间件。

<Tip>
  要调整特定提供商或模型的组装系统提示符，请使用 [harness profile](/oss/javascript/deepagents/profiles#harness-profiles)：`base_system_prompt` 完全替换基本提示符，并将 `system_prompt_suffix` 附加到它。
</Tip>

### 内存

内存文件 ([⟦T50⟧](https://agents.md/)) 提供持久上下文，**始终加载**到系统提示符中。记住项目约定、用户偏好和适用于每次对话的关键准则：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    memory: ["/project/AGENTS.md", "~/.deepagents/preferences.md"],
  });
  ```
</CodeGroup>与技能不同，记忆总是被注入的——没有渐进的披露。保持最小内存以避免上下文过载；使用 [skills](/oss/javascript/deepagents/skills) 获取详细的工作流程和特定领域的内容。有关配置详细信息，请参阅[Memory](/oss/javascript/deepagents/customization#memory)。

要生成编码代理通过`AGENTS.md`发现的存储库wiki，请参阅[OpenWiki](/oss/openwiki/overview)。

### 技能

技能提供**按需**功能。代理在启动时从每个`SKILL.md`读取frontmatter，然后仅在确定技能相关时加载完整的技能内容。这减少了令牌的使用，同时仍然提供专门的工作流程：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    skills: ["/skills/research/", "/skills/web-search/"],
  });
  ```
</CodeGroup>

让每项技能专注于单一工作流程或领域；广泛或重叠的技能会削弱相关性，并在加载时使上下文变得臃肿。在技​​能中，保持主要内容简洁，并将详细的参考材料移至技能文件中引用的单独文件中。将始终相关的约定放入[memory](#memory)。有关创作和配置，请参阅[Skills](/oss/javascript/deepagents/skills)。

### 工具提示[Tool](/oss/javascript/langchain/tools) 提示是塑造模型如何使用工具的说明。所有工具都会公开模型在提示中看到的元数据 - 通常是模式和描述。您通过 `tools` 参数表面传递的工具将元数据（架构和描述）传递给模型。深度代理的内置工具打包在 [Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack) 中，通常还会更新系统提示，为这些工具提供更多指导。

**内置工具**：添加利用功能（文件系统、子代理和可选规划）的中间件会自动将特定于工具的指令附加到系统提示符中，创建解释如何有效使用这些工具的工具提示。完整列表请参见[Customization](/oss/javascript/deepagents/customization#middleware)：

* 文件系统提示：`ls`、`read_file`、`write_file`、`edit_file`、`glob`、`grep`（以及使用沙箱后端时的`execute`）的文档

* 子代理提示：使用 `task` 工具委派工作的指南

* 人机交互提示：用于在指定工具调用时暂停（当设置`interrupt_on`时）

* 本地上下文提示：当前目录和项目信息（仅限 CLI）**您提供的工具**：通过 `tools` 参数传递的工具将其描述（来自工具架构）发送到模型。您还可以添加[custom middleware](/oss/javascript/langchain/middleware)，添加工具并附加自己的系统提示指令。

对于您提供的工具，请确保提供清晰的名称、描述和参数描述。这些指导模型关于何时以及如何使用该工具的推理。在描述中包含*何时*使用该工具并描述每个参数的作用。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const searchOrders = tool(
  async ({ userId, status, limit }) =>
    `orders for ${userId} with status ${status} (limit ${limit})`,
  {
    name: "search_orders",
    description: `Search for user orders by status.

Use this when the user asks about order history or wants to check
order status. Always filter by the provided status.`,
    schema: z.object({
      userId: z.string().describe("Unique identifier for the user"),
      status: z
        .enum(["pending", "shipped", "delivered"])
        .describe("Order status to filter by"),
      limit: z
        .number()
        .default(10)
        .describe("Maximum number of results to return"),
    }),
  },
);
```

<Tip>
  要覆盖特定提供程序或模型的内置或用户提供的工具的描述，请使用按工具名称键入的 [harness profile](/oss/javascript/deepagents/profiles#harness-profiles) 的 `tool_description_overrides`。

  未使用的内置工具仍然每次都会发送其完整模式。使用 `excluded_tools` 删除代理不应调用的工具（例如只读代理上的 `write_file` 或 `execute`）。这会缩小整个运行的基线提示大小。这是配置，而不是[Context compression](#context-compression)中的自动卸载或汇总。

  参见[Harness profiles](/oss/javascript/deepagents/profiles#harness-profiles)和[Running without the default filesystem tools](/oss/javascript/deepagents/overview#virtual-filesystem-access)。
</Tip>

有关内置功能，请参阅[Overview](/oss/javascript/deepagents/overview#execution-environment)；有关直接传递工具的信息，请参阅[Customization](/oss/javascript/deepagents/customization#tools)。

### 完成系统提示深度代理的系统消息（模型在运行开始时收到的组装系统提示）由以下部分组成：

1.定制`system_prompt`（如果提供）
2.[Base agent prompt](https://github.com/langchain-ai/deepagents/blob/e18e9dcd0e6edc72c0a4a5b76ae752c4bc539752/libs/deepagents/deepagents/graph.py#L37)
3.内存提示：`AGENTS.md`+内存使用指南（仅当提供`memory`时）
4.技能提示：技能位置+技能列表及前置信息+用法（仅当提供技能时）
5. 虚拟文件系统提示（文件系统+执行工具文档，如果适用）
6.子代理提示：任务工具使用
7、用户提供的中间件提示（如果提供了自定义中间件）
8. 人机交互提示（设置`interrupt_on`时）

## 运行时上下文

运行时上下文是您调用代理时传递的每次运行配置。它不会自动包含在模型提示中；仅当工具、中间件或其他逻辑读取它并将其添加到消息或系统提示中时，模型才会看到它。使用用户元数据（ID、首选项、角色）、API 密钥、数据库连接、功能标志或工具和工具所需的其他值的运行时上下文。使用 `contextSchema` 定义该数据的形状，通常是 Zod 对象模式（例如 `z.object({ ... })`）。在传递给 `invoke` / `ainvoke` 的选项对象的 **`context`** 字段中传递运行时值。有关完整详细信息，请参阅[Runtime](/oss/javascript/langchain/runtime) 和 [LangGraph runtime context](/oss/javascript/langgraph/graph-api#runtime-context)。

在工具内部，从作为工具处理程序的 `runtime` 参数提供的 `ToolRuntime` 实例中读取 `runtime.context`：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool } from "langchain";
  import type { ToolRuntime } from "@langchain/core/tools";
  import * as z from "zod";

  const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
  });

  const fetchUserData = tool(
    async (input, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
      const userId = runtime.context?.userId;
      return `Data for user ${userId}: ${input.query}`;
    },
    {
      name: "fetch_user_data",
      description: "Fetch data for the current user",
      schema: z.object({ query: z.string() }),
    },
  );

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [fetchUserData],
    contextSchema,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: "Get my recent activity" }] },
    { context: { userId: "user-123", apiKey: "sk-..." } },
  );
  ```
</CodeGroup>

运行时上下文**传播到所有子代理**。当子代理运行时，它会接收与父代理相同的运行时上下文。有关每个子代理上下文（命名空间键），请参阅 [Subagents](/oss/javascript/deepagents/subagents#context-management)。

## 上下文压缩

每个 `create_deep_agent` 调用都包含内置上下文压缩。您无需添加中间件即可进行卸载或汇总工作。

长时间运行的任务会产生大量的工具输出和较长的对话历史记录。
上下文压缩可以减少代理工作记忆中的信息大小，同时保留与任务相关的细节。
以下技术是确保传递给 LLM 的上下文保持在其上下文窗口限制内的内置机制：

<CardGroup>
  <Card title="Offloading" icon="file-export" href="#offloading">
    大型工具输入和结果存储在文件系统中并替换为引用。
  </Card><Card title="Summarization" icon="article" href="#summarization">
    当接近限制时，旧消息会被压缩到 LLM 生成的摘要中。
  </Card>
</CardGroup>

要在压缩运行之前缩小每次发送的工具模式，请通过 [harness profile](/oss/javascript/deepagents/profiles#harness-profiles) (`excluded_tools`) 排除未使用的内置工具。参见[Tool prompts](#tool-prompts)。

### 卸载

深度代理使用 [built-in filesystem tools](/oss/javascript/deepagents/overview#virtual-filesystem-access) 自动卸载内容并根据需要搜索和检索卸载的内容。
当工具调用输入或结果超过令牌阈值（默认 20,000）时，就会发生内容卸载：

1. **工具调用输入超过 20,000 个令牌**：文件写入和编辑操作会在代理的对话历史记录中留下包含完整文件内容的工具调用。
   由于此内容已持久保存到文件系统中，因此通常是多余的。
   当会话上下文跨越模型可用窗口的 85% 时，深度代理会截断旧的工具调用，将其替换为指向磁盘上文件的指针，并减小活动上下文的大小。

   <img alt="An example of offloading showing a large input which is saved to disk and the truncated version is used for the tool call" />2. **工具调用结果超过 20,000 个令牌**：当发生这种情况时，深度代理会将响应卸载到配置的后端，并用文件路径引用和前 10 行的预览替换它。然后，代理可以根据需要重新阅读或搜索内容。

   <img alt="An example of offloading showing a large tool response that is replaced with a message about the location of the offloaded results and the first 10 lines of the result" />

<Note>
  内置上下文压缩不会调整图像大小、降低图像分辨率或生成视觉嵌入。有关多模式输入、工具输出以及压缩如何与媒体交互，请参阅[Multimodal](/oss/javascript/deepagents/multimodal)。
</Note>

### 总结

<Note>
  当前的汇总行为（通过`wrapModelCall`进行模型内汇总、准确的令牌计数和自动`ContextOverflowError`回退）需要`deepagents>=1.6.0`。
</Note>

每个 `create_deep_agent` 调用都会在 [bare stack](/oss/javascript/deepagents/customization#bare-stack) 中包含 [⟦T86⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware)。当上下文大小超过模型的上下文窗口限制（例如 `max_input_tokens` 的 85%），并且没有更多上下文符合卸载条件时，深度代理会自动汇总消息历史记录。

这个过程有两个组成部分：* **上下文摘要**：LLM 生成对话的结构化摘要，包括会话意图、创建的工件和后续步骤，这会替换座席工作记忆中的完整对话历史记录。
* **文件系统保存**：原始对话消息的文本呈现作为规范记录写入文件系统。

这种双重方法确保代理保持对其目标和进度的了解（通过摘要），同时保留在需要时恢复文本详细信息的能力（通过文件系统搜索）。

<img alt="An example of summarization showing an agent's conversation history, where several steps get compacted" />

**配置：**

* 在模型 `max_input_tokens` 的 [model profile](/oss/javascript/langchain/models#model-profiles) 的 85% 处触发
* 保留 10% 的 token 作为最近的上下文
* 如果模型配置文件不可用，则回落至 170,000 个令牌触发/保留 6 条消息
* 如果任何模型调用提出标准[ContextOverflowError](https://reference.langchain.com/javascript/langchain-core/errors/ContextOverflowError)，深度代理会立即回退到摘要并使用摘要+最近保留的消息重试
* 较旧的消息按模型进行总结

<Tip>
  来自代理的[Streaming tokens](/oss/javascript/deepagents/streaming#llm-tokens)通常会包含汇总步骤生成的令牌。您可以使用相关元数据过滤掉这些令牌：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  for await (const [namespace, chunk] of await agent.stream(
    { messages: [...] },
    { streamMode: "messages" },
  )) {
    const [message, metadata] = chunk;
    if (metadata?.lcSource === "summarization") {  // [!code highlight]
      continue;
    } else {
      ...
    }
  }
  ```
</Tip>

## 使用子代理进行上下文隔离子代理解决了**上下文膨胀问题**。当主代理使用具有大量输出的工具（网络搜索、文件读取、数据库查询）时，上下文窗口很快就会填满。子代理隔离了这项工作——主代理仅接收最终结果，而不是产生该结果的数十个工具调用。您还可以独立于主代理配置每个子代理（例如，模型、工具、系统提示和技能）。

**它是如何工作的：**

* 主代理有一个`task`工具来委派工作
* 子代理以自己的新上下文运行
* 子代理自主执行直至完成
* 子代理向主代理返回一份最终报告
* 主要代理的上下文保持干净

**最佳实践：**

1. **委派复杂任务**：使用子代理进行多步骤工作，这会扰乱主代理的上下文。

2. **保持子代理响应简洁**：指示子代理返回摘要，而不是原始数据：

   ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   const researchSubagent = {
     name: "researcher",
     description: "Conducts research on a topic",
     systemPrompt: `You are a research assistant.
       IMPORTANT: Return only the essential summary (under 500 words).
       Do NOT include raw search results or detailed tool outputs.`,
     tools: [webSearch],
   };
   ```

3. **使用文件系统处理大数据**：子代理可以将结果写入文件；主代理读取它需要的内容。

有关配置，请参阅 [Subagents](/oss/javascript/deepagents/subagents)；有关运行时上下文传播和每个子代理命名空间的信息，请参阅 [context management](/oss/javascript/deepagents/subagents#context-management)。

## 长期记忆使用默认文件系统时，深度代理将其工作内存文件存储在代理状态中，该状态仅在单个线程中持续存在。
长期记忆使您的深度代理能够跨不同线程和对话保存信息。
深度代理可以使用长期记忆来存储用户偏好、积累的知识、研究进展或任何应在单个会话之后持续存在的信息。

要使用长期内存，您必须使用 `CompositeBackend` 将特定路径（通常是 `/memories/`）路由到 LangGraph Store，从而提供持久的跨线程持久性。
`CompositeBackend` 是一种混合存储系统，其中一些文件无限期地保留，而其他文件则保留在单个线程范围内。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    CompositeBackend,
    createDeepAgent,
    StateBackend,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    store: new InMemoryStore(),
    backend: new CompositeBackend(new StateBackend(), {
      "/memories/": new StoreBackend({
        namespace: () => ["memories"],
      }),
    }),
    systemPrompt: `When users tell you their preferences, save them to /memories/user_preferences.txt so you remember them in future conversations.`,
  });
  ```
</CodeGroup>

您不需要使用文件预先填充 `/memories/`。
您提供后端配置、存储和系统提示指令，告诉代理“保存什么”和“在哪里”。
例如，您可以提示代理将首选项存储在`/memories/preferences.txt`中。
该路径开始为空，当用户共享值得记住的信息时，代理会使用其文件系统工具（`write_file`、`edit_file`）按需创建文件。要预先播种记忆，请在 LangSmith 上部署时使用 [Store API](/langsmith/custom-store)。
有关设置和用例，请参阅[Long-term memory](/oss/javascript/deepagents/memory)。

## 最佳实践

1. **从正确的输入上下文开始**：为始终相关的约定保持最小的内存；使用专注技能来实现特定任务的能力。
2. **利用子代理完成繁重的工作**：委派多步骤、输出繁重的任务，以保持主代理的上下文干净。
3. **在配置中调整子代理输出**：如果您在调试时注意到子代理生成长输出，您可以向子代理的 `system_prompt` 添加指导以创建摘要和综合结果。
4. **使用文件系统**：将大量输出保留到文件（例如子代理写入或[automatic offloading](#offloading)），以便活动上下文保持较小；当模型需要细节时，可以使用`read_file`和`grep`拉取片段。
5. **记录长期记忆结构**：告诉代理`/memories/`里有什么以及如何使用它。
6. **传递工具的运行时上下文**：使用 `context` 来获取用户元数据、API 密钥和工具所需的其他静态配置。

## 相关资源* [Harness](/oss/javascript/deepagents/overview)：上下文管理概述、卸载、
  总结
* [Multimodal](/oss/javascript/deepagents/multimodal)：图像、音频、视频和多模式工具输出
* [Subagents](/oss/javascript/deepagents/subagents)：上下文隔离，运行时上下文传播
* [Long-term memory](/oss/javascript/deepagents/memory)：跨线程持久化
* * [OpenWiki](/oss/openwiki/overview)：编码代理通过`AGENTS.md`找到的存储库wiki
* [Skills](/oss/javascript/deepagents/skills)：渐进式披露和技能创作
* [Backends](/oss/javascript/deepagents/backends)：文件系统后端和 CompositeBackend
* [Context conceptual overview](/oss/javascript/concepts/context)：上下文类型和生命周期

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/context-engineering.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>