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
import { PluginEditor } from '@components/PluginEditor';

declare global {
  interface Window {
    __CONFIG_SPEC__: Spec | null;
    __CONFIG_STATE__: Record<string, unknown>;
    __CSRF_TOKEN__: string;
    __PLUGIN_NAME__: string | null;
  }
}

type Tab = 'schema' | 'editor';

export function App() {
  const spec = window.__CONFIG_SPEC__ ?? null;
  const initialState = window.__CONFIG_STATE__ ?? {};
  const csrfToken = window.__CSRF_TOKEN__ ?? '';
  const pluginName = window.__PLUGIN_NAME__ ?? null;

  // Default to the schema tab when a spec is injected; otherwise show the
  // generic plugin editor.
  const [activeTab, setActiveTab] = useState<Tab>(spec ? 'schema' : 'editor');

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

  // Render the tab bar only when both views are available (i.e. a spec exists).
  const showTabs = spec !== null;

  return (
    <I18nProvider>
      {showTabs && (
        <div className="w-[640px] max-w-full mx-auto flex gap-1 mb-4">
          <TabButton
            active={activeTab === 'schema'}
            onClick={() => setActiveTab('schema')}
          >
            Schema Form
          </TabButton>
          <TabButton
            active={activeTab === 'editor'}
            onClick={() => setActiveTab('editor')}
          >
            Plugin Editor
          </TabButton>
        </div>
      )}

      {activeTab === 'editor' ? (
        <PluginEditor csrfToken={csrfToken} initialPlugin={pluginName} />
      ) : spec ? (
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
      ) : (
        <PluginEditor csrfToken={csrfToken} initialPlugin={pluginName} />
      )}
    </I18nProvider>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-[14px] font-medium rounded-md transition-colors ${
        active
          ? 'bg-accent-dim text-accent border border-accent/30'
          : 'text-text-muted hover:text-text-primary hover:bg-surface-hover border border-transparent'
      }`}
    >
      {children}
    </button>
  );
}
