<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: FIPS-compliant images | https://docs.langchain.com/langsmith/self-host-fips -->

# 符合 FIPS 的图像

在符合 FIPS 140 的容器映像上运行自托管 LangSmith 安装

<Note>
  FIPS 和气隙 LangSmith 部署需要在部署前与您的 LangChain 客户主管进行对话。在更改安装之前，请先了解范围许可、支持的配置和升级路径。
</Note>

从 v15 开始，每个 LangChain 创作的 LangSmith 映像都有一个在 FIPS 140 模式下运行的 `-fips` 对应版本。当您的自托管部署需要符合 FIPS 合规性时（例如在联邦机构、国防承包商和受监管行业中），请使用这些映像。

## 图像是如何构建的

`-fips` 变体构建在 [Chainguard FIPS container images](https://edu.chainguard.dev/chainguard/fips/fips-images/) 之上，后者提供经过 NIST 验证的加密模块（OpenSSL FIPS 提供程序、Bouncy Castle FIPS 或 BoringCrypto，具体取决于基础）。有关模块列表及其 CMVP 证书，请参阅[Chainguard's FIPS commitment](https://edu.chainguard.dev/chainguard/fips/fips-images/)。

每个 LangChain 创作的图像都有一个与非 FIPS 版本在同一标签上发布的 `-fips` 对应版本：|非 FIPS 图像 | FIPS 图像 |
| --------------------------------- | -------------------------------------- |
| `langchain/langsmith-ace-backend` | `langchain/langsmith-ace-backend-fips` |
| `langchain/langsmith-backend` | `langchain/langsmith-backend-fips` |
| `langchain/langsmith-frontend` | `langchain/langsmith-frontend-fips` |
| `langchain/langgraph-operator` | `langchain/langgraph-operator-fips` |

<Note>
  **从 LangSmith 0.16.21（图表 `0.16.0-rc.17`）开始，图像数量减少。** 平台后端、playground、主机后端以及 Fleet 工具和触发器服务器现在都从单个 `langsmith-backend` 图像运行，因此 `langsmith-go-backend-fips`、`langsmith-playground-fips`、`hosted-langserve-backend-fips`、不再需要`agent-builder-tool-server-fips`和`agent-builder-trigger-server-fips`。对应的`values.yaml`键：`platformBackendImage`、`playgroundImage`、`hostBackendImage`、`fleetToolServerImage`和`fleetTriggerServerImage`已从图表中删除；您仍然为它们设置的任何值都将被忽略。

  在 **早期** 版本中，这五个图像也与相同标签下的 `-fips` 对应版本一起发布；将每个密钥也指向其 `-fips` 存储库。
</Note>

LangChain 未将 PostgreSQL、Redis 和 ClickHouse 发布为 FIPS 变体。如果您的部署需要这些组件使用 FIPS，请自带 FIPS 模式服务并通过 [external Postgres](/langsmith/self-host-external-postgres)、[external Redis](/langsmith/self-host-external-redis) 或 [external ClickHouse](/langsmith/self-host-external-clickhouse) 连接。

### ACE 后端 FIPS 边界注释`langsmith-ace-backend-fips` 与所有其他 `-fips` 镜像构建在相同的 Chainguard FIPS 基础上，但其代码执行运行时（Deno 和 Pyodide/WebAssembly）捆绑了自己的加密库，并且不动态链接系统 FIPS 验证的 OpenSSL，因此执行运行时本身在技术上不属于 FIPS 140 模块边界。

我们认为这对于受监管的环境来说是可以接受的：FIPS 管理平台对敏感数据的加密操作，而 ACE 不执行任何操作。它不会向用户代码注入任何秘密，不保留任何数据，也不执行静态数据加密，并且其执行子进程没有网络访问权限。 ACE 是由 LangSmith 后端调用的集群内 HTTP 服务；当 TLS 由 FIPS 验证的网格或入口终止于上游时，ACE 不执行范围内的加密操作。

## 使用 FIPS 图像

更新 LangSmith Helm 安装中的 `values.yaml`，将每个 LangChain 镜像存储库指向其对应的 `-fips`，同时保留现有标签。将 `0.16.21` 替换为您要部署的 [LangSmith version](/langsmith/self-hosted-changelog)：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
images:
  aceBackendImage:
    repository: "langchain/langsmith-ace-backend-fips"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  backendImage:
    repository: "langchain/langsmith-backend-fips"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  frontendImage:
    repository: "langchain/langsmith-frontend-fips"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
  operatorImage:
    repository: "langchain/langgraph-operator-fips"
    pullPolicy: IfNotPresent
    tag: "0.16.21"
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
docker run --rm --entrypoint openssl-fips-test langchain/langsmith-backend-fips:0.16.21
```

有关解释输出的更多详细信息，请参阅[Chainguard's FIPS verification guide](https://edu.chainguard.dev/chainguard/fips/verify-fips/)。

## 用于气隙部署的镜像

将镜像镜像到私有注册表时，`-fips` 命名约定同样适用。遵循 [image mirroring guide](/langsmith/self-host-mirroring-images) 并将每个存储库替换为其对应的 `-fips` 版本。无论是否有 FIPS，气隙部署都需要在开始之前与您的 LangChain 客户经理确定范围。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-fips.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>