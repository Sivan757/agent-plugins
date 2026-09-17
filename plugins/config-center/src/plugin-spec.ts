//
// plugin-spec.ts — the declarative file a skill ships so config-center can
// serve its form and drive its CLI without knowing anything about it.
//
// Config Center is generic: it renders any form it is handed and injects any
// credential mapping it is handed. Everything plugin-specific — the fields, the
// environment-variable names, the command — lives in a spec file next to the
// skill that owns it, and reaches the CLI through `--spec <file>`. The file is
// plain data: no secrets belong in it, only field names, variable names and
// shapes.
//

import { readFileSync } from 'node:fs';
import { launchUI, type ConfigSpec } from './launch-ui.js';
import { PluginError } from './errors.js';

/**
 * How one plugin's configuration is entered and consumed.
 *
 * `form` drives the browser UI; `env`, `command` and the required-key lists
 * drive `config-center run`. A spec that only fills forms may omit the run
 * half, and one that only drives a CLI may omit nothing — the form is what the
 * user fills when values are missing.
 */
export interface PluginSpec {
  /** The plugin directory in the shared cache root that stores the values. */
  plugin: string;
  /** The browser form for this plugin. */
  form: ConfigSpec;
  /** Why the form is needed, in the user's terms. */
  reason?: string;
  /** The executable to run, as typed in a shell. Required for `run`. */
  command?: string;
  /** Environment variable name → configuration key holding its value. */
  env?: Record<string, string>;
  /** Every key here must be non-empty for a run to start. */
  requiredKeys?: string[];
  /** At least one key in each group must be non-empty (e.g. password or token). */
  requiredAny?: string[][];
  /** Where this spec was loaded from, set by {@link loadPluginSpec}. */
  sourcePath?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Human-readable list of what a bad spec file is missing or got wrong. */
function describeProblems(problems: string[]): string {
  return problems.join('; ');
}

/**
 * Read and validate a spec file. Fails fast, naming the file and every problem
 * found, so a broken spec is a one-edit fix rather than a mystery.
 */
export function loadPluginSpec(path: string): PluginSpec {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch (e: any) {
    throw new PluginError(
      `Cannot read the plugin spec file "${path}": ${e.code ?? e.message}`,
      'CONFIG_MISSING',
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e: any) {
    throw new PluginError(
      `The plugin spec file "${path}" is not valid JSON: ${e.message}`,
      'CONFIG_INVALID',
    );
  }
  if (!isRecord(parsed)) {
    throw new PluginError(
      `The plugin spec file "${path}" must contain a JSON object.`,
      'CONFIG_INVALID',
    );
  }

  const problems: string[] = [];
  const plugin = parsed['plugin'];
  if (typeof plugin !== 'string' || plugin.trim() === '') {
    problems.push('"plugin" must name the storage directory');
  } else if (!/^[A-Za-z0-9_-]+$/.test(plugin)) {
    problems.push('"plugin" may only contain letters, digits, "_" and "-"');
  }
  if (!isRecord(parsed['form'])) {
    problems.push('"form" must be the config form spec ({"root": …, "elements": …})');
  }
  if (problems.length > 0) {
    throw new PluginError(
      `Invalid plugin spec "${path}": ${describeProblems(problems)}.`,
      'CONFIG_INVALID',
    );
  }

  const spec = parsed as unknown as PluginSpec;
  const pluginName = plugin as string;
  return { ...spec, plugin: pluginName, sourcePath: path };
}

export type { ConfigSpec } from './launch-ui.js';
export { launchUI };
