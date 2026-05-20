---
description: Create a new AI agent using Progressive Enhancement (Narrative → Monolith → Eval → Extract)
agent: build
---

<purpose>
Create a new AI agent using the "Progressive Enhancement" paradigm. 

Instead of guessing tools and skills upfront, the workflow is:
1. Narrative Brain-Dump (User describes what/how)
2. Synthesize Monolithic Baseline (Architect subagent drafts a single heavy prompt)
3. Confirm Metadata (Interactive questions for YAML frontmatter based on recommendations)
4. Baseline Eval (Generate evals and run them against the monolith)
5. Architectural Analysis (Architect subagent recommends extractions based on failures)
6. Iteration Loop (User chooses to extract tools/skills, run evals, and commit changes)
</purpose>

<orchestration_rules>
- **CRITICAL:** You (the main agent) MUST conduct the interactive phases YOURSELF. 
- You will use the `@aok-architect` subagent purely for synthesis and analysis, passing it data and receiving its JSON/Markdown output. Do NOT let it talk to the user.
</orchestration_rules>

<user_interaction_rules>
**STANDARD: All agents and workflows in this repository MUST use the native Opencode `questions` tool for user interaction.**

### Mandatory Syntax
To interact with the user, you MUST print a markdown block containing the `question([...])` function call. Any other format (plain text lists, `ask_user` tool calls, etc.) is strictly forbidden as it will not be parsed by the Opencode UI.

### Execution Rules
1. **ONE at a time:** Never ask more than one question in a single turn.
2. **STOP and WAIT:** Immediately after outputting a `question([...])` block, you MUST stop and wait for the user's response. Do NOT proceed with any other logic or tool calls in the same turn.
3. **No Conversational Filler:** Do not introduce the question with preambles like "I need to ask you a question." Just output the block.
</user_interaction_rules>

<process>

## Step 1: Initialize Creation Workflow

**Trigger:** This workflow begins immediately upon invocation. 

Check the provided arguments (represented by `$ARGUMENTS`). 
- If `$ARGUMENTS` is empty, is the literal string `"$ARGUMENTS"`, or only contains whitespace: **Proceed to Step 1a.**
- If `$ARGUMENTS` contains a description of an agent: **Skip to Step 2.**

### Step 1a: Choose Creation Mode (Interactive)

Output the following `question([...])` markdown block. Do not add any conversational text before or after.

```json
question([
  {
    "type": "choice",
    "header": "Agent Design",
    "question": "Tell me about the agent you want to build. The name, its primary goal, how it achieves it, and any specific tools or persona it should have.",
    "options": [
      { "label": "I'm ready to describe it", "description": "Type your agent description into the 'Other' field." },
      { "label": "Help me figure it out", "description": "Ask me guiding questions to design the agent." }
    ]
  }
])
```

**STOP and WAIT for the user.**

### Step 1b: Guided Interview (If "Help me figure it out" selected)

If the user wants help, ask these 4 questions ONE AT A TIME using the `question([...])` syntax. Wait for a response after each.

1. **Goal:** (Type: `choice`) "What is the primary goal?" 
   Options: Operator, Code Reviewer, Task Automator, Knowledge Assistant, Orchestrator.
2. **Sample Prompt:** (Type: `text`) "Provide a sample prompt or request you might give to this agent."
3. **Output:** (Type: `text`) "What should the final output look like? (e.g. JSON, report, commit message)"
4. **Constraints:** (Type: `text`) "Are there any specific rules or tools it must use?"

Combine the answers into a single narrative for Step 2.

## Step 2: Synthesis (Internal)

**REQUIRED READING:** Before invoking the architect, locate and read these reference files to understand AOK standards:
1. `references/eval-taxonomy.md`
2. `references/agent-design-patterns.md`
3. `references/tool-cookbook.md`
*(Check `.opencode/skills/aok/references/` or `~/.config/opencode/skills/aok/references/` if not in root)*

Invoke the `@aok-architect` subagent. 
Pass it the user's description (from Step 1) and instruct it to use `<mode_1_synthesis>`.

Wait for it to return the JSON block containing:
- `recommended_slug`
- `recommended_mode`
- `recommended_permissions`
- `monolithic_prompt`

## Step 3: Confirm Metadata (Interactive)

Use the architect's recommendations to ask these questions **ONE AT A TIME**. Wait for a response after each.

**Question 1: Agent Handle**
```json
question([
  {
    "type": "choice",
    "header": "Handle",
    "question": "Choose a handle for the agent.",
    "options": [
      { "label": "{recommended_slug} (Recommended)", "description": "Accept the suggested handle" }
    ]
  }
])
```

**Question 2: Operating Mode**
```json
question([
  {
    "type": "choice",
    "header": "Mode",
    "question": "This agent should be a {recommended_mode}. Confirm?",
    "options": [
      { "label": "{recommended_mode} (Recommended)", "description": "Matches your description" },
      { "label": "{other_mode}", "description": "Switch to {other_mode}" }
    ]
  }
])
```

**Question 3: Permissions**
```json
question([
  {
    "type": "choice",
    "header": "Permissions",
    "question": "I recommend Edit: {recommended_edit} and Bash: {recommended_bash}. Confirm?",
    "options": [
      { "label": "Yes (Recommended)", "description": "Use recommended permissions" },
      { "label": "Read-only", "description": "Edit: deny, Bash: deny" },
      { "label": "Execute (No Edit)", "description": "Edit: deny, Bash: allow" },
      { "label": "Full access", "description": "Edit: allow, Bash: allow" }
    ]
  }
])
```

## Step 4: Scaffold the Monolith

Create the monolithic agent file at `.opencode/agents/{slug}.md`.
Combine the confirmed metadata (YAML) with the `monolithic_prompt`.
**CRITICAL:** `mode` must be exactly `"primary"` or `"subagent"`.

## Step 5: Generate Eval Suite & Baseline Run

1. Generate `EVAL-SPEC.md` and at least 8 test cases in `.opencode/evals/{slug}/cases/`.
2. Run the baseline end-to-end eval suite. (Simulate the run based on the cases and the prompt).

## Step 6: Architectural Analysis

Invoke `@aok-architect` again.
Pass it the prompt, cases, and results. Instruct it to use `<mode_2_extraction>`.
Wait for its `Recommended Extractions` report.

## Step 7: The Iteration Loop

Present the report, then ask:
```json
question([
  {
    "type": "choice",
    "header": "Iteration",
    "question": "What would you like to do next?",
    "options": [
      { "label": "Extract Tool", "description": "Move logic to a separate tool" },
      { "label": "Extract Skill", "description": "Move knowledge to a separate skill" },
      { "label": "Commit Changes", "description": "Commit current state to git" },
      { "label": "Finish", "description": "Exit the loop" }
    ]
  }
])
```

**Handle Actions:**
- **Extract Tool/Skill:** Create the file, update the agent prompt, re-run evals, loop.
- **Commit:** Git add and commit changes. Loop.
- **Finish:** Exit.

</process>

<guardrails>
- ALWAYS ask ONE question at a time and STOP.
- Output `question([...])` blocks exactly as shown.
- No conversational filler or preambles.
</guardrails>

