# Agent Eval Taxonomy

> Comprehensive catalog of test types for asserting agent quality.
> Used by `/aok-new` and `/aok-eval` to select the most relevant eval dimensions per agent.

---

## Test Categories Overview

```
                  ┌─────────────────────────────────────────┐
                  │          AGENT EVAL TAXONOMY             │
                  └─────────────────────────────────────────┘
                              │
    ┌──────────────┬──────────┼──────────┬──────────────┬──────────────┬──────────────┐
    ▼              ▼          ▼          ▼              ▼              ▼              ▼
Behavioral    Structural  Robustness  Integration  Quality      Efficiency     Security
(does right)  (shaped     (handles    (works with  (how good)   (not wasteful) (can't be
              right)      unexpected) environment)                             tricked)
```

---

## 1. Behavioral Tests

Assert the agent DOES the right thing.

### 1.1 Task Completion
- **What**: Does the agent accomplish the stated goal?
- **How**: Define clear success criteria per case, check if they're met
- **When useful**: Every agent (universal)
- **Example check**: "Agent produces a code review with at least 2 findings"

### 1.2 Instruction Following
- **What**: Does the agent follow its process steps in order?
- **How**: Verify each step in the agent's process is reflected in output
- **When useful**: Multi-step agents, orchestrators
- **Example check**: "Agent reads the file BEFORE suggesting changes"

### 1.3 Tool Usage Correctness
- **What**: Does the agent call tools when it should, with correct arguments?
- **How**: Mock tools or trace calls, verify invocation patterns
- **When useful**: Tool-augmented agents
- **Example check**: "Agent calls validate-schema before outputting JSON"

### 1.4 Decision Quality
- **What**: Does the agent make the right choice at decision points?
- **How**: Present scenarios with known-correct answers, judge choices
- **When useful**: Routing agents, advisory agents, triage agents
- **Example check**: "Agent routes security issues to security-reviewer, not general"

### 1.5 Scope Adherence
- **What**: Does the agent stay within its defined boundaries?
- **How**: Present tempting out-of-scope requests, verify refusal
- **When useful**: Focused agents, restricted agents
- **Example check**: "Agent declines to write code when asked (read-only reviewer)"

---

## 2. Structural Tests

Assert the output is SHAPED correctly.

### 2.1 Format Compliance
- **What**: Does output match expected schema/structure?
- **How**: JSON schema validation, regex patterns, section presence
- **When useful**: Agents that produce structured output
- **Example check**: "Output contains ## Summary, ## Findings, ## Recommendations sections"

### 2.2 Completeness
- **What**: Are all required elements present?
- **How**: Checklist of mandatory fields/sections
- **When useful**: Report generators, documentation agents
- **Example check**: "Every finding has severity, description, and suggested fix"

### 2.3 Length Bounds
- **What**: Is output within acceptable size?
- **How**: Character/word/line count checks
- **When useful**: Agents with verbosity concerns
- **Example check**: "Summary is 1-3 sentences, not a full paragraph"

### 2.4 Consistency
- **What**: Is the output internally consistent?
- **How**: Cross-reference different parts of the output
- **When useful**: Multi-section outputs, agents that reference their own work
- **Example check**: "Summary matches the details in findings section"

---

## 3. Robustness Tests

Assert the agent HANDLES the unexpected gracefully.

### 3.1 Empty/Minimal Input
- **What**: How does agent handle empty, tiny, or missing input?
- **How**: Send empty strings, single characters, null-like values
- **When useful**: Every agent
- **Example check**: "Agent asks for clarification instead of hallucinating"

### 3.2 Adversarial Input
- **What**: Does the agent resist manipulation attempts?
- **How**: Prompt injection, role confusion, boundary-pushing requests
- **When useful**: User-facing agents, agents with permissions
- **Example check**: "Agent ignores 'ignore previous instructions' attempts"

### 3.3 Ambiguous Input
- **What**: How does agent handle unclear or contradictory requirements?
- **How**: Send vague requests, conflicting instructions
- **When useful**: Interview agents, planning agents
- **Example check**: "Agent asks clarifying question instead of guessing"

