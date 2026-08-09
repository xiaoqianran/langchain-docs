<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Permissions | https://docs.langchain.com/oss/javascript/deepagents/permissions -->

# 权限

使用深度代理的声明性权限规则控制文件系统访问

使用声明性权限规则控制代理可以读取或写入哪些文件和目录。将规则列表传递给`permissions=`，代理的内置文件系统工具会尊重它们。

<Note>
  权限需要`deepagents>=1.9.1`。
</Note>

权限仅适用于内置文件系统工具（`ls`、`read_file`、`glob`、`grep`、`write_file`、`edit_file`）。不包括访问文件系统的自定义工具和 MCP 工具。权限也不适用于[sandbox backends](/oss/javascript/deepagents/sandboxes)，它支持通过`execute`工具执行任意命令。

<Tip>
  当您需要在内置文件系统工具上使用**基于路径的允许/拒绝规则**时，请使用`permissions`。当您需要自定义验证逻辑（速率限制、审核日志记录、内容检查）或需要控制自定义工具时，请使用[backend policy hooks](/oss/javascript/deepagents/backends#add-policy-hooks)。
</Tip>

## 基本用法

将`FilesystemPermission`规则列表传递给`createDeepAgent`。规则按声明顺序进行评估。第一个匹配的规则获胜。如果没有规则匹配，则允许该操作。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  model,
  backend,
  permissions: [
    {
      operations: ["write"],
      paths: ["/**"],
      mode: "deny",
    },
  ],
});
if (!agent) throw new Error("basic: agent not created");
```

## 规则结构

每个`FilesystemPermission`有三个字段：|领域 |类型 |描述 |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `operations` | `("read" \| "write")[]` |此规则适用于操作。 `"read"` 涵盖`ls`、`read_file`、`glob`、`grep`。 `"write"` 涵盖`write_file`、`edit_file`。      |
| `paths` | `string[]` |用于匹配文件路径的全局模式（例如，`["/workspace/**"]`）。支持`**`递归匹配和`{a,b}`交替。 |
| `mode` | `"allow" \| "deny"` |是否允许或拒绝匹配操作。默认为`"allow"`。                                                                 |

规则使用first-match-wins评估：`operations`和`paths`与当前调用匹配的第一条规则决定结果。如果没有规则匹配，则**允许**（允许的默认值）。

路径必须是绝对路径（以`/`开头）并且不能包含`..`或`~`。无效路径会在代理构建时抛出。

## 示例

### 隔离到工作区目录仅允许在 `/workspace/` 下读取和写入，并拒绝其他所有内容：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  model,
  backend,
  permissions: [
    {
      operations: ["read", "write"],
      paths: ["/workspace/**"],
      mode: "allow",
    },
    {
      operations: ["read", "write"],
      paths: ["/**"],
      mode: "deny",
    },
  ],
});
if (!agent) throw new Error("isolate-workspace: agent not created");
```

### 保护特定文件

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  model,
  backend,
  permissions: [
    {
      operations: ["read", "write"],
      paths: ["/workspace/.env", "/workspace/examples/**"],
      mode: "deny",
    },
    {
      operations: ["read", "write"],
      paths: ["/workspace/**"],
      mode: "allow",
    },
    {
      operations: ["read", "write"],
      paths: ["/**"],
      mode: "deny",
    },
  ],
});
if (!agent) throw new Error("protect-files: agent not created");
```

### 只读存储器

允许代理读取内存文件，但阻止其修改它们。这对于仅应由应用程序代码更新的组织范围的策略或共享知识库非常有用。有关更多上下文，请参阅[read-only vs writable memory](/oss/javascript/deepagents/memory#read-only-vs-writable-memory)。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const store = new InMemoryStore();
const agent = createDeepAgent({
  model,
  backend: new CompositeBackend(new StateBackend(), {
    "/memories/": new StoreBackend({
      namespace: (rt) => [rt.serverInfo.user.identity],
    }),
    "/policies/": new StoreBackend({
      namespace: (rt) => [rt.context.orgId],
    }),
  }),
  permissions: [
    {
      operations: ["write"],
      paths: ["/memories/**", "/policies/**"],
      mode: "deny",
    },
  ],
  store,
});
if (!agent) throw new Error("read-only-memory: agent not created");
```

