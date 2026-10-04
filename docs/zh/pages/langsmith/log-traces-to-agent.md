<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log traces to an agent | https://docs.langchain.com/langsmith/log-traces-to-agent -->

# 将跟踪记录记录到代理

代理寻址如何将跟踪发送到代理和环境、哪些变量携带它，以及为什么它不能与项目寻址结合使用。

*代理寻址* 命名跟踪所属的 [agent](/langsmith/agents) 和 [environment](/langsmith/agent-environments)。您的应用程序在每次运行时都会发送这两者，并且LangSmith会在跟踪到达时记录它们。跟踪使用代理寻址或[project addressing](/langsmith/log-traces-to-project)，不能同时使用两者。

<Note>
  代理寻址适用于基于代理的工作区，位于[beta](/langsmith/release-stages)。 [⟦T7⟧ argument](#addressing-arguments) 可能会更改，恕不另行通知。支持代理寻址：

  * 来自`langsmith>=0.14.4`的Python SDK
  *来自`langsmith>=0.10.8`的TypeScript SDK

  对于不依赖于 beta 的跟踪设置，请参阅 [Log traces to a specific project](/langsmith/log-traces-to-project)。
</Note>

## 变量寻址

两个环境变量携带代理寻址：* **`LANGSMITH_AGENT_ID`**：要寻址的代理。该值是代理的标识符，浏览器地址栏携带该标识符，代理概述副本上的 **ID** 字段也包含该标识符。每次运行时都会发送它。
* **`LANGSMITH_AGENT_ENVIRONMENT`**：运行所属的环境。需要与代理一起使用，以及 `local`、`development`、`staging` 或 `production` 之一。使用小写形式，它映射到 UI 中的 Local、Development、Staging 和 Production 标签。没有默认值，因为代理和环境都没有单独指定目的地。如果仅设置了两个变量之一，SDK 会记录一条警告并保留调用不被跟踪，而不是为您选择一个环境，因此不会达到 LangSmith。

`LANGSMITH_AGENT_ID` 采用标识符，而不是显示名称。 [display name is a separate, editable value](/langsmith/agents#identifiers-and-display-names) 不必与标识符匹配，因此从代理中读取标识符，而不是从代理的名称中派生它。

## 处理参数

将代理和环境一起提供，作为代码中的一个地址或同时作为两个地址[environment variables](#addressing-variables)。地址是单个字符串，`lrn:agents/{id}/environments/{environment}`。使用 Python 中的 `ls.address.agent("checkout", "production")` 或 TypeScript 中的 `address.agent("checkout", "production")` 构建它，它会检查值并小写环境，或者直接写入字符串。在Python中，[⟦T20⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable)和[⟦T21⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context)各自接受`address`。在 TypeScript 中，[⟦T23⟧](https://reference.langchain.com/javascript/langsmith/traceable) 在其配置中接受 `address`。代码中的地址优先于变量。仅当代码中没有指定目标时，SDK 才会读取变量，然后它就需要两者。

## 示例

使用装饰器处理一个函数：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith as ls
from langsmith import traceable

@traceable(address=ls.address.agent("checkout", "production"))
def handle_order(order_id: str) -> dict:
    return {"order_id": order_id, "status": "charged"}
```

使用上下文管理器处理块内跟踪的所有内容：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable, tracing_context

@traceable
def handle_order(order_id: str) -> dict:
    return {"order_id": order_id, "status": "charged"}

with tracing_context(address="lrn:agents/checkout/environments/production"):
    handle_order("A-1")
```

在 TypeScript 中寻址函数：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { address } from "langsmith";
import { traceable } from "langsmith/traceable";

const handleOrder = traceable(
  async (orderId: string) => ({ orderId, status: "charged" }),
  { name: "handle_order", address: address.agent("checkout", "production") },
);
```

## 发送您的第一个代理寻址跟踪

<Steps>
  <Step title="Confirm your workspace is enabled">
    如果您的工作区是基于代理的，则代理寻址已启用。 LangChain 打开它，您无需更改任何设置。在LangChain[converted](/langsmith/migrate-to-agent-based-workspaces#how-a-workspace-moves)的工作区中，管理员可以在新体验和经典体验之间切换UI。该开关仅更改 UI 显示的内容。它不会打开代理寻址。

    要了解您拥有哪种类型的工作区，请查看左上角的控件。在基于代理的工作区中，它会命名您的工作区。在基于项目的工作区中，它显示 LangSmith 徽标，并且代理寻址已关闭。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。

    如果您的工作区未启用，LangSmith 摄取会拒绝代理寻址的运行并且不会记录任何内容。
  </Step><Step title="Install the SDK">
    代理解决 Python 中的 `langsmith>=0.14.4` 或 TypeScript 中的 `langsmith@>=0.10.8`：

    <CodeGroup>
      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langsmith>=0.14.4"
      ```

      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langsmith>=0.14.4"
      ```

      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install "langsmith@>=0.10.8"
      ```
    </CodeGroup>
  </Step>

  <Step title="Choose an identifier">
    从现有代理概览上的 **ID** 字段复制标识符，或选择一个新标识符。如果工作区中没有代理使用您选择的标识符，则LangSmith会在您第一次向其发送跟踪时创建该代理。您不必提前创建代理。有关标识符必须遵循的规则，请参阅[Addressing an agent that does not exist](#addressing-an-agent-that-does-not-exist)。
  </Step>

  <Step title="Configure the addressing">
    设置两个寻址[variables](#addressing-variables)，或在代码中传递[address](#addressing-arguments)。如果仅设置一个变量，SDK 会记录一条警告并且不发送任何内容。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_TRACING=true
    export LANGSMITH_API_KEY=<your-api-key>
    export LANGSMITH_AGENT_ID=checkout
    export LANGSMITH_AGENT_ENVIRONMENT=production
    ```

    前两个是通常的跟踪先决条件，而不是代理寻址的一部分。使用您在步骤 1 中确认的工作区中的 [API key](/langsmith/create-account-api-key)。
  </Step>

  <Step title="Run your application">
    运行您的应用程序，以便它至少发送一条跟踪。生成跟踪在 Python 中需要 `@traceable` 或 `tracing_context`，或者在 TypeScript 中需要 `traceable`，如 [Examples](#examples)。
  </Step>

  <Step title="Find the trace">
    在LangSmith中，选择顶部栏中的代理，转到**跟踪**，并将环境控制设置为您指定的环境控制。痕迹出现在那里。
  </Step>
</Steps>

## 寻址模式是互斥的将代理寻址和项目寻址组合在一个地方是一种错误，而不是后备规则：

* **不允许代理和项目一起**。如果您设置代理变量以及 `LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 或 `LANGCHAIN_SESSION`，则跟踪有两个目的地，并且 SDK 不会选择其中之一。它会在客户端启动时记录警告，并且不会跟踪调用，除非代码指定了目的地。如果您在一次调用中同时将 `address` 和 `project_name` 传递给 `@traceable` 或 `tracing_context()`，则 SDK 会引发 `LangSmithUserError` 并且不发送任何内容。如果同时包含地址和项目的运行达到 LangSmith，LangSmith 会拒绝它。
* **以代码命名的项目**会覆盖代理变量。将 `project_name` 传递给 `@traceable` 或 `tracing_context()` 会跟踪该项目的运行并忽略代理变量，不会出现错误。这就是让 [evaluation](/langsmith/evaluation) 设置自己的项目，同时代理变量在流程的其余部分保持设置状态。

## 寻址不存在的代理

如果标识符与工作区中的代理不匹配，LangSmith 将创建该代理。

有关该值必须遵循的规则，请参阅[Identifier rules](/langsmith/create-an-agent#identifier-rules)。

以这种方式创建的代理在其[Overview](/langsmith/navigate-agents#read-the-agent-overview)上不显示部署部分。

## 当运行停止被接受时接受代理寻址运行的工作区可以停止接受它们。首先检查您的 API 密钥是否仍然属于基于代理的工作区，因为使用来自基于项目的工作区的密钥发送的代理寻址运行会被拒绝。如果密钥不是问题，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。

## 另请参阅

* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Log traces to a specific project](/langsmith/log-traces-to-project)
* [Observability concepts](/langsmith/observability-concepts)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-traces-to-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>