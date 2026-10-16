<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure model providers for Engine on self-hosted | https://docs.langchain.com/langsmith/engine-self-hosted-model-providers -->

# 在自托管上为 Engine 配置模型提供程序

选择模型提供商 LangSmith 引擎在自托管 LangSmith 实例上使用，使用凭据或云身份进行身份验证，并将模型流量保留在专用网络上。

<Info>
  在您自己的模型提供程序上运行引擎需要 LangSmith Helm Chart `0.17.0` 或更高版本。早期的图表版本仅在 [LangSmith Intelligence](/langsmith/engine-self-hosted#langsmith-intelligence) 上运行引擎。
</Info>

在自托管 LangSmith 上，组织管理员选择 [LangSmith Engine](/langsmith/engine) 运行其模型调用的位置：在 LangSmith Intelligence (LSI) 上、在您自己的模型提供商上或两者上。在您自己的提供商上运行引擎会根据您与这些提供商的协议保留提示和响应。本页介绍如何选择提供商、向他们进行身份验证以及通过专用网络连接到他们或 LSI。有关两个选项的比较，请参阅[Choose how Engine runs its models](/langsmith/engine-self-hosted#choose-how-engine-runs-its-models)。首先完成[Install Engine](/langsmith/engine-self-hosted#install-engine)。

## 使用您自己的模型提供者

引擎直接从您的集群调用您的提供程序。根据您与提供商的协议，提示和响应仅发送给您的提供商。 LangChain 没有收到。Engine 的沙盒使用情况包含在 Engine 的 LSU 计费中。沙箱引擎用于诊断问题、生成修复程序和编写评估程序不会产生额外的沙箱产品费用。

引擎支持Anthropic、OpenAI、Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry。它使用您选择的提供商的混合模型，因此为了获得最佳结果，请为您有权访问的每个提供商添加凭据。

在您的提供商帐户中允许访问 Anthropic 的 Claude 模型和 OpenAI 的 GPT 模型（您的提供商在其中提供这些模型）。在 Azure 上，使用 Azure AI Foundry 资源。要确认 Engine 可以访问它使用的模型，请运行 [**Test connection**](#test-a-provider)。

## 选择模型提供商

在 **设置 > 引擎 > 模型提供程序**下，组织管理员选择 LangSmith Intelligence、一个或多个您自己的提供程序，或两者都选择。凭据将保存为组织机密并适用于组织中的每个工作区。

仅当您安装的 `engine.intelligenceBaseUrl` 服务于引擎模型时，LangSmith 智能才会出现。

当 LangSmith 情报可用并被选择时，它的优先级高于您选择的提供商。不选择它以保留对您自己的提供商的推断。引擎从您启用的提供商中选择模型。在您的提供商帐户中启用对 Claude 5.5 级模型或 GPT 5.6 级模型的访问，具体取决于每个提供商提供的模型。模型要求遵循 `images.engineInsightsAgentImage.tag` 中的 Engine 镜像标签，而不是 Helm 图表版本。运行 [**Test connection**](#test-a-provider) 来识别所需的型号并确认对已安装的引擎映像的访问。

要使用您自己的提供商：

<Steps>
  <Step title="Add credentials">
    单击提供商旁边的 **添加凭据** 并输入：

    <Tabs>
      <Tab title="Anthropic">
        Anthropic API 密钥。
      </Tab>

      <Tab title="Amazon Bedrock">
        AWS 访问密钥 ID 和秘密访问密钥，以及可选的会话令牌或 Bedrock API 密钥（不记名令牌）。 （可选）AWS 区域。

        引擎使用基岩地幔 API。允许访问所选 AWS 账户和区域中所需的模型。授予调用身份 Mantle 推理和模型订阅权限。请参阅[AmazonBedrockMantleInferenceAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonBedrockMantleInferenceAccess.html)了解所需的操作。

        如果没有保存区域，引擎将使用`us-east-1`，包括工作负载标识。它不继承 EKS 集群的区域。

        要改用 Engine 的 pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
      </Tab><Tab title="Google Vertex AI">
        JSON 格式的服务帐户密钥。引擎使用JSON的`project_id`作为推理项目并调用`global`位置。

        通过该项目中的[Model Garden](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/use-partner-models)启用所需的模型。在同一项目中授予服务帐户`roles/aiplatform.user`。

        要改用 Engine pod 的云身份，请参阅 [Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
      </Tab>

      <Tab title="Azure AI Foundry">
        确认您的资源区域具有已安装的引擎映像所需模型的访问权限和配额。配置 Azure：

        1. 在同一 Azure AI Foundry 资源中创建所需的模型部署。部署名称必须与模型名称（模型 ID）完全匹配。 Engine 使用 Claude 作为其主要模型，并使用 GPT 作为后备模型。这两个模型系列都不支持自定义部署别名。遵循[Claude deployment instructions](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)并检查[Azure OpenAI model availability](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)。创建第一个 Claude 部署时接受 Azure 市场条款。
        2. 输入 API 密钥和资源名称，而不是其完整 URL。要使用 Engine pod 的云身份而不是 API 密钥，请参阅[Use cloud identity for your model providers](#use-cloud-identity-for-your-model-providers)。
        3. 运行 [**Test connection**](#test-a-provider) 并确认 Claude 和 GPT 请求均成功，包括在选择其他提供商时。保存后，[start an Engine analysis](/langsmith/engine-self-hosted#verify-the-installation)验证完整设置。
      </Tab>

      <Tab title="OpenAI">
        OpenAI API 密钥，以及可选的 OpenAI 组织 ID。
      </Tab>
    </Tabs>

    具有完整凭据的提供程序显示为已配置。要稍后更改它们，请单击提供程序旁边的钥匙图标。
  </Step>

  <Step title="Test the provider">
    单击**测试连接**。引擎使用保存的凭据或配置的云身份向它在该提供商上使用的每个模型发送一个小请求。它显示每个请求是否成功，如果没有，则说明原因。
  </Step>

  <Step title="Select providers and save">
    选择引擎可能使用的提供商，然后保存。
  </Step>
</Steps>

如果保存后引擎运行失败：* **未选择任何提供程序：** 在选择并保存至少一个提供程序之前，引擎不会开始运行。
* **拒绝的凭据：** **测试连接** 报告哪个提供商拒绝了它们。更新凭据并再次测试。
* **模型不可用：** 在您的提供商帐户中启用模型，然后再次测试。

## 对您的模型提供商使用云身份

Amazon Bedrock、Google Vertex AI 和 Azure AI Foundry 可以使用 Engine pod 的云身份（而不是保存在 LangSmith 中的凭证）进行身份验证，而不是保存凭证。在 `engine.workloadIdentityProviders` 中列出这些提供商。为共享引擎和 Insights 部署的 API 服务器和队列配置身份：

<Tabs>
  <Tab title="Amazon EKS">
    为服务账户 (IRSA) 配置 IAM 角色。信任两个引擎工作负载的命名空间和服务帐户，并授予角色访问引擎使用的 Bedrock 模型的权限。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - bedrock

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
      queue:
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<engine-model-access-role>"
    ```
  </Tab>

  <Tab title="Google GKE">
    在集群和运行引擎的节点池上为 GKE 启用工作负载联合身份验证。在 Google 服务帐户上授予每个 Engine Kubernetes 服务帐户 `roles/iam.workloadIdentityUser`。将每个成员绑定为`serviceAccount:<cluster-project-id>.svc.id.goog[<namespace>/<kubernetes-service-account>]`。在托管模型的项目中授予 Google 服务帐户 Vertex AI 推理权限，例如 `roles/aiplatform.user`。在该项目中启用所需的模型。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - vertex

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
        deployment:
          extraEnv:
            - name: GOOGLE_CLOUD_PROJECT
              value: "<vertex-project-id>"
      queue:
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<service-account>@<project-id>.iam.gserviceaccount.com"
        deployment:
          extraEnv:
            - name: GOOGLE_CLOUD_PROJECT
              value: "<vertex-project-id>"
    ```

    引擎使用应用程序默认凭据 (ADC) 来解析身份和项目。将两个工作负载上的 `GOOGLE_CLOUD_PROJECT` 设置为预期的 Vertex AI 项目。引擎当前使用 `global` Vertex AI 位置，因此所需的模型必须在那里可用。
  </Tab>

  <Tab title="Azure AKS">
    启用 AKS OIDC 颁发者和 Microsoft Entra 工作负载 ID。为托管身份上的每个引擎 Kubernetes 服务帐户创建联合身份凭证。为每个集群使用集群的 OIDC 发行者、受众 `api://AzureADTokenExchange` 和主题 `system:serviceaccount:<namespace>:<kubernetes-service-account>`。

    向身份授予认知服务用户角色，范围仅限于托管引擎模型的 Azure AI Foundry 资源。仅 Azure OpenAI 角色无法建立对 Claude 模型的访问权限。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    engine:
      workloadIdentityProviders:
        - azure

    engineInsightsAgent:
      apiServer:
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<managed-identity-client-id>"
        deployment:
          labels:
            azure.workload.identity/use: "true"
      queue:
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<managed-identity-client-id>"
        deployment:
          labels:
            azure.workload.identity/use: "true"
    ```

    两个工作负载都需要服务帐户注释和 Pod 标签。将 Foundry 资源名称保存在**设置 > 引擎 > 模型提供程序**下。
  </Tab>
</Tabs><Warning>
  `engine.workloadIdentityProviders` 中列出的提供程序视为在未保存凭据的情况下进行配置，因此任何组织管理员都可以选择它。将身份范围限定为引擎使用的模型。
</Warning>

保存的凭据优先于云身份。切换提供商时，请在删除其保存的凭据之前应用云身份配置。然后，在 **设置 > 引擎 > 模型提供程序** 下仅删除该提供程序保存的 API 密钥或服务帐户 JSON。对于 Bedrock，还要删除所有已保存的访问密钥、秘密访问密钥和会话令牌。保留 Azure AI Foundry 资源名称和任何 Bedrock 区域设置，然后再次 [test the provider](#test-a-provider)。

## 私密连接

引擎在公共出口处工作。要使其流量保持在专用网络上，请使用 AWS PrivateLink 连接到 LangSmith Intelligence，或通过云的专用终端节点连接到您自己的模型提供商。

### 连接 AWS PrivateLink

LangSmith 智能网关 `beacon.aws.langchain.com` 将请求路由到 LangChain 的 AWS 环境中的 Amazon Bedrock。

在配置 PrivateLink 之前，请完成[Install Engine](/langsmith/engine-self-hosted#install-engine)，包括其 Helm 和 egress 配置。[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/) 将引擎流量从 VPC 路由到 LSI，而不将该流量暴露到公共互联网。 LSI端点服务托管在`us-east-2`，AWS支持其他区域的VPC访问。

在开始之前，请收集您的 AWS 账户 ID、VPC ID、私有子网 ID 以及接口终端节点的安全组。配置该端点安全组，以允许端口 443 上的入站 TCP 流量仅来自附加到运行引擎的节点或工作负载的安全组，或者来自包含它们的最小私有 CIDR。不允许`0.0.0.0/0`。

要将您的 VPC 连接到 LSI：

<Steps>
  <Step title="Request access">
    请联系您的客户代表或 [sales@langchain.dev](mailto:sales@langchain.dev) 并提供您的 AWS 账户 ID。 LangChain 将您的帐户添加到端点服务的允许主体列表中。
  </Step>

  <Step title="Create the interface VPC endpoint">
    为包含您的 VPC 的区域配置 AWS 提供商。将 `service_region` 设置为 `us-east-2`，包括当您的 VPC 位于其他区域时。每个可用区选择一个私有子网。

    <Note>
      `service_region` 参数需要 HashiCorp AWS 提供商 `5.82.0` 或更高版本。
    </Note>

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_vpc_endpoint" "langsmith_intelligence" {
      vpc_id              = var.vpc_id
      service_name        = "com.amazonaws.vpce.us-east-2.vpce-svc-054f37092752bff6b"
      service_region      = "us-east-2"
      vpc_endpoint_type   = "Interface"
      subnet_ids          = var.private_subnet_ids
      security_group_ids  = [var.security_group_id]
      private_dns_enabled = false
    }
    ```
  </Step><Step title="Wait for LangChain to accept the connection">
    LangChain接受连接后，端点状态从`pendingAcceptance`更改为`available`。在测试连接之前，请等待几分钟让更改传播。
  </Step>

  <Step title="Route the LSI hostname to the endpoint">
    为您的 VPC 启用 DNS 解析和 DNS 主机名。然后，创建 Route 53 私有托管区域和别名记录，以便 `beacon.aws.langchain.com` 解析为 VPC 内的 VPC 终端节点。保持此主机名不变，以便 TLS 证书验证成功。当端点不可用时，私有托管区域还可以防止回退到公共 DNS。

    ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    resource "aws_route53_zone" "langsmith_intelligence" {
      name = "beacon.aws.langchain.com"

      vpc {
        vpc_id = var.vpc_id
      }
    }

    resource "aws_route53_record" "langsmith_intelligence" {
      zone_id = aws_route53_zone.langsmith_intelligence.zone_id
      name    = "beacon.aws.langchain.com"
      type    = "A"

      alias {
        name                   = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].dns_name
        zone_id                = aws_vpc_endpoint.langsmith_intelligence.dns_entry[0].hosted_zone_id
        evaluate_target_health = true
      }
    }
    ```

    如果工作负载使用公司 DNS 解析器而不是 Amazon 提供的解析器，请配置条件转发到 Route 53 解析器，或为指向终端节点 DNS 名称的 `beacon.aws.langchain.com` 创建等效的私有 DNS 覆盖。
  </Step>

  <Step title="Verify private connectivity">
    从运行引擎的节点或容器中，解析网关主机名：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    getent ahostsv4 beacon.aws.langchain.com
    ```

    确认结果包含分配给端点网络接口的专用 IP 地址。然后开始分析并确认其成功完成。如果分析未完成，请检查引擎安装和出口配置。
  </Step>
</Steps>### 私下连接到您的提供商

引擎从 `standalone-insights` pod 调用每个提供商的标准 API 主机名。为了使该流量远离公共互联网，请设置云与提供商的专用连接，以便相同的主机名解析为网络内的专用地址：

| **提供商** | **主机名引擎调用** | **私人连接** |
| - | - | - |
|亚马逊基岩 | `bedrock-mantle.<region>.api.aws` | `com.amazonaws.<region>.bedrock-mantle` 的接口 VPC 终端节点，启用私有 DNS 或主机名的 Route 53 私有托管区域 |
|谷歌顶点人工智能 |全球区域为`<region>-aiplatform.googleapis.com`或`aiplatform.googleapis.com` |适用于 Google API 的专用服务连接，以及`googleapis.com` 的专用 DNS |
| Azure AI 铸造厂 | `<resource>.openai.azure.com` 和 `<resource>.services.ai.azure.com` | Foundry 资源的专用端点及其专用 DNS 区域 |
| Anthropic、OpenAI | `api.anthropic.com`、`api.openai.com` |无法使用。这些提供商需要公共出口。 |

引擎不接受自定义端点 URL，因此专用连接通过 DNS 工作：标准主机名必须从 Engine Pod 解析为您的专用端点。

如果 Engine 使用 [cloud identity](#use-cloud-identity-for-your-model-providers) 进行身份验证，Pod 还需要访问云的令牌服务，例如 AWS 上 AWS STS 的接口 VPC 终端节点。通过保存的 Vertex AI 服务帐户 JSON，还允许使用 HTTPS `oauth2.googleapis.com` 进行令牌交换，以及 `aiplatform.googleapis.com` 进行推理。

向LangSmith Intelligence 报告使用情况是一个单独的连接。在 AWS 上，`https://beacon.aws.langchain.com/intelligence` 记录使用情况并支持 [AWS PrivateLink](#connect-with-aws-privatelink)，因此安装可以在 Bedrock 上运行引擎并报告使用情况，而无需公共出口。默认`https://beacon.langchain.com/intelligence`需要公共出口。

## 另请参阅

* [Engine on self-hosted](/langsmith/engine-self-hosted)：安装引擎并选择其运行模型的方式。
* [Engine security](/langsmith/engine-security#model-subprocessors)：模型子处理器控制。
* [Configure egress](/langsmith/self-host-egress)：来自自托管LangSmith的其他出站流量。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-self-hosted-model-providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>