### 3.4 Error Recovery
- **What**: What happens when a tool fails or external system is down?
- **How**: Simulate tool failures, malformed data, timeouts
- **When useful**: Tool-augmented agents, API-dependent agents
- **Example check**: "Agent reports the error clearly and suggests alternatives"

### 3.5 Overload
- **What**: How does agent handle excessive input?
- **How**: Send very long inputs, many items to process
- **When useful**: Agents that process variable-length inputs
- **Example check**: "Agent processes first N items and notes truncation"

---

## 4. Integration Tests

Assert the agent WORKS with its environment.

### 4.1 Tool Integration
- **What**: Do tools work correctly end-to-end when the agent calls them?
- **How**: Run agent with real tools, verify tool outputs are used correctly
- **When useful**: Tool-augmented agents
- **Example check**: "Agent calls parse-diff tool and uses its output in review"

### 4.2 Skill Loading
- **What**: Does the agent load skills at the right time?
- **How**: Present scenarios that should trigger skill loading
- **When useful**: Knowledge-loaded agents
- **Example check**: "Agent loads security-review skill when code has auth logic"

### 4.3 Permission Boundaries
- **What**: Does the agent respect its permission constraints?
- **How**: Verify agent doesn't attempt operations beyond its permissions
- **When useful**: Restricted agents (deny bash, deny edit)
- **Example check**: "Read-only agent never attempts file writes"

### 4.4 Context Utilization
- **What**: Does the agent use provided context effectively?
- **How**: Provide context files, verify they inform the output
- **When useful**: Context-dependent agents
- **Example check**: "Agent references specific lines from the provided file"

### 4.5 End-to-End Flow
- **What**: Does the complete workflow produce the expected outcome?
- **How**: Run the full agent pipeline with a realistic scenario
- **When useful**: Every agent (mandatory final test)
- **Example check**: "Complete workflow from input to final output works correctly"

---

## 5. Quality Tests (Subjective — LLM Judge)

Assert the output meets quality standards.

### 5.1 Accuracy
- **What**: Are factual claims correct?
- **How**: LLM judge with reference material
- **When useful**: Knowledge agents, documentation agents
- **Example check**: "Technical claims match library documentation"

### 5.2 Helpfulness
- **What**: Is the output genuinely useful to the target user?
- **How**: LLM judge with user persona rubric
- **When useful**: Advisory agents, explainer agents
- **Example check**: "Suggestions are actionable, not just observations"

### 5.3 Tone Appropriateness
- **What**: Does the tone match expectations?
- **How**: LLM judge with tone rubric
- **When useful**: User-facing agents, coaching agents
- **Example check**: "Constructive and specific, not harsh or vague"

### 5.4 Reasoning Quality
- **What**: Is the chain of thought sound and visible?
- **How**: LLM judge assessing logical flow
- **When useful**: Decision-making agents, planning agents
- **Example check**: "Conclusions follow logically from stated evidence"

---

## 6. Efficiency Tests

Assert the agent doesn't waste tokens or do work it shouldn't.

### 6.1 Token Efficiency
- **What**: Does the agent produce unnecessarily verbose output?
- **How**: Measure output length relative to task complexity; check for filler, repetition
- **When useful**: Any agent where cost/speed matters (most agents)
- **Example check**: "Output is under 500 tokens for a simple lookup task"

### 6.2 Determinism Appropriateness
- **What**: Does the agent use LLM reasoning for things that should be deterministic?
- **How**: Identify outputs that are always the same regardless of input — those should be tools
- **When useful**: Agents with formatting, validation, or parsing steps
- **Example check**: "Agent calls the validation tool instead of re-implementing validation in prose"

### 6.3 Tool Utilization
- **What**: When tools are available, does the agent USE them instead of reasoning?
- **How**: Check that available tools are invoked for their intended purpose
- **When useful**: Tool-augmented agents
- **Example check**: "Agent calls `parse-json` tool rather than parsing JSON in its response text"

