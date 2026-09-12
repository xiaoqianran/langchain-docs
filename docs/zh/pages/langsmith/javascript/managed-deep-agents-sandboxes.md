<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add a sandbox to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-sandboxes -->

# 将沙箱添加到托管Deep Agents

沙箱为托管深度代理提供了一个隔离的文件系统和 shell，用于处理文件、运行代码和执行命令。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

将沙箱声明放在`sandbox/`下。仅当您想要配置快照时才添加 `sandbox/setup.sh`：



```text
my-agent/
  agent.ts
  sandbox/
    index.ts
    setup.sh   # optional
```


完整的项目布局请参见[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

## 配置沙箱

当代理需要写入文件、运行代码或执行 shell 命令时，请使用沙箱。

`mda init` 搭建沙箱声明。托管 Deep Agents 仅在 `sandbox/` 目录存在时启用沙箱。

`mda init` 不会创建 `setup.sh`。如果快照要安装包、克隆树或以其他方式更改映像，请自行添加该文件。

托管 Deep Agents 为此后端使用 [LangSmith Sandboxes](/langsmith/sandboxes)。重用始终是每个耐用线程一个沙箱。



使用 `defineSandbox` 声明沙箱：

```ts sandbox/index.ts
import { defineSandbox } from "managed-deepagents";

export const sandbox = defineSandbox({
  idleTtlSeconds: 600,
  defaultTimeout: 600,
});
```

|选项|默认 |描述 |
| --- | --- | --- |
| `idleTtlSeconds` | `600` |沙箱及其内容被删除之前不活动的秒数。删除是不可恢复的。 |
| `defaultTimeout` | `600` |每个命令允许的秒数。 |


## 配置快照如果`sandbox/setup.sh`存在，`mda deploy`和`mda dev`运行脚本一次并将生成的环境保存为快照。该运行的修改（例如克隆的存储库和安装的包）会保留在快照中。新线程克隆该快照而不是运行`setup.sh`。快照将被重复使用，直到 `setup.sh` 发生变化，此时它会被重建。

该脚本使用 `bash -e` 运行。非零退出会使快照和部署或`mda dev`会话失败。 LangSmith 不会将实时部署更新到失败的快照。任何先前成功的快照都将继续提供服务。

```bash sandbox/setup.sh
#!/usr/bin/env bash
set -euo pipefail

apt-get update && apt-get install -y jq
mkdir -p /workspace
```

当 `setup.sh` 运行时，向前部署的项目 `.env` 值可用作环境变量，例如用于克隆私有存储库的令牌。克隆快照的线程沙箱不会继承这些变量。 `setup.sh` 运行时不要将机密写入文件系统；磁盘上的任何内容都是每个线程映像的一部分。

编辑 `setup.sh` 并重新部署不会擦除活动线程上的 `/workspace`。这些盒子保存着他们已有的文件。新线程克隆新快照。

## 选择烘焙底料在没有烘焙基础的情况下，LangSmith的默认沙箱模板是起点。要从其他内容开始，请准确设置其中之一：



|选项|使用 |
| --- | --- |
| `snapshotName` | LangSmith 快照名称。允许使用标签。 |
| `snapshotId` | LangSmith 快照 ID。 |
| `dockerImage` |发布的 Docker 镜像。 |

```ts sandbox/index.ts
import { defineSandbox } from "managed-deepagents";

export const sandbox = defineSandbox({
  idleTtlSeconds: 600,
  dockerImage: "python:3.12-slim",
});
```


对于私有图像，传递图像和`registry`。托管Deep Agents在烘焙时创建或更新部署拥有的主机注册表。仅编译变量名；凭证值不会进入构建或快照。



在`passwordEnv`中命名密码：

```ts sandbox/index.ts
import { defineSandbox } from "managed-deepagents";

export const sandbox = defineSandbox({
  dockerImage: "ghcr.io/acme/agent-base:1",
  registry: {
    url: "ghcr.io",
    username: "octocat",
    passwordEnv: "GHCR_TOKEN",
  },
});
```


将`GHCR_TOKEN`放入项目`.env`或流程环境中。烘焙后，托管 Deep Agents 不会将该值转发到正在运行的代理服务器。

## 代理如何使用沙箱

该代理使用内置文件系统工具，例如[⟦T35⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)、[⟦T36⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)、[⟦T37⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)、[⟦T38⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)、[⟦T39⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)、[⟦T40⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)和[⟦T41⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)，并使用[⟦T42⟧](/oss/javascript/deepagents/tools#built-in-harness-tools)运行shell命令。使用[instructions](/langsmith/javascript/managed-deep-agents-instructions)指定代理应该在哪里工作以及不能修改什么。

## 禁用沙箱

删除`sandbox/`目录以选择退出，例如仅需要提示、内存和工具的代理。对于现有部署，使用 `mda delete` 删除部署还会删除与其关联的托管沙箱、`{deployment}--setup-*` 配方快照以及部署拥有的注册表（如果存在）。

## 部署

托管Deep Agents拥有沙箱命名、配方烘焙、重用、恢复和清理。每个持久线程都有自己的沙箱，从当前配方快照克隆。有关平台级生命周期的详细信息，请参阅[Sandboxes](/langsmith/sandboxes)。

## 何时使用沙箱

|目标|使用 |
| --- | --- |
|隔离地写入文件、运行代码或执行 shell 命令 |沙盒|
|跨线程存储持久知识 | [Memory](/langsmith/javascript/managed-deep-agents-memory) |
|无需文件系统即可实现始终在线的行为 | [Instructions](/langsmith/javascript/managed-deep-agents-instructions) |

有关更多信息，请参阅[Project structure](/langsmith/javascript/managed-deep-agents-project-structure)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>