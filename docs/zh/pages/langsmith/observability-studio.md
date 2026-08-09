<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Observability in Studio | https://docs.langchain.com/langsmith/observability-studio -->

# Studio 中的可观察性

LangSmith [Studio](/langsmith/studio) 提供了检查、调试和改进应用程序执行之外的工具。通过使用跟踪、数据集和提示，您可以详细了解应用程序的行为方式、衡量其性能并优化其输出：

* [Iterate on prompts](#iterate-on-prompts)：直接或通过 Playground 修改图形节点内的提示。
* [Run experiments over a dataset](#run-experiments-over-a-dataset)：在 LangSmith 数据集上执行助手以评分和比较结果。
* [Debug LangSmith traces](#debug-langsmith-traces)：将跟踪的运行导入 Studio 并可选择将它们克隆到本地代理中。
* [Add a node to a dataset](#add-node-to-dataset)：将部分线程历史记录转换为数据集示例以进行评估或进一步分析。

## 迭代提示

Studio 支持以下修改图表中提示的方法：

* [Direct node editing](#direct-node-editing)
* [Playground interface](#playground)

### 直接节点编辑

Studio 允许您直接从图形界面编辑各个节点内使用的提示。

### 图形配置

使用 `langgraph_nodes` 和 `langgraph_type` 键定义 [configuration](/oss/python/langgraph/use-graph-api#add-runtime-configuration) 以指定提示字段及其关联节点。

#### `langgraph_nodes`* **描述**：指定配置字段与图表的哪些节点关联。
* **值类型**：字符串数组，其中每个字符串是图中节点的名称。
* **使用上下文**：包含在 Pydantic 模型的 `json_schema_extra` 字典中或数据类的 `metadata["json_schema_extra"]` 字典中。
* **示例**：
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  system_prompt: str = Field(
      default="You are a helpful AI assistant.",
      json_schema_extra={"langgraph_nodes": ["call_model", "other_node"]},
  )
  ```

#### `langgraph_type`

* **描述**：指定配置字段的类型，这决定了它在 UI 中的处理方式。
* **值类型**：字符串
* **支持的值**：
  * `"prompt"`：表示该字段包含提示文本，应在 UI 中进行特殊处理。
* **使用上下文**：包含在 Pydantic 模型的 `json_schema_extra` 字典中或数据类的 `metadata["json_schema_extra"]` 字典中。
* **示例**：
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  system_prompt: str = Field(
      default="You are a helpful AI assistant.",
      json_schema_extra={
          "langgraph_nodes": ["call_model"],
          "langgraph_type": "prompt",
      },
  )
  ```

<Accordion title="Full example configuration">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  ## Using Pydantic
  from pydantic import BaseModel, Field
  from typing import Annotated, Literal

  class Configuration(BaseModel):
      """The configuration for the agent."""

      system_prompt: str = Field(
          default="You are a helpful AI assistant.",
          description="The system prompt to use for the agent's interactions. "
          "This prompt sets the context and behavior for the agent.",
          json_schema_extra={
              "langgraph_nodes": ["call_model"],
              "langgraph_type": "prompt",
          },
      )

      model: Annotated[
          Literal[
              "anthropic/claude-sonnet-4-6",
              "anthropic/claude-haiku-4-5-20251001",
              "openai/o1",
              "openai/gpt-5.4-mini",
              "openai/o1-mini",
              "openai/o3-mini",
          ],
          {"__template_metadata__": {"kind": "llm"}},
      ] = Field(
          default="openai/gpt-5.4-mini",
          description="The name of the language model to use for the agent's main interactions. "
          "Should be in the form: provider/model-name.",
          json_schema_extra={"langgraph_nodes": ["call_model"]},
      )

  ## Using Dataclasses
  from dataclasses import dataclass, field

  @dataclass(kw_only=True)
  class Configuration:
      """The configuration for the agent."""

      system_prompt: str = field(
          default="You are a helpful AI assistant.",
          metadata={
              "description": "The system prompt to use for the agent's interactions. "
              "This prompt sets the context and behavior for the agent.",
              "json_schema_extra": {"langgraph_nodes": ["call_model"]},
          },
      )

      model: Annotated[str, {"__template_metadata__": {"kind": "llm"}}] = field(
          default="anthropic/claude-sonnet-4-6",
          metadata={
              "description": "The name of the language model to use for the agent's main interactions. "
              "Should be in the form: provider/model-name.",
              "json_schema_extra": {"langgraph_nodes": ["call_model"]},
          },
      )

  ```
</Accordion>

#### 在 UI 中编辑提示

1. 找到具有关联配置字段的节点上的齿轮图标。
2. 单击 打开配置模式。
3. 编辑值。
4. 保存以更新当前助手版本或创建新版本。

### 游乐场

[Playground](/langsmith/create-a-prompt) 接口允许测试单个 LLM 调用，而无需运行完整图表：1. 选择一个线程。
2. 单击节点上的“**查看 LLM 运行**”。这列出了节点内进行的所有 LLM 调用（如果有）。
3. 选择要在 Playground 中打开的 LLM 运行。
4. 修改提示并测试不同的模型和工具设置。
5. 将更新的提示复制回您的图表。

## 在数据集上运行实验

Studio 允许您通过针对预定义的 LangSmith [dataset](/langsmith/evaluation-concepts#datasets) 执行助手来运行 [evaluations](/langsmith/evaluation-concepts)。这使您可以测试各种输入的性能，将输出与参考答案进行比较，并使用配置的[evaluators](/langsmith/evaluation-concepts#evaluators)对结果进行评分。

本指南向您展示如何直接从 Studio 运行完整的端到端实验。

### 先决条件

在运行实验之前，请确保您具备以下条件：* **LangSmith 数据集**：您的数据集应包含您想要测试的输入，以及可选的用于比较的参考输出。输入架构必须与助手所需的输入架构相匹配。有关模式的更多信息，请参阅[graph API schema documentation](/oss/python/langgraph/graph-api#schema)。有关创建数据集的更多信息，请参阅[How to Manage Datasets](/langsmith/manage-datasets-in-application#create-a-dataset-and-add-examples)。
* **（可选）评估器**：您可以将评估器（例如，LLM-as-a-Judge、启发式或自定义函数）附加到 LangSmith 中的数据集。这些将在图表处理完所有输入后自动运行。
* **正在运行的应用程序**：可以针对以下对象运行实验：
  * 部署在[LangSmith](/langsmith/deployment)上的应用程序。
  * 通过[langgraph-cli](/langsmith/local-dev-testing)启动本地运行的应用程序。

<Note>
  工作室实验遵循与其他实验相同的 [data retention](/langsmith/usage-and-billing#data-retention) 规则。默认情况下，跟踪具有基本层保留期（14 天）。但是，如果添加反馈，跟踪将自动升级到延长层保留（400 天）。可以通过以下两种方式之一添加反馈：

  * [dataset has evaluators configured](/langsmith/bind-evaluator-to-dataset)。
  * [Feedback](/langsmith/observability-concepts#feedback) 手动添加到轨迹中。

  这种自动升级会增加跟踪的保留期和成本。更多详情请参考[Data retention auto-upgrades](/langsmith/usage-and-billing#how-it-works)。
</Note>

### 实验设置1. 启动实验。单击 Studio 页面右上角的 **运行实验** 按钮。
2. 选择您的数据集。在出现的模式中，选择要用于实验的数据集（或特定的数据集拆分），然后单击 **开始**。
3. 监控进度。现在，数据集中的所有输入都将针对活动助手运行。通过右上角的徽章监控实验进度。
4. 当实验在后台运行时，您可以继续在 Studio 中工作。随时单击箭头图标按钮即可导航至 LangSmith 并查看详细的实验结果。

## 调试 LangSmith 跟踪

本指南介绍了如何在 Studio 中打开 LangSmith 跟踪以进行交互式调查和调试。

### 打开已部署的线程

1. 打开 LangSmith 跟踪，选择根运行。
2. 单击**在 Studio 中运行**。

这将打开连接到关联部署的 Studio，并选择跟踪的父线程。

### 使用远程跟踪测试本地代理本节介绍如何根据 LangSmith 的远程跟踪测试本地代理。这使您能够使用生产跟踪作为本地测试的输入，从而允许您在开发环境中调试和验证代理修改。

#### 先决条件

* LangSmith 跟踪线程
* A [locally running agent](/langsmith/local-dev-testing)。

<Info>
  **当地代理要求**

  * 语言图>=0.3.18
  * langgraph-api>=0.0.32
  * 包含远程跟踪中存在的同一组节点
</Info>

#### 克隆线程

1. 打开 LangSmith 跟踪，选择根运行。
2. 单击“**在 Studio 中运行**”旁边的下拉菜单。
3. 输入您本地代理的 URL。
4. 选择**本地克隆线程**。
5. 如果存在多个图表，请选择目标图表。

将在本地代理中创建一个新线程，并使用从远程线程推断和复制的线程历史记录，并且您将导航到本地运行的应用程序的 Studio。

## 将节点添加到数据集

从线程日志中的节点将[examples](/langsmith/evaluation-concepts#examples)添加到[LangSmith datasets](/langsmith/manage-datasets)。这对于评估代理的各个步骤很有用。1. 选择一个线程。
2. 单击“**添加到数据集**”。
3. 选择要添加到数据集的输入/输出的节点。
4. 对于每个选定的节点，选择要在其中创建示例的目标数据集。默认情况下，将选择特定助手和节点的数据集。如果此数据集尚不存在，则会创建它。
5. 在将示例添加到数据集之前，根据需要编辑示例的输入/输出。
6. 选择页面底部的**添加到数据集**，将所有选定的节点添加到各自的数据集。

更多详情请参考[How to evaluate an application's intermediate steps](/langsmith/evaluate-on-intermediate-steps)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>