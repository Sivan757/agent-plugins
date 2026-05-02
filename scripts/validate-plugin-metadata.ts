#!/usr/bin/env tsx
import { validatePluginMetadata } from "./plugin-config";

function optionValue(name: string): string | undefined {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);
  if (index >= 0) {
    return process.argv[index + 1];
  }

  return undefined;
}

async function main(): Promise<void> {
  const shouldValidatePacks = process.argv.includes("--packs");
  const packsRoot = shouldValidatePacks ? optionValue("--packs-root") ?? ".build/plugins" : undefined;
  const errors = await validatePluginMetadata(process.cwd(), { packsRoot });

  if (errors.length > 0) {
    console.error("Plugin metadata validation failed:\n");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  if (shouldValidatePacks) {
    console.log("Plugin metadata and packed artifacts validation passed.");
    return;
  }

  console.log("Plugin metadata validation passed.");
}

main().catch((err) => {
  console.error(`Plugin metadata validation failed: ${(err as Error).message}`);
  process.exit(1);
});
