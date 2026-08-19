<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up online code evaluators | https://docs.langchain.com/langsmith/online-evaluations-code -->

# 设置在线代码评估器

[Online evaluations](/langsmith/evaluation-concepts#online-evaluations) 提供有关您的制作的实时反馈[traces](/langsmith/observability-concepts#traces)。这对于持续监控应用程序的性能非常有用：识别问题、衡量改进并确保长期稳定的质量。

代码评估器允许您直接在 LangSmith 中用 Python 或 JavaScript 编写评估器。通常用于验证数据的结构或统计属性。

<Note>当在线评估器在跟踪内的任何运行上运行时，跟踪将自动升级到[extended data retention](/langsmith/usage-and-billing#data-retention-auto-upgrades)。此升级将影响跟踪定价，但可确保保留符合您的评估标准的跟踪（通常是对分析最有价值的跟踪）以供调查。 </Note>

## 查看在线评估器

导航到 **跟踪** 页面并选择一个跟踪项目。要查看该项目的现有在线评估程序，请单击“**评估程序**”选项卡。

## 配置在线评估器

### 1. 导航至在线评估器导航到 **跟踪** 页面并选择一个跟踪项目。单击“**评估器**”选项卡，然后单击“**+ 评估器**”以打开“**添加评估器**”面板。选择 **从头开始创建** 下的 **代码评估器** 以构建新的评估器，或从 **附加现有评估器** 下的工作区中选择现有代码评估器。

### 2. 指定您的评估员

提供您的评估员的姓名。在代码中引用评估器时将使用此名称，并且也将是此评估器生成的反馈的名称。

### 3. 创建过滤器

例如，您可能希望根据以下条件应用特定的评估器：

- 当 [user left feedback](/langsmith/attach-user-feedback) 指示响应不令人满意时运行。
- 调用特定工具的运行。请参阅[filtering for tool calls](/langsmith/filter-traces-in-application#example-filtering-for-tool-calls)了解更多信息。
- 与特定元数据片段匹配的运行（例如，如果您使用 `plan_type` 记录跟踪并且只想对来自企业客户的跟踪运行评估）。请参阅[adding metadata to your traces](/langsmith/add-metadata-tags)了解更多信息。

求值器上的过滤器的工作方式与过滤项目中的跟踪时的工作方式相同。更多关于滤镜的信息，可以参考[Filter traces](/langsmith/filter-traces-in-application)。要处理来自早期评估器的反馈，请过滤该评估器以获取反馈键，然后过滤[include extended stats](/langsmith/evaluators#include-extended-stats)。例如，当`answer_usefulness`反馈存在时，使用`has(feedback_key, "answer_usefulness")`运行。过滤器基于反馈键，而不是生成它的评估器，因此来自具有该键的任何源的反馈都会触发代码评估器。

<Tip>
当您为评估器创建过滤器时，检查运行通常很有帮助。打开评估器配置面板后，您可以检查运行并向其应用过滤器。您应用于运行表的任何过滤器都将自动反映在评估器的过滤器中。
</Tip>

### 4.（可选）配置采样率

配置采样率以控制触发自动化操作的过滤运行的百分比。例如，为了控制成本，您可能需要设置一个过滤器以仅将求值器应用于 10% 的迹线。为此，您可以将采样率设置为 0.1。

### 5.（可选）将规则应用于过去的运行通过切换**应用于过去的运行**并输入“回填自”日期，将规则应用于过去的运行。这只有在创建规则时才有可能。注意：回填作为后台作业进行处理，因此您不会立即看到结果。

为了跟踪回填的进度，您可以通过前往跟踪项目中的 **Evaluators** 选项卡并单击您创建的评估器的日志按钮来查看评估器的日志。在线评估器日志类似于[automation rule logs](/langsmith/rules#view-logs-for-your-automations)。

- 添加评估者姓名
- （可选）过滤您想要应用评估器的运行或配置采样率。
- 选择**应用评估器**

## 写出你的评估函数

<Note>
**代码评估器限制。**

**允许的库**：您可以导入所有标准库函数，以及以下公共包：

```
numpy (v2.2.2): "numpy"
pandas (v1.5.2): "pandas"
jsonschema (v4.21.1): "jsonschema"
scipy (v1.14.1): "scipy"
sklearn (v1.26.4): "scikit-learn"
```

**网络访问**：您无法从代码评估器访问互联网。
</Note>

代码评估器必须内联编写。我们建议在 LangSmith 中设置代码评估器之前在本地进行测试。

在 UI 中，您将找到一个面板，可让您内联编写代码以及一些起始代码。

代码评估器接受一个参数：- A `Run` ([reference](/langsmith/run-data-format))。这代表要评估的采样运行。

它们返回一个值：

- 反馈字典：一个字典，其键是您要返回的反馈类型，值是您对该反馈键给出的分数。例如，`{"correctness": 1, "silliness": 0}`会在跑步时创建两种类型的反馈，一种说它是正确的，另一种说它并不愚蠢。

以下示例显示了一个函数，该函数验证实验中的每次运行是否具有已知的 JSON 字段：

<CodeGroup>

```python Python
import json

def perform_eval(run):
  output_to_validate = run['outputs']
  is_valid_json = 0

  # assert you can serialize/deserialize as json
  try:
    json.loads(json.dumps(output_to_validate))
  except Exception as e:
    return { "formatted": False }

  # assert output facts exist
  if "facts" not in output_to_validate:
    return { "formatted": False }

  # assert required fields exist
  if "years_mentioned" not in output_to_validate["facts"]:
    return { "formatted": False }

  return {"formatted": True}
```

```javascript JavaScript
function perform_eval(run) {
    const outputToValidate = run.outputs;

    // Assert you can serialize/deserialize as json
    try {
        JSON.stringify(outputToValidate);
        JSON.parse(JSON.stringify(outputToValidate));
    } catch (e) {
        return { "formatted": false };
    }

    // Assert output facts exist
    if (!("facts" in outputToValidate)) {
        return { "formatted": false };
    }

    // Assert required fields exist
    if (!outputToValidate["facts"].hasOwnProperty("years_mentioned")) {
        return { "formatted": false };
    }

    return { "formatted": true };
}
```

</CodeGroup>

## 测试并保存您的评估函数

保存之前，您可以通过单击“**测试代码**”在最近的运行中测试评估器函数，以确保您的代码正确执行。

一旦您**保存**，您的在线评估器将运行新采样的运行（如果您选择回填选项，则也将运行回填的运行）。

如果您更喜欢视频教程，请查看 LangSmith 课程简介中的 [Online Evaluations video](https://academy.langchain.com/pages/intro-to-langsmith-preview)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/online-evaluations-code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>