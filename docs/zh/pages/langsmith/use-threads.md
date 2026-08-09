<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use threads | https://docs.langchain.com/langsmith/use-threads -->

# 使用线程

本指南向您展示如何创建、查看和检查*线程*。线程与[assistants](/langsmith/assistants)一起工作，以启用[stateful](/oss/python/langgraph/persistence)执行[deployed graphs](/langsmith/deployment)。

## 了解线程

线程是一个持久的对话容器，可以在多次运行中维护状态。每次在线程上执行运行时，图形都会使用线程的当前状态处理输入，并使用新信息更新该状态。

线程通过保留运行之间的对话历史记录和上下文来实现有状态的交互。如果没有线程，每次运行都将是无状态的，不会记忆之前的交互。线程特别适用于：

* 多轮对话，助手需要记住讨论的内容。
* 需要跨多个步骤维护上下文的长时间运行的任务。
* 用户特定的状态管理，每个用户都有自己的对话历史记录。

该图说明了线程如何在两次运行中维护状态。第二次运行可以访问第一次运行的消息，使助手能够理解“明天怎么样？”的上下文。指的是第一次运行的天气查询：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant User
    participant Thread
    participant Assistant
    participant Graph

    Note over Thread: Thread ID: abc-123<br/>Persistent conversation

    User->>Thread: Run 1: "What's the weather?"
    Thread->>Assistant: Use Assistant Config
    Assistant->>Graph: Execute with context
    Graph-->>Thread: Update State<br/>{messages: [user_msg, ai_response]}
    Thread-->>User: Response

    Note over Thread: State persisted ✓

    User->>Thread: Run 2: "What about tomorrow?"
    Note over Thread: Previous messages<br/>still in state
    Thread->>Assistant: Use Assistant Config
    Assistant->>Graph: Execute with full history
    Graph-->>Thread: Update State<br/>{messages: [...prev, new_msgs]}
    Thread-->>User: Response with context
