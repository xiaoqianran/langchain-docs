<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an Agent Server | https://docs.langchain.com/langsmith/deploy-to-cloud -->

# 创建代理服务器

通过 LangSmith UI 或 LangGraph CLI 在 LangSmith 云上创建代理服务器。

从连接的 GitHub 存储库或直接从本地项目在 LangSmith 云上创建代理服务器。 LangSmith UI 从 GitHub 部署。 `langgraph deploy` CLI 在本地构建或触发远程构建。

如需更简短的演练，请参阅 [deployment quickstart](/langsmith/deployment-quickstart)。

## 先决条件

* [Plus plan or above](https://www.langchain.com/pricing) 上的LangSmith 帐户。
* 使用 `langgraph dev` 在本地运行的应用程序。欲了解更多信息，请参阅[Local development and testing](/langsmith/local-dev-testing)。

## 创建代理服务器> [标签] LangSmith 用户界面
>
> GitHub 组织所有者或管理员必须为工作区授权 LangChain 的 `hosted-langserve` GitHub 应用程序一次。授权后，任何具有部署权限的用户都可以从应用程序可以访问的存储库创建代理服务器。
>
> 创建代理服务器：
>
> 1. 从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)，选择**代理服务器**。
>
> 2. 在右上角选择**+代理服务器**。
>
> 3. 如果出现 **来源** 选择器，请选择 **GitHub 存储库** 而不是 **Docker 映像**。如果出现提示，请完成 GitHub 授权流程。
>
> 4. 选择一个存储库。
>
> 5. 输入代理服务器的名称。
>
> 6. 在 **Git Ref（分支或标签）** 中，输入分支名称或完整标签引用，例如 `refs/tags/v1.0.0`。
>
> 7. 输入[LangGraph API configuration file](/langsmith/cli#configuration-file)的完整路径，包括文件名。例如，如果文件位于存储库根目录中，请输入 `langgraph.json`。
>
> 8. 对于分支，选择是否启用**推送到分支时自动更新代理服务器**。此选项对标签不可用。您可以稍后在[Agent Server Settings](/langsmith/manage-deployment#configure-deployment-settings)中更改它。
>
> 9. 对于 [Agent Server type](/langsmith/cloud-platform-features#deployment-types)，选择 **Serverless** 或 **Dedicated**，具体取决于工作负载是否可以容忍冷启动或需要始终在线的容量。
>> 10. 选择是否通过[Studio](/langsmith/studio) 共享代理服务器。
>
> 11.添加环境变量和机密。有关更多信息，请参阅[Environment variables](/langsmith/env-var-cloud)。
>
> 12. 选择**提交**。 LangSmith 将代理服务器排队以进行配置。在基于项目的工作区中，LangSmith 还会创建一个与代理服务器同名的跟踪项目。在基于代理的工作区中，LangSmith 将代理服务器绑定到 [agent](/langsmith/agent-registry#agent)，并且代理服务器向代理的 [environments](/langsmith/agent-environments) 之一报告。
>
>> [!注意]
>>
>> 授权`hosted-langserve`应用程序的GitHub用户必须拥有GitHub组织或帐户。其他具有部署权限的用户初次授权后不需要GitHub管理员访问权限。> [选项卡] LangGraph CLI
>
>> [!注意]
>>
>> `langgraph deploy` 命令位于[beta](/langsmith/release-stages) 中。本地构建需要 Docker。在 Apple 芯片上，本地构建还需要 Docker Buildx 来交叉编译 `linux/amd64`。如果 Docker 不可用，CLI 会在 LangSmith 云上触发远程构建。
>
> 创建代理服务器：
>
> 1. 安装[LangGraph CLI](/langsmith/cli)：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>    uv tool install langgraph-cli
>    ```
>
> 2. 将您的 LangSmith API 密钥添加到项目根目录中的 `.env` 文件中：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>    LANGSMITH_API_KEY=lsv2_...
>    ```
>
> 3. 运行：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>    langgraph deploy
>    ```
>
> 该命令创建一个以项目目录命名的 Serverless Agent 服务器。要设置其他名称，或创建专用 [Agent Server](/langsmith/cloud-platform-features#deployment-types)：
>
> ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
>    langgraph deploy --name my-agent --agent-server-type dedicated
>    ```
>
> LangSmith 将代理服务器排队以进行配置。通过LangSmith UI 或[⟦T13⟧ field in ⟦T14⟧](/langsmith/cli#configuration-file) 管理环境变量。

## 管理 GitHub 存储库访问

授权`hosted-langserve` GitHub应用程序后，配置它可以访问哪些存储库：

1. 在 GitHub 中，转到 **设置** > **应用程序**。
2. 找到`hosted-langserve`，然后选择**配置**。
3. 在**存储库访问**下，选择**所有存储库**或**仅选择存储库**。
4. 如果您选择 **仅选择存储库**，请根据需要添加或删除存储库。
5. 选择**保存**。**创建代理服务器**窗格中的存储库列表反映了更新的访问权限。

如果您重命名或转移代理服务器使用的存储库，[change the Agent Server's repository](/langsmith/manage-deployment#change-the-repository)。

## 另请参阅

* [Revisions](/langsmith/deployment-revisions)
* [Preview builds](/langsmith/preview-builds)
* [Manage an Agent Server](/langsmith/manage-deployment)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。