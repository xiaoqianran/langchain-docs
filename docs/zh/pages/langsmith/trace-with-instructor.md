<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Instructor applications | https://docs.langchain.com/langsmith/trace-with-instructor -->

# 跟踪教练应用程序

LangSmith 提供了与 [Instructor](https://python.useinstructor.com/) 的便捷集成，[Instructor](https://python.useinstructor.com/) 是一个流行的开源库，用于使用 LLM 生成结构化输出。

为了使用，您首先需要设置您的 LangSmith API 密钥。

```shell
export LANGSMITH_API_KEY=<your-api-key>
# For LangSmith API keys linked to multiple workspaces, set the LANGSMITH_WORKSPACE_ID environment variable to specify which workspace to use.
export LANGSMITH_WORKSPACE_ID=<your-workspace-id>
```

接下来，您需要安装LangSmith SDK：

<CodeGroup>
```bash pip
pip install -U langsmith
```

```bash uv
uv add langsmith
```
</CodeGroup>

用 `langsmith.wrappers.wrap_openai` 包裹您的 OpenAI 客户端

```python
from openai import OpenAI
from langsmith import wrappers

client = wrappers.wrap_openai(OpenAI())
```

之后，您可以使用 `instructor` 修补封装的 OpenAI 客户端：

```python
import instructor

client = instructor.patch(client)
```

现在，您可以像平常一样使用`instructor`，但现在所有内容都记录到LangSmith！

```python
from pydantic import BaseModel


class UserDetail(BaseModel):
    name: str
    age: int


user = client.chat.completions.create(
    model="gpt-5.4-mini",
    response_model=UserDetail,
    messages=[
        {"role": "user", "content": "Extract Jason is 25 years old"},
    ]
)
```

通常，您在其他函数中使用`instructor`。
您可以通过使用这个包装的客户端并使用 `@traceable` 修饰这些函数来获取嵌套跟踪。
有关如何使用 `@traceable` 装饰器注释代码以进行跟踪的更多信息，请参阅 [Custom instrumentation](/langsmith/annotate-code)。

```python {highlight={2}}
# You can customize the run name with the `name` keyword argument
@traceable(name="Extract User Details")
def my_function(text: str) -> UserDetail:
    return client.chat.completions.create(
        model="gpt-5.4-mini",
        response_model=UserDetail,
        messages=[
            {"role": "user", "content": f"Extract {text}"},
        ]
    )

my_function("Jason is 25 years old")
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-instructor.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>