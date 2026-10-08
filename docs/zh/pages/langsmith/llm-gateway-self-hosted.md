<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Enable the LLM Gateway | https://docs.langchain.com/langsmith/llm-gateway-self-hosted -->

# 启用LLM网关

使用 Helm 图表在自托管 LangSmith 安装上启用代理网关服务，然后进行第一个网关调用。

<Note>
  LLM 网关位于[beta](/langsmith/release-stages)。
</Note>

LLM 网关（`agent-gateway` 服务）代理从代理和编码代理到上游 LLM 提供商的模型调用。网关在细粒度范围内应用策略，以实现可靠性、支出限制以及 PII 和机密的编辑。您还可以通过网关路由 LangSmith 部署的模型调用。

本指南使用 Helm 图表在自托管 Kubernetes 安装上启用它。对于 SaaS 等效项，请参阅 [LLM Gateway](/langsmith/llm-gateway)。

<Note>
  启用网关需要 Helm Chart 0.17.1 或更高版本，该版本附带 LangSmith 版本 0.17.30。
</Note>

<Info>
  [Spend Monitoring dashboard](/langsmith/llm-gateway-monitoring) 适用于 SmithDB，但不适用于 ClickHouse。
</Info>

## 启用网关

<Steps>
  <Step title="Add Helm values" icon="settings">
    <Note>
      `agent-gateway`服务需要访问Postgres和Redis，以及对其他LangSmith Pod的网络访问权限，类似于`backend`和`platform-backend`。您可能需要配置网络策略、Kubernetes 服务帐户和 pod 注释来启用此访问。
    </Note>

    将这些值添加到您的 Helm 值文件中：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agentGateway:
      enabled: true

      # Defaults shown for reference—override only if you have a reason.
      # containerPort: 8083
      # deployment:
      #   replicas: 1
      #   resources:
      #     limits:   { cpu: 2, memory: 2Gi }
      #     requests: { cpu: 1, memory: 1Gi }
      # autoscaling:
      #   enabled: true
      #   minReplicas: 1
      #   maxReplicas: 5
      #   targetCPUUtilizationPercentage: 50
      #   targetMemoryUtilizationPercentage: 70
      # service:
      #   type: ClusterIP
      #   port: 8083
    ```默认情况下启用自动缩放。使用默认资源，每个副本在 N2 实例或类似测试中处理约 100 个并发流，提示从约 40 到约 7,500 个令牌。
  </Step>

  <Step title="Apply and verify" icon="rocket">
    应用图表版本 0.17.1 或更高版本的图表。请参阅 [Upgrade an installation](/langsmith/self-host-upgrades) 了解更多说明。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm search repo langchain/langsmith --versions

    helm upgrade --install langsmith langchain/langsmith \
      --version <chart-version> \
      -f values.yaml --timeout=20m
    ```

    验证部署是否正常。该部署名为 `<release-fullname>-agent-gateway`，对于名为 `langsmith` 的发行版来说，它是 `langsmith-agent-gateway`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get deploy langsmith-agent-gateway
    kubectl rollout status deploy/langsmith-agent-gateway
    ```
  </Step>
</Steps>

## 启用 Presidio PII 检测（可选）

[Presidio Analyzer](https://microsoft.github.io/presidio/) 是 Microsoft 维护的 NER 服务，网关可以在提示到达上游提供商之前调用该服务来检测提示中的 PII。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
presidioAnalyzer:
  enabled: true
```

启用后，图表会将 `PRESIDIO_ANALYZER_URL` 注入网关 Pod，以便它发现集群内的分析器。无需进一步的应用程序配置。

## 对外暴露网关

网关使用与 LangSmith UI 和 API 相同的 Ingress。如果您的 Helm 值中已设置 `ingress.enabled=true`，则一旦您设置 `agentGateway.enabled=true`，网关就可以在 `https://<your-hostname>/gateway/` 处访问。不需要单独的 Ingress、LoadBalancer 或 DNS 记录。如果设置`config.basePath`，则路由将移动到`https://<your-hostname>/<basePath>/gateway/`，并且此页面上的每个网关 URL 都需要相同的前缀。

从任何可以到达您的 Ingress 的主机进行检查：```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -o /dev/null -w '%{http_code}\n' https://<your-hostname>/gateway/health
# Expected: 200
```

该图表没有为`langsmith-agent-gateway`创建专用的Ingress，Service默认为`ClusterIP`。图表的服务块（`agentGateway.service.type`、`loadBalancerIP`、`loadBalancerSourceRanges`）支持直接公开端口 `8083`（通过单独的 Ingress、`service.type: LoadBalancer` 或 `hostNetwork`），但这不是预期路径。使用前端 `/gateway/` 路线，除非您有特定原因不这样做。

## 回滚

禁用网关会删除部署和服务并禁用 UI 中的网关功能。路由到网关的模型调用失败。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
agentGateway:
  enabled: false
