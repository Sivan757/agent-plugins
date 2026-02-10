# JetBrains MCP Plugin

Connects Claude Code to a running JetBrains IDE via the [MCP Server plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server), enabling IDE-level file operations, refactoring, terminal execution, and code navigation.

## Prerequisites

- A JetBrains IDE (IntelliJ IDEA, WebStorm, PyCharm, GoLand, etc.)
- **JetBrains 2025.2+**: MCP server is built-in, no plugin installation required
- **JetBrains 2025.1 and earlier**: install the [MCP Server plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server) from the Marketplace

## Setup

### 1. Enable MCP Server in the IDE

**JetBrains 2025.2+** (built-in):

1. Open **Settings** > **Tools** > **MCP Server**
2. Ensure the server is enabled
3. Note the port number displayed (default: `63342` for IntelliJ, `63343` for PyCharm)

**JetBrains 2025.1 and earlier** (plugin):

1. Open **Settings** > **Plugins** > **Marketplace**
2. Search for "MCP Server" and install it
3. Restart the IDE
4. The server starts automatically on the configured port

### 2. Verify the Server is Running

Check that the SSE endpoint is reachable:

```bash
nc -z localhost 64343 && echo "OK" || echo "NOT REACHABLE"
```

### 3. Adjust Port (if needed)

This plugin defaults to `localhost:64343`. If your IDE uses a different port, edit `.mcp.json`:

```json
{
  "mcpServers": {
    "jetbrains": {
      "type": "sse",
      "url": "http://localhost:<your-port>/sse"
    }
  }
}
```

Common default ports:

| IDE | Port |
|-----|------|
| IntelliJ IDEA | 63342 |
| PyCharm | 63343 |

> The actual port may vary by installation. Check **Settings** > **Tools** > **MCP Server** in your IDE, or look for the "MCP Server" entry in the IDE's status bar.

## How It Works

This plugin registers an SSE-based MCP server pointing at the IDE:

```json
{
  "type": "sse",
  "url": "http://localhost:64343/sse"
}
```

On session start, a hook (`hooks/setup.sh`) probes the port with `nc -z` to verify the IDE is running and reachable. If not, it prints a warning with setup instructions.

## Capabilities

Once connected, Claude Code gains access to IDE-level tools:

- **File operations** — read, write, and navigate files through the IDE
- **Refactoring** — rename symbols, extract methods, move classes using the IDE's refactoring engine
- **Terminal** — execute commands in the IDE's integrated terminal
- **Code navigation** — find usages, go to definition, search by symbol
- **Project structure** — access the IDE's understanding of modules, dependencies, and frameworks

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `[jetbrains] Warning: not reachable` | IDE not running or MCP server disabled | Start the IDE and enable MCP Server in Settings |
| `[jetbrains] Warning: nc/curl not found` | No network tools available | Install coreutils: `brew install coreutils` |
| Connected but no tools available | Plugin not installed (pre-2025.2) | Install [MCP Server plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server) |
| Wrong project context | `IJ_MCP_SERVER_PROJECT_PATH` not set | Set the header in `.mcp.json` to your project path |

## References

- [MCP Server Plugin — JetBrains Marketplace](https://plugins.jetbrains.com/plugin/26071-mcp-server)
- [JetBrains MCP Server — Deep Dive](https://skywork.ai/skypage/en/MCP-JetBrains-MCP-Server:%20A%20Deep%20Dive%20for%20AI%20Engineers/1971048920183271424)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
