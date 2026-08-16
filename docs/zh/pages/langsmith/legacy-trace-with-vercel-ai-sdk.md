<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace with the Vercel AI SDK (Legacy) | https://docs.langchain.com/langsmith/legacy-trace-with-vercel-ai-sdk -->

# 使用 Vercel AI SDK（旧版）进行跟踪

<Warning>
本页记录了跟踪 AI SDK 运行的旧方法。对于不需要 OTEL 设置的更简单、更通用的方法，请参阅[the new guide](/langsmith/trace-with-vercel-ai-sdk)。
</Warning>

您可以使用 LangSmith 使用 OpenTelemetry (OTEL) 跟踪 Vercel AI SDK 的运行。本指南将通过一个示例进行演示。

<Note>
JavaScript 中许多流行的 [OpenTelemetry implementations](https://www.npmjs.com/package/@opentelemetry/sdk-node) 目前都处于实验阶段，
并且在生产中可能表现不稳定，尤其是在与其他提供商一起检测 LangSmith 时。如果您使用的是 AI SDK 5，
我们强烈建议使用[our recommended approach for tracing AI SDK runs](/langsmith/trace-with-vercel-ai-sdk)。
</Note>

## 0.安装

安装 Vercel AI SDK 和所需的 OTEL 软件包。我们在下面的代码片段中使用他们的 OpenAI 集成，但您也可以使用他们的任何其他选项。

<CodeGroup>

```bash npm
npm install ai @ai-sdk/openai zod
```

```bash yarn
yarn add ai @ai-sdk/openai zod
```


```bash pnpm
pnpm add ai @ai-sdk/openai zod
```

</CodeGroup>

<CodeGroup>

```bash npm
npm install @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-proto @opentelemetry/context-async-hooks
```

```bash yarn
yarn add @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-proto @opentelemetry/context-async-hooks
```

```bash pnpm
pnpm add @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-proto @opentelemetry/context-async-hooks
```

</CodeGroup>

## 1. 配置您的环境

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_OTEL_ENABLED=true

# This example uses OpenAI, but you can use any LLM provider of choice
export OPENAI_API_KEY=<your-openai-api-key>
```
## 2. 记录跟踪

### Node.js

要开始跟踪，您需要在代码开头导入并调用 `initializeOTEL` 方法：

```typescript
import { initializeOTEL } from "langsmith/experimental/otel/setup";

const { DEFAULT_LANGSMITH_SPAN_PROCESSOR } = initializeOTEL();
```

然后，将 `experimental_telemetry` 参数添加到要跟踪的 AI SDK 调用中。

<Info>
不要忘记在应用程序关闭之前调用`await DEFAULT_LANGSMITH_SPAN_PROCESSOR.shutdown();`，以便将任何剩余的痕迹刷新到LangSmith。
</Info>

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

let result;
try {
  result = await generateText({
    model: openai("gpt-5.4-nano"),
    prompt: "Write a vegetarian lasagna recipe for 4 people.",
    experimental_telemetry: {
      isEnabled: true,
    },
  });
} finally {
  await DEFAULT_LANGSMITH_SPAN_PROCESSOR.shutdown();
}
```您应该在 LangSmith 仪表板 [like this one](https://smith.langchain.com/public/21d33490-d522-4928-a944-a09e988d539c/r) 中看到一条跟踪。

您还可以使用工具调用来跟踪运行：

```typescript
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

await generateText({
  model: openai("gpt-5.4-nano"),
  messages: [
    {
      role: "user",
      content: "What are my orders and where are they? My user ID is 123",
    },
  ],
  tools: {
    listOrders: tool({
      description: "list all orders",
      parameters: z.object({ userId: z.string() }),
      execute: async ({ userId }) =>
        `User ${userId} has the following orders: 1`,
    }),
    viewTrackingInformation: tool({
      description: "view tracking information for a specific order",
      parameters: z.object({ orderId: z.string() }),
      execute: async ({ orderId }) =>
        `Here is the tracking information for ${orderId}`,
    }),
  },
  experimental_telemetry: {
    isEnabled: true,
  },
  maxSteps: 10,
});
```

这会产生类似 [this one](https://smith.langchain.com/public/e6122734-2762-4ae0-986b-0cbe4d68692f/r) 的痕迹。

### 与 `traceable`

您可以将 `traceable` 调用包装在 AI SDK 工具调用周围或内部。如果您这样做，我们建议您初始化一个 LangSmith `client` 实例，并将其传递给每个 `traceable`，然后调用 `client.awaitPendingTraceBatches();` 以确保所有跟踪刷新。如果这样做，则无需在 `DEFAULT_LANGSMITH_SPAN_PROCESSOR` 上手动调用 `shutdown()` 或 `forceFlush()`。这是一个例子：

```typescript
import { initializeOTEL } from "langsmith/experimental/otel/setup";

initializeOTEL();

import { Client } from "langsmith";
import { traceable } from "langsmith/traceable";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const client = new Client();

const wrappedText = traceable(
  async (content: string) => {
    const { text } = await generateText({
      model: openai("gpt-5.4-nano"),
      messages: [{ role: "user", content }],
      tools: {
        listOrders: tool({
          description: "list all orders",
          parameters: z.object({ userId: z.string() }),
          execute: async ({ userId }) => {
            const getOrderNumber = traceable(
              async () => {
                return "1234";
              },
              { name: "getOrderNumber" }
            );
            const orderNumber = await getOrderNumber();
            return `User ${userId} has the following order: ${orderNumber}`;
          },
        }),
      },
      experimental_telemetry: {
        isEnabled: true,
      },
      maxSteps: 10,
    });
    return { text };
  },
  { name: "parentTraceable", client }
);

let result;
try {
  result = await wrappedText("What are my orders?");
} finally {
  await client.awaitPendingTraceBatches();
}
```

生成的轨迹将看起来为 [like this](https://smith.langchain.com/public/296a0134-f3d4-4e54-afc7-b18f2c190911/r)。

### Next.js

首先，安装[⟦T33⟧](https://www.npmjs.com/package/@vercel/otel)包：

<CodeGroup>

```bash npm
npm install @vercel/otel
```

```bash yarn
yarn add @vercel/otel
```

```bash pnpm
pnpm add @vercel/otel
```

</CodeGroup>

然后，在根目录中设置一个 [⟦T34⟧](https://nextjs.org/docs/app/guides/instrumentation) 文件。
调用 `initializeOTEL` 并将结果 `DEFAULT_LANGSMITH_SPAN_PROCESSOR` 传递到 `spanProcessors` 字段到您的 `registerOTEL(...)` 调用中。
它应该看起来像这样：

```typescript
import { registerOTel } from "@vercel/otel";
import { initializeOTEL } from "langsmith/experimental/otel/setup";

const { DEFAULT_LANGSMITH_SPAN_PROCESSOR } = initializeOTEL({});

export function register() {
  registerOTel({
    serviceName: "your-project-name",
    spanProcessors: [DEFAULT_LANGSMITH_SPAN_PROCESSOR],
  });
}
```

最后，在您的 API 路由中，也调用 `initializeOTEL` 并将 `experimental_telemetry` 字段添加到您的 AI SDK 调用中：

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { initializeOTEL } from "langsmith/experimental/otel/setup";

initializeOTEL();

export async function GET() {
  const { text } = await generateText({
    model: openai("gpt-5.4-nano"),
    messages: [{ role: "user", content: "Why is the sky blue?" }],
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  return new Response(text);
}
```

您还可以将部分代码包装在 `traceables` 中以获得更精细的粒度。

### 哨兵

如果您使用 Sentry，则可以将 LangSmith 跟踪导出器附加到 Sentry 的默认 OpenTelemetry 工具，如下例所示。<Warning>
在撰写本文时，Sentry 仅支持 OTEL v1 软件包。 LangSmith 支持 v1 和 v2，但您**必须**确保安装 OTEL v1 软件包才能使仪器正常工作。

<CodeGroup>

```bash npm
npm install @opentelemetry/sdk-trace-base@1.30.1 @opentelemetry/exporter-trace-otlp-proto@0.57.2 @opentelemetry/context-async-hooks@1.30.1
```

```bash yarn
yarn add @opentelemetry/sdk-trace-base@1.30.1 @opentelemetry/exporter-trace-otlp-proto@0.57.2 @opentelemetry/context-async-hooks@1.30.1
```

```bash pnpm
pnpm add @opentelemetry/sdk-trace-base@1.30.1 @opentelemetry/exporter-trace-otlp-proto@0.57.2 @opentelemetry/context-async-hooks@1.30.1
```

</CodeGroup>
</Warning>

```typescript
import { initializeOTEL } from "langsmith/experimental/otel/setup";
import { LangSmithOTLPTraceExporter } from "langsmith/experimental/otel/exporter";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { traceable } from "langsmith/traceable";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { Client } from "langsmith";

const exporter = new LangSmithOTLPTraceExporter();
const spanProcessor = new BatchSpanProcessor(exporter);

const sentry = Sentry.init({
  dsn: "...",
  tracesSampleRate: 1.0,
  openTelemetrySpanProcessors: [spanProcessor],
});

initializeOTEL({
  globalTracerProvider: sentry?.traceProvider,
});

const wrappedText = traceable(
  async (content: string) => {
    const { text } = await generateText({
      model: openai("gpt-5.4-nano"),
      messages: [{ role: "user", content }],
      experimental_telemetry: {
        isEnabled: true,
      },
      maxSteps: 10,
    });
    return { text };
  },
  { name: "parentTraceable" }
);

let result;
try {
  result = await wrappedText("What color is the sky?");
} finally {
  await sentry?.traceProvider?.shutdown();
}
```


## 添加其他元数据

您可以将其他元数据添加到跟踪中，以帮助在 LangSmith UI 中组织和过滤它们：

```typescript {highlight={9}}
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

await generateText({
  model: openai("gpt-5.4-nano"),
  prompt: "Write a vegetarian lasagna recipe for 4 people.",
  experimental_telemetry: {
    isEnabled: true,
    metadata: { userId: "123", language: "english" },
  },
});
```

元数据将在您的LangSmith仪表板中可见，可用于过滤和搜索特定跟踪。
请注意，AI SDK 也会在内部子跨度上传播元数据。

## 自定义运行名称

您可以通过将名为 `ls_run_name` 的元数据键传递到 `experimental_telemetry` 来自定义运行名称。

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

await generateText({
  model: openai("gpt-5.4-mini"),
  prompt: "Write a vegetarian lasagna recipe for 4 people.",
  experimental_telemetry: {
    isEnabled: true,
    // highlight-start
    metadata: {
      ls_run_name: "my-custom-run-name",
    },
    // highlight-end
  },
});
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/legacy-trace-with-vercel-ai-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>