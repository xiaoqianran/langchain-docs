<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use assertions | https://docs.langchain.com/langsmith/assertions -->

# 使用断言

检查并编辑引擎针对重复出现的问题提出的断言LangSmith，然后将它们保存为数据集示例以供离线评估。

断言将英语语言标准转变为自动检查。它们是关于正确答案应该或不应该包括什么的简短、形式自由的主张。 [LangSmith Engine](/langsmith/engine-issues) 针对重复出现的生产问题背后的痕迹提出断言。您在 [single-run annotation queue](/langsmith/annotation-queues#single-run-annotation-queues) 中查看和编辑它们，LangSmith 将它们保存在 [dataset example](/langsmith/example-data-format) 中。然后，任何[offline evaluator](/langsmith/evaluation-concepts#offline-evaluations)都可以检查应用程序的新输出是否满足每个声明。

当运行的输出错误时，断言可以让您描述正确的答案，而不是手写答案。

> [!注意]
>
> **断言**部分仅出现在LangSmith引擎建议作为离线示例的运行项目上。它不会出现在其他运行、[thread](/langsmith/observability-concepts#threads) 物品或[pairwise queues](/langsmith/annotation-queues#pairwise-annotation-queues) 中。断言仅在 LangSmith UI 中可用。

## 审查提议的断言

要查看并保存引擎建议的断言：

1. 在引擎问题上，单击 **引擎建议的 N 个示例**，然后单击 **在注释队列中编辑**。详情请参见[Add offline examples](/langsmith/engine-issues#add-offline-examples)。2. 在注释队列中，找到侧面板中的 **Assertions** 部分。引擎用其建议的断言填充它，并且运行显示**由引擎建议**横幅。

3. 编辑每个断言的 **key**、声明的简短摘要（例如，`must_cite_source` 或 `must_not_invent_url`）及其描述声明的一句话 **注释**。

   关键是形式自由。 `must_` 和 `must_not_` 前缀是命名约定。 LangSmith并没有特别对待他们。

4. （可选）单击 **+ 添加** 添加断言，或单击行上的删除图标将其删除。

   虽然运行有断言，但 LangSmith 将运行的输出替换为断言的只读预览，标记为参考输出。此预览是保存到数据集的内容。运行的实际输出不会保存，因为断言描述了正确答案应包含的内容，而不是本次运行产生的内容。

   要在保存示例之前编辑运行的 **输入**，例如优化提示，请为队列启用 [**Classic Trace View**](/langsmith/annotation-queues#data-formatting)。当任何断言保留时，输出保持锁定到断言预览。5. 单击侧面板页脚中的 **添加到数据集和下一步**（键盘快捷键：在 macOS 上按 <kbd>⟧ Enter</kbd> 或在其他地方按 <kbd>Ctrl Enter</kbd>）。 LangSmith 将当前运行添加到队列的 [default dataset](/langsmith/annotation-queues#basic-details)，或者如果未配置默认值，则提示您选择一个。然后队列会将您移至下一次运行。

保存示例的 `outputs` 字段存储为 JSON。例如：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def grade_against_assertions(outputs: dict, reference_outputs: dict) -> list[dict]:
    """Return one feedback score per assertion."""
    feedback = []
    for assertion in reference_outputs["assertions"]:
        # Replace with your scoring logic: LLM judge, regex, schema check, and so on.
        score = ...
        feedback.append({"key": assertion["key"], "score": score})
    return feedback
```

如何对每项索赔进行评分取决于您。三种模式很常见，可以组合在一个评估器中：* **[LLM-as-a-judge](/langsmith/llm-as-judge)**：对于每个断言，使用应用程序的输出和断言的 `comment` 提示模型，并让它返回一个分数。当声明是主观的或难以机械验证时最好。
* **[Code-based checks](/langsmith/code-evaluator-ui)**：对于每个断言，运行与断言的 `key` 无关的确定性检查，例如正则表达式匹配、模式验证或子字符串存在。当主张有一个清晰、机械的答案时最好。
* **[Partial-credit scoring](/langsmith/multiple-scores)**：返回一个数字分数（例如，0.0 到 1.0 之间）而不是布尔值来按比例评分，并对满足部分（但不是全部）要求的输出给予“部分学分”。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/assertions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。