<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context engineering in agents | https://docs.langchain.com/oss/javascript/langchain/context-engineering -->

## 概述

构建代理（或任何法学硕士申请）的困难部分是使它们足够可靠。虽然它们可能适用于原型，但在现实用例中经常会失败。

### 为什么代理会失败？

当代理失败时，通常是因为代理内部的 LLM 调用采取了错误的操作/没有执行我们预期的操作。法学硕士因以下两个原因之一失败：

1. 底层LLM能力不够
2.“正确”的背景没有传递给法学硕士

通常情况下，这实际上是导致代理商不可靠的第二个原因。

**背景工程**是以正确的格式提供正确的信息和工具，以便法学硕士能够完成任务。这是人工智能工程师的首要工作。缺乏“正确”的上下文是更可靠代理的首要障碍，而 LangChain 的代理抽象经过独特设计，可以促进上下文工程。

<Tip>
  环境工程新手？从 [conceptual overview](/oss/javascript/concepts/context) 开始了解不同类型的上下文以及何时使用它们。
</Tip>

### 代理循环

典型的代理循环由两个主要步骤组成：1. **模型调用** - 使用提示和可用工具调用 LLM，返回响应或执行工具的请求
2. **工具执行** - 执行LLM请求的工具，返回工具结果

<div>
  <img alt="Core agent loop diagram" />
</div>

这个循环一直持续到法学硕士决定结束。

### 你可以控制什么

要构建可靠的代理，您需要控制代理循环的每个步骤以及步骤之间发生的情况。

