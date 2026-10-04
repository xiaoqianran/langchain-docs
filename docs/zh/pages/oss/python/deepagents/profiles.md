<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Profiles | https://docs.langchain.com/oss/python/deepagents/profiles -->

# 个人资料

选择模型时，Deep Agents 应用每个提供商和每个模型的默认包

**线束配置文件**让您可以为特定型号或提供商定制 Deep Agents 线束。您可以调整系统提示和工具描述、排除工具或中间件、添加中间件以及配置通用子代理。每当您选择匹配模型时，Deep Agents 都会应用这些设置，而无需更改代理创建代码。

**提供者配置文件**定义用于创建模型的默认设置，例如温度和超时。这些设置不会影响线束。大多数呼叫者不需要提供商资料。当打包需要共享默认值、凭据检查或在运行时计算的设置的集成时，它们非常有用。

## 线束配置文件

Deep Agents 包括**内置线束配置文件**以及特定提供商和模型的默认设置。

使用 `HarnessProfile` 定义构建聊天模型后 `create_deep_agent` 应用的设置：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import (
    GeneralPurposeSubagentProfile,
    HarnessProfile,
    register_harness_profile,
)

register_harness_profile(
    "openai:gpt-6-astra",
    HarnessProfile(
        system_prompt_suffix="Respond in under 100 words.",
        excluded_tools={"execute"},
        excluded_middleware={"SummarizationMiddleware"},
        general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False),
    ),
)
```<ResponseField name="base_system_prompt" type="string">
  设置配置文件的基本说明。对于主代理来说，这些遵循呼叫者的系统指令；默认情况下不添加基本指令。对于声明性子代理，这会替换其编写的系统提示符。
</ResponseField>

<ResponseField name="system_prompt_suffix" type="string">
  在呼叫者的说明和个人资料的基本说明之后附加文本。应用于主代理、声明性子代理和自动添加的通用子代理。
</ResponseField>

<ResponseField name="tool_description_overrides" type="Mapping[str, str]">
  覆盖按工具名称键入的各个工具描述。
</ResponseField>

<ResponseField name="excluded_tools" type="frozenset[str]">
  从工具集中删除特定的线束级工具。按工具名称（字符串）匹配，用作注入后过滤器，以便它可以删除用户提供的工具和由线束中间件添加的工具。有关有效示例，请参阅[Running without the default filesystem tools](/oss/python/deepagents/overview#virtual-filesystem-access)。
</ResponseField>

<ResponseField name="excluded_middleware" type="frozenset[type[AgentMiddleware] | str]">
  从 [Deep Agents stack](/oss/python/deepagents/customization#deep-agents-stack) 中剥离特定的中间件类。接受中间件类或字符串名称。
</ResponseField>

<ResponseField name="extra_middleware" type="Sequence[AgentMiddleware] | Callable[[], Sequence[AgentMiddleware]]">
  将中间件附加到此配置文件适用的每个堆栈。有关内置排序，请参阅[Deep Agents stack](/oss/python/deepagents/customization#full-stack)。
</ResponseField>

<ResponseField name="general_purpose_subagent" type="GeneralPurposeSubagentProfile">
  禁用、重命名或重新提示通用子代理。当此字段的 `system_prompt` 与 `base_system_prompt` 一起设置时，通用特定子代理提示符获胜 - 请参阅 [General-purpose subagent prompt](/oss/python/deepagents/customization#general-purpose-subagent-prompt)。
</ResponseField><Note>
  调用者提供的 `system_prompt=` 始终位于组合提示符的前面，而 `system_prompt_suffix` 始终位于末尾 — 无论选择哪种型号。相同的覆盖规则适用于子代理：每个子代理针对其自己的模型重新运行配置文件解析。有关自定义指令和子代理提示行为，请参阅[System prompt](/oss/python/deepagents/customization#system-prompt)。
</Note>

<Warning>
  要在不使用 `task` 工具的情况下运行代理，请参阅 [Running without subagents](/oss/python/deepagents/subagents#running-without-subagents) — 设置 `general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False)` 并通过 `subagents=` 不传递任何同步子代理。 `SubAgentMiddleware`（和 `task` 工具）仅在至少存在一个同步子代理时附加，因此此配置将其完全排除。异步子代理不受影响。

  列出`FilesystemMiddleware`、`SubAgentMiddleware`或`excluded_middleware`中的内部权限中间件会引发`ValueError`——它们需要[Deep Agents stack](/oss/python/deepagents/customization#deep-agents-stack)中的脚手架。要在模型中隐藏其工具而不删除中间件，请改用 `excluded_tools` — 请参阅 [Running without the default filesystem tools](/oss/python/deepagents/overview#virtual-filesystem-access)。
</Warning>

`excluded_middleware` 中的条目接受两种形式：* 中间件*类*（按精确类型匹配），或匹配`AgentMiddleware.name`的纯字符串。对内置和公共别名使用纯字符串，例如 `"SummarizationMiddleware"`。
* `module:Class` 导入引用（例如，`"my_pkg.middleware:TelemetryMiddleware"`）用于从配置文件中定位精确的中间件类。导入引用会延迟解析，因此仅将它们用于受信任的本地配置 - 加载一个导入 Python 代码。

在创建代理之前注册配置文件。传递一个模型字符串或者你自己构造的模型对象；有关示例，请参阅[Configure model parameters](/oss/python/deepagents/models#configure-model-parameters)。线束型材适用于这两种情况。

仅当您传递字符串时，提供程序配置文件才提供构造设置。

<Accordion title="Lookup order for preconfigured model instances">
  当您传递模型对象时，线束会使用该对象报告的提供程序和标识符来查找其配置文件。

  1. `provider:identifier` 精确匹配
  2. 仅标识符（仅当标识符已包含`:`时）
  3. 报告的提供商的默认值，或者标识符前缀的默认值（如果提供商未知）

  两个确切的候选者都优先于提供商默认值。
</Accordion>

## 注册密钥

配置文件注册使用这些密钥：* **提供商级别** - 像`"openai"`这样的裸提供商名称适用于该提供商的每个模型。
* **模型级别** - 完全限定的 `provider:model` 密钥（例如 `"openai:gpt-6-astra"`）仅适用于该特定模型。

当提供程序级别和模型级别配置文件同时存在时，它们会在解析时合并。未设置的模型级字段继承自提供者级配置文件；显式模型级值会覆盖它们。

只有第一个冒号将提供程序与模型标识符分开。对于假设密钥`my_provider:my-model:tag`，提供者是`my_provider`，完整的模型标识符是`my-model:tag`。任何附加的冒号都是模型标识符的一部分。

例如，排除假设提供商模型的工具，然后为一个模型自定义提示后缀：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import HarnessProfile, register_harness_profile

# Set defaults for a hypothetical provider.
register_harness_profile(
    "my_provider",
    HarnessProfile(
        excluded_tools=frozenset({"execute"}),
        system_prompt_suffix="Respond in under 500 words.",
    ),
)

# Override the prompt suffix for one model; inherit the excluded tool.
register_harness_profile(
    "my_provider:my-model:tag",
    HarnessProfile(system_prompt_suffix="Respond in under 100 words."),
)
```

