<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure Agent Server for scale | https://docs.langchain.com/langsmith/agent-server-scale -->

# 配置代理服务器以实现规模

LangSmith 代理服务器的默认配置旨在处理各种不同工作负载的大量读写负载。通过遵循下面列出的最佳实践，您可以调整代理服务器以针对您的特定工作负载实现最佳性能。本页介绍自承载部署中代理服务器的扩展注意事项并提供示例配置。

<Tip>
如果您还不熟悉 API 服务器和队列工作线程在容器级别的操作方式，请先阅读 [runtime architecture](/langsmith/agent-server#runtime-architecture) 概述。
</Tip>

对于 [Cloud](/langsmith/cloud-platform-features#scaling)，平台会自动缩放，并且以下 Helm 配置不适用。

## 请求与运行并发

两种独立的并发决定了代理服务器的扩展方式，并且它们是单独控制的：- **请求并发** 是部署一次服务的 API 请求数（创建运行、读取线程状态、流结果）。 API 服务器异步处理请求，请求并发量随着 API 服务器副本的数量水平扩展。
- **运行并发**是一次执行的运行数量。单个队列工作线程最多可并发运行 [⟦T12⟧](/langsmith/env-var-self-hosted)（默认 10）。运行并发上限为队列工作线程数乘以`N_JOBS_PER_WORKER`。

创建运行是一个快速写入请求：API 服务器会保留待处理的运行并立即返回，而无需等待运行执行。如果每个运行槽都很忙，则额外的运行将在 [queue](/langsmith/agent-server#run-execution-lifecycle) 中等待，直到槽空闲。提高 `N_JOBS_PER_WORKER` 或添加队列工作线程会增加运行吞吐量；它不会改变部署可以同时服务的请求数量。

## 写入负载

写入负载主要由以下因素驱动：

- 创建新的[runs](/langsmith/background-run)
- 在运行执行期间创建新的检查点
- 写入长期记忆
- 创建新的[threads](/langsmith/use-threads)
- 创建新的[assistants](/langsmith/assistants)
- 删除运行、检查点、线程、助手和 cron 作业以下组件主要负责处理写入负载：

- API 服务器：处理数据库的初始请求和数据持久化。
- 队列工作者：处理运行的执行。
- Redis：处理有关正在进行的运行的临时数据的存储。
- Postgres：处理所有数据的存储，包括运行、线程、助手、cron 作业、检查点和长期内存。

### 根据助手特性调整`N_JOBS_PER_WORKER`

[⟦T16⟧](/langsmith/env-var-self-hosted)的默认值为10。您可以根据助手的特性更改此值以缩放单个队列工作人员一次可以执行的最大运行次数。

更改`N_JOBS_PER_WORKER`的一些一般准则：

- 如果您的助手受 CPU 限制，则默认值 10 可能就足够了。如果您发现队列工作线程的 CPU 使用率过高或运行执行延迟，您可能会降低 `N_JOBS_PER_WORKER`。
- 如果您的助手内存有限，或者队列工作人员接近内存限制，请降低 `N_JOBS_PER_WORKER` 以减少每个工作人员的并发运行数。
- 如果您的助手受 IO 限制，请增加 `N_JOBS_PER_WORKER` 以处理每个工作线程更多的并发运行。`N_JOBS_PER_WORKER`没有上限。然而，队列工作人员在获取新的运行时是贪婪的，这意味着它们将尝试获取尽可能多的可用作业并立即开始执行它们。在具有突发流量的环境中将`N_JOBS_PER_WORKER`设置得太高可能会导致工作线程利用率不均匀、运行执行时间增加以及队列工作线程的内存使用率较高。

### 避免同步阻塞操作

避免在代码中进行同步阻塞操作，而更喜欢异步操作。长时间的同步操作可能会阻塞主事件循环，从而导致更长的请求和运行执行时间以及潜在的超时。

例如，考虑一个需要休眠 1 秒的应用程序。而不是使用这样的同步代码：

```python
import time

def my_function():
    time.sleep(1)
```

更喜欢这样的异步代码：

```python
import asyncio

async def my_function():
    await asyncio.sleep(1)
```

如果助手需要同步阻塞操作，请在`asyncio.to_thread()`或等效中运行这些操作。

### 最小化冗余检查点

通过将 [⟦T24⟧](/oss/python/langgraph/checkpointers#durability-modes) 设置为确保数据持久所需的最小值，最大限度地减少冗余检查点。默认的持久性模式是`"async"`，这意味着检查点是在每个步骤之后异步写入的。如果助手只需要保存运行的最终状态，可以将`durability`设置为`"exit"`，仅存储运行的最终状态。这可以在创建运行时设置：

```python
from langgraph_sdk import get_client

client = get_client(url=<DEPLOYMENT_URL>)
thread = await client.threads.create()
run = await client.runs.create(
    thread_id=thread["thread_id"],
    assistant_id="agent",
    durability="exit"
)
```

### 启用队列工作者

默认情况下，API 服务器管理队列并且不使用队列工作线程。通过将 `queue.enabled` 设置为 `true` 来启用队列工作线程：

```yaml
queue:
  enabled: true
```

这将队列管理从 API 服务器卸载到专用队列工作人员，从而减少 API 服务器上的负载并使其能够专注于处理请求。

### 根据预期吞吐量调整作业大小

此部分确定运行执行容量（队列工作线程）的大小，该容量与请求服务容量（API 服务器副本）分开。欲了解更多信息，请参阅[Request vs. run concurrency](#request-vs-run-concurrency)。

并行执行的运行越多，处理负载所需的作业就越多。有两个主要参数可用于扩展可用作业：

- `number_of_queue_workers`：配置的队列工作人员数量。
- `N_JOBS_PER_WORKER`：单个队列工作线程一次可以执行的运行次数。默认为 10。

您可以使用以下等式计算可用的职位：

```
available_jobs = number_of_queue_workers * N_JOBS_PER_WORKER
```吞吐量是可用作业每秒可以执行的运行次数：

```
throughput_per_second = available_jobs / average_run_execution_time_seconds
```

因此，为支持预期的稳态吞吐量而应配置的队列工作线程的最小数量为：

```
number_of_queue_workers = throughput_per_second * average_run_execution_time_seconds / N_JOBS_PER_WORKER
```

### 为突发写入工作负载配置自动缩放

默认情况下禁用自动缩放，但应针对突发工作负载进行配置。使用与上一节相同的计算，您可以根据最大预期吞吐量确定应允许自动缩放器缩放的队列工作线程的最大数量。

## 读取负载

读取负载主要由以下因素驱动：

- 获取[run](/langsmith/background-run)的结果
- 获取[thread](/langsmith/use-threads)的状态
- 搜索[runs](/langsmith/background-run)、[threads](/langsmith/use-threads)、[cron jobs](/langsmith/cron-jobs) 和 [assistants](/langsmith/assistants)
- 检索检查点和长期记忆

以下组件主要负责处理读取负载：

- API 服务器：处理请求并直接从数据库检索数据。
- Postgres：处理所有数据的存储，包括运行、线程、助手、cron 作业、检查点和长期内存。
- Redis：处理有关正在进行的运行的临时数据的存储，包括从队列工作人员到 API 服务器的流式消息。### 使用过滤来减少每个请求的结果

[Agent Server](/langsmith/agent-server) 为每种资源类型提供搜索API。这些 API 默认实现分页并提供许多过滤选项。使用过滤来减少每个请求返回的资源数量并提高性能。

### 设置 TTL 以自动删除旧数据

设置[TTL on threads](/langsmith/configure-ttl)自动清理旧数据。当关联的线程被删除时，运行和检查点会自动删除。

### 避免轮询；使用 `/join` 监控运行

避免使用 `/join` API 端点轮询运行状态。运行完成后，此方法将返回运行的最终状态。

如果您需要实时监控运行的输出，请使用 `/stream` API 端点。此方法流式传输运行输出，包括运行的最终状态。

### 为突发读取工作负载配置自动缩放

默认情况下禁用自动缩放，但应针对突发工作负载进行配置。根据最大预期吞吐量确定应允许自动缩放程序扩展的 API 服务器的最大数量。

## 配置示例<Note>
确切的最佳配置取决于您的应用程序复杂性、请求模式和数据要求。将以下示例与前面部分中的信息以及您的具体用法结合使用，根据需要更新您的部署配置。如果您有任何疑问，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。
</Note>

下表提供了针对各种负载模式（每秒读取请求/每秒写入请求）和标准助手特征（平均运行执行时间为 1 秒、中等 CPU 和内存使用）的不同代理服务器配置的比较概览。请求速率驱动所需的稳态运行吞吐量，该吞吐量通过队列工作线程和 `N_JOBS_PER_WORKER` 调整大小，而 API 服务器副本的大小则根据请求量本身进行调整：|  | **[Low / low](#low-reads-low-writes)** | **[Low / high](#low-reads-high-writes)** | **[High / low](#high-reads-low-writes)** | [Medium / medium](#medium-reads-medium-writes) | [High / high](#high-reads-high-writes) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <Tooltip tip="Number of write requests being processed by the deployment per second">每秒写入请求数</Tooltip> | 5 | 5 | 500 | 500 50 | 50 500 | 500
| <Tooltip tip="Number of read requests being processed by the deployment per second">每秒读取请求数</Tooltip> | 5 | 500 | 500 5 | 50 | 50 500 | 500
| **API 服务器**<br />（1 个 CPU，每台服务器 2Gi）| 1（默认）| 6 | 10 | 10 3 | 15 | 15
| **队列工作人员**<br />（1 个 CPU，每个工作人员 2Gi）| 1（默认）| 10 | 10 1（默认）| 5 | 10 | 10
| **`N_JOBS_PER_WORKER`** | 10（默认）| 50 | 50 10 | 10 10 | 10 50 | 50
| **Redis 资源** | 2 Gi（默认）| 2 Gi（默认）| 2 Gi（默认）| 2 Gi（默认）| 2 Gi（默认）|
| **Postgres 资源** | 2 CPU<br />8 Gi（默认）| 4 CPU<br />16 Gi 内存 | 4 CPU<br />16 Gi | 4 CPU<br />16 Gi 内存 | 8 CPU<br />32 Gi 内存 |

示例中的负载级别定义为：

- 低意味着每秒大约 5 个请求
- 中意味着每秒大约 50 个请求
- 高意味着每秒大约 500 个请求

### 低读取，低写入

默认的 [LangSmith Deployment](/langsmith/deployment) 配置将处理此负载。这里不需要自定义资源配置。

### 低读取，高写入您的部署正在处理大量写入请求（每秒 500 个），但读取请求相对较少（每秒 5 个）。

为此，我们推荐这样的配置：

```yaml
# Example configuration for low reads, high writes (5 read/500 write requests per second)
api:
  replicas: 6
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

queue:
  replicas: 10
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

config:
  numberOfJobsPerWorker: 50

redis:
  resources:
    requests:
      memory: "2Gi"
    limits:
      memory: "2Gi"

postgres:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "8"
      memory: "32Gi"
```

### 高读取，低写入

您的读取请求量很大（每秒 500 个），但写入请求相对较少（每秒 5 个）。

为此，我们推荐这样的配置：

```yaml
# Example configuration for high reads, low writes (500 read/5 write requests per second)
api:
  replicas: 10
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

queue:
  replicas: 1  # Default, minimal write load
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

redis:
  resources:
    requests:
      memory: "2Gi"
    limits:
      memory: "2Gi"

postgres:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "8"
      memory: "32Gi"
  # Consider read replicas for high read scenarios
  readReplicas: 2
```

### 中等读取，中等写入

这是一个平衡配置，应处理中等读取和写入负载（每秒 50 个读取/50 个写入请求）。

为此，我们推荐这样的配置：

```yaml
# Example configuration for medium reads, medium writes (50 read/50 write requests per second)
api:
  replicas: 3
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

queue:
  replicas: 5
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

redis:
  resources:
    requests:
      memory: "2Gi"
    limits:
      memory: "2Gi"

postgres:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "8"
      memory: "32Gi"
```

### 高读取，高写入

您有大量的读取和写入请求（每秒 500 个读取/500 个写入请求）。

为此，我们推荐这样的配置：

```yaml
# Example configuration for high reads, high writes (500 read/500 write requests per second)
api:
  replicas: 15
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

queue:
  replicas: 10
  resources:
    requests:
      cpu: "1"
      memory: "2Gi"
    limits:
      cpu: "2"
      memory: "4Gi"

config:
  numberOfJobsPerWorker: 50

redis:
  resources:
    requests:
      memory: "2Gi"
    limits:
      memory: "2Gi"

postgres:
  resources:
    requests:
      cpu: "8"
      memory: "32Gi"
    limits:
      cpu: "16"
      memory: "64Gi"
```

### 自动缩放

如果您的部署遇到突发流量，您可以启用自动扩展来扩展 API 服务器和队列工作线程的数量来处理负载。

以下是针对高读取和高写入的自动缩放的示例配置：

```yaml
api:
  autoscaling:
    enabled: true
    minReplicas: 15
    maxReplicas: 25

queue:
  autoscaling:
    enabled: true
    minReplicas: 10
    maxReplicas: 20
```<Note>
确保您的部署环境有足够的资源来扩展到建议的大小。监控您的应用程序和基础设施以确保最佳性能。考虑实施监控和警报来跟踪资源使用情况和应用程序性能。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-server-scale.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>