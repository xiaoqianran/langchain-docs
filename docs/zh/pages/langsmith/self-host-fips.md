<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: FIPS-compliant images | https://docs.langchain.com/langsmith/self-host-fips -->

# 符合 FIPS 的图像

在符合 FIPS 140 的容器映像上运行自托管 LangSmith 安装

> [!注意]
>
> FIPS 和气隙 LangSmith 部署需要在推出前与您的 LangChain 客户主管进行对话。在更改安装之前，请先了解范围许可、支持的配置和升级路径。

从 v15 开始，每个 LangChain 创作的 LangSmith 映像都有一个在 FIPS 140 模式下运行的 `-fips` 对应版本。从 v18 (LangSmith `appVersion` 0.18.0) 开始，SmithDB 镜像还有一个 `-fips` 对应版本。当您的自托管部署需要符合 FIPS 合规性时（例如在联邦机构、国防承包商和受监管行业中），请使用这些映像。

## 图像是如何构建的

`-fips` 变体构建于 [Chainguard FIPS container images](https://edu.chainguard.dev/chainguard/fips/fips-images/) 之上，后者附带经过 NIST 验证的加密模块（OpenSSL FIPS 提供程序、Bouncy Castle FIPS 或 BoringCrypto，具体取决于基础）。有关模块列表及其 CMVP 证书，请参阅[Chainguard's FIPS commitment](https://edu.chainguard.dev/chainguard/fips/fips-images/)。

每个 LangChain 创作的图像都有一个 `-fips` 对应版本发布在与非 FIPS 版本相同的标签上：

|非 FIPS 图像 | FIPS 图像 |
| - | - |
| `langchain/langsmith-ace-backend` | `langchain/langsmith-ace-backend-fips` |
| `langchain/langsmith-backend` | `langchain/langsmith-backend-fips` |
| `langchain/langsmith-frontend` | `langchain/langsmith-frontend-fips` |
| `langchain/langgraph-operator` | `langchain/langgraph-operator-fips` |
| `langchain/smithdb` | `langchain/smithdb-fips` |> [!注意]
>
> **从LangSmith 0.16.21（图表`0.16.0-rc.17`）开始，图像数量减少。** 平台后端、playground、主机后端以及舰队工具和触发器服务器现在都从单个`langsmith-backend`图像运行，因此`langsmith-go-backend-fips`、`langsmith-playground-fips`、`hosted-langserve-backend-fips`、不再需要`agent-builder-tool-server-fips`和`agent-builder-trigger-server-fips`。对应的`values.yaml`键：`platformBackendImage`、`playgroundImage`、`hostBackendImage`、`fleetToolServerImage`和`fleetTriggerServerImage`已从图表中删除；您仍然为它们设置的任何值都将被忽略。
>
> 在 **早期** 版本中，这五个图像也与 `-fips` 对应项一起发布在同一标签上；将每个密钥也指向其 `-fips` 存储库。

PostgreSQL、Redis 和 ClickHouse 并未由 LangChain 发布为 FIPS 变体。如果您的部署需要这些组件使用 FIPS，请自带 FIPS 模式服务并通过 [external Postgres](/langsmith/self-host-external-postgres)、[external Redis](/langsmith/self-host-external-redis) 或 [external ClickHouse](/langsmith/self-host-external-clickhouse) 连接。

### ACE 后端 FIPS 边界注释

`langsmith-ace-backend-fips` 与所有其他 `-fips` 镜像构建在相同的 Chainguard FIPS 基础上，但其代码执行运行时（Deno 和 Pyodide/WebAssembly）捆绑了自己的加密库，并且不动态链接系统 FIPS 验证的 OpenSSL，因此执行运行时本身在技术上不属于 FIPS 140 模块边界。我们认为这对于受监管的环境来说是可以接受的：FIPS 管理平台对敏感数据的加密操作，而 ACE 不执行任何操作。它不会向用户代码注入任何秘密，不保留任何数据，也不执行静态数据加密，并且其执行子进程没有网络访问权限。 ACE是由LangSmith后端调用的集群内HTTP服务；当 TLS 由 FIPS 验证的网格或入口终止于上游时，ACE 不执行范围内的加密操作。

### SmithDB FIPS 边界注释

`langchain/smithdb-fips` 中的 SmithDB 服务通过 `aws-lc-fips-sys` 加密模块，使用 `rustls` `aws-lc-rs` 加密提供程序（而不是系统 OpenSSL FIPS 提供程序）执行其安全关键型加密和散列。除了标准 `openssl-fips-test` 检查之外，`smithdb` 二进制文件还包含一个 `check-fips` 子命令，用于确认该提供商处于活动状态并且 AWS-LC 在 FIPS 模式下运行。参见[Verify the SmithDB image](#verify-the-smithdb-image)。

## 使用 FIPS 图像

更新 LangSmith Helm 安装中的 `values.yaml`，将每个 LangChain 镜像存储库指向其对应的 `-fips` 镜像存储库，同时保留现有标签。将 `0.18.2026112100` 替换为您要部署的 [LangSmith version](/langsmith/self-hosted-changelog)：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  aceBackendImage:
    repository: "langchain/langsmith-ace-backend-fips"
    pullPolicy: IfNotPresent
    tag: "0.18.2026112100"
  backendImage:
    repository: "langchain/langsmith-backend-fips"
    pullPolicy: IfNotPresent
    tag: "0.18.2026112100"
  frontendImage:
    repository: "langchain/langsmith-frontend-fips"
    pullPolicy: IfNotPresent
    tag: "0.18.2026112100"
  operatorImage: # The operator is versioned separately from LangSmith
    repository: "langchain/langgraph-operator-fips"
    pullPolicy: IfNotPresent
    tag: "0.1.66"
  smithdbImage: # Only when SmithDB is enabled
    repository: "langchain/smithdb-fips"
    pullPolicy: IfNotPresent
    tag: "0.18.2026112100"
```

按照 [Upgrading LangSmith](/langsmith/self-host-upgrades) 指南应用更改和升级。

## 验证 FIPS 模式Chainguard 在每个 FIPS 映像中都附带了 `openssl-fips-test` 工具。针对 Pod 运行它会打印 FIPS 自测试、活动 FIPS 提供程序版本以及适用的 CMVP 证书的链接。

检查正在运行的 Pod：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl exec <pod-name> -- openssl-fips-test
```

预期产出（删节）：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Checking OpenSSL lifecycle assurance.
	✓ Self-test KAT_Integrity HMAC ... passed.
	✓ Self-test Module_Integrity HMAC ... passed.
	...
	✓ 29 out of 29 self-tests passed.
	✓ Check FIPS cryptographic module is available... passed.
	✓ Check FIPS approved only mode (EVP_default_properties_is_fips_enabled)... passed.
Public OpenSSL API (libssl.so & libcrypto.so):
	name:      OpenSSL 3.6.0 1 Oct 2025
	version:   3.6.0
FIPS cryptographic module provider details (fips.so):
	name:      OpenSSL FIPS Provider
	version:   3.1.2
Locate applicable CMVP certificate(s) at: CMVP #4985
```

您还可以验证 Kubernetes 外部的镜像：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker run --rm --entrypoint openssl-fips-test langchain/langsmith-backend-fips:0.18.2026112100
```

有关解释输出的更多详细信息，请参阅[Chainguard's FIPS verification guide](https://edu.chainguard.dev/chainguard/fips/verify-fips/)。

### 验证 SmithDB 映像

每个 SmithDB FIPS 映像都带有 CycloneDX 格式的签名 SBOM（软件物料清单）。 SBOM 列出了依赖关系树，包括执行加密的 crate，因此您可以确认已构建经过 FIPS 验证的 crate。

安装[⟦T52⟧](https://docs.sigstore.dev/cosign/system_config/installation/)，然后验证标签。 SBOM 证明附加到多平台索引和每个平台清单，因此验证标签会检查每个平台并为每个平台返回一个证明：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cosign verify-attestation --type cyclonedx \
    --certificate-identity-regexp '^https://github\.com/langchain-ai/smithdb/\.github/workflows/promote-self-hosted-release\.yml@refs/heads/main$' \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    docker.io/langchain/smithdb-fips:0.18.2026112100
```

该命令打印每个证明的验证结果，后跟 JSON 格式的证明本身：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Verification for docker.io/langchain/smithdb-fips:0.18.2026112100 --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates
Certificate subject: https://github.com/langchain-ai/smithdb/.github/workflows/promote-self-hosted-release.yml@refs/heads/main
Certificate issuer URL: https://token.actions.githubusercontent.com
GitHub Workflow Trigger: repository_dispatch
GitHub Workflow SHA: ...
GitHub Workflow Name: Promote Self-Hosted Release
GitHub Workflow Repository: langchain-ai/smithdb
GitHub Workflow Ref: refs/heads/main
```

每个证明都是一个 in-toto 语句，其 `predicate` 保存 CycloneDX 文档。要将单个平台的 SBOM 保存为独立的 CycloneDX 文件，请解析该平台的摘要并验证它而不是标记：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List the digest of each platform-specific image
docker manifest inspect docker.io/langchain/smithdb-fips:0.18.2026112100 \
  | jq -r '.manifests[] | select(.platform.os != "unknown") | "\(.platform.os)/\(.platform.architecture) \(.digest)"'

# Verify one platform's attestation and extract its SBOM
cosign verify-attestation --type cyclonedx \
    --certificate-identity-regexp '^https://github\.com/langchain-ai/smithdb/\.github/workflows/promote-self-hosted-release\.yml@refs/heads/main$' \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    docker.io/langchain/smithdb-fips@<platform-digest> \
  | jq '.payload | @base64d | fromjson | .predicate' > sbom.json
```将第一个命令中的 `<platform-digest>` 替换为 `sha256:...` 摘要。 `sbom.json` 然后包含该平台的 CycloneDX SBOM。

除了 `openssl-fips-test` 之外，SmithDB FIPS 映像还包含一个 `smithdb check-fips` 命令。它会打印活动的加密提供程序并以非零值退出，除非 rustls 提供程序已获得 FIPS 批准并且 AWS-LC 在经过认证的模块版本上以 FIPS 模式运行。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker run --rm langchain/smithdb-fips:0.18.2026112100 check-fips
```

预期输出：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
FIPS mode: rustls crypto provider aws-lc-rs on AWS-LC FIPS 3.1.0
```

## 用于气隙部署的镜像

将镜像镜像到私有注册表时，`-fips` 命名约定同样适用。遵循 [image mirroring guide](/langsmith/self-host-mirroring-images) 并将每个存储库替换为其对应的 `-fips` 版本。无论是否有 FIPS，气隙部署都需要在开始之前与您的 LangChain 客户经理确定范围。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-fips.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。