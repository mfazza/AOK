import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Normalize and deduplicate a list of citation URLs and produce numbered footnotes.",
  args: {
    urls: { type: "array", items: { type: "string" }, description: "Array of URLs" },
  },
  async execute(args) {
    const { urls } = args
    const seen = new Map()
    const out = []
    let i = 1
    for (const u of urls) {
      if (!u) continue
      const key = u.split('#')[0]
      if (!seen.has(key)) {
        seen.set(key, i)
        out.push({ id: i, url: u })
        i++
      }
    }
    return { citations: out }
  },
})
