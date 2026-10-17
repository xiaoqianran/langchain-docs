<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Provider authentication | https://docs.langchain.com/langsmith/llm-gateway-provider-authentication -->

# 提供者身份验证

在 LLM 网关和支持 API 密钥以上的模型提供者之间配置基于身份的身份验证。

<Note>
  LLM Gateway 位于[beta](/langsmith/release-stages)。
</Note>

网关使用工作区的提供者密钥中存储的凭据对每个模型提供者进行身份验证。大多数提供商只需要一个 API 密钥，您可以在 [Admin setup](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets) 中添加该密钥。一些提供商还支持基于身份的身份验证，这使您可以在组织禁用提供商 API 密钥时使用网关。

## 配置 Azure Foundry

Azure Foundry 支持 API 密钥或 Microsoft Entra ID 服务主体。服务主体身份验证允许您使用[disable local authentication](https://learn.microsoft.com/en-us/azure/ai-services/disable-local-auth) 的资源。

两种方法都需要`AZURE_FOUNDRY_RESOURCE_NAME`。将其设置为 Azure 资源名称，而不是 URL 或部署名称。网关将请求发送到 Azure 公共云中的`<resource-name>.openai.azure.com`。

对于 API 密钥身份验证，请通过 Azure Foundry 提供程序表单添加 `AZURE_FOUNDRY_API_KEY` 和 `AZURE_FOUNDRY_RESOURCE_NAME`，如 [Admin setup](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets) 中所述。

### 使用 Entra ID 服务主体

要使用 Entra ID 服务主体而不是 API 密钥：1. 在 Foundry 资源上部署模型，或使用现有部署。记录资源名称和部署名称。使用部署名称作为请求中的 `model` 值。

2. Microsoft Entra ID 中的[Register an application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)，或使用现有的应用程序注册。记录其目录（租户）ID 和应用程序（客户端）ID。

3. [Add a client secret](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials) 到应用程序注册。记录秘密的值，而不是其 ID。

4. 在 Foundry 资源上，而不是其中的项目，[assign the app's service principal](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry) `Foundry User` 角色（以前的 `Azure AI User`）。通用 `Owner`、`Contributor` 和 `Reader` 角色不具有 [grant permission to call models](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry#permissions-for-each-built-in-role)。

5. 在 LangSmith 中，选择路由 Azure 请求的工作区。转到 **设置 > 集成 > 提供商机密** 并将以下各项添加为自定义机密：

   |秘密名字|价值|
   | - | - |
   | `AZURE_FOUNDRY_RESOURCE_NAME` | Azure 资源名称。 |
   | `AZURE_TENANT_ID` |目录（租户）ID。 |
   | `AZURE_CLIENT_ID` |应用程序（客户端）ID。 |
   | `AZURE_CLIENT_SECRET` |客户端秘密值。 |

   在提供程序选择器中选择 **自定义** 以输入每个密钥的名称和值。 Azure Foundry 提供程序表单仅公开 API 密钥身份验证。6. 如果设置了`AZURE_FOUNDRY_API_KEY`，请将其从工作区中删除。即使资源禁用 API 密钥身份验证，API 密钥也优先于服务主体凭据。

所有三个 Entra ID 密码都是必需的。网关自动获取并刷新 Azure 访问令牌。用户继续使用其 LangSmith API 密钥（而不是 Azure 凭据）对网关进行身份验证。

此方法使用客户端机密。它不使用托管身份或工作负载身份联合。客户端机密会过期，因此当您在 Entra ID 中轮换机密时请更新 `AZURE_CLIENT_SECRET`。

### 验证设置

在[configure gateway access](/langsmith/llm-gateway-admin-setup#2-configure-gateway-access-for-users)之后，使用您的LangSmith API密钥通过网关发送测试请求：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/azure/v1/chat/completions \
  --header "Authorization: Bearer $LANGSMITH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "model": "<deployment-name>",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

`chat.completion` 响应确认设置。对于其他云区域，请将主机名替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway)。

如果 Azure 返回 `PermissionDenied`，请确认 `Foundry User` 角色是在 Foundry 资源上分配的，而不是在项目上分配的。新的角色分配可能需要[up to 10 minutes](https://learn.microsoft.com/en-us/azure/role-based-access-control/troubleshooting#symptom---role-assignment-changes-are-not-being-detected)才能生效。

## 另请参阅

* [Admin setup](/langsmith/llm-gateway-admin-setup)：添加提供商机密并授予网关访问权限。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：通过提供商特定的网关路径调用提供商 API。
* [Self-hosted LLM Gateway](/langsmith/llm-gateway-self-hosted)：在自托管LangSmith上启用网关。

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-provider-authentication.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>