|上下文类型 |你控制什么 |短暂或持续|
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| **[Model Context](#model-context)** |模型调用的内容（说明、消息历史记录、工具、响应格式）|瞬态|
| **[Tool Context](#tool-context)** |哪些工具可以访问和生成（读/写状态、存储、运行时上下文）|坚持不懈|
| **[Life-cycle Context](#life-cycle-context)** |模型和工具调用之间会发生什么（摘要、护栏、日志记录等）|坚持不懈|<CardGroup>
  <Card title="Transient context" icon="bolt">
    法学硕士在一次通话中看到了什么。您可以修改消息、工具或提示，而无需更改状态中保存的内容。
  </Card>

  <Card title="Persistent context" icon="database">
    各个回合中状态中保存的内容。生命周期挂钩和工具写入会永久修改这一点。
  </Card>
</CardGroup>

### 数据来源

在整个过程中，您的代理访问（读取/写入）不同的数据源：

|数据来源|也称为|范围 |示例 |
| ------------------- | -------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| **运行时上下文** |静态配置|对话范围 |用户 ID、API 密钥、数据库连接、权限、环境设置 |
| **状态** |短期记忆 |对话范围 |当前消息、上传的文件、身份验证状态、工具结果 |
| **商店** |长期记忆 |交叉对话 |用户偏好、提取的见解、记忆、历史数据 |

### 它是如何工作的LangChain [middleware](/oss/javascript/langchain/middleware) 是使上下文工程对于使用 LangChain 的开发人员变得实用的底层机制。

中间件允许您连接到代理生命周期中的任何步骤，并且：

* 更新上下文
* 跳转到代理生命周期的不同步骤

在本指南中，您将看到频繁使用中间件 API 作为上下文工程端的手段。

## 模型上下文

控制每个模型调用的内容 - 指令、可用工具、使用哪个模型以及输出格式。这些决策直接影响可靠性和成本。

<CardGroup>
  <Card title="System Prompt" icon="message-2" href="#system-prompt">
    开发人员向法学硕士发出的基本指示。
  </Card>

  <Card title="Messages" icon="messages" href="#messages">
    发送给法学硕士的完整消息列表（对话历史记录）。
  </Card>

  <Card title="Tools" icon="tool" href="#tools">
    代理可以访问以采取操作的实用程序。
  </Card>

  <Card title="Model" icon="cpu" href="#model">
    要调用的实际模型（包括配置）。
  </Card>

  <Card title="Response Format" icon="braces" href="#response-format">
    模型最终响应的架构规范。
  </Card>
</CardGroup>

所有这些类型的模型上下文都可以从**状态**（短期记忆）、**存储**（长期记忆）或**运行时上下文**（静态配置）中获取。

###系统提示系统提示设置 LLM 的行为和能力。不同的用户、上下文或对话阶段需要不同的指令。成功的代理利用记忆、偏好和配置为当前对话状态提供正确的指令。

<Tabs>
  <Tab title="State">
    从状态访问消息计数或对话上下文：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent } from "langchain";

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [...],
      middleware: [
        dynamicSystemPromptMiddleware((state) => {
          // Read from State: check conversation length
          const messageCount = state.messages.length;

          let base = "You are a helpful assistant.";

          if (messageCount > 10) {
            base += "\nThis is a long conversation - be extra concise.";
          }

          return base;
        }),
      ],
    });
    ```
  </Tab>

  <Tab title="Store">
    从长期记忆中访问用户偏好：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createAgent, dynamicSystemPromptMiddleware } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    type Context = z.infer<typeof contextSchema>;

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [...],
      contextSchema,
      middleware: [
        dynamicSystemPromptMiddleware<Context>(async (state, runtime) => {
          const userId = runtime.context.userId;

          // Read from Store: get user preferences
          const store = runtime.store;
          const userPrefs = await store.get(["preferences"], userId);

          let base = "You are a helpful assistant.";

          if (userPrefs) {
            const style = userPrefs.value?.communicationStyle || "balanced";
            base += `\nUser prefers ${style} responses.`;
          }

          return base;
        }),
      ],
    });
    ```
  </Tab>

  <Tab title="Runtime Context">
    从运行时上下文访问用户 ID 或配置：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createAgent, dynamicSystemPromptMiddleware } from "langchain";

    const contextSchema = z.object({
      userRole: z.string(),
      deploymentEnv: z.string(),
    });

    type Context = z.infer<typeof contextSchema>;

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [...],
      contextSchema,
      middleware: [
        dynamicSystemPromptMiddleware<Context>((state, runtime) => {
          // Read from Runtime Context: user role and environment
          const userRole = runtime.context.userRole;
          const env = runtime.context.deploymentEnv;

          let base = "You are a helpful assistant.";

          if (userRole === "admin") {
            base += "\nYou have admin access. You can perform all operations.";
          } else if (userRole === "viewer") {
            base += "\nYou have read-only access. Guide users to read operations only.";
          }

          if (env === "production") {
            base += "\nBe extra careful with any data modifications.";
          }

          return base;
        }),
      ],
    });
    ```
  </Tab>
</Tabs>

### 消息

消息组成了发送给 LLM 的提示。
管理消息内容至关重要，以确保法学硕士拥有正确的信息来做出良好的回应。

<Tabs>
  <Tab title="State">
    当与当前查询相关时，从 State 注入上传的文件上下文：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createMiddleware } from "langchain";

    const injectFileContext = createMiddleware({
      name: "InjectFileContext",
      wrapModelCall: (request, handler) => {
        // request.state is a shortcut for request.state.messages
        const uploadedFiles = request.state.uploadedFiles || [];  // [!code highlight]

        if (uploadedFiles.length > 0) {
          // Build context about available files
          const fileDescriptions = uploadedFiles.map(file =>
            `- ${file.name} (${file.type}): ${file.summary}`
          );

          const fileContext = `Files you have access to in this conversation:
    ${fileDescriptions.join("\n")}

    Reference these files when answering questions.`;

          // Inject file context before recent messages
          const messages = [  // [!code highlight]
            ...request.messages,  // Rest of conversation
            { role: "user", content: fileContext }
          ];
          request = request.override({ messages });  // [!code highlight]
        }

        return handler(request);
      },
    });

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [...],
      middleware: [injectFileContext],
    });
    ```
  </Tab>

  <Tab title="Store">
    从商店注入用户的电子邮件写作风格以指导起草：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    const injectWritingStyle = createMiddleware({
      name: "InjectWritingStyle",
      contextSchema,
      wrapModelCall: async (request, handler) => {
        const userId = request.runtime.context.userId;  // [!code highlight]

        // Read from Store: get user's writing style examples
        const store = request.runtime.store;  // [!code highlight]
        const writingStyle = await store.get(["writing_style"], userId);  // [!code highlight]

        if (writingStyle) {
          const style = writingStyle.value;
          // Build style guide from stored examples
          const styleContext = `Your writing style:
    - Tone: ${style.tone || 'professional'}
    - Typical greeting: "${style.greeting || 'Hi'}"
    - Typical sign-off: "${style.signOff || 'Best'}"
    - Example email you've written:
    ${style.exampleEmail || ''}`;

          // Append at end - models pay more attention to final messages
          const messages = [
            ...request.messages,
            { role: "user", content: styleContext }
          ];
          request = request.override({ messages });  // [!code highlight]
        }

        return handler(request);
      },
    });
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据用户的权限从运行时上下文注入合规性规则：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userJurisdiction: z.string(),
      industry: z.string(),
      complianceFrameworks: z.array(z.string()),
    });

    type Context = z.infer<typeof contextSchema>;

    const injectComplianceRules = createMiddleware<Context>({
      name: "InjectComplianceRules",
      contextSchema,
      wrapModelCall: (request, handler) => {
        // Read from Runtime Context: get compliance requirements
        const { userJurisdiction, industry, complianceFrameworks } = request.runtime.context;  // [!code highlight]

        // Build compliance constraints
        const rules = [];
        if (complianceFrameworks.includes("GDPR")) {
          rules.push("- Must obtain explicit consent before processing personal data");
          rules.push("- Users have right to data deletion");
        }
        if (complianceFrameworks.includes("HIPAA")) {
          rules.push("- Cannot share patient health information without authorization");
          rules.push("- Must use secure, encrypted communication");
        }
        if (industry === "finance") {
          rules.push("- Cannot provide financial advice without proper disclaimers");
        }

        if (rules.length > 0) {
          const complianceContext = `Compliance requirements for ${userJurisdiction}:
    ${rules.join("\n")}`;

          // Append at end - models pay more attention to final messages
          const messages = [
            ...request.messages,
            { role: "user", content: complianceContext }
          ];
          request = request.override({ messages });  // [!code highlight]
        }

        return handler(request);
      },
    });
    ```
  </Tab>
</Tabs>

<Note>
  **瞬时消息更新与持久消息更新：**上面的示例使用 `wrap_model_call` 进行**瞬时**更新 - 修改单个调用发送到模型的消息，而不更改状态中保存的内容。

  对于修改状态的**持久**更新，您可以：

  * 直接从`wrapModelCall`返回[⟦T24⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command)，以从模型调用层注入状态更新。
  * 使用生命周期挂钩，如 `beforeModel`、`afterModel` 或 `wrapToolCall`（用于工具返回）来更新对话历史记录。更多详情请参阅[middleware documentation](/oss/javascript/langchain/middleware)。

  请参阅[State updates](/oss/javascript/langchain/middleware/custom#state-updates)了解更多信息。
</Note>

### 工具

工具允许模型与数据库、API 和外部系统交互。如何定义和选择工具直接影响模型能否有效完成任务。

#### 定义工具

每个工具都需要一个清晰的名称、描述、参数名称和参数描述。这些不仅仅是元数据，它们指导模型关于何时以及如何使用该工具的推理。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchOrders = tool(
  async ({ userId, status, limit }) => {
    // Implementation here
  },
  {
    name: "search_orders",
    description: `Search for user orders by status.

    Use this when the user asks about order history or wants to check
    order status. Always filter by the provided status.`,
    schema: z.object({
      userId: z.string().describe("Unique identifier for the user"),
      status: z.enum(["pending", "shipped", "delivered"]).describe("Order status to filter by"),
      limit: z.number().default(10).describe("Maximum number of results to return"),
    }),
  }
);
```

