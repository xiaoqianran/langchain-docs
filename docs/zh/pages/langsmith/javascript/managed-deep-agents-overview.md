<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-overview -->

# 托管Deep Agents

托管 Deep Agents 公共测试版功能、工作流程和限制概述。

托管 Deep Agents 允许您将代理定义为文件夹并在托管 LangSmith 基础设施上运行它。您提供业务逻辑，托管Deep Agents提供代理工具和生产基础设施。

## 定义你的代理

代理作为项目文件夹启动，其中包含其行为的业务逻辑：

* **[Instructions](/langsmith/javascript/managed-deep-agents-instructions)**：定义代理的作用及其行为方式的提示。
* **[Tools](/langsmith/javascript/managed-deep-agents-tools)**：代理可以调用​​与其他系统交互或采取操作的函数。
* **[Skills](/langsmith/javascript/managed-deep-agents-skills)**：可重复使用的、特定于任务的指令和资源。

您可以根据需要添加其他功能。完整的文件夹布局请参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 在托管线束上运行

托管Deep Agents结合了三层：

* **您的业务逻辑**：项目文件夹中的说明、工具和技能。
* **代理工具**：久经考验的[Deep Agents harness](/oss/javascript/deepagents/overview)，用于运行代理并连接其业务逻辑。
* **托管基础设施**：LangSmith 为生产和多用户应用程序大规模运行代理的基础设施。这种分离使您可以专注于代理应该做什么，而不是构建和操作系统运行它所需的系统。

## 托管基础设施

自以为是的基础设施由几个部分组成：

* **运行时**：[LangSmith Agent Server](/langsmith/agent-server)以持久、容错的方式运行代理。
* **沙箱**：[LangSmith Sandboxes](/langsmith/sandboxes)让代理在隔离环境中编写和执行不受信任的代码。
* **评估**：托管 Deep Agents 使用 [Harbor tasks](/langsmith/javascript/managed-deep-agents-evals) 测试代理行为。
* **通道**：[channels abstraction](/langsmith/javascript/managed-deep-agents-channels) 将代理连接到其用户工作的平台。
* **记忆**：[Managed memory](/langsmith/javascript/managed-deep-agents-memory) 让代理在交互过程中记住信息。
* **上下文管理**：[LangSmith Context Hub](/langsmith/use-the-context-hub) 管理代理指令和技能。您可以在 LangSmith UI 中更新它们，而无需重新部署代理。

要创建和部署代理，请遵循[Managed Deep Agents quickstart](/langsmith/javascript/managed-deep-agents-quickstart)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>