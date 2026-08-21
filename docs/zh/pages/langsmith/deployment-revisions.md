<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Revisions | https://docs.langchain.com/langsmith/deployment-revisions -->

# 修订

修订将应用程序的一个版本部署到现有的云部署。创建修订版本以发布代码更改，而无需创建另一个部署。

## 创建修订版

当您[create a deployment](/langsmith/deploy-to-cloud)时，LangSmith创建其第一个修订版。使用 LangSmith UI 或 LangGraph CLI 创建后续修订。

<Tabs>
  <Tab title="LangSmith UI">
    从[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-deployment-revisions)，选择**部署**，然后选择一个部署。

    1. 在 **部署** 视图的右上角，选择 **+ 新修订**。
    1. 在 **New Revision** 模式中，指定 [API configuration file](/langsmith/cli#configuration-file) 的完整路径，包括文件名。例如，如果文件位于存储库根目录中，请输入 `langgraph.json`。
    1. 选择是否通过[Studio](/langsmith/studio)使部署可共享。
    1. 添加、删除或更新环境变量和机密。现有值已预先填充。欲了解更多信息，请参阅[Environment variables](/langsmith/env-var-cloud)。
    1. 选择**提交**。 LangSmith 将修订排队以进行部署。
  </Tab>
  <Tab title="LangGraph CLI">
    从项目目录再次运行 `langgraph deploy`。该命令按名称查找现有部署，并使用最新的代码更改创建修订：

    ```shell
    langgraph deploy
    ```

    要按 ID 定位部署，请运行：

    ```shell
    langgraph deploy --deployment-id <DEPLOYMENT_ID>
    ```

    要查看部署 ID，请运行：

    ```shell
    langgraph deploy list
    ```<Note>
    `langgraph deploy` 只能更新最初使用 `langgraph deploy` 创建的部署。使用 LangSmith UI 更新通过 UI 或 GitHub 集成创建的部署。
    </Note>
  </Tab>
</Tabs>

## 中断修订

仅当修订版卡住并阻止您部署另一个修订版时才中断该修订版。

<Warning>
中断的修订具有未定义的行为。 LangChain 将来可能会删除此功能。
</Warning>

要中断修订：

1. 从 **部署** 视图中，选择一个部署。
1. 在 **修订版** 表中，选择修订版的菜单图标。
1. 选择**中断**。
1. 查看确认消息，然后选择 **中断修订**。

## 另请参阅

- [Monitor a deployment](/langsmith/monitor-deployment)
- [Manage a deployment](/langsmith/manage-deployment)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment-revisions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>