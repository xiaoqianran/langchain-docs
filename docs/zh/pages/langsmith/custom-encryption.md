<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure custom encryption at rest | https://docs.langchain.com/langsmith/custom-encryption -->

# 配置静态静态加密

自定义加密允许代理服务器将您的加密处理程序用于每租户密钥和外部密钥管理系统。除非您需要这些功能，否则请使用[built-in AES encryption](/langsmith/aes-encryption)。

<Warning>
  代理服务器版本 0.5.34–0.6.21 包含自定义加密的预发行版本。升级到 0.6.22+ 时，使用这些版本加密的数据将被损坏。不要在这些版本上使用自定义加密。
</Warning>

<Warning>
  仅当内置 AES 加密不能满足您的需求时才使用自定义加密。自定义加密要求您实现和维护加密处理程序，并增加了操作复杂性。如果您只需要静态密钥、密钥轮换或可选的选择性字段加密，请改用 [built-in AES encryption](/langsmith/aes-encryption)。
</Warning>

当您需要时使用自定义加密：

* **每租户密钥隔离** — 不同客户使用不同的加密密钥
* **KMS 集成** — AWS KMS、Google Cloud KMS 或 HashiCorp Vault，用于密钥管理、轮换和审核日志记录

## 配置自定义加密

### 它是如何工作的1. [Configure](#configuration)`langgraph.json`中的加密模块路径
2. [Define an encryption context handler](#define-encryption-context) 从经过身份验证的用户派生租户 ID 等值
3. [Define your encryption module](#defining-your-encryption-module) 带有 blob 和 JSON 加密处理程序
4.代理服务器在存储数据之前和检索数据之后调用您的处理程序

对于具有密钥轮换和审核日志记录的生产部署，请参阅 [Envelope encryption with AWS Encryption SDK](#envelope-encryption-with-aws-encryption-sdk)。

### 配置

将您的加密模块添加到`langgraph.json`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./agent.py:graph"
  },
  "encryption": {
    "path": "./encryption.py:encryption"
  }
}
```

<Note>
  如果您要从基本加密迁移，请保持 `LANGGRAPH_AES_KEY` 配置。自定义加密处理新写入，同时现有 AES 加密数据仍然可读。
</Note>

### 定义加密上下文

使用 `@encryption.context` 从经过身份验证的用户派生加密上下文：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk import Encryption, EncryptionContext
from starlette.authentication import BaseUser

encryption = Encryption()


@encryption.context
async def get_encryption_context(user: BaseUser, ctx: EncryptionContext) -> dict:
    return {
        **ctx.metadata,
        "tenant_id": user.identity,
    }
```

该处理程序在身份验证后针对每个请求运行一次。对于请求中的每个加密操作，返回的字典都会变成`ctx.metadata`，并以明文形式存储，以便代理服务器可以在解密期间恢复它。仅包含非秘密标识符和路由元数据，绝不包含密钥、令牌或凭据。

### 定义你的加密模块

#### Blob 加密（检查点）Blob 处理程序对检查点数据进行加密 - 来自图形执行的序列化状态。以下是使用每个租户密钥与 [Fernet](https://cryptography.io/en/latest/fernet/)（`cryptography` 库中的对称加密方案）的简化示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
from cryptography.fernet import Fernet
from langgraph_sdk import EncryptionContext

# In production, fetch from a secrets manager
TENANT_KEYS = {
    "tenant-a": Fernet(os.environ["TENANT_A_KEY"]),
    "tenant-b": Fernet(os.environ["TENANT_B_KEY"]),
}


def _get_fernet(ctx: EncryptionContext) -> Fernet:
    tenant_id = ctx.metadata.get("tenant_id")
    if not tenant_id or tenant_id not in TENANT_KEYS:
        raise ValueError(f"Unknown tenant: {tenant_id}")
    return TENANT_KEYS[tenant_id]


@encryption.encrypt.blob
async def encrypt_blob(ctx: EncryptionContext, data: bytes) -> bytes:
    return _get_fernet(ctx).encrypt(data)


@encryption.decrypt.blob
async def decrypt_blob(ctx: EncryptionContext, data: bytes) -> bytes:
    return _get_fernet(ctx).decrypt(data)
```

`ctx.metadata`字典来自上下文处理程序，因此每个加密处理程序都可以选择正确的密钥。

#### JSON 加密（元数据）

JSON 处理程序对结构化数据进行加密，例如线程元数据、辅助上下文和运行 kwargs。与 Blob 加密不同，您可以选择要加密的字段 - 保留一些未加密的字段以供搜索和过滤。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import json
import os
from cryptography.fernet import Fernet
from langgraph_sdk import EncryptionContext

TENANT_KEYS = {
    "tenant-a": Fernet(os.environ["TENANT_A_KEY"]),
    "tenant-b": Fernet(os.environ["TENANT_B_KEY"]),
}

SKIP_FIELDS = {
    "tenant_id", "owner",
    "run_id", "thread_id", "graph_id", "assistant_id", "user_id", "checkpoint_id",
    "source", "step", "parents", "run_attempt",
    "langgraph_version", "langgraph_api_version", "langgraph_plan", "langgraph_host",
    "langgraph_api_url", "langgraph_request_id", "langgraph_auth_user",
    "langgraph_auth_user_id", "langgraph_auth_permissions",
}
ENCRYPTED_PREFIX = "encrypted:"


def _get_fernet(ctx: EncryptionContext) -> Fernet:
    tenant_id = ctx.metadata.get("tenant_id")
    if not tenant_id or tenant_id not in TENANT_KEYS:
        raise ValueError(f"Unknown tenant: {tenant_id}")
    return TENANT_KEYS[tenant_id]


@encryption.encrypt.json
async def encrypt_json(ctx: EncryptionContext, data: dict) -> dict:
    fernet = _get_fernet(ctx)
    result = {}
    for k, v in data.items():
        if k in SKIP_FIELDS or v is None:
            result[k] = v
        else:
            value_json = json.dumps(v)
            encrypted = fernet.encrypt(value_json.encode()).decode()
            result[k] = ENCRYPTED_PREFIX + encrypted
    return result


@encryption.decrypt.json
async def decrypt_json(ctx: EncryptionContext, data: dict) -> dict:
    fernet = _get_fernet(ctx)
    result = {}
    for k, v in data.items():
        if isinstance(v, str) and v.startswith(ENCRYPTED_PREFIX):
            encrypted_value = v[len(ENCRYPTED_PREFIX):]
            decrypted = fernet.decrypt(encrypted_value.encode()).decode()
            result[k] = json.loads(decrypted)
        else:
            result[k] = v
    return result
```

#### JSON 加密注意事项

<Warning>
  **无法搜索或过滤加密字段。** 设计您的元数据架构，以便您需要查询的字段保持未加密状态。
</Warning>

<Warning>
  **JSON 加密器必须保留密钥结构。** SQL JSONB 合并操作在密钥级别工作。更改密钥的加密器——无论是通过合并字段（例如，将敏感数据移至`__encrypted__`）还是通过加密密钥名称本身——都会在合并期间导致数据丢失。使用每密钥加密：在保留密钥的同时就地转换值。
</Warning><Note>
  **迁移注意事项：** 在加密值中使用可识别的前缀或格式，以便解密器可以检测并跳过未加密的数据。这允许您将来加密其他字段，而无需重新加密现有记录。上面的示例使用了这种模式。
</Note>

<Note>
  **性能考虑：** 每密钥加密意味着每个字段一次加密调用。如果您的加密涉及到外部服务（例如 KMS）的往返，这可能会显着影响延迟。考虑在本地缓存数据密钥或使用信封加密，其中使用 KMS 加密本地数据密钥并将其用于多个字段。
</Note>

授权过滤器使用的字段（例如，`tenant_id`、`owner`）必须保持不变且**未加密**，用于搜索和过滤的字段也必须保持不变。如果自定义加密器更改授权过滤器字段，代理服务器将拒绝写入。此外，**一些系统管理的字段永远不会被加密**：* 资源标识符（`thread_id`、`run_id`、`assistant_id`、`graph_id`、`checkpoint_id`、`task_id`）
* 命名为 LangGraph 系统字段（`langgraph_version`、`langgraph_api_version`、`langgraph_plan`、`langgraph_host`、`langgraph_api_url`、`langgraph_request_id`、`langgraph_auth_user`、`langgraph_auth_user_id`、`langgraph_auth_permissions`）
* 必需的检查点元数据（`source`、`step`、`parents`、`run_attempt`）
* 用于调度和编排的命名内部字段，包括`__after_seconds__`和`__request_start_time_ms__`
* 在运行的 `config` 中指定的运行级别执行限制（`max_concurrency`、`recursion_limit`）
* 在运行的 `config.configurable` 中指定的线程 TTL 更新 (`ttl`)

####什么被加密

**JSON 处理程序** (`@encryption.encrypt.json` / `@encryption.decrypt.json`) 递归地应用于字段，包括：

* `thread.metadata`, `thread.values`
* `assistant.metadata`, `assistant.context`
* `run.metadata`, `run.kwargs`
* `cron.metadata`, `cron.payload`
* `store.value`

[Some fields are excluded from encryption.](#json-encryption-considerations) 除非另有说明，这些排除适用于嵌套 JSON 对象的每个级别，而不仅仅是根级别。

**Blob 处理程序** (`@encryption.encrypt.blob` / `@encryption.decrypt.blob`) 应用于检查点 blob（图执行状态）。

### 延迟轮换自定义加密密钥

<Note>
  延迟重新加密需要 Agent Server 版本 `0.14.0` 或更高版本、Python SDK 版本 `langgraph-sdk>=0.4.3`、PostgreSQL 检查点、`PREFER_GRPC_CHECKPOINTER=true` 和 `LANGGRAPH_STORE_BACKEND=grpc`。
</Note>当处理程序使用旧密钥解密数据时，从 blob 或 JSON 解密处理程序返回 `DecryptResult`。其`plaintext`值返回给调用者，其`replacement`值是新的密文，供Agent Server持久保存。

例如，将上面的 blob 解密处理程序替换为首先尝试当前租户密钥，然后在旧密钥成功时返回替换密文的处理程序：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from cryptography.fernet import Fernet, InvalidToken
from langgraph_sdk import DecryptResult, EncryptionContext

LEGACY_TENANT_KEYS = {
    "tenant-a": [Fernet(os.environ["TENANT_A_LEGACY_KEY"])],
    "tenant-b": [Fernet(os.environ["TENANT_B_LEGACY_KEY"])],
}


@encryption.decrypt.blob
async def decrypt_blob(
    ctx: EncryptionContext, data: bytes
) -> bytes | DecryptResult[bytes]:
    current_key = _get_fernet(ctx)
    try:
        return current_key.decrypt(data)
    except InvalidToken:
        tenant_id = ctx.metadata["tenant_id"]
        for legacy_key in LEGACY_TENANT_KEYS.get(tenant_id, []):
            try:
                plaintext = legacy_key.decrypt(data)
                return DecryptResult(
                    plaintext=plaintext,
                    replacement=current_key.encrypt(plaintext),
                )
            except InvalidToken:
                continue
        raise
```

JSON 解密处理程序可以以相同的方式返回 `DecryptResult[dict]`。替换的形状必须与相应加密处理程序的正常结果具有相同的形状。

代理服务器通过比较和交换操作写入替换内容，因此它不会覆盖并发更新。重新加密是尽力而为：如果存储的值在写回之前发生更改或写回失败，则读取仍然会成功。

<Warning>
  惰性重新加密仅在读取数据时更新数据。保持旧密钥可用，而未读数据可能仍需要它们。
</Warning>

### 监控延迟重新加密

代理服务器为替换写回发出以下信息层[internal metrics](/langsmith/self-hosted-agent-server-metrics#internal-metrics)：|公制|意义|
| - | - |
| `lg_api_reencrypt_writeback_succeeded_counter` |替换密文已被存储。 |
| `lg_api_reencrypt_writeback_cas_skipped_counter` |并发更新在写回之前更改了存储的值。代理服务器保持新值不变。 |
| `lg_api_reencrypt_writeback_failed_counter` |代理服务器无法写入替换内容。读取仍然成功。 |

每个指标都包含 `reencryption_table` 和 `reencryption_column` 属性。使用它们来查找仍然读取旧密文的表面并隔离写回失败。

CAS 会跳过生成带有`Re-encryption writeback skipped due to concurrent update` 的警告日志。失败会生成带有 `Re-encryption writeback failed` 的错误日志。两者都包括表和列。成功的写回不会生成日志。

对于 Prometheus，设置 `EXPOSE_INTERNAL_METRICS_PROMETHEUS=true` 并抓取代理服务器 `/metrics` 端点。内部指标也可通过记录的 Datadog 导出获得。

这些计数器测量写回结果，而不是剩余的旧密文数量。一段时间内没有新的写回并不能证明每条记录都已被读取和轮换。保持旧密钥可用，直到您的保留策略或单独的详尽迁移确认没有未读数据需要它们。

### 使用 AWS 加密 SDK 进行信封加密对于 AWS 上的生产部署，请将 [AWS Encryption SDK](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/python.html) 与 AWS KMS 一起使用，或云提供商内的同等产品。这种方法：

* 自动处理信封加密（无需手动密钥打包）
* 提供密钥轮换和审计日志记录
* 将密文绑定到加密上下文（租户隔离）
* 在本地缓存数据密钥以避免重复的 KMS 调用、延迟和速率限制

#### 完整示例

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import base64
import json
import os

import aws_encryption_sdk
from aws_encryption_sdk import (
    CachingCryptoMaterialsManager,
    CommitmentPolicy,
    LocalCryptoMaterialsCache,
    StrictAwsKmsMasterKeyProvider,
)
from langgraph_sdk import Encryption, EncryptionContext

encryption = Encryption()

# The SDK uses envelope encryption: one KMS API call generates a data key,
# then encrypts/decrypts locally. The cache reuses data keys across operations.
client = aws_encryption_sdk.EncryptionSDKClient(
    commitment_policy=CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
)
key_provider = StrictAwsKmsMasterKeyProvider(key_ids=[os.environ["KMS_KEY_ARN"]])
cache = LocalCryptoMaterialsCache(capacity=100)
cmm = CachingCryptoMaterialsManager(
    master_key_provider=key_provider,
    cache=cache,
    max_age=300.0,
    max_messages_encrypted=100,
)

SKIP_FIELDS = {
    "tenant_id", "owner",
    "run_id", "thread_id", "graph_id", "assistant_id", "user_id", "checkpoint_id",
    "source", "step", "parents", "run_attempt",
    "langgraph_version", "langgraph_api_version", "langgraph_plan", "langgraph_host",
    "langgraph_api_url", "langgraph_request_id", "langgraph_auth_user",
    "langgraph_auth_user_id", "langgraph_auth_permissions",
}
ENCRYPTED_PREFIX = "encrypted:"


@encryption.encrypt.blob
async def encrypt_blob(ctx: EncryptionContext, data: bytes) -> bytes:
    ciphertext, _ = client.encrypt(
        source=data,
        materials_manager=cmm,
        encryption_context={"tenant_id": ctx.metadata["tenant_id"]},
    )
    return ciphertext


@encryption.decrypt.blob
async def decrypt_blob(ctx: EncryptionContext, data: bytes) -> bytes:
    plaintext, _ = client.decrypt(source=data, key_provider=key_provider)
    return plaintext


@encryption.encrypt.json
async def encrypt_json(ctx: EncryptionContext, data: dict) -> dict:
    tenant_id = ctx.metadata["tenant_id"]
    result = {}
    for k, v in data.items():
        if k in SKIP_FIELDS or v is None:
            result[k] = v
        else:
            ciphertext, _ = client.encrypt(
                source=json.dumps(v).encode(),
                materials_manager=cmm,
                encryption_context={"tenant_id": tenant_id},
            )
            result[k] = ENCRYPTED_PREFIX + base64.b64encode(ciphertext).decode()
    return result


@encryption.decrypt.json
async def decrypt_json(ctx: EncryptionContext, data: dict) -> dict:
    result = {}
    for k, v in data.items():
        if isinstance(v, str) and v.startswith(ENCRYPTED_PREFIX):
            ciphertext = base64.b64decode(v[len(ENCRYPTED_PREFIX):])
            plaintext, _ = client.decrypt(source=ciphertext, key_provider=key_provider)
            result[k] = json.loads(plaintext.decode())
        else:
            result[k] = v
    return result
```

`encryption_context` 通过 KMS 以加密方式绑定到密文 — 如果上下文不匹配，解密就会失败。上下文嵌入在密文中，因此解密处理程序不需要引用`ctx.metadata`。

#### 密钥轮换

KMS 自动轮换相同密钥 ID 的背衬材料。旧的加密数据密钥仍然可解密，因此现有数据不需要重新加密。

## 相关

* [Custom authentication](/langsmith/custom-auth)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-encryption.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>