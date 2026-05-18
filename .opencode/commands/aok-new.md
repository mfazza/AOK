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

## Step 1: Choose Creation Mode

If `$ARGUMENTS` is empty, you MUST IMMEDIATELY invoke the `ask_user` tool (using your native tool-calling capabilities, NOT by outputting a markdown block) to present the choice.
**CRITICAL:** Call the tool silently. Do not output conversational text.

Use these parameters for the tool:
- `header`: "Agent Design"
- `type`: "choice"
- `question`: "Tell me about the agent you want to build. What is its name, its primary goal, and how should it achieve it?"
- `placeholder`: "e.g. I want a PR reviewer named 'code-guard'..."
- `options`: 
  - `label`: "Help me figure it out"
  - `description`: "Ask me guiding questions to design the agent."

Wait for the user's response.

### If the user selects "Help me figure it out":
Invoke the `ask_user` tool sequentially to ask 3 guiding questions ONE AT A TIME.
1. Use `type: "choice"`:
   - `header`: "Goal"
   - `question`: "What is the primary goal or purpose of this agent?"
   - `options`:
     - `label`: "Operator", `description`: "Performs tasks and interacts with external systems via CLI/tools"
     - `label`: "Code Reviewer", `description`: "Analyzes code for bugs, security, quality"
     - `label`: "Task Automator", `description`: "Executes repeatable workflows (deploy, release, test)"
     - `label`: "Knowledge Assistant", `description`: "Answers questions using domain expertise"
     - `label`: "Orchestrator", `description`: "Coordinates multiple agents/steps in a pipeline"
2. Use `type: "text"`:
   - `header`: "I/O"
   - `question`: "What kind of inputs will it receive, and what should the final output look like?"
3. Use `type: "text"`:
   - `header`: "Constraints"
   - `question`: "Are there any specific rules, constraints, or tools it must use?"

Combine the answers into a single narrative and use it as the user's description for Step 2.

### If the user provides text (via the built-in 'Other' option):
Use their text directly as the narrative description for Step 2.

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
**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Handle"
- `question`: "I suggest the handle `{recommended_slug}`. Look right?"
- `options`:
  - `label`: "Yes (Recommended)", `description`: "Use {recommended_slug}"
  - `label`: "No, let me type one", `description`: "I will provide a custom handle"


**Question 2: Operating Mode**
**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Mode"
- `question`: "Based on your description, this sounds like a {recommended_mode}. Confirm?"
- `options`:
  - `label`: "{recommended_mode} (Recommended)", `description`: "Matches your narrative description"
  - `label`: "{the_other_valid_mode_primary_or_subagent}", `description`: "Switch to the alternative mode"

*(Note: Valid modes are ONLY `"primary"` or `"subagent"`).*

**Question 3: Permissions**
**ACTION REQUIRED:** Invoke the `ask_user` tool with these parameters:
- `type`: "choice"
- `header`: "Permissions"
- `question`: "I recommend Edit: {recommended_edit} and Bash: {recommended_bash}. Confirm?"
- `options`:
  - `label`: "Yes (Recommended)", `description`: "Use recommended permissions"
  - `label`: "Read-only", `description`: "Edit: deny, Bash: deny"
  - `label`: "Full access", `description`: "Edit: allow, Bash: allow"
  - `label`: "Something else", `description`: "Custom configuration"


## Step 4: Scaffold the Monolith

Create the monolithic agent file at `.opencode/agents/{slug}.md`.
Combine the confirmed metadata (YAML) with the `monolithic_prompt` generated by the architect.
**CRITICAL:** The `mode:` in the YAML frontmatter MUST be exactly `"primary"` or `"subagent"`. Do not use any other words like "assistant".
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

**ACTION REQUIRED:** Invoke the `ask_user` tool with type "choice" to ask the user this question.

**Handling Loop Actions:**
- **Extract Tool:** Generate the `.ts` tool file. CRITICALLY: Edit the `.md` agent prompt to delete the heavy instructions and replace them with "Call the {tool_name} tool". Re-run evals. Loop.
- **Extract Skill:** Generate the `SKILL.md` file. CRITICALLY: Edit the `.md` agent prompt to delete the heavy instructions. Re-run evals. Loop.
- **Commit Changes:** Run `git status`, `git add .opencode/agents/{slug}.md` (and related files), and `git commit -m "refactor({slug}): {description of extraction}"`. Loop.
- **Finish:** Exit the loop and report success.

</process>

<guardrails>
- **FATAL ERROR:** You MUST use the native `ask_user` tool for questions. DO NOT output `question([{...}])` markdown blocks.
- **FATAL ERROR:** Outputting a numbered list of questions is strictly forbidden.
- ALWAYS ask ONE question at a time. Wait for the user to answer before asking the next one.
- Call the `ask_user` tool silently. Do not print conversational filler.
</guardrails>
