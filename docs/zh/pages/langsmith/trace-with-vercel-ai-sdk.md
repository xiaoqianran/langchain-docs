<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Vercel AI SDK applications (JS/TS only) | https://docs.langchain.com/langsmith/trace-with-vercel-ai-sdk -->

# 跟踪 Vercel AI SDK 应用程序（仅限 JS/TS）

使用 LangSmith for AI SDK v5、v6 和 v7 跟踪 Vercel AI SDK 应用程序。

您可以使用 LangSmith 跟踪 Vercel AI SDK 的运行。本指南向您介绍如何为 AI SDK v5、v6 和 v7 设置跟踪。

## 安装

安装 Vercel AI SDK、模型提供程序包和 LangSmith。本指南对以下代码片段使用 Vercel 的 OpenAI 集成，但您可以使用任何其他 Vercel AI SDK 提供商。

<Tabs>
  <Tab title="AI SDK v7">
    <Note>
      `LangSmithTelemetry` 需要 AI SDK v7，并且在 `langsmith>=0.7.2` 中可用。
    </Note>

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install ai @ai-sdk/openai zod langsmith
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add ai @ai-sdk/openai zod langsmith
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add ai @ai-sdk/openai zod langsmith
      ```
    </CodeGroup>
  </Tab>

  <Tab title="AI SDK v5 and v6">
    <Note>
      `wrapAISDK`支持AI SDK v6并需要`langsmith>=0.3.63`。如果您使用的是旧版本的AI SDK或`langsmith`，请参考[OpenTelemetry (OTEL) based approach](/langsmith/legacy-trace-with-vercel-ai-sdk)。
    </Note>

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install ai @ai-sdk/openai zod langsmith
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add ai @ai-sdk/openai zod langsmith
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add ai @ai-sdk/openai zod langsmith
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 环境配置

```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>

# The examples use OpenAI, but you can use any LLM provider of choice
export OPENAI_API_KEY=<your-openai-api-key>

