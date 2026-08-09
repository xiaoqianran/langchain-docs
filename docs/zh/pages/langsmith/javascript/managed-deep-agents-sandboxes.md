<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add a sandbox to Managed Deep Agents | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-sandboxes -->

# 将沙箱添加到托管深度代理

为托管深度代理配置隔离的文件系统和 shell。

代理在执行工作时通常需要编写或执行代码。
沙箱为托管深度代理提供了一个隔离的文件系统和 shell，用于处理文件、运行代码和执行命令。

<Note>
  托管深度代理在 **公共 [beta](/langsmith/release-stages)** 中提供，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 项目结构

将代理入口点保留在项目根目录并将沙箱声明保留在`sandbox/`下：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
my-agent/
  agent.ts
  sandbox/
    index.ts
```

## 配置沙箱

`mda init` 搭建沙箱声明。仅当 `sandbox/` 目录存在时，托管深度代理才会启用沙箱。删除目录以选择退出，例如仅需要提示、内存和工具的代理。

使用 `define_sandbox` (Python) 或 `defineSandbox` (TypeScript) 声明沙箱。托管深度代理为此后端使用 [LangSmith Sandboxes](/langsmith/sandboxes)：

```ts sandbox/index.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineSandbox } from "managed-deepagents";

export const sandbox = defineSandbox({
  scope: "thread",
  idleTtlSeconds: 600,
  defaultTimeout: 600,
});
```

LangSmith 使用其默认沙箱模板，除非您设置自定义模板或快照。只设置一个创建源。

使用`templateName`或`snapshotId`设置创建源。

## 选择范围|范围 |行为 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `thread`（默认）|为每个持久线程创建一个沙箱，并在该线程上的运行中重复使用它。 |
| `agent` |跨代理进程处理的线程共享一个沙箱。                       |

<Warning>
  代理范围的沙箱允许线程读取和修改相同的文件。仅将其用于有意共享的状态。
</Warning>

使用`idleTtlSeconds`来控制何时可以回收空闲沙箱。使用`defaultTimeout`来绑定每个命令。

## 代理如何使用沙箱

该代理使用`ls`、`read_file`、`write_file`、`edit_file`、`glob`和`grep`等文件系统工具，并使用`execute`运行shell命令。使用`instructions.md`指定代理应该在哪里工作以及不能修改什么。

## 沙箱生命周期

Managed Deep Agents 拥有沙箱命名、重用、恢复和清理功能。使用 `mda delete` 删除部署也会删除与其关联的托管沙箱。有关平台级生命周期的详细信息，请参阅[Sandboxes](/langsmith/sandboxes)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-sandboxes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>