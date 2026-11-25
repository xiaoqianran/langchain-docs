<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Workspace secrets | https://docs.langchain.com/langsmith/workspace-secrets -->

# 工作区秘密

查找、添加、编辑和删除 LangSmith 用于调用 LangSmith 云和自托管 LangSmith 上的模型提供程序和工具的工作区机密。

工作区机密存储 LangSmith 用于调用模型提供程序和工具的 API 密钥。读取它们的功能包括 [Playground](/langsmith/playground-model-providers)、[evaluators](/langsmith/evaluation)、[Fleet](/langsmith/fleet/index) 和 [LLM Gateway](/langsmith/llm-gateway)。每个秘密都属于一个工作区。调用提供者的工作区需要该提供者密钥的自己的副本。

## 所需权限

添加、编辑或删除工作区机密需要该工作区中的 `workspaces:manage-secrets` 权限。 [Workspace Admins](/langsmith/rbac#workspace-admin)默认有。如果没有它，秘密页面会列出现有秘密，但会隐藏添加按钮。在 LangSmith 云和自托管 v0.18 或更高版本上，该页面还会显示一条通知，要求您联系工作区管理员。请工作区管理员为您添加机密，或授予您访问权限。

## 打开秘密页面

秘密页面位于 **设置** 中的位置取决于您的 LangSmith 版本：> [选项卡] 云和自托管 v0.18 或更高版本
>
> 1. 打开**设置**。
> 2. 在侧边栏顶部，选择“**工作空间**”，然后选择需要密钥的工作空间。
> 3. 在 **配置** 下，选择 **Secrets**（自托管 v0.18 上的 **提供商凭证**）。
>
> 在个人组织中，侧边栏没有**工作区**开关。选择“**配置**”下的“**秘密**”。
>
> 页面标题为“**工作区秘密**”。您还可以在 **设置** 搜索框中输入 `secrets` 来查找它。

> [选项卡] 自托管 v0.16 和 v0.17
>
> 1. 打开需要密码的工作区的**设置**。
> 2. 选择 **集成** > **提供商机密**。

## 添加秘密

要添加工作区机密：

1. [Open the secrets page](#open-the-secrets-page)。
2. 单击**+ 秘密**。
3. 在**提供商**下，选择您的模型提供商。该表单显示一个标有提供者期望的环境变量的字段，例如 `OPENAI_API_KEY`，并以该名称保存机密。在该字段中输入您的密钥，其中空框显示**输入秘密值**。某些提供商（例如 Amazon Bedrock）会要求您选择身份验证方法并显示不同的字段。对于工具密钥或未列出的提供程序，请将 **自定义** 保留为提供程序。输入您的提供商或工具期望的环境变量名称作为 **Key**，并将您的密钥作为 **Value**。

   在自托管 v0.16 上，该对话框没有 **Provider** 列表。输入环境变量名称作为 **Key**，输入您的密钥作为 **Value**。
4. 单击“**保存**”。

LangSmith 保存密钥时不会检查密钥。错误的密钥会在第一个使用该密钥的请求中显示为提供者的错误。

## 编辑或删除秘密

要删除秘密，请单击其行中的（删除秘密）删除图标。当页面显示 **允许的主机** 列时，每行还有一个（编辑密钥）编辑图标，用于更改密钥的值、主机或标头。

## 按功能划分的秘密名称和设置

每个功能都会读取特定的秘密名称。提供程序的默认名称是 **Provider** 列表中填写的名称。有关完整列表以及需要多个机密的提供程序，请参阅：* [Provider secret names](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)用于LLM网关，包括[Amazon Bedrock](/langsmith/llm-gateway-provider-authentication#configure-amazon-bedrock)和[Azure Foundry](/langsmith/llm-gateway-provider-authentication#configure-azure-foundry)。
* [Allowed hosts](/langsmith/advanced-code-evaluators#configure-allowed-hosts-for-a-secret) 用于高级代码评估器发送到外部服务的秘密。
* [Fleet secrets](/langsmith/fleet/workspace-admin#workspace-secrets)，包括工具密钥和在舰队内优先的`FLEET_`前缀秘密。
* [Decision model providers](/langsmith/decision-model-evaluator) 用于决策模型评估器。

## 其他存储凭证的地方

* **OAuth 客户端凭据**：如果您的提供商使用 OAuth2 `client_credentials` 进行身份验证，请改为在模型配置上配置凭据。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。
* **组织机密**：密钥存储在组织级别而不是一个工作区中。 [Organization-scoped model configurations](/langsmith/llm-gateway-model-configurations) 读取组织机密，而不是工作空间机密。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/workspace-secrets.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。