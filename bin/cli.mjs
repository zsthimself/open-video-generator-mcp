#!/usr/bin/env node
/**
 * Stdio-to-Streamable-HTTP MCP bridge for OpenVideoGenerator (/api/mcp).
 * Zero external dependencies — works directly on Node.js 18+.
 */

import readline from 'node:readline';

const DEFAULT_ENDPOINT = 'https://openvideogenerator.com/api/mcp';
const endpoint = (process.env.OPENVIDEO_MCP_URL || DEFAULT_ENDPOINT).trim();
const apiKey = (process.env.OPENVIDEO_API_KEY || '').trim();

function writeJsonRpc(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function writeError(id, code, message) {
  if (id === undefined || id === null) return;
  writeJsonRpc({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  });
}

async function runCheck() {
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[open-video-generator-mcp] HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  console.log(text);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`open-video-generator-mcp v1.0.0

Usage:
  OPENVIDEO_API_KEY=sk_... open-video-generator-mcp

Options:
  --check    Verify connectivity to ${DEFAULT_ENDPOINT}
  --version  Print version
  --help     Show this help message

Environment:
  OPENVIDEO_API_KEY  API key from https://openvideogenerator.com/settings/apikeys
  OPENVIDEO_MCP_URL  Override endpoint (default: ${DEFAULT_ENDPOINT})
`);
  process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log('1.0.0');
  process.exit(0);
}

if (process.argv.includes('--check')) {
  runCheck().catch((err) => {
    console.error('[open-video-generator-mcp] check failed:', err.message);
    process.exit(1);
  });
} else {
  let sessionId = null;

  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }

    if (!apiKey) {
      writeError(
        msg.id,
        -32002,
        'Missing OPENVIDEO_API_KEY environment variable. Create one at https://openvideogenerator.com/settings/apikeys'
      );
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${apiKey}`,
    };
    if (sessionId) {
      headers['Mcp-Session-Id'] = sessionId;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(msg),
      });

      const returnedSession = res.headers.get('mcp-session-id');
      if (returnedSession) {
        sessionId = returnedSession;
      }

      if (res.status === 202) {
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text();

      if (!res.ok) {
        try {
          const parsedErr = JSON.parse(raw);
          if (parsedErr && parsedErr.jsonrpc) {
            writeJsonRpc({ ...parsedErr, id: parsedErr.id ?? msg.id ?? null });
            return;
          }
        } catch {
          // fall through to structured error
        }
        writeError(
          msg.id,
          -32000,
          `Upstream MCP endpoint returned HTTP ${res.status}: ${raw.slice(0, 300)}`
        );
        return;
      }

      if (contentType.includes('text/event-stream')) {
        for (const chunk of raw.split(/\r?\n\r?\n/)) {
          const dataLines = chunk
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim());
          if (dataLines.length === 0) continue;
          const jsonText = dataLines.join('\n');
          try {
            writeJsonRpc(JSON.parse(jsonText));
          } catch {
            // ignore non-JSON SSE keepalives
          }
        }
        return;
      }

      if (raw.trim()) {
        writeJsonRpc(JSON.parse(raw));
      }
    } catch (err) {
      writeError(
        msg.id,
        -32603,
        `Network error forwarding MCP request to ${endpoint}: ${err.message}`
      );
    }
  });
}
