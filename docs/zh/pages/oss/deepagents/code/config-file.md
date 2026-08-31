<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Config file | https://docs.langchain.com/oss/deepagents/code/config-file -->

# 配置文件

`~/.deepagents/config.toml` 允许您自定义模型提供程序、设置默认值并将额外参数传递给模型构造函数。环境变量和检查命令请参见[Configuration](/oss/deepagents/code/configuration)。此页面涵盖：

- **默认**：使用白名单固定 [default model](#default-and-recent-model)、[summarization model](#set-a-summarization-model)、[agent](#default-and-recent-agent) 或 [restrict usable models](#allowed-models)。
- **警告**：[session cost](#session-cost-warning) 和 [cold prompt-cache](#cold-prompt-cache-warning) 阈值以及 [trusted gateway endpoints](#trust-a-gateway-endpoint-for-cache-policies)。
- **显示**：[provider-visible reasoning](#show-provider-visible-reasoning)和差异行号。
- **解释器**：内置 QuickJS REPL 的 [⟦T45⟧ settings](#js-interpreter)。
- **Python 扩展**：[discovery and project trust](#python-extensions) 用于自定义工具、中间件和存储路由。
- **跟踪**：[client-side secret redaction](#redact-langsmith-trace-secrets) 用于 LangSmith 跟踪。
- **提供商设置**：[⟦T46⟧ table](#provider-configuration)、[constructor params](#model-constructor-params)、[retries](#retries)、[profile overrides](#profile-overrides-advanced) 和 [adding models to the ⟦T47⟧ switcher](#adding-models-to-the-interactive-switcher)。
- **自动模式**：[auto classifier timeout](#auto-classifier-timeout)。
- **自定义端点和提供程序**：[custom base URLs](#custom-base-url)、[OpenAI- or Anthropic-compatible APIs](#compatible-apis) 和 [arbitrary providers](#arbitrary-providers)。
- **端点和网关**：如何[API keys and base URLs resolve together](#endpoints-keys-and-gateways)，包括通过托管网关。

## 默认和最新模型

```toml
[models]
default = "ollama:qwen3:4b"             # your intentional long-term preference
recent = "google_genai:gemini-3.6-flash"   # last /model switch (written automatically)
auto_classifier = "openai:gpt-5.6-luna"  # optional: cheaper model for Auto approval review
```

`[models].default` 始终优先于 `[models].recent`。 `/model` 命令仅写入`[models].recent`，因此您配置的默认值永远不会被会话中切换覆盖。要删除默认值，请使用 `/model --default --clear` 或从配置文件中删除 `default` 键。`[models].auto_classifier` 设置[Auto approval classifier](/oss/deepagents/code/approval-modes#select-a-classifier-model) 用于检查门控工具调用的模型。未设置时，分类器继承主代理模型。您可以在运行时使用 `--auto-classifier-model` 或 `/auto model` 覆盖它。请参阅 [Select a classifier model](/oss/deepagents/code/approval-modes#select-a-classifier-model) 了解完整的优先级和安全说明。

## 设置汇总模型

设置自动上下文压缩的专用模型`/offload`和`/compact`：

```toml title="~/.deepagents/config.toml"
[models]
summarization_default = "openai:gpt-5.6-sol"
```

汇总模型按以下顺序解析：

1. `--summarization-model` 当前发布。
2.`[models].summarization_default`。
3.主要代理模式。

在交互式会话中，运行 `/summarization-model` 打开模型选择器，运行 `/summarization-model <provider:model>` 直接切换，或运行 `/summarization-model clear` 再次遵循主代理模型。更改汇总模型不会更改主代理模型。

## 默认和最近的代理

```toml
[agents]
default = "backend-dev"  # your intentional long-term preference (Ctrl+S in /agents picker)
recent = "frontend-dev"  # last /agents switch (written automatically)
```

`[agents].default` 始终优先于 `[agents].recent`。在 `/agents` 选择器中使用 `Enter` 选择代理会写入`recent`；在突出显示的行上按`Ctrl+S`，将其固定为`default`。在同一行再次按 `Ctrl+S` 将清除默认值。

显式 `-a`/`--agent` 始终覆盖两者，而 `-r`/`--resume` 绕过两者，以便恢复线程的原始代理。相关标志请参见[Command reference](/oss/deepagents/code/cli-reference#command-line-options)。

## 会话成本警告当每个线程的累计估计成本超过 50 美元时，Deep Agents 代码会发出警告一次，并建议使用 `/offload` 或 `/clear`。您可以以美元为单位配置阈值，或将其设置为`0`或负值以禁用警告：

```toml
[warnings]
session_cost_threshold_usd = 25
```

## 冷提示-缓存警告

一些 LLM 提供商会自动缓存轮次之间的对话前缀，因此在缓存正常时发送的后续内容只会重新处理新令牌。该缓存在特定于提供商的空闲窗口后过期。 Deep Agents 代码当前针对 Anthropic 和 OpenAI 模型检测到这一点：当交互式聊天消息发送到缓存可能已过期（或其模型或缓存设置自上一轮以来发生更改）的线程时，它会估计重新预热成本，如果达到阈值，则在发送之前询问：

- **仍然发送**：本轮发送；该警告在未来的冷缓存轮流中仍然会出现。
- **发送此会话并且不再发出警告**：将警告静音，直到应用程序重新启动。
- **发送并不再警告**：持续抑制警告。从 `/notifications` 设置屏幕重新启用它。
- **不发送（保留草稿）**：将消息恢复到聊天输入，以便您可以先`/clear`。设置触发警告的最低估计额外成本（冷缓存与热缓存），以美元为单位。默认为`0.50`；将其设置为`0`以禁用：

```toml title="~/.deepagents/config.toml"
[warnings]
cold_cache_min_delta_usd = 1.00
```

### 信任缓存策略的网关端点

如果请求通过网关或代理而不是官方 API 到达提供商，则冷缓存警告将保持静默。声明端点受信任，断言它会原封不动地转发缓存设置并尊重提供者记录的保留：

```toml title="~/.deepagents/config.toml"
[warnings]
trusted_cache_endpoints = ["smith.langchain.com"]
```

条目是完全匹配的主机名 - 信任 `example.com` 不信任 `gw.example.com`。一个条目涵盖通过该端点路由的每个提供商。即使受信任，通过 LangSmith 网关的跨格式路由（例如，路由到 Anthropic 模型的 OpenAI 格式请求）也会保持沉默，因为转换会重写估计假设的缓存设置。

## 显示提供者可见的推理

默认情况下，提供者可见的推理是隐藏的。要在交互式脚本和非交互式输出中显示它，请设置：

```toml title="~/.deepagents/config.toml"
[ui]
show_reasoning = true
```在交互式会话中，推理流入单独的行，该行在阶段结束时折叠。单击该行或按 `Ctrl+O` 重新打开它。在非交互模式下，推理将转到 stderr，因此 stdout 上的最终答案仍然可以通过管道传输。

设置 `DEEPAGENTS_CODE_SHOW_REASONING=1` 覆盖 `config.toml`，或传递 `--show-reasoning` 启用一次启动的设置。启动标志优先于环境变量，而环境变量又优先于`config.toml`。

<Note>
    Deep Agents 代码仅显示模型提供者公开的推理内容。经过编辑或不透明的推理仍然被隐藏。
</Note>

## 不同的行号

Deep Agents 代码默认显示记录和批准差异中与文件相关的行号。要隐藏它们，请设置：

```toml
[ui]
show_diff_line_numbers = false
```

在会话中运行 `/line-numbers` 以切换首选项并将其保存到 `config.toml`。该更改适用于新的差异；已经渲染的差异不会改变。

## 允许的型号

将 `dcode` 限制为具有 `[models].allowed` 列表的已批准模型集：

```toml title="~/.deepagents/config.toml"
[models]
allowed = ["anthropic:claude-fable-5", "openai:*"]
```

条目是精确的 `provider:model` 规格或 `provider:*` 通配符，允许提供商的整个阵容。设置列表后，被阻止的模型将从`/model`切换器中隐藏，如果在其他地方选择则被拒绝。当密钥未设置时，所有模型均被允许。显式的空列表不允许任何内容：

```toml
[models]
allowed = []   # no model may be used
```

通配符包括从捆绑的提供商配置文件或您配置的 `models` 列表中发现的模型。如果该提供商没有可用的模型，则通配符不允许任何模型。

<Accordion title="Allow Amazon Bedrock models">
    将基岩模型 ID 写入`bedrock:<id>`，包括 ID 中的版本冒号：

    ```toml title="~/.deepagents/config.toml"
    [models]
    allowed = ["bedrock:anthropic.claude-3-5-sonnet-20241022-v2:0"]
    ```
</Accordion>

## 编辑 LangSmith 跟踪秘密

启用 LangSmith 跟踪后，Deep Agents 代码会在上传之前编辑从代理跟踪输入和输出中检测到的机密。默认情况下启用此功能。

要禁用密文：

<Tabs>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [tracing]
        langsmith_redact = false
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_LANGSMITH_REDACT=false
        ```
    </Tab>
</Tabs>

环境变量优先于配置文件。启用编辑后，如果无法配置编辑，则Deep Agents 代码将禁用对该运行的跟踪。秘密编辑不会编辑一般个人身份信息 (PII)、跟踪元数据或 shell 进程发出的跟踪。有关更广泛的选项，请参阅[Redact secrets from traces](/langsmith/redact-secrets)。

## 提供者配置

每个提供者都是`[models.providers]`下的一个TOML表：

```toml
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
```

提供者有以下配置选项：<ResponseField name="models" type="string[]" post={["optional"]}>
    要在定义为 `<name>` 的提供程序的交互式 `/model` 切换器中显示的模型名称列表。对于已经附带模型配置文件的提供程序，除了捆绑的名称之外，您在此处添加的任何名称也会显示（对于尚未添加到包中的新发布的模型很有用）。对于[arbitrary providers](#arbitrary-providers)，此列表是切换器中模型的唯一来源。

    此处列出的型号**绕过**任何应用的基于配置文件的[filtering criteria](/oss/deepagents/code/providers#which-models-appear-in-the-switcher)，始终出现在切换器中。这使得它成为显示被排除的模型的推荐方法，因为它们的配置文件缺乏 `tool_calling` 支持或尚不存在。

    该键是可选的。您始终可以将任何型号名称直接传递给`/model`或`--model`，无论它是否出现在切换器中；提供者在请求时验证名称。
</ResponseField>

<ResponseField name="api_key_env" type="string" post={["optional"]}>
    保存 API 密钥的环境变量的**名称**（例如，`"OPENAI_API_KEY"`）。 Deep Agents 代码在启动时从此环境变量中读取凭据，以在创建模型之前验证访问权限。大多数聊天模型包会自动从默认环境变量中读取。请参阅 [Provider reference](/oss/deepagents/code/providers#provider-reference) 表，了解每个内置提供程序检查的变量名称。对于不在该表中的提供程序，将 `api_key_env` 设置为其变量名称（请参阅 [Arbitrary providers](#arbitrary-providers)）。
</ResponseField>

<ResponseField name="display_name" type="string" post={["optional"]}>
    身份验证 UI 中显示的人类可读的提供程序名称。将此用于任意提供商，其配置密钥针对机器进行了优化（例如，`my_gateway`），但其 UI 标签应包含空格或品牌大写。
</ResponseField>

<ResponseField name="api_key_url" type="string" post={["optional"]}>
    用户在其中创建或管理 API 密钥的提供商页面的 URL。在输入 API 密钥之前，`/auth` 模式会链接到此页面。该值是 URL，而不是凭据。
</ResponseField>

<ResponseField name="base_url" type="string" post={["optional"]}>
    覆盖提供者使用的基本 URL（如果支持）。请参阅您的提供商包的 [reference docs](https://reference.langchain.com/python/integrations/) 了解更多信息。

    请参阅 [Compatible APIs](#compatible-apis) 将内置提供程序指向有线兼容端点，或参阅 [Arbitrary providers](#arbitrary-providers) 了解通过 `class_path` 配置的提供程序。
</ResponseField><ResponseField name="base_url_env" type="string" post={["optional"]}>
    保存此提供程序的基本 URL 的环境变量的名称，与 `api_key_env` 平行。当端点来自环境而不是固定值时（例如，因机器或 CI 作业而异的网关 URL），请使用此值而不是 `base_url`，因此它可以在不编辑 `config.toml` 的情况下进行更改，并且可以参与端点解析和密钥/端点配对（请参阅[Endpoints, keys, and gateways](#endpoints-keys-and-gateways)）。它还将这些范围扩展到[built-in set](/oss/deepagents/code/providers#provider-reference)之外的提供商；参见[Arbitrary providers](#arbitrary-providers)。

    如果两者都设置了，则静态 `base_url` 获胜：

    ```toml
    [models.providers.example]
    base_url = "https://fixed.example/v1"   # used
    base_url_env = "EXAMPLE_BASE_URL"        # ignored while base_url is set
    ```
</ResponseField>

<ResponseField name="params" type="object" post={["optional"]}>
    额外的关键字参数转发到模型构造函数。平键（例如，`temperature = 0`）适用于该提供商的每个型号。模型键控子表（例如，`[params."gpt-5.5"]`）仅覆盖该模型的各个值；合并很浅（模型在冲突中获胜）。

    请勿将凭据（例如，`api_key`）放入`params`。使用 [⟦T118⟧](#provider-configuration) 来指向环境变量。
</ResponseField><ResponseField name="profile" type="object" post={["optional"]}>
    （高级）覆盖模型运行时中的字段[profile](/oss/python/langchain/models#model-profiles)（例如`max_input_tokens`）。平键适用于该提供商的每个型号。模型键控子表（例如，`[profile."claude-sonnet-4-5"]`）仅覆盖该模型的各个值；合并很浅（模型在冲突中获胜）。这些覆盖在创建模型后应用，因此它们对上下文限制显示、自动摘要以及读取配置文件的任何其他功能生效。请参阅 [Profile overrides](#profile-overrides-advanced) 示例和 `--profile-override` 标志。
</ResponseField>

<ResponseField name="class_path" type="string" post={["optional"]}>
    用于[arbitrary model](#arbitrary-providers)提供商。 `module.path:ClassName` 格式的完全限定 Python 类。设置后，Deep Agents代码会直接为提供者`<name>`导入并实例化此类。该类必须是 `BaseChatModel` 子类。
</ResponseField>

<ResponseField name="enabled" type="boolean" default="true" post={["optional"]}>
    该提供者是否出现在`/model`选择器中。设置为 `false` 以隐藏从已安装的包中自动发现的提供程序（例如，您不希望弄乱模型切换器的传递依赖项）。您仍然可以直接通过 `/model provider:model` 或 `--model` 使用禁用的提供商。
</ResponseField>

## 模型构造函数参数[⟦T129⟧ field](#provider-configuration) 将额外的参数转发给模型构造函数。要为一个模型提供不同的值，请添加一个模型键控子表，这样您就不必复制整个提供程序配置：

```toml
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

* `ollama:qwen3:4b` 获得 `{temperature: 0.5, num_ctx: 4000}` — 模型覆盖胜利。
* `ollama:llama3` 获取 `{temperature: 0, num_ctx: 8192}` — 不覆盖，仅提供者级别的参数。

合并是浅层的：模型子表中存在的任何键都会替换提供者级别参数中的相同键，而仅保留提供者级别的键。

<Tip>
    对于无需编辑 `config.toml` 的一次性调整，请在启动时或使用 `/model` 通过 `--model-params` 传递 JSON 对象。 CLI 标志的优先级高于配置文件。有关语法和特定于提供程序的示例，请参阅提供程序页面上的[Model parameters](/oss/deepagents/code/providers#model-parameters)。
</Tip>

## 重试

Deep Agents 代码在模型节点重试瞬态模型错误。默认为第一次请求后重试五次。设置顶级 `[retries]` 值以更改预算，或将其设置为 `0` 以禁用重试：

```toml
[retries]
max_retries = 2

[retries.fireworks]
max_retries = 3

[retries.anthropic]
max_retries = 0
```

全局 `[retries].max_retries` 值适用于所有受支持的提供商。特定于提供者的表（例如 `[retries.fireworks]`）会覆盖该提供者的全局值。值必须是大于或等于 `0` 的整数。对于任意提供程序，将 `param` 设置为其重试计数构造函数参数的名称。 Deep Agents 代码仅使用 `param` 来禁用提供者 SDK 的重试循环，这使得模型节点中间件成为配置的重试预算的唯一所有者：

```toml
[retries]
max_retries = 2

[retries.my_custom]
param = "retries"
max_retries = 4
```

`param` 必须是有效的 Python 标识符字符串，例如 `"max_retries"` 或 `"retries"`。它不设置重试预算。使用本节中的`max_retries`或使用`--max-retries`设置预算。

重试预算优先顺序为：

1.`--max-retries N`
2.`[retries.<provider>].max_retries`
3.`[retries].max_retries`
4. Deep Agents 代码默认（`5`）

## 启动审批模式

使用顶级 `[startup].mode` 键设置交互式会话的默认 [approval mode](/oss/deepagents/code/approval-modes)：

```toml
[startup]
mode = "auto"   # "manual" (default), "auto", or "yolo"
```

接受的值为`manual`（故障关闭默认值）、`auto`（分类器支持；需要`DEEPAGENTS_CODE_EXPERIMENTAL=1`）和`yolo`（无限制；需要一次性确认）。显式 `--yolo` 或 `-y`/`--auto-approve` 标志会覆盖会话的此值。

## 自动分类器超时

当 [Auto mode](/oss/deepagents/code/approval-modes) 处于活动状态时，分类器有时间预算来审查每批门控操作。未在期限内审核的批次按`classifier_unavailable`拒绝；重复错过会退回到手动审批 UI。默认值为 20 秒。如果评论超时，首先要尝试的是[selecting a faster classifier model](#default-and-recent-model)（请参阅`[models].auto_classifier`）。如果您已经这样做了，但仍需要更多空间，您可以延长截止日期：

<Tabs>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [models]
        auto_classifier_timeout = 60   # seconds; minimum 1, maximum 300
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_AUTO_CLASSIFIER_TIMEOUT=60
        ```
    </Tab>
</Tabs>

环境变量优先于配置文件，配置文件优先于内置默认值。低于 1 或高于 300 的值将固定在地板或天花板上。非整数值会回退到默认值并带有警告。

## 配置文件覆盖（高级）

覆盖模型运行时配置文件中的字段以更改 Deep Agents 代码解释模型功能的方式。有关可覆盖字段的完整列表，请参阅[⟦T163⟧](https://reference.langchain.com/python/langchain-core/language_models/model_profile/ModelProfile)。最常见的用例是降低 `max_input_tokens` 以提前触发自动汇总 - 对于测试或限制上下文使用很有用：

```toml
# Apply to all models from this provider
[models.providers.anthropic.profile]
max_input_tokens = 4096
```

每个模型子表的工作方式与`params`相同——模型级值在冲突时获胜：

```toml
[models.providers.anthropic.profile]
max_input_tokens = 4096

# This model gets a higher limit
[models.providers.anthropic.profile."claude-sonnet-4-5"]
max_input_tokens = 8192
```

创建后，配置文件覆盖将合并到模型的配置文件中。任何读取配置文件的功能（状态栏中的上下文限制显示、自动汇总阈值、功能检查）都将看到覆盖的值。<Accordion title="CLI profile overrides with --profile-override" icon="terminal">
    要在运行时覆盖模型配置文件字段而不编辑配置文件，请通过 `--profile-override` 传递 JSON 对象：

    ```bash
    dcode --profile-override '{"max_input_tokens": 4096}'

    # Combine with --model
    dcode --model google_genai:gemini-3.6-flash --profile-override '{"max_input_tokens": 4096}'

    # In non-interactive mode
    dcode -n "Summarize this repo" --profile-override '{"max_input_tokens": 4096}'
    ```

    它们合并在配置文件配置文件覆盖之上（CLI 获胜）。优先级链为：model default < config.toml profile < CLI `--profile-override`。

    `--profile-override` 值在会话中持续存在 `/model` 热交换 — 切换模型会将覆盖重新应用到新模型。
</Accordion>

## 将模型添加到交互式切换器

一些提供商（例如`langchain-ollama`）不捆绑模型配置文件数据（请参阅[Provider reference](/oss/deepagents/code/providers#provider-reference)了解完整列表）。在这种情况下，交互式 `/model` 切换器将不会列出该提供商的型号。您可以通过在提供程序的配置文件中定义 `models` 列表来填补空白：

```toml
[models.providers.ollama]
models = ["gemma4", "qwen3.6", "granite4.1:3b"]
```

`/model` 切换器现在将包括列出这些型号的 Ollama 部分。

这完全是可选的。您始终可以通过直接指定其全名来切换到任何模型：

```txt
/model ollama:qwen3.6:27b
```

<Note>
    当安装了`langchain-ollama`并且可以访问守护进程时，Deep Agents代码会自动发现本地拉取的模型并将它们合并到切换器中 - 不需要`models`列表。拉取新模型后运行`/reload`进行刷新，或设置`DEEPAGENTS_CODE_OLLAMA_DISCOVERY=0`选择退出。
</Note>## 自定义基本 URL

某些提供程序包接受 `base_url` 来覆盖默认端点。例如，`langchain-ollama` 通过底层 `ollama` 客户端默认为 `http://localhost:11434`。要将其指向其他位置，请在配置中设置 `base_url`：

```toml
[models.providers.ollama]
base_url = "http://your-host-here:port"
```

有关兼容性信息和其他注意事项，请参阅提供商的参考文档。

## 兼容的API

对于公开与 OpenAI 或 Anthropic 线路兼容的 API 的提供程序，您可以通过将 `base_url` 指向提供程序的端点来使用现有的 `langchain-openai` 或 `langchain-anthropic` 包：

```toml
[models.providers.openai]
base_url = "https://api.example.com/v1"
api_key_env = "EXAMPLE_API_KEY"
models = ["my-model"]
```

```toml
[models.providers.anthropic]
base_url = "https://api.example.com"
api_key_env = "EXAMPLE_API_KEY"
models = ["my-model"]
```

<Note>
    提供商在官方规范之上添加的任何功能都不会被捕获。如果提供商提供专用的 LangChain 集成包，则更喜欢它。
</Note>

<Warning>
    OpenAI 提供程序默认为 [Responses API](https://platform.openai.com/docs/api-reference/responses)，大多数 OpenAI 兼容网关并未实现。如果您的提供商仅支持聊天完成 API，则调用可能会失败。显式禁用响应 API：

    ```toml
    [models.providers.openai.params]
    use_responses_api = false
    ```
</Warning>

## 任意提供者Deep Agents 代码可与任何调用 LLM 的工具配合使用，可用作 [LangChain ⟦T186⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.BaseChatModel)。 [built-in providers](/oss/deepagents/code/providers#provider-reference) 开箱即用；不太常见或内部模型需要更多的设置。将`class_path`指向其`BaseChatModel`子类，Deep Agents代码直接导入并实例化该类。

```toml
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

`api_key_env` 和 `base_url` 是可选的。 `display_name`和`api_key_url`自定义`/auth`显示的提供商名称和密钥获取链接；省略它们以回退到提供程序配置密钥和提供程序设置文档。要从环境变量读取端点而不是硬编码`base_url`，请使用[⟦T195⟧](#provider-configuration)；然后，它以与内置提供程序相同的方式解析并与密钥配对（请参阅[Endpoints, keys, and gateways](#endpoints-keys-and-gateways)）。

`class_path` 提供商应在内部处理自己的身份验证 - 当您的模型使用自定义身份验证（JWT 令牌、专有标头、mTLS 等）而不是标准 API 密钥时，这很有用：

```toml
[models.providers.xyz]
class_path = "abc.integrations.deepagents:DeepAgentsXYZChat"
models = ["abc-xyz-1"]

[models.providers.xyz.params]
bypass_auth = true
temperature = 0
```

使用此配置，切换到带有`/model xyz:abc-xyz-1`或`--model xyz:abc-xyz-1`的型号。

<Note>
    Deep Agents 代码需要**工具调用**支持。如果您的自定义模型支持工具调用，但Deep Agents代码不知道它，请在提供程序配置文件中声明它：

    ```toml
    [models.providers.xyz.profile]
    tool_calling = true
    max_input_tokens = 128000
    ```尽管是可选的，但强烈建议将 `max_input_tokens` 设置为模型的上下文窗口。如果没有它，Deep Agents代码无法显示上下文的完整程度，并且自动摘要会回退到固定触发器（大约 170,000 个标记），而不是模型窗口的一小部分。对于窗口较小的模型，在达到模型的硬限制之前，汇总可能不会运行，因此一旦对话增长，请求就会开始失败。
</Note>

由于Deep Agents代码在启动时导入`class_path`类，因此定义它的包必须可以从运行`dcode`的同一环境中导入。内置提供程序以 [install extras](/oss/deepagents/code/providers#quickstart) 的形式提供，但自定义或内部包不是其中之一。使用 `--package` 标志将其安装到 `dcode` 环境中：

```bash
dcode --install my_package --package
```

在会话中，运行`/install my_package --package --force`。两者都与 `dcode` 一起安装该软件包。如果包丢失或无法导入，Deep Agents代码会跳过提供程序，并且其模型不会出现在`/model`中。

当您切换到 `my_custom:my-model-v1`（通过 `/model` 或 `--model`）时，模型名称 (`my-model-v1`) 将作为 `model` kwarg 传递：

```python
MyChatModel(model="my-model-v1", base_url="...", api_key="...", temperature=0, max_tokens=4096)
```<Warning>
    `class_path` 从您的配置文件执行任意 Python 代码。这与 `pyproject.toml` 构建脚本具有相同的信任模型 - 您控制自己的机器。
</Warning>

您的提供程序包可以选择在 `<package>.data._profiles` 中的 `_PROFILES` 字典中提供模型配置文件，而不是在 `models` 键下定义它们。请参阅 LangChain [model profiles](https://github.com/langchain-ai/langchain/tree/master/libs/model-profiles) 了解更多信息。

## 端点、密钥和网关

API 密钥与其发送到的端点必须匹配：端点必须接受该密钥，否则请求可能会失败。 Deep Agents 代码一起解析密钥和端点，因此覆盖其中一个会更新另一个以匹配。例如，如果您用自己的密钥替换网关配置的密钥，Deep Agents代码也会删除网关端点，因此您的密钥直接发送到提供商，而不是发送到会拒绝它的网关。

### `base_url` 如何解决

Deep Agents 代码按以下顺序解析提供者的端点（第一个匹配获胜）：1. **`base_url` 位于 `config.toml`** 对于提供商。
2. **以 `DEEPAGENTS_CODE_` 为前缀的端点变量。**
3. **环境中的普通端点变量**（例如，`OPENAI_BASE_URL`）。
4. **使用`/auth`凭证保存的端点。**此步骤将保存的端点应用于没有端点变量的提供程序，例如您在未声明[⟦T223⟧](#provider-configuration)的情况下添加的提供程序。步骤 2-3 没有可供读取的变量，因此此处直接使用保存的端点。对于确实具有端点变量的提供程序，保存的端点已在步骤 2 或 3 中生效（它被写入该变量），因此此步骤不会更改任何内容。无论哪种方式，在 `/auth` 中输入的端点都适用。
5. **当以上均未设置时，提供商 SDK 自己的默认端点**。

<Note>
    解析的端点作为 `base_url` 构造函数参数传递给模型。
</Note>

与 API 密钥一样，[⟦T226⟧ prefix](/oss/deepagents/code/configuration#deepagents_code_-prefix) 将端点范围限制为 Deep Agents 代码，而不影响其他工具。对于任何其他提供程序，使用 [⟦T227⟧](#provider-configuration) 声明名称，端点以相同的方式解析和配对：

```toml
[models.providers.myprovider]
api_key_env = "MYPROVIDER_API_KEY"
base_url_env = "MYPROVIDER_BASE_URL"
models = ["my-model"]
```

字面量 `base_url` 胜过 `base_url_env`，因此仅设置您需要的：

```toml
[models.providers.myprovider]
base_url = "https://fixed.example/v1"   # used
base_url_env = "MYPROVIDER_BASE_URL"    # ignored while base_url is set
```

### 覆盖将两者保持在一起当您使用 `/auth` 存储密钥时，您输入的端点（或提供商的默认端点，如果留空）将与密钥一起应用。使用空白基本 URL 存储密钥还会清除环境中已设置的任何端点（例如，您的 shell 导出的网关 `OPENAI_BASE_URL`），因此您的密钥将转到提供程序的默认端点，而不是该网关。

```bash title="Scope both the key and the endpoint to Deep Agents Code"
DEEPAGENTS_CODE_OPENAI_API_KEY=sk-cli-only
DEEPAGENTS_CODE_OPENAI_BASE_URL=https://api.openai.com/v1
```

### 托管网关

在配备模型网关（例如，LangSmith网关）的计算机上，网关通常会一起导出网关密钥和匹配的端点变量（`OPENAI_BASE_URL`、`ANTHROPIC_BASE_URL`或`GOOGLE_GEMINI_BASE_URL`）。 Deep Agents 代码默认使用该对，因此无需配置。

要使用您自己的密钥，请将其存储为 `/auth`（将提供程序默认值的基本 URL 留空，或显式设置），或设置 `DEEPAGENTS_CODE_` 前缀密钥和端点。两者都会覆盖网关对，而不会留下不匹配的端点。

## JS 解释器

`[interpreter]` 部分调整内置 JavaScript 解释器（`js_eval` 工具），该解释器在 QuickJS 沙箱中运行代理编写的代码。这些键仅适用于配置文件；请参阅 [Command line options](/oss/deepagents/code/cli-reference#command-line-options) 了解 `--interpreter` 和 `--interpreter-tools` 标志等效项。

```toml title="~/.deepagents/config.toml"
[interpreter]
enable_interpreter = true       # default
timeout_seconds = 5.0           # default
memory_limit_mb = 64            # default
max_ptc_calls = 256             # default
max_result_chars = 4000         # default
ptc = "safe"                    # default: "safe"
ptc_acknowledge_unsafe = false  # default
```<ResponseField name="enable_interpreter" type="boolean" default="true" post={["optional"]}>
    将 QuickJS REPL 中间件 (`js_eval`) 连接到主代理（仅限本地会话）。设置为`false`以完全禁用解释器；重新启用与 `--interpreter` 的会话。
</ResponseField>

<ResponseField name="timeout_seconds" type="number" default="5.0" post={["optional"]}>
    QuickJS REPL 的每次调用挂钟超时。
</ResponseField>

<ResponseField name="memory_limit_mb" type="integer" default="64" post={["optional"]}>
    QuickJS 堆内存上限（以 MB 为单位），在会话中共享。
</ResponseField>

<ResponseField name="max_ptc_calls" type="integer" default="256" post={["optional"]}>
    每个 `js_eval` 调用最多 `tools.*` 主机桥调用。
</ResponseField>

<ResponseField name="max_result_chars" type="integer" default="4000" post={["optional"]}>
    在 `js_eval` 结果上设置字符上限并在截断之前捕获标准输出。
</ResponseField>

<ResponseField name="ptc" type="string | boolean | string[]" default='"safe"' post={["optional"]}>
    [Programmatic tool calling](/oss/python/deepagents/interpreters#programmatic-tool-calling-ptc) `js_eval` 的许可名单。接受的值：- `"safe"`（默认）：只读预设`read_file`、`glob`、`grep`。这些工具在 REPL 之外不受批准，因此公开它们不会导致批准绕过。网络工具、子代理调度、shell 执行和文件写入被故意排除。
    - `"all"`：每个主机工具。需要 `ptc_acknowledge_unsafe = true`，除非全局禁用批准，因为 PTC 会调用绕过批准提示。
    - 工具名称列表，例如`["safe", "web_search"]` — `"safe"` 条目扩展到预设。列表中不允许使用 `"all"`。
    - `false` 或 `[]`：无法从 REPL（纯解释器）访问工具。 `true` 被拒绝 — 使用 `"safe"`、`"all"` 或显式列表。
</ResponseField>

<ResponseField name="ptc_acknowledge_unsafe" type="boolean" default="false" post={["optional"]}>
    确认 `ptc = "all"` 会将每个工具暴露给绕过批准提示的 PTC 调用。 `ptc = "all"` 是必需的，除非在禁用批准的情况下运行。
</ResponseField>

## Python 扩展

`[extensions]` 部分控制[Python extension](/oss/deepagents/code/extensions) 发现和项目信任。即使此处启用了扩展加载，也需要实验性功能门。

```toml title="~/.deepagents/config.toml"
[extensions]
enabled = true
trust = "ask"
extra_paths = [
    "extensions/policy.py",
    "~/src/company-extensions",
]
```<ResponseField name="enabled" type="boolean" default="true" post={["optional"]}>
    为每个源启用 Python 扩展发现，包括 `-e` / `--extension` 路径、用户和项目目录、插件和入口点。设置 `DEEPAGENTS_CODE_EXTENSIONS` 以覆盖该值。这两种设置都需要在启动 Deep Agents 代码之前使用 `DEEPAGENTS_CODE_EXPERIMENTAL=1`。
</ResponseField>

<ResponseField name="trust" type="string" default='"ask"' post={["optional"]}>
    在 `<project>/.deepagents/extensions/` 中设置项目扩展的默认策略：`ask` 在交互式启动中提示，`always` 加载它们，`never` 跳过它们。设置`DEEPAGENTS_CODE_EXTENSIONS_TRUST`以覆盖该值。仅当您打开的每个项目都可信时才使用`always`。
</ResponseField>

<ResponseField name="extra_paths" type="string[]" default="[]" post={["optional"]}>
    添加用户授权的Python扩展文件或目录。相对路径从Deep Agents代码配置文件目录解析； `~` 扩展到您的主目录。
</ResponseField>

## 代理运行时间限制

LangGraph图步骤预算是`dcode`代理图在单轮中可以执行的最大节点调用数。使用 `[runtime]` 部分配置此递归限制：

```toml title="~/.deepagents/config.toml"
[runtime]
recursion_limit = 5000
```Deep Agents 代码未设置默认值。当没有源设置有效值时，LangGraph 服务器默认值适用。托管配置、环境和 `config.toml` 的值必须是从 `25` 到 `100000`（含）的整数。无效值会记录警告，并继续解决下一个来源。 `--recursion-limit` 标志接受任何大于或等于 `1` 的整数。

优先级（从最高到最低）：

1. 管理员拥有`managed_config.toml`
2. `--recursion-limit` CLI 标志
3. `DEEPAGENTS_CODE_RECURSION_LIMIT`环境变量
4.`[runtime].recursion_limit`在`config.toml`
5. `LANGGRAPH_DEFAULT_RECURSION_LIMIT`环境变量
6. LangGraph服务器默认

使用`dcode config get runtime.recursion_limit`查看有效的Deep AgentsCode值及其来源。未设置的结果将限制留给LangGraph服务器。

<Tabs>
    <Tab title="CLI flag">
        ```bash
        dcode --recursion-limit 5000
        ```
    </Tab>
    <Tab title="Environment variable">
        ```bash
        export DEEPAGENTS_CODE_RECURSION_LIMIT=5000
        ```
    </Tab>
    <Tab title="Config file">
        ```toml title="~/.deepagents/config.toml"
        [runtime]
        recursion_limit = 5000
        ```
    </Tab>
</Tabs>

<Note>
    `goal_rubric` 递归限制是单独的，不受此设置的影响。
</Note>

## 另请参阅

- [Configuration](/oss/deepagents/code/configuration)
- [Provider credentials](/oss/deepagents/code/credentials)
- [Providers](/oss/deepagents/code/providers)
- [Python extensions](/oss/deepagents/code/extensions)
- [CLI reference](/oss/deepagents/code/cli-reference)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/config-file.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>