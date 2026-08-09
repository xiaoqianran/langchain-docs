<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: ChatOpenAI integration | https://docs.langchain.com/oss/javascript/integrations/chat/openai -->

# ChatOpenAI 集成

使用 LangChain JavaScript 与 ChatOpenAI 聊天模型集成。

[OpenAI](https://en.wikipedia.org/wiki/OpenAI)是一个人工智能（AI）研究实验室。

本指南将帮助您开始使用 OpenAI [chat models](/oss/javascript/langchain/models)。有关所有`ChatOpenAI`功能和配置的详细文档，请前往[API reference](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)。

<Note>
  **聊天完成 API 兼容性**

  `ChatOpenAI` 与 OpenAI 的（旧版）[Chat Completions API](https://platform.openai.com/docs/guides/completions) 完全兼容。如果您希望连接到支持聊天完成 API 的其他模型提供者，您可以这样做 – 请参阅[instructions](/oss/javascript/integrations/chat#chat-completions-api)。
</Note>

<Info>
  **托管在 Azure 上的 OpenAI 模型**

  请注意，某些 OpenAI 模型也可以通过 [Microsoft Azure platform](https://azure.microsoft.com/en-us/products/ai-foundry/models/openai/) 访问。
</Info>

## 概述

### 集成细节|班级 |套餐 |可串行化| [PY support](https://python.langchain.com/docs/integrations/chat/openai) |                                             下载 |                                             版本 |
| :---------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :----------: | :--------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| [⟦T53⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI) | [⟦T54⟧](https://www.npmjs.com/package/@langchain/openai) |       ✅ |                                     ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/openai?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/openai?style=flat-square\&label=%20&) |

### 模型特点

有关如何使用特定功能的指南，请参阅下面表标题中的链接。| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ❌ |      ❌ |                               ✅ |                              ✅ |                                ✅ |

## 设置

要访问 OpenAI 聊天模型，您需要创建 OpenAI 帐户、获取 API 密钥并安装 `@langchain/openai` 集成包。

### 凭证

前往 [OpenAI's website](https://platform.openai.com/) 注册 OpenAI 并生成 API 密钥。完成此操作后，设置 `OPENAI_API_KEY` 环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_API_KEY="your-api-key"
```如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain [⟦T57⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI) 集成位于 `@langchain/openai` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/openai @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/openai @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/openai @langchain/core
  ```
</CodeGroup>

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai"

const llm = new ChatOpenAI({
  model: "gpt-5.5",
  temperature: 0,
  // other params...
})
```

## 调用

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const aiMsg = await llm.invoke([
  {
    role: "system",
    content: "You are a helpful assistant that translates English to French. Translate the user sentence.",
  },
  {
    role: "user",
    content: "I love programming."
  },
])
aiMsg
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessage {
  "id": "chatcmpl-ADItECqSPuuEuBHHPjeCkh9wIO1H5",
  "content": "J'adore la programmation.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "completionTokens": 5,
      "promptTokens": 31,
      "totalTokens": 36
    },
    "finish_reason": "stop",
    "system_fingerprint": "fp_5796ac6771"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 31,
    "output_tokens": 5,
    "total_tokens": 36
  }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.content)
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore la programmation.
```

## 自定义 URL

您可以通过传递 `configuration` 参数来自定义 SDK 发送请求的基本 URL，如下所示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llmWithCustomURL = new ChatOpenAI({
  model: "gpt-5.5",
  temperature: 0.9,
  configuration: {
    baseURL: "https://your_custom_url.com",
  },
});

await llmWithCustomURL.invoke("Hi there!");
```

`configuration`字段还接受官方SDK接受的其他`ClientOptions`参数。

如果您在 Azure OpenAI 上托管，请参阅 [dedicated page instead](/oss/javascript/integrations/chat/azure)。

## 自定义标头

您可以在同一 `configuration` 字段中指定自定义标头：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llmWithCustomHeaders = new ChatOpenAI({
  model: "gpt-5.5",
  temperature: 0.9,
  configuration: {
    defaultHeaders: {
      "Authorization": `Bearer SOME_CUSTOM_VALUE`,
    },
  },
});

await llmWithCustomHeaders.invoke("Hi there!");
```

## 禁用流使用元数据

一些代理或第三方提供商提供与 OpenAI 大致相同的 API 接口，但不支持最近添加的 `stream_options` 参数来返回流使用情况。您可以使用 [⟦T64⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI) 通过禁用流使用来访问这些提供程序，如下所示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llmWithoutStreamUsage = new ChatOpenAI({
  model: "gpt-5.5",
  temperature: 0.9,
  streamUsage: false,
  configuration: {
    baseURL: "https://proxy.com",
  },
});

await llmWithoutStreamUsage.invoke("Hi there!");
```

## 调用微调模型

您可以通过传入相应的`modelName`参数来调用微调后的OpenAI模型。

这通常采用`ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}`的形式。例如：```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const fineTunedLlm = new ChatOpenAI({
  temperature: 0.9,
  model: "ft:gpt-3.5-turbo-0613:{ORG_NAME}::{MODEL_ID}",
});

await fineTunedLlm.invoke("Hi there!");
```

## 生成元数据

如果您需要 logprobs 或令牌使用情况等其他信息，这些信息将直接在消息的 `response_metadata` 字段内的 `invoke` 响应中返回。

<Info>
  **需要 `@langchain/core` 版本 >=0.1.48。**
</Info>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

// See https://cookbook.openai.com/examples/using_logprobs for details
const llmWithLogprobs = new ChatOpenAI({
  model: "gpt-5.5",
  logprobs: true,
  // topLogprobs: 5,
});

const responseMessageWithLogprobs = await llmWithLogprobs.invoke("Hi there!");
console.dir(responseMessageWithLogprobs.response_metadata.logprobs, { depth: null });
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  content: [
    {
      token: 'Hello',
      logprob: -0.0004740447,
      bytes: [ 72, 101, 108, 108, 111 ],
      top_logprobs: []
    },
    {
      token: '!',
      logprob: -0.00004334534,
      bytes: [ 33 ],
      top_logprobs: []
    },
    {
      token: ' How',
      logprob: -0.000030113732,
      bytes: [ 32, 72, 111, 119 ],
      top_logprobs: []
    },
    {
      token: ' can',
      logprob: -0.0004797665,
      bytes: [ 32, 99, 97, 110 ],
      top_logprobs: []
    },
    {
      token: ' I',
      logprob: -7.89631e-7,
      bytes: [ 32, 73 ],
      top_logprobs: []
    },
    {
      token: ' assist',
      logprob: -0.114006,
      bytes: [
         32,  97, 115,
        115, 105, 115,
        116
      ],
      top_logprobs: []
    },
    {
      token: ' you',
      logprob: -4.3202e-7,
      bytes: [ 32, 121, 111, 117 ],
      top_logprobs: []
    },
    {
      token: ' today',
      logprob: -0.00004501419,
      bytes: [ 32, 116, 111, 100, 97, 121 ],
      top_logprobs: []
    },
    {
      token: '?',
      logprob: -0.000010206721,
      bytes: [ 63 ],
      top_logprobs: []
    }
  ],
  refusal: null
}
```

## 自定义工具

[Custom tools](https://platform.openai.com/docs/guides/function-calling#custom-tools) 支持任意字符串输入的工具。当您预计字符串参数很长或很复杂时，它们会特别有用。

如果您使用支持自定义工具的模型，则可以使用 [⟦T70⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI) 类和 `customTool` 函数来创建自定义工具。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI, customTool } from "@langchain/openai";
import { createAgent, HumanMessage } from "langchain";

const codeTool = customTool(
  async () => {
    // ... Add code to execute the input
    return "Code executed successfully";
  },
  {
    name: "execute_code",
    description: "Execute a code snippet",
    format: { type: "text" },
  }
);

const model = new ChatOpenAI({ model: "gpt-5.5" });

const agent = createAgent({
  model,
  tools: [codeTool],
});

const result = await agent.invoke({
  messages: [new HumanMessage("Use the tool to execute the code")],
});
console.log(result);
```

<details>
  <summary>上下文无关语法</summary>

  OpenAI 支持 [context-free grammar](https://platform.openai.com/docs/guides/function-calling#context-free-grammars) 规范，用于 `lark` 或 `regex` 格式的自定义工具输入。详情请参阅[OpenAI docs](https://platform.openai.com/docs/guides/function-calling#context-free-grammars)。 `format`参数可以传入`customTool`，如下所示：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI, customTool } from "@langchain/openai";
  import { createAgent, HumanMessage } from "langchain";

  const MATH_GRAMMAR = `
  start: expr
  expr: term (SP ADD SP term)* -> add
  | term
  term: factor (SP MUL SP factor)* -> mul
  | factor
  factor: INT
  SP: \" \"
  ADD: \"+\"
  MUL: \"*\"
  %import common.INT
  `;

  const doMath = customTool(
    async () => {
      // ... Add code to parse and execute the input
      return "27";
    },
    {
      name: "do_math",
      description: "Evaluate a math expression",
      format: { type: "grammar", definition: MATH_GRAMMAR, syntax: "lark" },
    }
  );

  const model = new ChatOpenAI({ model: "gpt-5.5" });

  const agent = createAgent({
    model,
    tools: [doMath],
  });

  const result = await agent.invoke({
    messages: [new HumanMessage("Use the tool to calculate 3^3")],
  });
  console.log(result);
  ```
</details>

## `strict: true`

自 2024 年 8 月 6 日起，OpenAI 在调用工具时支持 `strict` 参数，这将强制模型尊重工具参数架构。 [See more](https://platform.openai.com/docs/guides/function-calling)。

<Info>
  需要`@langchain/openai >= 0.2.6`
</Info><Warning>
  如果`strict: true`，工具定义也将被验证，并且 JSON 模式的子集被接受。至关重要的是，模式不能有可选参数（具有默认值的参数）。请阅读 [the full docs](https://platform.openai.com/docs/guides/structured-outputs/supported-schemas) 了解支持哪些类型的模式。
</Warning>

这是一个工具调用的示例。将额外的 `strict: true` 参数传递给 `.bindTools` 会将参数传递给所有工具定义：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const weatherTool = tool((_) => "no-op", {
  name: "get_current_weather",
  description: "Get the current weather",
  schema: z.object({
    location: z.string(),
  }),
})

const llmWithStrictTrue = new ChatOpenAI({
  model: "gpt-5.5",
}).bindTools([weatherTool], {
  strict: true,
  tool_choice: weatherTool.name,
});

// Although the question is not about the weather, it will call the tool with the correct arguments
// because we passed `tool_choice` and `strict: true`.
const strictTrueResult = await llmWithStrictTrue.invoke("What is 127862 times 12898 divided by 2?");

console.dir(strictTrueResult.tool_calls, { depth: null });
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
  {
    name: 'get_current_weather',
    args: { location: 'current' },
    type: 'tool_call',
    id: 'call_hVFyYNRwc6CoTgr9AQFQVjm9'
  }
]
```

如果您只想将此参数应用于选定数量的工具，您还可以直接传递 OpenAI 格式化的工具架构：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { zodToJsonSchema } from "zod-to-json-schema";

const toolSchema = {
  type: "function",
  function: {
    name: "get_current_weather",
    description: "Get the current weather",
    strict: true,
    parameters: zodToJsonSchema(
      z.object({
        location: z.string(),
      })
    ),
  },
};

const llmWithStrictTrueTools = new ChatOpenAI({
  model: "gpt-5.5",
}).bindTools([toolSchema], {
  strict: true,
});

const weatherToolResult = await llmWithStrictTrueTools.invoke([{
  role: "user",
  content: "What is the current weather in London?"
}])

weatherToolResult.tool_calls;
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
  {
    name: 'get_current_weather',
    args: { location: 'London' },
    type: 'tool_call',
    id: 'call_EOSejtax8aYtqpchY8n8O82l'
  }
]
```

## 结构化输出

我们还可以将`strict: true`传递给[⟦T83⟧](https://js.langchain.com/docs/how_to/structured_output/#the-.withstructuredoutput-method)。这是一个例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const traitSchema = z.object({
  traits: z.array(z.string()).describe("A list of traits contained in the input"),
});

const structuredLlm = new ChatOpenAI({
  model: "gpt-5.4-mini",
}).withStructuredOutput(traitSchema, {
  name: "extract_traits",
  strict: true,
});

await structuredLlm.invoke([{
  role: "user",
  content: `I am 6'5" tall and love fruit.`
}]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ traits: [ `6'5" tall`, 'love fruit' ] }
```

## 响应 API

<Warning>
  **兼容性**

  以下几点适用于`@langchain/openai>=0.4.5-rc.0`。
</Warning>

OpenAI 支持面向构建 [agentic](/oss/javascript/langchain/agents) 应用程序的 [Responses](https://platform.openai.com/docs/guides/responses-vs-chat-completions) API。它包括一套[built-in tools](https://platform.openai.com/docs/guides/tools?api-mode=responses)，包括网络和文件搜索。它还支持[conversation state](https://platform.openai.com/docs/guides/conversation-state?api-mode=responses)的管理，允许您继续会话线程而无需显式传递以前的消息。

如果使用这些功能之一，`ChatOpenAI` 将路由到响应 API。您还可以在实例化 `ChatOpenAI` 时指定 `useResponsesApi: true`。

### 内置工具为[⟦T88⟧](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)配备内置工具将使其响应基于外部信息，例如通过文件或网络中的上下文。从模型生成的[AIMessage](/oss/javascript/langchain/messages#ai-message)将包含有关内置工具调用的信息。

#### 网络搜索

要触发网络搜索，请将 `{"type": "web_search_preview"}` 传递给模型，就像使用其他工具一样。

<Tip>
  **您还可以将内置工具作为调用参数传递：**

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  llm.invoke("...", { tools: [{ type: "web_search_preview" }] });
  ```
</Tip>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ model: "gpt-5.4-mini" }).bindTools([
  { type: "web_search_preview" },
]);

await llm.invoke("What was a positive news story from today?");

```

请注意，响应包括结构化的 [content blocks](/oss/javascript/langchain/messages/#message-content)，其中包括响应文本和 OpenAI [annotations](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses#output-and-citations) 引用其来源。输出消息还将包含来自任何工具调用的信息。

#### 文件搜索

要触发文件搜索，请将 [file search tool](https://platform.openai.com/docs/guides/tools-file-search) 传递给模型，就像使用其他工具一样。您将需要填充 OpenAI 管理的矢量存储并在工具定义中包含矢量存储 ID。更多详情请参阅[OpenAI documentation](https://platform.openai.com/docs/guides/tools-file-search)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ model: "gpt-5.4-mini" }).bindTools([
  { type: "file_search", vector_store_ids: ["vs..."] },
]);

await llm.invoke("Is deep research by OpenAI?");

```

与[web search](#web-search)一样，响应将包括带有引用的内容块。它还将包括来自内置工具调用的信息。

#### 电脑使用

ChatOpenAI支持`computer-use-preview`模型，这是内置计算机使用工具的专用模型。要启用，请像传递另一个工具一样传递 [computer use tool](https://platform.openai.com/docs/guides/tools-computer-use)。目前，供计算机使用的工具输出存在于`AIMessage.additional_kwargs.tool_outputs`中。要回复计算机使用工具调用，需要在创建对应的`ToolMessage`时设置`additional_kwargs.type: "computer_call_output"`。

更多详情请参见[OpenAI documentation](https://platform.openai.com/docs/guides/tools-computer-use)。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import * as fs from "node:fs/promises";

const findComputerCall = (message: AIMessage) => {
  const toolOutputs = message.additional_kwargs.tool_outputs as
    | { type: "computer_call"; call_id: string; action: { type: string } }[]
    | undefined;

  return toolOutputs?.find((toolOutput) => toolOutput.type === "computer_call");
};

const llm = new ChatOpenAI({ model: "computer-use-preview" })
  .bindTools([
    {
      type: "computer-preview",
      display_width: 1024,
      display_height: 768,
      environment: "browser",
    },
  ])
  .bind({ truncation: "auto" });

let message = await llm.invoke("Check the latest OpenAI news on bing.com.");
const computerCall = findComputerCall(message);

if (computerCall) {
  // Act on a computer call action
  const screenshot = await fs.readFile("./screenshot.png", {
    encoding: "base64",
  });

  message = await llm.invoke(
    [
      new ToolMessage({
        additional_kwargs: { type: "computer_call_output" },
        tool_call_id: computerCall.call_id,
        content: [
          {
            type: "computer_screenshot",
            image_url: `data:image/png;base64,${screenshot}`,
          },
        ],
      }),
    ],
    { previous_response_id: message.response_metadata["id"] }
  );
}

```

#### 代码解释器

ChatOpenAI 允许您使用内置的[code interpreter tool](https://platform.openai.com/docs/guides/tools-code-interpreter)来支持代码的沙盒生成和执行。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "o4-mini",
  useResponsesApi: true,
});

const llmWithTools = llm.bindToools([
  {
    type: "code_interpreter",
    // Creates a new container
    container: { type: "auto" }
  },
]);

const response = await llmWithTools.invoke(
  "Write and run code to answer the question: what is 3^3?"
);
```

请注意，上面的命令创建了一个新的[container](https://platform.openai.com/docs/guides/tools-code-interpreter#containers)。我们可以通过指定现有容器 ID 在调用之间重用容器。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const tool_outputs: Record<string, any>[] = response.additional_kwargs.tool_outputs
const container_id = tool_outputs[0].container_id

const llmWithTools = llm.bindTools([
  {
    type: "code_interpreter",
    // Reuses container from the last call
    container: container_id,
  },
]);
```

#### 远程 MCP

ChatOpenAI 支持内置的[remote MCP tool](https://platform.openai.com/docs/guides/tools-remote-mcp)，允许在 OpenAI 服务器上进行模型生成的对 MCP 服务器的调用。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "o4-mini",
    useResponsesApi: true,
});

const llmWithMcp = llm.bindTools([
    {
        type: "mcp",
        server_label: "deepwiki",
        server_url: "https://mcp.deepwiki.com/mcp",
        require_approval: "never"
    }
]);

const response = await llmWithMcp.invoke(
    "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?"
);
```

<Note>
  **MCP 批准**

  收到指示后，OpenAI 将在调用远程 MCP 服务器之前请求批准。

  在上面的命令中，我们指示模型永远不需要批准。我们还可以将模型配置为始终请求批准，或始终请求特定工具的批准：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  ...
  const llmWithMcp = llm.bindTools([
    {
      type: "mcp",
      server_label: "deepwiki",
      server_url: "https://mcp.deepwiki.com/mcp",
      require_approval: {
        always: {
          tool_names: ["read_wiki_structure"],
        },
      },
    },
  ]);
  const response = await llmWithMcp.invoke(
      "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?"
  );
  ```

  通过此配置，响应可以包含类型为 `mcp_approval_request` 的工具输出。要提交批准请求的批准，您可以将其构建为后续消息中的内容块：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const approvals = [];
  if (Array.isArray(response.additional_kwargs.tool_outputs)) {
    for (const content of response.additional_kwargs.tool_outputs) {
      if (content.type === "mcp_approval_request") {
        approvals.push({
          type: "mcp_approval_response",
          approval_request_id: content.id,
          approve: true,
        });
      }
    }
  }

  const nextResponse = await model.invoke(
    [
      response,
      new HumanMessage({ content: approvals }),
    ],
  );
  ```
</Note>

#### 图像生成ChatOpenAI 允许您使用内置的 [image generation tool](https://platform.openai.com/docs/guides/tools-image-generation) 通过响应 API 创建图像作为多轮对话的一部分。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-5.5",
  useResponsesApi: true,
});

const llmWithImageGeneration = llm.bindTools([
  {
    type: "image_generation",
    quality: "low",
  }
]);

const response = await llmWithImageGeneration.invoke(
  "Draw a random short word in green font."
)
```

### 推理模型

<Warning>
  **兼容性**：以下几点适用于`@langchain/openai>=0.4.0`。
</Warning>

当使用`o1`这样的推理模型时，`withStructuredOutput`的默认方法是OpenAI内置的结构化输出方法（相当于将`method: "jsonSchema"`作为选项传递给`withStructuredOutput`）。 JSON 模式的工作方式大多与其他模型相同，但有一个重要的警告：定义模式时，不考虑`z.optional()`，您应该使用`z.nullable()`。

这是一个例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { ChatOpenAI } from "@langchain/openai";

// Will not work
const reasoningModelSchemaOptional = z.object({
  color: z.optional(z.string()).describe("A color mentioned in the input"),
});

const reasoningModelOptionalSchema = new ChatOpenAI({
  model: "o1",
}).withStructuredOutput(reasoningModelSchemaOptional, {
  name: "extract_color",
});

await reasoningModelOptionalSchema.invoke([{
  role: "user",
  content: `I am 6'5" tall and love fruit.`
}]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ color: 'No color mentioned' }
```

这是 `z.nullable()` 的示例：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { ChatOpenAI } from "@langchain/openai";

// Will not work
const reasoningModelSchemaNullable = z.object({
  color: z.nullable(z.string()).describe("A color mentioned in the input"),
});

const reasoningModelNullableSchema = new ChatOpenAI({
  model: "o1",
}).withStructuredOutput(reasoningModelSchemaNullable, {
  name: "extract_color",
});

await reasoningModelNullableSchema.invoke([{
  role: "user",
  content: `I am 6'5" tall and love fruit.`
}]);
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{ color: null }
```

## 提示缓存

如果您的输入超过一定大小（撰写本文时为 1024 个令牌），较新的 OpenAI 模型将自动[cache parts of your prompt](https://openai.com/index/api-prompt-caching/)，以降低需要长上下文的用例的成本。

**注意：** 为给定查询缓存的令牌数量尚未在 `AIMessage.usage_metadata` 中标准化，而是包含在 `AIMessage.response_metadata` 字段中。

这是一个例子

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// @lc-docs-hide-cell

const CACHED_TEXT = `## Components

