import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"

const providerID = "omniroute"
const configPath = `${homedir()}/.config/opencode/opencode.json`
const authPath = `${homedir()}/.local/share/opencode/auth.json`

export default {
  id: "omniroute-v2",
  async setup() {
    const config = JSON.parse(readFileSync(configPath, "utf8"))
    const provider = config.providers?.[providerID]
    const configuredURL = process.env.OMNIROUTE_BASE_URL ?? provider?.settings?.baseURL
    if (!configuredURL) throw new Error("Set providers.omniroute.settings.baseURL or OMNIROUTE_BASE_URL")

    const key = process.env.OMNIROUTE_API_KEY ?? JSON.parse(readFileSync(authPath, "utf8"))[providerID]?.key
    if (!key) throw new Error("OmniRoute credential missing; run `opencode auth login`")

    const baseURL = configuredURL.replace(/\/+$/, "")
    const modelsURL = /\/v\d+$/.test(baseURL) ? `${baseURL}/models` : `${baseURL}/v1/models`
    const response = await fetch(modelsURL, { headers: { authorization: `Bearer ${key}` } })
    if (!response.ok) throw new Error(`OmniRoute model discovery failed: HTTP ${response.status}`)
    const { data = [] } = await response.json()
    const models = Object.fromEntries(data.filter((item) => typeof item?.id === "string").map((item) => [item.id, { name: item.name ?? item.id }]))

    const current = provider?.models ?? {}
    if (JSON.stringify(current) === JSON.stringify(models)) return
    config.providers ??= {}
    config.providers[providerID] ??= {
      name: "OmniRoute",
      package: "@opencode/ai/providers/openai-compatible",
      settings: { baseURL },
    }
    config.providers[providerID].models = models
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  },
}
