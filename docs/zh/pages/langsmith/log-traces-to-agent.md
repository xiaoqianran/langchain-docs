<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log traces to an agent | https://docs.langchain.com/langsmith/log-traces-to-agent -->

# 将跟踪记录记录到代理

使用环境变量或代码将跟踪发送到代理和环境，以及为什么不能将其与将跟踪发送到项目相结合。

将跟踪记录到代理的名称为跟踪所属的 [agent](/langsmith/agents) 和 [environment](/langsmith/agent-environments)。您的应用程序在每次运行时都会发送这两者，并且LangSmith会在跟踪到达时记录它们。跟踪要么发送到代理，要么发送到 [project](/langsmith/log-traces-to-project)，而不会同时发送到两者。有关代理和项目的关系，请参阅[Trace containers](/langsmith/observability-concepts#trace-containers)。

> [!注意]
>
> 向代理发送跟踪仅适用于基于代理的工作区。它支持：
>
> * 来自`langsmith>=0.14.9`的Python SDK
> * 来自 `langsmith>=0.10.9` 的 TypeScript SDK
> * 来自`github.com/langchain-ai/langsmith-go@v0.28.0`的Go SDK
> * 来自`com.langchain.smith:langsmith-java:0.1.0-beta.26`的Java SDK
>
> 对于不向代理发送跟踪的跟踪设置，请参阅 [Log traces to a specific project](/langsmith/log-traces-to-project)。

## 先决条件* **基于代理的工作区。** [Agent-based workspaces](/langsmith/migrate-to-agent-based-workspaces) 在 [LangSmith Cloud](/langsmith/cloud) 上可用。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。在基于代理的工作区中，向代理发送跟踪已开启，您无需更改设置。要检查您拥有哪种工作区，请查看左上角的控件。在基于代理的工作区中，它会命名您的工作区。在基于项目的工作区中，它显示 LangSmith 徽标，并且向代理发送跟踪已关闭。
* **来自该工作区的 API 密钥**。参见[create an API key](/langsmith/create-account-api-key)。
* **SDK.** 将跟踪发送到代理需要 Python 中的 `langsmith>=0.14.9`、TypeScript 中的 `langsmith@>=0.10.9`、Go 中的 `github.com/langchain-ai/langsmith-go` v0.28.0 或更高版本，或者 Java 中的 `com.langchain.smith:langsmith-java` 0.1.0-beta.26 或更高版本：

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add "langsmith>=0.14.9"
  ```

  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U "langsmith>=0.14.9"
  ```

  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install "langsmith@>=0.10.9"
  ```

  ```bash go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  go get github.com/langchain-ai/langsmith-go@v0.28.0
  ```

  ```kotlin Java/Kotlin (Gradle) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  implementation("com.langchain.smith:langsmith-java:0.1.0-beta.26")
  ```

## 将跟踪发送给代理

以代码或环境变量的形式将代理和环境一起命名。代码中的代理优先于变量。仅当代码中没有指定目标时，SDK 才会读取变量，然后它就需要两者。* **代理 ID**：代理的标识符，浏览器地址栏带有该标识符，代理概览副本上的 **ID** 字段也包含该标识符。它不是显示名称。 [display name is a separate, editable value](/langsmith/agents#identifiers-and-display-names) 不必与标识符匹配，因此从代理中读取标识符，而不是从代理的名称中派生它。有关标识符必须遵循的规则，请参阅[Identifier rules](/langsmith/create-an-agent#identifier-rules)。如果工作区中没有代理使用您发送的标识符，则LangSmith会在您第一次向其发送跟踪时创建该代理，因此您不必提前创建它。以这种方式创建代理需要[⟦T19⟧ permission](/langsmith/organization-workspace-operations#projects)。如果没有它，LangSmith 会拒绝运行 `403`。存档的代理仍然保留其标识符，因此LangSmith拒绝使用`409`发送给它的运行，而不是创建新代理。将该代理的踪迹发送到不同的标识符。以这种方式创建的代理的[Overview](/langsmith/navigate-agents#read-the-agent-overview)不显示部署详细信息。
* **环境**：运行所属的环境，以及`local`、`development`、`staging`或`production`之一。环境名称不区分大小写，它们映射到 UI 中的 Local、Development、Staging 和 Production 标签。没有默认值，因为代理和环境都没有单独指定目的地。### 使用环境变量

设置两个变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_AGENT_ID=checkout
export LANGSMITH_AGENT_ENVIRONMENT=production
```

前两个是通常的跟踪先决条件，而不是命名代理的一部分。如果仅设置两个代理变量之一，SDK 会记录一条警告。它不会为您选择环境，而是不会跟踪代码中未指定目的地的每个调用，因此这些调用中的任何内容都不会到达LangSmith。

### 使用代码

传递代理地址。

**Python**

对于块内跟踪的所有内容，将 `ls.agent_address("checkout", "production")` 作为 [⟦T28⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 或 [⟦T29⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 的 `address` 参数传递：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith as ls
from langsmith import traceable


@traceable(address=ls.agent_address("checkout", "production"))
def handle_order(order_id: str) -> dict:
    return {"order_id": order_id, "status": "charged"}
```

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith as ls
from langsmith import traceable, tracing_context


@traceable
def handle_order(order_id: str) -> dict:
    return {"order_id": order_id, "status": "charged"}


with tracing_context(address=ls.agent_address("checkout", "production")):
    handle_order("A-1")
```

**打字稿**

在[⟦T32⟧](https://reference.langchain.com/javascript/langsmith/traceable)的配置中将`new AgentAddress("checkout", "production")`作为`address`传递：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AgentAddress } from "langsmith";
import { traceable } from "langsmith/traceable";

const handleOrder = traceable(
  async (orderId: string) => ({ orderId, status: "charged" }),
  { name: "handle_order", address: new AgentAddress("checkout", "production") },
);
```

**Java**

在 `TraceConfig` 或 `RunTree` 构建器中将 `new AgentAddress("checkout", "production")` 作为 `address` 传递：

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.address.AgentAddress;
import com.langchain.smith.tracing.TraceConfig;
import com.langchain.smith.tracing.Tracing;
import java.util.Map;
import java.util.function.Function;

public class TraceAgentExample {
  public static void main(String[] args) {
    Function<String, Map<String, String>> handleOrder =
        Tracing.traceFunction(
            orderId -> Map.of("order_id", orderId, "status", "charged"),
            TraceConfig.builder()
                .name("handle_order")
                .address(new AgentAddress("checkout", "production"))
                .build());

    handleOrder.apply("A-1");
  }
}
```

**去**

使用 `langsmith.NewAgentAddress("checkout", "production")` 创建地址，该地址将返回无效值的错误，并将其设置为 `RunCreate` 上的 `Address`。 `WithTracingAddress` 为独立跟踪客户端的每次运行设置它：

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
package main

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/langchain-ai/langsmith-go"
)

func main() {
	agent, err := langsmith.NewAgentAddress("checkout", "production")
	if err != nil {
		panic(err.Error())
	}
	client := langsmith.NewClient()

	id := uuid.New()
	start := time.Now().UTC()
	order := fmt.Sprintf("%s%06dZ%s", start.Format("20060102T150405"), start.Nanosecond()/1000, id)

	if err := client.CreateRun(&langsmith.RunCreate{
		ID:          id,
		TraceID:     id,
		Name:        "handle_order",
		RunType:     "chain",
		StartTime:   start,
		DottedOrder: order,
		Address:     agent,
		Inputs:      map[string]any{"order_id": "A-1"},
	}); err != nil {
		panic(err.Error())
	}
	if err := client.UpdateRun(&langsmith.RunUpdate{
		ID:          id,
		TraceID:     id,
		DottedOrder: order,
		EndTime:     time.Now().UTC(),
		Outputs:     map[string]any{"status": "charged"},
	}); err != nil {
		panic(err.Error())
	}
	client.Close()
}
```

### 使用 OpenTelemetry

要将 OTLP 跟踪发送到代理，请设置 `Langsmith-Agent-Id` 和 `Langsmith-Agent-Environment` 标头而不是 `Langsmith-Project`。使用 `langsmith>=0.14.9`，Python SDK 的 OpenTelemetry 导出器会在未设置 `OTEL_EXPORTER_OTLP_HEADERS` 时设置代理变量中的两个标头。对于标头规则和LangSmith返回的错误，请参阅[Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry#trace-a-non-langchain-application)。

## 发送你的第一条轨迹运行您的应用程序，以便它至少发送一条跟踪。在LangSmith中，选择顶部栏中的代理，转到**跟踪**，并将环境控制设置为您将跟踪发送到的环境控制。痕迹出现在那里。

## 查找代理项目

要查询代理的踪迹，首先[resolve the agent to its project ID](/langsmith/resolve-an-agent)，然后像以前一样使用端点，传递该 ID。

## 发送给代理或项目，而不是同时发送给两者

向代理发送跟踪和向项目发送跟踪不会合并。发生的情况取决于每个设置的位置：* **代理和项目在一起**：不允许。如果您设置代理变量以及 `LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 或 `LANGCHAIN_SESSION`，则跟踪有两个目的地，并且 SDK 不会选择其中之一。它会在客户端启动时记录警告，并且不会跟踪调用，除非代码指定了目的地。如果您在一次调用中同时传递 `address` 和 `project_name`，SDK 会引发错误并且不发送任何内容：Python 中来自 `@traceable` 或 `tracing_context()` 的 `LangSmithUserError`，或者 TypeScript 中来自 `traceable` 的 `Error`。如果同时命名代理和项目的运行达到LangSmith，则LangSmith 会拒绝它。
* **以代码命名的项目**：覆盖代理变量。在 Python 中将 `project_name` 传递给 `@traceable` 或 `tracing_context()`，或者在 TypeScript 中的 `traceable` 配置中传递，会跟踪到该项目的运行并忽略代理变量，不会出现错误。这就是让 [evaluation](/langsmith/evaluation) 设置自己的项目，同时代理变量在流程的其余部分保持设置状态。

## 故障排除

在自托管 LangSmith 上，基于代理的工作区不可用，LangSmith 拒绝发送到具有 `403` 和消息 `agent addressing is not enabled for this workspace` 的代理的运行。它拒绝携带它们的整个请求，因此它不会记录该请求中的任何运行。参见[Prerequisites](#prerequisites)。

## 另请参阅* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Log traces to a specific project](/langsmith/log-traces-to-project)
* [Find an agent's project](/langsmith/resolve-an-agent)
* [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)
* [Observability concepts](/langsmith/observability-concepts)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-traces-to-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。