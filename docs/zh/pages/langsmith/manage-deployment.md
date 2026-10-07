<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage a deployment | https://docs.langchain.com/langsmith/manage-deployment -->

# 管理部署

为 LangSmith 云部署配置存储库、分支和自动更新，或将其删除。

管理云部署的存储库、分支和自动更新设置。您还可以在不再需要部署时将其删除。

## 配置部署设置

配置部署设置：

1. 从 **部署** 视图中，选择一个部署。
2. 在右上角，选择齿轮图标（**部署设置**）。
3. （可选）要从不同的 GitHub 存储库进行构建，请选择 **更改存储库** 并选择存储库。详情请参见[Change the repository](#change-the-repository)。
4. 根据需要更新 **Git 分支**。
5. 启用或禁用**推送到分支时自动更新部署**。

分支和标签创建或删除事件不会触发修订。仅推送到现有分支会触发更新。

当多次推送快速连续发生时，LangSmith 对更新进行排队。当前构建完成后，LangSmith构建最近的提交并跳过其他排队的提交。

### 更改存储库重命名后更改存储库、将其转移到另一个 GitHub 帐户或将代理移动到其他存储库。 LangSmith 检查 `hosted-langserve` GitHub 应用程序是否可以访问存储库，以及存储库是否在其 Git 分支上包含部署的配置文件。保存不会创建修订；下一个修订版本是从新存储库构建的。

如果您将存储库转移到另一个 GitHub 帐户，请先[give the app access to it](/langsmith/deploy-to-cloud#manage-github-repository-access)。

要通过 API 更改存储库，请在 `PATCH /v2/deployments/{deployment_id}` 请求中发送 `source_config.repo_url`。欲了解更多信息，请参阅[Control plane API reference](/langsmith/api-ref-control-plane)。

## 删除部署

<Tabs>
  <Tab title="LangSmith UI">
    要删除部署：

    1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-manage-deployment)，选择**部署**。
    2. 选择部署的菜单图标，然后选择“**删除**”。
    3. 在确认模式中，选择**删除**。
  </Tab>

  <Tab title="LangGraph CLI">
    要查找部署 ID，请运行：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy list
    ```

    按 ID 删除部署：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy delete <DEPLOYMENT_ID>
    ```

    要跳过确认提示，请传递 `--force`：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy delete --force <DEPLOYMENT_ID>
    ```
  </Tab>
</Tabs><Note>
  删除是异步的。部署会立即从 **部署** 视图中消失，但 LangSmith 会分阶段删除其基础架构和元数据。在删除完成之前，部署名称可能仍然不可用。
</Note>

## 另请参阅

* [Create a deployment](/langsmith/deploy-to-cloud)
* [Preview builds](/langsmith/preview-builds)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-deployment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>