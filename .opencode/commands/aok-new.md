---
description: Create a new AI agent from scratch — interview, generate, scaffold, eval, end-to-end test
agent: build
---

<purpose>
Create a new AI agent through guided interview, then generate all artifacts: agent definition, tools, skills, command, and eval suite. Run end-to-end test before finishing. This is the primary entry point for AOK.

The workflow: understand → design → generate → scaffold evals → end-to-end test → incorporate feedback.
</purpose>

<required_reading>
Read these before generating:
- `references/eval-taxonomy.md` — Catalog of eval types (select relevant ones per agent)
- `references/agent-design-patterns.md` — Architecture patterns
- `references/tool-cookbook.md` — Tool templates
</required_reading>

<questioning_format>
**ALL questions to the user MUST use the `question()` selector format.**

UX Rules:
- ONLY output the `question([{...}])` block when asking a question. DO NOT prepend conversational text.
- Ensure the JSON inside `question()` is STRICTLY valid. **CRITICAL:** The `options` property MUST be a valid JSON array enclosed in `[` and `]`. Do not drop the array brackets!
- Users navigate options with **arrow keys** (↑↓) and confirm with **Return**. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.
- Ask **ONE question at a time** — fully resolve each before moving to the next
- Options should be OPINIONATED — put the recommended choice first with "(Recommended)"
- The LAST option is ALWAYS a freeform escape hatch: "Something else (I'll describe)"
- Keep options to 3-5 choices (plus the freeform escape)
- Each option has a `label` and a `description` explaining the tradeoff
- NEVER ask open-ended questions as plain text — always provide curated options
- When there are many decisions, present them sequentially (one selector per decision)

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

If the user selects the freeform option, ask ONE follow-up to clarify, then continue.

If the user selects "Orchestrator", ask a follow-up question to define its subagents:
```json
question([{
  "header": "Context Firewalls",
  "question": "Orchestrators use specialized subagents as 'context firewalls' to delegate reading and keep their own context clean. What subagents does this orchestrator need?",
  "multiSelect": true,
  "options": [
    { "label": "Security Reviewer", "description": "Reads code and returns security findings only" },
    { "label": "Performance Reviewer", "description": "Reads code and returns performance findings only" },
    { "label": "Codebase Mapper", "description": "Explores the repo and returns an architectural summary" },
    { "label": "Something else (I'll describe)", "description": "Custom specialized subagents" }
  ]
}])
```
*(If the user selects subagents, you will iterate Step 3 and Step 4 to scaffold both the Orchestrator AND its Subagents).*
</questioning_format>

<process>

## Step 0: Route — Agent vs Tool vs Skill vs Global Context

**Before creating an agent, determine if the user actually needs one.**

Analyze `$ARGUMENTS` (or the initial description) against these criteria:

| Signal | What They Actually Need | Why |
|--------|------------------------|-----|
| "always does X the same way" | **Tool** | Deterministic = code, not LLM |
| "parse/extract/validate/format" | **Tool** | Data transformation = code |
| "run this command/script" | **Tool** | CLI wrapper = code |
| "remember that we always..." | **Global Context** | Repo-wide convention = root file |
| "best practices for the repo" | **Global Context** | Universal rules = root file |
| "document how to do X" | **Skill** | Procedural knowledge = docs |
| "follow these steps when..." | **Skill** | Conditional procedure = docs |
| "decide/judge/analyze/review" | **Agent** | Judgment calls = LLM |
| "coordinate/orchestrate/manage" | **Agent** | Multi-step reasoning = LLM |
| "create/generate/write" | **Agent** | Creative output = LLM |

### If it's clearly a Tool:

