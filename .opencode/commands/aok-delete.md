---
description: Delete an AOK agent and all associated artifacts (tools, skills, evals)
agent: build
---

<purpose>
Safely delete an AOK agent. This workflow identifies all associated artifacts — agent definition, slash command, tools, skills, and eval suite — and removes them from the specified scope (Local, Global, or Both) after user confirmation.
</purpose>

<user_interaction_rules>
**CRITICAL: You MUST use your native `ask_user` tool-calling capability for ALL user interactions.**
**NEVER output a markdown block with `question([...])`. NEVER output a numbered list of questions as plain text.**

UX Rules:
- ALWAYS use the native `ask_user` tool. Do NOT print JSON to the screen. Call the tool silently without conversational preambles.
- Ask **ONE question at a time** — fully resolve each before moving to the next.
- For multiple choice, use `type: "choice"`. You MUST provide an `options` array. The LAST option MUST ALWAYS be a freeform escape hatch (e.g. "Something else").
- For freeform text input, use `type: "text"`. You MUST NOT provide an `options` array. Do NOT add escape hatches to text questions.
</user_interaction_rules>

<process>

## Step 1: Identify Agent and Scope

If `$ARGUMENTS` is empty, ask for the agent name.

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Deletion"
- `question`: "Which agent do you want to delete?"
- `options`:


Then, ask for the deletion scope:

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Scope"
- `question`: "Where should the agent be deleted from?"
- `options`:
  - `label`: "Project-local (Recommended)", `description`: "Remove from .opencode/ in this project."
  - `label`: "Global", `description`: "Remove from ~/.config/opencode/."
  - `label`: "Both", `description`: "Remove from both project-local and global locations."
  - `label`: "Cancel", `description`: "Aborted — do not delete anything."


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

**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Confirm Deletion"
- `question`: "Are you sure you want to delete these files? This cannot be undone."
- `options`:
  - `label`: "Yes, delete everything (Recommended)", `description`: "Permanently remove all identified artifacts"
  - `label`: "No, cancel", `description`: "Abort the deletion process"


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
- **FATAL ERROR:** You MUST use the native `ask_user` tool for questions. DO NOT output `question([{...}])` markdown blocks.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- Call the `ask_user` tool silently. Do not print conversational filler.
</guardrails>
