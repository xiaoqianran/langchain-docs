<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Guardrails | https://docs.langchain.com/oss/javascript/langchain/guardrails -->

# 护栏

为您的代理实施安全检查和内容过滤

Guardrails 通过在代理执行的关键点验证和过滤内容，帮助您构建安全、合规的 AI 应用程序。他们可以检测敏感信息、执行内容策略、验证输出并在不安全行为引起问题之前阻止它们。

常见用例包括：

* 防止 PII 泄露
* 检测并阻止即时注入攻击
* 阻止不适当或有害的内容
* 执行业务规则和合规要求
* 验证输出质量和准确性

您可以使用 [middleware](/oss/javascript/langchain/middleware) 实现护栏，以在代理启动之前、完成之后或模型和工具调用周围拦截战略点的执行。

<div>
  <img alt="Middleware flow diagram" />
</div>

护栏可以使用两种互补的方法来实现：

<CardGroup>
  <Card title="Deterministic guardrails" icon="list-check">
    使用基于规则的逻辑，例如正则表达式模式、关键字匹配或显式检查。快速、可预测且具有成本效益，但可能会错过细微的违规行为。
  </Card><Card title="Model-based guardrails" icon="brain">
    使用法学硕士或分类器通过语义理解来评估内容。捕捉规则遗漏的微妙问题，但速度更慢且成本更高。
  </Card>
</CardGroup>

LangChain 提供内置护栏（例如[PII detection](#pii-detection)、[human-in-the-loop](#human-in-the-loop)）和灵活的中间件系统，用于使用任一方法构建自定义护栏。

## 内置护栏

### PII 检测

LangChain提供内置中间件来检测和处理对话中的个人身份信息（PII）。该中间件可以检测常见的 PII 类型，例如电子邮件、信用卡、IP 地址等。

PII 检测中间件对于具有合规性要求的医疗保健和金融应用程序、需要清理日志的客户服务代理以及通常处理敏感用户数据的任何应用程序等情况很有帮助。

PII 中间件支持多种处理检测到的 PII 的策略：|战略|描述 |示例|
| -------- | --------------------------------------- | -------------------- |
| `redact` |替换为`[REDACTED_{PII_TYPE}]` | `[REDACTED_EMAIL]` |
| `mask` |部分模糊（例如最后 4 位数字）| `****-****-****-1234` |
| `hash` |替换为确定性哈希 | `a8f5f167...` |
| `block` |检测到时引发异常 |抛出错误 |

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, piiRedactionMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [customerServiceTool, emailTool],
  middleware: [
    // Redact emails in user input before sending to model
    piiRedactionMiddleware({
      piiType: "email",
      strategy: "redact",
      applyToInput: true,
    }),
    // Mask credit cards in user input
    piiRedactionMiddleware({
      piiType: "credit_card",
      strategy: "mask",
      applyToInput: true,
    }),
    // Block API keys - raise error if detected
    piiRedactionMiddleware({
      piiType: "api_key",
      detector: /sk-[a-zA-Z0-9]{32}/,
      strategy: "block",
      applyToInput: true,
    }),
  ],
});

// When user provides PII, it will be handled according to the strategy
const result = await agent.invoke({
  messages: [{
    role: "user",
    content: "My email is john.doe@example.com and card is 5105-1051-0510-5100"
  }]
});
```

<Accordion title="Built-in PII types and configuration">
  **内置 PII 类型：**

  * `email` - 电子邮件地址
  * `credit_card` - 信用卡号码（经过 Luhn 验证）
  * `ip` - IP 地址
  * `mac_address` - MAC 地址
  * `url` - URL

  **配置选项：**|参数|描述 |默认 |
  | -------------------- | ---------------------------------------------------------------------------------- | ------------------------ | |
  | `piiType` |要检测的 PII 类型（内置或自定义）|必填|
  | `strategy` |如何处理检测到的 PII（`"block"`、`"redact"`、`"mask"`、`"hash"`）| `"redact"` |
  | `detector` |自定义检测器正则表达式模式 | `undefined`（使用内置）|
  | `applyToInput` |模型调用前查看用户消息 | `true` |
  | `applyToOutput` |模型调用后查看AI消息 | `false` |
  | `applyToToolResults` |执行后检查工具结果消息 | `false` |
</Accordion>

有关 PII 检测功能的完整详细信息，请参阅 [middleware documentation](/oss/javascript/langchain/middleware#pii-detection)。

### 人机交互LangChain提供内置中间件，在执行敏感操作之前需要人工批准。这是高风险决策最有效的护栏之一。

人机交互中间件对于金融交易和转账、删除或修改生产数据、向外部各方发送通信以及任何具有重大业务影响的操作等情况很有帮助。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { MemorySaver, Command } from "@langchain/langgraph";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, sendEmailTool, deleteDatabaseTool],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        // Require approval for sensitive operations
        send_email: { allowAccept: true, allowEdit: true, allowRespond: true },
        delete_database: { allowAccept: true, allowEdit: true, allowRespond: true },
        // Auto-approve safe operations
        search: false,
      }
    }),
  ],
  checkpointer: new MemorySaver(),
});

// Human-in-the-loop requires a thread ID for persistence
const config = { configurable: { thread_id: "some_id" } };

// Agent will pause and wait for approval before executing sensitive tools
let result = await agent.invoke(
  { messages: [{ role: "user", content: "Send an email to the team" }] },
  config
);

result = await agent.invoke(
  new Command({ resume: { decisions: [{ type: "approve" }] } }),
  config  // Same thread ID to resume the paused conversation
);
```

