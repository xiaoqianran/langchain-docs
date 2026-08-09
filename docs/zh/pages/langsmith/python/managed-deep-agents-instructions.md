<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add instructions to Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-instructions -->

# 向托管深度代理添加指令

在 instructions.md 中定义托管深度代理的系统提示符。

指令定义了代理的行为。它们构成了座席系统提示的核心。您可以在简单的 Markdown 文件中定义它们，代理会自动选取它们。

<Note>
  托管深度代理在 **公共 [beta](/langsmith/release-stages)** 中提供，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

`instructions.md` 文件位于项目根目录：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.py
  instructions.md
```

## 添加说明

创建或修改`instructions.md`：

```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Assistant

You are a helpful assistant.
```

使用此文件定义代理的角色、行为、约束以及使用其工具的指南。

## 代理如何使用指令

每次运行时都会将说明插入到代理系统提示符中。他们始终在场并帮助指导代理的行为。

## 同步到 Context Hub

当您运行 `mda deploy` 部署代理时，指令会自动同步到代理的 [Context Hub](/langsmith/use-the-context-hub) 存储库。然后，您可以在 LangSmith UI 中编辑指令，并将更改自动传播到代理。

## 指令与其他概念的比较将 [skills](/langsmith/python/managed-deep-agents-skills) 用于代理仅在相关时加载的特定于任务的过程。使用 [memory](/langsmith/python/managed-deep-agents-memory) 来获取代理跨线程学习和保留的知识。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-instructions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>