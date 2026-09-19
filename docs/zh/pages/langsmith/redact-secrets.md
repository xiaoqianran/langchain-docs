<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Redact secrets from traces | https://docs.langchain.com/langsmith/redact-secrets -->

# 编辑痕迹中的秘密

当您的应用程序处理 API 密钥、令牌或其他凭据时，如果这些值作为输入或输出的一部分传递，则它们可能会出现在 LangSmith 跟踪中。使用 LangSmith SDK 的内置匿名器在将机密发送到后端之前对其进行编辑。

<Note>
本页面介绍通过 SDK 从跟踪数据中编辑机密（API 密钥、令牌、凭据）。要编辑电子邮件、姓名或 SSN 等个人身份信息 (PII)，请参阅 [Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)。要在 LLM 网关层编辑机密，请参阅 [Data policy](/langsmith/llm-gateway-data-policy)。

[Claude Code](/langsmith/trace-claude-code#secret-redaction)、[OpenAI Codex](/langsmith/trace-with-codex#secret-redaction) 和 [Cursor](/langsmith/trace-with-cursor#secret-redaction) 的编码代理跟踪插件默认应用以下预设。这些不需要 SDK 代码。
</Note>

## 使用内置秘密预设

SDK 提供了针对常见凭证格式的精选规则集。将 `create_secret_anonymizer` 传递给 [Client](https://reference.langchain.com/python/langsmith/client/Client) 构造函数，它会在上传之前编辑从运行输入、输出、错误和元数据中检测到的机密。当您想要覆盖众所周知的关键格式而不需要自己编写模式时，请使用它。

<Info>
`create_secret_anonymizer` / `createSecretAnonymizer` 功能需要：

- Python SDK：0.9.0或更高版本
- TypeScript SDK：0.7.11 或更高版本
</Info>

<CodeGroup>

```python Python
from langsmith import Client
from langsmith.anonymizer import create_secret_anonymizer

client = Client(anonymizer=create_secret_anonymizer())
```

```typescript TypeScript
import { Client } from "langsmith";
import { createSecretAnonymizer } from "langsmith/anonymizer";

const client = new Client({ anonymizer: createSecretAnonymizer() });
```

</CodeGroup>每场比赛都替换为`[SECRET_DETECTED]`。该预设最多可遍历 24 个嵌套级别，而不是`create_anonymizer` 使用的 10 个，因为跟踪的有效负载嵌套得很深。用 `max_depth` 覆盖它。

Python 和 TypeScript 预设保留相同的规则，因此其中一个编辑的跟踪与另一个编辑的跟踪相匹配。

### 预设中的规则

提供者规则锚定到已知的密钥前缀。仅当敏感名称与分配配对时，上下文规则才会触发，从而使普通代码、UUID 和内容哈希保持不变。|类别 |检测到的格式 |
| --- | --- |
| Anthropic | `sk-ant-` |
| OpenAI | `sk-proj-`、`sk-svcacct-`、`sk-admin-` 和旧版 `sk-` 键 |
| LangSmith | `lsv2_pt_`、`lsv2_sk_`、`ls__` |
| GitHub | `ghp_`、`gho_`、`ghu_`、`ghs_`、`ghr_` 和 `github_pat_` |
| GitLab | `glpat-` |
|亚马逊AWS |前缀为 `AKIA`、`ASIA`、`ABIA`、`ACCA` 或 `A3T` 的访问密钥 ID |
|谷歌 | `AIza` API 密钥和 `ya29.` OAuth 访问令牌 |
|松弛| `xoxb-`、`xoxa-`、`xoxp-`、`xoxr-`、`xoxs-`、`xapp-` 和 `hooks.slack.com` webhook URL |
|条纹| `sk_live_`、`sk_test_`、`rk_live_`、`rk_test_` |
| npm | `npm_` |
| PyPI | `pypi-AgEIcHlwaS` 上传令牌 |
|发送网格 | `SG.` |
| JSON Web 令牌 | `header.payload.signature` 三重开头 `eyJ` |
|私钥|用于 RSA、EC、OpenSSH、DSA 和 PGP 密钥的 PEM 块 |
|命名作业 | `API_KEY`、`SECRET`、`TOKEN`、`PASSWORD`、`PASSWD`、`PRIVATE_KEY`、`ACCESS_KEY`、`AUTH_TOKEN` 或 `CLIENT_SECRET`，然后是 `=` 或`:` 且值为六个或更多字符 |
|凭证标头 | `Authorization`、`X-Api-Key`、`X-Auth-Token`，以及裸露的 `Bearer <token>` |
| URL 凭证 | `scheme://user:password@host`中的密码 |

名称规则需要组件边界，因此 `TOKEN` 匹配 `api_token` 和 `mytoken`，但不匹配 `tokenizer` 或 `tokens`。标头和 `Bearer` 规则保留标头名称和方案字，并仅编辑后面的凭证。

### 将您自己的规则添加到预设中传递 `extra_rules` 附加预设不知道的凭据模式，例如内部密钥格式。额外规则在内置规则之后运行。

<CodeGroup>

```python Python
import re

from langsmith import Client
from langsmith.anonymizer import create_secret_anonymizer

anonymizer = create_secret_anonymizer(
    extra_rules=[
        {"pattern": re.compile(r"ACME-[A-Z0-9]{16}"), "replace": "[REDACTED_ACME_KEY]"},
    ]
)

client = Client(anonymizer=anonymizer)
```

```typescript TypeScript
import { Client } from "langsmith";
import { createSecretAnonymizer } from "langsmith/anonymizer";

const anonymizer = createSecretAnonymizer({
  extraRules: [
    { pattern: /ACME-[A-Z0-9]{16}/g, replace: "[REDACTED_ACME_KEY]" },
  ],
});

const client = new Client({ anonymizer });
```

</CodeGroup>

没有 `replace` 值的规则会回退到 `[redacted]`，而不是 `[SECRET_DETECTED]`。当您希望在迹线中区分两者时，请设置`replace`。

### 预设的限制

预设更注重精确性而不是详尽的覆盖范围，这会产生值得规划的后果：

- **无法识别的格式达到LangSmith**：不匹配任何规则的凭证（包括没有周围上下文的随机高熵字符串）按原样上传。
- **仅编辑了四个字段**：匿名器涵盖 `inputs`、`outputs`、`error` 和 `extra.metadata`。运行名称、标签和附件未经修改即可上传。
- **编辑不是访问控制**：编辑的跟踪仍然保留其构建的提示、文件内容和工具结果。限制谁可以读取跟踪项目。要省略内容而不是擦除内容，请参阅[Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)。

## 编写自定义模式

<Info>
`create_anonymizer` / `createAnonymizer` 功能需要：

- Python SDK：0.1.81 或更高版本
- TypeScript SDK：0.1.33 或更高版本
</Info>当预设不适合时，`create_anonymizer` 会获取正则表达式模式和替换字符串的列表，并仅应用它们。将生成的匿名器传递给[Client](https://reference.langchain.com/python/langsmith/client/Client)构造函数，它将在到达LangSmith之前自动应用于所有运行输入和输出。

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

</CodeGroup>

匿名器将输入和输出序列化为 JSON，应用每个正则表达式模式，然后在发送到 LangSmith 之前反序列化结果。默认情况下，它最多遍历 10 层嵌套。要更改此设置，请传递 `max_depth` 参数：

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

如果您的用例需要完全抑制所有输入（例如，为了实现零保留合规性），请改用 `LANGSMITH_HIDE_INPUTS=true`。当 `LANGSMITH_HIDE_INPUTS` 或 `LANGSMITH_HIDE_OUTPUTS` 设置为 `true` 时，将跳过匿名器。有关更多选项，包括隐藏所有输入和输出、隐藏元数据、功能级处理器和第三方 PII 库，请参阅[Prevent logging of sensitive data in traces](/langsmith/mask-inputs-outputs)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/redact-secrets.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>