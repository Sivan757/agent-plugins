import { useState, useCallback } from 'react';
import type { BaseComponentProps } from '@json-render/react';
import { useConfig } from '../ConfigContext';
import { useI18n } from '../i18n';

interface SaveBarProps {
  saveLabel: string | null;
  resetLabel: string | null;
}

export function SaveBar({ props }: BaseComponentProps<SaveBarProps>) {
  const { save, reset } = useConfig();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await save();
      setSaved(true);
      setTimeout(() => {
        try { window.close(); } catch { /* not opened by script */ }
      }, 2000);
    } catch (e) {
      setError((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [save]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="w-[640px] max-w-full mx-auto flex items-center justify-end gap-3 px-5 py-3">
        <button type="button" onClick={handleReset} disabled={saving}
          className="px-4 py-2 text-[15px] font-medium rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {props.resetLabel ?? t('reset')}
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="px-5 py-2 text-[15px] font-semibold rounded-md bg-accent text-black hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {saving ? t('saving') : props.saveLabel ?? t('save')}
        </button>
      </div>
      {error && (
        <div className="w-[640px] max-w-full mx-auto px-5 pb-3">
          <div className="text-center p-3 rounded-md bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
