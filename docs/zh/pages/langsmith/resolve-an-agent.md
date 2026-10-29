<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Resolve an agent environment | https://docs.langchain.com/langsmith/resolve-an-agent -->

# 解析代理环境

将代理环境、实验或工作区评估器跟踪解析为查询和反馈 API 所需的会话 ID。

某些 API 通过其支持跟踪存储 UUID 来识别 [agent environment](/langsmith/agent-environments)，返回为 `session_id`。解析代理标识符和环境以获取此 UUID。在名为 `session_id`、`project_id` 或 `project_ids` 的 API 字段中使用它。这些是相同标识符的现有 API 名称。分辨率还支持 [experiments](/langsmith/evaluation-concepts) 和工作区 [evaluator](/langsmith/evaluators) 跟踪。使用返回的 ID 进行以下操作：

* 使用`project_ids`查询运行、线程和跟踪
* 读取或更新环境的跟踪存储设置、保存的视图、见解和警报

> [!注意]
>
> 解析代理需要LangSmith 0.18.7rc1 或更高版本，并且 BYOC 数据平面尚不支持。示例需要以下 SDK 版本：
>
> * **Python**：`langsmith>=0.14.9`
> * **TypeScript**：`langsmith@>=0.11.0`
> * **Java**：`com.langchain.smith:langsmith-java` 0.1.0-beta.26 或更高版本
> * **Go**：`github.com/langchain-ai/langsmith-go` v0.28.0 或更高版本

对于需要 `project_name`、[retrieve the agent environment](/langsmith/create-an-agent#use-an-environment-project) 并使用其 `tracer_session_name` 的集成。

## What you can resolve

解决以下任一问题即可获得其`session_id`：

**Python**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith as ls

agent = ls.agent_address("checkout", "production")  # An agent's environment
experiment = ls.experiment_address("<experiment-id>")  # An experiment
evaluators = ls.evaluator_address()  # The workspace's evaluators
```

**打字稿**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AgentAddress, EvaluatorAddress, ExperimentAddress } from "langsmith";

const agent = new AgentAddress("checkout", "production"); // An agent's environment
const experiment = new ExperimentAddress("<experiment-id>"); // An experiment
const evaluators = new EvaluatorAddress(); // The workspace's evaluators
```

**Java**

```java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.address.AgentAddress;
import com.langchain.smith.address.EvaluatorAddress;
import com.langchain.smith.address.ExperimentAddress;

AgentAddress agent = new AgentAddress("checkout", "production"); // An agent's environment
ExperimentAddress experiment = new ExperimentAddress("<experiment-id>"); // An experiment
EvaluatorAddress evaluators = new EvaluatorAddress(); // The workspace's evaluators
```

**去**

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// An agent's environment
agent, err := langsmith.NewAgentAddress("checkout", "production")
// An experiment
experiment, err := langsmith.NewExperimentAddress("<experiment-id>")
// The workspace's evaluators
evaluators := langsmith.NewEvaluatorAddress()
```

## 解析代理并查询其运行**Python**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

import langsmith as ls

client = ls.Client()
agent = ls.agent_address("checkout", "production")


async def main() -> None:
    project = await client.sessions.resolve(**agent)

    async for run in client.runs.query(project_ids=[project.session_id]):
        print(run.id)


asyncio.run(main())
```

**打字稿**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AgentAddress, Client } from "langsmith";

const client = new Client();
const agent = new AgentAddress("checkout", "production");

const project = await client.sessions.resolve(agent);

for await (const run of client.runs.query({
  project_ids: [project.session_id],
})) {
  console.log(run.id);
}
```

**Java**

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.address.AgentAddress;
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.models.runs.RunQueryV2Params;
import java.time.OffsetDateTime;

public class ResolveAgentExample {
  public static void main(String[] args) throws Exception {
    LangsmithClient client = LangsmithOkHttpClient.fromEnv();
    AgentAddress agent = new AgentAddress("checkout", "production");

    String projectId = client.sessions().resolve(agent.toApiAddress()).sessionId();

    client
        .runs()
        .queryV2(
            RunQueryV2Params.builder()
                .addProjectId(projectId)
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .build())
        .items()
        .forEach(run -> System.out.println(run.id().get()));
  }
}
```

**去**

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/langchain-ai/langsmith-go"
)

func main() {
	ctx := context.Background()
	client := langsmith.NewClient()
	agent, err := langsmith.NewAgentAddress("checkout", "production")
	if err != nil {
		panic(err.Error())
	}

	project, err := client.Sessions.Resolve(ctx, langsmith.NewSessionResolveParams(agent))
	if err != nil {
		panic(err.Error())
	}

	runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
		ProjectIDs:   langsmith.F([]string{project.SessionID}),
		MinStartTime: langsmith.F(time.Now().UTC().AddDate(0, -1, 0)),
	})
	if err != nil {
		panic(err.Error())
	}
	for _, run := range runs.Items {
		fmt.Println(run.ID)
	}
}
```

## 解决一个实验并查询其运行

传递实验 ID。端点返回与`session_id`相同的ID。

**Python**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

import langsmith as ls

client = ls.Client()
experiment_id = "<experiment-id>"
experiment = ls.experiment_address(experiment_id)


async def main() -> None:
    project = await client.sessions.resolve(**experiment)

    async for run in client.runs.query(project_ids=[project.session_id]):
        print(run.id)


asyncio.run(main())
```

