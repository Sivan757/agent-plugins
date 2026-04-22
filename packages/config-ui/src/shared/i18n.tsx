import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

// ── Supported locales ───────────────────────────────────────────────────────

export type Locale = 'en' | 'zh';

/** A string that may be localized: plain string or { en, zh } map */
export type LocalizedString = string | Partial<Record<Locale, string>>;

// ── Built-in UI chrome translations ─────────────────────────────────────────

const chrome: Record<Locale, Record<string, string>> = {
  en: {
    save: 'Save Configuration',
    saving: 'Saving...',
    reset: 'Reset',
    saved: 'Configuration Saved',
    savedHint: 'This window will close automatically...',
    reconfigureHint: 'To reconfigure later, ask your AI assistant to open this settings page.',
    add: 'Add',
    remove: 'Remove',
    configError: 'Configuration Error',
    configErrorHint: 'No configuration spec was provided. This page should be opened by a plugin setup script.',
  },
  zh: {
    save: '保存配置',
    saving: '保存中...',
    reset: '重置',
    saved: '配置已保存',
    savedHint: '窗口将自动关闭...',
    reconfigureHint: '如需修改配置，请让 AI 助手重新打开此设置页面。',
    add: '添加',
    remove: '删除',
    configError: '配置错误',
    configErrorHint: '未提供配置规范。此页面应由插件启动脚本打开。',
  },
};

// ── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  toggle: () => void;
  /** Resolve a chrome key like "save" */
  t: (key: string) => string;
  /** Resolve a localized string prop from plugin spec */
  ts: (value: LocalizedString | null | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  const nav = navigator.language || 'en';
  return nav.startsWith('zh') ? 'zh' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'zh' : 'en'));
  }, []);

  const t = useCallback(
    (key: string): string => chrome[locale]?.[key] ?? chrome.en[key] ?? key,
    [locale],
  );

  const ts = useCallback(
    (value: LocalizedString | null | undefined): string => {
      if (value == null) return '';
      if (typeof value === 'string') return value;
      return value[locale] ?? value.en ?? Object.values(value)[0] ?? '';
    },
    [locale],
  );

  const ctx = useMemo(() => ({ locale, toggle, t, ts }), [locale, toggle, t, ts]);

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
