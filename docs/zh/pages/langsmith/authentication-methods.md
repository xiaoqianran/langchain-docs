<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authentication methods | https://docs.langchain.com/langsmith/authentication-methods -->

# 认证方式

比较LangSmith在云、BYOC 和自托管部署上支持的登录方法，包括 SAML SSO、OIDC SSO 和基本身份验证。

LangSmith支持多种认证方式，方便注册和登录。

## 云

LangSmith 云支持以下登录方式。 [BYOC](/langsmith/byoc)组织通过LangSmith云控制平面登录，因此这些方法也适用于他们。

* **电子邮件和密码**：用户使用电子邮件地址和密码注册并登录LangSmith。
* **社交提供商**：用户使用其 GitHub 或 Google 凭据登录。
* **SAML SSO**：企业客户可以配置[SAML SSO](/langsmith/user-management#set-up-saml-sso-for-your-organization)和[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。
* **OIDC SSO**：企业客户可以请求 [OIDC SSO](/langsmith/user-management#set-up-oidc-sso-for-your-organization) 使用自己的 OpenID Connect 身份提供商登录。 [Contact support](https://support.langchain.com) 启用它。

## 自托管

自托管客户可以更好地控制用户如何登录LangSmith。有关配置选项的更深入介绍，请参阅[the self-hosting docs](/langsmith/self-hosted)和[Helm chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith)。

### 使用 OAuth 2.0 和 OIDC 的 SSO生产安装应配置 SSO 才能使用外部身份提供商。这使用户能够通过 Auth0/Okta 等身份平台登录。 LangSmith 支持几乎所有符合 OIDC 的提供商。了解有关在 [SSO configuration guide](/langsmith/self-host-sso) 中配置 SSO 的更多信息。如需在您的 IdP 不可用时获取紧急凭据，请参阅 [Recovery admin login](/langsmith/self-host-sso-recovery)。

### 电子邮件/密码，又称基本身份验证

此身份验证方法需要很少的配置，因为它不需要外部身份提供者。它最适合用于自托管试验。了解更多[basic auth configuration guide](/langsmith/self-host-basic-auth)

### 无

> [!警告]
>
> 基本认证上线后，该认证方式将被取消。

如果启用零身份验证方法，则自托管安装不需要任何登录/注册。此配置仅应用于验证基础架构级别的安装，因为此模式中支持的功能集仅限于单个组织和工作区。

## 另请参阅* [User management](/langsmith/user-management): Set up access control, SAML or OIDC SSO, and SCIM on LangSmith Cloud.
* [Manage user access in SSO organizations](/langsmith/jit-invite-sso)：控制 SSO 用户的 JIT 配置和邀请。
* [Set up SSO with OAuth2.0 and OIDC](/langsmith/self-host-sso): Configure SSO for a self-hosted installation.
* [Basic authentication with email and password](/langsmith/self-host-basic-auth): Configure basic auth for a self-hosted installation.
* [Bring Your Own Cloud (BYOC)](/langsmith/byoc)：了解哪些数据保留在 LangSmith 控制平面中，哪些数据保留在数据平面中。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/authentication-methods.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。