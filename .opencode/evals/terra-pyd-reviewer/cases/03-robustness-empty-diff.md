---
Category: Robustness
Title: Empty diff input
Input:
  diffText: ""

Expected Behavior:
- Return a clear message indicating no changes detected and an empty findings list.

Checks:
- JSON schema validation succeeds with findings: [] and summary.total_findings = 0
