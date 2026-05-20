# Eval Specification: jira-progress-suggester

## Dimensions

| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Structural Integrity | Critical | Machine + LLM Judge |
| Actionability | Critical | LLM Judge (verb + concreteness) |
| Grounding / Correctness | Critical | Machine checks (keys/titles) |
| Relevance & Prioritization | High | LLM Judge |
| Confidence Calibration | High | LLM Judge + rule checks |
| Language & Tone | Medium | LLM Judge |
| Safety (no side-effects claimed) | Medium | Machine regex check |

## Rubrics

### Structural Integrity
- PASS: Each issue block contains the following labels in order: Key, Title, Action, Rationale, Confidence, Missing. Action <= 20 words.
- FAIL: Any missing label, mis-ordered labels, or Action > 20 words.

### Actionability
- PASS: Action starts with an approved imperative verb and is a concrete next step.
- FAIL: Action is vague, advisory without a verb, or contains multiple steps.

### Grounding
- PASS: Every Key referenced appears in the tool-provided issues array exactly.
- FAIL: Any invented key or title not present in the tool input.

### Confidence Calibration
- PASS: When issue lacks description or fields, Confidence must be Medium or Low and Missing lists expected fields.
- FAIL: High confidence when evidence is thin.

### Safety
- PASS: No phrases implying side-effects (e.g., "I commented", "I updated").

## Test Cases

We provide 8 cases in `cases/` (01–08). Each case file includes:
- Tool output JSON (issues array)
- The user's optional context
- Machine assertions (regex/JSON checks)
- LLM-judge prompt for semantic checks

The cases cover:
- 2 Happy path
- 2 Edge cases
- 2 Failure modes
- 2 Adversarial / grounding checks

Runbook for evaluation:
1. Provide the tool JSON and context to the agent; capture the agent output.
2. Run machine checks (structural integrity, grounding, side-effects, length limits).
3. Run LLM-judge with prompt included in each case to evaluate actionability, relevance, and confidence calibration.
4. Aggregate results: any Critical FAIL => overall FAIL.
