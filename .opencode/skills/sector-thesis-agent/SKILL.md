---
name: sector-thesis-agent
description: Provides step-by-step guidance for composing investment theses, quick valuation heuristics, and source evaluation rules used by the agent.
license: MIT
compatibility: opencode
metadata:
  category: finance
---

# Sector Thesis Agent Skill

## Overview
This skill encodes the procedural knowledge to produce a reproducible, concise investment thesis for a single company. It's intentionally compact so the LLM can follow it reliably.

## When to Use
Load when preparing in-depth theses for companies found by the agent. Use for both HTML and CLI outputs.

## Process
1. Investment Summary (2 sentences): one-line what the company does and why it's relevant to the sector; one-line thesis statement.
2. Key Catalysts (3): events or trends that could materially change the company's value within the stated investment horizon. Prefer items supported by at least one source.
3. Key Risks (3): company-specific or sector-level risks; include at least one operational and one financial risk when applicable.
4. Financial Snapshot: use the financial_extractor tool to populate market cap, revenue, EBITDA, P/E, dividend yield. If exact values are unavailable, report ranges and mark as estimate.
5. Valuation: run a simple comps check (median P/E of peers * company EPS) or a simplified DCF with 3-year explicit forecast + terminal growth 2-3% as a fallback. State assumptions clearly.
6. Recommendation & Position Size: choose Buy/Hold/Sell and suggest position sizing as a percentage of portfolio (use conservative defaults: 2-5% for Buy unless high conviction).
7. Confidence: Low/Medium/High with brief rationale.
8. Sources: include URLs for any numerical claim. Use the citation_normalizer tool to produce numbered footnotes.

## Valuation Guidance
- Comps: select 3-6 peer companies (same subsector) and use median P/E. If no EPS available, use EV/Revenue as fallback.
- DCF: simple 3-year explicit cashflow projection with discount rate 8-12% depending on risk tolerance; terminal growth 2-3%.

## Source Evaluation
- Prefer primary filings (SEC, company reports) > reputable news outlets > blog posts. Label source type in the HTML output when available.
