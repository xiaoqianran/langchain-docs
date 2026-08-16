<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up SSO with OAuth2.0 and OIDC | https://docs.langchain.com/langsmith/self-host-sso -->

# 使用 OAuth2.0 和 OIDC 设置 SSO

LangSmith [Self-Hosted](/langsmith/self-hosted) 通过 OAuth2.0 和 OIDC 提供 SSO，它将身份验证委托给您的身份提供商 (IdP) 以管理对 LangSmith 的访问。

LangSmith 实现支持任何符合 OIDC 的提供程序。配置完成后，您将看到一个登录屏幕，提示**通过 SSO 登录**。

默认情况下，LangSmith自托管支持`Authorization Code`流和`Client Secret`。在此版本的流程中，您的客户端密钥安全地存储在LangSmith（而不是在前端）中，并用于身份验证和建立身份验证会话。

<div id="with-client-secret-recommended"></div>

## 注意事项- 您可以将[⟦T14⟧ auth](/langsmith/self-host-basic-auth)安装升级到`oauth`模式，但不能将[⟦T16⟧ auth](/langsmith/authentication-methods#none)安装升级。
    - 通过删除 [⟦T18⟧ auth configuration parameters](/langsmith/self-host-basic-auth#configuration) 并添加 [OAuth with client secret configuration parameters](#configuration) 来升级 `basic` 身份验证安装。然后，用户可以**仅**通过 OAuth 登录。要在升级后保持访问权限，**您必须有权使用之前通过基本身份验证登录的电子邮件地址通过 OAuth 登录。**
- LangSmith **不** 支持：
    - 在自托管中从 SSO 迁移到`basic` 身份验证模式。
    - 从使用客户端密码的 OAuth 模式迁移到不使用客户端密码的 OAuth 模式，反之亦然。
    - 同时拥有 `basic` auth 和 OAuth。确保在启用 OAuth 时禁用 `basic` 身份验证配置。

## 先决条件

您必须具备以下条件才能完成[Provider setup](#provider-setup)：

- [Self-hosted](/langsmith/self-hosted) 和[Enterprise plan](/langsmith/pricing-plans)。
- 支持具有 `Client Secret` 的 `Authorization Code` 流的 IdP。
- 支持使用外部发现/颁发者 URL 的 IdP。 LangSmith 使用它来获取 IdP 所需的路由和密钥。
- `OIDC`、`email` 和 `profile` 范围。 LangSmith 使用这些为您的用户获取必要的用户信息和电子邮件。

<Note>
仅通过 `https` 支持LangSmith SSO。
</Note>

## 配置- 您需要将 IdP 中的回调 URL 设置为 `https://<host>/api/v1/oauth/custom-oidc/callback`，其中 `host` 是您为 LangSmith 实例配置的域或 IP。您的 IdP 将在用户通过身份验证后重定向用户。
- 要在注销时终止 IdP 会话（因此用户必须重新进行身份验证），请在 IdP 中将您的 LangSmith URL（例如 `https://<host>`）注册为 **注销后重定向 URI**（有时称为“注销重定向 URI”），然后通过 Helm 中的 `commonEnv` 在您的环境中设置 `OAUTH_IDP_LOGOUT_ENABLED=true`。
- 您需要在 `values.yaml` 文件中提供 `oauthClientId`、`oauthClientSecret`、`hostname` 和 `oauthIssuerUrl`。您将在此处配置 LangSmith 实例。
- 如果您尚未**使用客户端密钥配置 OAuth，或者您只有个人组织，则必须提供一个电子邮件地址以分配为新配置的 SSO 组织的 `initialOrgAdminEmail`。如果您从 [basic auth](/langsmith/self-host-basic-auth) 升级，LangSmith 将改用您现有的组织。

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com
  initialOrgAdminEmail: test@email.com # Set this if required
  oauth:
    enabled: true
    oauthClientId: <YOUR CLIENT ID>
    oauthClientSecret: <YOUR CLIENT SECRET>
    oauthIssuerUrl: <YOUR DISCOVERY URL>
    oauthScopes: "email,profile,openid"
```

## 提供商设置

### Microsoft Entra ID IdP 设置

使用 OAuth2.0 和 OIDC 将 Microsoft Entra ID 配置为单点登录提供程序。有关更多信息，请参阅 Microsoft 的 [OpenID Connect documentation](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc)。<Note>
在 Microsoft Entra ID 中注册应用程序需要租户中具有 `Application Administrator` 或 `Cloud Application Administrator` 角色或更高级别的角色。
</Note>

#### 步骤 1. 注册应用程序

1. 在[Microsoft Entra admin center](https://entra.microsoft.com/)中，转到**应用程序** > **应用程序注册** > **新注册**。
2. 将 **Name** 设置为标识应用程序的值，例如 `LangSmith Self-Hosted`。
3. 将 **支持的帐户类型** 设置为 **仅限此组织目录中的帐户（单一租户）**。
4. 在 **重定向 URI** 下，选择 **Web** 作为平台并输入 `https://<host>/api/v1/oauth/custom-oidc/callback`，其中 `<host>` 是您的 LangSmith 实例的域。
5. 单击**注册**。

在应用程序的 **概述** 页面中，记录以下值以在 Helm 配置中使用：

- **应用程序（客户端）ID**：用作`oauthClientId`。
- **目录（租户）ID**：用于构造发行者 URL。
- **OIDC 发行人 URL**：`https://login.microsoftonline.com/<tenant-id>/v2.0`，用作 `oauthIssuerUrl`。

#### 步骤 2. 创建客户端密钥

1. 在应用程序注册中，转到 **证书和机密** > **客户端机密** > **新客户端机密**。
2. 输入描述，选择过期时间，然后单击 **添加**。
3. 立即复制秘密**值**。 Microsoft Entra ID 在您离开页面后隐藏此值。将其用作`oauthClientSecret`。在配置 Helm 之前，将客户端 ID、客户端密钥和颁发者 URL 存储在密钥存储中。

#### 步骤 3. 添加电子邮件可选声明

如果不执行此步骤，LangSmith 会阻止登录并显示错误 `Your identity provider did not provide an email address`。

1. 在应用程序注册中，转到**令牌配置** > **添加可选声明**。
2. 选择 **ID** 作为令牌类型。
3. 勾选`email`，然后点击**添加**。
4. 出现提示时，接受授予 Microsoft Graph `email` 权限的请求。

#### 步骤 4. 配置 LangSmith

将前面步骤中的值应用到您的 Helm 配置中：

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com
  initialOrgAdminEmail: test@email.com # Set this if required
  oauth:
    enabled: true
    oauthClientId: "<APPLICATION (CLIENT) ID>"
    oauthClientSecret: "<CLIENT SECRET VALUE>"
    oauthIssuerUrl: "https://login.microsoftonline.com/<TENANT ID>/v2.0"
    oauthScopes: "email,profile,openid"
```

有关`initialOrgAdminEmail`的详细信息，请参阅[general configuration section](#configuration)。

<Note>
默认情况下，Microsoft Entra ID 的 `oid` 声明用作 OIDC `sub` 声明。详情请参阅[Override sub claim](#override-sub-claim)。
</Note>

要在登录时从 Microsoft Entra ID 组分配组织和工作区角色，请参阅[SSO Groups Sync](#sso-groups-sync)。

### Google 工作区 IdP 设置

您可以使用 [OAuth2.0 and OIDC](https://developers.google.com/identity/openid-connect/openid-connect) 将 Google Workspace 作为单点登录 (SSO) 提供商，而无需 PKCE。<Note>
您必须拥有组织的 Google Cloud Platform (GCP) 帐户的管理员级别访问权限才能创建新项目，或者拥有为现有项目创建和配置 OAuth 2.0 凭据的权限。我们建议您创建一个新项目来管理访问，因为每个 GCP 项目都有一个 OAuth 同意屏幕。
</Note>

1.新建一个GCP项目，参见Google文档主题[creating and managing projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects)

2. 创建项目后，打开Google API Console中的[Credentials](https://console.developers.google.com/apis/credentials)页面（确保左上角的项目正确）

3. 创建新凭证：`Create Credentials → OAuth client ID`

4. 选择 `Web application` 作为 `Application type` 并输入应用程序的名称，例如`LangSmith`

5. 在 `Authorized Javascript origins` 中输入您的 LangSmith 实例的域名，例如`https://langsmith.yourdomain.com`

6. 在`Authorized redirect URIs`中输入LangSmith实例的域，后跟`/api/v1/oauth/custom-oidc/callback`，例如`https://langsmith.yourdomain.com/api/v1/oauth/custom-oidc/callback`

7. 单击 `Create`，然后下载 JSON 或复制 `Client ID`（以 `.apps.googleusercontent.com` 结尾）和 `Client secret` 保存在安全的地方。 **如果需要，您稍后可以访问这些**。

8. 从左侧导航菜单中选择`OAuth consent screen`1. 选择应用程序类型为`Internal`。 **如果您选择`Public`，任何拥有 Google 帐户的人都可以登录。**
   2. 输入描述性`Application name`。用户登录时会在同意屏幕上显示此名称。例如，使用 `LangSmith` 或 `<organization_name> SSO for LangSmith`。
   3. 验证 Google API 的范围仅列出电子邮件、个人资料和 openid 范围。单点登录仅需要这些范围。如果您授予额外的范围，则会增加暴露敏感数据的风险。

9. （可选）控制组织内的哪些人有权访问 LangSmith：[https://admin.google.com/ac/owl/list?tab=configuredApps](https://admin.google.com/ac/owl/list?tab=configuredApps)。有关更多详细信息，请参阅[Google's documentation](https://support.google.com/a/answer/7281227?hl=en\&fl=1\&sjid=9554153972856467090-NA)。

10. 配置 LangSmith 使用此 OAuth 应用程序。例如，以下是用于 Kubernetes 配置的 `config` 值：

    1. `oauthClientId`: `Client ID`（以`.apps.googleusercontent.com`结尾）
    2.`oauthClientSecret`：`Client secret`
    3. `hostname`：您的LangSmith实例的域，例如`https://langsmith.yourdomain.com`（无尾部斜杠）
    4. `oauthIssuerUrl`: `https://accounts.google.com`
    5.`oauth.enabled`：`true`
    6.`authType`：`mixed`

### Okta IdP 设置

#### 支持的功能

* IdP 发起的 SSO
* SP发起的SSO
* 即时配置（参见[Manage user access in SSO organizations](/langsmith/jit-invite-sso)）

#### 配置步骤

有关更多信息，请参阅 Okta 的 [documentation](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_oidc.htm)。
如果您有任何疑问或问题，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。<div id="via-okta-integration-network">
    <b>通过 Okta 集成网络（推荐）</b>
</div>

<Info>有关 SCIM 设置的详细信息，请参阅[Set up SCIM for your organization](/langsmith/user-management#set-up-scim-for-your-organization)。</Info>

<Note>
为了将 SCIM 与 Okta 一起使用，需要使用此配置方法。
</Note>

1. 登录[Okta](https://login.okta.com/)。
1. 在右上角，选择“管理”。从管理区域看不到该按钮。
1. 选择`Browse App Integration Catalog`。
1. 找到并选择LangSmith应用程序。
1. 在应用程序概览页面上，选择“添加集成”。
1.填写`ApiUrlBase`：
   * 您的 LangSmith API URL **不含协议** (`https://`)，格式为 `<langsmith_domain>/api/v1`，例如 `langsmith.yourdomain.com/api/v1`。
   * 如果您的安装配置了子域/路径前缀，请将其包含在 URL 中，例如 `langsmith.yourdomain.com/prefix/api/v1`。
1. 将`AuthHost`留空。
1. （可选，如果计划同时使用[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)）填写`LangSmithUrl`：上面的`<langsmith_url>`部分，例如`langsmith.yourdomain.com`。
1. 在“应用程序可见性”下，保持复选框处于未选中状态。
1. 选择下一步。
1. 选择`OpenID Connect`。
1.填写`Sign-On Options`：
   * `Application username format`：`Email`。
   *`Update application username on`：`Create and update`。
   * `Allow users to securely see their password`：保留**不选中**。
1. 单击“**保存**”。
1. 配置LangSmith以使用此OAuth应用程序（有关`initialOrgAdminEmail`的详细信息请参阅[general configuration section](#configuration)）：

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com # the domain of your instance (note no trailing slash)
  initialOrgAdminEmail: test@email.com # Set this if required
  oauth:
    enabled: true
    oauthClientId: "Client ID" # (starts with `0o`)
    oauthClientSecret: "Client secret"
    oauthIssuerUrl: "https://company-7422949.okta.com" # the URL of your Okta instance
    oauthScopes: "email,profile,openid"
```

<Info>有关 SCIM 设置的详细信息，请参阅[Set up SCIM for your organization](/langsmith/user-management#set-up-scim-for-your-organization)。</Info><div id="via-okta-custom-app-integration">
    <b>通过自定义应用程序集成</b>
</div>

<Warning>
SCIM 与此配置方法不兼容。请参阅[**Via Okta Integration Network**](#via-okta-integration-network)。
</Warning>

1. 以管理员身份登录 Okta，然后转至 **Okta 管理控制台**。
1. 在 **应用程序** > **应用程序** 下，单击 **创建应用程序集成**。
1. 选择 **OIDC - OpenID Connect** 作为登录方法，选择 **Web 应用程序** 作为应用程序类型，然后单击 **下一步**。
1. 输入 `App integration name`（例如，`LangSmith`）。
1. 推荐：检查**核心补助>刷新令牌**（参见[session length controls](#session-length-controls)）。
1. 在 **登录重定向 URI** 中，将 LangSmith 实例的域名后跟 `/api/v1/oauth/custom-oidc/callback`，例如 `https://langsmith.yourdomain.com/api/v1/oauth/custom-oidc/callback`。如果您的安装配置了子域/路径前缀，请将其包含在 URL 中，例如 `https://langsmith.yourdomain.com/prefix/api/v1/oauth/custom-oidc/callback`。
1. 在 **注销重定向 URI** 下，将值设置为您的 LangSmith URL，例如 `https://langsmith.yourdomain.com`。这可确保当用户注销 LangSmith 时 IdP 会话终止。
1. 在 **Trusted Origins > Base URIs** 下添加带有协议的 langsmith URL，例如 `https://langsmith.yourdomain.com`。
1. 在**分配 > 受控访问**下选择所需的选项：
    * 允许组织中的每个人访问。
    * 限制对选定组的访问。* 暂时跳过小组作业。
1. 单击“**保存**”。
1. 在 **登录 > OpenID Connect ID 令牌** 下，将 **颁发者** 设置为 **Okta URL**。
1. （可选）在**常规 > 登录**下，将 **登录发起者** 设置为 `Either Okta or App` 以启用 IdP 发起的登录。
1.（推荐）在**常规 > 登录 > 电子邮件验证体验**下，使用 LangSmith URL 填写 **Callback URI**，例如 `https://langsmith.yourdomain.com`。
1. 配置LangSmith以使用此OAuth应用程序（有关`initialOrgAdminEmail`的详细信息请参阅[general configuration section](#configuration)）：

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com # the domain of your instance (note no trailing slash)
  initialOrgAdminEmail: test@email.com # Set this if required
  oauth:
    enabled: true
    oauthClientId: "Client ID" # (starts with `0o`)
    oauthClientSecret: "Client secret"
    oauthIssuerUrl: "https://company-7422949.okta.com" # the URL of your Okta instance
    oauthScopes: "email,profile,openid"
```

#### SP 发起的 SSO

用户可以使用LangSmith主页上的**通过SSO登录**按钮登录。

## 高级选项

### 会话长度控制

<Note>
本节中的所有环境变量均适用于 `platform-backend` 服务，可以使用 Helm 中的 `platformBackend.deployment.extraEnv` 添加。
</Note>* 默认情况下，会话长度由身份提供者返回的身份令牌的过期时间控制
* 大多数设置应使用刷新令牌来启用会话长度扩展，超出身份令牌过期时间直至`OAUTH_SESSION_MAX_SEC`，这可能需要通过在 Helm 中添加`oauthScopes` 来包含`offline_access` 范围
* `OAUTH_SESSION_MAX_SEC`（默认 1 天）最多可覆盖一周 (`604800`)
* 对于不支持刷新令牌的身份提供者设置，设置 `OAUTH_OVERRIDE_TOKEN_EXPIRY="true"` 将采用 `OAUTH_SESSION_MAX_SEC` 作为会话长度，忽略身份令牌过期时间

### 严格身份提供者的范围编码

默认情况下，LangSmith 将授权请求中`oauthScopes` 之间的空格编码为`+`（`application/x-www-form-urlencoded` 约定）。大多数身份提供商都接受这一点，但有些身份提供商（例如 CA SiteMinder）不会将 `+` 解码为空格，并拒绝登录并显示 `invalid_scope` 错误。如果您的 IdP 出于此原因拒绝多范围登录，请在 Helm 中设置 `urlEncodeScopeSpaces: true` 将空格编码为 `%20`，这是所有符合 OIDC 的提供商都接受的编码。这仅适用于具有 OAuth 客户端密钥的 `authType: mixed`，并且默认为关闭。

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com
  oauth:
    enabled: true
    oauthClientId: <YOUR CLIENT ID>
    oauthClientSecret: <YOUR CLIENT SECRET>
    oauthIssuerUrl: <YOUR DISCOVERY URL>
    oauthScopes: "email,profile,openid"
    urlEncodeScopeSpaces: true
```

### 覆盖子声明在某些情况下，可能需要覆盖身份提供商用作 `sub` 声明的声明。
例如，在 SCIM 中，已解析的 `sub` 声明和 SCIM `externalId` 必须匹配才能成功登录。
如果 `sub` 声明和/或 SCIM `externalId` 的源属性有限制，请设置 `ISSUER_SUB_CLAIM_OVERRIDES` 环境变量以选择将哪个 OIDC JWT 声明用作 `sub`。

如果颁发者 URL **以此配置中的 URL 之一开头**，则从指定的字段名称中获取 `sub` 声明。
例如，通过以下配置，发行者为 `https://idp.yourdomain.com/application/uuid` 的代币将使用 `customClaim` 值作为 `sub`：

```
ISSUER_SUB_CLAIM_OVERRIDES='{"https://idp.yourdomain.com": "customClaim"}'
```

如果未设置，则当 Azure Entra ID 用作身份提供程序时，此配置的默认值将使用 `oid` 声明：

```
ISSUER_SUB_CLAIM_OVERRIDES='{"https://login.microsoftonline.com/": "oid", "https://sts.windows.net/": "oid", "https://login.microsoftonline.us/": "oid", "https://login.partner.microsoftonline.cn/": "oid"}'
```

### SSO 组同步

<Note>
自托管上的 SSO 组同步需要 LangSmith 图表版本 **0.15.0-rc.3**（应用程序版本 **0.15.2rc1**）或更高版本。
</Note>[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative) 让 LangSmith 从 OIDC 令牌上的组成员身份声明中分配组织和工作区角色，作为 [SCIM](/langsmith/user-management#set-up-scim-for-your-organization) 的更简单替代方案。在自托管上，您必须将 IdP 配置为将组包含在 OIDC ID 令牌中，然后 LangSmith 才能读取它们。

**IdP 端配置（因提供商而异）：**

1. 配置您的 IdP 应用程序以在 OIDC ID 令牌中发出组成员资格声明。源属性和生成的声明名称因 IdP 而异。常见示例包括 `groups`、`roles` 或自定义声明名称。 LangSmith 不规定源属性。
1. 根据您的 IdP，您可能需要向 `oauthScopes` 添加额外范围（通常为 `groups`）才能接收声明。检查 IdP 的文档，了解所需的范围以及在令牌中包含组成员资格所需的任何其他配置。
1. 群组名称必须遵循[SCIM naming convention](/langsmith/user-management#group-naming-convention)（例如`LS:Organization Admin`、`LS:Organization User:prod:Editor`）。分隔符通过 [⟦T150⟧](/langsmith/user-management#configure-custom-separator) 与 SCIM 共享。

**头盔配置：**

如果您的 IdP 需要额外的 OIDC 范围以包含令牌中的组（通常为 `groups`），请将其添加到 `oauthScopes`：

```yaml Helm
config:
  authType: mixed
  hostname: https://langsmith.example.com
  oauth:
    enabled: true
    oauthClientId: <YOUR CLIENT ID>
    oauthClientSecret: <YOUR CLIENT SECRET>
    oauthIssuerUrl: <YOUR DISCOVERY URL>
    oauthScopes: "email,profile,openid,groups"
```

确切的范围名称（`groups`、`roles` 等）取决于您的 IdP。检查您的 IdP 的 OIDC 文档。**LangSmith侧配置：**

每个提供商的 SSO 组同步设置存储在 SSO 提供商记录中，并通过 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-self-host-sso) 或 [API](/langsmith/reference)（而不是通过 Helm 值）进行切换。

<Tabs>
<Tab title="UI">
您的 IdP 发出组声明后，从 UI 中的 **设置** → **成员和角色** → **SSO 配置** → **SSO 组同步** 配置 SSO 组同步。 **组声明字段**中配置的声明名称必须与您的 IdP 发出的声明匹配。
</Tab>
<Tab title="API">

要通过 API 配置 SSO 组同步，首先使用 `GET` 当前 SSO 设置来检索提供程序 `id`，然后使用 `id` `PATCH`：

```bash
# 1. Fetch the current SSO settings (and the id required for PATCH)
curl -s "$SELF_HOSTED_LANGSMITH_ENDPOINT/api/v1/orgs/current/sso-settings" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" | jq .

# 2. PATCH using the id returned above
curl -s -X PATCH "$SELF_HOSTED_LANGSMITH_ENDPOINT/api/v1/orgs/current/sso-settings/<id>" \
  -H "X-Api-Key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sso_groups_enabled": true,
    "sso_groups_claim_field": "groups",
    "sso_groups_required": true,
    "sso_groups_role_sync_enabled": true
  }' | jq .
```

<Warning>
`DELETE` 也可在此资源上找到，但此处未介绍。如果组织启用了**仅通过 SSO 登录**，或者没有配置其他身份验证提供程序（例如社交登录），`DELETE` 会完全删除 SSO 提供程序并锁定登录。
</Warning>
</Tab>
</Tabs>

#### 从 Microsoft Entra ID 发出组声明

对于自托管的 OIDC，请通过应用程序注册清单添加组声明。跳过 **令牌配置** > **添加组声明** 流程，该流程不支持纯云安全组的显示名称。<Warning>
将顶级 `groupMembershipClaims` 属性设置为 `"ApplicationGroup"`。其他价值观以难以诊断的方式改变行为：

- 缺失或`"None"`：令牌中没有出现组。
- `"SecurityGroup"` 或 `"All"`：出现组，但 `cloud_displayname` 值被静默忽略，并且令牌包含组对象 ID 而不是名称。
- `"ApplicationGroup"`：组解析为显示名称，但仅限于在 **用户和组** 下明确分配给企业应用程序的组。

仅单租户应用程序支持 `cloud_displayname` 值。
</Warning>

在 **应用程序注册** > 您的应用程序 > **清单**中，将以下内容合并到清单中，保留任何现有的 `optionalClaims.idToken` 条目，例如 `email`：

```json
"groupMembershipClaims": "ApplicationGroup",
"optionalClaims": {
  "idToken": [
    {
      "name": "email",
      "source": null,
      "essential": false,
      "additionalProperties": []
    },
    {
      "name": "groups",
      "source": null,
      "essential": false,
      "additionalProperties": ["cloud_displayname"]
    }
  ],
  "accessToken": [],
  "saml2Token": []
}
```

然后，在 **企业应用程序** > 您的应用程序 > **用户和组** 中，分配映射到 LangSmith 角色的每个组。未分配给企业应用程序的组不会出现在令牌中。

#### 为 SSO 组同步创建 Microsoft Entra ID 组

用于 SSO 组同步的组必须遵循主用户管理页面上记录的 [group naming convention](/langsmith/user-management#group-naming-convention)（例如 `LS:Organization Admins`、`LS:Organization User:Production:Editor`）。组名称区分大小写，并且必须完全符合约定。

要在 Microsoft Entra ID 中创建组：1. 在 Microsoft Entra 管理中心中，转到 **组** > **新组**。
1. 将**组类型**设置为`Security`。
1. 设置**会员类型**为`Assigned`（不支持动态会员）。
1. 将 **组名称** 设置为符合命名约定的值。
1. 添加成员，然后单击“**创建**”。

组成员身份更改将在每个用户下次登录时生效。

#### 验证令牌中的组声明

完成 IdP 端配置后，验证 OIDC ID 令牌是否包含预期的组声明：

1. 退出LangSmith，然后通过 SSO 重新登录。
1. 在浏览器的开发人员工具中，转至 **应用程序** > **Cookies** 并找到 OAuth 会话 cookie。
1. 使用 JWT 解码器（例如 [jwt.io](https://jwt.io)）解码 ID 令牌，并确认 `groups` 声明包含显示名称，而不是对象 ID：

```json
{
  "groups": [
    "LS:Organization Admins",
    "LS:Organization User:Production:Editor"
  ]
}
```

如果声明包含 UUID 而不是名称，请重新访问清单中的 `groupMembershipClaims` 值，并确认将组分配给 **用户和组** 下的企业应用程序。

## PKCE 流程（已弃用）

我们建议使用 [⟦T177⟧](#provider-setup) 运行。但是，如果您的 IdP 不支持此功能，您可以使用 `Authorization Code with PKCE` 流。<Warning>
PKCE 工作流程**自 v16** 起已弃用**，并将**在 v17** 中完全删除。将提供从 PKCE 到带有客户端密钥的 OAuth 的迁移路径。我们建议尽快迁移到[client secret flow](#provider-setup)。
</Warning>

### 要求

<Note>
此流程**不需要**需要`Client Secret`。
</Note>

将 OAuth SSO 与 LangSmith 结合使用有几个要求：

* 您的 IdP 必须支持 `Authorization Code with PKCE` [flow](https://www.oauth.com/oauth2-servers/pkce)（例如，Google 不支持此流程，但请参阅 [above](#with-client-secret-recommended) 了解 Google 支持的替代配置）。这通常在您的 OAuth 提供程序中显示为配置“单页应用程序 (SPA)”
* 您的 IdP 必须支持使用外部发现/颁发者 URL。我们将使用它来获取您的 IdP 所需的路由和密钥。
* 您必须向 LangSmith 提供 `OIDC`、`email` 和 `profile` 范围。我们使用这些来获取您的用户所需的用户信息和电子邮件。
* 您需要将 IdP 中的回调 URL 设置为 `http://<host>/oauth-callback`，其中主机是您为 LangSmith 实例配置的域或 IP。您的 IdP 将在用户通过身份验证后重定向用户。* 您需要在 `values.yaml` 文件中提供 `oauthClientId` 和 `oauthIssuerUrl`。您将在此处配置 LangSmith 实例。

```yaml Helm
config:
  oauth:
    enabled: true
    oauthClientId: <YOUR CLIENT ID>
    oauthIssuerUrl: <YOUR DISCOVERY URL>
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sso.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>