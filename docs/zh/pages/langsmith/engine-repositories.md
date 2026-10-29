<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect Engine to your repository | https://docs.langchain.com/langsmith/engine-repositories -->

# 将引擎连接到您的存储库

将代理的 GitHub 存储库或 GitLab 项目连接到 LangSmith 引擎，以便它可以在调查问题时读取您的源代码，并以拉取或合并请求的形式提出修复建议。

连接代理的代码存储库可让 [LangSmith Engine](/langsmith/engine) 在调查跟踪时读取您的源代码，并以 GitHub 上的拉取请求或 GitLab 上的合并请求的形式提出修复建议。对于痕量分析，连接是可选的。有关引擎从源访问中获得的内容及其使用的权限，请参阅[Why connect a repository](/langsmith/engine#why-connect-a-repository)。

引擎连接到 GitHub 上的存储库和 GitLab 上的项目。引擎可以将两者用于相同的代理环境。

对于 GitHub：

* **LangSmith 云**：使用 GitHub.com 上的 LangChain 管理的 GitHub 应用程序。从[Connect GitHub repositories](#connect-repositories)开始。
* **自托管 LangSmith**：操作员首先为您的 GitHub 实例完成 [GitHub configuration for self-hosted](/langsmith/engine-self-hosted-github)。然后，工作区用户遵循以下相同的存储库连接步骤。
* **BYOC**：组织管理员首先注册 GitHub 应用程序并将其保存在 LangSmith UI 中。参见[Configure the App on BYOC](/langsmith/engine-self-hosted-github#configure-the-app-on-byoc)。然后，工作区用户遵循以下相同的存储库连接步骤。对于 GitLab，工作区管理员在工作区设置中连接 GitLab 帐户的访问令牌。 GitLab 仅在 LangSmith 云上可用。从[Connect GitLab](#connect-gitlab)开始。

## GitHub

### 连接存储库

这些步骤适用于 [LangSmith Cloud](/langsmith/cloud)、以及使用已配置的 GitHub 应用程序的 [self-hosted](/langsmith/self-hosted) 和 [BYOC](/langsmith/byoc) 部署。

为您的跟踪项目或代理环境启用 [Engine](/langsmith/engine)。您需要获得在该项目中配置 Engine 以及连接 LangSmith 工作区中的 GitHub 集成的权限。如果这些操作不可用，请询问工作区管理员。

在 GitHub 上，您需要获得在要连接的存储库上安装应用程序或访问现有安装的权限。您的 GitHub 组织或企业可能需要管理员批准安装。当出现提示时，完成组织的 SSO 登录。

> [!注意]
>
> 对于企业托管用户，连接组织拥有的存储库。 GitHub 不允许将此应用程序安装在托管用户的个人帐户上。请参阅 [Enterprise Managed Users](/langsmith/engine-self-hosted-github#enterprise-managed-users) 了解 GitHub.com 和 `ghe.com` 的要求。

对于修复，存储库必须允许引擎的分支和 PR。在测试修复之前查看[Repository policies](#repository-policies)。

连接 GitHub 存储库：1. 打开跟踪项目或代理环境。在其**引擎**页面上，选择**配置引擎**。
2. 在**代码存储库**下，选择**连接 GitHub**。如果您的工作区已经有连接，则会出现存储库选择器。
3. 在 GitHub 中，授权为您的 LangSmith 部署配置的应用程序。将其安装在拥有您的代码的组织或帐户上，并选择它可以访问的存储库。如果该应用程序已安装，LangSmith可能会要求您选择现有安装。
4. 完成所有 GitHub 批准提示并返回LangSmith。授权应用程序和安装应用程序是分开的步骤：授权识别您的 GitHub 帐户；安装授予应用程序对存储库的访问权限。
5. 在存储库选择器中，按帐户或存储库名称搜索，选择存储库，然后单击 **连接存储库**。
6. 对其他存储库重复此操作。每个存储库都可以有自己的分支和子文件夹。

您还可以在首次设置引擎时在**连接代理的代码存储库**下连接存储库。

#### 选择分支和子文件夹

对于每个连接的存储库：* **分支**：选择引擎应读取并用作修复基础的分支。将其留空以使用存储库的默认分支。
* **子文件夹**：可以选择将引擎集中在包含代理的存储库部分。此设置不限制 GitHub 应用程序的存储库访问。

引擎在连接的存储库中创建修复分支，并针对选定的基本分支打开拉取请求。在 LangSmith v0.17 中，拉取请求作为草稿打开。通过通常的 GitHub 流程查看并合并这些拉取请求。引擎不会为您合并它们。

#### 连接另一个组织或帐户

一个 GitHub 应用程序可以在多个组织或帐户中的每一个中安装。这些安装中的存储库可以在同一代理环境中连接。

在存储库选择器中，选择 **安装在另一个 GitHub 组织或存储库上...**。完成 GitHub 流程，返回LangSmith，然后连接其他存储库。在自托管 LangSmith 上，应用程序的 [ownership and visibility](/langsmith/engine-self-hosted-github#choose-who-owns-the-app) 确定 GitHub 提供哪些帐户作为安装目标。在自托管 LangSmith 上，所有连接的存储库必须属于同一个 GitHub 实例。连接到不同的 LangSmith 工作区还需要连接该工作区中的适当安装。

#### 管理存储库访问

在**仅选择存储库**上安装应用程序不会自动包含稍后创建的存储库。在选择器中，选择 **缺少存储库？管理...** 的存储库访问权限或 **管理应用程序访问权限 →**。在 GitHub 中添加存储库，保存安装设置，然后重新加载选择器。

删除存储库会阻止引擎在该代理环境中使用它。它不会卸载 GitHub 应用程序或删除其在其他代理环境中的访问权限。管理 GitHub 中的应用程序安装以撤销存储库访问权限。

#### 验证连接

使用具有代表性跟踪的测试存储库和代理环境。在自托管 LangSmith 上，请在此测试期间要求您的运营商[verify webhook delivery](/langsmith/engine-self-hosted-github#verify-webhook-delivery)。

要验证连接：1. 运行引擎分析并确认它可以使用存储库的源代码。
2. 生成问题的修复程序，检查其差异，然后单击 **Open PR**。确认 **查看 PR** 在预期的 GitHub 实例、存储库和基础分支上打开 PR。
3. 审核并合并测试 PR。确认相应的引擎问题已完成。

要自动创建 PR，请在 **代码存储库** 设置中启用 **为每个修复打开拉取请求**。在 LangSmith v0.17 中，此设置标记为 **为每个修复打开草稿拉取请求**。

#### 存储库策略

存储库必须允许引擎推送修复分支。在 LangSmith v0.17 中，他们还必须支持 PR 草案。引擎不使用基于分叉的贡献工作流程。

引擎的 Git 提交未签名。需要在修复分支上进行签名提交的规则可以拒绝推送。分支名称规则、推送限制和 GHES 预接收挂钩也可以拒绝修复。在 LangSmith v0.17 中，修复分支使用 `issues-agent/` 前缀。查看适用于这些分支机构和应用程序身份的策略。在目标分支上保留正常的审查和合并需求。当一个人合并时，可能仍然需要满足目标分支的要求；配置应用程序不会绕过存储库策略。

引擎不会获取 Git LFS 文件内容或初始化 Git 子模块。

#### 存储库选择故障排除

|症状|检查什么 |
| - | - |
| GitHub 未配置，或 GitHub 打开前连接失败 |在自托管 LangSmith 上，请让您的运营商检查 [deployment configuration](/langsmith/engine-self-hosted-github#configure-langsmith)。 |
|您的组织不是安装目标 |确认您的 GitHub 角色、组织审批政策和应用程序的可见性。私人应用程序只能安装在其所属的帐户上。 |
|您的管理用户帐户不是安装目标 |使用组织拥有的存储库。个人托管用户存储库无法使用此集成。 |
| App已安装，但LangSmith无连接 |在 LangSmith 中启动 **连接 GitHub**，包括在管理员批准安装之后或您直接从 GitHub 安装之后。在自托管 LangSmith 上，如果授权未完成，请让您的运营商[check setup](/langsmith/engine-self-hosted-github#troubleshoot-setup)。 ||缺少安装或存储库 |检查您授权的 GitHub 帐户、应用程序选择的存储库以及安装是否连接到此 LangSmith 工作区。出现提示时完成组织的 SSO 授权。 |
|授权成功，但无法读取仓库 |检查应用程序的存储库访问权限。在自托管 LangSmith 上，还请您的运营商检查 [GitHub API and sandbox network access](/langsmith/engine-self-hosted-github#allow-network-access)。浏览器登录不会测试这些连接。 |
|无法推送修复 |检查适用于新修复分支的规则，包括签名提交要求、分支限制和预接收挂钩。参见[Repository policies](#repository-policies)。 |

＃＃ GitLab

引擎通过每个工作区一个访问令牌连接到 GitLab。该令牌属于 GitLab 帐户（通常是服务帐户），该帐户的组和项目成员身份决定引擎可以读取哪些项目、将修复分支推送到以及打开合并请求。与 GitHub 不同，GitLab 无需安装应用程序：您在 GitLab 中准备帐户，然后将其令牌保存在 LangSmith 中。

> [!注意]
>
> GitLab 仅在 [LangSmith Cloud](/langsmith/cloud) 上可用。 [self-hosted LangSmith](/langsmith/self-hosted) 或 [BYOC](/langsmith/byoc) 尚不可用。

### 连接 GitLab连接GitLab需要[Workspace Admin](/langsmith/rbac#workspace-admin)角色，或者具有`workspaces:manage`权限的自定义角色。其他工作区成员可以查看连接并将其到达的项目添加到引擎。

您的 GitLab 实例必须满足以下要求：

* **版本**：GitLab.com，或运行 GitLab 16.10 或更高版本的自我管理实例。 LangSmith 使用 GitLab 的 token 自旋转 API 更新 token，这是早期版本所没有的。
* **URL**：端口 443 上的 HTTPS，无路径。不支持安装在相对 URL 根目录下的 GitLab，例如 `https://example.com/gitlab`。
* **网络访问**：LangSmith 通过互联网到达 GitLab，并拒绝解析为私有 IP 地址的 GitLab URL。该实例还必须能够将 Webhooks 传递到 LangSmith。

#### 准备一个服务帐户

要准备引擎充当的帐户：1. 为LangSmith 创建一个[GitLab service account](https://docs.gitlab.com/user/profile/service_accounts/)。在 GitLab.com 上，顶级组所有者在组的 **设置** > **服务帐户** 下创建它。在 GitLab Self-Managed 上，管理员默认创建它。服务帐户可在 GitLab 18.11 或更高版本中的所有 GitLab 层上使用。在早期的免费套餐实例上，请改用专用用户帐户。
2. 将帐户添加到引擎应在其中工作的组或项目，并具有 **Maintainer** 角色。 **开发人员**是最低角色，但LangSmith无法注册[merge request webhook](#complete-issues-on-merge)，因此合并修复并不能完成其问题。在选择角色之前，请先查看[Project policies](#project-policies)。
3. 为具有 `api` 范围的帐户创建个人访问令牌。对于服务帐户，组所有者或管理员从 **服务帐户** 页面创建令牌。

仅将代币用于LangSmith。当您保存它时，LangSmith会旋转它，因此您粘贴的值将停止工作，并且LangSmith保留唯一的工作副本。

#### 保存连接

连接 GitLab：

1. 在 LangSmith 中，转到 **设置** > **集成** > **GitLab**。
2. 在 **GitLab URL** 中，输入 `https://gitlab.com` 或您实例的 HTTPS URL。
3. 在**访问令牌**中，粘贴令牌。
4. 单击 **连接 GitLab**。LangSmith 使用 GitLab 检查令牌并轮换它。该页面显示实例以及令牌更新时间。在**连接运行状况**下，它显示详细信息，包括：

* **实例**：GitLab URL 和版本。
* **令牌状态**：GitLab 是否接受令牌，例如 **Accepted by GitLab**。
* **范围**：令牌的范围。
* **过期**：当前令牌过期时。
* **Webhook URL**：GitLab 将合并请求 Webhook 传递到的 URL。
* **最后一次 webhook 交付**：当 LangSmith 最后一次从 GitLab 收到 webhook 时。

每个工作区都有一个与一个 GitLab 实例的 GitLab 连接。

#### 管理访问令牌

LangSmith 存储加密的令牌并管理其生命周期：* **续订**：LangSmith 在其生命周期中轮换令牌。每次轮换都需要一个一年期的代币。如果实例设置的最大生命周期较短，LangSmith 使用实例接受的 180、90、60、30、14、7 或 2 天中最长的一个。令牌限制为一天的实例无法连接。
* **编辑连接**：要替换令牌或切换实例，请单击 **编辑连接**，输入新值，然后单击 **保存连接**。 LangSmith 撤销替换的令牌。 After a switch, the GitLab project paths Engine tracks refer to projects on the new instance, and fixes opened on the previous instance are hidden until you switch back.
* **断开连接**：点击**断开连接**即可撤销令牌。引擎立即失去对 GitLab 项目的访问权限，包括正在进行的运行。 LangSmith 的 webhooks 保留在您的项目上，并在您重新连接时再次工作，但是在两者之间合并的合并请求不会完成其问题。

删除工作区会删除其 GitLab 连接，而不撤销令牌。令牌会自行过期，或者您可以在 GitLab 中撤销它。

### 添加 GitLab 项目一旦工作区管理员连接了 GitLab，任何可以在代理环境中配置 Engine 的用户都可以添加 GitLab 帐户可以访问的项目。

添加 GitLab 项目：

1. 打开代理环境。在其**引擎**页面上，选择**配置引擎**。
2. 在**代码存储库**下，按项目名称或路径搜索存储库选择器。结果按主机分组，首先是 GitHub 存储库，然后是 **GitLab** 标题下的 GitLab 项目。选择器显示前 20 个匹配的 GitLab 项目，因此请优化搜索以查找其他项目。
3. 选择一个项目进行添加。
4. （可选）设置项目的**分支**和**子文件夹**。参见[Choose the branch and subfolder](#choose-the-branch-and-subfolder)。
5. 对其他项目重复此操作。

您还可以在首次设置引擎时在**连接代理的代码存储库**下添加项目。

如果选择器中缺少项目，请向其中添加至少具有 **开发人员** 角色的 GitLab 帐户。在工作区管理员连接 GitLab 之前，选择器会显示 **将 GitLab 连接到工作区管理员和 **要求工作区管理员将 GitLab 连接到其他用户。Engine 可以在同一代理环境中一起跟踪 GitHub 存储库和 GitLab 项目。每个代理环境只能从一台主机跟踪每条路径。要跟踪与跟踪的 GitHub 存储库具有相同路径的 GitLab 项目，请先删除 GitHub 存储库。

#### 打开合并请求

在 GitLab 上，引擎处理修复的方式与在 GitHub 上相同，用合并请求代替拉取请求。修复控件保留其名称，例如 **Open PR** 和 **View PR**。

* **修复分支**：引擎将每个修复推送到项目中的新 `langsmith-engine/<id>` 分支。
* **作者**：连接的 GitLab 帐户作者使用其 GitLab noreply 电子邮件地址提交和合并请求。
* **合并请求**：单击问题上的 **打开 PR** 以针对项目的选定分支或其默认分支打开合并请求。合并请求打开以供审核，因此跳过草稿合并请求的管道仍在运行。
* **自动合并请求**：**代码存储库**设置中的**为每个修复打开拉取请求**也适用于 GitLab 项目。

通过常用的 GitLab 流程查看并合并 Engine 的合并请求。引擎不会为您合并它们。

#### 完成合并问题LangSmith 在每个 GitLab 项目引擎轨道上注册一个合并请求 Webhook。当合并请求与引擎修复合并时，Webhook 会完成修复的问题。当一个关闭而不合并时，引擎会记录关闭。注册 Webhook 需要项目的 **Maintainer** 角色。

LangSmith 在连接 GitLab 后、添加项目时以及每次引擎打开合并请求时创建或修复 Webhook。

如果 Webhook 无法工作，**代码存储库**下的项目行会显示警告图标和 **GitLab 设置**链接。将鼠标悬停在图标上即可查看原因。解决阻止注册的问题后，无需执行其他步骤。引擎仍然读取项目的代码并在其中打开合并请求。

GitLab 将 Webhook 传送到 **连接运行状况** 下显示的 **Webhook URL**，因此您的实例必须能够访问该 URL。

#### 验证 GitLab 连接

使用测试 GitLab 项目和具有代表性跟踪的代理环境。

要验证连接：1. 在 **设置** > **集成** > **GitLab** 下，确认 **令牌状态** 显示 **已被 GitLab 接受**。
2. 添加测试项目并确认其**代码库**下的行没有显示任何警告。
3. 运行引擎分析并确认它可以使用项目的源代码。
4. 生成问题的修复程序，检查其差异，然后单击 **Open PR**。确认 **查看 PR** 在预期的 GitLab 实例、项目和目标分支上打开合并请求。
5. 检查并合并测试合并​​请求。确认引擎问题已完成并且**上次 webhook 交付**已更新。

#### 项目政策

引擎只推送自己的修复分支，但 GitLab 并不限制它们的令牌。帐户的角色和您的分支保护决定了令牌可以更改的内容：

* **开发人员**：GitLab 的默认分支保护可防止开发人员推送或合并到默认分支。 LangSmith 无法注册合并请求 Webhook。
* **维护者**：LangSmith可以注册合并请求webhook。维护者可以推送并合并到允许维护者的受保护分支，其中包括 GitLab 默认保护设置下的默认分支。仅将帐户添加到引擎需要的项目中，并保护引擎不应更改的分支。在目标分支上保留正常的审查和合并需求。

推送规则可以拒绝引擎的推送，例如需要签名提交、限制分支名称或检查提交作者电子邮件地址的规则。与 GitHub 上一样，Engine 的提交是未签名的，并且 Engine 不使用分叉、获取 Git LFS 文件内容或初始化 Git 子模块。

#### GitLab 限制

这些引擎功能不适用于 GitLab 项目：

* **修复验证**：[Validating fixes with preview deployments](/langsmith/engine-fix-validation) 需要 GitHub 存储库。
* **红队**：[Red Teaming](/langsmith/engine-red-teaming) 仅使用具有只读凭据的 GitHub 存储库运行。 GitLab 访问令牌不能仅限于读取访问，因此红队永远不会收到令牌。
* **由其他工具打开的合并请求**：引擎不会链接在引擎外部打开的合并请求，包括由[coding agent mentioned in Slack](/langsmith/engine-notifications#mention-a-coding-agent)打开的合并请求。
* **线性**：引擎不跟踪链接到 [Linear issue](/langsmith/engine-issues#create-a-linear-issue) 的合并请求。

#### GitLab 故障排除|症状|检查什么 |
| - | - |
| **GitLab** 不会出现在 **设置** > **集成** | 下个人组织无法使用Engine，因此GitLab不会出现在那里。 GitLab 仅在 LangSmith 云上可用。 |
|连接失败并显示“GitLab 拒绝了访问令牌” |令牌错误、过期或已撤销。创建一个新令牌。 |
|连接失败并显示“访问令牌需要 api 范围” |创建一个具有 `api` 范围的令牌。 |
|连接失败并显示“LangSmith 需要 GitLab 16.10 或更高版本” |升级 GitLab 实例。 |
|连接失败并显示“无法到达 GitLab” |检查网址。该实例必须可通过端口 443 上的 HTTPS 通过公共 IP 地址从 Internet 访问。 |
|连接失败并显示“无法保存 GitLab 连接” | GitLab 轮换了令牌，但LangSmith 无法存储新令牌，因此您粘贴的令牌不再有效。创建一个新令牌并再次连接。 |
| GitLab 设置页面显示 **GitLab 拒绝了访问令牌** |令牌已被撤销或过期，或者续订未完成。创建一个新令牌，单击“**编辑连接**”，然后保存。 || GitLab 设置页面显示**令牌续订失败** | GitLab 拒绝了预定的续订。横幅显示了 GitLab 的原因。当前令牌将继续有效直至过期，并且LangSmith重试续订。 |
|选择器中缺少一个项目 |检查 GitLab 帐户是否至少在项目中具有 **开发人员** 角色，如果选择器显示前 20 个匹配项，则优化搜索。 |
|项目行显示一个警告图标，其工具提示要求**开发人员**角色 |至少为 GitLab 帐户授予项目的 **开发人员** 角色。在此之前，引擎运行将跳过该项目。 |
|项目行显示一个警告图标，其工具提示显示合并的修复程序无法解决问题 |工具提示给出了原因，例如缺少 **Maintainer** 角色、合并请求事件已关闭或 GitLab 无法访问 **Webhook URL**。如果 GitLab 在交付失败后禁用了 Webhook，请在项目的 Webhook 设置中重新启用它。参见[Complete issues on merge](#complete-issues-on-merge)。 |
|引擎设置显示 **引擎无法访问 GitLab** |工作区的 GitLab 连接有问题。单击 **打开 GitLab 设置** 以查看它。 ||无法推送修复 |检查新修复分支的分支保护和推送规则。参见[Project policies](#project-policies)。 |

## 自托管LangSmith

在自托管 LangSmith 上，操作员注册 GitHub 应用程序并配置 LangSmith，然后任何人都可以连接存储库。参见[Configure GitHub for Engine on self-hosted](/langsmith/engine-self-hosted-github)。

## 自带设备

在 BYOC 数据平面上，组织管理员注册 GitHub 应用程序，并在 LangSmith UI 中的 **配置引擎** 中保存其凭据，然后任何人都可以连接存储库。参见[Configure the App on BYOC](/langsmith/engine-self-hosted-github#configure-the-app-on-byoc)。

## 另请参阅

* [Set up Engine](/langsmith/engine-setup)：为跟踪项目打开引擎并选择其存储库。
* [Why connect a repository](/langsmith/engine#why-connect-a-repository)：引擎从源访问中获得什么，以及它使用的权限。
* [Configure GitHub for Engine on self-hosted and BYOC](/langsmith/engine-self-hosted-github)：在自托管 LangSmith 或 BYOC 数据平面上注册并配置 GitHub 应用程序。
* [Engine security](/langsmith/engine-security)：引擎如何处理您的数据和存储库访问。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-repositories.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。