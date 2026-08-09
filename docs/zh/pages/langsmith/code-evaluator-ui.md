<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to define a code evaluator | https://docs.langchain.com/langsmith/code-evaluator-ui -->

# 如何定义代码评估器

[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-code-evaluator-ui) 中的代码评估器允许您直接在界面中使用 Python 或 TypeScript 代码编写自定义评估逻辑。与使用模型来评估输出的[LLM-as-a-judge](/langsmith/llm-as-judge)评估器不同，代码评估器使用您定义的确定性逻辑。

<Note>
  要以编程方式创建出现在 LangSmith UI 中的代码评估器，请参阅[Manage evaluators with the SDK](/langsmith/manage-evaluators-sdk)。要定义传递给`evaluate()`的代码评估器函数，请参阅[How to define a code evaluator (SDK)](/langsmith/code-evaluator-sdk)。要根据数据集示例中保存的断言对输出进行评分，请参阅[Use assertions](/langsmith/assertions)。
</Note>

## 步骤 1. 创建评估器

1. 从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-code-evaluator-ui) 中的以下页面之一创建评估器：
   * 在 Playground 中或从数据集中：选择 **+ Evaluator** 按钮。
   * 选择 **添加规则**，配置您的规则并选择 **应用评估程序**。
2. 为您的评估者提供一个清晰的名称，描述其测量的内容（例如“精确匹配”）。
3. 从评估器类型选项中选择**创建代码评估器**。

## 步骤 2. 编写评估器代码

<Note>
  **自定义代码评估器限制。**

  **允许的库**：您可以导入所有标准库函数，以及以下公共包：

  ```
  numpy (v2.2.2): "numpy"
  pandas (v1.5.2): "pandas"
  jsonschema (v4.21.1): "jsonschema"
  scipy (v1.14.1): "scipy"
  sklearn (v1.26.4): "scikit-learn"
  ```**网络访问**：您无法从自定义代码评估器访问互联网。
</Note>

在 **添加自定义代码评估器** 页面中，使用 Python 或 TypeScript 定义评估逻辑。

您的评估器函数必须命名为 `perform_eval` 并且应该：

1. 接受`run`和`example`参数。
2. 通过`run['inputs']`、`run['outputs']`、`example['outputs']` 访问数据。
3. 返回一个字典，其中每个键是指标名称，每个值是该指标的分数。每个键代表您想要返回的一条反馈。例如，`{"correctness": 1, "silliness": 0}` 会在运行中创建两条反馈。

### 函数签名

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def perform_eval(run, example):
    # Access the data
    inputs = run['inputs']
    outputs = run['outputs']
    reference_outputs = example['outputs']  # Optional: reference/expected outputs

    # Your evaluation logic here
    score = ...

    # Return a dict with your metric name
    return {"metric_name": score}
```

### 示例：精确匹配评估器

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def perform_eval(run, example):
    """Check if the answer exactly matches the expected answer."""
    actual = run['outputs']['answer']
    expected = example['outputs']['answer']

    is_correct = actual == expected
    return {"exact_match": is_correct}
```

### 示例：基于输入的评估器

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def perform_eval(run, example):
    """Check if the input text contains toxic language."""
    text = run['inputs'].get('text', '').lower()
    toxic_words = ["idiot", "stupid", "hate", "awful"]

    is_toxic = any(word in text for word in toxic_words)
    return {"is_toxic": is_toxic}
```

## 步骤 3. 测试并保存

1. 使用示例数据测试您的评估器，以确保其按预期工作
2. 单击“**保存**”以使评估器可供使用

## 使用你的代码评估器

创建后，您可以使用代码评估器：

* 从[Playground](/langsmith/prompt-engineering-concepts#playground)运行评估时
* 作为[automatically run evaluations on experiments](/langsmith/bind-evaluator-to-dataset)数据集的一部分

## 相关

* [LLM-as-a-judge evaluator (UI)](/langsmith/llm-as-judge)：使用法学硕士来评估输出
* [Composite evaluators](/langsmith/composite-evaluators-ui)：合并多个评估者分数

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/code-evaluator-ui.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>