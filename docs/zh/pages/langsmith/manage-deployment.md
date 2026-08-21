<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage a deployment | https://docs.langchain.com/langsmith/manage-deployment -->

# 管理部署

管理云部署的分支和自动更新设置。您还可以在不再需要部署时将其删除。

## 配置部署设置

配置部署设置：

1. 从 **部署** 视图中，选择一个部署。
1. 在右上角，选择齿轮图标（**部署设置**）。
1. 根据需要更新 **Git 分支**。
1. 启用或禁用 **推送到分支时自动更新部署**。

分支和标签创建或删除事件不会触发修订。仅推送到现有分支会触发更新。

当多次推送快速连续发生时，LangSmith 将更新排队。当前构建完成后，LangSmith构建最近的提交并跳过其他排队的提交。

## 删除部署

<Tabs>
  <Tab title="LangSmith UI">
    要删除部署：

    1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-manage-deployment)，选择**部署**。
    1. 选择部署的菜单图标，然后选择“**删除**”。
    1. 在确认模式中，选择**删除**。
  </Tab>
  <Tab title="LangGraph CLI">
    要查找部署 ID，请运行：

    ```shell
    langgraph deploy list
    ```

    按 ID 删除部署：

    ```shell
    langgraph deploy delete <DEPLOYMENT_ID>
    ```

    要跳过确认提示，请传递 `--force`：```shell
    langgraph deploy delete --force <DEPLOYMENT_ID>
    ```
  </Tab>
</Tabs>

<Note>
删除是异步的。部署会立即从 **部署** 视图中消失，但 LangSmith 会分阶段删除其基础架构和元数据。在删除完成之前，部署名称可能仍然不可用。
</Note>

## 另请参阅

- [Create a deployment](/langsmith/deploy-to-cloud)
- [Preview builds](/langsmith/preview-builds)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-deployment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>