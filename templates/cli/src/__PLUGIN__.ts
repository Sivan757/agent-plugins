#!/usr/bin/env node
import { requireConfig, PluginError } from '@apex/core';

interface __PLUGIN_PASCAL__Config extends Record<string, unknown> {
  // Add config fields here
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`Usage: node dist/__PLUGIN__.mjs <command> [options]

Commands:
  --help       Show this help
  --test       Test configuration
  --list       List available items

Config: ~/.cache/apex-plugin/__PLUGIN__.json`);
    return;
  }

  const config = await requireConfig<__PLUGIN_PASCAL__Config>('__PLUGIN__');

  if (args.includes('--test')) {
    console.log('Config loaded successfully.');
    return;
  }

  console.error(`Unknown command: ${args[0]}`);
  process.exit(1);
}

main().catch((err: unknown) => {
  if (err instanceof PluginError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(err.exitCode);
  }
  console.error(err);
  process.exit(1);
});
