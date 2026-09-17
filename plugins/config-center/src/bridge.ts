//
// bridge.ts — run a CLI with credentials injected as environment variables.
//
// An interactive first-run login is the one step of a command-line tool an
// agent cannot perform: it needs a human typing into a terminal prompt. The
// bridge replaces that step for any tool whose spec names the environment
// variables it reads. The user enters the credentials once in the browser form;
// they exist only in the child process's environment — nothing is printed,
// nothing lands in argv, nothing is written to the user's shell profile.
//

import { spawn } from 'node:child_process';
import { loadConfig } from './config-store.js';
import { openConfigUI } from './config-flow.js';
import { PluginError } from './errors.js';
import type { CLIOutput } from './launch-ui.js';
import type { PluginSpec } from './plugin-spec.js';

/**
 * The child process exited with a nonzero status. Carries the code so the CLI
 * can exit with it, keeping shell pipelines and CI honest.
 */
export class ChildExitError extends Error {
  constructor(
    public readonly exitCode: number,
    command: string,
  ) {
    super(`"${command}" exited with code ${exitCode}`);
    this.name = 'ChildExitError';
  }
}

export interface BridgeRunOptions {
  /** Extra CLI arguments after the spec's command, e.g. `['bug', '--product=1']`. */
  args?: string[];
  /** Parent environment; the injected variables are layered on top of it. */
  baseEnv?: NodeJS.ProcessEnv;
  /** I/O sink for the form's "Open the config UI at:" line. Defaults to process streams. */
  output?: CLIOutput;
}

export interface BridgeRunResult {
  exitCode: number;
}

/**
 * Check a spec's required keys against a configuration and report every gap.
 * All gaps are collected before failing, so the reader fixes one form session.
 */
export function checkEnvReadiness(
  spec: PluginSpec,
  config: Record<string, unknown> | null,
): string[] {
  const gaps: string[] = [];
  const valueOf = (key: string): string => {
    const value = config?.[key];
    return value == null ? '' : String(value).trim();
  };

  for (const key of spec.requiredKeys ?? []) {
    if (valueOf(key) === '') {
      gaps.push(key);
    }
  }
  for (const group of spec.requiredAny ?? []) {
    if (!group.some((key) => valueOf(key) !== '')) {
      gaps.push(group.join(' / '));
    }
  }
  return gaps;
}

/** The environment variables a spec would inject for this configuration. */
export function envForConfig(
  spec: PluginSpec,
  config: Record<string, unknown>,
): NodeJS.ProcessEnv {
  const injected: NodeJS.ProcessEnv = {};
  for (const [variable, key] of Object.entries(spec.env ?? {})) {
    const value = config[key];
    if (typeof value === 'string' && value.trim() !== '') {
      injected[variable] = value;
    }
  }
  return injected;
}

function describeMissing(spec: PluginSpec): string {
  if (spec.env == null) {
    return 'the spec has no "env" mapping, so nothing can be injected';
  }
  if (spec.command == null) {
    return 'the spec has no "command", so there is nothing to run';
  }
  return '';
}

async function loadReadyConfig(
  spec: PluginSpec,
  output?: CLIOutput,
): Promise<Record<string, unknown>> {
  let config = await loadConfig(spec.plugin);
  let gaps = checkEnvReadiness(spec, config);
  if (gaps.length === 0 && config) {
    return config;
  }

  const { saved } = await openConfigUI(spec.plugin, {
    spec: spec.form,
    intent: 'create',
    reason:
      gaps.length > 0
        ? `Missing: ${gaps.join(', ')}. ${spec.reason ?? ''}`.trim()
        : spec.reason,
    output,
  });
  if (!saved) {
    throw new PluginError(
      `No configuration was saved for "${spec.plugin}" (the form closed without a save). ` +
        `Run yourself as a background task: config-center edit --spec <spec-file> ${spec.plugin}`,
      'CONFIG_MISSING',
    );
  }

  config = await loadConfig(spec.plugin);
  gaps = checkEnvReadiness(spec, config);
  if (gaps.length > 0 || !config) {
    throw new PluginError(
      `The saved configuration is still missing: ${gaps.join(', ')}. ` +
        `Run yourself as a background task: config-center edit --spec <spec-file> ${spec.plugin}`,
      'CONFIG_INVALID',
    );
  }
  return config;
}

/**
 * Open the form when needed, inject the spec's credentials into the
 * environment, and run the spec's command with the tool's own stdout and
 * stderr streamed through unchanged.
 */
export async function runWithEnv(
  spec: PluginSpec,
  options: BridgeRunOptions = {},
): Promise<BridgeRunResult> {
  const missingHalf = describeMissing(spec);
  if (missingHalf !== '') {
    throw new PluginError(missingHalf, 'CONFIG_INVALID');
  }

  const config = await loadReadyConfig(spec, options.output);
  const injected = envForConfig(spec, config);
  const baseEnv = options.baseEnv ?? process.env;
  const args = options.args ?? [];

  return await new Promise<BridgeRunResult>((resolve, reject) => {
    const child = spawn(spec.command as string, args, {
      env: { ...baseEnv, ...injected },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', (err) => {
      reject(
        new PluginError(
          `Failed to start "${spec.command}": ${err.message}. Install the tool first ` +
            `(see the plugin skill's installation section), then rerun the same command.`,
          'CONFIG_MISSING',
        ),
      );
    });

    child.on('close', (code) => {
      const exitCode = code ?? 1;
      if (exitCode !== 0) {
        reject(new ChildExitError(exitCode, spec.command as string));
        return;
      }
      resolve({ exitCode });
    });
  });
}
