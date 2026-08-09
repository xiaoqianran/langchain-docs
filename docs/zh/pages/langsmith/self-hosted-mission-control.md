<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Install Mission Control | https://docs.langchain.com/langsmith/self-hosted-mission-control -->

# 安装任务控制

安装 Mission Control，这是一个集群内控制台，用于在 Kubernetes 上监视、配置和操作自托管 LangSmith。

Mission Control 是一个集群内控制台，用于在 Kubernetes 上监视、配置和操作 LangSmith。它在集群内部运行，默认使用 `kubectl port-forward` 访问，因此不需要入口。

有两个安装路径：

|路径|最适合 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Quick install](#quick-install) |可以运行经过审查的 shell 安装程序并希望最短安装的客户。               |
| [Manual install](#manual-install) |不允许安装程序脚本或需要审查每个 Kubernetes 命令的组织。 |

公共安装资产是：

* `install-script.sh`：一个安装程序，具有单独的 `prereqs`、`namespace`、`secret`、`values`、`install` 和 `forward` 步骤。
* `values.yaml`：仅端口转发安装的默认 Helm 值。

Mission Control 镜像发布到两个 Docker Hub 存储库：`langchain/mission-control-backend` 和 `langchain/mission-control-frontend`。最新的图像可以通过以下方式检查：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docker pull langchain/mission-control-backend:latest
docker pull langchain/mission-control-frontend:latest
```浏览器审核链接：

* `https://github.com/langchain-ai/helm/tree/main/charts/mission-control/install-script.sh`
* `https://github.com/langchain-ai/helm/tree/main/charts/mission-control/values.yaml`

以下命令使用原始 GitHub URL，因此 `curl` 可以直接下载文件。如果您从不同的存储库或分支发布这些文件，请替换下面的原始基本 URL。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
MC_RAW_BASE=https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control
```

## 先决条件

|工具|最低版本 |安装示例 |
| ---------| ------------------- | ---------------------- |
| `kubectl` | 1.24+ | `brew install kubectl` |
| `helm` | 3.x | `brew install helm` |
| `curl` |任何当前版本 |通常预装 |

您必须针对已安装或将要安装 LangSmith 的 Kubernetes 集群运行安装程序。在继续之前确认活动上下文：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl config current-context
```

安装程序身份需要创建任务控制命名空间资源和集群范围的 RBAC 的权限：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl auth can-i create clusterrole
kubectl auth can-i create clusterrolebinding
kubectl auth can-i create serviceaccount -n langsmith
kubectl auth can-i create deployment -n langsmith
kubectl auth can-i create secret -n langsmith
```

所有五个命令都应返回`yes`。有关授予任务控制的运行时权限，请参阅[Permissions reference](#permissions-reference)。

## 快速安装

运行这三个命令：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSLO https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control/install-script.sh && chmod +x install-script.sh
curl -fsSL https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control/values.yaml -o values.yaml
./install-script.sh all -f values.yaml
```

`all`步骤：* 检查所需的工具和 RBAC。
* 创建`langsmith`命名空间。
* 提示输入任务控制用户名和密码。
* 将这些凭证存储在 `mission-control-auth` Kubernetes Secret 中。
* 如果尚不存在，则写入 `values.yaml`。
* 如果您没有从本地图表签出运行，则从公共 Helm 图表存储库安装。
* 安装带有 Helm 的任务控制。

RBAC 检查运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl auth can-i create clusterrole
kubectl auth can-i create clusterrolebinding
kubectl auth can-i create serviceaccount -n langsmith
kubectl auth can-i create deployment -n langsmith
kubectl auth can-i create secret -n langsmith
```

如果您的组织故意阻止 `kubectl auth can-i` 但 Helm 安装是通过另一个控制路径批准的，请运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./install-script.sh all -f values.yaml --skip-rbac-check
```

### 访问用户界面

安装完成后，启动本地端口转发：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./install-script.sh forward
```

打开[http://localhost:3000](http://localhost:3000/)并使用您输入的用户名和密码登录。

### 先回顾一下脚本

快速安装路径会在运行脚本之前下载脚本，因此您可以在第三个命令之前在本地查看`install-script.sh`。

### 安装前编辑值

快速安装路径还会在运行安装程序之前下载`values.yaml`。如果您需要更改命名空间、资源、入口、功能标志或诊断持久性，请在第三个命令之前查看或编辑该文件。

常见编辑：|设置|何时更改 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `namespace` |将任务控制安装在 `langsmith` 以外的位置。还将 `-n <namespace>` 传递给脚本。 |
| `resources` |您的命名空间有 `ResourceQuota` 或者您的平台需要特定的请求/限制。            |
| `ingress.enabled` 和 `ingress.host` |您希望通过入口控制器而不是端口转发来公开任务控制。      |
| `config.features.*` |您需要删除特定的写入权限或外部出口功能。                          |
| `diagnostics.persistence.enabled` |您希望诊断包能够在 Pod 重新启动和 Helm 升级后继续存在。                              || `backend.podSecurityContext` 和 `frontend.podSecurityContext` |您的平台要求容器作为特定的非根 UID 运行，例如 `1001`。                |

具有自定义命名空间的示例：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -fsSLO https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control/install-script.sh && chmod +x install-script.sh
curl -fsSL https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control/values.yaml -o values.yaml
./install-script.sh all -n mission-control -f values.yaml
```

### 脚本命令参考

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./install-script.sh prereqs
./install-script.sh namespace
./install-script.sh secret
./install-script.sh values
./install-script.sh install
./install-script.sh forward
./install-script.sh all
```

有用的标志：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./install-script.sh all -n langsmith -f values.yaml
./install-script.sh all -u admin
printf '%s\n' 'your-password' | ./install-script.sh secret -u admin --password-stdin
./install-script.sh all -f values.yaml --skip-rbac-check
./install-script.sh install --chart-ref langchain/mission-control
./install-script.sh install --chart-path /path/to/mission-control
./install-script.sh forward --port 3001:3000
```

## 手动安装

当不允许安装程序脚本时使用此路径。这些步骤仅使用正常的 `kubectl`、`helm` 和 `curl` 命令。

<Steps>
  <Step title="Add the Helm repo and get the values file">
    添加 LangChain Helm 仓库：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm repo add langchain https://langchain-ai.github.io/helm
    helm repo update langchain
    ```

    下载客户价值文件：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl -fsSL https://raw.githubusercontent.com/langchain-ai/helm/main/charts/mission-control/values.yaml -o values.yaml
    ```

    安装前查看`values.yaml`。保留`config.auth.enabled: true`用于生产。

    如果您的平台需要非根容器，Mission Control 可以作为 UID `1001` 运行。安装前将其添加到`values.yaml`：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    backend:
      podSecurityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
      extraEnv:
        - name: HOME
          value: /tmp
        - name: HELM_CACHE_HOME
          value: /tmp/.cache/helm
        - name: HELM_CONFIG_HOME
          value: /tmp/.config/helm
        - name: HELM_DATA_HOME
          value: /tmp/.local/share/helm

    frontend:
      podSecurityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
    ```
  </Step>

  <Step title="Create the namespace">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl create namespace langsmith --dry-run=client -o yaml | kubectl apply -f -
    ```
  </Step>

  <Step title="Create the auth credentials Secret">
    凭证存储在 Kubernetes Secret 中。它们不是写给`values.yaml`的。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    read -r -p "Username: " MC_USER
    read -r -s -p "Password: " MC_PASS; echo

    kubectl create secret generic mission-control-auth \
      --namespace=langsmith \
      --from-literal=username="$MC_USER" \
      --from-literal=password="$MC_PASS" \
      --dry-run=client -o yaml | kubectl apply -f -
    ```

    对于多副本后端部署，在同一个 Secret 中包含共享 JWT 签名密钥，并在 `values.yaml` 中设置 `config.auth.jwtSecretKey: jwtSecret`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    JWT_SECRET="$(openssl rand -base64 32)"

    kubectl create secret generic mission-control-auth \
      --namespace=langsmith \
      --from-literal=username="$MC_USER" \
      --from-literal=password="$MC_PASS" \
      --from-literal=jwtSecret="$JWT_SECRET" \
      --dry-run=client -o yaml | kubectl apply -f -
    ```
  </Step>

  <Step title="Install with Helm">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    helm upgrade --install mission-control langchain/mission-control \
      --namespace langsmith \
      --create-namespace \
      --values values.yaml \
      --rollback-on-failure
    ```

    等待两个工作负载准备就绪（后端作为 StatefulSet 运行，前端作为 Deployment 运行）：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl rollout status statefulset/mission-control-backend -n langsmith
    kubectl rollout status deployment/mission-control-frontend -n langsmith
    ```

    您还可以直接检查 pod：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl get pods -n langsmith
    ```
  </Step>

  <Step title="Access the UI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    kubectl port-forward svc/mission-control-frontend 3000:3000 -n langsmith
    ```打开 [http://localhost:3000](http://localhost:3000/) 并使用步骤 3 中的凭据登录。
  </Step>
</Steps>

## 升级

下载最新的公共值文件，合并您需要的任何本地更改，然后运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm repo update langchain

helm upgrade --install mission-control langchain/mission-control \
  --namespace langsmith \
  --values values.yaml \
  --rollback-on-failure
```

如果您使用本地图表结账：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade --install mission-control . \
  --namespace langsmith \
  --values values.yaml \
  --rollback-on-failure
```

如果您使用快速脚本安装并将其保存在本地：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
./install-script.sh install -f values.yaml
```

## 卸载

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm uninstall mission-control -n langsmith
```

这将删除任务控制版本。它不会删除您的命名空间或不相关的 LangSmith 资源。

可选择清理任务控制中心拥有的秘密：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl delete secret -n langsmith \
  mission-control-auth \
  mission-control-draft \
  mission-control-deployed \
  mission-control-backup \
  mission-control-history \
  mission-control-alerts-config \
  mission-control-alerts-log \
  mission-control-alerts-key \
  mission-control-setup-token \
  --ignore-not-found
```

## 其他资源

### 故障排除|症状|检查什么 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `kubectl auth can-i ...` 返回 `no` |请求集群管理员授予安装时 RBAC 或为您运行安装。                                                   |
|豆荚停留 `Pending` |使用`kubectl describe pod -n langsmith <pod>`检查命名空间`ResourceQuota`、节点容量和PVC/存储类事件。 |
|图像拉取错误 |确认集群可以拉取`langchain/mission-control-backend:latest`和`langchain/mission-control-frontend:latest`。     |
|登录失败 |确认 `mission-control-auth` 存在于同一命名空间中，并且具有 `username` 和 `password` 键。                          |
|浏览器无法连接 |确认 port-forward 命令仍在运行，并且没有其他本地进程正在使用端口 `3000`。                           |

### 权限参考

Helm 图表创建一个名为 `mission-control` 的 `ServiceAccount`、`ClusterRole` 和 `ClusterRoleBinding`。大多数权限是只读的。写动词是狭窄的并且由特征标志控制。安装或升级需要能够创建集群范围的 RBAC（`ClusterRole` 和 `ClusterRoleBinding`），通常是 `cluster-admin` 或自定义等效项。最广泛的运行时权限集仅在`config.features.deploy: true`时使用；该标志默认启用，将其设置为 `false` 进行只读安装。

#### 始终存在的只读权限

|资源组|资源 |动词|
| ------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
|工作负载 | Pod、Pod/日志、部署、有状态集、副本集、守护进程集、作业、cronjobs |获取、列出、观看 |
|网络|服务、端点、入口、入口类 |获取、列出、观看 |
|存储|持久卷声明、存储类 |获取、列出、观看 |
|集群|节点、命名空间、事件、服务帐户、资源配额 |获取、列出、观看 ||配置|配置映射，秘密|获取、列出 |
|指标| |metrics.k8s.io pod/节点 |获取、列出、观看 |
|角色控制 |角色、角色绑定、集群角色、集群角色绑定 |获取、列出、观看 |
| CRD 和扩展 |自定义资源定义、租赁、缩放对象、http 路由、虚拟服务、lgps |获取、列出、观看 |

#### 功能门控权限|功能标志|资源 |额外动词|
| -------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| `config.features.configSave` |秘密(`mission-control-draft`) |创建、更新、删除 |
| `config.features.alerts` |秘密(`mission-control-alerts-*`) |创建、更新、删除 |
| `config.features.fixIssue` |豆荚 |删除 |
| `config.features.adopt` |秘密、配置映射、服务帐户、部署、状态集 |补丁|
| `config.auth.enabled` |秘密（`mission-control-auth`，设置令牌），后端状态集 |创建、更新、删除、修补 |
| `config.features.valuesOverride` |秘密(`mission-control-values-overrides`) |创建、更新、删除 |
| `config.features.deploy` |工作负载、网络、RBAC、CRD、Helm 发布秘密 |创建、更新、修补、删除|将`values.yaml`中的功能标志设置为`false`以删除相应的写入动词。禁用所有功能标志后，任务控制实际上是只读的，除了 `config.auth.enabled: true` 时的身份验证设置权限之外。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-mission-control.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>