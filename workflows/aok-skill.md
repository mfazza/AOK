---
description: Create or update a skill (procedural knowledge) for an agent
agent: build
---

<purpose>
Create or update skills that encode procedural knowledge for agents. Skills are loaded on-demand via opencode's native skill tool — they teach an agent HOW to do something without bloating the system prompt.
</purpose>

<user_interaction_rules>
**CRITICAL: You MUST use your native `ask_user` tool-calling capability for ALL user interactions.**
**NEVER output a markdown block with `question([...])`. NEVER output a numbered list of questions as plain text.**

UX Rules:
- ALWAYS use the native `ask_user` tool. Do NOT print JSON to the screen. Call the tool silently without conversational preambles.
- Ask **ONE question at a time** — fully resolve each before moving to the next.
- For multiple choice, use `type: "choice"`. You MUST provide an `options` array. Do NOT add a "Something else" or "Other" option to the array; the tool provides a freeform escape hatch automatically.
- For freeform text input, use `type: "text"`. You MUST NOT provide an `options` array. Do NOT add escape hatches to text questions.
</user_interaction_rules>


<process>

## Step 1: Identify Target

Parse `$ARGUMENTS` for:
- Agent name (required)
- `--list` to show existing skills

If `--list`:
```bash
find .opencode/skills/ -name "SKILL.md" 2>/dev/null | while read f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  desc=$(grep "^description:" "$f" | head -1 | sed 's/description: //')
  echo "  $name: $desc"
done
```
Display existing skills and exit.

## Step 2: Understand the Knowledge

Ask (if not provided in arguments):

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Skill Type"
- `question`: "What kind of knowledge does this agent need?"
- `options`:
  - `label`: "Process/procedure", `description`: "Multi-step how-to with decision points"
  - `label`: "Domain conventions", `description`: "Rules, standards, naming patterns for a domain"
  - `label`: "Reference tables", `description`: "Lookup data, API schemas, decision matrices"
  - `label`: "Templates", `description`: "Standard formats for producing specific outputs"
  - `label`: "Decision tree", `description`: "When to choose approach A vs B vs C"


Follow up:
**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Loading"
- `question`: "When should the agent load this knowledge?"
- `options`:
  - `label`: "When processing specific file types", `description`: "e.g., load when reviewing .ts files"
  - `label`: "When a keyword/topic appears", `description`: "e.g., load when user mentions 'security'"
  - `label`: "When a specific tool is about to be used", `description`: "e.g., load before running deploy"
  - `label`: "On every invocation", `description`: "Always needed — consider putting in prompt instead"


**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Scripts & Hooks"
- `question`: "Does this skill require executable scripts (e.g., bash/node scripts or pre/post hooks)?"
- `options`:
  - `label`: "No (Recommended)", `description`: "Just procedural documentation and references"
  - `label`: "Yes", `description`: "I need a scripts/ directory for executable logic"


## Step 3: Design the Skill

Present the design:

```
## Skill Design: {skill-name}

**Loads when:** {trigger condition}
**Teaches:** {what the agent learns}
**References:** {any supporting files}

Create this skill?
```

## Step 4: Generate the Skill

Create `.opencode/skills/{skill-name}/SKILL.md`:

Follow the opencode skill format:
```markdown
---
name: {skill-name}
description: {when to use — specific enough for agent to choose correctly}
license: MIT
compatibility: opencode
metadata:
  category: {category}
  agent: {agent-name}
---

# {Skill Title}

## Overview
{What this skill teaches — 2-3 sentences}

## When to Use
{Specific conditions for loading this skill}

## Process
{Step-by-step procedural knowledge}

## Examples
{Concrete examples of applying this knowledge}

## Anti-Patterns
{Common mistakes to avoid}
```

**If reference files are needed**, create them in `.opencode/skills/{skill-name}/references/`:
- Keep references factual and structured
- Use tables, decision trees, or lookup formats
- Skill body should explain HOW to use the references

**If executable scripts/hooks are needed**, create them in `.opencode/skills/{skill-name}/scripts/`:
- Create empty shell scripts or node wrappers based on the user's need.
- Update the `SKILL.md` to explicitly tell the agent how and when to invoke these scripts via bash.

## Step 5: Update Agent Prompt

Edit `.opencode/agents/{agent-name}.md` to mention the skill:
- Add a note about when to load it
- Reference it in the process steps where it applies

## Step 6: Report

```
## 📚 Skill Created: {skill-name}

**Files:**
- `.opencode/skills/{skill-name}/SKILL.md`
- `.opencode/skills/{skill-name}/references/` (if any)
- `.opencode/skills/{skill-name}/scripts/` (if any)

**Loaded when:** {trigger description}
**Agent updated:** `.opencode/agents/{agent-name}.md`

The agent can now load this skill on-demand when {trigger condition}.
```

</process>

<skill_design_principles>
- Skills are LOADED ON DEMAND — they don't bloat the base prompt
- Description must be specific enough for the agent to know WHEN to load
- Content should be actionable — process steps, not just information
- Keep skills focused — one skill per domain of knowledge
- Include examples — they're the fastest way to communicate expectations
- Include anti-patterns — knowing what NOT to do is as valuable as knowing what to do
</skill_design_principles>

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

<guardrails>
- **FATAL ERROR:** You MUST use the native `ask_user` tool for questions. DO NOT output `question([{...}])` markdown blocks.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- Call the `ask_user` tool silently. Do not print conversational filler.
</guardrails>
