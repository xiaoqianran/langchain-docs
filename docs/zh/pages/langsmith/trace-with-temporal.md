<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace with Temporal | https://docs.langchain.com/langsmith/trace-with-temporal -->

# 时间追踪

[Temporal](https://temporal.io/)是一个持久的执行平台，使开发人员能够构建弹性分布式应用程序。本指南向您展示如何使用 OpenTelemetry 跟踪 LangSmith 中的临时工作流程和活动。

LangSmith 支持 OpenTelemetry (OTEL) 跟踪摄取，它与 Temporal 的本机 OpenTelemetry 拦截器无缝集成。这可以实现跨工作流程执行、活动以及其中的任何 LLM 调用的完整分布式跟踪。

## 先决条件

- [LangSmith account](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-with-temporal) 和 API 密钥
- 运行的临时服务器（本地或云）
- 适用于您的语言的 OpenTelemetry SDK

## 环境变量

为所有实现设置以下环境变量：

|变量|必填|描述 |
| ------------------- | -------- | ------------------------------------------------ |
| `LANGSMITH_API_KEY` |是的 |您在“设置”中的 LangSmith API 密钥。            |
| `LANGSMITH_PROJECT` |没有 |项目名称（默认为`"default"`）。          |

<Note>
对于区域 SaaS 或自托管 LangSmith 安装，还将 `LANGCHAIN_BASE_URL` 设置为您的 LangSmith 实例 URL。
</Note>

## 设置跟踪

<Tabs>
<Tab title="Go" icon="brand-golang">Go 使用 `langsmith-go` SDK 和 Temporal 的 OpenTelemetry 拦截器来自动跟踪工作流程和活动。

<Steps>
<Step title="Install">

安装 LangSmith Go SDK、Temporal SDK 和 OpenTelemetry 拦截器：

```bash
go get github.com/langchain-ai/langsmith-go@v0.1.0-alpha.7
go get go.temporal.io/sdk
go get go.temporal.io/sdk/contrib/opentelemetry
```

</Step>
<Step title="Initialize tracer">

初始化 LangSmith 跟踪器，创建 Temporal 的 OpenTelemetry 拦截器，并将其注册到 Temporal 客户端和工作线程：

```go
package main

import (
	"context"
	"log"

	"github.com/langchain-ai/langsmith-go"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/contrib/opentelemetry"
	"go.temporal.io/sdk/interceptor"
	"go.temporal.io/sdk/worker"
)

func main() {
	ctx := context.Background()

	// Initialize LangSmith tracer (reads LANGSMITH_API_KEY and LANGSMITH_PROJECT)
	ls, err := langsmith.NewTracer(
		langsmith.WithServiceName("temporal-worker"),
	)
	if err != nil {
		log.Fatal("Failed to initialize LangSmith tracer:", err)
	}
	defer ls.Shutdown(ctx)

	// Create Temporal tracing interceptor
	tracer := ls.Tracer("temporal-app")
	tracingInterceptor, err := opentelemetry.NewTracingInterceptor(
		opentelemetry.TracerOptions{Tracer: tracer},
	)
	if err != nil {
		log.Fatal("Failed to create tracing interceptor:", err)
	}

	// Create Temporal client with tracing
	c, err := client.Dial(client.Options{
		Interceptors: []interceptor.ClientInterceptor{tracingInterceptor},
	})
	if err != nil {
		log.Fatal("Failed to create Temporal client:", err)
	}
	defer c.Close()

	// Create worker with tracing (uses same client)
	w := worker.New(c, "my-task-queue", worker.Options{})
	w.RegisterWorkflow(MyWorkflow)
	w.RegisterActivity(MyActivity)

	// Start worker
	if err := w.Run(worker.InterruptCh()); err != nil {
		log.Fatal("Worker failed:", err)
	}
}
```

</Step>
<Step title="Define workflow and activity">

定义执行活动的工作流。该活动演示了如何添加自定义跨度属性以实现 LangSmith 可见性：

```go
package main

import (
	"context"
	"fmt"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
)

// MyWorkflow executes an activity
func MyWorkflow(ctx workflow.Context, input string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result string
	err := workflow.ExecuteActivity(ctx, MyActivity, input).Get(ctx, &result)
	return result, err
}

// MyActivity processes input with custom span attributes
func MyActivity(ctx context.Context, input string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Processing", "input", input)

	// Get the span created by Temporal's interceptor
	span := trace.SpanFromContext(ctx)

	// Add Gen AI attributes for LangSmith visibility
	span.SetAttributes(
		attribute.String("gen_ai.prompt", input),
		attribute.String("gen_ai.operation.name", "chat"),
	)

	result := fmt.Sprintf("Processed: %s", input)

	// Set completion attribute
	span.SetAttributes(
		attribute.String("gen_ai.completion", result),
	)

	return result, nil
}
```

</Step>
<Step title="Execute workflow">

在单独的客户端应用程序中，初始化跟踪器并执行工作流程：

```go client.go
// In a separate function or client application
func executeWorkflow() {
	ctx := context.Background()

	// Initialize tracer for client
	ls, err := langsmith.NewTracer(
		langsmith.WithServiceName("temporal-client"),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer ls.Shutdown(ctx)

	// Create client with tracing
	tracer := ls.Tracer("temporal-app")
	tracingInterceptor, err := opentelemetry.NewTracingInterceptor(
		opentelemetry.TracerOptions{Tracer: tracer},
	)
	if err != nil {
		log.Fatal(err)
	}

	c, err := client.Dial(client.Options{
		Interceptors: []interceptor.ClientInterceptor{tracingInterceptor},
	})
	if err != nil {
		log.Fatal(err)
	}
	defer c.Close()

	// Execute workflow
	workflowOptions := client.StartWorkflowOptions{
		ID:        "my-workflow-1",
		TaskQueue: "my-task-queue",
	}

	we, err := c.ExecuteWorkflow(ctx, workflowOptions, MyWorkflow, "Hello World")
	if err != nil {
		log.Fatal(err)
	}

	var result string
	if err := we.Get(ctx, &result); err != nil {
		log.Fatal(err)
	}

	log.Printf("Workflow result: %s", result)
}
```

</Step>
</Steps>

</Tab>
<Tab title="Python" icon="brand-python">

Python 使用带有 OpenTelemetry 拦截器的 `temporalio` SDK，通过 OTLP 将跟踪导出到 LangSmith。

<Steps>
<Step title="Install">

安装 Temporal SDK、LangSmith SDK 和 OpenTelemetry 包：

```bash
pip install temporalio
pip install langsmith
pip install opentelemetry-sdk
pip install opentelemetry-exporter-otlp-proto-http
```

</Step>
<Step title="Initialize tracer">

创建一个 OpenTelemetry `TracerProvider`，并将 OTLP 导出器配置为将跟踪发送到 LangSmith：

```python
import asyncio
import os
from datetime import timedelta

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from temporalio import activity, workflow
from temporalio.client import Client
from temporalio.contrib.opentelemetry import TracingInterceptor
from temporalio.worker import Worker


def init_tracer_provider() -> TracerProvider:
    """Initialize OpenTelemetry with LangSmith exporter."""

    # Create OTLP exporter for LangSmith
    exporter = OTLPSpanExporter(
        endpoint="https://api.smith.langchain.com/otel/v1/traces",
        headers={
            "x-api-key": os.environ.get("LANGSMITH_API_KEY", ""),
            "Langsmith-Project": os.environ.get("LANGSMITH_PROJECT", "default"),
        },
    )

    # Create TracerProvider with resource attributes
    resource = Resource.create({
        SERVICE_NAME: "temporal-worker",
    })

    provider = TracerProvider(resource=resource)
    provider.add_span_processor(BatchSpanProcessor(exporter))

    # Set as global provider
    trace.set_tracer_provider(provider)

    return provider
```

</Step>
<Step title="Define workflow and activity">

定义工作流类和活动函数。该活动演示了如何添加自定义跨度属性以实现 LangSmith 可见性：

```python
@activity.defn
async def process_activity(input: str) -> str:
    """Activity that processes input with custom span attributes."""
    activity.logger.info(f"Processing: {input}")

    # Get current span and add Gen AI attributes
    span = trace.get_current_span()
    span.set_attribute("gen_ai.prompt", input)
    span.set_attribute("gen_ai.operation.name", "chat")

    result = f"Processed: {input}"

    span.set_attribute("gen_ai.completion", result)

    return result


@workflow.defn
class MyWorkflow:
    @workflow.run
    async def run(self, input: str) -> str:
        return await workflow.execute_activity(
            process_activity,
            input,
            start_to_close_timeout=timedelta(seconds=10),
        )
```

</Step>
<Step title="Run worker">

使用 `TracingInterceptor` 创建一个 Temporal 客户端并启动工作线程：

```python
async def main():
    # Initialize tracing
    provider = init_tracer_provider()

    try:
        # Create Temporal client with tracing interceptor
        client = await Client.connect(
            "localhost:7233",
            interceptors=[TracingInterceptor()],
        )

        # Run worker
        worker = Worker(
            client,
            task_queue="my-task-queue",
            workflows=[MyWorkflow],
            activities=[process_activity],
        )

        print("Starting worker...")
        await worker.run()

    finally:
        # Shutdown tracer provider to flush traces
        provider.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
```

</Step>
<Step title="Execute workflow">在单独的脚本中，使用跟踪拦截器连接到 Temporal 并执行工作流程：

```python client.py
import asyncio
from temporalio.client import Client
from temporalio.contrib.opentelemetry import TracingInterceptor

# Import the same tracer setup
from worker import init_tracer_provider


async def main():
    provider = init_tracer_provider()

    try:
        client = await Client.connect(
            "localhost:7233",
            interceptors=[TracingInterceptor()],
        )

        # Execute workflow
        result = await client.execute_workflow(
            MyWorkflow.run,
            "Hello World",
            id="my-workflow-1",
            task_queue="my-task-queue",
        )
        print(f"Workflow result: {result}")

    finally:
        provider.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
```

</Step>
</Steps>

</Tab>
<Tab title="TypeScript / JavaScript" icon="brand-javascript">

TypeScript 使用 `@temporalio/sdk` 和 OpenTelemetry 拦截器将跟踪发送到 LangSmith。

<Steps>
<Step title="Install">

安装 Temporal SDK、OpenTelemetry 拦截器和跟踪包：

```bash
npm install @temporalio/client @temporalio/worker @temporalio/activity @temporalio/workflow
npm install @temporalio/interceptors-opentelemetry
npm install @opentelemetry/sdk-node @opentelemetry/sdk-trace-node
npm install @opentelemetry/exporter-trace-otlp-http
npm install @opentelemetry/resources @opentelemetry/semantic-conventions
```

</Step>
<Step title="Initialize tracer">

创建一个 `NodeTracerProvider`，并将 OTLP 导出器配置为将跟踪发送到 LangSmith：

```typescript tracer.ts
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export function initTracerProvider(): NodeTracerProvider {
  // Create OTLP exporter for LangSmith
  const exporter = new OTLPTraceExporter({
    url: 'https://api.smith.langchain.com/otel/v1/traces',
    headers: {
      'x-api-key': process.env.LANGSMITH_API_KEY || '',
      'Langsmith-Project': process.env.LANGSMITH_PROJECT || 'default',
    },
  });

  // Create TracerProvider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'temporal-worker',
    }),
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  return provider;
}
```

</Step>
<Step title="Define workflow">

定义一个使用超时配置代理活动的工作流：

```typescript workflows.ts
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const { processActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

export async function myWorkflow(input: string): Promise<string> {
  return await processActivity(input);
}
```

</Step>
<Step title="Define activity">

定义一个活动，演示如何为 LangSmith 可见性添加自定义跨度属性：

```typescript activities.ts
import { log } from '@temporalio/activity';
import { trace } from '@opentelemetry/api';

export async function processActivity(input: string): Promise<string> {
  log.info('Processing', { input });

  // Get current span and add Gen AI attributes
  const span = trace.getActiveSpan();
  span?.setAttribute('gen_ai.prompt', input);
  span?.setAttribute('gen_ai.operation.name', 'chat');

  const result = `Processed: ${input}`;

  span?.setAttribute('gen_ai.completion', result);

  return result;
}
```

</Step>
<Step title="Run worker">

使用用于活动的 OpenTelemetry 拦截器和用于工作流跨度的工作流导出器创建工作人员：

```typescript worker.ts
import { Worker, NativeConnection } from '@temporalio/worker';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  makeWorkflowExporter,
  OpenTelemetryActivityInboundInterceptor,
} from '@temporalio/interceptors-opentelemetry';
import { trace } from '@opentelemetry/api';

import * as activities from './activities';
import { initTracerProvider } from './tracer';

async function run() {
  const provider = initTracerProvider();

  try {
    const connection = await NativeConnection.connect({
      address: 'localhost:7233',
    });

    const worker = await Worker.create({
      connection,
      namespace: 'default',
      taskQueue: 'my-task-queue',
      workflowsPath: require.resolve('./workflows'),
      activities,
      sinks: {
        exporter: makeWorkflowExporter(
          trace.getTracer('temporal-app'),
          new Resource({ [ATTR_SERVICE_NAME]: 'temporal-worker' })
        ),
      },
      interceptors: {
        activity: [() => ({ inbound: new OpenTelemetryActivityInboundInterceptor() })],
      },
    });

    console.log('Starting worker...');
    await worker.run();
  } finally {
    await provider.shutdown();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

</Step>
<Step title="Execute workflow">

在单独的客户端文件中，连接到 Temporal 并执行工作流程：

```typescript client.ts
import { Client, Connection } from '@temporalio/client';
import { initTracerProvider } from './tracer';

async function run() {
  // Initialize tracing
  const provider = initTracerProvider();

  try {
    const connection = await Connection.connect({ address: 'localhost:7233' });
    const client = new Client({ connection });

    const result = await client.workflow.execute('myWorkflow', {
      taskQueue: 'my-task-queue',
      workflowId: 'my-workflow-1',
      args: ['Hello World'],
    });

    console.log('Workflow result:', result);
  } finally {
    await provider.shutdown();
  }
}

run().catch(console.error);
```

</Step>
</Steps>

</Tab>
</Tabs>

## 查看LangSmith中的踪迹

配置完成后，跟踪将出现在您的 LangSmith 项目中：

1. 导航到您的 LangSmith 实例。
2. 选择您的项目。
3. 在 **Tracing** 选项卡中查看跟踪。
4. 单击各个迹线以查看完整跨度层次结构。

## 配置选项

### 设置自定义服务名称设置自定义服务名称以区分不同的 Temporal Worker 或服务：

<CodeGroup>

```go Go
ls, err := langsmith.NewTracer(
    langsmith.WithServiceName("my-temporal-worker"),
)
```

```python Python
resource = Resource.create({
    SERVICE_NAME: "my-temporal-worker",
})
```

```typescript TypeScript
const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'my-temporal-worker',
  }),
});
```

</CodeGroup>

### 添加自定义跨度属性

添加自定义属性以丰富您的踪迹：

<CodeGroup>

```go Go
import "go.opentelemetry.io/otel/attribute"

