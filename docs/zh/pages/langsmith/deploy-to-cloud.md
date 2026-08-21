<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a deployment | https://docs.langchain.com/langsmith/deploy-to-cloud -->

# 创建部署

从连接的 GitHub 存储库或直接从本地项目创建云部署。 LangSmith UI 从 GitHub 部署，而 `langgraph deploy` CLI 从本地计算机构建和推送。

<Callout icon="bolt" color="#4F46E5" iconType="regular">
如需更简短的演练，请参阅 [deployment quickstart](/langsmith/deployment-quickstart)。
</Callout>

## 先决条件

- [Plus plan or above](https://www.langchain.com/pricing) 上的LangSmith 帐户。
- 使用 `langgraph dev` 在本地运行的应用程序。欲了解更多信息，请参阅[Local development and testing](/langsmith/local-dev-testing)。

## 创建部署

<Tabs>
  <Tab title="LangSmith UI">
    GitHub 组织所有者或管理员必须为工作区授权 LangChain 的 `hosted-langserve` GitHub 应用程序一次。授权后，任何具有部署权限的用户都可以从应用程序可以访问的存储库创建部署。

    创建部署：1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-deploy-to-cloud)，选择**部署**。
    1. 在右上角，选择“**+ 新建部署**”。
    1. 选择 **从 GitHub 导入**，然后根据提示完成 GitHub 授权流程。
    1. 选择一个存储库。
    1. 输入部署名称。
    1. 选择要部署的 **Git 分支**。
    1. 输入[LangGraph API configuration file](/langsmith/cli#configuration-file)的完整路径，包括文件名。例如，如果文件位于存储库根目录中，请输入 `langgraph.json`。
    1. 选择是否启用**推送到分支时自动更新部署**。您可以稍后在 [Deployment Settings](/langsmith/manage-deployment#configure-deployment-settings) 中更改此选项。
    1. 选择部署类型：
       - **无服务器**：非常适合后台、开发、测试和预览工作负载。请参阅 [Serverless deployments](/langsmith/cloud-platform-features#serverless) 了解缩放至零的可用性。
       - **专用**：为生产工作负载提供始终在线的基础设施、高可用性和自动数据库备份。
    1. 选择是否通过[Studio](/langsmith/studio)共享部署。
    1.添加环境变量和secret。欲了解更多信息，请参阅[Environment variables](/langsmith/env-var-cloud)。
    1. 选择**提交**。 LangSmith 将部署排队进行配置，并创建一个同名的跟踪项目。<Note>
    授权`hosted-langserve`应用程序的GitHub用户必须拥有GitHub组织或帐户。其他具有部署权限的用户初次授权后不需要GitHub管理员访问权限。
    </Note>
  </Tab>
  <Tab title="LangGraph CLI">
    <Note>
    `langgraph deploy` 命令位于[beta](/langsmith/release-stages) 中。它需要 Docker。在 Apple 芯片上，它还需要 Docker Buildx 来交叉编译`linux/amd64`。
    </Note>

    创建部署：

    1. 安装[LangGraph CLI](/langsmith/cli)：

       ```shell
       uv tool install langgraph-cli
       ```

    1. 将您的 LangSmith API 密钥添加到项目根目录中的 `.env` 文件中：

       ```shell
       LANGSMITH_API_KEY=lsv2_...
       ```

    1. 运行：

       ```shell
       langgraph deploy
       ```

       该命令创建一个以项目目录命名的无服务器部署。要设置其他名称或部署类型，请传递相应的选项：

       ```shell
       langgraph deploy --name my-agent --deployment-type dedicated
       ```

       <Note>
       之前定价的组织在 2026 年 10 月 1 日之前使用`--deployment-type prod` 或 `--deployment-type dev`。有关详细信息，请参阅[⟦T14⟧](/langsmith/cli#deploy) 和 [Manage billing](/langsmith/billing#langsmith-deployment-billing)。
       </Note>

    LangSmith 将部署排队以进行配置。通过LangSmith UI 或[⟦T15⟧ field in ⟦T16⟧](/langsmith/cli#configuration-file) 管理环境变量。
  </Tab>
</Tabs>

## 管理 GitHub 存储库访问

授权`hosted-langserve` GitHub 应用程序后，配置它可以访问哪些存储库：1. 在 GitHub 中，转到 **设置** > **应用程序**。
1. 找到`hosted-langserve`，然后选择**配置**。
1. 在 **存储库访问** 下，选择 **所有存储库** 或 **仅选择存储库**。
1. 如果您选择 **仅选择存储库**，请根据需要添加或删除存储库。
1. 选择**保存**。

**创建新部署**面板中的存储库列表反映了更新的访问权限。

## 另请参阅

- [Revisions](/langsmith/deployment-revisions)
- [Preview builds](/langsmith/preview-builds)
- [Manage a deployment](/langsmith/manage-deployment)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>