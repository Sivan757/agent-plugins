import { useState } from 'react';
import type { BaseComponentProps } from '@json-render/react';
import { useI18n, type LocalizedString } from '@shared/i18n';

interface SectionProps {
  title: LocalizedString;
  description: LocalizedString | null;
  collapsible: boolean | null;
  defaultOpen: boolean | null;
}

export function Section({ props, children }: BaseComponentProps<SectionProps>) {
  const { ts } = useI18n();
  const isCollapsible = props.collapsible ?? false;
  const [open, setOpen] = useState(props.defaultOpen ?? true);

  return (
    <div
      className="rounded-lg border border-border bg-surface overflow-hidden"
      style={{ animation: 'fadeUp 0.35s ease-out' }}
    >
      {/* Header */}
      <button
        type="button"
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${
          isCollapsible ? 'cursor-pointer hover:bg-surface-hover' : 'cursor-default'
        } transition-colors`}
        onClick={() => isCollapsible && setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          <h2 className="text-[15px] font-semibold text-text-primary">
            {ts(props.title)}
          </h2>
          {props.description && (
            <p className="text-[13px] text-text-muted mt-0.5">
              {ts(props.description)}
            </p>
          )}
        </div>
        {isCollapsible && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-text-dim transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