span := trace.SpanFromContext(ctx)
span.SetAttributes(
    attribute.String("user.id", userID),
    attribute.String("workflow.version", "v2"),
)
```

```python Python
from opentelemetry import trace

span = trace.get_current_span()
span.set_attribute("user.id", user_id)
span.set_attribute("workflow.version", "v2")
```

```typescript TypeScript
import { trace } from '@opentelemetry/api';

const span = trace.getActiveSpan();
span?.setAttribute('user.id', userId);
span?.setAttribute('workflow.version', 'v2');
```
</CodeGroup>

### 配置采样

对于大容量工作流程，配置采样以减少跟踪量：

<CodeGroup>

```go Go
// Note: langsmith.NewTracer() uses default sampling
// For custom sampling, use the TracerProvider directly
tp := sdktrace.NewTracerProvider(
    sdktrace.WithBatcher(exporter),
    sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.1)), // 10% sampling
)
```

```python Python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

provider = TracerProvider(
    resource=resource,
    sampler=TraceIdRatioBased(0.1),  # 10% sampling
)
```

```typescript TypeScript
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const provider = new NodeTracerProvider({
  resource: resource,
  sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
});
```
</CodeGroup>

## 故障排除

### 痕迹未出现

1. **验证API密钥**：确保`LANGSMITH_API_KEY`设置正确
2. **检查端点**：确认您正在使用`https://api.smith.langchain.com/otel/v1/traces`
3. **关闭时刷新**：在应用程序退出之前调用`provider.shutdown()`刷新挂起的跨度
4. **检查项目**：验证跟踪是否发送到正确的项目（默认为`"default"`）

