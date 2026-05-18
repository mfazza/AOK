---
description: Create or update a skill (procedural knowledge) for an agent
agent: build
---

<purpose>
Create or update skills that encode procedural knowledge for agents. Skills are loaded on-demand via opencode's native skill tool — they teach an agent HOW to do something without bloating the system prompt.
</purpose>

<questioning_format>
**ALL questions to the user MUST use the `question()` selector format.**

UX Rules:
- ONLY output the `question([{...}])` block when asking a question. DO NOT prepend conversational text.
- Ensure the JSON inside `question()` is STRICTLY valid. **CRITICAL:** The `options` property MUST be a valid JSON array enclosed in `[` and `]`. Do not drop the array brackets!
- Users navigate options with **arrow keys** (↑↓) and confirm with **Return**. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.
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

```json
question([{
  "header": "Skill Type",
  "question": "What kind of knowledge does this agent need?",
  "multiSelect": false,
  "options": [
    { "label": "Process/procedure", "description": "Multi-step how-to with decision points" },
    { "label": "Domain conventions", "description": "Rules, standards, naming patterns for a domain" },
    { "label": "Reference tables", "description": "Lookup data, API schemas, decision matrices" },
    { "label": "Templates", "description": "Standard formats for producing specific outputs" },
    { "label": "Decision tree", "description": "When to choose approach A vs B vs C" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

Follow up:
```json
question([{
  "header": "Loading",
  "question": "When should the agent load this knowledge?",
  "multiSelect": false,
  "options": [
    { "label": "When processing specific file types", "description": "e.g., load when reviewing .ts files" },
    { "label": "When a keyword/topic appears", "description": "e.g., load when user mentions 'security'" },
    { "label": "When a specific tool is about to be used", "description": "e.g., load before running deploy" },
    { "label": "On every invocation", "description": "Always needed — consider putting in prompt instead" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

```json
question([{
  "header": "Scripts & Hooks",
  "question": "Does this skill require executable scripts (e.g., bash/node scripts or pre/post hooks)?",
  "multiSelect": false,
  "options": [
    { "label": "No (Recommended)", "description": "Just procedural documentation and references" },
    { "label": "Yes", "description": "I need a scripts/ directory for executable logic" }
  ]
}])
```

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
**Put in Global Context (AGENTS.md / GEMINI.md) when:**
- The knowledge dictates universal best practices or tech stack rules
- The rule applies repo-wide
- Every agent and developer needs to know it implicitly

**Put in the SKILL when:**
- Knowledge is >20 lines
- Knowledge is only needed *conditionally* (on-demand)
- Knowledge has reference tables or decision trees
- Knowledge applies to multiple agents, but NOT repo-wide

**Put in the PROMPT when:**
- Knowledge is core identity (always needed)
- Knowledge is short (<20 lines)
- Knowledge is specific to this agent only
</knowledge_routing>
