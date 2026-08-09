<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a SQL assistant with on-demand skills | https://docs.langchain.com/oss/javascript/langchain/multi-agent/skills-sql-assistant -->

# 构建具有按需技能的 SQL 助手

本教程展示如何使用**渐进式披露**（一种上下文管理技术，其中代理按需加载信息而不是预先加载信息）来实现**技能**（基于提示的专门指令）。代理通过工具调用加载技能，而不是动态更改系统提示，仅发现并加载每个任务所需的技能。

**用例：** 想象一下构建一个代理来帮助在大型企业中跨不同业务垂直领域编写 SQL 查询。您的组织可能为每个垂直行业拥有单独的数据存储，或者具有数千个表的单个整体数据库。无论哪种方式，预先加载所有模式都会淹没上下文窗口。渐进式公开通过在需要时仅加载相关模式来解决这个问题。该架构还使不同的产品所有者和利益相关者能够独立贡献和维护其特定业务垂直领域的技能。**您将构建什么：** 具有两项技能（销售分析和库存管理）的 SQL 查询助手。代理在其系统提示中看到轻量级技能描述，然后仅在与用户查询相关时通过工具调用加载完整的数据库模式和业务逻辑。

<Note>
  有关具有查询执行、纠错和验证功能的 SQL 代理的完整示例，请参阅我们的[SQL Agent tutorial](/oss/javascript/langchain/sql-agent)。本教程重点介绍可应用于任何领域的渐进式披露模式。
</Note>

<Tip>
  渐进式披露被 Anthropic 推广为一种构建可扩展代理技能系统的技术。这种方法使用三级架构（元数据→核心内容→详细资源），其中代理仅根据需要加载信息。有关此技术的更多信息，请参阅[Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)。
</Tip>

## 它是如何工作的

以下是用户请求 SQL 查询时的流程：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#E5F4FF','primaryTextColor':'#030710','primaryBorderColor':'#006DDD','lineColor':'#40668D','secondaryColor':'#F6FFDB','tertiaryColor':'#FDF3FF','tertiaryBorderColor':'#7E65AE','tertiaryTextColor':'#504B5F'}}}%%
flowchart TD
    Start([💬 User: Write SQL query<br/>for high-value customers]) --> SystemPrompt[📋 Agent sees skill descriptions:<br/>• sales_analytics<br/>• inventory_management]

    SystemPrompt --> Decide{🤔 Need sales schema}

    Decide --> LoadSkill[🔧 load_skill<br/>'sales_analytics']

    LoadSkill --> Schema[📊 Schema loaded:<br/>customers, orders tables<br/>+ business logic]

    Schema --> WriteQuery[✍️ Agent writes SQL query<br/>using schema knowledge]

    WriteQuery --> Response([✅ Returns valid SQL<br/>following business rules])

    %% Styling for light and dark modes
    classDef startEnd fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef decision fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef enrichment fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Start,Response startEnd
    class SystemPrompt,LoadSkill,WriteQuery process
    class Decide decision
    class Schema enrichment
```

**为什么渐进式披露：*** **减少上下文使用** - 仅加载任务所需的 2-3 个技能，而不是所有可用技能
* **实现团队自治** - 不同的团队可以独立开发专业技能（类似于其他多代理架构）
* **有效扩展** - 添加数十或数百项技能，而无需压倒上下文
* **简化对话历史记录** - 单个代理具有一个对话线程

**什么是技能：** 正如克劳德·代码 (Claude Code) 所推广的那样，技能主要是基于提示的：针对特定业务任务的专门指令的独立单元。在 Claude Code 中，技能被公开为文件系统上包含文件的目录，通过文件操作发现。技能通过提示指导行为，并可以提供有关工具使用情况的信息或包括供编码代理执行的示例代码。

<Tip>
  渐进式披露的技能可以被视为[RAG (Retrieval-Augmented Generation)](/oss/javascript/deepagents/rag)的一种形式，其中每个技能都是一个检索单元——尽管不一定由嵌入或关键字搜索支持，但由浏览内容的工具（如文件操作或本教程中的直接查找）支持。
</Tip>

**权衡：*** **延迟**：按需加载技能需要额外的工具调用，这会增加需要每种技能的第一个请求的延迟
* **工作流程控制**：基本实现依靠提示来指导技能使用 - 如果没有自定义逻辑，您无法强制执行诸如“始终在技能 B 之前尝试技能 A”之类的硬约束

<Tip>
  **实施自己的技能系统**

  在构建您自己的技能实现时（正如我们在本教程中所做的那样），核心概念是渐进式披露 - 按需加载信息。除此之外，您在实施方面拥有完全的灵活性：

  * **存储**：数据库、S3、内存数据结构或任何后端
  * **发现**：直接查找（本教程）、大型技能集合的 RAG、文件系统扫描或 API 调用
  * **加载逻辑**：自定义延迟特征并添加逻辑以搜索技能内容或排名相关性
  * **副作用**：定义加载技能时会发生什么，例如暴露与该技能相关的工具（第 8 节中介绍）

  这种灵活性使您可以针对性能、存储和工作流程控制方面的特定要求进行优化。
</Tip>

## 设置

### 安装本教程需要`langchain`包：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add langchain
  ```
