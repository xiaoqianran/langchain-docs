<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Skills | https://docs.langchain.com/oss/javascript/deepagents/skills -->

# 技能

了解如何通过技能扩展深度代理的能力

技能将工作流程、最佳实践、脚本、参考文档和模板等领域专业知识打包到可重用目录中。代理在启动时获取内容摘要，并仅在相关时发现和读取所包含的文件。

技能通过在启动时仅加载摘要并在任务需要时阅读完整说明来帮助您避免上下文膨胀。您可以跨代理和项目共享技能，并在单个代理中组合多种技能，以便每项技能都涵盖不同的功能。

<Note>
  技能需要`deepagents>=1.7.0`。
</Note>

<Tip>
  有关提高代理在 LangChain 生态系统任务中的性能的即用型技能，请参阅 [LangChain Skills](https://github.com/langchain-ai/langchain-skills) 存储库。
</Tip>

## 用法

<Steps>
  <Step title="Create a top-level skills directory">
    创建一个目录来保存项目的所有技能，例如后端根目录下的`skills/`。
  </Step><Step title="Create a subdirectory inside your skills directory for your skill">
    每个技能都是一个包含 `SKILL.md` 文件的目录：一个包含 YAML [frontmatter](#frontmatter-fields)（`name` 和 `description`）的 Markdown 文件，后面是激活技能时代理遵循的说明。技能目录还可以选择包含支持文件，例如脚本、参考文档和模板。

    <Tree>
      <Tree.Folder name="skills">
        <Tree.Folder name="langgraph-docs">
          <Tree.File name="SKILL.md" />

          <Tree.Folder name="scripts">
            <Tree.File name="fetch_docs.py" />
          </Tree.Folder>

          <Tree.Folder name="references">
            <Tree.File name="api-patterns.md" />

            <Tree.File name="style-guide.md" />
          </Tree.Folder>

          <Tree.Folder name="assets">
            <Tree.File name="report-template.md" />

            <Tree.File name="schema.json" />
          </Tree.Folder>
        </Tree.Folder>
      </Tree.Folder>
    </Tree>

    深厚的代理技能遵循[Agent Skills specification](https://agentskills.io/specification)。
  </Step>

  <Step title="Add a ⟦T36⟧ file with YAML frontmatter and instructions.">
    `SKILL.md` 以 YAML [frontmatter](#frontmatter-fields) 开头，后跟 markdown 指令：

    ```md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    ---
    name: langgraph-docs
    description: Use this skill for requests related to LangGraph in order to fetch relevant documentation to provide accurate, up-to-date guidance.
    ---

    # langgraph-docs

    ## Overview

    This skill explains how to access LangGraph documentation to help answer questions and guide implementation.

    ## Instructions

    ### 1. Fetch the documentation index

    Use the fetch_url tool to read the following URL:
    https://docs.langchain.com/llms.txt

    This provides a structured list of all available documentation with descriptions.

    ### 2. Select relevant documentation

    Based on the question, identify 2-4 most relevant documentation URLs from the index. Prioritize:

    - Specific how-to guides for implementation questions
    - Core concept pages for understanding questions
    - Tutorials for end-to-end examples
    - Reference docs for API details

    ### 3. Fetch and synthesize

    Use the fetch_url tool to read the selected documentation URLs, then answer the user's question. Give a direct answer first, include the minimum necessary context, and link to the source pages rather than quoting long passages.
    ```

    <Note>
      引用 `SKILL.md` 中的任何 [supporting resources](#add-supporting-resources)，并说明每个文件包含的内容以及何时使用它。代理通过技能说明中的引用发现这些文件。
    </Note>
  </Step>

  <Step title="Pass the skills path when creating your agent">
    创建代理时，在 `skills` 参数中传递顶级技能目录的路径：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, FilesystemBackend } from "deepagents";

    const backend = new FilesystemBackend({ rootDir: process.cwd() });

    const agent = await createDeepAgent({
      model: "anthropic:claude-sonnet-4-6",
      backend,
      skills: ["/skills/"],
    });
    ```此示例使用 `FilesystemBackend` 从磁盘加载技能。有关其他存储选项，包括从远程源加载技能，请参阅[Backends and remote skill loading](#backends-and-remote-skill-loading)。

    <ParamField type="list[str]">
      技能来源路径列表。

      路径必须使用正斜杠指定，并且相对于后端的根目录。

      * 如果省略，则不加载任何技能。
      * 使用`StateBackend`（默认）时，提供带有`invoke(files={...})`的技能文件。使用`deepagents.backends.utils`中的`create_file_data()`来格式化文件内容；不支持原始字符串。
      * 对于`FilesystemBackend`，技能是相对于后端的`root_dir`从磁盘加载的。

      对于具有相同名称的技能，较晚的来源会覆盖较早的来源（最后一个获胜）。

      <Note>
        当多个技能源包含同名技能时，`skills` 数组中后面列出的源中的技能优先（最后一个获胜）。这使您可以对来自不同来源的技能进行分层，例如被特定于项目的版本覆盖的基本技能。
      </Note>
    </ParamField>
  </Step><Step title="Invoke the agent">
    使用`invoke()`向代理发送任务。启动时，代理将每个技能的 [⟦T49⟧](#frontmatter-fields) 和 [⟦T50⟧](#frontmatter-fields) 从 [frontmatter](#frontmatter-fields) 加载到系统提示符中。当您的任务与技能的描述相匹配时，代理会读取该技能的 `SKILL.md` 并遵循其说明。

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const result = await agent.invoke(
      { messages: [{ role: "user", content: "What is LangGraph?" }] },
      { configurable: { thread_id: "1" } },
    );
    ```
  </Step>
</Steps>

## 技能如何发挥作用

随着代理承担更复杂的任务，他们需要的上下文也随之增长。将所有指令加载到系统提示中会在与当前任务无关的信息上浪费令牌，并且跨会话手动提供相同的指导无法扩展。

<Info>
  技能使用**渐进式披露**：代理分层加载技能信息，而不是一次性加载全部技能信息。启动时，它只会看到每个技能的名称和描述。当调用技能时，它会读取完整的`SKILL.md`指令。仅当指令需要时，才会加载支持文件。
</Info>

技能负载分为三个级别。每个级别仅在任务需要时添加更多细节：|水平|加载什么 |当 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **1.元数据** | [⟦T53⟧](#frontmatter-fields) 和 [⟦T54⟧](#frontmatter-fields) 来自 `SKILL.md` [frontmatter](#frontmatter-fields) |代理启动，针对每个配置的技能 |
| **2.说明** | `SKILL.md`全身|当技能被调用时 |
| **3.资源** | [Supporting files](#add-supporting-resources) 位于 `scripts/`、`references/` 和 `assets/` |调用后根据需要，当指令引用它们时 |下图显示了给定时刻代理上下文中出现的内容。启动时，每个技能的 1 级元数据都在系统提示中。当调用技能时，2 级指令会加入上下文。 3 级文件保留在后端，直到代理在调用后读取它们。

<div>
  <img alt="How skill components map into agent context at startup and activation" />
</div>

当代理完成任务时，它会分层加载技能信息：

<div>
  <img alt="How skills load in layers from metadata to instructions to resources" />
</div>

在 Deep Agents 中，[⟦T60⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware)（当您通过`skills`时，[Deep Agents stack](/oss/javascript/deepagents/customization#deep-agents-stack)的一部分）处理前两个级别，第三个级别由 LLM 处理：

1. **发现**（级别1）：在代理启动时，中间件扫描配置的技能路径，解析每个`SKILL.md`[frontmatter](#frontmatter-fields)，并将[⟦T63⟧](#frontmatter-fields)和[⟦T64⟧](#frontmatter-fields)字段注入系统提示符中。
2. **读取**（级别2）：当代理调用技能时，它会通过`read_file`读取完整的`SKILL.md`内容。
3. **执行**（级别 3）：调用后，代理遵循技能的指示，仅根据指示要求读取支持文件（脚本、参考、资产）。

## 何时使用技能如果您发现自己向客服人员发出类似的指示，特别是如果这些指示很详细且包含多个步骤，请考虑将针对客服人员的指示编成文字。这样，将来当你想要完成类似的任务时，代理就已经知道该怎么做了。

<Tip>
  您还可以要求您的代理为您与代理一起完成的任务编写技能。
</Tip>

技能对于编码特别有帮助：

* **分步工作流程**：跨越多个步骤的工作流程，类似于菜谱。
* **特定领域的知识**：指导代理如何使用工作流程工具。例如，包括有关从何处提取信息的信息，包括该技能可以访问的其他参考信息或脚本。
* **带有可执行代码的指令**：将程序与代理可以运行的脚本或模块捆绑在一起，因此它遵循经过测试的逻辑，而不是每次都从指令重新生成。参见[Execute code with skills](#execute-code-with-skills)。
* **指南**：向代理提供有关要遵守的护栏的支持说明。例如，遵循特定的格式或风格指南，或者指定始终将测试作为工作流程的一部分运行。

## 写出有效的技巧[Agent Skills specification](https://agentskills.io/specification) 包括有关构建可靠发现和激活技能的指导。以下建议建立在该基础上，并提供了深度代理的实用模式。

**保持 [frontmatter](#frontmatter-fields) 简洁**，并将 `SKILL.md` 正文保持在 5,000 个令牌以下。每个技能的前文都会在[discovery](#how-skills-work)处添加到系统提示中，而全文只有在激活时才会被读取。保持两个层都较小意味着您可以加载许多技能，而不会拥挤上下文窗口。

**编写具体描述。** 在 [discovery](#how-skills-work) 期间，[⟦T68⟧](#frontmatter-fields) 字段是代理看到的每个技能的唯一信息。良好的描述可以告诉代理该技能的作用以及何时激活它，并使用代理可以匹配的特定关键字：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Good: specific about what and when
description: >-
  Extract text and tables from PDF files, fill PDF forms, and merge
  multiple PDFs. Use when working with PDF documents or when the user
  mentions PDFs, forms, or document extraction.

# Poor: too vague for reliable matching
description: Helps with PDFs.
```

当您在相关领域拥有多种技能时，请清楚地区分它们的描述。重叠的描述会导致代理激活错误的技能或在选项之间犹豫不决。如果两项技能具有相似的用途，请将它们合并为一项。**保持指令集中。** 代理技能规范建议将 `SKILL.md` 保持在 500 行以下。当指令变长时，将详细参考资料移至[supporting resource files](#add-supporting-resources)并从主`SKILL.md`中引用：

<Tree>
  <Tree.Folder name="skills">
    <Tree.Folder name="data-pipeline">
      <Tree.File name="SKILL.md" />

      <Tree.Folder name="references">
        <Tree.File name="schema-reference.md" />

        <Tree.File name="error-codes.md" />
      </Tree.Folder>
    </Tree.Folder>
  </Tree.Folder>
</Tree>

代理仅在指令需要时才加载参考文件，从而保持渐进公开的每一层的大小适当。将文件引用保持在距`SKILL.md`深一层的位置，并避免深度嵌套的引用链，这会迫使代理通过多次读取来获取所需的信息。

**代理的结构说明。** 将您的 `SKILL.md` 正文写为代理可以遵循的清晰说明：

* **多步骤工作流程的分步程序**
* **选择方法的决策标准**
* **预期输入和输出的示例**，以便代理知道成功是什么样子
* **边缘情况** 代理应处理或标记给用户**管理技能数量。** 较少的范围明确的技能胜过许多重叠的技能。随着具有相似描述的技能数量的增加，代理选择正确技能的能力就会下降。如果您发现自己拥有许多相关技能，请考虑：

* 将相关能力整合为一项技能，其中每个子任务都有相应的部分
* 使用参考文件保持主要`SKILL.md`简洁，同时涵盖多个子任务

<Tip>
  使用 [⟦T74⟧ validation tool](https://github.com/agentskills/agentskills/tree/main/skills-ref) 检查您的 `SKILL.md` [frontmatter](#frontmatter-fields) 是否遵循代理技能规范命名和格式约定。
</Tip>

## 添加支持资源

除了`SKILL.md`之外，技能目录还可以包含任何其他文件或目录。 [Agent Skills specification](https://agentskills.io/specification) 为公共资源类型定义了三个可选目录。 Deep Agents 在发现或激活时不会加载这些文件。仅当您的 `SKILL.md` 指令要求时，代理才会读取或执行它们。

### `scripts/`

`scripts/` 目录保存代理可以运行的可执行代码，例如 API 客户端、数据转换或验证检查。脚本应该：

* 是独立的或清楚地记录依赖关系
* 包括有用的错误消息
* 优雅地处理边缘情况支持的语言取决于您的代理设置。常见选项包括 Python、Bash 和 JavaScript 或 TypeScript。要执行脚本而不仅仅是读取它们，请参阅[Execute code with skills](#execute-code-with-skills)。当代理需要 shell 时使用[sandbox scripts](#sandbox-scripts)。

### `references/`

`references/` 目录包含代理按需阅读的补充文档。将其用于对于 `SKILL.md` 来说过于详细但仍针对特定任务的材料，例如：

* `REFERENCE.md` 详细技术参考
* `FORMS.md` 适用于表单模板或结构化数据格式
* 特定领域指南（`finance.md`、`legal.md` 等）

保持各个参考文件的重点。代理仅在需要时加载它们，因此较小的文件使用较少的上下文。

### `assets/`

`assets/`目录保存代理使用但不需要读取为指令的静态资源，例如：

* 文档或配置模板
* 图片（图表、示例）
* 数据文件（查找表、模式）

在`SKILL.md`中描述代理应何时打开或复制每个资产。

### 来自`SKILL.md`的参考文件

当您引用支持文件时，请使用相对于技能根的路径：

```md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
For API details, see the [reference guide](references/api-patterns.md).

To extract tables from a PDF, run:
scripts/extract.py
```对于您引用的每个文件，请说明其包含的内容以及代理应何时使用它。将参考文献保留在`SKILL.md`深一层。避免深度嵌套的引用链，这会迫使代理通过多次读取来获取所需的信息。

## 后端和远程技能加载

Deep Agents 支持不同的后端，具体取决于您想要如何存储和管理技能文件：

* `StateBackend`：为当前线程存储LangGraph代理状态的文件。
* `StoreBackend`：将文件存储在 LangGraph 存储中，以实现持久的跨线程存储。
* `FilesystemBackend`：在可配置的`root_dir`下从磁盘读取和写入技能文件。

<Tabs>
  <Tab title="StateBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, StateBackend, type FileData } from "deepagents";
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const backend = new StateBackend();

    function createFileData(content: string): FileData {
      const now = new Date().toISOString();
      return {
        content: content.split("\n"),
        created_at: now,
        modified_at: now,
      };
    }

    const skillsFiles: Record<string, FileData> = {};
    const skillUrl =
      "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";
    const response = await fetch(skillUrl);
    const skillContent = await response.text();

    skillsFiles["/skills/langgraph-docs/SKILL.md"] = createFileData(skillContent);

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      checkpointer, // Required !
      // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
      skills: ["/skills/"],
    });

    const config = { configurable: { thread_id: `thread-${Date.now()}` } };
    const result = await agent.invoke(
      {
        messages: [{ role: "user", content: "what is langraph?" }],
        files: skillsFiles,
      },
      config,
    );
    ```
  </Tab>

  <Tab title="StoreBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
    import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const store = new InMemoryStore();
    const backend = new StoreBackend({
      namespace: () => ["filesystem"],
    });

    function createFileData(content: string): FileData {
      const now = new Date().toISOString();
      return {
        content: content.split("\n"),
        created_at: now,
        modified_at: now,
      };
    }

    const skillUrl =
      "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";

    const response = await fetch(skillUrl);
    const skillContent = await response.text();
    const fileData = createFileData(skillContent);

    await store.put(["filesystem"], "/skills/langgraph-docs/SKILL.md", fileData);

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      store,
      checkpointer,
      // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
      skills: ["/skills/"],
    });

    const config = {
      recursionLimit: 50,
      configurable: { thread_id: `thread-${Date.now()}` },
    };
    const result = await agent.invoke(
      { messages: [{ role: "user", content: "what is langraph?" }] },
      config,
    );
    ```
  </Tab>

  <Tab title="FilesystemBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, FilesystemBackend } from "deepagents";
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const backend = new FilesystemBackend({ rootDir: process.cwd() });

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      skills: ["./examples/skills/"],
      interruptOn: {
        read_file: true,
        write_file: true,
        delete_file: true,
      },
      checkpointer, // Required!
    });

    const config = { configurable: { thread_id: `thread-${Date.now()}` } };
    const result = await agent.invoke(
      { messages: [{ role: "user", content: "what is langraph?" }] },
      config,
    );
    ```
  </Tab>
</Tabs>

## 运行时加载技能

当您拥有大量技能但只有一小部分与给定运行相关时，请根据运行时上下文（例如用户角色、租户或请求类型）选择要加载的技能。主要有两种方法：

### 动态技能列表

最简单的方法是在创建代理之前构造`skills`数组。根据您拥有的运行时上下文选择要包含的技能路径：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";

const SKILLS_BY_ROLE: Record<string, string[]> = {
  engineering: [
    "/skills/code-review/",
    "/skills/testing/",
    "/skills/deployment/",
  ],
  data: [
    "/skills/sql-analysis/",
    "/skills/visualization/",
    "/skills/data-pipeline/",
  ],
  support: ["/skills/ticket-triage/", "/skills/runbook/"],
};

function createAgentForUser(userRole: string) {
  return createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    skills: SKILLS_BY_ROLE[userRole] ?? [],
  });
}
```当技能存储在磁盘上或共享后端中并且您只需要控制代理看到哪些技能时，这种方法效果很好。技能本身并不重复——您维护一份副本并改变每次运行的传递路径。

<Note>
  SDK仅加载您在`skills`中传递的源。它不会自动扫描 CLI 目录，例如 `~/.deepagents/...` 或 `~/.agents/...`。

  有关 CLI 存储约定，请参阅[App data](/oss/deepagents/code/configuration#data-locations)。

  <Accordion title="Emulating CLI source order in SDK">
    如果您希望在 SDK 代码中进行 CLI 样式分层，请按照从低到高的优先顺序显式传递所有所需的源：

    ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    [
    "<user-home>/.deepagents/{agent}/skills/",
    "<user-home>/.agents/skills/",
    "<project-root>/.deepagents/skills/",
    "<project-root>/.agents/skills/",
    ]
    ```

    然后在创建代理时将该有序列表作为 `skills` 传递。
  </Accordion>
</Note>

### 命名空间技能

对于独立管理每个用户技能集的多租户应用程序，将 `/skills/` 路由到具有命名空间工厂的 [StoreBackend](https://reference.langchain.com/javascript/deepagents/backends/StoreBackend)。仅使用用户应有权访问的技能填充每个命名空间，并且中间件在运行时解析为正确的设置：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createDeepAgent,
  CompositeBackend,
  StateBackend,
  StoreBackend,
} from "deepagents";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-4-6",
  skills: ["/skills/"],
  backend: new CompositeBackend(new StateBackend(), {
    "/skills/": new StoreBackend({
      namespace: (ctx) => [
        ctx.assistantId ?? "default",
        ctx.config?.configurable?.user_id ?? "anonymous",
      ],
    }),
  }),
});
```

当不同的用户或租户需要可以单独更新的完全独立的技能库时，此模式非常有用。有关开箱即用地处理技能访问、共享和工作区级别可见性的托管解决方案，请参阅[Fleet skills](/langsmith/fleet/skills)。## 下级代理的技能

当您使用[subagents](/oss/javascript/deepagents/subagents)时，您可以配置每种类型可以访问哪些技能：

* **通用子代理**：当您将`skills`传递给`create_deep_agent`时，自动继承主代理的技能。无需额外配置。
* **自定义子代理**：不继承主代理的技能。将 `skills` 参数添加到每个子代理定义以及该子代理的技能源路径。

技能状态完全隔离：主代理的技能对子代理不可见，子代理的技能对主代理不可见。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent } from "deepagents";

const researchSubagent = {
  name: "researcher",
  description: "Research assistant with specialized skills",
  systemPrompt: "You are a researcher.",
  tools: [webSearch],
  skills: ["/skills/research/", "/skills/web-search/"], // Subagent-specific skills
};

const agent = await createDeepAgent({
  model: "google_genai:gemini-3.6-flash",
  skills: ["/skills/main/"], // Main agent and GP subagent get these
  subagents: [researchSubagent], // Researcher gets only its own skills
});
```

有关子代理配置和技能继承的更多信息，请参阅[Subagents](/oss/javascript/deepagents/subagents)。

## 技能权限

生产部署通常需要控制三件事：每个用户可以看到哪些技能、代理是否可以修改技能文件以及写入是否需要人工批准。您可以使用 `skills` 参数和 [backend routing](#backends-and-remote-skill-loading) 控制可见性，使用 [filesystem permissions](/oss/javascript/deepagents/permissions) 控制访问，并使用 [⟦T106⟧](/oss/javascript/deepagents/human-in-the-loop) 进行批准或使用 `mode="interrupt"` 进行权限规则。

### 跨用户分享技能要让每个用户访问同一个精选库，请将 `/skills/` 路由到共享 [StoreBackend](https://reference.langchain.com/javascript/deepagents/backends/StoreBackend) 并从应用程序代码或管理工作流程中为其播种。使用组织范围的命名空间，以便该组织中的所有代理解析到同一商店：

* 按组织 ID 命名空间，以获取工作区范围的技能（请参阅 [Enforce read-only skills](#enforce-read-only-skills)）。
* 当每个用户需要一个独立的库时，按用户ID命名空间（[namespaced skills](#namespaced-skills)）。

使用 `/company-policies/SKILL.md` 等键和包含 `content` 和 `encoding` 字段的值为商店播种。在从存储中读取记录之前，`/skills/` 路由前缀将被删除。

有关处理技能访问、共享和工作区级别可见性的托管解决方案，请参阅[Fleet skills](/langsmith/fleet/skills)。

您还可以组合共享库和个人库：将 `/skills/shared/` 路由到组织范围的 `StoreBackend`，将 `/skills/personal/` 路由到用户范围的后端，并在 `skills` 中传递两个路径。参见[Allow agents to edit personal skills](#allow-agents-to-edit-personal-skills)。

### 通过用户上下文限制技能

并非每个用户都应该看到所有技能。根据角色、租户或其他请求上下文控制运行时加载哪些技能。主要有两种方法：* **[Dynamic skill lists](#dynamic-skill-lists)** — 在创建代理之前构建 `skills` 数组。为不同的角色或请求类型传递不同的路径列表。当技能位于共享后端并且您按路径进行过滤时有效。
* **[Namespaced skills](#namespaced-skills)** — 使用以用户或租户 ID 为键的命名空间工厂将 `/skills/` 路由到 `StoreBackend`。仅使用身份应访问的技能填充每个命名空间。

这些模式与下面的读取和写入控件一起工作。例如，您可以为管理员提供比工程师更多的技能，同时将两个库保持为只读。

### 强制执行只读技能

要共享技能而不让代理修改它们，请将 `/skills/` 路由到共享存储，并使用 [filesystem permissions](/oss/javascript/deepagents/permissions) 拒绝 `/skills/**` 下的写入操作。代理可以发现和读取技能；只有您的应用程序代码或管理工作流程会更新商店。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { InMemoryStore } from "@langchain/langgraph";
  import {
    createDeepAgent,
    CompositeBackend,
    StateBackend,
    StoreBackend,
  } from "deepagents";

  const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    backend: new CompositeBackend(new StateBackend(), {
      "/skills/": new StoreBackend({
        namespace: (rt) => ["curated-skills", rt.context.orgId],
      }),
    }),
    skills: ["/skills/"],
    permissions: [
      {
        operations: ["write"],
        paths: ["/skills/**"],
        mode: "deny",
      },
    ],
    store,
  });
  ```
</CodeGroup>

将此用于企业知识库、批准的工具说明或共享技能包，其中代理应从集中管理的上下文中受益，但不应重写事实来源。

### 需要批准技能写入如果代理可能会写入技能文件，但您希望首先有人参与循环，请使用 [⟦T122⟧](/oss/javascript/deepagents/human-in-the-loop) 或带有 `mode="interrupt"` 的权限规则。两者都在 `write_file` 或 `edit_file` 运行之前暂停并使用相同的恢复流程。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MemorySaver } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-4-6",
  skills: ["/skills/personal/"],
  permissions: [
    {
      operations: ["write"],
      paths: ["/skills/**"],
      mode: "interrupt",
    },
  ],
  checkpointer: new MemorySaver(), // Required to pause and resume
});
```

或者，配置 `interrupt_on={"write_file": True, "edit_file": True}` 要求所有文件系统写入都需要批准，而不仅仅是技能路径。有关处理和恢复中断的信息，请参阅[Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)。

### 允许特工编辑个人技能

默认情况下，如果后端允许并且没有权限规则阻止路径，代理可以写入技能文件。让代理在不接触共享库的情况下创建或完善技能：

1. 将可写路径（例如 `/skills/personal/`）路由到用户范围的 `StoreBackend`。
2. 在 `skills` 中传递该路径（以及任何共享路径）。
3. 不要为可写路径添加`deny`规则。如果混合共享路径和个人路径 ([rule ordering](/oss/javascript/deepagents/permissions#rule-ordering))，请将更具体的规则放在更广泛的拒绝规则之前。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createDeepAgent,
  CompositeBackend,
  StateBackend,
  StoreBackend,
} from "deepagents";

const agent = await createDeepAgent({
  model: "anthropic:claude-sonnet-4-6",
  backend: new CompositeBackend(new StateBackend(), {
    "/skills/shared/": new StoreBackend({
      namespace: (rt) => ["curated-skills", rt.context.orgId],
    }),
    "/skills/personal/": new StoreBackend({
      namespace: (ctx) => [
        "user-skills",
        ctx.config?.configurable?.user_id ?? "anonymous",
      ],
    }),
  }),
  skills: ["/skills/shared/", "/skills/personal/"],
  permissions: [
    {
      operations: ["write"],
      paths: ["/skills/shared/**"],
      mode: "deny",
    },
  ],
});
```

代理使用`write_file`和`edit_file`创建或更新可写路径下的`SKILL.md`和支持文件。要捕获技能格式之外的一般学习内容，请将单独的路径（例如 `/memories/`）路由到另一个可写后端。有关路线和商店设置，请参阅[Backends](/oss/javascript/deepagents/backends)。

## 有技巧地执行代码如果没有代码执行，技能就是被动的：代理读取指令并使用可用的工具遵循它们。代码执行将技能转化为主动能力。技能可以发送经过测试的脚本，该脚本调用 API、转换数据、验证输出或运行管道，并且代理确定性地执行它，而不是每次都根据指令重新生成逻辑。这对于需要精确行为（数据转换、API 集成、合规性检查）或依赖于代理无法单独通过工具调用使用的库的工作流程尤其有价值。

技能通过[sandbox scripts](#sandbox-scripts)执行代码：代理在需要安装依赖项、运行测试、调用 CLI 或使用操作系统文件系统时运行捆绑脚本。

### 沙箱脚本

技能可以包含脚本以及 `SKILL.md` 文件。参考`SKILL.md`中的脚本，以便代理知道它们存在以及何时运行它们：

<Tree>
  <Tree.Folder name="skills">
    <Tree.Folder name="arxiv-search">
      <Tree.File name="SKILL.md" />

      <Tree.Folder name="scripts">
        <Tree.File name="search.ts" />
      </Tree.Folder>
    </Tree.Folder>
  </Tree.Folder>
</Tree>

```md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
name: arxiv-search
description: Search the arXiv preprint repository for research papers. Use when the user asks about academic papers, recent research, or scientific literature.
---

# arxiv-search

Search arXiv for papers matching the user's query.

## Instructions

1. Run `scripts/search.ts` with the user's query as an argument.
2. Parse the results and present them with title, authors, abstract summary, and link.
3. If the user asks for more detail on a specific paper, fetch the full abstract.
```

代理可以从任何后端“读取”脚本，但要“执行”它们，代理需要访问 shell，而只有 [sandbox backends](/oss/javascript/deepagents/sandboxes) 提供。[Sandbox backends](/oss/javascript/deepagents/sandboxes) 在隔离的容器中运行。存储在沙箱外部的技能文件在沙箱内部不可用，这意味着代理无法执行技能脚本或访问技能资源，除非先将其转移进来。使用[custom middleware](/oss/javascript/langchain/middleware/custom)来处理此传输：

* **`before_agent`**：从后端读取技能文件并将其上传到沙箱中，以便代理可以从头开始执行脚本。
* **`after_agent`**：从沙箱下载任何更新或新创建的技能文件并将它们写回后端，以便更改在运行中持续存在。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "openai:gpt-5.5",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { readFile, readdir } from "node:fs/promises";
  import { join, posix, relative, resolve } from "node:path";
  import { fileURLToPath } from "node:url";

  import { createMiddleware } from "langchain";
  import {
    CompositeBackend,
    createDeepAgent,
    type FileData,
    LangSmithSandbox,
    StoreBackend,
  } from "deepagents";
  import { InMemoryStore } from "@langchain/langgraph";
  import { SandboxClient } from "langsmith/sandbox";

  /** Identical skill bundles for every user: one shared store namespace. */
  const SKILLS_SHARED_NAMESPACE = ["skills", "builtin"] as const;

  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split("\n"),
      created_at: now,
      modified_at: now,
    };
  }

  function normalizeSkillsStoreKey(key: string): string {
    const k = String(key);
    if (k.includes("..") || /[*?]/.test(k)) {
      throw new Error(`Invalid key: ${key}`);
    }
    return k.startsWith("/") ? k : `/${k}`;
  }

  async function walkFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkFiles(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    return files.sort((a, b) => a.localeCompare(b));
  }

  /** Load canonical skill files from disk into the shared store namespace (run once at deploy).
   *  You can retrieve skills from any source (local filesystem, remote URL, etc.).
   */
  async function seedSkillStore(store: InMemoryStore) {
    const moduleDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const skillsDir = resolve(moduleDir, "skills");
    const filePaths = await walkFiles(skillsDir);
    for (const filePath of filePaths) {
      const rel = relative(skillsDir, filePath);
      // StoreBackend keys are paths *relative to the routed backend root*.
      // CompositeBackend strips the route prefix (`/skills/`) before delegating,
      // so store keys should look like "/<skillname>/SKILL.md".
      const key = `/${posix.normalize(rel.split("\\").join("/"))}`;
      const content = await readFile(filePath, "utf8");
      await store.put([...SKILLS_SHARED_NAMESPACE], key, createFileData(content));
    }
  }

  /** Copy shared skill files from the store into the sandbox before each agent run. */
  function createSkillSandboxSyncMiddleware(backend: CompositeBackend) {
    return createMiddleware({
      name: "SkillSandboxSyncMiddleware",
      beforeAgent: async (state, runtime) => {
        const store = (runtime as any).store;
        if (!store) {
          throw new Error(
            "Store is required for syncing skills into the sandbox. " +
              "Pass `store` to createDeepAgent and ensure your runtime provides it.",
          );
        }

        const encoder = new TextEncoder();
        const files: Array<[string, Uint8Array]> = [];

        for (const item of await store.search([...SKILLS_SHARED_NAMESPACE])) {
          const normalized = normalizeSkillsStoreKey(String(item.key));
          const data = item.value as FileData;
          // CompositeBackend routes paths and batches uploads to the right backend.
          files.push([
            `/skills${normalized}`,
            encoder.encode(data.content.join("\n")),
          ]);
        }

        if (files.length > 0) await backend.uploadFiles(files);

        return state;
      },
    });
  }

  async function main() {
    const store = new InMemoryStore();
    await seedSkillStore(store);

    const client = new SandboxClient();
    const lsSandbox = await client.createSandbox();

    const backend = new CompositeBackend(
      new LangSmithSandbox({ sandbox: lsSandbox }),
      {
        "/skills/": new StoreBackend({
          store,
          namespace: () => [...SKILLS_SHARED_NAMESPACE],
        } as any),
      },
    );

    try {
      const agent = await createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend,
        skills: ["/skills/"],
        store,
        middleware: [createSkillSandboxSyncMiddleware(backend)],
      });

    } finally {
      await client.deleteSandbox(lsSandbox.name);
    }
  }

  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  ```
</CodeGroup>

有关在执行前播种技能和记忆并在执行后同步回来的完整示例，请参阅[syncing skills and memories with custom middleware](/oss/javascript/deepagents/going-to-production#example-syncing-skills-and-memories-with-custom-middleware)。

## 故障排除

使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-skills)跟踪调试技能发现，`read_file`调用`SKILL.md`，并支持资源访问。按照[tracing quickstart](/langsmith/observability-quickstart)进行设置。我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。

### 技能未激活

**问题**：代理在没有读取技能的`SKILL.md`的情况下处理任务。

**解决方案**：1. **让描述更具体。** 代理在[discovery](#how-skills-work)单独从[⟦T142⟧](#frontmatter-fields)字段中选择技能。包括该技能的用途、何时使用它以及代理可以匹配的关键字：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   # Good
   description: >-
     Search the arXiv preprint repository for research papers. Use when the
     user asks about academic papers, recent research, or scientific literature.

   # Poor
   description: Helps with research.
   ```

2. **减少技能之间的重叠。** 如果多个技能具有相似的描述，代理可能会跳过正确的一项或选择错误的一项。区分描述或[consolidate related skills](#write-effective-skills)。

3. **确认技能位于 `skills` 数组中。** 技能仅从您在创建代理时传递的路径或子代理特定的 `skills` 参数加载。

### 启动时缺少的技能

**问题**：代理未在其系统提示中列出技能，或 `SKILL.md` 上的 `read_file` 失败。

**解决方案**：

1. **检查技能路径。** 路径必须使用正斜杠且相对于后端根目录。对于`FilesystemBackend`，路径是相对于`root_dir`的。通过`StateBackend`，使用`create_file_data()`传递`invoke(files={...})`中的技能文件。

2. **验证`SKILL.md` [frontmatter](#frontmatter-fields)。** [⟦T153⟧](#frontmatter-fields) 必须与父目录名称匹配并遵循[Agent Skills specification](https://agentskills.io/specification)。使用[⟦T154⟧ validation tool](https://github.com/agentskills/agentskills/tree/main/skills-ref)检查格式。

3. **检查文件大小。** Deep Agents 在发现过程中会跳过超过 10 MB 的 `SKILL.md` 文件。4. **分层查看来源。** 当多个来源中出现相同的技能名称时，[last source wins](#usage)。较晚的路径中的旧技能或空技能可能会覆盖您期望的技能。

### 未找到支持文件

**问题**：代理读取 `SKILL.md` 但无法访问脚本、引用或资产。

**解决方案**：

1. **来自`SKILL.md`的参考文件。** 代理不会自动发现支持文件。说明每个文件包含的内容以及何时使用它。从技能根使用[relative paths](#reference-files-from-skill-md)。

2. **将路径保留在技能目录内。** 文件路径根据后端进行解析。确认支持文件存在于您的说明引用的路径中。

3. **将技能同步到沙箱中。** 如果您使用[sandbox backends](/oss/javascript/deepagents/sandboxes)，容器外部的技能文件将不可用，直到您将其复制进去。参见[Sandbox scripts](#sandbox-scripts)和[syncing skills and memories with custom middleware](/oss/javascript/deepagents/going-to-production#example-syncing-skills-and-memories-with-custom-middleware)。

### 脚本无法运行

**问题**：代理读取脚本但无法运行它。

**解决方案**：代理可以从任何后端读取脚本，但运行它们需要[sandbox backend](/oss/javascript/deepagents/sandboxes)。参见[Execute code with skills](#execute-code-with-skills)。

### 子代理无法访问技能

**问题**：自定义子代理看不到主代理使用的技能。**解决方案**：自定义子代理不会继承主代理的技能。使用该子代理的技能源路径将 `skills` 参数添加到每个 [subagent definition](#skills-for-subagents)。通用子代理自动继承`create_deep_agent`的技能。

## 参考

### 技能、记忆力和工具

技能、[memory](/oss/javascript/deepagents/memory)（`AGENTS.md` 文件）和工具都为代理提供上下文或功能。下表总结了何时达到每个目标：

|              |技能 |内存|工具|
| ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **目的** |通过渐进式披露发现的按需功能 |启动时加载持久上下文 |代理可以调用​​的编程操作 || **加载** |仅当代理确定相关性时才读取 |在代理启动时加载 |每个回合都可用 |
| **格式** | `SKILL.md` 在命名目录中 | `AGENTS.md` 文件 |与代理绑定的功能 |
| **分层** |用户，然后项目（最后获胜）|用户，然后项目（合并）|在代理创建时定义 |
| **何时使用** |指令是特定于任务的并且可能很大 |上下文始终相关（项目惯例、偏好）|代理需要编程操作，或者无权访问文件系统 |这些是指导方针，而不是硬性界限。在实践中，技能和记忆是有一定范围的。代理可以在工作时更新自己的技能，随着时间的推移捕捉新的程序并完善指令。通过这种方式，技能可以作为一种渐进式公开记忆的形式发挥作用：代理根据需要构建和检索上下文，而不是在每个提示上加载。

### Frontmatter 字段

[Agent Skills specification](https://agentskills.io/specification) 定义了以下 frontmatter 字段：

|领域|必填|描述 |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `name` |是的 |带连字符的小写字母数字，1-64 个字符。必须与父目录名称匹配。 |
| `description` |是的 |该技能的作用是什么以及何时使用它。最多 1,024 个字符。                               |
| `license` |没有 |许可证名称或对捆绑许可证文件的引用。                                        |
| `compatibility` |没有 |环境要求（系统包、网络访问）。最多 500 个字符。             || `metadata` |没有 |附加属性的任意键值对。                                        |
| `allowed-tools` |没有 |该技能可以使用的预先批准的工具的空格分隔列表。实验性的。                 |

```md expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
---
name: langgraph-docs
description: Use this skill for requests related to LangGraph in order to fetch relevant documentation to provide accurate, up-to-date guidance.
license: MIT
compatibility: Requires internet access for fetching documentation URLs
metadata:
  author: langchain
  version: "1.0"
allowed-tools: fetch_url
---

# langgraph-docs

Instructions for the agent go here. See [Usage](#usage) for a complete example of skill instructions.
```

<Warning>
  有关详细约束和验证规则，请参阅完整的[Agent Skills specification](https://agentskills.io/specification)。在 Deep Agents 中，`SKILL.md` 文件必须小于 10 MB。超过此限制的文件在技能加载期间将被跳过。
</Warning>

有关更多示例技能，请参阅[Deep Agents example skills](https://github.com/langchain-ai/deepagentsjs/tree/main/examples/skills)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/skills.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>