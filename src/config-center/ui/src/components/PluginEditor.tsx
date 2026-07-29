import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@shared/i18n';

interface KVEntry {
  key: string;
  value: string;
}

/**
 * Convert an arbitrary config value to a string for editing.
 * Strings are returned as-is; everything else is JSON-stringified.
 */
function valueToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  try { return JSON.stringify(value); } catch { return String(value); }
}

/**
 * Convert an edited string back to a value for saving.
 * Tries JSON.parse first (handles numbers, booleans, objects, arrays);
 * falls back to the raw string.
 */
function stringToValue(str: string): unknown {
  if (str === '') return '';
  try { return JSON.parse(str); } catch { return str; }
}

interface PluginEditorProps {
  csrfToken: string;
  initialPlugin: string | null;
}

/**
 * Generic key/value editor for plugins without a schema.
 * The human picks a plugin from a dropdown and edits its key/value pairs.
 * Saving POSTs to /api/config/<plugin> and closes the server.
 */
export function PluginEditor({ csrfToken, initialPlugin }: PluginEditorProps) {
  const { t } = useI18n();
  const [plugins, setPlugins] = useState<string[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>(initialPlugin ?? '');
  const [entries, setEntries] = useState<KVEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the plugin list on mount.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/plugins')
      .then((res) => res.json())
      .then((names: string[]) => {
        if (cancelled) return;
        setPlugins(names);
        // Auto-select the initial plugin if it's in the list; otherwise the
        // first plugin.
        if (!selectedPlugin && names.length > 0) {
          setSelectedPlugin(initialPlugin ?? names[0]);
        }
      })
      .catch(() => { /* server will log the error */ });
    return () => { cancelled = true; };
  }, [initialPlugin]);

  // Fetch config when the selected plugin changes.
  useEffect(() => {
    if (!selectedPlugin) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/config/${encodeURIComponent(selectedPlugin)}`)
      .then((res) => res.json())
      .then((config: Record<string, unknown>) => {
        setEntries(
          Object.entries(config).map(([key, value]) => ({
            key,
            value: valueToString(value),
          })),
        );
      })
      .catch(() => {
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [selectedPlugin]);

  const handleAddEntry = useCallback(() => {
    setEntries((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const handleRemoveEntry = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleChange = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPlugin) return;
    setSaving(true);
    setError(null);
    try {
      const configObj: Record<string, unknown> = {};
      for (const { key, value } of entries) {
        if (key) configObj[key] = stringToValue(value);
      }
      const res = await fetch(
        `/api/config/${encodeURIComponent(selectedPlugin)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(configObj),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`Save failed (${res.status}): ${text}`);
      }
      setSaved(true);
      // The server shuts down after a successful save; attempt to close the
      // tab (works only if the window was opened by a script).
      setTimeout(() => {
        try { window.close(); } catch { /* not opened by script */ }
      }, 2000);
    } catch (e) {
      setError((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [csrfToken, entries, selectedPlugin]);

  // Saved overlay
  if (saved) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: 'successPop 0.4s ease-out' }}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-dim">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-text-primary">{t('saved')}</p>
          <p className="text-[15px] text-text-muted">{t('savedHint')}</p>
        </div>
      </div>
    );
  }

  const inputClasses =
    'w-full rounded-md bg-bg border border-border px-3 py-2 text-[14px] text-text-primary ' +
    'placeholder:text-text-dim transition-colors ' +
    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent';

  return (
    <div className="w-[640px] max-w-full mx-auto" style={{ animation: 'fadeUp 0.4s ease-out' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-dim">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h1 className="text-[1.75rem] font-semibold text-text-primary leading-tight flex-1">
          Plugin Configuration
        </h1>
      </div>
      <p className="text-text-dim text-[13px] ml-12 mb-6">
        {t('reconfigureHint')}
      </p>

      {/* Plugin selector */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-[15px] font-medium text-text-primary">
          Plugin
        </label>
        <div className="relative">
          <select
            value={selectedPlugin}
            onChange={(e) => setSelectedPlugin(e.target.value)}
            className={`${inputClasses} appearance-none pr-8`}
          >
            {!selectedPlugin && (
              <option value="" disabled>Select a plugin…</option>
            )}
            {plugins.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Key/Value editor */}
      {loading ? (
        <div className="text-center py-12 text-text-muted text-[15px]">Loading…</div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.length === 0 && !loading && (
            <p className="text-text-dim text-[14px] text-center py-8">
              No configuration keys. Click "Add Key" to create one.
            </p>
          )}
          {entries.map((entry, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="text"
                value={entry.key}
                placeholder="KEY"
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                className={`${inputClasses} font-mono flex-shrink-0 w-[180px]`}
              />
              <input
                type="text"
                value={entry.value}
                placeholder="value"
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                className={`${inputClasses} font-mono flex-1`}
              />
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="p-2 rounded-md hover:bg-danger/10 text-text-dim hover:text-danger transition-colors flex-shrink-0"
                title={`${t('remove')}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add key button */}
          <button
            type="button"
            onClick={handleAddEntry}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md
                       bg-accent-dim text-accent hover:bg-accent/20 transition-colors self-start"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Key
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 text-center p-3 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
        <div className="w-[640px] max-w-full mx-auto flex items-center justify-end gap-3 px-5 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedPlugin}
            className="px-5 py-2 text-[15px] font-semibold rounded-md bg-accent text-black
                       hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
