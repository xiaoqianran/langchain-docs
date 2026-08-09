<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage LangSmith with Terraform | https://docs.langchain.com/langsmith/manage-with-terraform -->

# 使用 Terraform 管理 LangSmith

使用官方 LangSmith Terraform 提供程序以代码形式管理工作区、角色、成员、评估者、运行规则和警报规则。

官方的[LangSmith Terraform provider](https://registry.terraform.io/providers/langchain-ai/langsmith/latest)允许您将LangSmith组织和工作区资源作为代码进行管理——工作区、自定义角色、组织和工作区成员、评估者、运行规则和警报规则。它是与 [managing your organization using the API](/langsmith/manage-organization-by-api) 相对应的基础设施即代码。

<Check>
  在深入研究之前，阅读以下内容可能会有所帮助：

  * [Conceptual guide on organizations and workspaces](/langsmith/administration-overview)
  * [Organization setup how-to](/langsmith/set-up-hierarchy#set-up-an-organization)
</Check>

## 安装和配置

将提供程序添加到您的 Terraform 配置并固定版本：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform {
  required_providers {
    langsmith = {
      source  = "langchain-ai/langsmith"
      version = "~> 0.0.2"
    }
  }
}

provider "langsmith" {
  # Cloud (US). Use https://eu.api.smith.langchain.com for the EU region,
  # or your self-hosted URL. Can also be set via LANGSMITH_ENDPOINT.
  api_url = "https://api.smith.langchain.com"

  # Optional: scope workspace-level resources to a specific workspace.
  workspace_id = "00000000-0000-0000-0000-000000000000"
}
```

然后运行 `terraform init` 下载提供程序。

## 身份验证

提供程序解析凭据的方式与 LangSmith SDK 和 CLI 相同。优先选择环境变量或配置文件而不是硬编码 `api_key`：

* **环境**—`LANGSMITH_API_KEY`、`LANGSMITH_ENDPOINT`（API URL）、`LANGSMITH_WORKSPACE_ID`。
* **配置文件** — 设置 `profile`（或 `LANGSMITH_PROFILE`）以使用 LangSmith CLI 配置文件。
* **提供者参数**—`api_key`、`api_url`、`workspace_id`、`profile`。

在您的 LangSmith 设置中创建 API 密钥或 [service key](/langsmith/administration-overview#service-keys)。请参阅[Authentication methods](/langsmith/authentication-methods)了解可用的密钥类型。<Warning>
  组织范围的操作（创建工作区和邀请组织成员）需要具有组织管理员权限的**组织范围的服务密钥**。将 `workspace_id` （或 `LANGSMITH_WORKSPACE_ID`）设置为目标工作区范围内的资源，例如工作区成员身份、评估器和运行规则。
</Warning>

## 示例

### 创建工作区

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "langsmith_workspace" "demo" {
  display_name  = "Demo Workspace"
  tenant_handle = "demo-workspace"
}
```

### 管理角色和成员

使用数据源查找内置角色，然后分配它们。这会邀请用户加入组织并授予他们对工作区的管理员权限：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
data "langsmith_org_role" "user" {
  name = "ORGANIZATION_USER"
}

data "langsmith_workspace_role" "admin" {
  name = "WORKSPACE_ADMIN"
}

resource "langsmith_org_membership" "alice" {
  email   = "alice@example.com"
  role_id = data.langsmith_org_role.user.id
}

resource "langsmith_workspace_membership" "alice_demo" {
  workspace_id = langsmith_workspace.demo.id
  email        = langsmith_org_membership.alice.email
  role_id      = data.langsmith_workspace_role.admin.id
}
```

您还可以定义自定义工作区角色，例如通过克隆现有角色的权限：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "langsmith_workspace_role" "issues_agent" {
  display_name = "Issues Agent"
  description  = data.langsmith_workspace_role.admin.description
  permissions  = data.langsmith_workspace_role.admin.permissions
}
```

### 自动化评估器、运行规则和警报

提供商管理的不仅仅是帐户。您可以将 [online code evaluators](/langsmith/online-evaluations-code)、应用它们的 [run rules](/langsmith/rules) 和 [alerts](/langsmith/alerts) 与您的工作区一起编码：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
resource "langsmith_evaluator" "tool_calls" {
  workspace_id = langsmith_workspace.demo.id
  name         = "tool call counts"
  type         = "code"

  code_evaluator = {
    language = "javascript"
    code     = file("${path.module}/evaluator.js")
  }
}

# A run rule applies the evaluator to matching runs in a tracing project.
# Run rules can also add runs to a dataset or annotation queue, or call webhooks.
resource "langsmith_run_rule" "score_root_runs" {
  workspace_id  = langsmith_workspace.demo.id
  display_name  = "score root runs"
  session_id    = "00000000-0000-0000-0000-000000000000" # tracing project ID
  sampling_rate = 1
  filter        = "eq(is_root, true)"

  evaluator_id = langsmith_evaluator.tool_calls.id
}

resource "langsmith_alert_rule" "error_rate" {
  session_id     = "00000000-0000-0000-0000-000000000000" # tracing project ID
  name           = "run error count high"
  type           = "threshold"
  attribute      = "error_count"
  aggregation    = "sum"
  window_minutes = 15
  operator       = "gte"
  threshold      = 10
  filter         = "eq(is_root, true)"

  actions = [{
    target  = "webhook"
    url_env = "LANGSMITH_ALERTS_WEBHOOK_URL"
    config_json = jsonencode({
      body = jsonencode({ text = "Error rate elevated" })
    })
  }]
}
```

## 资源参考

资源和数据源的完整列表（包含每个参数和属性）均在 Terraform 注册表上发布并保持同步：

<Card title="LangSmith provider on the Terraform Registry" icon="brand-terraform" href="https://registry.terraform.io/providers/langchain-ai/langsmith/latest/docs">
  浏览所有资源和数据源的完整参考。
</Card>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-with-terraform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>