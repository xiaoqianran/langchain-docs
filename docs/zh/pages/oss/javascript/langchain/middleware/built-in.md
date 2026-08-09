<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prebuilt middleware | https://docs.langchain.com/oss/javascript/langchain/middleware/built-in -->

# 预构建中间件

适用于常见代理用例的预构建中间件

LangChain 和[Deep Agents](/oss/javascript/deepagents/overview) 为常见用例提供预构建的中间件。每个中间件均可投入生产并可根据您的特定需求进行配置。

## 与提供商无关的中间件

以下中间件适用于任何 LLM 提供商：

|中间件|描述 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Summarization](#summarization) |当接近令牌限制时自动总结对话历史记录。      |
| [Human-in-the-loop](#human-in-the-loop) |暂停执行以供人工批准工具调用。                                |
| [Model call limit](#model-call-limit) |限制模型调用次数，防止成本过高。                      |
| [Tool call limit](#tool-call-limit) |通过限制调用计数来控制工具执行。                                  |
| [Model fallback](#model-fallback) |当主模型出现故障时，自动回退到替代模型。                 || [PII detection](#pii-detection) |检测和处理个人身份信息 (PII)。                     |
| [To-do list](#to-do-list) |为代理配备任务规划和跟踪功能。                       |
| [LLM tool selector](#llm-tool-selector) |在调用主模型之前，使用LLM选择相关工具。                   |
| [Tool retry](#tool-retry) |使用指数退避自动重试失败的工具调用。                  |
| [Model retry](#model-retry) |使用指数退避自动重试失败的模型调用。                 |
| [LLM tool emulator](#llm-tool-emulator) |使用 LLM 模拟工具执行以进行测试。                        |
| [Context editing](#context-editing) |通过修剪或清除工具的使用来管理对话上下文。                   |
| [Provider tool search](#provider-tool-search) |将工具推迟到提供商的服务器端工具搜索后面，按需显示它们。 |
| [Filesystem](#filesystem-middleware) |为代理提供用于存储上下文和长期记忆的文件系统。     |
| [Subagent middleware](#subagent) |添加生成子代理的能力。                                              |

### 总结当接近令牌限制时自动总结对话历史记录，保留最近的消息，同时压缩旧的上下文。总结对于以下方面很有用：

* 超出上下文窗口的长时间运行的对话。
* 具有丰富历史的多轮对话。
* 保留完整对话上下文很重要的应用程序。

<Note>
  摘要是面向文本的上下文压缩。它不会调整大小、缩减采样或以其他方式压缩图像/音频/视频有效负载。 `keep` 保留的最新消息仍然包含其原始多模式块，而汇总的旧多模式消息仅由生成的文本摘要表示。对于图像较多的应用程序，将媒体存储在文件系统或对象存储中，并通过消息历史记录传递 URL 或文件引用。
</Note>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, summarizationMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [weatherTool, calculatorTool],
  middleware: [
    summarizationMiddleware({
      model: "gpt-5.4-mini",
      trigger: { tokens: 4000 },
      keep: { messages: 20 },
    }),
  ],
});
```

<Accordion title="Configuration options">
  <Tip>
    如果使用 `langchain@1.1.0`，`trigger` 和 `keep`（如下所示）的 `fraction` 条件依赖于聊天模型的 [profile data](/oss/javascript/langchain/models#model-profiles)。如果数据不可用，请使用其他条件或手动指定：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const customProfile: ModelProfile = {
        maxInputTokens: 100_000,
        // ...
    }
    model = await initChatModel("...", {
        profile: customProfile,
    });
    ```
  </Tip>

  <ParamField type="string | BaseChatModel">
    用于生成摘要的模型。可以是模型标识符字符串（例如，`'openai:gpt-5.4-mini'`）或`BaseChatModel`实例。
  </ParamField><ParamField type="object | object[]">
    触发汇总的条件。可以是：

    * 单个条件对象（所有属性必须满足 - AND 逻辑）
    * 条件对象数组（必须满足任何条件 - OR 逻辑）

    每个条件可以包括：

    * `fraction`（数字）：模型上下文大小的分数 (0-1)
    * `tokens` (number): 绝对令牌数
    * `messages` (number): 消息数

    每个条件必须至少指定一个属性。如果未提供，则不会自动触发摘要。
  </ParamField>

  <ParamField type="object">
    总结后要保留多少上下文。准确指定以下之一：

    * `fraction`（数字）：要保留的模型上下文大小的分数 (0-1)
    * `tokens`（数字）：要保留的绝对令牌数
    * `messages`（数字）：要保留的最近消息数
  </ParamField>

  <ParamField type="function">
    自定义令牌计数功能。默认为基于字符的计数。
  </ParamField>

  <ParamField type="string">
    自定义摘要提示模板。如果未指定，则使用内置模板。模板应包含 `{messages}` 占位符，将在其中插入对话历史记录。
  </ParamField><ParamField type="number">
    生成摘要时要包含的最大标记数。在汇总之前，消息将被修剪以适应此限制。
  </ParamField>

  <ParamField type="string">
    添加到摘要消息的前缀。如果未提供，则使用默认前缀。
  </ParamField>

  <ParamField type="number">
    **已弃用：** 使用 `trigger: { tokens: value }` 代替。触发汇总的令牌阈值。
  </ParamField>

  <ParamField type="number">
    **已弃用：** 使用 `keep: { messages: value }` 代替。要保留的最近消息。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  汇总中间件监视消息令牌计数，并在达到阈值时自动汇总旧消息。

  **触发条件**控制汇总何时运行：

  * 满足该阈值时触发单个阈值
  * 具有多个阈值的触发子句仅在满足所有阈值时触发（AND逻辑）
  * 触发条件列表，任意一项满足时触发（OR逻辑）
  * 每个阈值可以使用`fraction`（模型上下文大小）、`tokens`（绝对计数）或`messages`（消息计数）

  **保留条件**控制要保留的上下文数量（准确指定一个）：* `fraction` - 要保留的模型上下文大小的分数
  * `tokens` - 要保留的绝对令牌计数
  * `messages` - 要保留的最近消息数

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, summarizationMiddleware } from "langchain";

  // Single condition
  const agent = createAgent({
    model: "gpt-5.5",
    tools: [weatherTool, calculatorTool],
    middleware: [
      summarizationMiddleware({
        model: "gpt-5.4-mini",
        trigger: { tokens: 4000, messages: 10 },
        keep: { messages: 20 },
      }),
    ],
  });

  // Multiple conditions
  const agent2 = createAgent({
    model: "gpt-5.5",
    tools: [weatherTool, calculatorTool],
    middleware: [
      summarizationMiddleware({
        model: "gpt-5.4-mini",
        trigger: [
          { tokens: 3000, messages: 6 },
        ],
        keep: { messages: 20 },
      }),
    ],
  });

  // Using fractional limits
  const agent3 = createAgent({
    model: "gpt-5.5",
    tools: [weatherTool, calculatorTool],
    middleware: [
      summarizationMiddleware({
        model: "gpt-5.4-mini",
        trigger: { fraction: 0.8 },
        keep: { fraction: 0.3 },
      }),
    ],
  });
  ```
</Accordion>

### 人机交互

在执行之前暂停代理执行，以便人工批准、编辑或拒绝工具调用。 [Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop) 适用于以下情况：

* 需要人工批准的高风险操作（例如数据库写入、金融交易）。
* 强制进行人工监督的合规工作流程。
* 长时间运行的对话，人工反馈指导代理。

<Warning>
  人机循环中间件需要 [checkpointer](/oss/javascript/langgraph/checkpointers#checkpoints) 来维持中断状态。
</Warning>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, humanInTheLoopMiddleware } from "langchain";

function readEmailTool(emailId: string): string {
  /** Mock function to read an email by its ID. */
  return `Email content for ID: ${emailId}`;
}

function sendEmailTool(recipient: string, subject: string, body: string): string {
  /** Mock function to send an email. */
  return `Email sent to ${recipient} with subject '${subject}'`;
}

const agent = createAgent({
  model: "gpt-5.5",
  tools: [readEmailTool, sendEmailTool],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        sendEmailTool: {
          allowedDecisions: ["approve", "edit", "reject"],
        },
        readEmailTool: false,
      }
    })
  ]
});
```

<Tip>
  有关完整示例、配置选项和集成模式，请参阅 [Human-in-the-loop documentation](/oss/javascript/langchain/human-in-the-loop)。
</Tip>

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=tdOeUVERukA) 演示人机循环中间件行为。
</Callout>

### 模型调用限制

限制模型调用的数量，以防止无限循环或过高的成本。模型调用限制对于以下情况很有用：

* 防止失控的代理进行过多的 API 调用。
* 对生产部署实施成本控制。
* 测试座席在特定呼叫预算内的行为。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, modelCallLimitMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

const agent = createAgent({
  model: "gpt-5.5",
  checkpointer: new MemorySaver(), // Required for thread limiting
  tools: [],
  middleware: [
    modelCallLimitMiddleware({
      threadLimit: 10,
      runLimit: 5,
      exitBehavior: "end",
    }),
  ],
});
```<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=x5jLQTFXR0Y) 演示模型调用限制中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="number">
    线程中所有运行的最大模型调用数。默认为无限制。
  </ParamField>

  <ParamField type="number">
    每次调用的最大模型调用数。默认为无限制。
  </ParamField>

  <ParamField type="string">
    达到限制时的行为。选项：`'end'`（优雅终止）或`'error'`（抛出异常）
  </ParamField>
</Accordion>

### 工具调用限制

通过限制工具调用的数量来控制代理执行，无论是在所有工具中全局还是针对特定工具。工具调用限制对于以下用途很有用：

* 防止过度调用昂贵的外部 API。
* 限制网络搜索或数据库查询。
* 对特定工具的使用实施速率限制。
* 防止代理失控循环。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, toolCallLimitMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, databaseTool],
  middleware: [
    toolCallLimitMiddleware({ threadLimit: 20, runLimit: 10 }),
    toolCallLimitMiddleware({
      toolName: "search",
      threadLimit: 5,
      runLimit: 3,
    }),
  ],
});
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=oL6am5UqODY) 演示工具调用限制中间件行为。
</Callout>

<Accordion title="Configuration options">
  <ParamField type="string">
    要限制的特定工具的名称。如果未提供，限制适用于**全球所有工具**。
  </ParamField><ParamField type="number">
    线程（对话）中所有运行的最大工具调用数。在具有相同线程 ID 的多次调用中保持不变。需要检查指针来维护状态。 `undefined`表示无线程限制。
  </ParamField>

  <ParamField type="number">
    每次调用的最大工具调用数（一条用户消息 → 响应周期）。每条新用户消息都会重置。 `undefined` 表示无运行限制。

    **注意：** 必须至少指定 `threadLimit` 或 `runLimit` 之一。
  </ParamField>

  <ParamField type="string">
    达到限制时的行为：

    * `'continue'`（默认）- 使用错误消息阻止超出的工具调用，让其他工具和模型继续。模型根据错误消息决定何时结束。
    * `'error'` - 抛出`ToolCallLimitExceededError`异常，立即停止执行
    * `'end'` - 对于超出的工具调用，使用 ToolMessage 和 AI 消息立即停止执行。仅在限制单个工具时有效；如果其他工具有待处理的调用，则会抛出错误。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  指定限制：

  * **线程限制** - 对话中所有运行的最大调用数（需要检查指针）
  * **运行限制** - 每次调用的最大调用次数（每轮重置）

  退出行为：* `'continue'`（默认）- 阻止超出的呼叫并显示错误消息，代理继续
  * `'error'` - 立即引发异常
  * `'end'` - 使用 ToolMessage + AI 消息停止（仅限单工具场景）

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, toolCallLimitMiddleware } from "langchain";

  const globalLimiter = toolCallLimitMiddleware({ threadLimit: 20, runLimit: 10 });
  const searchLimiter = toolCallLimitMiddleware({ toolName: "search", threadLimit: 5, runLimit: 3 });
  const databaseLimiter = toolCallLimitMiddleware({ toolName: "query_database", threadLimit: 10 });
  const strictLimiter = toolCallLimitMiddleware({ toolName: "scrape_webpage", runLimit: 2, exitBehavior: "error" });

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [searchTool, databaseTool, scraperTool],
    middleware: [globalLimiter, searchLimiter, databaseLimiter, strictLimiter],
  });
  ```
</Accordion>

### 模型后备

当主要模型失败时自动回退到替代模型。模型回退对于以下情况很有用：

* 构建处理模型中断的弹性代理。
* 通过使用更便宜的型号来优化成本。
* OpenAI、Anthropic 等提供者冗余。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, modelFallbackMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    modelFallbackMiddleware(
      "gpt-5.4-mini",
      "claude-3-5-sonnet-20241022"
    ),
  ],
});
```

<Accordion title="Configuration options">
  中间件接受可变数量的字符串参数，按顺序表示后备模型：

  <ParamField type="string[]">
    当主模型失败时按顺序尝试的一个或多个后备模型字符串

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    modelFallbackMiddleware(
      "first-fallback-model",
      "second-fallback-model",
      // ... more models
    )
    ```
  </ParamField>
</Accordion>

### PII 检测

使用可配置策略检测和处理对话中的个人身份信息 (PII)。 PII 检测有以下用途：

* 具有合规性要求的医疗保健和金融应用。
* 需要清理日志的客户服务代理。
* 任何处理敏感用户数据的应用程序。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, piiMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    piiMiddleware("email", { strategy: "redact", applyToInput: true }),
    piiMiddleware("credit_card", { strategy: "mask", applyToInput: true }),
  ],
});
```

#### 自定义 PII 类型您可以通过提供 `detector` 参数来创建自定义 PII 类型。这使您可以检测除内置类型之外的特定于您的用例的模式。

**创建自定义检测器的三种方法：**

1. **正则表达式模式字符串** - 简单模式匹配

2. **RegExp 对象** - 对正则表达式标志的更多控制

3. **自定义函数** - 带验证的复杂检测逻辑

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, piiMiddleware, type PIIMatch } from "langchain";

// Method 1: Regex pattern string
const agent1 = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    piiMiddleware("api_key", {
      detector: "sk-[a-zA-Z0-9]{32}",
      strategy: "block",
    }),
  ],
});

// Method 2: RegExp object
const agent2 = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    piiMiddleware("phone_number", {
      detector: /\+?\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{4}/,
      strategy: "mask",
    }),
  ],
});

// Method 3: Custom detector function
function detectSSN(content: string): PIIMatch[] {
  const matches: PIIMatch[] = [];
  const pattern = /\d{3}-\d{2}-\d{4}/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const ssn = match[0];
    // Validate: first 3 digits shouldn't be 000, 666, or 900-999
    const firstThree = parseInt(ssn.substring(0, 3), 10);
    if (firstThree !== 0 && firstThree !== 666 && !(firstThree >= 900 && firstThree <= 999)) {
      matches.push({
        text: ssn,
        start: match.index ?? 0,
        end: (match.index ?? 0) + ssn.length,
      });
    }
  }
  return matches;
}

const agent3 = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    piiMiddleware("ssn", {
      detector: detectSSN,
      strategy: "hash",
    }),
  ],
});
```

**自定义检测器函数签名：**

检测器函数必须接受字符串（内容）并返回匹配项：

返回 `PIIMatch` 对象的数组：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
interface PIIMatch {
  text: string;    // The matched text
  start: number;   // Start index in content
  end: number;      // End index in content
}

function detector(content: string): PIIMatch[] {
  return [
    { text: "matched_text", start: 0, end: 12 },
    // ... more matches
  ];
}
```

<Tip>
  对于定制探测器：

  * 对简单模式使用正则表达式字符串
  * 当需要标志时使用 RegExp 对象（例如，不区分大小写的匹配）
  * 当您需要模式匹配之外的验证逻辑时，请使用自定义函数
  * 自定义函数让您完全控制检测逻辑并可以实现复杂的验证规则
</Tip>

<Accordion title="Configuration options">
  <ParamField type="string">
    要检测的 PII 类型。可以是内置类型（`email`、`credit_card`、`ip`、`mac_address`、`url`）或自定义类型名称。
  </ParamField>

  <ParamField type="string">
    如何处理检测到的 PII。选项：* `'block'` - 检测到时抛出错误
    * `'redact'` - 替换为 `[REDACTED_TYPE]`
    * `'mask'` - 部分屏蔽（例如，`****-****-****-1234`）
    * `'hash'` - 替换为确定性哈希（例如，`<email_hash:a1b2c3d4>`）
  </ParamField>

  <ParamField type="RegExp | string | function">
    定制探测器。可以是：

    * `RegExp` - 用于匹配的正则表达式模式
    * `string` - 正则表达式模式字符串（例如，`"sk-[a-zA-Z0-9]{32}"`）
    * `function` - 自定义探测器功能`(content: string) => PIIMatch[]`

    如果未提供，则使用 PII 类型的内置检测器。
  </ParamField>

  <ParamField type="boolean">
    模型调用前检查用户消息
  </ParamField>

  <ParamField type="boolean">
    模型调用后查看AI消息
  </ParamField>

  <ParamField type="boolean">
    执行后检查工具结果消息
  </ParamField>
</Accordion>

### 待办事项列表

为代理配备任务规划和跟踪功能，以执行复杂的多步骤任务。待办事项列表对于以下用途很有用：

* 复杂的多步骤任务需要跨多个工具进行协调。
* 长期运行的操作，其中进度可见性非常重要。

<Note>
  该中间件自动为代理提供`write_todos`工具和系统提示来指导有效的任务规划。
</Note>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, todoListMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [readFile, writeFile, runTests],
  middleware: [todoListMiddleware()],
});
```

<Callout icon="player-play">
  观看这个 [video guide](https://www.youtube.com/watch?v=dwvhZ1z_Pas) 演示待办事项列表中间件行为。
</Callout><Accordion title="Configuration options">
  没有可用的配置选项（使用默认值）。
</Accordion>

### LLM 工具选择器

在调用主模型之前，使用LLM智能地选择相关工具。 LLM 工具选择器可用于以下用途：

* 具有许多工具（10+）的代理，其中大多数工具与每个查询都不相关。
* 通过过滤不相关的工具来减少代币使用。
* 提高模型焦点和准确性。

该中间件使用结构化输出来询问法学硕士哪些工具与当前查询最相关。结构化输出模式定义了可用的工具名称和描述。模型提供者通常会将此结构化输出信息添加到幕后的系统提示中。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, llmToolSelectorMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [tool1, tool2, tool3, tool4, tool5, ...],
  middleware: [
    llmToolSelectorMiddleware({
      model: "gpt-5.4-mini",
      maxTools: 3,
      alwaysInclude: ["search"],
    }),
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="string | BaseChatModel">
    工具选择模型。可以是模型标识符字符串（例如，`'openai:gpt-5.4-mini'`）或`BaseChatModel`实例。默认为代理的主要模型。
  </ParamField>

  <ParamField type="string">
    型号选择说明。如果未指定，则使用内置提示。
  </ParamField>

  <ParamField type="number">
    选择的工具的最大数量。如果模型选择更多，则仅使用第一个 maxTools。如果没有指定则没有限制。
  </ParamField><ParamField type="string[]">
    无论选择如何，始终包含工具名称。这些不计入 maxTools 限制。
  </ParamField>
</Accordion>

### 工具错误

### 工具重试

使用可配置的指数退避自动重试失败的工具调用。工具重试对于以下情况很有用：

* 处理外部 API 调用中的瞬时故障。
* 提高依赖网络的工具的可靠性。
* 构建能够优雅地处理临时错误的弹性代理。

**API参考：** [⟦T85⟧](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, toolRetryMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, databaseTool],
  middleware: [
    toolRetryMiddleware({
      maxRetries: 3,
      backoffFactor: 2.0,
      initialDelayMs: 1000,
    }),
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="number">
    首次调用后的最大重试次数（默认为 3 次）。必须 >= 0。
  </ParamField>

  <ParamField type="(ClientTool | ServerTool | string)[]">
    要应用重试逻辑的可选工具或工具名称数组。可以是 `BaseTool` 实例列表或工具名称字符串。如果`undefined`，适用于所有工具。
  </ParamField>

  <ParamField type="((error: Error) => 布尔值) | （新（...args：任何[]）=>错误）[]">
    要重试的错误构造函数数组，或者是接受错误并在应该重试时返回 `true` 的函数。默认是重试所有错误。
  </ParamField>

  <ParamField type="'error' | 'continue' | ((error: Error) => 字符串)">
    所有重试都用尽时的行为。选项：* `'continue'`（默认）- 返回包含错误详细信息的 `ToolMessage`，允许 LLM 处理故障并可能恢复
    * `'error'` - 重新引发异常，停止代理执行
    * 自定义函数 - 接受异常并返回`ToolMessage`内容字符串的函数，允许自定义错误格式

    **弃用值：** `'raise'`（使用 `'error'` 代替）和 `'return_message'`（使用 `'continue'` 代替）。这些已弃用的值仍然有效，但会显示警告。
  </ParamField>

  <ParamField type="number">
    指数退避的乘数。每次重试都会等待 `initialDelayMs * (backoffFactor ** retryNumber)` 毫秒。设置为 `0.0` 以获得恒定延迟。必须 >= 0。
  </ParamField>

  <ParamField type="number">
    第一次重试之前的初始延迟（以毫秒为单位）。必须 >= 0。
  </ParamField>

  <ParamField type="number">
    重试之间的最大延迟（以毫秒为单位）（限制指数退避增长）。必须 >= 0。
  </ParamField>

  <ParamField type="boolean">
    是否添加随机抖动（`±25%`）进行延迟以避免雷群
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件会通过指数退避自动重试失败的工具调用。

  **关键配置：*** `maxRetries` - 重试次数（默认值：2）
  * `backoffFactor` - 指数退避乘数（默认值：2.0）
  * `initialDelayMs` - 启动延迟（以毫秒为单位）（默认值：1000ms）
  * `maxDelayMs` - 延迟增长上限（默认值：60000ms）
  * `jitter` - 添加随机变化（默认值：true）

  **故障处理：**

  * `onFailure: "continue"` (默认) - 返回错误信息
  * `onFailure: "error"` - 重新引发异常
  * 自定义函数 - 返回错误消息的函数

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, toolRetryMiddleware } from "langchain";
  import { tool } from "@langchain/core/tools";
  import { z } from "zod";

  // Basic usage with default settings (2 retries, exponential backoff)
  const agent = createAgent({
    model: "gpt-5.5",
    tools: [searchTool, databaseTool],
    middleware: [toolRetryMiddleware()],
  });

  // Retry specific exceptions only
  const retry = toolRetryMiddleware({
    maxRetries: 4,
    retryOn: [TimeoutError, NetworkError],
    backoffFactor: 1.5,
  });

  // Custom exception filtering
  function shouldRetry(error: Error): boolean {
    // Only retry on 5xx errors
    if (error.name === "HTTPError" && "statusCode" in error) {
      const statusCode = (error as any).statusCode;
      return 500 <= statusCode && statusCode < 600;
    }
    return false;
  }

  const retryWithFilter = toolRetryMiddleware({
    maxRetries: 3,
    retryOn: shouldRetry,
  });

  // Apply to specific tools with custom error handling
  const formatError = (error: Error) =>
    "Database temporarily unavailable. Please try again later.";

  const retrySpecificTools = toolRetryMiddleware({
    maxRetries: 4,
    tools: ["search_database"],
    onFailure: formatError,
  });

  // Apply to specific tools using BaseTool instances
  const searchDatabase = tool(
    async ({ query }) => {
      // Search implementation
      return results;
    },
    {
      name: "search_database",
      description: "Search the database",
      schema: z.object({ query: z.string() }),
    }
  );

  const retryWithToolInstance = toolRetryMiddleware({
    maxRetries: 4,
    tools: [searchDatabase], // Pass BaseTool instance
  });

  // Constant backoff (no exponential growth)
  const constantBackoff = toolRetryMiddleware({
    maxRetries: 5,
    backoffFactor: 0.0, // No exponential growth
    initialDelayMs: 2000, // Always wait 2 seconds
  });

  // Raise exception on failure
  const strictRetry = toolRetryMiddleware({
    maxRetries: 2,
    onFailure: "error", // Re-raise exception instead of returning message
  });
  ```
</Accordion>

### 模型重试

使用可配置的指数退避自动重试失败的模型调用。模型重试对于以下情况很有用：

* 处理模型 API 调用中的瞬时故障。
* 提高网络相关模型请求的可靠性。
* 构建有弹性的代理，可以优雅地处理临时模型错误。

**API参考：** [⟦T107⟧](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, modelRetryMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, databaseTool],
  middleware: [
    modelRetryMiddleware({
      maxRetries: 3,
      backoffFactor: 2.0,
      initialDelayMs: 1000,
    }),
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="number">
    首次调用后的最大重试次数（默认为 3 次）。必须 >= 0。
  </ParamField>

  <ParamField type="((error: Error) =>布尔值）| （新（...args：任何[]）=>错误）[]">
    要重试的错误构造函数数组，或者是接受错误并在应该重试时返回 `true` 的函数。默认是重试所有错误。
  </ParamField><ParamField type="'error' | 'continue' | ((error: Error) => 字符串)">
    所有重试都用尽时的行为。选项：

    * `'continue'`（默认）- 返回包含错误详细信息的 `AIMessage`，允许代理优雅地处理故障
    * `'error'` - 重新引发异常，停止代理执行
    * 自定义函数 - 接受异常并返回 `AIMessage` 内容的字符串的函数，允许自定义错误格式
  </ParamField>

  <ParamField type="number">
    指数退避的乘数。每次重试都会等待 `initialDelayMs * (backoffFactor ** retryNumber)` 毫秒。设置为 `0.0` 以获得恒定延迟。必须 >= 0。
  </ParamField>

  <ParamField type="number">
    第一次重试之前的初始延迟（以毫秒为单位）。必须 >= 0。
  </ParamField>

  <ParamField type="number">
    重试之间的最大延迟（以毫秒为单位）（限制指数退避增长）。必须 >= 0。
  </ParamField>

  <ParamField type="boolean">
    是否添加随机抖动（`±25%`）进行延迟以避免雷群
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件会通过指数退避自动重试失败的模型调用。

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, modelRetryMiddleware } from "langchain";

  // Basic usage with default settings (2 retries, exponential backoff)
  const agent = createAgent({
    model: "gpt-5.5",
    tools: [searchTool],
    middleware: [modelRetryMiddleware()],
  });

  class TimeoutError extends Error {
      // ...
  }
  class NetworkError extends Error {
      // ...
  }

  // Retry specific exceptions only
  const retry = modelRetryMiddleware({
    maxRetries: 4,
    retryOn: [TimeoutError, NetworkError],
    backoffFactor: 1.5,
  });

  // Custom exception filtering
  function shouldRetry(error: Error): boolean {
    // Only retry on rate limit errors
    if (error.name === "RateLimitError") {
      return true;
    }
    // Or check for specific HTTP status codes
    if (error.name === "HTTPError" && "statusCode" in error) {
      const statusCode = (error as any).statusCode;
      return statusCode === 429 || statusCode === 503;
    }
    return false;
  }

  const retryWithFilter = modelRetryMiddleware({
    maxRetries: 3,
    retryOn: shouldRetry,
  });

  // Return error message instead of raising
  const retryContinue = modelRetryMiddleware({
    maxRetries: 4,
    onFailure: "continue", // Return AIMessage with error instead of throwing
  });

  // Custom error message formatting
  const formatError = (error: Error) =>
    `Model call failed: ${error.message}. Please try again later.`;

  const retryWithFormatter = modelRetryMiddleware({
    maxRetries: 4,
    onFailure: formatError,
  });

  // Constant backoff (no exponential growth)
  const constantBackoff = modelRetryMiddleware({
    maxRetries: 5,
    backoffFactor: 0.0, // No exponential growth
    initialDelayMs: 2000, // Always wait 2 seconds
  });

  // Raise exception on failure
  const strictRetry = modelRetryMiddleware({
    maxRetries: 2,
    onFailure: "error", // Re-raise exception instead of returning message
  });
  ```
</Accordion>

### LLM工具模拟器

使用 LLM 模拟工具执行以进行测试，用 AI 生成的响应替换实际的工具调用。 LLM 工具模拟器可用于以下用途：* 无需执行真实工具即可测试代理行为。
* 当外部工具不可用或昂贵时开发代理。
* 在实施实际工具之前对代理工作流程进行原型设计。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, toolEmulatorMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [getWeather, searchDatabase, sendEmail],
  middleware: [
    toolEmulatorMiddleware(), // Emulate all tools
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="(string | ClientTool | ServerTool)[]">
    要模拟的工具名称（字符串）或工具实例的列表。如果`undefined`（默认），将模拟所有工具。如果空数组`[]`，则不会模拟任何工具。如果数组包含工具名称/实例，则仅模拟这些工具。
  </ParamField>

  <ParamField type="string | BaseChatModel">
    用于生成模拟工具响应的模型。可以是模型标识符字符串（例如，`'google_genai:gemini-3.6-flash'`）或`BaseChatModel`实例。如果未指定，则默认为代理的型号。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件使用 LLM 为工具调用生成合理的响应，而不是执行实际的工具。

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, toolEmulatorMiddleware, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    async ({ location }) => `Weather in ${location}`,
    {
      name: "get_weather",
      description: "Get the current weather for a location",
      schema: z.object({ location: z.string() }),
    }
  );

  const sendEmail = tool(
    async ({ to, subject, body }) => "Email sent",
    {
      name: "send_email",
      description: "Send an email",
      schema: z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      }),
    }
  );

  // Emulate all tools (default behavior)
  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, sendEmail],
    middleware: [toolEmulatorMiddleware()],
  });

  // Emulate specific tools by name
  const agent2 = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, sendEmail],
    middleware: [
      toolEmulatorMiddleware({
        tools: ["get_weather"],
      }),
    ],
  });

  // Emulate specific tools by passing tool instances
  const agent3 = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, sendEmail],
    middleware: [
      toolEmulatorMiddleware({
        tools: [getWeather],
      }),
    ],
  });

  // Use custom model for emulation
  const agent5 = createAgent({
    model: "gpt-5.5",
    tools: [getWeather, sendEmail],
    middleware: [
      toolEmulatorMiddleware({
        model: "claude-sonnet-4-6",
      }),
    ],
  });
  ```
</Accordion>

### 上下文编辑

通过在达到令牌限制时清除旧工具调用输出来管理对话上下文，同时保留最近的结果。这有助于在与许多工具调用的长时间对话中保持上下文窗口的可管理性。上下文编辑对于以下用途很有用：* 与许多超出令牌限制的工具调用进行长时间对话
* 通过删除不再相关的旧工具输出来降低代币成本
* 仅维护上下文中最新的 N 个工具结果

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, contextEditingMiddleware, ClearToolUsesEdit } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    contextEditingMiddleware({
      edits: [
        new ClearToolUsesEdit({
          triggerTokens: 100000,
          keep: 3,
        }),
      ],
    }),
  ],
});
```

