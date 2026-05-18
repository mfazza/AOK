---
description: Add or update deterministic tools for an agent
agent: build
---

<purpose>
Create or modify custom tools that add determinism to an agent's workflow. Tools replace LLM judgment with code for steps that should always work the same way.
</purpose>

<questioning_format>
**ALL questions to the user MUST use the `question()` selector format.**

UX Rules:
- ONLY output the `question([{...}])` block when asking a question. DO NOT prepend conversational text.
- Ensure the JSON inside `question()` is STRICTLY valid. **CRITICAL:** The `options` property MUST be a valid JSON array enclosed in `[` and `]`. Do not drop the array brackets!
- Users navigate options with **arrow keys** (↑↓) and confirm with **Return**. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.
- Ask **ONE question at a time** — fully resolve each before moving to the next
- Options should be OPINIONATED — put the recommended choice first with "(Recommended)"
- The LAST option is ALWAYS a freeform escape hatch: "Something else (I'll describe)"
- Each option has a `label` and a `description` explaining the tradeoff
- NEVER ask open-ended questions as plain text — always provide curated options

Example:
```json
question([{
  "header": "Agent Mode",
  "question": "How should this agent be used?",
  "multiSelect": false,
  "options": [
    { "label": "Subagent (Recommended)", "description": "Invoked by other agents or via @mention — focused, scoped task" },
    { "label": "Primary agent", "description": "Main assistant you interact with directly — replaces Build/Plan" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```
</questioning_format>


<process>

## Step 1: Identify Target

Parse `$ARGUMENTS` for:
- Agent name (required)
- Tool description or `--list` flag

If `--list`:
```bash
ls .opencode/tools/{agent-name}-*.ts 2>/dev/null
```
Display existing tools and exit.

If no agent name provided, ask:
```
Which agent needs a new tool? (agent name)
```

## Step 2: Understand the Need

If a description was provided, use it. Otherwise, ask:

```json
question([{
  "header": "Tool Purpose",
  "question": "What step should this tool make deterministic?",
  "multiSelect": false,
  "options": [
    { "label": "Input validation", "description": "Check if inputs match expected schema before processing" },
    { "label": "Data parsing", "description": "Extract structured data from raw text/files" },
    { "label": "Output formatting", "description": "Always produce output in exact structure" },
    { "label": "External query", "description": "Call an API or system and return structured results" },
    { "label": "File operations", "description": "Read/write specific file formats deterministically" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

Follow up with:
```json
question([{
  "header": "Tool Inputs",
  "question": "What does the tool receive?",
  "multiSelect": false,
  "options": [
    { "label": "A string (text, path, query)", "description": "Single text input" },
    { "label": "Multiple strings", "description": "Several text parameters" },
    { "label": "A string + options", "description": "Text input with configuration flags" },
    { "label": "Structured data (JSON)", "description": "Complex nested input" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

## Step 3: Design the Tool

Present the design:

```
## Tool Design: {agent-name}-{tool-name}

**Description:** {what it does}
**Args:**
- `{arg1}`: {type} — {description}
- `{arg2}`: {type} — {description}

**Returns:** {description of return value}

**Error handling:** {what happens on invalid input}

Create this tool?
```

## Step 4: Generate the Tool

Create `.opencode/tools/{agent-name}-{tool-name}.ts`:

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  "description": "{description}",
  args: {
    // Typed args with Zod schemas
  },
  async execute(args, context) {
    // Implementation
    return result
  },
})
```

**Implementation principles:**
- Validate inputs early, fail with clear messages
- Return structured data (JSON-serializable)
- Use `context.directory` for file paths relative to project
- Use `context.worktree` for git root
- Keep it focused — one tool, one job
- Make it idempotent when possible

## Step 5: Update Agent Prompt

Edit `.opencode/agents/{agent-name}.md` to reference the new tool:
- Add the tool to the agent's process steps
- Describe when to use it and what to do with its output

## Step 6: Add Eval Cases

Add test cases to `.opencode/evals/{agent-name}/cases/` that verify:
- The agent uses the tool when it should
- The agent handles tool errors gracefully
- The tool produces correct output for various inputs

## Step 7: Report

```
## 🔧 Tool Created: {agent-name}-{tool-name}

**File:** `.opencode/tools/{agent-name}-{tool-name}.ts`
**Purpose:** {description}

The agent prompt has been updated to use this tool.
New eval cases added to verify tool usage.

Run `/aok-eval {agent-name}` to verify the tool improves reliability.
```

</process>

<tool_patterns>

### Validation Tool
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  "description": "Validate {thing} against {schema}",
  args: {
    input: tool.schema.string().describe("The {thing} to validate"),
  },
  async execute(args) {
    const errors: string[] = []
    // validation logic
    if (errors.length > 0) {
      return JSON.stringify({ valid: false, errors })
    }
    return JSON.stringify({ valid: true })
  },
})
```

### File Parser Tool
```typescript
import { tool } from "@opencode-ai/plugin"
import fs from "fs/promises"
import path from "path"

export default tool({
  "description": "Parse {format} file and extract {data}",
  args: {
    filePath: tool.schema.string().describe("Path to the file"),
  },
  async execute(args, context) {
    const fullPath = path.resolve(context.directory, args.filePath)
    const content = await fs.readFile(fullPath, "utf-8")
    // parsing logic
    return JSON.stringify(parsed)
  },
})
```

### Shell Wrapper Tool (structured output)
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  "description": "Run {command} and return structured results",
  args: {
    target: tool.schema.string().describe("What to {action}"),
  },
  async execute(args, context) {
    const result = await Bun.$`command ${args.target}`.cwd(context.directory).text()
    // Parse raw output into structured data
    return JSON.stringify(structured)
  },
})
```

</tool_patterns>

<anti_patterns>
- DON'T create tools that just call an LLM — that defeats the purpose
- DON'T create tools for things that genuinely need judgment
- DON'T make tools overly complex — split into multiple if needed
- DON'T forget error handling — tools fail, agents need clear error messages
</anti_patterns>
