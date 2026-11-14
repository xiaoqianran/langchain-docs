<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prioritize runs | https://docs.langchain.com/langsmith/run-priority -->

# 优先运行

为每个线程设置优先级，以便紧急运行首先启动。

运行优先级决定哪个等待运行首先启动，因此紧急工作（例如交互式聊天）会先于后台工作（例如计划作业）开始。

> [!注意]
>
> 运行优先级处于测试阶段，仅适用于 Python 图表。

## 为什么使用运行优先级

代理服务器部署可以为许多图提供服务，并且它们的所有运行共享一个队列和一个工作槽池。如果没有运行优先级，队列将先到先服务：后台运行的爆发使得交互式聊天在它们后面等待。

使用运行优先级，您可以为服务器上运行的 Python 函数中的每个线程设置优先级。当每个工作槽都忙时，具有最紧急优先级的等待运行接下来开始。已经有槽位的运行将保留它。

![The same waiting line under two rules, with every worker slot busy. With first come, first served, the chat run at priority -5 is at the back of the line and waits behind nine batch runs at priority 5. With run priority, the chat run moves to the front of the line and takes the next free slot.](https://mintcdn.com/langchain-5e9cc07a/wDaz8Qa0S1c7NKkF/langsmith/images/run-priority-waiting-line.png?fit=max\&auto=format\&n=wDaz8Qa0S1c7NKkF\&q=85\&s=b7409c81f72a4344aef99fd639e3f564)

## 配置运行优先级

### 步骤 0. 配置依赖项以支持运行优先级

运行优先级需要 Agent Server 0.18.0 或更高版本 (`langgraph-api>=0.18.0`) 和 `langgraph-sdk>=0.4.12`，这是新版本的默认设置。如果您自己构建镜像，请使用`langgraph-cli>=0.4.38`。早期版本忽略 `priority` 部分，不会出现错误。

### 步骤 1. 编写优先级函数在 `langgraph.json` 旁边创建 `priority.py`，并在 [Priority](https://reference.langchain.com/python/langgraph-sdk/priority/Priority) 实例上使用 `@priority.assign` 装饰异步函数：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk import Priority

priority = Priority()


@priority.assign
async def assign(ctx: Priority.types.PriorityContext):
    if ctx.cron_id is not None:
        return {"priority": 3}  # Scheduled jobs wait behind other runs
    if ctx.assistant_metadata.get("workload") == "chat":
        return {"priority": -3}  # Interactive chat starts first
    return None  # Every other run uses the default priority, 0
```

该函数接收带有以下字段的[PriorityContext](https://reference.langchain.com/python/langgraph-sdk/priority/types/PriorityContext)：

* **`user` 和 `permissions`**：经过身份验证的用户及其权限。对于 cron 启动的运行，该 cron 的所有者。
* **`thread_id` 和 `thread_metadata`**：线程及其元数据，包括运行添加的元数据。对于没有线程的运行，`thread_id` 是 `None`。
* **`assistant_id`、`graph_id` 和 `assistant_metadata`**：助手、其图表以及助手的元数据。
* **`run_metadata`**：运行的元数据。
* **`cron_id`**：开始运行的cron的ID，或`None`。

该函数返回一个 [PrioritySettings](https://reference.langchain.com/python/langgraph-sdk/priority/types/PrioritySettings) 字典，或 `None` 使用默认值：

* **`priority`**：-5 到 5 之间的整数。默认为 0。
* **`fairness_group`**：最多256个字符的字符串。默认为`"default"`。服务器将其存储在未加密的线程上，即使使用自定义加密也是如此，因此请使用不透明的 ID 而不是个人数据。这是一个计划的字段，以支持未来的公平性，但目前不影响运行顺序。

### 步骤 2. 将函数添加到`langgraph.json`

添加一个 `priority` 部分，其 `path` 指向 `Priority` 实例：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "priority": {
    "path": "./priority.py:priority"
  }
}
```

### 步骤 3. 重建和重新部署像平常一样对 [hosting environment](/langsmith/deployment#langsmith-deployment-environments) 进行重建和重新部署。

> [!注意]
>
> 在 LangSmith 云上，GCP 美国区域中的部署应用`priority` 部分。其他云区域中的部署尚未应用它。

## 最佳实践

* **在优先级之间留出空间**：从一些展开值开始，例如 -3 表示交互式工作，0 表示默认值，3 表示后台作业，因此您可以根据需求的变化在上方和下方添加优先级。
* **保持函数轻量级**：函数必须是异步的，并且在创建线程第一次运行之前在 API 服务器上运行。避免缓慢的调用，例如网络请求。阻塞调用（例如同步 HTTP 请求）会停止该服务器上的每个请求。
* **将优先级基于您控制的值**：没有 API 字段设置运行的优先级。如果您的函数读取调用者发送的元数据，则调用者可以影响结果，因此更喜欢您控制的经过身份验证的用户或助理元数据。

## 常见问题解答

### 运行优先级是如何工作的？优先级是 -5 到 5 之间的整数：-5 最先开始，5 最后开始，0 是默认值。当工作线程空闲时，具有最紧急优先级的等待运行将启动，并按照到期顺序以相同优先级开始运行。仅当每个工作槽都忙时，优先级才重要。当插槽空闲时，无论其优先级如何，都会立即开始运行。

您的优先级函数在线程第一次运行时设置一次线程的优先级，并且该线程上的每次运行都使用它。部署该函数后，已存在的线程将在下次运行时获得优先级，并且该函数的新版本仅适用于尚未运行的线程。优先级不会改变运行在线程上的执行方式：线程仍然一次运行一个运行，最早的运行在最前面，并且不会停止正在运行的运行。

计划稍后进行的跑步将在规定时间后按其优先顺序进行比赛。优先级不会老化，因此在更紧急的优先级持续负载的情况下，不太紧急的优先级运行可以无限期地等待。如果没有优先级功能，则每次运行的优先级为 0，并且运行按照与之前相同的顺序启动。

### 如果优先级功能失败会发生什么？如果函数引发异常或返回无效结果（例如未知键或 -5 到 5 之外的优先级），则服务器不会创建运行并返回 500 错误。要拒绝使用您自己的状态代码运行，请加注 [HTTPException](https://reference.langchain.com/python/langgraph-sdk/auth/exceptions/HTTPException)。在每种情况下都不会存储任何内容，因此线程的下一次运行会再次调用该函数。

### 如何验证运行优先级是否已开启？

* **服务器日志**：启动时，服务器记录`Loaded priority callback from path ...`。如果服务器无法加载该函数，则它不会启动，因此在部署时而不是每次运行时都会显示错误的路径。
* **线程**：线程第一次运行后，读取线程返回`run_priority`和`fairness_group`。

`langgraph dev` 调用您的优先级函数并存储结果，但按到达顺序开始运行。要查看运行按优先级顺序启动，请在部署上进行测试。

### 如何监控运行优先级？

配置优先级函数后，服务器会使用从 -5 到 5 的 `priority` 标签报告这些队列指标：

* `lg_api_num_startable_runs`：现在可以开始的运行：每个线程最早的到期运行，在没有正在运行的线程上。
* `lg_api_startable_runs_wait_time_max` 和 `lg_api_startable_runs_wait_time_med`：这些运行自到期以来的最长等待时间和中值等待时间（以秒为单位）。
* `lg_api_num_running_runs_by_priority`：正在运行的运行。不太紧急的优先级的等待时间增加表明运行在更紧急的优先级上等待持续负载。

### 如何关闭运行优先级？

从 `langgraph.json` 中删除 `priority` 部分，然后重建并重新部署。然后，每个新运行的优先级都是 0。已经在等待的运行保留它们创建时的优先级。线程保留其存储的优先级，如果您重新添加该函数，该优先级将再次适用。

## 另请参阅

* [Configuration file reference](/langsmith/cli#configuration-file)
* [⟦T41⟧ reference](https://reference.langchain.com/python/langgraph-sdk/priority/Priority)
* [Use threads](/langsmith/use-threads)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/run-priority.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。