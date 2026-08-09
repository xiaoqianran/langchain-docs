<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Long-term memory | https://docs.langchain.com/oss/python/langchain/long-term-memory -->

# 长期记忆

为 LangChain 代理添加长期记忆，以存储和调用跨对话和会话的数据

长期记忆可让您的客服人员存储和回忆不同对话和会话中的信息。
与仅限于单个线程的[short-term memory](/oss/python/langchain/short-term-memory)不同，长期记忆跨线程持续存在并且可以随时调用。

长期记忆建立在[LangGraph stores](/oss/python/langgraph/stores)之上，它将数据保存为按命名空间和键组织的 JSON 文档。

## 用法

要将长期记忆添加到代理，请创建一个存储并将其传递给[⟦T21⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)：

<Tabs>
  <Tab title="InMemoryStore">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain_core.runnables import Runnable
    from langgraph.store.memory import InMemoryStore

    # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
    store = InMemoryStore()

    agent: Runnable = create_agent(
        "claude-sonnet-4-6",
        tools=[],
        store=store,
    )
    ```
  </Tab>

  <Tab title="PostgreSQL">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install langgraph-checkpoint-postgres
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents import create_agent
    from langchain_core.runnables import Runnable
    from langgraph.store.postgres import PostgresStore  # type: ignore[import-not-found]

    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

    with PostgresStore.from_conn_string(DB_URI) as store:
        store.setup()
        agent: Runnable = create_agent(
            "claude-sonnet-4-6",
            tools=[],
            store=store,
        )
    ```
  </Tab>
</Tabs>

