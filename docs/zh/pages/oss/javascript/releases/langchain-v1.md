<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: What's new in LangChain v1 | https://docs.langchain.com/oss/javascript/releases/langchain-v1 -->

# LangChain v1 的新功能

**LangChain v1 是一个专注于构建代理的生产就绪基础。**我们围绕三个核心改进简化了框架：

<CardGroup>
  <Card title="createAgent" icon="robot" href="#createagent">
    在 LangChain 中构建代理的新标准方法，用更干净、更强大的 API 取代 LangGraph 中的`createReactAgent`。
  </Card>

  <Card title="Standard content blocks" icon="cube" href="#standard-content-blocks">
    新的 `contentBlocks` 属性提供对所有提供商的现代 LLM 功能的统一访问。
  </Card>

  <Card title="Simplified package" icon="sitemap" href="#simplified-package">
    `langchain` 软件包已经过精简，专注于代理的基本构建块，并将遗留功能移至 `@langchain/classic`。
  </Card>
</CardGroup>

要升级，

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm install langchain @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain @langchain/core
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add langchain @langchain/core
  ```
</CodeGroup>

有关更改的完整列表，请参阅[migration guide](/oss/javascript/migrate/langchain-v1)。

## `createAgent`

`createAgent`是LangChain1.0中构建代理的标准方式。它提供了比从 LangGraph 导出的预构建 `createReactAgent` 更简单的界面，同时通过使用中间件提供了更大的定制潜力。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant.",
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the weather in Tokyo?" },
  ],
});

console.log(result.content);
```

在底层，`createAgent`构建在基本代理循环之上——调用模型，让它选择要执行的工具，然后在不再调用工具时完成：

<div>
  <img alt="Core agent loop diagram" />
</div>

有关更多信息，请参阅[Agents](/oss/javascript/langchain/agents)。

＃＃＃ 中间件中间件是`createAgent`的定义特征。它使`createAgent`高度可定制，提高了您可以构建的上限。

优秀的代理需要[context engineering](/oss/javascript/langchain/context-engineering)：在正确的时间向模型提供正确的信息。中间件可帮助您通过可组合的抽象来控制动态提示、对话摘要、选择性工具访问、状态管理和护栏。

#### 预构建中间件

LangChain为常见模式提供了一些[prebuilt middlewares](/oss/javascript/langchain/middleware#built-in-middleware)，包括：

* `summarizationMiddleware`：当对话历史记录太长时压缩它
* `humanInTheLoopMiddleware`：敏感工具调用需要批准
* `piiRedactionMiddleware`：在发送给模型之前编辑敏感信息

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createAgent,
  summarizationMiddleware,
  humanInTheLoopMiddleware,
  piiRedactionMiddleware,
} from "langchain";

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [readEmail, sendEmail],
  middleware: [
    piiRedactionMiddleware({ patterns: ["email", "phone", "ssn"] }),
    summarizationMiddleware({
      model: "claude-sonnet-4-6",
      trigger: { tokens: 500 },
    }),
    humanInTheLoopMiddleware({
      interruptOn: {
        sendEmail: {
          allowedDecisions: ["approve", "edit", "reject"],
        },
      },
    }),
  ],
});
```

#### 自定义中间件

您还可以构建自定义中间件来满足您的特定需求。

通过使用 `createMiddleware` 函数实现这些钩子来构建自定义中间件：|钩|当它运行时 |使用案例 |
| ---------------- | ------------------------ | --------------------------------------- |
| `beforeAgent` |致电代理之前 |加载内存，验证输入 |
| `beforeModel` |在每次LLM通话之前|更新提示、修剪消息 |
| `wrapModelCall` |围绕每个法学硕士通话|拦截并修改请求/响应 |
| `wrapToolCall` |围绕每个工具调用|拦截并修改工具执行 |
| `afterModel` |每次LLM回复后|验证输出，应用护栏 |
| `afterAgent` |代理完成后 |保存结果，清理|

<div>
  <img alt="Middleware flow diagram" />
</div>

自定义中间件示例：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

const contextSchema = z.object({
  userExpertise: z.enum(["beginner", "expert"]).default("beginner"),
})

const expertiseBasedToolMiddleware = createMiddleware({
  wrapModelCall: async (request, handler) => {
    const userLevel = request.runtime.context.userExpertise;
    if (userLevel === "expert") {
      const tools = [advancedSearch, dataAnalysis];
      return handler(
        request.replace("openai:gpt-5.5", tools)
      );
    }
    const tools = [simpleSearch, basicCalculator];
    return handler(
      request.replace("openai:gpt-5-nano", tools)
    );
  },
});

const agent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [simpleSearch, advancedSearch, basicCalculator, dataAnalysis],
  middleware: [expertiseBasedToolMiddleware],
  contextSchema,
});
```

欲了解更多信息，请参阅[the complete middleware guide](/oss/javascript/langchain/middleware)。

### 建立在 LangGraph 上

