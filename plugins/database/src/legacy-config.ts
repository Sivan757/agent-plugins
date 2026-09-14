import { loadConfig, saveConfig } from '@agent-plugins/config-center';

import type { ConnectionConfig, DriverType } from './drivers/types.js';

/**
 * The configs written before `mysql` and `postgresql` became one plugin.
 *
 * Ordered so a name that exists in both files keeps the MySQL connection under
 * its own name and the PostgreSQL one is renamed rather than dropped.
 */
const LEGACY_SOURCES: ReadonlyArray<{ plugin: string; type: DriverType }> = [
  { plugin: 'mysql', type: 'mysql' },
  { plugin: 'postgresql', type: 'postgresql' },
];

export interface AdoptionReport {
  /** Legacy plugin names that actually held connections. */
  sources: string[];
  adopted: number;
  /** Connections whose name was already taken, and the name they got instead. */
  renamed: Array<{ from: string; to: string; type: DriverType }>;
}

interface LegacyConfig extends Record<string, unknown> {
  connections?: Record<string, Record<string, unknown>>;
}

/**
 * Read the former per-engine configs once and write them into this plugin's own
 * file, tagging every connection with the engine it belonged to.
 *
 * Returns null when neither legacy file holds a connection, which is the signal
 * to fall through to the normal "not configured yet" flow. The legacy files are
 * left untouched: this runs at most once, and only while this plugin has no
 * config of its own.
 */
export async function adoptLegacyConnections(): Promise<AdoptionReport | null> {
  const connections: Record<string, ConnectionConfig> = {};
  const sources: string[] = [];
  const renamed: AdoptionReport['renamed'] = [];

  for (const source of LEGACY_SOURCES) {
    const legacy = await loadConfig<LegacyConfig>(source.plugin);
    const entries = Object.entries(legacy?.connections ?? {});
    if (entries.length === 0) continue;
    sources.push(source.plugin);

    for (const [name, raw] of entries) {
      let target = name;
      if (target in connections) {
        target = `${name}-${source.type}`;
        let suffix = 2;
        while (target in connections) {
          target = `${name}-${source.type}-${suffix}`;
          suffix += 1;
        }
        renamed.push({ from: name, to: target, type: source.type });
      }
      connections[target] = { ...raw, type: source.type } as unknown as ConnectionConfig;
    }
  }

  if (sources.length === 0) return null;

  await saveConfig('database', { connections });
  return { sources, adopted: Object.keys(connections).length, renamed };
}
