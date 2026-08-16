<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage evaluators with the SDK | https://docs.langchain.com/langsmith/manage-evaluators-sdk -->

# 使用 SDK 管理评估器

使用LangSmith SDK 以编程方式创建和管理[evaluators](/langsmith/evaluation-concepts#evaluators)。通过 SDK 创建的评估器是 [workspace-level](/langsmith/administration-overview#workspaces) 资源，出现在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-manage-evaluators-sdk) 的 **Evaluators** 表中，与 [evaluators created in the UI](/langsmith/evaluators#create-an-evaluator-in-the-ui) 相同。您可以将它们附加到数据集以运行[offline evaluations](/langsmith/evaluation-concepts#offline-evaluations)，并将它们附加到跟踪项目以运行[online evaluations](/langsmith/evaluation-concepts#online-evaluations)。使用 SDK 自动化评估者管理并将评估集成到您现有的工作流程中。

## 先决条件

通过 SDK 管理评估者需要：

- Python：`langsmith>=0.9.8`（PyPI）
- TypeScript：`langsmith>=0.7.16`（npm）

<Note>
安装和设置请参考[Python SDK documentation](https://reference.langchain.com/python/langsmith)和[TypeScript SDK documentation](https://reference.langchain.com/javascript/modules/langsmith.html)。
</Note>

本页上的示例不带参数初始化客户端，因此它读取 `LANGSMITH_API_KEY` 和 `LANGSMITH_ENDPOINT` 环境变量。通过环境变量配置您的[API key](/langsmith/create-account-api-key)，而不是对其进行硬编码。

在以下示例中，将`<evaluator-uuid>`等占位符替换为LangSmith中的相应信息。本页上的所有 Python 异步示例均假设它们在 `async def main(): ... asyncio.run(main())` 内运行，如创建代码评估器示例中所示。

## 创建一个评估器

### 代码评估器

代码评估器使用您定义的函数对每次运行或示例进行评分。

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()

    created = await client.evaluators.create(
        name="Correctness evaluator",
        type="code",
        code_evaluator={
            "code": "def perform_eval(run, example):\n    return {'score': 1}",
            "language": "python",
        },
    )
    evaluator_id = created.evaluator.id
    print("Created evaluator:", evaluator_id)


asyncio.run(main())
```
```typescript TypeScript
import { Client } from "langsmith";

const client = new Client();

const created = await client.evaluators.create({
  name: "Correctness evaluator",
  type: "code",
  code_evaluator: {
    code: "def perform_eval(run, example):\n    return {'score': 1}",
    language: "python",
  },
});
const evaluatorId = created.evaluator?.id;
console.log("Created evaluator:", evaluatorId);
```
</CodeGroup>### 法学硕士法官评估员

LLM 作为法官评估器引用来自 [prompt hub](/langsmith/prompt-engineering-quickstart) 的提示，并将您的运行或示例字段映射到提示变量。

<Note>
提示必须是结构化提示（类型`StructuredPrompt`）。 `StructuredPrompt` 将提示模板与输出模式相结合，确保模型以定义的结构返回数据。
</Note>

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()

    created = await client.evaluators.create(
        name="LLM judge",
        type="llm",
        llm_evaluator={
            "prompt_repo_handle": "<prompt-repo-handle>",
            "commit_hash_or_tag": "<commit-hash-or-tag>",
            "variable_mapping": {
                "input": "inputs.question",
                "output": "outputs.answer",
                "reference": "reference.answer",
            },
        },
    )
    evaluator_id = created.evaluator.id


asyncio.run(main())
```
```typescript TypeScript
const created = await client.evaluators.create({
  name: "LLM judge",
  type: "llm",
  llm_evaluator: {
    prompt_repo_handle: "<prompt-repo-handle>",
    commit_hash_or_tag: "<commit-hash-or-tag>",
    variable_mapping: {
      input: "inputs.question",
      output: "outputs.answer",
      reference: "reference.answer",
    },
  },
});
const evaluatorId = created.evaluator?.id;
```
</CodeGroup>

`prompt_repo_handle` 是提示的内部存储库名称，而不是其显示标题或 URL。要找到它，请列出您的工作区提示并阅读 `repo_handle` 字段，或通过 LangSmith 中的标识符检索特定提示。提示的标识符可以采用以下格式：
- `promptName`（用于私人提示），例如`my-prompt`。
- `owner/promptName`（用于公共提示），例如`langchain-ai/correctness`。

<CodeGroup>
```python Python
# List workspace prompts and read each repo handle
for prompt in client.list_prompts(limit=10).repos:
    print("prompt-repo-handle:", prompt.repo_handle)   # value to use for prompt_repo_handle
    print("prompt-full-name:", prompt.full_name)     # display name
    print("description:", prompt.description)

# Or retrieve a specific prompt by identifier
prompt = client.get_prompt("<prompt-identifier>")
print("prompt-repo-handle:", prompt.repo_handle)
```
```typescript TypeScript
// List workspace prompts and read each repo handle.
// listPrompts() has no `limit` option in this SDK version — it's an async
// generator over all prompts, so cap the count client-side and break.
const prompts = client.listPrompts();
let count = 0;
for await (const prompt of prompts) {
  console.log("prompt-repo-handle:", prompt.repo_handle);
  console.log("prompt-full-name:", prompt.full_name);
  console.log("description:", prompt.description);
  console.log("---");
  if (++count >= 10) break; // first 10 only; stops further pagination
}

// Or retrieve a specific prompt by identifier
const prompt = await client.getPrompt("<prompt-identifier>");
console.log("prompt-repo-handle:", prompt.repo_handle);
```
</CodeGroup>

## 检索评估器

通过 ID 获取单个评估器以读取其配置，包括其名称、类型、反馈键和运行规则。

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()
    evaluator_id = "<evaluator-uuid>"

    evaluator = await client.evaluators.retrieve(evaluator_id)
    print(evaluator.name)
    print(evaluator.type)
    print(evaluator.feedback_keys)
    print(evaluator.run_rules)


asyncio.run(main())
```
```typescript TypeScript
const evaluator = await client.evaluators.retrieve(evaluatorId);
console.log(evaluator.name);
console.log(evaluator.type);
console.log(evaluator.feedback_keys);
console.log(evaluator.run_rules);
```
</CodeGroup>

## 更新评估器

传递与评估器类型匹配的字段：`code_evaluator`（对于代码评估器）或`llm_evaluator`（对于 LLM-as-a-judge 评估器）。 `update` 仅更改您传递的字段。

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()

    # Update a code evaluator
    code_evaluator_id = "<code-evaluator-uuid>"

    updated = await client.evaluators.update(
        code_evaluator_id,
        name="Updated correctness evaluator",
        code_evaluator={
            "code": "def perform_eval(run, example):\n    return {'score': 0.8}",
            "language": "python",
        },
    )
    print(updated.evaluator.name if updated.evaluator else None)

    # Update the name and prompt of an LLM-as-a-judge evaluator
    llm_evaluator_id = "<llm-evaluator-uuid>"

    await client.evaluators.update(
        llm_evaluator_id,
        name="Updated LLM judge",
        llm_evaluator={
            "prompt_repo_handle": "<prompt-repo-handle>",
            "commit_hash_or_tag": "<commit-hash-or-tag>",
        },
    )


asyncio.run(main())
```
```typescript TypeScript
// Update a code evaluator
const codeEvaluatorId = "<code-evaluator-uuid>";

const updated = await client.evaluators.update(codeEvaluatorId, {
  name: "Updated correctness evaluator",
  code_evaluator: {
    code: "def perform_eval(run, example):\n    return {'score': 0.8}",
    language: "python",
  },
});
console.log(updated.evaluator?.name);

// Update the name and prompt of an LLM-as-a-judge evaluator
const llmEvaluatorId = "<llm-evaluator-uuid>";

await client.evaluators.update(llmEvaluatorId, {
  name: "Updated LLM judge",
  llm_evaluator: {
    prompt_repo_handle: "<prompt-repo-handle>",
    commit_hash_or_tag: "<commit-hash-or-tag>",
  },
});
```
</CodeGroup>

### 配置运行时设置LLM 作为法官评估器接受控制其评分方式的附加设置：

- **`variable_mapping`**：将运行或示例字段映射到判断提示变量。它在评估器运行时适用。
- **`use_corrections_dataset`** 和 **`num_few_shot_examples`**：启用人工分数校正的小样本学习。仅当评估者附加到项目或数据集并且已提交更正时，它们才适用。

<Note>
这些设置将在下一次评估运行时生效，而不是在您调用 `update` 时生效。
</Note>

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()
    llm_evaluator_id = "<llm-evaluator-uuid>"

    await client.evaluators.update(
        llm_evaluator_id,
        llm_evaluator={
            "prompt_repo_handle": "<prompt-repo-handle>",
            "commit_hash_or_tag": "<commit-hash-or-tag>",
            "variable_mapping": {
                "input": "inputs.question",
                "output": "outputs.answer",
            },
            "use_corrections_dataset": True,
            "num_few_shot_examples": 3,
        },
    )


asyncio.run(main())
```
```typescript TypeScript
const llmEvaluatorId = "<llm-evaluator-uuid>";

await client.evaluators.update(llmEvaluatorId, {
  llm_evaluator: {
    prompt_repo_handle: "<prompt-repo-handle>",
    commit_hash_or_tag: "<commit-hash-or-tag>",
    variable_mapping: {
      input: "inputs.question",
      output: "outputs.answer",
    },
    use_corrections_dataset: true,
    num_few_shot_examples: 3,
  },
});
```
</CodeGroup>

## 列出评估者

按名称、类型、反馈键、附加资源或标签值进行过滤，并对结果进行排序或分页。当您直接迭代返回的对象时，`list()` 会自动对每个匹配项进行分页。 `limit` 设置每个请求的页面大小（1 到 100），而不是结果总数。 `sort_by` 是可选的，接受 `created_at` 或 `updated_at`，默认为 `created_at`。

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()

    # Read a single page of results
    page = await client.evaluators.list(
        name_contains="correctness",
        type="code",
        limit=10,
    )
    for evaluator in page.evaluators:
        print(evaluator.id, evaluator.name, evaluator.type)

    # Collect every match into a list
    evaluators = [
        evaluator
        async for evaluator in client.evaluators.list(feedback_key="correctness", limit=20)
    ]

    # Filter, sort, and paginate
    page = await client.evaluators.list(
        feedback_key="correctness",
        name_contains="judge",
        resource_id=["<project-or-dataset-uuid>"],
        tag_value_id=["<tag-value-uuid>"],
        type="llm",
        sort_by="updated_at",  # "created_at" (default) or "updated_at"
        sort_by_desc=False,
        limit=20,
        offset=0,
    )


asyncio.run(main())
```
```typescript TypeScript
// Read a single page of results
const page = await client.evaluators.list({
  name_contains: "correctness",
  type: "code",
  limit: 10,
});
for (const evaluator of page.evaluators) {
  console.log(evaluator.id, evaluator.name, evaluator.type);
}

// Collect every match into an array
const evaluators = [];
for await (const evaluator of client.evaluators.list({
  feedback_key: "correctness",
  limit: 20,
})) {
  evaluators.push(evaluator);
}

// Filter, sort, and paginate
await client.evaluators.list({
  feedback_key: "correctness",
  name_contains: "judge",
  resource_id: ["<project-or-dataset-uuid>"],
  tag_value_id: ["<tag-value-uuid>"],
  type: "llm",
  sort_by: "updated_at", // "created_at" (default) or "updated_at"
  sort_by_desc: false,
  limit: 20,
  offset: 0,
});
```
</CodeGroup>

## 跟踪评估者支出

为您的评估者检索估计的美元支出和跟踪计数：- **`period_start`**：仅日期 ISO 字符串，例如 `2026-06-29`。传递日期时间会返回 400 错误。
    - **窗口**：`period_start` 启动一个固定的 7 天窗口，其中包括 `period_start` 及其后的六天。窗口半开，`[period_start, period_start + 7 days)`，因此排除`period_end`（`period_start` 加 7 天）。例如，`2026-06-29` 的`period_start` 涵盖`2026-06-29` 到`2026-07-05`，并且排除`2026-07-06`。
- **`type`**：将结果范围限定为单个评估器类型，`llm` 或 `code`。省略它以包括所有类型。
- **空结果**：如果该窗口没有记录支出，则返回的`groups`列表为空。

<Note>
仅传递 `group_by`、`evaluator_id`、`session_id`（LangSmith 跟踪项目 UUID）或 `dataset_id` 之一。
</Note>

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()
    evaluator_uuid = "<evaluator-uuid>"
    start_date = "<period-start-date>" # for example, "2026-06-29"

    # Spend for a single evaluator
    spend = await client.evaluators.spend(
        period_start=start_date,
        evaluator_id=evaluator_uuid,
    )
    for group in spend.groups or []:
        print(group.evaluator_name, group.total_spend_usd, group.total_trace_count)

    # Group spend by evaluator
    spend_by_evaluator = await client.evaluators.spend(
        period_start=start_date,
        group_by="evaluator",
        type="llm",
    )
    print("Group by evaluator")
    for group in spend_by_evaluator.groups or []:
        print(group.evaluator_name, group.total_spend_usd, group.total_trace_count)

    # Group spend by resource
    spend_by_resource = await client.evaluators.spend(
        period_start=start_date,
        group_by="resource",
        type="llm",
    )
    print("Group by resource")
    for group in spend_by_resource.groups or []:
        print(group.session_name, group.dataset_name, group.total_spend_usd, group.total_trace_count)

    # Group spend by run_rule
    spend_by_run_rule = await client.evaluators.spend(
        period_start=start_date,
        group_by="run_rule",
        type="llm",
    )
    print("Group by run_rule")
    for group in spend_by_run_rule.groups or []:
        print(group.run_rule_name, group.total_spend_usd, group.total_trace_count)


asyncio.run(main())
```
```typescript TypeScript
const evaluatorUUID = "<evaluator-uuid>";
const startDate = "<period-start-date>"; // for example, "2026-06-29"

// Spend for a single evaluator
const spend = await client.evaluators.spend({
  period_start: startDate,
  evaluator_id: evaluatorUUID,
});
for (const group of spend.groups ?? []) {
  console.log(group.evaluator_name, group.total_spend_usd, group.total_trace_count);
}

// Group spend by evaluator
const spendByEvaluator = await client.evaluators.spend({
  period_start: startDate,
  group_by: "evaluator",
  type: "llm",
});
console.log("Group by evaluator");
for (const group of spendByEvaluator.groups ?? []) {
  console.log(group.evaluator_name, group.total_spend_usd, group.total_trace_count);
}

// Group spend by resource
const spendByResource = await client.evaluators.spend({
  period_start: startDate,
  group_by: "resource",
  type: "llm",
});
console.log("Group by resource");
for (const group of spendByResource.groups ?? []) {
  console.log(group.session_name, group.dataset_name, group.total_spend_usd, group.total_trace_count);
}

// Group spend by run_rule
const spendByRunRule = await client.evaluators.spend({
  period_start: startDate,
  group_by: "run_rule",
  type: "llm",
});
console.log("Group by run_rule");
for (const group of spendByRunRule.groups ?? []) {
  console.log(group.run_rule_name, group.total_spend_usd, group.total_trace_count);
}
```
</CodeGroup>

## 删除评估器

当评估器附加到跟踪项目或数据集时，您无法将其删除。将 `delete_run_rules` 设置为 `true` 以在删除评估器之前删除引用评估器的运行规则。

<CodeGroup>
```python Python
import asyncio

from langsmith import Client


async def main():
    client = Client()
    evaluator_id = "<evaluator-uuid>"

    await client.evaluators.delete(
        evaluator_id,
        delete_run_rules=True, # run rules referencing the evaluator are deleted first
    )


asyncio.run(main())
```
```typescript TypeScript
const evaluatorId = "<evaluator-uuid>";

await client.evaluators.delete(evaluatorId, {
  delete_run_rules: true, // run rules referencing the evaluator are deleted first
});
```
</CodeGroup>

## 相关

- [Manage evaluators](/langsmith/evaluators)：在LangSmith UI 中查看和管理评估器。
- [Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)：在LangSmith UI 中配置 LLM 作为法官在线评估器。
- [Set up online code evaluators](/langsmith/online-evaluations-code)：在LangSmith UI 中配置在线代码评估器。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-evaluators-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>