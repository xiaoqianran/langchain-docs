<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage prompts programmatically | https://docs.langchain.com/langsmith/manage-prompts-programmatically -->

# 以编程方式管理提示

您可以使用 LangSmith Python、TypeScript 和 Java SDK 以编程方式管理提示。

<Note>
以前，此功能位于 `langchainhub` 包中，现已弃用。未来的所有功能都将位于 `langsmith` 包中。
</Note>

## 安装包

在Python中，您可以直接使用LangSmith SDK（*推荐，功能齐全*），也可以通过LangChain包使用（仅限推拉提示）。

在 TypeScript 中，您必须使用 LangChain npm 包来拉取提示（它也允许推送）。对于所有其他功能，请使用 LangSmith 包。

<CodeGroup>
```bash pip
pip install -U langsmith # version >= 0.1.99
```

```bash uv
uv add langsmith  # version >= 0.1.99
```

```bash TypeScript
yarn add langsmith langchain # langsmith version >= 0.1.99 and langchain version >= 0.2.14
```

```kotlin Java/Kotlin (Gradle)
implementation("com.langchain.smith:langsmith-java:0.1.0-beta.4")
```
</CodeGroup>

## 配置环境变量

如果您已将 `LANGSMITH_API_KEY` 从 LangSmith 设置为当前工作区的 api 密钥，则可以跳过此步骤。

否则，请导航至 LangSmith 中的 `Settings > API Keys > Create API Key` 获取工作区的 API 密钥。

设置您的环境变量。

```bash
export LANGSMITH_API_KEY="lsv2_..."
```

<Note>
我们所说的“提示”过去被称为“repos”，因此代码中对“repo”的任何引用都是指提示。
</Note>

## 推送提示

要创建新提示或更新现有提示，您可以使用 `push prompt` 方法。

<CodeGroup>

```python Python
from langsmith import Client
from langchain_core.prompts import ChatPromptTemplate

client = Client()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
url = client.push_prompt("joke-generator", object=prompt)
# url is a link to the prompt in the UI
print(url)
```

```python LangChain (Python)
from langchain_classic import hub as prompts
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
url = prompts.push("joke-generator", prompt)
# url is a link to the prompt in the UI
print(url)
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");
const url = hub.push("joke-generator", {
  object: prompt,
});
// url is a link to the prompt in the UI
console.log(url);
``````java Java
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.core.JsonValue;
import com.langchain.smith.models.commits.CommitCreateParams;
import com.langchain.smith.models.repos.RepoCreateParams;
import java.util.List;
import java.util.Map;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();


client.repos().create(
    RepoCreateParams.builder()
        .repoHandle("joke-generator")
        .isPublic(false)
        .build()
);

Map<String, Object> manifest = Map.of(
    "lc", 1,
    "type", "constructor",
    "id", List.of("langchain_core", "prompts", "prompt", "PromptTemplate"),
    "kwargs", Map.of(
        "template", "tell me a joke about {topic}",
        "input_variables", List.of("topic")
    )
);

client.commits().create(
    CommitCreateParams.builder()
        .owner("-")
        .repo("joke-generator")
        .manifest(JsonValue.from(manifest))
        .build()
);
```

</CodeGroup>

您还可以将提示作为提示和模型的 RunnableSequence 推送。这对于存储您想要与此提示一起使用的模型配置非常有用。该提供程序必须得到 Playground 的支持，请参阅[supported model providers](/langsmith/playground-model-providers)。

<CodeGroup>

```python Python
from langsmith import Client
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

client = Client()
model = ChatOpenAI(model="gpt-5.4-mini")
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
chain = prompt | model
client.push_prompt("joke-generator-with-model", object=chain)
```

```python LangChain (Python)
from langchain_classic import hub as prompts
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-5.4-mini")
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
chain = prompt | model
url = prompts.push("joke-generator-with-model", chain)
# url is a link to the prompt in the UI
print(url)
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-5.4-mini" });
const prompt = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");
const chain = prompt.pipe(model);
await hub.push("joke-generator-with-model", {
  object: chain,
});
```

