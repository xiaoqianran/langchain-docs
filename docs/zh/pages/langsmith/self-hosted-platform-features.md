<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted platform features | https://docs.langchain.com/langsmith/self-hosted-platform-features -->

# 自托管平台功能

本页面介绍仅适用于 [self-hosted](/langsmith/self-hosted) 部署的平台功能。

## 自定义 PostgreSQL

可以使用自定义 PostgreSQL 实例代替 [one automatically created by the control plane](/langsmith/cloud-platform-features#database-provisioning)。指定 [⟦T0⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 PostgreSQL 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。

多个部署可以共享同一个 PostgreSQL 实例。例如，对于`Deployment A`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_1>?host=<hostname_1>`，对于`Deployment B`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_2>?host=<hostname_1>`。 `<database_name_1>`和`<database_name_2>`是同一实例中的不同数据库，但`<hostname_1>`是共享的。 **同一数据库不能用于单独的部署**。

## 自定义Redis

可以使用自定义 Redis 实例来代替控制平面自动创建的实例。指定 [⟦T10⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 Redis 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。多个部署可以共享同一个 Redis 实例。例如，对于`Deployment A`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/1`，对于`Deployment B`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/2`。 `1`和`2`是同一实例内不同的数据库编号，但`<hostname_1>`是共享的。 **相同的数据库编号不能用于单独的部署**。

## 听众

监听器是[listener application](/langsmith/data-plane#listener-application)的一个实例。侦听器包含有关应用程序的元数据（例如其版本）以及有关应用程序可以部署到的计算基础设施（例如 Kubernetes 命名空间）的元数据。

侦听器数据模型仅适用于自托管部署。控制平面和侦听器协调以配置和协调在您自己的基础设施上运行的部署。

## 资源定制

自托管部署的资源可以完全定制。与公开固定无服务器和专用[deployment types](/langsmith/cloud-platform-features#deployment-types)的云不同，自托管部署根据您的基础设施配置调整 CPU、内存、副本和存储的大小。请参阅 [Configure Agent Server for scale](/langsmith/agent-server-scale) 获取调整指南。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-platform-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>