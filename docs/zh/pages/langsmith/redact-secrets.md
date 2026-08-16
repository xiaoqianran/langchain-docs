<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Redact secrets from traces | https://docs.langchain.com/langsmith/redact-secrets -->

# 编辑痕迹中的秘密

当您的应用程序处理 API 密钥、令牌或其他凭据时，如果这些值作为输入或输出的一部分传递，则它们可能会出现在 LangSmith 跟踪中。使用 LangSmith SDK 的内置匿名器在将机密发送到后端之前对其进行编辑。

<Note>
本页面介绍通过 SDK 从跟踪数据中编辑机密（API 密钥、令牌、凭据）。如需编辑电子邮件、姓名或 SSN 等个人身份信息 (PII)，请参阅 [Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)。要在 LLM 网关层编辑机密，请参阅 [Data protection](/langsmith/llm-gateway-data-protection)。
</Note>

## 使用 SDK 匿名器

<Info>
`create_anonymizer` / `createAnonymizer` 功能需要：

- Python SDK：0.1.81及以上
- TypeScript SDK：0.1.33 及更高版本
</Info>

`create_anonymizer` 函数接受正则表达式模式和替换字符串的列表。将生成的匿名器传递给[Client](https://reference.langchain.com/python/langsmith/client/Client)构造函数，它将在到达LangSmith之前自动应用于所有运行的输入和输出。

以下示例编辑了常见的秘密格式，包括 OpenAI API 密钥、通用承载令牌和 `sk-` 前缀密钥：

<CodeGroup>

```python Python
from langsmith.anonymizer import create_anonymizer
from langsmith import Client, traceable

# Redact common secret patterns
anonymizer = create_anonymizer([
    # OpenAI-style keys: sk-... or sk-proj-...
    {"pattern": r"sk-[A-Za-z0-9\-_]{20,}", "replace": "<REDACTED_API_KEY>"},
    # Generic bearer tokens
    {"pattern": r"Bearer\s+[A-Za-z0-9\-_\.]{20,}", "replace": "Bearer <REDACTED_TOKEN>"},
    # Anthropic keys
    {"pattern": r"sk-ant-[A-Za-z0-9\-_]{20,}", "replace": "<REDACTED_API_KEY>"},
    # Generic high-entropy strings that look like secrets (40+ hex chars)
    {"pattern": r"\b[0-9a-fA-F]{40,}\b", "replace": "<REDACTED_TOKEN>"},
])

client = Client(anonymizer=anonymizer)

@traceable(client=client)
def call_external_api(api_key: str, prompt: str) -> str:
    # The api_key value will be redacted in the trace
    return f"Response to: {prompt}"

call_external_api(
    api_key="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
    prompt="What is LangSmith?",
)
```

```typescript TypeScript
import { createAnonymizer } from "langsmith/anonymizer";
import { traceable } from "langsmith/traceable";
import { Client } from "langsmith";

// Redact common secret patterns
const anonymizer = createAnonymizer([
    // OpenAI-style keys: sk-... or sk-proj-...
    { pattern: /sk-[A-Za-z0-9\-_]{20,}/g, replace: "<REDACTED_API_KEY>" },
    // Generic bearer tokens
    { pattern: /Bearer\s+[A-Za-z0-9\-_.]{20,}/g, replace: "Bearer <REDACTED_TOKEN>" },
    // Anthropic keys
    { pattern: /sk-ant-[A-Za-z0-9\-_]{20,}/g, replace: "<REDACTED_API_KEY>" },
    // Generic high-entropy strings that look like secrets (40+ hex chars)
    { pattern: /\b[0-9a-fA-F]{40,}\b/g, replace: "<REDACTED_TOKEN>" },
]);

const client = new Client({ anonymizer });

const callExternalApi = traceable(
    async (apiKey: string, prompt: string): Promise<string> => {
        // The apiKey value will be redacted in the trace
        return `Response to: ${prompt}`;
    },
    { client }
);

await callExternalApi(
    "sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
    "What is LangSmith?"
);
```

</CodeGroup>匿名器将输入和输出序列化为 JSON，应用每个正则表达式模式，然后在发送到 LangSmith 之前反序列化结果。默认情况下，它最多遍历 10 层嵌套。要更改此设置，请传递 `max_depth` 参数：

```python
anonymizer = create_anonymizer(
    [{"pattern": r"sk-[A-Za-z0-9\-_]{20,}", "replace": "<REDACTED_API_KEY>"}],
    max_depth=5,
)
```

## 使用自定义函数

如果您的编辑逻辑更复杂，请传递函数而不是模式列表。该函数接收一个字符串并返回编辑后的字符串：

<CodeGroup>

```python Python
import re
from langsmith.anonymizer import create_anonymizer
from langsmith import Client

# Example: redact any value that follows a known key name in JSON-like payloads
SECRET_KEYS = {"api_key", "apiKey", "token", "secret", "password", "credential"}

def redact_secret_values(text: str) -> str:
    for key in SECRET_KEYS:
        # Match patterns like: "api_key": "some-value"
        pattern = rf'("{key}"\s*:\s*)"[^"]*"'
        text = re.sub(pattern, r'\1"<REDACTED>"', text)
    return text

anonymizer = create_anonymizer(redact_secret_values)
client = Client(anonymizer=anonymizer)
```

```typescript TypeScript
import { createAnonymizer } from "langsmith/anonymizer";
import { Client } from "langsmith";

const SECRET_KEYS = new Set(["api_key", "apiKey", "token", "secret", "password", "credential"]);

function redactSecretValues(text: string): string {
    for (const key of SECRET_KEYS) {
        // Match patterns like: "api_key": "some-value"
        const pattern = new RegExp(`("${key}"\\s*:\\s*)"[^"]*"`, "g");
        text = text.replace(pattern, '$1"<REDACTED>"');
    }
    return text;
}

const anonymizer = createAnonymizer(redactSecretValues);
const client = new Client({ anonymizer });
```

</CodeGroup>

## 与 LANGSMITH_HIDE_INPUTS 结合

如果您的用例需要完全抑制所有输入（例如，为了实现零保留合规性），请改用 `LANGSMITH_HIDE_INPUTS=true`。当 `LANGSMITH_HIDE_INPUTS` 或 `LANGSMITH_HIDE_OUTPUTS` 设置为 `true` 时，将跳过匿名器。

有关更多选项，包括隐藏所有输入和输出、隐藏元数据、功能级处理器和第三方 PII 库，请参阅[Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/redact-secrets.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>