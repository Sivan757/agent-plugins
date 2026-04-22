import { defineRegistry } from '@json-render/react';
import type { SetState } from '@json-render/react';
import type { StateModel } from '@json-render/core';
import { saveConfig } from '@shared/actions';
import { catalog } from '@shared/catalog';
import { Collection } from '@components/Collection';
import { Field } from '@components/Field';
import { Header } from '@components/Header';
import { SaveBar } from '@components/SaveBar';
import { Section } from '@components/Section';

/**
 * Create the registry, binding catalog components to React implementations
 * and catalog actions to HTTP handlers.
 */
export function createAppRegistry(opts: {
  csrfToken: string;
  onSaved?: () => void;
  onReset?: (state: Record<string, unknown>) => void;
}) {
  const { registry, handlers } = defineRegistry(catalog, {
    components: {
      Header,
      Section,
      Collection,
      Field,
      SaveBar,
    },

    actions: {
      save: async (_params, _setState, state) => {
        await saveConfig(state as Record<string, unknown>, opts.csrfToken);
        opts.onSaved?.();
      },

      reset: async (_params, setState, _state) => {
        // Reset to initial state injected by the server (no /config endpoint needed)
        const initialState = window.__CONFIG_STATE__ ?? {};
        setState(() => initialState);
        opts.onReset?.(initialState);
      },

      addItem: async (params, setState, state) => {
        if (!params) return;
        const { statePath } = params;
        const current = getByPath(state, statePath) as unknown[];
        const newItems = [...(current ?? []), {}];
        setState((prev) => setByPath(prev, statePath, newItems));
      },

      removeItem: async (params, setState, state) => {
        if (!params) return;
        const { statePath, index } = params;
        const current = getByPath(state, statePath) as unknown[];
        if (!current) return;
        const newItems = current.filter((_, i) => i !== index);
        setState((prev) => setByPath(prev, statePath, newItems));
      },
    },
  });

  return { registry, handlers };
}

// ---- path helpers ----

function getByPath(obj: unknown, path: string): unknown {
  const segments = path.replace(/^\//, '').split('/').filter(Boolean);
  let current: unknown = obj;
  for (const seg of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = path.replace(/^\//, '').split('/').filter(Boolean);
  if (segments.length === 0) return obj;

  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const next = current[seg];
    if (next && typeof next === 'object' && !Array.isArray(next)) {
      current[seg] = { ...(next as Record<string, unknown>) };
    } else {
      current[seg] = {};
    }
    current = current[seg] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;
  return result;
}

/**
 * Build action handlers bound to React refs (for use with ActionProvider).
 */
export function buildHandlers(
  registryResult: ReturnType<typeof createAppRegistry>,
  getSetState: () => SetState | undefined,
  getState: () => StateModel,
) {
  return registryResult.handlers(getSetState, getState);
}
