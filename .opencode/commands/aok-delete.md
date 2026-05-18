---
description: Delete an AOK agent and all associated artifacts (tools, skills, evals)
agent: build
---

<purpose>
Safely delete an AOK agent. This workflow identifies all associated artifacts — agent definition, slash command, tools, skills, and eval suite — and removes them from the specified scope (Local, Global, or Both) after user confirmation.
</purpose>

<questioning_format>
**ALL questions to the user MUST use the `question()` selector format.**

UX Rules:
- ONLY output the `question([{...}])` block when asking a question. DO NOT prepend conversational text.
- Ensure the JSON inside `question()` is STRICTLY valid.
- Users navigate options with arrow keys and confirm with Return.
- Ask ONE question at a time.
- Options should be OPINIONATED.
- The LAST option is ALWAYS a freeform escape hatch.
</questioning_format>

<process>

## Step 1: Identify Agent and Scope

If `$ARGUMENTS` is empty, ask for the agent name.

```json
question([{
  "header": "Deletion",
  "question": "Which agent do you want to delete?",
  "type": "text",
  "placeholder": "e.g., my-agent"
}])
```

Then, ask for the deletion scope:

```json
question([{
  "header": "Scope",
  "question": "Where should the agent be deleted from?",
  "options": [
    { "label": "Project-local (Recommended)", "description": "Remove from .opencode/ in this project." },
    { "label": "Global", "description": "Remove from ~/.config/opencode/." },
    { "label": "Both", "description": "Remove from both project-local and global locations." },
    { "label": "Cancel", "description": "Aborted — do not delete anything." }
  ]
}])
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

```json
question([{
  "header": "Confirm Deletion",
  "question": "Are you sure you want to delete these files? This cannot be undone.",
  "options": [
    { "label": "Yes, delete everything (Recommended)", "description": "Permanently remove all identified artifacts" },
    { "label": "No, cancel", "description": "Abort the deletion process" }
  ]
}])
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
