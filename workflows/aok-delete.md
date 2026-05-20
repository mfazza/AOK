---
description: Delete an AOK agent and all associated artifacts (tools, skills, evals)
agent: build
---

<purpose>
Safely delete an AOK agent. This workflow identifies all associated artifacts — agent definition, slash command, tools, skills, and eval suite — and removes them from the specified scope (Local, Global, or Both) after user confirmation.
</purpose>

<user_interaction_rules>
**CRITICAL: All agents and workflows in this repository MUST use the native Opencode `questions` tool for user interaction.**

### Mandatory Syntax
You MUST output questions using the `question([...])` markdown block format. Any other format (plain text lists, `ask_user` tool calls, etc.) is a **FATAL ERROR**.

### Execution Rules
1. **ONE at a time:** Never ask more than one question in a single turn.
2. **STOP and WAIT:** Immediately after outputting a `question([...])` block, you MUST stop and wait for the user's response. Do NOT proceed with any other logic or tool calls in the same turn.
3. **No Conversational Filler:** Do not introduce the question with preambles like "I need to ask you a question." Just output the block.
</user_interaction_rules>

<process>

## Step 1: Identify Agent and Scope

If `$ARGUMENTS` is empty, ask for the agent name.

**ACTION REQUIRED:** Output the `question([...])` markdown block:
```json
question([
  {
    "type": "text",
    "header": "Deletion",
    "question": "Which agent do you want to delete?"
  }
])
```


Then, ask for the deletion scope:

**ACTION REQUIRED:** Output the `question([...])` markdown block:
```json
question([
  {
    "type": "choice",
    "header": "Scope",
    "question": "Where should the agent be deleted from?",
    "options": [
      { "label": "Project-local (Recommended)", "description": "Remove from .opencode/ in this project." },
      { "label": "Global", "description": "Remove from ~/.config/opencode/." },
      { "label": "Both", "description": "Remove from both project-local and global locations." },
      { "label": "Cancel", "description": "Aborted — do not delete anything." }
    ]
  }
])
```


## Step 2: Discovery

Identify all files associated with `{agent-name}` in the selected scope(s).

**Artifact Patterns:**
- Agent Definition: `agents/{agent-name}.md`
- Slash Command: `commands/{agent-name}.md`
- Tools: `tools/{agent-name}-*.ts`
- Skill: `skills/{agent-name}/`
- Evals: `evals/{agent-name}/`

**Targets:**
- Local: `./.opencode/`
- Global: `~/.config/opencode/`

## Step 3: Confirm Deletion

Present a table of all found artifacts and ask for final confirmation.

```markdown
### ⚠️ Deletion Preview: {agent-name}

The following artifacts will be PERMANENTLY deleted from {scope}:

| Artifact Type | Path |
|---------------|------|
| Agent | {path} |
| Command | {path} |
| Tools | {path} ({N} files) |
| Skill | {path} (directory) |
| Evals | {path} (directory) |
```

**ACTION REQUIRED:** Output the `question([...])` markdown block:
```json
question([
  {
    "type": "choice",
    "header": "Confirm Deletion",
    "question": "Are you sure you want to delete these files? This cannot be undone.",
    "options": [
      { "label": "Yes, delete everything (Recommended)", "description": "Permanently remove all identified artifacts" },
      { "label": "No, cancel", "description": "Abort the deletion process" }
    ]
  }
])
```


## Step 4: Execute Cleanup

Remove the files and directories.

```bash
# Example for project-local
rm -f .opencode/agents/{agent-name}.md
rm -f .opencode/commands/{agent-name}.md
rm -f .opencode/tools/{agent-name}-*.ts
rm -rf .opencode/skills/{agent-name}/
rm -rf .opencode/evals/{agent-name}/
```

## Step 5: Final Report

```markdown
## ✅ Agent Deleted: {agent-name}

Successfully removed {N} artifacts from {scope}.

### Summary
- Agent definition: Removed
- Slash command: Removed
- Tools: {N} removed
- Skill: {directory} removed
- Evals: {directory} removed
```

</process>

<guardrails>
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time.
- STOP and WAIT immediately after outputting a `question([...])` block.
- Output the `question([...])` block silently without conversational filler.
</guardrails>