#### 选择工具并非每种工具都适合每种情况。太多的工具可能会压垮模型（超载上下文）并增加错误；太少限制了能力。动态工具选择根据身份验证状态、用户权限、功能标志或对话阶段来调整可用的工具集。

<Tabs>
  <Tab title="State">
    仅在某些对话里程碑后启用高级工具：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createMiddleware } from "langchain";

    const stateBasedTools = createMiddleware({
      name: "StateBasedTools",
      wrapModelCall: (request, handler) => {
        // Read from State: check authentication and conversation length
        const state = request.state;  // [!code highlight]
        const isAuthenticated = state.authenticated || false;  // [!code highlight]
        const messageCount = state.messages.length;

        let filteredTools = request.tools;

        // Only enable sensitive tools after authentication
        if (!isAuthenticated) {
          filteredTools = request.tools.filter(t => t.name.startsWith("public_"));  // [!code highlight]
        } else if (messageCount < 5) {
          filteredTools = request.tools.filter(t => t.name !== "advanced_search");  // [!code highlight]
        }

        return handler({ ...request, tools: filteredTools });  // [!code highlight]
      },
    });
    ```
  </Tab>

  <Tab title="Store">
    根据用户偏好或商店中的功能标志过滤工具：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    const storeBasedTools = createMiddleware({
      name: "StoreBasedTools",
      contextSchema,
      wrapModelCall: async (request, handler) => {
        const userId = request.runtime.context.userId;  // [!code highlight]

        // Read from Store: get user's enabled features
        const store = request.runtime.store;  // [!code highlight]
        const featureFlags = await store.get(["features"], userId);  // [!code highlight]

        let filteredTools = request.tools;

        if (featureFlags) {
          const enabledFeatures = featureFlags.value?.enabledTools || [];
          filteredTools = request.tools.filter(t => enabledFeatures.includes(t.name));  // [!code highlight]
        }

        return handler({ ...request, tools: filteredTools });  // [!code highlight]
      },
    });
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文中的用户权限过滤工具：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userRole: z.string(),
    });

    const contextBasedTools = createMiddleware({
      name: "ContextBasedTools",
      contextSchema,
      wrapModelCall: (request, handler) => {
        // Read from Runtime Context: get user role
        const userRole = request.runtime.context.userRole;  // [!code highlight]

        let filteredTools = request.tools;

        if (userRole === "admin") {
          // Admins get all tools
        } else if (userRole === "editor") {
          filteredTools = request.tools.filter(t => t.name !== "delete_data");  // [!code highlight]
        } else {
          filteredTools = request.tools.filter(t => t.name.startsWith("read_"));  // [!code highlight]
        }

        return handler({ ...request, tools: filteredTools });  // [!code highlight]
      },
    });
    ```
  </Tab>