# For LangSmith API keys linked to multiple workspaces, set the LANGSMITH_WORKSPACE_ID environment variable to specify which workspace to use.
export LANGSMITH_WORKSPACE_ID=<your-workspace-id>
```

## 基本设置

<Tabs>
  <Tab title="AI SDK v7">
    注册一次`LangSmithTelemetry`，然后像平常一样使用AI SDK方法。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, registerTelemetry } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";

    registerTelemetry(LangSmithTelemetry());

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });
    ```

    您应该在 LangSmith 仪表板[like this one](https://smith.langchain.com/public/4f0e689e-c801-44d3-8857-93b47ab100cc/r) 中看到一条跟踪。

    您还可以使用工具调用来跟踪运行：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, registerTelemetry, stepCountIs, tool } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";
    import { z } from "zod";

    registerTelemetry(LangSmithTelemetry());

    await generateText({
        model: openai("gpt-5.5"),
        messages: [
            {
                role: "user",
                content: "What are my orders and where are they? My user ID is 123",
            },
        ],
        tools: {
            listOrders: tool({
                description: "list all orders",
                inputSchema: z.object({ userId: z.string() }),
                execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
            }),
            viewTrackingInformation: tool({
                description: "view tracking information for a specific order",
                inputSchema: z.object({ orderId: z.string() }),
                execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
            }),
        },
        stopWhen: stepCountIs(5),
    });
    ```

    这会产生类似 [this one](https://smith.langchain.com/public/6075fa2c-d255-4885-a66a-4fc798afaa9f/r) 的痕迹。
  </Tab><Tab title="AI SDK v5 and v6">
    使用`wrapAISDK`将AI SDK方法包装一次，然后像平常一样调用包装的方法。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { wrapAISDK } from "langsmith/experimental/vercel";

    const { generateText } = wrapAISDK(ai);

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });
    ```

    您还可以使用工具调用来跟踪运行：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { wrapAISDK } from "langsmith/experimental/vercel";
    import { z } from "zod";

    const { generateText, tool } = wrapAISDK(ai);

    await generateText({
        model: openai("gpt-5.5"),
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
                execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
            }),
            viewTrackingInformation: tool({
                description: "view tracking information for a specific order",
                parameters: z.object({ orderId: z.string() }),
                execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
            }),
        },
        maxSteps: 5,
    });
    ```
  </Tab>
</Tabs>

您可以像平常一样使用其他 AI SDK 方法。

### 与`traceable`

您可以将 `traceable` 调用包装在 AI SDK 调用周围或 AI SDK 工具调用中。如果您想在 LangSmith 中将运行分组在一起，这非常有用。

<Tabs>
  <Tab title="AI SDK v7">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, registerTelemetry, stepCountIs, tool } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    registerTelemetry(LangSmithTelemetry());

    const wrapper = traceable(
        async (input: string) => {
            const { text } = await generateText({
                model: openai("gpt-5.5"),
                messages: [
                    {
                        role: "user",
                        content: input,
                    },
                ],
                tools: {
                    listOrders: tool({
                        description: "list all orders",
                        inputSchema: z.object({ userId: z.string() }),
                        execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
                    }),
                    viewTrackingInformation: tool({
                        description: "view tracking information for a specific order",
                        inputSchema: z.object({ orderId: z.string() }),
                        execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
                    }),
                },
                stopWhen: stepCountIs(5),
            });
            return text;
        },
        { name: "wrapper" },
    );

    await wrapper("What are my orders and where are they? My user ID is 123.");
    ```

    生成的轨迹将看起来为 [like this](https://smith.langchain.com/public/ff25bc26-9389-4798-8b91-2bdcc95d4a8e/r)。
  </Tab>

  <Tab title="AI SDK v5 and v6">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { wrapAISDK } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    const { generateText, tool } = wrapAISDK(ai);

    const wrapper = traceable(
        async (input: string) => {
            const { text } = await generateText({
                model: openai("gpt-5.5"),
                messages: [
                    {
                        role: "user",
                        content: input,
                    },
                ],
                tools: {
                    listOrders: tool({
                        description: "list all orders",
                        parameters: z.object({ userId: z.string() }),
                        execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
                    }),
                    viewTrackingInformation: tool({
                        description: "view tracking information for a specific order",
                        parameters: z.object({ orderId: z.string() }),
                        execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
                    }),
                },
                maxSteps: 5,
            });
            return text;
        },
        { name: "wrapper" },
    );

    await wrapper("What are my orders and where are they? My user ID is 123.");
    ```
  </Tab>
</Tabs>

## 无服务器环境中的跟踪

在无服务器环境中进行跟踪时，请在环境关闭之前等待所有运行都刷新。

<Tabs>
  <Tab title="AI SDK v7">
    将 LangSmith [⟦T33⟧](https://docs.smith.langchain.com/reference/js/classes/client.Client) 实例传递给 `LangSmithTelemetry`，然后调用 `await client.awaitPendingTraceBatches()`。确保还将其传递到您创建的任何 `traceable` 包装器中：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, stepCountIs, tool } from "ai";
    import { Client } from "langsmith";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    const client = new Client();
    const telemetry = LangSmithTelemetry({ client });

    const wrapper = traceable(
        async (input: string) => {
            const { text } = await generateText({
                model: openai("gpt-5.5"),
                messages: [
                    {
                        role: "user",
                        content: input,
                    },
                ],
                tools: {
                    listOrders: tool({
                        description: "list all orders",
                        inputSchema: z.object({ userId: z.string() }),
                        execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
                    }),
                    viewTrackingInformation: tool({
                        description: "view tracking information for a specific order",
                        inputSchema: z.object({ orderId: z.string() }),
                        execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
                    }),
                },
                stopWhen: stepCountIs(5),
                telemetry: { integrations: [telemetry] },
            });
            return text;
        },
        {
            name: "wrapper",
            client,
        },
    );

    try {
        await wrapper("What are my orders and where are they? My user ID is 123.");
    } finally {
        await client.awaitPendingTraceBatches();
    }
    ```
  </Tab>

  <Tab title="AI SDK v5 and v6">
    将 LangSmith [⟦T37⟧](https://docs.smith.langchain.com/reference/js/classes/client.Client) 实例传递给 `wrapAISDK` 以及您创建的任何 `traceable` 包装器，然后调用 `await client.awaitPendingTraceBatches()`：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { Client } from "langsmith";
    import { wrapAISDK } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    const client = new Client();
    const { generateText, tool } = wrapAISDK(ai, { client });

    const wrapper = traceable(
        async (input: string) => {
            const { text } = await generateText({
                model: openai("gpt-5.5"),
                messages: [
                    {
                        role: "user",
                        content: input,
                    },
                ],
                tools: {
                    listOrders: tool({
                        description: "list all orders",
                        parameters: z.object({ userId: z.string() }),
                        execute: async ({ userId }) => `User ${userId} has the following orders: 1`,
                    }),
                    viewTrackingInformation: tool({
                        description: "view tracking information for a specific order",
                        parameters: z.object({ orderId: z.string() }),
                        execute: async ({ orderId }) => `Here is the tracking information for ${orderId}`,
                    }),
                },
                maxSteps: 5,
            });
            return text;
        },
        {
            name: "wrapper",
            client,
        },
    );

    try {
        await wrapper("What are my orders and where are they? My user ID is 123.");
    } finally {
        await client.awaitPendingTraceBatches();
    }
    ```
  </Tab>
</Tabs>

如果您使用 `Next.js`，有一个方便的 [⟦T42⟧](https://nextjs.org/docs/app/api-reference/functions/after) 钩子，您可以在其中放置此逻辑：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { after } from "next/server";
import { Client } from "langsmith";

export async function POST(request: Request) {
    const client = new Client();
    const body = await request.json();

    after(async () => {
        await client.awaitPendingTraceBatches();
    });

    return Response.json({ ok: true, body });
}
```

请参阅[Trace JS functions in serverless environments](/langsmith/serverless-environments)了解更多详细信息，包括有关在无服务器环境中管理速率限制的信息。

## 传递 LangSmith 配置您可以传递特定于 LangSmith 的配置，例如元数据、运行名称、标签和自定义客户端实例。

<Tabs>
  <Tab title="AI SDK v7">
    如果您全局注册集成，则该配置适用于将来的 AI SDK 调用：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, registerTelemetry } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";

    registerTelemetry(
        LangSmithTelemetry({
            metadata: { key_for_all_runs: "value" },
            tags: ["myrun"],
        }),
    );

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });
    ```

    要将配置应用于单次运行，请在该 AI SDK 调用中传递遥测集成：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
        telemetry: {
            integrations: [
                LangSmithTelemetry({
                    metadata: { individual_key: "value" },
                    name: "my_individual_run",
                }),
            ],
        },
    });
    ```
  </Tab>

  <Tab title="AI SDK v5 and v6">
    如果将配置传递到`wrapAISDK`，则该配置将应用于包装的方法：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { wrapAISDK } from "langsmith/experimental/vercel";

    const { generateText } = wrapAISDK(ai, {
        metadata: { key_for_all_runs: "value" },
        tags: ["myrun"],
    });

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });
    ```

    要将配置应用于单次运行，请在该 AI SDK 调用中传递 LangSmith 提供程序选项：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import {
        createLangSmithProviderOptions,
        wrapAISDK,
    } from "langsmith/experimental/vercel";

    const { generateText } = wrapAISDK(ai);

    await generateText({
        model: openai("gpt-5.5"),
        prompt: "Write a vegetarian lasagna recipe for 4 people.",
        providerOptions: {
            langsmith: createLangSmithProviderOptions<typeof ai.generateText>({
                metadata: { individual_key: "value" },
                name: "my_individual_run",
            }),
        },
    });
    ```
  </Tab>
