<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Route self-hosted Sandbox egress through a forward proxy | https://docs.langchain.com/langsmith/self-host-sandbox-egress-proxy -->

# 通过转发代理路由自托管沙箱出口

通过企业 HTTP 或 HTTPS 转发代理从自托管 LangSmith 沙箱发送出站连接，并具有绕过列表、基本代理身份验证和自定义 CA 信任。

自托管 `sandbox-host` 可以通过您的公司转发代理从沙箱发送每个出站连接，而不是直接拨打目的地。当您的网络仅允许通过代理的出站流量，或者当您的安全团队需要所有沙盒流量来传递代理的访问策略和日志记录时，请使用此选项。

有关沙箱流量如何离开 microVM，请参阅[Sandbox architecture](/langsmith/self-host-sandbox-architecture)。安装请参见[Enable Sandboxes](/langsmith/enable-self-hosted-sandboxes)。

## 了解代理出口的工作原理

来自沙箱的每个出站 TCP 连接首先到达其主机上的 [Sandbox auth proxy](/langsmith/sandbox-auth-proxy)。主机应用沙箱的允许和拒绝列表以及身份验证代理规则，然后将流量发送到转发代理，就像配置了 `HTTP_PROXY` 和 `HTTPS_PROXY` 的客户端所做的那样：* **普通 HTTP**：作为标准代理请求发送，例如 `GET http://example.com/path`。发送到允许列表中的 IP 地址的 HTTP 是例外：它通过 `CONNECT` 隧道到达端口 80，因此主机检查沙箱连接到的地址而不是其 `Host` 标头。
* **HTTPS 和其他 TCP**：通过 `CONNECT` 隧道发送到目标主机和端口，例如 `CONNECT example.com:443` 或 `CONNECT github.com:22`。

主办方也适用以下规则：

* **无直接回退**：当转发代理拒绝请求或无法打开隧道时，请求或连接失败。主机从不直接重试。
* **绕过列表**：主机直接拨打`noProxy`中的目的地，并进行相同的沙盒访问检查。
* **LangSmith API**：主机直接从沙盒向您的 LangSmith 安装的 API 拨打 HTTPS 请求，而不是通过转发代理。

代理发生在沙箱外部的主机上。沙箱内的代码看不到转发代理地址，并且不需要设置`HTTP_PROXY`或`HTTPS_PROXY`。

## 检查要求

代理出口需要：* 对于 `sandbox-host` 映像，0.17 版本系列中的 LangSmith 0.17.32 或更高版本，或 0.18 版本中的 0.18.5rc1 或更高版本。
* LangSmith Helm 图表 0.17.10 或更高版本在 0.17 发布线上，或者 0.18.0-rc.21 或更高版本在 0.18 线上，对于 `sandboxes.authProxy.httpProxy.url`。早期的图表使用 `enabled`、`scheme`、`host` 和 `port` 来配置代理，并且无法传递凭据。
* 接受标准 HTTP 代理请求和端口 443 的 `CONNECT` 的转发代理。要访问其他 TCP 服务，例如端口 22 上通过 SSH 的 Git，或列入允许列表的 IP 地址上的 HTTP，代理还必须接受这些端口的 `CONNECT`。
* 从 Sandbox 节点池到代理的网络可达性。代理地址可以是私有 IP 地址，或者在 LangSmith 0.17.36 或更高版本上，可以是集群内 Kubernetes 服务名称，例如 `squid.proxy.svc.cluster.local`。

转发代理可能需要基本身份验证，在 0.17 版本上需要 LangSmith 0.17.37 或更高版本，或者在 0.18 版本上需要 0.18.11rc1 或更高版本。 `sandbox-host` 不支持 NTLM、协商 (Kerberos) 或摘要式代理身份验证或客户端证书 (mTLS)。当主机只需要信任其服务器证书时，HTTPS 代理即可工作。

## 配置代理

要通过转发代理路由沙箱出口：**1.将代理设置添加到您的值**

在 LangSmith Helm 值中设置 `sandboxes.authProxy.httpProxy`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sandboxes:
  authProxy:
    httpProxy:
      url: http://proxy.corp.internal:3128
      noProxy:
        - .corp.internal
```

* **`url`**：当与代理本身的连接使用 TLS 时，代理 URL、`http://host:port` 或 `https://host:port`。主机可以是主机名、IP 地址或集群内服务名称。留空即可直接发送出口。该图表将 URL 存储在 LangSmith 应用程序 Secret 中，因为它可以携带凭据（请参阅下一步）。当您设置 `config.existingSecretName` 时，将 `url` 留空，并将 URL 添加到密钥 `sandbox_egress_proxy_url` 下的该 Secret。
* **`noProxy`**：主机直接拨号而不是通过代理拨打的目的地，与`NO_PROXY`环境变量匹配相同。诸如 `corp.internal` 之类的条目与该主机及其子域匹配，带有前导点（如 `.corp.internal` ）的条目仅匹配子域，而 `*` 则匹配每个主机。条目还可以是 IP 地址、CIDR 范围（例如 `10.0.0.0/8` 或 `host:port` 对）。当 `url` 不是没有路径的 `http://` 或 `https://` URL 时，或者当您将 `url` 与 `config.existingSecretName` 或 `config.disableSecretCreation` 一起设置时，图表将无法渲染。在 LangSmith 0.17.36 或更高版本上，`sandbox-host` 还会在启动时检查代理地址：环回或云元数据地址会使用 `sandbox host config invalid` 停止 pod，而不是使每个沙箱创建失败。

