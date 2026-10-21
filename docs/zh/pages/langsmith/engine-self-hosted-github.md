<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure GitHub for Engine on self-hosted and BYOC | https://docs.langchain.com/langsmith/engine-self-hosted-github -->

# 在自托管和 BYOC 上为 Engine 配置 GitHub

注册 GitHub 应用程序并配置自托管 LangSmith 或 BYOC 数据平面，以便 LangSmith 引擎可以在 GitHub.com、具有数据驻留的企业云或 Enterprise Server 上读取存储库并打开拉取请求。

[LangSmith Engine](/langsmith/engine) 通过您注册的 GitHub 应用程序读取存储库并打开拉取请求。每个 LangSmith 安装或 BYOC 数据平面完成一次此设置。工作区用户然后使用该应用程序[connect repositories](/langsmith/engine-repositories#connect-repositories)。

* **BYOC**：组织管理员将应用程序的凭据保存在 LangSmith UI 中。参见[Configure the App on BYOC](#configure-the-app-on-byoc)。
* **自托管**：操作员在 Helm 值中配置应用程序的凭据。参见[Configure the App on self-hosted](#configure-the-app-on-self-hosted)。

此配置独立于 LangSmith 部署构建和预览的 GitHub 设置。

## 在 BYOC 上配置应用程序

在 [BYOC](/langsmith/byoc) 数据平面上，您可以注册自己的 GitHub 应用程序，并在 LangSmith UI 中的引擎项目中保存其凭据。您无需设置环境变量或 Helm 值。每个数据平面完成一次此设置：数据平面上的每个工作区共享该应用程序。配置应用程序需要拥有数据平面的组织中的`organization:manage`权限。其他用户看到 **安装管理员必须配置 GitHub 应用程序。**

配置应用程序：

**1.打开 GitHub 应用程序设置**

打开跟踪项目或代理环境。在其**引擎**选项卡中，选择**配置引擎**。在 **代码存储库** 下，出现 **GitHub 未配置** 通知。单击 **配置 GitHub 应用程序**。

您还可以在首次为项目设置引擎时配置应用程序。

**2.在 GitHub 上注册应用程序**

在 **设置引擎 GitHub 应用程序** 对话框中，单击 **在 GitHub 上创建应用程序**。该对话框列出了数据平面的 **主页 URL**、**重定向 URI** 和 **Webhook URL**。将这些值复制到 GitHub 注册表单中。

按照 [Complete the registration form](#complete-the-registration-form) 中的说明配置其余设置、权限和事件订阅。使用对话框中的 URL，而不是自托管示例。要选择应用程序的所有者和可见性，请参阅[Choose who owns the App](#choose-who-owns-the-app)。

**3.生成应用程序凭据**在 GitHub 上的应用程序设置中，生成客户端密钥和私钥。使用您在注册期间输入的 Webhook 密钥。详情请参见[Save the App values](#save-the-app-values)。您不需要 BYOC 上的 OAuth 国家机密。

**4.将凭据保存在LangSmith**中

在对话框中输入：

* **应用程序 ID**：数字应用程序 ID，而不是客户端 ID 或安装 ID。
* **GitHub 应用程序名称**：应用程序公共 URL 中的名称，例如 `my-engine-app`。
* **客户端 ID**：应用程序的客户端 ID。
* **客户端密钥**：您生成的客户端密钥。
* **私钥 (PEM)**：下载的 PEM 文件的完整内容，包括换行符。
* **Webhook 密钥**：您在 GitHub 中输入的相同 Webhook 密钥。

单击**保存配置**。 LangSmith 加密存储秘密，不会再次显示。

**5.连接存储库**

[Connect repositories](/langsmith/engine-repositories#connect-repositories) 和 [verify the connection](/langsmith/engine-repositories#verify-the-connection)。测试时，请检查 GitHub 是否提供 Webhook，如 [Verify webhook delivery](#verify-webhook-delivery) 中所述。

GitHub 将拉取请求 Webhook 发送到数据平面上的 **Webhook URL**。如果 GitHub 无法访问该 URL，Engine 仍然可以读取代码、生成修复程序并打开拉取请求。合并后拉取请求链接和自动问题完成不起作用。要稍后更改应用程序，请单击“**管理 GitHub 应用程序**”，然后单击“**编辑或替换应用程序**”。要删除它，请单击“**删除配置**”。替换应用程序需要您重新连接存储库。有关旋转指导，请参阅[Change or rotate configuration](#change-or-rotate-configuration)。

## 在自托管上配置应用程序

在自托管 LangSmith 上，操作员注册应用程序、配置 LangSmith 并验证连接。

> [!注意]
>
> 在自托管上配置 GitHub for Engine 需要 LangSmith Helm 图表版本 0.17.2 或更高版本。早期的图表公开了 GitHub 授权和 Webhooks 仅在启用 LangSmith 部署 (`config.deployment.enabled`) 时才使用的 `/api-host` 路由。

使用 Helm 图表版本附带的 LangSmith 应用程序映像。

### 开始之前

您需要：

* **引擎和沙箱**：工作的 [self-hosted Engine deployment](/langsmith/engine-self-hosted) 以及更新其 Helm 值、秘密和工作负载的权限。
* **GitHub 管理**：在目标存储库上注册和安装应用程序的权限。企业或组织的政策可能需要批准。
* **网络访问**：浏览器、服务和沙箱连接，以及可从 GitHub 访问的 Webhook 路由。参见[Allow network access](#allow-network-access)。

### 选择您的 GitHub 环境每个 LangSmith 安装配置一个 GitHub 实例和一个应用程序。

将 `ENGINE_GITHUB_WEB_BASE_URL` 设置为您的 GitHub 实例的网址：

| GitHub环境|示例网址 |
| - | - |
| GitHub.com，包括企业云 | `https://github.com` |
|具有数据驻留的企业云| `https://example.ghe.com` |
| GitHub 企业服务器 (GHES) | `https://<ghes-hostname>` |

将示例企业地址或 GHES 主机名占位符替换为您自己的。 GHES 在云基础设施和本地使用相同的配置。

在端口 443 上使用 HTTPS 和完全限定的主机名，无需路径（例如 `/api/v3`）或组织名称。 LangSmith 自动确定 API 端点。不支持 SSH Git URL 和自定义 GitHub 端口。

#### 允许网络访问

所有连接均使用 HTTPS。为每个源配置 DNS、路由和证书信任：|来源 |目的地 |目的|
| - | - | - |
|用户的浏览器 | GitHub web host and LangSmith authorization callback URL |登录、App授权、安装。 |
| LangSmith 服务和发动机工人 | GitHub Web 和 API 主机 | Authorization, repository information, branch and diff operations, PR creation/status, and App identity. |
|沙盒主机 | GitHub 虚拟主机 |克隆存储库并推送修复分支。 |
| GitHub | LangSmith webhook URL | Link PRs to issues and complete issues after a merge. |

For API access, allow the host for your GitHub environment:

* **GitHub.com**：`api.github.com`。
* **Enterprise Cloud with data residency**: `api.example.ghe.com` for a web address of `https://example.ghe.com`.
* **GHES**: The same host as the web address, `<ghes-hostname>`.

GitHub.com and `ghe.com` send webhooks from outside your network; GHES 从您的 GHES 环境发送它们。 The webhook URL must be reachable from that source. Browser access through a VPN does not establish webhook access.

For GitHub IP allow lists, include the outbound addresses of LangSmith services and sandbox hosts, including any NAT gateway addresses.沙箱 Git 流量需要直接路由到 GitHub。不支持强制上游 HTTP/HTTPS 转发代理； LangSmith API pod 上的`HTTPS_PROXY` 不配置沙箱 Git 访问。

对于私有 IP 地址或私有 CA，请在配置下面的 LangSmith 时包含 [private-GHES settings](#private-ghes-deployments)。

### 注册 GitHub 应用程序

在托管存储库的 GitHub 实例上注册应用程序。在 GitHub.com 上注册的应用程序不能在 GHES 或`ghe.com` 企业上重复使用。

对于 `ghe.com`，通过您企业的身份提供商登录。在整个注册和安装过程中使用该网站；您的个人 GitHub.com 帐户及其应用程序是分开的。

#### 选择谁拥有该应用程序

应用程序的**所有者**管理其注册和凭据。 **安装**授予对组织或帐户中选定存储库的访问权限。

根据存储库引擎需求选择所有权和可见性：|要连接的存储库 |应用程序配置 |
| - | - |
|一个组织中的存储库 |在该组织中创建应用程序。如果不需要在其他地方安装，请选择**仅在此帐户上**。 |
|企业内多个组织的存储库 |创建企业拥有的应用程序并将其安装在每个组织中。这使得安装仅限于企业。 |
|多个组织中的存储库，或组织和个人帐户的混合，没有托管用户 |使用**任何帐户**创建组织拥有的应用程序，然后将其安装在每个目标帐户中。在 GHES 上，**任何帐户**仅适用于该服务器内。 |
|由一个个人帐户拥有的存储库，没有托管用户 |在个人帐户中创建应用程序并选择**仅在此帐户上**。 |

公开可见性允许其他帐户安装该应用程序。它不会公开存储库或在未安装的情况下授予访问权限。

企业拥有的应用程序具有内部可见性，不能安装在个人帐户上。安装在每个组织中；企业帐户安装不授予存储库访问权限。> **企业可见性和托管用户**
>
> 只有企业会员才能授权企业自有App。如果外部协作者需要连接存储库，请在选择所有权类型之前检查其企业访问权限。请参阅 GitHub 的 [App visibility rules](https://docs.github.com/en/enterprise-cloud@latest/apps/creating-github-apps/registering-a-github-app/making-a-github-app-public-or-private) 或 [GHES equivalent](https://docs.github.com/en/enterprise-server@3.20/apps/creating-github-apps/registering-a-github-app/making-a-github-app-public-or-private)，选择服务器的文档版本。
>
> [GitHub Enterprise Cloud with data residency](https://docs.github.com/en/enterprise-cloud@latest/admin/data-residency/about-github-enterprise-cloud-with-data-residency) 使用企业管理用户 (EMU)。 GitHub.com上的企业云也可以使用EMU；单独的 SSO 并不意味着企业使用 EMU。
>
> 对于 EMU，连接组织拥有的存储库。托管用户可以注册应用程序，但此引擎应用程序无法安装在托管用户的个人帐户上。请参阅 GitHub 的 [managed-user restrictions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/abilities-and-restrictions-of-managed-user-accounts#github-apps)。
>
> 在 EMU 企业中，GitHub 可以显示**此企业**，而不是**任何帐户**。 **仅在此帐户上**将组织拥有的应用程序限制为该组织。每个目标组织都需要自己的安装。
>
> 组织所有者可以安装该应用程序。仅当 EMU 企业中的存储库管理员未请求任何组织权限且企业策略允许安装时，才可以安装它。

#### 打开注册表选择拥有该应用程序的帐户的选项卡。这些路径适用于上面选择的 GitHub 实例：

**组织**

您必须是组织所有者或有权管理其应用程序。

打开注册表：

1. 打开您的个人资料菜单并选择 **您的组织**。
2. 在应拥有该应用程序的组织旁边，选择“**设置**”。
3. 打开 **开发者设置** > **GitHub 应用程序** > **新 GitHub 应用程序**。

**企业**

企业所有者完成这些步骤。在 GHES 上，企业拥有的应用程序需要版本 3.17 或更高版本。在旧版本上，使用具有存储库所需可见性的组织拥有的应用程序。

打开注册表：

1. 打开您的个人资料菜单。对于托管用户，选择**您的企业**。对于个人帐户，选择**您的企业**，然后打开企业的**设置**。
2. 在企业侧边栏中的 **设置** 下，选择 **GitHub 应用程序**。
3. 选择**新 GitHub 应用程序**。

有关 GitHub 的说明，请参阅[Create an App for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-github-apps-for-your-enterprise/creating-github-apps-for-your-enterprise)。

**个人账户**

对于没有托管用户的个人帐户，请使用此选项。打开您的个人资料菜单，然后选择 **设置** > **开发人员设置** > **GitHub 应用程序** > **新 GitHub 应用程序**。

#### 填写注册表

将这些设置用于所有 GitHub 环境和应用程序所有者。有关字段定义，请参阅[Register a GitHub App](https://docs.github.com/en/enterprise-cloud@latest/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)。将 `https://langsmith.example.com` 替换为 LangSmith 部署的面向浏览器的 URL。

GitHub 标记授权回调字段 **回调 URL** 或 **重定向 URI**。这两个名称均指 GitHub 在授权后返回用户的 URL。

如果 LangSmith 使用基本路径，请包含它。例如，`https://langsmith.example.com/langsmith` 的部署使用 `https://langsmith.example.com/langsmith/api-host/v1/integrations/forge/github/callback` 作为其授权回调 URL。| GitHub 设置 |价值|
| - | - |
| **GitHub 应用程序名称** |您的部署的唯一名称，例如 `acme-langsmith-engine`。 |
| **主页网址** |您的 LangSmith URL，例如 `https://langsmith.example.com`。 |
| **回调 URL** / **重定向 URI** | `https://langsmith.example.com/api-host/v1/integrations/forge/github/callback` |
| **允许通配符匹配** |保持禁用状态（如果显示）。 |
| **安装期间请求用户授权 (OAuth)** |已启用。引擎需要授权回调才能完成连接安装。 |
| **用户授权令牌过期** |保持启用状态（如果显示）。 |
| **启用设备流** |保持禁用状态。 |
| **设置网址** |保持未设置状态。当启用安装期间的 OAuth 时，GitHub 使用授权回调 URL，并可能禁用此字段。 |
| **更新时重定向** |已启用。更新安装后，将用户返回到LangSmith。 |
| **Webhook：活动** |已启用。 |
| **Webhook URL** | `https://langsmith.example.com/api-host/v1/integrations/forge/github/webhook` |
| **Webhook 秘密** |单独生成的随机秘密，也在LangSmith中配置。 |
| **SSL 验证** |已启用。 |
| **这个 GitHub 应用程序可以安装在哪里？** |在[Choose who owns the App](#choose-who-owns-the-app)中选择的可见性。对于企业拥有的应用程序，不会出现此字段。 |对于现有应用程序，请在 **可选功能** > **用户到服务器令牌过期**下管理令牌过期。参见[GitHub's token expiration settings](https://docs.github.com/en/enterprise-cloud@latest/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens#configuring-your-app-to-use-user-access-tokens-that-expire)。

使用加密安全生成器或秘密管理器生成 Webhook 秘密，使用至少 32 个随机字节。将其保存为LangSmith配置。

在 **权限** > **存储库权限**下，配置：

|许可 |访问 |目的|
| - | - | - |
| **内容** |读写 |阅读代码并推送引擎的修复分支。 |
| **拉取请求** |读写 |创建草稿 PR 并阅读其状态。 |
| **元数据** |只读，自动选择 |识别存储库。 |

保留组织、帐户和企业权限未设置。 Engine 的标准调查和修复工作流程不需要管理、工作流程或检查权限。

在“订阅事件”下，选择“拉取请求”。这些事件让 Engine 链接外部创建的 PR，其中包括 Engine 的问题参考并在合并后将问题标记为完成。

选择 **创建 GitHub 应用程序**。

#### 保存应用程序值

创建应用程序后，打开其设置并准备凭据：1. 在 **客户端密钥** 下，选择 **生成新的客户端密钥** 并立即保存。
2. 在**私钥**下，选择**生成私钥**。保留下载的PEM文件； LangSmith 需要其完整内容，包括换行符。
3. 使用机密管理器或加密安全生成器生成至少 32 个随机字节的单独 **OAuth 状态机密**。仅在LangSmith中使用；请勿将其输入 GitHub 或重复使用 Webhook 密钥。

配置 LangSmith 时使用此映射：

|价值| LangSmith 环境变量 |
| - | - |
| GitHub 实例的网址 | `ENGINE_GITHUB_WEB_BASE_URL` |
| **应用程序 ID**（数字）| `ENGINE_GITHUB_APP_ID` |
| **公共链接**（完整 URL）| `ENGINE_GITHUB_APP_PUBLIC_LINK` |
| **客户端ID** | `ENGINE_GITHUB_APP_CLIENT_ID` |
| **客户秘密** | `ENGINE_GITHUB_APP_CLIENT_SECRET` |
| **私钥**（PEM 内容）| `ENGINE_GITHUB_APP_PRIVATE_KEY` |
| **回调 URL** / **重定向 URI** | `ENGINE_GITHUB_OAUTH_REDIRECT_URI` |
| **Webhook 秘密** | `ENGINE_GITHUB_APP_WEBHOOK_SECRET` |
| **OAuth 国家机密** | `ENGINE_GITHUB_OAUTH_STATE_SECRET` |

复制数字**应用程序 ID**，而不是客户端 ID 或安装 ID。准确复制**公共链接**，包括其完整路径；请勿使用开发人员设置 URL 或以 `/installations/new` 结尾的安装 URL。使用在 GitHub 中输入的确切授权回调 URL 和 Webhook 密钥。在回调 URL 中包含任何 LangSmith 基本路径。 GitHub网址是[Choose your GitHub environment](#choose-your-github-environment)中选择的。

### 配置LangSmith

#### 存储凭据

使用 [existing secret-management workflow](/langsmith/self-host-using-an-existing-secret)，在 LangSmith 命名空间中为客户端密钥、私钥、Webhook 密钥和 OAuth 状态密钥创建 Kubernetes 密钥。 Helm 示例引用了名为 `langsmith-engine-github` 的 Secret。您可以选择不同的 Secret 名称和密钥；更新 `secretKeyRef` 条目以匹配。

将凭证存储在 Secrets 中，而不是存储在提交的 Helm 值或命令行参数中。应用程序 ID、客户端 ID 和 URL 可以包含在 Helm 值中。

#### 设置 Helm 值

启用`hostBackend`并将所有`ENGINE_GITHUB_*`设置放入`commonEnv`。将以下内容与您现有的 Helm 值合并，保留不相关的条目。替换占位符和示例 URL：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonEnv:
  - name: ENGINE_GITHUB_WEB_BASE_URL
    value: "https://<ghes-hostname>"
  - name: ENGINE_GITHUB_APP_ID
    value: "<app-id>"
  - name: ENGINE_GITHUB_APP_PUBLIC_LINK
    value: "<public-link-copied-from-github>"
  - name: ENGINE_GITHUB_APP_CLIENT_ID
    value: "<client-id>"
  - name: ENGINE_GITHUB_OAUTH_REDIRECT_URI
    value: "https://langsmith.example.com/api-host/v1/integrations/forge/github/callback"
  - name: ENGINE_GITHUB_APP_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: langsmith-engine-github
        key: client_secret
  - name: ENGINE_GITHUB_APP_PRIVATE_KEY
    valueFrom:
      secretKeyRef:
        name: langsmith-engine-github
        key: private_key
  - name: ENGINE_GITHUB_OAUTH_STATE_SECRET
    valueFrom:
      secretKeyRef:
        name: langsmith-engine-github
        key: oauth_state_secret
  - name: ENGINE_GITHUB_APP_WEBHOOK_SECRET
    valueFrom:
      secretKeyRef:
        name: langsmith-engine-github
        key: webhook_secret

hostBackend:
  enabled: true
```

从特定于组件的 `extraEnv` 列表（包括 `hostBackend.deployment.extraEnv`）中删除这些变量，以避免重复定义。共享配置为 API 和后台工作负载提供相同的值。

图表的 `config.hostname`、`config.frontendHostname`（如果使用）和 `config.basePath` 还必须描述用户在浏览器中打开的 URL。

#### 私有 GHES 部署如果 GHES 使用私有 IP 地址或私有 CA，请在应用值文件之前包括以下适用的设置。

**专用网络上的 GHES**

对于解析为私有 IP 地址的 GHES 主机名，请配置来自 LangSmith 和沙箱主机的私有 DNS 和网络路由。还可以通过列出的 Helm 值设置以下环境变量：

| Helm 环境列表 |变量|价值|
| - | - | - |
| `platformBackend.deployment.extraEnv` | `SSRF_ALLOW_PRIVATE_IPS_ENGINE` | `"true"` |
| `ingestQueue.deployment.extraEnv` | `SSRF_ALLOW_PRIVATE_IPS_ENGINE` | `"true"` |
| `sandboxes.sandboxHost.deployment.extraEnv` | `SSRF_ALLOW_PRIVATE_IPS_EGRESS` | `"true"` |

这些设置允许各个组件访问私有地址；它们不创建 DNS 记录或网络路由。它们影响的不仅仅是这个 GitHub 主机名。保留对部署实际需要的目的地的网络限制，并启用对元数据、环回和 Kubernetes 内部地址的保护。

**拥有私人证书颁发机构的 GHES**

LangSmith 服务和沙箱主机必须信任签署 GHES 证书的 CA。仅在浏览器中或沙箱内配置信任是不够的。

按照[Mount internal CAs for TLS](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)配置`config.customCa.secretName`和`config.customCa.secretKey`。包括您的私有 CA 以及捆绑包中其他出站连接所需的任何公共根。还将 `hostBackend.deployment.extraEnv` 中的 `REQUESTS_CA_BUNDLE` 设置为 `/etc/ssl/certs/custom-ca-certificates.crt`，即图表安装该包的路径。除了图表的 TLS 配置之外，GitHub 集成还需要此设置。

检查捆绑包是否到达 GitHub 集成、平台 API 和工作线程、引擎执行工作线程和沙箱主机。保持 TLS 验证启用。沙箱代理自己的 CA 与用于验证 GHES 的 CA 是分开的。

#### 应用配置

使用匹配的 LangSmith 图像和图表版本，通过正常部署过程应用完整的值文件。有关 Helm 升级，请参阅[Upgrade a self-hosted deployment](/langsmith/self-host-upgrades)。

等待受影响的 API 和工作线程部署完成，然后再连接存储库。就地更新 Secret 不会在运行的容器中重新加载环境变量；凭证更改后重新启动受影响的工作负载。

### 验证 webhook 传递

推出后，[connect a test repository and verify the connection](/langsmith/engine-repositories#verify-the-connection)。创建和合并测试 PR 时，检查应用程序的 webhook 交付：

1. 在 GitHub 应用程序的设置中，打开 **高级** > **最近交付**。
2. 确认 **pull\_request** 交付成功到达LangSmith。 LangSmith 在接受有效的签名交付时返回 HTTP 202。仅成功的 Webhook 响应并不能证明该事件与引擎问题匹配。完成[Verify the connection](/langsmith/engine-repositories#verify-the-connection)中的合并检查。

### 设置疑难解答

|症状|检查什么 |
| - | - |
| **GitHub 未配置** |确认已设置App ID、Client ID、Client Secret、私钥、国家机密和App的公共链接。检查 GitHub URL 格式并完成部署。此通知指出了缺少的配置；它不测试凭据是否有效。 |
| GitHub授权后暂时无法使用 |确认客户端密钥和私钥属于配置的应用程序 ID 和客户端 ID。检查 GitHub 连接和证书信任，然后重新启动 **连接 GitHub**。 |
| GitHub 授权在错误的实例上打开 |检查共享配置中的`ENGINE_GITHUB_WEB_BASE_URL`并删除冲突的组件覆盖。 |
|回调返回 HTML 或 404 |检查`/api-host`路由、LangSmith基本路径以及准确的授权回调URL。 ||安装不返回LangSmith |启用**在安装期间请求用户授权 (OAuth)**。检查准确的授权回调 URL，并确认 Client ID 和 Client Secret 属于该应用程序。然后在LangSmith中重启**连接GitHub**。 |
|存储库出现，但克隆或推送失败 |检查沙箱主机 DNS、路由、私有 IP 设置、证书信任和 GitHub IP/推送策略。 |
|推送成功后 PR 创建失败 |检查**拉取请求：读取和写入**、草稿 PR 可用性以及所选的基础分支。 |
|合并并不能完成问题 |检查 **拉取请求** 事件订阅、Webhook 可访问性、匹配的 Webhook 密钥和 **最近交付**。纠正原因后重新传送失败的事件。 |

如果 GitHub 无法提供 Webhooks，存储库读取、修复和 PR 创建仍然可以工作。 Webhook 驱动的 PR 链接和合并后的自动问题完成不起作用。从 GitHub 的应用程序设置恢复传递并重新传递错过的事件。对于使用外部编码助手创建的 PR，请保留 PR 描述中 **复制修复上下文** 中的问题参考。此引用让 Engine 将 PR 链接到问题。

对于缺少的组织或存储库，请参阅[Troubleshoot repository selection](/langsmith/engine-repositories#troubleshoot-repository-selection)。

寻求帮助时，请提供您的 LangSmith 和 Helm 图表版本、GitHub 环境和 GHES 版本（如果适用）、应用程序所有权类型以及失败的步骤。请勿包含私钥、客户端机密、Webhook 机密或访问令牌。

### 更改或轮换配置

对于私钥轮换，请在 GitHub 中添加新密钥，更新部署 Secret，然后重新启动受影响的工作负载。在删除旧密钥之前验证连接。遵循 GitHub 支持多个客户端密钥的相同重叠方法。

对于 webhook-secret 轮换，请协调 GitHub 和 LangSmith 值。不匹配期间的交付无法通过签名验证。在双方使用新密钥后，查看**最近的交付**并重新交付失败事件。替换应用程序需要安装替换版本并重新连接受影响的 LangSmith 工作区。计划好中断，直到存储库访问恢复为止。转移应用程序所有权还可以更改其安装位置及其公共链接；在进行更改之前检查 GitHub 的传输行为。

请勿在迁移过程中更改现有连接部署上的`ENGINE_GITHUB_WEB_BASE_URL`。更改 URL 不会迁移存储库连接或现有 PR 引用。在切换 GitHub 实例之前，计划使用 LangChain 支持进行迁移。

## 另请参阅

* [Connect Engine to your repository](/langsmith/engine-repositories)：配置 GitHub 应用程序后连接存储库。
* [Engine on self-hosted and BYOC](/langsmith/engine-self-hosted)：安装引擎并选择其运行模型的方式。
* [Engine security](/langsmith/engine-security)：引擎如何处理您的数据和存储库访问。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted-github.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。