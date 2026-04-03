import { useState, useCallback, useMemo } from 'react';
import { useStateStore } from '@json-render/react';
import type { BaseComponentProps } from '@json-render/react';
import { Field } from './Field';
import { useI18n, type LocalizedString } from '../i18n';

interface CollectionProps {
  title: LocalizedString;
  itemLabel: LocalizedString;
  statePath: string;
  nameEditable: boolean | null;
}

interface FieldDef {
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
  statePath: string;
  required: boolean | null;
  help: string | null;
  placeholder: string | null;
  options: string[] | null;
}

/**
 * Resolve the Collection's children field definitions from the global spec.
 * Walks the spec's elements to find this Collection's children,
 * then extracts their Field props.
 */
function resolveChildFields(statePath: string): FieldDef[] {
  const spec = window.__CONFIG_SPEC__;
  if (!spec?.elements) return [];

  const elements = spec.elements as Record<string, {
    type?: string;
    props?: Record<string, unknown>;
    children?: string[];
  }>;

  // Find the Collection element that matches this statePath
  let childKeys: string[] = [];
  for (const el of Object.values(elements)) {
    if (el.type === 'Collection' && el.props?.statePath === statePath) {
      childKeys = el.children ?? [];
      break;
    }
  }

  // Resolve each child as a Field definition
  const fields: FieldDef[] = [];
  for (const key of childKeys) {
    const el = elements[key];
    if (el?.type === 'Field' && el.props) {
      fields.push(el.props as unknown as FieldDef);
    }
  }
  return fields;
}

export function Collection({ props }: BaseComponentProps<CollectionProps>) {
  const { ts, t } = useI18n();
  const { get, set } = useStateStore();
  const items = (get(props.statePath) as Record<string, unknown>[] | undefined) ?? [];
  const [openIndex, setOpenIndex] = useState(0);

  const title = ts(props.title);
  const itemLabel = ts(props.itemLabel);

  const childFields = useMemo(
    () => resolveChildFields(props.statePath),
    [props.statePath],
  );

  const addItem = useCallback(() => {
    const newItem: Record<string, unknown> = {
      _name: `${itemLabel} ${items.length + 1}`,
    };
    for (const f of childFields) {
      newItem[f.statePath] = f.type === 'checkbox' ? 'false' : '';
    }
    const newItems = [...items, newItem];
    set(props.statePath, newItems);
    setOpenIndex(newItems.length - 1);
  }, [items, props.statePath, itemLabel, childFields, set]);

  const removeItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      set(props.statePath, newItems);
      if (openIndex >= newItems.length) {
        setOpenIndex(Math.max(0, newItems.length - 1));
      }
    },
    [items, props.statePath, openIndex, set],
  );

  const renameItem = useCallback(
    (index: number, name: string) => {
      const newItems = items.map((item, i) =>
        i === index ? { ...item, _name: name } : item,
      );
      set(props.statePath, newItems);
    },
    [items, props.statePath, set],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Title + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          {title}
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                     bg-accent-dim text-accent hover:bg-accent/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('add')} {itemLabel}
        </button>
      </div>

      {/* Items */}
      {items.map((item, index) => {
        const name = (item as Record<string, unknown>)._name ?? `${itemLabel} ${index + 1}`;
        const isOpen = openIndex === index;

        return (
          <div key={index} className="rounded-lg border border-border bg-surface overflow-hidden">
            {/* Item header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-text-dim transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {props.nameEditable ? (
                  <input
                    type="text"
                    value={name as string}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => renameItem(index, e.target.value)}
                    className="bg-transparent text-[15px] font-medium text-text-primary
                               border-b border-transparent hover:border-border
                               focus:border-accent focus:outline-none px-0 py-0"
                  />
                ) : (
                  <span className="text-[15px] font-medium text-text-primary">{name as string}</span>
                )}
              </button>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 rounded hover:bg-danger/10 text-text-dim hover:text-danger transition-colors"
                  title={`${t('remove')} ${itemLabel}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>

            {/* Item fields */}
            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border pt-4">
                {childFields.map((fieldDef) => {
                  // Build absolute state path: /connections/0/host
                  const absolutePath = `${props.statePath}/${index}/${fieldDef.statePath}`;
                  return (
                    <Field
                      key={fieldDef.statePath}
                      props={{ ...fieldDef, statePath: absolutePath }}
                      children={null}
                      emit={() => {}}
                      on={() => ({ emit: () => {}, shouldPreventDefault: false, bound: false })}
                      bindings={{}}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
