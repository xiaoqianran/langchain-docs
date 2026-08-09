<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Interpreters | https://docs.langchain.com/oss/javascript/deepagents/interpreters -->

# 口译员

在深度代理内运行轻量级代码来组合工具、编排子代理和转换结构化数据

解释器在代理循环内为代理提供了一个可编程的**内存中**工作空间。代理编写代码来完成任务，运行时执行它并仅返回相关结果。中间结果不会成为模型上下文的一部分。

其中，[sandboxes](/oss/javascript/deepagents/sandboxes)是对环境进行操作的代码优先方式（例如运行命令、安装依赖项和编辑文件），而解释器是用于编写工具、保留状态以及决定应返回模型的信息的代码优先方式。

<Warning>
  口译员位于[**beta**](/oss/javascript/versioning)。 API 和生命周期行为可能会在版本之间发生变化。
</Warning>

<Note>
  口译员需要`@langchain/quickjs`。
</Note>

## 为什么要使用口译员？大多数代理工作在模型推理和工具调用之间交替进行。一个模型可以一次触发多个工具调用，但是该批次在发出时就被固定了。没有任何东西可以循环、在结果上分支、重试失败或将一个调用的输出提供给下一个调用而无需另一个模型轮转，并且每个结果都返回到模型的上下文。该模型还决定发出多少次调用，因此要求它在数百个项目上分派工作是不可靠的，而且它往往覆盖一个样本而不是每个项目。

解释器将该编排转移到代码中，以便模型推理“做什么”，而不是每个中间步骤。

<CardGroup>
  <Card title="Programmatic tool calling (PTC)" icon="tool" href="#programmatic-tool-calling-ptc">
    从解释器代码中调用选定的工具，包括循环、重试、分支和并行批处理。
  </Card>

  <Card title="Dynamic subagents" icon="arrows-split" href="#dynamic-subagents">
    从代码中调度子代理，以针对大量输入进行扇出、验证和递归工作流程。
  </Card>

  <Card title="Stateful work" icon="database" href="#how-interpreters-work">
    将中间值保持在运行时状态，而不会使模型上下文过载。
  </Card>

  <Card title="Deterministic transforms" icon="code" href="#how-interpreters-work">
    对结构化数据进行排序、分组、解析、验证、评分和聚合，无需再次进行模型转换。
  </Card>
</CardGroup>

## 选择一种模式对代理循环内的代码使用解释器：组合工具、保留状态以及控制返回模型的内容。

使用 [sandboxes](/oss/javascript/deepagents/sandboxes) 针对环境编写代码：shell 命令、包安装、测试、文件系统编辑和操作系统级执行。