</Tabs>

## 编辑数据

您可以通过指定自定义输入/输出处理函数来自定义 AI SDK 发送给 LangSmith 的输入和输出内容。如果您正在处理并希望避免发送给 LangSmith 的敏感数据，这非常有用。

由于输出格式根据您使用的 AI SDK 方法而有所不同，因此我们建议单独定义遥测配置并将其传递到 AI SDK 调用中。您还需要为 AI SDK 调用中运行的子 LLM 提供单独的函数，因为在顶层调用 `generateText` 会在内部调用 LLM，并且可以多次执行。

这是 `generateText` 的示例：

<Tabs>
  <Tab title="AI SDK v7">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText } from "ai";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";

    const telemetry = LangSmithTelemetry({
        processInputs: (inputs) => {
            const messages = inputs.messages as Array<Record<string, unknown>> | undefined;
            return {
                messages: messages?.map((message) => ({
                    providerMetadata: message.providerOptions,
                    role: "assistant",
                    content: "REDACTED",
                })),
                prompt: "REDACTED",
            };
        },
        processOutputs: (outputs) => {
            return {
                providerMetadata: outputs.providerMetadata,
                role: "assistant",
                content: "REDACTED",
            };
        },
        processChildLLMRunInputs: (inputs) => {
            const messages = inputs.messages as Array<Record<string, unknown>> | undefined;
            return {
                messages: messages?.map((message) => ({
                    ...message,
                    content: "REDACTED CHILD INPUTS",
                })),
            };
        },
        processChildLLMRunOutputs: (outputs) => {
            return {
                providerMetadata: outputs.providerMetadata,
                content: "REDACTED CHILD OUTPUTS",
                role: "assistant",
            };
        },
    });

    const { text } = await generateText({
        model: openai("gpt-5.5"),
        prompt: "What is the capital of France?",
        telemetry: { integrations: [telemetry] },
    });

    console.log(text);
    ```
  </Tab><Tab title="AI SDK v5 and v6">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import {
        createLangSmithProviderOptions,
        wrapAISDK,
    } from "langsmith/experimental/vercel";

    const { generateText } = wrapAISDK(ai);

    const langsmith = createLangSmithProviderOptions<typeof ai.generateText>({
        processInputs: (inputs) => {
            return {
                messages: inputs.messages?.map((message) => ({
                    providerMetadata: message.providerOptions,
                    role: "assistant",
                    content: "REDACTED",
                })),
                prompt: "REDACTED",
            };
        },
        processOutputs: () => {
            return {
                role: "assistant",
                content: "REDACTED",
            };
        },
        processChildLLMRunInputs: (inputs) => {
            return {
                messages: inputs.prompt.map((message) => ({
                    ...message,
                    content: "REDACTED CHILD INPUTS",
                })),
            };
        },
        processChildLLMRunOutputs: () => {
            return {
                content: "REDACTED CHILD OUTPUTS",
                role: "assistant",
            };
        },
    });

    const { text } = await generateText({
        model: openai("gpt-5.5"),
        prompt: "What is the capital of France?",
        providerOptions: { langsmith },
    });

    console.log(text);
    ```
  </Tab>
