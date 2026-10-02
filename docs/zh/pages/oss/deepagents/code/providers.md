<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/oss/deepagents/code/providers -->

# 模型提供者

Configure any LangChain-compatible model provider for Deep Agents Code

Deep Agents Code supports any [chat model provider compatible with LangChain](/oss/python/integrations/chat), unlocking use for virtually any LLM that supports tool calling. Any service that exposes an OpenAI-compatible or Anthropic-compatible API also works out of the box—see [Compatible APIs](/oss/deepagents/code/config-file#compatible-apis).

## 快速入门

Deep Agents Code integrates automatically with the [following model providers](#provider-reference): no extra configuration needed beyond installing the relevant provider package.

1. **安装提供程序包**

   Each model provider requires its corresponding LangChain integration package. These ship as optional extras to keep the application lightweight. OpenAI, Anthropic, and Gemini are included by default. Install any other extra from within a session with `/install`, or from the shell with `dcode --install`:

   <CodeGroup>
     ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     /install groq
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     dcode --install groq
     ```
   </CodeGroup>

   Run `/install` with no argument to list the valid extras. To preinstall extras during the initial CLI install, set `DEEPAGENTS_CODE_EXTRAS`:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   DEEPAGENTS_CODE_EXTRAS="baseten,groq" curl -LsSf https://langch.in/dcode | bash
   ```

2. **设置凭证**

   Add an API key for your provider with the [⟦T40⟧](/oss/deepagents/code/credentials#use-%2Fauth-recommended) credential manager:

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   /auth
   ```

   `/auth` shows a list of available providers and stores credentials for reuse across sessions.对于非交互式运行、CI/CD 或 TUI 不可用的任何地方，请使用 [⟦T42⟧](/oss/deepagents/code/credentials#manage-credentials-from-the-shell-dcode-auth) 从 shell 存储相同的密钥，或者改为设置提供程序的环境变量。请参阅[Provider credentials](/oss/deepagents/code/credentials)了解完整的密钥解析顺序，[⟦T43⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)了解将密钥范围确定为Deep Agents代码，以及[Provider reference](#provider-reference)了解每个提供商的环境变量。

   要配置模型参数，请参阅[Model parameters](#model-parameters)。

## 提供者参考

使用此处未列出的提供商？请参阅 [Arbitrary providers](/oss/deepagents/code/config-file#arbitrary-providers)：任何与 LangChain 兼容的提供程序都可以在 Deep Agents 代码中使用，并进行额外设置。|供应商|套餐 | Credential env var |型号简介|
| - | - | - | - |
| OpenAI | [⟦T44⟧](/oss/python/integrations/chat/openai) | `OPENAI_API_KEY` | ✅ |
| OpenAI (Codex) | [⟦T46⟧](/oss/python/integrations/chat/openai) |没有任何; [sign in with ChatGPT](#sign-in-with-chatgpt) | ✅ |
|天蓝色OpenAI| [⟦T47⟧](/oss/python/integrations/chat/azure_chat_openai) | `AZURE_OPENAI_API_KEY` | ✅ |
| Anthropic | [⟦T49⟧](/oss/python/integrations/chat/anthropic) | `ANTHROPIC_API_KEY` | ✅ |
| Google Gemini API | [⟦T51⟧](/oss/python/integrations/chat/google_generative_ai) | `GOOGLE_API_KEY` | ✅ |
| Gemini企业代理平台| [⟦T53⟧](/oss/python/integrations/chat/google_generative_ai#credentials) | `GOOGLE_CLOUD_PROJECT` | ✅ |
| Gemini企业代理平台(Anthropic)| [⟦T55⟧](/oss/python/integrations/chat/google_anthropic_vertex) | `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` | ✅ |
|巴斯坦| [⟦T58⟧](https://github.com/basetenlabs/langchain-baseten) | `BASETEN_API_KEY` | ✅ |
| AWS 基岩 | [⟦T60⟧](/oss/python/integrations/chat/bedrock) | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` | ✅ |
| AWS Bedrock Converse | [⟦T63⟧](/oss/python/integrations/chat/bedrock) | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` | ✅ |
| Hugging Face | [⟦T66⟧](/oss/python/integrations/chat/huggingface) | `HUGGINGFACEHUB_API_TOKEN` | ✅ |
|奥拉玛 | [⟦T68⟧](/oss/python/integrations/chat/ollama) | `OLLAMA_API_KEY`（仅限云；可选）| ❌ |
|格罗克 | [⟦T70⟧](/oss/python/integrations/chat/groq) | `GROQ_API_KEY` | ✅ |
|连贯| [⟦T72⟧](/oss/python/integrations/chat/cohere) | `COHERE_API_KEY` | ❌ |
|烟花| [⟦T74⟧](/oss/python/integrations/chat/fireworks) | `FIREWORKS_API_KEY` | ✅ |
|一起| [⟦T76⟧](/oss/python/integrations/chat/together) | `TOGETHER_API_KEY` | ❌ |
|元 | [⟦T78⟧](https://github.com/langchain-ai/langchain-meta) | `MODEL_API_KEY` | ✅ |
| Mistral AI | [⟦T80⟧](/oss/python/integrations/chat/mistralai) | `MISTRAL_API_KEY` | ✅ |
|深度搜索| [⟦T82⟧](/oss/python/integrations/chat/deepseek) | `DEEPSEEK_API_KEY` | ✅ |
| IBM（watsonx.ai）| [⟦T84⟧](/oss/python/integrations/chat/ibm_watsonx) | `WATSONX_APIKEY` | ❌ |
|英伟达 | [⟦T86⟧](/oss/python/integrations/chat/nvidia_ai_endpoints) | `NVIDIA_API_KEY` | ✅ |
| xAI | [⟦T88⟧](/oss/python/integrations/chat/xai) | `XAI_API_KEY` | ✅ |
|困惑| [⟦T90⟧](/oss/python/integrations/chat/perplexity) | `PERPLEXITY_API_KEY`（或`PPLX_API_KEY`）| ✅ |
|开放路由器| [⟦T93⟧](/oss/python/integrations/chat/openrouter) | `OPENROUTER_API_KEY` | ✅ |
|莱特法学硕士 | [⟦T95⟧](/oss/python/integrations/chat/litellm) |每个提供商（请参阅[docs](https://docs.litellm.ai/)）| ❌ |<Accordion title="Configure Anthropic models on Gemini Enterprise Agent Platform" icon="brand-google">
  `google_anthropic_vertex` 提供商通过 Gemini Enterprise Agent Platform 上的Anthropic 的消息 API 运行 Claude。它使用 Google Cloud 应用程序默认凭据 (ADC)，而不是 Anthropic API 密钥。

  要使用提供程序：

  1. 额外安装 Gemini Enterprise Agent Platform：

     <CodeGroup>
       ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       /install vertex
       ```

       ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       dcode --install vertex
       ```
     </CodeGroup>

  2. [Enable a Claude model in your Google Cloud project](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/claude)，然后配置ADC：

     ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     gcloud auth application-default login
     ```

  3. 设置您的 Google Cloud 项目和位置：

     ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     export GOOGLE_CLOUD_PROJECT="your-project-id"
     export GOOGLE_CLOUD_LOCATION="global"
     ```

     You can use `DEEPAGENTS_CODE_GOOGLE_CLOUD_PROJECT` and `DEEPAGENTS_CODE_GOOGLE_CLOUD_LOCATION` to scope these values to Deep Agents Code.

  4. 选择具有 `google_anthropic_vertex` 提供商的 Claude 模型：

     <CodeGroup>
       ```txt In session theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       /model google_anthropic_vertex:claude-sonnet-4-6
       ```

       ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       dcode --model google_anthropic_vertex:claude-sonnet-4-6
       ```
     </CodeGroup>

  对于 Google 模型，请使用 `google_vertexai`。 Claude models use Anthropic's Messages API and must use `google_anthropic_vertex` instead.
</Accordion>

<Tip>
  You can scope any credential to Deep Agents Code by adding a `DEEPAGENTS_CODE_` prefix. For example, `DEEPAGENTS_CODE_OPENAI_API_KEY` takes priority over `OPENAI_API_KEY` within Deep Agents Code without affecting other tools.详情请参阅[⟦T105⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix)。
</Tip>

<Tip>
  [Model profiles](/oss/python/langchain/models#model-profiles) 提供交互式`/model` 切换器使用的模型元数据。如果切换器中缺少型号，请直接传递型号名称或通过`config.toml`添加。
</Tip>

### 使用 ChatGPT 登录`openai_codex` 提供商允许您在付费 **ChatGPT** 订阅中使用 OpenAI 的 Codex 模型，而不是 `OPENAI_API_KEY`。您使用 ChatGPT 帐户登录，它会在 `/auth` 和 `/model` 切换器中显示为自己的提供商，与基于 API 密钥的 `openai` 提供商分开。

<Steps>
  <Step title="Start the sign-in">
    在任何会话中运行 `/auth` 并选择 **`openai_codex`**。由于 ChatGPT 通过浏览器让您登录，因此这会启动浏览器登录，而不是要求 API 密钥。
  </Step>

  <Step title="Authorize in your browser">
    Deep Agents 代码将您的浏览器打开至 ChatGPT 登录页面。如果无法打开浏览器（例如，通过 SSH），它还会在屏幕上显示登录 URL，以便您可以将其复制到其他设备上的浏览器。
  </Step>

  <Step title="Select a Codex model">
    登录后，Codex 模型将显示在 `openai_codex` 提供商下的 `/model` 切换器中。直接根据其规格切换到一个：

    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    /model openai_codex:gpt-5.5
    ```
  </Step>
</Steps>

您的登录在各个会话中持续存在。要检查您的状态或注销，请运行`/auth`，选择`openai_codex`，然后选择重新验证或注销。

<Note>
  `openai_codex` 与 `openai` 是分开的。要使用带有标准 API 密钥的 OpenAI 模型，请使用常规 `openai` 提供程序（例如 `/model openai:gpt-5.5`）。
</Note><Note>
  某些提供商特定的帐户类型或关键范围可能不适用于 API 访问。如果提供程序在 `/auth` 中已配置，但请求仍然失败，请验证帐户计划和 API 密钥权限是否符合提供程序的 API 要求。
</Note>

### 模型路由器和代理

[OpenRouter](https://openrouter.ai/) 和 [LiteLLM](https://docs.litellm.ai/) 等模型路由器提供通过单个端点对多个提供者的模型的访问。

使用这些服务的专用集成包：

|路由器|套餐 |配置|
| - | - | - |
|开放路由器| [⟦T124⟧](/oss/python/integrations/chat/openrouter) | `openrouter:<model>`（内置，参见[Provider reference](#provider-reference)）|
|莱特法学硕士 | [⟦T126⟧](/oss/python/integrations/chat/litellm) | `litellm:<model>`（内置，参见[Provider reference](#provider-reference)）|

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

要在 Deep Agents 代码中切换型号，可以：

1. **通过 `/model` 命令使用交互式模型切换器**。<Note>
     并非所有模型都出现在这里。如果您的型号丢失，请直接传递型号名称（例如`/model gpt-5.5`）或将其添加到`config.toml`。
   </Note>
2. **直接指定模型名称**作为参数，例如`/model gpt-5.5`。您可以使用所选提供商支持的任何模型，无论它是否出现在选项 1 的列表中。模型名称将传递到 API 请求。
3. **通过`--model`指定启动时的型号**，例如

   ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   dcode --model openai:gpt-5.5
   ```

<Accordion title="Model resolution order" icon="list-numbers">
  当Deep Agents代码启动时，它会按以下顺序解析要使用的模型：

  1. **`--model` 标志** 在提供时始终获胜。
  2. `~/.deepagents/config.toml`中的**`[models].default`**——用户有意的长期偏好。
  3. **`~/.deepagents/config.toml`中的`[models].recent`**——最后一个模型通过`/model`切换到。自动写入；永远不会覆盖`[models].default`。
  4. **环境自动检测**：回退到第一个可用的启动凭据，按顺序检查：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_API_KEY`、`GOOGLE_CLOUD_PROJECT`（Gemini Enterprise Agent Platform）。

  此启动回退有意仅检查这四个凭据。其他受支持的提供程序（例如 Groq）仍然可以通过 `--model`、`/model` 和保存的默认值 (`[models].default` / `[models].recent`) 获得。
</Accordion>

### 哪些型号出现在切换器中`/model` 选择器从已安装的提供程序包动态构建其列表。下面展开以了解完整的标准和故障排除。

<Accordion title="How the switcher builds its model list" icon="list-search">
  交互式 `/model` 选择器根据 `config.toml` 中配置的已安装提供程序包和模型构建其列表。

  在以下情况下会出现模型：

  1. 安装提供程序包。
  2. 该模型可从提供商包、本地提供商或您的`config.toml` 获取。
  3. 模型配置文件不会将文本输入或输出标记为不支持。

  如果缺少型号，请直接使用`/model <provider>:<model>`或将其添加到[⟦T153⟧](/oss/deepagents/code/config-file#adding-models-to-the-interactive-switcher)。

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

3、选择型号：<CodeGroup>
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
     ```

     ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

  您可以组合多个提供商：`DEEPAGENTS_CODE_EXTRAS="groq,fireworks,ollama"`。如果已安装 Deep Agents 代码，请在会话中使用 `/install <extra>` 或从 shell 中使用 `dcode --install <extra>`。
</Tip>**一起**、**OpenRouter** 和 **Hugging Face** (`langchain-huggingface`) 是云托管开放权重的其他选项。有关凭据和包名称，请参阅 [Provider reference](#provider-reference)。

### 设置默认模型

您可以设置适用于所有未来 CLI 启动的持久默认模型：

* **通过模型选择器：** 打开 `/model`，导航到所需模型，然后按 `Ctrl+S` 将其固定为默认模型。在当前默认值上再次按 `Ctrl+S` 将其清除。
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

如果没有默认值，Deep Agents代码将使用最近使用的模型。

### 模型参数

将额外的构造函数 kwargs 传递给模型 - 采样控制、推理/思考预算、上下文窗口大小、请求超时以及底层聊天模型类接受的任何其他内容。设置它们的三个位置，按优先级顺序（最高优先）：

1. **启动时一次性使用 `--model-params`。** JSON 字符串，仅限会话：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   # OpenAI reasoning effort
   dcode --model openai:gpt-5.5 --model-params '{"reasoning": {"effort": "high"}}'

   # Anthropic extended thinking
   dcode --model anthropic:claude-opus-4-8 --model-params '{"thinking": {"type": "enabled", "budget_tokens": 10000}, "max_tokens": 16000}'
   ```2. **通过 `/model --model-params` 进行中会话。** 相同的 JSON 语法 — 交换参数（以及可选的模型）而无需重新启动：

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
   ```

CLI 标志覆盖配置文件 `params` 并且仅适用于会话（会话中的更改不会保留）。 `config.toml` 中的每个模型子表覆盖提供者级别的键（浅合并 - 有关完整语义，请参阅[Model constructor params](/oss/deepagents/code/config-file#model-constructor-params)）。 `--model-params` 不能与`--default` 组合使用。

对于重试计数，首选 `--max-retries` 或顶级 [⟦T180⟧ config](/oss/deepagents/code/config-file#retries)。

<Tip>
  底层聊天模型构造函数接受的任何 kwarg 都是有效的。请参阅提供商的参考文档以获取完整列表，例如[⟦T181⟧](https://reference.langchain.com/python/langchain-anthropic/langchain_anthropic/chat_models/ChatAnthropic)、[⟦T182⟧](https://reference.langchain.com/python/langchain-openai/langchain_openai/chat_models/base/ChatOpenAI)、[⟦T183⟧](https://reference.langchain.com/python/langchain-ollama/langchain_ollama/chat_models/ChatOllama)。未知的 kwargs 会转发到上游 API 请求，因此新发布的参数无需 CLI 更新即可工作。
</Tip>

<Note>
  不要将凭据 (`api_key`) 放入 `params` — 使用 [⟦T186⟧](/oss/deepagents/code/config-file#provider-configuration) 来指向环境变量。
</Note>

要覆盖模型运行时 *profile* 上的字段（`max_input_tokens`、`tool_calling`、功能标志）（与构造函数参数不同），请参阅 [Profile overrides](/oss/deepagents/code/config-file#profile-overrides-advanced)。

## 高级配置有关提供程序参数、配置文件覆盖、自定义基本 URL、兼容 API、任意提供程序和生命周期挂钩的详细配置，请参阅 [Config file](/oss/deepagents/code/config-file) 和 [Hooks](/oss/deepagents/code/hooks)。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>