<Accordion title="Configuration options">
  <ParamField type="ContextEdit[]">
    一系列[⟦T120⟧](https://reference.langchain.com/javascript/langchain/index/ContextEdit)应用策略
  </ParamField>

  **[⟦T121⟧](https://reference.langchain.com/javascript/langchain/index/ClearToolUsesEdit)选项：**

  <ParamField type="number">
    触发编辑的令牌计数。当对话超过此令牌计数时，旧工具输出将被清除。
  </ParamField>

  <ParamField type="number">
    编辑运行时要回收的最小令牌数。如果设置为 0，则根据需要清除。
  </ParamField>

  <ParamField type="number">
    必须保留的最新工具结果的数量。这些永远不会被清除。
  </ParamField>

  <ParamField type="boolean">
    是否清除AI消息上的原始工具调用参数。当`true`时，工具调用参数被替换为空对象。
  </ParamField>

  <ParamField type="string[]">
    要从清除中排除的工具名称列表。这些工具的输出永远不会被清除。
  </ParamField>

  <ParamField type="string">
    为清除的工具输出插入占位符文本。这替换了原始工具消息内容。
  </ParamField>
</Accordion><Accordion title="Full example">
  当达到令牌限制时，中间件应用上下文编辑策略。最常见的策略是`ClearToolUsesEdit`，它清除旧的工具结果，同时保留最新的结果。

  **它是如何工作的：**

  1. 监控对话中的令牌计数
  2. 当达到阈值时，清除旧工具输出
  3.保留最近的N个工具结果
  4. 有选择地保留上下文的工具调用参数

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, contextEditingMiddleware, ClearToolUsesEdit } from "langchain";

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [searchTool, calculatorTool, databaseTool],
    middleware: [
      contextEditingMiddleware({
        edits: [
          new ClearToolUsesEdit({
            triggerTokens: 2000,
            keep: 3,
            clearToolInputs: false,
            excludeTools: [],
            placeholder: "[cleared]",
          }),
        ],
      }),
    ],
  });
  ```
</Accordion>

### 提供商工具搜索

将选定的工具推迟到模型提供者的服务器端工具搜索之后，以便模型按需发现它们，而不是预先接收每个工具模式。提供商工具搜索可用于：

* 减少使用许多工具时的上下文膨胀。
* 通过仅显示相关工具来提高工具选择的准确性。

<Note>
  需要具有服务器端工具搜索支持的模型：Anthropic (Claude Sonnet 4+/Opus 4+/Haiku 4.5+) 或 OpenAI (gpt-5.5+)。其他提供者会抛出错误。
</Note>

**API参考：** [⟦T124⟧](https://reference.langchain.com/javascript/langchain/index/providerToolSearchMiddleware)

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, providerToolSearchMiddleware } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(async () => "Sunny, 22C", {
  name: "get_weather",
  description: "Get the current weather for a city",
  schema: z.object({ city: z.string() }),
});

const lookupOrderStatus = tool(async () => "OUT_FOR_DELIVERY", {
  name: "lookup_order_status",
  description: "Look up the current delivery status of a customer order by ID",
  schema: z.object({ orderId: z.string() }),
});

const nicheTools = [lookupOrderStatus];

const agent = createAgent({
  model: "anthropic:claude-opus-4-8",
  tools: [getWeather, ...nicheTools],
  middleware: [
    providerToolSearchMiddleware({ searchableTools: nicheTools }),
  ],
});
```<Accordion title="Configuration options">
  <ParamField type="(string | StructuredToolInterface)[]">
    推迟提供者工具搜索的工具，按名称或实例给出。延迟的工具将从模型中保留，直到搜索显示它们为止。无论此选项如何，使用 `extras.defer_loading: true` 构建的工具都会被推迟；如果省略`searchableTools`，则仅推迟那些预先标记的工具。
  </ParamField>
