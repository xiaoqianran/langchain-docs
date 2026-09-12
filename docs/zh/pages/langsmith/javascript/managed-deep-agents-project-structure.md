<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents project structure | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-project-structure -->

# 托管Deep Agents项目结构

托管 Deep Agents 项目是一个普通的 TypeScript 包，具有一个必需的根代理条目。其他路径要么是您导入的普通模块，要么是 MDA 发现的用于启用托管功能的文件和目录。


<Note>
托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目布局

```text Project layout
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

├── package.json                    # Dependencies
├── .env                            # Local and deploy secrets

└── evals/                          # Harbor workspace
    ├── harbor-job.json
    └── <task>/                     # Harbor task
        ├── Task.md
        ├── instruction.md
        ├── environment/
        └── tests/
```



唯一需要的文件是项目根目录中的 `agent.ts` 或 `agent.tsx`，其中包含 [agent definition](/langsmith/javascript/managed-deep-agents-agent-definition) 作为命名的 `agent`。它必须导出使用 `defineDeepAgent` 创建的名为 `agent`。一个项目中仅使用一个代理条目。

上面的布局显示了常见的 `.ts` 名称。 TypeScript 托管声明还接受受支持的 `.tsx`、`.mts` 或 `.cts` 变体。


## MDA 如何处理项目文件- **托管上下文**：[⟦T10⟧](/langsmith/javascript/managed-deep-agents-instructions)定义系统提示符。 [⟦T11⟧](/langsmith/javascript/managed-deep-agents-skills) 下的每个目录都包含特定于任务的指令，例如 `SKILL.md` 和任何支持文件。 MDA 将 `instructions.md` 和 `skills/` 同步到 Context Hub。
- **应用程序代码**：[⟦T15⟧](/langsmith/javascript/managed-deep-agents-tools)和[⟦T16⟧](/langsmith/javascript/managed-deep-agents-middleware)下的文件是普通的项目模块。从代理条目导入它们。
- **托管配置**：某些路径在存在时启用功能。对于`channels/`、`connectors/`和`schedules/`，只有直接子级是托管声明；嵌套模块不是。

    |路径|启用|
    | --- | --- |
    | `identity.ts` | [Caller authentication](/langsmith/javascript/managed-deep-agents-identity) |
    | `memory.ts` | [Durable memory](/langsmith/javascript/managed-deep-agents-memory) |
    | `channels/<name>.ts` | [Messaging channels](/langsmith/javascript/managed-deep-agents-channels) |
    | `connectors/<name>.ts` | [MCP connectors](/langsmith/javascript/managed-deep-agents-mcp-connectors) |
    | `schedules/<name>.ts` | [Cron schedules](/langsmith/javascript/managed-deep-agents-schedules) |
    | `sandbox/index.ts` | [Sandbox filesystem and shell](/langsmith/javascript/managed-deep-agents-sandboxes) |

    MCP 连接器模块导出名为 `connector`。

- **依赖关系和秘密**：在`package.json`中声明依赖关系。 MDA 在本地加载 `.env` 并将非保留值作为部署机密转发。保留的平台变量和`.env`文件不包含在构建存档中。欲了解更多信息，请参阅[Deploy a Managed Deep Agent](/langsmith/javascript/managed-deep-agents-deploy)。
- **评估**：托管 Deep Agents [evals](/langsmith/javascript/managed-deep-agents-evals) 是 Harbor 评估。运行 `mda evals init -i` 并使用编码代理和 `eval-engineering` 技能开发任务。生成的运行时文件保留在 `.mda/evals/` 下，并且不包含在已部署的代理版本中。## 后续步骤

<CardGroup cols={2}>
  <Card title="Quickstart" icon="rocket" href="/langsmith/javascript/managed-deep-agents-quickstart">
    使用 `mda` CLI 创建并部署您的第一个托管深度代理。
  </Card>
  <Card title="Tutorial" icon="book" href="/langsmith/javascript/managed-deep-agents-tutorial">
    为快速入门研究助手添加持久记忆和每日日程安排。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-project-structure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>