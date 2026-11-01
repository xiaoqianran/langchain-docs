<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Relays | https://docs.langchain.com/langsmith/relays -->

# 继电器

通过网络中的连接器将沙箱的出站连接发送到您选择的主机，以便它们到达专用服务并从您网络的 IP 地址离开。

> [!注意]
>
> 继电器位于[alpha](/langsmith/release-stages)。要为您的组织请求访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。

中继通过您自己的网络发送一些 [sandbox's](/langsmith/sandboxes) 出站连接。您在网络内运行 LangSmith 连接器，并将中继规则添加到沙箱的代理配置中。当沙箱连接到规则匹配的主机时，连接将从连接器而不是LangSmith离开。使用中继来访问只能在网络内部访问的服务，例如内部数据库或 API，或者从网络的 IP 地址发出请求。

中继的工作方向与 [tunnel](/langsmith/tunnels) 相反，它可以让 LangSmith 调用专用网络上的服务。两者都使用相同的连接器，其中一个连接器可用于隧道或中继。

每个地区的 [LangSmith Cloud](/langsmith/cloud) 均可使用中继。它们不可用于自托管或混合部署。

## 继电器的工作原理1. 组织管理员在LangSmith中创建中继。
2. 您使用中继的 ID 和 API 密钥在网络内运行连接器。连接器通过 HTTPS（端口 443）将出站连接到 LangSmith。没有任何东西连接到您的网络，并且连接器不公开任何端口。
3. 将中继规则添加到沙箱的`proxy_config`。该规则列出要通过中继发送的主机名、IP 地址或 CIDR 块。
4. 当沙箱打开到匹配目标的连接时，LangSmith 将其传送到连接器，然后连接器打开来自您网络的连接。
5. 连接器在连接之前根据自己的策略检查每个目标。默认情况下，它仅到达端口 80 和 443 上的公共地址。您可以使用允许规则扩大范围，并使用拒绝规则缩小范围。

## 设置中继

要创建中继，您需要 [Organization Admin or Organization Operator](/langsmith/rbac#organization-roles) 角色。您还需要网络内有一个位置来运行连接器，例如 Kubernetes 集群、Docker 主机或具有 [LangSmith CLI](/langsmith/langsmith-cli) 的计算机。它必须到达您中继的目标并建立出站 HTTPS 连接。

**1.创建 API 密钥**在 **设置** > **API 密钥** 中，[create an organization-scoped service key](/langsmith/create-account-api-key) 具有组织管理员或组织操作员角色。连接器用它来连接LangSmith。将其存储在连接器可以读取的位置，并且不要将其提交到源代码管理。

**2.创建中继**

在LangSmith中，转到**设置**，然后选择**基础设施**下的**继电器**。

![Relays settings page with no relays and a Create relay button](https://mintcdn.com/langchain-5e9cc07a/ysonGzQhi7dfTPaz/langsmith/images/relays-empty.png?fit=max\&auto=format\&n=ysonGzQhi7dfTPaz\&q=85\&s=f81408254ddacb7ad1d914b0bff01420)

选择 **创建中继**，输入名称和可选说明，然后选择 **创建中继**。名称在组织的隧道和中继中是唯一的。

![Create relay dialog with a name and a description filled in](https://mintcdn.com/langchain-5e9cc07a/ysonGzQhi7dfTPaz/langsmith/images/relays-create-dialog.png?fit=max\&auto=format\&n=ysonGzQhi7dfTPaz\&q=85\&s=063112b2d0be9f82b0c50caf84a81766)

新继电器显示**等待连接器**，直到连接器连接到它。

要使用 API 创建中继，请发送 `POST /v1/connections` 和 `{"name": "corp-network", "kind": "relay"}`。连接类型在创建后就无法更改。

**3.运行连接器**

以中继模式在网络内部运行连接器。 **设置** > **中继** 中的中继页面显示用于 CLI、Docker 和 Kubernetes (Helm) 的命令，其中填写了中继 ID 和您所在区域的端点。复制一个并替换 `<your-api-key>`。

![Relay details showing Waiting for connector, the relay ID, and the CLI command to run the connector](https://mintcdn.com/langchain-5e9cc07a/ysonGzQhi7dfTPaz/langsmith/images/relays-connector-setup.png?fit=max\&auto=format\&n=ysonGzQhi7dfTPaz\&q=85\&s=6895d15fca191d90d6a1780261ef4023)

如果您的组织不在 GCP 美国区域，则要自行编写配置，请使用您所在区域的 API URL：|地区 |端点 |
| - | - |
|基仕伯美国 | `https://api.smith.langchain.com`（默认）|
| GCP 欧盟 | `https://eu.api.smith.langchain.com` |
|基仕伯亚太区 | `https://apac.api.smith.langchain.com` |
| AWS 美国 | `https://aws.api.smith.langchain.com` |

除了默认值之外，这些示例还允许继电器达到 `10.0.0.0/8` 和 `db.corp.internal:5432`；参见[Connector policy](#connector-policy)。

> [选项卡] Kubernetes（Helm）
>
> 将 API 密钥存储在 Secret 中，然后安装 [⟦T16⟧ chart](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-connector)，版本 0.3.0 或更高版本：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> kubectl create namespace langsmith-connector
> kubectl -n langsmith-connector create secret generic langsmith-connector-key \
>   --from-literal=langsmith_api_key=<api key>
>
> helm repo add langchain https://langchain-ai.github.io/helm/
> helm repo update
> helm install langsmith-relay langchain/langsmith-connector \
>   --namespace langsmith-connector \
>   --set config.connectionId=<relay id> \
>   --set config.existingSecretName=langsmith-connector-key \
>   --set config.relay.enabled=true \
>   --set 'config.relay.allow={10.0.0.0/8,db.corp.internal:5432}'
> ```
>
> 针对 GCP US 以外的区域添加 `--set config.endpoint=<endpoint>`，针对拒绝规则添加 `config.relay.deny`。以列表形式传递规则，如示例所示。继电器不需要`config.targets`。
>
> 运行单个副本。一个连接器已与 LangSmith 保持两个冗余连接。

> [标签] Docker
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> docker run -d --name langsmith-relay --restart unless-stopped \
>   -e LANGSMITH_CONNECTION_ID=<relay id> \
>   -e LANGSMITH_API_KEY=<api key> \
>   -e LANGSMITH_CONNECTOR_RELAY_MODE=true \
>   -e LANGSMITH_CONNECTOR_RELAY_ALLOW="10.0.0.0/8,db.corp.internal:5432" \
>   langchain/langsmith-connector:0.3.0
> ```
>
> 针对 GCP US 以外的区域添加 `-e LANGSMITH_ENDPOINT=<endpoint>`，针对拒绝规则添加 `LANGSMITH_CONNECTOR_RELAY_DENY`。两个规则变量都采用逗号分隔的列表。要从文件中读取密钥，请将 `LANGSMITH_API_KEY_FILE` 设置为其路径。

> [选项卡] LangSmith CLI
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export LANGSMITH_API_KEY=<api key>
> langsmith relay connect <relay id> --allow 10.0.0.0/8 --allow db.corp.internal:5432
> ```
>
> `relay connect` 命令需要LangSmith CLI 0.3.5 或更高版本。它会一直运行，直到您停止为止。对于 GCP US 以外的区域设置 `LANGSMITH_ENDPOINT`，并为拒绝规则传递 `--deny`。连接器使用 API 密钥进行身份验证，因此使用 OAuth 登录的配置文件不起作用。如果您的网络需要出站代理，则连接器支持 `HTTPS_PROXY`。连接时它会记录`connector registered with LangSmith`。设置`LOG_LEVEL=debug`以获取更多详细信息。使用 Helm，将其设置为 `connector.deployment.extraEnv`。

**4.将中继规则添加到沙箱**

创建沙箱时，将带有 `"type": "relay"` 的规则添加到沙箱的 `proxy_config` 中，或更新现有沙箱的 `proxy_config`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "rules": [
    {
      "name": "corp-network",
      "type": "relay",
      "relay_id": "<relay id>",
      "match_hosts": ["10.0.0.0/8", "db.corp.internal"]
    }
  ]
}
```

使用 CLI，将配置保存为 `proxy.json` 并在创建沙箱时传递它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandboxes create my-sandbox --proxy-config @proxy.json
```

请参阅 [Relay rules](#relay-rules) 了解字段以及中继规则如何与其他代理设置相结合。

**5.检查继电器是否工作**

连接器启动后几秒钟内，继电器会在 **设置** > **继电器** 中显示 **已连接**。

![Relay details showing Connected, the relay ID, and the CLI command to run the connector](https://mintcdn.com/langchain-5e9cc07a/ysonGzQhi7dfTPaz/langsmith/images/relays-connected.png?fit=max\&auto=format\&n=ysonGzQhi7dfTPaz\&q=85\&s=3585b216d741cd98d9cf7b3d072249c2)

从沙箱中，连接到中继规则匹配且连接器策略允许的目标：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith sandboxes exec my-sandbox -- curl -sS http://<host>:<port>/
```

响应来自网络中的服务，连接器会记录 `connector opened relay flow` 和目标。如果连接器的策略拒绝目标，连接器会记录 `relay policy denied destination` 并且沙箱的连接失败；为其添加允许规则。

当没有连接器连接到中继时，与匹配目标的连接失败。它永远不会退回到直接连接。

## 接力规则中继规则是沙箱 `proxy_config`（请参阅 [Configure auth proxy rules](/langsmith/sandbox-auth-proxy#configure-auth-proxy-rules)）中的规则，具有以下字段：

|领域|描述 |
| - | - |
| `name` |必需的。规则的标识符 |
| `type` | `relay` |
| `relay_id` |必需的。承载匹配连接的中继ID |
| `match_hosts` |必需的。主机名和 `*.` 通配符，对于标头规则，加上 IP 地址和 CIDR 块（`10.0.0.0/8`、`2001:db8::/32`），它们匹配沙箱与 IP 地址建立的连接 |
| `enabled` |默认为 `true` |
| `description` |可选，最多 1024 个字符。这个规则让沙箱达到什么目的 |

中继规则仅匹配主机，因此它不接受 `match_paths`、`headers`、`env_vars`、`aws`、`gcp` 或 `azure`。

* 第一个启用的与目的地匹配的中继规则携带该目的地。同一主机的标头规则仍然适用。
* [Access control](/langsmith/sandbox-auth-proxy#egress-and-network-access-control) 首先适用，因此访问控制阻止的目的地不会被中继。
* 中继规则可以匹配沙箱否则会拒绝连接的私有地址。连接器的策略决定它是否到达它们。
* 沙箱只能使用其自己组织中的中继。

## 连接器政策

连接器决定中继可以到达哪些目的地，无论沙箱的规则匹配什么：* 默认情况下，它通过端口 80 和 443 到达公共地址。
* 允许规则添加目的地，拒绝规则删除目的地。拒绝规则胜过允许规则。
* 它从不连接到云元数据地址。

每条规则都是一个 CIDR 块 (`10.0.0.0/8`)、一个 IP 地址、一个主机名 (`db.corp.internal`) 或一个通配符 (`*.corp.internal`)，后面可以选择跟 `:PORT`。 IPv6 地址或范围仅采用括号中的端口 (`[2001:db8::1]:443`)。

连接器使用网络的 DNS 解析主机名。当允许规则命名主机名时，连接器将连接到主机名解析到的地址，除非拒绝规则与这些地址匹配。

要更改策略，请更新连接器的配置并重新启动它，例如使用 `helm upgrade`。

## 安全

### 仅出站连接

连接器通过 TLS 与您所在区域的 LangSmith API 端点在端口 443 上建立出站 WebSocket 连接。您不打开入站端口或更改 LangSmith 的防火墙规则，并且连接器不公开任何端口。

### 身份验证和授权* **连接器**：连接器使用有权连接隧道和中继的组织 API 密钥进行身份验证。 LangSmith 仅在继电器启用时接受连接器。
* **每个连接**：在LangSmith将沙箱的连接携带到连接器之前，它会检查中继是否属于沙箱的组织并已启用。

### 你的网络暴露了什么

* 沙箱仅到达其中继规则匹配且连接器策略允许的目的地。连接器的策略是在您的网络内部配置的，LangSmith 无法更改它。
* 连接器不连接到云元数据地址。
* 中继连接从连接器的地址到达您的网络，因此您的服务将连接器视为客户端。

### 日志记录

连接器不记录中继连接的内容。在默认的`info`级别，它记录每个中继连接的目的地以及其策略拒绝的每个目的地。

### 撤销访问权限

要阻止沙箱使用您的网络，请在 **设置** > **中继** 中禁用或删除中继。您还可以停止连接器或撤销其 API 密钥。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/relays.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。