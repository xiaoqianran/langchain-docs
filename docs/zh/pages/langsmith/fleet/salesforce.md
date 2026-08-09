<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Salesforce integration | https://docs.langchain.com/langsmith/fleet/salesforce -->

# Salesforce 集成

将 LangSmith Fleet 连接到 Salesforce，以便您的代理可以查询记录、导航模式和读取自定义字段。

Salesforce 集成为您的代理提供对 Salesforce 组织中数据的只读访问权限。连接后，代理可以：

* 跨标准和自定义对象查询记录。
* 导航您的 Salesforce 数据架构，包括关系和自定义字段。
* 将实时上下文从 Salesforce 拉入任何线程或计划运行。

<Note>
  连接 Salesforce 是每个 Salesforce 组织的一次性设置。 Salesforce 系统管理员（或具有 **批准卸载的连接应用程序** 权限的用户）必须先安装连接器，然后其他用户才能进行身份验证。
</Note>

## 先决条件

* 可以访问 [Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-salesforce) 的 LangSmith 工作区。
* Salesforce 组织和用户帐户。
* Salesforce 系统管理员完成安装（或您自己的用户的 **批准卸载的连接应用程序** 权限）。

## 注册连接器

第一次连接尝试会在您的 Salesforce 组织中注册 **LangChain Fleet Connector**，以便管理员可以安装它。此初始尝试预计会因身份验证错误而失败。<Steps>
  <Step title="Open the Integrations page">
    在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-salesforce) 中，导航到 [**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools) 选项卡。
  </Step>

  <Step title="Start the Salesforce connection">
    找到 **Salesforce** 工具并单击 **连接**。
  </Step>

  <Step title="Sign in to Salesforce">
    使用您的 Salesforce 凭据登录。如果您的组织需要自定义域或 SSO，请单击“**使用自定义域**”并在登录前输入您组织的“我的域”。然后单击“**允许**”以授权连接。
  </Step>
</Steps>

<Info>
  第一次尝试因设计而失败。失败的请求会在您的 Salesforce 组织中注册 **LangChain Fleet Connector**，以便管理员可以在下一步中安装它。
</Info>

<Tip>
  如果您不是 Salesforce 管理员，请在此停止并向您的管理员发送此页面的链接。他们需要遵循下面的 **安装连接器** 和 **授予用户访问权限** 步骤，然后才能完成连接。
</Tip>

## 安装连接器

<Note>
  此步骤必须由 Salesforce 系统管理员完成。
</Note>

<Steps>
  <Step title="Open Salesforce Setup">
    在 Salesforce 中，单击 <Icon icon="settings" /> 齿轮图标并选择 **设置**。
  </Step>

  <Step title="Open Connected Apps OAuth Usage">
    在 **快速查找** 框中，输入 `Connected Apps OAuth Usage` 并打开页面。
  </Step><Step title="Install the connector">
    1. 在列表中找到**LangChain Fleet Connector**。
    2. 单击“**安装**”。
    3. 在下一页确认安装。
  </Step>
</Steps>

## 授予用户访问权限

建议通过权限集授予访问权限来控制哪些用户可以通过 Fleet 进行身份验证。

<Note>
  此步骤必须由 Salesforce 系统管理员完成。
</Note>

<Steps>
  <Step title="Open the app policies">
    从 **连接的应用程序 OAuth 使用** 中，单击 **LangChain 队列连接器** 旁边的 **管理应用程序策略**。
  </Step>

  <Step title="Pre-authorize admin-approved users">
    在 **OAuth 策略** > **允许的用户** 下，选择 **管理员批准的用户已预先授权**，然后单击 **保存**。
  </Step>

  <Step title="Assign a permission set">
    使用 **管理权限集** 向需要连接 Fleet 中 Salesforce 工具的用户授予访问权限。
  </Step>
</Steps>

## 从舰队连接

管理员安装连接器并授予访问权限后，请返回 Fleet 以完成连接。

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-salesforce) 中，导航至 [**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools) 选项卡。
2. 找到 **Salesforce** 工具并单击 **连接**。
3. 使用您的 Salesforce 凭据登录并单击 **允许**。

现在连接成功，您工作区中的客服人员可以使用 Salesforce 工具。## 与代理一起使用 Salesforce

连接后，将 Salesforce 工具添加到特定代理：

1. 在[Fleet](https://smith.langchain.com/agents?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-salesforce)打开你的代理。
2. 在侧栏中，展开 **连接** 抽屉并单击 **添加连接**。
3. 搜索 **Salesforce Query** 并将其添加到代理。

## 故障排除

### 连接失败并出现身份验证错误

第一次连接尝试预计会失败。它在您的 Salesforce 组织中注册 **LangChain Fleet Connector**，以便管理员可以安装它。如果安装连接器后仍然连接失败，请确认：

* 管理员完成了 **安装连接器** 和 **授予用户访问权限**。
* 您的 Salesforce 用户被分配到一个权限集，该权限集授予对连接器的访问权限。
* 您通过 **使用自定义域** 使用正确的 Salesforce 域登录。

### 代理看不到对象或字段

Salesforce 工具以连接用户的权限运行。如果代理无法读取对象或自定义字段，请验证用户的 Salesforce 配置文件和权限集是否授予对该对象的读取访问权限。

## 后续步骤

<CardGroup>
  <Card title="Add more tools" icon="puzzle" href="/langsmith/fleet/tools">
    将附加服务连接到您的代理
  </Card><Card title="Agent identity" icon="user" href="/langsmith/fleet/agent-identity">
    选择代理是使用共享凭据还是每用户凭据
  </Card>

  <Card title="Human-in-the-loop" icon="check" href="/langsmith/fleet/essentials#human-in-the-loop">
    代理采取敏感行动之前需要获得批准
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/salesforce.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>