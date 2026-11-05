<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build a content builder agent | https://docs.langchain.com/oss/javascript/deepagents/content-builder -->

# 构建内容生成器代理

使用托管 Deep Agents 或 Deep Agents SDK 构建具有品牌声音、技能、子代理和图像生成的内容编写代理

## 概述

本指南展示了如何使用 [Deep Agents](/oss/javascript/deepagents) 构建内容编写代理。代理加载品牌声音和技能，将研究委托给子代理，起草博客或社交内容，并生成配套图像。

您构建的代理将：

1.从品牌说明和技能文件夹加载语音和工作流程规则
2. 将网络研究委托给具有 `web_search` 的专门子代理
3. 根据加载的技能起草博客或社交内容
4.用Gemini生成封面或社交图片并保存在项目目录下

对于完整的可运行的 SDK 项目，请参阅 [content-builder-agent](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) 示例。

### 关键概念

本教程涵盖：

* 品牌说明（托管 Deep Agents 上的[instructions](/langsmith/javascript/managed-deep-agents-instructions)，或 SDK 上的 [memory](/oss/javascript/deepagents/memory) 文件），用于始终在线的语音和研究规则
* [Skills](/oss/javascript/deepagents/skills) 用于博客和社交手册
* [Subagents](/oss/javascript/deepagents/subagents) 用于写作前的研究
* SDK路径上的[Filesystem backends](/oss/javascript/deepagents/backends)用于文件读写
* 自定义[tools](/oss/javascript/langchain/tools)用于搜索和图像生成

## 先决条件