</Accordion>

<Accordion title="Full example">
  中间件选择使用 `searchableTools` 中包含的所有工具来进行延迟和搜索。工具还可以通过设置 `extras.defer_loading: true` 在构建时选择延迟

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, providerToolSearchMiddleware } from "langchain";
  import { tool } from "@langchain/core/tools";
  import { z } from "zod";

  // Marked `defer_loading` at construction, so it's deferred on its own —
  // no need to list it in `searchableTools`.
  const sendEmail = tool(async () => "sent", {
    name: "send_email",
    description: "Send an email",
    schema: z.object({ to: z.string() }),
    extras: { defer_loading: true },
  });

  const agent = createAgent({
    model: "anthropic:claude-opus-4-8",
    tools: [sendEmail],
    middleware: [providerToolSearchMiddleware()],
  });
  ```
</Accordion>

### 文件系统中间件

上下文工程是构建有效代理的主要挑战。当使用返回可变长度结果的工具（例如，`web_search`和RAG）时，这尤其困难，因为长工具结果可以快速填满上下文窗口。

[Deep Agents](/oss/javascript/deepagents/overview) 中的`FilesystemMiddleware` 提供了四种与短期和长期记忆交互的工具：

* `ls`：列出文件系统中的文件
* `read_file`：读取整个文件或文件中的特定行数
* `write_file`：将新文件写入文件系统
* `edit_file`：编辑文件系统中的现有文件

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import { createFilesystemMiddleware } from "deepagents";

// FilesystemMiddleware is included by default in createDeepAgent
// You can customize it if building a custom agent
const agent = createAgent({
  model: "claude-sonnet-4-6",
  middleware: [
    createFilesystemMiddleware({
      backend: undefined,  // Optional: custom backend (defaults to StateBackend)
      systemPrompt: "Write to the filesystem when...",  // Optional custom system prompt override
      customToolDescriptions: {
        ls: "Use the ls tool when...",
        read_file: "Use the read_file tool to...",
      },  // Optional: Custom descriptions for filesystem tools
    }),
  ],
});
```

