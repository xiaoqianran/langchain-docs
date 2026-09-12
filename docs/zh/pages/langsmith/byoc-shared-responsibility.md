<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC shared responsibility model | https://docs.langchain.com/langsmith/byoc-shared-responsibility -->

# BYOC 责任共担模式

BYOC 共享责任模型定义了 LangChain 管理的内容以及您的组织在 AWS 上的 LangSmith BYOC 部署中管理的内容。在此模型下，敏感数据在正常运行期间不会传输LangChain基础设施。以下部分涵盖了跨平台和基础设施、数据和安全以及运营和支持的这一部门。

对于多租户 SaaS 等效项，请参阅 [LangSmith shared responsibility model](/langsmith/shared-responsibility-model)。控制面和数据面的技术结构参见[BYOC architecture](/langsmith/byoc-architecture)。

## 访问模型- **控制平面和数据平面分开**：LangChain运行控制平面。您拥有包含数据平面的云帐户和 VPC，并且 LangChain 通过委派访问来管理该环境内的基础设施。
- **访问是最低权限，break-glass 除外**：例行访问LangChain 保留的范围仅限于配置和操作。正常操作不需要数据访问。事件故障排除可能需要客户批准的打破玻璃访问，通过共享支持渠道授予。
- **您仍然对您的云帐户负责**：您控制您的 AWS 帐户治理、网络连接和内部访问策略。

## 平台和基础设施|面积 | LangChain 职责 |您的责任 |
| :---- | :---- | :---- |
| **服务范围和架构** | <ul><li>定义BYOC架构</li><li>操作控制平面，涵盖组织配置、身份验证、计费元数据和前端资产</li></ul> | <ul><li>获得安全、基础设施和应用程序团队的认可</li><li>确认 BYOC 架构满足您的要求</li></ul> |
| **云帐户所有权** | <ul><li>仅通过客户委派的角色和范围内权限进行操作</li></ul> | <ul><li>拥有您的AWS账户和预算</li><li>自己的账户护栏，例如服务控制策略</li><li>自己的组织结构和账户生命周期</li></ul> || **配置和更改** | <ul><li>配置运行LangSmith数据平面的BYOC基础设施和Kubernetes资源</li><li>管理BYOC托管组件的更新和部署</li><li>通过共享支持确认和安排变更请求频道</li></ul> | <ul><li>批准加入步骤并提供所需的帐户和区域详细信息</li><li>避免手动编辑 BYOC 管理的资源</li><li>通过共享支持渠道请求更改</li></ul> |
| **网络** | <ul><li>为支持的连接模型配置LangSmith组件，例如PrivateLink</li><li>传达所需的端点和约束</li></ul> | <ul><li>拥有您的用户和应用程序到达LangSmith BYOC 数据平面</li></ul> 所需的内部连接
| **控制平面** | <ul><li>操作身份验证、组织配置和 API 密钥管理</li><li>服务静态前端资产并操作使用和计费界面</li></ul> | <ul><li>管理组织级管理员并控制谁可以创建和管理数据平面和工作区</li></ul> || **数据平面服务** | <ul><li>操作摄取和查询跟踪、提示、数据集、评估、见解和部署的服务</li><li>通过监控、扩展和升级保持这些服务的健康</li></ul> | <ul><li>不要将不相关的工作负载放在 BYOC 集群或 VPC 中</li><li>验证环境中的应用程序行为</li></ul> |
| **缩放比例和容量** | <ul><li>监控和扩展 BYOC 管理的服务</li><li>尽可能在发生重大扩展事件之前提前发出通知，并提供预期的成本影响</li></ul> | <ul><li>确保 AWS 服务配额对于已部署的服务来说足够高，并根据需要增加请求</li><li>接受云账户中的成本影响</li><li>定义内部成本护栏和警报</li></ul> |
| **升级和修补** | <ul><li>对 BYOC 管理的组件推出升级和补丁</li><li>协调重大变更和维护窗口</li></ul> | <ul><li>内部规划变更管理，包括利益相关者沟通和阶段验证</li><li>遵循您自己的变更控制流程</li></ul> |有关升级、自动缩放和维护时段如何工作的详细信息，请参阅[BYOC operations](/langsmith/byoc-operations)。

<Note>
使用 [BYOVPC](/langsmith/byoc-byovpc)，您还可以创建和维护：
- 专有网络
- 子网 
- 路线， 
- 网关
- 客户端VPC端点
- 流日志
- 出口控制

LangChain 在配置之前验证所提供的网络并管理其中的工作负载基础设施。在操作期间和数据平面删除之后，客户管理的网络资源仍然由您负责。
</Note>

