import { tool } from "@opencode-ai/plugin"
import fetch from "node-fetch"

export default tool({
  description: "Search the web for candidate companies, news, and filings for a sector query and return structured snippets and source URLs.",
  args: {
    query: { type: "string", description: "Sector or query text" },
    limit: { type: "number", description: "Max number of pages to fetch", default: 10 },
  },
  async execute(args) {
    const { query, limit = 10 } = args
    // Very small, conservative scraper: search with DuckDuckGo HTML search and fetch top results.
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const resp = await fetch(searchUrl)
    const text = await resp.text()
    // Extract hrefs naively — this is intentionally simple and documented for later improvement.
    const hrefs = Array.from(text.matchAll(/href="(https?:\/\/[^"]+)"/g)).map(m => m[1]).slice(0, limit)
    const pages = []
    for (const url of hrefs) {
      try {
        const r = await fetch(url)
        const body = await r.text()
        pages.push({ url, snippet: body.slice(0, 2000) })
      } catch (e) {
        // ignore individual failures
      }
    }
    return { query, results: pages }
  },
})