</CodeGroup>

## 推送 StructuredPrompt

`StructuredPrompt` 将提示模板与输出模式相结合，确保模型以定义的结构返回数据。使用 `StructuredPrompt.from_messages_and_schema` (Python) 或 `StructuredPrompt.fromMessagesAndSchema` (TypeScript) 创建一个，然后像任何其他提示一样将其推送到中心。

### 没有模型

当您想要独立于任何模型配置存储模板和架构时，单独推送结构化提示。

<CodeGroup>

```python Python
from langsmith import Client
from langchain_core.prompts.structured import StructuredPrompt
from pydantic import BaseModel, Field

class ResponseSchema(BaseModel):
    positive_sentiment: bool = Field(description="Was the user sentiment positive?")

prompt = StructuredPrompt.from_messages_and_schema(
    [
        ("system", "Evaluate the sentiment of the following conversation."),
        ("human", "{conversation}"),
    ],
    schema=ResponseSchema.model_json_schema(),
)

client = Client()
url = client.push_prompt("sentiment-evaluator", object=prompt)
print(url)
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { StructuredPrompt } from "@langchain/core/prompts";

const schema = {
  title: "ResponseSchema",
  type: "object",
  properties: {
    positive_sentiment: {
      type: "boolean",
      description: "Was the user sentiment positive?",
    },
  },
  required: ["positive_sentiment"],
};

const prompt = StructuredPrompt.fromMessagesAndSchema(
  [
    ["system", "Evaluate the sentiment of the following conversation."],
    ["human", "{conversation}"],
  ],
  schema
);

const url = await hub.push("sentiment-evaluator", prompt);
console.log(url);
```

</CodeGroup>

### 有模型

将结构化提示作为带有模型的 RunnableSequence 推送，以将完整管道（包括模型配置）存储在中心中。

<CodeGroup>

```python Python
from langsmith import Client
from langchain_core.prompts.structured import StructuredPrompt
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

class ResponseSchema(BaseModel):
    positive_sentiment: bool = Field(description="Was the user sentiment positive?")

prompt = StructuredPrompt.from_messages_and_schema(
    [
        ("system", "Evaluate the sentiment of the following conversation."),
        ("human", "{conversation}"),
    ],
    schema=ResponseSchema.model_json_schema(),
)

model = ChatOpenAI(model="gpt-4o-mini")
chain = prompt | model

client = Client()
url = client.push_prompt("sentiment-evaluator-with-model", object=chain)
print(url)
```

</CodeGroup>

## 拉取提示

要拉取提示，您可以使用 `pull prompt` 方法，该方法将提示作为 langchain `PromptTemplate` 返回。

要拉出**私人提示**，您不需要指定所有者句柄（尽管可以，如果您有一组）。要从 LangChain 中心提取 **公共提示**，您需要指定提示作者的句柄。

<CodeGroup>

```python Python
from langsmith import Client
from langchain_openai import ChatOpenAI

client = Client()
prompt = client.pull_prompt("joke-generator")
model = ChatOpenAI(model="gpt-5.4-mini")
chain = prompt | model
chain.invoke({"topic": "cats"})
```

```python LangChain (Python)
from langchain_classic import hub as prompts
from langchain_openai import ChatOpenAI

prompt = prompts.pull("joke-generator")
model = ChatOpenAI(model="gpt-5.4-mini")
chain = prompt | model
chain.invoke({"topic": "cats"})
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { ChatOpenAI } from "@langchain/openai";

const prompt = await hub.pull("joke-generator");
const model = new ChatOpenAI({ model: "gpt-5.4-mini" });
const chain = prompt.pipe(model);
await chain.invoke({"topic": "cats"});
```

```java Java
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.prompts.Prompt;
import com.langchain.smith.prompts.PromptClient;
import com.langchain.smith.prompts.PromptValue;
import java.util.Map;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();
PromptClient promptClient = PromptClient.create(client);

Prompt prompt = promptClient.pull("joke-generator");
PromptValue formattedPrompt = prompt.invoke(Map.of("topic", "cats"));
// Use formattedPrompt with your model provider — see "Use a prompt without LangChain" below.
```