|需要|使用 |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
|一两个简单的外部通话 |正常工具调用 |
|纯内存 JavaScript：循环、分支、重试或数据转换（无外部工具）|口译 |
|许多从代码编排的外部工具调用（需要[PTC](#programmatic-tool-calling-ptc)）| [programmatic tool calling (PTC)](#programmatic-tool-calling-ptc) 口译员 ||许多独立的工作单元、多个视角或对大量输入的递归分析 | [dynamic subagents](/oss/javascript/deepagents/dynamic-subagents) 口译员 |
| Shell 命令、软件包安装、测试或完整操作系统文件系统访问 | [Sandboxes](/oss/javascript/deepagents/sandboxes) |

## 快速入门

安装 QuickJS 中间件包，然后使用 `createDeepAgent` 上的 `middleware` 参数传递解释器中间件。

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install deepagents @langchain/quickjs
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add deepagents @langchain/quickjs
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add deepagents @langchain/quickjs
  ```
</CodeGroup>

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```
</CodeGroup>

## 口译员如何工作

中间件向代理添加了`eval`工具。当有用时，代理编写 JavaScript 并调用 `eval`；您不直接致电口译员。该工具在 QuickJS 上下文中运行代码，其变量可以在 `eval` 调用之间持续存在，具体取决于持久性 `mode`。它捕获 `console.log`、`console.warn` 和 `console.error`，并返回最后一个表达式的结果。

代理可以编写如下代码：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const rows = [
  { team: "alpha", score: 8 },
  { team: "beta", score: 13 },
  { team: "alpha", score: 21 },
];

const totals = rows.reduce((acc, row) => {
  acc[row.team] = (acc[row.team] ?? 0) + row.score;
  console.log(`${row.team} score: ${acc[row.team]}`);
  return acc;
}, {});

totals;
```

代码运行在[**QuickJS**](https://github.com/quickjs-ng/quickjs)，一个轻量级的 JavaScript 运行时。默认情况下，解释器代码无法访问主机文件系统、网络、shell、包管理器或时钟。它可以计算、保存状态以及写入 `console.log`、`console.warn` 或 `console.error`，仅此而已。两个明确的桥梁扩展了这一范围：

* **工具**，通过 [programmatic tool calling (PTC)](#programmatic-tool-calling-ptc)。在 `tools` 命名空间下提供一个工具允许列表作为异步函数。这些可以是代理自己的工具，也可以是您定义并传入的独立工具。
* **子代理**，通过 [dynamic subagents](/oss/javascript/deepagents/dynamic-subagents)。当代理配置了子代理时，解释器会公开一个 `task()` 全局变量，用于从代码中分派它们。

编程工具调用将关闭，直到您[enable it](#enable-ptc)。当代理有子代理时，通过 `task()` 进行子代理调度默认处于打开状态，您可以将其关闭。没有其他东西跨越 QuickJS 的边界。

## 编程工具调用 (PTC)

编程工具调用 (PTC) 在全局 `tools` 命名空间下公开解释器内选定的代理工具。代理可以编写在循环、分支、重试或并行批次中调用工具的代码，而不是要求模型发出一个工具调用、等待结果，然后决定下一次调用。当中间结果仅作为下一步的输入时，这会有所帮助：解释器在任何内容返回到模型之前过滤或聚合它们，从而保持多步骤工作流的令牌效率。它与模型无关，由中间件而不是特定于提供商的工具调用 API 实现。

中间件将每个列入白名单的工具公开为 `tools` 下的异步函数。代理使用 `await` 调用它，在代码中处理结果，模型只能看到最终的解释器输出，而不是每个中间值。工具名称将转换为驼峰命名法，而输入对象仍遵循工具的架构，因此名为 `web_search` 的工具将变为 `tools.webSearch(...)`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const result: string = await tools.webSearch({
  query: "deepagents interpreters",
});
```

### 启用 PTC

使用显式允许列表启用 PTC：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    middleware: [createCodeInterpreterMiddleware({ ptc: ["web_search"] })],
  });
  ```
</CodeGroup>

启用 PTC 后，代理可以从解释器代码调用列入许可名单的工具。此示例并行搜索多个主题并在返回模型之前合并结果：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const topics = ["retrieval", "memory", "evaluation"];

const results = await Promise.all(
  topics.map((topic) =>
    tools.webSearch({ query: `${topic} best practices 2025` }),
  ),
);

results.join("\n\n");
```<Warning>
  PTC 调用当前通过解释器桥执行，不经过正常的工具调用路径。因此，每次 PTC 调用的工具调用都不会强制执行`interruptOn` 批准工作流程。
</Warning>

## 动态子代理

以下概述涵盖了何时使用动态子代理和最小 `task()` 模式。有关配置、编排示例、工作流触发器和安全注意事项，请参阅[Dynamic subagents](/oss/javascript/deepagents/dynamic-subagents)。

动态子代理允许解释器使用内置的 `task()` 全局从代码中分派配置的 [subagents](/oss/javascript/deepagents/subagents)。跨越许多独立单元的任务（例如检查目录中的每个文件或对一批票进行分类）会成为一个循环，将工作展开并综合结果。

使用动态子代理：

