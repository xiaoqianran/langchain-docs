<!-- langchain-docs: Integrate Microsoft Teams with an agent | https://docs.langchain.com/langsmith/fleet/teams-app -->

# Integrate Microsoft Teams with an agent

Connect LangSmith Fleet to Microsoft Teams by bringing your own Azure Bot to let agents communicate with users in Teams.

With LangSmith Fleet, you can connect your agents to Microsoft Teams by registering a custom Azure Bot. Once connected, your agents can:

* Receive messages from Teams users, starting a new run with the message content.
* Respond directly in Teams conversations using the Bot Framework.
* Access Teams channels and messages through Microsoft Graph API tools.

## Prerequisites

* An existing agent in Fleet (see [Quickstart](/langsmith/fleet/quickstart) to create one)
* An [Azure account](https://portal.azure.com) with permission to create resources
* Permission to upload and install custom apps in your Microsoft Teams organization. Your Teams administrator may need to enable [custom app uploading](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload).

## Set up the Teams bot

Create an Azure Bot, connect it to Fleet, and install it in Teams:

**1. Create an Azure Bot resource**

1. Go to the [Azure Portal](https://portal.azure.com).
2. Search for **Azure Bot** and click **Create**.
3. Fill in the required fields:
   * **Bot handle**: A unique identifier for your bot.
   * **Subscription**: Select your Azure subscription.
   * **Resource group**: Create a new one or select an existing one.
   * **Pricing tier** and **Data residency**: Choose settings for your organization. See [Azure Bot pricing](https://azure.microsoft.com/en-us/pricing/details/bot-services/) and [regionalization](https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-concept-regionalization). A regional bot alone does not guarantee end-to-end data residency.
   * **Type of App**: Select **Single Tenant**.
   * **Creation type**: Select **Create new Microsoft App ID**.
4. Click **Review + create**, then **Create**.

> [!NOTE]
>
> Azure no longer allows new Multi Tenant bots.

**2. Get your app credentials**

After the resource is created:

1. Navigate to your bot resource and click **Configuration** in the left sidebar.

   ![Azure Bot overview with Configuration highlighted in the sidebar](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-bot-overview.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=3313ae623e7ae7484d2d56f0bcdf894d)

2. Copy the **Microsoft App ID** and the **App Tenant ID** for the Fleet setup wizard.

   ![Azure Bot configuration with the messaging endpoint, Microsoft App ID, and App Tenant ID highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-bot-configuration.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=e9103b96e29405f4b53989170b99e9e9)

3. Click **Manage Password** next to the App ID.

4. Click **New client secret**, add a description, and click **Add**.

5. Copy the secret **Value**, not the secret ID. The value is only shown once; if you lose it, create a new secret.

**3. Configure the Azure connection**

1. In [Fleet](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-teams-app), open **Integrations** > **Slack & Teams**. In **Teams Bots**, click **Add Teams Bot**.

   ![Fleet navigation with Integrations, Slack & Teams, and Add Teams Bot highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-integration.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=5b056763ae4ecff16087f0ec141f3d1d)

2. Copy the webhook URL from the first screen of the Fleet wizard.

3. In your Azure Bot resource, go to **Configuration**. Paste the URL into **Messaging endpoint** and click **Apply**. Streaming Endpoint is not required.

4. Go to **Channels**, select **Microsoft Teams**, and agree to the terms of service.

5. On the **Messaging** tab, select the cloud environment for your Teams organization and click **Apply**.

6. Confirm **Microsoft Teams** appears in the connected channels list and check its status.

   ![Azure Bot Channels sidebar and connected Microsoft Teams channel with healthy status highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/azure-teams-channel-status.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=d7cdafaeb112a15099c59431f7af5472)

> [!WARNING]
>
> Enable the Teams channel for every new Azure Bot, including a replacement. Uploading an app package does not enable it.

For details, see [Connect a bot to Microsoft Teams](https://learn.microsoft.com/en-us/azure/bot-service/channel-connect-teams).

**4. Register and link the bot**

1. Return to Fleet, click **Continue to Credentials**, and enter:

   * **Bot display name**: A name for the bot.
   * **Azure App ID (Client ID)**: The Microsoft App ID from Azure.
   * **Azure Tenant ID**: The App Tenant ID from Azure, not your Fleet workspace ID.
   * **Client Secret (App Password)**: The secret value you copied.

   ![Fleet Teams bot credentials form with the Azure Tenant ID and client secret fields highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-credentials.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=b0af39218adf0f35dcafdbe169818571)

2. Click **Continue**, then **Download Teams App Package**. Keep the ZIP for installation.

   ![Fleet wizard screen highlighting Download Teams App Package and Continue](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-package.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=1f6b77274c476776bc8968b52e03895a)

3. Click **Continue**, select your agent, and click **Finish**. Confirm Fleet displays **Teams bot configured successfully**.

   ![Fleet wizard screen highlighting the agent selector and Finish button](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/fleet-teams-finish.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=6c13ecdcdb00940f4fd0e3ddec2e5519)

> [!WARNING]
>
> Downloading the ZIP or clicking **Continue** does not save the bot registration. Click **Finish** before testing or installing the bot in Teams.

If you start from an agent's **Channels** drawer, click **Save & Connect** instead of **Finish**. If you select **Finish Without Agent**, [link an agent](#link-an-existing-bot-to-an-agent) before testing replies.

**5. Install and test the bot in Teams**

1. In Teams, go to **Apps** > **Manage your apps** > **Upload an app**.

2. Select **Upload a custom app** and choose the ZIP downloaded from Fleet.

   ![Teams Manage your apps page with Apps, Upload an app, and Upload a custom app highlighted](https://mintcdn.com/langchain-5e9cc07a/CJEa0alVI8zlVfYz/images/langsmith/teams-upload-custom-app.png?fit=max\&auto=format\&n=CJEa0alVI8zlVfYz\&q=85\&s=7dedaf4f6b02e737f4f2e4914dc4bf92)

3. Follow your organization's approval process if required, then add the app to a team or chat.

4. Send a message and confirm the agent replies. In channels and group chats, **@mention** the bot.

If you recreate the Azure Bot with a new App ID, download a new package for that bot. Do not reuse a package for the deleted bot.

## Link an existing bot to an agent

If you selected an agent during setup, the bot is already linked. Otherwise, use either option:

* In Fleet, open **Integrations** or **Slack & Teams**, select the bot, choose an agent, and click **Attach**.
* Open the agent's **Channels** drawer, select **Teams**, and choose the bot.

## Add Teams tools

Fleet attempts to add the `teams_reply_to_message` tool when you link an agent to a Teams bot. It may appear as **Teams Bot Reply**. Use this tool to send a reply to the originating Teams conversation. A response in Fleet alone is not a Teams reply. Bot replies use the bot credentials and do not require separate Microsoft Graph authorization.

To read channels or take other Teams actions, add the relevant Teams tools in the agent's **Connections** drawer. Microsoft Graph tools may require authorization. The `teams_bot_send_proactive_message` tool is for messages outside a direct reply, such as notifications.

## Troubleshooting

### Resolve installation errors

Teams can report `InvalidUserId` with "Incorrect bot configuration/registration, please check the bot settings." This message alone does not identify the cause.

Before recreating the bot or changing settings, check the following:

* **Azure and Fleet**: Confirm the Teams channel is enabled for the correct cloud. Verify the bot's App ID, tenant ID, and Single Tenant app type. Use the same IDs in Fleet, and finish setup with an agent linked.
* **App package**: In the ZIP's `manifest.json`, check that `bots[].botId` matches the Azure Bot's App ID. The top-level `id` identifies the Teams app and can differ from the bot ID.
* **Teams organization**: Install in the intended organization and confirm its policies allow the custom app.

To test without installing the package, open **Channels** > **Microsoft Teams** in the Azure Bot resource. Use **Open in Teams**, or select **Get bot embed code** and open the Teams HTTPS test link. Send a message with the same bot, account, and organization, and check for a reply.

This optional diagnostic is not for production distribution. It may require custom-app upload permission, and the embed code is unavailable in some clouds. If a chat does not open, check the Azure registration, Teams channel, and policies. If it opens but no reply arrives, check Fleet, the agent link, the messaging endpoint, and credentials. If the reply works but package installation fails, check the package and policies. A personal-chat reply does not verify team or group-chat installation.

If the error persists, collect the following for support:

* The exact failure time and time zone, the step reached, and an error screenshot.
* The failed request URL, HTTP status, error response, and request or correlation IDs, if available.
* The Azure Bot's App ID, App Tenant ID, app type, and Teams channel status and cloud environment.
* The exact app ZIP used for the failed installation.

> [!WARNING]
>
> Do not share client secrets, access tokens, cookies, authorization headers, or unredacted network captures. Redact credentials before sharing screenshots or request details.

### Agent does not respond

* Check the Fleet run for a `teams_reply_to_message` call and its result. If the tool is missing, add it to the agent. If the agent does not call it, update its instructions and test again. Instructions do not guarantee a tool call.
* Check the Fleet thread for approvals, the **Feed** tab for errors, and whether the agent's channels are [paused](/langsmith/fleet/channels#pause-and-resume-channels).
* In channels and group chats, **@mention** the bot and confirm the app is installed in that team or group chat.
* Verify the Azure messaging endpoint matches Fleet's webhook, and the bot is linked to the intended agent.
* Check the App ID, tenant ID, and client secret value in Fleet against Azure. Confirm the secret has not expired. Saving credentials in Fleet does not test Azure authentication.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/teams-app.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).