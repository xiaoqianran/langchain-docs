<!-- langchain-docs: Build a content builder agent | https://docs.langchain.com/oss/javascript/deepagents/content-builder -->

# Build a content builder agent

Build a content writing agent with brand voice, skills, subagents, and image generation using Managed Deep Agents or the Deep Agents SDK

## Overview

This guide shows how to build a content writing agent with [Deep Agents](/oss/javascript/deepagents). The agent loads brand voice and skills, delegates research to a subagent, drafts blog or social content, and generates companion images.

The agent you build will:

1. Load voice and workflow rules from brand instructions and skill folders
2. Delegate web research to a specialized subagent with `web_search`
3. Draft blog or social content following the loaded skill
4. Generate cover or social images with Gemini and save files under the project directory

For the full runnable SDK project, see the [content-builder-agent](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) example.

### Key concepts

This tutorial covers:

* Brand instructions ([instructions](/langsmith/javascript/managed-deep-agents-instructions) on Managed Deep Agents, or [memory](/oss/javascript/deepagents/memory) files on the SDK) for always-on voice and research rules
* [Skills](/oss/javascript/deepagents/skills) for blog and social playbooks
* [Subagents](/oss/javascript/deepagents/subagents) for research before writing
* [Filesystem backends](/oss/javascript/deepagents/backends) on the SDK path for file read and write
* Custom [tools](/oss/javascript/langchain/tools) for search and image generation

## Prerequisites

API keys:

* Anthropic (Claude) or another chat model provider
* Google (Gemini) for image generation with `gemini-2.5-flash-image`
* [Tavily](https://www.tavily.com/) for web search (free tier)
* [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-content-builder) for tracing (optional on the SDK path; required for Managed Deep Agents)

Node.js 18 or later.

## Choose your path

Start with [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) to run production agents without having to manage infrastructure. Alternatively, for maximum flexibility while using the same Deep Agents harness, use the Deep Agents SDK and host agents yourself, or run a custom [LangSmith Deployment](/langsmith/deployment).

> [tab] Managed Deep Agents
>
> > [!NOTE]
> >
> > Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud).
>
> Managed Deep Agents scaffolds a project and hosts the runtime. Brand voice goes in `instructions.md`, skills stay under `skills/`, and you declare tools and the researcher subagent in code. Image tools write under the project directory during `mda dev`.
>
> ### Setup
>
> To follow along, you need:
>
> * Node.js and npm.
>
> * An API key for your model provider of choice.
>
> **1. Create the project**
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
> **2. Add API keys**
>
> Add chat, image, search, and LangSmith keys to `.env`:
>
> ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
> GOOGLE_API_KEY=<GOOGLE_API_KEY>
> TAVILY_API_KEY=<TAVILY_API_KEY>
> LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
> ```
>
> `GOOGLE_API_KEY` is required for Gemini image generation even when the chat model is Claude.
>
> > [!WARNING]
> >
> > Do not commit the `.env` file into version control. It contains secrets.
>
> **3. Install dependencies**
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
> ### Build the agent
>
> **1. Add tools**
>
> Create search and image tools. Markdown research notes use the agent filesystem (`write_file`). Cover and social images are written under the project directory on the host during local `mda dev`.
>
> Create `tools/content.ts`:
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
> **2. Add brand instructions**
>
> Put always-on brand voice and research requirements in `instructions.md`. Managed Deep Agents loads this file as the main agent system prompt (this is the SDK `AGENTS.md` / `memory=` role, not durable [memory](/langsmith/javascript/managed-deep-agents-memory)):
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
> When you deploy, Managed Deep Agents syncs these instructions to [Context Hub](/langsmith/javascript/managed-deep-agents-context-hub).
>
> **3. Add skills**
>
> Create a `skills/` directory. Each skill is a folder with a `SKILL.md`. Managed Deep Agents discovers skills automatically; you do not pass a `skills=` argument.
>
> Create `skills/blog-post/SKILL.md`:
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
> task(
>     subagent_type="researcher",
>     description="Research [TOPIC]. Save findings to research/[slug].md"
> )
> ```
>
> Example:
> ```
> task(
>     subagent_type="researcher",
>     description="Research the current state of AI agents in 2025. Save findings to research/ai-agents-2025.md"
> )
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every blog post MUST have both a post AND a cover image:**
>
> ```
> blogs/
> └── <slug>/
>     ├── post.md        # The blog post content
>     └── hero.png       # REQUIRED: Generated cover image
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
> generate_cover(prompt="A detailed description of the image...", slug="your-blog-slug")
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
> Isometric 3D illustration of interconnected glowing cubes representing AI agents, each cube has subtle circuit patterns. Cubes connected by luminous data streams. Deep navy background (#0a192f) with electric blue (#64ffda) and soft purple (#c792ea) accents. Clean minimal style, lots of negative space at top for title. Professional tech aesthetic.
> ```
>
> **For a tutorial/how-to:**
> ```
> Clean flat illustration of hands typing on a keyboard with abstract code symbols floating upward, transforming into lightbulbs and gears. Warm gradient background from soft coral to light peach. Friendly, approachable style. Centered composition with space for text overlay.
> ```
>
> **For thought leadership:**
> ```
> Abstract visualization of a human silhouette profile merging with geometric neural network patterns. Split composition - organic watercolor texture on left transitioning to clean vector lines on right. Muted sage green and warm terracotta color scheme. Contemplative, forward-thinking mood.
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
> Create `skills/social-media/SKILL.md`:
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
> task(
>     subagent_type="researcher",
>     description="Research [TOPIC]. Save findings to research/[slug].md"
> )
> ```
>
> Example:
> ```
> task(
>     subagent_type="researcher",
>     description="Research renewable energy trends in 2025. Save findings to research/renewable-energy.md"
> )
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
> linkedin/
> └── <slug>/
>     ├── post.md        # The post content
>     └── image.png      # REQUIRED: Generated visual
> ```
>
> **Twitter/X threads:**
> ```
> tweets/
> └── <slug>/
>     ├── thread.md      # The thread content
>     └── image.png      # REQUIRED: Generated visual
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
> [Hook - 1 compelling line]
>
> [Empty line]
>
> [Context - why this matters]
>
> [Empty line]
>
> [Main insight - 2-3 short paragraphs]
>
> [Empty line]
>
> [Call to action or question]
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
> 1/🧵 [Hook - the main insight]
>
> 2/ [Supporting point 1]
>
> 3/ [Supporting point 2]
>
> 4/ [Example or evidence]
>
> 5/ [Conclusion + CTA]
> ```
>
> ## Image Generation
>
> Every social media post needs an eye-catching image. Use the `generate_social_image` tool:
>
> ```
> generate_social_image(prompt="A detailed description...", platform="linkedin", slug="your-post-slug")
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
> Single glowing lightbulb floating against a deep purple gradient background, lightbulb made of interconnected golden geometric lines, rays of soft light emanating outward. Minimal, striking, high contrast. Square composition.
> ```
>
> **For announcements/news:**
> ```
> Abstract rocket ship made of colorful geometric shapes launching upward with a trail of particles. Bright coral and teal color scheme against clean white background. Energetic, celebratory mood. Bold flat illustration style.
> ```
>
> **For thought-provoking content:**
> ```
> Two overlapping translucent circles, one blue one orange, creating a glowing intersection in the center. Represents collaboration or intersection of ideas. Dark charcoal background, soft ethereal glow. Minimalist and contemplative.
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
> **4. Create the agent**
>
> Replace the scaffolded agent entry with the full file below. It creates an agent with the image tools and an inline researcher subagent (with `web_search`). Skills and instructions come from the project files.
>
> Replace `agent.ts`:
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
> ### Run the agent
>
> **1. Run locally**
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
> `mda dev` opens the agent in LangSmith Studio. Send a prompt such as:
>
> ```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> Write a blog post about how AI agents are transforming software development
> ```
>
> You should see the agent load skills, delegate to `researcher`, write markdown, and call image tools. For more information, see [Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development).
>
> **2. Deploy (optional)**
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
> See [Deploy](/langsmith/javascript/managed-deep-agents-deploy).

> [tab] Deep Agents SDK
>
> Use the open source SDK when you want to host the agent yourself or run a custom [LangSmith Deployment](/langsmith/deployment). The example keeps behavior in memory files, skills, and subagent definitions, plus a [FilesystemBackend](/oss/javascript/deepagents/backends).
>
> ### Setup
>
> **1. Create project directory**
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> mkdir content-builder-agent
> cd content-builder-agent
> ```
>
> **2. Install dependencies**
>
> ```bash npm wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npm install deepagents @langchain/core @langchain/anthropic @google/generative-ai tavily zod tsx
> ```
>
> ```bash yarn wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> yarn add deepagents @langchain/core @langchain/anthropic @google/generative-ai tavily zod tsx
> ```
>
> Add `tsx` to run `content_writer.ts`. Install `@langchain/anthropic` so LangChain can load the default Claude model that `createDeepAgent` uses.
>
> **3. Set API keys**
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> export ANTHROPIC_API_KEY="your_anthropic_api_key"
> export GOOGLE_API_KEY="your_google_api_key"
> export TAVILY_API_KEY="your_tavily_api_key"           # Optional
> export LANGSMITH_API_KEY="your_langsmith_api_key"     # Optional
> ```
>
> ### Add configuration files
>
> **1. Add AGENTS.md**
>
> Create `AGENTS.md` in the project root. When you create the agent and pass this file in the [memory](/oss/javascript/deepagents/memory) parameter, it is loaded into the system prompt so brand voice and research expectations apply to every run:
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
> To match your own tone, pillars, and formatting rules, update `AGENTS.md`.
>
> **2. Add skills**
>
> Create a `skills/` directory. Each skill is a folder containing a `SKILL.md` file with YAML frontmatter (`name`, `description`) and instructions.
>
> Create `skills/blog-post/SKILL.md`:
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
> task(
>     subagent_type="researcher",
>     description="Research [TOPIC]. Save findings to research/[slug].md"
> )
> ```
>
> Example:
> ```
> task(
>     subagent_type="researcher",
>     description="Research the current state of AI agents in 2025. Save findings to research/ai-agents-2025.md"
> )
> ```
>
> 3. After research completes, read the findings file before writing
>
> ## Output Structure (Required)
>
> **Every blog post MUST have both a post AND a cover image:**
>
> ```
> blogs/
> └── <slug>/
>     ├── post.md        # The blog post content
>     └── hero.png       # REQUIRED: Generated cover image
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
> generate_cover(prompt="A detailed description of the image...", slug="your-blog-slug")
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
> Isometric 3D illustration of interconnected glowing cubes representing AI agents, each cube has subtle circuit patterns. Cubes connected by luminous data streams. Deep navy background (#0a192f) with electric blue (#64ffda) and soft purple (#c792ea) accents. Clean minimal style, lots of negative space at top for title. Professional tech aesthetic.
> ```
>
> **For a tutorial/how-to:**
> ```
> Clean flat illustration of hands typing on a keyboard with abstract code symbols floating upward, transforming into lightbulbs and gears. Warm gradient background from soft coral to light peach. Friendly, approachable style. Centered composition with space for text overlay.
> ```
>
> **For thought leadership:**
> ```
> Abstract visualization of a human silhouette profile merging with geometric neural network patterns. Split composition - organic watercolor texture on left transitioning to clean vector lines on right. Muted sage green and warm terracotta color scheme. Contemplative, forward-thinking mood.
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
> Create `skills/social-media/SKILL.md`:
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
> task(
>     subagent_type="researcher",
>     description="Research [TOPIC]. Save findings to research/[slug].md"
> )
> ```
>
> Example:
> ```
> task(
>     subagent_type="researcher",
>     description="Research renewable energy trends in 2025. Save findings to research/renewable-energy.md"
> )
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
> linkedin/
> └── <slug>/
>     ├── post.md        # The post content
>     └── image.png      # REQUIRED: Generated visual
> ```
>
> **Twitter/X threads:**
> ```
> tweets/
> └── <slug>/
>     ├── thread.md      # The thread content
>     └── image.png      # REQUIRED: Generated visual
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
> [Hook - 1 compelling line]
>
> [Empty line]
>
> [Context - why this matters]
>
> [Empty line]
>
> [Main insight - 2-3 short paragraphs]
>
> [Empty line]
>
> [Call to action or question]
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
> 1/🧵 [Hook - the main insight]
>
> 2/ [Supporting point 1]
>
> 3/ [Supporting point 2]
>
> 4/ [Example or evidence]
>
> 5/ [Conclusion + CTA]
> ```
>
> ## Image Generation
>
> Every social media post needs an eye-catching image. Use the `generate_social_image` tool:
>
> ```
> generate_social_image(prompt="A detailed description...", platform="linkedin", slug="your-post-slug")
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
> Single glowing lightbulb floating against a deep purple gradient background, lightbulb made of interconnected golden geometric lines, rays of soft light emanating outward. Minimal, striking, high contrast. Square composition.
> ```
>
> **For announcements/news:**
> ```
> Abstract rocket ship made of colorful geometric shapes launching upward with a trail of particles. Bright coral and teal color scheme against clean white background. Energetic, celebratory mood. Bold flat illustration style.
> ```
>
> **For thought-provoking content:**
> ```
> Two overlapping translucent circles, one blue one orange, creating a glowing intersection in the center. Represents collaboration or intersection of ideas. Dark charcoal background, soft ethereal glow. Minimalist and contemplative.
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
> They instruct the agent to call the `researcher` subagent first, write markdown under `blogs/`, `linkedin/`, or `tweets/`, and call `generate_cover` or `generate_social_image` for images.
>
> ### Build the script
>
> Create `content_writer.ts` in the project root. The following sections belong in one file, in order.
>
> **1. Add tools**
>
> The researcher uses Tavily search. Blog and social workflows use the Google Generative AI SDK for image generation.
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
> **2. Create the agent**
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
> **3. Add an entry point**
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
> ### Run the agent
>
> > [!WARNING]
> >
> > The filesystem backend can read, write, and delete files under `root_dir`. Run only in a dedicated directory and review generated content before publishing.
>
> From the project directory:
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx tsx content_writer.ts
> ```
>
> Pass a prompt as extra arguments:
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> npx tsx content_writer.ts Write a blog post about prompt engineering
> ```
>
> With `LANGSMITH_API_KEY` set, you can inspect runs in [LangSmith](/langsmith/observability).
>
> ### Output
>
> On success, the agent writes artifacts under the project root, for example:
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
> Paths follow the skill instructions in `SKILL.md`.
>
> ### Full code
>
> Browse the complete [content-builder-agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) on GitHub, including the Rich-based streaming UI.

## Next steps

* Edit brand rules in `instructions.md` (Managed Deep Agents) or `AGENTS.md` (SDK)
* Add skills under `skills/<name>/SKILL.md` for new content types
* On the SDK path, add subagents in `subagents.yaml` and register tools in `load_subagents`; on Managed Deep Agents, edit the inline `researcher` in `agent.py` or `agent.ts`
* Read [Subagents](/oss/javascript/deepagents/subagents), [Skills](/oss/javascript/deepagents/skills), and [Customization](/oss/javascript/deepagents/customization)
* [Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) and [Move from Deep Agents](/langsmith/javascript/managed-deep-agents-migrate)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/content-builder.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).