### 缺少活动跨度

确保在客户端和工作线程上都配置了跟踪拦截器：
- **客户端**：需要拦截器来启动工作流程
- **Worker**：需要拦截器来执行活动

### 上下文传播问题

验证传播器配置正确：
- **Go**：`langsmith.NewTracer()` 自动配置传播器
- **Python/TypeScript**：确保使用跟踪传播器正确初始化 OpenTelemetry SDK

### 工作线程关闭挂起如果跟踪未刷新，请确保您以适当的超时调用 shutdown 方法：

<CodeGroup>

```go Go
defer ls.Shutdown(context.Background())
```

```python Python
finally:
    provider.shutdown()
```

```typescript TypeScript
finally {
  await provider.shutdown();
}
```
</CodeGroup>

## 后续步骤

- [Learn about LangSmith tracing concepts](/langsmith/observability-concepts)
- [Explore OpenTelemetry semantic conventions](/langsmith/trace-with-opentelemetry#supported-opentelemetry-attribute-and-event-mapping)

## 其他资源

- [Temporal Documentation](https://docs.temporal.io/)
- [Temporal Go SDK](https://github.com/temporalio/sdk-go)
- [Temporal Python SDK](https://github.com/temporalio/sdk-python)
- [Temporal TypeScript SDK](https://github.com/temporalio/sdk-typescript)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [LangSmith Go SDK](https://github.com/langchain-ai/langsmith-go)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-temporal.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>