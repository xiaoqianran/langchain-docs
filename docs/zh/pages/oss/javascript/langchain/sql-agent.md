<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a SQL agent | https://docs.langchain.com/oss/javascript/langchain/sql-agent -->

## 概述

在本教程中，您将学习如何使用 LangChain [agents](/oss/javascript/langchain/agents) 构建一个可以回答有关 SQL 数据库问题的代理。

在较高层面上，代理人将：

1. 从数据库中获取可用的表和模式
2. 确定哪些表格与问题相关
3. 获取相关表的模式
4. 根据模式中的问题和信息生成查询
5. 使用 LLM 仔细检查查询是否存在常见错误
6.执行查询并返回结果
7. 纠正数据库引擎出现的错误，直到查询成功
8. 根据结果制定响应

<Warning>
  构建 SQL 数据库的问答系统需要执行模型生成的 SQL 查询。这样做存在固有的风险。确保数据库连接权限的范围始终尽可能缩小，以满足代理的需求。这将减轻（但不能消除）构建模型驱动系统的风险。
</Warning>

### 概念

以下教程涵盖以下概念：

* [Tools](/oss/javascript/langchain/tools) 用于从 SQL 数据库读取
* LangChain[agents](/oss/javascript/langchain/agents)
* [Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop)流程

## 设置

<Steps>
  <Step title="Install dependencies">
    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i langchain @langchain/core sqlite3 zod
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add langchain @langchain/core sqlite3 zod
      ``````bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add langchain @langchain/core sqlite3 zod
      ```
    </CodeGroup>
  </Step>

  <Step title="Set up LangSmith">
    设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-sql-agent) 来检查您的连锁店或代理内部发生的情况。然后设置以下环境变量：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_TRACING="true"
    export LANGSMITH_API_KEY="..."
    ```
  </Step>
</Steps>

## 构建你的 SQL 代理

