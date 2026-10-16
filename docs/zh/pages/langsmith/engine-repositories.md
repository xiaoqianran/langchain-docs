<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect Engine to your repository | https://docs.langchain.com/langsmith/engine-repositories -->

# 将引擎连接到您的存储库

将代理的代码存储库连接到LangSmith引擎，以便它可以在调查问题时读取您的源代码并以拉取请求的形式提出修复。

连接代理的代码存储库让 [LangSmith Engine](/langsmith/engine) 在调查跟踪时读取您的源代码，并以拉取请求的形式提出修复。对于痕量分析，连接是可选的。有关引擎从源访问中获得的内容及其使用的权限，请参阅[Why connect GitHub](/langsmith/engine#why-connect-github)。

引擎连接到 GitHub 上的存储库：

* **LangSmith 云**：使用 GitHub.com 上的 LangChain 管理的 GitHub 应用程序。从[Connect GitHub repositories](#connect-repositories)开始。
* **自托管 LangSmith**：操作员首先为您的 GitHub 实例完成 [GitHub configuration for self-hosted](/langsmith/engine-self-hosted-github)。然后，工作区用户遵循以下相同的存储库连接步骤。

## GitHub

### 连接存储库

这些步骤适用于 LangSmith 云以及使用已配置的 GitHub 应用程序的自托管部署。

为您的跟踪项目或代理环境启用 [Engine](/langsmith/engine)。您需要获得在该项目中配置 Engine 以及在 LangSmith 工作区中连接 GitHub 集成的权限。如果这些操作不可用，请询问工作区管理员。在 GitHub 上，您需要获得在要连接的存储库上安装应用程序或访问现有安装的权限。您的 GitHub 组织或企业可能需要管理员批准安装。当出现提示时，完成组织的 SSO 登录。

<Note>
  对于企业托管用户，连接组织拥有的存储库。 GitHub 不允许将此应用程序安装在托管用户的个人帐户上。有关 GitHub.com 和 `ghe.com` 上的要求，请参阅[Enterprise Managed Users](/langsmith/engine-self-hosted-github#enterprise-managed-users)。
</Note>

对于修复，存储库必须允许引擎的分支和草案 PR。在测试修复之前查看[Repository policies](#repository-policies)。

要将存储库连接到现有的 Engine 项目：1. 打开跟踪项目或代理环境。在其**引擎**选项卡中，选择**配置引擎**。
2. 在**代码存储库**下，选择**连接 GitHub**。如果您的工作区已经有连接，则会出现存储库选取器。
3. 在 GitHub 中，授权为您的 LangSmith 部署配置的应用程序。将其安装在拥有您的代码的组织或帐户上，并选择它可以访问的存储库。如果该应用程序已安装，LangSmith可能会要求您选择现有安装。
4. 完成所有 GitHub 批准提示并返回LangSmith。授权应用程序和安装应用程序是分开的步骤：授权识别您的 GitHub 帐户；安装授予应用程序对存储库的访问权限。
5. 在存储库选择器中，按帐户或存储库名称搜索，选择存储库，然后单击 **连接存储库**。
6. 对其他存储库重复此操作。每个存储库都可以有自己的分支和子文件夹。

您还可以在首次设置引擎时在**连接代理的代码存储库**下连接存储库。

#### 选择分支和子文件夹

对于每个连接的存储库：* **分支**：选择引擎应读取并用作修复基础的分支。将其留空以使用存储库的默认分支。
* **子文件夹**：可以选择将引擎集中在包含代理的存储库部分。此设置不限制 GitHub 应用程序的存储库访问。

引擎在连接的存储库中创建修复分支，并针对选定的基础分支打开草稿拉取请求。通过通常的 GitHub 流程查看并合并这些拉取请求。引擎不会为您合并它们。

#### 连接另一个组织或帐户

一个 GitHub 应用程序可以在多个组织或帐户中的每一个中安装。这些安装中的存储库可以连接到同一引擎项目。

在存储库选择器中，选择 **安装在另一个 GitHub 组织或存储库上...**。完成 GitHub 流程，返回LangSmith，然后连接其他存储库。在自托管 LangSmith 上，应用程序的 [ownership and visibility](/langsmith/engine-self-hosted-github#choose-who-owns-the-app) 确定 GitHub 提供哪些帐户作为安装目标。在自托管 LangSmith 上，所有连接的存储库必须属于同一个 GitHub 实例。连接到不同的 LangSmith 工作区还需要连接该工作区中的适当安装。

#### 管理存储库访问

在**仅选择存储库**上安装应用程序不会自动包含稍后创建的存储库。在选择器中，选择 **缺少存储库？管理...** 的存储库访问权限或 **管理应用程序访问权限 →**。在 GitHub 中添加存储库，保存安装设置，然后重新加载选择器。

从 Engine 项目中删除存储库会阻止 Engine 将其用于该项目。它不会卸载 GitHub 应用程序或删除其对其他项目的访问权限。管理 GitHub 中的应用程序安装以撤销存储库访问权限。

#### 验证连接

使用具有代表性跟踪的测试存储库和引擎项目。在自托管 LangSmith 上，在此测试期间要求您的运营商[verify webhook delivery](/langsmith/engine-self-hosted-github#verify-webhook-delivery)。

要验证连接：1. 运行引擎分析并确认它可以使用存储库的源代码。
2. 生成问题的修复程序，检查其差异，然后单击 **Open PR**。确认 **查看 PR** 在预期的 GitHub 实例、存储库和基础分支上打开草稿 PR。
3. 审核并合并测试 PR。确认相应的引擎问题已完成。

要自动创建 PR，请在 **代码存储库** 设置中启用 **为每个修复打开草稿拉取请求**。

#### 存储库策略

存储库必须支持草稿 PR 并允许引擎推送修复分支。引擎不使用基于分叉的贡献工作流程。

引擎的 Git 提交未签名。需要在修复分支上进行签名提交的规则可以拒绝推送。分支名称规则、推送限制和 GHES 预接收挂钩也可以拒绝修复。在 LangSmith v0.17 中，修复分支使用 `issues-agent/` 前缀。

查看适用于这些分支机构和应用程序身份的策略。在目标分支上保留正常的审查和合并需求。当一个人合并时，可能仍然需要满足目标分支的要求；配置应用程序不会绕过存储库策略。引擎不会获取 Git LFS 文件内容或初始化 Git 子模块。

#### 存储库选择故障排除

|症状|检查什么 |
| - | - |
| GitHub 未配置，或 GitHub 打开前连接失败 |在自托管 LangSmith 上，请让您的运营商检查 [deployment configuration](/langsmith/engine-self-hosted-github#configure-langsmith)。 |
|您的组织不是安装目标 |确认您的 GitHub 角色、组织审批政策和应用程序的可见性。私人应用程序只能安装在其所属的帐户上。 |
|您的管理用户帐户不是安装目标 |使用组织拥有的存储库。个人托管用户存储库无法使用此集成。 |
| App已安装，但LangSmith无连接 |在 LangSmith 中启动 **连接 GitHub**，包括在管理员批准安装之后或您直接从 GitHub 安装之后。在自托管 LangSmith 上，如果授权未完成，请让您的运营商[check setup](/langsmith/engine-self-hosted-github#troubleshoot-setup)。 |
|缺少安装或存储库 |检查您授权的 GitHub 帐户、应用程序选择的存储库以及安装是否连接到此 LangSmith 工作区。出现提示时完成组织的 SSO 授权。 ||授权成功，但无法读取仓库 |检查应用程序的存储库访问权限。在自托管 LangSmith 上，还请您的运营商检查 [GitHub API and sandbox network access](/langsmith/engine-self-hosted-github#allow-network-access)。浏览器登录不会测试这些连接。 |
|无法推送修复 |检查适用于新修复分支的规则，包括签名提交要求、分支限制和预接收挂钩。参见[Repository policies](#repository-policies)。 |

## 自托管LangSmith

在自托管 LangSmith 上，操作员注册 GitHub 应用程序并配置 LangSmith，然后任何人都可以连接存储库。参见[Configure GitHub for Engine on self-hosted](/langsmith/engine-self-hosted-github)。

## 另请参阅

* [Set up Engine](/langsmith/engine-setup)：为跟踪项目打开引擎并选择其存储库。
* [Why connect GitHub](/langsmith/engine#why-connect-github)：引擎从源访问中获得什么，以及它使用的权限。
* [Configure GitHub for Engine on self-hosted](/langsmith/engine-self-hosted-github)：在自托管LangSmith上注册并配置GitHub应用程序。
* [Engine security](/langsmith/engine-security)：引擎如何处理您的数据和存储库访问。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-repositories.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>