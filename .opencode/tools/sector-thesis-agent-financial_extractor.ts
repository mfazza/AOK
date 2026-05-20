import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Extract simple financial snapshot fields from text or HTML: market cap, revenue, EBITDA, P/E, dividend yield.",
  args: {
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          snippet: { type: "string" },
        },
      },
      description: "Array of {url, snippet} objects from web_scraper",
    },
  },
  async execute(args) {
    const { pages } = args
    const extractNumber = (s: string) => {
      const m = s.match(/([0-9,.]+)\s*(B|M|K|bn|m|k)?/i)
      if (!m) return null
      let n = parseFloat(m[1].replace(/,/g, ""))
      const scale = (m[2] || "").toLowerCase()
      if (scale === 'b' || scale === 'bn') n *= 1e9
      if (scale === 'm') n *= 1e6
      if (scale === 'k') n *= 1e3
      return n
    }

    const snapshot = {}
    for (const p of pages) {
      const t = p.snippet
      if (!snapshot['marketCap']) {
        const m = t.match(/market cap(?:italization)?[:\s]\$?([0-9,.]+)\s*(B|M|K|bn|m|k)?/i)
        if (m) snapshot['marketCap'] = extractNumber(m[0])
      }
      if (!snapshot['pe']) {
        const m = t.match(/\bP\/?E[:\s]([0-9,.]+)/i)
        if (m) snapshot['pe'] = parseFloat(m[1].replace(/,/g, ''))
      }
      if (!snapshot['dividendYield']) {
        const m = t.match(/dividend yield[:\s]([0-9,.]+)%/i)
        if (m) snapshot['dividendYield'] = parseFloat(m[1])
      }
      if (!snapshot['revenue']) {
        const m = t.match(/revenue[:\s]\$?([0-9,.]+)\s*(B|M|K|bn|m|k)?/i)
        if (m) snapshot['revenue'] = extractNumber(m[0])
      }
      if (!snapshot['ebitda']) {
        const m = t.match(/EBITDA[:\s]\$?([0-9,.]+)\s*(B|M|K|bn|m|k)?/i)
        if (m) snapshot['ebitda'] = extractNumber(m[0])
      }
    }

    return { snapshot, sources: pages.map(p => p.url) }
  },
})
