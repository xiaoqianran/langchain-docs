<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to run evaluations with pytest | https://docs.langchain.com/langsmith/pytest -->

# 如何使用 pytest 运行评估

LangSmith pytest 插件允许 Python 开发人员将他们的数据集和评估定义为 pytest 测试用例。

与标准评估流程相比，这在以下情况下很有用：

* **每个示例需要不同的评估逻辑**：标准评估流程假设所有数据集示例中的应用程序和评估器执行一致。对于更复杂的系统或更全面的评估，特定的系统子集可能需要使用特定的输入类型和指标进行评估。这些异构评估更容易编写为一起跟踪的不同测试用例套件。
* **您想要断言二进制期望**：跟踪 LangSmith 中的断言并在本地引发断言错误（例如在 CI 管道中）。测试工具有助于评估系统输出并断言其基本属性。
* **您想要类似 pytest 的终端输出**：获取熟悉的 pytest 输出格式
* **您已经使用 pytest 来测试您的应用程序**：将 LangSmith 跟踪添加到现有 pytest 工作流程

<Info>
JS/TS SDK 有一个类似的[Vitest/Jest integration](/langsmith/vitest-jest)。
</Info>

## 安装

此功能需要 Python SDK 版本`langsmith>=0.3.4`。对于 [rich terminal outputs](#rich-outputs) 和 [test caching](#caching) 等额外功能，请安装：

<CodeGroup>
```bash pip
pip install -U "langsmith[pytest]"
```

```bash uv
uv add "langsmith[pytest]"
```
</CodeGroup>

## 定义并运行测试

pytest 集成允许您将数据集和评估器定义为测试用例。

要跟踪 LangSmith 中的测试，请添加 `@pytest.mark.langsmith` 装饰器。每个修饰的测试用例都将同步到数据集示例。当您运行测试套件时，数据集将被更新，并且将创建一个新实验，每个测试用例都有一个结果。

<CodeGroup>

```python Python
###################### my_app/main.py ######################
import openai
from langsmith import traceable, wrappers

oai_client = wrappers.wrap_openai(openai.OpenAI())

@traceable
def generate_sql(user_query: str) -> str:
    result = oai_client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": "Convert the user query to a SQL query."},
            {"role": "user", "content": user_query},
        ],
    )
    return result.choices[0].message.content

###################### tests/test_my_app.py ######################
import pytest
from langsmith import testing as t

def is_valid_sql(query: str) -> bool:
    """Return True if the query is valid SQL."""
    return True  # Dummy implementation

@pytest.mark.langsmith  # <-- Mark as a LangSmith test case
def test_sql_generation_select_all() -> None:
    user_query = "Get all users from the customers table"
    t.log_inputs({"user_query": user_query})  # <-- Log example inputs, optional
    expected = "SELECT * FROM customers;"
    t.log_reference_outputs({"sql": expected})  # <-- Log example reference outputs, optional

    sql = generate_sql(user_query)
    t.log_outputs({"sql": sql})  # <-- Log run outputs, optional

    t.log_feedback(key="valid_sql", score=is_valid_sql(sql))  # <-- Log feedback, optional
    assert sql == expected  # <-- Test pass/fail status automatically logged to LangSmith under 'pass' feedback key
```

</CodeGroup>

当您运行此测试时，它将有一个基于测试用例通过/失败的默认 `pass` 布尔反馈键。它还将跟踪您记录的任何输入、输出和参考（预期）输出。

像平常一样使用 `pytest` 来运行测试：

```bash
pytest tests/
```

在大多数情况下，我们建议设置测试套件名称：

```bash
LANGSMITH_TEST_SUITE='SQL app tests' pytest tests/
```

每次运行此测试套件时，LangSmith：

* 为每个测试文件创建一个[dataset](/langsmith/evaluation-concepts#datasets)。如果此测试文件的数据集已存在，它将被更新
* 在每个创建/更新的数据集中创建一个[experiment](/langsmith/evaluation-concepts#experiment)
* 为每个测试用例创建一个实验行，其中包含您记录的输入、输出、参考输出和反馈
* 收集每个测试用例在`pass`反馈键下的通过/失败率测试套件数据集如下所示：

![Dataset](/langsmith/images/simple-pytest-dataset.png)

针对该测试套件的实验是什么样的：

![Experiment](/langsmith/images/simple-pytest.png)

## 记录输入、输出和参考输出

每次运行测试时，我们都会将其同步到数据集示例并将其作为运行进行跟踪。我们可以通过几种不同的方式来跟踪示例输入和参考输出以及运行输出。最简单的是使用 `log_inputs`、`log_outputs` 和 `log_reference_outputs` 方法。您可以在测试中随时运行这些命令来更新示例并运行该测试：

```python
import pytest
from langsmith import testing as t

@pytest.mark.langsmith
def test_foo() -> None:
    t.log_inputs({"a": 1, "b": 2})
    t.log_reference_outputs({"foo": "bar"})
    t.log_outputs({"foo": "baz"})
    assert True
```

运行此测试将创建/更新一个名为“test_foo”的示例，输入`{"a": 1, "b": 2}`，参考输出`{"foo": "bar"}`，并跟踪输出`{"foo": "baz"}`的运行。

**注意**：如果运行 `log_inputs`、`log_outputs` 或 `log_reference_outputs` 两次，之前的值将被覆盖。

定义示例输入和参考输出的另一种方法是通过 pytest 固定装置/参数化。默认情况下，测试函数的任何参数都将记录为相应示例的输入。如果某些参数旨在表示参考输出，您可以指定应使用 `@pytest.mark.langsmith(output_keys=["name_of_ref_output_arg"])` 来记录它们：

```python
import pytest

@pytest.fixture
def c() -> int:
    return 5

@pytest.fixture
def d() -> int:
    return 6

@pytest.mark.langsmith(output_keys=["d"])
def test_cd(c: int, d: int) -> None:
    result = 2 * c
    t.log_outputs({"d": result})  # Log run outputs
    assert result == d
```这将创建/同步一个名为“test_cd”的示例，输入`{"c": 5}`和参考输出`{"d": 6}`，并运行输出`{"d": 10}`。

## 记录反馈

默认情况下，LangSmith收集每个测试用例的`pass`反馈键下的通过/失败率。您可以使用 `log_feedback` 添加其他反馈。

```python
import openai
import pytest
from langsmith import wrappers
from langsmith import testing as t

oai_client = wrappers.wrap_openai(openai.OpenAI())

@pytest.mark.langsmith
def test_offtopic_input() -> None:
    user_query = "what's up"
    t.log_inputs({"user_query": user_query})

    sql = generate_sql(user_query)
    t.log_outputs({"sql": sql})

    expected = "Sorry that is not a valid query."
    t.log_reference_outputs({"sql": expected})

    # Use this context manager to trace any steps used for generating evaluation
    # feedback separately from the main application logic
    with t.trace_feedback():
        instructions = (
            "Return 1 if the ACTUAL and EXPECTED answers are semantically equivalent, "
            "otherwise return 0. Return only 0 or 1 and nothing else."
        )

        grade = oai_client.chat.completions.create(
            model="gpt-5.4-mini",
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": f"ACTUAL: {sql}\nEXPECTED: {expected}"},
            ],
        )
        score = float(grade.choices[0].message.content)
        t.log_feedback(key="correct", score=score)

    assert score
```

请注意`trace_feedback()`上下文管理器的使用。这使得 LLM 作为法官的调用与测试用例的其余部分分开跟踪。它不会显示在主测试用例运行中，而是显示在 `correct` 反馈键的跟踪中。

**注意**：确保与反馈跟踪关联的 `log_feedback` 调用发生在 `trace_feedback` 上下文中。这样我们就能够将反馈与跟踪相关联，并且当在 UI 中看到反馈时，您将能够单击它来查看生成它的跟踪。

## 跟踪中间调用

LangSmith 将自动跟踪测试用例执行过程中发生的任何可跟踪的中间调用。

## 将测试分组到测试套件中默认情况下，给定文件中的所有测试将被分组为具有相应数据集的单个“测试套件”。您可以通过将 `test_suite_name` 参数传递给 `@pytest.mark.langsmith` 进行具体情况分组来配置测试属于哪个测试套件，或者您可以设置 `LANGSMITH_TEST_SUITE` 环境变量以将执行中的所有测试分组到单个测试套件中：

```bash
LANGSMITH_TEST_SUITE="SQL app tests" pytest tests/
```

我们通常建议设置 `LANGSMITH_TEST_SUITE` 以获得所有结果的综合视图。

## 命名实验

您可以使用 `LANGSMITH_EXPERIMENT` 环境变量命名实验：

```bash
LANGSMITH_TEST_SUITE="SQL app tests" LANGSMITH_EXPERIMENT="baseline" pytest tests/
```

## 实验元数据

您可以将自定义元数据附加到每次测试运行创建的实验（项目）。这对于跟踪给定实验使用的模型、提示版本或环境非常有用。

**选项 1：固定装置（推荐）**

在 `conftest.py` 中定义一个会话范围的装置：

```python
# conftest.py
import os
import pytest

@pytest.fixture(scope="session")
def langsmith_experiment_metadata():
    return {
        "model": "gpt-4o",
        "prompt_version": "v2.3",
        "environment": os.environ.get("ENV", "local"),
    }
```

该装置是动态的（可以读取环境变量、调用函数等）并遵循 pytest 的 `conftest.py` 层次结构，因此它可以按目录限定范围。

**选项 2：环境变量**

将 `LANGSMITH_EXPERIMENT_METADATA` 设置为 JSON 字符串。这在您不想修改代码的 CI/CD 管道中非常有用：

```bash
LANGSMITH_EXPERIMENT_METADATA='{"model":"gpt-4o","env":"staging"}' pytest tests/
```如果同时设置了固定装置和环境变量，则固定装置优先。系统管理的元数据密钥（例如 `revision_id` 和 git info）始终优先于用户提供的密钥。

<Note>
此功能需要`langsmith>=0.7.13`。
</Note>

## 缓存

CI 中每次提交的法学硕士可能会变得昂贵。为了节省时间和资源，LangSmith 允许您将 HTTP 请求缓存到磁盘。要启用缓存，请使用 `langsmith[pytest]` 安装并设置环境变量：`LANGSMITH_TEST_CACHE=/my/cache/path`：

<CodeGroup>
```bash pip
pip install -U "langsmith[pytest]"
LANGSMITH_TEST_CACHE=tests/cassettes pytest tests/my_llm_tests
```

```bash uv
uv add "langsmith[pytest]"
LANGSMITH_TEST_CACHE=tests/cassettes pytest tests/my_llm_tests
```
</CodeGroup>

所有请求都将缓存到 `tests/cassettes` 并在后续运行时从那里加载。如果您将其签入存储库，您的 CI 也将能够使用缓存。

在 `langsmith>=0.4.10` 中，您可以有选择地启用对单个 URL 或主机名的请求的缓存，如下所示：

```python
@pytest.mark.langsmith(cached_hosts=["api.openai.com", "https://api.anthropic.com"])
def my_test():
    ...
```

## pytest 功能

`@pytest.mark.langsmith` 旨在不妨碍您，并且与熟悉的 `pytest` 功能配合良好。

### 使用 `pytest.mark.parametrize` 进行参数化

您可以像以前一样使用 `parametrize` 装饰器。这将为测试的每个参数化实例创建一个新的测试用例。

```python
@pytest.mark.langsmith(output_keys=["expected_sql"])
@pytest.mark.parametrize(
    "user_query, expected_sql",
    [
        ("Get all users from the customers table", "SELECT * FROM customers"),
        ("Get all users from the orders table", "SELECT * FROM orders"),
    ],
)
def test_sql_generation_parametrized(user_query, expected_sql):
    sql = generate_sql(user_query)
    assert sql == expected_sql
```

**注意：** 随着参数化列表的增长，您可以考虑使用 `evaluate()` 代替。这使得评估并行化，并且更容易控制单个实验和相应的数据集。### 与 `pytest-xdist` 并行

您可以像平常一样使用 [pytest-xdist](https://pytest-xdist.readthedocs.io/en/stable/) 来并行化测试执行：

<CodeGroup>
```bash pip
pip install -U pytest-xdist
pytest -n auto tests
```

```bash uv
uv add pytest-xdist
pytest -n auto tests
```
</CodeGroup>

### 使用 `pytest-asyncio` 进行异步测试

`@pytest.mark.langsmith` 适用于同步或异步测试，因此您可以像以前一样运行异步测试。

### `pytest-watch` 观看模式

使用监视模式快速迭代您的测试。我们*强烈*建议仅在启用测试缓存（见下文）的情况下使用它，以避免不必要的 LLM 调用：

<CodeGroup>
```bash pip
pip install pytest-watch
LANGSMITH_TEST_CACHE=tests/cassettes ptw tests/my_llm_tests
```

```bash uv
uv add pytest-watch
LANGSMITH_TEST_CACHE=tests/cassettes ptw tests/my_llm_tests
```
</CodeGroup>

## 丰富的输出

如果您想查看测试运行的 LangSmith 结果的丰富显示，您可以指定 `--langsmith-output`：

```bash
pytest --langsmith-output tests
```

**注意：** 该标志曾经是 `langsmith<=0.3.3` 中的 `--output=langsmith`，但已更新以避免与其他 pytest 插件发生冲突。

每个测试套件都会有一个漂亮的表，当结果上传到LangSmith时，该表会实时更新：

![Rich pytest outputs](/langsmith/images/rich-pytest-outputs.png)

使用此功能的一些重要注意事项：

* 确保您已安装`pip install -U "langsmith[pytest]"`
* 丰富的输出目前不适用于`pytest-xdist`

<Note>
    自定义输出删除了所有标准 pytest 输出。如果您尝试调试一些意外行为，通常最好显示常规 pytest 输出，以便获得完整的错误跟踪。
</Note>

## 试运行模式如果您想运行测试而不将结果同步到LangSmith，您可以在您的环境中设置`LANGSMITH_TEST_TRACKING=false`。

```bash
LANGSMITH_TEST_TRACKING=false pytest tests/
```

测试将正常运行，但实验日志不会发送到LangSmith。

## 期望

LangSmith 提供了 [expect](https://reference.langchain.com/python/langsmith/observability/sdk/expect/) 实用程序来帮助定义对 LLM 输出的期望。例如：

```python
from langsmith import expect

@pytest.mark.langsmith
def test_sql_generation_select_all():
    user_query = "Get all users from the customers table"
    sql = generate_sql(user_query)
    expect(sql).to_contain("customers")
```

这会将二进制“期望”分数记录到实验结果中，另外 `assert`ing 满足期望可能会触发测试失败。

`expect`还提供了“模糊匹配”方法。例如：

```python
@pytest.mark.langsmith(output_keys=["expectation"])
@pytest.mark.parametrize(
    "query, expectation",
    [
       ("what's the capital of France?", "Paris"),
    ],
)
def test_embedding_similarity(query, expectation):
    prediction = my_chatbot(query)
    expect.embedding_distance(
        # This step logs the distance as feedback for this run
        prediction=prediction, expectation=expectation
        # Adding a matcher (in this case, 'to_be_*"), logs 'expectation' feedback
    ).to_be_less_than(0.5) # Optional predicate to assert against

    expect.edit_distance(
        # This computes the normalized Damerau-Levenshtein distance between the two strings
        prediction=prediction, expectation=expectation
        # If no predicate is provided below, 'assert' isn't called, but the score is still logged
    )
```

该测试用例将被分配 4 个分数：

1. 预测与期望之间的`embedding_distance`
2. 二进制`expectation`分数（余弦距离小于0.5则为1，否则为0）
3. 预测与期望之间的`edit_distance`
4. 总体测试通过/失败分数（二进制）

`expect` 实用程序是根据 [Jest](https://jestjs.io/docs/expect) 的预期 API 建模的，具有一些现成的功能，可以更轻松地对 LLM 进行评分。

## 遗产

#### `@test` / `@unit` 装饰器

标记测试用例的传统方法是使用 `@test` 或 `@unit` 装饰器：

```python
from langsmith import test

@test
def test_foo() -> None:
    pass
```

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/pytest.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>