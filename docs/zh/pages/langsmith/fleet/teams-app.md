<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integrate Microsoft Teams with an agent | https://docs.langchain.com/langsmith/fleet/teams-app -->

# 将 Microsoft Teams 与代理集成

通过自带 Azure Bot 将 LangSmith Fleet 连接到 Microsoft Teams，让代理与 Teams 中的用户进行通信。

借助 LangSmith Fleet，您可以通过注册自定义 Azure 机器人将代理连接到 Microsoft Teams。连接后，您的代理可以：

* 接收来自 Teams 用户的消息，使用消息内容开始新的运行。
* 使用 Bot 框架在 Teams 对话中直接回复。
* 通过 Microsoft Graph API 工具访问 Teams 频道和消息。

## 先决条件

* 舰队中现有的代理（请参阅[Quickstart](/langsmith/fleet/quickstart)创建一个）
* 具有创建资源权限的[Azure account](https://portal.azure.com)
* 在 Microsoft Teams 组织中上传和安装自定义应用程序的权限。您的团队管理员可能需要启用 [custom app uploading](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload)。

## 设置 Teams 机器人

创建一个 Azure Bot，将其连接到 Fleet，并将其安装在 Teams 中：

**1.创建 Azure Bot 资源**1. 前往[Azure Portal](https://portal.azure.com)。
2. 搜索 **Azure Bot** 并单击 **创建**。
3. 填写必填字段：
   * **机器人句柄**：您的机器人的唯一标识符。
   * **订阅**：选择您的 Azure 订阅。
   * **资源组**：创建一个新资源组或选择一个现有资源组。
   * **定价层**和**数据驻留**：选择适合您的组织的设置。参见[Azure Bot pricing](https://azure.microsoft.com/en-us/pricing/details/bot-services/)和[regionalization](https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-concept-regionalization)。单独的区域机器人并不能保证端到端的数据驻留。
   * **应用程序类型**：选择**单租户**。
   * **创建类型**：选择**创建新的 Microsoft App ID**。
4. 单击“**查看 + 创建**”，然后单击“**创建**”。

> [!注意]
>
> Azure 不再允许新的多租户机器人。

**2.获取您的应用程序凭据**

资源创建后：

1. 导航到您的机器人资源，然后单击左侧边栏中的 **配置**。

   ![Azure Bot overview with Configuration highlighted in the sidebar](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-bot-overview.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=3313ae623e7ae7484d2d56f0bcdf894d)

2. 复制队列设置向导的 **Microsoft 应用程序 ID** 和 **应用程序租户 ID**。

   ![Azure Bot configuration with the messaging endpoint, Microsoft App ID, and App Tenant ID highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-bot-configuration.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=e9103b96e29405f4b53989170b99e9e9)

3. 单击应用程序 ID 旁边的**管理密码**。

4. 单击“**新客户端密钥**”，添加描述，然后单击“**添加**”。

5. 复制密钥**值**，而不是密钥 ID。该值仅显示一次；如果你丢失了它，请创建一个新的秘密。**3.配置 Azure 连接**

1. 在 [Fleet](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-teams-app) 中，打开 **集成** > **Slack 和 Teams**。在 **Teams Bot** 中，单击 **添加 Teams Bot**。

   ![Fleet navigation with Integrations, Slack & Teams, and Add Teams Bot highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-integration.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=5b056763ae4ecff16087f0ec141f3d1d)

2. 从队列向导的第一个屏幕复制 Webhook URL。

3. 在 Azure Bot 资源中，转到 **配置**。将 URL 粘贴到 **消息传送端点** 并单击 **应用**。不需要流端点。

4. 转到 **频道**，选择 **Microsoft Teams**，然后同意服务条款。

5. 在 **消息传递** 选项卡上，为您的 Teams 组织选择云环境，然后单击 **应用**。

6. 确认 **Microsoft Teams** 出现在已连接的频道列表中并检查其状态。

   ![Azure Bot Channels sidebar and connected Microsoft Teams channel with healthy status highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-teams-channel-status.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=d7cdafaeb112a15099c59431f7af5472)

> [!警告]
>
> 为每个新的 Azure 机器人（包括替换机器人）启用 Teams 通道。上传应用程序包不会启用它。

详情请参见[Connect a bot to Microsoft Teams](https://learn.microsoft.com/en-us/azure/bot-service/channel-connect-teams)。

**4.注册并链接机器人**

1. 返回 Fleet，单击 **Continue to Credentials**，然后输入：* **机器人显示名称**：机器人的名称。
   * **Azure 应用程序 ID（客户端 ID）**：来自 Azure 的 Microsoft 应用程序 ID。
   * **Azure 租户 ID**：来自 Azure 的应用程序租户 ID，而不是您的队列工作区 ID。
   * **客户端密钥（应用程序密码）**：您复制的密钥值。

   ![Fleet Teams bot credentials form with the Azure Tenant ID and client secret fields highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-credentials.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=b0af39218adf0f35dcafdbe169818571)

2. 单击“**继续**”，然后单击“**下载 Teams 应用程序包**”。保留用于安装的 ZIP。

   ![Fleet wizard screen highlighting Download Teams App Package and Continue](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-package.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=1f6b77274c476776bc8968b52e03895a)

3. 单击“**继续**”，选择您的代理，然后单击“**完成**”。确认队列显示 **Teams bot 配置成功**。

   ![Fleet wizard screen highlighting the agent selector and Finish button](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-finish.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=6c13ecdcdb00940f4fd0e3ddec2e5519)

> [!警告]
>
> 下载 ZIP 或单击 **继续** 不会保存机器人注册。在 Teams 中测试或安装机器人之前，单击 **完成**。

如果您从代理的 **Channels** 抽屉开始，请单击 **Save & Connect** 而不是 **Finish**。如果您选择 **在没有代理的情况下完成**，则在测试回复之前[link an agent](#link-an-existing-bot-to-an-agent)。

**5.在 Teams 中安装并测试机器人**

1. 在 Teams 中，转到 **应用程序** > **管理您的应用程序** > **上传应用程序**。

2. 选择 **上传自定义应用程序** 并选择从 Fleet 下载的 ZIP。

   ![Teams Manage your apps page with Apps, Upload an app, and Upload a custom app highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/teams-upload-custom-app.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=7dedaf4f6b02e737f4f2e4914dc4bf92)

3. 如果需要，请遵循组织的审批流程，然后将应用程序添加到团队或聊天中。4. 发送消息并确认客服人员回复。在频道和群聊中，**@提及**机器人。

如果使用新的应用程序 ID 重新创建 Azure 机器人，请下载该机器人的新包。不要为已删除的机器人重复使用包。

## 将现有机器人链接到代理

如果您在设置过程中选择了代理，则机器人已链接。否则，请使用任一选项：

* 在 Fleet 中，打开 **Integrations** 或 **Slack & Teams**，选择机器人，选择代理，然后单击 **Attach**。
* 打开代理的 **Channels** 抽屉，选择 **Teams**，然后选择机器人。

## 添加团队工具

当您将代理链接到 Teams 机器人时，Fleet 尝试添加 `teams_reply_to_message` 工具。它可能显示为 **Teams Bot Reply**。使用此工具向原始 Teams 对话发送回复。单独在 Fleet 中的回复并不是 Teams 的回复。机器人回复使用机器人凭据，不需要单独的 Microsoft Graph 授权。

要读取频道或执行其他 Teams 操作，请在代理的 **连接** 抽屉中添加相关 Teams 工具。 Microsoft Graph 工具可能需要授权。 `teams_bot_send_proactive_message` 工具适用于直接回复之外的消息，例如通知。

## 故障排除

### 解决安装错误团队可以报告`InvalidUserId`“机器人配置/注册不正确，请检查机器人设置。”仅此消息并不能确定原因。

在重新创建机器人或更改设置之前，请检查以下内容：

* **Azure 和 Fleet**：确认已为正确的云启用 Teams 通道。验证机器人的应用程序 ID、租户 ID 和单租户应用程序类型。在队列中使用相同的 ID，并通过链接的代理完成设置。
* **应用程序包**：在 ZIP 的 `manifest.json` 中，检查 `bots[].botId` 是否与 Azure 机器人的应用程序 ID 匹配。顶级 `id` 标识 Teams 应用程序，可能与机器人 ID 不同。
* **团队组织**：在目标组织中安装并确认其策略允许自定义应用程序。

要在不安装包的情况下进行测试，请在 Azure Bot 资源中打开 **Channels** > **Microsoft Teams**。使用 **在 Teams 中打开**，或选择 **获取机器人嵌入代码** 并打开 Teams HTTPS 测试链接。使用相同的机器人、帐户和组织发送消息，然后检查回复。此可选诊断不适用于生产分发。它可能需要自定义应用程序上传权限，并且嵌入代码在某些云中不可用。如果聊天未打开，请检查 Azure 注册、Teams 频道和策略。如果它打开但没有收到回复，请检查队列、代理链接、消息传递端点和凭据。如果回复有效但软件包安装失败，请检查软件包和策略。个人聊天回复不会验证团队或群组聊天安装。

如果错误仍然存在，请收集以下信息以获取支持：

* 具体的失败时间和时区、到达的步骤以及错误截图。
* 失败的请求 URL、HTTP 状态、错误响应以及请求或相关 ID（如果有）。
* Azure Bot 的应用程序 ID、应用程序租户 ID、应用程序类型以及 Teams 通道状态和云环境。
* 用于失败安装的确切应用程序 ZIP。

> [!警告]
>
> 请勿共享客户端机密、访问令牌、cookie、授权标头或未编辑的网络捕获。在共享屏幕截图或请求详细信息之前编辑凭据。

### 代理没有回应* 检查队列运行是否有 `teams_reply_to_message` 调用及其结果。如果该工具丢失，请将其添加到代理中。如果代理没有调用它，请更新其指令并再次测试。指令不保证工具调用。
* 检查队列线程是否获得批准，**Feed** 选项卡是否有错误，以及代理的渠道是否为 [paused](/langsmith/fleet/channels#pause-and-resume-channels)。
* 在频道和群聊中，**@提及**机器人并确认该应用程序已安装在该团队或群聊中。
* 验证 Azure 消息传递端点与 Fleet 的 Webhook 匹配，并且机器人已链接到目标代理。
* 根据 Azure 检查 Fleet 中的应用程序 ID、租户 ID 和客户端密钥值。确认秘密尚未过期。在队列中保存凭据不会测试 Azure 身份验证。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/teams-app.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。