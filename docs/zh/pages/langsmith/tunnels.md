<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tunnels | https://docs.langchain.com/langsmith/tunnels -->

# 隧道

通过仅出站连接器从 LangSmith 访问专用网络上的服务，而无需将其暴露于公共互联网。

<Note>
  隧道位于[alpha](/langsmith/release-stages)。要为您的组织请求访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

隧道可让 LangSmith 到达在您的专用网络上运行的服务，例如模型端点或 MCP 服务器，而无需向 Internet 开放该服务。您在网络内运行一个小型连接器。连接器打开到 LangSmith 的出站连接，LangSmith 通过该连接发送服务请求。

每个地区的 [LangSmith Cloud](/langsmith/cloud) 上都有隧道。它们不可用于自托管或混合部署。

## 隧道如何工作1. 组织管理员在 LangSmith 中创建隧道。
2. 您在网络内运行连接器，并使用隧道 ID、API 密钥和一个或多个 **目标** 对其进行配置。目标是映射到私有地址的名称，例如映射到 `http://litellm.internal:4000`。
3. 连接器通过 HTTPS（端口 443）将出站连接到LangSmith。没有任何东西连接到您的网络，并且连接器不公开任何端口。
4. 每个 HTTP 目标都会获得一个 **隧道 URL**。无论您在何处使用该服务的地址，都可以在 LangSmith 中使用该 URL。
5. 当 LangSmith 功能调用隧道 URL 时，LangSmith 检查调用者是否属于隧道组织，并将请求发送到连接器，连接器将其转发到目标。

## 设置隧道

