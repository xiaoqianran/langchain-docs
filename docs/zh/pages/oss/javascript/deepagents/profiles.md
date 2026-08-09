<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Profiles | https://docs.langchain.com/oss/javascript/deepagents/profiles -->

# 个人资料

选择模型时 Deep Agents 应用的按提供商和按模型默认的软件包

**利用配置文件**让您可以打包每当选择给定提供程序或特定模型时 Deep Agents 应用的配置：系统提示调整、工具描述覆盖、排除的工具或中间件、额外的中间件和通用子代理编辑。它们是在不更改 `createDeepAgent` 调用站点的情况下调整线束针对特定模型的行为方式的主要方法。使用`HarnessProfileOptions`建立档案；当[loading or saving YAML/JSON files](#load-profiles-from-config-files)时使用`parseHarnessProfileConfig`。 Deep Agents 为 OpenAI 和 Anthropic (Claude) 模型提供了内置的线束配置文件。

<Note>
  提供者配置文件（用于控制模型构建 kwargs）和插件注册系统是仅限 Python 的功能。 TypeScript SDK 仅支持线束配置文件。
</Note>

## 线束配置文件

线束配置文件描述了在构建聊天模型后应用的提示组装、工具可见性、中间件和默认子代理调整：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { registerHarnessProfile } from "deepagents";

registerHarnessProfile("openai:gpt-5.5", {
  systemPromptSuffix: "Respond in under 100 words.",
  excludedTools: ["execute"],
  excludedMiddleware: ["SummarizationMiddleware"],
  generalPurposeSubagent: { enabled: false },
});
```

<ResponseField name="baseSystemPrompt" type="string">
  替换基本 Deep Agents 系统提示符（[System prompt](/oss/javascript/deepagents/customization#system-prompt) 中的 `base` 键）。
</ResponseField><ResponseField name="systemPromptSuffix" type="string">
  在调用者的 `suffix` 之后附加文本，放在组装的系统提示符的最后。应用于主代理、声明性子代理和自动添加的通用子代理。
</ResponseField>

<ResponseField name="toolDescriptionOverrides" type="Record<string, string>">
  覆盖按工具名称键入的各个工具描述。
</ResponseField>

<ResponseField name="excludedTools" type="string[]">
  从工具集中删除特定的线束级工具。按工具名称匹配，用作注入后过滤器，因此它可以捕获用户提供的工具和中间件提供的工具。
</ResponseField>

<ResponseField name="excludedMiddleware" type="string[]">
  从组装的堆栈中剥离特定的中间件。与每个中间件的 `.name` 属性匹配。不能包含所需的脚手架名称（`FilesystemMiddleware`、`SubAgentMiddleware`）。
</ResponseField>

<ResponseField name="extraMiddleware" type="AgentMiddleware[] | (() => AgentMiddleware[])">
  在用户中间件之后附加到堆栈的附加中间件。可以是静态数组或零参数工厂，每个代理构造返回新实例。
</ResponseField>

<ResponseField name="generalPurposeSubagent" type="GeneralPurposeSubagentConfig">
  禁用、重命名或重新提示通用子代理（`enabled`、`description`、`systemPrompt`）。
</ResponseField><Note>
  调用者提供的 `systemPrompt` 始终位于组合提示符的前面，而 `systemPromptSuffix` 始终位于末尾 — 无论选择哪种型号。相同的覆盖规则适用于子代理：每个子代理针对其自己的模型重新运行配置文件解析。有关每个案例的完整细分（主代理、子代理和通用子代理），请参阅[System prompt](/oss/javascript/deepagents/customization#system-prompt)。
</Note>

<Warning>
  在 `excludedMiddleware` 中列出 `FilesystemMiddleware` 或 `SubAgentMiddleware` 在施工时会抛出 — 它们需要脚手架。要在模型中隐藏其工具而不删除中间件，请改用 `excludedTools`。
</Warning>

<Accordion title="Lookup order for preconfigured model instances">
  当您传递预配置的聊天模型实例而不是 `provider:model` 字符串时，该工具会从该实例合成规范的 `provider:identifier` 键，并按以下顺序查找它：

  1. `provider:identifier` 精确匹配
  2. 仅标识符（仅当标识符已包含`:`时）
  3. 仅限提供商的后备方案
</Accordion>

## 注册密钥

两种配置文件类型使用相同的密钥格式：

* **提供商级别** - 像`"openai"`这样的裸提供商名称适用于该提供商的每个模型。
* **模型级别** - 完全限定的 `provider:model` 密钥（例如 `"openai:gpt-5.5"`）仅适用于该特定模型。当提供程序级别和模型级别配置文件同时存在时，它们会在解析时合并。未设置的模型级字段继承自提供者级配置文件；显式模型级值会覆盖它们。

在现有密钥下重新注册会将新配置文件合并到之前的配置文件之上，但不会替换它。有关每个字段的规则，请参阅[Merge semantics](#merge-semantics)。

<Note>
  没有与每个提供商匹配的通配符密钥。要在各处应用相同的覆盖（例如，无论选择哪个模型，都删除 `SummarizationMiddleware`），请在您使用的每个提供程序密钥下注册配置文件。配置文件用于根据所选模型进行调整。无论型号如何，都应在`createDeepAgent`调用站点上进行全局调整。
</Note>

## 合并语义|领域|合并行为 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `baseSystemPrompt`、`systemPromptSuffix` |设置后新值获胜；否则继承|
| `toolDescriptionOverrides` |每个键的映射合并；新价值赢得共享密钥|
| `excludedTools`、`excludedMiddleware` |设置并集 |
| `extraMiddleware` |按名称合并：新实例替换其位置上的现有实例，新条目附加 |
| `generalPurposeSubagent` |按字段合并（未设置的字段继承）|

## 提供商简介

提供程序配置文件（用于控制模型构造 kwargs，如 `temperature`）是仅限 Python 的功能，在 TypeScript SDK 中不可用。

## 从配置文件加载配置文件对于 YAML/JSON 支持的工作流程，请使用 `parseHarnessProfileConfig`。它使用驼峰式键从普通对象验证并构建 `HarnessProfile`。仅运行时状态（例如 `extraMiddleware` 实例）无法以 JSON/YAML 表示，必须以编程方式设置。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# profile.yaml
baseSystemPrompt: You are helpful.
systemPromptSuffix: Respond briefly.
excludedTools:
  - execute
  - grep
excludedMiddleware:
  - SummarizationMiddleware
generalPurposeSubagent:
  enabled: false
```

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { readFileSync } from "fs";
import YAML from "yaml";
import { parseHarnessProfileConfig, registerHarnessProfile } from "deepagents";

const raw = YAML.parse(readFileSync("profile.yaml", "utf-8"));
registerHarnessProfile("openai", parseHarnessProfileConfig(raw));
```

要将配置文件序列化回 JSON/YAML，请使用 `serializeProfile`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { serializeProfile } from "deepagents";

const data = serializeProfile(profile); // JSON-compatible object
```

`extraMiddleware`非空的配置文件无法序列化；如果存在中间件实例，则`serializeProfile`抛出异常。

## 将配置文件作为插件发送

插件注册系统（通过包入口点）是仅限 Python 的功能。在 TypeScript 中，在应用程序启动时或在包的初始化代码中直接调用 `registerHarnessProfile`。

## 相关

* [Harness Overview](/oss/javascript/deepagents/overview)—线束功能概述

* [Models](/oss/javascript/deepagents/models)—配置模型提供者和参数

* [Customization](/oss/javascript/deepagents/customization)—全`createDeepAgent`配置面

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/profiles.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>