```* 线程使用唯一的线程 ID 维护持久会话。
* 每次运行都会将助手的配置应用于图形执行。
* 状态在每次运行后更新，并在后续运行中持续存在。
* 稍后的运行可以访问完整的对话历史记录。

<Note>
  - **[Assistants](/langsmith/assistants)** 定义图形执行方式的配置（模型、提示、工具）。创建运行时，您可以指定 **图形 ID**（例如，`"agent"`）以使用默认助手，或指定 **助手 ID** (UUID) 以使用特定配置。
  - **线程**维护状态和对话历史记录。
  - **运行** 结合了助手和线程来执行具有特定配置和状态的图形。
</Note>

<Tip>
  最佳实践：当跟踪在线程（对话）中运行时，请确保在所有运行（父运行和子运行）上设置 `thread_id`。这是线程过滤、令牌计数和线程级评估正常工作所必需的。
</Tip>

## 创建一个线程

要运行具有状态持久性的图形，您必须首先创建一个线程：

<Tabs>
  <Tab title="SDK">
    ### 空线程

    要创建新线程，请使用以下方法之一：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langgraph_sdk import get_client

      # Initialize the client with your deployment URL
      client = get_client(url=<DEPLOYMENT_URL>)

      # Create an empty thread
      # This creates a new thread with no initial state
      thread = await client.threads.create()

      print(thread)
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { Client } from "@langchain/langgraph-sdk";

      // Initialize the client with your deployment URL
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Create an empty thread
      // This creates a new thread with no initial state
      const thread = await client.threads.create();

      console.log(thread);
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
          --url <DEPLOYMENT_URL>/threads \
          --header 'Content-Type: application/json' \
          --data '{}'
      ```
    </CodeGroup>有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.create) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.create) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/create-thread) 参考。

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "thread_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2025-05-12T14:04:08.268Z",
      "updated_at": "2025-05-12T14:04:08.268Z",
      "metadata": {},
      "status": "idle",
      "values": {}
    }
    ```

    ### 复制线程

    或者，如果您的应用程序中已经有一个线程想要复制其状态，则可以使用 `copy` 方法。这将创建一个独立的线程，其历史记录与操作时的原始线程相同：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Copy an existing thread
      # The new thread will have the same state as the original at the time of copying
      copied_thread = await client.threads.copy(thread["thread_id"])
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Copy an existing thread
      // The new thread will have the same state as the original at the time of copying
      const copiedThread = await client.threads.copy(thread["thread_id"]);
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST --url <DEPLOYMENT_URL>/threads/thread["thread_id"]/copy \
      --header 'Content-Type: application/json'
      ```
    </CodeGroup>

    有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.copy) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.copy) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/copy-thread) 参考。

    ### 预填充状态

    您可以通过在 `create` 方法中提供 `supersteps` 列表来创建具有任意预定义状态的线程。 `supersteps` 描述了建立线程初始状态的一系列状态更新。当您想要执行以下操作时，这很有用：

    * 使用现有对话历史记录创建线程。
    * 从另一个系统迁移对话。
    * 设置具有特定初始状态的测试场景。
    * 恢复上一个会话的对话。

    有关检查点和状态管理的更多信息，请参阅[LangGraph persistence documentation](/oss/python/langgraph/persistence)。

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langgraph_sdk import get_client

      # Initialize the client
      client = get_client(url=<DEPLOYMENT_URL>)

      # Create a thread with pre-populated conversation history
      # The supersteps define a sequence of state updates that build up the initial state
      thread = await client.threads.create(
        graph_id="agent",  # Specify which graph this thread is for
        supersteps=[
          {
            updates: [
              {
                values: {},
                as_node: '__input__',  # Initial input node
              },
            ],
          },
          {
            updates: [
              {
                values: {
                  messages: [
                    {
                      type: 'human',
                      content: 'hello',
                    },
                  ],
                },
                as_node: '__start__',  # User's first message
              },
            ],
          },
          {
            updates: [
              {
                values: {
                  messages: [
                    {
                      content: 'Hello! How can I assist you today?',
                      type: 'ai',
                    },
                  ],
                },
                as_node: 'call_model',  # Assistant's response
              },
            ],
          },
        ])

      print(thread)
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { Client } from "@langchain/langgraph-sdk";

      // Initialize the client
      const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

      // Create a thread with pre-populated conversation history
      // The supersteps define a sequence of state updates that build up the initial state
      const thread = await client.threads.create({
          graphId: 'agent',  // Specify which graph this thread is for
          supersteps: [
          {
            updates: [
              {
                values: {},
                asNode: '__input__',  // Initial input node
              },
            ],
          },
          {
            updates: [
              {
                values: {
                  messages: [
                    {
                      type: 'human',
                      content: 'hello',
                    },
                  ],
                },
                asNode: '__start__',  // User's first message
              },
            ],
          },
          {
            updates: [
              {
                values: {
                  messages: [
                    {
                      content: 'Hello! How can I assist you today?',
                      type: 'ai',
                    },
                  ],
                },
                asNode: 'call_model',  // Assistant's response
              },
            ],
          },
        ],
      });

      console.log(thread);
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
          --url <DEPLOYMENT_URL>/threads \
          --header 'Content-Type: application/json' \
          --data '{"metadata":{"graph_id":"agent"},"supersteps":[{"updates":[{"values":{},"as_node":"__input__"}]},{"updates":[{"values":{"messages":[{"type":"human","content":"hello"}]},"as_node":"__start__"}]},{"updates":[{"values":{"messages":[{"content":"Hello\u0021 How can I assist you today?","type":"ai"}]},"as_node":"call_model"}]}]}'
      ```
    </CodeGroup>

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "thread_id": "f15d70a1-27d4-4793-a897-de5609920b7d",
      "created_at": "2025-05-12T15:37:08.935038+00:00",
      "updated_at": "2025-05-12T15:37:08.935046+00:00",
      "metadata": {
        "graph_id": "agent"
      },
      "status": "idle",
      "config": {},
      "values": {
        "messages": [
          {
            "content": "hello",
            "additional_kwargs": {},
            "response_metadata": {},
            "type": "human",
            "name": null,
            "id": "8701f3be-959c-4b7c-852f-c2160699b4ab",
            "example": false
          },
          {
            "content": "Hello! How can I assist you today?",
            "additional_kwargs": {},
            "response_metadata": {},
            "type": "ai",
            "name": null,
            "id": "4d8ea561-7ca1-409a-99f7-6b67af3e1aa3",
            "example": false,
            "tool_calls": [],
            "invalid_tool_calls": [],
            "usage_metadata": null
          }
        ]
      }
    }
    ```
  </Tab><Tab title="UI">
    您还可以直接从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-use-threads) 创建线程：

    1. 导航至您的[deployment](/langsmith/deployment)。
    2. 选择**线程**选项卡。
    3. 单击 **+ 新话题**。
    4. （可选）提供线程的元数据或初始状态。
    5. 单击“**创建线程**”。

    新创建的线程将出现在线程表中，并且可以立即用于运行。
  </Tab>