#### 短期与长期文件系统默认情况下，这些工具会写入图形状态下的本地“文件系统”。要跨线程启用持久存储，请配置将特定路径（如 `/memories/`）路由到 `StoreBackend` 的 `CompositeBackend`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import { createFilesystemMiddleware, CompositeBackend, StateBackend, StoreBackend } from "deepagents";
import { InMemoryStore } from "@langchain/langgraph-checkpoint";

const store = new InMemoryStore();

const agent = createAgent({
  model: "claude-sonnet-4-6",
  store,
  middleware: [
    createFilesystemMiddleware({
      backend: new CompositeBackend(
        new StateBackend(),
        { "/memories/": new StoreBackend() }
      ),
      systemPrompt: "Write to the filesystem when...", // Optional custom system prompt override
      customToolDescriptions: {
        ls: "Use the ls tool when...",
        read_file: "Use the read_file tool to...",
      }, // Optional: Custom descriptions for filesystem tools
    }),
  ],
});
```

当您为 `/memories/` 配置 `CompositeBackend` 和 `StoreBackend` 时，任何以 **/memories/** 为前缀的文件都会保存到持久存储中，并在不同线程中保存。没有此前缀的文件保留在临时状态存储中。

### 子代理

将任务交给子代理可以隔离上下文，保持主（主管）代理的上下文窗口干净，同时仍然深入执行任务。

[Deep Agents](/oss/javascript/deepagents/overview) 的子代理中间件允许您通过 `task` 工具提供子代理。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { createAgent } from "langchain";
import { createSubAgentMiddleware } from "deepagents";
import { z } from "zod";

const getWeather = tool(
  async ({ city }: { city: string }) => {
    return `The weather in ${city} is sunny.`;
  },
  {
    name: "get_weather",
    description: "Get the weather in a city.",
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createAgent({
  model: "claude-sonnet-4-6",
  middleware: [
    createSubAgentMiddleware({
      defaultModel: "claude-sonnet-4-6",
      defaultTools: [],
      subagents: [
        {
          name: "weather",
          description: "This subagent can get weather in cities.",
          systemPrompt: "Use the get_weather tool to get the weather in a city.",
          tools: [getWeather],
          model: "gpt-5.5",
          middleware: [],
        },
      ],
    }),
  ],
});
```