* **扇出和综合**：在多个项目上并行运行相同类型的工作，然后合并结果。
* **验证**：将调查结果发送给独立验证者子代理并仅保留已确认的结果。
* **递归工作流程**：在解释器变量中保留工作集，选择切片，调用子代理并优化结果。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const paths = ["src/auth.ts", "src/routes/api.ts"];

const reviews = await Promise.all(
  paths.map((path) =>
    task({
      description: `Review ${path} for authentication issues`,
      subagentType: "reviewer",
    }),
  ),
);

reviews.join("\n\n");
```

## 安全解释器使用 QuickJS 来运行不受信任的 JavaScript，并具有严格的默认隔离。将其视为作用域解释器运行时，而不是完整的生产沙箱后端。

您通过 PTC 公开的每个工具都是解释器代码可以使用的外部功能。将 PTC 许可名单视为权限边界：仅公开代理所需的工具，并避免桥接可以访问敏感系统、花钱、改变数据或调用不受限制网络的广泛工具，除非该行为是故意的。|能力|默认可用 |如何曝光 |
| ----------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript 执行 |是的 |添加解释器中间件 |
|顶级`await`|是的 |在解释器代码中使用 Promise |
| `console.log`、`warn`、`error` 捕捉 |是的 |使用 `captureConsole: false` 禁用 ||代理工具|没有 |添加 PTC 许可名单 |
|文件系统访问 |没有 |通过 PTC 许可名单添加 [built-in filesystem tools](/oss/javascript/deepagents/overview#virtual-filesystem-access) |
|网络接入|没有 |通过PTC公开特定的网络工具 |
|挂钟或日期时间访问 |没有 |如果需要，公开显式时间工具 |
| Shell 命令、软件包安装、测试、操作系统级执行 |没有 |使用[sandbox backend](/oss/javascript/deepagents/sandboxes) |

<Note>
  **代码执行如何工作**解释器代码通过 [QuickJS-Emscripten](https://github.com/justjake/quickjs-emscripten) 在 WASM 沙盒 QuickJS 运行时运行，而不是在主机 Node.js 进程中运行。将解释器视为功能范围内的执行层：仅桥接代理所需的工具和子代理，并缩小 PTC 许可名单的范围。
</Note>

## 配置

`createCodeInterpreterMiddleware`接受以下选项：

|选项|默认|目的|
| -------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `memoryLimitBytes` | `64 * 1024 * 1024` <br />(64 MB) |每个会话的 QuickJS 堆内存上限。                                                                                                                                                     || `maxStackSizeBytes` | `320 * 1024` |每个会话的 QuickJS 堆栈大小上限。                                                                                                                                                      |
| `executionTimeoutMs` | `5000` |每个 `eval` 调用的超时限制（以毫秒为单位）。负值禁用超时。                                                                                                 |
| `toolName` | `"eval"` |暴露给模型的解释器工具的名称。                                                                                                                                       |
| `captureConsole` | `true` |在工具响应中捕获 `console.log`、`console.warn` 和 `console.error`。设置为 `false` 以丢弃控制台输出。                                                               |
| `maxResultChars` | `4000` |将返回到模型的结果、错误和控制台输出截断为最大字符数。                                                                                           || `systemPrompt` | `null` |解释器工具的自定义系统提示。 `null`时默认为内置提示。                                                                                              |
| `ptc` |省略|在解释器内公开为 `tools.*` 的工具名称或 `StructuredToolInterface` 实例的白名单。省略禁用。参见[Enable PTC](#enable-ptc)。                              |
| `maxPtcCalls` | `256` |每个 `eval` 允许最多 `tools.*` 调用。仅在受信任的环境中设置为 `null`。参见[Programmatic tool calling (PTC)](#programmatic-tool-calling-ptc)和[Security](#security)。 |
| `subagents` | `true` |当代理有子代理时，公开内置的`task()`全局。设置为 `false` 要求通过普通 `task` 工具调度。参见[Dynamic subagents](#dynamic-subagents)。        |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/interpreters.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>