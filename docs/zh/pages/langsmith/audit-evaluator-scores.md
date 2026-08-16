<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to audit evaluator scores | https://docs.langchain.com/langsmith/audit-evaluator-scores -->

# 如何审核评估者分数

法学硕士作为法官的评估者并不总是能做出正确的判断。因此，人们手动审核评估者留下的分数并在必要时纠正它们通常很有用。 LangSmith 允许您在 UI 或 SDK 中对评估者分数进行更正。

## 在比较视图中

在比较视图中，您可以单击任何反馈标签以显示反馈详细信息。从那里，单击右侧的“编辑”图标以显示更正视图。然后，您可以在“进行更正”下的文本框中输入您想要的分数。如果您愿意，您还可以对更正内容附上解释。如果您使用 [few-shot evaluator](/langsmith/create-few-shot-evaluators)，这非常有用，并且会自动插入到您的少数示例中，以代替 `few_shot_explanation` 提示变量。

![Audit Evaluator Comparison View](/langsmith/images/corrections-comparison-view.png)

## 在运行表中

在运行表中，找到“反馈”列，然后单击反馈标签以显示反馈详细信息。再次单击右侧的“编辑”图标以显示更正视图。

![Audit Evaluator Runs Table](/langsmith/images/corrections-runs-table.png)

## 在 SDK 中

可以通过 SDK 的 `update_feedback` 函数和 `correction` 字典进行更正。您必须指定一个 `score` 键，该键对应于要在 UI 中呈现的数字。<CodeGroup>

```python Python
import langsmith

client = langsmith.Client()

client.update_feedback(
    my_feedback_id,
    correction={
        "score": 1,
    },
)
```

```typescript TypeScript
import { Client } from 'langsmith';

const client = new Client();

await client.updateFeedback(
    myFeedbackId,
    {
        correction: {
            score: 1,
        }
    }
)
```

</CodeGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/audit-evaluator-scores.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>