<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/oss/deepagents/code/providers -->

# 模型提供者

为 Deep Agents Code 配置任何与 LangChain 兼容的模型提供程序

Deep Agents Code 支持任何[chat model provider compatible with LangChain](/oss/python/integrations/chat)，几乎可以解锁任何支持工具调用的 LLM。任何公开 OpenAI 兼容或 Anthropic 兼容 API 的服务也可以开箱即用 - 请参阅[Compatible APIs](/oss/deepagents/code/config-file#compatible-apis)。

## 快速入门

Deep Agents Code 自动与 [following model providers](#provider-reference) 集成：除了安装相关的提供程序包之外，无需额外配置。

1. **安装提供程序包**

   每个模型提供商都需要相应的LangChain集成包。这些作为可选附件提供，以保持应用程序的轻量级。默认情况下包含 OpenAI、Anthropic 和 Gemini。使用 `/install` 从会话中安装任何其他附加组件，或者使用 `dcode --install` 从 shell 安装：

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /install groq
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     dcode --install groq
     ```
   </CodeGroup>

   运行不带参数的`/install`来列出有效的额外内容。要在初始 CLI 安装期间预安装附加功能，请设置 `DEEPAGENTS_CODE_EXTRAS`：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   DEEPAGENTS_CODE_EXTRAS="baseten,groq" curl -LsSf https://langch.in/dcode | bash
   ```

2. **设置凭证**

   使用 [⟦T34⟧](/oss/deepagents/code/credentials#use-%2Fauth-recommended) 凭证管理器为您的提供商添加 API 密钥：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   /auth
   ```

   `/auth` 显示可用提供者的列表并存储凭据以供跨会话重用。对于非交互式运行、CI/CD 或 TUI 不可用的任何地方，请使用 [⟦T36⟧](/oss/deepagents/code/credentials#manage-credentials-from-the-shell-dcode-auth) 从 shell 存储相同的密钥，或者改为设置提供程序的环境变量。请参阅[Provider credentials](/oss/deepagents/code/credentials)了解完整的密钥解析顺序，[⟦T37⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)了解深度代理代码的密钥范围，以及[Provider reference](#provider-reference)了解每个提供商的环境变量。

   要配置模型参数，请参阅[Model parameters](#model-parameters)。

## 提供者参考

使用此处未列出的提供商？请参阅[Arbitrary providers](/oss/deepagents/code/config-file#arbitrary-providers)：任何与 LangChain 兼容的提供程序都可以通过额外的设置在深度代理代码中使用。|供应商|套餐 |凭证环境变量 |型号简介|
| -------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------- |
|开放人工智能 | [⟦T38⟧](/oss/python/integrations/chat/openai) | `OPENAI_API_KEY` | ✅ |
| OpenAI（法典）| [⟦T40⟧](/oss/python/integrations/chat/openai) |无 — [sign in with ChatGPT](#sign-in-with-chatgpt) | ✅ |
| Azure 开放人工智能 | [⟦T41⟧](/oss/python/integrations/chat/azure_chat_openai) | `AZURE_OPENAI_API_KEY` | ✅ |
|人择 | [⟦T43⟧](/oss/python/integrations/chat/anthropic) | `ANTHROPIC_API_KEY` | ✅ |
|谷歌双子座 API | [⟦T45⟧](/oss/python/integrations/chat/google_generative_ai) | `GOOGLE_API_KEY` | ✅ |
|谷歌顶点人工智能 | [⟦T47⟧](/oss/python/integrations/chat/google_generative_ai#credentials) | `GOOGLE_CLOUD_PROJECT` | ✅ |
|巴斯坦| [⟦T49⟧](https://github.com/basetenlabs/langchain-baseten) | `BASETEN_API_KEY` | ✅ || AWS 基岩 | [⟦T51⟧](/oss/python/integrations/chat/bedrock) | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` | ✅ |
| AWS Bedrock 匡威 | AWS Bedrock [⟦T54⟧](/oss/python/integrations/chat/bedrock) | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` | ✅ |
|拥抱脸| [⟦T57⟧](/oss/python/integrations/chat/huggingface) | `HUGGINGFACEHUB_API_TOKEN` | ✅ |
|奥拉玛 | [⟦T59⟧](/oss/python/integrations/chat/ollama) | `OLLAMA_API_KEY`（仅限云；可选）| ❌ |
|格罗克 | [⟦T61⟧](/oss/python/integrations/chat/groq) | `GROQ_API_KEY` | ✅ |
|连贯| [⟦T63⟧](/oss/python/integrations/chat/cohere) | `COHERE_API_KEY` | ❌ |
|烟花| [⟦T65⟧](/oss/python/integrations/chat/fireworks) | `FIREWORKS_API_KEY` | ✅ |
|一起| [⟦T67⟧](/oss/python/integrations/chat/together) | `TOGETHER_API_KEY` | ❌ |
|元 | [⟦T69⟧](https://github.com/langchain-ai/langchain-meta) | `MODEL_API_KEY` | ✅ |
|米斯特拉尔人工智能 | [⟦T71⟧](/oss/python/integrations/chat/mistralai) | `MISTRAL_API_KEY` | ✅ ||深度搜索| [⟦T73⟧](/oss/python/integrations/chat/deepseek) | `DEEPSEEK_API_KEY` | ✅ |
| IBM（watsonx.ai）| [⟦T75⟧](/oss/python/integrations/chat/ibm_watsonx) | `WATSONX_APIKEY` | ❌ |
|英伟达 | [⟦T77⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | `NVIDIA_API_KEY` | ✅ |
| xAI | [⟦T79⟧](/oss/python/integrations/chat/xai) | `XAI_API_KEY` | ✅ |
|困惑| [⟦T81⟧](/oss/python/integrations/chat/perplexity) | `PERPLEXITY_API_KEY`（或`PPLX_API_KEY`）| ✅ |
|开放路由器 | [⟦T84⟧](/oss/python/integrations/chat/openrouter) | `OPENROUTER_API_KEY` | ✅ |
|莱特法学硕士 | [⟦T86⟧](/oss/python/integrations/chat/litellm) |每个提供商（请参阅[docs](https://docs.litellm.ai/)）| ❌ |

<Tip>
  您可以通过添加 `DEEPAGENTS_CODE_` 前缀将任何凭证范围限定为 Deep Agents Code。例如，在深度代理代码中，`DEEPAGENTS_CODE_OPENAI_API_KEY`优先于`OPENAI_API_KEY`，而不影响其他工具。详情请参阅[⟦T90⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)。
</Tip><Tip>
  [Model profiles](/oss/python/langchain/models#model-profiles) 提供交互式`/model` 切换器使用的模型元数据。如果切换器中缺少型号，请直接传递型号名称或通过`config.toml`添加。
</Tip>

### 使用 ChatGPT 登录

`openai_codex` 提供商允许您通过付费 **ChatGPT** 订阅使用 OpenAI 的 Codex 模型，而不是 `OPENAI_API_KEY`。您使用 ChatGPT 帐户登录，它会在 `/auth` 和 `/model` 切换器中显示为自己的提供商，与基于 API 密钥的 `openai` 提供商分开。

<Steps>
  <Step title="Start the sign-in">
    在任意会话中运行 `/auth` 并选择 **`openai_codex`**。由于 ChatGPT 通过浏览器让您登录，因此这会启动浏览器登录，而不是要求 API 密钥。
  </Step>

  <Step title="Authorize in your browser">
    Deep Agents Code 将在您的浏览器中打开 ChatGPT 登录页面。如果它无法打开浏览器（例如，通过 SSH），它还会在屏幕上显示登录 URL，以便您可以将其复制到另一台设备上的浏览器。
  </Step>

  <Step title="Select a Codex model">
    登录后，Codex 模型将显示在 `openai_codex` 提供商下的 `/model` 切换器中。直接根据其规格切换到一个：

    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    /model openai_codex:gpt-5.5
    ```
  </Step>
</Steps>您的登录在各个会话中持续存在。要检查您的状态或注销，请运行`/auth`，选择`openai_codex`，然后选择重新验证或注销。

<Note>
  `openai_codex` 与 `openai` 是分开的。要使用带有标准 API 密钥的 OpenAI 模型，请使用常规 `openai` 提供程序（例如 `/model openai:gpt-5.5`）。
</Note>

<Note>
  某些提供商特定的帐户类型或关键范围可能不适用于 API 访问。如果提供程序在 `/auth` 中已配置，但请求仍然失败，请验证帐户计划和 API 密钥权限是否符合提供程序的 API 要求。
</Note>

### 模型路由器和代理

[OpenRouter](https://openrouter.ai/) 和 [LiteLLM](https://docs.litellm.ai/) 等模型路由器提供通过单个端点对多个提供者的模型的访问。

使用这些服务的专用集成包：|路由器|套餐 |配置|
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
|开放路由器| [⟦T109⟧](/oss/python/integrations/chat/openrouter) | `openrouter:<model>`（内置，参见[Provider reference](#provider-reference)）|
|莱特法学硕士 | [⟦T111⟧](/oss/python/integrations/chat/litellm) | `litellm:<model>`（内置，参见[Provider reference](#provider-reference)）|

**OpenRouter** 是一个内置提供程序 - 安装额外的并直接使用它：

<CodeGroup>
  ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  /install openrouter
  ```

  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --install openrouter
  ```
</CodeGroup>

**LiteLLM** 也是一个内置提供程序：

<CodeGroup>
  ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  /install litellm
  ```

  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --install litellm
  ```
</CodeGroup>

## 切换型号

要在 Deep Agents Code 中切换模型，请执行以下任一操作：

1. **通过 `/model` 命令使用交互式模型切换器**。

   <Note>
     并非所有模型都出现在这里。如果您的型号丢失，请直接传递型号名称（例如`/model gpt-5.5`）或将其添加到`config.toml`。
   </Note>
2. **直接指定模型名称**作为参数，例如`/model gpt-5.5`。您可以使用所选提供商支持的任何模型，无论它是否出现在选项 1 的列表中。模型名称将传递到 API 请求。
3. **通过`--model`指定启动时的型号**，例如

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   dcode --model openai:gpt-5.5
   ```<Accordion title="Model resolution order" icon="list-numbers">
  当 Deep Agents Code 启动时，它会按以下顺序解析要使用的模型：

  1. **`--model` 标志** 在提供时始终获胜。
  2. `~/.deepagents/config.toml`中的**`[models].default`**——用户有意的长期偏好。
  3. **`~/.deepagents/config.toml`中的`[models].recent`**——最后一个模型通过`/model`切换到。自动写入；永远不会覆盖`[models].default`。
  4. **环境自动检测**：回退到第一个可用的启动凭据，按顺序检查：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_API_KEY`、`GOOGLE_CLOUD_PROJECT`（Vertex AI）。

  此启动回退有意仅检查这四个凭据。其他受支持的提供程序（例如 Groq）仍然可以通过 `--model`、`/model` 和保存的默认值 (`[models].default` / `[models].recent`) 获得。
</Accordion>

### 哪些型号出现在切换器中

`/model` 选择器从已安装的提供程序包动态构建其列表。下面展开以了解完整的标准和故障排除。

<Accordion title="How the switcher builds its model list" icon="list-search">
  交互式 `/model` 选择器根据已安装的提供程序包和在 `config.toml` 中配置的模型构建其列表。

  在以下情况下会出现模型：1. 安装提供程序包。
  2. 该模型可从提供商包、本地提供商或您的`config.toml` 获得。
  3. 模型配置文件不会将文本输入或输出标记为不支持。

  如果缺少型号，请直接使用`/model <provider>:<model>`或将其添加到[⟦T138⟧](/oss/deepagents/code/config-file#adding-models-to-the-interactive-switcher)。

  <Tip>
    凭证状态**不**影响模型是否列出。您仍然可以选择缺少凭据的模型。提供商在请求时报告身份验证错误。
  </Tip>
</Accordion>

### 开放重量模型

如果您想使用开放权重模型，有两种常见路径，具体取决于您喜欢本地推理还是云托管推理。

**使用 Ollama 进行本地推理**是免费开始的最简单方法，无需 API 密钥：

1. [Install Ollama](https://ollama.com/) 并拉取一个模型，例如：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   ollama pull qwen3:4b
   ```

2. 安装 Ollama 额外组件：

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /install ollama
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     dcode --install ollama
     ```
   </CodeGroup>

3、选择型号：

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /model
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     dcode --model ollama:qwen3:4b
     ```
   </CodeGroup>

   使用交互式切换器，或者直接使用`/model ollama:qwen3:4b`传递模型。

**通过 Groq 的云托管开放权重**为您提供快速推理，无需在本地运行任何内容：

1. 在[console.groq.com](https://console.groq.com/)获取免费的API密钥。

2. 安装 Groq 额外组件：

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /install groq
     ``````bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     dcode --install groq
     ```
   </CodeGroup>

3. 选择型号：

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /model
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     GROQ_API_KEY="your-api-key" dcode --model groq:openai/gpt-oss-120b
     ```
   </CodeGroup>

   使用交互式切换器，或者直接使用`/model groq:openai/gpt-oss-120b`传递模型。

**Fireworks** 是另一个流行的开放权重模型云提供商：

<CodeGroup>
  ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  /install fireworks
  /model
  ```

  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --install fireworks
  FIREWORKS_API_KEY="your-api-key" dcode --model fireworks:accounts/fireworks/models/deepseek-v4-pro
  ```
</CodeGroup>

使用交互式切换器，或者直接使用`/model fireworks:accounts/fireworks/models/deepseek-v4-pro`传递模型。

**Baseten** 是另一个开放权重模型的云提供商：

<CodeGroup>
  ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  /install baseten
  /model
  ```

  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --install baseten
  BASETEN_API_KEY="your-api-key" dcode --model baseten:moonshotai/Kimi-K2.7-Code
  ```
</CodeGroup>

使用交互式切换器，或者直接使用`/model baseten:moonshotai/Kimi-K2.7-Code`传递模型。

<Tip>
  如果您希望与 CLI 本身同时预安装提供程序，请在初始安装期间使用 `DEEPAGENTS_CODE_EXTRAS`：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  DEEPAGENTS_CODE_EXTRAS="fireworks" curl -LsSf https://langch.in/dcode | bash
  ```

  您可以组合多个提供商：`DEEPAGENTS_CODE_EXTRAS="groq,fireworks,ollama"`。如果已安装 Deep Agents Code，请在会话中使用 `/install <extra>` 或从 shell 中使用 `dcode --install <extra>`。
</Tip>

**Together**、**OpenRouter** 和 **Hugging Face** (`langchain-huggingface`) 是云托管开放权重的其他选项。有关凭据和包名称，请参阅 [Provider reference](#provider-reference)。

### 设置默认模型

您可以设置适用于所有未来 CLI 启动的持久默认模型：* **通过模型选择器：** 打开 `/model`，导航到所需模型，然后按 `Ctrl+S` 将其固定为默认模型。在当前默认值上再次按 `Ctrl+S` 将其清除。
* **通过命令：** `/model --default provider:model`（例如，`/model --default anthropic:claude-opus-4-8`）
* **通过配置文件：** 在`~/.deepagents/config.toml`中设置`[models].default`（参见[Configuration](/oss/deepagents/code/configuration)）。
* **来自外壳：**

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --default-model anthropic:claude-opus-4-8
  ```

查看当前默认值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --default-model
```

要清除默认值：

* **来自外壳：**

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --clear-default-model
  ```

* **通过命令：** `/model --default --clear`

* **通过模型选择器：** 在当前固定的默认模型上按 `Ctrl+S`。

如果没有默认值，Deep Agents Code 将使用最近使用的模型。

### 模型参数

将额外的构造函数 kwargs 传递给模型 - 采样控制、推理/思考预算、上下文窗口大小、请求超时以及底层聊天模型类接受的任何其他内容。设置它们的三个位置，按优先级顺序（最高优先）：

1. **启动时一次性使用 `--model-params`。** JSON 字符串，仅限会话：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   # OpenAI reasoning effort
   dcode --model openai:gpt-5.5 --model-params '{"reasoning": {"effort": "high"}}'

   # Anthropic extended thinking
   dcode --model anthropic:claude-opus-4-8 --model-params '{"thinking": {"type": "enabled", "budget_tokens": 10000}, "max_tokens": 16000}'
   ```

2. **通过 `/model --model-params` 进行中会话。** 相同的 JSON 语法 — 交换参数（以及可选的模型）而无需重新启动：

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   /model --model-params '{"temperature": 0.7}' anthropic:claude-opus-4-8
   /model --model-params '{"num_ctx": 16384}'           # opens selector, applies params to choice
   ```

3. **在 `config.toml` 中保持不变。** 提供程序级别的默认值（带有可选的每个模型子表）适用于每次启动：

   ```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   [models.providers.anthropic.params]
   thinking = { type = "enabled", budget_tokens = 10000 }
   max_tokens = 16000

   [models.providers.openai.params]
   reasoning = { effort = "high", summary = "auto" }
   output_version = "responses/v1"

   [models.providers.ollama.params]
   num_ctx = 16384
   temperature = 0

   # Per-model override—wins over provider-level keys
   [models.providers.ollama.params."qwen3:4b"]
   temperature = 0.5
   ```CLI 标志覆盖配置文件 `params` 并且仅适用于会话（会话中的更改不会保留）。 `config.toml` 中的每个模型子表覆盖提供者级别的键（浅合并 - 有关完整语义，请参阅[Model constructor params](/oss/deepagents/code/config-file#model-constructor-params)）。 `--model-params` 不能与`--default` 组合使用。

对于重试计数，首选 `--max-retries` 或顶级 [⟦T165⟧ config](/oss/deepagents/code/config-file#retries)。

<Tip>
  底层聊天模型构造函数接受的任何 kwarg 都是有效的。请参阅提供商的参考文档以获取完整列表，例如[⟦T166⟧](https://reference.langchain.com/python/langchain-anthropic/langchain_anthropic/chat_models/ChatAnthropic)、[⟦T167⟧](https://reference.langchain.com/python/langchain-openai/langchain_openai/chat_models/base/ChatOpenAI)、[⟦T168⟧](https://reference.langchain.com/python/langchain-ollama/langchain_ollama/chat_models/ChatOllama)。未知的 kwargs 会转发到上游 API 请求，因此新发布的参数无需 CLI 更新即可工作。
</Tip>

<Note>
  不要将凭据 (`api_key`) 放入 `params` — 使用 [⟦T171⟧](/oss/deepagents/code/config-file#provider-configuration) 来指向环境变量。
</Note>

要覆盖模型运行时*配置文件*上的字段（`max_input_tokens`、`tool_calling`、功能标志）（与构造函数参数不同），请参阅[Profile overrides](/oss/deepagents/code/config-file#profile-overrides-advanced)。

## 高级配置

有关提供程序参数、配置文件覆盖、自定义基本 URL、兼容 API、任意提供程序和生命周期挂钩的详细配置，请参阅 [Config file](/oss/deepagents/code/config-file) 和 [Hooks](/oss/deepagents/code/hooks)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>