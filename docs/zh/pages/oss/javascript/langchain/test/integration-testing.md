<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integration testing | https://docs.langchain.com/oss/javascript/langchain/test/integration-testing -->

# 集成测试

通过组织测试、管理密钥、处理不稳定和控制成本，使用真正的 LLM API 来测试代理。

集成测试验证您的代理是否可以与模型 API 和外部服务正常工作。与使用伪造和模拟的[unit tests](/oss/javascript/langchain/test/unit-testing)不同，集成测试进行实际的网络调用，以确认组件可以协同工作、凭证有效并且延迟是可以接受的。

由于 LLM 响应是不确定的，因此集成测试需要与传统软件测试不同的策略。本指南介绍了如何为代理组织、编写和运行集成测试。对于LangChain本身贡献时的一般测试基础设施，请参阅[Contributing to code](/oss/javascript/contributing/code#running-tests)。

## 单独的单元测试和集成测试

集成测试速度较慢并且需要 API 凭据，因此请将它们与单元测试分开。这使您可以对每次更改运行快速单元测试，并为 CI 或预部署检查保留集成测试。

使用文件命名约定来分隔集成测试。命名集成测试文件 `*.int.test.ts` 并配置 vitest 将它们从默认运行中排除：

```ts vitest.config.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig((env) => {
  if (env.mode === "int") {
    return {
      test: {
        testTimeout: 100_000,
        include: ["**/*.int.test.ts"],
        setupFiles: ["dotenv/config"],
      },
    };
  }

  return {
    test: {
      testTimeout: 30_000,
      exclude: ["**/*.int.test.ts", ...configDefaults.exclude],
    },
  };
});
```

添加脚本到`package.json`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "scripts": {
    "test": "vitest",
    "test:integration": "vitest --mode int"
  }
}
```

显式运行集成测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm run test:integration
```

## 管理 API 密钥集成测试需要真实的 API 凭据。从环境变量加载它们，以便密钥不受源代码控制。

添加 `dotenv/config` 作为 vitest 设置文件，以便环境变量从 `.env` 自动加载：

```ts vitest.config.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export default defineConfig({
  test: {
    setupFiles: ["dotenv/config"],
  },
});
```

```bash .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENAI_API_KEY=sk-...
```

当密钥丢失时跳过测试：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { test } from "vitest";

test.skipIf(!process.env.OPENAI_API_KEY)(
  "agent responds with tool call",
  async () => {
    // ...
  }
);
```

<Warning>
  将 `.env` 添加到您的 `.gitignore` 以避免提交凭据。在 CI 中，通过提供商的机密管理（例如 GitHub Actions 机密）注入机密。
</Warning>

## 断言结构，而不是内容

LLM 的反应因运行而异。不要对确切的输出字符串进行断言，而是验证响应的结构属性：消息类型、工具调用名称、参数形状和消息计数。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
test("agent calls weather tool", async () => {
  const agent = createAgent({ model: "claude-sonnet-4-6", tools: [getWeather] });
  const result = await agent.invoke({
    messages: [new HumanMessage("What's the weather in SF?")]
  });

  const aiMsg = result.messages.find(
    (m) => AIMessage.isInstance(m) && m.tool_calls?.length
  );
  expect(aiMsg).toContainToolCall({ name: "get_weather" });
  expect(result.messages.at(-1)).toBeAIMessage();
});
```

