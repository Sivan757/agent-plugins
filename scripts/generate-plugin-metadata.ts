#!/usr/bin/env tsx
import { generatePluginFiles } from "./plugin-config";

async function main(): Promise<void> {
  await generatePluginFiles(process.cwd());
  console.log("Generated plugin manifests and marketplace metadata.");
}

main().catch((err) => {
  console.error(`Plugin metadata generation failed: ${(err as Error).message}`);
  process.exit(1);
});
