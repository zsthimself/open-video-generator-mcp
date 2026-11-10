# OpenVideoGenerator MCP Server

Official Model Context Protocol (MCP) server and zero-dependency stdio bridge for [OpenVideoGenerator](https://openvideogenerator.com) — generate cinematic AI videos across **Kling AI**, **MiniMax Hailuo**, **Luma Dream Machine**, and **Tencent Hunyuan Video** directly from Cursor, Claude Desktop, Claude Code, and autonomous agents.

## Available Tools

- `generate_video` — Queue an asynchronous text-to-video or image-to-video render job and immediately receive a `taskId`.
- `get_video_status` — Poll render progress, stage status, and retrieve the final watermark-free 1080p MP4 URL.
- `list_supported_engines` — Inspect supported models, aspect ratios (`16:9`, `9:16`, `1:1`), durations, and credit costs.
- `get_user_balance` — Check remaining account credits and estimated generation capacity.
- `search_prompt_blueprints` — Search curated cinema-grade prompt blueprints with camera movements, lighting profiles, and negative prompts.

## Option 1: Direct Streamable HTTP (Recommended)

Most modern MCP clients (Cursor, Claude Code, Antigravity) connect directly to the hosted Streamable HTTP endpoint:

- **Endpoint**: `https://openvideogenerator.com/api/mcp`
- **API Key**: Create a key at [openvideogenerator.com/settings/apikeys](https://openvideogenerator.com/settings/apikeys) (new accounts receive 50 free welcome credits).

```json
{
  "mcpServers": {
    "open-video-generator": {
      "url": "https://openvideogenerator.com/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Option 2: Local Stdio Bridge (`npx`)

For clients that require a local stdio command, run the zero-dependency Node.js 18+ bridge directly from GitHub:

```json
{
  "mcpServers": {
    "open-video-generator": {
      "command": "npx",
      "args": ["-y", "github:zsthimself/open-video-generator-mcp"],
      "env": {
        "OPENVIDEO_API_KEY": "sk_YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Verify Connectivity

```bash
npx -y github:zsthimself/open-video-generator-mcp --check
```

## Links

- Homepage: https://openvideogenerator.com
- Developer API Keys: https://openvideogenerator.com/settings/apikeys
- Prompt Library: https://openvideogenerator.com/prompts
- LLM Documentation: https://openvideogenerator.com/llms.txt

## License

MIT
