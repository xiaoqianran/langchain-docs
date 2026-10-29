<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an account and API key | https://docs.langchain.com/langsmith/create-account-api-key -->

# 创建帐户和 API 密钥

要开始使用LangSmith，您需要创建一个帐户。您可以在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-create-account-api-key)注册一个免费帐户。 LangSmith 支持使用 Google、GitHub 和电子邮件登录。

## API 密钥

LangSmith 支持三种不同权限和生命周期的 API 密钥：

* [**Personal Access Tokens (PATs)**](/langsmith/administration-overview#personal-access-tokens-pats)继承创建它们的用户的权限。将 PAT 用于个人脚本或工具。
* [**Tracing keys**](#tracing-keys) 在选定的工作区中提交跟踪，而无需访问存储的跟踪或管理操作。
* [**Service keys**](/langsmith/administration-overview#service-keys) 范围为特定[workspaces](/langsmith/administration-overview#workspaces) 或整个[organization](/langsmith/administration-overview#organizations)。将服务密钥用于代理和生产服务。

使用跟踪密钥记录[traces](/langsmith/observability-concepts#traces)。使用具有 [evaluations](/langsmith/evaluation) 和其他 API 操作所需权限的 PAT 或服务密钥。

要在 UI 中创建 PAT 或服务密钥：

**1.打开 API 密钥设置**

导航至 [**Settings** page](https://smith.langchain.com/settings) 并选择 **API Keys** 部分。

**2.配置密钥类型**

对于服务密钥，请在组织范围的密钥和工作区范围的密钥之间进行选择。如果密钥是工作区范围的，则必须指定工作区。

[Enterprise](/langsmith/pricing-plans) 用户还可以 [assign specific workspace roles](/langsmith/administration-overview#workspace-roles-rbac) 服务密钥，这可以独立于任何用户调整其权限。

**3.设置过期**设置密钥的过期时间。密钥在选择的天数后将变得不可用，或者永远不可用（如果选择了该天数）。

**4.创建密钥**

单击 **创建 API 密钥。** LangSmith 只会显示 API 密钥一次，因此请务必复制它并将其存储在安全的地方。

> [!提示]
>
> [Enterprise](/langsmith/pricing-plans) 组织管理员可以在现有服务密钥上编辑 [role](/langsmith/administration-overview#workspace-roles-rbac)，而无需轮换密钥。在 [**Settings** page](https://smith.langchain.com/settings) **API 密钥** 部分，切换到 **服务** 选项卡，然后单击任意服务密钥行以打开编辑对话框。更新工作区角色（对于组织范围的键，更新组织角色），然后单击 **保存**。密钥字符串本身没有改变。

## 停用或删除个人访问令牌

停用会暂时阻止 PAT 进行身份验证；删除将永久删除它。当您需要保留其记录并稍后重新激活它时，请停用令牌。

成员可以停用、重新激活和删除自己的 PAT。 [Organization Admins](/langsmith/rbac#organization-admin)和[Organization Operators](/langsmith/rbac#organization-operator)还可以管理每个成员的PAT。|行动|效果|双面 |
| - | - | - |
| **停用** |停止身份验证并通过 **已停用** 徽章保持记录、所有者和上次使用情况可见。 |是的。选择 **重新激活密钥** 以再次使用相同的令牌。 |
| **重新激活** |允许使用相同的令牌及其原始到期日期再次进行身份验证。 |是的。随时再次停用令牌。 |
| **删除** |永久删除令牌及其记录。 |不需要。如果您需要再次访问，请创建一个新令牌。 |

停用不会更改令牌的到期日期，并且一旦过了该日期，**重新激活密钥**将不可用。相反，创建一个新令牌。

要停用或删除 PAT：

1. 转到 [**Settings**](https://smith.langchain.com/settings) > **API 密钥**，然后打开 **个人** 选项卡。
2. 在**我的密钥**下找到令牌。要管理其他成员的令牌，请切换到**所有成员**。
3. 在 **操作** 列中，选择 **停用密钥** 或 **删除密钥**。每个操作都会打开自己的确认对话框。
4. 输入对话框中显示的令牌描述。对于没有描述的令牌，请键入 **Key** 列中的短密钥。
5. 选择**停用**或**删除**进行确认。成功通知确认操作。要重新激活已停用的 PAT，请在 **操作** 列中选择 **重新激活密钥**。只需单击一下即可重新激活，无需确认对话框，并显示成功通知。

身份验证结果会被缓存，因此停用或删除的令牌会在一分钟内而不是立即停止工作。重新激活的令牌可能保持不可用，直到缓存的拒绝过期。

[Audit logs](/langsmith/audit-logs) 将停用记录为`revoke_personal_access_token`，将重新激活记录为`reinstate_personal_access_token`。

服务密钥只能删除，不能停用。打开 **服务** 选项卡并在 **操作** 列中选择 **删除密钥**，然后确认删除 PAT 所需的键入说明。

## 追踪按键

跟踪密钥是组织拥有的凭据，用于在选定的工作区中提交跟踪。它们限制代理对 `runs:create` 和 `projects:create` 的访问。

跟踪密钥通过跟踪摄取 API 提交运行更新。在基于代理的工作区中进行跟踪之前，请在 UI 中使用 [register the agent](/langsmith/create-an-agent) 或使用具有 `projects:create` 的 PAT 或服务密钥。跟踪密钥无法调用代理创建 API。跟踪密钥无法读取存储的跟踪、更新代理环境设置、创建保存的视图、运行实验或管理密钥。旧项目更新插入请求也被拒绝。对需要这些权限的操作使用单独的凭据。

### 创建跟踪密钥

跟踪密钥创建需要活跃的组织成员身份以及每个选定工作区中的活跃成员身份。每个工作区都需要`workspaces:tracing-keys:create`，包括通过团队授予的权限。内置工作区管理员和工作区编辑者角色接收此权限；工作区查看器则不然。管理员必须将其明确授予自定义角色。您自己不需要`runs:create`。

要在 LangSmith 中创建密钥：

1. 转至 **设置** > **API 密钥**，然后选择 **API 密钥**。
2. 选择**仅跟踪**并输入描述。
3. 选择工作区和到期日期，然后选择“**创建 API 密钥**”。
4. 在关闭对话框之前复制密钥。

跟踪选项需要受支持的部署。对于 BYOC 工作区，数据平面还必须支持跟踪密钥。仅具有创建权限且部署支持跟踪密钥的工作区可供选择。您还可以使用 `POST /api/v1/orgs/current/tracing-keys` 创建密钥。作为用户进行身份验证，包括通过 PAT（如果组织策略允许 API 密钥创建密钥）。服务帐户密钥无法创建跟踪密钥。

该请求接受：

* **`workspaces`**：一个或多个工作区 ID 的必需列表。该密钥没有组织范围内的范围。
* **`description`**：密钥的可选标签。
* **`expires_at`**：可选的过期时间戳，受服务密钥过期限制的约束。

响应返回`201 Created`、`Location`标头以及`key`中的秘密。创建秘密时复制它；列表响应不会返回它。跟踪键具有 `lsv2_tr_` 前缀。

使用密钥作为 `LANGSMITH_API_KEY` 和下面的 [SDK configuration](#configure-the-sdk)。对于作用域为多个工作区的键，请将 `LANGSMITH_WORKSPACE_ID` 设置为选定的工作区。直接 API 请求使用`X-Tenant-Id`。

### 范围和生命周期

跟踪密钥在其选定的工作区中具有固定的权限。它不会继承创建者的角色或项目标签访问策略。其工作区范围和权限无法编辑。创建替换密钥以更改范围。删除或禁用创建者不会禁用密钥跟踪。删除选定的工作区会删除对该工作区的访问权限；它不会添加对其他工作区的访问。过期和密钥删除会停止身份验证，具体取决于身份验证缓存。

### 列出并删除跟踪键

在 **设置** > **API 密钥**中，选择 **跟踪** 以查看密钥。要删除密钥，请选择其删除操作并输入其描述进行确认。仅当您有权删除该密钥时，才会出现删除操作。

`GET /api/v1/orgs/current/tracing-keys` 列出经过身份验证的用户可见的密钥。它返回`items`和`next_cursor`。使用`page_size`每页请求1-100个密钥；默认值为 50。将 `next_cursor` 作为 `cursor` 传递以请求下一页。可选的 `workspace_ids` 过滤器将结果限制为匹配可见工作区。

列出密钥并不一定授予删除它的权限。对于无法访问完整范围的调用者，隐藏的工作区 ID 和名称将被省略。检查`can_delete`删除权限。

`DELETE /api/v1/orgs/current/tracing-keys/{api_key_id}` 删除跟踪键。重复删除返回`204 No Content`。允许删除：* **创建者**：创建者必须仍然是活跃的组织成员。
* **组织关键管理者**：使用 `organization:service-key:manage` 的调用者，包括服务帐户自动化。
* **工作区密钥管理者**：在每个剩余的选定工作区中具有 `workspaces:manage-keys` 的活跃成员。

创建、列出和删除端点可通过 HTTP 实现。生成的 SDK 密钥管理方法不会公开它们。已发布的跟踪密钥可与 SDK 的跟踪 API 配合使用。

## 配置SDK

安装适合您的语言的 SDK：

**Python**

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add langsmith
```

**打字稿**

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langsmith
```

有关完整详细信息，请参阅 [Python SDK](/langsmith/smith-python-sdk) 或 [JS/TS SDK](/langsmith/smith-js-ts-sdk) 参考。

在基于代理的工作区中进行跟踪之前，[register an agent](/langsmith/create-an-agent)。然后，设置您的 API 密钥、启用跟踪并选择其标识符和环境：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_TRACING=true
export LANGSMITH_AGENT_ID="<your-agent-id>"
export LANGSMITH_AGENT_ENVIRONMENT="production"
```

使用代理寻址时删除旧目标变量。在基于项目的工作区（包括自托管 LangSmith）中，使用 `LANGSMITH_PROJECT` 而不是两个代理变量。

您可能还需要以下附加环境变量：

* `LANGSMITH_ENDPOINT`控制SDK将数据发送到哪个LangSmith服务器。默认为 `https://api.smith.langchain.com` (GCP US)。仅当您处于不同的部署时才设置它。对于区域 SaaS，将其设置为您所在区域的 API URL：<table>
    <thead>
      <tr>
        <th>地区</th>

        <th>
          网址
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>GCP 美国</td>

        <td>
          `https://api.smith.langchain.com`
        </td>
      </tr>

      <tr>
        <td>GCP 欧盟</td>

        <td>
          `https://eu.api.smith.langchain.com`
        </td>
      </tr>

      <tr>
        <td>GCP 亚太地区</td>

        <td>
          `https://apac.api.smith.langchain.com`
        </td>
      </tr>

      <tr>
        <td>AWS 美国</td>

        <td>
          `https://aws.api.smith.langchain.com`
        </td>
      </tr>
    </tbody>
  </table>

* 仅当您的 API 密钥范围为多个 [workspace](/langsmith/administration-overview#workspaces) 时，才需要 `LANGSMITH_WORKSPACE_ID`。在 **常规** 下的 [**Settings** page](https://smith.langchain.com/settings) 上找到您的工作区 ID：

  `LANGSMITH_WORKSPACE_ID=<Workspace ID>`

要跨本地 shell 或远程运行时重用端点、API 密钥和工作区设置，请参阅[Profile configuration](/langsmith/profile-configuration)。

## 在 SDK 之外使用 API 密钥

参见[instructions for managing your organization via API](/langsmith/manage-organization-by-api)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-account-api-key.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。