由于 `createAgent` 是基于 LangGraph 构建的，因此您可以通过以下方式自动获得对长期运行且可靠的代理的内置支持：

<CardGroup>
  <Card title="Persistence" icon="database">
    通过内置检查点，对话自动在会话之间持续存在
  </Card>

  <Card title="Streaming" icon="droplet">
    实时流式传输令牌、工具调用和推理跟踪
  </Card>

  <Card title="Human-in-the-loop" icon="hand-stop">
    在敏感操作之前暂停代理执行以供人工批准
  </Card><Card title="Time travel" icon="history">
    将对话倒回到任意点并探索替代路径和提示
  </Card>
</CardGroup>

您无需学习 LangGraph 即可使用这些功能——它们开箱即用。

### 结构化输出

`createAgent` 改进了结构化输出生成：

* **主循环集成**：结构化输出现在在主循环中生成，而不需要额外的 LLM 调用
* **结构化输出策略**：模型可以选择调用工具或使用提供者端结构化输出生成
* **降低成本**：消除额外的法学硕士通话带来的额外费用

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import * as z from "zod";

const weatherSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
});

const agent = createAgent({
  model: "gpt-5.4-mini",
  tools: [getWeather],
  responseFormat: weatherSchema,
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the weather in Tokyo?" },
  ],
});

console.log(result.structuredResponse);
```

**错误处理**：通过`handleErrors`参数到`ToolStrategy`控制错误处理：

* **解析错误**：模型生成的数据与所需的结构不匹配
* **多个工具调用**：模型为结构化输出模式生成 2 个以上的工具调用

***

## 标准内容块

<Note>
  1.0 版本适用于大多数软件包。当前仅以下内容支持新内容块：

  * `langchain`
  * `@langchain/core`
  * `@langchain/anthropic`
  * `@langchain/openai`

  计划对内容块提供更广泛的支持。
</Note>

### 好处* **与提供商无关**：无论提供商如何，都可以使用相同的 API 访问推理跟踪、引文、内置工具（网络搜索、代码解释器等）和其他功能
* **类型安全**：所有内容块类型的完整类型提示
* **向后兼容**：标准内容可以是[loaded lazily](/oss/javascript/langchain/messages#standard-content-blocks)，因此没有相关的重大更改

有关更多信息，请参阅我们的 [content blocks](/oss/javascript/langchain/messages#message-content) 指南

***

## 简化包

LangChain v1 简化了`langchain`包命名空间，以专注于代理的基本构建块。该包仅公开最有用和最相关的功能：

为了方便起见，其中大部分都是从 `@langchain/core` 重新导出的，这为您提供了一个用于构建代理的集中 API 界面。

### `@langchain/classic`

旧功能已转移到[⟦T44⟧](https://www.npmjs.com/package/@langchain/classic)，以保持核心包的精简和集中。

#### `@langchain/classic` 中有什么

* 遗留链和链实现
* 寻回犬
* 索引API
* [⟦T46⟧](https://www.npmjs.com/package/@langchain/community) 出口
* 其他已弃用的功能

如果您使用任何此功能，请安装 [⟦T47⟧](https://www.npmjs.com/package/@langchain/classic)：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/classic
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm install @langchain/classic
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/classic
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/classic
  ```
</CodeGroup>

然后更新您的导入：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ... } from "langchain"; // [!code --]
import { ... } from "@langchain/classic"; // [!code ++]

import { ... } from "langchain/chains"; // [!code --]
import { ... } from "@langchain/classic/chains"; // [!code ++]
```

## 报告问题

请使用 [⟦T48⟧ label](https://github.com/langchain-ai/langchainjs/issues?q=state%3Aopen%20label%3Av1) 报告 1.0 在 [GitHub](https://github.com/langchain-ai/langchainjs/issues) 上发现的任何问题。

## 其他资源<CardGroup>
  <Card title="LangChain 1.0" icon="rocket" href="https://blog.langchain.com/langchain-langchain-1-0-alpha-releases/">
    阅读公告
  </Card>

  <Card title="Middleware guide" icon="puzzle" href="https://blog.langchain.com/agent-middleware/">
    深入研究中间件
  </Card>

  <Card title="Agents Documentation" icon="book" href="/oss/javascript/langchain/agents">
    完整的代理文档
  </Card>

  <Card title="Message Content" icon="message" href="/oss/javascript/langchain/messages#message-content">
    新内容块 API
  </Card>

  <Card title="Migration guide" icon="arrows-exchange" href="/oss/javascript/migrate/langchain-v1">
    如何迁移到LangChain v1
  </Card>

  <Card title="GitHub" icon="brand-github" href="https://github.com/langchain-ai/langchainjs">
    报告问题或贡献
  </Card>
</CardGroup>

## 另请参阅

* [Versioning](/oss/javascript/versioning) – 了解版本号
* [Release policy](/oss/javascript/release-policy) – 详细发布政策

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/releases/langchain-v1.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>