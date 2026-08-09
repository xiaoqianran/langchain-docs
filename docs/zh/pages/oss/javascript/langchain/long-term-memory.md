<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Long-term memory | https://docs.langchain.com/oss/javascript/langchain/long-term-memory -->

# 长期记忆

为 LangChain 代理添加长期记忆，以存储和调用跨对话和会话的数据

长期记忆可让您的客服人员存储和回忆不同对话和会话中的信息。
与仅限于单个线程的[short-term memory](/oss/javascript/langchain/short-term-memory)不同，长期记忆跨线程持续存在并且可以随时调用。

长期记忆建立在[LangGraph stores](/oss/javascript/langgraph/stores)之上，它将数据保存为按命名空间和键组织的 JSON 文档。

## 用法

要将长期记忆添加到代理，请创建一个存储并将其传递给[⟦T45⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)：

<Tabs>
  <Tab title="InMemoryStore">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [],
        store,
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [],
        store,
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [],
        store,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [],
        store,
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [],
        store,
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [],
        store,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
      const store = new InMemoryStore();

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [],
        store,
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="PostgreSQL">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install @langchain/langgraph-checkpoint-postgres
    ```

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [],
        store,
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [],
        store,
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [],
        store,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [],
        store,
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [],
        store,
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [],
        store,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createAgent } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [],
        store,
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

然后，工具可以使用 `runtime.store` 参数读取和写入存储。有关示例，请参阅 [Read long-term memory in tools](#read-long-term-memory-in-tools) 和 [Write long-term memory from tools](#write-long-term-memory-from-tools)。

<Tip>
  要更深入地了解记忆类型（语义、情景、程序）和写入记忆的策略，请参阅 [Memory conceptual guide](/oss/javascript/concepts/memory#long-term-memory)。
</Tip>

## 内存存储

LangGraph 将长期记忆作为 JSON 文档存储在 [store](/oss/javascript/langgraph/stores) 中。每个内存都按照自定义的 `namespace`（类似于文件夹）和独特的 `key`（类似于文件名）进行组织。命名空间通常包含用户或组织 ID 或其他标签，以便更轻松地组织信息。

这种结构可以实现存储器的分层组织。然后通过内容过滤器支持跨命名空间搜索。

<Tabs>
  <Tab title="InMemoryStore">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { InMemoryStore } from "@langchain/langgraph";

    const embed = (texts: string[]): number[][] => {
      // Replace with an actual embedding function or LangChain embeddings object
      return texts.map(() => [1.0, 2.0]);
    };

    // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
    const store = new InMemoryStore({ index: { embed, dims: 2 } });
    const userId = "my-user";
    const applicationContext = "chitchat";
    const namespace = [userId, applicationContext];

    await store.put(namespace, "a-memory", {
      rules: [
        "User likes short, direct language",
        "User only speaks English & TypeScript",
      ],
      "my-key": "my-value",
    });

    // get the "memory" by ID
    const item = await store.get(namespace, "a-memory");

    // search for "memories" within this namespace, filtering on content equivalence, sorted by vector similarity
    const items = await store.search(namespace, {
      filter: { "my-key": "my-value" },
      query: "language preferences",
    });
    ```
  </Tab>

  <Tab title="PostgreSQL">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

    const embed = (texts: string[]): number[][] => {
      return texts.map(() => [1.0, 2.0]);
    };

    const DB_URI =
      process.env.POSTGRES_URI ??
      "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
    const store = PostgresStore.fromConnString(DB_URI, {
      index: { embed, dims: 2 },
    });
    await store.setup();

    const userId = "my-user";
    const applicationContext = "chitchat";
    const namespace = [userId, applicationContext];

    await store.put(namespace, "a-memory", {
      rules: [
        "User likes short, direct language",
        "User only speaks English & TypeScript",
      ],
      "my-key": "my-value",
    });

    const item = await store.get(namespace, "a-memory");
    const items = await store.search(namespace, {
      filter: { "my-key": "my-value" },
      query: "language preferences",
    });
    ```
  </Tab>
</Tabs>

有关内存存储的更多信息，请参阅[Persistence](/oss/javascript/langgraph/stores)指南。

## 在工具中读取长期记忆

<Tabs>
  <Tab title="InMemoryStore">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();
      const contextSchema = z.object({
        userId: z.string(),
      });

      // Write sample data to the store using the put method
      await store.put(
        ["users"], // Namespace to group related data together (users namespace for user data)
        "user_123", // Key within the namespace (user ID as key)
        {
          name: "John Smith",
          language: "English",
        }, // Data to store for the given user
      );

      const getUserInfo = tool(
        // Look up user info.
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          // Access the store - same as that provided to `createAgent`
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Retrieve data from store - returns StoreValue object with value and metadata
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [getUserInfo],
        contextSchema,
        // Pass store to agent - enables agent to access store when running tools
        store,
      });

      // Run the agent
      const result = await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );

      console.log(result.messages.at(-1)?.content);

      /**
       * Outputs:
       * User Information:
       * - **Name:** John Smith
       * - **Language:** English
       */
      ```
    </CodeGroup>
  </Tab>

  <Tab title="PostgreSQL">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { createAgent, tool, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      await store.put(["users"], "user_123", {
        name: "John Smith",
        language: "English",
      });

      const getUserInfo = tool(
        async (_, runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          const userInfo = await runtime.store.get(["users"], userId);
          return userInfo?.value ? JSON.stringify(userInfo.value) : "Unknown user";
        },
        {
          name: "getUserInfo",
          description: "Look up user info by userId from the store.",
          schema: z.object({}),
        },
      );

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [getUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "look up user information" }] },
        { context: { userId: "user_123" } },
      );
      ```
    </CodeGroup>
  </Tab>
</Tabs>

<a />

## 通过工具写入长期记忆

<Tabs>
  <Tab title="InMemoryStore">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { InMemoryStore } from "@langchain/langgraph";

      // InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      const store = new InMemoryStore();

      const contextSchema = z.object({
        userId: z.string(),
      });

      // Schema defines the structure of user information for the LLM
      const UserInfo = z.object({
        name: z.string(),
      });

      // Tool that allows agent to update user information (useful for chat applications)
      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) {
            throw new Error("userId is required");
          }
          // Store data in the store (namespace, key, data)
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        {
          name: "save_user_info",
          description: "Save user info",
          schema: UserInfo,
        },
      );

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      // Run the agent
      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        // userId passed in context to identify whose information is being updated
        { context: { userId: "user_123" } },
      );

      // You can access the store directly to get the value
      const result = await store.get(["users"], "user_123");
      console.log(result?.value); // Output: { name: "John Smith" }
      ```
    </CodeGroup>
  </Tab>

  <Tab title="PostgreSQL">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "google-genai:gemini-3.6-flash",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "openai:gpt-5.5",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "anthropic:claude-sonnet-4-6",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "baseten:zai-org/GLM-5.2",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import * as z from "zod";
      import { tool, createAgent, type ToolRuntime } from "langchain";
      import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

      const DB_URI =
        process.env.POSTGRES_URI ??
        "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
      const store = PostgresStore.fromConnString(DB_URI);
      await store.setup();

      const contextSchema = z.object({ userId: z.string() });

      const UserInfo = z.object({ name: z.string() });

      const saveUserInfo = tool(
        async (
          userInfo: z.infer<typeof UserInfo>,
          runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
        ) => {
          const userId = runtime.context.userId;
          if (!userId) throw new Error("userId is required");
          await runtime.store.put(["users"], userId, userInfo);
          return "Successfully saved user info.";
        },
        { name: "save_user_info", description: "Save user info", schema: UserInfo },
      );

      const agent = createAgent({
        model: "ollama:north-mini-code-1.0",
        tools: [saveUserInfo],
        contextSchema,
        store,
      });

      await agent.invoke(
        { messages: [{ role: "user", content: "My name is John Smith" }] },
        { context: { userId: "user_123" } },
      );

      const result = await store.get(["users"], "user_123");
      console.log(result?.value);
      ```
    </CodeGroup>
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/long-term-memory.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>