API 密钥：* Anthropic (Claude) 或其他聊天模型提供商
* Google (Gemini) 使用 `gemini-2.5-flash-image` 生成图像
* [Tavily](https://www.tavily.com/) 用于网络搜索（免费套餐）
* [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-content-builder) 用于跟踪（SDK 路径上可选；托管 Deep Agents 必需）

Node.js 18 或更高版本。

## 选择你的路径

从 [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) 开始运行生产代理，而无需管理基础设施。或者，为了在使用相同 Deep Agents 工具时获得最大灵活性，请自行使用 Deep Agents SDK 和主机代理，或运行自定义 [LangSmith Deployment](/langsmith/deployment)。> [选项卡] 托管 Deep Agents
>
>> [!注意]
>>
>> 托管 Deep Agents 在 [LangSmith Cloud](/langsmith/cloud) 和 [Bring Your Own Cloud (BYOC)](/langsmith/byoc) **公开 [beta](/langsmith/release-stages)**。使用托管 Deep Agents CLI 和 SDK v0.10 或更高版本进行 BYOC。
>
> 托管 Deep Agents 搭建项目并托管运行时。品牌声音进入`instructions.md`，技能保持在`skills/`，并且您在代码中声明工具和研究人员子代理。 `mda dev`期间，图像工具写入项目目录下。
>
> ### 设置
>
> 要继续操作，您需要：
>
> * Node.js 和 npm。
>
> * 您选择的模型提供商的 API 密钥。
>
> **1。创建项目**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx managed-deepagents init content-builder
> cd content-builder
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm dlx managed-deepagents init content-builder
> cd content-builder
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bunx managed-deepagents init content-builder
> cd content-builder
> ```
>
> **2。添加 API 密钥**
>
> `.env`添加聊天、图片、搜索和LangSmith键：
>
> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
> GOOGLE_API_KEY=<GOOGLE_API_KEY>
> TAVILY_API_KEY=<TAVILY_API_KEY>
> LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
> ```
>
> 即使聊天模型是克劳德，生成双子座图像也需要`GOOGLE_API_KEY`。
>
>> [!警告]
>>
>> 不要将 `.env` 文件提交到版本控制中。它包含秘密。
>
> **3。安装依赖项**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install tavily @google/generative-ai zod
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm add tavily @google/generative-ai zod
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bun add tavily @google/generative-ai zod
> ```
>
> ### 构建代理
>
> **1。添加工具**
>
> 创建搜索和图像工具。 Markdown 研究笔记使用代理文件系统 (`write_file`)。封面和社交图片在本地`mda dev`期间写入主机上的项目目录下。
>
> 创建`tools/content.ts`：
>
> ```ts tools/content.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { tool } from "@langchain/core/tools";
> import * as z from "zod";
> import * as fs from "node:fs";
> import * as path from "node:path";
> import { fileURLToPath } from "node:url";
>
> const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
>
> export const webSearch = tool(
>   async ({ query, maxResults = 5, topic = "general" }) => {
>     const apiKey = process.env.TAVILY_API_KEY;
>     if (!apiKey) return { error: "TAVILY_API_KEY not set" };
>     try {
>       const { TavilyClient } = await import("tavily");
>       const client = new TavilyClient({ apiKey });
>       return client.search(query, { maxResults, topic });
>     } catch (e) {
>       return { error: `Search failed: ${e}` };
>     }
>   },
>   {
>     name: "web_search",
>     description: "Search the web for current information.",
>     schema: z.object({
>       query: z.string().describe("The search query (be specific and detailed)"),
>       maxResults: z
>         .number()
>         .optional()
>         .describe("Number of results to return (default: 5)"),
>       topic: z
>         .enum(["general", "news"])
>         .optional()
>         .describe('"general" for most queries, "news" for current events'),
>     }),
>   },
> );
>
> export const generateCover = tool(
>   async ({ prompt, slug }) => {
>     try {
>       const { GoogleGenerativeAI } = await import("@google/generative-ai");
>       const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
>       const model = genai.getGenerativeModel({
>         model: "gemini-2.5-flash-image",
>       });
>       const result = await model.generateContent(prompt);
>       const part = result.response.candidates?.[0]?.content?.parts?.find(
>         (p) => p.inlineData,
>       );
>       if (!part?.inlineData) return "No image generated";
>       const outputPath = path.join(PROJECT_DIR, "blogs", slug, "hero.png");
>       fs.mkdirSync(path.dirname(outputPath), { recursive: true });
>       fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
>       return `Image saved to ${outputPath}`;
>     } catch (e) {
>       return `Error: ${e}`;
>     }
>   },
>   {
>     name: "generate_cover",
>     description: "Generate a cover image for a blog post.",
>     schema: z.object({
>       prompt: z
>         .string()
>         .describe("Detailed description of the image to generate."),
>       slug: z
>         .string()
>         .describe("Blog post slug. Image saves to blogs/<slug>/hero.png"),
>     }),
>   },
> );
>
> export const generateSocialImage = tool(
>   async ({ prompt, platform, slug }) => {
>     try {
>       const { GoogleGenerativeAI } = await import("@google/generative-ai");
>       const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
>       const model = genai.getGenerativeModel({
>         model: "gemini-2.5-flash-image",
>       });
>       const result = await model.generateContent(prompt);
>       const part = result.response.candidates?.[0]?.content?.parts?.find(
>         (p) => p.inlineData,
>       );
>       if (!part?.inlineData) return "No image generated";
>       const outputPath = path.join(PROJECT_DIR, platform, slug, "image.png");
>       fs.mkdirSync(path.dirname(outputPath), { recursive: true });
>       fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
>       return `Image saved to ${outputPath}`;
>     } catch (e) {
>       return `Error: ${e}`;
>     }
>   },
>   {
>     name: "generate_social_image",
>     description: "Generate an image for a social media post.",
>     schema: z.object({
>       prompt: z
>         .string()
>         .describe("Detailed description of the image to generate."),
>       platform: z.string().describe('Either "linkedin" or "tweets"'),
>       slug: z
>         .string()
>         .describe("Post slug. Image saves to <platform>/<slug>/image.png"),
>     }),
>   },
> );
> ```
>
> **2。添加品牌说明**
>> 将始终在线的品牌声音和研究要求放入`instructions.md`。托管Deep Agents加载此文件作为主代理系统提示（这是SDK`AGENTS.md`/`memory=`角色，不持久[memory](/langsmith/javascript/managed-deep-agents-memory)）：
>
> ```markdown expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> # Content Writer Agent
>
> You are a content writer for a technology company. Your job is to create engaging, informative content that educates readers about AI, software development, and emerging technologies.
>
> ## Brand Voice
>
> - **Professional but approachable**: Write like a knowledgeable colleague, not a textbook
> - **Clear and direct**: Avoid jargon unless necessary; explain technical concepts simply
> - **Confident but not arrogant**: Share expertise without being condescending
> - **Engaging**: Use concrete examples, analogies, and stories to illustrate points
>
> ## Writing Standards
>
> 1. **Use active voice**: "The agent processes requests" not "Requests are processed by the agent"
> 2. **Lead with value**: Start with what matters to the reader, not background
> 3. **One idea per paragraph**: Keep paragraphs focused and scannable
> 4. **Concrete over abstract**: Use specific examples, numbers, and case studies
> 5. **End with action**: Every piece should leave the reader knowing what to do next
>
> ## Content Pillars
>
> Our content focuses on:
> - AI agents and automation
> - Developer tools and productivity
> - Software architecture and best practices
> - Emerging technologies and trends
>
> ## Formatting Guidelines
>
> - Use headers (H2, H3) to break up long content
> - Include code examples where relevant (with syntax highlighting)
> - Add bullet points for lists of 3+ items
> - Keep sentences under 25 words when possible
> - Include a clear call-to-action at the end
>
> ## Research Requirements
>
> Before writing on any topic:
> 1. Use the `researcher` subagent for in-depth topic research
> 2. Gather at least 3 credible sources
> 3. Identify the key points readers need to understand
> 4. Find concrete examples or case studies to illustrate concepts
> ```
>
> 部署时，托管 Deep Agents 会将这些指令同步到 [Context Hub](/langsmith/javascript/managed-deep-agents-context-hub)。
>
> **3。添加技能**
>
> 创建`skills/`目录。每个技能都是一个带有`SKILL.md`的文件夹。托管Deep Agents自动发现技能；您没有传递 `skills=` 参数。
>
> 创建`skills/blog-post/SKILL.md`：
>
> ````md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ---
> name: blog-post
> description: Writes and structures long-form blog posts, creates tutorial outlines, and optimizes content for SEO with cover image generation. Use when the user asks to write a blog post, article, how-to guide, tutorial, technical writeup, thought leadership piece, or long-form content.
> ---
>
> # Blog Post Writing Skill
>
> ## Research First (Required)
>
> **Before writing any blog post, you MUST delegate research:**
>
> 1. Use the `task` tool with `subagent_type: "researcher"`
> 2. In the description, specify BOTH the topic AND where to save:
>
> ```
> 任务（
> subagent_type="研究员",
> 描述=“研究[主题]。将研究结果保存到研究/[slug].md”
>)
> ```
>
> Example:
> ```
> 任务（
> subagent_type="研究员",
> description="研究 2025 年人工智能代理的现状。将研究结果保存到 Research/ai-agents-2025.md"
>)
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every blog post MUST have both a post AND a cover image:**
>
> ```
> 博客/
> └── <slug>/
> ├── post.md # 博文内容
> └── Hero.png # 必需：生成的封面图片
> ```
>
> Example: A post about "AI Agents in 2025" → `blogs/ai-agents-2025/`
>
> **You MUST complete both steps:**
> 1. Write the post to `blogs/<slug>/post.md`
> 2. Generate a cover image using `generate_image` and save to `blogs/<slug>/hero.png`
>
> **A blog post is NOT complete without its cover image.**
>
> ## Blog Post Structure
>
> Every blog post should follow this structure:
>
> ### 1. Hook (Opening)
> - Start with a compelling question, statistic, or statement
> - Make the reader want to continue
> - Keep it to 2-3 sentences
>
> ### 2. Context (The Problem)
> - Explain why this topic matters
> - Describe the problem or opportunity
> - Connect to the reader's experience
>
> ### 3. Main Content (The Solution)
> - Break into 3-5 main sections with H2 headers
> - Each section covers one key point
> - Include code examples, diagrams, or screenshots where helpful
> - Use bullet points for lists
>
> ### 4. Practical Application
> - Show how to apply the concepts
> - Include step-by-step instructions if applicable
> - Provide code snippets or templates
>
> ### 5. Conclusion & CTA
> - Summarize key takeaways (3 bullets max)
> - End with a clear call-to-action
> - Link to related resources
>
> ## Cover Image Generation
>
> After writing the post, generate a cover image using the `generate_cover` tool:
>
> ```
>generate_cover(prompt="图像的详细描述...", slug="your-blog-slug")
> ```
>
> The tool saves the image to `blogs/<slug>/hero.png`.
>
> ### Writing Effective Image Prompts
>
> Structure your prompt with these elements:
>
> 1. **Subject**: What is the main focus? Be specific and concrete.
> 2. **Style**: Art direction (minimalist, isometric, flat design, 3D render, watercolor, etc.)
> 3. **Composition**: How elements are arranged (centered, rule of thirds, symmetrical)
> 4. **Color palette**: Specific colors or mood (warm earth tones, cool blues and purples, high contrast)
> 5. **Lighting/Atmosphere**: Soft diffused light, dramatic shadows, golden hour, neon glow
> 6. **Technical details**: Aspect ratio considerations, negative space for text overlay
>
> ### Example Prompts
>
> **For a technical blog post:**
> ```> 代表 AI 代理的互连发光立方体的等距 3D 插图，每个立方体都有微妙的电路图案。通过发光数据流连接的立方体。深海军蓝背景 (#0a192f) 带有电蓝色 (#64ffda) 和柔和的紫色 (#c792ea) 口音。干净简约的风格，顶部有很多负空间作为标题。专业科技美学。
> ```
>
> **For a tutorial/how-to:**
> ```
> 手在键盘上打字的干净平面插图，抽象代码符号向上浮动，变成灯泡和齿轮。从软珊瑚到浅桃色的温暖渐变背景。风格友善、平易近人。居中构图，带有文本叠加空间。
> ```
>
> **For thought leadership:**
> ```
> 人体轮廓轮廓与几何神经网络模式融合的抽象可视化。分割构图-左侧的有机水彩纹理过渡到右侧的干净矢量线。柔和的鼠尾草绿色和温暖的赤土色配色方案。沉思、前瞻性的心情。
> ```
>
> ## SEO Considerations
>
> - Include the main keyword in the title and first paragraph
> - Use the keyword naturally 3-5 times throughout
> - Keep the title under 60 characters
> - Write a meta description (150-160 characters)
>
> ## Quality Checklist
>
> Before finishing:
> - [ ] Post saved to `blogs/<slug>/post.md`
> - [ ] Hero image generated at `blogs/<slug>/hero.png`
> - [ ] Hook grabs attention in first 2 sentences
> - [ ] Each section has a clear purpose
> - [ ] Conclusion summarizes key points
> - [ ] CTA tells reader what to do next
> ````
>
> 创建`skills/social-media/SKILL.md`：
>
> ````md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ---
> name: social-media
> description: Drafts engaging social media posts, writes hooks, suggests hashtags, creates thread structures, and generates companion images. Use when the user asks to write a LinkedIn post, tweet, Twitter/X thread, social media caption, social post, or repurpose content for social platforms.
> ---
>
> # Social Media Content Skill
>
> ## Research First (Required)
>
> **Before writing any social media content, you MUST delegate research:**
>
> 1. Use the `task` tool with `subagent_type: "researcher"`
> 2. In the description, specify BOTH the topic AND where to save:
>
> ```
> 任务（
> subagent_type="研究员",
> 描述=“研究[主题]。将研究结果保存到研究/[slug].md”
>)
> ```
>
> Example:
> ```
> 任务（
> subagent_type="研究员",> description="研究 2025 年可再生能源趋势。将研究结果保存到 Research/renewable-energy.md"
>)
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every social media post MUST have both content AND an image:**
>
> **LinkedIn posts:**
> ```
> 链接/
> └── <slug>/
> ├── post.md # 帖子内容
> └── image.png # 必需：生成的视觉效果
> ```
>
> **Twitter/X threads:**
> ```
> 推文/
> └── <slug>/
> ├── thread.md # 线程内容
> └── image.png # 必需：生成的视觉效果
> ```
>
> Example: A LinkedIn post about "prompt engineering" → `linkedin/prompt-engineering/`
>
> **You MUST complete both steps:**
> 1. Write the content to the appropriate path
> 2. Generate an image using `generate_image` and save alongside the post
>
> **A social media post is NOT complete without its image.**
>
> ## Platform Guidelines
>
> ### LinkedIn
>
> **Format:**
> - 1,300 character limit (show more after ~210 chars)
> - First line is crucial - make it hook
> - Use line breaks for readability
> - 3-5 hashtags at the end
>
> **Tone:**
> - Professional but personal
> - Share insights and learnings
> - Ask questions to drive engagement
> - Use "I" and share experiences
>
> **Structure:**
> ```
> [钩子 - 1 条引人注目的线]
>
> [空行]
>
> [背景 - 为什么这很重要]
>
> [空行]
>
> [主要见解 - 2-3 个短段落]
>
> [空行]
>
> [号召性用语或问题]
>
> #hashtag1 #hashtag2 #hashtag3
> ```
>
> ### Twitter/X
>
> **Format:**
> - 280 character limit per tweet
> - Threads for longer content (use 1/🧵 format)
> - No more than 2 hashtags per tweet
>
> **Thread Structure:**
> ```
> 1/🧵 [Hook - 主要见解]
>
> 2/【支撑点1】
>
> 3/【支撑点2】
>
> 4/ [示例或证据]
>
> 5/【结论+CTA】
> ```
>
> ## Image Generation
>
> Every social media post needs an eye-catching image. Use the `generate_social_image` tool:
>
> ```
>generate_social_image(prompt="详细描述...", platform="linkedin", slug="your-post-slug")
> ```
>
> The tool saves the image to `<platform>/<slug>/image.png`.
>
> ### Social Image Best Practices
>
> Social images need to work at small sizes in crowded feeds:
> - **Bold, simple compositions** - one clear focal point
> - **High contrast** - stands out when scrolling
> - **No text in image** - too small to read, platforms add their own
> - **Square or 4:5 ratio** - works across platforms
>
> ### Writing Effective Prompts
>
> Include these elements:
>
> 1. **Single focal point**: One clear subject, not a busy scene
> 2. **Bold style**: Vibrant colors, strong shapes, high contrast
> 3. **Simple background**: Solid color, gradient, or subtle texture
> 4. **Mood/energy**: Match the post tone (inspiring, urgent, thoughtful)
>
> ### Example Prompts
>
> **For an insight/tip post:**
> ```
> 单个发光灯泡漂浮在深紫色渐变背景上，灯泡由互连的金色几何线条制成，柔和的光线向外散发。最小、引人注目、高对比度。方形构图。
> ```
>
> **For announcements/news:**
> ```> 由彩色几何形状制成的抽象火箭飞船，带着一串粒子向上发射。明亮的珊瑚色和青色配色方案与干净的白色背景相对应。充满活力、喜庆的气氛。大胆的平面插画风格。
> ```
>
> **For thought-provoking content:**
> ```
> 两个重叠的半透明圆圈，一蓝色一橙色，在中心形成发光的交叉点。代表协作或想法的交集。深色木炭背景，柔和空灵的光芒。极简主义和沉思。
> ```
>
> ## Content Types
>
> ### Announcement Posts
> - Lead with the news
> - Explain the impact
> - Include link or next step
>
> ### Insight Posts
> - Share one specific learning
> - Explain the context briefly
> - Make it actionable
>
> ### Question Posts
> - Ask a genuine question
> - Provide your take first
> - Keep it focused on one topic
>
> ## Quality Checklist
>
> Before finishing:
> - [ ] Post saved to `linkedin/<slug>/post.md` or `tweets/<slug>/thread.md`
> - [ ] Image generated alongside the post
> - [ ] First line hooks attention
> - [ ] Content fits platform limits
> - [ ] Tone matches platform norms
> - [ ] Has clear CTA or question
> - [ ] Hashtags are relevant (not generic)
> ````
>
> **4。创建代理**
>
> 将脚手架代理条目替换为下面的完整文件。它使用图像工具和内联研究人员子代理（使用`web_search`）创建一个代理。技能和说明来自项目文件。
>
> 替换`agent.ts`：
>
> ```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { defineDeepAgent } from "managed-deepagents";
>
> import {
>   generateCover,
>   generateSocialImage,
>   webSearch,
> } from "./tools/content";
>
> const researcher = {
>   name: "researcher",
>   description:
>     "ALWAYS use this first to research any topic before writing content. " +
>     "Searches the web for current information, statistics, and sources. " +
>     "When delegating, tell it the topic AND the file path to save results " +
>     "(e.g., 'Research renewable energy and save to research/renewable-energy.md').",
>   model: "anthropic:claude-haiku-4-5-20251001",
>   systemPrompt: `You are a research assistant. You have access to web_search and write_file tools.
>
> ## Your Tools
> - web_search(query, max_results=5, topic="general") - Search the web
> - write_file(file_path, content) - Save your findings
>
> ## Your Process
> 1. Use web_search to find information on the topic
> 2. Make 2-3 targeted searches with specific queries
> 3. Gather key statistics, quotes, and examples
> 4. Save findings to the file path specified in your task
>
> ## Important
> - The user will tell you WHERE to save the file - use that exact path
> - Always include source URLs in your findings
> - Keep findings concise but informative
> `,
>   tools: [webSearch],
> };
>
> export const agent = defineDeepAgent({
>   name: "content-builder",
>   model: "anthropic:claude-sonnet-4-5-20250929",
>   tools: [generateCover, generateSocialImage],
>   subagents: [researcher],
> });
> ```
>
> ### 运行代理
>
> **1。本地运行**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install
> npx mda dev
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm install
> pnpm exec mda dev
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bun install
> bunx mda dev
> ```
>
> `mda dev` 在LangSmith Studio 中打开代理。发送提示，例如：
>
> ```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> Write a blog post about how AI agents are transforming software development
> ```
>
> 你应该看到代理加载技能，委托给`researcher`，编写markdown，调用图像工具。有关更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development)。
>
> **2。部署（可选）**
>
> ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx mda deploy
> ```
>
> ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> pnpm exec mda deploy
> ```
>
> ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> bunx mda deploy
> ```
>
> 参见[Deploy](/langsmith/javascript/managed-deep-agents-deploy)。> [标签] Deep Agents SDK
>
> 当您想要自己托管代理或运行自定义 [LangSmith Deployment](/langsmith/deployment) 时，请使用开源 SDK。该示例将行为保存在内存文件、技能和子代理定义中，以及 [FilesystemBackend](/oss/javascript/deepagents/backends)。
>
> ### 设置
>
> **1。创建项目目录**
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> mkdir content-builder-agent
> cd content-builder-agent
> ```
>
> **2。安装依赖项**
>
> ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install deepagents @langchain/core @langchain/anthropic @google/generative-ai tavily zod tsx
> ```
>
> ```bash yarn wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add deepagents @langchain/core @langchain/anthropic @google/generative-ai tavily zod tsx
> ```
>
> 添加`tsx`来运行`content_writer.ts`。安装`@langchain/anthropic`，以便LangChain可以加载`createDeepAgent`使用的默认Claude模型。
>
> **3。设置 API 密钥**
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export ANTHROPIC_API_KEY="your_anthropic_api_key"
> export GOOGLE_API_KEY="your_google_api_key"
> export TAVILY_API_KEY="your_tavily_api_key"           # Optional
> export LANGSMITH_API_KEY="your_langsmith_api_key"     # Optional
> ```
>
> ### 添加配置文件
>
> **1。添加代理.md**
>
> 在项目根目录中创建`AGENTS.md`。当您创建代理并在 [memory](/oss/javascript/deepagents/memory) 参数中传递此文件时，它将加载到系统提示符中，以便品牌声音和研究期望适用于每次运行：
>
> ```markdown expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> # Content Writer Agent
>
> You are a content writer for a technology company. Your job is to create engaging, informative content that educates readers about AI, software development, and emerging technologies.
>
> ## Brand Voice
>
> - **Professional but approachable**: Write like a knowledgeable colleague, not a textbook
> - **Clear and direct**: Avoid jargon unless necessary; explain technical concepts simply
> - **Confident but not arrogant**: Share expertise without being condescending
> - **Engaging**: Use concrete examples, analogies, and stories to illustrate points
>
> ## Writing Standards
>
> 1. **Use active voice**: "The agent processes requests" not "Requests are processed by the agent"
> 2. **Lead with value**: Start with what matters to the reader, not background
> 3. **One idea per paragraph**: Keep paragraphs focused and scannable
> 4. **Concrete over abstract**: Use specific examples, numbers, and case studies
> 5. **End with action**: Every piece should leave the reader knowing what to do next
>
> ## Content Pillars
>
> Our content focuses on:
> - AI agents and automation
> - Developer tools and productivity
> - Software architecture and best practices
> - Emerging technologies and trends
>
> ## Formatting Guidelines
>
> - Use headers (H2, H3) to break up long content
> - Include code examples where relevant (with syntax highlighting)
> - Add bullet points for lists of 3+ items
> - Keep sentences under 25 words when possible
> - Include a clear call-to-action at the end
>
> ## Research Requirements
>
> Before writing on any topic:
> 1. Use the `researcher` subagent for in-depth topic research
> 2. Gather at least 3 credible sources
> 3. Identify the key points readers need to understand
> 4. Find concrete examples or case studies to illustrate concepts
> ```
>
> 要匹配您自己的基调、支柱和格式规则，请更新 `AGENTS.md`。
>
> **2。添加技能**
>
> 创建`skills/`目录。每个技能都是一个文件夹，其中包含一个 `SKILL.md` 文件，其中包含 YAML frontmatter（`name`、`description`）和说明。
>
> 创建`skills/blog-post/SKILL.md`：
>
> ````md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ---
> name: blog-post
> description: Writes and structures long-form blog posts, creates tutorial outlines, and optimizes content for SEO with cover image generation. Use when the user asks to write a blog post, article, how-to guide, tutorial, technical writeup, thought leadership piece, or long-form content.
> ---
>
> # Blog Post Writing Skill
>
> ## Research First (Required)
>
> **Before writing any blog post, you MUST delegate research:**
>
> 1. Use the `task` tool with `subagent_type: "researcher"`
> 2. In the description, specify BOTH the topic AND where to save:
>
> ```
> 任务（
> subagent_type="研究员",
> 描述=“研究[主题]。将研究结果保存到研究/[slug].md”
>)
> ```
>
> Example:
> ```
> 任务（
> subagent_type="研究员",> description="研究 2025 年人工智能代理的现状。将研究结果保存到 Research/ai-agents-2025.md"
>)
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every blog post MUST have both a post AND a cover image:**
>
> ```
> 博客/
> └── <slug>/
> ├── post.md # 博文内容
> └── Hero.png # 必需：生成的封面图片
> ```
>
> Example: A post about "AI Agents in 2025" → `blogs/ai-agents-2025/`
>
> **You MUST complete both steps:**
> 1. Write the post to `blogs/<slug>/post.md`
> 2. Generate a cover image using `generate_image` and save to `blogs/<slug>/hero.png`
>
> **A blog post is NOT complete without its cover image.**
>
> ## Blog Post Structure
>
> Every blog post should follow this structure:
>
> ### 1. Hook (Opening)
> - Start with a compelling question, statistic, or statement
> - Make the reader want to continue
> - Keep it to 2-3 sentences
>
> ### 2. Context (The Problem)
> - Explain why this topic matters
> - Describe the problem or opportunity
> - Connect to the reader's experience
>
> ### 3. Main Content (The Solution)
> - Break into 3-5 main sections with H2 headers
> - Each section covers one key point
> - Include code examples, diagrams, or screenshots where helpful
> - Use bullet points for lists
>
> ### 4. Practical Application
> - Show how to apply the concepts
> - Include step-by-step instructions if applicable
> - Provide code snippets or templates
>
> ### 5. Conclusion & CTA
> - Summarize key takeaways (3 bullets max)
> - End with a clear call-to-action
> - Link to related resources
>
> ## Cover Image Generation
>
> After writing the post, generate a cover image using the `generate_cover` tool:
>
> ```
>generate_cover(prompt="图像的详细描述...", slug="your-blog-slug")
> ```
>
> The tool saves the image to `blogs/<slug>/hero.png`.
>
> ### Writing Effective Image Prompts
>
> Structure your prompt with these elements:
>
> 1. **Subject**: What is the main focus? Be specific and concrete.
> 2. **Style**: Art direction (minimalist, isometric, flat design, 3D render, watercolor, etc.)
> 3. **Composition**: How elements are arranged (centered, rule of thirds, symmetrical)
> 4. **Color palette**: Specific colors or mood (warm earth tones, cool blues and purples, high contrast)
> 5. **Lighting/Atmosphere**: Soft diffused light, dramatic shadows, golden hour, neon glow
> 6. **Technical details**: Aspect ratio considerations, negative space for text overlay
>
> ### Example Prompts
>
> **For a technical blog post:**
> ```
> 代表 AI 代理的互连发光立方体的等距 3D 插图，每个立方体都有微妙的电路图案。通过发光数据流连接的立方体。深海军蓝背景 (#0a192f) 带有电蓝色 (#64ffda) 和柔和的紫色 (#c792ea) 口音。干净简约的风格，顶部有很多负空间作为标题。专业科技美学。
> ```
>
> **For a tutorial/how-to:**
> ```
> 手在键盘上打字的干净平面插图，抽象代码符号向上浮动，变成灯泡和齿轮。从软珊瑚到浅桃色的温暖渐变背景。风格友善、平易近人。居中构图，带有文本叠加空间。
> ```
>
> **For thought leadership:**
> ```> 人体轮廓轮廓与几何神经网络模式融合的抽象可视化。分割构图-左侧的有机水彩纹理过渡到右侧的干净矢量线。柔和的鼠尾草绿色和温暖的赤土色配色方案。沉思、前瞻性的心情。
> ```
>
> ## SEO Considerations
>
> - Include the main keyword in the title and first paragraph
> - Use the keyword naturally 3-5 times throughout
> - Keep the title under 60 characters
> - Write a meta description (150-160 characters)
>
> ## Quality Checklist
>
> Before finishing:
> - [ ] Post saved to `blogs/<slug>/post.md`
> - [ ] Hero image generated at `blogs/<slug>/hero.png`
> - [ ] Hook grabs attention in first 2 sentences
> - [ ] Each section has a clear purpose
> - [ ] Conclusion summarizes key points
> - [ ] CTA tells reader what to do next
> ````
>
> 创建`skills/social-media/SKILL.md`：
>
> ````md expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ---
> name: social-media
> description: Drafts engaging social media posts, writes hooks, suggests hashtags, creates thread structures, and generates companion images. Use when the user asks to write a LinkedIn post, tweet, Twitter/X thread, social media caption, social post, or repurpose content for social platforms.
> ---
>
> # Social Media Content Skill
>
> ## Research First (Required)
>
> **Before writing any social media content, you MUST delegate research:**
>
> 1. Use the `task` tool with `subagent_type: "researcher"`
> 2. In the description, specify BOTH the topic AND where to save:
>
> ```
> 任务（
> subagent_type="研究员",
> 描述=“研究[主题]。将研究结果保存到研究/[slug].md”
>)
> ```
>
> Example:
> ```
> 任务（
> subagent_type="研究员",
> description="研究 2025 年可再生能源趋势。将研究结果保存到 Research/renewable-energy.md"
>)
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every social media post MUST have both content AND an image:**
>
> **LinkedIn posts:**
> ```
> 链接/
> └── <slug>/
> ├── post.md # 帖子内容
> └── image.png # 必需：生成的视觉效果
> ```
>
> **Twitter/X threads:**
> ```
> 推文/
> └── <slug>/
> ├── thread.md # 线程内容
> └── image.png # 必需：生成的视觉效果
> ```
>
> Example: A LinkedIn post about "prompt engineering" → `linkedin/prompt-engineering/`
>
> **You MUST complete both steps:**
> 1. Write the content to the appropriate path
> 2. Generate an image using `generate_image` and save alongside the post
>
> **A social media post is NOT complete without its image.**
>
> ## Platform Guidelines
>
> ### LinkedIn
>
> **Format:**
> - 1,300 character limit (show more after ~210 chars)
> - First line is crucial - make it hook
> - Use line breaks for readability
> - 3-5 hashtags at the end
>
> **Tone:**
> - Professional but personal
> - Share insights and learnings
> - Ask questions to drive engagement
> - Use "I" and share experiences
>
> **Structure:**
> ```
> [钩子 - 1 条引人注目的线]
>
> [空行]
>
> [背景 - 为什么这很重要]
>
> [空行]
>
> [主要见解 - 2-3 个短段落]
>
> [空行]
>
> [号召性用语或问题]
>
> #hashtag1 #hashtag2 #hashtag3
> ```
>
> ### Twitter/X
>
> **Format:**
> - 280 character limit per tweet
> - Threads for longer content (use 1/🧵 format)
> - No more than 2 hashtags per tweet
>
> **Thread Structure:**
> ```
> 1/🧵 [Hook - 主要见解]
>
> 2/【支撑点1】
>> 3/【支撑点2】
>
> 4/ [示例或证据]
>
> 5/【结论+CTA】
> ```
>
> ## Image Generation
>
> Every social media post needs an eye-catching image. Use the `generate_social_image` tool:
>
> ```
>generate_social_image(prompt="详细描述...", platform="linkedin", slug="your-post-slug")
> ```
>
> The tool saves the image to `<platform>/<slug>/image.png`.
>
> ### Social Image Best Practices
>
> Social images need to work at small sizes in crowded feeds:
> - **Bold, simple compositions** - one clear focal point
> - **High contrast** - stands out when scrolling
> - **No text in image** - too small to read, platforms add their own
> - **Square or 4:5 ratio** - works across platforms
>
> ### Writing Effective Prompts
>
> Include these elements:
>
> 1. **Single focal point**: One clear subject, not a busy scene
> 2. **Bold style**: Vibrant colors, strong shapes, high contrast
> 3. **Simple background**: Solid color, gradient, or subtle texture
> 4. **Mood/energy**: Match the post tone (inspiring, urgent, thoughtful)
>
> ### Example Prompts
>
> **For an insight/tip post:**
> ```
> 单个发光灯泡漂浮在深紫色渐变背景上，灯泡由互连的金色几何线条制成，柔和的光线向外散发。最小、引人注目、高对比度。方形构图。
> ```
>
> **For announcements/news:**
> ```
> 由彩色几何形状制成的抽象火箭飞船，带着一串粒子向上发射。明亮的珊瑚色和青色配色方案与干净的白色背景相对应。充满活力、喜庆的气氛。大胆的平面插画风格。
> ```
>
> **For thought-provoking content:**
> ```
> 两个重叠的半透明圆圈，一蓝色一橙色，在中心形成发光的交叉点。代表协作或想法的交集。深色木炭背景，柔和空灵的光芒。极简主义和沉思。
> ```
>
> ## Content Types
>
> ### Announcement Posts
> - Lead with the news
> - Explain the impact
> - Include link or next step
>
> ### Insight Posts
> - Share one specific learning
> - Explain the context briefly
> - Make it actionable
>
> ### Question Posts
> - Ask a genuine question
> - Provide your take first
> - Keep it focused on one topic
>
> ## Quality Checklist
>
> Before finishing:
> - [ ] Post saved to `linkedin/<slug>/post.md` or `tweets/<slug>/thread.md`
> - [ ] Image generated alongside the post
> - [ ] First line hooks attention
> - [ ] Content fits platform limits
> - [ ] Tone matches platform norms
> - [ ] Has clear CTA or question
> - [ ] Hashtags are relevant (not generic)
> ````
>
> 他们指示代理首先调用`researcher`子代理，在`blogs/`、`linkedin/`或`tweets/`下编写markdown，并为图像调用`generate_cover`或`generate_social_image`。
>
> ### 构建脚本
>
> 在项目根目录中创建`content_writer.ts`。以下部分按顺序属于一个文件。
>> **1。添加工具**
>
> 研究人员使用 Tavilly 搜索。博客和社交工作流程使用 Google Generative AI SDK 进行图像生成。
>
> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { tool } from "@langchain/core/tools";
> import * as z from "zod";
> import * as fs from "node:fs";
> import * as path from "node:path";
>
> const EXAMPLE_DIR = path.dirname(new URL(import.meta.url).pathname);
>
> const webSearch = tool(
>   async ({ query, maxResults = 5, topic = "general" }) => {
>     const apiKey = process.env.TAVILY_API_KEY;
>     if (!apiKey) return { error: "TAVILY_API_KEY not set" };
>     try {
>       const { TavilyClient } = await import("tavily");
>       const client = new TavilyClient({ apiKey });
>       return client.search(query, { maxResults, topic });
>     } catch (e) {
>       return { error: `Search failed: ${e}` };
>     }
>   },
>   {
>     name: "web_search",
>     description: "Search the web for current information.",
>     schema: z.object({
>       query: z.string().describe("The search query (be specific and detailed)"),
>       maxResults: z
>         .number()
>         .optional()
>         .describe("Number of results to return (default: 5)"),
>       topic: z
>         .enum(["general", "news"])
>         .optional()
>         .describe('"general" for most queries, "news" for current events'),
>     }),
>   },
> );
>
> const generateCover = tool(
>   async ({ prompt, slug }) => {
>     try {
>       const { GoogleGenerativeAI } = await import("@google/generative-ai");
>       const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
>       const model = genai.getGenerativeModel({
>         model: "gemini-2.5-flash-image",
>       });
>       const result = await model.generateContent(prompt);
>       const part = result.response.candidates?.[0]?.content?.parts?.find(
>         (p) => p.inlineData,
>       );
>       if (!part?.inlineData) return "No image generated";
>       const outputPath = path.join(EXAMPLE_DIR, "blogs", slug, "hero.png");
>       fs.mkdirSync(path.dirname(outputPath), { recursive: true });
>       fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
>       return `Image saved to ${outputPath}`;
>     } catch (e) {
>       return `Error: ${e}`;
>     }
>   },
>   {
>     name: "generate_cover",
>     description: "Generate a cover image for a blog post.",
>     schema: z.object({
>       prompt: z
>         .string()
>         .describe("Detailed description of the image to generate."),
>       slug: z
>         .string()
>         .describe("Blog post slug. Image saves to blogs/<slug>/hero.png"),
>     }),
>   },
> );
>
> const generateSocialImage = tool(
>   async ({ prompt, platform, slug }) => {
>     try {
>       const { GoogleGenerativeAI } = await import("@google/generative-ai");
>       const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
>       const model = genai.getGenerativeModel({
>         model: "gemini-2.5-flash-image",
>       });
>       const result = await model.generateContent(prompt);
>       const part = result.response.candidates?.[0]?.content?.parts?.find(
>         (p) => p.inlineData,
>       );
>       if (!part?.inlineData) return "No image generated";
>       const outputPath = path.join(EXAMPLE_DIR, platform, slug, "image.png");
>       fs.mkdirSync(path.dirname(outputPath), { recursive: true });
>       fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
>       return `Image saved to ${outputPath}`;
>     } catch (e) {
>       return `Error: ${e}`;
>     }
>   },
>   {
>     name: "generate_social_image",
>     description: "Generate an image for a social media post.",
>     schema: z.object({
>       prompt: z
>         .string()
>         .describe("Detailed description of the image to generate."),
>       platform: z.string().describe('Either "linkedin" or "tweets"'),
>       slug: z
>         .string()
>         .describe("Post slug. Image saves to <platform>/<slug>/image.png"),
>     }),
>   },
> );
> ```
>
> **2。创建代理**
>
> When creating the deep agent with [createDeepAgent](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent), pass memory paths, the skills directory, image tools, an inline subagent definition, and a [FilesystemBackend](/oss/javascript/deepagents/backends) rooted at the example directory so paths like `./AGENTS.md` and `./skills/` resolve correctly.
>
> ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "google:gemini-3.6-flash",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "openai:gpt-5.5",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "anthropic:claude-sonnet-5",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "openrouter:z-ai/glm-5.2",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "fireworks:accounts/fireworks/models/glm-5p2",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "baseten:zai-org/GLM-5.2",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent, FilesystemBackend } from "deepagents";
>
> function createContentWriter() {
>   const researcherSubagent = {
>     name: "researcher",
>     description:
>       "Research subagent with web search capability. Delegate research tasks here.",
>     systemPrompt:
>       "You are a research assistant. Use the web_search tool to find current, accurate information and return well-organized findings.",
>     tools: [webSearch],
>   };
>
>   return createDeepAgent({
>     model: "ollama:north-mini-code-1.0",
>     memory: ["./AGENTS.md"],
>     skills: ["./skills/"],
>     tools: [generateCover, generateSocialImage],
>     subagents: [researcherSubagent],
>     backend: new FilesystemBackend({ rootDir: EXAMPLE_DIR }),
>   });
> }
> ```
>
> **3。添加入口点**
>
> ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> const task =
>   process.argv.slice(2).join(" ") ||
>   "Write a blog post about how AI agents are transforming software development";
>
> const agent = createContentWriter();
> const result = await agent.invoke({
>   messages: [{ role: "user", content: task }],
>   config: { configurable: { threadId: "content-builder-demo" } },
> });
>
> const messages = result.messages ?? [];
> for (const msg of messages) {
>   if (msg.content) console.log(msg.content);
> }
> ```
>
> ### 运行代理
>
>> [!警告]
>>
>> 文件系统后端可以读取、写入和删除`root_dir`下的文件。仅在专用目录中运行并在发布之前检查生成的内容。
>
> 从项目目录：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx tsx content_writer.ts
> ```
>
> 传递提示作为额外参数：
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx tsx content_writer.ts Write a blog post about prompt engineering
> ```
>
> 设置`LANGSMITH_API_KEY`后，您可以检查[LangSmith](/langsmith/observability)中的运行。
>
> ### 输出
>
> 成功后，代理会在项目根目录下写入工件，例如：
>
> ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> blogs/
> └── prompt-engineering/
>     ├── post.md
>     └── hero.png
> research/
> └── prompt-engineering.md
> ```
>
> 路径遵循`SKILL.md`中的技能说明。
>
> ### 完整代码
>
> 在 GitHub 上浏览完整的 [content-builder-agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent)，包括基于 Rich 的流式 UI。

## 后续步骤* 在`instructions.md`（托管Deep Agents）或`AGENTS.md`（SDK）中编辑品牌规则
* 在`skills/<name>/SKILL.md`下添加新内容类型的技能
* SDK路径上，在`subagents.yaml`添加子代理，在`load_subagents`注册工具；在托管 Deep Agents 上，编辑 `agent.py` 或 `agent.ts` 中的内联 `researcher`
*阅读[Subagents](/oss/javascript/deepagents/subagents)、[Skills](/oss/javascript/deepagents/skills)和[Customization](/oss/javascript/deepagents/customization)
* [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) 和 [Move from Deep Agents](/langsmith/javascript/managed-deep-agents-migrate)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/content-builder.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。