</Tabs>

## 列出线程

<Tabs>
  <Tab title="SDK">
    要列出线程，请使用 `search` 方法。这将列出应用程序中与提供的过滤器匹配的线程：

    ### 按线程状态过滤

    使用 `status` 字段根据线程的状态过滤线程。支持的值为 `idle`、`busy`、`interrupted` 和 `error`。例如，要查看 `idle` 线程：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Search for idle threads
      # The status filter accepts: idle, busy, interrupted, error
      print(await client.threads.search(status="idle", limit=1))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Search for idle threads
      // The status filter accepts: idle, busy, interrupted, error
      console.log(await client.threads.search({ status: "idle", limit: 1 }));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/search \
      --header 'Content-Type: application/json' \
      --data '{"status": "idle", "limit": 1}'
      ```
    </CodeGroup>

    有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.search) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.search) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/search-threads) 参考。

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [
      {
        "thread_id": "cacf79bb-4248-4d01-aabc-938dbd60ed2c",
        "created_at": "2024-08-14T17:36:38.921660+00:00",
        "updated_at": "2024-08-14T17:36:38.921660+00:00",
        "metadata": {
          "graph_id": "agent"
        },
        "status": "idle",
        "config": {
          "configurable": {}
        }
      }
    ]
    ```

    ### 按元数据过滤

    `search` 方法允许您过滤元数据。这对于查找与特定图表、用户或添加到线程的自定义元数据关联的线程非常有用。

    您可以过滤的常见元数据字段包括：|元数据键 |描述 |
    | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
    | `graph_id` |线程所属的图（部署）。                                                                    |
    | `assistant_id` |用于创建的[assistant](/langsmith/assistants)在线程上运行。                                        |
    | `langgraph_auth_user_id` |拥有该线程的经过身份验证的用户（使用[custom auth](/langsmith/custom-auth)时自动设置）。 |
    | `cron_id` |创建的[cron job](/langsmith/cron-jobs)在线程上运行。                                            |

    您还可以过滤创建或更新线程时附加的任何自定义元数据。

    #### 按图表过滤

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      print(await client.threads.search(metadata={"graph_id": "agent"}, limit=1))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      console.log(await client.threads.search({ metadata: { "graph_id": "agent" }, limit: 1 }));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/search \
      --header 'Content-Type: application/json' \
      --data '{"metadata": {"graph_id": "agent"}, "limit": 1}'
      ```
    </CodeGroup>

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [
      {
        "thread_id": "cacf79bb-4248-4d01-aabc-938dbd60ed2c",
        "created_at": "2024-08-14T17:36:38.921660+00:00",
        "updated_at": "2024-08-14T17:36:38.921660+00:00",
        "metadata": {
          "graph_id": "agent"
        },
        "status": "idle",
        "config": {
          "configurable": {}
        }
      }
    ]
    ```

    #### 按助手过滤

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      print(await client.threads.search(
          metadata={"assistant_id": "fe096781-5601-53d2-b2f6-0d3403f7e9ca"},
          limit=1,
      ))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      console.log(await client.threads.search({
        metadata: { "assistant_id": "fe096781-5601-53d2-b2f6-0d3403f7e9ca" },
        limit: 1,
      }));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/search \
      --header 'Content-Type: application/json' \
      --data '{"metadata": {"assistant_id": "fe096781-5601-53d2-b2f6-0d3403f7e9ca"}, "limit": 1}'
      ```
    </CodeGroup>

    #### 按 cron 作业过滤

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      print(await client.threads.search(
          metadata={"cron_id": "8b98a268-e49a-4228-a0d3-1a354e3a54d0"},
          limit=10,
      ))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      console.log(await client.threads.search({
        metadata: { "cron_id": "8b98a268-e49a-4228-a0d3-1a354e3a54d0" },
        limit: 10,
      }));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/search \
      --header 'Content-Type: application/json' \
      --data '{"metadata": {"cron_id": "8b98a268-e49a-4228-a0d3-1a354e3a54d0"}, "limit": 10}'
      ```
    </CodeGroup>

    ### 排序SDK 还支持使用 `sort_by` 和 `sort_order` 参数按 `thread_id`、`status`、`created_at` 和 `updated_at` 对线程进行排序。
  </Tab>

  <Tab title="UI">
    您还可以通过 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-use-threads) 查看和管理部署中的线程：

    1. 导航至您的[deployment](/langsmith/deployment)。
    2. 选择**线程**选项卡。

    这将加载部署中所有线程的表。

    **按话题状态过滤：** 在顶部栏中选择一个状态，以按 `idle`、`busy`、`interrupted` 或 `error` 过滤话题。

    **对线程进行排序：** 单击任何列标题的箭头图标可按该属性进行排序（`thread_id`、`status`、`created_at` 或 `updated_at`）。
  </Tab>
