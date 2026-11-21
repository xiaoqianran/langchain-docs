<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up a build machine on a restricted network | https://docs.langchain.com/langsmith/self-host-restricted-network-build -->

# 在受限网络上设置构建机器

配置 pip、uv、Python 和 LangGraph CLI 以从内部注册表中提取每个包、解释器和映像，然后构建一个无需公共 Internet 访问的 Python 或 JavaScript 代理服务器映像。

受限网络上的构建机器没有通往 pypi.org、npmjs.org、GitHub 或 Docker Hub 的路由。每个包、工具、解释器和容器映像都来自内部注册表，例如 Artifactory 或 Nexus。配置该计算机上的每个工具以使用内部注册表，然后使用 [LangGraph CLI](/langsmith/cli) 构建 [Agent Server](/langsmith/agent-server) 映像。

pip、uv、uv 的 Python 下载和图像构建各自读取自己的设置。配置其中一个后，其他的将指向公共互联网。按顺序完成各个部分，然后运行[Verify the setup](#verify-the-setup) 中的检查。 LangGraph CLI 是一个 Python 包，因此 JavaScript 项目也需要 pip 和 uv 设置。

> [!提示]
>
> 本页介绍了构建机器。要运行您构建的映像，请参阅[Deploy with control plane](/langsmith/deploy-with-control-plane)或[Self-host standalone servers](/langsmith/deploy-standalone-server)。有关正在运行的部署所需的出口，请参阅[Egress for billing and operational telemetry](/langsmith/self-host-egress)。

## 先决条件

在开始之前，请从您的平台团队收集以下信息：* **PyPI 存储库 URL**：代理或托管 Python 包的内部索引，在此页面上写为 `<PYPI_INDEX_URL>`。例如，`https://pypi.example.internal/simple`。
* **容器注册中心**：注册中心主机，如果有的话加上端口，写为`<DOCKER_REGISTRY>`。它必须包含代理服务器基础映像的镜像。参见[Additional images for Agent Server builds](/langsmith/self-host-mirroring-images#additional-images-for-agent-server-builds)。
* **npm 注册表 URL（仅限 JavaScript）**：代理或托管 npm 包的内部注册表，写作 `<NPM_REGISTRY_URL>`。例如，`https://npm.example.internal`。省略尾部斜杠，因为 Corepack 会向其附加路径。
* **CA 捆绑包**：内部证书颁发机构 (CA) 的 PEM 文件的路径，写作 `<CA_BUNDLE_PATH>`。内部注册表通常提供由组织自己的 CA 签名的证书，操作系统和工具默认情况下不信任这些证书。
* **根访问权限**：您在构建机器上是否有 `sudo`。如果没有 sudo，请使用此页面上的每用户文件位置。要求平台团队安装操作系统包和 CA。
* **Python 版本**：操作系统包存储库提供哪些版本。

## 信任内部 CA后面的每个步骤都通过 HTTPS 连接到内部注册表。在计算机信任内部 CA 之前，这些连接会因证书错误而失败，因此请先安装 CA：

1. 将 `<CA_BUNDLE_PATH>` 添加到操作系统信任存储区。该命令取决于操作系统。例如，在 Debian 和 Ubuntu 上，将文件复制到扩展名为 `.crt` 的 `/usr/local/share/ca-certificates/`。然后运行`sudo update-ca-certificates`。
2. 在 Linux 上，将 CA 复制到`/etc/docker/certs.d/<DOCKER_REGISTRY>/ca.crt`，以便 Docker 信任内部注册表。详细信息请参见 Docker 的[Verify repository client with certificates](https://docs.docker.com/engine/security/certificates/)。

pip 和 uv 各自需要自己的 CA 设置，在[Configure pip](#configure-pip) 和 [Configure uv](#configure-uv) 中有介绍。

## 提供Python解释器

代理服务器映像包含其自己的 Python 解释器。构建机器需要 Python 3.10 或更高版本才能运行 pip、uv 和 LangGraph CLI。从操作系统存储库安装它，例如在 RHEL 系列发行版上：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sudo dnf install python3.12
```

在某些发行版上，`venv` 作为单独的操作系统软件包提供，例如 Debian 和 Ubuntu 上的 `python3-venv`。也安装它，因为uv安装使用它。如果操作系统存储库不提供支持的 Python 版本，请参阅 uv 的 [Installing Python](https://docs.astral.sh/uv/guides/install-python/) 指南。

## 配置点子在 pip 配置文件中设置一次索引。在每个命令上作为 `--index-url` 传递的长 URL 很容易出错，并且两个标志之间缺少空格会产生误导性的 `404`。

创建`~/.config/pip/pip.conf`。要将设置应用于计算机上的每个用户，请创建 `/etc/pip.conf`：

```ini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[global]
index-url = <PYPI_INDEX_URL>
cert = <CA_BUNDLE_PATH>
```

* **`index-url`**：替换 pypi.org 作为包索引。
* **`cert`**：CA 包 pip 用于验证索引。较旧的 pip 版本不会读取操作系统信任存储，因此请明确设置它。

如果索引使用纯 HTTP，请添加 `trusted-host = <host>` 和索引主机名。有关文件位置和密钥的完整列表，请参阅 pip 的 [Configuration](https://pip.pypa.io/en/stable/topics/configuration/) 文档。

## 从内部索引安装 uv

从内部索引将 uv 作为 Python 包安装。 uv 安装脚本 (`curl ... | sh`) 无法在受限网络上运行，因为它从 `releases.astral.sh` 或 GitHub 下载 uv 二进制文件。

PyPI 将 uv 作为包含二进制文件的轮子进行托管。将 uv 安装到它自己的虚拟环境中，这样它就不会接触系统 Python。然后将二进制文件链接到您的`PATH`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python3 -m venv ~/.local/share/uv-bootstrap
~/.local/share/uv-bootstrap/bin/pip install uv
mkdir -p ~/.local/bin
ln -s ~/.local/share/uv-bootstrap/bin/uv ~/.local/bin/uv
ln -s ~/.local/share/uv-bootstrap/bin/uvx ~/.local/bin/uvx
```

`pip install` 读取上一节中的 `pip.conf`，因此它会针对 `<PYPI_INDEX_URL>` 进行解析。

`uv self update` 仅适用于由安装脚本安装的 uv。要升级此 uv，请运行 `~/.local/share/uv-bootstrap/bin/pip install --upgrade uv`。

## 配置紫外线uv 不读取 `pip.conf` 或 `PIP_INDEX_URL`。如果没有自己的设置，uv 会针对 pypi.org 进行解析。

在 shell 配置文件中设置以下内容一次，例如 `~/.bashrc`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export UV_DEFAULT_INDEX="<PYPI_INDEX_URL>"
export UV_SYSTEM_CERTS=true
export UV_PYTHON_DOWNLOADS=never
```

* **`UV_DEFAULT_INDEX`**：替换 pypi.org 作为默认索引。
* **`UV_SYSTEM_CERTS`**：从操作系统信任存储加载证书，该存储保存内部 CA。默认情况下，uv 仅信任其捆绑的根。
* **`UV_PYTHON_DOWNLOADS`**：阻止 uv 下载 Python，因此它使用 `PATH` 上的解释器。如果没有它，uv 会尝试从 GitHub 下载缺少的解释器，并且在受限网络上，请求在重试 3 次后会失败。

> [!注意]
>
> `UV_SYSTEM_CERTS` 需要 uv 0.11.0 或更高版本。早期版本使用`UV_NATIVE_TLS=true`，后来的版本仍然接受它并带有弃用警告。

要仅信任内部 CA，请设置 `SSL_CERT_FILE=<CA_BUNDLE_PATH>` 代替 `UV_SYSTEM_CERTS`。 `SSL_CERT_FILE` 取代了 uv 的捆绑根和操作系统信任存储。对于每个设置，请参阅 uv 的 [environment variable reference](https://docs.astral.sh/uv/reference/environment/)。

## 构建代理服务器镜像

映像构建在 Docker 内部运行，因此构建计算机上的 pip 和 uv 设置以及操作系统信任存储不适用于它。而是在 `langgraph.json` 中设置基础镜像、包注册表和内部 CA。

准备构建：

1. 安装LangGraph CLI。它针对 `UV_DEFAULT_INDEX` 进行解析：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   uv tool install langgraph-cli
   ```2.登录内部注册表：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   docker login <DOCKER_REGISTRY>
   ```

3. 将 CA 包复制到项目目录中`langgraph.json` 旁边。构建只能从项目目录复制文件：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   cp <CA_BUNDLE_PATH> internal-ca.pem
   ```

然后按照适合您的项目语言的步骤进行操作。

### 构建一个Python项目

> [!警告]
>
> 不要单独依赖`pip_config_file`。 CLI默认安装`uv pip install`的依赖项（`pip_installer`设置为`auto`），uv不读取pip配置文件。然后构建针对 pypi.org 进行解析并失败。将 `pip_installer` 设置为 `pip` 也无法解决此问题：安装服务器包的步骤仍然读取默认索引。改为在 `dockerfile_lines` 中设置 `UV_DEFAULT_INDEX` 构建参数。

构建图像：

1. 在`langgraph.json`中设置`base_image`和`dockerfile_lines`：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
     "dependencies": ["."],
     "graphs": {
       "agent": "./agent.py:graph"
     },
     "python_version": "3.12",
     "base_image": "<DOCKER_REGISTRY>/langchain/langgraph-api",
     "dockerfile_lines": [
       "COPY internal-ca.pem /tmp/internal-ca.pem",
       "RUN cat /tmp/internal-ca.pem >> /etc/ssl/certs/ca-certificates.crt && rm /tmp/internal-ca.pem",
       "ARG SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt",
       "ARG UV_DEFAULT_INDEX=<PYPI_INDEX_URL>"
     ]
   }
   ```* **`base_image`**：代理服务器镜像，不带标签。当您设置它们时，CLI 会附加一个由 `python_version` 构建的标签，加上 `api_version` 或 `image_distro`。通过上述配置，构建会拉取`<DOCKER_REGISTRY>/langchain/langgraph-api:3.12`，因此该标签必须存在于注册表中。
   * **`dockerfile_lines`**：在 `FROM` 之后插入 CLI 行。 `COPY` 和 `RUN` 行将内部 CA 附加到映像的系统 CA 捆绑包中，从而保留公共根。这两行 `ARG` 行适用于构建中的每个安装步骤，包括从 `uv.lock` 文件安装。 `SSL_CERT_FILE` 将 uv 指向系统包，否则 uv 会忽略该包，`UV_DEFAULT_INDEX` 将 uv 指向内部索引。 `ARG` 值在 `docker history` 中可见，因此请勿将凭据放入 `<PYPI_INDEX_URL>` 中。

   如果索引使用来自公共 CA 的证书，请省略 `COPY`、`RUN` 和 `SSL_CERT_FILE` 行。如果代理在运行时调用内部 HTTPS 服务，请参阅[Trust the internal CA at runtime](#trust-the-internal-ca-at-runtime)。

2. 构建镜像：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   langgraph build -t my-agent
   ```

### 构建一个 JavaScript 项目

构建使用与项目的锁定文件匹配的包管理器来安装包。 Node.js 不会读取系统 CA 包，因此构建通过 `NODE_EXTRA_CA_CERTS` 信任内部 CA。

构建图像：

1. 在`langgraph.json`中设置`base_image`和`dockerfile_lines`：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
     "dependencies": ["."],
     "graphs": {
       "agent": "./src/agent.ts:graph"
     },
     "node_version": "20",
     "base_image": "<DOCKER_REGISTRY>/langchain/langgraphjs-api",
     "dockerfile_lines": [
       "COPY internal-ca.pem /etc/ssl/certs/internal-ca.pem",
       "ARG NODE_EXTRA_CA_CERTS=/etc/ssl/certs/internal-ca.pem",
       "ARG NPM_CONFIG_REGISTRY=<NPM_REGISTRY_URL>"
     ]
   }
   ```* **`base_image`**：镜像的 JavaScript Agent Server 映像，不带标签。通过上述配置，构建会拉取`<DOCKER_REGISTRY>/langchain/langgraphjs-api:20`，因此该标签必须存在于注册表中。
   * **`dockerfile_lines`**：`COPY` 行将内部 CA 放入镜像中，`NODE_EXTRA_CA_CERTS` 将其添加到 Node.js 信任的根中。 `NPM_CONFIG_REGISTRY` 将 npm 和 pnpm 指向内部注册表。 `ARG` 值在 `docker history` 中可见，因此请勿将凭据放入 `<NPM_REGISTRY_URL>` 中。

   如果注册表使用来自公共 CA 的证书，请省略 `COPY` 和 `NODE_EXTRA_CA_CERTS` 行。

2. 添加包管理器的设置。该镜像通过 Corepack 运行 pnpm 和 Yarn，Corepack 会从 npm 注册表下载包管理器本身：

   * **npm** （`package-lock.json`，或无锁定文件）：无其他设置。即使 `package-lock.json` 记录公共 URL，npm 也会从 `NPM_CONFIG_REGISTRY` 获取。
   * **pnpm** (`pnpm-lock.yaml`)：将`"ARG COREPACK_NPM_REGISTRY=<NPM_REGISTRY_URL>"`添加到`dockerfile_lines`。将 pnpm 固定在`package.json`，例如`"packageManager": "pnpm@9.15.9"`。
   * **纱线 1** (`yarn.lock`)：添加相同的`COREPACK_NPM_REGISTRY`线，并固定纱线，例如`"packageManager": "yarn@1.22.22"`。 Yarn 1 从 `yarn.lock` 中记录的 URL 下载，因此针对 `<NPM_REGISTRY_URL>` 重新生成锁定文件。
   * **Yarn 2 或更高版本** (`yarn.lock`)：将 `NPM_CONFIG_REGISTRY` 行替换为 `"ARG YARN_NPM_REGISTRY_SERVER=<NPM_REGISTRY_URL>"`，添加 `COREPACK_NPM_REGISTRY` 行，并固定 Yarn，例如 `"packageManager": "yarn@4.9.2"`。构建将整个项目目录复制到映像中，包括任何 `.npmrc` 文件。不要将注册表令牌存储​​在项目`.npmrc`中。

3. 构建镜像：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   langgraph build -t my-agent
   ```

### 在运行时信任内部 CA

`ARG` 值仅在构建映像时应用，并且正在运行的容器不会继承它们。如果您的代理在运行时调用内部 HTTPS 服务，请使用 `ENV` 声明 CA 设置，以便运行的代理信任内部 CA：

* **Python**：将 `SSL_CERT_FILE` 行从 `ARG` 更改为 `ENV`。基于 `httpx` 构建的客户端会阅读它。如果您的代理使用`requests`，还要添加`"ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt"`，因为`requests`会忽略`SSL_CERT_FILE`。
* **JavaScript**：将 `NODE_EXTRA_CA_CERTS` 行从 `ARG` 更改为 `ENV`。

对于每个 `langgraph.json` 键，请参阅 [LangGraph CLI configuration file](/langsmith/cli#configuration-file) 参考。

## 验证设置

设置后和每个工作会话开始时运行这些检查。每一项检查都会确认一个部分并显示预期的输出。

### 检查 CA 信任

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -sS -o /dev/null -w '%{http_code}\n' <PYPI_INDEX_URL>/
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
200
```

此处的证书错误意味着 CA 不在操作系统信任存储中。

### 检查点

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
python3 -m pip download --no-deps -d /tmp/pip-check idna
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Looking in indexes: <PYPI_INDEX_URL>
Collecting idna
...
Successfully downloaded idna
```

第一行必须显示`<PYPI_INDEX_URL>`。如果缺少，则 pip 使用的是 pypi.org。

### 检查 uv 安装

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv --version
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv 0.13.0
```输出显示已安装的版本。 `command not found` 错误意味着 `~/.local/bin` 不在您的 `PATH` 上。

### 检查 uv 配置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
echo idna | uv pip compile - --emit-index-url
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# This file was autogenerated by uv via the following command:
#    uv pip compile - --emit-index-url
--index-url <PYPI_INDEX_URL>

idna==3.20
```

`--index-url` 行必须显示 `<PYPI_INDEX_URL>`，并且已解析的版本确认 TLS 有效。

### 检查Python解释器

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv python find 3.12
```

输出是解释器的路径，例如`/usr/bin/python3.12`。要确认缺少的版本会立即失败：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv venv --python 3.99 /tmp/uv-check
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
error: No interpreter found for Python 3.99 in managed installations or search path
```

### 检查镜像构建

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dockerfile Dockerfile
grep -E '^(FROM|COPY|RUN cat|ARG|ENV (SSL_CERT_FILE|REQUESTS_CA_BUNDLE|NODE_EXTRA_CA_CERTS))' Dockerfile
```

对于 Python 项目：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
FROM <DOCKER_REGISTRY>/langchain/langgraph-api:3.12
COPY internal-ca.pem /tmp/internal-ca.pem
RUN cat /tmp/internal-ca.pem >> /etc/ssl/certs/ca-certificates.crt && rm /tmp/internal-ca.pem
ARG SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ARG UV_DEFAULT_INDEX=<PYPI_INDEX_URL>
```

对于使用 npm 的 JavaScript 项目：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
FROM <DOCKER_REGISTRY>/langchain/langgraphjs-api:20
COPY internal-ca.pem /etc/ssl/certs/internal-ca.pem
ARG NODE_EXTRA_CA_CERTS=/etc/ssl/certs/internal-ca.pem
ARG NPM_CONFIG_REGISTRY=<NPM_REGISTRY_URL>
```

`FROM` 必须命名内部注册表，并且 `dockerfile_lines` 中的每一行都必须存在。如果您将 [runtime trust](#trust-the-internal-ca-at-runtime) 的 CA 行更改为 `ENV`，它们会显示 `ENV` 代替 `ARG`。

## 后续步骤

`langgraph build` 将镜像保留在构建机器上。运行它：

* **[Push the image](/langsmith/deploy-with-control-plane#step-3-push-to-container-registry)**：将映像推送到集群或主机可以从中提取的注册表。
* **[Deploy with control plane](/langsmith/deploy-with-control-plane#step-4-deploy-with-the-control-plane-ui)**：在LangSmith UI 中从推送的镜像创建部署。
* **[Self-host standalone servers](/langsmith/deploy-standalone-server)**：在 Kubernetes、Docker 或 Docker Compose 上运行没有控制平面的映像。
* **[Egress for billing and operational telemetry](/langsmith/self-host-egress)**：允许正在运行的部署需要的出口，或询问离线（气隙）许可证。
* **[Custom TLS certificates](/langsmith/self-host-custom-tls-certificates)**：在您的 LangSmith 安装中安装内部 CA。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-restricted-network-build.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。