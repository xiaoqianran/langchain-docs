<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Recovery admin login for self-hosted SSO | https://docs.langchain.com/langsmith/self-host-sso-recovery -->

# 自托管 SSO 的恢复管理员登录

配置本地密码登录，以便组织管理员在 SSO 身份提供商不可用或配置错误时登录自托管 LangSmith。

如果您的身份提供商 (IdP) 出现故障或配置错误，[SSO login](/langsmith/self-host-sso) 将停止工作，并且任何人都无法登录。恢复管理员登录允许指定的组织管理员使用本地密码而不是通过 IdP 登录。

当每个人的 SSO 都失败时，请使用它，例如由于网络中断、证书过期、IdP 租户停用或任何一方的配置更改。它不是通用的登录方法。提前配置并仅在中断期间使用它。

> [!注意]
>
> 配置恢复管理员登录需要 v18 稳定系列上的 LangSmith 图表版本 0.18.2（应用程序版本 0.18.2026112200）或更高版本，或 v19 系列上的图表版本 0.19.0-rc.8（应用程序版本 0.19.3rc1）或更高版本。

## 先决条件* [Self-hosted](/langsmith/self-hosted) LangSmith 和 [SSO via OAuth2.0/OIDC](/langsmith/self-host-sso) 配置了客户端密钥（`authType: mixed`、`oauth.enabled: true` 和 `oauthClientSecret` 设置）。不支持使用 PKCE 的 OAuth，并且必须禁用基本身份验证。
* 现有的、已启用的组织管理员身份，已通过 SSO 进行配置。恢复管理员登录名以此身份进行身份验证；它不会创建新用户或单独的凭证存储。

## 配置恢复管理

要配置恢复管理员，请生成密码哈希，然后将哈希和管理员的电子邮件添加到您的 Helm 值中。

### 1. 生成密码哈希

> [!注意]
>
> 需要 LangSmith CLI `v0.5.1` 或更高版本。

您的 Helm 配置仅保存恢复密码的哈希值，而不是明文。使用 [LangSmith CLI](/langsmith/langsmith-cli#hash-a-recovery-password) 在本地生成 PBKDF2-SHA256 哈希：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith auth hash-password
```

该命令提示输入密码而不回显它，然后打印哈希值。它不需要登录或 API 密钥。

### 2. 设置 Helm 值

在您的 Helm 值中启用恢复管理员登录。将 `email` 设置为 [prerequisites](#prerequisites) 中的组织管理员，并提供内联或来自现有 Kubernetes 密钥的密码哈希：

> [选项卡] 内联
>
> ```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> config:
>   authType: mixed
>   oauth:
>     enabled: true
>     # ...your existing OAuth configuration
>   recoveryAdmin:
>     enabled: true
>     email: admin@example.com # Existing, enabled SSO organization admin
>     passwordHash: "pbkdf2_sha256$600000$<salt>$<hash>" # From step 1
> ```> [选项卡] 现有秘密
>
> 将哈希值添加到 `recovery_admin_password_hash` 键下的密钥中，并将 `passwordHash` 排除在您的值之外。对于该秘密保存的其他密钥，请参阅[Use an existing secret](/langsmith/self-host-using-an-existing-secret#parameters)。
>
> ```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> config:
>   existingSecretName: "langsmith-secrets"
>   recoveryAdmin:
>     enabled: true
>     email: admin@example.com
> ```
>
> 该图表不将 `email` 视为敏感，因此请始终将其设置在您的值中，即使哈希来自秘密。

如果管理员身份被禁用，或属于被禁用的组织，LangSmith 会拒绝恢复登录，就像正常登录一样。

## 断电期间登录

登录屏幕没有用于恢复管理员登录的按钮。注销后，将 `?recovery=true` 附加到您的实例 URL：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
https://langsmith.example.com/?recovery=true
```

**通过 SSO 登录**屏幕更改为电子邮件和密码表单。使用来自 `config.recoveryAdmin.email` 的电子邮件和您在步骤 1 中散列的密码登录。会话以该组织管理员的身份进行身份验证，并具有管理员的现有权限，并在 15 分钟后过期。

> [!提示]
>
> 将此 URL 记录在您的事件操作手册中。 UI 中没有任何内容链接到它。

## 另请参阅

* [Set up SSO with OAuth2.0 and OIDC](/langsmith/self-host-sso)
* [Authentication methods](/langsmith/authentication-methods)
* [Use an existing secret](/langsmith/self-host-using-an-existing-secret)
* [Disaster recovery for self-hosted LangSmith](/langsmith/self-host-disaster-recovery)
* [LangSmith CLI](/langsmith/langsmith-cli)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sso-recovery.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。