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

<required_reading>
Locate and read the AOK reference files before proceeding. Check the following locations (in order):
1. `.opencode/skills/aok/references/` (Project-local install)
2. `~/.config/opencode/skills/aok/references/` (Global install)
3. `./references/` (AOK Dev mode)

Required files for this workflow:
- `eval-taxonomy.md` — Catalog of eval types (select relevant ones per agent)
- `agent-design-patterns.md` — Architecture patterns
- `tool-cookbook.md` — Tool templates
</required_reading>

<orchestration_rules>
- **CRITICAL:** You (the main agent) MUST conduct the interactive phases YOURSELF. 
- You will use the `@aok-architect` subagent purely for synthesis and analysis, passing it data and receiving its JSON/Markdown output. Do NOT let it talk to the user.
</orchestration_rules>

<questioning_format>
**CRITICAL: ALL questions to the user MUST use the exact `question()` selector format provided in the steps.**
**NEVER output a numbered list of questions as plain text.**

UX Rules:
- ONLY output the `question([{...}])` block when asking a question. DO NOT prepend conversational text.
- Ensure the JSON inside `question()` is STRICTLY valid. **CRITICAL:** The `options` property MUST be a valid JSON array enclosed in `[` and `]`. Do not drop the array brackets!
- Users navigate options with **arrow keys** (↑↓) and confirm with **Return**. If `multiSelect` is true, they select/deselect with **Space** and confirm with **Return**.
- Ask **ONE question at a time** — fully resolve each before moving to the next
- Options should be OPINIONATED — put the recommended choice first with "(Recommended)"
- The LAST option is ALWAYS a freeform escape hatch: "Something else (I'll describe)"
- Each option has a `label` and a `description` explaining the tradeoff
- NEVER ask open-ended questions as plain text — always provide curated options
</questioning_format>

<process>

## Step 1: The Narrative Brain-Dump

If `$ARGUMENTS` is empty, you MUST IMMEDIATELY invoke the `ask_user` tool (using your native tool-calling capabilities, NOT by outputting a markdown block) to capture the agent's description in a text box.
**CRITICAL:** DO NOT output any conversational text, preambles, or instructions like "Please paste the agent narrative now." Call the tool silently.

Use these parameters for the tool:
- `header`: "Agent Design"
- `type`: "text"
- `question`: "Tell me about the agent you want to build. What is its name, its primary goal, and how should it achieve it?"

Wait for the user's description.

## Step 2: Synthesis (Internal)

Invoke the `@aok-architect` subagent. 
Pass it the user's description and instruct it to use `<mode_1_synthesis>`.

Wait for it to return the JSON block containing:
- `recommended_slug`
- `recommended_mode`
- `recommended_permissions`
- `monolithic_prompt`

## Step 3: Confirm Metadata (Interactive)

Use the architect's recommendations to populate the first options in these questions. Ask them **ONE AT A TIME**.

**Question 1: Agent Handle**
```json
question([{
  "header": "Handle",
  "question": "I suggest the handle `{recommended_slug}`. Look right?",
  "multiple": false,
  "options": [
    { "label": "Yes (Recommended)", "description": "Use {recommended_slug}" },
    { "label": "No, let me type one", "description": "I will provide a custom handle" }
  ]
}])
```

**Question 2: Operating Mode**
```json
question([{
  "header": "Mode",
  "question": "Based on your description, this sounds like a {recommended_mode}. Confirm?",
  "multiple": false,
  "options": [
    { "label": "{recommended_mode} (Recommended)", "description": "Matches your narrative description" },
    { "label": "{the_other_mode}", "description": "Switch to the alternative mode" },
    { "label": "Something else (I'll describe)", "description": "Tell me what you have in mind" }
  ]
}])
```

**Question 3: Permissions**
```json
question([{
  "header": "Permissions",
  "question": "I recommend Edit: {recommended_edit} and Bash: {recommended_bash}. Confirm?",
  "multiple": false,
  "options": [
    { "label": "Yes (Recommended)", "description": "Use recommended permissions" },
    { "label": "Read-only", "description": "Edit: deny, Bash: deny" },
    { "label": "Full access", "description": "Edit: allow, Bash: allow" },
    { "label": "Something else", "description": "Custom configuration" }
  ]
}])
```

## Step 4: Scaffold the Monolith

Create the monolithic agent file at `.opencode/agents/{slug}.md`.
Combine the confirmed metadata (YAML) with the `monolithic_prompt` generated by the architect.
Do NOT create any tools or skills yet.

## Step 5: Generate Eval Suite & Baseline Run

1. Consult `eval-taxonomy.md` to select dimensions based on the monolithic prompt.
2. Generate `EVAL-SPEC.md` and at least 8 test cases in `.opencode/evals/{slug}/cases/`.
3. Run the baseline end-to-end eval suite. (Simulate the run based on the cases and the prompt).

## Step 6: Architectural Analysis (The "Aha" Moment)

Invoke the `@aok-architect` subagent again.
Pass it the `monolithic_prompt`, the `eval_cases`, and the `eval_results` (which cases passed/failed). Instruct it to use `<mode_2_extraction>`.

Wait for it to return the Markdown report with `Recommended Extractions`.

## Step 7: The Iteration Loop

Present the architect's report to the user, followed immediately by an interactive menu:

```json
question([{
  "header": "Next Action",
  "question": "What should we do next to improve the {slug} agent?",
  "multiple": false,
  "options": [
    // Dynamically insert the Architect's top recommendation here
    { "label": "Extract Tool: {tool_name} (Recommended)", "description": "Replaces prompt steps with deterministic code." },
    { "label": "Extract Skill: {skill_name}", "description": "Moves procedural knowledge out of the main prompt." },
    { "label": "Refine Prompt", "description": "Adjust the instructions based on eval failures." },
    { "label": "Generate More Evals", "description": "Increase test coverage." },
    { "label": "Commit Changes", "description": "Create a git commit of the current passing state." },
    { "label": "Finish", "description": "The agent is ready." }
  ]
}])
```

**Handling Loop Actions:**
- **Extract Tool:** Generate the `.ts` tool file. CRITICALLY: Edit the `.md` agent prompt to delete the heavy instructions and replace them with "Call the {tool_name} tool". Re-run evals. Loop.
- **Extract Skill:** Generate the `SKILL.md` file. CRITICALLY: Edit the `.md` agent prompt to delete the heavy instructions. Re-run evals. Loop.
- **Commit Changes:** Run `git status`, `git add .opencode/agents/{slug}.md` (and related files), and `git commit -m "refactor({slug}): {description of extraction}"`. Loop.
- **Finish:** Exit the loop and report success.

</process>

<guardrails>
- **FATAL ERROR:** The `options` property in the `question([{...}])` JSON MUST be a valid JSON array wrapped in `[` and `]`. Never output options as a raw comma-separated list of objects.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden. You must ALWAYS use the `question([{...}])` JSON format for ANY user interaction.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- ALWAYS use `question()` format for user interaction - never plain-text questions.
- **FATAL ERROR:** Do NOT delegate the interactive questioning to the architect subagent. You are the orchestrator.
</guardrails>
