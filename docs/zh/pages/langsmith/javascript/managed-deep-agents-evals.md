<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluate Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-evals -->

# 评估托管Deep Agents

托管 Deep Agents 评估是 [Harbor](https://www.harborframework.com/docs/tasks) 评估。 `evals/tasks/` 是规范的 Harbor 数据集。作者使用 Harbor 的任务格式、环境和验证器完成任务。

`mda evals` 命令不会引入单独的 eval 格式或运行试验。他们打包了 Harbor 的托管代理，并且可以选择将 `evals/scaffold/` 下的最小启动任务转换为 `evals/tasks/` 下的完整任务。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将所有 eval 文件保存在一个顶级 `evals/` 目录下：



```text
my-agent/
├── agent.ts
└── evals/                          # Harbor workspace
    ├── tasks/                      # Canonical Harbor dataset
    │   └── <task>/
    └── scaffold/                   # Optional starter tasks
        └── <task>/
```


可选脚手架与其规范的 Harbor 任务具有单向关系：

```text
evals/scaffold/<task>/ → mda evals compile → evals/tasks/<task>/
```

<Note>
`evals/scaffold/` 不是第二个评估系统。 Harbor 在`evals/tasks/`下运行任务。仅当您希望 Managed Deep Agents 创建最小起点时才使用脚手架。
</Note>

## 选择创作工作流程

使用以下方法之一来填充规范 Harbor 数据集：- **直接创作Harbor任务**：在`evals/tasks/`下创建一个完整的任务并使用Harbor进行管理。当您需要完整的 Harbor 任务格式时，请使用此工作流程。
- **从可选的脚手架开始**：运行`mda evals init <name>`在`evals/scaffold/`下创建一个最小任务，然后使用代理工件和Harbor适配器将其编译为`evals/tasks/`。

## 先决条件

- 使用 `mda init` 创建的托管 Deep Agents 项目，或具有代理条目的现有项目。
- 使用Harbor默认的`docker`环境时，[Docker](https://docs.docker.com/get-docker/)在本地运行。
- 来自 `managed-deepagents` 的 `mda` CLI。请参阅[CLI reference](/langsmith/javascript/managed-deep-agents-cli#install)。
- [Harbor](https://www.harborframework.com/docs) 在您的 `PATH` 或 [⟦T25⟧](https://docs.astral.sh/uv/) 上，这样您就可以运行 `uv run --with harbor …`。
- 在运行 Harbor 的 shell 中导出的模型和工具凭据。

<Note>
Harbor 不会从项目 `.env` 文件加载值。当 Managed Deep Agents 生成 Harbor 作业配置时，它会为符合条件的 `.env` 键写入 `${VAR}` 占位符，而不是它们的值。在运行 Harbor 之前导出所需的变量。
</Note>

## 作者 Harbor 直接评估

当您需要完全控制时，请使用 Harbor 的完整任务格式。一个任务可以定义它的指令、环境、验证器、元数据和其他Harbor配置：

```text
evals/
  tasks/
    my-task/
      instruction.md
      task.toml
      environment/
        Dockerfile
      tests/
        test.sh
```每个任务都描述了代理应该做什么。 Harbor在任务环境中运行代理，然后运行`tests/test.sh`对结果进行评分。评分时，主要路径有：

|路径|目的|
| ---| ---|
| `/app` |代理工作目录和任务输出。 |
| `/tests` |任务验证器文件。 |
| `/logs/verifier/` |验证者奖励输出。 |

验证者必须将数字奖励写入`/logs/verifier/reward.txt`或将数字指标写入`/logs/verifier/reward.json`。有关完整的任务格式和验证器选项，请参阅[Harbor task documentation](https://www.harborframework.com/docs/tasks)。

当 Managed Deep Agents 编译具有其他名称的脚手架时，您直接在 `evals/tasks/` 下创作的文件将被保留。

## 搭建 Harbor 任务

此可选工作流程创建一个最小源任务，托管 Deep Agents 可以完成该任务并将其复制到规范的 Harbor 数据集中。



托管 Deep Agents 通过指令和 TypeScript 测试构建任务。


从托管 Deep Agents 项目根运行以下命令：

```bash
mda evals init smoke
```

任务名称可以包含 ASCII 字母、数字、`_` 和 `-`。使用其他名称运行命令以添加另一个任务。 `mda init` 不会自动创建 eval 任务。

该命令创建以下布局：



```text
evals/
  scaffold/
    smoke/
      instruction.md
      tests/
        answer.test.ts
```启动任务要求代理写入包含`PONG`的`answer.txt`。将指令和测试替换为代表您的应用程序的行为。



```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("answer.txt contains exactly PONG", () => {
  const text = readFileSync("/app/answer.txt", "utf8").trim();
  assert.equal(text, "PONG");
});
```


### 编译脚手架任务

编译`evals/scaffold/`下的每个脚手架：

```bash
mda evals compile .
```

要刷新特定的脚手架，请重复`--task`：

```bash
mda evals compile . --task smoke --task regression
```

对于每个选定的脚手架，托管Deep Agents：

1.替换`evals/tasks/`下的匹配目录。
2. 从`evals/scaffold/`复制完整的脚手架。
3. 当脚手架不提供时，增加`tests/test.sh`。包装器运行语言本机测试并编写 `1` 或 `0` 奖励。

`evals/tasks/` 下未选择的任务将被保留，包括直接作为 Harbor 任务编写的任务。生成的Harbor作业使用`evals/tasks/`下的所有任务作为其数据集。

<Warning>
将`evals/scaffold/<name>/`视为脚手架任务的事实来源。编译该脚手架会替换整个匹配的 `evals/tasks/<name>/` 目录，包括仅对规范副本进行的更改。
</Warning>

您可以将 Harbour 文件（例如 `task.toml`、`environment/` 或自定义 `tests/test.sh`）添加到`evals/scaffold/<name>/` 下的脚手架。 Managed Deep Agents 在编译期间将它们复制到规范的 Harbor 任务中。

### 检查编译后的切换

编译写入或更新Harbor工作区：|路径|内容 |
| ---| ---|
| `evals/artifact/` |已编译的托管代理和工件清单。 |
| `evals/harbor-adapter/` | Harbor 导入用于运行代理的嵌入式 `mda_harbor` 适配器。 |
| `evals/tasks/` | Canonical Harbor 数据集，包括编译的支架和直接编写的任务。 |
| `evals/harbor-job.json` |准备编辑 Harbor 作业配置。 |
| `evals/harbor-jobs/<id>/` |本次编译的本地试验结果。 |

编译支持以下可重复标志：

|旗帜|目的|
| ---| ---|
| `--task <name>` |选择一项任务。重复此操作以选择更多任务。如果选定任务的源位于 `evals/scaffold/` 下，则托管 Deep Agents 会刷新其规范副本。省略该标志以选择所有任务并刷新每个脚手架。 |
| `--model <provider:model>` |在工件清单中记录模型。生成的作业配置使用第一个模型。如果省略，托管 Deep Agents 使用代理的模型（如果可用）。 |

检查您的项目使用的 `evals/` 下的 Harbor 定义和配置。将 `evals/harbor-jobs/` 下的本地运行输出保持在版本控制之外。 `evals/` 目录不包含在已部署的代理版本中。

## 使用 Harbor 进行试验`mda evals compile` 打印为编译后的代理配置的 Harbor 命令。导出编译摘要中列出的变量，然后从项目根目录运行命令：

```bash
export OPENAI_API_KEY="<OPENAI_API_KEY>"

PYTHONPATH=evals/harbor-adapter \
  uv run --with harbor harbor run --config evals/harbor-job.json --yes
```

如果`harbor`已经在您的`PATH`上，则打印的命令直接使用`harbor run`而不是`uv run --with harbor`。

编辑 `evals/harbor-job.json` 以更改任务数据集、模型、环境、并发或尝试。 Harbor 拥有试验编排、环境和报告。有关作业配置和运行选项，请参阅[Harbor documentation](https://www.harborframework.com/docs)。

再次运行相同的命令将恢复配置引用的作业目录。重新编译，或者传递一个新的`--job-name`，开始新的运行。

## 后续步骤

- [CLI reference](/langsmith/javascript/managed-deep-agents-cli)：查看所有 `mda evals` 命令和标志。
- [Deploy an agent](/langsmith/javascript/managed-deep-agents-deploy)：在评估通过后部署代理。
- [Harbor documentation](https://www.harborframework.com/docs)：配置任务、环境、作业和验证者。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-evals.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>