</Tabs>

## 检查线程

<Tabs>
  <Tab title="SDK">
    ### 获取线程

    要查看给定 `thread_id` 的特定线程，请使用 [⟦T76⟧](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get) 方法：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Retrieve a specific thread by its ID
      # Returns the thread metadata including status, creation time, and metadata
      print((await client.threads.get(thread["thread_id"])))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Retrieve a specific thread by its ID
      // Returns the thread metadata including status, creation time, and metadata
      console.log((await client.threads.get(thread["thread_id"])));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request GET \
      --url <DEPLOYMENT_URL>/threads/thread["thread_id"] \
      --header 'Content-Type: application/json'
      ```
    </CodeGroup>

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "thread_id": "cacf79bb-4248-4d01-aabc-938dbd60ed2c",
      "created_at": "2024-08-14T17:36:38.921660+00:00",
      "updated_at": "2024-08-14T17:36:38.921660+00:00",
      "metadata": {
        "graph_id": "agent"
      },
      "status": "idle",
      "config": {
        "configurable": {}
      }
    }
    ```

    有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/get-thread) 参考。

    ### 检查线程状态

    要查看给定线程的当前状态，请使用 [⟦T77⟧](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_state) 方法。这将返回当前值、下一个要执行的节点以及检查点信息：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Get the current state of a thread
      # Returns values, next nodes, tasks, checkpoint info, and metadata
      print((await client.threads.get_state(thread["thread_id"])))
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Get the current state of a thread
      // Returns values, next nodes, tasks, checkpoint info, and metadata
      console.log((await client.threads.getState(thread["thread_id"])));
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request GET \
      --url <DEPLOYMENT_URL>/threads/thread["thread_id"]/state \
      --header 'Content-Type: application/json'
      ```
    </CodeGroup>

    输出：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "values": {
        "messages": [
          {
            "content": "hello",
            "additional_kwargs": {},
            "response_metadata": {},
            "type": "human",
            "name": null,
            "id": "8701f3be-959c-4b7c-852f-c2160699b4ab",
            "example": false
          },
          {
            "content": "Hello! How can I assist you today?",
            "additional_kwargs": {},
            "response_metadata": {},
            "type": "ai",
            "name": null,
            "id": "4d8ea561-7ca1-409a-99f7-6b67af3e1aa3",
            "example": false,
            "tool_calls": [],
            "invalid_tool_calls": [],
            "usage_metadata": null
          }
        ]
      },
      "next": [],
      "tasks": [],
      "metadata": {
        "thread_id": "f15d70a1-27d4-4793-a897-de5609920b7d",
        "checkpoint_id": "1f02f46f-7308-616c-8000-1b158a9a6955",
        "graph_id": "agent_with_quite_a_long_name",
        "source": "update",
        "step": 1,
        "writes": {
          "call_model": {
            "messages": [
              {
                "content": "Hello! How can I assist you today?",
                "type": "ai"
              }
            ]
          }
        },
        "parents": {}
      },
      "created_at": "2025-05-12T15:37:09.008055+00:00",
      "checkpoint": {
        "checkpoint_id": "1f02f46f-733f-6b58-8001-ea90dcabb1bd",
        "thread_id": "f15d70a1-27d4-4793-a897-de5609920b7d",
        "checkpoint_ns": ""
      },
      "parent_checkpoint": {
        "checkpoint_id": "1f02f46f-7308-616c-8000-1b158a9a6955",
        "thread_id": "f15d70a1-27d4-4793-a897-de5609920b7d",
        "checkpoint_ns": ""
      },
      "checkpoint_id": "1f02f46f-733f-6b58-8001-ea90dcabb1bd",
      "parent_checkpoint_id": "1f02f46f-7308-616c-8000-1b158a9a6955"
    }
    ```有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_state) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_state) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/get-thread-state) 参考。

    或者，要查看给定检查点处线程的状态，请传入检查点 ID。这对于检查执行历史记录中特定点的线程状态非常有用。

    首先，从线程的历史记录中获取检查点 ID：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Get the thread history to find checkpoint IDs
      history = await client.threads.get_history(thread_id=thread["thread_id"])
      checkpoint_id = history[0]["checkpoint_id"]  # Get the most recent checkpoint
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Get the thread history to find checkpoint IDs
      const history = await client.threads.getHistory(thread["thread_id"]);
      const checkpointId = history[0].checkpoint_id;  // Get the most recent checkpoint
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Get the thread history to find checkpoint IDs
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/thread["thread_id"]/history \
      --header 'Content-Type: application/json' \
      --data '{"limit": 1}'
      ```
    </CodeGroup>

    然后使用检查点 ID 获取该特定点的状态：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Get thread state at a specific checkpoint
      # Useful for inspecting historical state or debugging
      thread_state = await client.threads.get_state(
        thread_id=thread["thread_id"],
        checkpoint_id=checkpoint_id
      )
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Get thread state at a specific checkpoint
      // Useful for inspecting historical state or debugging
      const threadState = await client.threads.getState(thread["thread_id"], checkpointId);
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request GET \
      --url <DEPLOYMENT_URL>/threads/thread["thread_id"]/state/<CHECKPOINT_ID> \
      --header 'Content-Type: application/json'
      ```
    </CodeGroup>

    ### 检查完整线程历史记录

    要查看线程的历史记录，请使用 [⟦T78⟧](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_history) 方法。这将返回线程经历的每个状态的列表，允许您跟踪完整的执行路径：

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Get the full history of a thread
      # Returns a list of all state snapshots from the thread's execution
      history = await client.threads.get_history(
        thread_id=thread["thread_id"],
        limit=10  # Optional: limit the number of states returned
      )

      for state in history:
          print(f"Checkpoint: {state['checkpoint_id']}")
          print(f"Step: {state['metadata']['step']}")
      ```

      ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      // Get the full history of a thread
      // Returns a list of all state snapshots from the thread's execution
      const history = await client.threads.getHistory(
        thread["thread_id"],
        {
          limit: 10  // Optional: limit the number of states returned
        }
      );

      for (const state of history) {
        console.log(`Checkpoint: ${state.checkpoint_id}`);
        console.log(`Step: ${state.metadata.step}`);
      }
      ```

      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl --request POST \
      --url <DEPLOYMENT_URL>/threads/thread["thread_id"]/history \
      --header 'Content-Type: application/json' \
      --data '{"limit": 10}'
      ```
    </CodeGroup>

    此方法特别适用于：

    * 通过查看状态如何演变来调试执行流程。
    * 了解图表执行中的决策点。
    * 审核对话历史记录和状态变化。
    * 重播或分析过去的互动。

    有关更多信息，请参阅 [Python](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_history) 和 [JS](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.ThreadsClient.get_history) SDK 文档，或 [REST API](/langsmith/agent-server-api/threads/get-thread-history) 参考。
  </Tab><Tab title="UI">
    您还可以查看和检查 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-use-threads) 中的线程：

    1. 导航至您的[deployment](/langsmith/deployment)。
    2. 选择“**线程**”选项卡以查看所有线程。
    3. 单击某个线程以检查其当前状态。

    要查看完整的线程历史记录并执行详细的调试，请单击 **在 Studio 中打开** 以在 [Studio](/langsmith/studio) 中打开线程。 Studio 提供了一个可视化界面，用于探索线程的执行历史记录、状态更改和检查点详细信息。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-threads.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>