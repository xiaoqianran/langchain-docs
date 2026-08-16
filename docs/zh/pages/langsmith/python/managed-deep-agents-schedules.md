<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add schedules to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-schedules -->

# 将计划添加到托管Deep Agents

托管 Deep Agents 可以按 cron 计划运行代理。当您部署项目时，`mda deploy` 在部署上线后将每个计划配置为 LangSmith cron。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

时间表声明位于项目级`schedules/`目录中，每个文件有一个时间表：

```text
my-agent/
  agent.py
  schedules/
    daily_digest.py
```




## 添加时间表

文件名成为托管计划名称。

调度模块必须定义一个命名的`schedule`声明。




```python schedules/daily_digest.py
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 8 * * 1-5",
    timezone="America/Los_Angeles",
    prompt="Write the daily digest.",
)
```




## 配置日程输入

每个计划必须准确定义以下之一：

- `prompt`：自然语言提示。当 cron 触发时，MDA 将其转换为用户消息。
- `input`：结构化LangGraph 输入对象。当您需要传递自定义图形输入而不是单个提示时，请使用此选项。

```python schedules/nightly_sweep.py
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="30 2 * * *",
    input={
        "messages": [
            {"role": "user", "content": "Sweep stale tickets and summarize changes."}
        ]
    },
)
```




`cron` 必须是标准的五字段 cron 表达式：分钟、小时、月份中的某一天、月份和星期几。如果省略 `timezone`，LangSmith crons 将使用 UTC。

## 选择线程行为

默认情况下，调度使用临时线程。 MDA 为每次运行创建一个新线程，并要求 LangSmith 在运行完成后删除该临时线程。仅当计划运行应在调用之间累积持久线程状态时，才使用持久线程。

<Note>
以下示例需要 [durable memory](/langsmith/python/managed-deep-agents-memory)。
</Note>

```python schedules/nightly_memory.py
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 3 * * *",
    prompt="Review the current project memory and list follow-up tasks.",
    thread={"mode": "persistent", "id": "nightly-memory"},
)
```




## 将结果发送到 Slack

设置 `deliver_to` 通过配置的 [Slack channel](/langsmith/python/managed-deep-agents-channels-slack) 发布最终响应。




使用 Slack 通道 ID，因为计划运行没有原始线程。

<Note>
安排交货需要`managed-deepagents>=0.4.0`。



</Note>

```python schedules/monday_greeting.py
from managed_deepagents import define_schedule

schedule = define_schedule(
    cron="0 9 * * 1",
    prompt="Write a short Monday greeting.",
    deliver_to={
        "channel": "slack",
        "to": {
            "type": "provider_conversation",
            "conversation_id": "C0123456789",
        },
    },
)
```




Slack 机器人必须有权访问目的地。

## 使用静态声明

时间表声明是在编译时提取的。保持调度配置静态可序列化：

- 使用文字、列表、字典和对顶级文字常量的引用。
- 不要读取环境变量、调用函数、使用`**kwargs`或动态计算调度值。




- 将动态行为改为在代理、工具、中间件或运行时上下文中。

## 部署计划

使用[⟦T15⟧](/langsmith/python/managed-deep-agents-cli#develop-locally)在本地测试项目，然后使用[⟦T16⟧](/langsmith/python/managed-deep-agents-deploy)进行部署。在LangSmith中打开部署跟踪以检查模型调用、工具调用、错误和延迟。当部署达到 `DEPLOYED` 时，`mda deploy` 在已部署的代理服务器上搜索现有 MDA 拥有的 cron 作业，删除它们，并为当前 `schedules/` 声明创建 cron 作业。删除本地计划文件并重新部署会删除相应的托管 cron。

<Warning>
如果您使用 `--no-wait` 进行部署，CLI 会在部署到达 `DEPLOYED` 之前触发远程构建并退出，因此它不会在该调用期间协调计划。添加、更改或删除计划时，运行 `mda deploy .`，而不运行 `--no-wait`。
</Warning>

## 日程安排疑难解答

- `must export a named schedule declaration`：在`schedules/`中的每个文件中定义一个顶级`schedule`。




- `must define exactly one of prompt or input`：添加 `prompt` 或 `input`，但不能同时添加两者。
- `cron must be a standard 5-field expression`：使用五个 cron 字段，而不是基于秒的 cron 语法。
- `schedule is not static`：用文字或顶级文字常量替换计算值。
- `failed to create cron for schedule`：打开LangSmith中的部署URL并确认部署的Agent Server是健康的。

## 后续步骤

<CardGroup cols={2}>
  <Card title="Deploy an agent" icon="upload" href="/langsmith/python/managed-deep-agents-deploy">
    部署并协调计划更改。
  </Card>
  <Card title="CLI reference" icon="terminal" href="/langsmith/python/managed-deep-agents-cli">
    查找 `mda deploy` 标志和故障排除。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-schedules.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>