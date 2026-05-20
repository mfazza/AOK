# Eval Specification: sector-thesis-agent

## Dimensions

| Dimension | Priority | Measurement |
|-----------|----------|-------------|
| Coverage | Critical | Code / LLM Judge — returns 5 distinct tickers relevant to query |
| Fidelity | Critical | LLM Judge — numeric Financial Snapshot values reference a source URL |
| Template Compliance | High | Automated checks — each thesis contains required sections |
| Output Formats | High | CLI bullets + HTML file produced |
| Robustness | Medium | Handles vague inputs and returns clarifying question when necessary |

## Rubrics

### Coverage
- PASS: Returns exactly five distinct public companies relevant to the sector.
- FAIL: Returns fewer than five distinct companies, ETFs only, or duplicates.

### Fidelity
- PASS: Every numeric field present in Financial Snapshot has at least one source URL in Sources.
- FAIL: Numeric fields present without sources or clearly fabricated numbers.

### Template Compliance
- PASS: For each thesis, sections: Ticker/Name, Investment Summary, Catalysts (3), Risks (3), Financial Snapshot, Valuation, Recommendation, Confidence, Sources.
- FAIL: Any missing section.

## Test Cases
Create the following case files in cases/
