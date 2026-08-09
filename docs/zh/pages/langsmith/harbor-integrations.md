<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Harbor integrations | https://docs.langchain.com/langsmith/harbor-integrations -->

# 港口集成

使用 Harbor 在 LangSmith 上运行评估、深度代理和沙箱。

使用 LangSmith 从一个地方运行、跟踪、比较和成本代理评估，以 [Harbor](https://harborframework.com/docs) 作为执行层。 Harbor 是一个用于在沙盒环境中评估和优化代理和语言模型的框架，来自[Terminal-Bench](https://www.tbench.ai) 的创建者。它在独立的容器中运行每个试验，因此您可以同时跨多个环境并行评估和部署。

LangSmith 在三个点上与 Harbor 集成：

* **LangSmith 评估**：将每项 Harbor 作业记录到 LangSmith 作为 `--plugin langsmith` 的实验。
* **Deep Agents**：使用 `--agent langgraph` 作为 Harbor 代理运行 LangGraph 或 Deep Agents 应用程序。
* **沙箱**：使用 `--env langsmith` 在 LangSmith 沙箱上运行每个 Harbor 试验。

本页涵盖了 LangSmith 特定的港口标志。要获得完整的 CLI，请运行 `harbor run --help` 或参阅 [Harbor documentation](https://harborframework.com/docs)。

## 先决条件

* 一个[LangSmith account](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-harbor-integrations) 和一个[API key](/langsmith/create-account-api-key)。
* Python 3.12 或更高版本，带有 `pip`。
* 您的代理调用的模型的提供商 API 密钥，例如 `ANTHROPIC_API_KEY`。

### 安装

使用 `langsmith` 额外安装 Harbor。额外内容包括 LangSmith 插件、环境和代理使用的 `harbor-langsmith` 包：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install "harbor[langsmith]"
```### 验证

Harbor 使用您的 LangSmith 凭据进行身份验证。设置 API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<LANGSMITH_API_KEY>"
```

或者，选择 [LangSmith SDK profile](/langsmith/profile-configuration) 而不是导出密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROFILE=prod
```

## 快速入门

将 Harbor 作业记录到 LangSmith 作为实验：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
harbor run -d "terminal-bench@2.0" \
  --agent <agent> \
  --model <provider:model> \
  --plugin langsmith
```

将 `<agent>` 替换为 Harbor 代理，并将 `<provider:model>` 替换为已安装的 `langchain-*` 提供程序可以解析的 `provider:model` 格式的模型，例如 `anthropic:claude-opus-4-8`。运行 `harbor run --help` 列出可用的代理，或参阅 [Deep Agents](#deep-agents) 了解完整的 `langgraph` 运行。

打开[Datasets & Experiments](/langsmith/manage-datasets)，选择Harbor同步的数据集，例如`terminal-bench@2.0`，然后打开Experiments选项卡查看运行情况。

## 朗史密斯评价

LangSmith 插件将每个 Harbor 作业记录到 LangSmith，因此您可以在数据集和实验下查看和比较结果。该插件适用于任何 Harbor 代理，而不仅仅是 Deep Agent。使用`--plugin langsmith`启用它。 [Quickstart](#quickstart)展示了基本的调用，本节介绍了插件记录的内容以及如何配置它。

选择一个可追踪 LangSmith 的代理，以在实验过程中捕获完整的代理跟踪。如果代理不跟踪 LangSmith，插件仍会创建数据集以及包含结果和反馈的实验，而无需代理跟踪。当您需要消除歧义时，传递完整的导入路径而不是简短的插件名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
harbor run ... --plugin harbor_langsmith:LangSmithPlugin
```

该插件需要`LANGSMITH_API_KEY`。

### 查看插件记录了什么

当作业运行时，插件通过 API 写入 LangSmith：

* **数据集**：从作业同步参考数据集。默认名称来自数据集或任务，例如`terminal-bench@2.0`。每个任务都成为一个示例，其输入是任务名称、指令和任务 ID。
* **实验**：为每个作业创建一个实验，名为 `<name>-<job-id-prefix>`，链接到参考数据集。
* **运行**：为每个试验创建一个根运行，其中包含任务名称、指令、代理和模型的输入，以及环境、代理和验证阶段的子运行。
* **反馈**：为每个验证者奖励密钥附加一个反馈分数，例如`reward`，以及当试验引发异常时的`harbor_error`反馈。
* **输出**：记录每次试运行的`tokens`（`input`、`cache`、`output`）下的令牌计数以及`cost_usd`下的运行成本。

### 查看 LangSmith 的结果在LangSmith中打开[Datasets & Experiments](/langsmith/manage-datasets)，选择插件同步的数据集，例如`terminal-bench@2.0`，然后打开实验选项卡。每个 Harbor 作业都显示为一个实验，您可以通过 `reward` 和 `harbor_error` 反馈、每次运行记录的令牌计数和成本以及延迟来[compare experiments](/langsmith/analyze-an-experiment)。

### 配置插件输入

该插件首先从构造函数关键字参数读取每个输入，然后回退到环境变量。使用环境变量设置输入：

* **`HARBOR_LANGSMITH_DATASET`**：数据集名称。默认为从作业派生的名称。
* **`HARBOR_LANGSMITH_EXPERIMENT`**：实验基地名称。默认为作业名称。
* **`LANGSMITH_ENDPOINT`**：LangSmith API 端点。默认为`https://api.smith.langchain.com`。
* **`LANGSMITH_WORKSPACE_ID`**：目标工作空间。
* **`HARBOR_LANGSMITH_SYNC_DATASET`**：设置为 `false` 以禁用数据集和示例同步。
* **`HARBOR_LANGSMITH_FAIL_FAST`**：设置为 `true` 以引发 LangSmith API 错误，而不是继续作业。

或者在命令行上使用 `--pk` 或在作业配置文件中的 `kwargs:` 下设置与插件 kwargs 相同的输入。 kwargs 镜像构造函数选项：`dataset_name`、`experiment_name`、`endpoint`、`api_key`、`workspace_id`、`sync_dataset` 和 `fail_fast`。

## 深层特工`langgraph`代理运行LangGraph应用程序，例如Deep代理，作为Harbor代理。使用 `--agent langgraph` 选择它。 Harbor 将您的项目暂存到沙箱中，安装其依赖项，并在每次试验的容器内运行图形。

设置您的 LangSmith 和模型凭据，然后运行 ​​Harbor。 `harbor run` 是 `harbor job start` 的别名，它构建作业、启动环境并运行 LangGraph 代理：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROFILE=prod
export LANGSMITH_TRACING=true
export LANGSMITH_PROJECT=harbor-deepagents
export FIREWORKS_API_KEY="<FIREWORKS_API_KEY>"

harbor run \
  -t hello-world/hello-world \
  --agent langgraph \
  --model fireworks:accounts/fireworks/models/glm-5p2 \
  --ak project_path=./deep-agent \
  --ak graph=deep_agent
```

### 选择评估对象

任务是一个具有固定布局的目录：`task.toml`用于配置，`instruction.md`用于提示，`environment/`用于构建沙箱的Dockerfile，`tests/`用于写入奖励的验证者。数据集是许多这样的任务目录。

任务或数据集可以是本地的或远程的：将 Harbor 指向您自己的任务目录文件夹，或者从 Harbor 的注册表中提取一个。

三个输入选择作业运行的任务：* **`-t org/name[@ref]`**：来自注册表的单个任务。远程任务通过注册表查找来获取，然后在固定提交处克隆到`~/.cache/harbor/tasks`。
* **`-d name@version`**：整个基准数据集，其中有很多任务。每个任务都从注册表中解析并克隆到缓存中。
* **`-p <dir>`**：一个任务的本地路径或多个任务的根文件夹。本地路径就地读取，无需下载，也无需缓存副本。

使用 `-i` 和 `-x`（全局包含和排除）过滤所选任务，并使用 `-l` 限制计数。

任务目录具有以下布局：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
hello-world/
├── task.toml         # timeouts, CPU, and memory
├── instruction.md    # the prompt given to the agent
├── environment/
│   └── Dockerfile    # image the sandbox is built from
├── tests/
│   ├── test.sh       # writes the reward to /logs/verifier/reward.txt
│   └── test_state.py # the assertions
└── solution/         # optional, used only by the oracle agent
```

数据集是任务目录的目录：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terminal-bench/
├── hello-world/      # each subdirectory is a full task
├── fix-bug/          # (task.toml + instruction.md + environment/ + tests/)
└── parse-csv/
```

### 配置代理

使用 `--ak` 传递代理 kwargs：* **`--agent langgraph`**：选择 LangGraph 代理。
* **`--model <provider:model>`**：要运行的模型。没有默认值，因此该值是必需的。代理使用 [init\_chat\_model](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model) 解析它，因此它必须可由已安装的 `langchain-*` 提供程序以 `provider:model` 格式解析，例如 `anthropic:claude-opus-4-8`。 `provider/model` 值标准化为 `provider:model`。该模型来自 `configurable['model']` 或 `HARBOR_MODEL` 环境变量，无法解析或缺失的值会引发 `ValueError`。
* **`--ak project_path=<dir>`**：包含`langgraph.json`的本地目录。
* **`--ak graph=<name>`**：运行`langgraph.json`中的哪个图。
* **`--ak config=<file>`**：`project_path`内声明图形的配置文件名。默认为`langgraph.json`。
* **`--ak configurable='{...}'`**：LangGraph 每次运行配置传递到 `config["configurable"]` 并由图形在调用时读取。常用键有`model`、`model_kwargs`、`cwd`。
* **`--ak model_kwargs='{...}'`**：`configurable`中嵌套的`model_kwargs`键的简写，例如`{"temperature": 0, "max_tokens": 8000}`。
* **`--ak dependency_overrides='[...]'`**：代理虚拟环境的 Pip 包。此列表替换了`langgraph.json`中声明的依赖项，它允许您固定或交换版本而无需编辑项目，例如`'["deepagents==0.1.5"]'`。

### 将 langgraph.json 指向代理和依赖项代理从 `project_path` 中的 `langgraph.json` 文件加载图表。该文件声明了图形入口点以及 Harbor 在沙箱虚拟环境中安装的 pip 依赖项：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": [
    "deepagents>=0.6.10,<0.7.0",
    "langchain-anthropic>=1.4.6,<1.5.0",
    "langchain-openai>=1.3.0,<1.4.0"
  ],
  "graphs": {
    "deep_agent": "./agent.py:make_graph",
    "research_agent": "./agent.py:make_research_graph"
  }
}
```

该项目公开了两个图表，使用 `--ak graph` 选择。两者都使用 [create\_deep\_agent](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) 构建深度代理，仅输入不同：

* **`deep_agent`** 解析为 `make_graph`，一个仅使用模型创建的深度代理。
* **`research_agent`** 解析为 `make_research_graph`，具有研究系统提示的同一个深度代理。

每个图将模型从`--model`（从`configurable.model`读取）传递到`create_deep_agent`，从而用`init_chat_model()`解析它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent


def make_graph(config):
    return create_deep_agent(model=config["configurable"]["model"])


def make_research_graph(config):
    return create_deep_agent(
        model=config["configurable"]["model"],
        system_prompt="You are a research assistant.",
    )
```

读取 `configurable.model` 的工厂函数使图模型保持不可知，但当模型应始终运行相同的模型时，您也可以对图中的模型进行硬编码。对于固定模型，将 `langgraph.json` 指向已编译的图而不是工厂：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent

graph = create_deep_agent(model="fireworks:accounts/fireworks/models/glm-5p2")
```

### 在沙箱内运行代理

Harbor 在试用容器内运行整个代理。<Accordion title="Single-trial lifecycle">
  1. **解析和准备**：`harbor run`将标志解析为作业配置。作业工厂解析并缓存任务，验证环境资源限制，并在任何试运行之前解析指标。缓存仅适用于远程任务，因此`-p`本地任务被就地读取。
  2. **扇出**：Harbor 从`n_attempts × tasks × agents` 开始构建试验列表，然后同时运行试验直至`-n` 限制，并重试`-r`。并行性是每次试验的结果，因此不同的任务、代理和尝试一起运行，每个任务、代理和尝试都在自己的沙箱中运行。
  3. **创建Trial**：Trial加载缓存任务，从`project_path`、`graph`、`model`构建LangGraph代理，并在不启动的情况下构建环境。
  4. **启动环境**：环境启动并启动容器。对于 Docker 环境，这会构建或重用映像并运行容器。
  5. **安装代理**：Harbor在容器中创建虚拟环境，上传`project_path`，pip在容器内安装`langgraph.json`依赖。
  6. **运行并验证**：Harbor通过LangGraph runner运行容器内的图，然后运行`tests/test.sh`，将奖励写入`/logs/verifier/reward.txt`。7. **Finalize**：Harbor停止并删除容器并写入试用结果。该作业将所有试验结果聚合为一项作业结果。
</Accordion>

有关构建深度代理的更多信息，请参阅[Deep Agents documentation](/oss/python/deepagents/overview)。

## 沙箱

`langsmith` Harbor 环境在 LangSmith 沙箱上运行每个试验。使用 `--env langsmith` 选择它，以便与其他沙箱提供商一起在 LangSmith 基础设施上执行 Harbor 作业。每个试验都有自己的沙箱，Harbor 在试验结束后将其删除。

### 运行评估

运行 Harbor 作业并使用 `--env langsmith` 选择 LangSmith 环境：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
harbor run -d "<org/name>" \
  --model "<model>" \
  --agent "<agent>" \
  --env langsmith \
  -n "<n-parallel-trials>"
```

Harbor 每次试验都会创建一个 LangSmith 沙箱，并在其中运行代理和验证程序。

### 配置沙箱环境

LangSmith 环境从文件系统快照启动每个沙箱。在您的 Harbor 任务中提供以下内容之一：

* **预建图像**：在`task.toml`中设置`[environment].docker_image`。 Harbor 重用该映像或从该映像创建快照。
* **现有快照**：传递 `environment.kwargs.snapshot_name` 从您已创建的 [snapshot](/langsmith/sandbox-snapshots) 启动。
* **Dockerfile**：包含 `environment/Dockerfile`。 Harbor 使用 [build-from-Dockerfile flow](/langsmith/sandbox-snapshots#build-a-snapshot-from-a-dockerfile) 从中构建快照，并使用任务 `environment/` 目录作为构建上下文。使用环境 kwargs 调整沙箱生命周期，通过 `--ek` 在命令行上传递：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
harbor run -d "<org/name>" \
  --model "<model>" \
  --agent "<agent>" \
  --env langsmith \
  -n "<n-parallel-trials>" \
  --ek idle_ttl_seconds=0 \
  --ek delete_after_stop_seconds=7200
```

* **`idle_ttl_seconds`**：在这么多秒后停止空闲沙箱。设置`0`以禁用空闲超时。
* **`delete_after_stop_seconds`**：在这么多秒后删除停止的沙箱。

## 故障排除

* **作业因身份验证错误而无法启动**：确认`LANGSMITH_API_KEY`已设置，或者`LANGSMITH_PROFILE`指向已配置的配置文件。
* **代理为模型提出`ValueError`**：以`provider:model`格式传递`--model`，并安装匹配的`langchain-*`提供程序包，以便`init_chat_model()`可以解析它。

## 另请参阅

* [Deep Agents documentation](/oss/python/deepagents/overview)
* [Datasets & Experiments](/langsmith/manage-datasets)
* [Analyze an experiment](/langsmith/analyze-an-experiment)
* [Sandbox snapshots](/langsmith/sandbox-snapshots)
* [Harbor documentation](https://harborframework.com/docs)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/harbor-integrations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>