子代理使用**名称**、**描述**、**系统提示**和**工具**进行定义。您还可以为子代理提供自定义**模型**或附加**中间件**。当您想要为子代理提供额外的状态密钥以与主代理共享时，这尤其有用。

对于更复杂的用例，您还可以提供自己的预构建 LangGraph 图作为子代理。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, createAgent } from "langchain";
import { createSubAgentMiddleware, type SubAgent } from "deepagents";
import { z } from "zod";

const getWeather = tool(
  async ({ city }: { city: string }) => {
    return `The weather in ${city} is sunny.`;
  },
  {
    name: "get_weather",
    description: "Get the weather in a city.",
    schema: z.object({
      city: z.string(),
    }),
  },
);

const weatherSubagent: SubAgent = {
  name: "weather",
  description: "This subagent can get weather in cities.",
  systemPrompt: "Use the get_weather tool to get the weather in a city.",
  tools: [getWeather],
  model: "gpt-5.5",
  middleware: [],
};

const agent = createAgent({
  model: "claude-sonnet-4-6",
  middleware: [
    createSubAgentMiddleware({
      defaultModel: "claude-sonnet-4-6",
      defaultTools: [],
      subagents: [weatherSubagent],
    }),
  ],
});
```除了任何用户定义的子代理之外，主代理还可以随时访问`general-purpose`子代理。该子代理具有与主代理相同的指令以及它有权访问的所有工具。 `general-purpose` 子代理的主要目的是上下文隔离——主代理可以将复杂的任务委托给该子代理，并获得简洁的答案，而不会因中间工具调用而造成臃肿。

## 特定于提供商的中间件

这些中间件针对特定的 LLM 提供商进行了优化。有关完整的详细信息和示例，请参阅每个提供商的文档。

<Columns>
  <Card title="Anthropic" href="/oss/javascript/integrations/middleware/anthropic" icon="https://mintcdn.com/langchain-5e9cc07a/y4fKEo7ANyWBQMjp/images/providers/anthropic-icon.svg?fit=max&auto=format&n=y4fKEo7ANyWBQMjp&q=85&s=9212db764598a2d3f02f471b5436ae9e">
    Claude 模型的提示缓存、bash 工具、文本编辑器、内存和文件搜索中间件。
  </Card>

  <Card title="AWS" href="/oss/javascript/integrations/middleware/aws" icon="brand-aws">
    Amazon Bedrock 模型的提示缓存中间件。
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/built-in.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>