此示例使用[custom test matchers](#use-custom-test-matchers)。请参阅下面的部分了解设置和完整的匹配器参考。

<Tip>
  对于更严格的轨迹断言，请使用支持模糊匹配模式的[AgentEvals](/oss/javascript/langchain/test/evals)评估器，例如`unordered`和`superset`。
</Tip>

## 使用自定义测试匹配器

`langchain` 附带 [custom vitest matchers](https://vitest.dev/guide/extending-matchers.html)，使结构断言更具可读性，并在失败时生成清晰的错误消息。在设置文件中注册一次它们，每次 `expect()` 调用时它们就可用。

＃＃＃ 设置添加一个 vitest 安装文件，使用 LangChain 匹配器扩展 `expect`：

```ts vitest.setup.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { langchainMatchers } from "@langchain/core/testing";

expect.extend(langchainMatchers);
```

在您的 vitest 配置中引用它：

```ts vitest.config.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export default defineConfig({
  test: {
    setupFiles: ["vitest.setup.ts"],
  },
});
```

TypeScript 类型会自动包含在内，因此自动完成不需要额外的配置。

### 检查消息类型

每个消息类别都有一个相应的匹配器：`toBeHumanMessage()`、`toBeAIMessage()`、`toBeSystemMessage()` 和 `toBeToolMessage()`。不带参数调用仅检查类型，或传递字符串以匹配内容：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await agent.invoke({
  messages: [new HumanMessage("What's the weather?")]
});
const lastMessage = response.messages.at(-1);

expect(lastMessage).toBeAIMessage();
expect(lastMessage).toBeAIMessage("It's 72°F and sunny.");
```

传递一个对象来匹配特定字段：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
expect(lastMessage).toBeAIMessage({ name: "weather-bot" });
expect(toolMsg).toBeToolMessage({ tool_call_id: "call_1" });
```

### 对工具调用进行断言

三个匹配器涵盖 [⟦T31⟧](https://reference.langchain.com/javascript/langchain-core/messages/AIMessage) 上的工具调用断言：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const response = await agent.invoke({
  messages: [new HumanMessage("Weather in SF and NYC?")]
});
const aiMsg = response.messages.find(
  (m) => AIMessage.isInstance(m) && m.tool_calls?.length
);

// Check that specific tool calls are present (order-independent)
expect(aiMsg).toHaveToolCalls([
  { name: "get_weather", args: { city: "San Francisco" } },
  { name: "get_weather", args: { city: "New York" } },
]);

// Check only the count
expect(aiMsg).toHaveToolCallCount(2);

// Check that at least one tool call matches (supports .not)
expect(aiMsg).toContainToolCall({ name: "get_weather" });
expect(aiMsg).not.toContainToolCall({ name: "send_email" });
```

### 断言工具消息

`toHaveToolMessages()` 获取完整的消息数组并按顺序检查其中的 [⟦T33⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage) 实例：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
expect(response.messages).toHaveToolMessages([
  { content: "72°F and sunny in San Francisco" },
  { content: "68°F and cloudy in New York" },
]);
```

### 对中断和结构化响应进行断言

`toHaveBeenInterrupted()` 检查 [LangGraph interrupt](/oss/javascript/langchain/human-in-the-loop) 结果中的 `__interrupt__` 字段。传递一个值以匹配中断负载：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result = await graph.invoke(input);

expect(result).toHaveBeenInterrupted();
expect(result).toHaveBeenInterrupted("confirm_action");
```

`toHaveStructuredResponse()` 检查结果中的 `structuredResponse` 字段。传递一个对象来匹配特定字段：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
expect(result).toHaveStructuredResponse();
expect(result).toHaveStructuredResponse({ name: "Alice", age: 30 });
```

### 匹配器参考|匹配器|描述 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `toBeHumanMessage(expected?)` |检查该值是否为`HumanMessage`。可选择匹配内容（字符串）或字段（对象）。  |
| `toBeAIMessage(expected?)` |检查该值是否为`AIMessage`。可选择匹配内容或字段。                      |
| `toBeSystemMessage(expected?)` |检查该值是否为`SystemMessage`。可选择匹配内容或字段。                   |
| `toBeToolMessage(expected?)` |检查该值是否为 `ToolMessage`。可选择匹配内容或字段，例如 `tool_call_id`。 |
| `toHaveToolCalls(expected)` |检查 `AIMessage` 是否完全具有给定的工具调用（与顺序无关）。                  |
| `toHaveToolCallCount(n)` |检查 `AIMessage` 是否恰好有 `n` 工具调用。                                            |
| `toContainToolCall(expected)` |检查`AIMessage`是否至少包含一个匹配的工具调用。支持`.not`。             |
| `toHaveToolMessages(expected)` |检查消息数组是否按顺序包含给定的 `ToolMessage` 实例。                 || `toHaveBeenInterrupted(value?)` |检查结果是否具有 `__interrupt__`。可以选择匹配中断值。                |
| `toHaveStructuredResponse(expected?)` |检查结果是否具有 `structuredResponse`。可选择匹配特定字段。                |

## 降低成本和延迟

调用 LLM API 的集成测试会产生实际成本。一些做法有助于保持测试套件快速且经济实惠：

* **使用较小的模型**：`gemini-3.1-flash-lite`或等效模型，用于仅需要验证工具调用和响应结构的测试。
* **设置`maxTokens`**：限制响应长度以避免长时间、昂贵的完成。
* **限制测试范围**：每个测试测试一种行为。当单轮测试就足够时，避免链接许多 LLM 调用的端到端场景。
* **选择性运行**：使用[above](#separate-unit-and-integration-tests)的测试分离仅在 CI 中或部署之前运行集成测试，而不是在每个文件保存时运行。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createAgent({
  model: "gemini-3.1-flash-lite",
  tools: [getWeather],
  modelArgs: { maxTokens: 256 },
});
```

## 后续步骤

了解如何使用确定性匹配或 LLM-as-judge 评估器来评估代理轨迹[Evals](/oss/javascript/langchain/test/evals)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/integration-testing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>