```

## 拨打你的第一个电话

这镜像了 [SaaS quickstart](/langsmith/llm-gateway-quickstart)，并将基本 URL 调整为自托管。在继续之前完成上述步骤（部署网关、启动 Ingress）。

<Info>
  组织管理员必须将提供程序 API 密钥添加到您想要访问的模型的工作区或组织模型提供程序机密，然后向用户授予具有 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations) 和 [distribute a workspace-scoped API key](/langsmith/llm-gateway-admin-setup#4-distribute-api-keys-to-users) 的角色。参见[Admin setup](/langsmith/llm-gateway-admin-setup)。
</Info>

<Steps>
  <Step title="Set environment variables" icon="terminal">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Replace with your Ingress hostname.
    export LANGSMITH_GATEWAY_BASE_URL="https://<your-hostname>/gateway/v1"
    export LANGSMITH_API_KEY="lsv2_..."
    ```

    对于 LangChain 和 Deep Agents，便利变量的工作方式与 SaaS 文档描述的相同：如果您使用 OpenAI 模型，它们会将 `/openai/v1` 附加到您设置的任何内容。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_GATEWAY="https://<your-hostname>/gateway"
    export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
    ```
  </Step><Step title="Make a call" icon="send">
    任一标头均有效：`Authorization: Bearer <key>` 或`X-Api-Key: <key>`。下面的示例使用 `Authorization` 标头。您还可以通过 LLM Gateway 主页模拟器测试呼叫。

    <CodeGroup>
      ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      curl "$LANGSMITH_GATEWAY_BASE_URL/chat/completions" \
          -H "Authorization: Bearer $LANGSMITH_API_KEY" \
          -H "Content-Type: application/json" \
          -d '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
      ```

      ```python Python (OpenAI SDK) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os

      from openai import OpenAI

      client = OpenAI(
          base_url=os.environ["LANGSMITH_GATEWAY_BASE_URL"],
          api_key=os.environ["LANGSMITH_API_KEY"],
      )
      response = client.chat.completions.create(
          model="openai/gpt-4o-mini",
          messages=[{"role": "user", "content": "ping"}],
      )
      print(response.choices[0].message.content)
      ```

      ```typescript TypeScript (OpenAI SDK) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import OpenAI from "openai";

      const client = new OpenAI({
        baseURL: process.env.LANGSMITH_GATEWAY_BASE_URL,
        apiKey: process.env.LANGSMITH_API_KEY,
      });
      const response = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "ping" }],
      });
      console.log(response.choices[0].message.content);
      ```

      ```python Python (LangChain) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os

      from langchain.agents import create_agent
      from langchain.chat_models import init_chat_model

      model = init_chat_model(
          model="openai/gpt-4o-mini",
          model_provider="openai",
          base_url=os.environ["LANGSMITH_GATEWAY_BASE_URL"],
          api_key=os.environ["LANGSMITH_API_KEY"],
      )
      agent = create_agent(model=model, system_prompt="You are a helpful assistant.")
      result = agent.invoke({"messages": [{"role": "user", "content": "ping"}]})
      print(result["messages"][-1].content)
      ```
    </CodeGroup>

    `200` 确认网关、API 密钥和提供商机密均已正确连接。
  </Step>

  <Step title="View the trace" icon="activity">
    在 LangSmith UI 中，转到与 API 密钥绑定的工作区中名为 `gateway` 的跟踪项目。如果启用了跟踪内容，则通过网关路由的每个调用都会显示输入、输出、延迟和令牌使用情况。
  </Step>

  <Step title="Set a spend policy (optional)" icon="shield">
    转到 **LLM Gateway** 并选择 **Cost Controls** 以限制每个工作区或每个 API 密钥的支出。一旦请求超出上限，网关就会返回一个`402`，其中包含一条消息，其中指定了阻止该请求的策略：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"type": "error", "error": {"message": "request blocked by gateway policies: R&D Spend Cap"}}
    ```

    有关完整指南，请参阅[Spend policies](/langsmith/llm-gateway-spend-policies)。
  </Step>
</Steps>

## 故障排除

* **升级后立即网关 Pod `CrashLoopBackOff`**：检查`kubectl logs deploy/langsmith-agent-gateway`。
* **模型调用失败，连接被拒绝或超时到 `agent-gateway`**：验证网关 Pod 为 `Running`，并且集群中没有 NetworkPolicy 阻止 LangSmith 命名空间中 Pod 之间的端口 `8083`。

## 安全说明* 网关对提供商 LLM 端点进行出站 HTTP 调用。您配置的任何自定义提供商 URL 都必须根据您的出口策略进行验证；该服务使用 LangSmith 的 SSRF 保护库来自定义和配置提供商 URL。内置提供程序解析为固定的、提供程序拥有的主机名，而不是用户控制的 URL 路径。
* 外部客户端应通过前端的 `/gateway/` 路径到达网关，以便请求继承与 LangSmith API 的其余部分相同的 TLS 终止、身份验证和速率限制。直接在端口 `8083` 创建第二个 Ingress 或 LoadBalancer 会绕过这些控制。
* `AGENT_GATEWAY_URL` 源自 Helm 版本全名以及图表的 `agentGateway.name`、`agentGateway.service.port`、`namespace` 和 `clusterDomain` 值。覆盖现有安装中的任何一个都需要滚动重新启动读取该值的每个 Pod。

## 后续步骤

* [Quickstart](/langsmith/llm-gateway-quickstart)：相当于上述步骤的 SaaS。
* [Admin setup](/langsmith/llm-gateway-admin-setup)：授予工作区用户网关访问权限并配置提供者机密。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：组织、工作区、API 密钥或用户级​​别的支出上限。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>