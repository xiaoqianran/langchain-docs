<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use assertions | https://docs.langchain.com/langsmith/assertions -->

# 使用断言

断言将审阅者的英语语言标准转变为自动检查。它们是关于正确答案应该或不应该包括什么的简短、形式自由的主张。您在检查 [single-run annotation queue](/langsmith/annotation-queues#single-run-annotation-queues) 中的运行时编写它们，LangSmith 将每一个都保存在 [dataset example](/langsmith/example-data-format) 上。然后，任何[offline evaluator](/langsmith/evaluation-concepts#offline-evaluations)都可以检查应用程序的新输出是否满足每个声明。

在以下情况下使用断言：

- 运行的实际输出是错误的，您宁愿描述正确的答案，也不愿手写答案。
- 您希望在不离开审核流程的情况下以简单的英语捕获验收标准。

<Note>
断言可在 [single-run annotation queues](/langsmith/annotation-queues#single-run-annotation-queues) 中的 **run** 项上使用。它们不适用于[thread](/langsmith/observability-concepts#threads) 商品或[pairwise queues](/langsmith/annotation-queues#pairwise-annotation-queues)。断言仅在 LangSmith UI 中可用。
</Note>

<Tip>
[LangSmith Engine](/langsmith/engine#add-offline-examples) 可以针对标记为重复出现问题的生产跟踪自动提出断言。打开问题的离线示例流程，以在将引擎的建议断言保存到数据集之前查看、编辑或扩展它们。
</Tip>

## 添加断言1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-assertions) 中，导航至左侧边栏中的 **注释队列**。打开单次运行队列并选择一次运行。
1. 在侧面板中，找到 **反馈** 下面的 **断言** 部分。
1. 单击 **+ 添加** 创建断言行。
1. 输入总结声明的**键**（例如，`must_cite_source`、`must_not_invent_url`）和描述该声明的一句话**注释**。

    关键是形式自由。 `must_` / `must_not_` 前缀只是一个命名约定； LangSmith并没有特别对待他们。

1. 对您要捕获的每个条件重复步骤 3 和 4。

    运行编辑器在断言侧面板旁边显示运行的输入和输出。一旦您添加至少一个断言，运行编辑器的 **输出** 面板就会从运行的实际输出切换到您已添加的断言的只读预览。此预览是保存到数据集的内容。运行的实际输出不会保存，因为断言描述了正确答案应包含的内容，而不是本次运行产生的内容。

    <img
      className="block dark:hidden"
      src="/langsmith/images/assertions-example-light.png"
      alt="Annotation queue run editor with assertions added in the side panel and the Outputs panel showing a read-only preview of those assertions."
    />

    <img
      className="hidden dark:block"
      src="/langsmith/images/assertions-example-dark.png"
      alt="Annotation queue run editor with assertions added in the side panel and the Outputs panel showing a read-only preview of those assertions."
    />您可以随时继续编辑运行的**输入**，例如在保存示例之前优化提示。当任何断言保留时，**输出**面板保持锁定到断言预览。

1. 单击侧面板页脚中的 **添加到数据集和下一步**（键盘快捷键：在 macOS 上按 <kbd>⌘ Enter</kbd> 或在其他地方按 <kbd>Ctrl Enter</kbd>）。 LangSmith 将当前运行添加到队列的 [default dataset](/langsmith/annotation-queues#basic-details)，或者如果未配置默认值，则提示您选择一个。然后队列会将您移至下一次运行。

保存示例的 `outputs` 字段存储为 JSON。例如：

```json
{
  "assertions": [
    {
      "key": "must_cite_source",
      "comment": "The response cites the source URL it is drawing from."
    },
    {
      "key": "must_not_invent_url",
      "comment": "The response does not include URLs that do not appear in the inputs."
    }
  ]
}
```

该示例的 `inputs` 字段存储运行的输入，或者您编辑的版本（如果您更改了它们）。有关已保存示例的完整形状，请参阅[Example data format](/langsmith/example-data-format)。

## 根据断言进行评估

编写一个 [offline evaluator](/langsmith/evaluation-concepts#offline-evaluations)，从 `reference_outputs["assertions"]` 读取保存的断言，并为每个断言返回一个反馈分数。最小形状：

```python
def grade_against_assertions(outputs: dict, reference_outputs: dict) -> list[dict]:
    """Return one feedback score per assertion."""
    feedback = []
    for assertion in reference_outputs["assertions"]:
        # Replace with your scoring logic: LLM judge, regex, schema check, and so on.
        score = ...
        feedback.append({"key": assertion["key"], "score": score})
    return feedback
```

如何对每项索赔进行评分取决于您。三种模式很常见，可以组合在一个评估器中：- **[LLM-as-a-judge](/langsmith/llm-as-judge)**：对于每个断言，使用应用程序的输出和断言的 `comment` 提示模型，并让它返回一个分数。当声明是主观的或难以机械验证时最好。
- **[Code-based checks](/langsmith/code-evaluator-ui)**：对于每个断言，运行与断言的 `key` 无关的确定性检查，例如正则表达式匹配、模式验证或子字符串存在。当主张有一个清晰、机械的答案时最好。
- **[Partial-credit scoring](/langsmith/multiple-scores)**：返回数字分数（例如，0.0 到 1.0 之间）而不是布尔值，以按比例评分，并对满足部分（但不是全部）要求的输出给予“部分学分”。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/assertions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>