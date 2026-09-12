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
    },
  });

  return { registry, handlers };
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