<Steps>
  <Step title="Select an LLM">
    选择支持[tool-calling](/oss/javascript/integrations/providers/overview)的型号：

    <Tabs>
      <Tab title="OpenAI">
        👉 阅读[OpenAI chat model integration docs](/oss/javascript/integrations/chat/openai/)

        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/openai
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm install @langchain/openai
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/openai
          ```

          ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          bun add @langchain/openai
          ```
        </CodeGroup>

        <CodeGroup>
          ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { initChatModel } from "langchain";

          process.env.OPENAI_API_KEY = "your-api-key";

          const model = await initChatModel("gpt-5.5");
          ```

          ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { ChatOpenAI } from "@langchain/openai";

          const model = new ChatOpenAI({
            model: "gpt-5.5",
            apiKey: "your-api-key"
          });
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Anthropic">
        👉 阅读[Anthropic chat model integration docs](/oss/javascript/integrations/chat/anthropic/)

        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/anthropic
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm install @langchain/anthropic
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/anthropic
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm add @langchain/anthropic
          ```
        </CodeGroup>

        <CodeGroup>
          ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { initChatModel } from "langchain";

          process.env.ANTHROPIC_API_KEY = "your-api-key";

          const model = await initChatModel("claude-sonnet-4-6");
          ```

          ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { ChatAnthropic } from "@langchain/anthropic";

          const model = new ChatAnthropic({
            model: "claude-sonnet-4-6",
            apiKey: "your-api-key"
          });
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Azure">
        👉 阅读[Azure chat model integration docs](/oss/javascript/integrations/chat/azure/)

        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/azure
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm install @langchain/azure
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/azure
          ```

          ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          bun add @langchain/azure
          ```
        </CodeGroup>

        <CodeGroup>
          ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { initChatModel } from "langchain";

          process.env.AZURE_OPENAI_API_KEY = "your-api-key";
          process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
          process.env.OPENAI_API_VERSION = "your-api-version";

          const model = await initChatModel("azure_openai:gpt-5.5");
          ```

          ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { AzureChatOpenAI } from "@langchain/openai";

          const model = new AzureChatOpenAI({
            model: "gpt-5.5",
            azureOpenAIApiKey: "your-api-key",
            azureOpenAIApiEndpoint: "your-endpoint",
            azureOpenAIApiVersion: "your-api-version"
          });
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Google Gemini">
        👉 阅读[Google GenAI chat model integration docs](/oss/javascript/integrations/chat/google_generative_ai/)

        <CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/google-genai
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm install @langchain/google-genai
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/google-genai
          ```

          ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          bun add @langchain/google-genai
          ```
        </CodeGroup>

        <CodeGroup>
          ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { initChatModel } from "langchain";

          process.env.GOOGLE_API_KEY = "your-api-key";

          const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
          ```

          ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

          const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash-lite",
            apiKey: "your-api-key"
          });
          ```
        </CodeGroup>
      </Tab>

      <Tab title="Bedrock Converse">
        👉 阅读[AWS Bedrock chat model integration docs](/oss/javascript/integrations/chat/bedrock_converse/)<CodeGroup>
          ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          npm install @langchain/aws
          ```

          ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          pnpm install @langchain/aws
          ```

          ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          yarn add @langchain/aws
          ```

          ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          bun add @langchain/aws
          ```
        </CodeGroup>

        <CodeGroup>
          ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { initChatModel } from "langchain";

          // Follow the steps here to configure your credentials:
          // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

          const model = await initChatModel("bedrock:gpt-5.5");
          ```

          ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import { ChatBedrockConverse } from "@langchain/aws";

          // Follow the steps here to configure your credentials:
          // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

          const model = new ChatBedrockConverse({
            model: "gpt-5.5",
            region: "us-east-2"
          });
          ```
        </CodeGroup>
      </Tab>
    </Tabs>

    以下示例中显示的输出使用 OpenAI。
  </Step>

  <Step title="Configure the database">
    您将为本教程创建一个 [SQLite database](https://www.sqlitetutorial.net/sqlite-sample-database/)。 SQLite 是一个轻量级数据库，易于设置和使用。我们将加载 `chinook` 数据库，这是代表数字媒体商店的示例数据库。

    为了方便起见，我们将数据库 (`Chinook.db`) 托管在公共 GCS 存储桶上。

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import fs from "node:fs/promises";
    import path from "node:path";

    const url =
      "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
    const localPath = path.resolve("Chinook.db");

    async function resolveDbPath() {
      try {
        await fs.access(localPath);
        return localPath;
      } catch {
        // Chinook.db not present locally; download it.
      }
      const resp = await fetch(url);
      if (!resp.ok)
        throw new Error(`Failed to download DB. Status code: ${resp.status}`);
      const buf = Buffer.from(await resp.arrayBuffer());
      await fs.writeFile(localPath, buf);
      return localPath;
    }
    ```
  </Step>

  <Step title="Add tools for database interactions">
    <Warning>
      以下数据库工具是最小包装器，仅用于演示目的。它们的目的不是为了安全或在生产中使用。在执行模型生成的 SQL 之前，使用范围狭窄的数据库权限并添加特定于应用程序的验证。
    </Warning>

    我们将使用 `sqlite3` 库来查询数据库并获取模式：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import sqlite3 from "sqlite3";

    // Below are minimal tools for demonstration purposes.
    async function runQuery(query: string): Promise<any[]> {
      const dbPath = await resolveDbPath();
      const db = new sqlite3.Database(dbPath);
      return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
          db.close();
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }

    async function getSchema() {
      const tables = await runQuery(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
      );
      return tables.map((row) => row.sql).join("\n\n");
    }
    ```
  </Step>

  <Step title="Create the agent">
    在运行命令之前，请检查` _safe_sql`中LLM生成的命令：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const DENY_RE =
      /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
    const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

    function sanitizeSqlQuery(q) {
      let query = String(q ?? "").trim();

      // block multiple statements (allow one optional trailing ;)
      const semis = [...query].filter((c) => c === ";").length;
      if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
        throw new Error("multiple statements are not allowed.");
      }
      query = query.replace(/;+\s*$/g, "").trim();

      // read-only gate
      if (!query.toLowerCase().startsWith("select")) {
        throw new Error("Only SELECT statements are allowed");
      }
      if (DENY_RE.test(query)) {
        throw new Error("DML/DDL detected. Only read-only queries are permitted.");
      }

      // append LIMIT only if not already present
      if (!HAS_LIMIT_TAIL_RE.test(query)) {
        query += " LIMIT 5";
      }
      return query;
    }
    ```

    然后，使用`execute_sql`工具执行命令：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { tool } from "langchain";
    import * as z from "zod";

    const executeSql = tool(
      async ({ query }) => {
        const q = sanitizeSqlQuery(query);
        try {
          const result = await runQuery(q);
          return JSON.stringify(result, null, 2);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          throw new Error(message);
        }
      },
      {
        name: "execute_sql",
        description: "Execute a READ-ONLY SQLite SELECT query and return results.",
        schema: z.object({
          query: z.string().describe("SQLite SELECT query to execute (read-only)."),
        }),
      },
    );
    ```使用`createAgent`以最少的代码构建[ReAct agent](https://arxiv.org/pdf/2210.03629)。代理将解释请求并生成 SQL 命令。这些工具将检查命令的安全性，然后尝试执行该命令。如果命令有错误，错误消息将返回给模型。然后，该模型可以检查原始请求和新的错误消息并生成新命令。这可以继续，直到 LLM 成功生成命令或达到结束计数。这种为模型提供反馈（本例中为错误消息）的模式非常强大。

    使用描述性系统提示初始化代理以自定义其行为：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { SystemMessage } from "langchain";

    const getSystemPrompt = async () =>
      new SystemMessage(`You are a careful SQLite analyst.

    Authoritative schema (do not invent columns/tables):
    ${await getSchema()}

    Rules:
    - Think step-by-step.
    - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
    - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
    - Limit to 5 rows unless user explicitly asks otherwise.
    - If the tool returns 'Error:', revise the SQL and try again.
    - Limit the number of attempts to 5.
    - If you are not successful after 5 attempts, return a note to the user.
    - Prefer explicit column lists; avoid SELECT *.
    `);
    ```

    现在，使用模型、工具和提示创建代理：

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";

      let agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
      });
      ```
    </CodeGroup>
  </Step>

  <Step title="Run the agent">
    对示例查询运行代理并观察其行为：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    let question = "Which genre, on average, has the longest tracks?";

    const stream = await agent.streamEvents(
      { messages: [{ role: "user", content: question }] },
      { version: "v3" },
    );
    await Promise.all([
      (async () => {
        for await (const message of stream.messages) {
          for await (const token of message.text) {
            process.stdout.write(token);
          }
        }
      })(),
      (async () => {
        for await (const call of stream.toolCalls) {
          console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
          console.log(`Tool result: ${await call.output}`);
        }
      })(),
    ]);

    const finalState = await stream.output;
    ```

    ```
    human: Which genre, on average, has the longest tracks?
    ai:
    tool: [{"Genre":"Sci Fi & Fantasy","AvgMilliseconds":2911783.0384615385}]
    ai: Sci Fi & Fantasy — average track length ≈ 48.5 minutes (about 2,911,783 ms).
    ```

    代理正确地编写了一个查询，检查了该查询，然后运行它以告知其最终响应。<Note>
      您可以检查上述运行的各个方面，包括采取的步骤、调用的工具、LLM 看到的提示以及[LangSmith trace](https://smith.langchain.com/public/653d218b-af67-4854-95ca-6abecb9b2520/r) 中的更多信息。
    </Note>
  </Step>

  <Step title="(Optional) Use Studio">
    [Studio](/langsmith/studio) 提供“客户端”循环以及内存，因此您可以将其作为聊天界面运行并查询数据库。您可以提出诸如“告诉我数据库的方案”或“显示前 5 位客户的发票”之类的问题。您将看到生成的 SQL 命令和结果输出。下面详细介绍了如何开始。

    <Accordion title="Run your agent in Studio">
      除了前面提到的包之外，您还需要：

      ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm i -g @langchain/langgraph-cli@latest
      ```

      在您将运行的目录中，您将需要一个包含以下内容的 `langgraph.json` 文件：

      ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      {
        "dependencies": ["."],
        "graphs": {
            "agent": "./sqlAgent.ts:agent",
            "graph": "./sqlAgentLanggraph.ts:graph"
        },
        "env": ".env"
      }
      ```

      创建一个文件 `sqlAgent.ts` 并插入以下内容：

      <CodeGroup>
        ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "google-genai:gemini-3.6-flash",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "openai:gpt-5.5",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "anthropic:claude-sonnet-4-6",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "openrouter:openrouter:z-ai/glm-5.2",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "fireworks:accounts/fireworks/models/glm-5p2",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "baseten:zai-org/GLM-5.2",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```

        ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import fs from "node:fs/promises";
        import path from "node:path";
        import sqlite3 from "sqlite3";
        import { SystemMessage, createAgent, tool } from "langchain";
        import * as z from "zod";

        const url =
          "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db";
        const localPath = path.resolve("Chinook.db");

        async function resolveDbPath() {
          try {
            await fs.access(localPath);
            return localPath;
          } catch {
            // Chinook.db not present locally; download it.
          }
          const resp = await fetch(url);
          if (!resp.ok)
            throw new Error(`Failed to download DB. Status code: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await fs.writeFile(localPath, buf);
          return localPath;
        }

        // Below are minimal tools for demonstration purposes.
        async function runQuery(query: string): Promise<Record<string, unknown>[]> {
          const dbPath = await resolveDbPath();
          const db = new sqlite3.Database(dbPath);
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              db.close();
              if (err) reject(err);
              else resolve(rows as Record<string, unknown>[]);
            });
          });
        }

        async function getSchema() {
          const tables = await runQuery(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          );
          return tables.map((row) => String(row.sql)).join("\n\n");
        }

        const DENY_RE =
          /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
        const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

        function sanitizeSqlQuery(q: string) {
          let query = String(q ?? "").trim();

          const semis = [...query].filter((c) => c === ";").length;
          if (semis > 1 || (query.endsWith(";") && query.slice(0, -1).includes(";"))) {
            throw new Error("multiple statements are not allowed.");
          }
          query = query.replace(/;+\s*$/g, "").trim();

          if (!query.toLowerCase().startsWith("select")) {
            throw new Error("Only SELECT statements are allowed");
          }
          if (DENY_RE.test(query)) {
            throw new Error("DML/DDL detected. Only read-only queries are permitted.");
          }

          if (!HAS_LIMIT_TAIL_RE.test(query)) {
            query += " LIMIT 5";
          }
          return query;
        }

        const executeSql = tool(
          async ({ query }) => {
            const q = sanitizeSqlQuery(query);
            try {
              const result = await runQuery(q);
              return JSON.stringify(result, null, 2);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              throw new Error(message);
            }
          },
          {
            name: "execute_sql",
            description: "Execute a READ-ONLY SQLite SELECT query and return results.",
            schema: z.object({
              query: z.string().describe("SQLite SELECT query to execute (read-only)."),
            }),
          },
        );

        const getSystemPrompt = async () =>
          new SystemMessage(`You are a careful SQLite analyst.

        Authoritative schema (do not invent columns/tables):
        ${await getSchema()}

        Rules:
        - Think step-by-step.
        - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
        - Read-only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
        - Limit to 5 rows unless user explicitly asks otherwise.
        - If the tool returns 'Error:', revise the SQL and try again.
        - Limit the number of attempts to 5.
        - If you are not successful after 5 attempts, return a note to the user.
        - Prefer explicit column lists; avoid SELECT *.
        `);

        export const agent = createAgent({
          model: "ollama:north-mini-code-1.0",
          tools: [executeSql],
          systemPrompt: await getSystemPrompt(),
        });
        ```
      </CodeGroup>
    </Accordion>
  </Step>

  <Step title="Implement human-in-the-loop review">
    在执行代理的 SQL 查询之前检查是否存在任何意外操作或效率低下，这可能是谨慎的做法。LangChain代理支持内置[human-in-the-loop middleware](/oss/javascript/langchain/human-in-the-loop)，以增加对代理工具调用的监督。让我们将代理配置为在调用 `execute_sql` 工具时暂停以供人工审核：

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { humanInTheLoopMiddleware } from "langchain"; // [!code highlight]
      import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]

      agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [executeSql],
        systemPrompt: await getSystemPrompt(),
        middleware: [
          // [!code highlight]
          humanInTheLoopMiddleware({
            // [!code highlight]
            interruptOn: {
              execute_sql: true, // [!code highlight]
            },
            descriptionPrefix: "Tool execution pending approval", // [!code highlight]
          }),
        ], // [!code highlight]
        checkpointer: new MemorySaver(), // [!code highlight]
      });
      ```
    </CodeGroup>

    <Note>
      我们在代理中添加了一个[checkpointer](/oss/javascript/langchain/short-term-memory)，以允许暂停和恢复执行。有关此内容以及可用中间件配置的详细信息，请参阅[human-in-the-loop guide](/oss/javascript/langchain/human-in-the-loop)。
    </Note>

    在运行代理时，它现在将在执行 `execute_sql` 工具之前暂停以进行审查：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    question = "Which genre, on average, has the longest tracks?";
    const config = { configurable: { thread_id: "1" } }; // [!code highlight]

    const hitlStream = await agent.streamEvents(
      { messages: [{ role: "user", content: question }] },
      { ...config, version: "v3" }, // [!code highlight]
    );
    await Promise.all([
      (async () => {
        for await (const message of hitlStream.messages) {
          for await (const token of message.text) {
            process.stdout.write(token);
          }
        }
      })(),
      (async () => {
        for await (const call of hitlStream.toolCalls) {
          console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        }
      })(),
    ]);
    if (hitlStream.interrupted) {
      // [!code highlight]
      console.log("INTERRUPTED:"); // [!code highlight]
      for (const interrupt of hitlStream.interrupts) {
        // [!code highlight]
        for (const request of interrupt.payload.actionRequests) {
          // [!code highlight]
          console.log(request.description); // [!code highlight]
        }
      }
    }
    ```

    ```
    ...

    INTERRUPTED:
    Tool execution pending approval

    Tool: execute_sql
    Args: {'query': 'SELECT g.Name AS Genre, AVG(t.Milliseconds) AS AvgTrackLength FROM Track t JOIN Genre g ON t.GenreId = g.GenreId GROUP BY g.Name ORDER BY AvgTrackLength DESC LIMIT 1;'}
    ```

    我们可以使用 [Command](/oss/javascript/langgraph/use-graph-api#combine-control-flow-and-state-updates-with-command) 恢复执行，在本例中接受查询：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Command } from "@langchain/langgraph"; // [!code highlight]

    const resumeStream = await agent.streamEvents(
      new Command({ resume: { decisions: [{ type: "approve" }] } }), // [!code highlight]
      { ...config, version: "v3" },
    );
    await Promise.all([
      (async () => {
        for await (const message of resumeStream.messages) {
          for await (const token of message.text) {
            process.stdout.write(token);
          }
        }
      })(),
      (async () => {
        for await (const call of resumeStream.toolCalls) {
          console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
        }
      })(),
    ]);
    if (resumeStream.interrupted) {
      console.log("INTERRUPTED:");
      for (const interrupt of resumeStream.interrupts) {
        for (const request of interrupt.payload.actionRequests) {
          console.log(request.description);
        }
      }
    }
    ```

    ```
    ================================== Ai Message ==================================
    Tool Calls:
      execute_sql (call_7oz86Epg7lYRqi9rQHbZPS1U)
     Call ID: call_7oz86Epg7lYRqi9rQHbZPS1U
      Args:
        query: SELECT Genre.Name, AVG(Track.Milliseconds) AS AvgDuration FROM Track JOIN Genre ON Track.GenreId = Genre.GenreId GROUP BY Genre.Name ORDER BY AvgDuration DESC LIMIT 5;
    ================================= Tool Message =================================
    Name: execute_sql

    [('Sci Fi & Fantasy', 2911783.0384615385), ('Science Fiction', 2625549.076923077), ('Drama', 2575283.78125), ('TV Shows', 2145041.0215053763), ('Comedy', 1585263.705882353)]
    ================================== Ai Message ==================================

    The genre with the longest average track length is "Sci Fi & Fantasy" with an average duration of about 2,911,783 milliseconds, followed by "Science Fiction" and "Drama."
    ```

    详情请参阅[human-in-the-loop guide](/oss/javascript/langchain/human-in-the-loop)。
  </Step>
</Steps>

## 后续步骤

如需更深入的定制，请查看 [this tutorial](/oss/javascript/langgraph/sql-agent) 直接使用 LangGraph 原语实现 SQL 代理。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/sql-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>