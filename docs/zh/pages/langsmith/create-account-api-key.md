<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an account and API key | https://docs.langchain.com/langsmith/create-account-api-key -->

# 创建帐户和 API 密钥

要开始使用 LangSmith，您需要创建一个帐户。您可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-create-account-api-key)注册一个免费帐户。 LangSmith 支持使用 Google、GitHub 和电子邮件登录。

## API 密钥

LangSmith 支持两种类型的 API 密钥。您可以使用这两种类型的令牌来验证对 LangSmith API 的请求，但它们有不同的用例：

* [**Personal Access Tokens (PATs)**](/langsmith/administration-overview#personal-access-tokens-pats) 继承创建它们的用户的权限。将 PAT 用于个人脚本或工具。
* [**Service keys**](/langsmith/administration-overview#service-keys) 范围为特定[workspaces](/langsmith/administration-overview#workspaces) 或整个[organization](/langsmith/administration-overview#organizations)。将服务密钥用于应用程序和生产服务。

要使用 LangSmith 记录 [traces](/langsmith/observability-concepts#traces) 并运行 [evaluations](/langsmith/evaluation)，请创建一个 API 密钥来验证您的请求。

<Steps>
  <Step title="Open API Keys settings" icon="settings">
    导航至 [**Settings** page](https://smith.langchain.com/settings) 并选择 **API 密钥** 部分。
  </Step>

  <Step title="Configure the key type" icon="key">
    对于服务密钥，请在组织范围的密钥和工作区范围的密钥之间进行选择。如果密钥是工作区范围的，则必须指定工作区。

    [Enterprise](/langsmith/pricing-plans) 用户还可以 [assign specific workspace roles](/langsmith/administration-overview#workspace-roles-rbac) 服务密钥，这可以独立于任何用户调整其权限。
  </Step>

  <Step title="Set expiration" icon="calendar">
    设置密钥的过期时间。密钥在选择的天数后将变得不可用，或者永远不可用（如果选择了该天数）。
  </Step><Step title="Create the key" icon="circle-check">
    单击 **创建 API 密钥。** LangSmith 将仅显示 API 密钥一次，因此请务必复制它并将其存储在安全的地方。
  </Step>
</Steps>

<Tip>
  要删除 API 密钥，请导航至 [**Settings** page](https://smith.langchain.com/settings)，在 **API 密钥** 部分中找到该密钥，然后在 **操作** 列中选择垃圾桶图标 <Icon icon="trash" />。
</Tip>

<Tip>
  [Enterprise](/langsmith/pricing-plans) 组织管理员可以在现有服务密钥上编辑 [role](/langsmith/administration-overview#workspace-roles-rbac)，而无需轮换密钥。在 [**Settings** page](https://smith.langchain.com/settings) **API 密钥** 部分，切换到 **服务** 选项卡，然后单击任意服务密钥行以打开编辑对话框。更新工作区角色（对于组织范围的键，更新组织角色），然后单击 **保存**。密钥字符串本身没有改变。
</Tip>

## 配置SDK

安装适合您的语言的 SDK：

<Tabs>
  <Tab title="Python">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langsmith
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langsmith
      ```
    </CodeGroup>
  </Tab>

  <Tab title="TypeScript">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install langsmith
    ```
  </Tab>
</Tabs>

有关完整详细信息，请参阅 [Python SDK](/langsmith/smith-python-sdk) 或 [JS/TS SDK](/langsmith/smith-js-ts-sdk) 参考。

然后，设置您的 API 密钥并启用跟踪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_TRACING=true
```

您可能还需要以下附加环境变量：* `LANGSMITH_ENDPOINT` 控制SDK将数据发送到哪个LangSmith服务器。默认为 `https://api.smith.langchain.com` (GCP US)。仅当您处于不同的部署时才设置它。对于区域 SaaS，将其设置为您所在区域的 API URL：

  <table>
    <thead>
      <tr>
        <th>地区</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>GCP 美国</td>
      </tr>

      <tr>
        <td>GCP 欧盟</td>
      </tr>

      <tr>
        <td>GCP 亚太地区</td>
      </tr>

      <tr>
        <td>AWS 美国</td>
      </tr>
    </tbody>
  </table>

* 仅当您的 API 密钥范围为多个 [workspace](/langsmith/administration-overview#workspaces) 时，才需要 `LANGSMITH_WORKSPACE_ID`。在 **常规** 下的 [**Settings** page](https://smith.langchain.com/settings) 上找到您的工作区 ID：

  `LANGSMITH_WORKSPACE_ID=<Workspace ID>`

要跨本地 shell 或远程运行时重用端点、API 密钥和工作区设置，请参阅[Profile configuration](/langsmith/profile-configuration)。

## 在 SDK 之外使用 API 密钥

参见[instructions for managing your organization via API](/langsmith/manage-organization-by-api)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-account-api-key.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>