</CodeGroup>

与推送提示类似，您也可以将提示拉取为提示和模型的 RunnableSequence。只需在拉取提示时指定 include\_model 即可。如果存储的提示包含模型，它将作为 RunnableSequence 返回。确保为您使用的模型设置了正确的环境变量。

<CodeGroup>

```python Python
from langsmith import Client

client = Client()
chain = client.pull_prompt("joke-generator-with-model", include_model=True)
chain.invoke({"topic": "cats"})
```

```python LangChain (Python)
from langchain_classic import hub as prompts

chain = prompts.pull("joke-generator-with-model", include_model=True)
chain.invoke({"topic": "cats"})
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { Runnable } from "@langchain/core/runnables";

const chain = await hub.pull<Runnable>("joke-generator-with-model", { includeModel: true });
await chain.invoke({"topic": "cats"});
```

</CodeGroup>

拉取提示时，您还可以指定特定的提交哈希或[commit tag](/langsmith/manage-prompts#commit-tags)来拉取特定版本的提示。

<CodeGroup>

```python Python
prompt = client.pull_prompt("joke-generator:12344e88")
```

```python LangChain (Python)
prompt = prompts.pull("joke-generator:12344e88")
```

```typescript TypeScript
const prompt = await hub.pull("joke-generator:12344e88")
```

```java Java
String commitHash = "12344e88";
Prompt promptAtCommit = promptClient.pull("joke-generator:" + commitHash);
```

</CodeGroup>

要从 LangChain 中心提取公共提示，您需要指定提示作者的句柄。

<CodeGroup>

```python Python
prompt = client.pull_prompt("efriis/my-first-prompt")
```

```python LangChain (Python)
prompt = prompts.pull("efriis/my-first-prompt")
```

```typescript TypeScript
const prompt = await hub.pull("efriis/my-first-prompt")
```

```java Java
Prompt publicPrompt = promptClient.pull("efriis/my-first-prompt");
```

</CodeGroup>

<Note>
对于拉取提示，如果您使用 Node.js 或支持动态导入的环境，我们建议使用 `langchain/hub/node` 入口点，因为它会自动处理与提示配置关联的模型的反序列化。如果您处于非 Node 环境中，则非 OpenAI 模型不支持“includeModel”，您应该使用基本 `langchain/hub` 入口点。
</Note>

## 配合LangSmith网关使用

如果您的工作区使用[LangSmith LLM Gateway](/langsmith/llm-gateway)，您可以通过在拉取和调用提示之前设置两个环境变量来通过它路由提示模型调用。无需更改其他代码。

```bash
export LANGSMITH_GATEWAY="true"
export LANGSMITH_GATEWAY_API_KEY="lsv2_..."
```

将 `LANGSMITH_GATEWAY_API_KEY` 设置为工作区范围内具有 `gateway:invoke` 权限的 LangSmith API 密钥。如果未设置此变量，网关将回退到`LANGSMITH_API_KEY`。

要使用区域网关实例而不是默认网关实例，请将 `LANGSMITH_GATEWAY` 设置为完整网关 URL：

```bash
export LANGSMITH_GATEWAY="https://eu.gateway.smith.langchain.com"
export LANGSMITH_GATEWAY_API_KEY="lsv2_..."
```

设置环境变量后，像平常一样使用模型拉取并调用提示：

```python Python
from langsmith import Client

client = Client()

# Pull a prompt that includes a stored model configuration
prompt_with_model = client.pull_prompt("my-prompt", include_model=True)

# The model call is routed through the gateway automatically
result = prompt_with_model.invoke({"topic": "cats"})
```

<Note>
LangChain 聊天模型的网关路由需要 Python 和受支持的 `langchain-*` 集成包（最低版本在[gateway quickstart](/langsmith/llm-gateway-quickstart#using-langchain-and-deep-agents) 中列出）。如果集成包低于最低版本，调用将绕过网关，直接转至提供商。
</Note>

有关完整的配置选项、提供商支持和区域端点，请参阅 [LLM Gateway quickstart](/langsmith/llm-gateway-quickstart)。

## 提示缓存LangSmith SDK 包含内置的内存中提示缓存。启用后，LangSmith 将在内存中缓存拉取的提示，从而减少频繁使用的提示的延迟和 API 调用。缓存使用在所有客户端之间共享的全局单例实例，并在进程的生命周期内持续存在。它实现了“重新验证时失效”模式，确保您的应用程序始终获得快速响应，同时在后台保持提示最新。

**要求：**
- Python SDK：`langsmith >= 0.7.0`
- TypeScript SDK：`langsmith >= 0.5.0`

### 默认行为

缓存**默认启用**。启用后，默认设置为：

|设置|默认 |描述 |
|---------|---------|-------------|
| `max_size` | 100 | 100缓存的最大提示数|
| `ttl_seconds` | 300（5 分钟）|缓存的提示被视为过时之前的时间 |
| `refresh_interval_seconds` | 60|多久检查一次过时的提示并在后台刷新它们 |

刷新时，全局缓存将使用最后一个请求给定提示的客户端来获取新数据。

### 使用缓存

默认情况下，所有客户端都使用全局提示缓存。无需配置：

<CodeGroup>

```python Python
from langsmith import Client
# Obtain a reference to the global cache just for logging metrics
from langsmith.prompt_cache import prompt_cache_singleton

# Caching is enabled by default using the global singleton
client = Client()

# First pull - fetches from API and caches
prompt = client.pull_prompt("joke-generator")

# Subsequent pulls - returns cached version instantly
prompt = client.pull_prompt("joke-generator")

# Check cache metrics
print(f"Cache hits: {prompt_cache_singleton.metrics.hits}")
print(f"Cache misses: {prompt_cache_singleton.metrics.misses}")
print(f"Hit rate: {prompt_cache_singleton.metrics.hit_rate:.1%}")
```

```typescript TypeScript
import * as hub from "langchain/hub";
// Obtain a reference to the global cache just for logging metrics
import { promptCacheSingleton } from "langsmith";

// Caching is enabled by default
// First pull - fetches from API and caches
const prompt = await hub.pull("joke-generator");

// Subsequent pulls - returns cached version instantly
const prompt2 = await hub.pull("joke-generator");

// Check cache metrics
console.log(`Cache hits: ${promptCacheSingleton.metrics.hits}`);
console.log(`Cache misses: ${promptCacheSingleton.metrics.misses}`);
console.log(`Hit rate: ${(promptCacheSingleton.hitRate * 100).toFixed(1)}%`);
```

</CodeGroup>

### 配置全局缓存您可以配置所有客户端默认使用的全局提示缓存。当您想要在整个应用程序中自定义缓存行为时，这非常有用：

<CodeGroup>

```python Python
from langsmith import Client
from langsmith.prompt_cache import (
    configure_global_prompt_cache,
    prompt_cache_singleton,
)

# Configure global cache before creating any clients
configure_global_prompt_cache(
    max_size=200,  # Cache up to 200 prompts
    ttl_seconds=7200,  # Consider prompts stale after 2 hours
    refresh_interval_seconds=600,  # Check for stale prompts every 10 minutes
)

# All clients will use these settings
client1 = Client()
client2 = Client()

# Both clients share the same global cache with your custom settings
prompt1 = client1.pull_prompt("prompt-1")
prompt2 = client2.pull_prompt("prompt-2")

# Check global cache metrics
print(f"Global cache hits: {prompt_cache_singleton.metrics.hits}")
print(f"Global cache misses: {prompt_cache_singleton.metrics.misses}")
```

```typescript TypeScript
import * as hub from "langchain/hub";
import {
  configureGlobalPromptCache,
  promptCacheSingleton,
} from "langsmith";

// Configure global cache before pulling prompts
configureGlobalPromptCache({
  maxSize: 200,  // Cache up to 200 prompts
  ttlSeconds: 7200,  // Consider prompts stale after 2 hours
  refreshIntervalSeconds: 600,  // Check for stale prompts every 10 minutes
});

// All hub.pull calls will use these settings
const prompt1 = await hub.pull("prompt-1");
const prompt2 = await hub.pull("prompt-2");

// Check global cache metrics
console.log(`Global cache hits: ${promptCacheSingleton.metrics.hits}`);
console.log(`Global cache misses: ${promptCacheSingleton.metrics.misses}`);
```

</CodeGroup>

### 禁用缓存

要禁用特定客户端的缓存，请传递 `disable_prompt_cache=True`。您还可以全局配置最大大小为零：

<CodeGroup>

```python Python
from langsmith import Client

# Disable caching for this client
client = Client(disable_prompt_cache=True)

# Every pull will fetch from the API
prompt = client.pull_prompt("joke-generator")
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { configureGlobalPromptCache } from "langsmith";

// Disable caching globally
configureGlobalPromptCache({ maxSize: 0 });

// Every pull will fetch from the API
const prompt = await hub.pull("joke-generator");
```

</CodeGroup>

### 跳过缓存

要绕过缓存并从 API 获取单个请求的新提示，请使用 `skip_cache` 参数：

<CodeGroup>

```python Python
# Force a fresh fetch, ignoring any cached version
prompt = client.pull_prompt("joke-generator", skip_cache=True)
```

```typescript TypeScript
import * as hub from "langchain/hub";

// Force a fresh fetch, ignoring any cached version
const prompt = await hub.pull("joke-generator", { skipCache: true });
```

</CodeGroup>

当您需要确保拥有最新版本的提示时（例如在 LangSmith UI 中进行更改后），这非常有用。

### 离线模式

对于网络连接有限或没有网络连接的环境，您可以预先填充缓存并离线使用它。将 `ttl_seconds` 设置为 `None` (Python) 或 `null` (TypeScript) 以防止缓存条目过期并禁用后台刷新。

**第 1 步：将提示导出到缓存文件（在线时）**

<CodeGroup>

```python Python
from langsmith import Client
from langsmith.prompt_cache import prompt_cache_singleton

# Create client (caching is enabled by default)
client = Client()

# Pull the prompts you need
client.pull_prompt("prompt-1")
client.pull_prompt("prompt-2")
client.pull_prompt("prompt-3")

# Export cache to a file
prompt_cache_singleton.dump("prompts_cache.json")
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { promptCacheSingleton } from "langsmith";

// Caching is enabled by default

// Pull the prompts you need
await hub.pull("prompt-1");
await hub.pull("prompt-2");
await hub.pull("prompt-3");

// Export cache to a file
promptCacheSingleton.dump("prompts_cache.json");
```

</CodeGroup>

**步骤 2：在离线环境中加载缓存文件**

<CodeGroup>

```python Python
from langsmith import Client
from langsmith.prompt_cache import (
    configure_global_prompt_cache,
    prompt_cache_singleton,
)

# Configure cache with infinite TTL (never expire, no background refresh)
configure_global_prompt_cache(ttl_seconds=None)

# Load the cache file
prompt_cache_singleton.load("prompts_cache.json")

# Create client (uses the loaded cache)
client = Client()

# Uses cached version without any API calls
prompt = client.pull_prompt("prompt-1")
```

```typescript TypeScript
import * as hub from "langchain/hub";
import {
  configureGlobalPromptCache,
  promptCacheSingleton,
} from "langsmith";

// Configure cache with infinite TTL (never expire, no background refresh)
configureGlobalPromptCache({ ttlSeconds: null });

// Load the cache file
promptCacheSingleton.load("prompts_cache.json");

// Uses cached version without any API calls
const prompt = await hub.pull("prompt-1");
```

</CodeGroup>

### 缓存操作

缓存支持多种管理缓存提示的操作：

<CodeGroup>

```python Python
from langsmith import Client
from langsmith.prompt_cache import prompt_cache_singleton

client = Client()

# Invalidate a specific prompt from cache
prompt_cache_singleton.invalidate("joke-generator:latest")

# Clear all cached prompts
prompt_cache_singleton.clear()

# Reset metrics
prompt_cache_singleton.reset_metrics()

# Check if cache is running background refresh
# (only runs if ttl_seconds is not None)
if prompt_cache_singleton._refresh_thread is not None:
    print("Background refresh is active")
```

```typescript TypeScript
import { promptCacheSingleton } from "langsmith";

// Invalidate a specific prompt from cache
promptCacheSingleton.invalidate("joke-generator:latest");

// Clear all cached prompts
promptCacheSingleton.clear();

// Reset metrics
promptCacheSingleton.resetMetrics();
```</CodeGroup>

### 清理

您可以手动调用`stop()`停止后台刷新任务：

<CodeGroup>

```python Python
prompt_cache_singleton.stop()
```

```typescript TypeScript
promptCacheSingleton.stop();
```

</CodeGroup>

<Note>
仅当您首次在缓存中设置值时，并且仅当 `ttl_seconds` 不是 `None` 时，才会启动后台刷新任务。如果`ttl_seconds`是`None`（离线模式），则不会创建后台任务。
</Note>

## 使用不带 LangChain 的提示

如果您想将提示存储在 LangSmith 中，但直接通过模型提供商的 API 使用它们，您可以使用我们的转换方法。这些会将您的提示转换为 OpenAI 或 Anthropic API 所需的负载。

这些转换方法依赖于LangChain集成包中的逻辑，除了您选择的官方 SDK 之外，您还需要安装适当的包作为依赖项。以下是一些示例：

### OpenAI

<CodeGroup>

```bash Python
pip install -U langchain_openai
```

```bash TypeScript
yarn add @langchain/openai @langchain/core # @langchain/openai version >= 0.3.2
```

</CodeGroup>

<CodeGroup>

```python Python
from openai import OpenAI
from langsmith.client import Client, convert_prompt_to_openai_format

# langsmith client
client = Client()
# openai client
oai_client = OpenAI()

# pull prompt and invoke to populate the variables
prompt = client.pull_prompt("joke-generator")
prompt_value = prompt.invoke({"topic": "cats"})
openai_payload = convert_prompt_to_openai_format(prompt_value)
openai_response = oai_client.chat.completions.create(**openai_payload)
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { convertPromptToOpenAI } from "@langchain/openai";
import OpenAI from "openai";

const prompt = await hub.pull("jacob/joke-generator");
const formattedPrompt = await prompt.invoke({
  topic: "cats",
});
const { messages } = convertPromptToOpenAI(formattedPrompt);

const openAIClient = new OpenAI();
const openAIResponse = await openAIClient.chat.completions.create({
  model: "gpt-5.4-mini",
  messages,
});
```

```java Java
import static com.langchain.smith.prompts.PromptConverters.convertToOpenAIParams;
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.prompts.Prompt;
import com.langchain.smith.prompts.PromptClient;
import com.langchain.smith.prompts.PromptValue;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import java.util.Map;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();
PromptClient promptClient = PromptClient.create(client);
OpenAIClient openai = OpenAIOkHttpClient.fromEnv();

Prompt prompt = promptClient.pull("jacob/joke-generator");
PromptValue formattedPrompt = prompt.invoke(Map.of("topic", "cats"));

ChatCompletion completion = openai.chat().completions().create(
    convertToOpenAIParams(formattedPrompt)
        .model(ChatModel.GPT_4_1_MINI)
        .build()
);
```

</CodeGroup>

### Anthropic

<CodeGroup>

```bash Python
pip install -U langchain_anthropic
```

```bash TypeScript
yarn add @langchain/anthropic @langchain/core # @langchain/anthropic version >= 0.3.3
```

</CodeGroup>

<CodeGroup>

```python Python
from anthropic import Anthropic
from langsmith.client import Client, convert_prompt_to_anthropic_format

# langsmith client
client = Client()
# anthropic client
anthropic_client = Anthropic()

# pull prompt and invoke to populate the variables
prompt = client.pull_prompt("joke-generator")
prompt_value = prompt.invoke({"topic": "cats"})
anthropic_payload = convert_prompt_to_anthropic_format(prompt_value)
anthropic_response = anthropic_client.messages.create(**anthropic_payload)
```

```typescript TypeScript
import * as hub from "langchain/hub";
import { convertPromptToAnthropic } from "@langchain/anthropic";
import Anthropic from "@anthropic-ai/sdk";

const prompt = await hub.pull("jacob/joke-generator");
const formattedPrompt = await prompt.invoke({
  topic: "cats",
});
const { messages, system } = convertPromptToAnthropic(formattedPrompt);

const anthropicClient = new Anthropic();
const anthropicResponse = await anthropicClient.messages.create({
  model: "claude-haiku-4-5-20251001",
  system,
  messages,
  max_tokens: 1024,
  stream: false,
});
```

```java Java
import static com.langchain.smith.prompts.PromptConverters.convertToAnthropicParams;
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.Model;
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.prompts.Prompt;
import com.langchain.smith.prompts.PromptClient;
import com.langchain.smith.prompts.PromptValue;
import java.util.Map;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();
PromptClient promptClient = PromptClient.create(client);
AnthropicClient anthropic = AnthropicOkHttpClient.fromEnv();

Prompt prompt = promptClient.pull("jacob/joke-generator");
PromptValue formattedPrompt = prompt.invoke(Map.of("topic", "cats"));

Message message = anthropic.messages().create(
    convertToAnthropicParams(formattedPrompt)
        .model(Model.CLAUDE_SONNET_4_5)
        .maxTokens(1024)
        .build()
);
```

</CodeGroup>

## 列出、删除和点赞提示

您还可以使用 `list prompts`、`delete prompt`、`like prompt` 和 `unlike prompt` 方法列出、删除以及喜欢/不喜欢提示。有关这些方法的详细文档，请参阅[LangSmith SDK client](https://github.com/langchain-ai/langsmith-sdk)。

<CodeGroup>

```python Python
# List all prompts in my workspace
prompts = client.list_prompts()

# List my private prompts that include "joke"
prompts = client.list_prompts(query="joke", is_public=False)

# Delete a prompt
client.delete_prompt("joke-generator")

# Like a prompt
client.like_prompt("efriis/my-first-prompt")

# Unlike a prompt
client.unlike_prompt("efriis/my-first-prompt")
```

```typescript TypeScript
// List all prompts in my workspace
import Client from "langsmith";

const client = new Client({ apiKey: "lsv2_..." });
const prompts = client.listPrompts();

for await (const prompt of prompts) {
  console.log(prompt);
}

// List my private prompts that include "joke"
const private_joke_prompts = client.listPrompts({ query: "joke", isPublic: false});

// Delete a prompt
client.deletePrompt("joke-generator");

// Like a prompt
client.likePrompt("efriis/my-first-prompt");

// Unlike a prompt
client.unlikePrompt("efriis/my-first-prompt");
```

```java Java
import com.langchain.smith.client.LangsmithClient;
import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
import com.langchain.smith.models.repos.RepoDeleteParams;
import com.langchain.smith.models.repos.RepoListPage;
import com.langchain.smith.models.repos.RepoListParams;
import com.langchain.smith.models.repos.RepoWithLookups;

LangsmithClient client = LangsmithOkHttpClient.fromEnv();

// List all prompts in my workspace
RepoListPage prompts = client.repos().list();
for (RepoWithLookups prompt : prompts.repos()) {
    System.out.println(prompt.repoHandle());
}

// List my private prompts that include "joke"
RepoListPage jokePrompts = client.repos().list(
    RepoListParams.builder()
        .query("joke")
        .isPublic(RepoListParams.IsPublic.FALSE)
        .build()
);

// Delete a prompt
client.repos().delete(
    RepoDeleteParams.builder()
        .owner("-")
        .repo("joke-generator")
        .build()
);
```

</CodeGroup>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-prompts-programmatically.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>