<Tip>
  有关实施审批工作流程的完整详细信息，请参阅[human-in-the-loop documentation](/oss/javascript/langchain/human-in-the-loop)。
</Tip>

## 定制护栏

对于更复杂的护栏，您可以创建在代理执行之前或之后运行的自定义中间件。这使您可以完全控制验证逻辑、内容过滤和安全检查。

### 特工护栏前

使用“before agent”挂钩在每次调用开始时验证一次请求。这对于会话级检查非常有用，例如身份验证、速率限制或在任何处理开始之前阻止不适当的请求。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, AIMessage } from "langchain";

const contentFilterMiddleware = (bannedKeywords: string[]) => {
  const keywords = bannedKeywords.map(kw => kw.toLowerCase());

  return createMiddleware({
    name: "ContentFilterMiddleware",
    beforeAgent: {
      hook: (state) => {
        // Get the first user message
        if (!state.messages || state.messages.length === 0) {
          return;
        }

        const firstMessage = state.messages[0];
        if (firstMessage._getType() !== "human") {
          return;
        }

        const content = firstMessage.content.toString().toLowerCase();

        // Check for banned keywords
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            // Block execution before any processing
            return {
              messages: [
                new AIMessage(
                  "I cannot process requests containing inappropriate content. Please rephrase your request."
                )
              ],
              jumpTo: "end",
            };
          }
        }

        return;
      },
      canJumpTo: ['end']
    }
  });
};

// Use the custom guardrail
import { createAgent } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, calculatorTool],
  middleware: [
    contentFilterMiddleware(["hack", "exploit", "malware"]),
  ],
});

// This request will be blocked before any processing
const result = await agent.invoke({
  messages: [{ role: "user", content: "How do I hack into a database?" }]
});
```

### 特工护栏后在返回给用户之前，使用“after agent”挂钩验证最终输出一次。这对于基于模型的安全检查、质量验证或对完整代理响应的最终合规性扫描非常有用。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, AIMessage, initChatModel } from "langchain";

const safetyGuardrailMiddleware = () => {
  const safetyModel = initChatModel("gpt-5.4-mini");

  return createMiddleware({
    name: "SafetyGuardrailMiddleware",
    afterAgent: {
      hook: async (state) => {
        // Get the final AI response
        if (!state.messages || state.messages.length === 0) {
          return;
        }

        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage._getType() !== "ai") {
          return;
        }

        // Use a model to evaluate safety
        const safetyPrompt = `Evaluate if this response is safe and appropriate.
        Respond with only 'SAFE' or 'UNSAFE'.

        Response: ${lastMessage.content.toString()}`;

        const result = await safetyModel.invoke([
          { role: "user", content: safetyPrompt }
        ]);

        if (result.content.toString().includes("UNSAFE")) {
          return {
            messages: [
              new AIMessage(
                "I cannot provide that response. Please rephrase your request."
              )
            ],
            jumpTo: "end",
          };
        }

        return;
      },
      canJumpTo: ['end']
    }
  });
};

// Use the safety guardrail
import { createAgent } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, calculatorTool],
  middleware: [safetyGuardrailMiddleware()],
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "How do I make explosives?" }]
});
```

### 组合多个护栏

您可以通过将多个护栏添加到中间件数组来堆叠它们。它们按顺序执行，允许您构建分层保护：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, piiRedactionMiddleware, humanInTheLoopMiddleware } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  tools: [searchTool, sendEmailTool],
  middleware: [
    // Layer 1: Deterministic input filter (before agent)
    contentFilterMiddleware(["hack", "exploit"]),

    // Layer 2: PII protection (before and after model)
    piiRedactionMiddleware({
      piiType: "email",
      strategy: "redact",
      applyToInput: true,
    }),
    piiRedactionMiddleware({
      piiType: "email",
      strategy: "redact",
      applyToOutput: true,
    }),

    // Layer 3: Human approval for sensitive tools
    humanInTheLoopMiddleware({
      interruptOn: {
        send_email: { allowAccept: true, allowEdit: true, allowRespond: true },
      }
    }),

    // Layer 4: Model-based safety check (after agent)
    safetyGuardrailMiddleware(),
  ],
});
```

## 其他资源

* [Middleware documentation](/oss/javascript/langchain/middleware) - 自定义中间件完整指南
* [Middleware API reference](https://reference.langchain.com/python/langchain/middleware/) - 自定义中间件完整指南
* [Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop) - 为敏感操作添加人工审核
* [Testing agents](/oss/javascript/langchain/test/) - 测试安全机制的策略

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/guardrails.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>