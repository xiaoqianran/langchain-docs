<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log traces to an agent | https://docs.langchain.com/langsmith/log-traces-to-agent -->

# 将跟踪记录记录到代理

配置代理标识符和环境以将代码中的跟踪发送到LangSmith。

每个跟踪都属于工作空间内的一个 [agent](/langsmith/agents) 及其其中一个 [environments](/langsmith/agent-environments)。在代码或环境变量中配置代理标识符和环境。 LangSmith 使用它们将每个跟踪路由到选定的环境。

> [!注意]
>
> 向代理发送跟踪仅适用于基于代理的工作区。它支持：
>
> * 来自`langsmith>=0.14.9`的Python SDK
> * 来自 `langsmith>=0.10.9` 的 TypeScript SDK
> * 来自`github.com/langchain-ai/langsmith-go@v0.28.0`的Go SDK
> * 来自`com.langchain.smith:langsmith-java:0.1.0-beta.26`的Java SDK
>
> 对于需要 `project_name` 的集成，请使用环境的 [⟦T16⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。对于基于项目的工作区，包括自托管 LangSmith，请遵循 [tracing quickstart](/langsmith/observability-quickstart)。

## 先决条件* **基于代理的工作区。** [Agent-based workspaces](/langsmith/migrate-to-agent-based-workspaces) 在 [LangSmith Cloud](/langsmith/cloud) 上可用。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。在基于代理的工作区中，向代理发送跟踪已开启，您无需更改设置。要检查您拥有哪种类型的工作区，请查看左上角的控件。在基于代理的工作区中，它会命名您的工作区。在基于项目的工作区中，它显示 LangSmith 徽标，并且向代理发送跟踪已关闭。
* **现有代理。** [Create the agent](/langsmith/create-an-agent) 在运行跟踪示例之前进入目标工作区一次。这些示例使用标识符 `checkout`。用你自己的替换它。
* **来自该工作区的 API 密钥**。参见[create an API key](/langsmith/create-account-api-key)。
* **SDK.** 将跟踪发送到代理需要 Python 中的 `langsmith>=0.14.9`、TypeScript 中的 `langsmith@>=0.10.9`、Go 中的 `github.com/langchain-ai/langsmith-go` v0.28.0 或更高版本、或者 Java 中的 `com.langchain.smith:langsmith-java` 0.1.0-beta.26 或更高版本：

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

以代码或环境变量的形式将代理和环境一起命名。代码中的代理优先于变量。仅当代码中没有指定目标时，SDK 才会读取变量，然后它就需要两者。* **代理 ID**：代理的标识符，浏览器地址栏带有该标识符，代理概览副本上的 **ID** 字段也包含该标识符。它不是显示名称。 [display name is a separate, editable value](/langsmith/agents#identifiers-and-display-names) 不必与标识符匹配，因此从代理中读取标识符，而不是从代理的调用中派生它。有关标识符必须遵循的规则，请参阅[Identifier rules](/langsmith/create-an-agent#identifier-rules)。在使用其标识符之前创建代理。存档的代理仍然保留其标识符，并且LangSmith拒绝使用`409`发送给它的运行。
* **环境**：运行所属的环境，以及`local`、`development`、`staging`或`production`之一。环境名称不区分大小写，它们映射到 UI 中的 Local、Development、Staging 和 Production 标签。没有默认值，因为代理和环境都没有单独指定目的地。

### 使用环境变量

设置两个变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_AGENT_ID=checkout
export LANGSMITH_AGENT_ENVIRONMENT=production
```

前两个是通常的跟踪先决条件，而不是命名代理的一部分。如果仅设置两个代理变量之一，SDK 会记录一条警告。它不会为您选择一个环境，而是不会跟踪每个在代码中未指定目的地的调用，因此这些调用中的任何内容都不会到达LangSmith。### 使用代码

传递代理地址。

**Python**

对于块内跟踪的所有内容，将 `ls.agent_address("checkout", "production")` 作为 [⟦T29⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 或 [⟦T30⟧](https://reference.langchain.com/python/langsmith/run_helpers/tracing_context) 的 `address` 参数传递：

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

在[⟦T33⟧](https://reference.langchain.com/javascript/langsmith/traceable)的配置中将`new AgentAddress("checkout", "production")`作为`address`传递：

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

## 发送你的第一条轨迹

运行您的代理，以便它至少发送一条跟踪。在LangSmith中，选择顶部栏中的代理，转到**跟踪**，并将环境控制设置为您将跟踪发送到的环境控制。痕迹出现在那里。

## 查询代理环境

要查询跟踪，请从 [resolve the agent identifier and environment](/langsmith/resolve-an-agent) 更改为 `session_id`。将该值传递给需要 `project_id` 或 `project_ids` 的查询 API。

## 删除冲突的目标设置请勿将代理寻址与旧目标设置结合起来。 SDK 按如下方式处理冲突的设置：

* **代理变量和遗留变量一起**：不允许。如果您设置代理变量以及 `LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 或 `LANGCHAIN_SESSION`，则跟踪有两个目的地，并且 SDK 不会选择其中之一。它会在客户端启动时记录警告，并且不会跟踪调用，除非代码指定了目的地。如果您在一次调用中同时传递 `address` 和 `project_name`，SDK 会引发错误并且不发送任何内容：Python 中来自 `@traceable` 或 `tracing_context()` 的 `LangSmithUserError`，或者 TypeScript 中来自 `traceable` 的 `Error`。 LangSmith 还拒绝提供两种地址类型的摄取请求。
* **代码中的`project_name`覆盖**：覆盖代理变量。在 Python 中将 `project_name` 传递到 `@traceable` 或 `tracing_context()`，或者在 TypeScript 中的 `traceable` 配置中，将运行跟踪到覆盖目标并忽略代理变量，不会出现错误。这就是让 [evaluation](/langsmith/evaluation) 使用自己的实验目的地，同时代理变量在过程的其余部分保持设置状态的原因。

## 故障排除

如果跟踪报告代理不存在，请检查工作区和标识符。 [Register the agent](/langsmith/create-an-agent) 使用 UI 或设置凭据，然后重试。在自托管 LangSmith 上，基于代理的工作区不可用，LangSmith 拒绝发送到具有 `403` 和消息 `agent addressing is not enabled for this workspace` 的代理的运行。 It rejects the whole request that carries them, so it records none of the runs in that request.参见[Prerequisites](#prerequisites)。

## 另请参阅

* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Configure legacy integrations](/langsmith/create-an-agent#use-an-environment-project)
* [Resolve an agent environment](/langsmith/resolve-an-agent)
* [Trace with OpenTelemetry](/langsmith/trace-with-opentelemetry)
* [Observability concepts](/langsmith/observability-concepts)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-traces-to-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。