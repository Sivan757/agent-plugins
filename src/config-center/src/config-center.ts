#!/usr/bin/env tsx
/**
 * config-center CLI entry point.
 *
 * Security boundary: NEVER print plaintext config values or the cache path.
 * - `get`/`show` always print redacted output.
 * - `init`/`edit` launch the HTML UI (stubbed in this task; full HTTP server
 *   lands in a later task).
 * - No `set` command. No `--plaintext` flag. No `--debug` flag.
 */

import { Command, CommanderError } from 'commander';
import { pathToFileURL } from 'node:url';
import { loadConfig } from './config-store.js';
import { redactEntry } from './redact.js';

/**
 * Output interface for the CLI. Defaults to process.stdout/stderr.
 * Tests can pass in a mock to capture output without monkey-patching.
 */
export interface CLIOutput {
  stdout: (s: string) => void;
  stderr: (s: string) => void;
}

const defaultOutput: CLIOutput = {
  stdout: (s: string) => process.stdout.write(s),
  stderr: (s: string) => process.stderr.write(s),
};

/**
 * Stub for the HTML UI launcher. The full HTTP server lands in a later task.
 * Prints the UI URL to stderr (so stdout stays clean for Agent parsing) and
 * returns the port number.
 */
export function launchUI(
  pluginName?: string,
  output: CLIOutput = defaultOutput
): number {
  // Deterministic stub port; the real implementation will bind to 0 and
  // report the OS-assigned port. Randomized here to avoid port collisions
  // when multiple stubs run back-to-back.
  const port = 4321 + Math.floor(Math.random() * 1000);
  void pluginName; // Reserved for the full UI implementation (Task 0.6).
  output.stderr(`Open the config UI at: http://localhost:${port}\n`);
  return port;
}

function buildProgram(output: CLIOutput): Command {
  const program = new Command();

  program
    .name('config-center')
    .description(
      'Manage plugin credentials and env config. ' +
        'Reads are always redacted; modifications require the HTML UI.'
    );

  // Route ALL commander output (errors, help, usage) through the I/O object
  // so tests can capture it without monkey-patching process.stdout/stderr.
  const configureCmd = (cmd: Command) => {
    cmd.configureOutput({
      writeOut: (str: string) => output.stdout(str),
      writeErr: (str: string) => output.stderr(str),
    });
    // exitOverride must be applied to EACH subcommand, not just the parent.
    // Otherwise subcommand errors (e.g. missing required argument) call
    // process.exit directly, bypassing the override and killing the test runner.
    cmd.exitOverride();
  };

  // Apply to the parent program...
  configureCmd(program);

  program
    .command('get <plugin> [key]')
    .description(
      'Print a redacted value for the requested key, or KEY=<not set> if absent. ' +
        'Without a key, prints all top-level keys redacted.'
    )
    .action(async (plugin: string, key?: string) => {
      const config = await loadConfig<Record<string, unknown>>(plugin);
      if (key === undefined) {
        if (!config) {
          output.stdout('# no config\n');
          return;
        }
        for (const [k, v] of Object.entries(config)) {
          output.stdout(`${redactEntry(k, v)}\n`);
        }
        return;
      }
      // redactEntry handles absent keys (undefined -> <not set>) and absent
      // configs (config?.[key] is undefined) in one shot.
      output.stdout(`${redactEntry(key, config?.[key])}\n`);
    });

  program
    .command('show <plugin>')
    .description('Print all top-level keys redacted.')
    .action(async (plugin: string) => {
      const config = await loadConfig<Record<string, unknown>>(plugin);
      if (!config) {
        output.stdout('# no config\n');
        return;
      }
      for (const [k, v] of Object.entries(config)) {
        output.stdout(`${redactEntry(k, v)}\n`);
      }
    });

  program
    .command('init [plugin]')
    .description('Bootstrap a plugin config directory and open the HTML UI.')
    .action((plugin?: string) => {
      launchUI(plugin, output);
    });

  program
    .command('edit [plugin]')
    .description('Open the HTML UI to edit a plugin config. The sole modification path.')
    .action((plugin?: string) => {
      launchUI(plugin, output);
    });

  // Apply configureOutput + exitOverride to each subcommand so their errors
  // go through the I/O object and throw instead of calling process.exit.
  for (const cmd of program.commands) {
    configureCmd(cmd);
  }

  return program;
}

/**
 * Redact any substring that looks like a cache path from a message.
 * Used as defense-in-depth for error output so the cache path never leaks
 * even if an upstream error message happens to include it.
 */
function redactCachePath(message: string): string {
  return message.replace(/\S*\.cache\/agent-plugins\S*/g, '<redacted>');
}

/**
 * Entry point for programmatic invocation and tests.
 * Returns the exit code (0 on success, 1 on error) without calling process.exit.
 *
 * @param argv - User-provided arguments (e.g., ['get', 'demo', 'TOKEN']).
 * @param output - Optional I/O object for capturing output in tests.
 */
export async function main(argv: string[], output: CLIOutput = defaultOutput): Promise<number> {
  const program = buildProgram(output);
  // exitOverride + configureOutput are applied to the program and all
  // subcommands inside buildProgram.

  try {
    await program.parseAsync(argv, { from: 'user' });
    return 0;
  } catch (err) {
    if (err instanceof CommanderError) {
      // commander already printed its own error to stderr via output.stderr;
      // just return the exit code. Help/version are also CommanderErrors but
      // with exitCode 0.
      return typeof err.exitCode === 'number' ? err.exitCode : 1;
    }
    // Unknown error (e.g. PluginError from config-store): surface to stderr
    // with any cache path redacted as defense-in-depth.
    const raw = String((err as Error)?.message ?? err);
    const safe = redactCachePath(raw);
    output.stderr(`${safe}\n`);
    return 1;
  }
}

// Run when invoked directly (not when imported by tests or other modules).
try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv.slice(2))
      .then((code) => process.exit(code))
      .catch(() => process.exit(1));
  }
} catch {
  // Not invoked directly (e.g. imported by a test or another module).
}