</Tabs>

有关过滤预注册工具和在运行时注册工具（例如，从 MCP 服务器）的信息，请参阅[Dynamic tools](/oss/javascript/langchain/tools#dynamic-tool-selection)。

### 型号

不同的模型有不同的优势、成本和上下文窗口。为手头的任务选择正确的模型，
在代理运行期间可能会发生变化。

<Tabs>
  <Tab title="State">
    根据州的对话长度使用不同的模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createMiddleware, initChatModel } from "langchain";

    // Initialize models once outside the middleware
    const largeModel = initChatModel("claude-sonnet-4-6");
    const standardModel = initChatModel("gpt-5.5");
    const efficientModel = initChatModel("gpt-5.4-mini");

    const stateBasedModel = createMiddleware({
      name: "StateBasedModel",
      wrapModelCall: (request, handler) => {
        // request.messages is a shortcut for request.state.messages
        const messageCount = request.messages.length;  // [!code highlight]
        let model;

        if (messageCount > 20) {
          model = largeModel;
        } else if (messageCount > 10) {
          model = standardModel;
        } else {
          model = efficientModel;
        }

        return handler({ ...request, model });  // [!code highlight]
      },
    });
    ```
  </Tab>

  <Tab title="Store">
    使用商店中用户的首选型号：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware, initChatModel } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    // Initialize available models once
    const MODEL_MAP = {
      "gpt-5.5": initChatModel("gpt-5.5"),
      "gpt-5.4-mini": initChatModel("gpt-5.4-mini"),
      "claude-sonnet": initChatModel("claude-sonnet-4-6"),
    };

    const storeBasedModel = createMiddleware({
      name: "StoreBasedModel",
      contextSchema,
      wrapModelCall: async (request, handler) => {
        const userId = request.runtime.context.userId;  // [!code highlight]

        // Read from Store: get user's preferred model
        const store = request.runtime.store;  // [!code highlight]
        const userPrefs = await store.get(["preferences"], userId);  // [!code highlight]

        let model = request.model;

        if (userPrefs) {
          const preferredModel = userPrefs.value?.preferredModel;
          if (preferredModel && MODEL_MAP[preferredModel]) {
            model = MODEL_MAP[preferredModel];  // [!code highlight]
          }
        }

        return handler({ ...request, model });  // [!code highlight]
      },
    });
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文中的成本限制或环境选择模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware, initChatModel } from "langchain";

    const contextSchema = z.object({
      costTier: z.string(),
      environment: z.string(),
    });

    // Initialize models once outside the middleware
    const premiumModel = initChatModel("claude-sonnet-4-6");
    const standardModel = initChatModel("gpt-5.5");
    const budgetModel = initChatModel("gpt-5.4-mini");

    const contextBasedModel = createMiddleware({
      name: "ContextBasedModel",
      contextSchema,
      wrapModelCall: (request, handler) => {
        // Read from Runtime Context: cost tier and environment
        const costTier = request.runtime.context.costTier;  // [!code highlight]
        const environment = request.runtime.context.environment;  // [!code highlight]

        let model;

        if (environment === "production" && costTier === "premium") {
          model = premiumModel;
        } else if (costTier === "budget") {
          model = budgetModel;
        } else {
          model = standardModel;
        }

        return handler({ ...request, model });  // [!code highlight]
      },
    });
    ```
  </Tab>
