<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Find an agent's project | https://docs.langchain.com/langsmith/resolve-an-agent -->

# 查找代理项目

通过将代理、实验或评估器解析为其项目 ID 来查找其跟踪项目，以便您可以查询其跟踪并使用采用项目 ID 的端点。

[Agents](/langsmith/agents)、[experiments](/langsmith/evaluation-concepts) 和 [evaluators](/langsmith/evaluators) 各自将其痕迹保留在 [tracing project](/langsmith/observability-concepts#tracing-projects) 中。读取或管理该数据的端点通过项目 ID 来识别该项目。 SDK 和 API 将跟踪项目称为“会话”，因此项目 ID 也是会话 ID。首先将代理解析为其项目 ID，然后在端点采用项目（会话）ID 的任何位置传递该 ID。例如：

* 使用`project_ids`查询运行、线程和跟踪
* 阅读或更新项目及其观点、见解和警报

<Note>
  解决代理问题位于[beta](/langsmith/release-stages)。它需要 LangSmith 0.18.7rc1 或更高版本，并且 BYOC 数据平面尚不支持。示例需要以下 SDK 版本：

  * **Python**：`langsmith>=0.14.9`
  * **打字稿**：`langsmith@>=0.10.13`
  * **Java**：`com.langchain.smith:langsmith-java` 0.1.0-beta.26 或更高版本
  * **Go**：`github.com/langchain-ai/langsmith-go` v0.28.0 或更高版本
</Note>

## 你可以解决什么问题

解决以下任一问题以获取其项目的 ID：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import langsmith as ls

    agent = ls.agent_address("checkout", "production")  # An agent's environment
    experiment = ls.experiment_address("<experiment-id>")  # An experiment
    evaluators = ls.evaluator_address()  # The workspace's evaluators
    ```
  </Tab>

  <Tab title="TypeScript">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { AgentAddress, EvaluatorAddress, ExperimentAddress } from "langsmith";

    const agent = new AgentAddress("checkout", "production"); // An agent's environment
    const experiment = new ExperimentAddress("<experiment-id>"); // An experiment
    const evaluators = new EvaluatorAddress(); // The workspace's evaluators
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import com.langchain.smith.address.AgentAddress;
    import com.langchain.smith.address.EvaluatorAddress;
    import com.langchain.smith.address.ExperimentAddress;

    AgentAddress agent = new AgentAddress("checkout", "production"); // An agent's environment
    ExperimentAddress experiment = new ExperimentAddress("<experiment-id>"); // An experiment
    EvaluatorAddress evaluators = new EvaluatorAddress(); // The workspace's evaluators
    ```
  </Tab>

  <Tab title="Go">
    ```go theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    // An agent's environment
    agent, err := langsmith.NewAgentAddress("checkout", "production")
    // An experiment
    experiment, err := langsmith.NewExperimentAddress("<experiment-id>")
    // The workspace's evaluators
    evaluators := langsmith.NewEvaluatorAddress()
    ```
  </Tab>
</Tabs>## 解析代理并查询其运行

<Tabs>
  <Tab title="Python">
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
  </Tab>

  <Tab title="TypeScript">
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
  </Tab>

  <Tab title="Java">
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
  </Tab>

  <Tab title="Go">
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
  </Tab>
</Tabs>

## 解决一个实验并查询其运行

传递实验 ID。实验是其自己的跟踪项目，因此端点返回实验的 ID。

<Tabs>
  <Tab title="Python">
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
  </Tab>

  <Tab title="TypeScript">
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
  </Tab>

  <Tab title="Java">
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
  </Tab>

  <Tab title="Go">
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
  </Tab>
</Tabs>

## 解析评估者并查询他们的运行

评估器跟踪每个工作区共享一个项目，因此评估器不获取 ID。

<Tabs>
  <Tab title="Python">
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
  </Tab>

  <Tab title="TypeScript">
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
  </Tab>

  <Tab title="Java">
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
  </Tab>

  <Tab title="Go">
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
  </Tab>
</Tabs>

## 错误

* 如果工作区中没有任何内容匹配、代理已存档或者您无法读取其项目，则LangSmith 返回`404`。一旦代理存在，代理的环境就存在。
* 在 BYOC 数据平面上，端点返回`501`，因为尚不支持解析。

## 另请参阅

* [Log traces to an agent](/langsmith/log-traces-to-agent)
* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/resolve-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>