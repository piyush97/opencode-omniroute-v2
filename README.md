# @piyush97/opencode-omniroute-v2

OpenCode v2 integration for OmniRoute. It discovers the live `/v1/models` catalog at startup and exposes those models under the `omniroute` provider.

Based on OmniRoute's MIT-licensed [`release/v3.8.51` OpenCode v2 plugin](https://github.com/diegosouzapw/OmniRoute/tree/release/v3.8.51/%40omniroute/opencode-plugin-v2). Upstream attribution and license are preserved.

## Install

OpenCode v2 currently loads the sync entrypoint from its local plugin directory:

```sh
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/piyush97/opencode-omniroute-v2/main/plugin.js \
  -o ~/.config/opencode/plugins/omniroute-v2.js
```

Add your OmniRoute instance to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "omniroute/auto/best-coding",
  "providers": {
    "omniroute": {
      "name": "OmniRoute",
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": {
        "baseURL": "https://your-omniroute.example/v1"
      },
      "models": {}
    }
  }
}
```

Store the OmniRoute API key with OpenCode's auth flow, or export it:

```sh
export OMNIROUTE_API_KEY="your-api-key"
```

Restart OpenCode. The plugin fetches the current model catalog and rewrites only `providers.omniroute.models` when the catalog changes.

Override the configured endpoint when needed:

```sh
export OMNIROUTE_BASE_URL="https://your-omniroute.example/v1"
```

## Verify

```sh
opencode models | grep '^omniroute/'
opencode run --model omniroute/auto/best-fast 'Reply exactly: PONG'
```

## Full upstream plugin

The package also contains OmniRoute's full v2 implementation, including combos, auto-combos, metadata enrichment, usable-provider filtering, Gemini schema sanitation, and OpenCode credential integration. OpenCode v2's current package loader is not yet compatible with that package entrypoint, so the local `plugin.js` sync entrypoint is the supported installation path for now.

## Security

- API keys stay in OpenCode auth storage or environment variables.
- The plugin writes model IDs and names only.
- Do not commit API keys or management tokens.

## License

MIT. See [LICENSE](LICENSE).
