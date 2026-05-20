import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Score candidate companies and return the top N tickers. Uses simple heuristics over scraped snippets.",
  args: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ticker: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          snippet: { type: "string" },
          urls: { type: "array", items: { type: "string" } },
        },
      },
      description: "Array of {ticker?, name?, url, snippet}",
    },
    top_n: { type: "number", default: 5 },
  },
  async execute(args) {
    const { candidates, top_n = 5 } = args
    // Simple scoring: presence of "earnings", "revenue", "market cap" and multiple distinct sources.
    const scored = candidates.map(c => {
      const text = (c.snippet || '').toLowerCase()
      let score = 0
      if (text.includes('market cap')) score += 2
      if (text.includes('revenue')) score += 2
      if (text.includes('earnings') || text.includes('eps')) score += 1
      if (text.includes('dividend')) score += 1
      const sourceCount = (c.urls || []).length || (c.url ? 1 : 0)
      score += Math.min(3, sourceCount)
      return { candidate: c, score }
    })
    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, top_n).map(s => s.candidate)
    return { top }
  },
})