</Tabs>

更多示例请参见[Dynamic model](/oss/javascript/langchain/models#dynamic-model-selection)。### 响应格式

结构化输出将非结构化文本转换为经过验证的结构化数据。当提取特定字段或为下游系统返回数据时，自由格式文本是不够的。

**工作原理：** 当您提供架构作为响应格式时，模型的最终响应将保证符合该架构。代理运行模型/工具调用循环，直到模型完成调用工具，然后将最终响应强制转换为提供的格式。

#### 定义格式

模式定义指导模型。字段名称、类型和描述准确指定输出应遵循的格式。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { z } from "zod";

const customerSupportTicket = z.object({
  category: z.enum(["billing", "technical", "account", "product"]).describe(
    "Issue category"
  ),
  priority: z.enum(["low", "medium", "high", "critical"]).describe(
    "Urgency level"
  ),
  summary: z.string().describe(
    "One-sentence summary of the customer's issue"
  ),
  customerSentiment: z.enum(["frustrated", "neutral", "satisfied"]).describe(
    "Customer's emotional tone"
  ),
}).describe("Structured ticket information extracted from customer message");
```

#### 选择格式

动态响应格式选择根据用户偏好、对话阶段或角色来调整模式——尽早返回简单格式，并随着复杂性的增加而返回详细格式。

<Tabs>
  <Tab title="State">
    根据对话状态配置结构化输出：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createMiddleware } from "langchain";
    import { z } from "zod";

    const simpleResponse = z.object({
      answer: z.string().describe("A brief answer"),
    });

    const detailedResponse = z.object({
      answer: z.string().describe("A detailed answer"),
      reasoning: z.string().describe("Explanation of reasoning"),
      confidence: z.number().describe("Confidence score 0-1"),
    });

    const stateBasedOutput = createMiddleware({
      name: "StateBasedOutput",
      wrapModelCall: (request, handler) => {
        // request.state is a shortcut for request.state.messages
        const messageCount = request.messages.length;  // [!code highlight]

        let responseFormat;
        if (messageCount < 3) {
          // Early conversation - use simple format
          responseFormat = simpleResponse; // [!code highlight]
        } else {
          // Established conversation - use detailed format
          responseFormat = detailedResponse; // [!code highlight]
        }

        return handler({ ...request, responseFormat });
      },
    });
    ```
  </Tab>

  <Tab title="Store">
    根据 Store 中的用户偏好配置输出格式：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    const verboseResponse = z.object({
      answer: z.string().describe("Detailed answer"),
      sources: z.array(z.string()).describe("Sources used"),
    });

    const conciseResponse = z.object({
      answer: z.string().describe("Brief answer"),
    });

    const storeBasedOutput = createMiddleware({
      name: "StoreBasedOutput",
      wrapModelCall: async (request, handler) => {
        const userId = request.runtime.context.userId;  // [!code highlight]

        // Read from Store: get user's preferred response style
        const store = request.runtime.store;  // [!code highlight]
        const userPrefs = await store.get(["preferences"], userId);  // [!code highlight]

        const style = userPrefs?.value?.responseStyle || "concise";
        const responseFormat =
          style === "verbose" ? verboseResponse : conciseResponse;  // [!code highlight]

        return handler({
          ...request,
          responseFormat,
        });
      },
    });
    ```
  </Tab>

  <Tab title="Runtime Context">
    根据运行时上下文（例如用户角色或环境）配置输出格式：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createMiddleware } from "langchain";

    const contextSchema = z.object({
      userRole: z.string(),
      environment: z.string(),
    });

    const adminResponse = z.object({
      answer: z.string().describe("Answer"),
      debugInfo: z.record(z.any()).describe("Debug information"),
      systemStatus: z.string().describe("System status"),
    });

    const userResponse = z.object({
      answer: z.string().describe("Answer"),
    });

    const contextBasedOutput = createMiddleware({
      name: "ContextBasedOutput",
      wrapModelCall: (request, handler) => {
        // Read from Runtime Context: user role and environment
        const userRole = request.runtime.context.userRole;  // [!code highlight]
        const environment = request.runtime.context.environment;  // [!code highlight]

        let responseFormat;
        if (userRole === "admin" && environment === "production") {
          responseFormat = adminResponse;  // [!code highlight]
        } else {
          responseFormat = userResponse;  // [!code highlight]
        }

        return handler({ ...request, responseFormat });
      },
    });
    ```
  </Tab>
</Tabs>

## 工具上下文工具的特殊之处在于它们可以读取和写入上下文。

在最基本的情况下，当工具执行时，它会接收LLM的请求参数并返回工具消息。该工具完成其工作并产生结果。

工具还可以获取模型的重要信息，使其能够执行和完成任务。

### 阅读

大多数现实世界的工具需要的不仅仅是法学硕士的参数。他们需要用于数据库查询的用户 ID、用于外部服务的 API 密钥或当前会话状态来做出决策。工具从状态、存储和运行时上下文中读取以访问此信息。

<Tabs>
  <Tab title="State">
    读取State来检查当前会话信息：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createAgent, tool, type ToolRuntime } from "langchain";

    const checkAuthentication = tool(
      async (_, runtime: ToolRuntime) => {
        // Read from State: check current auth status
        const currentState = runtime.state;
        const isAuthenticated = currentState.authenticated || false;

        if (isAuthenticated) {
          return "User is authenticated";
        } else {
          return "User is not authenticated";
        }
      },
      {
        name: "check_authentication",
        description: "Check if user is authenticated",
        schema: z.object({}),
      }
    );
    ```
  </Tab>

  <Tab title="Store">
    从 Store 读取以访问持久的用户首选项：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createAgent, tool, type ToolRuntime } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
    });

    const getPreference = tool(
      async ({ preferenceKey }, runtime: ToolRuntime) => {
        const userId = runtime.context.userId;

        // Read from Store: get existing preferences
        const store = runtime.store;
        const existingPrefs = await store.get(["preferences"], userId);

        if (existingPrefs) {
          const value = existingPrefs.value?.[preferenceKey];
          return value ? `${preferenceKey}: ${value}` : `No preference set for ${preferenceKey}`;
        } else {
          return "No preferences found";
        }
      },
      {
        name: "get_preference",
        description: "Get user preference from Store",
        schema: z.object({
          preferenceKey: z.string(),
        }),
      }
    );
    ```
  </Tab>

  <Tab title="Runtime Context">
    从运行时上下文中读取 API 密钥和用户 ID 等配置：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { tool } from "@langchain/core/tools";
    import { createAgent } from "langchain";

    const contextSchema = z.object({
      userId: z.string(),
      apiKey: z.string(),
      dbConnection: z.string(),
    });

    const fetchUserData = tool(
      async ({ query }, runtime: ToolRuntime<any, typeof contextSchema>) => {
        // Read from Runtime Context: get API key and DB connection
        const { userId, apiKey, dbConnection } = runtime.context;

        // Use configuration to fetch data
        const results = await performDatabaseQuery(dbConnection, query, apiKey);

        return `Found ${results.length} results for user ${userId}`;
      },
      {
        name: "fetch_user_data",
        description: "Fetch data using Runtime Context configuration",
        schema: z.object({
          query: z.string(),
        }),
      }
    );

    const agent = createAgent({
      model: "gpt-5.5",
      tools: [fetchUserData],
      contextSchema,
    });
    ```
  </Tab>
</Tabs>

### 写

工具结果可用于帮助代理完成给定的任务。工具都可以将结果直接返回给模型
并更新代理的内存，以便为未来的步骤提供重要的上下文。<Tabs>
  <Tab title="State">
    使用命令写入状态以跟踪特定于会话的信息：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { tool } from "@langchain/core/tools";
    import { createAgent } from "langchain";
    import { Command } from "@langchain/langgraph";

    const authenticateUser = tool(
      async ({ password }) => {
        // Perform authentication
        if (password === "correct") {
          // Write to State: mark as authenticated using Command
          return new Command({
            update: { authenticated: true },
          });
        } else {
          return new Command({ update: { authenticated: false } });
        }
      },
      {
        name: "authenticate_user",
        description: "Authenticate user and update State",
        schema: z.object({
          password: z.string(),
        }),
      }
    );
    ```
  </Tab>

  <Tab title="Store">
    写入 Store 以跨会话保存数据：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import * as z from "zod";
    import { createAgent, tool, type ToolRuntime } from "langchain";

    const savePreference = tool(
      async ({ preferenceKey, preferenceValue }, runtime: ToolRuntime<any, typeof contextSchema>) => {
        const userId = runtime.context.userId;

        // Read existing preferences
        const store = runtime.store;
        const existingPrefs = await store.get(["preferences"], userId);

        // Merge with new preference
        const prefs = existingPrefs?.value || {};
        prefs[preferenceKey] = preferenceValue;

        // Write to Store: save updated preferences
        await store.put(["preferences"], userId, prefs);

        return `Saved preference: ${preferenceKey} = ${preferenceValue}`;
      },
      {
        name: "save_preference",
        description: "Save user preference to Store",
        schema: z.object({
          preferenceKey: z.string(),
          preferenceValue: z.string(),
        }),
      }
    );
    ```
  </Tab>
</Tabs>

有关在工具中访问状态、存储和运行时上下文的完整示例，请参阅[Tools](/oss/javascript/langchain/tools)。

## 生命周期上下文

控制核心代理步骤**之间**发生的情况 - 拦截数据流以实现横切关注点，例如汇总、护栏和日志记录。

正如您在 [Model Context](#model-context) 和 [Tool Context](#tool-context) 中看到的，[middleware](/oss/javascript/langchain/middleware) 是使上下文工程变得实用的机制。中间件允许您连接到代理生命周期中的任何步骤，并且：

1. **更新上下文** - 修改状态和存储以保存更改、更新对话历史记录或保存见解
2. **生命周期跳转** - 根据上下文移动到代理周期中的不同步骤（例如，如果满足条件则跳过工具执行，使用修改后的上下文重复模型调用）

<div>
  <img alt="Middleware hooks in the agent loop" />
</div>

### 示例：总结最常见的生命周期模式之一是当对话历史记录太长时自动压缩。与 [Model Context](#messages) 中显示的瞬时消息修剪不同，摘要**持续更新状态** - 用为未来所有轮次保存的摘要永久替换旧消息。

LangChain为此提供了内置中间件：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, summarizationMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [...],
  middleware: [
    summarizationMiddleware({
      model: "gpt-5.4-mini",
      trigger: { tokens: 4000 },
      keep: { messages: 20 },
    }),
  ],
});
```

