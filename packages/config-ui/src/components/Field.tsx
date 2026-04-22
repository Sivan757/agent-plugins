import { useState, useCallback, useId } from 'react';
import { useStateStore } from '@json-render/react';
import type { BaseComponentProps } from '@json-render/react';
import { useI18n, type LocalizedString } from '@shared/i18n';

interface FieldProps {
  label: LocalizedString;
  type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
  statePath: string;
  required: boolean | null;
  help: LocalizedString | null;
  placeholder: LocalizedString | null;
  options: string[] | null;
}

export function Field({ props }: BaseComponentProps<FieldProps>) {
  const id = useId();
  const { ts } = useI18n();
  const { get, set } = useStateStore();
  const value = get(props.statePath);
  const [showPassword, setShowPassword] = useState(false);

  const label = ts(props.label);
  const help = ts(props.help);
  const placeholder = ts(props.placeholder);

  const onChange = useCallback(
    (val: unknown) => {
      set(props.statePath, val);
    },
    [props.statePath, set],
  );

  const inputClasses =
    'w-full rounded-md bg-bg border border-border px-3.5 py-2.5 text-[15px] text-text-primary ' +
    'placeholder:text-text-dim transition-colors ' +
    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent';

  // Checkbox layout is different
  if (props.type === 'checkbox') {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2.5 cursor-pointer group" htmlFor={id}>
          <div className="relative flex items-center justify-center">
            <input
              id={id}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="peer sr-only"
            />
            <div
              className="w-4 h-4 rounded border border-border bg-bg
                         peer-checked:bg-accent peer-checked:border-accent
                         peer-focus-visible:ring-2 peer-focus-visible:ring-accent
                         transition-colors flex items-center justify-center"
            >
              {!!value && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[15px] text-text-primary group-hover:text-text-primary/80">
            {label}
          </span>
          {props.required && <span className="text-danger text-xs">*</span>}
        </label>
        {props.help && (
          <p className="text-[13px] text-text-dim ml-6.5">{help}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label htmlFor={id} className="text-[15px] font-medium text-text-primary">
        {label}
        {props.required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {/* Input */}
      {props.type === 'text' && (
        <input
          id={id}
          type="text"
          value={(value as string) ?? ''}
          placeholder={placeholder || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      )}

      {props.type === 'number' && (
        <input
          id={id}
          type="number"
          value={(value as number) ?? ''}
          placeholder={placeholder || undefined}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          className={inputClasses}
        />
      )}

      {props.type === 'password' && (
        <div className="relative">
          <input
            id={id}
            type={showPassword ? 'text' : 'password'}
            value={(value as string) ?? ''}
            placeholder={placeholder || undefined}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClasses} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5
                       text-text-dim hover:text-text-muted transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye-off icon
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      )}

      {props.type === 'select' && (
        <div className="relative">
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClasses} appearance-none pr-8`}
          >
            {props.placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {(props.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}

      {props.type === 'textarea' && (
        <textarea
          id={id}
          value={(value as string) ?? ''}
          placeholder={placeholder || undefined}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`${inputClasses} resize-y min-h-[80px]`}
        />
      )}

      {/* Help text */}
      {props.help && (
        <p className="text-[13px] text-text-dim">{help}</p>
      )}
    </div>
  );
}
