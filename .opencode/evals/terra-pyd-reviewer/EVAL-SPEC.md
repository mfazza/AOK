# EVAL-SPEC: TerraPyd-Reviewer

## Selected Eval Dimensions
- Task Completion: Critical — does the agent identify relevant issues in provided diffs and produce structured findings.
- Format Compliance: High — outputs must follow the JSON schema exactly.
- Correctness: Critical — findings must be supported by evidence; false positives minimized.
- Tool Integration: High — the parser tool must be called and used correctly when diffs/files are provided.
- Robustness: Medium — handle empty diffs, binary files, and secrets safely.

## Measurement Approach
- Task Completion: Code checks against expected findings in cases (automated assertions)
- Format Compliance: Static schema validation (JSON schema)
- Correctness: LLM judge + deterministic checks where possible; human review for edge cases
- Tool Integration: Verify tool output was referenced in the agent's reasoning trace (unit testable via logs)

## Passing Criteria
- All Critical dimensions must PASS for the eval to be considered successful.
- At least 80% of High tests must PASS.