**2. （可选）向代理进行身份验证**

当代理需要用户名和密码时，将它们添加到 URL 中：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
http://svc-sandboxes:p%40ssw0rd@proxy.corp.internal:3128
```

对用户名和密码中的保留字符进行百分比编码，例如`@`为`%40`、`:`为`%3A`、`/`为`%2F`。将 URL 设置为值中的 `url`，或设置为 `config.existingSecretName` 中的 `sandbox_egress_proxy_url` 键。

`sandbox-host` 在每个 `CONNECT` 和普通 HTTP 代理请求上将凭证作为基本 `Proxy-Authorization` 标头发送到代理。沙箱永远不会看到它们：主机打开隧道，并丢弃沙箱中的代码发送的任何 `Proxy-Authorization` 标头。基本凭据未加密，因此当沙箱节点和代理之间的网络不可信时，请使用`https`代理 URL。当代理拒绝凭据时，来自沙箱的连接将失败，并且`sandbox-host`日志显示`upstream proxy CONNECT rejected: 407`。轮换密码后，更新 Secret 并重新启动 `sandbox-host` 部署；它仅在启动时读取 URL。

**3. （可选）信任 HTTPS 代理的私有 CA**

当代理 URL 使用 `https` 并且私有 CA 颁发代理的证书时，请将该 CA 添加到 `config.customCa` 中的捆绑包中。除了系统根之外，`sandbox-host` Pod 还与其他 LangSmith 服务信任相同的捆绑包。参见[Mount internal CAs for TLS](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)。

**4.应用更改**

升级 Helm 版本。更改这些设置会滚动 `sandbox-host` 部署，因此每个主机在重新启动之前都会耗尽其正在运行的沙箱。参见[Understand a rolling upgrade](/langsmith/self-host-sandbox-operations#understand-a-rolling-upgrade)。

**5.验证出口**

创建一个沙箱并从其中请求公共 URL：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -o /dev/null -w '%{http_code}\n' https://www.langchain.com/
```

该命令打印 `200`，并且您的转发代理会记录来自沙盒节点的 `CONNECT www.langchain.com:443` 请求。对 `http://` URL 的请求将在代理日志中显示为 `GET http://...` 请求。

## 直接到达私有服务默认情况下，`sandbox-host`拒绝连接到私有地址，因此即使`noProxy`直接发送连接，沙箱也无法到达内部服务。在自托管安装中，当沙箱的 `allow_list` 允许目标通过时，沙箱就会到达私有地址：主机名、glob（例如 `*.corp.internal`）或正则表达式。文字 IP 地址需要 IP 或 CIDR 条目。具有 `deny_list` 或没有 `access_control` 的沙箱永远不会到达私有地址。参见[Allow and deny lists](/langsmith/sandbox-auth-proxy#allow-and-deny-lists)。

例如，一个需要 Git 和内网数据库的沙盒，加上通过正向代理的公共 HTTP 和 HTTPS，就使用这个 `proxy_config`：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "access_control": {
    "allow_list": ["*:80", "*:443", "git.corp.internal", "db.corp.internal:5432"]
  }
}
```

主机在解析主机名后检查其连接的地址。即使列出了环回和云元数据地址，仍会被阻止。这不需要 Helm 设置。

沙箱还可以通过其 Kubernetes 名称访问集群中的服务，例如当其 `allow_list` 命名时，为 `api.team.svc.cluster.local`。您的转发代理无法解析集群名称，因此在使用集群名称时将 `.svc.cluster.local` 添加到 `noProxy`。> [!警告]
>
> 每个匹配的条目都很重要，包括 `*` 和 `*:443`。在自托管安装中，`allow_list`（例如`["*:80", "*:443"]`）也会在这些端口上打开私有目标。任何可以创建或更新沙箱的人都可以将私有地址列入白名单，包括集群内的地址，因此相应地限制谁可以创建沙箱。

## 保护代理

解析目标主机名的是转发代理，而不是主机。主机根据沙盒访问列表检查主机名，并且默认情况下会阻止字面上的私有、环回和云元数据 IP 地址，但它看不到代理将主机名解析到的地址。如果代理允许，请求解析为内部地址的主机名的沙箱将到达该地址。

配置代理的访问策略以阻止沙箱不得到达的目的地，例如内部网络和云元数据端点。

## 了解限制* **私有服务需要连接**：转发代理仅到达代理本身可以到达的目的地。它不提供 VPN 或网络对等私有服务。
* **TLS 检查代理**：当代理在隧道内解密并重新加密 HTTPS 时，客户端会看到来自检查 CA 的证书。对于身份验证代理规则匹配的主机，`sandbox-host` 是该客户端，因此将 CA 添加到 `config.customCa`。对于其他主机，沙盒中的程序是客户端，因此将 CA 添加到沙盒映像的信任存储中。或者，免除沙盒流量的检查。

## 另请参阅

* [Sandbox auth proxy](/langsmith/sandbox-auth-proxy)
* [Sandbox architecture](/langsmith/self-host-sandbox-architecture)
* [Upgrades and operations](/langsmith/self-host-sandbox-operations)
* [Configure custom TLS certificates](/langsmith/self-host-custom-tls-certificates)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-sandbox-egress-proxy.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).