LangChain provides standard, extendable interfaces and external integrations for various components useful for building with LLMs.
Some components LangChain implements, some components we rely on third-party integrations for, and others are a mix.

### Chat models

<span data-heading-keywords="chat model,chat models"></span>

Language models that use a sequence of messages as inputs and return chat messages as outputs (as opposed to using plain text).
These are generally newer models (older models are generally \`LLMs\`, see below).
Chat models support the assignment of distinct roles to conversation messages, helping to distinguish messages from the AI, users, and instructions such as system messages.

Although the underlying models are messages in, message out, the LangChain wrappers also allow these models to take a string as input.
This gives them the same interface as LLMs (and simpler to use).
When a string is passed in as input, it will be converted to a \`HumanMessage\` under the hood before being passed to the underlying model.

LangChain does not host any Chat Models, rather we rely on third party integrations.

We have some standardized parameters when constructing ChatModels:

- \`model\`: the name of the model

Chat Models also accept other parameters that are specific to that integration.

<Warning>
**Some chat models have been fine-tuned for **tool calling** and provide a dedicated API for it.**

Generally, such models are better at tool calling than non-fine-tuned models, and are recommended for use cases that require tool calling.
Please see the [tool calling section](/oss/javascript/langchain/tools) for more information.
</Warning>

For specifics on how to use chat models, see the [relevant how-to guides here](/oss/javascript/langchain/models).

#### Multimodality

Some chat models are multimodal, accepting images, audio and even video as inputs.
These are still less common, meaning model providers haven't standardized on the "best" way to define the API.
Multimodal outputs are even less common. As such, we've kept our multimodal abstractions fairly light weight
and plan to further solidify the multimodal APIs and interaction patterns as the field matures.

In LangChain, most chat models that support multimodal inputs also accept those values in OpenAI's content blocks format.
So far this is restricted to image inputs. For models like Gemini which support video and other bytes input, the APIs also support the native, model-specific representations.

For specifics on how to use multimodal models, see the [relevant how-to guides here](/oss/javascript/how-to/#multimodal).

### LLMs

<span data-heading-keywords="llm,llms"></span>

<Warning>
**Pure text-in/text-out LLMs tend to be older or lower-level. Many popular models are best used as [chat completion models](/oss/javascript/langchain/models),**

even for non-chat use cases.

You are probably looking for [the section above instead](/oss/javascript/langchain/models).
</Warning>

Language models that takes a string as input and returns a string.
These are traditionally older models (newer models generally are [Chat Models](/oss/javascript/langchain/models), see above).

Although the underlying models are string in, string out, the LangChain wrappers also allow these models to take messages as input.
This gives them the same interface as [Chat Models](/oss/javascript/langchain/models).
When messages are passed in as input, they will be formatted into a string under the hood before being passed to the underlying model.

LangChain does not host any LLMs, rather we rely on third party integrations.

For specifics on how to use LLMs, see the [relevant how-to guides here](/oss/javascript/langchain/models).

### Message types

Some language models take an array of messages as input and return a message.
There are a few different types of messages.
All messages have a \`role\`, \`content\`, and \`response_metadata\` property.

The \`role\` describes WHO is saying the message.
LangChain has different message classes for different roles.

The \`content\` property describes the content of the message.
This can be a few different things:

- A string (most models deal this type of content)
- A List of objects (this is used for multi-modal input, where the object contains information about that input type and that input location)

#### HumanMessage

This represents a message from the user.

#### AIMessage

This represents a message from the model. In addition to the \`content\` property, these messages also have:

**\`response_metadata\`**

The \`response_metadata\` property contains additional metadata about the response. The data here is often specific to each model provider.
This is where information like log-probs and token usage may be stored.

**\`tool_calls\`**

These represent a decision from a language model to call a tool. They are included as part of an \`AIMessage\` output.
They can be accessed from there with the \`.tool_calls\` property.

This property returns a list of \`ToolCall\`s. A \`ToolCall\` is an object with the following arguments:

- \`name\`: The name of the tool that should be called.
- \`args\`: The arguments to that tool.
- \`id\`: The id of that tool call.

#### SystemMessage

This represents a system message, which tells the model how to behave. Not every model provider supports this.

#### ToolMessage

This represents the result of a tool call. In addition to \`role\` and \`content\`, this message has:

- a \`tool_call_id\` field which conveys the id of the call to the tool that was called to produce this result.
- an \`artifact\` field which can be used to pass along arbitrary artifacts of the tool execution which are useful to track but which should not be sent to the model.

#### (Legacy) FunctionMessage

This is a legacy message type, corresponding to OpenAI's legacy function-calling API. \`ToolMessage\` should be used instead to correspond to the updated tool-calling API.

This represents the result of a function call. In addition to \`role\` and \`content\`, this message has a \`name\` parameter which conveys the name of the function that was called to produce this result.

### Prompt templates

<span data-heading-keywords="prompt,prompttemplate,chatprompttemplate"></span>

Prompt templates help to translate user input and parameters into instructions for a language model.
This can be used to guide a model's response, helping it understand the context and generate relevant and coherent language-based output.

Prompt Templates take as input an object, where each key represents a variable in the prompt template to fill in.

Prompt Templates output a PromptValue. This PromptValue can be passed to an LLM or a ChatModel, and can also be cast to a string or an array of messages.
The reason this PromptValue exists is to make it easy to switch between strings and messages.

There are a few different types of prompt templates:

#### String PromptTemplates

These prompt templates are used to format a single string, and generally are used for simpler inputs.
For example, a common way to construct and use a PromptTemplate is as follows:

\`\`\`typescript
import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
  "Tell me a joke about {topic}"
);

await promptTemplate.invoke({ topic: "cats" });
\`\`\`

#### ChatPromptTemplates

These prompt templates are used to format an array of messages. These "templates" consist of an array of templates themselves.
For example, a common way to construct and use a ChatPromptTemplate is as follows:

\`\`\`typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["user", "Tell me a joke about {topic}"],
]);

await promptTemplate.invoke({ topic: "cats" });
\`\`\`

In the above example, this ChatPromptTemplate will construct two messages when called.
The first is a system message, that has no variables to format.
The second is a HumanMessage, and will be formatted by the \`topic\` variable the user passes in.

#### MessagesPlaceholder

<span data-heading-keywords="messagesplaceholder"></span>

This prompt template is responsible for adding an array of messages in a particular place.
In the above ChatPromptTemplate, we saw how we could format two messages, each one a string.
But what if we wanted the user to pass in an array of messages that we would slot into a particular spot?
This is how you use MessagesPlaceholder.

\`\`\`typescript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  new MessagesPlaceholder("msgs"),
]);

promptTemplate.invoke({ msgs: [new HumanMessage({ content: "hi!" })] });
\`\`\`

This will produce an array of two messages, the first one being a system message, and the second one being the HumanMessage we passed in.
If we had passed in 5 messages, then it would have produced 6 messages in total (the system message plus the 5 passed in).
This is useful for letting an array of messages be slotted into a particular spot.

An alternative way to accomplish the same thing without using the \`MessagesPlaceholder\` class explicitly is:

\`\`\`typescript
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{msgs}"], // <-- This is the changed part
]);
\`\`\`

For specifics on how to use prompt templates, see the [relevant how-to guides here](/oss/javascript/how-to/#prompt-templates).

### Example Selectors

One common prompting technique for achieving better performance is to include examples as part of the prompt.
This gives the language model concrete examples of how it should behave.
Sometimes these examples are hardcoded into the prompt, but for more advanced situations it may be nice to dynamically select them.
Example Selectors are classes responsible for selecting and then formatting examples into prompts.

For specifics on how to use example selectors, see the [relevant how-to guides here](/oss/javascript/how-to/#example-selectors).

### Output parsers

<span data-heading-keywords="output parser"></span>

<Note>
**The information here refers to parsers that take a text output from a model try to parse it into a more structured representation.**

More and more models are supporting function (or tool) calling, which handles this automatically.
It is recommended to use function/tool calling rather than output parsing.
See the [LangChain tools documentation](/oss/javascript/langchain/tools).

</Note>

Responsible for taking the output of a model and transforming it to a more suitable format for downstream tasks.
Useful when you are using LLMs to generate structured data, or to normalize output from chat models and LLMs.

There are two main methods an output parser must implement:

- "Get format instructions": A method which returns a string containing instructions for how the output of a language model should be formatted.
- "Parse": A method which takes in a string (assumed to be the response from a language model) and parses it into some structure.

And then one optional one:

- "Parse with prompt": A method which takes in a string (assumed to be the response from a language model) and a prompt (assumed to be the prompt that generated such a response) and parses it into some structure. The prompt is largely provided in the event the OutputParser wants to retry or fix the output in some way, and needs information from the prompt to do so.

Output parsers accept a string or \`BaseMessage\` as input and can return an arbitrary type.

LangChain has many different types of output parsers. This is a list of output parsers LangChain supports. The table below has various pieces of information:

**Name**: The name of the output parser

**Supports Streaming**: Whether the output parser supports streaming.

**Input Type**: Expected input type. Most output parsers work on both strings and messages, but some (like OpenAI Functions) need a message with specific arguments.

**Output Type**: The output type of the object returned by the parser.

**Description**: Our commentary on this output parser and when to use it.

The current date is ${new Date().toISOString()}`;

// Noop statement to hide output
void 0;
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const modelWithCaching = new ChatOpenAI({
  model: "gpt-5.4-mini",
});

// CACHED_TEXT is some string longer than 1024 tokens
const LONG_TEXT = `You are a pirate. Always respond in pirate dialect.

Use the following as context when answering questions:

${CACHED_TEXT}`;

const longMessages = [
  {
    role: "system",
    content: LONG_TEXT,
  },
  {
    role: "user",
    content: "What types of messages are supported in LangChain?",
  },
];

const originalRes = await modelWithCaching.invoke(longMessages);

console.log("USAGE:", originalRes.response_metadata.usage);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
USAGE: {
  prompt_tokens: 2624,
  completion_tokens: 263,
  total_tokens: 2887,
  prompt_tokens_details: { cached_tokens: 0 },
  completion_tokens_details: { reasoning_tokens: 0 }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const resWitCaching = await modelWithCaching.invoke(longMessages);

console.log("USAGE:", resWitCaching.response_metadata.usage);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
USAGE: {
  prompt_tokens: 2624,
  completion_tokens: 272,
  total_tokens: 2896,
  prompt_tokens_details: { cached_tokens: 2432 },
  completion_tokens_details: { reasoning_tokens: 0 }
}
```

## 预测输出一些 OpenAI 模型（例如其 `gpt-4o` 和 `gpt-4o-mini` 系列）支持 [Predicted Outputs](https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs)，这允许您提前传递 LLM 预期输出的已知部分以减少延迟。这对于编辑文本或代码等情况非常有用，在这种情况下，只有一小部分模型的输出会发生变化。

这是一个例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const modelWithPredictions = new ChatOpenAI({
  model: "gpt-5.4-mini",
});

const codeSample = `
/// <summary>
/// Represents a user with a first name, last name, and username.
/// </summary>
public class User
{
/// <summary>
/// Gets or sets the user's first name.
/// </summary>
public string FirstName { get; set; }

/// <summary>
/// Gets or sets the user's last name.
/// </summary>
public string LastName { get; set; }

/// <summary>
/// Gets or sets the user's username.
/// </summary>
public string Username { get; set; }
}
`;

// Can also be attached ahead of time
// using `model.bind({ prediction: {...} })`;
await modelWithPredictions.invoke(
  [
    {
      role: "user",
      content:
        "Replace the Username property with an Email property. Respond only with code, and with no markdown formatting.",
    },
    {
      role: "user",
      content: codeSample,
    },
  ],
  {
    prediction: {
      type: "content",
      content: codeSample,
    },
  }
);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessage {
  "id": "chatcmpl-AQLyQKnazr7lEV7ejLTo1UqhzHDBl",
  "content": "/// <summary>\n/// Represents a user with a first name, last name, and email.\n/// </summary>\npublic class User\n{\n/// <summary>\n/// Gets or sets the user's first name.\n/// </summary>\npublic string FirstName { get; set; }\n\n/// <summary>\n/// Gets or sets the user's last name.\n/// </summary>\npublic string LastName { get; set; }\n\n/// <summary>\n/// Gets or sets the user's email.\n/// </summary>\npublic string Email { get; set; }\n}",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 148,
      "completionTokens": 217,
      "totalTokens": 365
    },
    "finish_reason": "stop",
    "usage": {
      "prompt_tokens": 148,
      "completion_tokens": 217,
      "total_tokens": 365,
      "prompt_tokens_details": {
        "cached_tokens": 0
      },
      "completion_tokens_details": {
        "reasoning_tokens": 0,
        "accepted_prediction_tokens": 36,
        "rejected_prediction_tokens": 116
      }
    },
    "system_fingerprint": "fp_0ba0d124f1"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 217,
    "input_tokens": 148,
    "total_tokens": 365,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {
      "reasoning": 0
    }
  }
}
```

请注意，当前预测作为额外令牌进行计费，并且会增加您的使用量和成本，以换取延迟的减少。

## 音频输出

一些 OpenAI 模型（例如`gpt-4o-audio-preview`）支持生成音频输出。此示例展示了如何使用该功能：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";

const modelWithAudioOutput = new ChatOpenAI({
  model: "gpt-4o-audio-preview",
  // You may also pass these fields to `.bind` as a call argument.
  modalities: ["text", "audio"], // Specifies that the model should output audio.
  audio: {
    voice: "alloy",
    format: "wav",
  },
});

const audioOutputResult = await modelWithAudioOutput.invoke("Tell me a joke about cats.");
const castAudioContent = audioOutputResult.additional_kwargs.audio as Record<string, any>;

console.log({
  ...castAudioContent,
  data: castAudioContent.data.slice(0, 100) // Sliced for brevity
})
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  id: 'audio_67129e9466f48190be70372922464162',
  data: 'UklGRgZ4BABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTguMjkuMTAwAGRhdGHA',
  expires_at: 1729277092,
  transcript: "Why did the cat sit on the computer's keyboard? Because it wanted to keep an eye on the mouse!"
}
```

我们看到音频数据在`data`字段内返回。我们还提供了一个 `expires_at` 日期字段。该字段表示服务器上不再可访问音频响应以用于多轮对话的日期。

### 流式音频输出

OpenAI 还支持流式音频输出。这是一个例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessageChunk } from "@langchain/core/messages";
import { concat } from "@langchain/core/utils/stream"
import { ChatOpenAI } from "@langchain/openai";

const modelWithStreamingAudioOutput = new ChatOpenAI({
  model: "gpt-4o-audio-preview",
  modalities: ["text", "audio"],
  audio: {
    voice: "alloy",
    format: "pcm16", // Format must be `pcm16` for streaming
  },
});

const audioOutputStream = await modelWithStreamingAudioOutput.stream("Tell me a joke about cats.");
let finalAudioOutputMsg: AIMessageChunk | undefined;
for await (const chunk of audioOutputStream) {
  finalAudioOutputMsg = finalAudioOutputMsg ? concat(finalAudioOutputMsg, chunk) : chunk;
}
const castStreamedAudioContent = finalAudioOutputMsg?.additional_kwargs.audio as Record<string, any>;

console.log({
  ...castStreamedAudioContent,
  data: castStreamedAudioContent.data.slice(0, 100) // Sliced for brevity
})
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  id: 'audio_67129e976ce081908103ba4947399a3eaudio_67129e976ce081908103ba4947399a3e',
  transcript: 'Why was the cat sitting on the computer? Because it wanted to keep an eye on the mouse!',
  index: 0,
  data: 'CgAGAAIADAAAAA0AAwAJAAcACQAJAAQABQABAAgABQAPAAAACAADAAUAAwD8/wUA+f8MAPv/CAD7/wUA///8/wUA/f8DAPj/AgD6',
  expires_at: 1729277096
}
```

### 音频输入

这些模型还支持传递音频作为输入。为此，您必须指定 `input_audio` 字段，如下所示：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { HumanMessage } from "@langchain/core/messages";

const userInput = new HumanMessage({
  content: [{
    type: "input_audio",
    input_audio: {
      data: castAudioContent.data, // Reuse the base64 data from the first example
      format: "wav",
    },
  }]
})

// Reuse the same model instance
const userInputAudioRes = await modelWithAudioOutput.invoke([userInput]);

console.log((userInputAudioRes.additional_kwargs.audio as Record<string, any>).transcript);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
That's a great joke! It's always fun to imagine why cats do the funny things they do. Keeping an eye on the "mouse" is a creatively punny way to describe it!
```

***

## API 参考有关所有 `ChatOpenAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/openai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>