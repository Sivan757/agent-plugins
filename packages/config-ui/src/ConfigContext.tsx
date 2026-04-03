import { createContext, useContext } from 'react';

interface ConfigContextValue {
  /** POST current state to /save, resolves on success, rejects on error */
  save: () => Promise<void>;
  /** Reset state to initial values from config file */
  reset: () => void;
  /** Get current state snapshot */
  getState: () => Record<string, unknown>;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigContext.Provider');
  return ctx;
}
