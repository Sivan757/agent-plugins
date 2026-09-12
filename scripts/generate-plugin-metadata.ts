#!/usr/bin/env tsx
import { generatePluginFiles, validatePluginMetadata } from "./plugin-config";

async function main(): Promise<void> {
  const check = process.argv.includes("--check");

  if (!check) {
    await generatePluginFiles(process.cwd());
    console.log("Generated plugin manifests and marketplace metadata.");
    return;
  }

  const errors = await validatePluginMetadata(process.cwd());
  if (errors.length > 0) {
    console.error("Plugin metadata validation failed:\n");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }
  console.log("Plugin metadata validation passed.");
}

main().catch((err) => {
  console.error(`Plugin metadata check failed: ${(err as Error).message}`);
  process.exit(1);
});