**打字稿**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client, ExperimentAddress } from "langsmith";

const client = new Client();
let experimentId = "<experiment-id>";
const experiment = new ExperimentAddress(experimentId);

const project = await client.sessions.resolve(experiment);

for await (const run of client.runs.query({
  project_ids: [project.session_id],
})) {
  console.log(run.id);
}
```

**Java**

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.address.ExperimentAddress;
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.models.runs.RunQueryV2Params;
import java.time.OffsetDateTime;

public class ResolveExperimentExample {
  public static void main(String[] args) {
    LangsmithClient client = LangsmithOkHttpClient.fromEnv();
    String experimentId = "<experiment-id>";
    ExperimentAddress experiment = new ExperimentAddress(experimentId);

    String projectId = client.sessions().resolve(experiment.toApiAddress()).sessionId();

    client
        .runs()
        .queryV2(
            RunQueryV2Params.builder()
                .addProjectId(projectId)
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .build())
        .items()
        .forEach(run -> System.out.println(run.id().get()));
  }
}
```

**去**

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/langchain-ai/langsmith-go"
)

func main() {
	ctx := context.Background()
	client := langsmith.NewClient()
	experimentID := "<experiment-id>"
	experiment, err := langsmith.NewExperimentAddress(experimentID)
	if err != nil {
		panic(err.Error())
	}

	project, err := client.Sessions.Resolve(ctx, langsmith.NewSessionResolveParams(experiment))
	if err != nil {
		panic(err.Error())
	}

	runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
		ProjectIDs:   langsmith.F([]string{project.SessionID}),
		MinStartTime: langsmith.F(time.Now().UTC().AddDate(0, -1, 0)),
	})
	if err != nil {
		panic(err.Error())
	}
	for _, run := range runs.Items {
		fmt.Println(run.ID)
	}
}
```

## 解析评估者并查询他们的运行

评估器跟踪为每个工作区共享一个存储目标，因此评估器地址不包含 ID。

**Python**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

import langsmith as ls

client = ls.Client()
evaluators = ls.evaluator_address()


async def main() -> None:
    project = await client.sessions.resolve(**evaluators)

    async for run in client.runs.query(project_ids=[project.session_id]):
        print(run.id)


asyncio.run(main())
```

**打字稿**

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Client, EvaluatorAddress } from "langsmith";

const client = new Client();
const evaluators = new EvaluatorAddress();

const project = await client.sessions.resolve(evaluators);

for await (const run of client.runs.query({
  project_ids: [project.session_id],
})) {
  console.log(run.id);
}
```

**Java**

```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import com.langchain.smith.address.EvaluatorAddress;
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.models.runs.RunQueryV2Params;
import java.time.OffsetDateTime;

public class ResolveEvaluatorsExample {
  public static void main(String[] args) {
    LangsmithClient client = LangsmithOkHttpClient.fromEnv();
    EvaluatorAddress evaluators = new EvaluatorAddress();

    String projectId = client.sessions().resolve(evaluators.toApiAddress()).sessionId();

    client
        .runs()
        .queryV2(
            RunQueryV2Params.builder()
                .addProjectId(projectId)
                .minStartTime(OffsetDateTime.now().minusMonths(1))
                .build())
        .items()
        .forEach(run -> System.out.println(run.id().get()));
  }
}
```

**去**

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/langchain-ai/langsmith-go"
)

func main() {
	ctx := context.Background()
	client := langsmith.NewClient()
	evaluators := langsmith.NewEvaluatorAddress()

	project, err := client.Sessions.Resolve(ctx, langsmith.NewSessionResolveParams(evaluators))
	if err != nil {
		panic(err.Error())
	}

	runs, err := client.Runs.QueryV2(ctx, langsmith.RunQueryV2Params{
		ProjectIDs:   langsmith.F([]string{project.SessionID}),
		MinStartTime: langsmith.F(time.Now().UTC().AddDate(0, -1, 0)),
	})
	if err != nil {
		panic(err.Error())
	}
	for _, run := range runs.Items {
		fmt.Println(run.ID)
	}
}
```

## 错误

* 如果工作区中没有任何内容匹配、代理已存档或者无法读取所选环境的跟踪，则LangSmith 返回`404`。一旦代理存在，代理的环境就存在。
* 在 BYOC 数据平面上，端点返回`501`，因为尚不支持解析。

## 另请参阅

* [Log traces to an agent](/langsmith/log-traces-to-agent)
* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/resolve-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。