然后，工具可以使用 `runtime.store` 参数读取和写入存储。有关示例，请参阅 [Read long-term memory in tools](#read-long-term-memory-in-tools) 和 [Write long-term memory from tools](#write-long-term-memory-from-tools)。

<Tip>
  要更深入地了解记忆类型（语义、情景、程序）和写入记忆的策略，请参阅 [Memory conceptual guide](/oss/python/concepts/memory#long-term-memory)。
</Tip>

## 内存存储

LangGraph 将长期记忆作为 JSON 文档存储在 [store](/oss/python/langgraph/stores) 中。

每个内存都组织在自定义的 `namespace` （类似于文件夹）和独特的 `key` （类似于文件名）下。命名空间通常包含用户或组织 ID 或其他标签，以便更轻松地组织信息。这种结构可以实现存储器的分层组织。然后通过内容过滤器支持跨命名空间搜索。

<Tabs>
  <Tab title="InMemoryStore">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Sequence

    from langgraph.store.base import IndexConfig
    from langgraph.store.memory import InMemoryStore


    def embed(texts: Sequence[str]) -> list[list[float]]:
        # Replace with an actual embedding function or LangChain embeddings object
        return [[1.0, 2.0] for _ in texts]


    # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production use.
    store = InMemoryStore(index=IndexConfig(embed=embed, dims=2))
    user_id = "my-user"
    application_context = "chitchat"
    namespace = (user_id, application_context)
    store.put(
        namespace,
        "a-memory",
        {
            "rules": [
                "User likes short, direct language",
                "User only speaks English & python",
            ],
            "my-key": "my-value",
        },
    )
    # get the "memory" by ID
    item = store.get(namespace, "a-memory")
    # search for "memories" within this namespace, filtering on content equivalence, sorted by vector similarity
    items = store.search(
        namespace, filter={"my-key": "my-value"}, query="language preferences"
    )
    ```
  </Tab>

  <Tab title="PostgreSQL">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from collections.abc import Sequence

    from langgraph.store.base import IndexConfig
    from langgraph.store.postgres import PostgresStore  # type: ignore[import-not-found]


    def embed(texts: Sequence[str]) -> list[list[float]]:
        # Replace with an actual embedding function or LangChain embeddings object
        return [[1.0, 2.0] for _ in texts]


    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

    with PostgresStore.from_conn_string(
        DB_URI,
        index=IndexConfig(embed=embed, dims=2),  # type: ignore[arg-type]
    ) as store:
        store.setup()
        user_id = "my-user"
        application_context = "chitchat"
        namespace = (user_id, application_context)
        store.put(
            namespace,
            "a-memory",
            {
                "rules": [
                    "User likes short, direct language",
                    "User only speaks English & python",
                ],
                "my-key": "my-value",
            },
        )
        item = store.get(namespace, "a-memory")
        items = store.search(
            namespace, filter={"my-key": "my-value"}, query="language preferences"
        )
    ```
  </Tab>
</Tabs>

有关内存存储的更多信息，请参阅 [Persistence](/oss/python/langgraph/stores) 指南。

## 在工具中读取长期记忆

<Tabs>
  <Tab title="InMemoryStore">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="google_genai:gemini-3.6-flash",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="openai:gpt-5.5",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="anthropic:claude-sonnet-4-6",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="openrouter:z-ai/glm-5.2",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="baseten:zai-org/GLM-5.2",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore


      @dataclass
      class Context:
          user_id: str


      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()

      # Write sample data to the store using the put method
      store.put(
          (
              "users",
          ),  # Namespace to group related data together (users namespace for user data)
          "user_123",  # Key within the namespace (user ID as key)
          {
              "name": "John Smith",
              "language": "English",
          },  # Data to store for the given user
      )


      @tool
      def get_user_info(runtime: ToolRuntime[Context]) -> str:
          """Look up user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          user_id = runtime.context.user_id
          # Retrieve data from store - returns StoreValue object with value and metadata
          user_info = runtime.store.get(("users",), user_id)
          return str(user_info.value) if user_info else "Unknown user"


      agent: Runnable = create_agent(
          model="ollama:north-mini-code-1.0",
          tools=[get_user_info],
          # Pass store to agent - enables agent to access store when running tools
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "look up user information"}]},
          context=Context(user_id="user_123"),
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="PostgreSQL">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass

    from langchain.agents import create_agent
    from langchain.tools import ToolRuntime, tool
    from langchain_core.runnables import Runnable
    from langgraph.store.postgres import PostgresStore  # type: ignore[import-not-found]


    @dataclass
    class Context:
        user_id: str


    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

    with PostgresStore.from_conn_string(DB_URI) as store:
        store.setup()
        store.put(("users",), "user_123", {"name": "John Smith", "language": "English"})

        @tool
        def get_user_info(runtime: ToolRuntime[Context]) -> str:
            """Look up user info."""
            assert runtime.store is not None
            user_info = runtime.store.get(("users",), runtime.context.user_id)
            return str(user_info.value) if user_info else "Unknown user"

        agent: Runnable = create_agent(
            "claude-sonnet-4-6",
            tools=[get_user_info],
            store=store,
            context_schema=Context,
        )

        result = agent.invoke(
            {"messages": [{"role": "user", "content": "look up user information"}]},
            context=Context(user_id="user_123"),
        )
    ```
  </Tab>
</Tabs>

<a />

## 通过工具写入长期记忆

<Tabs>
  <Tab title="InMemoryStore">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="google_genai:gemini-3.6-flash",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="openai:gpt-5.5",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="anthropic:claude-sonnet-4-6",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="openrouter:z-ai/glm-5.2",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="baseten:zai-org/GLM-5.2",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from dataclasses import dataclass

      from langchain.agents import create_agent
      from langchain.tools import ToolRuntime, tool
      from langchain_core.runnables import Runnable
      from langgraph.store.memory import InMemoryStore
      from typing_extensions import TypedDict

      # InMemoryStore saves data to an in-memory dictionary. Use a DB-backed store in production.
      store = InMemoryStore()


      @dataclass
      class Context:
          user_id: str


      # TypedDict defines the structure of user information for the LLM
      class UserInfo(TypedDict):
          name: str


      # Tool that allows agent to update user information (useful for chat applications)
      @tool
      def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
          """Save user info."""
          # Access the store - same as that provided to `create_agent`
          assert runtime.store is not None
          store = runtime.store
          user_id = runtime.context.user_id
          # Store data in the store (namespace, key, data)
          store.put(("users",), user_id, dict(user_info))
          return "Successfully saved user info."


      agent: Runnable = create_agent(
          model="ollama:north-mini-code-1.0",
          tools=[save_user_info],
          store=store,
          context_schema=Context,
      )

      # Run the agent
      agent.invoke(
          {"messages": [{"role": "user", "content": "My name is John Smith"}]},
          # user_id passed in context to identify whose information is being updated
          context=Context(user_id="user_123"),
      )

      # You can access the store directly to get the value
      item = store.get(("users",), "user_123")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="PostgreSQL">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from dataclasses import dataclass

    from langchain.agents import create_agent
    from langchain.tools import ToolRuntime, tool
    from langchain_core.runnables import Runnable
    from langgraph.store.postgres import PostgresStore  # type: ignore[import-not-found]
    from typing_extensions import TypedDict


    @dataclass
    class Context:
        user_id: str


    class UserInfo(TypedDict):
        name: str


    @tool
    def save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:
        """Save user info."""
        assert runtime.store is not None
        runtime.store.put(("users",), runtime.context.user_id, dict(user_info))
        return "Successfully saved user info."


    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"

    with PostgresStore.from_conn_string(DB_URI) as store:
        store.setup()
        agent: Runnable = create_agent(
            "claude-sonnet-4-6",
            tools=[save_user_info],
            store=store,
            context_schema=Context,
        )

        agent.invoke(
            {"messages": [{"role": "user", "content": "My name is John Smith"}]},
            context=Context(user_id="user_123"),
        )
    ```
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/long-term-memory.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>