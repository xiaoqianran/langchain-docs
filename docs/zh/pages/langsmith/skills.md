<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith skills | https://docs.langchain.com/langsmith/skills -->

#LangSmith技能

代理技能是可重复使用的按需功能，捆绑指令和可选的帮助程序脚本。本页总结了面向 LangSmith 的技能，您可以添加到兼容的编码代理中以查询跟踪、生成数据集和定义评估器。要直接从终端使用相同的LangSmith数据，请使用[LangSmith CLI](/langsmith/langsmith-cli)。

<Note>
这些技能遵循代理技能规范并维护在[⟦T5⟧ GitHub repository](https://github.com/langchain-ai/langsmith-skills)中。您可以将 `SKILL.md` 和任何引用的 `scripts/` 复制到代理的技能目录中。下面的安装程序仅安装LangSmith技能（跟踪、数据集、评估器）。
</Note>

## 快速安装

使用 `npx skills` 仅安装 LangSmith 技能（跟踪、数据集、评估器）：

<CodeGroup>
```bash Local (current project)
npx skills add langchain-ai/langsmith-skills --skill '*' --yes
```

```bash Global (all projects)
npx skills add langchain-ai/langsmith-skills --skill '*' --yes --global
```

```bash Link to a specific agent (e.g., Claude Code)
npx skills add langchain-ai/langsmith-skills --agent claude-code --skill '*' --yes --global
```
</CodeGroup>

<Tip>
要更新，请重新运行该命令。如果目标技能文件夹已存在，请先将其删除（例如`rm -rf ~/.claude/skills/langsmith-*`）。
</Tip>

## 配置环境

安装技能后，设置所有LangSmith技能、帮助程序脚本和[LangSmith CLI](/langsmith/langsmith-cli)使用的环境变量：

```bash
export LANGSMITH_API_KEY=<your-key>
# Optional defaults
export LANGSMITH_PROJECT=<default-project>
# Advanced: multi-workspace or certain self-hosted setups only
# export LANGSMITH_WORKSPACE_ID=<workspace-id>
```

## 这些技能涵盖哪些内容- [Traces](/langsmith/observability-concepts#traces)：为应用程序添加跟踪；列出、过滤、检查和导出跟踪以进行调试和分析。
- [Datasets](/langsmith/evaluation-concepts#datasets)：将轨迹转换为评估数据集（final_response、single_step、轨迹、RAG）并可选择上传到LangSmith。
- [Evaluators](/langsmith/evaluation-concepts#evaluators)：定义代码或 LLM 作为评审评估器，并将其附加到数据集（离线）或项目（在线）。

每个技能目录都附带一个 `SKILL.md` 以及您可以运行或调整的可选 `scripts/` 帮助程序。这些技能旨在插入兼容的编码代理（例如 Claude Code 或 Deep Agents Code），但如果您不想连接完整的代理，也可以直接重用帮助程序脚本。对于更繁重的查询、导出或自动化，您可以将这些技能与 [LangSmith CLI](/langsmith/langsmith-cli) 配对，以便从终端针对相同的项目、数据集和评估器编写脚本。

## 手动安装

克隆存储库并运行安装脚本以获取更多选项：

```bash
git clone https://github.com/langchain-ai/langsmith-skills.git
cd langsmith-skills

# Install for Claude Code in current directory (default)
./install.sh

# Install for Claude Code globally
./install.sh --global

# Install for Deep Agents Code in current directory
./install.sh --deepagents

# Install for Deep Agents Code globally (includes agent persona)
./install.sh --deepagents --global

# Install only LangSmith skills (any target)
./install.sh --langsmith
```

如果您只想复制特定技能，请将所需目录从 `config/skills/` 复制到代理的技能文件夹中。

包含LangSmith技能：
- langsmith-trace — 跟踪（查询/导出）
- langsmith-dataset — 数据集（生成/上传）
- langsmith-evaluator — 评估器（创建/附加）

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/skills.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>