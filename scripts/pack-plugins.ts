#!/usr/bin/env tsx
import { packPlugins } from "./plugin-config";

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
  const outDir = optionValue("--out-dir") ?? "plugins";
  const clean = !process.argv.includes("--no-clean");
  await packPlugins(process.cwd(), { outDir, clean });
  console.log(`Packed plugins to ${outDir}.`);
}

main().catch((err) => {
  console.error(`Plugin packing failed: ${(err as Error).message}`);
  process.exit(1);
});