### 拒绝所有访问

阻止所有读取和写入。这是一个限制性基线，您可以在其上分层更具体的允许规则：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  model,
  backend,
  permissions: [
    {
      operations: ["read", "write"],
      paths: ["/**"],
      mode: "deny",
    },
  ],
});
if (!agent) throw new Error("deny-all: agent not created");
```

### 规则排序

由于首场比赛获胜，规则顺序很重要。将更具体的规则放在更广泛的规则之前：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const correctPermissions: FilesystemPermission[] = [
  { operations: ["read", "write"], paths: ["/workspace/.env"], mode: "deny" },
  {
    operations: ["read", "write"],
    paths: ["/workspace/**"],
    mode: "allow",
  },
  { operations: ["read", "write"], paths: ["/**"], mode: "deny" },
];

const incorrectPermissions: FilesystemPermission[] = [
  {
    operations: ["read", "write"],
    paths: ["/workspace/**"],
    mode: "allow",
  },
  {
    operations: ["read", "write"],
    paths: ["/workspace/.env"],
    mode: "deny",
  },
  { operations: ["read", "write"], paths: ["/**"], mode: "deny" },
];
```

## 子代理权限

[Subagents](/oss/javascript/deepagents/subagents)默认继承父代理的权限。要为子代理提供不同的权限，请在其规范中设置 `permissions` 字段。这完全取代了父母的规则。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createDeepAgent({
  model,
  backend,
  permissions: [
    {
      operations: ["read", "write"],
      paths: ["/workspace/**"],
      mode: "allow",
    },
    { operations: ["read", "write"], paths: ["/**"], mode: "deny" },
  ],
  subagents: [
    {
      name: "auditor",
      description: "Read-only code reviewer",
      systemPrompt: "Review the code for issues.",
      permissions: [
        { operations: ["write"], paths: ["/**"], mode: "deny" },
        { operations: ["read"], paths: ["/workspace/**"], mode: "allow" },
        { operations: ["read"], paths: ["/**"], mode: "deny" },
      ],
    },
  ],
});
if (!agent) throw new Error("subagent: agent not created");
```

要显式授予子代理不受限制的访问权限，请设置 `permissions: []`。空数组会无限制地覆盖父规则。省略 `permissions` 从父级继承。

## 复合后端当使用具有沙箱默认值的 `CompositeBackend` 时，每个权限路径的范围必须位于已知的路由前缀下。沙箱支持任意命令执行，因此仅基于路径的限制无法阻止通过 shell 命令访问文件系统。将权限范围限定为特定于路由的[backends](/oss/javascript/deepagents/backends)可以避免这种冲突。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const sandbox = new StateBackend();
const memoriesBackend = new StateBackend();
const composite = new CompositeBackend(sandbox, {
  "/memories/": memoriesBackend,
});
const agent = createDeepAgent({
  model,
  backend: composite,
  permissions: [
    { operations: ["write"], paths: ["/memories/**"], mode: "deny" },
  ],
});
if (!agent) throw new Error("composite-backend: agent not created");
```

包含在构建时抛出的任何路线之外的路径的权限：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const sandbox = new StateBackend();
const memoriesBackend = new StateBackend();
const composite = new CompositeBackend(sandbox, {
  "/memories/": memoriesBackend,
});

createDeepAgent({
  model,
  backend: composite,
  permissions: [
    { operations: ["write"], paths: ["/workspace/**"], mode: "deny" },
  ],
});

createDeepAgent({
  model,
  backend: composite,
  permissions: [{ operations: ["read"], paths: ["/**"], mode: "deny" }],
});
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/permissions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>