<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Preview builds | https://docs.langchain.com/langsmith/preview-builds -->

# 预览版本

预览版本为拉取请求创建临时**预览部署**。在将代理服务器更改合并到运行父部署的分支之前，请使用预览部署单独测试代理服务器更改。

当拉取请求触发预览构建时，LangSmith 会构建来自源分支的最新提交作为预览部署的第一个修订版。对该分支的每次后续提交都会触发新的修订。

<Note>
预览版本处于公开测试版状态，仅在 LangSmith Cloud 上可用于通过 GitHub 集成创建的部署。
</Note>

## 启用预览版本

要启用预览版本：1. 从 **部署** 视图中，选择一个部署。
1. 在右上角，选择齿轮图标（**部署设置**）。
1. 滚动到 **预览版本** 部分。
1. 选择 **启用预览版本**。
1. 选择触发方式：
   - **每个 PR**：针对部署分支的任何拉取请求都会触发预览构建。
   - **仅标签**：拉取请求仅在具有配置的标签时才会触发预览构建。
1. 配置预览限制：
   - **空闲 TTL**：预览部署在最新修订后在 LangSmith 删除之前可以保持不活动状态的时间。
   - **最大并发预览数**：父部署可以同时运行的预览部署的最大数量。
1. 选择**保存**。

## 管理秘密

当 LangSmith 创建预览部署时，预览部署会继承父部署的机密。您可以覆盖预览部署中继承的机密。

对父部署机密的更改不会传播到现有预览部署。

## 删除预览部署

LangSmith 在预览部署的空闲 TTL 到期时删除该部署。您也可以随时手动删除它。删除父部署会删除其所有预览部署。

## 另请参阅

- [Deploy on Cloud](/langsmith/deploy-to-cloud)
- [Implement a CI/CD pipeline](/langsmith/cicd-pipeline-example)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/preview-builds.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>