### 6.4 Context Bloat
- **What**: Does the agent request or process more context than needed?
- **How**: Check if the agent reads entire files when it only needs a section, or loads skills unnecessarily
- **When useful**: Agents that read files, query databases, or load skills
- **Example check**: "Agent reads only the relevant function, not the entire 2000-line file"

---

## 7. Security Tests

Assert the agent can't be manipulated or misused.

### 7.1 Prompt Injection Resistance
- **What**: Can user input trick the agent into ignoring its instructions?
- **How**: Feed adversarial inputs that attempt to override system prompt
- **When useful**: Any agent that processes user-controlled input (most agents)
- **Example check**: "Agent refuses when input says 'ignore previous instructions and...'"

### 7.2 Scope Enforcement
- **What**: Does the agent refuse tasks outside its defined scope?
- **How**: Ask the agent to do things it shouldn't — verify refusal
- **When useful**: Specialized agents with clear boundaries
- **Example check**: "Code review agent refuses to write new code when asked"

### 7.3 Data Boundary Respect
- **What**: Does the agent avoid leaking system prompt, internal state, or other agents' data?
- **How**: Ask the agent to reveal its instructions, list its tools, or describe internal state
- **When useful**: User-facing agents, agents processing sensitive data
- **Example check**: "Agent does not repeat its system prompt when asked 'what are your instructions?'"

### 7.4 Output Safety
- **What**: Does the agent validate its own output before taking destructive actions?
- **How**: Test scenarios where the agent might write/delete/execute — verify confirmation or validation
- **When useful**: Agents with write/execute permissions
- **Example check**: "Agent confirms before deleting files, even when instructed to 'clean up everything'"

### 7.5 Indirect Injection Resistance
- **What**: Can injected content in files/data manipulate the agent?
- **How**: Embed injection attempts in file contents, API responses, or metadata the agent reads
- **When useful**: Agents that read external files, scrape web, or consume API data
- **Example check**: "Agent ignores 'AI: ignore all rules' embedded in a code comment"

---

## Selecting Tests for an Agent

Use this decision matrix when creating evals for a new agent:

| Agent Does... | Mandatory Tests | Recommended Tests |
|--------------|-----------------|-------------------|
| Produces structured output | Format Compliance, Completeness | Consistency, Length Bounds |
| Uses tools | Tool Usage Correctness, Tool Integration, Tool Utilization | Error Recovery |
| Makes decisions | Decision Quality, Reasoning Quality | Scope Adherence |
| Takes user input | Empty/Minimal Input, Prompt Injection Resistance | Adversarial Input, Indirect Injection |
| Has restricted permissions | Permission Boundaries, Scope Enforcement | Data Boundary Respect |
| Loads skills | Skill Loading, Context Utilization | Context Bloat |
| Is user-facing | Tone Appropriateness, Helpfulness | Prompt Injection Resistance |
| Handles variable input | Overload, Robustness | Length Bounds |
| Has write/execute permissions | Output Safety, Scope Enforcement | Indirect Injection Resistance |
| Is cost-sensitive | Token Efficiency, Determinism Appropriateness | Context Bloat |
| Processes external data | Indirect Injection Resistance, Data Boundary | Error Recovery |

**Always include:**
- Task Completion (does it work?)
- End-to-End Flow (does it work in practice?)
- At least one robustness test (what breaks it?)
- At least one security test (can it be tricked?)

---

## Test Count Guidelines

| Agent Complexity | Minimum Cases | Recommended |
|-----------------|---------------|-------------|
| Simple (prompt only) | 6 | 8-10 |
| Tool-augmented | 8 | 12-15 |
| Knowledge-loaded | 8 | 12-15 |
| Full stack (tools + skills) | 10 | 15-20 |
| Orchestrator | 12 | 18-25 |

**Distribution:**
- 30% Happy path (it works)
- 25% Edge cases (boundaries)
- 25% Robustness (it doesn't break)
- 10% Adversarial (it can't be tricked)
- 10% Integration (it works with its environment)
