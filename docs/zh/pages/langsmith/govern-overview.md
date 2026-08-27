<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Govern | https://docs.langchain.com/langsmith/govern-overview -->

# 治理

Administer your LangSmith organization: manage users and access control, organize workspaces and applications, and configure policies and compliance.

治理还扩展到代理在运行时执行的操作：模型调用时的[spend and data-protection policies](/langsmith/llm-gateway-spend-policies)、代理代码的[sandboxed execution](/langsmith/sandboxes)以及敏感操作之前的[human approval](/langsmith/add-human-in-the-loop)。

## 探索

<CardGroup cols={2}>
  <Card
    title="Organization administration"
    cta="Get started"
    href="/langsmith/administration-overview"
    icon="users-group"
  >
    组织、工作区、应用程序、计费和使用情况。
  </Card>

  <Card
    title="Users & access control"
    cta="Manage access"
    href="/langsmith/user-management"
    icon="lock"
  >
    管理用户、角色 (RBAC)、基于属性的访问 (ABAC) 和身份验证。
  </Card>

  <Card
    title="Tools"
    cta="View tools"
    href="/langsmith/chat"
    icon="tool"
  >
    Administrative tools and the LangSmith CLI.
  </Card>

  <Card
    title="Auditing & compliance"
    cta="Review policies"
    href="/langsmith/audit-logs"
    icon="shield-check"
  >
    审核日志、数据存储和隐私以及合规性控制。
  </Card>
</CardGroup>

## 相关

<CardGroup cols={2}>
  <Card
    title="Account setup"
    cta="Set up your account"
    href="/langsmith/admin"
    icon="user-cog"
  >
    创建帐户、管理 API 密钥、配置配置文件并查看定价等级。
  </Card>

  <Card
    title="LLM Gateway"
    cta="Route LLM traffic"
    href="/langsmith/llm-gateway"
    icon="route"
  >
    代理 LLM 调用以强制执行支出限制、编辑敏感数据并集中管理提供商凭据。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/govern-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>