使用特定于模型的注册的代理会排除 `execute` 并收到 100 个单词的后缀。 `my_provider` 的其他型号排除 `execute` 并接收 500 字后缀。

使用现有密钥重新注册会将新配置文件合并到前一个配置文件之上；它不会取代它。这还允许您通过在其密钥下注册来自定义内置配置文件。有关每个字段的规则，请参阅[Merge semantics](#merge-semantics)。继续该示例，排除同一模型的另外一个工具：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
register_harness_profile(
    "my_provider:my-model:tag",
    HarnessProfile(excluded_tools=frozenset({"grep"})),
)
```

随后使用此模型创建的代理会排除 `execute` 和 `grep` 并保留 100 字后缀。其他模型保留提供商的默认值。

<Note>
  没有与每个提供商匹配的通配符密钥。要在各处应用相同的覆盖（例如，无论选择哪个模型，都删除 `SummarizationMiddleware`），请在您使用的每个提供程序密钥下注册配置文件。配置文件用于根据所选模型进行调整。无论型号如何，都应在`create_deep_agent`调用站点上进行全局调整。
</Note>

## 合并语义|领域 |合并行为 |
| - | - |
| `base_system_prompt`、`system_prompt_suffix` |设置后新值获胜；否则继承|
| `tool_description_overrides` |每个键的映射合并；新价值赢得共享密钥|
| `excluded_tools`、`excluded_middleware` |设置并集|
| `extra_middleware` |按具体类型合并：新实例替换其位置上的现有实例，新类型追加 |
| `general_purpose_subagent` |按字段合并（未设置的字段继承）|
| `init_kwargs`（提供商）|字典按键合并；新价值赢得共享密钥|
| `pre_init`（提供商）| Callables 链：现有的先运行，然后是新的 |
| `init_kwargs_factory`（提供商）|工厂链，其输出在每个模型构建中合并

## 提供商简介

当您将 `provider:model` 字符串传递给 `create_deep_agent` 时，`ProviderProfile` 会提供模型构造设置。对于下面假设的提供商，为其所有模型设置默认值，然后覆盖一个模型的温度：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import ProviderProfile, register_provider_profile

register_provider_profile(
    "my_provider",
    ProviderProfile(init_kwargs={"temperature": 0.7, "timeout": 30}),
)
register_provider_profile(
    "my_provider:my-model:tag",
    ProviderProfile(init_kwargs={"temperature": 0}),
)
```

构造`my_provider:my-model:tag`使用`temperature=0`并继承`timeout=30`。 `my_provider`的其他型号使用`temperature=0.7`和`timeout=30`。

要增加此模型的超时时间，请在其密钥下再次注册：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
register_provider_profile(
    "my_provider:my-model:tag",
    ProviderProfile(init_kwargs={"timeout": 60}),
)
```

该模型的未来构建使用`temperature=0`和`timeout=60`。这些注册使现有模型对象保持不变。

<ResponseField name="init_kwargs" type="Mapping[str, Any]">
  静态初始化参数转发到`init_chat_model`。
</ResponseField><ResponseField name="pre_init" type="Callable[[str], None]">
  在构建之前运行的副作用（例如，凭据验证）。
</ResponseField>

<ResponseField name="init_kwargs_factory" type="Callable[[], dict[str, Any]]">
  Kwargs 源自运行时状态（例如，从环境变量中提取的标头）。
</ResponseField>

## 从配置文件加载配置文件

对于 YAML/JSON 支持的工作流程，请使用 `HarnessProfileConfig`。它镜像 `HarnessProfile` 的声明性子集（提示文本、工具描述覆盖、排除的工具和中间件、通用子代理编辑）并拥有 `to_dict` / `from_dict`。仅运行时状态（中间件实例、工厂和类形式 `excluded_middleware` 条目）— 保留在 `HarnessProfile` 上。

`register_harness_profile` 接受任一类型，因此配置支持的调用者不需要手动转换步骤：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# openai.yaml
base_system_prompt: You are helpful.
system_prompt_suffix: Respond briefly.
excluded_tools:
  - execute
  - grep
excluded_middleware:
  - SummarizationMiddleware
  - my_pkg.middleware:TelemetryMiddleware
general_purpose_subagent:
  enabled: false
```

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import yaml
from deepagents import HarnessProfileConfig, register_harness_profile

with open("openai.yaml") as f:
    register_harness_profile(
        "openai",
        HarnessProfileConfig.from_dict(yaml.safe_load(f)),
    )
```

反之，当仅使用可序列化功能时，`HarnessProfileConfig.from_harness_profile(...)` 将运行时配置文件导出回声明性形状：

* 类形式 `excluded_middleware` 条目序列化为公共别名（当类通过 `serialized_name: ClassVar[str]` 公开别名时）或作为 `module:Class` 导入引用。
* 非空 `extra_middleware` 以及在 `__main__` 中或函数作用域内声明的中间件类无法序列化 — 导出引发 `ValueError`。

## 将配置文件作为插件发送可分发的配置文件可以通过`importlib.metadata`入口点注册自己，而不是要求调用者手动运行`register_*_profile`。加载顺序是**首先是内置插件，然后是入口点插件，然后是用户代码中的任何直接 `register_*_profile` 调用**；所有三个路径都通过相同的附加注册，因此后面的注册位于同一密钥下的早期注册之上。

在适当的组下声明发行版自己的`pyproject.toml`的入口点：

```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[project.entry-points."deepagents.harness_profiles"]
my_provider = "my_pkg.profiles:register_harness"

[project.entry-points."deepagents.provider_profiles"]
my_provider = "my_pkg.profiles:register_provider"
```

每个目标都会解析为一个零参数可调用函数，该可调用函数在导入 `deepagents.profiles` 时执行注册：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import (
    HarnessProfile,
    ProviderProfile,
    register_harness_profile,
    register_provider_profile,
)


def register_harness() -> None:
    register_harness_profile(
        "my_provider",
        HarnessProfile(system_prompt_suffix="Batch independent tool calls in parallel."),
    )


def register_provider() -> None:
    register_provider_profile(
        "my_provider",
        ProviderProfile(init_kwargs={"temperature": 0}),
    )
```

## 相关

* [Harness Overview](/oss/python/deepagents/overview)—线束功能概述
* [Models](/oss/python/deepagents/models)—配置模型提供者和参数
* [Customization](/oss/python/deepagents/customization)—全`create_deep_agent`配置面

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/profiles.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>