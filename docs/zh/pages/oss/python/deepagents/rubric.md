<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Grading rubrics | https://docs.langchain.com/oss/python/deepagents/rubric -->

# 评分标准

法学硕士作为法官对代理人进行评分，不断迭代直至完成

<Note>
  `RubricMiddleware` 需要 `deepagents>=0.6.5`。位于[**beta**](/oss/python/versioning)； API 将来可能会发生变化。
</Note>

一些代理任务有一个明确的“完成”定义，仅靠工作模型无法在第一次尝试中可靠地实现：正确音节模式的俳句、所有测试都通过的重构，或者满足每个所需部分的报告。 `RubricMiddleware` 允许您将“完成的内容”声明为评分标准，并让代理进行“自我评估和迭代”，直到满足评分标准，或者达到配置的最大迭代上限。

**LLM-as-a-judge** 是一种模式，其中一个语言模型根据定义的标准评估另一个模型的输出。在[LangSmith evaluations](/langsmith/evaluation-concepts#llm-as-judge)中，法学硕士作为评委评估者批量离线对申请输出进行评分。 `RubricMiddleware` 在运行时应用相同的模式：深度代理生成输出后，专用的评分器模型会根据您的评分标准审查成绩单并驱动修订，直到每个标准通过（或达到配置的迭代上限）。当深度代理完成推理时，LLM 作为法官评分者子代理会审查输出并返回裁决。如果它返回`needs_revision`，则每个标准的反馈将被注入回对话中，并且代理再次运行。循环在 `satisfied`、`max_iterations_reached`、`failed` 或 `grader_error` 处终止。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Start[User invokes<br/>with rubric] --> Agent[Deep agent]
    Agent --> Grader{Grader<br/>verdict}

    Grader --> |satisfied| Done[Finish execution]
    Grader --> |failed| Done
    Grader --> |grader_error| Done
    Grader --> |needs_revision| Cap{Iterations < <br/> max_iterations?}

    Cap --> |yes| Inject[Re-prompt deep agent with per-criterion feedback]
    Cap --> |no| Done

    Inject --> Agent

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef alert fill:#F8E8E6,stroke:#B27D75,stroke-width:2px,color:#634643

    class Start trigger
    class Agent,Inject process
    class Grader,Cap decision
    class Done,MaxOut alert
```

## 配置中间件

当您调用`create_deep_agent`时，将`RubricMiddleware`添加到`middleware`列表中：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from langgraph.checkpoint.memory import InMemorySaver

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              max_iterations=3,
          ),
      ],
      checkpointer=InMemorySaver(),
  )
  ```
</CodeGroup>

|论证|必填|默认|描述 |
| ---------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `model` |是的 | `None` | LLM 作为评委评分员子代理使用的聊天模型。接受 `"provider:model-id"` 字符串或 `BaseChatModel` 实例。通常是比深度代理的工作模型更小或更便宜的模型。                  |
| `system_prompt` |没有 |内置评分器提示 |自定义分级说明。退回到默认系统提示，向评分者传授判决格式以及可以使用的工具。                                                                 |
| `tools` |没有 | `None` |评分者在做出结论之前可以调用工具来收集证据（运行测试、计数标记、读取文件）。如果没有，评分者只能根据成绩单进行推理。                                              |
| `max_iterations` |没有 | `3` |每个评分标准尝试的最大评分者迭代次数；必须是正整数。当达到上限但没有 `satisfied` 判决时，代理将以状态 `max_iterations_reached` 终止。                          || `on_evaluation` |没有 | `None` |每次评分迭代后，无论您使用 `invoke()`、`stream()` 还是 `stream_events()`，都会调用每个 `RubricEvaluation` 的可选回调。对于日志记录、自定义指标、评估数据集或 UI 更新很有用。 |

## 在调用时传递标题

在调用状态上传递 `rubric` 字符串以启动自评估循环。使用 `invoke()` 进行单个阻塞调用，或将 [⟦T63⟧](/oss/python/langchain/event-streaming) 与 [⟦T64⟧](/oss/python/langchain/event-streaming#custom-updates) 结合使用以在 `stream.custom` 上发生评分事件时接收这些事件：

<Tabs>
  <Tab title="invoke()">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.messages import HumanMessage

    config = {"configurable": {"thread_id": "my-rubric-thread"}}
    result = agent.invoke(
        {
            "messages": [HumanMessage("Write a haiku about spring.")],
            "rubric": (
                "- The poem has three lines\n"
                "- Lines follow a 5-7-5 syllable pattern\n"
                "- The theme is spring"
            ),
        },
        config=config,
    )
    ```
  </Tab>

  <Tab title="stream_events()">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.messages import HumanMessage
    from langgraph.stream import CustomTransformer

    config = {"configurable": {"thread_id": "my-rubric-thread"}}
    stream = agent.stream_events(
        {
            "messages": [HumanMessage("Write a haiku about spring.")],
            "rubric": (
                "- The poem has three lines\n"
                "- Lines follow a 5-7-5 syllable pattern\n"
                "- The theme is spring"
            ),
        },
        config=config,
        version="v3",
        transformers=[CustomTransformer],
    )

    for event in stream.custom:
        event_type = event.get("type")
        if event_type == "rubric_evaluation_start":
            print(
                f"Grading iteration {event['iteration']} "
                f"(run {event['grading_run_id']})"
            )
        elif event_type == "rubric_evaluation_end":
            print(f"Verdict: {event['result']} — {event.get('explanation', '')}")
    ```

    Rubric 评分在 `stream.custom` 上发出以下自定义事件：|活动 |被解雇时 |有效负载字段 |
    | ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- || `rubric_evaluation_start` |在评分机运行之前。                               | <ul><li>`type`：活动名称</li><li>`grading_run_id`：在一次评分标准尝试中的所有活动之间共享</li><li>`iteration`：当前评分的从零开始的索引运行</li></ul> |
    | `rubric_evaluation_end` |评分员返回后或评分员异常后。 | <ul><li>`type`：事件名称</li><li>`grading_run_id`：在一次评分规则尝试中的所有事件之间共享</li><li>`iteration`：当前评分者的从零开始的索引pass</li><li>`result`：此pass的最终判决</li><li>`explanation`：评分者的摘要</li><li>`criteria`：每个标准判决</li></ul> |
  </Tab>
</Tabs>

### 评分标准判决

当深度代理完成推理并产生输出时，LLM 作为法官评分者子代理会根据评分标准审查输出并产生以下判决之一：|状态 |意义|循环回来？ |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `satisfied` |标题中的每一个标准都通过了。                                                                                                        |没有 |
| `needs_revision` |至少有一项标准不合格；评分者反馈被注入，代理再次运行。                                                          |是的 |
| `max_iterations_reached` | Grader仍然想要修改，但是`max_iterations`已经被击中了。                                                                             |没有 |
| `failed` |评分者判断标题格式错误或无法根据成绩单进行评估。                                                     |没有 || `grader_error` |法学硕士作为法官评分者子代理本身提出了一个例外（提供者超时、缺少凭据、格式错误的结构化响应等）。 |没有 |

## 观察迭代进度

`on_evaluation` 是一个回调，无论您调用 `invoke()` 还是 `stream_events()`，都会在每次评分迭代后根据评分者的结论触发。如果您没有阅读`stream.custom`（与`CustomTransformer`）或[tracing the run with LangSmith](/langsmith/trace-with-langgraph)的评分事件，这是检查评分过程中发生的情况的主要方式。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="openai:gpt-5.5",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import RubricMiddleware, create_deep_agent
  from deepagents.middleware.rubric import RubricEvaluation
  from langchain.messages import HumanMessage
  from langgraph.checkpoint.memory import InMemorySaver


  def log_evaluation(ev: RubricEvaluation) -> None:
      print(f"iteration {ev['iteration']}: {ev['result']} — {ev['explanation']}")


  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      middleware=[
          RubricMiddleware(
              model="anthropic:claude-haiku-4-5",
              on_evaluation=log_evaluation,
          ),
      ],
      checkpointer=InMemorySaver(),
  )

  config = {"configurable": {"thread_id": "rubric-eval-session"}}
  agent.invoke(
      {
          "messages": [HumanMessage("Write a one-sentence summary of photosynthesis.")],
          "rubric": (
              "- The answer is one sentence\n"
              "- The answer mentions light and chlorophyll"
          ),
      },
      config=config,
  )
  ```
</CodeGroup>

中间件在每个 [grader pass](#grader-pass-events) 之后使用 `RubricEvaluation` 字典调用您的函数。 `RubricEvaluation`字典包含：|领域 |类型 |描述 |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `grading_run_id` | `str` |一次评估尝试中的每个评估共享的标识符。当调用者提供不同的`rubric`，或者在最终判决后再次调用相同的`rubric`时，新的运行开始。 |
| `iteration` | `int` |当前评分者在该运行中通过的从零开始的索引。                                                                                                                                      |
| `result` | `str` |本次通过的评分者判定：`satisfied`、`needs_revision`、`failed` 或 `grader_error`。                                                                                                     || `explanation` | `str` |评分者的自由形式摘要。对于基础设施故障，这包括异常类型和消息。                                                                                      |
| `criteria` | `list` |按标准做出的判决。每个条目都是`{name, passed: true}` 或`{name, passed: false, gap}`，其中`gap` 是失败标准的可操作反馈。                                   |

### 分级师通行证事件

|活动 |描述 || ------------------------ | | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **成功评分** |每次传递触发一次，包括中间 `needs_revision` 判决和最终 `satisfied` 或 `failed` 判决。 <br /><br /> 当评分者返回`needs_revision`但已达到`max_iterations`时，回调仍会收到`result: "needs_revision"`（评分者的结论）。运行的终端状态是私有状态 `_rubric_status` 上的 `max_iterations_reached`，而不是评估记录中。在 `invoke` 完成后检查 `_rubric_status`，或与 `_rubric_iterations` 一起读取 `_rubric_evaluations` 中的最后一个条目，以在上限耗尽时进行分支。 || **评分者例外** |触发 `result: "grader_error"`、从异常派生的解释以及空的 `criteria` 列表。                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **您的回调中出现错误** |异常情况会被记录并抑制。评分循环继续进行。不要使用 `on_evaluation` 来强制控制流（例如，引发以停止代理）。                                                                                                                                                                                                                                                                                                                                                                                                                              |## 在调用中保留规则

单个 `agent.invoke()` 或 `agent.stream_events()` 调用将运行标题循环直至完成，并以最终结论结束：`satisfied`、`failed` 或 `max_iterations_reached`。

要携带标题以进行后续调用，请附加 [checkpointer](/oss/python/langgraph/checkpointers#checkpoints) 并在调用旁边传递相同的 `thread_id`。在这些情况下，相同的 `rubric` 会在未来的 `invoke()` 或 `stream_events()` 调用中持续存在，直到您传入一个新的调用。

中断（`KeyboardInterrupt`、`asyncio.CancelledError`）从 `agent.invoke()` 和 `agent.stream_events()` 传播出去，未捕获。在检查点线程上，具有相同评分标准的下一个调用将恢复正在进行的评分运行。

## 示例：生成经过审查的 Python 代码

以下示例构建了一个编写 `find_duplicates` 函数的深度代理。它定义 `RubricMiddleware` 一次，将其附加到代理，然后在调用时传递 `rubric` 字符串。

该示例没有要求评分者抽象地推理正确性，而是为其提供了一个`run_test_suite` 工具来直接验证行为。评分者在做出结论之前调用此工具获取更多信息，并在没有提供工具时从成绩单中进行推理。<Steps>
  <Step title="Define RubricMiddleware">
    该中间件在基本代理之上添加了一个 LLM-as-a-judge 评分器循环。配置评分器模型、可选的自定义提示、证据收集工具和最大迭代上限。

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="google_genai:gemini-3.6-flash",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="openai:gpt-5.5",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="anthropic:claude-sonnet-4-6",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="openrouter:z-ai/glm-5.2",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="baseten:zai-org/GLM-5.2",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import RubricMiddleware
      from langchain.tools import tool


      @tool
      def run_test_suite(code: str) -> dict:
          """Run the find_duplicates test suite against Python source code."""
          namespace: dict = {"__builtins__": __builtins__}
          try:
              exec(code, namespace)
          except Exception as exc:
              return {"ok": False, "failures": [f"Failed to execute code: {exc}"]}

          find_duplicates = namespace.get("find_duplicates")
          if find_duplicates is None:
              return {"ok": False, "failures": ["Function find_duplicates is not defined"]}

          tests = [
              ("test_basic", [1, 2, 2, 3, 1], [2, 1]),
              ("test_empty", [], []),
              ("test_no_duplicates", [1, 2, 3], []),
              ("test_unhashable", [[1], [1], 2], [[1]]),
          ]
          failures: list[str] = []
          for name, args, expected in tests:
              try:
                  actual = find_duplicates(args)
                  if actual != expected:
                      failures.append(f"{name}: expected {expected}, got {actual}")
              except Exception as exc:
                  failures.append(f"{name}: {exc}")

          return {"ok": not failures, "failures": failures}


      rubric_middleware = RubricMiddleware(
          model="ollama:north-mini-code-1.0",
          system_prompt="You are a code reviewer grading generated code against a rubric.",
          tools=[run_test_suite],
          max_iterations=5,
      )
      ```
    </CodeGroup>
  </Step>

  <Step title="Pass it to a deep agent">
    代理的`system_prompt`告诉它如何做工作，而评分则告诉评分者如何判断工作。

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langgraph.checkpoint.memory import InMemorySaver

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          system_prompt=(
              "You are a careful Python engineer. Write correct, readable code. "
              "Follow the user's instructions exactly."
          ),
          middleware=[rubric_middleware],
          checkpointer=InMemorySaver(),
      )
      ```
    </CodeGroup>
  </Step>

  <Step title="Invoke with a human message and rubric">
    在调用时，在 `messages` 中提供用户请求，并在 `rubric` 中提供换行符分隔的检查表，评分者必须将其标记为满足。当输入状态上没有提供`rubric`时，中间件不会运行。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.messages import HumanMessage

    result = agent.invoke(
        {
            "messages": [
                HumanMessage(
                    content=(
                        "Write a Python function `find_duplicates(lst)` that returns a list of "
                        "all elements that appear more than once in the input list, in the order "
                        "they first appear."
                    )
                )
            ],
            "rubric": (
                "- All tests pass in run_test_suite\n"
                "- The function is named `find_duplicates` and accepts a single list argument\n"
            ),
        },
        config={"configurable": {"thread_id": "code-generation-session"}},
    )
    print(result["messages"][-1].text)
    ```
  </Step>
</Steps>

代理生成输出后，分级器接管并检查每个标准的输出：例如，当输入包含不可散列的类型时，`test_unhashable` 会失败，并显示 `TypeError`。如果存在任何问题，评分者会提供此反馈，然后代理会修改其实施并将其返回给评分者。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/rubric.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>