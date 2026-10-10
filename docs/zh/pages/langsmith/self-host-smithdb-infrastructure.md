<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prepare SmithDB supporting infrastructure | https://docs.langchain.com/langsmith/self-host-smithdb-infrastructure -->

# 准备SmithDB支持基础设施

在启用 SmithDB 之前，提供专用的 PostgreSQL 元存储、对象存储和缓存存储。

<Note>
  对于 Pod 卡住`Pending`、对象存储访问被拒绝或元存储连接错误等故障，请参阅[Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting#supporting-infrastructure)。
</Note>

SmithDB 向自托管 LangSmith 部署添加了三个基础设施依赖项：PostgreSQL 元存储、对象存储以及用于查询、摄取和压缩工作线程的缓存存储。

这些是集成要求和实用建议，而不是规定的云架构。有关 AWS (EKS)、GCP (GKE) 和 Azure (AKS) 设置，请参阅 [Provider setup](#provider-setup)。最低 LangSmith 版本取决于您的云。参见[Cloud support](/langsmith/self-host-smithdb#cloud-support)。

## 要求

在启用 SmithDB 之前，请提供：* 用于 SmithDB 元存储的**专用的空 PostgreSQL 数据库**。不要使用存储其余LangSmith操作数据的PostgreSQL数据库。
* 用于 SmithDB 持久数据的**专用对象存储桶**。
* **用于查询、摄取和压缩工作的缓存存储**：网络连接磁盘或本地 SSD，以获得最佳缓存性能。
* 与数据库和对象存储的专用网络连接，以及两者的凭据或工作负载身份。
* 如果 LangSmith 使用 HTTP 代理，`NO_PROXY` 的 IP 范围条目会分配给 SmithDB Pod 和集群的内部服务域。

## PostgreSQL 元存储

元存储保存 SmithDB 目录和协调数据。为元存储创建一个空数据库。 SmithDB 在安装期间初始化架构。

使用 PostgreSQL 18 或更高版本并允许来自 Kubernetes 集群的数据库连接。有关数据库选项和连接，请参阅[Provider setup](#provider-setup)。

### 元存储秘密

在 LangSmith 发布命名空间中创建一个 Kubernetes Secret，其中包含数据库主机、名称、用户名和密码。通过`smithdb.config.metastore`映射其键。

<Accordion title="Metastore Secret and Helm values">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: smithdb-metastore
    namespace: NAMESPACE
  type: Opaque
  stringData:
    smithdb_metastore_db_host: DB_HOST
    smithdb_metastore_db_name: DB_NAME
    smithdb_metastore_db_username: DB_USERNAME
    smithdb_metastore_db_password: DB_PASSWORD
  ```

  配置图表以使用相应的键：

  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  smithdb:
    config:
      existingSecretName: smithdb-metastore
      metastore:
        hostSecretKey: smithdb_metastore_db_host
        databaseSecretKey: smithdb_metastore_db_name
        usernameSecretKey: smithdb_metastore_db_username
        passwordSecretKey: smithdb_metastore_db_password
        port: "5432"
        useSsl: true
  ````DB_NAME` 可以是专用空数据库的任何名称，例如 `smithdb`。该图表不需要这些确切的密钥名称； Helm 值映射您选择的任何名称。
</Accordion>

## 对象存储

对象存储是 SmithDB 的持久数据层。使用与 Kubernetes 集群位于同一区域的为 SmithDB 数据保留的存储桶，以最大程度地减少延迟和传输成本。

该存储桶与可选的 [LangSmith blob storage](/langsmith/self-host-blob-storage) 分开，后者存储更广泛的 LangSmith 部署的有效负载和附件。

不要添加使对象按自己的计划过期的存储桶生命周期规则。删除活动对象可能会导致数据不可用。

### 使用私有对象存储连接

使用专用连接以避免不必要的数据传输和 NAT 网关成本。在 [Provider setup](#provider-setup) 下配置云的端点。

配置访问权限，以便 SmithDB 组件可以列出存储桶并读取、写入和删除对象。

### 选择一个服务帐户

SmithDB 工作负载共享 `smithdb.serviceAccount`。

* **默认**：图表创建 `<HELM_RELEASE>-smithdb`。
* **自定义**：设置 `name` 创建一个不同名称的帐户。
* **现有**：设置`create: false`和`name`，然后在外部配置工作负载身份。工作负载标识必须针对选定的命名空间和名称。对于`create: false`，需要`name`。否则，pod 使用 `default` ServiceAccount。

### 迁移源桶访问

如果您的安装使用 LangSmith blob 存储，请在迁移历史数据之前授予 `smithdb.serviceAccount` 对该存储桶的读取权限。

## 缓存存储

查询、摄取和压缩工作线程将跟踪数据缓存在安装在 `/data` 的卷上。对象存储保留持久副本；替换 Pod 会丢弃其缓存。

<Note>
  `smithdb.cache` 需要 Helm 图表 `0.17.0` 或更高版本。 LangSmith 0.16 选项卡显示早期图表的等效配置。
</Note>

* **网络连接磁盘**：LangSmith 0.17 上的默认值。 Kubernetes 从 StorageClass 为每个 Pod 提供一个卷，因此不需要专用的节点池。
* **本地 SSD**：LangSmith 0.16 上的默认值和 0.17 上的显式覆盖。推荐用于生产，它可以提供最佳的缓存性能。需要一个节点池，其本地磁盘支持 Kubernetes 临时存储。升级到 0.17 将默认缓存从 `emptyDir` 移动到每个 Pod 的 PersistentVolumeClaim。要保留本地 SSD，请将 [0.17 local SSD values](#local-ssd) 添加到同一升级中。如果您向前传输自定义缓存卷，请将它们从 `local-ssd-storage` 重命名为 `cache`。

### 网络附加磁盘

该图表为每个 Pod 请求一个 [generic ephemeral volume](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#generic-ephemeral-volumes)。 Kubernetes 使用 pod 创建 PersistentVolumeClaim，并使用 pod 删除它。指定 StorageClass `reclaimPolicy: Delete`，以便备份磁盘随之而来。

集群默认的 StorageClass 对于缓存来说通常太慢。使用 [Provider setup](#provider-setup) 下为您的提供商提供的 StorageClass，为每个卷配置至少 7000 IOPS 和 1000 MiB/s。

以下示例使用 `small` 层。将尺寸替换为您的等级。

<Tabs>
  <Tab title="LangSmith 0.17">
    设置`storageClassName`，或将其留空以使用集群默认值。该层设置卷大小、CPU 和内存。该图表设置了 `fsGroup: 1001` 和查询磁盘缓存限制。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      resourceTier: small
      cache:
        storageClassName: smithdb-cache
    ```

    要为一个组件提供不同的 StorageClass 或大小，请将其 `deployment.volumes` 设置为名为 `cache` 的通用临时卷，并具有所需的类和大小。对您更改的每个组件重复此操作。不要通过 `persistentVolumeClaim.claimName` 将 `volumes` 指向现有索赔；每个副本都需要自己的卷。
  </Tab><Tab title="LangSmith 0.16">
    在 0.16 上，替换每个组件上的卷和资源并设置 `fsGroup: 1001`。该图表从 `ephemeral-storage` 限制派生查询磁盘缓存限制，此配置忽略了该限制，因此在 `extraEnv` 中设置限制，如图所示。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      query:
        deployment:
          extraEnv:
            - name: SMITHDB_QUERY__VORTEX_CACHE__DISK__LIMIT
              value: "200Gi"   # match the PVC size
          podSecurityContext:
            fsGroup: 1001
          resources:
            requests:
              cpu: "4"
              memory: "8Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
          volumes:
            - name: local-ssd-storage
              ephemeral:
                volumeClaimTemplate:
                  spec:
                    accessModes: ["ReadWriteOnce"]
                    storageClassName: smithdb-cache
                    resources:
                      requests:
                        storage: 200Gi

      ingestion:
        deployment:
          podSecurityContext:
            fsGroup: 1001
          resources:
            requests:
              cpu: "4"
              memory: "8Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
          volumes:
            - name: local-ssd-storage
              ephemeral:
                volumeClaimTemplate:
                  spec:
                    accessModes: ["ReadWriteOnce"]
                    storageClassName: smithdb-cache
                    resources:
                      requests:
                        storage: 100Gi

      compactionWorker:
        deployment:
          podSecurityContext:
            fsGroup: 1001
          resources:
            requests:
              cpu: "8"
              memory: "16Gi"
            limits:
              cpu: "8"
              memory: "16Gi"
          volumes:
            - name: local-ssd-storage
              ephemeral:
                volumeClaimTemplate:
                  spec:
                    accessModes: ["ReadWriteOnce"]
                    storageClassName: smithdb-cache
                    resources:
                      requests:
                        storage: 100Gi
    ```
  </Tab>
</Tabs>

不需要节点选择器或容忍； SmithDB 在您的通用节点池上运行。迁移作业是个例外。它不使用缓存卷，默认情况下仍请求 100 GiB 节点 `ephemeral-storage`，因此将其安排在具有这么多可分配空间的节点上。

确认每个 pod 都有一个绑定声明并且 `/data` 使用它：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl get pvc -n NAMESPACE
kubectl exec -n NAMESPACE POD_NAME -- df -h /data
```

### 本地SSD

配置节点的本地 SSD 以支持 Kubernetes 临时存储，并将可用容量报告为可分配 `ephemeral-storage`。 SmithDB 使用此存储作为其 `emptyDir` 缓存卷。

使用调度控制将 SmithDB 缓存工作负载保留在 SSD 支持的节点上。调整节点大小，使其具有高于 Pod 请求、图像、日志和 Kubernetes 预留的空间。

以下示例使用 `small` 层。将尺寸替换为您的等级。

<Tabs>
  <Tab title="LangSmith 0.17">
    在每个使用磁盘的组件上，设置一个名为 `cache` 的 `emptyDir` 以及匹配的 `ephemeral-storage` 请求和限制。该图表从该限制得出查询磁盘缓存限制。```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      resourceTier: small
      query:
        deployment:
          resources:
            requests:
              cpu: "4"
              memory: "8Gi"
              ephemeral-storage: "200Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
              ephemeral-storage: "200Gi"
          volumes:
            - name: cache
              emptyDir:
                sizeLimit: 200Gi
      ingestion:
        deployment:
          resources:
            requests:
              cpu: "4"
              memory: "8Gi"
              ephemeral-storage: "100Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
              ephemeral-storage: "100Gi"
          volumes:
            - name: cache
              emptyDir:
                sizeLimit: 100Gi
      compactionWorker:
        deployment:
          resources:
            requests:
              cpu: "8"
              memory: "16Gi"
              ephemeral-storage: "100Gi"
            limits:
              cpu: "8"
              memory: "16Gi"
              ephemeral-storage: "100Gi"
          volumes:
            - name: cache
              emptyDir:
                sizeLimit: 100Gi
    ```
  </Tab>

  <Tab title="LangSmith 0.16">
    在 0.16 上，层已经设置了 `ephemeral-storage` 请求和限制以及名为 `local-ssd-storage` 的 `emptyDir`，因此选择一个层就足够了。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    smithdb:
      resourceTier: small
    ```
  </Tab>
</Tabs>

#### 安排 SmithDB 工作负载

将查询、摄取、压缩工作线程和迁移放在本地 SSD 池上。将压缩和集群管理器放在通用计算池上。节点池标签和污点必须与 Helm 选择器和容忍相匹配。 `metastoreMigration`可以在任何节点上运行，并且不需要选择器。

这些示例中的标签和污点值与本页上的提供程序示例相匹配。 SmithDB 不需要这些精确值；任何使 SSD 支持的节点上的缓存工作负载保持正常工作的标签和污点。

<Accordion title="Helm scheduling values">
  ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  smithdb:
    query:
      deployment:
        nodeSelector:
          smithdb-local/instance-store: "true"
        tolerations:
          - key: smithdb-local/instance-store
            operator: Equal
            value: "true"
            effect: NoSchedule

    ingestion:
      deployment:
        nodeSelector:
          smithdb-local/instance-store: "true"
        tolerations:
          - key: smithdb-local/instance-store
            operator: Equal
            value: "true"
            effect: NoSchedule

    compactionWorker:
      deployment:
        nodeSelector:
          smithdb-local/instance-store: "true"
        tolerations:
          - key: smithdb-local/instance-store
            operator: Equal
            value: "true"
            effect: NoSchedule

    migration:
      job:
        nodeSelector:
          smithdb-local/instance-store: "true"
        tolerations:
          - key: smithdb-local/instance-store
            operator: Equal
            value: "true"
            effect: NoSchedule

    compaction:
      deployment:
        nodeSelector:
          smithdb-local/compute: "true"
        tolerations:
          - key: smithdb-local/compute
            operator: Equal
            value: "true"
            effect: NoSchedule

    clusterManager:
      deployment:
        nodeSelector:
          smithdb-local/compute: "true"
        tolerations:
          - key: smithdb-local/compute
            operator: Equal
            value: "true"
            effect: NoSchedule
  ```

  <Note>
    在 LangSmith 0.16 上，迁移作业的 pod 设置位于 `smithdb.migration.deployment` 而不是 `smithdb.migration.job` 下。所有其他键都相同。
  </Note>
</Accordion>

<Accordion title="Verify local SSD capacity">
  确认预期的标签、污点、调度程序可见容量、pod 放置和缓存文件系统：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  kubectl get nodes --show-labels
  kubectl describe node NODE_NAME
  kubectl get node NODE_NAME \
    -o jsonpath='{.status.allocatable.ephemeral-storage}{"\n"}'
  kubectl get pods -n NAMESPACE -o wide
  kubectl exec -n NAMESPACE POD_NAME -- df -h /data
  ```

  对于 Pod 卡住`Pending`、缓存 I/O 缓慢或驱逐，请参阅[Troubleshoot SmithDB](/langsmith/self-host-smithdb-troubleshooting#supporting-infrastructure)。
</Accordion>

## 提供商设置

<Tabs>
  <Tab title="AWS">
    常见的 AWS 映射是 EKS、用于 PostgreSQL 的 RDS、S3、IRSA 和 EC2 实例存储或用于缓存的 EBS gp3。### 配置元存储

    使用满足 [metastore requirements](#postgresql-metastore) 的 RDS for PostgreSQL 或 Aurora PostgreSQL。

    ### 配置S3访问

    将 S3 网关 VPC 终端节点添加到集群的私有路由表中，以便存储桶流量远离公共 Internet。

    选择 IRSA 或 EKS Pod 身份。 IRSA 需要`system:serviceaccount:<NAMESPACE>:<HELM_RELEASE>-smithdb` 的角色注释和信任。 Pod Identity 使用外部关联且不使用注释。

    将角色的 S3 访问范围限定为列出存储桶并读取其位置，以及对象读取、写入、删除和多部分操作。对于迁移源读取，还要在 LangSmith blob 存储桶上授予 `s3:ListBucket` 和 `s3:GetObject`。

    <Accordion title="IRSA Helm values">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      smithdb:
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: "arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>"
        config:
          objectStore:
            type: s3
            bucket: "<BUCKET_NAME>"
            s3:
              region: "<AWS_REGION>"
              accessKeyIdSecretKey: ""
              secretAccessKeySecretKey: ""
      ```
    </Accordion>

    ### 创建缓存StorageClass

    对于 [network-attached disk](#network-attached-disk) 选项，创建一个具有预配置 IOPS 和吞吐量的 gp3 StorageClass。必须安装[EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: smithdb-cache
    provisioner: ebs.csi.aws.com
    parameters:
      type: gp3
      iops: "7000"
      throughput: "1000"
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete
    ```

    ### 使用 Karpenter 配置 EKS 节点

    以下节点示例适用于 [local SSD](#local-ssd) 选项。 Karpenter 是在 EKS 上配置 SmithDB 容量的推荐方法，但这不是必需的。其他节点配置者必须生成相同的标签、污点和 Kubernetes 可见的临时存储容量。按照 [Karpenter EKS guide](https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/) 安装 Karpenter v1 及其 CRD。在应用下面的示例之前：

    * 替换`CLUSTER_NAME`和`KarpenterNodeRole-CLUSTER_NAME`。
    * 使用 `karpenter.sh/discovery: CLUSTER_NAME` 标记选定的子网和安全组，或将选择器替换为您的环境使用的标签或 ID。
    * 确认为 Karpenter 配置的节点配置了节点 IAM 角色和 EKS 访问条目。

    <Note>
      应用这些清单会创建供应配置。当匹配的 SmithDB Pod 需要容量时，EC2 节点启动。
    </Note>

    <Accordion title="Karpenter EC2NodeClass and NodePool example">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      apiVersion: karpenter.k8s.aws/v1
      kind: EC2NodeClass
      metadata:
        name: smithdb-instance-store
      spec:
        amiSelectorTerms:
          - alias: al2023@latest
        role: KarpenterNodeRole-CLUSTER_NAME
        subnetSelectorTerms:
          - tags:
              karpenter.sh/discovery: CLUSTER_NAME
        securityGroupSelectorTerms:
          - tags:
              karpenter.sh/discovery: CLUSTER_NAME
        associatePublicIPAddress: false
        instanceStorePolicy: RAID0
        metadataOptions:
          httpEndpoint: enabled
          httpProtocolIPv6: disabled
          httpPutResponseHopLimit: 1
          httpTokens: required
        blockDeviceMappings:
          - deviceName: /dev/xvda
            ebs:
              volumeSize: 100Gi
              volumeType: gp3
              encrypted: true
              deleteOnTermination: true
      ---
      apiVersion: karpenter.sh/v1
      kind: NodePool
      metadata:
        name: smithdb-instance-store
      spec:
        template:
          metadata:
            labels:
              smithdb-local/instance-store: "true"
          spec:
            taints:
              - key: smithdb-local/instance-store
                value: "true"
                effect: NoSchedule
            requirements:
              - key: kubernetes.io/os
                operator: In
                values: ["linux"]
              - key: kubernetes.io/arch
                operator: In
                values: ["amd64"]
              - key: karpenter.sh/capacity-type
                operator: In
                values: ["on-demand"]
              - key: karpenter.k8s.aws/instance-local-nvme
                operator: Gt
                values: ["799"]
              - key: karpenter.k8s.aws/instance-size
                operator: In
                values: ["4xlarge", "8xlarge"]
            nodeClassRef:
              group: karpenter.k8s.aws
              kind: EC2NodeClass
              name: smithdb-instance-store
        disruption:
          consolidationPolicy: WhenEmpty
          consolidateAfter: 2m
      ---
      apiVersion: karpenter.k8s.aws/v1
      kind: EC2NodeClass
      metadata:
        name: smithdb-compute
      spec:
        amiSelectorTerms:
          - alias: al2023@latest
        role: KarpenterNodeRole-CLUSTER_NAME
        subnetSelectorTerms:
          - tags:
              karpenter.sh/discovery: CLUSTER_NAME
        securityGroupSelectorTerms:
          - tags:
              karpenter.sh/discovery: CLUSTER_NAME
        associatePublicIPAddress: false
        metadataOptions:
          httpEndpoint: enabled
          httpProtocolIPv6: disabled
          httpPutResponseHopLimit: 1
          httpTokens: required
        blockDeviceMappings:
          - deviceName: /dev/xvda
            ebs:
              volumeSize: 100Gi
              volumeType: gp3
              encrypted: true
              deleteOnTermination: true
      ---
      apiVersion: karpenter.sh/v1
      kind: NodePool
      metadata:
        name: smithdb-compute
      spec:
        template:
          metadata:
            labels:
              smithdb-local/compute: "true"
          spec:
            taints:
              - key: smithdb-local/compute
                value: "true"
                effect: NoSchedule
            requirements:
              - key: kubernetes.io/os
                operator: In
                values: ["linux"]
              - key: kubernetes.io/arch
                operator: In
                values: ["amd64"]
              - key: karpenter.sh/capacity-type
                operator: In
                values: ["on-demand"]
              - key: karpenter.k8s.aws/instance-generation
                operator: Gt
                values: ["2"]
              - key: karpenter.k8s.aws/instance-size
                operator: In
                values: ["2xlarge", "4xlarge", "8xlarge"]
            nodeClassRef:
              group: karpenter.k8s.aws
              kind: EC2NodeClass
              name: smithdb-compute
        disruption:
          consolidationPolicy: WhenEmpty
          consolidateAfter: 2m
      ```

      在此示例中，`instanceStorePolicy: RAID0`使本地 NVMe 可用作节点临时存储。 `smithdb-instance-store` NodePool 需要至少 800 GiB，并且仅在空时进行整合，避免使用热缓存对节点进行不必要的改动。

      800 GiB 楼层适合 `medium` 层。根据您选择的层中最大的每个副本临时存储请求以及节点余量来确定需求大小。参见[Configure SmithDB for scale](/langsmith/self-host-smithdb-scale)。
    </Accordion>

    对于自定义 AMI，Bootstrap 必须格式化并挂载 kubelet 和容器运行时存储的实例存储设备。

    ### 配置 EKS 受管节点组如果 Karpenter 不可用，请改用 EKS 托管节点组。这些示例将实例存储 NVMe 配置为 RAID0 并应用 Helm 调度值使用的标签和污点。

    <Warning>
      替换大写占位符。根据您的规模调整基准和区域可用性选择实例类型和容量。将`AMI_TYPE`与实例架构相匹配。例如，`i8g.4xlarge` 使用`AL2023_ARM_64_STANDARD`。
    </Warning>

    <Accordion title="AWS CLI">
      AWS CLI 需要 EC2 启动模板来进行 `nodeadm` 配置。

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      USER_DATA="$(
        base64 <<'EOF' | tr -d '\n'
      MIME-Version: 1.0
      Content-Type: multipart/mixed; boundary="BOUNDARY"

      --BOUNDARY
      Content-Type: application/node.eks.aws

      ---
      apiVersion: node.eks.aws/v1alpha1
      kind: NodeConfig
      spec:
        instance:
          localStorage:
            strategy: RAID0

      --BOUNDARY--
      EOF
      )"

      LT_ID="$(aws ec2 create-launch-template \
        --region AWS_REGION \
        --launch-template-name smithdb-instance-store \
        --launch-template-data "{
          \"InstanceType\": \"INSTANCE_TYPE\",
          \"UserData\": \"$USER_DATA\",
          \"MetadataOptions\": {
            \"HttpEndpoint\": \"enabled\",
            \"HttpTokens\": \"required\",
            \"HttpPutResponseHopLimit\": 2
          }
        }" \
        --query 'LaunchTemplate.LaunchTemplateId' \
        --output text)"

      aws eks create-nodegroup \
        --region AWS_REGION \
        --cluster-name CLUSTER_NAME \
        --nodegroup-name smithdb-instance-store \
        --node-role NODE_ROLE_ARN \
        --subnets SUBNET_ID_1 SUBNET_ID_2 \
        --launch-template id="$LT_ID",version=1 \
        --ami-type AMI_TYPE \
        --capacity-type ON_DEMAND \
        --scaling-config minSize=1,maxSize=NODE_COUNT,desiredSize=NODE_COUNT \
        --labels smithdb-local/instance-store=true \
        --taints key=smithdb-local/instance-store,value=true,effect=NO_SCHEDULE
      ```
    </Accordion>

    <Accordion title="eksctl 0.199.0+">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      apiVersion: eksctl.io/v1alpha5
      kind: ClusterConfig

      metadata:
        name: CLUSTER_NAME
        region: AWS_REGION

      managedNodeGroups:
        - name: smithdb-instance-store
          amiFamily: AmazonLinux2023
          instanceType: INSTANCE_TYPE
          privateNetworking: true
          minSize: 1
          maxSize: NODE_COUNT
          desiredCapacity: NODE_COUNT
          labels:
            smithdb-local/instance-store: "true"
          taints:
            - key: smithdb-local/instance-store
              value: "true"
              effect: NoSchedule
          overrideBootstrapCommand: |
            apiVersion: node.eks.aws/v1alpha1
            kind: NodeConfig
            spec:
              instance:
                localStorage:
                  strategy: RAID0
      ```

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      eksctl create nodegroup --config-file=smithdb-nodegroup.yaml
      ```
    </Accordion>

    <Accordion title="Terraform">
      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      module "eks" {
        source = "terraform-aws-modules/eks/aws"

        # Existing module version and cluster configuration...

        eks_managed_node_groups = {
          # Existing node groups...

          smithdb_instance_store = {
            ami_type       = "AMI_TYPE"
            instance_types = ["INSTANCE_TYPE"]
            min_size       = 1
            max_size       = NODE_COUNT
            desired_size   = NODE_COUNT

            labels = {
              "smithdb-local/instance-store" = "true"
            }

            taints = {
              smithdb = {
                key    = "smithdb-local/instance-store"
                value  = "true"
                effect = "NO_SCHEDULE"
              }
            }

            cloudinit_pre_nodeadm = [{
              content_type = "application/node.eks.aws"
              content = <<-EOT
                apiVersion: node.eks.aws/v1alpha1
                kind: NodeConfig
                spec:
                  instance:
                    localStorage:
                      strategy: RAID0
              EOT
            }]
          }
        }
      }
      ```
    </Accordion>
  </Tab>

  <Tab title="GCP">
    常见的 GCP 映射是 GKE 标准、AlloyDB 或其他兼容的 PostgreSQL 服务、云存储、工作负载身份以及用于缓存的本地 SSD 或 Hyperdisk 平衡。

    ### 配置元存储

    使用满足 [metastore requirements](#postgresql-metastore) 的 AlloyDB 或 Cloud SQL for PostgreSQL。<Accordion title="Connect through the AlloyDB Auth Proxy">
      SmithDB 可以通过在每个 SmithDB pod 中作为 sidecar 运行的 [AlloyDB Auth Proxy](https://docs.cloud.google.com/alloydb/docs/auth-proxy/overview) 访问 AlloyDB。 SmithDB 通过环回连接到代理；代理向 Google Cloud 进行身份验证并加密上游连接。代理不会创建网络连接，因此 GKE 仍然需要通过私有 IP、Private Service Connect 或公共 IP 到 AlloyDB 的路由。

      将`roles/alloydb.client`和`roles/serviceusage.serviceUsageConsumer`授予与SmithDB ServiceAccount绑定的Google服务帐户。将 Metastore Secret 的主机密钥指向 `127.0.0.1` 并设置 `useSsl: false`。 SmithDB 无法验证 AlloyDB 直接提供的证书，加密从代理开始。

      `smithdb.commonInitContainers` 适用于每个 SmithDB 部署和作业。设置`restartPolicy: Always`，以便 Kubernetes 将代理作为 sidecar 运行并让迁移作业完成。

      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      smithdb:
        commonInitContainers:
          - name: alloydb-auth-proxy
            image: gcr.io/alloydb-connectors/alloydb-auth-proxy:PINNED_VERSION
            restartPolicy: Always
            args:
              - "--address=127.0.0.1"
              - "--port=5432"
              - "--structured-logs"
              - "--health-check"
              - "--http-address=0.0.0.0"
              - "--http-port=9090"
              - "projects/PROJECT_ID/locations/REGION/clusters/CLUSTER/instances/INSTANCE"
            ports:
              - name: proxy-health
                containerPort: 9090
            startupProbe:
              httpGet:
                path: /startup
                port: proxy-health
            readinessProbe:
              httpGet:
                path: /readiness
                port: proxy-health
            livenessProbe:
              httpGet:
                path: /liveness
                port: proxy-health
        config:
          metastore:
            useSsl: false
      ```

      添加`--psc`用于私有服务连接，`--public-ip`用于公共IP，或`--auto-iam-authn`用于IAM数据库身份验证，这还需要`roles/alloydb.databaseUser`和匹配的IAM数据库用户。如果迁移作业从未完成，请确认`restartPolicy: Always`。如果环回连接因 TLS 错误而失败，请确认 `useSsl` 是 `false`。
    </Accordion>

    ### 配置云存储访问使用私有 Google 访问权限和私有 Google API DNS 来访问 Cloud Storage。

    <Note>
      使用单区域存储桶可以避免数据复制成本并提供可预测的尾部延迟。
    </Note>

    在 SmithDB 存储桶上授予 Google 服务帐户 `roles/storage.objectAdmin` 或等效的自定义角色，然后允许 `serviceAccount:<PROJECT_ID>.svc.id.goog[<NAMESPACE>/<HELM_RELEASE>-smithdb]` 模拟它。对于迁移源读取，还要在 LangSmith blob 存储桶上授予 `roles/storage.objectViewer`。

    <Accordion title="GKE Workload Identity Helm values">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      smithdb:
        serviceAccount:
          annotations:
            iam.gke.io/gcp-service-account: "<GSA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com"
        config:
          objectStore:
            type: gcs
            bucket: "<BUCKET_NAME>"
      ```
    </Accordion>

    <Accordion title="GCS HMAC migration configuration">
      优先选择工作负载身份来进行 GCS blob 访问。如果 LangSmith 必须使用 GCS HMAC 密钥，请设置 `smithdb.migration.job.extraEnv`（LangSmith 0.16 上的`smithdb.migration.deployment.extraEnv`）以强制使用 S3 兼容源并引用现有的 LangSmith 密钥 (`blob_storage_access_key` / `blob_storage_access_key_secret`)：

      <CodeGroup>
        ```yaml LangSmith 0.17 theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        smithdb:
          migration:
            job:
              extraEnv:
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__TYPE
                  value: "s3"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__BUCKET
                  value: "BLOB_BUCKET_NAME"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ROOT_FOLDER
                  value: "/"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ENDPOINT
                  value: "https://storage.googleapis.com"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ACCESS_KEY_ID
                  valueFrom:
                    secretKeyRef:
                      name: LANGSMITH_SECRETS_NAME
                      key: blob_storage_access_key
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__SECRET_ACCESS_KEY
                  valueFrom:
                    secretKeyRef:
                      name: LANGSMITH_SECRETS_NAME
                      key: blob_storage_access_key_secret
        ```

        ```yaml LangSmith 0.16 theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        smithdb:
          migration:
            deployment:
              extraEnv:
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__TYPE
                  value: "s3"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__BUCKET
                  value: "BLOB_BUCKET_NAME"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ROOT_FOLDER
                  value: "/"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ENDPOINT
                  value: "https://storage.googleapis.com"
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__ACCESS_KEY_ID
                  valueFrom:
                    secretKeyRef:
                      name: LANGSMITH_SECRETS_NAME
                      key: blob_storage_access_key
                - name: SMITHDB_MIGRATION__BLOB_STORE_DEFAULT__S3__SECRET_ACCESS_KEY
                  valueFrom:
                    secretKeyRef:
                      name: LANGSMITH_SECRETS_NAME
                      key: blob_storage_access_key_secret
        ```
      </CodeGroup>
    </Accordion>

    ### 创建缓存StorageClass

    对于 [network-attached disk](#network-attached-disk) 选项，创建一个具有预配置 IOPS 和吞吐量的 Hyperdisk Balanced StorageClass。超级磁盘可用性取决于节点机器类型；参见[Hyperdisk on GKE](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/hyperdisk)。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: smithdb-cache
    provisioner: pd.csi.storage.gke.io
    parameters:
      type: hyperdisk-balanced
      provisioned-iops-on-create: "7000"
      provisioned-throughput-on-create: "1000Mi"
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete
    ```

    ### 配置 GKE 本地 SSD 节点这适用于 [local SSD](#local-ssd) 选项。使用由`--ephemeral-storage-local-ssd`创建的[Local SSD-backed ephemeral storage](https://cloud.google.com/kubernetes-engine/docs/how-to/persistent-volumes/local-ssd)，它支持`emptyDir`、容器层和调度程序容量。原始块选项`--local-nvme-ssd-block`不支持`emptyDir`，并且使SmithDB没有缓存容量。

    <Accordion title="GKE Local SSD node-pool example">
      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      gcloud container node-pools create POOL_NAME \
        --cluster=CLUSTER_NAME \
        --machine-type=MACHINE_TYPE \
        --num-nodes=NODE_COUNT \
        --ephemeral-storage-local-ssd count=DISK_COUNT \
        --node-labels=smithdb-local/instance-store=true \
        --node-taints=smithdb-local/instance-store=true:NoSchedule
      ```
    </Accordion>

    <Accordion title="Terraform GKE Local SSD node-pool example">
      <Warning>
        本示例仅配置本地SSD和工作负载调度。单独配置节点 IAM、网络、安全设置和扩展。数值具有说明性。
      </Warning>

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      resource "google_container_node_pool" "smithdb_local_ssd" {
        name       = "POOL_NAME"
        cluster    = google_container_cluster.primary.id
        node_count = NODE_COUNT

        node_config {
          machine_type = "MACHINE_TYPE"

          ephemeral_storage_local_ssd_config {
            local_ssd_count = DISK_COUNT
          }

          labels = {
            "smithdb-local/instance-store" = "true"
          }

          taint {
            key    = "smithdb-local/instance-store"
            value  = "true"
            effect = "NO_SCHEDULE"
          }
        }
      }
      ```
    </Accordion>

    支持的磁盘数量和机器类型因区域和机器代数而异。验证节点池使用的每个区域的可用性。
  </Tab>

  <Tab title="Azure">
    常见的 Azure 映射是 AKS、Azure Database for PostgreSQL、Azure Blob 存储、工作负载身份和高级 SSD v2 或通过用于缓存的 Azure 容器存储的本地 NVMe。

    ### 配置元存储

    使用满足 [metastore requirements](#postgresql-metastore) 的 Azure Database for PostgreSQL。

    ### 配置 Blob 存储访问

    使用 Blob 存储的专用终结点。

    `smithdb.config.objectStore.bucket` 是 Blob 容器名称。需要`azure.accountName`。使用 Workload Identity 时，将 `accessKeySecretKey` 留空。在 SmithDB 存储帐户上授予用户分配的托管标识 `Storage Blob Data Contributor`，并在 LangSmith blob 存储帐户上授予用户分配的托管标识 `Storage Blob Data Reader`，以进行迁移源读取。使用身份的客户端 ID 注释 SmithDB ServiceAccount，并将 `azure.workload.identity/use: "true"` 标签添加到每个 SmithDB 工作负载。

    <Accordion title="AKS Workload Identity Helm values">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      smithdb:
        serviceAccount:
          annotations:
            azure.workload.identity/client-id: "<CLIENT_ID>"
        config:
          objectStore:
            type: azure
            bucket: "<CONTAINER_NAME>"
            azure:
              accountName: "<STORAGE_ACCOUNT_NAME>"
              accessKeySecretKey: ""
        query:
          deployment:
            labels:
              azure.workload.identity/use: "true"
        ingestion:
          deployment:
            labels:
              azure.workload.identity/use: "true"
        compaction:
          deployment:
            labels:
              azure.workload.identity/use: "true"
        compactionWorker:
          deployment:
            labels:
              azure.workload.identity/use: "true"
        clusterManager:
          deployment:
            labels:
              azure.workload.identity/use: "true"
        metastoreMigration:
          job:
            labels:
              azure.workload.identity/use: "true"
        migration:
          job:
            labels:
              azure.workload.identity/use: "true"
      ```
    </Accordion>

    ### 创建缓存StorageClass

    对于 [network-attached disk](#network-attached-disk) 选项，创建具有预配置 IOPS 和吞吐量的 Premium SSD v2 StorageClass。高级 SSD v2 磁盘是分区的，并且在部分区域中可用，因此请在受支持的区域中跨可用区部署节点池。参见[Premium SSD v2 on AKS](https://learn.microsoft.com/en-us/azure/aks/use-premium-v2-disks)。

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: smithdb-cache
    provisioner: disk.csi.azure.com
    parameters:
      skuName: PremiumV2_LRS
      cachingMode: None
      DiskIOPSReadWrite: "7000"
      DiskMBpsReadWrite: "1000"
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete
    ```

    ### 使用本地 NVMe 配置 AKS 节点

    这适用于 [local SSD](#local-ssd) 选项。使用具有本地 NVMe 磁盘的节点池并通过 [Azure Container Storage](https://learn.microsoft.com/en-us/azure/storage/container-storage/container-storage-introduction) 公开它们。

    调整节点上每个缓存卷的 NVMe 大小。这些示例使用`Standard_L16s_v4`。

    <Accordion title="Azure CLI node-pool example">
      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      az aks nodepool add \
        --resource-group RESOURCE_GROUP \
        --cluster-name CLUSTER_NAME \
        --name smithcache \
        --node-vm-size Standard_L16s_v4 \
        --labels smithdb-local/instance-store=true \
        --node-taints smithdb-local/instance-store=true:NoSchedule
      ```
    </Accordion>

    <Accordion title="Terraform AKS node-pool example">
      <Warning>
        本例仅配置缓存池。单独配置节点 IAM、网络、安全设置和扩展，并确认您的 VM 大小在您所在的区域可用。
      </Warning>

      ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      resource "azurerm_kubernetes_cluster_node_pool" "smithdb_cache" {
        name                  = "smithcache"
        kubernetes_cluster_id = azurerm_kubernetes_cluster.primary.id
        vm_size               = "Standard_L16s_v4"
        node_count            = NODE_COUNT

        node_labels = {
          "smithdb-local/instance-store" = "true"
        }

        node_taints = [
          "smithdb-local/instance-store=true:NoSchedule",
        ]
      }
      ```
    </Accordion>在池上启用 Azure 容器存储。这需要`k8s-extension` Azure CLI 扩展并创建`local-csi` StorageClass。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    az aks update \
      --resource-group RESOURCE_GROUP \
      --name CLUSTER_NAME \
      --enable-azure-container-storage ephemeralDisk \
      --container-storage-version 2 \
      --azure-container-storage-nodepools smithcache
    ```

    将每个缓存作为临时 PVC 安装在 `local-csi` 而不是`emptyDir` 上。该图表根据 PVC 调整查询磁盘缓存的大小，因此请跳过 `ephemeral-storage` 设置。还要添加[scheduling controls](#schedule-smithdb-workloads)。

    <Accordion title="Azure Container Storage cache Helm values">
      ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      smithdb:
        resourceTier: small
        query:
          deployment:
            volumes:
              - name: cache
                ephemeral:
                  volumeClaimTemplate:
                    spec:
                      accessModes: ["ReadWriteOnce"]
                      storageClassName: local-csi
                      resources:
                        requests:
                          storage: 200Gi
        ingestion:
          deployment:
            volumes:
              - name: cache
                ephemeral:
                  volumeClaimTemplate:
                    spec:
                      accessModes: ["ReadWriteOnce"]
                      storageClassName: local-csi
                      resources:
                        requests:
                          storage: 100Gi
        compactionWorker:
          deployment:
            volumes:
              - name: cache
                ephemeral:
                  volumeClaimTemplate:
                    spec:
                      accessModes: ["ReadWriteOnce"]
                      storageClassName: local-csi
                      resources:
                        requests:
                          storage: 100Gi
      ```
    </Accordion>
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-infrastructure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>