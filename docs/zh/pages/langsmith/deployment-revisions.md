<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Revisions | https://docs.langchain.com/langsmith/deployment-revisions -->

# 修订

在 LangSmith 云上创建和管理代理服务器的修订。

修订将应用程序的一个版本部署到LangSmith云上的现有代理服务器。创建修订版以发布代码更改，而无需创建另一个代理服务器。

## 创建修订版

当您 [create an Agent Server](/langsmith/deploy-to-cloud) 时，LangSmith 创建其第一个修订版。使用 LangSmith UI 或 LangGraph CLI 创建后续修订。

> [选项卡] LangSmith 用户界面
>
> 从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deployment-revisions)，选择 **代理服务器**，然后选择一个代理服务器。
>
> 1. 在 **代理服务器** 视图的右上角，选择 **+ 新修订**。
> 2. 在 **New Revision** 模式中，指定 [API configuration file](/langsmith/cli#configuration-file) 的完整路径，包括文件名。例如，如果文件位于存储库根目录中，请输入 `langgraph.json`。
> 3. 选择是否通过[Studio](/langsmith/studio) 共享代理服务器。
> 4. 添加、删除或更新环境变量和机密。现有值已预先填充。有关更多信息，请参阅[Environment variables](/langsmith/env-var-cloud)。
> 5. 选择**提交**。 LangSmith 将修订排队以进行部署。> [选项卡] LangGraph CLI
>
> 从项目目录再次运行 `langgraph deploy`。该命令按名称查找现有代理服务器，并使用最新的代码更改创建修订版：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy
> ```
>
> 要按 ID 定位代理服务器，请运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy --agent-server-id <AGENT_SERVER_ID>
> ```
>
> 要查看代理服务器 ID，请运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> langgraph deploy list
> ```
>
>> [!注意]
>>
>> CLI 更新支持取决于代理服务器的源和构建模式，而不仅仅是其创建位置。推送到托管注册表的本地构建需要 `internal_docker` 源。对于使用您管理的注册表的代理服务器，请使用 `--push-to` 或 `--image-uri`。请参阅[CLI reference](/langsmith/cli#deploy)。

## 中断修订

仅当修订版卡住并阻止您部署另一个修订版时才中断该修订版。

> [!警告]
>
> 中断的修订具有未定义的行为。 LangChain将来可能会删除此功能。

要中断修订：

1. 从 **代理服务器** 视图中，选择代理服务器。
2. 在 **修订版** 表中，选择修订版的菜单图标。
3. 选择**中断**。
4. 查看确认消息，然后选择 **中断修订**。

## 另请参阅

* [Monitor an Agent Server](/langsmith/monitor-deployment)
* [Manage an Agent Server](/langsmith/manage-deployment)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment-revisions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。