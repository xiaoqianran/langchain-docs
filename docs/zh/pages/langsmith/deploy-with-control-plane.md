<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with control plane | https://docs.langchain.com/langsmith/deploy-with-control-plane -->

# 使用控制平面进行部署

使用控制平面 UI 构建 Docker 映像并将应用程序部署到自托管 LangSmith 实例。

<Info>
  **本指南适用于实例上具有 [enabled LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform#enable-langsmith-deployment) 的自托管 LangSmith 客户**。对于云客户，请参阅[Deploy on Cloud](/langsmith/deploy-to-cloud)。对于没有控制平面的独立代理服务器，请参阅[Self-host standalone servers](/langsmith/deploy-standalone-server)。
</Info>

本指南向您展示如何使用 [control plane](/langsmith/control-plane) 将应用程序部署到 [self-hosted](/langsmith/self-hosted) LangSmith 实例。使用控制平面，您可以在本地构建 Docker 映像，将它们推送到 Kubernetes 集群有权访问的注册表，并使用 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-with-control-plane) 部署它们。

## 拓扑结构

在现有自托管 LangSmith 实例上启用 LangSmith 部署会添加控制平面、数据平面侦听器以及在集群中配置代理服务器的操作员。 LangSmith 基础平台继续处理可观察性、评估和提示；部署的代理服务器将跟踪发送回它。

有关启用 LangSmith Deployment 添加的组件的详细信息，请参阅[Enable LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform#enable-langsmith-deployment)。

## 概述

部署到具有控制平面的自托管 LangSmith 实例的应用程序使用 Docker 映像。在本指南中，应用程序部署工作流程为：1. 使用 `langgraph dev` 或 [Studio](/langsmith/studio) 在本地测试您的应用程序。
2. 使用`langgraph build`命令构建Docker镜像。
3. 将映像推送到您的基础设施可访问的容器注册表。
4. 通过指定图像 URL 从 [control plane UI](/langsmith/control-plane#control-plane-ui) 进行部署。

## 先决条件

在完成本指南之前，您需要具备以下条件：

* [LangSmith Deployment enabled](/langsmith/deploy-self-hosted-full-platform#enable-langsmith-deployment) 在您的自托管 LangSmith 实例上。
* 在启用 LangSmith 部署的情况下访问[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-with-control-plane)。
* Kubernetes 集群可访问的容器注册表。如果使用需要身份验证的私有注册表，则必须将映像拉取机密配置为基础架构设置的一部分。参考[Private registry authentication](#private-registry-authentication)。

## 步骤1.本地测试

部署之前，请在本地测试您的应用程序。您可以使用[LangGraph CLI](/langsmith/cli#dev)在开发模式下运行Agent服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev
```

有关本地测试的完整指南，请参阅[Local server quickstart](/langsmith/local-dev-testing)。

## 步骤 2. 构建 Docker 镜像

使用 [⟦T5⟧](/langsmith/cli#build) 命令构建应用程序的 Docker 映像：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph build -t my-image
```

构建命令选项包括：|选项|默认|描述 |
| -------------------- | ---------------- | ------------------------------------------------------------------ |
| `-t, --tag TEXT` |必填 | Docker 镜像的标签 |
| `--platform TEXT` |                  |要构建的目标平台（例如，`linux/amd64,linux/arm64`）|
| `--pull / --no-pull` | `--pull` |使用最新的远程 Docker 镜像构建 |
| `-c, --config FILE` | `langgraph.json` |配置文件路径 |

平台规范示例：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph build --platform linux/amd64 -t my-image:v1.0.0
```

有关完整详细信息，请参阅[CLI reference](/langsmith/cli#build)。

## 步骤 3. 推送到容器注册表

将您的映像推送到 Kubernetes 集群可访问的容器注册表。具体命令取决于您的注册表提供商。

<Tip>
  使用版本信息标记您的映像（例如，`my-registry.com/my-app:v1.0.0`）以使回滚更容易。
</Tip>

## 步骤 4. 使用控制平面 UI 进行部署

[control plane UI](/langsmith/control-plane#control-plane-ui) 允许您创建和管理部署、查看日志和指标以及更新配置。要在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-with-control-plane) 中创建新部署：1. 在左侧导航面板中，选择“**部署**”。
2. 在右上角，选择“**+ 新建部署**”。
3. 在部署配置面板中，提供：
   * **图片URL**：您在[Step 3](#step-3-push-to-container-registry)中推送的完整图片URL。
   * **侦听器/计算 ID**：选择为您的基础架构配置的侦听器。
   * **命名空间**：要部署到的 Kubernetes 命名空间。
   * **环境变量**：任何所需的配置（API 密钥等）。
   * 根据需要进行其他部署设置。
4. 选择**提交**。

控制平面将与您的 [data plane](/langsmith/data-plane) 监听器协调来部署您的应用程序。

创建部署后，基础设施是[provisioned asynchronously](/langsmith/control-plane#asynchronous-deployment)。部署可能需要长达几分钟的时间，由于数据库创建，初始部署需要更长的时间。

从控制平面 UI 中，您可以查看构建日志、服务器日志和部署指标，包括 CPU/内存使用情况、副本和 API 性能。更多详情请参阅[control plane monitoring documentation](/langsmith/control-plane#monitoring)。

<Note>
  会自动为每个部署创建一个与部署同名的[LangSmith Observability tracing project](/langsmith/observability)。跟踪环境变量由控制平面自动设置。
</Note>

## 更新部署要部署应用程序的新版本，请创建一个 [new revision](/langsmith/control-plane#revisions)：

从 LangSmith UI 开始：

1. 在左侧导航面板中，选择“**部署**”。
2. 选择现有部署。
3. 在“部署”视图中，选择右上角的“**+ 新修订版**”。
4.更新配置：
   * 将**图像 URL** 更新为您的新图像版本。
   * 如果需要更新环境变量。
   * 根据需要调整其他设置。
5. 选择**提交**。

## 私有注册中心认证

如果您的容器注册表需要身份验证（例如 AWS ECR、Azure ACR、GCP ArtifactRegistry、私有 Docker 注册表），则必须在部署应用程序之前配置 Kubernetes 映像拉取机密。这是一次性基础设施配置。

<Note>
  **此配置是在基础架构级别完成的，而不是在每个部署中完成。** 配置后，所有部署都会自动继承注册表凭据。
</Note>

在 LangSmith Helm 图表的 `values.yaml` 文件中配置 `imagePullSecrets`。详细步骤请参见[Enable LangSmith Deployment guide](/langsmith/deploy-self-hosted-full-platform#enable-langsmith-deployment)。

有关为不同注册表提供商创建镜像拉取机密的详细步骤，请参阅[Kubernetes documentation on pulling images from private registries](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/)。

## 后续步骤* **[Control plane](/langsmith/control-plane)**：了解有关控制平面功能的更多信息。
* **[Data plane](/langsmith/data-plane)**：了解数据平面架构。
* **[Observability](/langsmith/observability)**：通过自动跟踪监控您的部署。
* **[Studio](/langsmith/studio)**：测试和调试已部署的应用程序。
* **[LangGraph CLI](/langsmith/cli)**：完整的 CLI 参考文档。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-with-control-plane.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>