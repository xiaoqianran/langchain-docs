<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Config file | https://docs.langchain.com/oss/deepagents/code/config-file -->

# 配置文件

在 config.toml 中配置模型提供程序、默认值、重试和网关

`~/.deepagents/config.toml` 允许您自定义模型提供程序、设置默认值并将额外参数传递给模型构造函数。环境变量和检查命令请参见[Configuration](/oss/deepagents/code/configuration)。此页面涵盖：

* **默认**：固定[default model](#default-and-recent-model) 或[agent](#default-and-recent-agent)。
* **提供商设置**：[⟦T34⟧ table](#provider-configuration)、[constructor params](#model-constructor-params)、[retries](#retries)、[profile overrides](#profile-overrides-advanced) 和 [adding models to the ⟦T35⟧ switcher](#adding-models-to-the-interactive-switcher)。
* **自动模式**：[auto classifier timeout](#auto-classifier-timeout)。
* **自定义端点和提供程序**：[custom base URLs](#custom-base-url)、[OpenAI- or Anthropic-compatible APIs](#compatible-apis) 和 [arbitrary providers](#arbitrary-providers)。
* **端点和网关**：如何[API keys and base URLs resolve together](#endpoints-keys-and-gateways)，包括通过托管网关。

## 默认和最新模型

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models]
default = "ollama:qwen3:4b"             # your intentional long-term preference
recent = "google_genai:gemini-3.6-flash"   # last /model switch (written automatically)
auto_classifier = "openai:gpt-5.6-luna"  # optional: cheaper model for Auto approval review
```

`[models].default` 始终优先于 `[models].recent`。 `/model` 命令仅写入`[models].recent`，因此您配置的默认值永远不会被会话中切换覆盖。要删除默认值，请使用 `/model --default --clear` 或从配置文件中删除 `default` 键。

`[models].auto_classifier` 设置 [Auto approval classifier](/oss/deepagents/code/approval-modes#select-a-classifier-model) 用于检查门控工具调用的模型。未设置时，分类器继承主代理模型。您可以在运行时使用 `--auto-classifier-model` 或 `/auto model` 覆盖它。请参阅 [Select a classifier model](/oss/deepagents/code/approval-modes#select-a-classifier-model) 了解完整的优先级和安全说明。

## 默认和最近的代理

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[agents]
default = "backend-dev"  # your intentional long-term preference (Ctrl+S in /agents picker)
recent = "frontend-dev"  # last /agents switch (written automatically)
````[agents].default` 始终优先于 `[agents].recent`。在 `/agents` 选择器中使用 `Enter` 选择代理会写入`recent`；在突出显示的行上按`Ctrl+S`，将其固定为`default`。在同一行再次按 `Ctrl+S` 将清除默认值。

显式 `-a`/`--agent` 始终覆盖两者，而 `-r`/`--resume` 绕过两者，以便恢复线程的原始代理。相关标志请参见[Command reference](/oss/deepagents/code/cli-reference#command-line-options)。

## 编辑 LangSmith 跟踪秘密

启用 LangSmith 跟踪后，Deep Agents Code 默认发送代理跟踪输入和输出，无需客户端秘密编辑。

<Warning>
  如果不进行编辑，秘密可能会作为代理跟踪的一部分上传到 LangSmith。
</Warning>

要在上传之前编辑检测到的机密：

<Tabs>
  <Tab title="Config file">
    ```toml title="~/.deepagents/config.toml" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [tracing]
    langsmith_redact = true
    ```
  </Tab>

  <Tab title="Environment variable">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export DEEPAGENTS_CODE_LANGSMITH_REDACT=true
    ```
  </Tab>
</Tabs>

环境变量优先于配置文件。启用密文后，如果无法配置密文，Deep Agents Code 将禁用对该运行的跟踪。秘密编辑不会编辑一般个人身份信息 (PII)、跟踪元数据或 shell 进程发出的跟踪。如需更广泛的选择，请参阅[Redact secrets from traces](/langsmith/redact-secrets)。

## 提供者配置

每个提供者都是`[models.providers]`下的一个TOML表：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.<name>]
display_name = "My Provider"
api_key_url = "https://provider.example/keys"
models = ["gpt-5.5"]
api_key_env = "OPENAI_API_KEY"
base_url = "https://api.openai.com/v1"
class_path = "my_package.models:MyChatModel"
enabled = true

[models.providers.<name>.params]
temperature = 0
max_tokens = 4096

[models.providers.<name>.params."gpt-5.5"]
temperature = 0.7
```提供者有以下配置选项：

<ResponseField name="models" type="string[]">
  要在定义为 `<name>` 的提供程序的交互式 `/model` 切换器中显示的模型名称列表。对于已经附带模型配置文件的提供程序，除了捆绑的名称之外，您在此处添加的任何名称也会显示（对于尚未添加到包中的新发布的模型很有用）。对于[arbitrary providers](#arbitrary-providers)，此列表是切换器中模型的唯一来源。

  此处列出的型号**绕过**任何应用的基于配置文件的[filtering criteria](/oss/deepagents/code/providers#which-models-appear-in-the-switcher)，始终出现在切换器中。这使得它成为显示被排除的模型的推荐方法，因为它们的配置文件缺乏 `tool_calling` 支持或尚不存在。

  该键是可选的。您始终可以将任何型号名称直接传递给`/model`或`--model`，无论它是否出现在切换器中；提供者在请求时验证名称。
</ResponseField>

<ResponseField name="api_key_env" type="string">
  保存 API 密钥的环境变量的**名称**（例如，`"OPENAI_API_KEY"`）。 Deep Agents Code 在启动时读取此环境变量的凭据，以在创建模型之前验证访问权限。大多数聊天模型包会自动从默认环境变量中读取。请参阅 [Provider reference](/oss/deepagents/code/providers#provider-reference) 表，了解每个内置提供程序检查的变量名称。对于不在该表中的提供程序，将 `api_key_env` 设置为其变量名称（请参阅 [Arbitrary providers](#arbitrary-providers)）。
</ResponseField>

<ResponseField name="display_name" type="string">
  身份验证 UI 中显示的人类可读的提供程序名称。将此用于任意提供者，其配置密钥针对机器进行了优化（例如，`my_gateway`），但其 UI 标签应包含空格或品牌大写。
</ResponseField>

<ResponseField name="api_key_url" type="string">
  用户在其中创建或管理 API 密钥的提供商页面的 URL。在输入 API 密钥之前，`/auth` 模式会链接到此页面。该值是 URL，而不是凭据。
</ResponseField>

<ResponseField name="base_url" type="string">
  覆盖提供者使用的基本 URL（如果支持）。请参阅您的提供商包的[reference docs](https://reference.langchain.com/python/integrations/) 了解更多信息。

  请参阅 [Compatible APIs](#compatible-apis) 将内置提供程序指向有线兼容端点，或参阅 [Arbitrary providers](#arbitrary-providers) 了解通过 `class_path` 配置的提供程序。
</ResponseField><ResponseField name="base_url_env" type="string">
  保存此提供程序的基本 URL 的环境变量的名称，与 `api_key_env` 平行。当端点来自环境而不是固定值时（例如，因机器或 CI 作业而异的网关 URL），请使用此值而不是 `base_url`，因此它可以在不编辑 `config.toml` 的情况下进行更改，并且可以参与端点解析和密钥/端点配对（请参阅 [Endpoints, keys, and gateways](#endpoints-keys-and-gateways)）。它还将这些范围扩展到[built-in set](/oss/deepagents/code/providers#provider-reference)之外的提供商；参见[Arbitrary providers](#arbitrary-providers)。

  如果两者都设置了，则静态 `base_url` 获胜：

  ```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [models.providers.example]
  base_url = "https://fixed.example/v1"   # used
  base_url_env = "EXAMPLE_BASE_URL"        # ignored while base_url is set
  ```
</ResponseField>

<ResponseField name="params" type="object">
  额外的关键字参数转发到模型构造函数。平键（例如，`temperature = 0`）适用于该提供商的每个型号。模型键控子表（例如，`[params."gpt-5.5"]`）仅覆盖该模型的各个值；合并很浅（模型在冲突中获胜）。

  请勿将凭据（例如，`api_key`）放入`params`。使用 [⟦T76⟧](#provider-configuration) 来指向环境变量。
</ResponseField><ResponseField name="profile" type="object">
  （高级）覆盖模型运行时 [profile](/oss/python/langchain/models#model-profiles) 中的字段（例如 `max_input_tokens`）。平键适用于该提供商的每个型号。模型键控子表（例如，`[profile."claude-sonnet-4-5"]`）仅覆盖该模型的各个值；合并很浅（模型在冲突中获胜）。这些覆盖在创建模型后应用，因此它们对上下文限制显示、自动摘要以及读取配置文件的任何其他功能生效。请参阅 [Profile overrides](#profile-overrides-advanced) 示例和 `--profile-override` 标志。
</ResponseField>

<ResponseField name="class_path" type="string">
  用于 [arbitrary model](#arbitrary-providers) 提供商。 `module.path:ClassName` 格式的完全限定 Python 类。设置后，Deep Agents Code 会直接为提供者 `<name>` 导入并实例化此类。该类必须是 `BaseChatModel` 子类。
</ResponseField>

<ResponseField name="enabled" type="boolean">
  该提供者是否出现在`/model`选择器中。设置为 `false` 以隐藏从已安装的包中自动发现的提供程序（例如，您不希望弄乱模型切换器的传递依赖项）。您仍然可以直接通过 `/model provider:model` 或 `--model` 使用禁用的提供商。
</ResponseField>

## 模型构造函数参数[⟦T87⟧ field](#provider-configuration) 将额外的参数转发给模型构造函数。要为一个模型提供不同的值，请添加一个模型键控子表，这样您就不必复制整个提供程序配置：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.ollama]
models = ["qwen3:4b", "llama3"]

[models.providers.ollama.params]
temperature = 0
num_ctx = 8192

[models.providers.ollama.params."qwen3:4b"]
temperature = 0.5
num_ctx = 4000
```

使用此配置：

* `ollama:qwen3:4b` 获得 `{temperature: 0.5, num_ctx: 4000}` — 模型覆盖获胜。
* `ollama:llama3` 获取 `{temperature: 0, num_ctx: 8192}` — 不覆盖，仅提供者级别的参数。

合并是浅层的：模型子表中存在的任何键都会替换提供者级别参数中的相同键，而仅保留提供者级别的键。

<Tip>
  对于无需编辑 `config.toml` 的一次性调整，请在启动时或使用 `/model` 在会话中通过 `--model-params` 传递 JSON 对象。 CLI 标志的优先级高于配置文件。有关语法和特定于提供程序的示例，请参阅提供程序页面上的[Model parameters](/oss/deepagents/code/providers#model-parameters)。
</Tip>

## 重试

使用顶级 `[retries]` 部分配置瞬态模型提供程序错误的重试计数。深度代理代码将这些值传递给接受重试计数构造函数 kwargs 的提供程序集成。如果省略此部分，则应用提供商 SDK 默认值。

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[retries]
max_retries = 2

[retries.fireworks]
max_retries = 3

[retries.anthropic]
max_retries = 0
```全局 `[retries].max_retries` 值适用于所有受支持的提供商。特定于提供者的表（例如 `[retries.fireworks]`）会覆盖该提供者的全局值。值必须是大于或等于 `0` 的整数。

大多数受支持的提供商收到的重试计数为 `max_retries`。某些集成使用不同的构造函数 kwarg。对于任意提供程序，或者要覆盖已知提供程序的已注册 kwarg，请在特定于提供程序的重试表中设置 `param`：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[retries]
max_retries = 2

[retries.my_custom]
param = "retries"
max_retries = 4
```

`param` 必须是有效的 Python 标识符字符串，例如 `"max_retries"` 或 `"retries"`。 Deep Agents Code 会忽略未设置 `param` 的未知提供者，因为传递错误的重试 kwarg 可能会破坏模型创建。

`[retries]` 的优先级低于构造函数参数。完整的优先顺序是：

1. `--max-retries N`，在提供者的resolved retry kwarg下应用
2. `--model-params` 带有提供商的重试 kwarg，例如 `'{"max_retries": N}'` 或 `'{"retries": N}'`
3. `[models.providers.<provider>.params]` 与提供商的重试 kwarg
4.`[retries.<provider>].max_retries`
5.`[retries].max_retries`
6.提供商SDK默认

## 启动审批模式

使用顶级 `[startup].mode` 键设置交互式会话的默认 [approval mode](/oss/deepagents/code/approval-modes)：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[startup]
mode = "auto"   # "manual" (default), "auto", or "yolo"
```接受的值为`manual`（故障关闭默认值）、`auto`（分类器支持；需要`DEEPAGENTS_CODE_EXPERIMENTAL=1`）和`yolo`（无限制；需要一次性确认）。显式 `--yolo` 或 `-y`/`--auto-approve` 标志会覆盖会话的此值。

## 自动分类器超时

当 [Auto mode](/oss/deepagents/code/approval-modes) 处于活动状态时，分类器有时间预算来审查每批门控操作。未在期限内审核的批次按`classifier_unavailable`拒绝；重复错过会退回到手动审批 UI。默认值为 20 秒。

如果评论超时，首先要尝试的是[selecting a faster classifier model](#default-and-recent-model)（请参阅`[models].auto_classifier`）。如果您已经这样做了，但仍需要更多空间，您可以延长截止日期：

<Tabs>
  <Tab title="Config file">
    ```toml title="~/.deepagents/config.toml" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [models]
    auto_classifier_timeout = 60   # seconds; minimum 1, maximum 300
    ```
  </Tab>

  <Tab title="Environment variable">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export DEEPAGENTS_CODE_AUTO_CLASSIFIER_TIMEOUT=60
    ```
  </Tab>
</Tabs>

环境变量优先于配置文件，配置文件优先于内置默认值。低于 1 或高于 300 的值将固定在地板或天花板上。非整数值会回退到默认值并带有警告。

## 配置文件覆盖（高级）覆盖模型运行时配置文件中的字段以更改 Deep Agents Code 解释模型功能的方式。有关可覆盖字段的完整列表，请参阅[⟦T123⟧](https://reference.langchain.com/python/langchain-core/language_models/model_profile/ModelProfile)。最常见的用例是降低 `max_input_tokens` 以提前触发自动汇总 - 对于测试或限制上下文使用很有用：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Apply to all models from this provider
[models.providers.anthropic.profile]
max_input_tokens = 4096
```

每个模型子表的工作方式与`params`相同——模型级值在冲突时获胜：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.anthropic.profile]
max_input_tokens = 4096

# This model gets a higher limit
[models.providers.anthropic.profile."claude-sonnet-4-5"]
max_input_tokens = 8192
```

配置文件覆盖在创建后合并到模型的配置文件中。任何读取配置文件的功能（状态栏中的上下文限制显示、自动汇总阈值、功能检查）都将看到覆盖的值。

<Accordion title="CLI profile overrides with --profile-override" icon="terminal">
  要在运行时覆盖模型配置文件字段而不编辑配置文件，请通过 `--profile-override` 传递 JSON 对象：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  dcode --profile-override '{"max_input_tokens": 4096}'

  # Combine with --model
  dcode --model google_genai:gemini-3.6-flash --profile-override '{"max_input_tokens": 4096}'

  # In non-interactive mode
  dcode -n "Summarize this repo" --profile-override '{"max_input_tokens": 4096}'
  ```

  它们合并在配置文件配置文件覆盖之上（CLI 获胜）。优先级链为：型号默认\< config.toml profile \< CLI ⟦T127⟧.

  ⟦T128⟧ values persist across mid-session ⟦T129⟧ hot-swaps — switching models re-applies the override to the new model.
</Accordion>

## 将模型添加到交互式切换器

一些提供商（例如`langchain-ollama`）不捆绑模型配置文件数据（请参阅[Provider reference](/oss/deepagents/code/providers#provider-reference)了解完整列表）。在这种情况下，交互式 `/model` 切换器将不会列出该提供商的模型。您可以通过在提供程序的配置文件中定义 `models` 列表来填补空白：```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.ollama]
models = ["gemma4", "qwen3.6", "granite4.1:3b"]
```

`/model` 切换器现在将包括列出这些型号的 Ollama 部分。

这完全是可选的。您始终可以通过直接指定其全名来切换到任何模型：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
/model ollama:qwen3.6:27b
```

<Note>
  当安装`langchain-ollama`并且守护进程可访问时，Deep Agents Code会自动发现本地拉取的模型并将它们合并到切换器中 - 不需要`models`列表。拉取新模型后运行`/reload`进行刷新，或设置`DEEPAGENTS_CODE_OLLAMA_DISCOVERY=0`选择退出。
</Note>

## 自定义基本 URL

某些提供程序包接受 `base_url` 来覆盖默认端点。例如，`langchain-ollama` 通过底层 `ollama` 客户端默认为 `http://localhost:11434`。要将其指向其他位置，请在配置中设置 `base_url`：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.ollama]
base_url = "http://your-host-here:port"
```

有关兼容性信息和其他注意事项，请参阅提供商的参考文档。

## 兼容的API

对于公开与 OpenAI 或 Anthropic 有线兼容的 API 的提供程序，您可以通过将 `base_url` 指向提供程序的端点来使用现有的 `langchain-openai` 或 `langchain-anthropic` 包：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.openai]
base_url = "https://api.example.com/v1"
api_key_env = "EXAMPLE_API_KEY"
models = ["my-model"]
```

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.anthropic]
base_url = "https://api.example.com"
api_key_env = "EXAMPLE_API_KEY"
models = ["my-model"]
```<Note>
  提供商在官方规范之上添加的任何功能都不会被捕获。如果提供商提供专用的 LangChain 集成包，则更喜欢它。
</Note>

<Warning>
  OpenAI 提供程序默认为 [Responses API](https://platform.openai.com/docs/api-reference/responses)，大多数 OpenAI 兼容网关均未实现。如果您的提供商仅支持聊天完成 API，则调用可能会失败。显式禁用响应 API：

  ```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [models.providers.openai.params]
  use_responses_api = false
  ```
</Warning>

## 任意提供者

Deep Agents Code 可与任何调用 LLM 的工具（如 [LangChain ⟦T146⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.BaseChatModel) 提供）配合使用。 [built-in providers](/oss/deepagents/code/providers#provider-reference) 开箱即用；不太常见或内部模型需要更多的设置。将 `class_path` 指向其 `BaseChatModel` 子类，Deep Agents Code 会直接导入并实例化该类。

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.my_custom]
display_name = "My Custom Provider"
api_key_url = "https://my-provider.example.com/keys"
class_path = "my_package.models:MyChatModel"
api_key_env = "MY_API_KEY"
base_url = "https://my-endpoint.example.com"

[models.providers.my_custom.params]
temperature = 0
max_tokens = 4096
```

`api_key_env` 和 `base_url` 可选。 `display_name`和`api_key_url`自定义`/auth`显示的提供商名称和密钥获取链接；省略它们以回退到提供程序配置密钥和提供程序设置文档。要从环境变量读取端点而不是硬编码`base_url`，请使用[⟦T155⟧](#provider-configuration)；然后，它以与内置提供程序相同的方式解析并与密钥配对（请参阅[Endpoints, keys, and gateways](#endpoints-keys-and-gateways)）。`class_path` 提供商应在内部处理自己的身份验证 - 当您的模型使用自定义身份验证（JWT 令牌、专有标头、mTLS 等）而不是标准 API 密钥时，这很有用：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.xyz]
class_path = "abc.integrations.deepagents:DeepAgentsXYZChat"
models = ["abc-xyz-1"]

[models.providers.xyz.params]
bypass_auth = true
temperature = 0
```

使用此配置，切换到带有`/model xyz:abc-xyz-1`或`--model xyz:abc-xyz-1`的型号。

<Note>
  深度代理代码需要**工具调用**支持。如果您的自定义模型支持工具调用，但 Deep Agents Code 不知道，请在提供程序配置文件中声明它：

  ```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [models.providers.xyz.profile]
  tool_calling = true
  max_input_tokens = 128000
  ```

  尽管是可选的，但强烈建议将 `max_input_tokens` 设置为模型的上下文窗口。如果没有它，Deep Agents Code 就无法显示上下文的完整程度，并且自动摘要会回退到固定触发器（大约 170,000 个令牌），而不是模型窗口的一小部分。对于窗口较小的模型，在达到模型的硬限制之前，汇总可能不会运行，因此一旦对话增长，请求就会开始失败。
</Note>

由于 Deep Agents Code 在启动时导入 `class_path` 类，因此定义该类的包必须可从运行 `dcode` 的同一环境中导入。内置提供程序以 [install extras](/oss/deepagents/code/providers#quickstart) 的形式提供，但自定义或内部包不是其中之一。使用 `--package` 标志将其安装到 `dcode` 环境中：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --install my_package --package
```

在会话中，运行`/install my_package --package --force`。两者都与 `dcode` 一起安装该软件包。如果包丢失或无法导入，Deep Agents Code 会跳过提供程序，并且其模型不会出现在 `/model` 中。

当您切换到 `my_custom:my-model-v1`（通过 `/model` 或 `--model`）时，模型名称 (`my-model-v1`) 将作为 `model` kwarg 传递：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
MyChatModel(model="my-model-v1", base_url="...", api_key="...", temperature=0, max_tokens=4096)
```

<Warning>
  `class_path` 从您的配置文件执行任意 Python 代码。这与 `pyproject.toml` 构建脚本具有相同的信任模型 - 您控制自己的机器。
</Warning>

您的提供程序包可以选择在 `<package>.data._profiles` 中的 `_PROFILES` 字典中提供模型配置文件，而不是在 `models` 键下定义它们。更多信息请参见LangChain[model profiles](https://github.com/langchain-ai/langchain/tree/master/libs/model-profiles)。

## 端点、密钥和网关

API 密钥与其发送到的端点必须匹配：端点必须接受该密钥，否则请求可能会失败。深度代理代码一起解析密钥和端点，因此覆盖其中一个会更新另一个以匹配。例如，如果您用自己的密钥替换网关配置的密钥，Deep Agents Code 也会删除网关端点，因此您的密钥会直接发送到提供商，而不是发送到会拒绝它的网关。

### `base_url` 如何解决深度代理代码按以下顺序解析提供者的端点（第一个匹配获胜）：

1. **`base_url` 位于 `config.toml`** 中，供提供商使用。
2. **以 `DEEPAGENTS_CODE_` 为前缀的端点变量。**
3. **环境中的普通端点变量**（例如，`OPENAI_BASE_URL`）。
4. **使用`/auth`凭证保存的端点。**此步骤将保存的端点应用于没有端点变量的提供程序，例如您在未声明[⟦T183⟧](#provider-configuration)的情况下添加的提供程序。步骤 2-3 没有可供读取的变量，因此此处直接使用保存的端点。对于确实具有端点变量的提供程序，保存的端点已在步骤 2 或 3 中生效（它被写入该变量），因此此步骤不会更改任何内容。无论哪种方式，在 `/auth` 中输入的端点都适用。
5. **当以上均未设置时，提供者 SDK 自己的默认端点**。

<Note>
  解析的端点作为 `base_url` 构造函数参数传递给模型。
</Note>

与 API 密钥一样，[⟦T186⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix) 将端点范围限定为深度代理代码，而不影响其他工具。对于任何其他提供者，使用 [⟦T187⟧](#provider-configuration) 声明名称，端点以相同的方式解析和配对：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.myprovider]
api_key_env = "MYPROVIDER_API_KEY"
base_url_env = "MYPROVIDER_BASE_URL"
models = ["my-model"]
```字面量 `base_url` 胜过 `base_url_env`，因此仅设置您需要的：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[models.providers.myprovider]
base_url = "https://fixed.example/v1"   # used
base_url_env = "MYPROVIDER_BASE_URL"    # ignored while base_url is set
```

### 覆盖将两者保持在一起

当您使用 `/auth` 存储密钥时，您输入的端点（或提供商的默认端点，如果留空）将与密钥一起应用。使用空白基本 URL 存储密钥还会清除您的环境中已设置的任何端点（例如，您的 shell 导出的网关 `OPENAI_BASE_URL`），因此您的密钥将转到提供程序的默认端点，而不是该网关。

```bash title="Scope both the key and the endpoint to Deep Agents Code" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
DEEPAGENTS_CODE_OPENAI_API_KEY=sk-cli-only
DEEPAGENTS_CODE_OPENAI_BASE_URL=https://api.openai.com/v1
```

### 托管网关

在配备模型网关（例如 LangSmith 网关）的计算机上，网关通常会一起导出网关密钥和匹配的端点变量（`OPENAI_BASE_URL`、`ANTHROPIC_BASE_URL` 或 `GOOGLE_GEMINI_BASE_URL`）。 Deep Agents Code 默认使用该对，因此无需配置。

要使用您自己的密钥，请将其存储为 `/auth`（将提供程序默认值的基本 URL 留空，或显式设置），或设置 `DEEPAGENTS_CODE_` 前缀密钥和端点。两者都会覆盖网关对，而不会留下不匹配的端点。

## 代理运行时间限制LangGraph 图步骤预算是`dcode` 代理图在单轮中可以执行的最大节点调用数。使用 `[runtime]` 部分配置此递归限制：

```toml title="~/.deepagents/config.toml" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[runtime]
recursion_limit = 2000
```

默认为`2000`。有效值为从 `25` 到 `100000`（含）的整数。超出此范围的值或非整数值会记录警告并回退到默认值。

优先级（从最高到最低）：

1. `--recursion-limit` CLI 标志
2. `DEEPAGENTS_CODE_RECURSION_LIMIT`环境变量
3.`[runtime].recursion_limit`在`config.toml`
4. 内置默认值（`2000`）

使用`dcode config get runtime.recursion_limit`查看有效值及其来源。

<Tabs>
  <Tab title="CLI flag">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    dcode --recursion-limit 5000
    ```
  </Tab>

  <Tab title="Environment variable">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export DEEPAGENTS_CODE_RECURSION_LIMIT=5000
    ```
  </Tab>

  <Tab title="Config file">
    ```toml title="~/.deepagents/config.toml" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [runtime]
    recursion_limit = 5000
    ```
  </Tab>
</Tabs>

<Note>
  `goal_rubric` 递归限制是单独的，不受此设置的影响。
</Note>

## 另请参阅

* [Configuration](/oss/deepagents/code/configuration)
* [Provider credentials](/oss/deepagents/code/credentials)
* [Providers](/oss/deepagents/code/providers)
* [CLI reference](/oss/deepagents/code/cli-reference)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/config-file.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>