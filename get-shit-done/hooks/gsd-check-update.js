#!/usr/bin/env node
// GSD Update Check — Plugin Edition
// In plugin mode, updates are managed through the marketplace.
// This hook reads plugin.json version and caches it for the /gsd:update command.

const fs = require('fs');
const path = require('path');
const os = require('os');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace(/[/\\]hooks$/, '');
const pluginJsonPath = path.join(pluginRoot, '.claude-plugin', 'plugin.json');

const cacheDir = path.join(os.homedir(), '.cache', 'apex-plugin');
const cacheFile = path.join(cacheDir, 'gsd-version.json');

try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  let version = '0.0.0';
  if (fs.existsSync(pluginJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    version = pkg.version || '0.0.0';
  }

  fs.writeFileSync(cacheFile, JSON.stringify({
    installed: version,
    source: 'plugin',
    checked: Math.floor(Date.now() / 1000)
  }));
} catch (e) {
  // Silent fail — best effort
}
