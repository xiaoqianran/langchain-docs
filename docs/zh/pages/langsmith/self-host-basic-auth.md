<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Basic authentication with email and password | https://docs.langchain.com/langsmith/self-host-basic-auth -->

# 使用电子邮件和密码进行基本身份验证

基本身份验证允许用户使用电子邮件和密码登录LangSmith[Self-hosted](/langsmith/self-hosted)，而无需配置外部身份提供商。 [Organization Admins](/langsmith/rbac#organization-admin)直接从LangSmith管理用户，因此身份验证运行独立，不依赖于[OAuth or SSO](/langsmith/self-host-sso)。

<Tip>
有关LangSmith自托管中支持的身份验证方法的说明，请参阅[Authentication methods](/langsmith/authentication-methods#self-hosted)页面。
</Tip>

## 注意事项

- 您可以通过交换配置参数将基本身份验证安装升级到[OAuth with client secret](/langsmith/self-host-sso#with-client-secret-recommended)，但无法从任何 OAuth 模式切换回基本身份验证。
- 您无法在基本身份验证和使用 PKCE（已弃用）的 OAuth 之间进行任意方向的切换。
- 新的基本身份验证安装需要全新安装，包括单独的 PostgreSQL 数据库/架构，除非从现有 [None](/langsmith/authentication-methods#none) 身份验证安装迁移（请参阅 [Migrating from none auth](#migrating-from-none-auth)）。
- 用户在受到邀请时会收到自动生成的初始密码，该密码必须在带外与他们共享。任何组织管理员都可以稍后更改此密码。
- 您不能同时启用基本身份验证和使用客户端密钥的 OAuth。- 所有基本身份验证用户共享一个在安装时配置的 `Default` [organization](/langsmith/administration-overview#organizations)。不支持创建其他组织。

## 要求和特点

- 您的初始密码长度必须至少为12个字符，且至少包含一个小写字母、大写字母和符号（参考[Configuration](#configuration)）。
- 用于签署 JWT 的密钥没有严格要求，但应该是安全生成的至少 32 个字符的字符串。例如，[⟦T2⟧](https://docs.openssl.org/1.0.2/man1/rand/#description)。

## 从无身份验证迁移

<Note>
仅[versions 0.7 and later](/langsmith/self-hosted-changelog)支持。
</Note>

从 [None](/langsmith/authentication-methods#none) 身份验证模式迁移到基本身份验证会保留您现有的跟踪、数据集和其他资源。 LangSmith 将单个“默认”用户替换为根据您在 [configuration file](#configuration) 中设置的基本身份验证凭据创建的用户。预先存在的工作区保留其 ID (`00000000-0000-0000-0000-000000000000`)，因此现有资源仍与其绑定。除了用户交换之外，迁移后的安装的行为与全新的基本身份验证安装相同。

要迁移，请应用[Configuration](#configuration)中所示的基本身份验证配置，然后运行`helm upgrade`。

## 配置

<Note>
更改 JWT 密码将会注销您的用户。
</Note>通过将以下块添加到您的 LangSmith Helm 值来启用基本身份验证。首次安装时，LangSmith 使用这些值为 `Default` 组织创建初始组织管理员用户：

```yaml Helm
config:
  authType: mixed
  basicAuth:
    enabled: true
    initialOrgAdminEmail: <YOUR EMAIL ADDRESS>
    initialOrgAdminPassword: <PASSWORD> # Must be at least 12 characters long and contain at least one lowercase, uppercase, and symbol
    jwtSecret: <SECRET>
```

配置完成后，LangSmith 将显示包含电子邮件和密码的登录屏幕。使用 `initialOrgAdminEmail` 和 `initialOrgAdminPassword` 值登录，您的用户将自动配置为 `Organization Admin` 角色。更多详情请参考[Organization roles](/langsmith/administration-overview#organization-roles)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-basic-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>