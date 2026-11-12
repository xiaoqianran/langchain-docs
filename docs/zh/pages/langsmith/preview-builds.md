<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Preview builds | https://docs.langchain.com/langsmith/preview-builds -->

# 预览版本

为拉取请求创建临时预览代理服务器，以在合并之前测试代理服务器更改。

预览版本为拉取请求创建临时**预览代理服务器**。在将更改合并到运行父代理服务器的分支之前，请使用预览代理服务器单独测试更改。

当拉取请求触发预览构建时，LangSmith将从源分支构建最新提交作为预览代理服务器的第一个修订。对该分支的每次后续提交都会触发新的修订。

> [!注意]
>
> 预览版本处于公开测试版状态，仅适用于通过 GitHub 集成创建的代理服务器的LangSmith Cloud。

## 启用预览版本

要启用预览版本：1. 从 **代理服务器** 视图中，选择代理服务器。
2. 在右上角，选择齿轮图标（**代理服务器设置**）。
3. 滚动到 **预览版本** 部分。
4. 选择**启用预览版本**。
5. 设置 **Base Branch**，或将其留空以使用代理服务器的 Git 引用。
6. 在 **Create Previews For** 中，选择触发模式：
   * **每个拉取请求**：将请求拉入基础分支触发预览版本，来自分叉的请求除外。
   * **带标签的拉取请求**：拉取请求在具有确切的**触发标签**时会触发预览构建。删除标签会删除预览。
7. 配置预览限制：
   * **空闲超时（小时）**：在此时间段后删除没有拉取请求活动（例如新提交）的预览。将其留空以保留预览，直到拉取请求关闭。此设置适用于新预览。
   * **预览限制**：父代理服务器的预览代理服务器的最大数量。超过限制的拉取请求在另一个请求关闭之前不会收到预览。
8. 选择**保存**。

## 管理秘密预览代理服务器在 LangSmith 创建它时继承父代理服务器的机密。您可以覆盖预览代理服务器上继承的机密。

对父代理服务器机密的更改不会传播到现有预览代理服务器。

## 删除预览代理服务器

当拉取请求关闭、触发器标签被删除或其配置的空闲超时到期时，LangSmith 会删除预览代理服务器。您也可以随时手动删除它。

删除父代理服务器会删除其所有预览代理服务器。

## 另请参阅

* [Deploy on Cloud](/langsmith/deploy-to-cloud)
* [Implement a CI/CD pipeline](/langsmith/cicd-pipeline-example)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时答案。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/preview-builds.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。