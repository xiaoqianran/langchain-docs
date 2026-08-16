<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Goals and rubrics | https://docs.langchain.com/oss/deepagents/code/goals-and-rubrics -->

# 目标和准则

目标和规则有助于 Deep Agents 代码检查其工作是否满足您关心的标准。使用目标驱动的工作，代理应帮助定义验收标准，并在您已经知道标准时使用标题。

## 选择一个目标或标题

当您有一个可衡量的目标并希望 Deep Agents 代码在开始之前起草验收标准时，请使用 **目标**。目标有一个生命周期：一旦接受，它就会在各个轮次中保持活动状态，直到您暂停它、代理将其标记为已完成或阻止，或者您清除它。您还可以修改活动目标而无需重新开始工作。

当您已经知道想要对代理进行评分的标准时，请使用**评分标准**。标题可以仅适用于下一个回合，也可以持续到未来的回合。

常见模式：

- **一个目标，特工起草标准**：使用`/goal <objective>`。
- **每回合的持续标准**：使用`/rubric set <criteria>`。
- **存储在文件中的条件**：使用`/rubric file <path>`。
- **一转质量门**：使用`/rubric next <criteria>`。

## 使用目标当您知道想要的结果，但希望使用 Deep Agents 代码在工作开始之前提出验收标准时，请使用`/goal`。目标对于开放式工作很有用：代理将目标转化为完成的具体定义，然后迭代直到满足这些标准。

```text
/goal add OAuth refresh handling
```

Deep Agents 代码在开始任务之前起草验收标准以供审查。

在在线审核中，您可以接受提案、编辑标准、请求另一次修订或取消提案。接受条件后，目标在各个回合中保持活动状态，直到暂停、完成、阻止或清除。

这种方法可以让你在多个回合中朝着更大的目标努力：

```text
/goal migrate auth callbacks to the new API
start with the OAuth callback
now update the tests
check the docs too
```

输入上方的目标面板显示当前目标以及它是活动的、暂停的、阻止的还是已完成的。使用`/goal show`检查当前目标，使用`/goal clear`删除它。

### 修改、暂停和恢复目标

在不取消当前任务和重播工作的情况下引导持续的目标：- `/goal amend <feedback>` 建议对目标和标准进行协调更新。修正案在最终确定之前会经过相同的内联审核（接受、编辑、修改或取消）。
- `/goal pause` 保存目标而不让它驱动工作或评分，因此干预提示会在没有目标的情况下运行。 `/goal resume` 重新激活保存的目标并从现有对话继续。

```text
/goal amend remove JSON export, add streaming CSV support, keep the CSV tests
/goal pause
/goal resume
```

### 完成和评分

每个后续回合都会根据目标的验收标准进行评分，直到工作完成。

- 当目标完成被批准时，Deep Agents代码清除目标

<AccordionGroup>
    <Accordion title="Goal command reference">
        - `/goal <objective>`：根据简单语言的目标起草验收标准，并在工作开始前进行审查。
        - `/goal amend <feedback>`：建议对目标和审查标准进行协调更新。
        - `/goal pause`：保存目标，不要让它驱动工作或评分。
        - `/goal resume`：重新激活暂停的目标并从现有对话继续。
        - `/goal show`：检查当前目标、其状态及其标准。
        - `/goal clear`：删除活动目标。
        - `/goal model [provider:model|clear]`：设置或清除对目标进行评分的模型。
        - `/goal max-iterations <N|clear>`：设置或清除目标的最大评分迭代次数。
    </Accordion>
</AccordionGroup>## 使用标题

当您已经知道验收标准并希望它们充当代理工作的质量门时，请使用`/rubric`。

```text
/rubric set tests pass; no unrelated files changed; help text is updated
/rubric next only change the auth callback; do not refactor unrelated code
/rubric file acceptance.md
```

粘性标题适用于未来的回合，直到清除为止。下一回合标题仅适用于下一个提交的任务。

<AccordionGroup>
    <Accordion title="Rubric command reference">
        - `/rubric show`：检查活动标题。
        - `/rubric clear`：删除活动标题。
        - `/rubric model <provider:model>`：设置评分细则结果的模型。
    </Accordion>

    <Accordion title="Use rubrics in non-interactive mode">
        非交互式运行无法暂停以进行目标审核。对于已知条件的任务使用 `--rubric`：

        ```bash
        dcode -n "implement OAuth refresh handling" --rubric "tests pass; no unrelated files changed"
        dcode -n "implement OAuth refresh handling" --rubric @acceptance.md
        ```

        您还可以设置评分器模型和最大评分迭代：

        ```bash
        dcode -n "implement OAuth refresh handling" \
          --rubric "tests pass; no unrelated files changed" \
          --rubric-model openai:gpt-5.5 \
          --rubric-max-iterations 3
        ```
    </Accordion>
</AccordionGroup>

## 另请参阅

- [Deep Agents Code overview](/oss/deepagents/code/overview)
- [Quickstart](/oss/deepagents/code/quickstart)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/goals-and-rubrics.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>