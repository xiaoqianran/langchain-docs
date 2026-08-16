<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure custom TLS certificates | https://docs.langchain.com/langsmith/self-host-custom-tls-certificates -->

# 配置自定义 TLS 证书

使用本指南在 LangSmith 中配置 TLS。首先安装内部证书颁发机构 (CA)，以便您的部署在系统范围内信任正确的根，以进行数据库或外部服务调用。然后，您可以配置 [Playground](/langsmith/prompt-engineering-concepts#playground) 特定的 mTLS，以便与支持的模型提供程序安全通信。

此页面涵盖：

- [Mounting internal certificate authorities](#mount-internal-cas-for-tls)（CA）系统范围内为数据库连接和 Playground 模型调用启用 TLS
- 使用 Playground 特定的 TLS 设置为受支持的模型提供商提供 mTLS 的客户端证书/密钥

## 为 TLS 安装内部 CA

<Note>
您必须使用 Helm Chart 0.11.9 或更高版本来使用以下配置挂载内部 CA。
</Note>

使用此方法通过LangSmith（Playground 模型调用和[database/external service connections](/langsmith/self-hosted#storage-services)）使内部/公共 CA 在系统范围内受信任。1. 创建一个文件，其中包含 TLS 与数据库和外部服务所需的所有 CA。如果您的部署在没有代理的情况下直接与 `beacon.langchain.com` 通信，请确保包含公共信任的 CA。所有证书都应在此文件中连接起来，中间有一个空行。
    ```
    -----BEGIN CERTIFICATE-----
    <PUBLIC_CA>
    -----END CERTIFICATE-----

    -----BEGIN CERTIFICATE-----
    <INTERNAL_CA>
    -----END CERTIFICATE-----

    ...
    ```
2. 使用包含此文件内容的密钥创建 Kubernetes 密钥。
    ```bash
    kubectl create secret generic <SECRET_NAME> --from-file=<SECRET_KEY>=<CA_BUNDLE_FILE_PATH> -n <NAMESPACE>
    ```
3. 如果对您的数据库和其他外部服务使用用于 TLS 的自定义 CA，请向您的 LangSmith helm 图表提供以下值：
    ```yaml Helm
    config:
      customCa:
        secretName: <SECRET_NAME> # The name of the secret created in step 2.
        secretKey: <SECRET_KEY> # The key in the secret containing the CA bundle.

    clickhouse:
      external:
        tls: true # Only enable if you want TLS for Clickhouse.
    postgres:
      external:
        customTls: true # Only enable if you want TLS for Postgres.
    ```
4. 确保使用 TLS 支持的连接字符串：
    - <b>Postgres</b>：将`?sslmode=verify-full&sslrootcert=system`添加到末尾。
    - <b>Redis</b>：使用`rediss://`代替`redis://`作为前缀。

## 对模型提供者使用自定义 TLS 证书

<Note>
此功能目前仅适用于以下模型提供商：

* 天蓝色OpenAI
* OpenAI
* 自定义（我们的自定义模型服务器）。请参阅[custom model server documentation](/langsmith/custom-endpoint)了解更多信息。这些 TLS 设置适用于所选模型提供程序的所有调用（包括在线评估）。当提供程序需要相互 TLS（客户端证书/密钥）或当您必须覆盖对提供程序调用的特定 CA 的信任时，请使用它们。它们补充了上面配置的内部 CA 捆绑包。
</Note>

您可以使用自定义 TLS 证书连接到 Playground 中的模型提供程序。如果您使用自签名证书、来自自定义证书颁发机构的证书或相互 TLS 身份验证，这非常有用。

要使用自定义 TLS 证书，请设置以下环境变量。有关如何配置应用程序设置的更多信息，请参阅[self-hosted overview](/langsmith/self-hosted)。* [可选] `LANGSMITH_PLAYGROUND_TLS_KEY`：PEM 格式的私钥。这必须是文件路径（对于已安装的卷）。这通常仅对于双向 TLS 身份验证是必需的。
* [可选] `LANGSMITH_PLAYGROUND_TLS_CERT`：PEM 格式的证书。这必须是文件路径（对于已安装的卷）。这通常仅对于双向 TLS 身份验证是必需的。
* [可选] `LANGSMITH_PLAYGROUND_TLS_CA`：PEM 格式的自定义证书颁发机构 (CA) 证书。这必须是文件路径（对于已安装的卷）。仅当您使用低于 `0.11.9` 的 helm 版本时，才使用此选项来挂载 CA；否则，请使用上面的[Mount internal CAs for TLS](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)部分。

设置完这些环境变量后，进入 Playground **设置**页面并选择需要自定义 TLS 证书的 **Provider**。像往常一样设置模型提供程序配置，连接到模型提供程序时将使用自定义 TLS 证书。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-custom-tls-certificates.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>