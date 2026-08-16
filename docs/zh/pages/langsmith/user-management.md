<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: User management | https://docs.langchain.com/langsmith/user-management -->

# 用户管理

本页面介绍LangSmith中的用户管理功能，包括访问控制、身份验证和自动用户配置：

- [Set up access control](#set-up-access-control)：配置基于角色的访问控制 (RBAC) 以管理工作区中的用户权限，包括创建自定义角色并将其分配给用户。
- [SAML SSO (Enterprise plan)](#set-up-saml-sso-for-your-organization)：使用 SAML 2.0 为企业客户设置单点登录身份验证，包括流行身份提供商的配置。
- [SCIM User Provisioning (Enterprise plan)](#set-up-scim-for-your-organization)：使用 SCIM 在身份提供商和 LangSmith 之间自动配置和取消配置。

## 设置访问控制

<Note>
RBAC（基于角色的访问控制）是一项仅适用于企业客户的功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用 [⟦T5⟧ role](/langsmith/administration-overview)。
</Note>

<Check>
您可能会发现在设置访问控制之前阅读[Administration overview](/langsmith/administration-overview)页面很有帮助。
</Check>LangSmith 依赖 RBAC 来管理 [workspace](/langsmith/administration-overview#workspaces) 中的用户权限。这使您可以控制谁可以访问您的 LangSmith 工作区以及他们可以在其中执行哪些操作。拥有`workspaces:manage`权限的用户可以管理工作区设置，拥有`workspaces:manage-members`权限的用户可以添加、删除和更新工作区成员。内置的工作区管理员角色包括这两种权限。

有关工作区角色及其权限的完整参考，请参阅 [Role-based access control](/langsmith/rbac#workspace-roles) 指南。各个角色可以执行的具体操作请参考[Organization and workspace operations reference](/langsmith/organization-workspace-operations)。

### 创建角色

默认情况下，LangSmith附带一组系统角色：

- `Admin`：具有对工作区中所有资源的完全访问权限。
- `Viewer`：对工作区中的所有资源具有只读访问权限。
- `Editor`：拥有除工作区管理之外的完整权限（添加/删除用户、更改角色、配置服务密钥）。

如果这些不适合您的访问模型，`Organization Admins`可以创建自定义角色来满足您的需求。

要创建角色，请导航至 [Organization settings page](https://smith.langchain.com/settings) 的 **成员和角色** 部分中的 **角色** 选项卡。请注意，您创建的新角色将可在组织内的所有工作区中使用。单击“**创建角色**”按钮创建新角色。将打开 **创建角色** 表单。

![Create Role](/langsmith/images/create-role.png)

为您想要控制访问的不同LangSmith资源分配权限。

### 为用户分配角色

设置角色后，您可以将它们分配给用户。要将角色分配给用户，请导航至 [Organization settings page](https://smith.langchain.com/settings) 的 `Workspaces` 部分中的 `Workspace members` 选项卡

每个用户都会有一个 **角色** 下拉列表，您可以使用它为他们分配角色。

![Assign Role](/langsmith/images/assign-role.png)

您还可以邀请具有给定角色的新用户。

![Invite User](/langsmith/images/invite-user.png)

## 为您的组织设置 SAML SSO

单点登录 (SSO) 功能**可供企业云**客户通过单一身份验证源访问 LangSmith。这允许管理员集中管理团队访问并确保信息更加安全。

LangSmith 的 SSO 配置是使用 SAML（安全断言标记语言）2.0 标准构建的。 SAML 2.0 支持将身份提供商 (IdP) 连接到您的组织，以获得更轻松、更安全的登录体验。SSO 服务允许用户使用一组凭据（例如，姓名或电子邮件地址和密码）来访问多个应用程序。对于用户已被授予权限的所有应用程序，该服务仅对最终用户进行一次身份验证，并在用户在同一会话期间切换应用程序时消除进一步的提示。 SSO 的好处包括：

- 为组织所有者简化跨系统的用户管理。
- 使组织能够实施自己的安全策略（例如 MFA）。
- 最终用户无需记住和管理多个密码。通过允许跨多个应用程序在一个接入点登录，简化最终用户体验。

### 即时 (JIT) 供应

LangSmith 在使用 SAML SSO 时支持即时配置。这允许通过 SAML SSO 登录的人员以成员身份自动加入组织和选定的工作区。有关管理 JIT 配置和用户邀请的详细信息，请参阅[Manage user access in SSO organizations](/langsmith/jit-invite-sso)。

<Note>
JIT 配置仅针对新用户运行，即尚未通过 [different login method](/langsmith/authentication-methods#cloud) 使用相同电子邮件地址访问组织的用户。
</Note>### 登录方法和访问

为您的组织完成 SAML SSO 配置后，除了 [other login methods](/langsmith/authentication-methods#cloud) 之外，用户还可以通过 SAML SSO 登录，例如用户名/密码或 Google 身份验证：

- 通过SAML SSO登录时，用户只能访问配置了SAML SSO的相应组织。
- 使用 SAML SSO 作为唯一登录方法的用户没有 [personal organizations](/langsmith/administration-overview#organizations)。
- 通过任何其他方法登录时，用户可以访问配置了 SAML SSO 的组织以及他们所属的任何其他组织。

### 仅强制执行 SAML SSO

<Note>
仅强制执行 SAML SSO 的组织不支持用户邀请。初始工作区成员资格和角色由[JIT provisioning](/langsmith/jit-invite-sso#jit-provisioning)确定，之后的更改可以在 UI 中管理。
为了提高自动化用户管理的灵活性，LangSmith 支持 SCIM。
</Note>为确保用户仅在使用 SAML SSO 登录而无其他方法时才能访问组织，请选中 **允许邀请** 复选框。一旦发生这种情况，通过非 SSO 登录方法访问组织的用户需要使用 SAML SSO 重新登录。通过取消选中该复选框，可以将此设置切换回允许所有登录方法。

<Note>
您必须通过 SAML SSO 登录才能将此设置更新为 `Only SAML SSO`。这是为了确保 SAML 设置有效并避免将用户锁定在您的组织之外。
</Note>

故障排除请参考[SAML SSO FAQs](/langsmith/faq#saml-sso-faqs)。如果您在设置 SAML SSO 时遇到问题，请通过 [support.langchain.com](https://support.langchain.com) 联系 LangChain 支持团队。

### 先决条件

<Note>
SAML SSO 适用于 [Enterprise plan](https://www.langchain.com/pricing-langsmith) 上的组织。请[contact sales](https://www.langchain.com/contact-sales)了解更多。
</Note>

- 您的组织必须采用企业计划。
- 您的身份提供商 (IdP) 必须支持 SAML 2.0 标准。
- 只有[⟦T15⟧](/langsmith/organization-workspace-operations#sso-and-authentication)可以配置SAML SSO。

有关使用 SCIM 和 SAML 进行用户配置和取消配置的说明，请参阅[SCIM setup](#set-up-scim-for-your-organization)。

### 初始配置

<Note>
有关特定于 IdP 的配置步骤，请参阅以下内容之一：- [Entra ID](#entra-id-azure)
- [Google](#google)
- [Okta](#okta)
</Note>

1. 在您的 IdP 中：使用以下详细信息配置 SAML 应用程序，然后复制步骤 3 的元数据 URL 或 XML。

   <Note>
   以下 URL 取决于您的组织是否位于 GCP US、GCP EU、GCP APAC 还是 AWS US 云区域。确保您选择正确的链接。
   </Note>

   1. 单点登录 URL（或 ACS URL）：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/acs" />

   2.受众URI（或SP实体ID）：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/metadata" />
   3.姓名ID格式：电子邮件地址。
   4.应用程序用户名：电子邮件地址。
   5. 所需声明：`sub` 和 `email`。

2. 在 LangSmith 中：转到 **设置** -> **成员和角色** -> **SSO 配置**。填写所需信息并提交以激活 SSO 登录：

   1. 填写`SAML metadata URL`或`SAML metadata XML`。
   2. 选择`Default workspace role` 和`Default workspaces`。通过 SSO 登录的新用户将被添加到具有所选角色的指定工作区。

      - `Default workspace role`和`Default workspaces`可编辑。更新后的设置仅适用于新用户，不适用于现有用户。
      -（即将推出）`SAML metadata URL`和`SAML metadata XML`可编辑。通常仅当加密密钥轮换/过期或元数据 URL 已更改但仍使用相同的 IdP 时才需要这样做。### Supabase 属性映射

<Note>
Supabase 属性映射是一项[cloud-only](/langsmith/cloud) 功能。 [Self-hosted](/langsmith/self-hosted) 部署直接使用 IdP 配置 SAML/OIDC 属性 — 请参阅 [Set up SSO with OAuth2.0 and OIDC](/langsmith/self-host-sso)。
</Note>

LangSmith云使用[Supabase](/langsmith/cloud)作为SAML SSO后端。 Supabase 自动将一小组标准 SAML 属性（例如 `email` 和 `sub`）传递到用户的 JWT 上。您的 IdP 发出的任何其他非标准 SAML 属性（例如，[SSO Groups Sync](#sso-groups-sync-alternative) 的 `groups`）必须先通过 Supabase 显式转发，然后 LangSmith 才能读取它。

**属性流(1:1)：**

1. **IdP**：发出具有配置名称的 SAML 属性（例如，`groups`）。
2. **Supabase**：仅当属性名称出现在 SSO 提供商的 **Supabase 属性映射** 表中时，才将属性转发到用户的 JWT。标准属性自动转发；除非明确列出，否则非标准属性将被删除。
3. **LangSmith**：按名称读取 JWT 声明（例如，[SSO Groups Sync](#sso-groups-sync-alternative) 的 **Groups 声明字段**的值）。

属性名称是端到端保留的：IdP 属性名称、Supabase 属性映射条目和下游 LangSmith 设置均使用相同的字符串。

＃＃＃＃ 配置在 **设置** → **成员和角色** → **SSO 配置**，滚动到 **Supabase 属性映射** 部分，并为每个要转发的非标准属性添加一行：

|专栏 |描述 |
| ---| ---|
| **属性名称** |由您的 IdP 发出的 SAML 属性名称。必须与下游的 JWT 声明名称 LangSmith 匹配（对于 SSO 组同步，这与 **组声明字段** 值匹配）。 |
| **数组** |如果属性是多值的（字符串列表），请选中此项。不选中标量（单值）属性。示例：检查 `groups`；不选中 `full_name`。 |

单击每个附加属性的“**添加行**”，然后“**保存**”。空映射表意味着没有非标准属性流向 JWT。

### Entra ID (Azure)

有关其他信息，请参阅 Microsoft 的 [documentation](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-sso)。

<div id="create-application-entra-id"></div>
**第 1 步：创建新的 Entra ID 应用程序集成**

1. 使用特权角色（例如`Global Administrator`）登录[Azure portal](https://portal.azure.com/#home)。在左侧导航窗格中，选择`Entra ID`服务。

2. 导航到 **企业应用程序**，然后选择 **所有应用程序**。

3. 单击**创建您自己的应用程序**。4. 在 **创建您自己的应用程序** 窗口中：

   1. 输入应用程序的名称（例如，`LangSmith`）。
   2. 选择**集成您在库中找不到的任何其他应用程序（非库）**。

5. 单击“**创建**”。

**步骤 2：配置 Entra ID 应用程序并获取 SAML 元数据**

1. 打开您创建的企业应用程序。

2. 在左侧导航栏中，选择**管理** > **单点登录**。

3. 在单点登录页面上，单击“**SAML**”。

4. 更新**基本 SAML 配置**：

   1.`Identifier (Entity ID)`：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/metadata" />

   2.`Reply URL (Assertion Consumer Service URL)`：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/acs" />

   3. 将`Relay State`、`Logout Url`、`Sign on URL` 留空。
   4. 单击“**保存**”。

5. 确保所需的声明存在于 **命名空间**：`http://schemas.xmlsoap.org/ws/2005/05/identity/claims`：

   1.`sub`：`user.objectid`。
   2. `emailaddress`：`user.userprincipalname` 或`user.mail`（如果使用后者，请确保所有用户都在`Contact Information` 下填写了`Email` 字段）。
   3.（可选）对于SCIM，有关`Unique User Identifier (Name ID)`的具体说明请参阅[setup documentation](/langsmith/user-management)。

6. 在基于 SAML 的登录页面上的 **SAML 证书** 下，复制 **应用程序联合元数据 URL**。

**步骤 3：设置 LangSmith SSO 配置**

使用上一步中的元数据 URL，按照 `Fill in required information` 步骤中的 [initial configuration](#initial-configuration) 下的说明进行操作。**步骤 4：验证 SSO 设置**

1. 将应用程序分配给 Entra ID 中的用户/组：

   1. 选择 **管理** > **用户和组**。

   2. 单击“**添加用户/组**”。

   3. 在 **添加分配** 窗口中：

      1. 在“**用户**”下，单击“**未选择**”。
      2. 搜索要分配给企业应用程序的用户，然后单击“**选择**”。
      3. 验证是否已选择该用户，然后单击“**分配**”。

2. 让用户通过 **SSO 配置** 页面中的唯一登录 URL 登录，或转到 **管理** > **单点登录** 并选择 **使用（应用程序名称）测试单点登录**。

### 谷歌

有关更多信息，请参阅 Google 的 [documentation](https://support.google.com/a/answer/6087519)。

**第 1 步：创建并配置 Google Workspace SAML 应用程序**

1. 确保您已登录具有适当权限的管理员帐户。

2. 在管理控制台中，转至 **菜单** -> **应用程序** -> **网络和移动应用程序**。

3. 单击“**添加应用程序**”，然后单击“**添加自定义 SAML 应用程序**”。

4. 输入应用程序名称，还可以选择上传图标。单击**继续**。

5. 在 Google 身份提供商详细信息页面上，下载 **IDP 元数据** 并保存以用于第 2 步。点击 **继续**。6. 在`Service Provider Details`窗口中输入：

   1.`ACS URL`：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/acs" />

   2.`Entity ID`：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/metadata" />

   3. 将`Start URL`和`Signed response`框留空。
   4. 将 `Name ID` 格式设置为 `EMAIL` 并将 `Name ID` 保留为默认值 (`Basic Information > Primary email`)。
   5. 点击`Continue`。

7. 使用 `Add mapping` 确保存在所需的声明：
   1. `Basic Information > Primary email` -> `email`

**步骤 2：设置 LangSmith SSO 配置**

按照 `Fill in required information` 步骤中的 [initial configuration](#initial-configuration) 下的说明进行操作，使用上一步中的 `IDP metadata` 作为元数据 XML。

**第 3 步：在 Google 中打开 SAML 应用程序**

1. 选择`Menu -> Apps -> Web and mobile apps`下的SAML应用程序

2. 点击`User access`。

3.开启服务：

   1. 要为组织中的每个人启用该服务，请单击 `On for everyone`，然后单击 `Save`。

   2. 要为组织部门启用服务：

      1. 在左侧选择组织单位，然后选择`On`。
      2. 如果服务状态设置为`Inherited`，并且您想要保留更新的设置，即使父设置发生更改，请单击`Override`。
      3. 如果服务状态设置为 `Overridden`，请单击 `Inherit` 恢复为其父级相同的设置，或单击 `Save` 保留新设置，即使父级设置发生更改也是如此。3. 要为跨组织部门或组织部门内的一组用户启用服务，请选择访问组。详情请参阅[Use groups to customize service access](https://support.google.com/a/answer/9050643)。

4. 确保您的用户用于登录 LangSmith 的电子邮件地址与他们用于登录您的 Google 域的电子邮件地址匹配。

**步骤 4：验证 SSO 设置**

让具有访问权限的用户通过 **SSO 配置** 页面中的唯一登录 URL 登录，或转到 Google 中的 SAML 应用程序页面并单击 **TEST SAML LOGIN**。

### 奥克塔

#### 支持的功能

- IdP 发起的 SSO（单点登录）
- SP发起的SSO
- 即时配置
- 仅强制执行 SSO

#### 配置步骤

有关更多信息，请参阅 Okta 的 [documentation](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm)。

**步骤 1：创建并配置 Okta SAML 应用程序**

<div id="via-okta-integration-network">
    <b>通过 Okta 集成网络（推荐）</b>
</div>1. 登录[Okta](https://login.okta.com/)。
1. 在右上角，选择“管理”。从管理区域看不到该按钮。
1. 选择`Browse App Integration Catalog`。
1. 找到并选择LangSmith应用程序。
1. 在应用程序概览页面上，选择“添加集成”。
1. 将`ApiUrlBase`留空。
1.填写`AuthHost`：
    {/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}

<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>1. （可选，如果也打算使用[SCIM](#set-up-scim-for-your-organization)）填写`LangSmithUrl`：
    {/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}

<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>
1. 在“应用程序可见性”下，保持复选框处于未选中状态。
1. 选择下一步。
1. 选择`SAML 2.0`。
1.填写`Sign-On Options`：
   - `Application username format`：`Email`
   - `Update application username on`: `Create and update`
1. 从 **登录选项** 页面复制 **元数据 URL** 以在下一步中使用。

**通过自定义应用程序集成**

<Warning>
SCIM 与此配置方法不兼容。请参阅[**Via Okta Integration Network**](#via-okta-integration-network)。
</Warning>1. 以管理员身份登录 Okta，然后转至 **Okta 管理控制台**。

2. 在**应用程序** > **应用程序**下，单击**创建应用程序集成**。

3. 选择**SAML 2.0**。

4. 输入`App name`（例如`LangSmith`）和可选的**应用程序徽标**，然后单击**下一步**。

5. 在 **配置 SAML** 页面中输入以下信息：

   1.`Single sign-on URL`（`ACS URL`）。保持`Use this for Recipient URL and Destination URL`选中：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/acs" />

   2.`Audience URI (SP Entity ID)`：
      <SaasRegionUrls prefix="auth" suffix="/auth/v1/sso/saml/metadata" />

   3. `Name ID format`：**持久**。
   4.`Application username`：`email`。
   5. 将其余字段留空或设置为默认值。
   6. 单击“**下一步**”。

6. 单击“**完成**”。

7. 从 **登录** 页面复制 **元数据 URL** 以在下一步中使用。

**步骤 2：设置 LangSmith SSO 配置**

使用上一步中的元数据 URL，按照 **填写所需信息** 步骤中的 [initial configuration](#initial-configuration) 下的说明进行操作。

**步骤 3：将用户分配给 Okta 中的LangSmith**

1. 在 **应用程序** > **应用程序** 下，选择在步骤 1 中创建的 SAML 应用程序。
2. 在“**分配**”选项卡下，单击“**分配**”，然后单击“**分配给人员**”或“**分配给组**”。
3. 进行所需的选择，然后**分配**和**完成**。

**步骤 4：验证 SSO 设置**让具有访问权限的用户通过 `SSO Configuration` 页面中的唯一登录 URL 登录，或者让用户从其 Okta 仪表板中选择应用程序。

#### SP 发起的 SSO

配置服务提供商发起的 SSO 后，用户可以使用唯一的登录 URL 登录。您可以在 LangSmith UI 中的 **组织成员和角色** 然后 **SSO 配置** 下找到它。

## 为您的组织设置 SCIM

<Note>
正在寻找 SCIM 的轻量级替代方案，不需要 IdP 管理员参与来推送组？请参阅下面的[SSO Groups Sync](#sso-groups-sync-alternative)，它在登录时直接从 SSO 令牌读取组成员身份，并重用相同的命名约定。
</Note>

跨域身份管理系统 (SCIM) 是一个开放标准，允许用户配置自动化。使用 SCIM，您可以自动在 LangSmith [organization and workspaces](/langsmith/administration-overview) 中配置和取消配置用户，使用户访问与组织的身份提供商保持同步。

<Note>
SCIM 适用于 [Enterprise plan](https://www.langchain.com/pricing) 上的组织。 [Contact sales](https://www.langchain.com/contact-sales) 了解更多。

SCIM 可用于 Helm 图表版本 0.10.41（应用程序版本 0.10.108）及更高版本。

SCIM 支持仅限 API（请参阅下面的说明）。
</Note>SCIM 消除了手动用户管理的需要，并确保用户访问始终与组织的身份系统保持同步。这允许：

- **自动用户管理**：根据用户在 IdP 中的状态，自动从 LangSmith 添加、更新和删除用户。
- **减少管理开销**：无需跨多个系统手动管理用户访问。
- **提高安全性**：离开组织的用户将自动从 LangSmith 取消配置。
- **一致的访问控制**：用户属性和组成员身份在系统之间同步。
- **扩展团队访问控制**：有效管理具有许多工作区和自定义角色的大型团队。
- **角色分配**：为用户组选择特定的 [Organization Roles](/langsmith/rbac#organization-roles) 和 [Workspace Roles](/langsmith/rbac#workspace-roles)。

### 要求

#### 先决条件- 您的组织必须采用企业计划。
- 您的身份提供商 (IdP) 必须支持 SCIM 2.0。
- 只有[Organization Admins](/langsmith/administration-overview#organization-roles)可以配置SCIM。
- 对于云客户：[SAML SSO](#set-up-saml-sso-for-your-organization) 必须可针对您的组织进行配置。
- 对于自托管客户：必须启用[OAuth with Client Secret](/langsmith/self-host-sso#with-client-secret-recommended)身份验证模式。
- 对于自托管客户，必须允许从身份提供商到LangSmith的网络流量：
  - Microsoft Entra ID 支持将 IP 范围列入白名单或基于代理的解决方案来提供连接。
    （[details](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups#ip-ranges)）。
  - Okta 支持将 IP 或域列入允许列表 ([details](https://help.okta.com/en-us/content/topics/security/ip-address-allow-listing.htm))
    或基于代理的解决方案 ([details](https://help.okta.com/en-us/content/topics/provisioning/opp/opp-main.htm)) 来提供连接。

<Note>
SCIM 连接通常需要 HTTP/1.1 或更高版本。如果您的客户端使用 HTTP/1.0，您可能会遇到 `426 Upgrade Required` 错误。
</Note>

#### 角色优先级

当用户属于同一工作区的多个组时，以下优先级适用：

1. **组织管理员组** 具有最高优先级。这些组中的用户在所有工作区中都将是 `Admin`。
2. **最近创建的工作区特定组** 优先于其他工作区组。<Note>
当删除组或从组中删除用户时，他们的访问权限将根据其剩余的组成员身份并遵循优先规则进行更新。

SCIM 组成员身份会覆盖手动分配的角色或通过即时 (JIT) 配置分配的角色。我们建议禁用 JIT 配置以避免冲突。更多详情请参考[Manage user access in SSO organizations](/langsmith/jit-invite-sso#scim-integration)。
</Note>

#### 电子邮件验证

仅在云中，使用 SCIM 创建新用户会触发向该用户发送电子邮件。
他们必须通过单击此电子邮件中的链接来验证其电子邮件地址。
该链接将在 24 小时后过期，如果需要，可以通过 SCIM 删除并重新添加用户来重新发送。

### 属性和映射

#### 组命名约定

<Warning>
SCIM **不**支持重命名组。组名称是持久的，因为它们必须与 LangSmith 中的角色名称和/或工作区名称匹配。
</Warning>

组成员身份映射到具有特定命名约定的LangSmith工作区成员身份和工作区角色。默认情况下，组件之间的分隔符是冒号 (`:`)，但您可以为您的组织使用 [configure a custom separator](#configure-custom-separator)。<Note>
您可以省略组名称的 **组织角色名称** 部分中的空格。这有助于不允许组名称中存在空格的身份提供商。例如，LangSmith 接受 `OrganizationAdmins` 和 `OrganizationUser` 作为 `Organization Admins` 和 `Organization User` 的等效项。这种灵活性仅适用于组织角色名称令牌。工作空间名称和工作空间角色名称将空格视为文字字符，因此省略空格的变体与其空格对应的变体不匹配。
</Note>

**组织管理组**

格式：`<optional_prefix>Organization Admin`或`<optional_prefix>Organization Admins`

示例：

- `LS:Organization Admins`
- `LS:OrganizationAdmins`（省略空格 - 对于不允许组名称中包含空格的 IdP 很有用）
- `Groups-Organization Admins`
- `Organization Admin`

**工作空间特定组**

格式：`<optional_prefix><org_role_name><separator><workspace_name><separator><workspace_role_name>`

分隔符默认为 `:`（冒号）。支持的分隔符有：`:`（冒号）、`-`（连字符）、`_`（下划线）、` `（空格）、`&`（与符号）。

使用默认冒号分隔符的示例：

- `LS:Organization User:Production:Annotators`
- `LS:OrganizationUser:Production:Annotators`（角色名称标记中省略空格）
- `Groups-Organization User:Engineering:Developers`
- `Organization User:Marketing:Viewers`

带连字符分隔符的示例：

- `LS-Organization User-Production-Annotators`
- `LS-OrganizationUser-Production-Annotators`（角色名称标记中省略空格）
- `Organization User-Engineering-Developers`<Note>
如果您的工作区名称包含分隔符（例如，工作区 `my-team` 带有分隔符 `-`），LangSmith 将自动尝试所有可能的拆分以找到有效的工作区和角色组合。
</Note>

#### 配置自定义分隔符

要更改您组织的 SCIM 组名称分隔符，请使用 `PATCH /api/v1/orgs/current/info` [endpoint](/langsmith/smith-api/orgs/update-current-organization-info)。对于区域 SaaS 部署，请将请求发送到区域主机上的同一路径（`eu.api.smith.langchain.com`、`apac.api.smith.langchain.com` 或 `aws.api.smith.langchain.com`）：

```bash
curl -X PATCH $LANGCHAIN_ENDPOINT/api/v1/orgs/current/info \
  -H "X-Api-Key: $LANGCHAIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scim_group_name_separator": "-"}'
```

分隔符必须是单个字符且为以下字符之一：`:`（冒号）、`-`（连字符）、`_`（下划线）、` `（空格）或 `&`（与号）。默认值为 `:`（冒号）。

<Note>
更改分隔符不会重命名现有 SCIM 组。如果更改分隔符，您还必须更新身份提供商中的组名称才能使用新的分隔符。
</Note>

### 映射

虽然具体说明取决于身份提供商可能会有所不同，但这些映射显示了 LangSmith SCIM 集成支持的内容：

#### 用户属性| **LangSmith 应用程序属性** | **身份提供商属性** | **匹配优先级** |
| ------------------------------------------ | ---------------------------------------------------------------- | ----------------------- |
| `userName`<sup>1</sup> |电子邮件地址 |                         |
| `active` | `!deactivated` |                         |
| `emails[type eq "work"].value` |电子邮件地址<sup>2</sup> |                         |
| `name.formatted` | `displayName` 或 `givenName + familyName`<sup>3</sup> |                         |
| `givenName` | `givenName` |                         |
| `familyName` | `familyName` |                         |
| `externalId` | `sub`<sup>4</sup> | 1 |1. LangSmith 不需要`userName`
1. 电子邮件地址为必填项
1. 如果您的`displayName`与`Firstname Lastname`的格式不匹配，请使用计算表达式
1. 为避免不一致，这应与云客户的 SAML `NameID` 断言或自托管的 `sub` OAuth2.0 声明相匹配。

#### 组属性

| **LangSmith 应用程序属性** | **身份提供商属性** | **匹配优先级** |
| ------------------------ | | ------------------------------------------- | ----------------------- |
| `displayName` | `displayName`<sup>1</sup> | 1 |
| `externalId` | `objectId` |                         |
| `members` | `members` |                         |

1. 组必须遵循 [Group Naming Convention](#group-naming-convention) 部分中描述的命名约定。
   如果您的公司有组命名策略，您应该从 `description` 身份提供商属性进行映射，并
   根据[Group Naming Convention](#group-naming-convention)部分设置描述。

### 步骤 1 - 配置 SAML SSO（仅限云）

[SAML SSO](#set-up-saml-sso-for-your-organization)配置有两种场景：1. 如果您的组织已配置 SAML SSO，则您应跳过最初添加应用程序（[Add application from Okta Integration Network](#add-application-okta-oin) 或 [Create a new Entra ID application integration](#create-application-entra-id)）的步骤，因为您已经配置了应用程序，只需启用配置。
1. 如果您是首次与 SCIM 一起配置 SAML SSO，请首先按照[set up SAML SSO](#set-up-saml-sso-for-your-organization) 的说明进行操作，然后按照此处的说明来启用 SCIM。

#### 名称 ID 格式

LangSmith 使用 SAML NameID 来识别用户。 NameID 是 SAML 响应中的必填字段，并且不区分大小写。

NameID 必须：

1. 对于每个用户来说都是唯一的。
2. 是一个永不改变的持久值，例如随机生成的唯一用户ID。
3. 每次登录尝试都精确匹配。它不应该依赖于用户输入。

NameID 不应该是电子邮件地址或用户名，因为电子邮件地址和用户名更有可能随着时间的推移而发生变化，并且可能区分大小写。

NameID 格式必须为 `Persistent`，除非您使用的字段（例如电子邮件）需要不同的格式。

### 步骤 2 - 禁用 JIT 配置

在启用 SCIM 之前，请禁用 [Just-in-time (JIT) provisioning](/langsmith/jit-invite-sso#jit-provisioning) 以防止自动和手动用户配置之间的冲突。

#### 禁用云 JIT使用`PATCH /orgs/current/info`[endpoint](/langsmith/smith-api/orgs/update-current-organization-info)。对于区域 SaaS 部署，将请求发送到区域主机上的同一路径（`eu.api.smith.langchain.com`、`apac.api.smith.langchain.com` 或 `aws.api.smith.langchain.com`）：

```bash
curl -X PATCH $LANGCHAIN_ENDPOINT/orgs/current/info \
  -H "X-Api-Key: $LANGCHAIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jit_provisioning_enabled": false}'
```

#### 禁用自托管的 JIT

从 LangSmith 图表版本 **0.11.14** 开始，您可以使用 SSO 为自托管组织禁用 JIT 配置。要禁用，请设置以下值：

```yaml
commonEnv:
  - name: SELF_HOSTED_JIT_PROVISIONING_ENABLED
    value: "false"
```

### 步骤 3 - 生成 SCIM 不记名令牌

<Note>
在自托管环境中，下面的完整 URL 可能类似于 `https://langsmith.yourdomain.com/api/v1/platform/orgs/current/scim/tokens`（没有子域，请注意 `/api/v1` 路径前缀）或 `https://langsmith.yourdomain.com/subdomain/api/v1/platform/orgs/current/scim/tokens`（带有子域） - 请参阅 [ingress docs](/langsmith/self-host-ingress) 了解更多详细信息。
</Note>

为您的组织生成 SCIM 不记名令牌。您的 IdP 将使用此令牌来验证 SCIM API 请求。确保正确设置环境变量，例如：

```bash
curl -X POST $LANGCHAIN_ENDPOINT/v1/platform/orgs/current/scim/tokens \
  -H "X-Api-Key: $LANGCHAIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"description": "Your description here"}'
```

请注意，SCIM 承载令牌值在对此请求的响应之外不可用。存在这些额外的端点：

- `GET /v1/platform/orgs/current/scim/tokens`
- `GET /v1/platform/orgs/current/scim/tokens/{scim_token_id}`
- `PATCH /v1/platform/orgs/current/scim/tokens/{scim_token_id}`（仅支持`description`字段）
- `DELETE /v1/platform/orgs/current/scim/tokens/{scim_token_id}`

### 第 4 步 - 配置您的身份提供商<Note>
如果您使用 Azure Entra ID（以前称为 Azure AD）或 Okta，则有身份提供程序设置的具体说明（请参阅[Azure Entra ID](#azure-entra-id-configuration-steps)、[Okta](#okta)）。上述要求和步骤适用于所有身份提供商。
</Note>

#### Azure entra ID 配置步骤

有关其他信息，请参阅 Microsoft 的 [documentation](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/user-provisioning)。

<Note>
在自托管安装中，`oid` JWT 声明用作`sub`。
参见[this Microsoft Learn link](https://learn.microsoft.com/en-us/answers/questions/5546297/how-to-link-oidc-users-with-scim)
和 [the related configuration instructions](/langsmith/self-host-sso#override-sub-claim) 了解更多详细信息。
</Note>

**步骤 1：在企业应用程序中配置 SCIM**

1. 使用特权角色（例如`Global Administrator`）登录[Azure portal](https://portal.azure.com/#home)。
2. 导航到您现有的 LangSmith 企业应用程序。
3. 在左侧导航中，选择**管理** > **配置**。
4. 单击**开始**。

**步骤 2：配置管理员凭据**

1. 在**管理员凭据**下：

   - **租户网址**：

     <SaasRegionUrls prefix="api.smith" suffix="/scim/v2" />

     - 自托管：`<langsmith_url>/scim/v2`

   - **秘密令牌**：输入在步骤 3 中生成的 SCIM 承载令牌。

2. 单击“**测试连接**”以验证配置。

3. 单击“**保存**”。

**步骤 3：配置属性映射**

在`Mappings`下配置以下属性映射：

**用户属性**将 **目标对象操作** 设置为 `Create` 和 `Update`（为了安全起见，从禁用 `Delete` 开始）：

| **LangSmith 应用属性** | **Microsoft Entra ID 属性** | **匹配优先级** |
| :--------------------------: | :----------------------------------------------------: | :----------------------: |
| `userName` | `userPrincipalName` |                         |
| `active` | `Not([IsSoftDeleted])` |                         |
| `emails[type eq "work"].value` | `mail`1 |                         |
| `name.formatted` | `displayName` 或 `Join(" ", [givenName], [surname])`2 |                         |
| `externalId` | `objectId`3 | 1 |

1. Entra ID 中必须存在用户的电子邮件地址。
2. 如果您的`displayName` 与`Firstname Lastname` 的格式不匹配，请使用`Join` 表达式。
3. 为了避免不一致，这应该与 SAML NameID 断言和 `sub` OAuth2.0 声明相匹配。对于云中的 SAML SSO，所需的 `Unique User Identifier (Name ID)` 声明应为 `user.objectID`，`Name identifier format` 应为 `persistent`。

**组属性**仅将 **目标对象操作** 设置为 `Create` 和 `Update`（为了安全起见，从禁用 `Delete` 开始）：

| **LangSmith 应用程序属性** | **Microsoft Entra ID 属性** | **匹配优先级** |
| :--------------------------: | :--------------------------------: | :----------------------: |
| `displayName` | `displayName`1 | 1 |
| `externalId` | `objectId` |                         |
| `members` | `members` |                         |

1. 组必须遵循 [Group Naming Convention](#group-naming-convention) 部分中描述的命名约定。
   如果您的公司有组命名策略，您应该从 `description` Microsoft Entra ID 属性进行映射，并
   根据[Group Naming Convention](#group-naming-convention)部分设置描述。

**步骤 4：分配用户和组**

1. 在 **应用程序** > **应用程序** 下，选择您的 LangSmith 企业应用程序。
2. 在“**分配**”选项卡下，单击“**分配**”，然后单击“**分配给人员**”或“**分配给组**”。
3. 进行所需的选择，然后**分配**和**完成**。

**步骤 5：启用配置**1. 在**配置**下将**配置状态**设置为`On`。
2. 监控初始同步以确保正确配置用户和组。
3. 验证后，为用户和组映射启用 `Delete` 操作。

故障排除请参考[SAML SSO FAQs](/langsmith/faq#saml-sso-faqs)。如果您在设置 SCIM 时遇到问题，请通过 [support.langchain.com](https://support.langchain.com) 联系 LangChain 支持团队。

#### Okta 配置步骤

<Note>
您必须使用[Okta Lifecycle Management](https://www.okta.com/products/lifecycle-management/)产品。在 Okta 上使用 SCIM 需要此产品层。
</Note>

<div id="supported-features">
    <b>支持的功能</b>
</div>

- 创建用户
- 更新用户属性
- 停用用户
- 群组推送（**无需群组重命名**）
- 导入用户
- 导入组

<div id="add-application-okta-oin">
    <b>第 1 步：从 Okta 集成网络添加应用程序</b>
</div>

<Note>
如果您已经通过 SAML（云）或使用 OIDC（自托管）的 OAuth2.0 配置了 SSO 登录，请跳过此步骤。
</Note>

对于云，请参阅 [SAML SSO setup](#okta)；对于自托管，请参阅 [OAuth2.0 setup](/langsmith/self-host-sso#okta-idp-setup)。

**步骤 2：配置 API 集成**1. 在常规选项卡中，确保按照[Step 1](#add-application-okta-oin)的说明填写`LangSmithUrl`
1. 在“配置”选项卡中，选择 `Integration`。
1. 选择`Edit`，然后选择`Enable API integration`。
1. 对于 API 令牌，粘贴您的 SCIM 令牌[generated above](#step-3-generate-scim-bearer-token)。
1. 勾选`Import Groups`。
1. 要验证配置，请选择测试 API 凭据。
1. 选择保存。
1. 保存 API 集成详细信息后，左侧会出现新的设置选项卡。选择`To App`。
1. 选择编辑。
1. 选中创建用户、更新用户和停用用户的启用复选框。
1. 选择保存。
1. 在“分配”选项卡中分配用户和/或组。分配的用户在您的 LangSmith 组中创建和管理。

**步骤 3：配置用户配置设置**

1. 配置开通：在`Provisioning > To App > Provisioning to App`下，单击`Edit`，然后勾选`Create Users`、`Update User Attributes`、`Deactivate Users`。
1. 在`<application_name> Attribute Mappings`下，设置用户属性映射，如下所示，删除其余内容：

![SCIM Okta User Attributes Mapping](/langsmith/images/scim_okta_user_attributes.png)

**第 4 步：推送组**

<Note>
Okta 不支持除组名称本身之外的组属性，因此组名称必须遵循 [Group Naming Convention](#group-naming-convention) 部分中描述的命名约定。
</Note>

按照 Okta 的 [Enable Group Push](https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-enable-group-push.htm) 说明将组配置为按名称或按规则推送。

#### 其他身份提供商其他身份提供商尚未经过测试，但可能会根据其 SCIM 实现而发挥作用。

### SSO 组同步（替代）

<Note>
SSO 组同步适用于配置了 SAML SSO（云）或 OIDC（自托管）的 [Enterprise plan](/langsmith/pricing-plans) 上的组织。 [Contact sales](https://www.langchain.com/contact-sales) 了解更多。
</Note>

对于无法或不愿配置 SCIM 组推送的组织来说，SSO 组同步是[SCIM](#set-up-scim-for-your-organization) 的更简单替代方案。 LangSmith 不是在单独的同步间隔将组从 IdP 推送到 LangSmith，而是在登录时直接从 SSO 令牌中的可配置声明读取组成员资格，并使用与 SCIM 相同的 [naming convention](#group-naming-convention) 应用组织级别和工作区级别角色分配。

#### 何时使用 SSO 组同步与 SCIM

SSO 组同步和 SCIM 在技术上可以共存（每个仅管理用自己的配置方法标记的身份），但我们建议选择**每个组织一种机制**，而不是同时选择两者，以避免混淆优先行为。| | SSO 组同步 | SCIM |
| ---| ---| ---|
| **同步触发** |每次 SSO 登录时 |来自 IdP 的主动推送（大约 1 小时节奏）|
| **IdP 管理员参与** |最少，只需在 SSO 令牌中包含组 |必需，配置 SCIM 配置应用程序 |
| **取消配置** |延迟到下次登录 |通过 IdP 推送实现近乎实时 |
| **命名约定** |重复使用[SCIM convention](#group-naming-convention) | [SCIM convention](#group-naming-convention) |
| **自定义分隔符** |重用组织级别 [⟦T237⟧](#configure-custom-separator) | [⟦T238⟧](#configure-custom-separator) |

当 IdP 管理员参与最少且反应性（登录时）同步可接受时，选择 **SSO 组同步**。当需要主动配置/取消配置以及近乎实时的组成员身份更新时，选择 **SCIM**。

#### 配置

1. 在您的 IdP 中：将用户的组成员身份添加到 SSO 令牌声明（默认声明名称：`groups`）。组名称必须遵循[SCIM naming convention](#group-naming-convention)。
2. 在 LangSmith 中：转到 **设置** → **成员和角色** → **SSO 配置** → **SSO 组同步** 并配置以下内容：|设置|描述 |
   | ---| ---|
   | **启用 SSO 组同步** |根据 SSO 令牌中的组成员身份自动分配工作区角色。 |
   | **群组声明字段**（默认`groups`）|包含组成员资格的 SSO 令牌中的声明名称。 |
   | **同步工作区/角色分配** |根据每个 SSO 登录上的组名称更新工作区成员身份和角色。 |
   | **需要匹配的组才能登录** |如果 SSO 令牌不包含与命名约定匹配的组，则阻止登录。 |

您还可以通过 API 将 `PATCH` 发送到 SSO 设置端点来配置这些设置：

```bash
curl -X PATCH $LANGCHAIN_ENDPOINT/api/v1/orgs/current/sso-settings/$SSO_PROVIDER_ID \
  -H "X-Api-Key: $LANGCHAIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sso_groups_enabled": true,
    "sso_groups_claim_field": "groups",
    "sso_groups_role_sync_enabled": true,
    "sso_groups_required": false
  }'
```

<Warning>
禁用 SSO 组同步不会删除现有访问权限。 SSO 组配置的用户将保留当前访问权限，直到下次登录。
</Warning>

#### 配置您的 IdP 以发出组 SAML 属性（云）

<Note>
本节仅适用于**企业云**。自托管客户直接在其 OIDC IdP 中配置组，请参阅 [SSO Groups Sync on self-hosted](/langsmith/self-host-sso#sso-groups-sync)。
</Note>

要使用户的组成员身份在登录时对 LangSmith 可见，您需要做两件事：1. 配置 IdP 的 SAML 应用程序以发出多值组属性。
2. 将匹配条目添加到 [Supabase Attribute Mapping](#supabase-attribute-mapping)，以便属性流向 JWT（选中 **Array**）。

**要求：**

- IdP 属性名称（例如 `groups`）必须与 **Supabase 属性映射** 条目和 **组声明字段** 值匹配（默认 `groups`）。
- 该属性必须是**多值**（字符串列表），而不是单个分隔字符串。如果您的 IdP 仅支持单值属性，则您需要为每组发出一个属性语句。
- 每个值必须是[SCIM naming convention](#group-naming-convention)后面的组名称。
- 仅处理名称符合约定的组。 LangSmith 忽略与其命名约定不匹配的组，例如组织范围的目录组或应用程序分配组。您无需在 IdP 端过滤掉这些组 - 发出所有组，LangSmith 将跳过不相关的组。

**每个 IdP 设置：**

<Tabs>
<Tab title="Okta">

在 LangSmith SAML 应用程序中：1. **目录** → **配置文件编辑器** → 选择 LangSmith 应用程序的用户配置文件。
2. 添加名为 `groups` 且 **Type** `string array` 的自定义属性。
3. **登录** → 编辑 SAML 设置并添加属性语句：
   - **姓名**：`groups`
   - **名称格式**：`Unspecified`（或`Basic`）
   - **过滤器**：`Matches regex` 和 `.*` 发送所有组，或使用更具限制性的正则表达式（例如 `^LS:.*`）来限制以 LangSmith 为前缀的组。

</Tab>
<Tab title="Entra ID (Azure)">

在LangSmith企业应用程序中：

1. **单点登录** → **属性和声明** → **添加群组声明**。
2. 选择要发出的组（通常是**分配给应用程序的组**）。
3. 将 **Source 属性** 设置为 `Cloud-only group display names`，以便发送组名称（必须与 [naming convention](#group-naming-convention) 匹配）而不是对象 ID。
4. 将声明 **名称** 设置为 `groups`（或您配置的 **组声明字段** 值），不带命名空间。

</Tab>
<Tab title="Google Workspace">

Google 的 SAML SSO 本身并不将 Google 群组成员资格作为 SAML 属性发出。要将 SSO Groups Sync 与 Google Workspace 结合使用，您必须：

- 通过目录同步工具管理组成员身份，该工具将组公开为 SAML 属性，或者
- 请改用[SCIM](#set-up-scim-for-your-organization)，它支持 Google Workspace 的群组推送。</Tab>
</Tabs>

#### 组命名示例

组名称遵循[SCIM naming convention](#group-naming-convention)。 `<workspace_role>` 段接受内置角色和 [custom workspace roles](/langsmith/rbac#custom-roles) 按名称。

|意向 |群组名称示例 |
| ---| ---|
|组织管理员（授予所有工作区中的工作区管理员权限）| `LS:Organization Admins` |
| `Production` 中的工作区管理员 | `LS:Organization User:Production:Admin` |
| `Engineering` 中的工作区编辑器 | `LS:Organization User:Engineering:Editor` |
| `Marketing` 中的工作区查看器 | `LS:Organization User:Marketing:Viewer` |
| `Production` 中的自定义角色`Annotators` | `LS:Organization User:Production:Annotators` |

#### 行为

- **命名约定**：组名称遵循与 SCIM 相同的格式（例如，`LS:Organization Admins` 表示组织管理员，`LS:Organization User:Production:Editor` 表示工作区范围）。完整格式请参见[Group naming convention](#group-naming-convention)。分隔符通过 [⟦T267⟧](#configure-custom-separator) 按组织进行配置，并与 SCIM 共享。
- **格式错误的组名称**：不符合约定的组名称将被静默跳过（记录），并且不会阻止有效组的登录。
- **登录门**：当启用**需要匹配组登录**且 SSO 令牌包含零个匹配组时，登录将被阻止。
- **优先**：SSO 组同步不会修改 SCIM 来源、手动分配或 JIT 配置的成员资格。它对自己的分配具有完全的权威性，并在每次登录时根据令牌的组成员身份替换它们。- **组织管理员传播**：如果用户从其组收到组织管理员角色，他们将被授予所有工作区中的工作区管理员权限（与 SCIM 行为相同）。

#### 注意事项

- **取消配置滞后**：与 SCIM（主动推送）不同，SSO 组同步仅在登录时更新。从 IdP 中的组中删除的用户将保留其现有工作区访问权限，直到下次 LangSmith 登录。 **需要匹配组才能登录** 门通过在下次登录时完全阻止用户来缓解这种情况。
- **无追溯同步**：更改角色映射或启用该功能不会更新现有用户，直到他们再次登录。
- **需要命名约定**：客户必须按照 SCIM 约定命名其 IdP 组。如果您的 IdP 组遵循不同的命名策略，则具有基于 `description` 的映射（请参阅 [Group attributes](#group-attributes)）的 SCIM 可能更适合。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/user-management.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>