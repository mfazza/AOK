---
description: Create or update a skill (procedural knowledge) for an agent
agent: build
---

<purpose>
Create or update skills that encode procedural knowledge for agents. Skills are loaded on-demand via opencode's native skill tool — they teach an agent HOW to do something without bloating the system prompt.
</purpose>

<questioning_format>
ALL user interactions use `question()` selector format.
- ONLY output the `question([{...}])` block. DO NOT prepend or append text.
- Ensure strict JSON validity. The `options` property MUST be an array enclosed in `[` and `]`.
- Options are navigable with arrow keys (↑↓) and selected with Return
- Recommended choice is first, marked "(Recommended)"
- Last option is always a freeform escape hatch
- Ask ONE question at a time — resolve it fully before moving to the next
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

```
question([{
  header: "Skill Type",
  question: "What kind of knowledge does this agent need?",
  multiSelect: false,
  options: [
    { label: "Process/procedure", description: "Multi-step how-to with decision points" },
    { label: "Domain conventions", description: "Rules, standards, naming patterns for a domain" },
    { label: "Reference tables", description: "Lookup data, API schemas, decision matrices" },
    { label: "Templates", description: "Standard formats for producing specific outputs" },
    { label: "Decision tree", description: "When to choose approach A vs B vs C" },
    { label: "Something else (I'll describe)", description: "Tell me what you have in mind" }
  ]
}])
```

Follow up:
```
question([{
  header: "Loading",
  question: "When should the agent load this knowledge?",
  multiSelect: false,
  options: [
    { label: "When processing specific file types", description: "e.g., load when reviewing .ts files" },
    { label: "When a keyword/topic appears", description: "e.g., load when user mentions 'security'" },
    { label: "When a specific tool is about to be used", description: "e.g., load before running deploy" },
    { label: "On every invocation", description: "Always needed — consider putting in prompt instead" },
    { label: "Something else (I'll describe)", description: "Tell me what you have in mind" }
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

<skill_vs_prompt>
**Put in the SKILL when:**
- Knowledge is >20 lines
- Knowledge is only needed sometimes
- Knowledge could apply to multiple agents
- Knowledge has reference tables or decision trees

**Put in the PROMPT when:**
- Knowledge is core identity (always needed)
- Knowledge is short (<20 lines)
- Knowledge is specific to this agent only
</skill_vs_prompt>