## 数据和安全|面积 | LangChain 职责 |您的责任 |
| :---- | :---- | :---- |
| **客户数据** | <ul><li>设计系统，使敏感数据不会传输LangChain正常运行的基础设施</li><li>避免在正常运行中访问客户数据</li></ul> | <ul><li>拥有数据平面中的数据，包括分类、保留和访问控制</li><li>拥有该数据的法律和合规义务</li><li>批准任何数据导出或共享内部</li></ul> |
| **数据驻留** | <ul><li>仅在您指定的 AWS 区域内配置所有数据平面组件和存储</li><li>在正常操作期间将客户数据排除在LangChain托管基础设施之外</li></ul> | <ul><li>在入职时指定所需的 AWS 区域</li><li>提前传达对数据驻留要求的任何更改</li></ul> || **秘密管理** | <ul><li>在客户帐户中使用秘密存储来存储运行时秘密</li><li>参考秘密而不在控制平面中保留敏感值</li></ul> | <ul><li>应用任何组织特定的密钥管理要求</li></ul> |
| **打破玻璃访问** | <ul><li>仅在获得客户批准和定义流程的情况下，使用打破玻璃访问来缓解事件</li><li>最大限度地减少该访问的持续时间和范围</li><li>尽可能提前通知</li><li>交付访问后摘要，涵盖时间戳、采取的操作以及访问的任何数据</li></ul> | <ul><li>在需要时批准打破玻璃访问</li><li>定义内部审批工作流程</li><li>查看事件后访问日志和注释</li></ul> || **访问审核日志** | <ul><li>在您的账户中配置日志记录基础设施，以便记录LangChain访问，包括EKS审核日志</li><li>请勿代表您查看、分析或警告这些日志</li></ul> | <ul><li>保留所有LangChain承担的角色的AWS CloudTrail和账户级日志</li><li>查看和分析这些日志，并针对它们设置您自己的警报</li><li>将异常情况升级到LangChain通过共享支持渠道</li></ul> || **安全事件通知** | <ul><li>通知您LangChain拥有的基础设施中已确认影响您的部署的安全事件，涵盖控制平面、企业系统以及BYOC构建和发布管道</li><li>共享事件范围、影响评估和补救措施步骤</li><li>配合联合取证</li><li>不要在云账户内部运行安全监控</li></ul> | <ul><li>为您账户中的 BYOC 组件部署和运行安全监控，例如 EDR、IDS、容器安全、云安全态势管理和日志聚合</li><li>确保监控不会影响 BYOC 托管资源的运行</li><li>指定安全联系人并定义内部事件响应程序</li><li>立即通知LangChain任何可疑的客户端凭证或访问权限</li></ul>|| **合规性和审核** | <ul><li>提供有关BYOC架构和操作模型的文档</li><li>为LangChain操作的控制提供审计证据，包括访问日志、更改历史记录、安全策略和渗透测试摘要</li><li>支持SOC 2、ISO 27001 及同等审核程序</li></ul> | <ul><li>掌握 AWS 环境和所有客户管理的控制措施的合规性</li><li>运行或协调该环境的审计和证据收集</li></ul> |

LangChain 访问范围的 IAM 权限在 [Cross-account IAM permissions](/langsmith/byoc-architecture#cross-account-iam-permissions) 中描述。有关破碎玻璃通道在实践中的工作原理，请参阅[Troubleshooting](/langsmith/byoc-operations#troubleshooting)。有关审核日志所在位置以及如何访问它们的信息，请参阅[Auditing](/langsmith/byoc-operations#auditing)。

## 运营和支持|面积 | LangChain 职责 |您的责任 |
| :---- | :---- | :---- |
| **可观察性** | <ul><li>为 BYOC 管理的组件提供和操作服务级别监控和警报</li><li>在诊断需要时请求客户提供的信号</li></ul> | <ul><li>从您自己的系统提供请求的日志、指标和时间戳</li><li>在故障排除需要时从网络层提供相同的内容</li></ul> |
| **事件响应和支持** | <ul><li>充当LangChain管理的组件的主要响应者，涵盖控制平面和BYOC管理的数据平面服务</li><li>通过共享支持通道协调通信</li></ul> | <ul><li>充当客户拥有层的主要响应者，包括 AWS 账户策略、内部网络和内部 IAM</li><li>为调查提供及时的访问和批准</li></ul> || **备份和灾难恢复** | <ul><li>定义和操作LangChain管理的数据平面组件的备份流程</li><li>在单个区域中跨多个可用区配置数据平面以实现高可用性</li></ul> | <ul><li>定义您的内部恢复目标并与LangChain团队验证它们</li><li>BYOC范围之外的任何客户管理的数据存储的自己的备份</li></ul>|
| **维护窗口和更改冻结** | <ul><li>在商定的维护窗口内执行基础设施维护和升级</li><li>仅当需要进行更改以保持数据平面正常运行时（例如在负载增加的情况下），才在该窗口之外执行操作</li><li>在合理的提前时间内适应敏感业务期间请求的更改冻结通知</li></ul> | <ul><li>在LangSmith UI</li><li>在合理的提前通知下传达即将到来的变更冻结，例如财务结算或主要版本</li></ul> || **离职和终止** | <ul><li>在合同终止时约定的时间范围内删除所有LangChain管理的资源、IAM 角色和委派访问权限</li><li>提供取消配置已完成的书面确认</li></ul> | <ul><li>通过共享支持渠道启动卸载</li><li>确认后验证资源和访问清理</li><li>撤销与关联的任何客户端 IAM 角色或策略BYOC</li></ul> |

## 另请参阅

- [BYOC architecture](/langsmith/byoc-architecture)
- [BYOC operations](/langsmith/byoc-operations)
- [BYOC FAQ](/langsmith/byoc-faq)
- [LangSmith shared responsibility model](/langsmith/shared-responsibility-model)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-shared-responsibility.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>