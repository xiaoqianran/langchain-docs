<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fine-tune models with Smithtune | https://docs.langchain.com/langsmith/smithtune -->

# 使用 Smithtune 微调模型

使用 Smithtune 在 LangSmith 对话上微调模型，并比较 LangSmith 中的结果。

<Note>
  Smithtune 位于[beta](/langsmith/release-stages)。
</Note>

Smithtune 是一个命令行工具，用于在LangSmith 中记录的[trajectories](/langsmith/observability-concepts#trajectories) 上微调模型。它使用 [Fireworks](https://fireworks.ai/) 或 [Baseten](https://www.baseten.co/) 训练模型，并在 LangSmith [experiment](/langsmith/evaluation-concepts#experiment) 中比较基础模型和调整后的模型。您可以选择将调整后的模型部署为应用程序的端点。

## Smithtune 的工作原理

<Steps>
  <Step title="Create a dataset">
    使用 [trace query](/langsmith/trace-query-syntax) 过滤器、模型判断器或两者从跟踪项目中选择轨迹。
  </Step>

  <Step title="Prepare data">
    验证轨迹，然后将其分为训练数据、验证数据和测试数据。每条轨迹都保持在一个分割中。
  </Step>

  <Step title="Train a model">
    预览运行，然后与您的提供商一起微调支持的模型。
  </Step>

  <Step title="Compare results">
    根据测试数据评估基础模型和调整模型，然后在 LangSmith 中评估[compare the experiments](/langsmith/compare-experiment-results)。评估不需要已部署的端点。
  </Step>

  <Step title="Deploy an endpoint (optional)">
    为您的应用程序提供调整后的模型。要运行在生产中使用它的代理，请参阅[LangSmith Deployment](/langsmith/deployment)。
  </Step>
</Steps>

<Tip>
  要让您的编码代理端到端地驱动微调过程，请使用 [Smithtune skill](https://github.com/langchain-ai/smithtune/blob/main/src/smithtune/skills/smithtune/SKILL.md)。
</Tip>评估分数衡量每个模型与记录的行为的匹配程度，而不是它是否端到端地完成任务。 Smithtune 不执行模型生成的工具调用。

## 设置 Smithtune

Smithtune 需要跟踪项目中的轨迹或LangSmith 轨迹数据集。您还需要 LangSmith、您的培训提供商和裁判模型的 API 密钥。培训、评估和部署的端点会根据您使用的服务产生费用。

设置 Smithtune：

1. 安装 Smithtune 和 [LangSmith CLI](/langsmith/langsmith-cli)，并设置 API 密钥。按照 [Smithtune README](https://github.com/langchain-ai/smithtune#readme) 获取安装命令和每个提供程序所需的环境变量。

2. 阅读从 [README](https://github.com/langchain-ai/smithtune#readme) 链接的 [data rights and permitted use terms](https://github.com/langchain-ai/smithtune/blob/main/docs/data-rights-and-permitted-use.md)，然后在第一次运行之前确认它们：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   smithtune acknowledge-data-rights
   ```

3. 检查您的本地设置：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   smithtune doctor
   ```

每个步骤的命令请参见[README](https://github.com/langchain-ai/smithtune#readme)或运行`smithtune --help`。

## 另请参阅

* [Trajectory evaluations](/langsmith/trajectory-evals)
* [Query threads](/langsmith/query-threads)
* [Manage datasets](/langsmith/manage-datasets)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithtune.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>