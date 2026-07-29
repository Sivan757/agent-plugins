import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActionProvider,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from '@json-render/react';
import type { SetState } from '@json-render/react';
import type { Spec, StateModel } from '@json-render/core';
import { saveConfig } from '@shared/actions';
import { ConfigContext } from '@shared/ConfigContext';
import { I18nProvider } from '@shared/i18n';
import { buildHandlers, createAppRegistry } from '@shared/registry';

declare global {
  interface Window {
    __CONFIG_SPEC__: Spec;
    __CONFIG_STATE__: Record<string, unknown>;
    __CONFIG_PATH__: string;
    __CSRF_TOKEN__: string;
  }
}

export function App() {
  const spec = window.__CONFIG_SPEC__ ?? null;
  const initialState = window.__CONFIG_STATE__ ?? {};
  const csrfToken = window.__CSRF_TOKEN__ ?? '';

  const [state, setState] = useState<Record<string, unknown>>(initialState);

  const stateRef = useRef<StateModel>(state);
  stateRef.current = state;

  const setStateRef = useRef<SetState>((updater) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  });

  const appRegistry = useMemo(
    () =>
      createAppRegistry({
        csrfToken,
        onSaved: () => {
          // SaveBar handles its own success overlay.
        },
        onReset: (freshState) => {
          setState(freshState);
          stateRef.current = freshState;
        },
      }),
    [csrfToken],
  );

  const actionHandlers = useMemo(
    () =>
      buildHandlers(
        appRegistry,
        () => setStateRef.current,
        () => stateRef.current,
      ),
    [appRegistry],
  );

  const handleStateChange = useCallback(
    (changes: Array<{ path: string; value: unknown }>) => {
      setState((prev) => {
        const next = { ...prev };

        for (const { path, value } of changes) {
          const key = path.replace(/^\//, '').split('/')[0];
          if (key) {
            next[key] = value;
          }
        }

        stateRef.current = next;
        return next;
      });
    },
    [],
  );

  if (!spec) {
    return (
      <div className="w-full max-w-[560px] mx-auto py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-danger"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mb-2 text-lg font-semibold text-text-primary">
          Configuration Error
        </h1>
        <p className="text-sm text-text-muted">
          No configuration spec was provided. This page should be opened by a
          plugin setup script.
        </p>
      </div>
    );
  }

  const configCtx = useMemo(
    () => ({
      save: async () => {
        await saveConfig(stateRef.current as Record<string, unknown>, csrfToken);
      },
      reset: () => {
        const freshState = structuredClone(initialState);
        setState(freshState);
        stateRef.current = freshState;
      },
      getState: () => stateRef.current as Record<string, unknown>,
    }),
    [csrfToken, initialState],
  );

  return (
    <I18nProvider>
      <ConfigContext.Provider value={configCtx}>
        <StateProvider
          initialState={initialState}
          onStateChange={handleStateChange}
        >
          <VisibilityProvider>
            <ActionProvider handlers={actionHandlers}>
              <Renderer spec={spec} registry={appRegistry.registry} />
            </ActionProvider>
          </VisibilityProvider>
        </StateProvider>
      </ConfigContext.Provider>
    </I18nProvider>
  );
}
