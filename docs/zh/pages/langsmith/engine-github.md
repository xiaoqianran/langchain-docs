<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect LangSmith Engine to GitHub | https://docs.langchain.com/langsmith/engine-github -->

# 将LangSmith引擎连接到GitHub

将LangSmith引擎连接到LangSmith云中的GitHub，或创建和配置您自己的GitHub应用程序以进行自托管部署。

连接 GitHub 存储库是可选的。连接后，LangSmith 引擎会读取源代码来诊断问题并打开拉取请求并提供建议的修复方案。引擎在LangSmith云中使用LangChain管理的GitHub应用程序，而自托管操作员则创建和管理自己的GitHub应用程序。

## LangSmith 云

在LangSmith云中，引擎通过LangChain管理的GitHub应用程序进行连接。您无需自行创建或配置应用程序。

要连接您的存储库：

1. 在[LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine-github)中，打开跟踪项目并进入**引擎**选项卡。
2. 在 **连接代理的代码存储库** 下，单击 **连接 GitHub** 并授权 LangChain 管理的 GitHub 应用程序。
3. 在引擎应访问的存储库上安装应用程序。在 GitHub 组织上安装应用程序可能需要 GitHub 组织所有者的批准。如果您不是所有者，GitHub 会在应用程序可用之前向所有者发送安装请求以供批准。
4. 在 **Engine** 选项卡上的 **GitHub Repository** 字段中选择连接的存储库。有关托管应用程序的访问和保留模型，请参阅[Engine security](/langsmith/engine-security#github-integration)。

## 自托管

要为自托管部署创建和配置 GitHub 应用程序：

### 创建 GitHub 应用程序

<Steps>
  <Step title="Create the app">
    转到 [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps) 并单击 **新建 GitHub 应用程序**。

    * **GitHub 应用程序名称**：任何唯一的名称，例如 `acme-langsmith-engine`。
    * **主页 URL**：您的 LangSmith 部署 URL，例如 `https://langsmith.example.com`。
    * **此 GitHub 应用程序可以安装在哪里？**：对于大多数自托管部署，选择 **仅在此帐户上**。仅当您打算分发应用程序时，才选择**任何帐户**。
  </Step>

  <Step title="Set the callback URL">
    添加以下 **回调 URL**，将 `<langsmith-host>` 替换为您的 LangSmith 主机名：

    ```
    https://<langsmith-host>/api-host/v1/integrations/forge/github/callback
    ```
  </Step>

  <Step title="Set the webhook URL and secret">
    使用机密管理器或其他加密安全生成器生成至少 32 字节的随机 Webhook 机密。将此值存储在您的 LangSmith 秘密存储中。

    在 **Webhook** 下，选择 **Active** 并设置 **Webhook URL**，将 `<langsmith-host>` 替换为您的 LangSmith 主机名：

    ```
    https://<langsmith-host>/api-host/v1/integrations/forge/github/webhook
    ```

    在 **Webhook 密钥** 中输入生成的值。
  </Step>

  <Step title="Set repository permissions">
    在 **权限 > 存储库权限**下，授予以下权限：* **内容**：阅读和写作。
    * **拉取请求**：读取和写入。
    * **元数据**：只读（自动选择）。

    在**订阅事件**下，选择无事件。引擎不需要任何事件订阅。
  </Step>

  <Step title="Create the app and gather its values">
    单击“**创建 GitHub 应用程序**”。 GitHub 在应用程序设置页面上提供以下值：

    |价值|在哪里可以找到它 |环境变量 |
    | ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------ |
    | **应用程序ID** |数字，位于页面顶部 | `FORGE_GITHUB_APP_ID` |
    | **公共链接** |例如，`https://github.com/apps/acme-langsmith-engine` | `FORGE_GITHUB_APP_PUBLIC_LINK` |
    | **客户端ID** |在 **关于** |下`FORGE_GITHUB_CLIENT_ID` |
    | **客户秘密** |在 **客户端密钥** 下，单击 **生成新的客户端密钥**（显示一次）| `FORGE_GITHUB_CLIENT_SECRET` || **私钥** |在 **私钥** 下，单击 **生成私钥**（下载 `.pem` 文件）| `FORGE_GITHUB_APP_PEM` |
  </Step>

  <Step title="Generate a state JWT secret">
    LangSmith 使用 HMAC 密钥来签署短期 OAuth 状态令牌并保护回调状态。使用秘密管理器或其他加密安全生成器生成至少 32 字节的随机秘密。 GitHub 不提供此值。

    这是`FORGE_GITHUB_STATE_JWT_SECRET`。单独生成它，并且不要重复使用 webhook 密钥或任何其他凭据。
  </Step>

  <Step title="Create a Kubernetes Secret">
    <Warning>
      GitHub 客户端密钥、私钥、状态 JWT 密钥和 Webhook 密钥都是凭证。仅将它们存储在 Kubernetes Secret 中，而不是存储在 Helm 值或命令行参数中。
    </Warning>

    使用现有的 [secret-management workflow](/langsmith/self-host-using-an-existing-secret)，使用以下密钥创建一个名为 `langsmith-forge-github` 的 Kubernetes Secret：|关键|价值|
    | ------------------------------------------- | ------------------------------------------------------ |
    | `forge_github_client_secret` | GitHub 客户端秘密 |
    | `forge_github_state_jwt_secret` |单独生成状态 JWT 秘密 |
    | `forge_github_app_pem` | GitHub App私钥PEM的内容 |
    | `forge_github_webhook_secret` | Webhook 秘密也在 GitHub 中配置 |

    对于生产部署，请使用现有的机密工作流程，例如 [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) 或 [External Secrets Operator](https://external-secrets.io/)。
  </Step>

  <Step title="Add the configuration to your langsmith_config.yaml">
    将以下内容添加到 [⟦T22⟧](/langsmith/kubernetes#configure-your-helm-charts) 中的 `hostBackend.deployment.extraEnv`。应用程序 ID、公共链接和客户端 ID 使用文字 `value` 条目。使用 `secretKeyRef` 引用客户端密钥、状态 JWT 密钥、私钥和 Webhook 密钥；切勿通过 `commonEnv` 设置它们或将其设置为内联值：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    hostBackend:
      deployment:
        extraEnv:
          - name: FORGE_GITHUB_APP_ID
            value: "<app-id>"
          - name: FORGE_GITHUB_APP_PUBLIC_LINK
            value: "https://github.com/apps/<app-slug>"
          - name: FORGE_GITHUB_CLIENT_ID
            value: "<client-id>"
          - name: FORGE_GITHUB_CLIENT_SECRET
            valueFrom:
              secretKeyRef:
                name: langsmith-forge-github
                key: forge_github_client_secret
          - name: FORGE_GITHUB_STATE_JWT_SECRET
            valueFrom:
              secretKeyRef:
                name: langsmith-forge-github
                key: forge_github_state_jwt_secret
          - name: FORGE_GITHUB_APP_PEM
            valueFrom:
              secretKeyRef:
                name: langsmith-forge-github
                key: forge_github_app_pem
          - name: FORGE_GITHUB_WEBHOOK_SECRET
            valueFrom:
              secretKeyRef:
                name: langsmith-forge-github
                key: forge_github_webhook_secret
    ```

    应用 Helm 配置：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
    ```
  </Step>

  <Step title="Install the app on repositories">
    一旦 Pod 健康，请在引擎应访问的存储库上安装 GitHub 应用程序：1. 打开应用程序的公共链接 (`FORGE_GITHUB_APP_PUBLIC_LINK`) 并单击 **安装**，或在 GitHub 组织中打开 **设置 > 应用程序 > GitHub 应用程序**。
    2. 选择引擎应访问的存储库。如果安装未授予对所有存储库的访问权限，请显式选择引擎需要的每个私有存储库。
    3. 在LangSmith中，打开跟踪项目，进入**Engine**选项卡，然后在**GitHub Repository**字段中选择存储库。

    连接的存储库允许引擎使用您的源代码进行诊断并打开拉取请求以及建议的修复。
  </Step>
</Steps>

## 另请参阅

* [Find and fix your agent's issues](/langsmith/engine)：引擎设置、成本和问题工作流程。
* [Engine on self-hosted](/langsmith/engine-self-hosted)：自托管架构和数据处理。
* [Engine security](/langsmith/engine-security)：引擎如何处理您的数据和 GitHub 访问。
* [Enable Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)：在LangSmith Helm 图表中启用引擎。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-github.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>