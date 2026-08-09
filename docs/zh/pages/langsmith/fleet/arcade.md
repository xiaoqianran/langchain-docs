<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Arcade integration | https://docs.langchain.com/langsmith/fleet/arcade -->

# 街机集成

将您的工作区连接到 Arcade，让客服人员能够访问 GitHub、Gmail、Slack 等第三方工具。

[Arcade](https://arcade.dev) 提供托管 MCP 网关，使您的代理可以在一次集成后访问数千个第三方工具。支持的服务涵盖电子邮件、日历、代码托管、项目管理、CRM、消息传递、搜索等，包括 GitHub、Gmail、Google Drive、Slack、Notion、Jira、Salesforce、Linear 和 HubSpot。

当您将 Arcade 连接到工作区时，工作区管理员会选择 Arcade 组织和项目，然后从该项目安装 MCP 网关。每个用户都连接自己的 Arcade 帐户，以便工具调用使用其个人凭据进行身份验证。

## 先决条件

* 具有 **admin** 权限的 LangSmith 工作区（用于配置集成）
* 一个[Arcade](https://arcade.dev)账户，至少有一个组织和项目

## 将 Arcade 设置为工作区管理员

只有[workspace admins](/langsmith/rbac#workspace-admin)可以配置Arcade集成，包括添加或删除MCP网关。配置完成后，工作区中的所有用户都可以使用集成。<Steps>
  <Step title="Open the Integrations tab">
    导航至[**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools)。在左侧菜单中的“**应用程序**”下，单击“**街机**”。
  </Step>

  <Step title="Connect your Arcade account">
    单击 **连接** 通过 OAuth 向 Arcade 进行身份验证。这会将您的 Arcade 帐户链接到工作区。
  </Step>

  <Step title="Select an organization and project">
    为工作区选择 Arcade **组织** 和 **项目**。工作区中安装的所有 MCP 网关均来自该项目。
  </Step>

  <Step title="Install MCP gateways">
    浏览 Arcade 项目中的可用网关，然后单击 **添加到工作区** 以安装它们。已安装的网关显示为可供工作区中的所有代理使用的 MCP 服务器。
  </Step>
</Steps>

## 作为工作区成员连接

管理员配置 Arcade 后，其他用户必须连接自己的 Arcade 帐户才能使用这些工具。每个用户都单独进行身份验证，以便工具调用使用他们自己的凭据，而不是管理员的凭据。

<Steps>
  <Step title="Get an invitation to the Arcade project">
    请工作区管理员邀请您加入他们的 Arcade 组织和项目。您必须是同一项目的成员才能访问其网关。
  </Step>

  <Step title="Connect your account">
    导航至[**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools)。在左侧菜单中的 **Apps** 下，单击 **Arcade**，然后单击 **Connect** 通过 OAuth 进行身份验证。
  </Step><Step title="Browse available tools">
    连接后，管理员安装的MCP服务器会自动出现。您可以从代理编辑器将这些工具添加到代理中。
  </Step>
</Steps>

<Note>
  工作区成员无法更改 Arcade 组织或项目。只有管​​理员可以修改工作区级别的配置。
</Note>

## 与代理一起使用 Arcade 工具

连接后，将 Arcade 工具添加到特定代理：

1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-arcade)打开你的代理。
2. 在侧栏中，展开 **连接** 抽屉并单击 **添加连接**。
3. 选择要为代理启用的 Arcade 工具。

代理现在可以在运行时调用这些工具。当工具需要授权时，Arcade 会提示用户通过 OAuth 授予访问权限。

## 更改组织或项目

管理员可以随时更新工作区级别的 Arcade 组织和项目。

<Warning>
  更改组织或项目**将从工作区中删除所有已安装的 MCP 服务器**。之后您将需要从新项目重新安装网关。
</Warning>

<Steps>
  <Step title="Open configuration">
    导航至[**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools)。在左侧菜单中的“**应用程序**”下，单击“**街机**”。单击设置图标以打开 **Arcade 工作区配置** 对话框。
  </Step><Step title="Select new organization and project">
    从下拉列表中选择新的组织和项目。
  </Step>

  <Step title="Confirm the change">
    单击**保存更改**。如果更改删除了现有的 MCP 服务器，请在后续对话框中确认。所有以前安装的网关都将被删除，您可以从更新的项目中安装新的网关。
  </Step>
</Steps>

## 断开与 Arcade 的连接

导航至[**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools)。在左侧菜单中的“**应用程序**”下，单击“**Arcade**”，然后单击“**断开连接**”。这将撤销您的 OAuth 令牌，但不会影响工作区配置或其他用户。

管理员可以通过删除工作区配置来完全删除 Arcade 集成，这也会删除所有已安装的 Arcade MCP 服务器。

## 后续步骤

<CardGroup>
  <Card title="Add more tools" icon="puzzle" href="/langsmith/fleet/tools">
    将附加服务连接到您的代理
  </Card>

  <Card title="Remote MCP servers" icon="server" href="/langsmith/fleet/remote-mcp-servers">
    将自定义 MCP 服务器连接到您的工作区
  </Card>

  <Card title="Manage agent settings" icon="settings" href="/langsmith/fleet/manage-agent-settings">
    配置代理行为和权限
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/arcade.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>