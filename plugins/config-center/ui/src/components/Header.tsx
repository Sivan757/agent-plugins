import type { BaseComponentProps } from '@json-render/react';
import { useI18n, type LocalizedString } from '@shared/i18n';

interface HeaderProps {
  title: LocalizedString;
  description: LocalizedString | null;
  configPath: string | null;
}

export function Header({ props, children }: BaseComponentProps<HeaderProps>) {
  const { ts, t, locale, toggle } = useI18n();

  return (
    <div
      className="w-[640px] max-w-full mx-auto"
      style={{ animation: 'fadeUp 0.4s ease-out' }}
    >
      {/* Icon + Title + Language toggle */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-dim">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-[1.75rem] font-semibold text-text-primary leading-tight flex-1">
          {ts(props.title)}
        </h1>
        <button
          type="button"
          onClick={toggle}
          className="px-2.5 py-1 text-xs font-medium rounded-md border border-border
                     text-text-muted hover:text-text-primary hover:bg-surface-hover
                     transition-colors"
          title={locale === 'en' ? '切换到中文' : 'Switch to English'}
        >
          {locale === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      {/* Description */}
      {props.description && (
        <p className="text-text-muted text-[15px] mb-1 ml-12">
          {ts(props.description)}
        </p>
      )}

      {/* Config path */}
      {props.configPath && (
        <p className="text-text-dim text-xs font-mono ml-12 mb-1">
          {props.configPath}
        </p>
      )}

      {/* Hint */}
      <p className="text-text-dim text-[13px] ml-12 mb-6">
        {t('reconfigureHint')}
      </p>

      {/* Children */}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
