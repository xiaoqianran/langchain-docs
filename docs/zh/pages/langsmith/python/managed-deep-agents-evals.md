<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluate Managed Deep Agents | https://docs.langchain.com/langsmith/python/managed-deep-agents-evals -->

# 评估托管Deep Agents

托管 Deep Agents 评估是 [Harbor](https://www.harborframework.com/docs/tasks) 任务。使用具有[⟦T8⟧ skill](https://github.com/langchain-ai/langchain-skills/blob/main/config/skills/eval-engineering/SKILL.md)的编码代理来检查项目，起草任务规范供您审阅，并在`evals/`下编写完整的任务。

Managed Deep Agents 初始化 Harbor 工作区。 Harbor 在隔离环境中针对每个任务运行托管代理并记录结果。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 先决条件

在评估之前，请确保您拥有：

- 使用 `mda init` 创建的托管 Deep Agents 项目，或具有代理条目的现有项目。
- [⟦T11⟧](https://docs.astral.sh/uv/)，运行固定的 Harbor 版本和插件。
- [Docker](https://docs.docker.com/get-docker/)，Harbor 用于任务环境。
- 编码剂。支持特工技能的特工可以直接安装`eval-engineering`。对于其他代理，请在会话中提供技能说明。

## 添加`eval-engineering`技能

[⟦T14⟧ skill](https://github.com/langchain-ai/langchain-skills/blob/main/config/skills/eval-engineering/SKILL.md) 引导编码代理发现代理、提出任务规范并构建经过审查的 Harbor 任务。要将其添加到当前项目，请运行：

```bash
uvx --from npx-skills skills add langchain-ai/langchain-skills --skill eval-engineering --yes
```




您可以使用任何编码剂。

<Tip>
要使用 [Deep Agents Code](/oss/deepagents/code/overview) (`dcode`)，请安装：

```bash
curl -LsSf https://langch.in/dcode | bash
```

请参阅 [Deep Agents Code quickstart](/oss/deepagents/code/quickstart) 了解提供程序设置和交互使用。
</Tip>## 使用编码代理开发评估

<Steps>
  <Step title="Initialize the eval workspace" id="initialize-the-eval-workspace">

从项目根目录运行：

```bash
mda evals init -i
```

交互式切换列出了检测到的编码代理，包括Deep Agents Code、Claude Code、Codex 和 Cursor。选择代理会在项目目录中启动该代理并运行 eval-engineering 提示符。您还可以复制其他代理的提示，或退出并稍后返回。

初始化创建：

```text
my-agent/
├── evals/
│   └── harbor-job.json
└── .mda/
    └── evals/
        ├── runtime.json
        └── harbor-adapter/
```

`evals/harbor-job.json` 是用户拥有的。托管 Deep Agents 仅在丢失时才写入它，因此会保留以后的编辑。生成`.mda/evals/`下的文件。

  </Step>

  <Step title="Start the coding-agent session" id="start-the-coding-agent-session">

切换要求选定的编码代理安装`eval-engineering`技能并将其用于项目。如果您已添加该技能，请继续该会话。

要求编码代理遵循技能的审核流程并使用托管 Deep Agents 任务布局：

```text
Use the eval-engineering skill to develop Harbor evals for this Managed
Deep Agent. Inspect the project and existing evals first. Draft the Task
Spec and wait for my review before implementing the approved task directly
under evals/<task>/.
```

与编码代理一起审查任务规范、任务说明、环境、验证者和可重用的项目知识。在您批准设计后，编码代理将编写可运行的任务。

  </Step>

  <Step title="Review the Harbor task" id="review-the-harbor-task">

包含指令和测试的`evals/`的每个直接子级都是Harbor任务：

```text
evals/
├── harbor-job.json
└── <task>/
    ├── Task.md
    ├── instruction.md
    ├── task.toml
    ├── environment/
    │   └── Dockerfile
    └── tests/
        ├── test.sh
        └── <verifier>
````Task.md` 是经过人工审核的规范。 `instruction.md` 告诉代理要做什么。 Harbor构建任务环境，运行托管代理，然后运行`tests/test.sh`。验证者将数字奖励写入`/logs/verifier/reward.txt`或将数字指标写入`/logs/verifier/reward.json`。

完整的任务格式请参见[Harbor task documentation](https://www.harborframework.com/docs/tasks)。

  </Step>

  <Step title="Run the evals" id="run-the-evals">

编码代理切换包括为项目和当前 shell 配置的命令。从项目根目录运行该命令。

在 macOS 或 Linux 上，它具有以下形式：

```bash
HARBOR_LANGSMITH_DATASET=mda-my-agent-evals \
PYTHONPATH=.mda/evals/harbor-adapter \
uv run --env-file .env --python 3.12 --with 'harbor[langsmith]==0.21.0' harbor run \
  --config evals/harbor-job.json --yes \
  --plugin mda_harbor.job_plugin:MDAJobPlugin \
  --plugin mda_harbor.langsmith_plugin:LangSmithPlugin
```

将 `my-agent` 替换为项目目录名称。生成的命令填写名称并在 Windows 上使用 PowerShell 语法。

编辑代理后重新运行命令会拾取项目更改。

  </Step>

  <Step title="Inspect the results" id="inspect-the-results">

打开Harbor结果：

```bash
uv run --python 3.12 --with 'harbor[langsmith]==0.21.0' \
  harbor view .mda/evals/jobs
```

与您的编码代理一起审查失败的试验。当评估未测量预期行为时更新任务或验证程序。当评估暴露产品故障时更新托管代理，然后再次运行相同的 Harbor 命令。

  </Step>
</Steps>

## 编辑 Harbor 作业

编辑 `evals/harbor-job.json` 以更改数据集、尝试、并发、环境设置或代理环境变量。当您再次运行 `mda evals init` 时，托管 Deep Agents 会保留该文件。

## 记录LangSmith的运行情况当`LANGSMITH_API_KEY`可用时，LangSmith插件将Harbor运行记录在由`HARBOR_LANGSMITH_DATASET`命名的数据集中。

## 另请参阅

- [CLI reference](/langsmith/python/managed-deep-agents-cli)：查看`mda evals init` 和相关标志。
- [Deploy an agent](/langsmith/python/managed-deep-agents-deploy)：在评估通过后部署代理。
- [Deep Agents Code quickstart](/oss/deepagents/code/quickstart)：安装并运行`dcode`。
- [Harbor integrations](/langsmith/harbor-integrations)：在LangSmith记录Harbor工作。
- [Harbor task documentation](https://www.harborframework.com/docs/tasks)：配置任务、环境和验证者。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-evals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>