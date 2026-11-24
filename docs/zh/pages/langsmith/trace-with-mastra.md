<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Mastra agents | https://docs.langchain.com/langsmith/trace-with-mastra -->

# 追踪 Mastra 特工

[Mastra](https://mastra.ai/docs) 是一个用于构建 AI 代理的 TypeScript 框架。使用 Mastra 的 [LangSmith exporter](https://mastra.ai/reference/observability/tracing/exporters/langsmith)，您可以将来自 Mastra 代理和工作流程的跟踪发送到 LangSmith 以进行调试、评估和可观察。

本指南向您展示如何使用 Mastra 的 AI 跟踪系统将 Mastra 与 LangSmith 集成。

## 安装

安装 Mastra 和 LangSmith 导出器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @mastra/core @mastra/langsmith @mastra/observability @mastra/libsql
```

## 设置

1. 设置您的 LangSmith API 密钥和所选环境的 `tracer_session_name`：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY=<your_langsmith_api_key>
   export LANGCHAIN_PROJECT=<environment-tracer-session-name>
   ```

   > [!提示]
   >
   > 设置 [agent addressing](/langsmith/log-traces-to-agent) 变量时，导出器将运行发送给代理，但它会按项目名称附加来自 Mastra 评分器的分数。将 `LANGCHAIN_PROJECT` 设置为代理环境的 [⟦T10⟧](/langsmith/create-an-agent#use-an-environment-project)，以便跑步和得分均到达代理。不要同时设置`LANGSMITH_AGENT_ID`和`LANGSMITH_AGENT_ENVIRONMENT`：当它们与项目名称一起设置时，LangSmith不会跟踪调用。如果您未设置 `LANGCHAIN_PROJECT`，则跟踪将发送至名为 `default` 的代理。

2. 如果您计划使用 OpenAI 模型，还请确保您在运行时有可用的 OpenAI API 密钥：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export OPENAI_API_KEY=<your_openai_api_key>
   ```

3. 在您的项目目录中，创建以下项目结构和文件：

   ```
   src/
       mastra.ts
       agent.ts
       index.ts
   ```

## 使用 LangSmith 导出器配置 MastraMastra 跟踪直接在 `Mastra` 构造函数上配置。将以下内容添加到 `mastra.ts` 文件中：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { LangSmithExporter } from "@mastra/langsmith";

import { echoAgent } from "./agent";

export const mastra = new Mastra({
  agents: { echoAgent },

  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),

  observability: {
    configs: {
      langsmith: {
        serviceName: "mastra-langsmith-demo",
        exporters: [
          new LangSmithExporter({
            apiKey: process.env.LANGSMITH_API_KEY,
          }),
        ],
      },
    },
  },

  // Disable deprecated telemetry system
  telemetry: {
    enabled: false,
  },
});
```

* [Storage is required for tracing](https://mastra.ai/docs/observability/integrations/exporters/mastra-storage)（即使在外部导出轨迹时）。
* LangSmith 导出器从环境变量中读取凭据。
* [deprecated telemetry system](https://mastra.ai/docs/observability/overview#otel-tracing-deprecated) 被禁用以避免警告。
* 在 Mastra 服务器外部运行 Mastra 时，不需要单独的检测文件。
  更多详情请参阅[Mastra docs](https://mastra.ai/docs/observability/overview)。

### 定义一个代理

为了兼容性，请使用[string-based model identifiers](https://mastra.ai/models#basic-usage)。将以下代码添加到 `agent.ts` 文件中：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Agent } from "@mastra/core/agent";

export const echoAgent = new Agent({
  name: "echoAgent",
  instructions: "You are a helpful assistant.",
  model: "openai/gpt-6-luna",
});
```

Mastra 将使用您配置的 API 密钥自动路由模型调用并捕获每次调用的跟踪。

### 运行代理

1. 将以下内容添加到 `index.ts` 文件中：

   ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import { mastra } from "./mastra";

   async function main() {
   const agent = mastra.getAgent("echoAgent");
   const result = await agent.generate("Say hello and explain what Mastra is.");
   console.log(result.text);
   }

   main();
   ```

2. 运行您的代理：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   npx ts-node src/index.ts
   ```

## 查看LangSmith中的踪迹

运行代理后：

1. 打开[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-mastra)。
2. 选择您的代理，进入**跟踪**，然后选择您在`LANGCHAIN_PROJECT`中设置的`tracer_session_name`的环境。
3. 找到`echoAgent.generate`对应的迹线。

您将能够检查：

* 模型输入和输出
* 代理执行步骤
* 时间和错误信息

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-mastra.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。