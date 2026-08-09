<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Memory and Skills | https://docs.langchain.com/oss/deepagents/code/memory-and-skills -->

# 记忆力和技能

持久内存、AGENTS.md 文件以及 Deep Agents 代码的可重用技能，包括创建、发现和调用。

在 Deep Agents Code 中自定义代理有两种主要方法：

* **[Memory](#memory)**：`AGENTS.md` 文件和自动保存的记忆在会话中持续存在。记住一般的编码风格、偏好和习得的约定。

* **[Skills](#skills)**：代理仅在相关时发现和读取的可重用、按需功能。使用针对特定任务上下文的技能，例如工作流程、最佳实践和参考文档。

在实践中，技能和记忆是有一定范围的。有关何时使用每种方法的更多信息，请参阅[Skills, memory, and tools](/oss/python/deepagents/skills#skills-memory-and-tools)。

使用`/remember`明确提示代理从当前对话中更新其记忆和技能。

<Tip>
  使用 SDK 构建自定义代理？请参阅[Memory](/oss/python/deepagents/memory)了解编程内存后端。
</Tip>

## 内存

### 自动记忆

当您使用代理时，它会使用内存优先协议自动将信息存储在 `~/.deepagents/<agent_name>/memories/` 中作为 markdown 文件：1. **研究**：在开始任务之前在内存中搜索相关上下文
2. **响应**：执行过程中不确定时检查内存
3. **学习**：自动保存新信息以供将来使用

代理按主题和描述性文件名组织其记忆：

```
~/.deepagents/backend-dev/memories/
├── api-conventions.md
├── database-schema.md
└── deployment-process.md
```

当您教授代理约定时：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
dcode --agent backend-dev
> Our API uses snake_case and includes created_at/updated_at timestamps
```

它会记住未来的会话：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> Create a /users endpoint
# Applies conventions without prompting
```

### AGENTS.md 文件

[⟦T14⟧ files](https://agents.md/) 提供始终在会话开始时加载的持久上下文：

* **全局**：`~/.deepagents/<agent_name>/AGENTS.md`—加载每个会话。
* **项目**：任何 git 项目根目录中的 `.deepagents/AGENTS.md` — 从该项目内运行 Deep Agents 代码时加载。

这两个文件都会在启动时附加到系统提示符中。

<Tip>
  要生成存储库 wiki 并将指针连接到编码代理的 `AGENTS.md` 和 `CLAUDE.md`，请参阅 [OpenWiki](/oss/openwiki/overview)。
</Tip>

### 记忆是如何运作的

在回答特定于项目的问题或参考过去的工作或模式时，代理还可以读取其内存文件。

当您提供有关代理应如何行为的信息、对其工作的反馈或记住某些内容的指示时，代理会更新`AGENTS.md`。
如果它从你的交互中识别出模式或偏好，它也会更新它的记忆。要在附加内存文件中添加更多结构化项目知识，请将它们添加到`.deepagents/`中并在`AGENTS.md`文件中引用它们。
您必须引用 `AGENTS.md` 文件中的其他文件，代理才能了解它们。
启动时不会读取附加文件，但代理可以在需要时引用并更新它们。

### 何时使用全局与项目 AGENTS.md

使用全局 `AGENTS.md` (`~/.deepagents/agent/AGENTS.md`) 用于：

* 您的个性、风格和通用编码偏好
* 一般语气和沟通风格
* 通用编码首选项（格式、类型提示等）
* 适用于任何地方的工具使用模式
* 工作流程和方法不会因项目而改变

使用项目 `AGENTS.md`（项目根目录中的`.deepagents/AGENTS.md`）用于：

* 项目特定的背景和约定
* 项目架构和设计模式
* 特定于此代码库的编码约定
* 测试策略和部署流程
* 团队指南和项目结构

## 技能技能将工作流程、最佳实践、脚本和参考文档等领域专业知识打包到可重用目录中，代理仅在相关时发现和读取这些目录。
深厚的代理技能遵循[Agent Skills specification](https://agentskills.io/)。有关技能如何发挥作用以及如何编写有效技能的更多信息，请参阅[Skills](/oss/python/deepagents/skills)。

启动时，Deep Agents Code 会从每个 `SKILL.md` 文件的 frontmatter 中读取名称和描述。当任务与技能的描述相匹配时，代理会读取技能文件并遵循其说明。 Discovery 再次在 `/reload` 上运行。

### 添加技能

<Steps>
  <Step title="Create a skill">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # User skill (stored in ~/.deepagents/<agent_name>/skills/)
    dcode skills create test-skill

    # Project skill (stored in .deepagents/skills/)
    dcode skills create test-skill --project
    ```

    这会生成：

    ```plaintext theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    skills/
    └── test-skill
        └── SKILL.md
    ```
  </Step>

  <Step title="Edit SKILL.md">
    打开生成的 `SKILL.md` 并编辑文件以包含您的说明。
  </Step>

  <Step title="Add optional resources">
    （可选）将其他脚本或其他资源添加到 `test-skill` 文件夹。欲了解更多信息，请参阅[Usage](/oss/python/deepagents/skills#add-supporting-resources)。
  </Step>
</Steps>

您还可以将现有技能直接复制到代理的文件夹中：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mkdir -p ~/.deepagents/<agent_name>/skills
cp -r examples/skills/web-research ~/.deepagents/<agent_name>/skills/
```

### 安装社区技能

您可以使用 Vercel 的 [Skills CLI](https://github.com/vercel-labs/skills) 等工具在您的环境中安装社区 [Agent Skills](https://agentskills.io/) 并将其提供给您的深度代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Install a skill globally
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a deepagents -g -y

# List installed skills
npx skills ls -a deepagents -g
```全局将 (`-g`) 符号链接技能安装到 `~/.deepagents/agent/skills/` — 默认代理的用户级技能目录中。项目级安装（省略 `-g`）将技能放置在相对于当前目录的 `.deepagents/skills/` 中，使它们可供该项目中运行的任何代理使用，无论代理名称如何。

<Note>
  全局安装仅针对默认的 `agent` 目录。如果您使用自定义命名的代理，请使用项目级安装或手动将技能符号链接到`~/.deepagents/{your-agent}/skills/`。
</Note>

### 技能发现

启动时从以下目录加载技能：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
~/.deepagents/<agent_name>/skills/
~/.agents/skills/
.deepagents/skills/
.agents/skills/
~/.claude/skills/          (experimental)
.claude/skills/            (experimental)
```

当存在重复的技能名称时，较后优先的目录会覆盖较早的目录（请参阅[App data](/oss/deepagents/code/configuration#skills)）。

对于特定于项目的技能（在`.deepagents/skills/`或`.agents/skills/`下），项目根由包含的`.git`文件夹标识。

### 在会话中调用技能

在交互式会话中，直接使用 `/skill:<name>` 斜杠命令运行技能：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
/skill:code-review
/skill:code-review review the auth module
```

该技能的 `SKILL.md` 指令将与您传递的任何参数一起注入到提示中。

### 启动时要有技巧

`--skill` 标志在启动时立即调用技能，无论是交互（TUI）还是非交互（无头）模式：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Open the TUI and immediately run a skill
dcode --skill code-review

# Pass a request to the skill with -m
dcode --skill code-review -m 'review the auth module'

# Pipe content into a skill
cat diff.txt | dcode --skill code-review

# Pipe content and add a request
cat diff.txt | dcode --skill code-review -m 'focus on security'

# Run a skill headlessly
dcode --skill code-review -n 'review this patch'

# Quiet mode (only agent output on stdout)
dcode --skill code-review -n 'review this patch' -q
```<Note>
  `--skill` 与 `--quiet` 或 `--no-stream` 需要 `-n`（非交互模式）。
</Note>

### 列出技能

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List all user skills
dcode skills list

# List project skills
dcode skills list --project

# Get detailed info about a specific skill
dcode skills info test-skill
dcode skills info test-skill --project
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/memory-and-skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>