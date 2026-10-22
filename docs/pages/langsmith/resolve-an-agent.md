<!-- langchain-docs: Find an agent's project | https://docs.langchain.com/langsmith/resolve-an-agent -->

# Find an agent's project

Find the tracing project of an agent, experiment, or evaluator by resolving it to its project ID, so you can query its traces and use endpoints that take a project ID.

[Agents](/langsmith/agents), [experiments](/langsmith/evaluation-concepts), and [evaluators](/langsmith/evaluators) each keep their traces in a [tracing project](/langsmith/observability-concepts#tracing-projects). Endpoints that read or manage that data identify the project by its ID. The SDKs and API call a tracing project a *session*, so a project ID is also a session ID. Resolve an agent to its project ID first, then pass the ID wherever an endpoint takes a project (session) ID. For example:

* Querying runs, threads, and traces with `project_ids`
* Reading or updating the project, and its views, insights, and alerts

> [!NOTE]
>
> Resolving an agent needs LangSmith 0.18.7rc1 or later, and is not supported on BYOC data planes yet. The examples need the following SDK versions:
>
> * **Python**: `langsmith>=0.14.9`
> * **TypeScript**: `langsmith@>=0.10.13`
> * **Java**: `com.langchain.smith:langsmith-java` 0.1.0-beta.26 or later
> * **Go**: `github.com/langchain-ai/langsmith-go` v0.28.0 or later

## What you can resolve

Resolve any of the following to get the ID of its project:

**Python**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith as ls

agent = ls.agent_address("checkout", "production")  # An agent's environment
experiment = ls.experiment_address("<experiment-id>")  # An experiment
evaluators = ls.evaluator_address()  # The workspace's evaluators
```

**TypeScript**

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

**Go**

```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// An agent's environment
agent, err := langsmith.NewAgentAddress("checkout", "production")
// An experiment
experiment, err := langsmith.NewExperimentAddress("<experiment-id>")
// The workspace's evaluators
evaluators := langsmith.NewEvaluatorAddress()
```

## Resolve an agent and query its runs

**Python**

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

**TypeScript**

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

**Go**

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

## Resolve an experiment and query its runs

Pass the ID of the experiment. An experiment is its own tracing project, so the endpoint returns the experiment's ID.

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

**TypeScript**

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

**Go**

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

## Resolve the evaluators and query their runs

Evaluator traces share one project per workspace, so the evaluators take no ID.

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

**TypeScript**

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

**Go**

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

## Errors

* LangSmith returns a `404` if nothing in the workspace matches, if the agent is archived, or if you cannot read its project. An agent's environments exist once the agent exists.
* On a BYOC data plane, the endpoint returns a `501`, because resolving is not supported there yet.

## See also

* [Log traces to an agent](/langsmith/log-traces-to-agent)
* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/resolve-an-agent.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).