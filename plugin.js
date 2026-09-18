import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"

const providerID = "omniroute"
const baseURL = "https://9router.piyushmehta.com"
const configPath = `${homedir()}/.config/opencode/opencode.json`

export default {
  id: "omniroute-v2",
  async setup() {
    const key = JSON.parse(readFileSync(`${homedir()}/.local/share/opencode/auth.json`, "utf8"))[providerID]?.key
    if (!key) throw new Error("OmniRoute credential missing; run `opencode auth login`")

    const response = await fetch(`${baseURL}/v1/models`, { headers: { authorization: `Bearer ${key}` } })
    if (!response.ok) throw new Error(`OmniRoute model discovery failed: HTTP ${response.status}`)
    const { data = [] } = await response.json()
    const models = Object.fromEntries(data.filter((item) => typeof item?.id === "string").map((item) => [item.id, { name: item.name ?? item.id }]))

    const config = JSON.parse(readFileSync(configPath, "utf8"))
    config.providers ??= {}
    config.providers[providerID] ??= {
      name: "OmniRoute",
      package: "@opencode/ai/providers/openai-compatible",
      settings: { baseURL: `${baseURL}/v1` },
      models: {},
    }
    const current = config.providers[providerID].models ?? {}
    if (JSON.stringify(current) === JSON.stringify(models)) return
    config.providers[providerID].models = models
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  },
}