当对话超过令牌限制时，`SummarizationMiddleware`自动：

1. 使用单独的 LLM 调用总结旧消息
2. 将它们替换为状态中的摘要消息（永久）
3. 保持最近消息的上下文完整

摘要对话历史记录会永久更新 - 将来的对话将看到摘要而不是原始消息。

<Note>
  有关内置中间件、可用挂钩以及如何创建自定义中间件的完整列表，请参阅 [Middleware documentation](/oss/javascript/langchain/middleware)。
</Note>

## 最佳实践1. **从简单开始** - 从静态提示和工具开始，仅在需要时添加动态
2. **增量测试** - 一次添加一项上下文工程功能
3. **监控性能** - 跟踪模型调用、令牌使用情况和延迟
4. **使用内置中间件** - 利用[⟦T30⟧](/oss/javascript/langchain/middleware#summarization)、[⟦T31⟧](/oss/javascript/langchain/middleware#llm-tool-selector)等。
5. **记录你的上下文策略** - 明确正在传递的上下文以及原因
6. **了解瞬态与持久性**：模型上下文更改是瞬态的（每次调用），而生命周期上下文更改会持续到状态

## 相关资源

* [Context conceptual overview](/oss/javascript/concepts/context) - 了解上下文类型以及何时使用它们
* [Middleware](/oss/javascript/langchain/middleware) - 完整的中间件指南
* [Tools](/oss/javascript/langchain/tools) - 工具创建和上下文访问
* [Memory](/oss/javascript/concepts/memory) - 短期和长期记忆模式
* [Agents](/oss/javascript/langchain/agents) - 核心代理概念

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/context-engineering.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>