</CodeGroup>

欲了解更多详情，请参阅我们的[Installation guide](/oss/javascript/langchain/install)。

### 朗史密斯

设置 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-skills-sql-assistant) 来检查代理内部发生的情况。然后设置以下环境变量：

<CodeGroup>
  ```bash Shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_TRACING="true"
  export LANGSMITH_API_KEY="..."
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  process.env.LANGSMITH_TRACING = "true";
  process.env.LANGSMITH_API_KEY = "...";
  ```
</CodeGroup>

### 选择法学硕士

从 LangChain 的集成套件中选择聊天模型：

<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/javascript/integrations/chat/openai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/openai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/openai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.OPENAI_API_KEY = "your-api-key";

      const model = await initChatModel("gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatOpenAI } from "@langchain/openai";

      const model = new ChatOpenAI({
        model: "gpt-5.5",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/javascript/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/anthropic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/anthropic
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/anthropic
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add @langchain/anthropic
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.ANTHROPIC_API_KEY = "your-api-key";

      const model = await initChatModel("claude-sonnet-4-6");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatAnthropic } from "@langchain/anthropic";

      const model = new ChatAnthropic({
        model: "claude-sonnet-4-6",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/javascript/integrations/chat/azure/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/azure
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/azure
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/azure
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/azure
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.AZURE_OPENAI_API_KEY = "your-api-key";
      process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
      process.env.OPENAI_API_VERSION = "your-api-version";

      const model = await initChatModel("azure_openai:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { AzureChatOpenAI } from "@langchain/openai";

      const model = new AzureChatOpenAI({
        model: "gpt-5.5",
        azureOpenAIApiKey: "your-api-key",
        azureOpenAIApiEndpoint: "your-endpoint",
        azureOpenAIApiVersion: "your-api-version"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/javascript/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/google-genai
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/google-genai
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/google-genai
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      process.env.GOOGLE_API_KEY = "your-api-key";

      const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        apiKey: "your-api-key"
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Bedrock Converse">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/javascript/integrations/chat/bedrock_converse/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/aws
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/aws
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/aws
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = await initChatModel("bedrock:gpt-5.5");
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatBedrockConverse } from "@langchain/aws";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = new ChatBedrockConverse({
        model: "gpt-5.5",
        region: "us-east-2"
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 1. 定义技能首先，定义技能的结构。每个技能都有名称、简要描述（在系统提示中显示）和完整内容（按需加载）：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { z } from "zod";

// A skill that can be progressively disclosed to the agent
const SkillSchema = z.object({  // [!code highlight]
  name: z.string(),  // Unique identifier for the skill
  description: z.string(),  // 1-2 sentence description to show in system prompt
  content: z.string(),  // Full skill content with detailed instructions
});

type Skill = z.infer<typeof SkillSchema>;
```

现在定义 SQL 查询助手的示例技能。这些技能的设计是**描述轻量级**（预先向代理显示），但**内容详细**（仅在需要时加载）：

<Accordion title="View complete skill definitions">
  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { context } from "langchain";

  const SKILLS: Skill[] = [
    {
      name: "sales_analytics",
      description:
        "Database schema and business logic for sales data analysis including customers, orders, and revenue.",
      content: context`
      # Sales Analytics Schema

      ## Tables

      ### customers
      - customer_id (PRIMARY KEY)
      - name
      - email
      - signup_date
      - status (active/inactive)
      - customer_tier (bronze/silver/gold/platinum)

      ### orders
      - order_id (PRIMARY KEY)
      - customer_id (FOREIGN KEY -> customers)
      - order_date
      - status (pending/completed/cancelled/refunded)
      - total_amount
      - sales_region (north/south/east/west)

      ### order_items
      - item_id (PRIMARY KEY)
      - order_id (FOREIGN KEY -> orders)
      - product_id
      - quantity
      - unit_price
      - discount_percent

      ## Business Logic

      **Active customers**:
      status = 'active' AND signup_date <= CURRENT_DATE - INTERVAL '90 days'

      **Revenue calculation**:
      Only count orders with status = 'completed'.
      Use total_amount from orders table, which already accounts for discounts.

      **Customer lifetime value (CLV)**:
      Sum of all completed order amounts for a customer.

      **High-value orders**:
      Orders with total_amount > 1000

      ## Example Query

      -- Get top 10 customers by revenue in the last quarter
      SELECT
          c.customer_id,
          c.name,
          c.customer_tier,
          SUM(o.total_amount) as total_revenue
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      WHERE o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY c.customer_id, c.name, c.customer_tier
      ORDER BY total_revenue DESC
      LIMIT 10;`,
    },
    {
      name: "inventory_management",
      description:
        "Database schema and business logic for inventory tracking including products, warehouses, and stock levels.",
      content: context`
      # Inventory Management Schema

      ## Tables

      ### products
      - product_id (PRIMARY KEY)
      - product_name
      - sku
      - category
      - unit_cost
      - reorder_point (minimum stock level before reordering)
      - discontinued (boolean)

      ### warehouses
      - warehouse_id (PRIMARY KEY)
      - warehouse_name
      - location
      - capacity

      ### inventory
      - inventory_id (PRIMARY KEY)
      - product_id (FOREIGN KEY -> products)
      - warehouse_id (FOREIGN KEY -> warehouses)
      - quantity_on_hand
      - last_updated

      ### stock_movements
      - movement_id (PRIMARY KEY)
      - product_id (FOREIGN KEY -> products)
      - warehouse_id (FOREIGN KEY -> warehouses)
      - movement_type (inbound/outbound/transfer/adjustment)
      - quantity (positive for inbound, negative for outbound)
      - movement_date
      - reference_number

      ## Business Logic

      **Available stock**:
      quantity_on_hand from inventory table where quantity_on_hand > 0

      **Products needing reorder**:
      Products where total quantity_on_hand across all warehouses is less
      than or equal to the product's reorder_point

      **Active products only**:
      Exclude products where discontinued = true unless specifically analyzing discontinued items

      **Stock valuation**:
      quantity_on_hand * unit_cost for each product

      ## Example Query

      -- Find products below reorder point across all warehouses
      SELECT
          p.product_id,
          p.product_name,
          p.reorder_point,
          SUM(i.quantity_on_hand) as total_stock,
          p.unit_cost,
          (p.reorder_point - SUM(i.quantity_on_hand)) as units_to_reorder
      FROM products p
      JOIN inventory i ON p.product_id = i.product_id
      WHERE p.discontinued = false
      GROUP BY p.product_id, p.product_name, p.reorder_point, p.unit_cost
      HAVING SUM(i.quantity_on_hand) <= p.reorder_point
      ORDER BY units_to_reorder DESC;`,
    },
  ];
  ```
</Accordion>

## 2.创建技能加载工具

创建一个工具来按需加载完整的技能内容：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { z } from "zod";

const loadSkill = tool(  // [!code highlight]
  async ({ skillName }) => {
    // Find and return the requested skill
    const skill = SKILLS.find((s) => s.name === skillName);
    if (skill) {
      return `Loaded skill: ${skillName}\n\n${skill.content}`;  // [!code highlight]
    }

    // Skill not found
    const available = SKILLS.map((s) => s.name).join(", ");
    return `Skill '${skillName}' not found. Available skills: ${available}`;
  },
  {
    name: "load_skill",
    description: `Load the full content of a skill into the agent's context.

Use this when you need detailed information about how to handle a specific
type of request. This will provide you with comprehensive instructions,
policies, and guidelines for the skill area.`,
    schema: z.object({
      skillName: z.string().describe("The name of the skill to load"),
    }),
  }
);
```

`load_skill` 工具以字符串形式返回完整的技能内容，该内容作为 ToolMessage 成为对话的一部分。有关创建和使用工具的更多详细信息，请参阅[Tools guide](/oss/javascript/langchain/tools)。

## 3. 构建技能中间件

创建自定义中间件，将技能描述注入系统提示中。该中间件使技能可以被发现，而无需预先加载其完整内容。

<Note>
  本指南演示了创建自定义中间件。有关中间件概念和模式的综合指南，请参阅 [custom middleware documentation](/oss/javascript/langchain/middleware/custom)。
</Note>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

// Build skills prompt from the SKILLS list
const skillsPrompt = SKILLS.map(
  (skill) => `- **${skill.name}**: ${skill.description}`
).join("\n");

const skillMiddleware = createMiddleware({  // [!code highlight]
  name: "skillMiddleware",
  tools: [loadSkill],  // [!code highlight]
  wrapModelCall: async (request, handler) => {
    // Build the skills addendum
    const skillsAddendum =  // [!code highlight]
      `\n\n## Available Skills\n\n${skillsPrompt}\n\n` +  // [!code highlight]
      "Use the load_skill tool when you need detailed information " +  // [!code highlight]
      "about handling a specific type of request.";  // [!code highlight]

    // Append to system prompt
    const newSystemPrompt = request.systemPrompt + skillsAddendum;

    return handler({
      ...request,
      systemPrompt: newSystemPrompt,
    });
  },
});
```中间件将技能描述附加到系统提示中，使客服人员无需加载完整内容即可了解可用技能。 `load_skill` 工具注册为类变量，使其可供代理使用。

<Note>
  **生产考虑**：为了简单起见，本教程加载`__init__`中的技能列表。在生产系统中，您可能希望在 `before_agent` 挂钩中加载技能，从而允许定期刷新它们以反映最新的更改（例如，当添加新技能或修改现有技能时）。详情请参阅[before\_agent hook documentation](/oss/javascript/langchain/middleware/custom#node-style-hooks)。
</Note>

## 4. 创建具有技能支持的代理

现在使用技能中间件和状态持久性检查点创建代理：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

// Create the agent with skill support
const agent = createAgent({
  model,
  systemPrompt:
    "You are a SQL query assistant that helps users " +
    "write queries against business databases.",
  middleware: [skillMiddleware],  // [!code highlight]
  checkpointer: new MemorySaver(),
});
```

代理现在可以在系统提示中访问技能描述，并可以在需要时调用`load_skill`检索完整的技能内容。检查点维护各回合的对话历史记录。

## 5. 测试渐进式披露

使用需要特定技能知识的问题来测试代理：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Configuration for this conversation thread
const threadId = crypto.randomUUID();
const config = { configurable: { thread_id: threadId } };

// Ask for a SQL query
const result = await agent.invoke(  // [!code highlight]
  {
    messages: [
      {
        role: "user",
        content:
          "Write a SQL query to find all customers " +
          "who made orders over $1000 in the last month",
      },
    ],
  },
  config
);

// Print the conversation
for (const message of result.messages) {
  console.log(`${message._getType()}: ${message.content}`);
}
```

预期输出：

```
================================ Human Message =================================

Write a SQL query to find all customers who made orders over $1000 in the last month
================================== Ai Message ==================================
Tool Calls:
  load_skill (call_abc123)
 Call ID: call_abc123
  Args:
    skill_name: sales_analytics
================================= Tool Message =================================
Name: load_skill

Loaded skill: sales_analytics

# Sales Analytics Schema

## Tables

### customers
- customer_id (PRIMARY KEY)
- name
- email
- signup_date
- status (active/inactive)
- customer_tier (bronze/silver/gold/platinum)

### orders
- order_id (PRIMARY KEY)
- customer_id (FOREIGN KEY -> customers)
- order_date
- status (pending/completed/cancelled/refunded)
- total_amount
- sales_region (north/south/east/west)

[... rest of schema ...]

## Business Logic

**High-value orders**: Orders with `total_amount > 1000`
**Revenue calculation**: Only count orders with `status = 'completed'`

================================== Ai Message ==================================

Here's a SQL query to find all customers who made orders over $1000 in the last month:

\`\`\`sql
SELECT DISTINCT
    c.customer_id,
    c.name,
    c.email,
    c.customer_tier
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.total_amount > 1000
  AND o.status = 'completed'
  AND o.order_date >= CURRENT_DATE - INTERVAL '1 month'
ORDER BY c.customer_id;
\`\`\`

This query:
- Joins customers with their orders
- Filters for high-value orders (>$1000) using the total_amount field
- Only includes completed orders (as per the business logic)
- Restricts to orders from the last month
- Returns distinct customers to avoid duplicates if they made multiple qualifying orders
```代理在系统提示中看到了轻量级技能描述，认识到该问题需要销售数据库知识，调用`load_skill("sales_analytics")`来获取完整的架构和业务逻辑，然后使用该信息按照数据库约定编写正确的查询。

## 6. 高级：添加自定义状态约束

<Accordion title="Optional: Track loaded skills and enforce tool constraints">
  您可以添加约束以强制某些工具仅在加载特定技能后才可用。这需要跟踪哪些技能已加载到自定义代理状态。

  ### 定义自定义状态

  首先，扩展代理状态以跟踪加载的技能：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { StateSchema } from "@langchain/langgraph";
  import { z } from "zod";

  const CustomState = new StateSchema({
    skillsLoaded: z.array(z.string()).optional(),  // Track which skills have been loaded  // [!code highlight]
  });
  ```

  ### 更新 load_skill 来修改状态

  修改`load_skill`工具，在技能加载时更新状态：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, ToolMessage, type ToolRuntime } from "langchain";
  import { Command } from "@langchain/langgraph";  // [!code highlight]
  import { z } from "zod";

  const loadSkill = tool(  // [!code highlight]
    async ({ skillName }, runtime: ToolRuntime<typeof CustomState.State>) => {
      // Find and return the requested skill
      const skill = SKILLS.find((s) => s.name === skillName);

      if (skill) {
        const skillContent = `Loaded skill: ${skillName}\n\n${skill.content}`;

        // Update state to track loaded skill
        return new Command({  // [!code highlight]
          update: {  // [!code highlight]
            messages: [  // [!code highlight]
              new ToolMessage({  // [!code highlight]
                content: skillContent,  // [!code highlight]
                tool_call_id: runtime.toolCallId,  // [!code highlight]
              }),  // [!code highlight]
            ],  // [!code highlight]
            skillsLoaded: [skillName],  // [!code highlight]
          },  // [!code highlight]
        });  // [!code highlight]
      }

      // Skill not found
      const available = SKILLS.map((s) => s.name).join(", ");
      return new Command({
        update: {
          messages: [
            new ToolMessage({
              content: `Skill '${skillName}' not found. Available skills: ${available}`,
              tool_call_id: runtime.toolCallId,
            }),
          ],
        },
      });
    },
    {
      name: "load_skill",
      description: `Load the full content of a skill into the agent's context.`,
      schema: z.object({
        skillName: z.string().describe("The name of the skill to load"),
      }),
    }
  );
  ```

  ### 创建约束工具

  创建一个仅在加载特定技能后才可用的工具：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const writeSqlQuery = tool(  // [!code highlight]
    async ({ query, vertical }, runtime: ToolRuntime<typeof CustomState.State>) => {
      // Check if the required skill has been loaded
      const skillsLoaded = runtime.state.skillsLoaded ?? [];  // [!code highlight]

      if (!skillsLoaded.includes(vertical)) {  // [!code highlight]
        return (  // [!code highlight]
          `Error: You must load the '${vertical}' skill first ` +  // [!code highlight]
          `to understand the database schema before writing queries. ` +  // [!code highlight]
          `Use load_skill('${vertical}') to load the schema.`  // [!code highlight]
        );  // [!code highlight]
      }

      // Validate and format the query
      return (
        `SQL Query for ${vertical}:\n\n` +
        `\`\`\`sql\n${query}\n\`\`\`\n\n` +
        `✓ Query validated against ${vertical} schema\n` +
        `Ready to execute against the database.`
      );
    },
    {
      name: "write_sql_query",
      description: `Write and validate a SQL query for a specific business vertical.

  This tool helps format and validate SQL queries. You must load the
  appropriate skill first to understand the database schema.`,
      schema: z.object({
        query: z.string().describe("The SQL query to write"),
        vertical: z.string().describe("The business vertical (sales_analytics or inventory_management)"),
      }),
    }
  );
  ```

  ### 更新中间件和代理

  更新中间件以使用自定义状态架构：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const skillMiddleware = createMiddleware({  // [!code highlight]
    name: "skillMiddleware",
    stateSchema: CustomState,  // [!code highlight]
    tools: [loadSkill, writeSqlQuery],  // [!code highlight]
    // ... rest of the middleware implementation stays the same
  });
  ```

  使用注册受约束工具的中间件创建代理：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const agent = createAgent({
    model,
    systemPrompt:
      "You are a SQL query assistant that helps users " +
      "write queries against business databases.",
    middleware: [skillMiddleware],  // [!code highlight]
    checkpointer: new MemorySaver(),
  });
  ```现在，如果代理在加载所需技能之前尝试使用`write_sql_query`，它将收到一条错误消息，提示其首先加载适当的技能（例如，`sales_analytics`或`inventory_management`）。这可确保代理在尝试验证查询之前拥有必要的架构知识。
</Accordion>

## 完整示例

<Accordion title="View complete runnable script">
  这是一个完整的、可运行的实现，结合了本教程中的所有部分：

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    tool,
    createAgent,
    createMiddleware,
    ToolMessage,
    context,
    type ToolRuntime,
  } from "langchain";
  import { MemorySaver, Command } from "@langchain/langgraph";
  import { ChatOpenAI } from "@langchain/openai";
  import { z } from "zod";

  // A skill that can be progressively disclosed to the agent
  const SkillSchema = z.object({
    name: z.string(), // Unique identifier for the skill
    description: z.string(), // 1-2 sentence description to show in system prompt
    content: z.string(), // Full skill content with detailed instructions
  });

  type Skill = z.infer<typeof SkillSchema>;

  const SKILLS: Skill[] = [
    {
      name: "sales_analytics",
      description:
        "Database schema and business logic for sales data analysis including customers, orders, and revenue.",
      content: context`
      # Sales Analytics Schema

      ## Tables

      ### customers
      - customer_id (PRIMARY KEY)
      - name
      - email
      - signup_date
      - status (active/inactive)
      - customer_tier (bronze/silver/gold/platinum)

      ### orders
      - order_id (PRIMARY KEY)
      - customer_id (FOREIGN KEY -> customers)
      - order_date
      - status (pending/completed/cancelled/refunded)
      - total_amount
      - sales_region (north/south/east/west)

      ### order_items
      - item_id (PRIMARY KEY)
      - order_id (FOREIGN KEY -> orders)
      - product_id
      - quantity
      - unit_price
      - discount_percent

      ## Business Logic

      **Active customers**: status = 'active' AND signup_date <= CURRENT_DATE - INTERVAL '90 days'

      **Revenue calculation**:
      Only count orders with status = 'completed'. Use total_amount from orders table,
      which already accounts for discounts.

      **Customer lifetime value (CLV)**:
      Sum of all completed order amounts for a customer.

      **High-value orders**:
      Orders with total_amount > 1000

      ## Example Query
      -- Get top 10 customers by revenue in the last quarter
      SELECT
          c.customer_id,
          c.name,
          c.customer_tier,
          SUM(o.total_amount) as total_revenue
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      WHERE o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY c.customer_id, c.name, c.customer_tier
      ORDER BY total_revenue DESC
      LIMIT 10;`,
    },
    {
      name: "inventory_management",
      description:
        "Database schema and business logic for inventory tracking including products, warehouses, and stock levels.",
      content: context`
      # Inventory Management Schema

      ## Tables

      ### products
      - product_id (PRIMARY KEY)
      - product_name
      - sku
      - category
      - unit_cost
      - reorder_point (minimum stock level before reordering)
      - discontinued (boolean)

      ### warehouses
      - warehouse_id (PRIMARY KEY)
      - warehouse_name
      - location
      - capacity

      ### inventory
      - inventory_id (PRIMARY KEY)
      - product_id (FOREIGN KEY -> products)
      - warehouse_id (FOREIGN KEY -> warehouses)
      - quantity_on_hand
      - last_updated

      ### stock_movements
      - movement_id (PRIMARY KEY)
      - product_id (FOREIGN KEY -> products)
      - warehouse_id (FOREIGN KEY -> warehouses)
      - movement_type (inbound/outbound/transfer/adjustment)
      - quantity (positive for inbound, negative for outbound)
      - movement_date
      - reference_number

      ## Business Logic

      **Available stock**:
      quantity_on_hand from inventory table where quantity_on_hand > 0

      **Products needing reorder**:
      Products where total quantity_on_hand across all warehouses is
      less than or equal to the product's reorder_point

      **Active products only**:
      Exclude products where discontinued = true unless specifically
      analyzing discontinued items

      **Stock valuation**:
      quantity_on_hand * unit_cost for each product

      ## Example Query

      -- Find products below reorder point across all warehouses
      SELECT
          p.product_id,
          p.product_name,
          p.reorder_point,
          SUM(i.quantity_on_hand) as total_stock,
          p.unit_cost,
          (p.reorder_point - SUM(i.quantity_on_hand)) as units_to_reorder
      FROM products p
      JOIN inventory i ON p.product_id = i.product_id
      WHERE p.discontinued = false
      GROUP BY p.product_id, p.product_name, p.reorder_point, p.unit_cost
      HAVING SUM(i.quantity_on_hand) <= p.reorder_point
      ORDER BY units_to_reorder DESC;`,
    },
  ];

  // const loadSkill = tool(
  //   async ({ skillName }) => {
  //     // Find and return the requested skill
  //     const skill = SKILLS.find((s) => s.name === skillName);
  //     if (skill) {
  //       return `Loaded skill: ${skillName}\n\n${skill.content}`;
  //     }

  //     // Skill not found
  //     const available = SKILLS.map((s) => s.name).join(", ");
  //     return `Skill '${skillName}' not found. Available skills: ${available}`;
  //   },
  //   {
  //     name: "load_skill",
  //     description: `Load the full content of a skill into the agent's context.

  // Use this when you need detailed information about how to handle a specific
  // type of request. This will provide you with comprehensive instructions,
  // policies, and guidelines for the skill area.`,
  //     schema: z.object({
  //       skillName: z.string().describe("The name of the skill to load"),
  //     }),
  //   }
  // );

  // Build skills prompt from the SKILLS list
  const skillsPrompt = SKILLS.map(
    (skill) => `- **${skill.name}**: ${skill.description}`
  ).join("\n");

  const skillMiddleware = createMiddleware({
    name: "skillMiddleware",
    tools: [loadSkill],
    wrapModelCall: async (request, handler) => {
      // Build the skills addendum
      const skillsAddendum =
        `\n\n## Available Skills\n\n${skillsPrompt}\n\n` +
        "Use the load_skill tool when you need detailed information " +
        "about handling a specific type of request.";

      // Append to system prompt
      const newSystemPrompt = request.systemPrompt + skillsAddendum;

      return handler({
        ...request,
        systemPrompt: newSystemPrompt,
      });
    },
  });

  const model = new ChatOpenAI({
    model: "gpt-5.4-mini",
    temperature: 0,
  });

  // Create the agent with skill support
  const agent = createAgent({
    model,
    systemPrompt:
      "You are a SQL query assistant that helps users " +
      "write queries against business databases.",
    middleware: [skillMiddleware],
    checkpointer: new MemorySaver(),
  });

  // Configuration for this conversation thread
  const threadId = crypto.randomUUID();
  const config = { configurable: { thread_id: threadId } };

  // Ask for a SQL query
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content:
            "Write a SQL query to find all customers " +
            "who made orders over $1000 in the last month",
        },
      ],
    },
    config
  );

  // Print the conversation
  for (const message of result.messages) {
    console.log(`${message.type}: ${message.content}`);
  }
  ```

  这个完整的示例包括：

  * 具有完整数据库模式的技能定义
  * `load_skill`按需加载工具
  * `SkillMiddleware`将技能描述注入系统提示中
  * 使用中间件和检查点创建代理
  * 示例用法展示了代理如何加载技能和编写 SQL 查询

  要运行它，您需要：

  1.安装所需包：`pip install langchain langchain-openai langgraph`
  2. 设置您的 API 密钥（例如 `export OPENAI_API_KEY=...`）
  3. 将模型初始化替换为您首选的 LLM 提供商
</Accordion>

## 实现变化

<Accordion title="View implementation options and trade-offs">
  本教程将技能实现为通过工具调用加载的内存中 Python 字典。然而，有几种方法可以通过技能来实现渐进式披露：

  **存储后端：*** **内存中**（本教程）：定义为 Python 数据结构的技能，快速访问，无 I/O 开销
  * **文件系统**（克劳德代码方法）：作为带有文件的目录的技能，通过像`read_file`这样的文件操作发现
  * **远程存储**：S3、数据库、概念或 API 方面的技能，按需获取

  **技能发现**（代理如何了解存在哪些技能）：

  * **系统提示列表**：系统提示中的技能说明（本教程中使用）
  * **基于文件**：通过扫描目录发现技能（克劳德代码方法）
  * **基于注册表**：查询技能注册表服务或 API 以获取可用技能
  * **动态查找**：通过工具调用列出可用技能

  **渐进式披露策略**（技能内容如何加载）：

  * **单次加载**：在一次工具调用中加载整个技能内容（本教程中使用）
  * **分页**：在多个页面/块中加载大型技能的技能内容
  * **基于搜索**：在特定技能的内容中搜索相关部分（例如，对技能文件使用 grep/read 操作）
  * **分层**：首先加载技能概述，然后深入到特定的小节**尺寸注意事项**（未校准的心智模型 - 针对您的系统进行优化）：

  * **小技巧**（\< 1K tokens / \~750 words): Can be included directly in system prompt and cached with prompt caching for cost savings and faster responses
  * **Medium skills** (1-10K tokens / \~750-7.5K words): Benefit from on-demand loading to avoid context overhead (this tutorial)
  * **Large skills** (> 10K 标记/\~7.5K 单词，或 > 上下文窗口的 5-10%）：应使用渐进式披露技术，如分页、基于搜索的加载或分层探索，以避免消耗过多的上下文

  选择取决于您的要求：内存中速度最快，但需要重新部署以进行技能更新，而基于文件或远程存储可实现动态技能管理，无需更改代码。
</Accordion>

## 渐进式披露和情境工程

<Accordion title="Combining with few-shot prompting and other techniques">
  渐进式披露从根本上来说是一种 **[context engineering](/oss/javascript/langchain/context-engineering) 技术** - 您正在管理代理可以使用哪些信息以及何时可以使用。本教程重点介绍加载数据库模式，但相同的原则也适用于其他类型的上下文。

  ### 与少量提示相结合

  对于 SQL 查询用例，您可以扩展渐进式披露以动态加载与用户查询匹配的**少量示例**：

  **方法示例：**1.用户询问：“查找6个月内没有下单的客户”
  2.代理加载`sales_analytics`模式（如本教程所示）
  3.代理还加载 2-3 个相关示例查询（通过语义搜索或基于标签的查找）：
     * 查找不活跃客户的查询
     * 基于日期的过滤查询
     * 查询连接客户表和订单表
  4. 代理使用模式知识和示例模式编写查询

  渐进式披露（按需加载模式）和动态几次提示（加载相关示例）的结合创建了强大的上下文工程模式，可扩展到大型知识库，同时提供高质量、扎实的输出。
</Accordion>

## 后续步骤

* 了解[middleware](/oss/javascript/langchain/middleware)以获得更动态的代理行为
* 探索管理代理上下文的[context engineering](/oss/javascript/langchain/context-engineering)技术
* 探索 [handoffs pattern](/oss/javascript/langchain/multi-agent/handoffs-customer-support) 的顺序工作流程
* 阅读[subagents pattern](/oss/javascript/langchain/multi-agent/subagents-personal-assistant)了解并行任务路由
* 请参阅[multi-agent patterns](/oss/javascript/langchain/multi-agent)了解专业代理的其他方法
* 使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-multi-agent-skills-sql-assistant)调试和监控技能加载

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/skills-sql-assistant.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>