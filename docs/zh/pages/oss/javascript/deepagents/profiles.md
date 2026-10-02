<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Profiles | https://docs.langchain.com/oss/javascript/deepagents/profiles -->

# 个人资料

选择模型时适用的每个提供商和每个模型的默认包 Deep Agents

**线束配置文件**让您可以为特定型号或提供商定制 Deep Agents 线束。您可以调整系统提示和工具描述、排除工具或中间件、添加中间件以及配置通用子代理。每当您选择匹配模型时，Deep Agents 都会应用这些设置，而无需更改代理创建代码。

<Note>
  提供者配置文件（用于控制用于创建模型的设置）和插件注册系统是仅限 Python 的功能。 TypeScript SDK 仅支持线束配置文件。
</Note>

## 线束配置文件

Deep Agents 包括**内置线束配置文件**以及针对特定提供商和模型的默认设置。

使用 `HarnessProfileOptions` 定义构建聊天模型后 `createDeepAgent` 应用的设置：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { registerHarnessProfile } from "deepagents";

registerHarnessProfile("openai:gpt-6-astra", {
  systemPromptSuffix: "Respond in under 100 words.",
  excludedTools: ["execute"],
  excludedMiddleware: ["SummarizationMiddleware"],
  generalPurposeSubagent: { enabled: false },
});
```

<ResponseField name="baseSystemPrompt" type="string">
  设置配置文件的基本说明。对于主代理来说，这些遵循呼叫者的系统指令；默认情况下不添加基本指令。对于声明性子代理，这会替换其编写的系统提示符。
</ResponseField><ResponseField name="systemPromptSuffix" type="string">
  在呼叫者的说明和个人资料的基本说明之后附加文本。应用于主代理、声明性子代理和自动添加的通用子代理。
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
  调用者提供的 `systemPrompt` 始终位于组合提示符的前面，而 `systemPromptSuffix` 始终位于末尾 — 无论选择哪种型号。相同的覆盖规则适用于子代理：每个子代理针对其自己的模型重新运行配置文件解析。有关自定义指令和子代理提示行为，请参阅[System prompt](/oss/javascript/deepagents/customization#system-prompt)。
</Note>

<Warning>
  在 `excludedMiddleware` 中列出 `FilesystemMiddleware` 或 `SubAgentMiddleware` 在施工时会抛出 — 它们需要脚手架。要在模型中隐藏其工具而不删除中间件，请改用 `excludedTools`。
</Warning>

在创建代理之前注册配置文件。传递一个模型字符串或者你自己构造的模型对象；有关示例，请参阅[Configure model parameters](/oss/javascript/deepagents/models#configure-model-parameters)。线束型材适用于这两种情况。

<Accordion title="Lookup order for preconfigured model instances">
  当您传递模型对象时，线束会使用该对象报告的提供程序和标识符来查找其配置文件。

  1. 如果标识符没有冒号，则查找 `provider:identifier`，返回到该提供商的默认值。
  2. 如果标识符包含冒号，则直接查找它，回退到其前缀的默认值。
  3. 如果两个查找均不匹配，则使用报告的提供程序的默认值。
</Accordion>

## 注册密钥

配置文件注册使用这些密钥：* **提供商级别** - 像`"openai"`这样的裸提供商名称适用于该提供商的每个模型。
* **模型级别** - 完全限定的 `provider:model` 密钥（例如 `"openai:gpt-6-astra"`）仅适用于该特定模型。

当提供程序级别和模型级别配置文件同时存在时，它们会在解析时合并。未设置的模型级字段继承自提供者级配置文件；显式模型级值会覆盖它们。

TypeScript 中的配置文件注册不支持包含冒号的模型标识符。使用诸如 `my_provider:my-model` 之类的键，并用单个冒号分隔提供者和模型标识符。

例如，排除假设提供商模型的工具，然后为一个模型自定义提示后缀：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { registerHarnessProfile } from "deepagents";

// Set defaults for a hypothetical provider.
registerHarnessProfile("my_provider", {
  excludedTools: ["execute"],
  systemPromptSuffix: "Respond in under 500 words.",
});

// Override the prompt suffix for one model; inherit the excluded tool.
registerHarnessProfile("my_provider:my-model", {
  systemPromptSuffix: "Respond in under 100 words.",
});
```

使用特定于模型的注册的代理会排除 `execute` 并收到 100 个字的后缀。 `my_provider` 的其他型号排除 `execute` 并接收 500 字后缀。

使用现有密钥重新注册会将新配置文件合并到前一个配置文件之上；它不会取代它。这还允许您通过在其密钥下注册来自定义内置配置文件。有关每个字段的规则，请参阅[Merge semantics](#merge-semantics)。

继续该示例，排除同一模型的另外一个工具：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
registerHarnessProfile("my_provider:my-model", {
  excludedTools: ["grep"],
});
```随后使用此模型创建的代理会排除 `execute` 和 `grep` 并保留 100 字后缀。其他模型保留提供商的默认值。

<Note>
  没有与每个提供商匹配的通配符密钥。要在各处应用相同的覆盖（例如，无论选择哪个模型，都删除 `SummarizationMiddleware`），请在您使用的每个提供程序密钥下注册配置文件。配置文件用于根据所选模型进行调整。无论型号如何，都应在`createDeepAgent`调用站点上进行全局调整。
</Note>

## 合并语义

|领域 |合并行为 |
| - | - |
| `baseSystemPrompt`、`systemPromptSuffix` |设置后新值获胜；否则继承 |
| `toolDescriptionOverrides` |每个键的映射合并；新价值赢得共享密钥|
| `excludedTools`、`excludedMiddleware` |设置并集 |
| `extraMiddleware` |按名称合并：新实例替换其位置上的现有实例，新条目附加 |
| `generalPurposeSubagent` |按字段合并（未设置的字段继承）|

## 提供商简介

提供程序配置文件（用于控制用于创建模型的设置，例如`temperature`）是仅限 Python 的功能，在 TypeScript SDK 中不可用。

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
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/profiles.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>