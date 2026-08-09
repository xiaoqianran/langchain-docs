<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure environment variables in the Helm chart | https://docs.langchain.com/langsmith/self-host-environment-variables -->

# 在Helm图表中配置环境变量

如何使用 commonEnv 和 extraEnv 在 Helm 图表中跨 LangSmith 服务配置环境变量。

LangSmith Helm Chart 提供了两种将环境变量注入到服务中的方法：`commonEnv` 和 `extraEnv`。了解它们之间的差异有助于您正确配置部署并避免运行时错误。

## 通用环境

`commonEnv` 是 `values.yaml` 中的顶级字段，适用于**所有部署和有状态集，但`playground` 和 `aceBackend` 服务**除外，这些服务是沙盒的，不接收 `commonEnv` 值。

当变量必须同时可供大多数服务使用时，请使用`commonEnv`，例如自定义 CA 证书路径、代理设置或影响整个平台的功能标志。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonEnv:
  - name: MY_ENV_VAR
    value: "my-value"
```

### 接收 commonEnv 的服务

以下服务获得`commonEnv`：

* `backend`
* `platformBackend`
* `queue`
* `ingestQueue`
* `frontend`
* `hostBackend`

### 不接收 commonEnv 的服务

以下服务是沙盒的，**不**接收 `commonEnv`：

* `playground`
* `aceBackend`

要在这些服务上设置环境变量，请直接使用它们的`extraEnv`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
playground:
  deployment:
    extraEnv:
      - name: MY_ENV_VAR
        value: "my-value"

aceBackend:
  deployment:
    extraEnv:
      - name: MY_ENV_VAR
        value: "my-value"
```

## 额外环境`extraEnv` 是每个服务的字段，仅向特定服务添加环境变量。每个支持 `extraEnv` 的服务都将其公开在 `<service>.deployment.extraEnv` 下。

当变量仅适用于一项服务时，或者需要在 `playground` 或 `aceBackend` 上设置`commonEnv` 达不到的变量时，请使用`extraEnv`。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
backend:
  deployment:
    extraEnv:
      - name: MY_BACKEND_VAR
        value: "backend-value"
```

## 变量名不能重复

该图表使用 `detectDuplicates` 帮助程序来验证每个服务的环境变量名称。如果相同的变量名称在服务的组合变量列表中出现多次（包括从 `commonEnv`、`extraEnv` 和图表管理变量添加的变量），则 Helm 在模板渲染期间会失败，并显示如下错误：

```
Duplicate keys detected: [MY_ENV_VAR]
```

要解决此问题，请从 `commonEnv` 或服务的 `extraEnv` 中删除重复项，以便每个变量名称在每个服务中只出现一次。

<Warning>
  图表管理的变量（由 Helm 图表内部设置）计入重复检测。如果图表已管理该变量，请勿将变量名称添加到 `commonEnv` 或 `extraEnv`。查看 [chart values file](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml) 查看图表默认设置的变量。
</Warning>

## 示例：在大多数服务上设置一个变量，但在一个服务上覆盖它要对大多数服务使用通用值，同时为特定服务覆盖它，请在 `commonEnv` 中设置它，并将覆盖添加到该服务的 `extraEnv`。由于 `playground` 和 `aceBackend` 不接收 `commonEnv`，因此您必须始终通过这些服务自己的 `extraEnv` 设置变量。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Apply to all services that receive commonEnv
commonEnv:
  - name: SSRF_ALLOW_K8S_INTERNAL
    value: "true"

# playground does not receive commonEnv — set it directly
playground:
  deployment:
    extraEnv:
      - name: SSRF_ALLOW_K8S_INTERNAL
        value: "true"
      - name: SSRF_ALLOW_PRIVATE_IPS_PLAYGROUND
        value: "true"
```

## 常用功能标志

### 减少批量运行持久性日志记录

默认情况下，LangSmith 会为通过基于 Go 的摄取队列保留的每批运行记录一条成功消息。在处理大量跟踪的部署中，这可能会产生过多的日志噪音。

`FF_PERSIST_BATCHED_RUNS_SUCCESS_LOGGING`默认为`true`，当`ingestQueue.enabled`为`true`（默认）时，通过`commonEnv`注入到所有服务中。要禁用这些成功日志消息，请在 `commonEnv` 中覆盖它：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonEnv:
  - name: FF_PERSIST_BATCHED_RUNS_SUCCESS_LOGGING
    value: "false"
```

<Note>
  将此标志设置为 `false` 仅抑制每批次成功消息。错误仍然被记录。
</Note>

## 相关页面

* [Configure LangSmith for scale](/langsmith/self-host-scale)
* [Playground environment settings](/langsmith/self-host-playground-environment-settings)
* [LangSmith Helm chart values.yaml](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-environment-variables.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>