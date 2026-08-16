<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Mastra applications | https://docs.langchain.com/langsmith/trace-with-mastra -->

# 跟踪 Mastra 应用程序

[Mastra](https://mastra.ai/docs) 是一个 TypeScript 框架，用于构建人工智能驱动的应用程序和代理。使用 Mastra 的 [LangSmith exporter](https://mastra.ai/docs/observability/ai-tracing/exporters/langsmith)，您可以将来自 Mastra 代理和工作流程的跟踪发送到 LangSmith 以进行调试、评估和可观察性。

本指南向您展示如何使用 Mastra 的 AI 跟踪系统将 Mastra 与 LangSmith 集成。

## 安装

安装 Mastra 和 LangSmith 导出器：

```bash
npm install @mastra/core @mastra/langsmith @mastra/observability @mastra/libsql
```

## 设置

1. 设置您的 LangSmith API 密钥和（可选）LangSmith 项目名称：

    ```bash
    export LANGSMITH_API_KEY=<your_langsmith_api_key>
    export LANGCHAIN_PROJECT=<your_project_name> # optional
    ```

    <Tip>
    如果未设置[⟦T8⟧](/langsmith/log-traces-to-project)，则跟踪将发送到默认项目。
    </Tip>


1. 如果您计划使用 OpenAI 模型，还请确保您在运行时有可用的 OpenAI API 密钥：

    ```bash
    export OPENAI_API_KEY=<your_openai_api_key>
    ```

1. 在您的项目目录中，创建以下项目结构和文件：

    ```
    src/
        mastra.ts
        agent.ts
        index.ts
    ```

## 使用 LangSmith 导出器配置 Mastra

Mastra 跟踪直接在 `Mastra` 构造函数上配置。将以下内容添加到 `mastra.ts` 文件中：

```ts
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
```- [Storage is required for tracing](https://mastra.ai/docs/observability/ai-tracing/overview#basic-config)（即使在外部导出跟踪时）。
- LangSmith 导出器从环境变量中读取凭据。
- [deprecated telemetry system](https://mastra.ai/docs/observability/overview#otel-tracing-deprecated) 被禁用以避免警告。
- 在 Mastra 服务器外部运行 Mastra 时，不需要单独的检测文件。
详情请参阅[Mastra docs](https://mastra.ai/docs/observability/ai-tracing/overview)。

### 定义一个代理

为了兼容性，请使用[string-based model identifiers](https://mastra.ai/models#basic-usage)。将以下代码添加到 `agent.ts` 文件中：

```ts
import { Agent } from "@mastra/core/agent";

export const echoAgent = new Agent({
  name: "echoAgent",
  instructions: "You are a helpful assistant.",
  model: "openai/gpt-4o-mini",
});
```

Mastra 将使用您配置的 API 密钥自动路由模型调用，并捕获每次调用的跟踪。

### 运行代理

1. 将以下内容添加到 `index.ts` 文件中：

    ```ts
    import { mastra } from "./mastra";

    async function main() {
    const agent = mastra.getAgent("echoAgent");
    const result = await agent.generate("Say hello and explain what Mastra is.");
    console.log(result.text);
    }

    main();
    ```

1. 运行您的应用程序：

    ```bash
    npx ts-node src/index.ts
    ```

## 查看LangSmith中的踪迹

运行代理后：

1. 打开[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-with-mastra)。
1. 选择您的项目。例如`LANGCHAIN_PROJECT`的值。
1. 找到`echoAgent.generate`对应的迹线。

您将能够检查：

- 模型输入和输出
- 代理执行步骤
- 时间和错误信息

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-mastra.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>