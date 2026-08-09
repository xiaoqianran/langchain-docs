<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up the LLM auth proxy | https://docs.langchain.com/langsmith/llm-auth-proxy-self-hosted -->

# 设置 LLM 身份验证代理

部署基于 Envoy 的身份验证代理，用于验证 LangSmith 签名的 JWT 并将 LLM 请求路由到上游提供商或网关。

LLM 身份验证代理可让您的组织对 LangSmith 的所有模型调用强制实施自己的身份验证流程，以便提供商凭证永远不会暴露给最终用户，并且每个请求都可以追溯到特定参与者。

LLM 身份验证代理是一个基于 [Envoy](https://www.envoyproxy.io/) 的组件，在您的环境中运行，位于 LangSmith 和上游 LLM 提供商或网关（例如 OpenAI、Anthropic 或内部 LLM 网关，如 LiteLLM）之间。 LangSmith 使用短期 JWT（JSON Web 令牌）对每个请求进行签名。代理验证 JWT，可选择注入提供者凭据或转换请求和响应正文，然后将请求转发到上游。 [SaaS](/langsmith/cloud) 和 [self-hosted](/langsmith/self-hosted) LangSmith 客户均可使用。

<Info>
  LLM 身份验证代理需要 LangSmith Enterprise 计划。详情请参阅[Pricing](https://www.langchain.com/pricing)或[contact our sales team](https://www.langchain.com/contact-sales)。
</Info>

当您需要执行以下操作时，请使用 LLM 身份验证代理：* 针对您自己的提供商网关验证 [Playground](/langsmith/custom-endpoint#use-the-model-in-the-playground) 或 [LLM-as-judge evaluation](/langsmith/evaluation) 请求。
* 注入特定于提供商的 API 密钥或身份验证标头，而不会将其暴露给最终用户。
* 转换请求或响应正文（例如，在 OpenAI 格式和自定义网关格式之间进行转换）。

特别是对于 OAuth2 `client_credentials`，[OAuth client credentials on a model configuration](/langsmith/model-configurations#oauth-client-credentials) 是一种按配置的自助服务替代方案，工作区管理员可以在不建立身份验证代理的情况下进行设置。路由在配置级别是互斥的 - 启用 OAuth 的配置不会通过身份验证代理。

## 它是如何工作的

来自 LangSmith 的每个请求都会在代理中经过以下步骤：

1. 验证 JWT（签名、发行者、受众）
2. 调用您的 [⟦T18⟧](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/security/ext_authz_filter) 服务，该服务接收经过验证的 JWT 并返回提供者凭据以作为标头注入
3. 可以选择调用[⟦T19⟧](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter)转换器，它可以重写请求和响应正文（例如，在OpenAI格式和自定义网关格式之间进行转换）
4. 将带有自定义标头（静态或动态）的请求转发给上游提供商`ext_authz` 服务和转换器都是客户部署的组件，在您的环境中与代理一起运行。可以启用其中一个或两个 [depending on your use case](#when-to-use-ext_proc-vs-ext_authz)。

<img alt="Architecture diagram showing LangSmith issuing a signed JWT to the self-hosted auth proxy, which validates the JWT, applies customer-defined auth, and forwards the request to the upstream model provider." />

<img alt="Architecture diagram showing LangSmith issuing a signed JWT to the self-hosted auth proxy, which validates the JWT, applies customer-defined auth, and forwards the request to the upstream model provider." />

## 先决条件

* LangSmith Enterprise 计划（SaaS 或版本 0.13.33+ 上的自托管）
* 带有 Helm 3 的 Kubernetes 集群
* Envoy v1.37 或更高版本（Helm 图表默认为`envoyproxy/envoy:v1.37-latest`）
* 您的上游 LLM 提供商或网关的 URL（代理将请求转发到的目的地）

<Note>
  身份验证代理当前支持 [Playground](/langsmith/prompt-engineering-concepts)、[Evals](/langsmith/evaluation)、[Fleet](/langsmith/fleet)、[Chat](/langsmith/chat) 和 [Insights](/langsmith/insights) 功能。
  Playground 和 Evals 在 v0.13.33+ 中可用。聊天和见解在 v0.13.39+ 中可用。
</Note>

## 1. 配置 JWT 签名（仅限自托管 LangSmith）

对于 LangSmith SaaS，请跳过此步骤。 JWT 签名已配置。

**使用 [step CLI](https://smallstep.com/docs/step-cli/installation/)（如果您愿意，也可以使用内部流程）生成 Ed25519 密钥对**。 Ed25519 是 LangSmith 用于签署 JWT 的签名算法。私钥对每个请求进行签名；身份验证代理仅使用公钥验证签名。

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
TMPDIR_KEYS="$(mktemp -d)"
step crypto keypair "$TMPDIR_KEYS/pub.pem" "$TMPDIR_KEYS/priv.pem" \
  --kty OKP --crv Ed25519 --no-password --insecure
PRIV_JWK=$(step crypto key format --jwk --no-password --insecure < "$TMPDIR_KEYS/priv.pem")
SIGNING_JWKS=$(echo "$PRIV_JWK" | jq -c '{keys: [. + {use: "sig", alg: "EdDSA"}]}')
echo "$SIGNING_JWKS"
```

**将 JWKS 存储在 Kubernetes 密钥中：**

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl create secret generic langsmith-signing-jwks \
  --namespace <namespace> \
  --from-literal=LANGSMITH_SIGNING_JWKS="$SIGNING_JWKS"
```JWKS（JSON Web 密钥集）是用于发布加密密钥的标准 JSON 格式。 `LANGSMITH_SIGNING_JWKS` 包含 Ed25519 私钥并存储为 Kubernetes 机密。它永远不会暴露。 LangSmith 自动提取相应的公钥并将其提供给`/.well-known/jwks.json`。身份验证代理获取此公共端点来验证 JWT 签名，而无需私钥。

**参考你的[LangSmith ⟦T24⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)中的秘密：**

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
platformBackend:
  deployment:
    extraEnv:
      - name: LLM_AUTH_PROXY_ISSUER
        value: "langsmith"        # must match jwtIssuer in the auth proxy chart
      - secretRef:
          name: langsmith-signing-jwks
```

`LLM_AUTH_PROXY_ISSUER` 在签名的 JWT 中设置 `iss` 声明。使用 `langsmith` 匹配 SaaS 默认值，或使用 `langsmith:self-hosted:<short_identifier>` 等自定义标识符来区分您的安装。该值必须与 [Step 4](#4-install-the-auth-proxy-helm-chart) 中的身份验证代理图表中的 `jwtIssuer` 匹配。

## 2. 为您的组织启用 LLM Auth 代理

<Tabs>
  <Tab title="Self-hosted">
    **选项 A：** 为特定组织启用：

    在 LangSmith UI 中，导航到 **设置** 页面，复制左上角 **组织** 旁边的组织 ID。

    针对您的 LangSmith PostgreSQL 数据库运行以下命令：

    ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    UPDATE organizations
    SET config = config || '{"can_use_llm_auth_proxy": true}'
    WHERE id = '<organization_id>';
    ```

    **选项 B：** 为安装中的所有组织启用：

    将以下内容添加到 [LangSmith ⟦T31⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml) 中的 `commonEnv`：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    commonEnv:
      DEFAULT_ORG_FEATURE_CAN_USE_LLM_AUTH_PROXY: "true"
    ```

    <Note>
      此设置对个人组织没有影响。
    </Note>
  </Tab><Tab title="SaaS">
    通过 [Support Portal](https://support.langchain.com) 联系技术支持，为您的组织启用 LLM Auth 代理。
  </Tab>
</Tabs>

## 3. 在 LangSmith 中配置组织设置

在 LangSmith UI 中，导航至 **设置** > **常规**，配置以下内容：

1. **JWT 受众：** 代理将验证的 `aud` 声明值（例如，`example-audience`）。这必须与 [Step 4](#4-install-the-auth-proxy-helm-chart) 中的身份验证代理图表中的 `jwtAudiences` 匹配。
2. **启用 LLM 身份验证代理：** 为您的组织打开。
3. **允许的 URL：** 控制允许代理将 JWT 转发到哪些目标 URL。这可以防止将凭证转发到非预期主机。选择以下三个选项之一：

   * **全部允许**（默认）：允许 JWT 转发到任何上游 URL。相当于没有限制。
   * **全部阻止：** 阻止 JWT 转发到所有 URL。
   * **自定义：** 指定允许的 URL 模式的明确列表。不接受空字符串和裸线 `*`。当 LLM 身份验证代理开关关闭时，该控件将被禁用。

   <img alt="LLM Auth Proxy settings in LangSmith showing the Enable LLM auth proxy checkbox, JWT audience field, and Allowed URLs radio buttons with Allow all selected." />

   <img alt="LLM Auth Proxy settings in LangSmith showing the Enable LLM auth proxy checkbox, JWT audience field, and Allowed URLs radio buttons with Allow all selected." />

## 4.安装身份验证代理Helm图表

添加LangChain Helm仓库：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo add langchain https://langchain-ai.github.io/helm/
helm repo update
```使用上游 URL 和 JWT 验证设置创建 `values.yaml`。 JWKS 配置有两个选项：

* **`jwksUri`（推荐）：** 指向 LangSmith 实例的 `/.well-known/jwks.json` 端点。 Envoy 自动获取并缓存公钥，支持无缝密钥轮换。
* **`jwksJson`（内联）：** 将 JWKS JSON 直接粘贴到 `values.yaml` 中。将此用于测试或隔离环境，其中身份验证代理无法访问 LangSmith 的出站网络。需要更新图表才能轮换密钥。仅包含公钥组件；省略 `d` 字段（私钥）。

如果两者都设置了，则`jwksUri`优先。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
authProxy:
  upstream: "https://gateway.example.com"
  jwtIssuer: "langsmith" # must match LLM_AUTH_PROXY_ISSUER in LangSmith values.yaml
  jwtAudiences:
    - "example-audience" # must match the org setting in LangSmith

  # Option A: remote JWKS (recommended for production)
  # Envoy fetches and caches public keys from LangSmith's /.well-known/jwks.json.
  jwksUri: "https://langsmith.example.com/.well-known/jwks.json"       # self-hosted
  # jwksUri: "https://api.smith.langchain.com/.well-known/jwks.json"   # SaaS
  jwksCacheDurationSeconds: 300

  # Option B: inline JWKS (testing or air-gapped environments only)
  # Omit the "d" field (private key); include public key components only.
  # jwksJson: '{"keys": [{"kty": "OKP", "crv": "Ed25519", "x": "<base64url-public-key>", "use": "sig", "alg": "EdDSA"}]}'
```

安装图表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm install langsmith-auth-proxy langchain/langsmith-auth-proxy \
  --namespace <your-namespace> \
  -f values.yaml
```

## 编写一个`ext_authz`服务

当您需要添加、删除或编辑授权标头时，请使用`ext_authz`，例如，根据 JWT 中的身份注入提供程序 API 密钥。您的服务接收经过验证的 JWT 和可选的请求正文，并返回标头以注入上游。这使用 Envoy 的 [HTTP ⟦T45⟧ filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_authz_filter) （不是 gRPC）。

在`values.yaml`中启用它：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
authProxy:
  extAuthz:
    enabled: true
    serviceUrl: "http://my-auth-service:8080"
    timeout: "10s"
```

### 它是如何工作的在转发每个请求之前，Envoy 使用与原始请求相同的 HTTP 方法在 `<serviceUrl>/check<original_path>` 调用您的服务。您的服务在 `x-langsmith-llm-auth` 标头中接收经过验证的 JWT。

您的服务返回一个简单的 HTTP 响应：

* **`2xx`:** 允许请求。任何匹配 `allowedUpstreamHeaders` 模式（默认：`authorization` 和 `x-*`）的标头都会注入到上游请求中。要在转发之前剥离 JWT，请在响应中包含 `x-envoy-auth-headers-to-remove: x-langsmith-llm-auth`。
* **非`2xx`：**拒绝请求。状态代码和任何与 `allowedClientHeaders` 模式匹配的标头（默认：`www-authenticate` 和 `x-*`）都会返回给客户端。

### 部署选项

您的 `ext_authz` 服务可以通过两种方式运行：

* **Sidecar：** 在与代理相同的 pod 中运行服务。在 `authProxy.deployment.sidecars` 下添加容器，并在 `values.yaml` 中的 `authProxy.deployment.volumes` 下添加任何所需卷。使用 `localhost` URL，例如 `http://localhost:10002`。
* **单独部署：**独立部署服务并指向`extAuthz.serviceUrl`。使用集群内 DNS 名称，例如 `http://my-auth-service.my-namespace.svc.cluster.local:8080`，或者如果服务有自己的入口，则使用外部 HTTPS URL。

### 示例部署下面的示例是一个最小的 Python `ext_authz` 服务，用于执行 OAuth2 客户端凭据令牌交换。对于每个请求，它都会返回一个带有新访问令牌的缓存的 `Authorization` 标头，并在过期之前从配置的令牌端点刷新它。有关完整示例，请参阅图表存储库中的[e2e/oauth/](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy/e2e/oauth)。

<Accordion title="ext-authz-oauth.py">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  """ext_authz service that performs an OAuth2 client-credentials token exchange.

  Runs as a sidecar (or standalone service) alongside the main auth-proxy component.
  On each ext_authz check request it returns a cached OAuth access token,
  refreshing it from the configured token endpoint when expired.

  Environment variables:
    OAUTH_TOKEN_URL    – Token endpoint (e.g. https://login.example.com/oauth/token)
    OAUTH_CLIENT_ID    – Client ID for the credentials grant
    OAUTH_CLIENT_SECRET– Client secret for the credentials grant
    OAUTH_SCOPE        – (optional) Space-separated scopes to request
    LISTEN_PORT        – (optional) Port to listen on, default 10002
  """

  from http.server import HTTPServer, BaseHTTPRequestHandler
  import json
  import os
  import sys
  import threading
  import time
  import urllib.request
  import urllib.parse

  # ---------------------------------------------------------------------------
  # Configuration
  # ---------------------------------------------------------------------------
  TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]
  CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
  CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
  SCOPE = os.environ.get("OAUTH_SCOPE", "")
  LISTEN_PORT = int(os.environ.get("LISTEN_PORT", "10002"))

  # Refresh the token this many seconds before it actually expires.
  EXPIRY_BUFFER_SECONDS = 30

  # ---------------------------------------------------------------------------
  # Token cache (thread-safe)
  # ---------------------------------------------------------------------------
  _lock = threading.Lock()
  _cached_token: str | None = None
  _token_expiry: float = 0  # epoch seconds


  def _fetch_token() -> tuple[str, float]:
      """Perform a client_credentials grant and return (access_token, expiry_epoch)."""
      data = urllib.parse.urlencode({
          "grant_type": "client_credentials",
          "client_id": CLIENT_ID,
          "client_secret": CLIENT_SECRET,
          **({"scope": SCOPE} if SCOPE else {}),
      }).encode()

      req = urllib.request.Request(
          TOKEN_URL,
          data=data,
          headers={"Content-Type": "application/x-www-form-urlencoded"},
          method="POST",
      )
      with urllib.request.urlopen(req, timeout=10) as resp:
          body = json.loads(resp.read())

      access_token = body["access_token"]
      expires_in = int(body.get("expires_in", 3600))
      expiry = time.time() + expires_in - EXPIRY_BUFFER_SECONDS
      return access_token, expiry


  def get_token() -> str:
      """Return a valid access token, refreshing if necessary."""
      global _cached_token, _token_expiry
      with _lock:
          if _cached_token and time.time() < _token_expiry:
              return _cached_token
      # Fetch outside the lock so other requests aren't blocked on I/O.
      token, expiry = _fetch_token()
      with _lock:
          _cached_token = token
          _token_expiry = expiry
      print(f"Refreshed OAuth token (expires in {int(expiry - time.time())}s)", flush=True)
      return token


  # ---------------------------------------------------------------------------
  # ext_authz HTTP handler
  # ---------------------------------------------------------------------------
  class Handler(BaseHTTPRequestHandler):
      def do_any(self):
          try:
              token = get_token()
          except Exception as exc:
              print(f"OAuth token fetch failed: {exc}", flush=True)
              self.send_response(500)
              self.send_header("Content-Type", "text/plain")
              self.end_headers()
              self.wfile.write(b"OAuth token exchange failed")
              return

          self.send_response(200)
          # Replace the header name as needed - this header will be forwarded to the upstream LLM provider / gateway.
          self.send_header("Authorization", f"Bearer {token}")
          self.end_headers()

      # Handle every method Envoy might send for ext_authz checks.
      do_GET = do_POST = do_PUT = do_DELETE = do_PATCH = do_HEAD = do_OPTIONS = do_any

      def log_message(self, format, *args):
          # Quieter logs — only print errors.
          pass


  if __name__ == "__main__":
      server = HTTPServer(("0.0.0.0", LISTEN_PORT), Handler)
      print(f"ext-authz-oauth listening on :{LISTEN_PORT}", flush=True)
      print(f"  token_url={TOKEN_URL} client_id=<redacted>", flush=True)
      server.serve_forever()
  ```
</Accordion>

有关`extAuthz`参数的完整列表，请参阅[Helm chart README](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy#readme)。

## 编写一个`ext_proc`变压器

当您需要重写请求或响应正文时，请使用`ext_proc`，例如，在 OpenAI 格式和自定义网关格式之间进行转换，或者将其他字段注入请求负载中。这使用 Envoy 的 [⟦T71⟧ filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter)。

与 `ext_authz` (HTTP) 不同，`ext_proc` 使用双向 gRPC 流。 Envoy 在每个处理阶段（请求标头、请求正文、响应标头、响应正文）向您的变压器服务发送一条消息，并且您的服务会针对每个阶段回复突变。您的变压器必须实现 `envoy.service.ext_proc.v3.ExternalProcessor` gRPC 服务。请参阅图表存储库中的 [e2e/transformer/](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy/e2e/transformer) 以获取示例 Go 实现。

### 何时使用`ext_proc` vs `ext_authz`|能力| `ext_authz` | `ext_proc` |
| ----------------------- | ----------- | ---------- |
|修改请求头 |是的 |是的 |
|修改响应头 |没有 |是的 |
|修改请求正文 |没有 |是的 |
|修改响应正文 |没有 |是的 |
|协议| HTTP | gRPC |

如果您只需要注入身份验证标头（例如 API 密钥），请使用 `ext_authz`。如果需要重写主体，请使用`ext_proc`。两者可以同时启用。

在`values.yaml`中启用`ext_proc`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
authProxy:
  transformer:
    enabled: true
    serviceUrl: "grpc://my-transformer:50051"
    timeout: "10s"
    failureModeAllow: false
    processingMode:
      requestHeaderMode: "SEND"
      requestBodyMode: "BUFFERED"
      responseHeaderMode: "SKIP"
      responseBodyMode: "NONE"
```

设置 `failureModeAllow: true` 以在变压器不可用时允许请求通过。默认（`false`）拒绝请求。

### 处理模式

通过 `processingMode` 控制将哪些相发送到变压器。仅启用您需要的阶段，因为禁用未使用的阶段会减少延迟。|领域 |选项|描述 |
| -------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `requestHeaderMode` | `SEND`、`SKIP`、`DEFAULT` |是否转发请求头。   |
| `responseHeaderMode` | `SEND`、`SKIP`、`DEFAULT` |是否转发响应头。  |
| `requestBodyMode` | `NONE`、`BUFFERED`、`STREAMED`、`BUFFERED_PARTIAL` |如何发送请求正文。         |
| `responseBodyMode` | `NONE`、`BUFFERED`、`STREAMED`、`BUFFERED_PARTIAL` |如何发送响应正文。        |
| `requestTrailerMode` | `SEND`、`SKIP` |是否转发请求预告片。  |
| `responseTrailerMode` | `SEND`、`SKIP` |是否转发响应预告片。 |

* 使用`BUFFERED`进行请求正文重写：在发送之前缓冲完整的正文，最简单的 JSON 重写。
* 使用 `STREAMED` 进行流式 LLM 响应正文重写：在块到达时发送块，延迟较低，但实现起来更复杂。
* 使用`NONE`完全跳过一个阶段。<Warning>
  更改主体时，您的 `ext_proc` 服务还必须更新 `content-length` 标头，以通过 `HeaderMutation` 匹配新的主体大小。 Envoy 拒绝 `content-length` 与突变体不匹配的响应。
</Warning>

### 请求流程

启用 `ext_proc` 进行标头注入和正文重写的示例：

```
curl -H "X-LangSmith-LLM-Auth: <JWT>" -d '{"model":"gpt-4",...}'
  -> Envoy(:10000)
  -> built-in Envoy JWT filter (validate sig, iss, aud)
  -> `ext_proc` filter -> transformer:50051 (gRPC)
    <- phase 1: request_headers -> mutate headers (inject Authorization)
    <- phase 2: request_body   -> mutate body (rewrite JSON) + update content-length
  -> upstream LLM provider or gateway
```

### 示例部署

下面的示例将一个最小的 Go 转换器部署为 Kubernetes 部署。它从请求标头中读取 JWT，注入 `Authorization` 标头，并将请求正文从 OpenAI 格式重写为自定义格式。

<Accordion title="transformer-configmap.yaml">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: transformer-source
  data:
    main.go: |
      package main

      import (
          "encoding/json"
          "fmt"
          "io"
          "log"
          "net"
          "strings"

          core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
          ext_proc "github.com/envoyproxy/go-control-plane/envoy/service/ext_proc/v3"
          "google.golang.org/grpc"
      )

      type server struct {
          ext_proc.UnimplementedExternalProcessorServer
      }

      func (s *server) Process(stream ext_proc.ExternalProcessor_ProcessServer) error {
          for {
              req, err := stream.Recv()
              if err == io.EOF {
                  return nil
              }
              if err != nil {
                  return err
              }

              var resp *ext_proc.ProcessingResponse
              switch v := req.Request.(type) {
              case *ext_proc.ProcessingRequest_RequestHeaders:
                  resp = handleRequestHeaders(v.RequestHeaders)
              case *ext_proc.ProcessingRequest_RequestBody:
                  resp = handleRequestBody(v.RequestBody)
              default:
                  resp = &ext_proc.ProcessingResponse{}
              }

              if err := stream.Send(resp); err != nil {
                  return err
              }
          }
      }

      func handleRequestHeaders(headers *ext_proc.HttpHeaders) *ext_proc.ProcessingResponse {
          var jwtValue string
          for _, h := range headers.Headers.Headers {
              if strings.EqualFold(h.Key, "x-langsmith-llm-auth") {
                  if len(h.RawValue) > 0 {
                      jwtValue = string(h.RawValue)
                  } else {
                      jwtValue = h.Value
                  }
                  break
              }
          }

          resp := &ext_proc.ProcessingResponse{
              Response: &ext_proc.ProcessingResponse_RequestHeaders{
                  RequestHeaders: &ext_proc.HeadersResponse{},
              },
          }

          if jwtValue != "" {
              // TODO: Replace with your auth logic, e.g. exchange JWT for a
              // provider-specific token, call a secrets manager, etc.
              providerKey := "Bearer your-provider-key"

              headerResp := resp.GetRequestHeaders()
              headerResp.Response = &ext_proc.CommonResponse{
                  HeaderMutation: &ext_proc.HeaderMutation{
                      SetHeaders: []*core.HeaderValueOption{
                          {
                              Header: &core.HeaderValue{
                                  Key:      "Authorization",
                                  RawValue: []byte(providerKey),
                              },
                          },
                      },
                  },
              }
          }
          return resp
      }

      func handleRequestBody(body *ext_proc.HttpBody) *ext_proc.ProcessingResponse {
          resp := &ext_proc.ProcessingResponse{
              Response: &ext_proc.ProcessingResponse_RequestBody{
                  RequestBody: &ext_proc.BodyResponse{},
              },
          }

          var original map[string]interface{}
          if err := json.Unmarshal(body.Body, &original); err != nil {
              log.Printf("Body parse failed, passing through: %v", err)
              return resp
          }

          // TODO: Replace with your transformation logic.
          // This example wraps the OpenAI-format body in a custom envelope.
          transformed := map[string]interface{}{
              "custom_model":    original["model"],
              "custom_messages": original["messages"],
              "metadata":        map[string]string{"source": "langsmith"},
          }

          newBody, err := json.Marshal(transformed)
          if err != nil {
              log.Printf("Body marshal failed, passing through: %v", err)
              return resp
          }

          // IMPORTANT: update content-length to match the new body size.
          bodyResp := resp.GetRequestBody()
          bodyResp.Response = &ext_proc.CommonResponse{
              Status: ext_proc.CommonResponse_CONTINUE_AND_REPLACE,
              HeaderMutation: &ext_proc.HeaderMutation{
                  SetHeaders: []*core.HeaderValueOption{
                      {
                          Header: &core.HeaderValue{
                              Key:      "content-length",
                              RawValue: []byte(fmt.Sprintf("%d", len(newBody))),
                          },
                      },
                  },
              },
              BodyMutation: &ext_proc.BodyMutation{
                  Mutation: &ext_proc.BodyMutation_Body{
                      Body: newBody,
                  },
              },
          }
          return resp
      }

      func main() {
          lis, err := net.Listen("tcp", ":50051")
          if err != nil {
              log.Fatalf("failed to listen: %v", err)
          }
          s := grpc.NewServer()
          ext_proc.RegisterExternalProcessorServer(s, &server{})
          log.Println("transformer listening on :50051")
          if err := s.Serve(lis); err != nil {
              log.Fatalf("failed to serve: %v", err)
          }
      }
    go.mod: |
      module transformer

      go 1.23

      require (
          github.com/envoyproxy/go-control-plane/envoy v1.32.4
          google.golang.org/grpc v1.72.1
      )
  ```
</Accordion>

<Accordion title="transformer-deployment.yaml">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: transformer
    labels:
      app: transformer
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: transformer
    template:
      metadata:
        labels:
          app: transformer
      spec:
        initContainers:
          - name: build
            image: golang:1.23
            command: ["sh", "-c"]
            args:
              - |
                cp /src/main.go /src/go.mod /build/ &&
                cd /build &&
                go mod tidy &&
                CGO_ENABLED=0 go build -o /build/transformer ./main.go
            volumeMounts:
              - name: source
                mountPath: /src
                readOnly: true
              - name: binary
                mountPath: /build
        containers:
          - name: transformer
            image: gcr.io/distroless/static-debian12:nonroot
            command: ["/app/transformer"]
            ports:
              - containerPort: 50051
            volumeMounts:
              - name: binary
                mountPath: /app
                readOnly: true
        volumes:
          - name: source
            configMap:
              name: transformer-source
          - name: binary
            emptyDir: {}
  ---
  apiVersion: v1
  kind: Service
  metadata:
    name: transformer
    labels:
      app: transformer
  spec:
    selector:
      app: transformer
    ports:
      - port: 50051
        targetPort: 50051
        protocol: TCP
  ```
</Accordion>

<Note>
  对于生产，请预先构建容器映像，而不是在 init 容器中进行编译。有关多阶段构建示例，请参阅 [Helm chart repository](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy) 中的 `e2e/transformer/Dockerfile`。
</Note>

## 附加配置

### HTTP 代理

Envoy 不尊重 `HTTP_PROXY`、`HTTPS_PROXY` 或 `NO_PROXY` 环境变量。显式配置 HTTP 代理：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
authProxy:
  httpProxy:
    enabled: true
    host: "proxy.example.com"
    port: 3128
    noProxy:
      - "internal.corp"
      - ".internal.corp"
```

### 在没有公共入口的情况下部署当身份验证代理没有公共入口并且只能通过内部 Kubernetes 网络访问时，必须将 LangSmith 服务配置为允许对私有 IP 地址的出站请求。如果没有这些设置，内置 SSRF 保护将阻止对私有 IP 的请求。

将以下环境变量添加到您的[LangSmith ⟦T123⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)：

* **`SSRF_ALLOW_K8S_INTERNAL`** — 所有进行 LLM 调用的服务都需要。对于支持它的服务，将此添加到 `commonEnv`；对于不支持 `commonEnv` 的服务，将其添加到每个服务的 `extraEnv`。
* **`SSRF_ALLOW_PRIVATE_IPS_PLAYGROUND`** — 仅在 `playground` 服务上需要。将其添加到`playground.deployment.extraEnv`。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Allow all LLM-calling services to reach the auth proxy on private IPs
commonEnv:
  SSRF_ALLOW_K8S_INTERNAL: "true"

# Allow the playground service to reach the auth proxy on private IPs
playground:
  deployment:
    extraEnv:
      - name: SSRF_ALLOW_K8S_INTERNAL
        value: "true"
      - name: SSRF_ALLOW_PRIVATE_IPS_PLAYGROUND
        value: "true"
```

如果 `commonEnv` 不适用于部署中的所有必需服务，请在进行 LLM 调用的每个服务上通过 `extraEnv` 单独设置 `SSRF_ALLOW_K8S_INTERNAL`。

### 其他选项

有关入口、自动缩放、资源限制和其他配置选项，请参阅[Helm chart README](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy#readme)。

<Tip>
  为了提高生产可靠性，请将 `authProxy.autoscaling.hpa.minReplicas` 至少设置为 `3`。
</Tip>

## 完整配置示例

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
authProxy:
  upstream: "https://gateway.example.com"   # your LLM gateway or provider
  jwtIssuer: "langsmith"                    # must match LLM_AUTH_PROXY_ISSUER on LangSmith
  jwtAudiences:
    - "example-audience"                    # must match org setting in LangSmith

  # Option A: remote JWKS (recommended for production)
  # Envoy fetches and caches public keys from LangSmith's /.well-known/jwks.json endpoint.
  jwksUri: "https://langsmith.example.com/.well-known/jwks.json"   # self-hosted
  # jwksUri: "https://api.smith.langchain.com/.well-known/jwks.json"  # SaaS
  jwksCacheDurationSeconds: 300             # how long Envoy caches the JWKS (default 5 min)

  # Option B: inline JWKS (testing or air-gapped environments only)
  # jwksJson: '{"keys": [...]}'

  # ext_authz: header-only auth logic (include only if needed)
  # Use this to inject, remove, or modify authorization headers.
  # Your service receives an HTTP request at /check with the validated JWT
  # in the x-langsmith-llm-auth header and responds with headers to inject upstream.
  extAuthz:
    enabled: true
    serviceUrl: "http://localhost:10002"    # sidecar URL
    # serviceUrl: "http://ext-authz.<namespace>.svc.cluster.local:10002"  # separate deployment
    sendBody: false                         # set true to include request body

  # transformer: request/response body transformation (include only if needed)
  # Use this when you need to rewrite request or response bodies (e.g. OpenAI -> custom format).
  # Can be enabled alongside ext_authz.
  transformer:
    enabled: true
    serviceUrl: "grpc://transformer.<namespace>.svc.cluster.local:50051"
    timeout: "10s"
    failureModeAllow: false                 # reject if transformer is unavailable
    processingMode:
      requestHeaderMode: "SEND"             # forward request headers (read JWT, inject auth)
      responseHeaderMode: "SKIP"            # skip response headers
      requestBodyMode: "BUFFERED"           # buffer full body for JSON rewriting
      responseBodyMode: "NONE"              # skip response body
      requestTrailerMode: "SKIP"
      responseTrailerMode: "SKIP"
```

## JWT 声明参考

LangSmith 使用 **Ed25519 (EdDSA)** 签署 JWT。公钥由 `/.well-known/jwks.json` 提供并由代理自动获取。身份验证代理使用这些公钥验证签名。|索赔 |描述 |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `iat`、`exp`、`jti`、`nbf` |标准 JWT 声明（发布时间、到期时间、JWT ID、不早于）|
| `iss` |发行人。 `langsmith` 用于 SaaS；通过 `LLM_AUTH_PROXY_ISSUER` 设置自托管 |
| `aud` |观众。匹配 LangSmith 组织设置中的 JWT 受众 |
| `sub` |参与者标识符（用户 ID、评估者 ID、助理 ID 或 API 密钥 ID）|
| `actor_type` |其中之一：`user`、`evaluator`、`agent-builder`、`api_key` |
| `workspace_id` |工作区 ID |
| `workspace_name` |工作区名称 |
| `organization_id` |组织 ID |
| `organization_name` |组织名称 || `request_id` |请求相关 ID |
| `ls_user_id` | LangSmith 用户 ID（仅当 `actor_type` 为 `user` 时出现）|

JWT 将传递到 `x-langsmith-llm-auth` 请求标头中的 `ext_authz` 或转换器服务。

## 常见问题解答

<Accordion title="Does the auth proxy support corporate proxies?">
  是的。通过`values.yaml`中的`httpProxy`部分配置HTTP代理。详情请参阅[HTTP proxy](#http-proxy)。
</Accordion>

<Accordion title="Does the auth proxy support custom certificates?">
  是的，通过 `customCa` 获取自定义 CA 证书，通过 `mtls` 获取相互 TLS。
</Accordion>

<Accordion title="Can a single auth proxy route to multiple upstream LLM gateways?">
  不会。身份验证代理有一个 `upstream` 字段。
</Accordion>

<Accordion title="Can the auth proxy serve multiple organizations?">
  是的。多个组织可以通过 LangSmith 中的模型配置指向同一个身份验证代理实例。
</Accordion>

<Accordion title="Can the LangSmith to auth proxy connection use HTTP instead of HTTPS?">
  是的，但仅限于自托管，我们通常建议将身份验证代理放置在专用入口后面，以便通信使用 HTTPS。要允许 HTTP，请将 `LLM_AUTH_PROXY_ACCEPT_HTTP` 添加到 `commonEnv` 并在 [LangSmith ⟦T169⟧](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml) 中添加 `playground.deployment.extraEnv`。
  要启用到 [Chat and Insights](/langsmith/deploy-self-hosted-full-platform#enable-fleet-insights-and-chat) 身份验证代理的 HTTP 流量，请在相应的 `extraEnv` 部分中设置此环境变量：`config.polly.agent.extraEnv`（用于 Chat，以前称为 Polly）和 `config.insights.agent.extraEnv`。
</Accordion><Accordion title="Does the auth proxy work without a public ingress?">
  是的。当身份验证代理只能通过 Kubernetes 内部网络（无公共入口）访问时，请将 `SSRF_ALLOW_K8S_INTERNAL` 添加到进行 LLM 调用的所有服务，并将 `SSRF_ALLOW_K8S_INTERNAL` 和 `SSRF_ALLOW_PRIVATE_IPS_PLAYGROUND` 添加到 `playground` 服务。有关配置详细信息，请参阅[Deploy without a public ingress](#deploy-without-a-public-ingress)。
</Accordion>

<Accordion title="When should I use the LLM auth proxy versus OAuth client credentials on a model configuration?">
  当身份验证需要 OAuth2 `client_credentials` 之外的自定义逻辑时，请使用 LLM 身份验证代理。例如，将 LangSmith JWT 交换为提供商特定的令牌、注入 GCP 或 AWS 身份，或者重写请求和响应正文。当每个工作区或团队需要针对自定义网关对其自己的 OAuth2 `client_credentials` 进行自助控制时，请使用 [OAuth client credentials on a model configuration](/langsmith/model-configurations#oauth-client-credentials)。两者可以在同一组织中共存；路由是按配置进行的。
</Accordion>

## Helm 图表参考

有关可配置值的完整列表，请参阅[Helm chart README](https://github.com/langchain-ai/helm/tree/main/charts/langsmith-auth-proxy)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-auth-proxy-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>