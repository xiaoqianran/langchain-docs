<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agent identity | https://docs.langchain.com/langsmith/fleet/agent-identity -->

# 代理身份

选择您的舰队代理是使用自己的凭据还是每个用户的凭据进行身份验证。

代理身份控制代理在与应用程序和服务交互时使用的[credentials](/langsmith/fleet/workspace-admin)。

<Warning>
  代理身份一旦设置，就无法更改。
</Warning>

## 固定凭证（“Claws”）

代理始终使用相同的 API 密钥和 OAuth 令牌进行身份验证，无论谁与其交互。

在以下情况下使用固定凭据：

* 代理作为共享服务运行（例如，团队 Slack 机器人或每日简报代理）。
* 您需要为所有用户提供一组经过身份验证的帐户。
* 代理需要在[channels](/langsmith/fleet/channels)或[schedules](/langsmith/fleet/schedules)上运行，这需要固定凭据。

使用固定凭据，代理执行的所有操作（发送电子邮件、发布消息、阅读日历）都使用代理所有者在设置期间连接的帐户。

## 用户凭据（“助手”）

代理使用与其交互的用户的 API 密钥和 OAuth 令牌进行身份验证，代表用户进行操作。

在以下情况下使用用户凭据：* 每个用户都应该通过自己的帐户进行操作（例如，从用户自己的收件箱中读取和发送的电子邮件助手）。
* 您需要每个用户的访问控制，以便代理只能看到该用户有权查看的内容。
* 审计跟踪需要反映执行每个操作的用户。

通过用户凭据，每个用户在第一次与代理交互时单独进行身份验证。代理使用该用户的令牌来执行其线程中的所有后续操作。

## 设置代理身份

设置代理身份：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-agent-identity)中，导航到要编辑的代理。
2. 点击右上角<Icon icon="pencil" /> **编辑**。
3. 单击“**设置身份**”并选择您要使用的身份。
4. 单击“**保存**”。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/agent-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>