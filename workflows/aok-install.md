---
description: Install AOK commands, agents, skills, and references — asks local vs global
agent: build
---

<purpose>
Install the AOK framework into the user's opencode setup. Always asks whether to install locally (project) or globally before proceeding.
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
  "multiple": false,
  "options": [
    { "label": "Subagent (Recommended)", "description": "Invoked by other agents or via @mention — focused, scoped task" },
    { "label": "Primary agent", "description": "Main assistant you interact with directly — replaces Build/Plan" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```
</questioning_format>

<process>

## Step 1: Ask Installation Mode

**MANDATORY: Always ask this question first. Do NOT assume local or global.**

```json
question([{
  "header": "Installation",
  "question": "Where should AOK be installed?",
  "options": [
    { "label": "Project-local (Recommended)", "description": "Installs to .opencode/ in the current project. Commands available only in this repo." },
    { "label": "Global", "description": "Installs to ~/.config/opencode/. Commands available in all projects." },
    { "label": "Both", "description": "Install globally AND to the current project (project copy takes precedence)." },
    { "label": "Something else (I'll explain)", "description": "Custom installation target" }
  ]
}])
```

**STOP.** Wait for user selection before continuing.

## Step 2: Determine Target Path

Based on selection:

- **Project-local**: Find project root via `git rev-parse --show-toplevel` or use current directory. Target = `{root}/.opencode/`
- **Global**: Target = `~/.config/opencode/`
- **Both**: Run installation twice — first global, then project-local

If project-local and a `.opencode/` directory already exists with AOK commands:
```json
question([{
  "header": "Existing Installation",
  "question": "AOK is already installed here. What should I do?",
  "options": [
    { "label": "Overwrite (Recommended)", "description": "Replace all AOK files with the latest version" },
    { "label": "Skip existing", "description": "Only install files that don't already exist" },
    { "label": "Cancel", "description": "Don't install anything" }
  ]
}])
```


## Step 3: Run Installation

Execute the following steps:

```bash
# Set TARGET based on user selection
TARGET="{selected path}"

# Create directory structure
mkdir -p "$TARGET/commands"
mkdir -p "$TARGET/agents"
mkdir -p "$TARGET/skills/aok/references"
mkdir -p "$TARGET/skills/aok/templates"
```

### 3a: Install Commands (workflows → slash commands)
Copy all workflow files from the AOK source to `$TARGET/commands/`:
- `aok-new.md`
- `aok-eval.md`
- `aok-eval-compare.md`
- `aok-audit.md`
- `aok-iterate.md`
- `aok-tools.md`
- `aok-skill.md`
- `aok-help.md`
- `aok-install.md` (this file)

### 3b: Install Agents
Copy agent definitions to `$TARGET/agents/`:
- `aok-agent-designer.md`
- `aok-eval-runner.md`
- `aok-iterator.md`

### 3c: Install Skill + References
Copy skill and reference docs:
- `skills/aok/SKILL.md` → `$TARGET/skills/aok/SKILL.md`
- `references/*.md` → `$TARGET/skills/aok/references/`

### 3d: Install Templates
Copy templates for agent generation:
- `templates/*` → `$TARGET/skills/aok/templates/`

### 3e: Ensure Plugin Dependency
If `$TARGET/package.json` doesn't exist, create it:
```json
{
  "dependencies": {
    "@opencode-ai/plugin": "latest"
  }
}
```

Then install:
```bash
cd "$TARGET" && (bun install --silent 2>/dev/null || npm install --quiet 2>/dev/null || true)
```

## Step 4: Verify Installation

Confirm the installation by checking key files exist:
```bash
ls "$TARGET/commands/aok-new.md" && echo "✓ Commands installed"
ls "$TARGET/agents/aok-eval-runner.md" && echo "✓ Agents installed"
ls "$TARGET/skills/aok/SKILL.md" && echo "✓ Skill installed"
```

## Step 5: Report Success

```json
question([{
  "header": "Installation Complete",
  "question": "AOK has been installed to {target path}. How would you like the final report delivered?",
  "multiple": false,
  "options": [
    { "label": "Show summary here (Recommended)", "description": "Print the installation summary and next steps in this chat." },
    { "label": "Write summary to file", "description": "Create a local summary file in the install directory." },
    { "label": "Both", "description": "Print the summary here and write the summary file." },
    { "label": "Nothing else — I'm done", "description": "No summary needed." },
    { "label": "Something else (I'll explain)", "description": "I'll provide details on the format/location." }
  ]
}])
```

Based on selection, output the following summary (and/or write it to `$TARGET/aok-install-summary.md`):

```
## ✅ AOK Installed

**Location:** {target path}
**Mode:** {Local | Global | Both}

### Commands Available

| Command | Purpose |
|---------|---------|
| `/aok-new` | Create a new agent (routes to tool/skill if appropriate) |
| `/aok-eval` | Run eval suite (works on any agent) |
| `/aok-eval-compare` | Compare agent across models |
| `/aok-audit` | Audit for waste, injection, determinism gaps |
| `/aok-iterate` | Improve from eval failures |
| `/aok-tools` | Add deterministic tools |
| `/aok-skill` | Create procedural knowledge |
| `/aok-help` | Show command reference |

**Get started:** `/aok-new` to create your first agent, or `/aok-audit` to audit an existing one.
```


</process>
