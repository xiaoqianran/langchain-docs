<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Google Gemini Decisions integration | https://docs.langchain.com/oss/javascript/integrations/decision_models/google_generative_ai -->

# Google Gemini Decisions 集成

使用 LangChain JavaScript 与 GoogleClassifier 决策模型集成。

[Gemini Decisions API](https://aistudio.google.com/docs/decisions-api) 读取文本、结构化 JSON 和媒体，并返回键入的答案和概率，而不是生成的文本。

`GoogleClassifier` 将这些决策公开为 LangChain `Runnable`，因此您可以调用、批处理或将它们与其他可运行对象组合。它接受字符串、JSON 对象和数组、[LangChain message objects](/oss/javascript/langchain/messages) 和标准媒体块，并在 LangSmith 中记录跟踪和令牌使用情况。您还可以将其与[agent middleware](#agent-middleware)一起使用来路由模型和门工具调用。将其用于重点决策，例如路由请求、标记内容以供审查或评级严重性，其中应用程序代码根据概率或置信度进行操作。

> [!注意]
>
> `GoogleClassifier` 处于实验阶段，需要 `@langchain/google` 0.2.16 或更高版本以及 `@langchain/core` 1.4.2 或更高版本。其 API 可能会更改，恕不另行通知。

## 设置

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/google @langchain/core
```

```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
yarn add @langchain/google @langchain/core
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm add @langchain/google @langchain/core
```

在 [Google AI Studio](https://aistudio.google.com/apikey) 中创建 API 密钥并将其导出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY=...
```

`GoogleClassifier` 读取为 `GOOGLE_API_KEY`。使用 Gemini 开发者 API (Google AI Studio)。

## 快速入门

使用决策模型创建一个`GoogleClassifier`，然后在每次调用中一起传递状态和命名问题。共享状态的问题可在一个请求中得到解答：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { GoogleClassifier } from "@langchain/google";

const classifier = new GoogleClassifier("gemini-decision-1");

const response = await classifier.invoke({
  state: "The blue mug I ordered arrived cracked. Fix this today!",
  questions: {
    damaged: {
      type: "noul",
      instructions: "Did the item arrive damaged?",
      criteria: { true: "The item is broken, cracked, or dented." },
    },
    department: {
      type: "choice",
      instructions: "Which team should handle this request?",
      criteria: {
        billing: "Payment or refund questions.",
        shipping: "Delivery problems or damaged items.",
        other: null,
      },
    },
    frustration: {
      type: "score",
      instructions: "How frustrated does the customer appear?",
      criteria: ["Calm.", "Concerned but civil.", "Very angry."],
    },
  },
});

console.log(response.nouls.damaged.noul);
console.log(response.choices.department.choice, response.choices.department.confidence);
console.log(response.scores.frustration.score);
```答案按您提供的问题名称键入，并按 `nouls`、`choices` 和 `scores` 的类型分组。所有答案也可以在`answers`上找到。答案类型是从问题推断出来的，因此 `response.choices.department.choice` 的类型为 `"billing" | "shipping" | "other"`。响应中携带了应答的`model`以及`usage_metadata`中的token使用情况。

问题和回答类型，例如`Noul`和`ClassifierResponse`，来自`@langchain/core/decisions`。

每道题都需要`instructions`。在那里写下完整的问题，即使它的名字看起来不言自明。

## 问题类型

每个问题都是以下三种类型之一：|类型 |描述 |
| - | - |
| `noul` | **问**：这是真的吗？ **返回**：`noul`，`0.01`和`0.99`之间为“是”的概率，因此高于`0.99`的阈值永远不会匹配。接近 `0.5` 的值意味着不确定性，而不是“中等”，因此使用 `score` 作为频谱。当说明单独留出解释空间时，将 `criteria` 与 `true` 和 `false` 描述一起传递。 `noul`答案没有`confidence`，因为概率就是答案。 **在以下情况下使用它**：您的代码在 `if` 上分支。 |
| `choice` | **问**：以下哪个选项？ **回报**：`choice`，加上`probabilities`和`confidence`。将每个标签映射到描述，或者当标签不需要描述时映射到 `null`。 `choice` 至少需要两个标签。当您的选项可能无法涵盖所有​​输入时，请包含 `other` 标签。使用应用程序中的标记示例来设置阈值。 **在以下情况下使用它**：选项映射到不同的代码路径。 || `score` | **问**：哪个级别？ **返回**：`score`，加上 `legend`、`probabilities` 和 `confidence`。采取两个或更多级别，从最低到最高排序，并从`0`开始索引。返回的 `score` 是级别索引的概率加权平均值，因此它可能落在级别之间，并且 `legend` 将每个索引映射到您提供的级别。 **在何时**时伸手：答案是与阈值进行比较的频谱。 |

描述、标准和说明可以是文本或结构化 JSON。 JSON 内容作为 JSON 文本发送。 Decisions API 仅接受问题中的文本，因此 `instructions` 中的媒体块会抛出 `InvalidInputError`。

`@langchain/core/decisions` 还定义了 `box` 问题类型，用于定位图像中的对象。 Gemini Decisions API 不支持它，对于包含它的请求，`GoogleClassifier` 会抛出 `InvalidInputError`。

## 状态

`state` 可以是字符串、JSON 对象或数组、LangChain 消息或标准媒体块：* **字符串**：按原样发送。
* **JSON 对象和数组**：作为 JSON 文本发送。 LangChain 嵌套在其中的消息将转换为文本记录。
* **LangChain 消息**：转换为文本，每条消息一个条目，每个条目以其角色开头（例如，`user:` 或 `assistant:`）。消息内的媒体块作为本机媒体发送。
* **媒体块**：带有 base64 `data` 或 URL 的标准 `image`、`audio`、`video` 和 `file` 块，当它们出现在 `state` 的根、作为根 `state` 数组的元素或根消息内时，将作为本机媒体发送。嵌套在 JSON 对象内的媒体会抛出 `InvalidInputError`。

要对对话进行分类，请将消息作为状态传递：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const response = await classifier.invoke({
  state: [
    new HumanMessage("Where is my order?"),
    new AIMessage("It was delivered yesterday."),
    new HumanMessage("It arrived smashed to pieces."),
  ],
  questions: {
    damaged: { type: "noul", instructions: "Did the item arrive damaged?" },
  },
});
```

要对图像进行分类，请在根 `state` 数组中包含一个标准媒体块。将 `delivery.jpg` 替换为图像的路径：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { readFile } from "node:fs/promises";

const imageData = (await readFile("delivery.jpg")).toString("base64");

const response = await classifier.invoke({
  state: [
    "Photo of the delivered item.",
    { type: "image", data: imageData, mimeType: "image/jpeg" },
  ],
  questions: {
    damaged: { type: "noul", instructions: "Did the item arrive damaged?" },
  },
});
```

## 配置

将模型名称作为第一个参数传递，将选项作为第二个参数传递，或者使用 `model` 传递单个对象：|参数|描述 |
| - | - |
| `model` |决定型号名称，例如`gemini-decision-1`。必需的。 |
| `apiKey` |谷歌 API 密钥。默认为`GOOGLE_API_KEY`。 |
| `endpoint` | API 主机或基本 URL 覆盖。 |
| `apiVersion` | API版本路径段。默认为 `v1beta`。 |
| `mediaResolution` |未设置自己的图像和视频块的默认分辨率：`"low"`、`"medium"`、`"high"` 或 `"ultra_high"`（仅限图像）。 |
| `detail` | `mediaResolution` 的OpenAI 样式别名：`"auto"`、`"low"` 或 `"high"`。当两者都设置时，`mediaResolution`获胜。 |
| `customHeaders` |每个请求都会发送额外的 HTTP 标头。 |
| `maxRetries` |失败请求的最大重试次数。默认为 `6`。 |
| `maxConcurrency` |一次处理的最大请求数。默认为无限制。 |

要使用应用程序默认凭据或 `googleAuthOptions` 而不是 API 密钥进行身份验证，请从 `@langchain/google/node` 导入 `GoogleClassifier`。

## 错误* **`ConfigurationError`**：模型名称缺失或为空时抛出。
* **`AuthError`**：当没有`apiKey`或`GOOGLE_API_KEY`可用时抛出（并且没有为节点入口点配置凭据）。
* **`InvalidInputError`**：当请求包含 `box` 问题、问题指令包含媒体块或媒体块嵌套在 `state` 中的 JSON 对象内时抛出。
* **`PromptRefusedError`**：当API出于安全原因阻止输入时抛出。该消息包含阻止原因。使用 `@langchain/core/errors` 中的 `ModelRefusalError.isInstance(error)` 检查它。

## 代理中间件

`langchain` 包包括两个测试版中间件，它们在代理的决策点使用决策模型。传递 `GoogleClassifier` 作为他们的 `classifier`。两者都需要 `langchain` 1.6.5 或更高版本：

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langchain @langchain/google @langchain/core
```

```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
yarn add langchain @langchain/google @langchain/core
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm add langchain @langchain/google @langchain/core
```

### 路线模型

`modelRouterMiddleware` 根据最新的人工消息为每个代理运行选择一个命名模型，并将代理状态中的完整 `choice` 答案存储为 `modelRoute`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { GoogleClassifier } from "@langchain/google";
import { createAgent, modelRouterMiddleware } from "langchain";

const router = modelRouterMiddleware({
  choices: {
    fast: {
      model: "google:gemini-4-hydrogen",
      criteria: "Simple, well-scoped tasks.",
    },
    powerful: {
      model: "google:gemini-4-carbon",
      criteria: "Complex tasks that need deeper reasoning.",
    },
  },
  instructions: "Choose the least costly model that can complete the task.",
  classifier: new GoogleClassifier("gemini-decision-1"),
});

const agent = createAgent({
  model: "google:gemini-4-hydrogen",
  middleware: [router],
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "What is 2 + 2?" }],
});
console.log(result.modelRoute?.choice);
```

### Gate 工具调用

`autoModeMiddleware` 在运行之前检查对您列出的工具的每次调用。它向分类器询问调用有风险或授权不足的概率，并阻止`0.5`或以上的调用：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { GoogleClassifier } from "@langchain/google";
import { autoModeMiddleware, createAgent, tool } from "langchain";
import { z } from "zod";

const deleteFile = tool(async ({ path }) => `Deleted ${path}.`, {
  name: "delete_file",
  description: "Delete a file.",
  schema: z.object({ path: z.string() }),
});

const agent = createAgent({
  model: "google:gemini-4-hydrogen",
  tools: [deleteFile],
  middleware: [
    autoModeMiddleware({
      tools: [deleteFile],
      criteria: {
        true: "The call writes, deletes, publishes, or changes access.",
        false: "The call only reads public or user-provided data.",
      },
      classifier: new GoogleClassifier("gemini-decision-1"),
    }),
  ],
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Delete notes.txt." }],
});
console.log(result.messages.at(-1)?.text);
```对于这些`criteria`，删除文件被视为有风险，因此中间件返回错误`ToolMessage`而不是运行该工具，并且代理报告调用被阻止。如果没有`criteria`，默认指令允许调用用户明确请求的，因此相同的请求运行该工具。 `tools` 中未列出的工具无需分类即可运行。

## 追踪

`GoogleClassifier` 运行在 [LangSmith](/langsmith/observability) 中使用 `google` 提供程序和模型名称进行跟踪，因此您可以检查决策和令牌使用情况以及应用程序的其余部分。

## 另请参阅

* [Gemini Decisions API guide](https://aistudio.google.com/docs/decisions-api)
* [Google provider overview](/oss/javascript/integrations/providers/google)
* [ChatGoogle](/oss/javascript/integrations/chat/google)
* [Built-in middleware](/oss/javascript/langchain/middleware/built-in)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/decision_models/google_generative_ai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。