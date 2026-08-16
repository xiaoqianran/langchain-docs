<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Admin setup | https://docs.langchain.com/langsmith/llm-gateway-admin-setup -->

# 管理员设置

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

一次性设置为您的 LangSmith [organization](/langsmith/administration-overview#organizations) 启用 LLM 网关。 [Organization admins](/langsmith/rbac#organization-admin) 应在个人用户可以通过网关路由呼叫之前完成此操作。

## 先决条件

您需要LangSmith中的[⟦T0⟧ permission](/langsmith/organization-workspace-operations)。 [Step 2 Option A](/langsmith/llm-gateway-admin-setup#option-a-create-a-custom-workspace-role-recommended) 还需要一个包含 [RBAC](/langsmith/rbac)（自定义角色）的计划。

## 1. 添加提供商机密

网关从工作区的提供者密钥中解析提供者 API 密钥 - 这就是它代理对上游提供者的调用的方式，而无需单个用户需要提供者密钥的本地副本。

转到 **设置 → 集成 → 提供商机密** 并添加您想要通过网关代理的提供商的密钥：

|秘密名字|供应商|
| ---| ---|
| `ANTHROPIC_API_KEY` | Anthropic |
| `AWS_BEARER_TOKEN_BEDROCK` | AWS 基岩 |
| `BASETEN_API_KEY` |巴斯坦|
| `FIREWORKS_API_KEY` |烟花|
| `GOOGLE_API_KEY` |谷歌双子座 |
| `OPENAI_API_KEY` | OpenAI |
| `VERTEX_SERVICE_ACCOUNT_JSON` |谷歌顶点人工智能 |

仅添加您的组织使用的提供商。如果用户尝试调用尚未添加密钥的提供商，网关将返回错误。

## 2.配置用户的网关访问内置角色`WORKSPACE_USER`、`WORKSPACE_VIEWER`不包含`gateway:invoke`权限，无法编辑。您有两种授予网关访问权限的选项：

### 选项 A：创建自定义工作区角色（推荐）

需要启用 RBAC 的计划。

1. 转至 **设置 → 成员/角色**。
1. 创建新的工作区角色。
1. 至少授予`gateway:invoke`和`workspaces:read`。
1. 将需要网关访问权限的用户分配给此角色。

当您想要向特定用户授予网关访问权限而不授予他们完整的工作区管理员权限时，请使用此选项。这使您可以最大程度地控制谁可以使用网关。

### 选项 B：使用工作区管理员角色

无计划要求。

默认情况下，`WORKSPACE_ADMIN`角色已包含`gateway:invoke`和`workspaces:read`。将需要网关访问权限的用户分配给此角色。

如果您不需要细粒度的访问控制，或者没有启用 RBAC，请使用此选项。

## 3.配置策略（可选）

网关策略管理需要`organization:manage`权限。

转到 **设置 → 网关 → LLM 网关** 以创建治理策略。您可以配置：- **支出限制：** 组织、工作区、API 密钥或用户级​​别的硬上限。参考[Spend policies](/langsmith/llm-gateway-spend-policies)。
- **数据保护：** 在 PII 和机密到达模型之前检测并编辑它们。参考[Data protection](/langsmith/llm-gateway-data-protection)。

在初始设置期间，策略是可选的。在您配置策略之前，网关将自由允许调用。

## 4. 向用户分发 API 密钥

为需要网关访问的用户创建工作区范围的[Service Keys](/langsmith/administration-overview#service-keys)。每个密钥应附加到一个包含 `gateway:invoke` 和 `workspaces:read` 的角色。

使用工作区范围的键，而不是组织范围的键。详情请参阅[API key scoping](/langsmith/llm-gateway-access#api-key-scoping)。

与每个用户共享密钥和网关端点，或通过 MDM（移动设备管理）分发它们以在公司范围内部署编码代理。有关每个代理的配置说明，请参阅[Set up coding agents](/langsmith/llm-gateway-coding-agents)。

## 验证

要求用户运行 [verification cURL from the quickstart](/langsmith/llm-gateway-quickstart#2-make-a-call)。 `200` 响应确认网关、API 密钥、提供商机密和角色权限均已正确配置。该调用将在工作区的 **gateway** 跟踪项目中显示为跟踪。

## 后续步骤- [Quickstart](/langsmith/llm-gateway-quickstart)：与您的用户分享作为入门指南。
- [Set up coding agents](/langsmith/llm-gateway-coding-agents)：在组织范围内配置 Claude Code、Codex 和其他代理。
- [Traces, Engine, and access control](/langsmith/llm-gateway-access)：深入探讨角色、范围键、跟踪路由以及谁可以看到什么。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-admin-setup.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>