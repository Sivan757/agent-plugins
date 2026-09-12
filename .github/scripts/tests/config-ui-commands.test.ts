import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * Every plugin that ships a config form tells the user which command reopens it
 * through `setupCommand`, and those strings go straight into error messages.
 *
 * Two real bugs motivate this check: `ticktick` pointed at `setup`, which there
 * means `setup x-device`, and `mysql` pointed at `init`, which only prints a
 * template. Both told the reader to run a command that cannot open the form.
 */

const ROOT = join(import.meta.dir, "..", "..", "..");
const PLUGINS = join(ROOT, "plugins");

interface PluginSources {
  name: string;
  text: string;
}

/** Every non-test source file of one plugin, concatenated. The form options do
 * not always live in the CLI entry file (codearts keeps them in config.ts), and
 * the command registrations can be spread across modules too. */
function pluginSources(): PluginSources[] {
  return readdirSync(PLUGINS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const dir = join(PLUGINS, entry.name, "src");
      if (!existsSync(dir)) return [];
      const text = readdirSync(dir)
        .filter((file) => file.endsWith(".ts") && !file.includes(".test."))
        .map((file) => readFileSync(join(dir, file), "utf-8"))
        .join("\n");
      return text ? [{ name: entry.name, text }] : [];
    });
}

/** Registered top-level command names, e.g. `.command('config')`. */
function registeredCommands(text: string): Set<string> {
  const names = new Set<string>();
  for (const match of text.matchAll(/\.command\(\s*['"]([a-z][\w-]*)['"]/g)) {
    names.add(match[1]);
  }
  return names;
}

/** The registration text of one command, up to the next `.command(`. */
function commandBlock(text: string, name: string): string | null {
  const single = text.indexOf(`.command('${name}'`);
  const double = text.indexOf(`.command("${name}"`);
  const candidates = [single, double].filter((index) => index >= 0);
  if (candidates.length === 0) return null;
  const start = Math.min(...candidates);
  const next = text.slice(start + 1).search(/\.command\(/);
  return next < 0 ? text.slice(start) : text.slice(start, start + 1 + next);
}

const sources = pluginSources();

/** Plugins that declare `setupCommand`, with the command it names. */
const declared = sources.flatMap(({ name, text }) => {
  const match = text.match(/setupCommand:\s*['"]([^'"]+)['"]/);
  if (!match) return [];
  const [command = "", ...flags] = match[1].split(/\s+/);
  return [{ name, text, command, flags, raw: match[1] }];
});

describe("config-form commands", () => {
  test("covers the plugins that ship a config form", () => {
    expect(declared.length).toBeGreaterThanOrEqual(5);
    expect(declared.map((entry) => entry.name)).toContain("codearts");
  });

  test("every setupCommand names a command the plugin registers", () => {
    for (const entry of declared) {
      expect(
        registeredCommands(entry.text).has(entry.command),
        `${entry.name}: setupCommand "${entry.raw}" names "${entry.command}", which the CLI does not register`,
      ).toBe(true);
    }
  });

  test("every setupCommand's flags are declared on that command", () => {
    for (const entry of declared) {
      for (const flag of entry.flags) {
        expect(
          entry.text.includes(`.option('${flag}'`) || entry.text.includes(`.option("${flag}"`),
          `${entry.name}: setupCommand "${entry.raw}" uses ${flag}, which no command declares`,
        ).toBe(true);
      }
    }
  });

  test("every setupCommand's command actually opens the form", () => {
    // The check that matters. A command can exist and still be the wrong answer:
    // mysql's `init` prints a template, and ticktick's `setup` sets the X-Device
    // header. Both were named as the way to reopen the config form.
    //
    // The form call has to be in the command's own registration block. A plugin
    // that opens the form only through a helper cannot be checked this way and
    // should name a command that calls the helper inline.
    for (const entry of declared) {
      const block = commandBlock(entry.text, entry.command);
      expect(block, `${entry.name}: no registration found for "${entry.command}"`).not.toBeNull();
      expect(
        /openConfigUI\(|launchConfigUI\(|launchUI\(/.test(block ?? ""),
        `${entry.name}: setupCommand "${entry.raw}" names a command that never opens the form`,
      ).toBe(true);
    }
  });
});