要创建隧道，您需要[Organization Admin or Organization Operator](/langsmith/rbac#organization-roles)角色。您还需要网络内的一个位置来运行连接器：一个 Kubernetes 集群或一个 Docker 主机，可以访问您的服务并建立出站 HTTPS 连接。

<Steps>
  <Step title="Open Tunnels settings" icon="settings">
    在 LangSmith 中，转到 **设置**，然后选择 **基础设施** 下的 **隧道**。

    <img alt="Tunnels settings page with no tunnels and a Create tunnel button" />
  </Step>

  <Step title="Create the tunnel" icon="plus">
    选择**创建隧道**。输入名称和可选描述，然后选择“**创建隧道**”。

    <img alt="Create tunnel dialog with a name and a description filled in" />
  </Step><Step title="Copy the connector configuration" icon="copy">
    新隧道显示**正在等待连接器**。其**连接器配置**部分以环境变量或 YAML 文件的形式显示隧道 ID 和连接器所需的设置。复制它们，并将示例目标替换为您自己的目标（请参阅[Targets](#targets)）。

    <img alt="Tunnel details showing Waiting for connector, the tunnel ID, and the connector configuration as environment variables" />
  </Step>

  <Step title="Create an API key for the connector" icon="key">
    在 **设置** > **API 密钥** 中，[create an organization-scoped service key](/langsmith/create-account-api-key) 具有组织管理员或组织操作员角色。连接器使用此密钥连接到LangSmith。将其存储在连接器可以读取的位置，并且不要将其提交到源代码管理。
  </Step>

  <Step title="Run the connector" icon="terminal">
    在网络内运行连接器。如果您的组织不在 GCP US 区域，请将端点设置为您所在区域的 API URL：

    |地区 |端点 |
    | - | - |
    |基仕伯美国 | `https://api.smith.langchain.com`（默认）|
    | GCP 欧盟 | `https://eu.api.smith.langchain.com` |
    |基仕伯亚太区 | `https://apac.api.smith.langchain.com` |
    | AWS 美国 | `https://aws.api.smith.langchain.com` |

    <Tabs>
      <Tab title="Kubernetes (Helm)">
        将 API 密钥存储在 Secret 中，然后安装 [⟦T9⟧ chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-connector)：

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        kubectl create namespace langsmith-connector
        kubectl -n langsmith-connector create secret generic langsmith-connector-key \
          --from-literal=langsmith_api_key=<api key>

        helm repo add langchain https://langchain-ai.github.io/helm/
        helm repo update
        helm install langsmith-connector langchain/langsmith-connector \
          --namespace langsmith-connector \
          --set config.connectionId=<tunnel id> \
          --set config.existingSecretName=langsmith-connector-key \
          --set config.targets.litellm=http://litellm.internal:4000
        ```

        对于 GCP US 以外的区域添加 `--set config.endpoint=<endpoint>`。图表将密钥作为文件安装，连接器在每次重新连接时都会再次读取它，因此您可以轮换 Secret 中的密钥，而无需重新启动连接器。运行单个副本。一个连接器已与 LangSmith 保持两个冗余连接。
      </Tab>

      <Tab title="Docker">
        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        docker run -d --name langsmith-connector --restart unless-stopped \
          -e LANGSMITH_CONNECTION_ID=<tunnel id> \
          -e LANGSMITH_API_KEY=<api key> \
          -e LANGSMITH_CONNECTOR_TARGETS="litellm=http://litellm.internal:4000" \
          langchain/langsmith-connector:0.2.0
        ```

        对于 GCP US 以外的区域添加 `-e LANGSMITH_ENDPOINT=<endpoint>`。要从文件中读取密钥，请将 `LANGSMITH_API_KEY_FILE` 设置为其路径。
      </Tab>
    </Tabs>

    如果您的网络需要出站代理，则连接器支持 `HTTPS_PROXY`。设置 `LOG_LEVEL=debug` 记录它转发的每个请求。使用 Helm，将其设置为 `connector.deployment.extraEnv`。
  </Step>

  <Step title="Check that the tunnel is connected" icon="circle-check">
    连接器启动后几秒钟内，隧道就会显示 **已连接** 并列出连接器服务的每个目标及其隧道 URL。

    <img alt="Tunnel details showing Connected and two available HTTP targets, each with a tunnel URL and a copy button" />

    要从您自己的计算机检查目标，请使用组织的 API 密钥向其隧道 URL 发送请求：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl -H "X-Api-Key: $LANGSMITH_API_KEY" https://<handle>.tunnels.smith.langchain.com/
    ```

    响应来自您的服务。没有有效 API 密钥的请求将返回 `403` 和 `connection access denied`。

    如果隧道停留在 **等待连接器**，请检查连接器的日志。每次连接器连接失败时，它都会记录一条警告并说明原因并重试。常见原因是 API 密钥没有组织管理员或组织操作员角色、隧道 ID 错误或隧道已禁用。
  </Step>
</Steps>

### 目标

每个目标都是一个名称和一个地址：* **名称**：1 到 63 个字符。它以小写字母开头，仅包含小写字母、数字和下划线。
* **地址**：`http://host:port`或`https://host:port`，没有路径。 LangSmith 只能到达 HTTP 和 HTTPS 目标。

一个连接器最多可以服务 256 个目标。要添加或更改目标，请更新连接器的配置并重新启动它，例如使用 `helm upgrade`。

## 使用隧道 URL

选择目标旁边的 **复制隧道 URL** 以复制其 URL。隧道 URL 类似于 `https://<handle>.tunnels.smith.langchain.com`，该区域位于其他区域的域中（例如，`tunnels.eu.smith.langchain.com`）。您还可以使用 `GET /v1/connections/{tunnel_id}/targets` 列出隧道的目标和 URL。

您可以在以下位置使用隧道 URL 代替服务地址：

* [Model configurations](/langsmith/model-configurations) 和 [custom model endpoints](/langsmith/custom-endpoint)，作为基本 URL。这涵盖了使用该模型的 Playground、实验和在线评估器。
* [LangSmith Fleet](/langsmith/fleet)，作为模型的基本 URL 或 MCP 服务器 URL。
* 使用 OAuth 作为令牌端点的 MCP 服务器。授权端点必须保持可从浏览器访问，因此它不能是隧道 URL。

请记住以下几点：* 隧道 URL 仅使用 HTTPS。
* 通过隧道的请求不遵循重定向。
* 通过隧道到达的模型在其配置中需要有自己的 API 密钥。 LLM 身份验证代理凭据不通过隧道发送。
* 您的目标必须在 30 秒内开始响应。单个请求的传输时间最长可达 1 小时，请求正文最大可达 32 MiB。

## 安全

### 仅出站连接

连接器通过 TLS 在端口 443 上与您所在区域的 LangSmith API 端点建立出站 WebSocket 连接。您不打开入站端口或更改 LangSmith 的防火墙规则，并且连接器 Pod 不公开任何端口。

### 身份验证和授权

* **连接器**：连接器使用有权连接隧道的组织 API 密钥进行身份验证。 LangSmith 仅在启用隧道时接受连接器。
* **每个请求**：LangSmith 授权每个请求到隧道 URL。调用者必须是代表隧道组织成员的 LangSmith 服务，或者必须提供该组织的 API 密钥。必须启用隧道。隧道 URL 不是秘密，本身不授予访问权限。

### 你的网络暴露了什么* LangSmith 仅向连接器发送目标名称。连接器在自己的配置中查找名称并拒绝它没有的名称，因此 LangSmith 只能到达您配置的目标。
* 连接器不连接到云元数据地址。
* 对于 HTTP 目标，目标的主机和端口与 LangSmith 共享，因此请求携带正确的 `Host` 标头。

### 标题

LangSmith 在请求到达您的服务之前删除自己的凭据和身份标头：`X-Service-Key`、`X-Api-Key`、`X-Tenant-Id`、`X-Organization-Id`、`X-User-Id`、`X-Data-Plane-Auth`、`Cookie` 以及以以下开头的任何标头`X-Langsmith-` 或 `X-Langchain-`。 `Authorization` 通过，因此使用不记名令牌进行身份验证的服务无需更改即可工作。

如果您的服务使用自己的 `X-Api-Key` 或 `Cookie` 标头进行身份验证，LangSmith 功能会将您配置的标头传递给您的服务。以 LangSmith 的身份标头命名的标头（例如 `X-Tenant-Id`）永远不会到达您的服务。

### 加密* LangSmith 和连接器之间的流量在 TLS 加密的 WebSocket 连接内传输。
* LangSmith 终止隧道 URL 的 TLS 并处理内存中的每个请求以将其路由到连接器。
* 在连接器和您的服务之间，使用 `https://` 目标来加密流量。连接器根据系统证书颁发机构验证服务的证书。要信任私有证书颁发机构，请在连接器上设置 `SSL_CERT_FILE`。到 `http://` 目标的流量在您的网络内部未加密。

### 日志记录和数据存储

LangSmith 不记录通过隧道发送的请求或响应主体。对于失败的请求，LangSmith 记录隧道、组织、目标、状态和错误。 LangSmith 仅存储到达连接器所需的路由信息​​。

连接器也不记录请求或响应正文。默认情况下，它仅记录失败，例如无法到达的目标。在调试级别，它还记录每个请求的目标、地址、持续时间和大小。

### 撤销访问权限要阻止 LangSmith 访问您的服务，请在 **设置** > **隧道** 中禁用或删除隧道。然后，LangSmith 拒绝对其隧道 URL 的请求并拒绝新的连接器连接。您还可以停止连接器，或撤销其 API 密钥。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tunnels.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>