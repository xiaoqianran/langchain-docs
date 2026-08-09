<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage contexts with the SDK | https://docs.langchain.com/langsmith/manage-contexts-sdk -->

# 使用 SDK 管理上下文

使用 LangSmith SDK 以编程方式在 Context Hub 中推送、拉取、列出和删除代理和技能存储库。

使用 LangSmith [Python](/langsmith/smith-python-sdk) 和 [TypeScript](/langsmith/smith-js-ts-sdk) SDK 以编程方式管理 [Context Hub](/langsmith/use-the-context-hub) 中的 **代理存储库** 和 **技能存储库**。 [Push](#push-an-agent) CI 的新版本，[pull](#pull-an-agent) 最新版本或运行时固定的提交，将上下文注入到您的代理中，并使用其他方法来 [check existence](#check-whether-a-repo-exists)、[list and search](#list-agents-and-skills) 存储库和 [delete](#delete-an-agent-or-skill) 您不再需要的内容。

<Note>
  Context Hub 方法需要 `langsmith>=0.7.35` (Python) 和 `langsmith>=0.5.23` (TypeScript)。
</Note>

## 设置

1.安装包：

   <CodeGroup>
     ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     pip install -U langsmith
     ```

     ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     uv add langsmith
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     yarn add langsmith
     ```
   </CodeGroup>

2.配置环境变量。如果您的环境中已设置 [⟦T22⟧](/langsmith/create-account-api-key)，请跳过此步骤。否则，请在 LangSmith 中的 **设置 > API 密钥 > 创建 API 密钥** 中创建一个，然后将其设置为环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="lsv2_..."
   ```

<Note>
  **Python 异步：** 本页显示的所有方法也可在 `AsyncClient`（从 `langsmith` 导入）上使用，具有相同的签名 - 每次调用只需 `await`。 TypeScript SDK 默认是异步的；没有单独的异步客户端。
</Note>

## 推送代理创建新的代理存储库或提交现有代理存储库的新版本。如果
该存储库尚不存在，它是使用您提供的元数据创建的
（`description`、`readme`、`tags`、`is_public`）。如果它已经存在，
这些字段仅在显式传递时才进行修补。

该方法返回一个指向 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-manage-contexts-sdk) 中新提交的 URL：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client
  from langsmith.schemas import FileEntry

  client = Client()

  url = client.push_agent(
      "email-assistant",
      files={
          "AGENTS.md": FileEntry(
              content="You are an email triage assistant.",
          ),
          "tools.json": FileEntry(content='{"tools": []}'),
      },
      description="Triages and drafts replies to incoming email.",
      tags=["email", "productivity"],
      is_public=False,
  )
  print(url)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const url = await client.pushAgent("email-assistant", {
    files: {
      "AGENTS.md": {
        type: "file",
        content: "You are an email triage assistant.",
      },
      "tools.json": { type: "file", content: '{"tools": []}' },
    },
    description: "Triages and drafts replies to incoming email.",
    tags: ["email", "productivity"],
    isPublic: false,
  });
  console.log(url);
  ```
</CodeGroup>

## 推送一个技能

与`push_agent`相同的表面，但致力于技能回购。使用
这是其他代理可以依赖的可重用功能：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client
  from langsmith.schemas import FileEntry

  client = Client()

  url = client.push_skill(
      "deep-research",
      files={
          "SKILL.md": FileEntry(content="Conduct deep multi-step research."),
      },
      description="Multi-step web research with citations.",
      tags=["research"],
  )
  print(url)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const url = await client.pushSkill("deep-research", {
    files: {
      "SKILL.md": {
        type: "file",
        content: "Conduct deep multi-step research.",
      },
    },
    description: "Multi-step web research with citations.",
    tags: ["research"],
  });
  console.log(url);
  ```
</CodeGroup>

### 链接到其他存储库

`files` 中的条目可以是指向的链接，而不是内联文件内容
另一个代理或技能存储库，可让您在不重复的情况下编写上下文
跨存储库的内容。例如，委托共享技能的代理。

如果省略 `commit_id`，当您推送此提交时，LangSmith 会链接到该存储库的最新提交。如果链接的存储库稍后更新，LangSmith 会将该更新传播到引用它的父存储库。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client
  from langsmith.schemas import AgentEntry, FileEntry, SkillEntry

  client = Client()

  url = client.push_agent(
      "email-assistant",
      files={
          "AGENTS.md": FileEntry(content="You are an email triage assistant."),
          # Link to the deep-research skill repo. Omit commit_id to always
          # resolve to the latest version, or pin it for reproducibility.
          "skills/research": SkillEntry(repo_handle="deep-research"),
          # Link to another agent repo.
          "agents/scheduler": AgentEntry(repo_handle="calendar-agent"),
      },
  )
  print(url)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const url = await client.pushAgent("email-assistant", {
    files: {
      "AGENTS.md": { type: "file", content: "You are an email triage assistant." },
      // Link to the deep-research skill repo. Omit commit_id to always
      // resolve to the latest version, or pin it for reproducibility.
      "skills/research": { type: "skill", repo_handle: "deep-research" },
      // Link to another agent repo.
      "agents/scheduler": { type: "agent", repo_handle: "calendar-agent" },
    },
  });
  console.log(url);
  ```
</CodeGroup>

## 推送参数

`push_agent` / `pushAgent` 和 `push_skill` / `pushSkill` 都接受以下参数：|参数|类型 |描述 |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier` | `string` |存储库的标识符。                                                                                                                                              |
| `files` | `dict[str, Entry \| None]` | `Entry` 的文件路径映射。通过 `None` / `null` 删除本次提交中的路径。                                                                                  |
| `parent_commit` / `parentCommit` | `string`（可选）|乐观并发的父提交哈希前缀。提供时必须为 8-64 个字符。如果与最新提交不匹配，API 将返回 409 冲突。 || `description` | `string`（可选）|回购描述。在创建时设置或在更新时修补。                                                                                                             |
| `readme` | `string`（可选）|回购自述文件内容。                                                                                                                                                |
| `tags` | `string[]`（可选）|回购标签。                                                                                                                                                          |
| `is_public` / `isPublic` | `boolean`（可选）|存储库是否可公开发现。                                                                                                                          |

## 拉一个代理

拉取代理存储库的快照。默认返回最新提交；通过 `version` 传递提交哈希或标签（或将其嵌入到标识符中作为 `owner/name:version`）以拉取特定版本：

<Note>
  **标识符格式**：`identifier`参数接受三种形式：* `name`：针对当前工作区所有者进行解析。
  * `owner/name`：完全合格。
  * `owner/name:version`：固定到特定的提交哈希或标签。

  可选的 `version` 参数会覆盖嵌入的任何版本
  标识符。如果两者均未提供，则返回最新提交。
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  agent = client.pull_agent("email-assistant")
  print(agent.commit_hash)
  print(list(agent.files))

  # Pull a specific commit.
  pinned = client.pull_agent("email-assistant", version="7ca95573")

  # Pull a tagged commit (for example, the production tag).
  prod = client.pull_agent("email-assistant:production")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const agent = await client.pullAgent("email-assistant");
  console.log(agent.commit_hash);
  console.log(Object.keys(agent.files));

  // Pull a specific commit.
  const pinned = await client.pullAgent("email-assistant", {
    version: "7ca95573",
  });

  // Pull a tagged commit.
  const prod = await client.pullAgent("email-assistant:production");
  ```
</CodeGroup>

## 拉一个技能

提取技能存储库的快照。与 `pull_agent` 工作方式相同，但返回 `SkillContext`：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  skill = client.pull_skill("deep-research")
  print(skill.files["SKILL.md"].content)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  const skill = await client.pullSkill("deep-research");
  const skillFile = skill.files["SKILL.md"];
  if (skillFile.type === "file") {
    console.log(skillFile.content);
  }
  ```
</CodeGroup>

## 拉取参数

`pull_agent` / `pullAgent` 和 `pull_skill` / `pullSkill` 都接受以下参数：

|参数|类型 |描述 |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------ |
| `identifier` | `string` |存储库的标识符。可能包括内联版本：`owner/name:version`。   |
| `version` | `string`（可选）|提交要拉取的哈希值或标签。覆盖标识符中嵌入的任何版本。 |

`pull_agent` 返回`AgentContext`； `pull_skill` 返回`SkillContext`。

## 检查repo是否存在

使用这些方法检查您的代理或技能存储库中是否存在
推或拉之前的工作空间：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  if client.agent_exists("email-assistant"):
      print("agent already exists")

  if not client.skill_exists("deep-research"):
      print("skill not found")
  ``````typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  if (await client.agentExists("email-assistant")) {
    console.log("agent already exists");
  }

  if (!(await client.skillExists("deep-research"))) {
    console.log("skill not found");
  }
  ```
</CodeGroup>

## 列出代理和技能

列出任一类型的存储库，并带有用于可见性、存档状态和搜索查询的可选过滤器：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  # Python returns a paginated response.
  result = client.list_agents(limit=20, query="email")
  for repo in result.repos:
      print(repo.repo_handle)

  skills = client.list_skills(is_public=True)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  // TypeScript yields one repo at a time, auto-paginating.
  for await (const repo of client.listAgents({ query: "email" })) {
    console.log(repo.repo_handle);
  }

  for await (const skill of client.listSkills({ isPublic: true })) {
    console.log(skill.repo_handle);
  }
  ```
</CodeGroup>

|参数|类型 |描述 |
| ---------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| `limit` | `int`（仅限 Python）|每页返回的最大存储库数量。默认为 100。
| `offset` | `int`（仅限 Python）|要跳过的存储库数量。默认为 0。
| `is_public` / `isPublic` | `boolean`（可选）|过滤为仅公共（或仅私人）存储库。                        |
| `is_archived` / `isArchived` | `boolean`（可选）|按存档状态过滤。默认为`False`。                        |
| `query` | `string`（可选）|跨存储库句柄、所有者句柄、描述和标签进行搜索查询。 |<Note>
  Python 的 `list_agents` / `list_skills` 返回一个带有显式分页响应对象
  `limit` 和 `offset` 用于手动分页。 TypeScript 的 `listAgents` / `listSkills`
  返回一个 `AsyncIterableIterator` ，它会自动处理分页
  消耗它。
</Note>

## 删除代理或技能

<Warning>
  此操作是永久性的且无法撤消。也删除存储库
  删除其拥有的子文件存储库。
</Warning>

从您的工作区删除代理或技能存储库：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  client.delete_agent("email-assistant")
  client.delete_skill("deep-research")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  await client.deleteAgent("email-assistant");
  await client.deleteSkill("deep-research");
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/manage-contexts-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>