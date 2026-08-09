<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authentication methods | https://docs.langchain.com/langsmith/authentication-methods -->

# 认证方式

LangSmith 支持多种身份验证方法，方便注册和登录。

## 云

### 电子邮件/密码

用户可以使用电子邮件地址和密码注册并登录 LangSmith。

### 社交提供商

用户也可以使用来自 GitHub 或 Google 的凭据。

### SAML 单点登录

企业客户可以配置[SAML SSO](/langsmith/user-management)和[SCIM](/langsmith/user-management)。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。

## 自托管

自托管客户可以更好地控制用户登录 LangSmith 的方式。有关配置选项的更深入介绍，请参阅[the self-hosting docs](/langsmith/self-hosted)和[Helm chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith)。

### 使用 OAuth 2.0 和 OIDC 的 SSO

生产安装应配置 SSO 才能使用外部身份提供商。这使用户能够通过 Auth0/Okta 等身份平台登录。 LangSmith 支持几乎所有符合 OIDC 的提供商。了解有关在 [SSO configuration guide](/langsmith/self-host-sso) 中配置 SSO 的更多信息

### 电子邮件/密码，又称基本身份验证

此身份验证方法需要很少的配置，因为它不需要外部身份提供者。它最适合用于自托管试验。了解更多[basic auth configuration guide](/langsmith/self-host-basic-auth)

### 无

<Warning>
  基本认证上线后，该认证方式将被取消。
</Warning>如果启用零身份验证方法，则自托管安装不需要任何登录/注册。此配置仅应用于验证基础架构级别的安装，因为此模式中支持的功能集仅限于单个组织和工作区。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/authentication-methods.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>