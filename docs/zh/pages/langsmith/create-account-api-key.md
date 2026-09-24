<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an account and API key | https://docs.langchain.com/langsmith/create-account-api-key -->

# 创建帐户和 API 密钥

要开始使用LangSmith，您需要创建一个帐户。您可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-create-account-api-key)注册一个免费帐户。 LangSmith 支持使用 Google、GitHub 和电子邮件登录。

## API 密钥

LangSmith 支持两种类型的 API 密钥。您可以使用这两种类型的令牌来验证对 LangSmith API 的请求，但它们有不同的用例：

- [**Personal Access Tokens (PATs)**](/langsmith/administration-overview#personal-access-tokens-pats) 继承创建它们的用户的权限。将 PAT 用于个人脚本或工具。
- [**Service keys**](/langsmith/administration-overview#service-keys) 范围为特定[workspaces](/langsmith/administration-overview#workspaces) 或整个[organization](/langsmith/administration-overview#organizations)。将服务密钥用于应用程序和生产服务。

要记录 [traces](/langsmith/observability-concepts#traces) 并使用 LangSmith 运行 [evaluations](/langsmith/evaluation)，请创建一个 API 密钥来验证您的请求。

<Steps>
  <Step title="Open API Keys settings" icon="settings">
    导航至 [**Settings** page](https://smith.langchain.com/settings) 并选择 **API Keys** 部分。
  </Step>
  <Step title="Configure the key type" icon="key">
    对于服务密钥，请在组织范围的密钥和工作区范围的密钥之间进行选择。如果密钥是工作区范围的，则必须指定工作区。[Enterprise](/langsmith/pricing-plans) 用户还可以 [assign specific workspace roles](/langsmith/administration-overview#workspace-roles-rbac) 服务密钥，这可以独立于任何用户调整其权限。
  </Step>
  <Step title="Set expiration" icon="calendar">
    设置密钥的过期时间。密钥在选择的天数后将变得不可用，或者永远不可用（如果选择了该天数）。
  </Step>
  <Step title="Create the key" icon="circle-check">
    单击 **创建 API 密钥。** LangSmith 只会显示 API 密钥一次，因此请务必复制它并将其存储在安全的地方。
  </Step>
</Steps>

<Tip>
  [Enterprise](/langsmith/pricing-plans) 组织管理员可以在现有服务密钥上编辑 [role](/langsmith/administration-overview#workspace-roles-rbac)，而无需轮换密钥。在 [**Settings** page](https://smith.langchain.com/settings) **API 密钥** 部分，切换到 **服务** 选项卡，然后单击任意服务密钥行以打开编辑对话框。更新工作区角色（对于组织范围的键，更新组织角色），然后单击 **保存**。密钥字符串本身没有改变。
</Tip>

## 停用或删除个人访问令牌

停用会暂时阻止 PAT 进行身份验证；删除将永久删除它。当您需要保留其记录并稍后重新激活它时，请停用令牌。

成员可以停用、重新激活和删除自己的 PAT。 [Organization Admins](/langsmith/rbac#organization-admin)和[Organization Operators](/langsmith/rbac#organization-operator)还可以管理每个成员的PAT。|行动|效果|双面 |
|--------|--------|------------|
| **停用** |停止身份验证并通过 **已停用** 徽章保持记录、所有者和上次使用情况可见。 |是的。选择 **重新激活密钥** 以再次使用相同的令牌。 |
| **重新激活** |允许使用相同的令牌及其原始到期日期再次进行身份验证。 |是的。随时再次停用令牌。 |
| **删除** |永久删除令牌及其记录。 |不需要。如果您需要再次访问，请创建一个新令牌。 |

停用不会更改令牌的到期日期，并且一旦过了该日期，**重新激活密钥**将不可用。相反，创建一个新令牌。

要停用或删除 PAT：1. 转到 [**Settings**](https://smith.langchain.com/settings) > **API 密钥** 并打开 **个人** 选项卡。
2. 在**我的密钥**下找到令牌。要管理其他成员的令牌，请切换到**所有成员**。
3. 在 **操作** 列中，选择 **停用密钥** 或 **删除密钥**。每个操作都会打开自己的确认对话框。
4. 输入对话框中显示的令牌描述。对于没有描述的令牌，请键入 **Key** 列中的短密钥。
5. 选择**停用**或**删除**进行确认。成功通知确认操作。

要重新激活已停用的 PAT，请在 **操作** 列中选择 **重新激活密钥**。只需单击一下即可重新激活，无需确认对话框，并显示成功通知。

身份验证结果会被缓存，因此停用或删除的令牌会在一分钟内而不是立即停止工作。重新激活的令牌可能保持不可用，直到缓存的拒绝过期。

[Audit logs](/langsmith/audit-logs) 将停用记录为`revoke_personal_access_token`，将重新激活记录为`reinstate_personal_access_token`。

服务密钥只能删除，不能停用。打开 **服务** 选项卡并在 **操作** 列中选择 **删除密钥**，然后确认删除 PAT 所需的键入说明。

## 配置SDK安装适合您的语言的 SDK：

<Tabs>
  <Tab title="Python">
    <CodeGroup>
      ```bash pip
      pip install langsmith
      ```
      ```bash uv
      uv add langsmith
      ```
    </CodeGroup>
  </Tab>
  <Tab title="TypeScript">
    ```bash
    npm install langsmith
    ```
  </Tab>
</Tabs>

有关完整详细信息，请参阅 [Python SDK](/langsmith/smith-python-sdk) 或 [JS/TS SDK](/langsmith/smith-js-ts-sdk) 参考。

然后，设置您的 API 密钥并启用跟踪：

```bash
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_TRACING=true
```

您可能还需要以下附加环境变量：

- `LANGSMITH_ENDPOINT` 控制SDK 将数据发送到哪个LangSmith 服务器。默认为 `https://api.smith.langchain.com` (GCP US)。仅当您处于不同的部署时才设置它。对于区域 SaaS，将其设置为您所在区域的 API URL：

    {/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}

<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ "主机" : "URL"}</th>
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
</table>- 仅当您的 API 密钥范围为多个 [workspace](/langsmith/administration-overview#workspaces) 时，才需要 `LANGSMITH_WORKSPACE_ID`。在 **常规** 下的 [**Settings** page](https://smith.langchain.com/settings) 上找到您的工作区 ID：

    `LANGSMITH_WORKSPACE_ID=<Workspace ID>`

要跨本地 shell 或远程运行时重用端点、API 密钥和工作区设置，请参阅[Profile configuration](/langsmith/profile-configuration)。

## 在 SDK 之外使用 API 密钥

参见[instructions for managing your organization via API](/langsmith/manage-organization-by-api)。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-account-api-key.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>