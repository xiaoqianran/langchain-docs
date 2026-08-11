<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents project structure | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-project-structure -->

# 托管Deep Agents项目结构

了解托管 Deep Agents 项目中的文件和目录。

托管 Deep Agents 项目具有必需的代理条目和启用托管功能的可选文件。

这是一个常规的 TypeScript 项目。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目布局

```text Project layout theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
├── agent.ts | agent.tsx            # Core agent definition

├── instructions.md                 # Managed context
├── skills/
│   └── <name>/
│       └── SKILL.md

├── tools/                          # Application code
├── middleware/

├── channels/                       # Managed configuration
│   └── <name>.ts
├── connectors/
│   └── mcp.ts
├── schedules/
│   └── <name>.ts
├── sandbox/
│   └── index.ts
├── identity.ts
├── memory.ts

├── package.json                    # Dependencies and secrets
├── .env

└── evals/                          # Harbor workspace
    ├── tasks/                      # Canonical Harbor tasks
    │   └── <task>/
    └── scaffold/                   # Optional task scaffolds
        └── <task>/
```

唯一需要的文件是项目根目录下的`agent.ts` 或`agent.tsx`。它必须导出使用 `defineDeepAgent` 创建的名为 `agent`。

一个项目中仅使用一个代理条目。参见[Agent definition](/langsmith/javascript/managed-deep-agents-agent-definition)。

## MDA 如何处理项目文件* **托管上下文**：`instructions.md`定义系统提示符。 `skills/` 下的每个目录都包含特定于任务的指令。 MDA 将两者同步到 Context Hub。
* **应用程序代码**：`tools/`和`middleware/`下的文件是普通的项目模块。从代理条目导入它们。其他本地模块的工作方式相同。
* **托管配置**：根`identity.ts`和`memory.ts`、`channels/`、`connectors/`和`schedules/`的直接子级以及`sandbox/index.ts`启用其相应的功能。 MCP 连接器模块导出名为 `connector`。
* **依赖关系和秘密**：在`package.json`中声明依赖关系。 MDA 在本地加载 `.env` 并将符合条件的值作为部署机密转发，但从不在构建存档中包含 `.env` 文件。
* **评估**：托管 Deep Agents 评估是 Harbor 评估。 `evals/tasks/` 是规范的 Harbor 任务数据集。直接在那里编写任务，或者运行 `mda evals init <name>` 在 `evals/scaffold/` 下创建一个可选的启动器。 `mda evals compile` 将脚手架复制到`evals/tasks/` 并打包Harbor 的代理。 `evals/` 目录不包含在已部署的代理版本中。

上面的布局显示了常见的 `.ts` 名称。 TypeScript 托管声明还接受受支持的 `.tsx`、`.mts` 或 `.cts` 变体。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-project-structure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>