<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Human-in-the-loop | https://docs.langchain.com/oss/python/langchain/human-in-the-loop -->

# 人机交互

人在环 (HITL) [middleware](/oss/python/langchain/middleware/built-in#human-in-the-loop) 允许您为代理工具调用添加人工监督。
当模型提出可能需要审查的操作（例如写入文件或执行 SQL）时，中间件可以暂停执行并等待决策。

它通过根据可配置策略检查每个工具调用来实现此目的。如果需要干预，中间件会发出 [interrupt](https://reference.langchain.com/python/langgraph/types/interrupt) 来停止执行。图状态使用LangGraph的[persistence layer](/oss/python/langgraph/persistence)保存，因此执行可以安全地暂停并稍后恢复。

然后，人类的决定决定接下来会发生什么：该操作可以按原样批准 (`approve`)、在运行前修改 (`edit`)、拒绝反馈 (`reject`) 或直接响应 (`respond`)“询问用户”风格的工具。

## 中断决策类型

[middleware](/oss/python/langchain/middleware/built-in#human-in-the-loop) 定义了人类响应中断的四种内置方式：|决策类型|描述 |示例用例 |
| - | - | - |
| ✅ `approve` |使用代理建议的原始参数执行该工具。 |发送与书面内容完全一致的电子邮件草稿 |
| ✏️ `edit` |执行前修改工具参数。 |发送电子邮件之前更改收件人 |
| ❌ `reject` |完全跳过执行此工具调用并向代理返回拒绝反馈。 |拒绝文件删除并解释原因 |
| 💬 `respond` |对于“询问用户”风格的工具，直接将人类的消息作为合成工具结果返回，跳过执行。 |通过直接回复来回答 `"ask_user"` 提示 |

每个工具的可用决策类型取决于您在 `interrupt_on` 中配置的策略。

当多个工具调用同时暂停时，每个操作都需要单独的决策。

在默认批处理模式下，按照与中断请求中出现的操作相同的顺序提供决策。在[per-call mode](#pause-once-per-tool-call)中，每个工具调用都有自己的中断并做出一个决定。当人类拒绝请求的操作时使用`reject`。仅当人类充当工具时才使用`respond`，例如回答`ask_user`提示。不要使用`respond`来拒绝副作用工具，因为它的消息被视为成功的工具结果。

<Tip>
  **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。
</Tip>

## 配置中断

要使用 HITL，请在创建代理时将 [middleware](/oss/python/langchain/middleware/built-in#human-in-the-loop) 添加到代理的 `middleware` 列表中。

您可以使用工具操作到每个操作允许的决策类型的映射来配置它。当工具调用与映射中的操作匹配时，中间件将中断执行。

本示例使用默认的批处理模式。要每次工具调用暂停一次，请参阅[Set the interrupt mode](#set-the-interrupt-mode)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware # [!code highlight]
from langgraph.checkpoint.memory import InMemorySaver # [!code highlight]


agent = create_agent(
    model="gpt-5.5",
    tools=[write_file, execute_sql, read_data],
    middleware=[
        HumanInTheLoopMiddleware( # [!code highlight]
            interrupt_on={
                "write_file": True,  # All decisions (approve, edit, reject, respond) allowed
                "execute_sql": {"allowed_decisions": ["approve", "reject"]},  # No editing allowed
                "read_data": False, # Safe operation, no approval needed
            },
            # Prefix for interrupt messages - combined with tool name and args to form the full message
            # e.g., "Tool execution pending approval: execute_sql with query='DELETE FROM...'"
            # Individual tools can override this by specifying a "description" in their interrupt config
            description_prefix="Tool execution pending approval",
        ),
    ],
    # Human-in-the-loop requires checkpointing to handle interrupts.
    # In production, use a persistent checkpointer like AsyncPostgresSaver or MongoDBSaver.
    checkpointer=InMemorySaver(),  # [!code highlight]
)
```

<Info>
  您必须配置检查指针以跨中断保持图形状态。
  在生产中，使用持久检查指针，例如 [⟦T47⟧](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.postgres.aio.AsyncPostgresSaver) 或 [⟦T48⟧](https://pypi.org/project/langgraph-checkpoint-mongodb/)。对于测试或原型设计，请使用[⟦T49⟧](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.memory.InMemorySaver)。调用代理时，传递包含 **线程 ID** 的 `config` 将执行与会话线程关联起来。
  详情请参阅[LangGraph interrupts documentation](/oss/python/langgraph/interrupts)。
</Info>

<Accordion title="Configuration options">
  <ParamField type="dict">
    将工具名称映射到批准配置。值可以是`True`（默认配置的中断）、`False`（自动批准）或`InterruptOnConfig`对象。
  </ParamField>

  <ParamField type="string">
    操作请求描述的前缀
  </ParamField>

  <ParamField type="string">
    代理如何暂停以进行审核。 `"batched"` 每个模型回合都会引发一个中断，并以有序列表进行响应。 `"per_call"` 每个门控调用产生一个中断，由中断 ID 应答。 `"per_call"` 需要 `langchain>=1.4.6`。参见[Set the interrupt mode](#set-the-interrupt-mode)。
  </ParamField>

  <ParamField type="string | None">
    在审阅者用 `edit` 决策替换的调用结果之前添加的文本，以便模型知道调用已更改。默认为人工审阅者替换了呼叫的注释。通过 `None` 不添加任何内容。
  </ParamField>

  **`InterruptOnConfig`选项：**

  <ParamField type="list[string]">
    允许的决策列表：`'approve'`、`'edit'`、`'reject'` 或 `'respond'`
  </ParamField>

  <ParamField type="string | callable">
    用于自定义描述的静态字符串或可调用函数
  </ParamField><ParamField type="callable">
    可选谓词，接收 [ToolCallRequest](https://reference.langchain.com/python/langgraph.prebuilt/tool_node/ToolCallRequest) 并返回 `True` 以中断或返回 `False` 以自动批准。用它来控制调用参数的中断。需要`langchain>=1.3.3`。
  </ParamField>
</Accordion>

## 条件中断

默认情况下，`interrupt_on` 中列出的每个工具调用都会暂停以供审核。要仅暂停某些调用，请将 `when` 谓词添加到工具的 `InterruptOnConfig`。该谓词接收 `ToolCallRequest` 并返回 `True` 以中断或返回 `False` 以自动批准，因此您可以控制工具的参数。

<Note>
  条件中断需要`langchain>=1.3.3`。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware, ToolCallRequest
from langgraph.checkpoint.memory import InMemorySaver


def writes_outside_workspace(request: ToolCallRequest) -> bool:
    """Pause writes to paths outside the workspace directory."""
    path = request.tool_call["args"].get("path", "")
    return not path.startswith("/workspace/")


def is_write_query(request: ToolCallRequest) -> bool:
    """Pause SQL that isn't a read-only SELECT."""
    query = request.tool_call["args"].get("query", "")
    return not query.lstrip().upper().startswith("SELECT")


agent = create_agent(
    model="gpt-5.5",
    tools=[write_file, execute_sql, read_data],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "write_file": {
                    "allowed_decisions": ["approve", "edit", "reject"],
                    "when": writes_outside_workspace,
                },
                "execute_sql": {
                    "allowed_decisions": ["approve", "reject"],
                    "when": is_write_query,
                },
            },
        ),
    ],
    checkpointer=InMemorySaver(),
)
```

当 `when` 谓词返回 `False` 时，调用将不间断地运行。当它返回 `True` 时，或者当您省略 `when` 时，呼叫将照常暂停。计算结果为 `False` 的调用永远不会暂停，因此审阅者只能看到需要做出决定的操作。

当代理恢复时，谓词再次运行，因此它必须为同一调用返回相同的结果。如果它在简历中返回`False`，则该工具将运行并且审阅者的答案将被忽略，即使是`reject`。在批处理模式下，如果仅部分调用的结果发生变化，中间件会引发 `ValueError`。

## 设置中断模式

中间件以两种模式之一暂停，使用 `interrupt_mode` 设置：* **`"per_call"`**：每个需要审查的工具调用在启动时都会引发自己的中断。每个中断都携带它接受的答案的[⟦T85⟧](/oss/python/langgraph/interrupts#define-an-interrupt-response-schema)。您可以通过一个决定来回答它，并以中断 ID 为关键。
* **`"batched"`**（默认）：每个模型回合一个中断会列出每个需要审核的调用。您以相同顺序列出一系列决定来回答。

对新代理使用每次呼叫模式。 LangChain 计划在下一个主要版本中将其设为默认值。有关并排比较和每次调用模式解决的问题，请参阅[human-in-the-loop overview](/oss/python/concepts/human-in-the-loop)。

## 每次工具调用暂停一次

<Note>
  每次调用中断需要`langchain>=1.4.6`。
</Note>

设置 `interrupt_mode="per_call"` 来单独查看每个工具调用。该代理对`write_file`和`execute_sql`进行门控，并让`read_data`无需审查即可运行：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="anthropic:claude-sonnet-5",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents import create_agent
  from langchain.agents.middleware import HumanInTheLoopMiddleware
  from langchain.tools import tool
  from langgraph.checkpoint.memory import InMemorySaver


  @tool
  def write_file(path: str, content: str) -> str:
      """Write content to a file."""
      return f"Wrote {len(content)} characters to {path}"


  @tool
  def execute_sql(query: str) -> str:
      """Run a SQL query."""
      return "Deleted 42 rows"


  @tool
  def read_data(table: str) -> str:
      """Read rows from a table."""
      return f"3 rows from {table}"


  agent = create_agent(
      model="ollama:north-mini-code-1.0",
      tools=[write_file, execute_sql, read_data],
      middleware=[
          HumanInTheLoopMiddleware(
              interrupt_on={
                  "write_file": True,
                  "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                  "read_data": False,
              },
              interrupt_mode="per_call",  # [!code highlight]
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```
</CodeGroup>

### 读取中断

当模型一次调用所有三个工具时，`read_data` 会立即运行。这两个门控调用各自引发一个中断：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config = {"configurable": {"thread_id": "1"}}
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Archive old orders, then delete them."}]},
    config=config,
    version="v2",
)

# One interrupt per gated tool call, in no fixed order
for interrupt in result.interrupts:
    print(interrupt.value)
# > {'type': 'tool_approval', 'tool_call_id': 'call_write', 'name': 'write_file', 'args': {'path': 'orders_archive.csv', 'content': 'id,total\n1,20\n'}, 'description': "Tool execution requires approval\n\nTool: write_file\nArgs: {'path': 'orders_archive.csv', 'content': 'id,total\\n1,20\\n'}"}
# > {'type': 'tool_approval', 'tool_call_id': 'call_sql', 'name': 'execute_sql', 'args': {'query': "DELETE FROM orders WHERE created_at < '2025-01-01'"}, 'description': 'Tool execution requires approval\n\nTool: execute_sql\nArgs: {\'query\': "DELETE FROM orders WHERE created_at < \'2025-01-01\'"}'}
```

每个中断值都有`type: "tool_approval"`，因此客户端可以将其与其他中断区分开来。 `tool_call_id`、`name` 和 `args` 字段标识正在审核的呼叫。

### 读取响应模式每个中断还携带一个 `response_schema`：一种 JSON 模式，工具允许的每个决策有一个分支，与决策的 `type` 相匹配。 `execute_sql` 模式有 `approve` 和 `reject` 分支。 `write_file` 模式具有全部四个。对于允许一个决策的工具，`response_schema` 是该决策的单独模式，没有 `oneOf`。

每个选项卡都会显示一个 `write_file` 分支、与其匹配的答案以及模型收到的 [ToolMessage](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)。为了便于阅读，下面的分支扩展了 `$ref` 定义，并省略了 `title` 和 `description` 字段。

<Tabs>
  <Tab title="approve">
    按照建议运行呼叫。

    ```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"properties": {"type": {"const": "approve", "type": "string"}}, "required": ["type"], "type": "object"}
    ```

    ```python Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"type": "approve"}
    ```

    ```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Wrote 14 characters to orders_archive.csv
    ```
  </Tab>

  <Tab title="edit">
    使用新参数运行调用。 `edited_action.name` 必须保持 `write_file`，并且 `edited_action.args` 必须匹配 `write_file` 的参数模式。工具未声明的参数将被忽略，就像模型发送它们时一样。

    ```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "properties": {
        "type": {"const": "edit", "type": "string"},
        "edited_action": {
          "properties": {
            "name": {"const": "write_file", "type": "string"},
            "args": {
              "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
              },
              "required": ["path", "content"],
              "type": "object"
            }
          },
          "required": ["name", "args"],
          "type": "object"
        }
      },
      "required": ["type", "edited_action"],
      "type": "object"
    }
    ```

    ```python Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
        "type": "edit",
        "edited_action": {
            "name": "write_file",
            "args": {"path": "archive/orders_2024.csv", "content": "id,total\n1,20\n"},
        },
    }
    ```

    在审阅者替换了调用的注释后，模型会收到工具的结果。在中间件上设置 `edit_notice` 来更改注释，或者通过 `None` 来删除它。

    ```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Note: a human reviewer replaced this tool call before it ran. The call recorded in your message is the one you produced, not the one that executed. This was intentional and authorized. Do not re-issue your original call. Executed instead: write_file with arguments {"path": "archive/orders_2024.csv", "content": "id,total\n1,20\n"}.

    Tool response:
    Wrote 14 characters to archive/orders_2024.csv
    ```
  </Tab>

  <Tab title="reject">
    跳过通话。 `message` 是可选的，并告诉模型原因。

    ```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"properties": {"type": {"const": "reject", "type": "string"}, "message": {"type": "string"}}, "required": ["type"], "type": "object"}
    ```

    ```python Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"type": "reject", "message": "Write to the archive/ folder instead."}
    ```

    ```text Model receives (error status) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    User rejected the tool call for `write_file` with reason: Write to the archive/ folder instead.
    ```
  </Tab><Tab title="respond">
    跳过呼叫并代替该工具接听。需要`message`。该模型将其作为成功的工具结果接收，因此使用 `reject` 拒绝呼叫。

    ```json Schema branch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"properties": {"type": {"const": "respond", "type": "string"}, "message": {"type": "string"}}, "required": ["type", "message"], "type": "object"}
    ```

    ```python Answer theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"type": "respond", "message": "Saved orders_archive.csv to the shared drive myself."}
    ```

    ```text Model receives theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Saved orders_archive.csv to the shared drive myself.
    ```
  </Tab>
</Tabs>

### 通过 ID 恢复每个通话

用一个决定来应答每个中断，并通过其 ID 进行键入：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.types import Command

decisions = {}
for interrupt in result.interrupts:
    if interrupt.value["name"] == "execute_sql":
        decisions[interrupt.id] = {
            "type": "reject",
            "message": "Archive the rows before deleting them.",
        }
    else:
        decisions[interrupt.id] = {"type": "approve"}

result = agent.invoke(Command(resume=decisions), config=config, version="v2")
```

您还可以一次应答一个中断。您未应答的中断将保持待处理状态，一旦获得应答，其工具就会运行。

<Warning>
  如果一起发送的多个答案之一无效，则其他工具可以运行，而它们的中断仍显示为待处理。再次回答他们会运行这些工具两次。在将答案一起发送之前，请根据 `response_schema` 检查答案，或者一次发送一个。
</Warning>

### 更正无效答案

LangGraph 在保存答案之前对照中断的 `response_schema` 检查每个答案。无效答案会引发 `ValidationError` 并且不会保存任何内容，因此您可以向同一中断 ID 发送正确的答案。在这里，编辑遗漏了`content`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import ValidationError

write_file_interrupt = next(
    interrupt for interrupt in result.interrupts if interrupt.value["name"] == "write_file"
)
edit = {
    "type": "edit",
    "edited_action": {"name": "write_file", "args": {"path": "archive/orders_2024.csv"}},
}

try:
    agent.invoke(Command(resume={write_file_interrupt.id: edit}), config=config, version="v2")
except ValidationError as error:
    for problem in error.errors():
        print(".".join(str(part) for part in problem["loc"]), problem["msg"])
# > edit.edited_action.args.content Field required

# Nothing was saved, so answer the same interrupt again
edit["edited_action"]["args"]["content"] = "id,total\n1,20\n"
result = agent.invoke(
    Command(resume={write_file_interrupt.id: edit}), config=config, version="v2"
)
```每个错误都会对失败的字段进行命名，以便您可以将其显示给审阅者。对于参数是原始 JSON 模式而不是 Pydantic 模型的工具，`response_schema` 显示参数，但 LangGraph 不会检查对它们的编辑。

### 订购中间件以进行每次调用审核

在每次调用模式下，审查在工具调用开始时在工具调用中间件链内进行：

* 在工具重试或错误处理中间件之前列出`HumanInTheLoopMiddleware`，例如[ToolRetryMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_retry/ToolRetryMiddleware)和[ToolErrorMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware)，因此它将它们包装起来。否则，重试的调用会再次询问审阅者，并且会重试无效的答案或将其作为工具错误返回给模型。
* 当代理恢复时，`HumanInTheLoopMiddleware`之前列出的中间件将再次运行直到暂停，因此在调用其处理程序之前它不能有副作用。该工具仅在回答后运行。
* 每次调用开始时都会运行 [⟦T125⟧ predicate](#conditional-interrupts)，因此它收到的 [ToolCallRequest](https://reference.langchain.com/python/langgraph.prebuilt/tool_node/ToolCallRequest) 包含该工具。

## 响应中断当您调用代理时，它会一直运行，直到完成或引发中断。当工具调用与您在`interrupt_on`中配置的策略匹配时，会触发中断。使用 `version="v2"`，结果是 `GraphOutput`，其 `interrupts` 属性包含需要审核的操作。然后，您可以将这些操作呈现给审阅者，并在做出决定后恢复执行。

本节中的示例和下面的决策类型使用默认的批处理模式。对于每次调用模式，请参阅[Pause once per tool call](#pause-once-per-tool-call)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.types import Command

# Human-in-the-loop leverages LangGraph's persistence layer.
# You must provide a thread ID to associate the execution with a conversation thread,
# so the conversation can be paused and resumed (as is needed for human review).
config = {"configurable": {"thread_id": "some_id"}} # [!code highlight]
# Run the graph until the interrupt is hit.
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "Delete old records from the database",
            }
        ]
    },
    config=config, # [!code highlight]
    version="v2", # [!code highlight]
)

# result is a GraphOutput with .value and .interrupts
print(result.interrupts)  # [!code highlight]
# > (
# >    Interrupt(
# >       value={
# >          'action_requests': [
# >             {
# >                'name': 'execute_sql',
# >                'args': {'query': 'DELETE FROM records WHERE created_at < NOW() - INTERVAL \'30 days\';'},
# >                'description': 'Tool execution pending approval\n\nTool: execute_sql\nArgs: {...}'
# >             }
# >          ],
# >          'review_configs': [
# >             {
# >                'action_name': 'execute_sql',
# >                'allowed_decisions': ['approve', 'reject']
# >             }
# >          ]
# >       }
# >    ),
# > )


# Resume with approval decision
agent.invoke(
    Command( # [!code highlight]
        resume={"decisions": [{"type": "approve"}]}  # or "reject" [!code highlight]
    ), # [!code highlight]
    config=config, # Same thread ID to resume the paused conversation
    version="v2",
)
```

### 决策类型

<Tabs>
  <Tab title="approve">
    使用 `approve` 按原样批准工具调用并在不进行任何更改的情况下执行它。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agent.invoke(
        Command(
            # Decisions are provided as a list, one per action under review.
            # The order of decisions must match the order of actions
            # in the interrupt request.
            resume={
                "decisions": [
                    {
                        "type": "approve",
                    }
                ]
            }
        ),
        config=config,  # Same thread ID to resume the paused conversation
        version="v2",
    )
    ```
  </Tab>

  <Tab title="edit">
    在执行之前使用`edit`修改工具调用。
    为编辑后的操作提供新的工具名称和参数。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agent.invoke(
        Command(
            # Decisions are provided as a list, one per action under review.
            # The order of decisions must match the order of actions
            # in the interrupt request.
            resume={
                "decisions": [
                    {
                        "type": "edit",
                        # Edited action with tool name and args
                        "edited_action": {
                            # Tool name to call.
                            # Will usually be the same as the original action.
                            "name": "new_tool_name",
                            # Arguments to pass to the tool.
                            "args": {"key1": "new_value", "key2": "original_value"},
                        }
                    }
                ]
            }
        ),
        config=config,  # Same thread ID to resume the paused conversation
        version="v2",
    )
    ```

    <Tip>
      **编辑**工具参数时，请保守地进行更改。对原始参数的重大修改可能会导致模型重新评估其方法，并可能多次执行该工具或采取意外的操作。
    </Tip>
  </Tab>

  <Tab title="reject">
    使用`reject`拒绝工具调用并提供反馈而不是执行。该工具未执行。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agent.invoke(
        Command(
            # Decisions are provided as a list, one per action under review.
            # The order of decisions must match the order of actions
            # in the interrupt request.
            resume={
                "decisions": [
                    {
                        "type": "reject",
                        # Optional: explain why the action was rejected
                        # and whether the agent should retry a different approach.
                        "message": "User rejected this action. Do not retry this tool call.",
                    }
                ]
            }
        ),
        config=config,  # Same thread ID to resume the paused conversation
        version="v2",
    )
    ````message` 作为反馈添加到对话中，以帮助代理了解操作被拒绝的原因以及应该做什么。当您省略 `message` 时，中间件将使用默认拒绝消息，告诉模型该工具未执行，并且除非用户要求，否则不要重试相同的工具调用。对于副作用工具，提供特定于域的消息，明确说明代理是否应该放弃操作、提出后续问题或尝试更安全的替代方案。
  </Tab>

  <Tab title="respond">
    使用 `respond` 作为“询问用户”风格的工具，该工具的真正实现是人类的回复。 `message`内容直接作为工具结果返回；该工具本身不被执行。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agent.invoke(
        Command(
            # Decisions are provided as a list, one per action under review.
            # The order of decisions must match the order of actions
            # in the interrupt request.
            resume={
                "decisions": [
                    {
                        "type": "respond",
                        # The human's reply, returned directly as the tool result
                        "message": "Blue.",
                    }
                ]
            }
        ),
        config=config,  # Same thread ID to resume the paused conversation
        version="v2",
    )
    ```

    `message` 作为成功的 `ToolMessage` 返回给代理。当该工具有意充当人工输入的占位符时，请使用 `respond`，例如提示澄清的 `ask_user` 工具。不要使用 `respond` 拒绝提议的操作，因为它告诉模型该工具已成功完成。
  </Tab>
</Tabs>

***

### 多项决策当审查多个操作时，请按照中断中出现的顺序为每个操作提供决策：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    "decisions": [
        {"type": "approve"},
        {
            "type": "edit",
            "edited_action": {
                "name": "tool_name",
                "args": {"param": "new_value"}
            }
        },
        {
            "type": "reject",
            "message": "This action is not allowed"
        }
    ]
}
```

## 通过人机交互进行流式传输

您可以在代理运行时使用 `stream_events()` 传输实时更新并处理中断。使用 `stream.messages` 传输 LLM 令牌，并使用 `stream.values` 检查代理状态快照是否有中断。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph.types import Command

config = {"configurable": {"thread_id": "some_id"}}

# Stream agent progress and LLM tokens until interrupt
stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "Delete old records from the database"}]},
    config=config,
    version="v3",  # [!code highlight]
)
for message in stream.messages:  # [!code highlight]
    for token in message.text:  # [!code highlight]
        print(token, end="", flush=True)

# Check whether the run paused for human input
if stream.interrupted:  # [!code highlight]
    print(f"\n\nInterrupt: {stream.interrupts}")  # [!code highlight]

# Resume with streaming after human decision
stream = agent.stream_events(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config=config,
    version="v3",  # [!code highlight]
)
for message in stream.messages:  # [!code highlight]
    for token in message.text:
        print(token, end="", flush=True)
```

在 [per-call mode](#pause-once-per-tool-call) 中，`stream.interrupts` 为每个门控工具调用保留一个中断。使用由中断 ID 键入的字典来恢复：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
decisions = {interrupt.id: {"type": "approve"} for interrupt in stream.interrupts}
stream = agent.stream_events(Command(resume=decisions), config=config, version="v3")
for message in stream.messages:
    for token in message.text:
        print(token, end="", flush=True)
```

有关流模式的更多详细信息，请参阅 [Streaming](/oss/python/langchain/streaming) 指南。

## 执行生命周期

中间件定义了一个 `after_model` 钩子，该钩子在模型生成响应之后但在执行任何工具调用之前运行：

1. 代理调用模型来生成响应。
2. 中间件检查工具调用的响应。
3. 如果任何调用需要人工输入，中间件将使用 `action_requests` 和 `review_configs` 构建 [HITLRequest](https://reference.langchain.com/python/langchain/agents/middleware/human_in_the_loop/HITLRequest) 并调用 [interrupt](https://reference.langchain.com/python/langgraph/types/interrupt)。
4. 代理等待人类的决定。
5. 根据`HITLResponse`决策，中间件执行批准或编辑的调用，综合[ToolMessage](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)用于拒绝的调用，直接返回人工回复作为[ToolMessage](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)用于`respond`决策，并恢复执行。在 [per-call mode](#pause-once-per-tool-call) 中，`after_model` 钩子不执行任何操作。相反，中间件会在每个门控调用运行时暂停它，每次调用一个 [interrupt](https://reference.langchain.com/python/langgraph/types/interrupt)，并在调用决策到达后运行该工具。

## 自定义 HITL 逻辑

对于更专业的工作流程，您可以直接使用 [interrupt](https://reference.langchain.com/python/langgraph/types/interrupt) 原语和 [middleware](/oss/python/langchain/middleware) 抽象构建自定义 HITL 逻辑。

查看上面的[execution lifecycle](#execution-lifecycle)，了解如何将中断集成到代理的操作中。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/human-in-the-loop.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>