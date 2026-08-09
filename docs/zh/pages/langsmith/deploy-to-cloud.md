<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy on Cloud | https://docs.langchain.com/langsmith/deploy-to-cloud -->

# 部署在云端

创建和管理 LangSmith 云部署，包括修订、日志、指标和设置。

这是将应用程序部署到 LangSmith Cloud 的综合设置和管理指南。 LangSmith Cloud 在 AWS 和 GCP 上运行（有关区域详细信息，请参阅[Cloud overview page](/langsmith/cloud)）。

本指南涵盖两种部署方法：[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)（从连接的 GitHub 存储库部署）和 [⟦T15⟧ CLI command](/langsmith/cli#deploy)（直接从本地计算机构建和推送）。

<Callout icon="bolt">
  **如果您正在寻找快速设置**，请先尝试 [quickstart guide](/langsmith/deployment-quickstart)。
</Callout>

在设置之前，请查看[Cloud overview page](/langsmith/cloud)以了解云托管模型。

## 先决条件

* [Plus plan or above](https://www.langchain.com/pricing) 上的 LangSmith 帐户。
* [Verify that the LangGraph API runs locally](/langsmith/local-dev-testing)。如果 API 未成功运行（即`langgraph dev`），部署到 LangSmith 也会失败。

## 创建新部署

选择适合您工作流程的部署方法 - LangSmith UI 连接到 GitHub 存储库并支持推送自动部署，而 `langgraph deploy` CLI 命令直接从本地项目目录构建和部署。<Tabs>
  <Tab title="LangSmith UI">
    <Note>
      **需要一次性设置**：GitHub 组织所有者或管理员必须在 LangSmith UI 中完成 OAuth 流程才能授权 `hosted-langserve` GitHub 应用程序。每个工作区只需执行一次此操作。初始 OAuth 授权后，所有具有部署权限的开发人员都可以创建和管理部署，而无需 GitHub 管理员访问权限。
    </Note>

    从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)开始，选择左侧导航面板中的**部署**，**部署**。在右上角，选择**+ New Deployment**来创建新的部署：1. 在 **创建新部署** 面板中，填写必填字段。对于**部署详细信息**：
       1. 选择**从GitHub导入**，按照GitHub OAuth工作流程安装并授权LangChain的`hosted-langserve` GitHub应用程序访问所选仓库。安装完成后，返回**创建新部署**面板并从下拉菜单中选择要部署的 GitHub 存储库。
          安装LangChain的`hosted-langserve` GitHub应用程序的<Note> GitHub用户必须是组织或帐户的[owner](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#organization-owners)。每个 LangSmith 工作区只需完成一次此授权 - 任何具有部署权限的用户都可以创建后续部署。</Note>
       2. 指定部署的名称。
       3. 指定所需的**Git 分支**。部署链接到分支。创建新修订版时，将部署链接分支的代码。该分支稍后可以在[Deployment Settings](#deployment-settings)中更新。
       4. 指定[LangGraph API config file](/langsmith/cli#configuration-file) 的完整路径（包括文件名）。例如，如果文件 `langgraph.json` 位于存储库的根目录中，则指定 `langgraph.json`。5. 使用复选框**推送到分支时自动更新部署**。如果选中，当更改推送到指定的 **Git Branch** 时，部署将自动更新。您可以在 [the UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud) 中的 [Deployment Settings](#deployment-settings) 上启用或禁用此设置。
          对于**部署类型**：
          * 无服务器部署针对后台和延迟容忍代理以及开发、测试和预览分支进行了成本优化。经过一段时间的不活动后，它们会缩放到零，并在下一个请求时唤醒。在配置资源时（包括缩减之前的空闲时间）对计算进行计费。
          * 专用部署始终在线，并为生产工作负载提供高可用存储和自动备份。
       6. 确定部署是否应**可通过 Studio 共享**。
          1. 如果未选中，则只能使用 [workspace](/langsmith/administration-overview#workspaces) 的有效 LangSmith API 密钥来访问部署。
          2. 如果选中，任何 LangSmith 用户都可以通过 [Studio](/langsmith/studio) 访问部署。将提供用于部署的 Studio 的直接 URL，以便与其他 LangSmith 用户共享。7. 指定**环境变量**和机密。要为部署配置其他变量，请参阅[Environment Variables reference](/langsmith/env-var-cloud)。
          1. API 密钥（例如`OPENAI_API_KEY`）等敏感值应指定为机密。
          2. 还可以指定其他非秘密环境变量。
       8. 将自动创建一个与部署同名的新 LangSmith [tracing project](/langsmith/observability)。
    2. 在右上角，选择“**提交**”。几秒钟后，将出现 **部署** 视图，新部署将排队等待配置。
  </Tab>

  <Tab title="LangGraph CLI">
    <Note>
      `langgraph deploy` 命令位于 **[beta](/langsmith/release-stages)** 中。它需要安装并运行[Docker](https://docs.docker.com/get-docker/)。在 Apple Silicon (M1/M2/M3) 上，还需要 [Docker Buildx](https://docs.docker.com/build/install-buildx/) 才能交叉编译为 `linux/amd64`。
    </Note>1. 安装[LangGraph CLI](/langsmith/cli)：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       uv tool install langgraph-cli
       ```
    2. 将 LangSmith API 密钥添加到项目根目录中的 `.env` 文件中：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       LANGSMITH_API_KEY=lsv2_...
       ```
    3. 从项目目录运行部署命令：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       langgraph deploy
       ```
       这将创建一个以您的项目目录命名的无服务器部署。使用 `--name` 为专用部署指定不同的名称或 `--deployment-type dedicated`：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       langgraph deploy --name my-agent --deployment-type dedicated
       ```
       <Note>
         在 2026 年 10 月 1 日之前仍采用之前定价的组织可使用 `--deployment-type prod` 或 `--deployment-type dev`。详情请参见[⟦T31⟧](/langsmith/cli#deploy)和[Manage billing](/langsmith/billing#langsmith-deployment-billing)。
       </Note>
       命令完成后，部署将排队等待配置。环境变量可以在部署创建后通过[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)管理，也可以在[⟦T32⟧ field of your ⟦T33⟧](/langsmith/cli#configuration-file)中配置。
  </Tab>
</Tabs>

## 创建新修订版

当[creating a new deployment](#create-new-deployment)时，默认创建新修订版。您可以创建后续修订来部署新的代码更改。

<Tabs>
  <Tab title="LangSmith UI">
    从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)开始，在左侧导航面板中选择**部署**。选择要为其创建新修订的现有部署。1. 在 **部署** 视图中，在右上角选择 **+ 新修订**。
    2. 在 **新修订** 模式中，填写必填字段。
       1. 指定[API config file](/langsmith/cli#configuration-file)的完整路径，包括文件名。例如，如果文件 `langgraph.json` 位于存储库的根目录中，则指定 `langgraph.json`。
       2. 确定部署是否应**可通过 Studio 共享**。
          * 如果未选中，则只能使用 [workspace](/langsmith/administration-overview#workspaces) 的有效 LangSmith API 密钥来访问部署。
          * 如果选中，任何 LangSmith 用户都可以通过 [Studio](/langsmith/studio) 访问部署。将提供用于部署的 Studio 的直接 URL，以便与其他 LangSmith 用户共享。
       3. 指定**环境变量**和机密。现有的秘密和环境变量已预先填充。要为修订版配置其他变量，请参阅[Environment Variables reference](/langsmith/env-var-cloud)。
          1. 添加新的机密或环境变量。
          2. 删除现有的机密或环境变量。
          3. 更新现有机密或环境变量的值。3. 选择**提交**。几秒钟后，**新修订版**模式将关闭，新修订版将排队等待部署。
  </Tab>

  <Tab title="LangGraph CLI">
    从项目目录重新运行 `langgraph deploy`。该命令按名称查找现有部署，并使用最新的代码更改创建新的修订版：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy
    ```

    要通过 ID 而不是名称定位特定部署，请使用 `--deployment-id`：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy --deployment-id <DEPLOYMENT_ID>
    ```

    使用 `langgraph deploy list` 查看所有部署并查找其 ID：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy list
    ```

    <Note>
      `langgraph deploy` 只能更新最初由 `langgraph deploy` 创建的部署。通过 LangSmith UI 或 GitHub 集成创建的部署无法使用此命令更新。
    </Note>
  </Tab>
</Tabs>

## 查看构建和服务器日志

每个版本都提供构建和服务器日志。

### 将服务器日志转发到 Datadog

LangSmith Cloud 可以将代理服务器日志转发到 Datadog。要打开日志转发，请在部署上设置这两个环境变量或密钥：

* **`DD_API_KEY`**：您的[Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/)。日志转发需要它。
* **`DD_LOGS_ENABLED=true`**：将代理服务器日志转发到Datadog。要将日志与跟踪关联起来，还需设置 `DD_LOGS_INJECTION=true`。有关 Datadog 变量的完整列表（`DD_SITE`、`DD_ENV`、`DD_SERVICE` 等），请参阅[Supported Datadog environment variables](/langsmith/env-var#dd_api_key)。

<Tabs>
  <Tab title="LangSmith UI">
    从 **Deployments** 视图开始：

    1. 从 **修订版** 表中选择所需的修订版。面板从右侧滑开，默认情况下会选择 **Build** 选项卡，该选项卡显示修订版本的构建日志。
    2. 在面板中，选择 **服务器** 选项卡以查看修订的服务器日志。服务器日志仅在部署修订版后可用。
    3. 在 **服务器** 选项卡中，根据需要调整日期/时间范围选择器。默认情况下，日期/时间范围选择器设置为 **过去 7 天**。
  </Tab>

  <Tab title="LangGraph CLI">
    使用 `langgraph deploy logs` 获取部署日志。

    查看服务器（运行时）日志：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy logs
    ```

    查看构建日志：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy logs --type build
    ```

    在日志到达时连续跟踪日志：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy logs --follow
    ```

    按时间范围、日志级别或搜索字符串过滤日志：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy logs --start-time 2026-03-01T00:00:00Z --level ERROR
    ```

    如果您有多个部署，请按名称或 ID 指定目标：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy logs --name my-agent
    langgraph deploy logs --deployment-id <DEPLOYMENT_ID>
    ```

    有关所有可用选项，请参阅[⟦T48⟧ CLI reference](/langsmith/cli#deploy-logs)。
  </Tab>
</Tabs>

## 查看部署指标部署上线后，您可以从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud) 监控其性能。

从 LangSmith UI 开始：

1. 在左侧导航面板中，选择“**部署**”。
2. 选择要监控的现有部署。
3. 选择 **监控** 选项卡以查看部署指标。参考[all available metrics](/langsmith/control-plane#monitoring)列表。
4. 在 **监控** 选项卡中，根据需要使用日期/时间范围选择器。默认情况下，日期/时间范围选择器设置为 **过去 15 分钟**。

## 中断修改

中断修订将停止修订的部署。

<Warning>
  **未定义的行为**
  中断的修订具有未定义的行为。仅当您需要部署新修订版并且您已经有一个修订版“卡住”在进行中时，这才有用。将来，此功能可能会被删除。
</Warning>

从 **Deployments** 视图开始：

1. 从 **修订版** 表中选择所需修订版行右侧的菜单图标（三个点）。
2. 从菜单中选择**中断**。
3. 将出现一个模态框。查看确认消息。选择**中断修订**。

## 删除部署

<Tabs>
  <Tab title="LangSmith UI">
    从[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deploy-to-cloud)开始：1. 在左侧导航面板中，选择“**部署**”，其中包含现有部署的列表。
    2. 选择所需部署所在行右侧的菜单图标（三个点），然后选择 **删除**。
    3. 将出现 **确认** 模式。选择**删除**。
  </Tab>

  <Tab title="LangGraph CLI">
    使用 `langgraph deploy list` 查找要删除的部署的 ID：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy list
    ```

    然后通过ID删除：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy delete <DEPLOYMENT_ID>
    ```

    要跳过确认提示，请使用 `--force`：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy delete --force <DEPLOYMENT_ID>
    ```
  </Tab>
</Tabs>

## 部署设置

从 **Deployments** 视图开始：

1. 在右上角，选择齿轮图标（**部署设置**）。
2. 将`Git Branch`更新到所需的分支。
3. 选中/取消选中复选框以**推送到分支时自动更新部署**。
   1. 分支创建/删除和标签创建/删除事件不会触发更新。只有推送到现有分支才会触发更新。
   2. 快速连续推送到分支将使后续更新排队。构建完成后，最近的提交将开始构建，而其他排队的构建将被跳过。

## 添加或删除 GitHub 存储库安装并授权LangChain的`hosted-langserve` GitHub应用程序后，可以修改应用程序的存储库访问权限以添加新存储库或删除现有存储库。如果创建了新存储库，则可能需要显式添加它。

1. 从 GitHub 配置文件中，导航至 **设置** > **应用程序** > `hosted-langserve` > 单击 **配置**。
2. 在**存储库访问**下，选择**所有存储库**或**仅选择存储库**。如果选择**仅选择存储库**，则必须显式添加新存储库。
3. 单击**保存**。
4. 创建新部署时，下拉菜单中的 GitHub 存储库列表将更新以反映存储库访问更改。

## 将 IP 地址列入白名单

2025 年 1 月 6 日之后创建的 LangSmith 部署中的所有流量都将通过 NAT 网关。
此 NAT 网关将有多个静态 IP 地址，具体取决于您部署的区域。请参阅下表，了解要列入白名单的 IP 地址列表：|基仕伯美国 | GCP 欧盟 |基仕伯亚太区 | AWS 美国 |
| -------------- | -------------- | -------------- | ------------- |
| 35.197.29.146 | 34.90.213.236 | 34.40.236.16 | 3.13.80.97 |
| 34.145.102.123 | 34.145.102.123 34.13.244.114 | 34.13.244.114 34.40.140.88 | 3.146.216.198 |
| 34.169.45.153 | 34.169.45.153 34.32.180.189 | 34.32.180.189 34.151.88.209 | 16.59.72.244 |
| 34.82.222.17 | 34.34.69.108 | 35.189.51.120 |               |
| 35.227.171.135 | 35.227.171.135 34.32.145.240 | 34.32.145.240 34.40.172.39 |               |
| 34.169.88.30 | 34.90.157.44 | 35.189.56.87 |               |
| 34.19.93.202 | 34.141.242.180 | 34.141.242.180 35.189.17.201 |               |
| 34.19.34.50 | 34.32.141.108 | 35.244.99.196 |               |
| 34.59.244.194 | 34.59.244.194 34.12.178.175 | 34.40.149.177 | 34.40.149.177               |
| 34.9.99.224 | 34.91.192.230 | 34.40.144.104 | 34.40.144.104               |
| 34.68.27.146 | 34.32.209.237 | 34.151.130.182 |               |
| 34.41.178.137 | 34.41.178.137 34.178.128.69 | 34.116.82.199 |               |
| 34.123.151.210 |                |                |               |
| 34.135.61.140 |                |                |               |
| 34.121.166.52 |                |                |               || 34.31.121.70 |                |                |               |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>