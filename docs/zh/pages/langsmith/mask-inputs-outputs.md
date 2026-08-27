<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prevent logging of sensitive data in traces | https://docs.langchain.com/langsmith/mask-inputs-outputs -->

# 防止在痕迹中记录敏感数据

使用 LangSmith 跟踪时，您可能需要防止记录敏感信息，以维护隐私并遵守安全要求。 LangSmith 提供了多种方法来在数据发送到后端之前保护您的数据：

- [Completely hide inputs and outputs](#hide-inputs-and-outputs) 使用环境变量或 [Client](https://reference.langchain.com/python/langsmith/client/Client) 配置。
- [Hide metadata](#hide-metadata) 删除或转换运行元数据。
- [Apply rule-based masking](#rule-based-masking-of-inputs-and-outputs) 使用正则表达式模式或匿名库来选择性地编辑敏感信息。
- [Redact secrets from traces](/langsmith/redact-secrets) 使用 SDK 匿名器以及 API 密钥、令牌和凭证的现成正则表达式模式。
- [Process inputs and outputs for individual functions](#processing-inputs-and-outputs-for-a-single-function) 具有功能级定制。
- [Use third-party anonymizers](#examples) 类似于 Microsoft Presidio 和 Amazon Comprehend，用于高级 PII 检测。
- [Batch process run operations](#batch-processing-for-high-throughput-masking) 一次在多个运行中应用昂贵的屏蔽逻辑，减少每次运行的开销。 LangSmith 进程在后台线程中运行，这不会阻塞您的应用程序。
- [Redact inputs and outputs per request](/langsmith/conditional-tracing#conditionally-redact-inputs-and-outputs) 使用 `tracing_context` 仅屏蔽特定调用的数据（例如，基于租户或功能标志），同时保持其他跟踪不变。<Note>
如果您的合规性或隐私要求要求某些操作根本不应该被跟踪（例如，具有零保留策略的客户端），请考虑使用 [conditional tracing](/langsmith/conditional-tracing) 有选择地禁用对特定请求的跟踪，而不是屏蔽数据。
</Note>

## 隐藏输入和输出

如果您想完全隐藏跟踪的输入和输出，您可以在运行应用程序时设置以下环境变量：

```bash
LANGSMITH_HIDE_INPUTS=true
LANGSMITH_HIDE_OUTPUTS=true
```

这适用于 LangSmith SDK（Python 和 TypeScript）和 LangChain。

您还可以为给定的 [Client](https://reference.langchain.com/python/langsmith/client/Client) 实例自定义和覆盖此行为。这可以通过在 [Client](https://reference.langchain.com/python/langsmith/client/Client) 对象上设置 `hide_inputs` 和 `hide_outputs` 参数（TypeScript 中的`hideInputs` 和 `hideOutputs`）来完成。

以下示例为 `hide_inputs` 和 `hide_outputs` 返回一个空对象，但您可以根据需要对此进行自定义：

<CodeGroup>

```python Python
import openai
from langsmith import Client
from langsmith.wrappers import wrap_openai

openai_client = wrap_openai(openai.Client())
langsmith_client = Client(
    hide_inputs=lambda inputs: {}, hide_outputs=lambda outputs: {}
)

# The trace produced will have its metadata present, but the inputs will be hidden
openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
    ],
    langsmith_extra={"client": langsmith_client},
)

# The trace produced will not have hidden inputs and outputs
openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
    ],
)
```

```typescript TypeScript
import OpenAI from "openai";
import { Client } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers";

const langsmithClient = new Client({
    hideInputs: (inputs) => ({}),
    hideOutputs: (outputs) => ({}),
});

// The trace produced will have its metadata present, but the inputs will be hidden
const filteredOAIClient = wrapOpenAI(new OpenAI(), {
    client: langsmithClient,
});
await filteredOAIClient.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
    ],
});

const openaiClient = wrapOpenAI(new OpenAI());
// The trace produced will not have hidden inputs and outputs
await openaiClient.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
    ],
});
```

</CodeGroup>

## 隐藏元数据`hide_metadata` 参数允许您控制在使用 LangSmith Python SDK 进行跟踪时是否隐藏或转换运行元数据。创建运行时，元数据通过 `extra` 参数传递（例如，`extra={"metadata": {...}}`）。 `hide_metadata` 对于删除敏感信息、遵守隐私要求或减少发送到 LangSmith 的数据量非常有用。您可以通过两种方式配置元数据隐藏：

- 使用 SDK：

    ```python
    from langsmith import Client

    client = Client(hide_metadata=True)
    ```

- 使用环境变量：

    ```bash
    export LANGSMITH_HIDE_METADATA=true
    ```

`hide_metadata`参数接受三种类型的值：

- `True`：完全删除所有元数据（发送空字典）。
- `False` 或 `None`：按原样保留元数据（默认行为）。
- `Callable`：转换元数据字典的自定义函数。

设置后，此参数会影响由 [Client](https://reference.langchain.com/python/langsmith/client/Client) 创建或更新的所有运行的 `extra` 参数中的 `metadata` 字段，包括通过 `@traceable` 装饰器或 LangChain 集成创建的运行。

### 隐藏所有元数据

设置 `hide_metadata=True` 以从发送到 LangSmith 的运行中完全删除所有元数据：

```python
from langsmith import Client

# Hide all metadata completely
client = Client(hide_metadata=True)

# Now when you create runs, metadata will be empty
client.create_run(
    "my_run",
    inputs={"question": "What is 2+2?"},
    run_type="llm",
    extra={"metadata": {"user_id": "123", "session": "abc"}}
)
# The metadata sent to LangSmith will be {} instead of the provided metadata
```

### 自定义转换

在将元数据发送到 LangSmith 之前，使用可调用函数有选择地过滤、编辑或修改元数据：

```python
# Remove sensitive keys
def hide_sensitive_metadata(metadata: dict) -> dict:
    return {k: v for k, v in metadata.items() if not k.startswith("_private")}

client = Client(hide_metadata=hide_sensitive_metadata)

# Redact specific values
def redact_emails(metadata: dict) -> dict:
    import re
    result = {}
    for k, v in metadata.items():
        if isinstance(v, str) and "@" in v:
            result[k] = "[REDACTED_EMAIL]"
        else:
            result[k] = v
    return result

client = Client(hide_metadata=redact_emails)

# Add transformation marker
def add_marker(metadata: dict) -> dict:
    return {**metadata, "transformed": True}

client = Client(hide_metadata=add_marker)
```

## 基于规则的输入和输出屏蔽<Info>
此功能在以下 LangSmith SDK 版本中可用：

* Python：0.1.81及以上
* TypeScript：0.1.33 及以上
</Info>

要屏蔽输入和输出中的特定数据，您可以使用 `create_anonymizer` / `createAnonymizer` 函数，并在实例化 [Client](https://reference.langchain.com/python/langsmith/client/Client) 时传递新创建的匿名器。匿名器可以从正则表达式模式和替换值的列表构造，也可以从接受并返回字符串值的函数构造。

<Tip>
有关编辑 API 密钥、令牌和其他凭据的信息，请参阅 [Redact secrets from traces](/langsmith/redact-secrets) 了解现成的正则表达式模式和配方。
</Tip>

如果`LANGSMITH_HIDE_INPUTS = true`，匿名器将被跳过。如果`LANGSMITH_HIDE_OUTPUTS = true`，同样适用于输出。

但是，如果要将输入或输出发送到[Client](https://reference.langchain.com/python/langsmith/client/Client)，则`anonymizer`方法将优先于`hide_inputs`和`hide_outputs`中的函数。默认情况下，`create_anonymizer` 最多仅查看 10 层嵌套深度，可以通过 `max_depth` 参数进行配置。

<CodeGroup>

```python Python
from langsmith.anonymizer import create_anonymizer
from langsmith import Client, traceable
import re

# create anonymizer from list of regex patterns and replacement values
anonymizer = create_anonymizer([
    { "pattern": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}", "replace": "<email-address>" },
    { "pattern": r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", "replace": "<UUID>" }
])

# or create anonymizer from a function
email_pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}")
uuid_pattern = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
anonymizer = create_anonymizer(
    lambda text: email_pattern.sub("<email-address>", uuid_pattern.sub("<UUID>", text))
)

client = Client(anonymizer=anonymizer)

@traceable(client=client)
def main(inputs: dict) -> dict:
    ...
```

```typescript TypeScript
import { createAnonymizer } from "langsmith/anonymizer"
import { traceable } from "langsmith/traceable"
import { Client } from "langsmith"

// create anonymizer from list of regex patterns and replacement values
const anonymizer = createAnonymizer([
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/g, replace: "<email>" },
    { pattern: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, replace: "<uuid>" }
])

// or create anonymizer from a function
const anonymizer = createAnonymizer((value) => value.replace("...", "<value>"))

const client = new Client({ anonymizer })

const main = traceable(async (inputs: any) => {
    // ...
}, { client })
```

</CodeGroup>

请注意，使用匿名器可能会因复杂的正则表达式或大型负载而导致性能下降，因为匿名器在处理之前会将负载序列化为 JSON。<Note>
提高 `anonymizer` API 的性能已列入我们的路线图！如果您遇到性能问题，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。
</Note>

![Hide inputs outputs](/langsmith/images/hide-inputs-outputs.png)

旧版本的LangSmith SDK 可以使用 `hide_inputs` 和 `hide_outputs` 参数来达到相同的效果。您还可以使用这些参数来更有效地处理输入和输出。

<CodeGroup>

```python Python
import re
from langsmith import Client, traceable

# Define the regex patterns for email addresses and UUIDs
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}"
UUID_REGEX = r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"

def replace_sensitive_data(data, depth=10):
    if depth == 0:
        return data
    if isinstance(data, dict):
        return {k: replace_sensitive_data(v, depth-1) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_sensitive_data(item, depth-1) for item in data]
    elif isinstance(data, str):
        data = re.sub(EMAIL_REGEX, "<email-address>", data)
        data = re.sub(UUID_REGEX, "<UUID>", data)
        return data
    else:
        return data

client = Client(
    hide_inputs=lambda inputs: replace_sensitive_data(inputs),
    hide_outputs=lambda outputs: replace_sensitive_data(outputs)
)

inputs = {"role": "user", "content": "Hello! My email is user@example.com and my ID is 123e4567-e89b-12d3-a456-426614174000."}
outputs = {"role": "assistant", "content": "Hi! I've noted your email as user@example.com and your ID as 123e4567-e89b-12d3-a456-426614174000."}

@traceable(client=client)
def child(inputs: dict) -> dict:
    return outputs

@traceable(client=client)
def parent(inputs: dict) -> dict:
    child_outputs = child(inputs)
    return child_outputs

parent(inputs)
```

```typescript TypeScript
import { Client } from "langsmith";
import { traceable } from "langsmith/traceable";

// Define the regex patterns for email addresses and UUIDs
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/g;
const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

function replaceSensitiveData(data: any, depth: number = 10): any {
    if (depth === 0) return data;
    if (typeof data === "object" && !Array.isArray(data)) {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = replaceSensitiveData(value, depth - 1);
        }
        return result;
    } else if (Array.isArray(data)) {
        return data.map(item => replaceSensitiveData(item, depth - 1));
    } else if (typeof data === "string") {
        return data.replace(EMAIL_REGEX, "<email-address>").replace(UUID_REGEX, "<UUID>");
    } else {
        return data;
    }
}

const langsmithClient = new Client({
    hideInputs: (inputs) => replaceSensitiveData(inputs),
    hideOutputs: (outputs) => replaceSensitiveData(outputs)
});

const inputs = {
    role: "user",
    content: "Hello! My email is user@example.com and my ID is 123e4567-e89b-12d3-a456-426614174000."
};
const outputs = {
    role: "assistant",
    content: "Hi! I've noted your email as <email-address> and your ID as <UUID>."
};

const child = traceable(async (inputs: any) => {
    return outputs;
}, { name: "child", client: langsmithClient });

const parent = traceable(async (inputs: any) => {
    const childOutputs = await child(inputs);
    return childOutputs;
}, { name: "parent", client: langsmithClient });

await parent(inputs);
```

</CodeGroup>

## 处理单个函数的输入和输出

<Info>
`process_outputs` 参数在适用于 Python 的 LangSmith SDK 版本 0.1.98 及更高版本中可用。
</Info>

除了[Client](https://reference.langchain.com/python/langsmith/client/Client)级别的输入输出处理之外，LangSmith还通过`@traceable`装饰器的`process_inputs`和`process_outputs`参数提供函数级别的处理。

这些参数接受函数，允许您在将特定函数的输入和输出记录到LangSmith之前对其进行转换。这对于减少有效负载大小、删除敏感信息或自定义对象如何在 LangSmith 中针对特定函数进行序列化和表示非常有用。

以下是如何使用 `process_inputs` 和 `process_outputs` 的示例：

```python
from langsmith import traceable

def process_inputs(inputs: dict) -> dict:
    # inputs is a dictionary where keys are argument names and values are the provided arguments
    # Return a new dictionary with processed inputs
    return {
        "processed_key": inputs.get("my_cool_key", "default"),
        "length": len(inputs.get("my_cool_key", ""))
    }

def process_outputs(output: Any) -> dict:
    # output is the direct return value of the function
    # Transform the output into a dictionary
    # In this case, "output" will be an integer
    return {"processed_output": str(output)}

@traceable(process_inputs=process_inputs, process_outputs=process_outputs)
def my_function(my_cool_key: str) -> int:
    # Function implementation
    return len(my_cool_key)

result = my_function("example")
```在此示例中，`process_inputs` 使用处理后的输入数据创建一个新字典，`process_outputs` 在记录到 LangSmith 之前将输出转换为特定格式。

<Warning>
建议避免改变处理器函数中的源对象。相反，使用处理后的数据创建并返回新对象。
</Warning>

对于异步函数，用法类似：

```python
@traceable(process_inputs=process_inputs, process_outputs=process_outputs)
async def async_function(key: str) -> int:
    # Async implementation
    return len(key)
```

当定义了[Client](https://reference.langchain.com/python/langsmith/client/Client)级别处理器（`hide_inputs`和`hide_outputs`）时，这些功能级处理器优先于两者。

## 示例

您可以将基于规则的屏蔽与各种匿名器结合起来，以清除输入和输出中的敏感信息。以下示例将介绍如何使用正则表达式、Microsoft Presidio 和 Amazon Comprehend。

### 正则表达式

<Info>
下面的实现并不详尽，可能会遗漏一些格式或边缘情况。在生产中使用任何实现之前，请对其进行彻底测试。
</Info>

您可以使用正则表达式在输入和输出发送到LangSmith之前对其进行屏蔽。下面的实现屏蔽了电子邮件地址、电话号码、全名、信用卡号和 SSN。

```python
import re
import openai
from langsmith import Client
from langsmith.wrappers import wrap_openai

# Define regex patterns for various PII
SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
CREDIT_CARD_PATTERN = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_PATTERN = re.compile(r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
FULL_NAME_PATTERN = re.compile(r'\b([A-Z][a-z]*\s[A-Z][a-z]*)\b')

def regex_anonymize(text):
    """
    Anonymize sensitive information in the text using regex patterns.
    Args:
        text (str): The input text to be anonymized.
    Returns:
        str: The anonymized text.
    """
    # Replace sensitive information with placeholders
    text = SSN_PATTERN.sub('[REDACTED SSN]', text)
    text = CREDIT_CARD_PATTERN.sub('[REDACTED CREDIT CARD]', text)
    text = EMAIL_PATTERN.sub('[REDACTED EMAIL]', text)
    text = PHONE_PATTERN.sub('[REDACTED PHONE]', text)
    text = FULL_NAME_PATTERN.sub('[REDACTED NAME]', text)
    return text

def recursive_anonymize(data, depth=10):
    """
    Recursively traverse the data structure and anonymize sensitive information.
    Args:
        data (any): The input data to be anonymized.
        depth (int): The current recursion depth to prevent excessive recursion.
    Returns:
        any: The anonymized data.
    """
    if depth == 0:
        return data
    if isinstance(data, dict):
        anonymized_dict = {}
        for k, v in data.items():
            anonymized_value = recursive_anonymize(v, depth - 1)
            anonymized_dict[k] = anonymized_value
        return anonymized_dict
    elif isinstance(data, list):
        anonymized_list = []
        for item in data:
            anonymized_item = recursive_anonymize(item, depth - 1)
            anonymized_list.append(anonymized_item)
        return anonymized_list
    elif isinstance(data, str):
        anonymized_data = regex_anonymize(data)
        return anonymized_data
    else:
        return data

openai_client = wrap_openai(openai.Client())

# Initialize the LangSmith Client with the anonymization functions
langsmith_client = Client(
    hide_inputs=recursive_anonymize, hide_outputs=recursive_anonymize
)

# The trace produced will have its metadata present, but the inputs and outputs will be anonymized
response_with_anonymization = openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "My name is John Doe, my SSN is 123-45-6789, my credit card number is 4111 1111 1111 1111, my email is john.doe@example.com, and my phone number is (123) 456-7890."},
    ],
    langsmith_extra={"client": langsmith_client},
)

# The trace produced will not have anonymized inputs and outputs
response_without_anonymization = openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "My name is John Doe, my SSN is 123-45-6789, my credit card number is 4111 1111 1111 1111, my email is john.doe@example.com, and my phone number is (123) 456-7890."},
    ],
)
```

匿名运行在LangSmith中将如下所示：![Anonymized run](/langsmith/images/regex-anonymized.png)非匿名运行在LangSmith中将如下所示：![Non-anonymized run](/langsmith/images/regex-not-anonymized.png)

### 微软 Presidio

<Info>
下面的实现提供了如何对用户和 LLM 之间交换的消息中的敏感信息进行匿名化的一般示例。它并不详尽，也没有考虑到所有情况。在生产中使用任何实现之前，请对其进行彻底测试。
</Info>

Microsoft Presidio 是一个数据保护和去标识化 SDK。下面的实现使用 Presidio 在将输入和输出发送到LangSmith之前对其进行匿名化。有关最新信息，请参阅 Presidio 的[official documentation](https://microsoft.github.io/presidio/)。

要使用 Presidio 及其 spaCy 模型，请安装以下软件：

<CodeGroup>
```bash pip
pip install presidio-analyzer
pip install presidio-anonymizer
python -m spacy download en_core_web_lg
```

```bash uv
uv add presidio-analyzer
uv add presidio-anonymizer
python -m spacy download en_core_web_lg
```
</CodeGroup>

另外，安装OpenAI：

<CodeGroup>
```bash pip
pip install openai
```

```bash uv
uv add openai
```
</CodeGroup>

```python
import openai
from langsmith import Client
from langsmith.wrappers import wrap_openai
from presidio_anonymizer import AnonymizerEngine
from presidio_analyzer import AnalyzerEngine

anonymizer = AnonymizerEngine()
analyzer = AnalyzerEngine()

def presidio_anonymize(data):
    """
    Anonymize sensitive information sent by the user or returned by the model.
    Args:
        data (any): The data to be anonymized.
    Returns:
        any: The anonymized data.
    """
    message_list = (
        data.get('messages') or [data.get('choices', [{}])[0].get('message')]
    )
    if not message_list or not all(isinstance(msg, dict) and msg for msg in message_list):
        return data

    for message in message_list:
        content = message.get('content', '')
        if not content.strip():
            print("Empty content detected. Skipping anonymization.")
            continue

        results = analyzer.analyze(
            text=content,
            entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "US_SSN"],
            language='en'
        )
        anonymized_result = anonymizer.anonymize(
            text=content,
            analyzer_results=results
        )
        message['content'] = anonymized_result.text

    return data

openai_client = wrap_openai(openai.Client())

# initialize the langsmith Client with the anonymization functions
langsmith_client = Client(
  hide_inputs=presidio_anonymize, hide_outputs=presidio_anonymize
)

# The trace produced will have its metadata present, but the inputs and outputs will be anonymized
response_with_anonymization = openai_client.chat.completions.create(
  model="gpt-5.4-mini",
  messages=[
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"},
  ],
  langsmith_extra={"client": langsmith_client},
)

# The trace produced will not have anonymized inputs and outputs
response_without_anonymization = openai_client.chat.completions.create(
  model="gpt-5.4-mini",
  messages=[
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"},
  ],
)
```

匿名运行在LangSmith中将如下所示：![Anonymized run](/langsmith/images/presidio-anonymized.png)

非匿名运行在LangSmith中将如下所示：![Non-anonymized run](/langsmith/images/presidio-not-anonymized.png)

### 亚马逊理解

<Info>
下面的实施提供了如何使用 Amazon Comprehend 对敏感信息进行匿名化的一般示例。它并不详尽，也没有考虑所有运行形状或内容类型。在生产中使用任何实现之前，请对其进行彻底测试。
</Info>Comprehend 是一种自然语言处理服务，可以检测个人身份信息。下面的实现使用 Comprehend 的 [⟦T69⟧](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectPiiEntities.html) API 在输入和输出发送到 LangSmith 之前对其进行匿名化。

<Warning>
Amazon Comprehend **不**提供批量 PII 终端节点。 `detect_pii_entities` 每次调用处理一份文档，`batch_detect_entities` 检测通用实体（人员、地点、组织）——它不是特定于 PII 的 API。要处理许多文档，可以在循环中调用 `detect_pii_entities`（如下所示），或者对 S3 中的文档使用异步 [⟦T73⟧](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_StartPiiEntitiesDetectionJob.html)。
</Warning>

要使用 Comprehend，请安装 [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html)：

<CodeGroup>
```bash pip
pip install boto3
```

```bash uv
uv add boto3
```
</CodeGroup>

另外，安装OpenAI：

<CodeGroup>
```bash pip
pip install openai
```

```bash uv
uv add openai
```
</CodeGroup>

您需要在 AWS 中设置凭证并使用 AWS CLI 进行身份验证。沿[AWS Comprehend setup instructions](https://docs.aws.amazon.com/comprehend/latest/dg/setting-up.html)行驶。

下面的示例递归地遍历整个输入/输出负载，并通过 Comprehend 运行每个字符串。遍历有效负载（而不是仅检查 `data["messages"]` 或 `data["choices"][0]["message"]`）可确保 PII 在所有形状的跨度上进行清理，而不仅仅是聊天完成形状的运行。

```python
import openai
import boto3
from langsmith import Client
from langsmith.wrappers import wrap_openai

comprehend = boto3.client("comprehend", region_name="us-east-1")

# Skip strings shorter than this — Comprehend rarely finds PII in them
# and skipping reduces API calls significantly.
MIN_LENGTH_FOR_DETECTION = 3
# Comprehend's per-call text limit is 100 KB of UTF-8.
MAX_BYTES_PER_CALL = 100_000

def redact_pii_entities(text: str, entities: list) -> str:
    """Replace each detected entity with `[TYPE]`, working back-to-front to preserve offsets."""
    for entity in sorted(entities, key=lambda e: e["BeginOffset"], reverse=True):
        begin, end = entity["BeginOffset"], entity["EndOffset"]
        text = text[:begin] + f"[{entity['Type']}]" + text[end:]
    return text

def detect_and_redact(text: str) -> str:
    """Detect PII in `text` with Comprehend and return the redacted version."""
    if not text or len(text) < MIN_LENGTH_FOR_DETECTION:
        return text
    if len(text.encode("utf-8")) > MAX_BYTES_PER_CALL:
        # Skip oversized strings — chunk them yourself if you need to redact them.
        return text
    try:
        response = comprehend.detect_pii_entities(Text=text, LanguageCode="en")
    except Exception as e:
        print(f"Comprehend error: {e}")
        return text
    entities = response.get("Entities", [])
    return redact_pii_entities(text, entities) if entities else text

def comprehend_anonymize(data, depth: int = 10):
    """
    Recursively walk a payload and redact PII in every string we find.
    This works on arbitrary run shapes — chat messages, tool inputs/outputs,
    retrieval results, custom run types, etc.
    """
    if depth == 0:
        return data
    if isinstance(data, dict):
        return {k: comprehend_anonymize(v, depth - 1) for k, v in data.items()}
    if isinstance(data, list):
        return [comprehend_anonymize(item, depth - 1) for item in data]
    if isinstance(data, str):
        return detect_and_redact(data)
    return data

openai_client = wrap_openai(openai.Client())

# initialize the langsmith Client with the anonymization functions
langsmith_client = Client(
    hide_inputs=comprehend_anonymize, hide_outputs=comprehend_anonymize
)

# The trace produced will have its metadata present, but the inputs and outputs will be anonymized
response_with_anonymization = openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"},
    ],
    langsmith_extra={"client": langsmith_client},
)

# The trace produced will not have anonymized inputs and outputs
response_without_anonymization = openai_client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"},
    ],
)
```<Note>
由于 `comprehend_anonymize` 对遇到的每个字符串发出一个 Comprehend API 调用，因此它可能会在高吞吐量跟踪上受到速率限制。为了获得更高的吞吐量，请使用[batch processing approach below](#batch-processing-for-high-throughput-masking)，或使用[⟦T77⟧](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_ContainsPiiEntities.html)进行预过滤，并且仅在存在 PII 时调用`detect_pii_entities`。
</Note>

匿名运行在LangSmith中将如下所示：![Anonymized run](/langsmith/images/aws-comprehend-anonymized.png)

非匿名运行在LangSmith中将如下所示：![Non-anonymized run](/langsmith/images/aws-comprehend-not-anonymized.png)

#### 将 `create_anonymizer` 与 Comprehend 结合使用

如果您更喜欢 LangSmith 的内置 [⟦T80⟧](#rule-based-masking-of-inputs-and-outputs) 帮助器（它已经处理递归遍历并与 `langchain` 代理中间件干净地集成），您可以向其传递一个 Comprehend 支持的可调用函数，而不是自己编写遍历：

```python
from langsmith import Client
from langsmith.anonymizer import create_anonymizer

def comprehend_replacer(value: str, path: list) -> str:
    return detect_and_redact(value)

client = Client(anonymizer=create_anonymizer(comprehend_replacer))
```

这为您提供了与上面的`comprehend_anonymize`相同的编辑行为，并且样板更少，并且当您还在堆栈中的其他地方使用`create_anonymizer`时，这是推荐的方法。

### 高通量掩蔽的批处理

<Info>
[⟦T84⟧](https://reference.langchain.com/python/langsmith/client/Client) 可在 [Python SDK only](/langsmith/smith-python-sdk) 中使用。
</Info>本页之前的方法均单独运行。如果您的屏蔽逻辑涉及速率受限的 API 或模型推理（例如 Presidio 或 Amazon Comprehend 示例），则一次运行一个处理可能会造成瓶颈。 [⟦T85⟧](https://reference.langchain.com/python/langsmith/client/Client) 允许您在一批原始运行指令被序列化并发送到 API 之前拦截它们，因此您可以一次性分摊多次运行的成本。 LangSmith 在后台线程中处理这些运行，这不会阻塞您的应用程序。

LangSmith 将运行保存在内存缓冲区中，并在以下情况下将其作为批处理刷新：

- `run_ops_buffer_size` 运行操作已累积，或
- 自上次添加运行以来已过去`run_ops_buffer_timeout_ms` 毫秒（默认值：5000 毫秒）。

您的函数接收批处理作为原始运行指令列表，并且必须返回**相同长度**、**相同顺序**、**运行 ID 不变**的列表。打破任何一个约束都会引发`ValueError`。<Note>
`run_ops_buffer_size` 计算单个运行*操作*，而不是唯一运行。每个跟踪的调用通常会产生两个操作：创建（运行开始时）和更新（以输出结束时）。相应地设置缓冲区大小。例如，`run_ops_buffer_size=1000` 将缓冲大约 500 个跟踪的调用。因此，相同的运行 ID 可能会在单个批次中出现两次：一次带有输入，一次带有输出。
</Note>

<Warning>
仅当达到大小限制或超时后，缓冲区才会自动刷新。在程序退出之前始终调用 `client.flush()` 以避免丢弃缓冲的运行。
</Warning>

批处理中的每个运行字典都是创建操作（使用`inputs`，在运行开始时发送）或更新操作（使用`outputs`，在运行结束时发送）。以下是单个跟踪调用的典型对的样子：

```json
# Create op — sent when the run starts
{
    "id": "018f1b2c-...",
    "name": "my_llm_call",
    "run_type": "llm",
    "inputs": {"messages": [{"role": "user", "content": "My name is Jane Smith..."}]},
    "start_time": "2024-01-01T00:00:00.000Z",
    "trace_id": "018f1b2c-...",
    "dotted_order": "20240101T000000000000Z018f1b2c-...",
    "extra": {"metadata": {}, "runtime": {...}},
    "session_name": "default",
}

# Update op — sent when the run ends (same id, adds outputs)
{
    "id": "018f1b2c-...",
    "outputs": {"choices": [{"message": {"role": "assistant", "content": "Hello Jane..."}}]},
    "end_time": "2024-01-01T00:00:01.000Z",
    "trace_id": "018f1b2c-...",
    "dotted_order": "20240101T000000000000Z018f1b2c-...",
}
```<Warning>
Amazon Comprehend **不** 有批量 PII 终端节点。 `batch_detect_entities` 检测通用实体（人员、地点、组织），而不是 PII，并且不是 `detect_pii_entities` 的直接替代品。下面的批量优化来自于跨运行重复删除相同的字符串以及分摊每次运行的缓冲开销，而不是来自单个批量 API 调用。如果您需要真正的批量 PII 检测，请对跟踪路径之外的 S3 中的文档运行异步 [⟦T96⟧](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_StartPiiEntitiesDetectionJob.html)。
</Warning>

以下示例收集整个缓冲区中的每个字符串，对它们进行重复数据删除，并为每个唯一字符串调用一次 Comprehend 的 [⟦T97⟧](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectPiiEntities.html) 端点。对于重复常见提示、系统消息或工具输入的流量，与每次运行方法相比，这可以大大减少 Comprehend 调用的数量。该示例递归地遍历完整的有效负载，因此它适用于任何运行形状 - 聊天消息、工具输入/输出、检索器跨度等。

```python
import boto3
from langsmith import Client, traceable

comprehend = boto3.client("comprehend", region_name="us-east-1")

MIN_LENGTH_FOR_DETECTION = 3
MAX_BYTES_PER_CALL = 100_000

def redact_entities(text: str, entities: list) -> str:
    for entity in sorted(entities, key=lambda e: e["BeginOffset"], reverse=True):
        placeholder = f"[{entity['Type']}]"
        text = text[:entity["BeginOffset"]] + placeholder + text[entity["EndOffset"]:]
    return text

def detect_and_redact(text: str) -> str:
    if len(text) < MIN_LENGTH_FOR_DETECTION:
        return text
    if len(text.encode("utf-8")) > MAX_BYTES_PER_CALL:
        return text
    try:
        response = comprehend.detect_pii_entities(Text=text, LanguageCode="en")
    except Exception as e:
        print(f"Comprehend error: {e}")
        return text
    entities = response.get("Entities", [])
    return redact_entities(text, entities) if entities else text

def _redact_in_place(data, cache: dict, depth: int = 10):
    """Recursively redact every string in `data`, using `cache` to dedupe API calls."""
    if depth == 0:
        return data
    if isinstance(data, dict):
        return {k: _redact_in_place(v, cache, depth - 1) for k, v in data.items()}
    if isinstance(data, list):
        return [_redact_in_place(item, cache, depth - 1) for item in data]
    if isinstance(data, str):
        if data not in cache:
            cache[data] = detect_and_redact(data)
        return cache[data]
    return data

def comprehend_anonymize_batch(runs: list[dict]) -> list[dict]:
    # One shared cache per buffer flush. Identical strings (e.g. the same
    # system prompt repeated across runs) only hit Comprehend once.
    # Note: the same run ID may appear twice — once as a create (with inputs)
    # and once as an update (with outputs).
    cache: dict[str, str] = {}
    for run in runs:
        for field in ("inputs", "outputs"):
            data = run.get(field)
            if isinstance(data, (dict, list)):
                run[field] = _redact_in_place(data, cache)
    return runs

client = Client(
    process_buffered_run_ops=comprehend_anonymize_batch,
    run_ops_buffer_size=1000,        # ~500 traced calls (2 ops each: create + update)
    run_ops_buffer_timeout_ms=3000,  # or after 3 seconds, whichever comes first
)

@traceable(client=client)
def my_llm_call(messages: list) -> dict:
    # ... your LLM call ...
    pass

try:
    my_llm_call([{"role": "user", "content": "My name is Jane Smith, call me at 555-867-5309"}])
finally:
    client.flush()  # always flush before exit
```

[⟦T98⟧](https://reference.langchain.com/python/langsmith/client/Client) 和 `run_ops_buffer_size` 必须始终设置在一起 — 如果其中一个没有另一个则引发 `ValueError`。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/mask-inputs-outputs.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>