```json
question([{
  "header": "💡 Routing Recommendation",
  "question": "What you're describing sounds like a tool (deterministic code), not an agent. Tools are faster, cheaper, and more reliable for this. How should I proceed?",
  "multiSelect": false,
  "options": [
    { "label": "Create it as a tool (Recommended)", "description": "Deterministic TypeScript tool — no LLM needed, always consistent" },
    { "label": "Create it as a tool + agent wrapper", "description": "Tool for the logic, thin agent that invokes it with context" },
    { "label": "I still want a full agent", "description": "I'll explain why it needs LLM judgment" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

If the user confirms "tool", run `/aok-tools` instead (pass the context forward).

### If it's clearly a Skill:

```json
question([{
  "header": "💡 Routing Recommendation",
  "question": "What you're describing sounds like procedural knowledge — a skill that agents can load when needed. Skills are for conditional, on-demand workflows.",
  "multiSelect": false,
  "options": [
    { "label": "Create it as a skill (Recommended)", "description": "SKILL.md with procedural knowledge — loadable by any agent" },
    { "label": "Create a skill + dedicated agent", "description": "Skill for the knowledge, agent that applies it to tasks" },
    { "label": "I still want a full agent", "description": "I'll explain why it needs its own identity" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

If the user confirms "skill", run `/aok-skill` instead (pass the context forward).

### If it's clearly Global Context:

```json
question([{
  "header": "💡 Routing Recommendation",
  "question": "What you're describing sounds like global repo context (e.g., universal best practices or tech stack rules), not a specific agent or skill.",
  "multiSelect": false,
  "options": [
    { "label": "Add to root context file (Recommended)", "description": "Write these rules to a root GEMINI.md or AGENTS.md file" },
    { "label": "I still want a skill/agent", "description": "I'll explain why this shouldn't be global" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

If the user confirms "global context", help them edit their `AGENTS.md` or `GEMINI.md` file directly instead of continuing this workflow.

### If it needs an agent → continue to Step 1

If the description clearly involves judgment, decision-making, creative output, or multi-step reasoning, proceed directly to Step 1 without the routing question.

## Step 1: Understand the Agent

If `$ARGUMENTS` contains a description, use it as the starting point and skip to Step 2.

Otherwise:
```json
question([{
  "header": "🤖 Agent Operator Kit",
  "question": "What kind of agent do you want to create?",
  "multiSelect": false,
  "options": [
    { "label": "Code reviewer", "description": "Analyzes code for bugs, security, quality" },
    { "label": "Task automator", "description": "Executes repeatable workflows (deploy, release, test)" },
    { "label": "Knowledge assistant", "description": "Answers questions using domain expertise" },
    { "label": "Operator", "description": "Interacts with external systems (Jira, GitHub) via tools/MCP" },
    { "label": "Orchestrator", "description": "Coordinates multiple agents/steps in a pipeline" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

## Step 2: Interview (3-5 questions, adaptive)

Ask questions ONE AT A TIME using `question()` format. Stop when you have enough to proceed.

**Question 1: Scope & Task**
```json
question([{
  "header": "Scope",
  "question": "What's the primary task this agent performs?",
  "multiSelect": false,
  "options": [
    // Generate 3-4 opinionated options BASED ON the agent type selected in Step 1
    { "label": "{most likely task}", "description": "{tradeoff}" },
    { "label": "{second most likely}", "description": "{tradeoff}" },
    { "label": "{third option}", "description": "{tradeoff}" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Question 2: Output Format**
```json
question([{
  "header": "Output",
  "question": "What should the agent produce?",
  "multiSelect": false,
  "options": [
    { "label": "{most natural output for this agent type}", "description": "{details}" },
    { "label": "{alternative format}", "description": "{details}" },
    { "label": "{minimal format}", "description": "{details}" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Question 3: Determinism & Tools**
```json
question([{
  "header": "Determinism",
  "question": "Which parts of this workflow should use strict code (Tools) instead of LLM judgment?",
  "multiSelect": true,
  "options": [
    { "label": "{Specific recommendation based on context}", "description": "Recommended because {brief technical reason}." },
    { "label": "Input validation", "description": "Verify schemas, existence of files, or credentials" },
    { "label": "Data transformation", "description": "Parse raw text or format structured outputs (JSON/YAML)" },
    { "label": "External system calls", "description": "Execute CLI commands, query APIs, or write to disk" },
    { "label": "None needed", "description": "The LLM's reasoning is sufficient for all steps" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Question 4: Knowledge Needs (ask only if relevant)**
```json
question([{
  "header": "Knowledge",
  "question": "What kind of specialized knowledge does this agent need to reference?",
  "multiSelect": true,
  "options": [
    { "label": "Procedural (new skill)", "description": "Step-by-step procedures or decision trees → creates a SKILL" },
    { "label": "Domain conventions (new skill)", "description": "Specific naming rules or format rules → creates a SKILL" },
    { "label": "Global rules (repo-level)", "description": "Universal rules via AGENTS.md or opencode/rules/" },
    { "label": "Existing reference docs", "description": "Link to documentation already available in the workspace" },
    { "label": "None needed", "description": "Core behavioral prompt is sufficient" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Question 5: Quality Bar (always ask)**
```json
question([{
  "header": "Quality",
  "question": "Which quality dimensions are critical for this agent?",
  "multiSelect": true,
  "options": [
    { "label": "Correctness", "description": "Outputs must be factually accurate" },
    { "label": "Completeness", "description": "Must cover all aspects, no gaps" },
    { "label": "Format consistency", "description": "Must always produce same structure" },
    { "label": "Safety/boundaries", "description": "Must stay in scope, refuse dangerous ops" },
    { "label": "Speed/conciseness", "description": "Must be fast and not verbose" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Interview principles:**
- If the user gives a comprehensive answer to any question, skip questions it already covers
- Capture specific examples of good/bad behavior — these become eval cases
- Listen for "always" / "never" / "must" — these signal tool opportunities
- Listen for "it depends" / "use judgment" — these stay in the prompt
- Maximum 5 questions — if you have enough after 3, move on

After enough context, present a summary for confirmation:

```json
question([{
  "header": "✅ Agent Design",
  "question": "Here's what I'll build. Look right?",
  "multiSelect": false,
  "options": [
    { "label": "Yes, generate it", "description": "Create all artifacts now" },
    { "label": "Adjust something", "description": "Let me refine a detail" },
    { "label": "Start over", "description": "I want to rethink the approach" }
  ]
}])
```

Display the summary ABOVE the "question":
```
## Agent Design Summary

**Name:** {agent-name}
**Purpose:** {one-line description}
**Mode:** {primary | subagent}
**Architecture:** {single-purpose | tool-augmented | knowledge-loaded | full-stack}

**Inputs:** {what it receives}
**Outputs:** {what it produces}

**Tools to create:** {list or "none"}
**Skills to create:** {list or "none"}

**Eval strategy:** {which test types from eval-taxonomy.md apply}
**Estimated cases:** {count based on complexity}
```

## Step 3: Generate Agent Definition

Create the agent markdown file at `.opencode/agents/{agent-name}.md`:

```markdown
---
description: {description from interview}
mode: {primary | subagent}
model: {appropriate model}
temperature: {0.1 for deterministic tasks, 0.3 for creative}
permissions:
  edit: {allow | ask | deny}
  bash: {allow | ask | deny}
---

{System prompt derived from interview}
```

**Agent prompt structure:**
1. Role and purpose (1-2 sentences)
2. Inputs it expects
3. Step-by-step process (referencing tools and skills)
4. Output format
5. Quality criteria / guardrails

## Step 4: Generate Tools (if applicable)

For each deterministic step identified in the interview, create a tool at `.opencode/tools/{agent-name}-{tool-name}.ts`:

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  "description": "{what this tool does}",
  args: {
    // Use JSON Schema: { type: "string", description: "..." }
    // For arrays: { type: "array", items: { type: "string" }, description: "..." }
  },
  async execute(args, context) {
    // Deterministic implementation
    return result
  },
})
```

**Tool design principles:**
- Tools REPLACE LLM judgment with code — don't create tools that just wrap an LLM call
- Tools should be idempotent when possible
- Tools should validate inputs and return clear errors
- Tools should return structured data the agent can reason about

## Step 5: Generate Skill (if applicable)

For procedural knowledge identified in the interview, create `.opencode/skills/{agent-name}/SKILL.md`:

```markdown
---
name: {agent-name}
description: {when to load this skill}
license: MIT
compatibility: opencode
metadata:
  category: {category}
---

# {Agent Name} Skill

## Overview
{What this skill teaches}

## When to Use
{Conditions for loading this skill}

## Process
{Step-by-step procedural knowledge}

## References
{Any reference files in references/ subdirectory}
```

## Step 6: Generate Slash Command

Create `.opencode/commands/{agent-name}.md`:

```markdown
---
description: {brief description}
agent: {agent-name}
subtask: {true if subagent}
---

{Command prompt template with $ARGUMENTS placeholder}
```

## Step 7: Generate Eval Suite

**Consult `references/eval-taxonomy.md`** to select the most relevant eval types for this agent.

### 7a: Select Eval Dimensions

Based on what the agent does, select from the taxonomy:

| Agent Does... | Include These Tests |
|--------------|---------------------|
| Produces structured output | Format Compliance, Completeness, Consistency |
| Uses tools | Tool Usage Correctness, Tool Integration, Error Recovery |
| Makes decisions | Decision Quality, Reasoning Quality, Scope Adherence |
| Takes user input | Empty/Minimal Input, Ambiguous Input, Adversarial Input |
| Has restricted permissions | Permission Boundaries, Scope Adherence |
| Loads skills | Skill Loading, Context Utilization |
| Is user-facing | Tone Appropriateness, Helpfulness |

**Always include:** Task Completion + End-to-End Flow + at least one robustness test.

### 7b: Write EVAL-SPEC.md

Create `.opencode/evals/{agent-name}/EVAL-SPEC.md` with:
- Selected dimensions from taxonomy (with priority: Critical/High/Medium)
- Concrete rubrics (PASS/FAIL) for each dimension
- Measurement approach (Code check / LLM Judge / Human)
- Passing criteria

### 7c: Generate Test Cases

Generate cases based on agent complexity:
- Simple (prompt only): minimum 8 cases
- Tool-augmented: minimum 12 cases
- Knowledge-loaded: minimum 12 cases
- Full stack: minimum 15 cases

**Distribution:**
- 30% Happy path (standard usage, expected inputs)
- 25% Edge cases (boundary conditions, unusual valid inputs)
- 25% Robustness (empty input, malformed data, overload)
- 10% Adversarial (prompt injection, scope violations, manipulation)
- 10% Integration (tool usage, skill loading, permission boundaries)

Write cases to `.opencode/evals/{agent-name}/cases/`:
- One markdown file per case: `01-happy-path-basic.md`, `02-happy-path-complex.md`, etc.
- Each case has: Category, Input, Expected Behavior, Checks (verifiable assertions)

## Step 8: End-to-End Test (MANDATORY)

**This step is NOT optional.** Before reporting success, run the agent end-to-end.

### 8a: Select E2E Scenario

Pick the MOST representative happy-path case from the eval suite.

### 8b: Execute the Agent

Simulate a full run:
1. Load the agent's system prompt
2. Apply it to the E2E test case input
3. If tools were created — verify they'd be called correctly
4. If skills were created — verify loading triggers work
5. Generate the full output the agent would produce

### 8c: Evaluate Against Rubrics

Apply ALL Critical and High dimension rubrics to the E2E output:
- Does it complete the task? (Task Completion)
- Is the format correct? (Format Compliance)
- Did it use tools correctly? (Tool Usage — if applicable)
- Is it within scope? (Scope Adherence)

### 8d: Incorporate Feedback

**If the E2E test reveals issues:**

For EACH issue found:
1. **Diagnose**: Is this a prompt gap, missing tool, missing knowledge, or format problem?
2. **Fix immediately**:
   - Prompt gap → edit `.opencode/agents/{agent-name}.md` with clearer instructions
   - Missing tool → create the tool, update agent prompt to reference it
   - Missing knowledge → add to skill or prompt
   - Format issue → add explicit output template to prompt
3. **Add a regression case** to the eval suite covering the discovered issue

**Report adjustments made:**
```
### 🔄 E2E Adjustments Applied

{N} issues found during end-to-end test:
1. {issue} → {fix applied}
2. {issue} → {fix applied}

Agent prompt updated. {N} new eval cases added.
```

### 8e: Re-run E2E (if fixes were applied)

After incorporating fixes, re-run the same E2E scenario to confirm the fix works.
Repeat until the E2E test passes cleanly.

## Step 9: Report Results

Present the final report with tables:

```
## ✅ Agent Created: {agent-name}

### Files Generated

| Path | Purpose |
|------|---------|
| `.opencode/agents/{agent-name}.md` | Agent definition (prompt + config) |
| `.opencode/commands/{agent-name}.md` | Slash command |
| `.opencode/tools/{agent-name}-*.ts` | Deterministic tools ({N} tools) |
| `.opencode/skills/{agent-name}/SKILL.md` | Procedural knowledge |
| `.opencode/evals/{agent-name}/` | Eval suite ({N} cases) |

### E2E Test Results

| Dimension | Priority | Result | Notes |
|-----------|----------|--------|-------|
| Task Completion | Critical | ✅ PASS | — |
| Format Compliance | High | ✅ PASS | — |
| Tool Usage | High | ✅ PASS | — |
| Scope Adherence | Medium | ✅ PASS | — |

**E2E Status:** ✅ Passed {(or: ✅ Passed after {N} adjustments)}

### Eval Coverage

| Dimension | Priority | Measurement | Cases |
|-----------|----------|-------------|-------|
| {dimension 1} | Critical | {Code/LLM Judge} | {N} |
| {dimension 2} | High | {Code/LLM Judge} | {N} |
| {dimension 3} | Medium | {LLM Judge} | {N} |

### Next Steps

1. Run `/aok-eval {agent-name}` to run the full eval suite
2. Try the agent: `/{agent-name} {example input}`
3. Compare models: `/aok-eval-compare {agent-name}`
4. Iterate: `/aok-iterate {agent-name}` if evals reveal issues
```

</process>

<guardrails>
- ALWAYS use `question()` format for user interaction — never plain-text questions
- ALWAYS include opinionated options with the recommended choice marked
- ALWAYS end option lists with a freeform escape ("Something else (I'll describe)")
- ALWAYS generate an eval suite — no agent ships without evals
- ALWAYS run end-to-end test before reporting success — this is non-negotiable
- ALWAYS incorporate E2E feedback into the agent before finishing
- Tools should add DETERMINISM, not just wrap shell commands
- Skills should encode PROCEDURAL KNOWLEDGE, not just reference docs
- Agent prompts should be SPECIFIC and ACTIONABLE, not vague
- Consult `references/eval-taxonomy.md` to select eval dimensions — don't guess
- If the agent is trivial (no tools, no skills needed), still generate evals and E2E test
</guardrails>

<tool_decision_framework>
**Create a tool when:**
- A step has a deterministic correct answer (validation, parsing, formatting)
- The step involves structured data transformation
- The step queries external systems (APIs, databases, files)
- Reliability > flexibility for this step

**Keep in the prompt when:**
- The step requires judgment, creativity, or context-sensitivity
- The step needs to adapt to novel situations
- The "right answer" varies by context
</tool_decision_framework>

<knowledge_routing>
**Put in Global Context (AGENTS.md / GEMINI.md) when (Reference Knowledge):**
- The rule applies repo-wide
- It dictates universal best practices or tech stack choices
- Every agent and developer needs to know it implicitly

**Create a SKILL when (Procedural Knowledge):**
- There's a multi-step process the agent needs to follow conditionally
- Explicit heuristics, decision trees, or troubleshooting steps are needed conditionally
- There are reference tables, API schemas, or lookup data that should only be fetched on-demand (never core behavior)
- The knowledge applies to multiple agents or contexts but isn't repo-wide

**Keep in the PROMPT when (Behavioral Knowledge):**
- The instructions describe core identity and behavioral rules (always needed)
- The instructions define *how* the agent thinks or acts on every invocation
- The knowledge is concise and essential for its baseline task
</knowledge_routing>