</Tabs>

实际返回值将包含原始的、未编辑的结果，但 LangSmith 中的跟踪将被编辑。

对于编辑工具输入/输出，请将 `execute` 方法包装在 `traceable` 中，如下所示：

<Tabs>
  <Tab title="AI SDK v7">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import { generateText, stepCountIs, tool } from "ai";
    import { Client } from "langsmith";
    import { LangSmithTelemetry } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    const client = new Client();
    const telemetry = LangSmithTelemetry({ client });

    await generateText({
        model: openai("gpt-5.5"),
        messages: [
            {
                role: "user",
                content: "What are my orders? My user ID is 123.",
            },
        ],
        tools: {
            listOrders: tool({
                description: "list all orders",
                inputSchema: z.object({ userId: z.string() }),
                execute: traceable(
                    async ({ userId }) => {
                        return `User ${userId} has the following orders: 1`;
                    },
                    {
                        processInputs: () => ({ text: "REDACTED" }),
                        processOutputs: () => ({ text: "REDACTED" }),
                        run_type: "tool",
                        name: "listOrders",
                    },
                ) as (input: { userId: string }) => Promise<string>,
            }),
        },
        stopWhen: stepCountIs(5),
        telemetry: { integrations: [telemetry] },
    });

    await client.awaitPendingTraceBatches();
    ```
  </Tab>

  <Tab title="AI SDK v5 and v6">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { openai } from "@ai-sdk/openai";
    import * as ai from "ai";
    import { Client } from "langsmith";
    import { wrapAISDK } from "langsmith/experimental/vercel";
    import { traceable } from "langsmith/traceable";
    import { z } from "zod";

    const client = new Client();
    const { generateText, tool } = wrapAISDK(ai, { client });

    await generateText({
        model: openai("gpt-5.5"),
        messages: [
            {
                role: "user",
                content: "What are my orders? My user ID is 123.",
            },
        ],
        tools: {
            listOrders: tool({
                description: "list all orders",
                parameters: z.object({ userId: z.string() }),
                execute: traceable(
                    async ({ userId }) => {
                        return `User ${userId} has the following orders: 1`;
                    },
                    {
                        processInputs: () => ({ text: "REDACTED" }),
                        processOutputs: () => ({ text: "REDACTED" }),
                        run_type: "tool",
                        name: "listOrders",
                    },
                ) as (input: { userId: string }) => Promise<string>,
            }),
        },
        maxSteps: 5,
    });

    await client.awaitPendingTraceBatches();
    ```
  </Tab>
</Tabs>

`traceable` 返回类型很复杂，这使得强制转换是必要的。如果您想避免强制转换，您也可以省略 AI SDK `tool` 帮助程序。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-vercel-ai-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>