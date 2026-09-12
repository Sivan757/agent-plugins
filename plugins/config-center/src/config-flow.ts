//
// config-flow.ts — how a command gets hold of the operator's configuration.
//
// Three situations look different to a user but are one operation: nothing is
// configured yet, something configured has to change, or the user wants to look
// at it. In all three the answer is to open the configuration form, rather than
// printing text and telling the user to go and run a command — an Agent is the
// one talking to the user, so the Agent opens it.
//
// The form is served by this process, so the process has to stay alive while the
// user works in it. A caller with other things to do runs this as a background
// task and reads the configuration again afterwards.

import { loadConfig } from './config-store.js';
import { redactStructure } from './redact.js';
import {
  launchUI,
  type CLIOutput,
  type ConfigSpec,
  type LaunchUIOptions,
} from './launch-ui.js';

/**
 * Why the form is being opened. It changes the wording and, more importantly,
 * what an unsaved exit means:
 * - `create` / `edit` — the user was expected to save; not saving leaves the
 *   caller's problem unsolved.
 * - `view` — saving is incidental; the user may only have looked.
 */
export type ConfigIntent = 'create' | 'edit' | 'view';

export interface OpenConfigOptions extends LaunchUIOptions {
  intent?: ConfigIntent;
  /**
   * Why this plugin needs the form, in one sentence. Printed when the form
   * opens, so the user knows what they are being asked to fix.
   */
  reason?: string;
}

export interface OpenConfigResult {
  /** The form was served, and a browser was asked to open it. */
  opened: boolean;
  /** The user saved. Always false for an abandoned or timed-out session. */
  saved: boolean;
  /** URL the form was served on, for reopening by hand. Empty if never served. */
  url: string;
}

const defaultOutput: CLIOutput = {
  stdout: (s: string) => process.stdout.write(s),
  stderr: (s: string) => process.stderr.write(s),
};

const INTENT_MESSAGE: Record<ConfigIntent, string> = {
  create: 'No configuration yet — opening the configuration form.',
  edit: 'Opening the configuration form to change the configuration.',
  view: 'Opening the configuration form.',
};

/**
 * Serve the browser configuration form, pre-filled with whatever is already
 * stored, and wait for the user to save or for the session to time out.
 */
export async function openConfigUI(
  pluginName: string,
  options: OpenConfigOptions = {},
): Promise<OpenConfigResult> {
  const intent = options.intent ?? 'edit';
  const output = options.output ?? defaultOutput;

  output.stderr(`[${pluginName}] ${INTENT_MESSAGE[intent]}\n`);
  if (options.reason) output.stderr(`[${pluginName}] ${options.reason}\n`);
  if (intent === 'view') {
    output.stderr(
      `[${pluginName}] Saving is optional here; the form also ends on its own after the session timeout.\n`,
    );
  }

  const handle = launchUI(pluginName, options);
  await handle.ready;
  output.stderr(`[${pluginName}] Waiting for the form to be saved (or for the session to time out)…\n`);
  const saved = await handle.done;

  return { opened: Boolean(handle.url), saved, url: handle.url };
}

/**
 * The user has to add or repair something in the form before the caller can
 * continue: open it, wait for a save, and hand back the reloaded configuration.
 *
 * Returns null when nothing was saved, so the caller keeps its own context for
 * reporting what was missing instead of replacing it with a generic failure.
 */
export async function reconfigure<T extends Record<string, unknown>>(
  pluginName: string,
  options: OpenConfigOptions,
  reason: string,
): Promise<T | null> {
  const { saved } = await openConfigUI(pluginName, { ...options, intent: 'edit', reason });
  if (!saved) return null;
  return loadConfig<T>(pluginName);
}

// ── Reading the configuration back ──────────────────────────────────────────

/** Input types a form can declare for one field. */
const FIELD_TYPES = new Set(['text', 'password', 'number', 'checkbox', 'select', 'textarea']);

interface DeclaredPaths {
  /** Paths and leaf names the form presents as ordinary inputs. */
  plain: Set<string>;
  /** Paths and leaf names the form itself obscures. */
  password: Set<string>;
}

/**
 * Read the form spec for what it says about each field's type.
 *
 * This is the whole input to the reveal decision, and it costs nothing to keep
 * current: it is the same metadata the form renders from, so a field cannot be
 * added to the UI without arriving here too.
 *
 * A spec path may be absolute (`/credentials/accessKeyId`) or relative to the
 * collection item that contains it (`password`). Rather than resolve that, both
 * forms are indexed twice — as the whole dotted path and as the trailing name —
 * so a value is matched whether the schema called it absolute or relative.
 */
function declaredPaths(spec: ConfigSpec | undefined): DeclaredPaths {
  const plain = new Set<string>();
  const password = new Set<string>();

  for (const element of Object.values(spec?.elements ?? {})) {
    const props = (element as { props?: Record<string, unknown> } | null)?.props;
    const fieldType = String(props?.type ?? '').toLowerCase();
    const statePath = String(props?.statePath ?? '').trim();
    if (!statePath || !FIELD_TYPES.has(fieldType)) continue;

    const dotted = statePath.replace(/^\//, '').split('/').filter(Boolean).join('.');
    const target = fieldType === 'password' ? password : plain;
    target.add(dotted);
    target.add(dotted.split('.').pop() ?? dotted);
  }

  return { plain, password };
}

export interface SummarizeConfigOptions {
  /** The plugin's form spec, used only to decide what may be shown. */
  spec?: ConfigSpec;
}

/**
 * Render a configuration for a reader who must not see any of it.
 *
 * Three cases, and the default is the safe one:
 *
 * - the form declares the field as `password` — masked whole, plus its length,
 *   which is the fact that exposes a truncated paste;
 * - the form declares it as any other input type — printed, because the form
 *   presents it in the clear and therefore already treats it as not secret;
 * - the form says nothing about it — masked whole. Configuration can hold
 *   credentials no form field covers (`ticktick` keeps a session token and a
 *   client secret beside the username and password its form declares), so an
 *   unknown key is never a reason to print.
 *
 * There is no list of secret *names* behind this. Every previous attempt at one
 * had the same failure mode — a field added to a schema without being added to
 * the list gets printed — and the form's own field types say it better.
 */
export function summarizeConfig(
  config: Record<string, unknown>,
  options: SummarizeConfigOptions = {},
): string[] {
  const { plain, password } = declaredPaths(options.spec);
  const isPassword = (path: string): boolean => {
    const leaf = path.split('.').pop() ?? path;
    return password.has(path) || password.has(leaf);
  };

  const reveal = (path: string): boolean => {
    if (isPassword(path)) return false;
    const leaf = path.split('.').pop() ?? path;
    return plain.has(path) || plain.has(leaf);
  };

  const lines = Object.entries(config).flatMap(([key, value]) =>
    redactStructure(key, value, { lengths: true, reveal }),
  );
  return lines.length > 0 ? lines : ['<empty configuration>'];
}
