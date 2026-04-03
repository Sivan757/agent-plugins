# Config UI json-render Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the raw-HTML Config UI with a json-render + shadcn React app that supports sections, collapsible accordions, and dynamic collections (add/remove entries), while keeping existing config file formats unchanged.

**Architecture:** A pre-bundled React app (Vite single-file HTML) renders json-render specs with a custom catalog of form components. The existing HTTP server injects the spec + config state and handles `/save`. Plugin authors write json-render specs instead of flat field schemas.

**Tech Stack:** `@json-render/core`, `@json-render/react`, `@json-render/shadcn`, React 19, Vite, Tailwind CSS 4, Zod

---

## File Structure

### New: `packages/config-ui/` (React app + catalog)

| File | Responsibility |
|------|---------------|
| `packages/config-ui/package.json` | Dependencies: json-render, react, vite, tailwind |
| `packages/config-ui/vite.config.ts` | Build config: single HTML output with inlined JS/CSS |
| `packages/config-ui/index.html` | HTML entry point |
| `packages/config-ui/src/main.tsx` | React mount, reads injected `__CONFIG_SPEC__` and `__CONFIG_STATE__` |
| `packages/config-ui/src/catalog.ts` | defineCatalog with Header, Section, Collection, Field |
| `packages/config-ui/src/registry.tsx` | defineRegistry mapping catalog to shadcn + custom components |
| `packages/config-ui/src/components/Header.tsx` | Page header with title, description, config path, reconfigure hint |
| `packages/config-ui/src/components/Section.tsx` | Fixed field group with Accordion wrapper |
| `packages/config-ui/src/components/Collection.tsx` | Dynamic collection: accordion items + add/remove/rename buttons |
| `packages/config-ui/src/components/Field.tsx` | Renders Input/Select/Checkbox/Textarea/Switch based on `type` prop |
| `packages/config-ui/src/components/SaveBar.tsx` | Sticky bottom bar with Reset + Save buttons, status feedback |
| `packages/config-ui/src/actions.ts` | Action handlers: save (POST /save), reset, addItem, removeItem |
| `packages/config-ui/src/styles.css` | Tailwind base + dark theme tokens matching current design |
| `packages/config-ui/tailwind.config.ts` | Tailwind config with dark theme, CJK font stack |
| `packages/config-ui/tsconfig.json` | TypeScript config for React JSX |

### Modified: `packages/core/src/`

| File | Change |
|------|--------|
| `packages/core/src/config-ui.ts` | Rewrite `launchConfigUI` to accept spec + serve bundled HTML. Remove HTML template generation. Keep `requireConfigWithSetup` but change schema param to spec. Add state↔config conversion (object↔array for collections). |
| `packages/core/src/index.ts` | Update exports: remove `ConfigUISchema`, export new spec types |

### Modified: Plugin source files

| File | Change |
|------|--------|
| `ticktick/src/ticktick.ts` | Replace `TICKTICK_CONFIG_UI_SCHEMA` with json-render spec |
| `mysql/src/mysql.ts` | Replace `MYSQL_CONFIG_UI_SCHEMA` with json-render spec using Collection |
| `postgresql/src/postgresql.ts` | Replace `PG_CONFIG_UI_SCHEMA` with json-render spec using Collection |
| `aliyunlog/src/aliyunlog.ts` | Replace `ALIYUNLOG_CONFIG_UI_SCHEMA` with json-render spec (Section + Collection) |

### Modified: Build pipeline

| File | Change |
|------|--------|
| `package.json` | Add `packages/config-ui` to workspaces |
| `scripts/build-plugin.sh` | No change needed (esbuild bundles everything) |

### Removed

| File | Reason |
|------|--------|
| `scripts/config-ui.ts` | Standalone CLI version replaced by bundled React app |
| `scripts/dist/config-ui.mjs` | Built artifact of above |

---

## Task 1: Scaffold `packages/config-ui` with Vite + React + Tailwind

**Files:**
- Create: `packages/config-ui/package.json`
- Create: `packages/config-ui/vite.config.ts`
- Create: `packages/config-ui/tsconfig.json`
- Create: `packages/config-ui/index.html`
- Create: `packages/config-ui/src/main.tsx`
- Create: `packages/config-ui/src/styles.css`
- Create: `packages/config-ui/tailwind.config.ts`
- Modify: `package.json` (root — add workspace)

- [ ] **Step 1: Create `packages/config-ui/package.json`**

```json
{
  "name": "@apex/config-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@json-render/core": "latest",
    "@json-render/react": "latest",
    "@json-render/shadcn": "latest",
    "react": "^19",
    "react-dom": "^19",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "vite": "^6",
    "typescript": "^5.8",
    "vite-plugin-singlefile": "^2"
  }
}
```

- [ ] **Step 2: Create `packages/config-ui/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyDirOnBuild: true,
  },
});
```

- [ ] **Step 3: Create `packages/config-ui/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `packages/config-ui/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', '"PingFang SC"', '"Microsoft YaHei"', 'monospace'],
      },
      colors: {
        surface: { DEFAULT: '#161b22', hover: '#1c2230' },
        border: { DEFAULT: '#2a3140', focus: '#3fb950' },
        accent: { DEFAULT: '#3fb950', dim: 'rgba(63,185,80,0.15)' },
        danger: '#f85149',
        'text-primary': '#e6edf3',
        'text-muted': '#7d8590',
        'text-dim': '#484f58',
      },
    },
  },
} satisfies Config;
```

- [ ] **Step 5: Create `packages/config-ui/src/styles.css`**

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  background: #0e1117;
  color: #e6edf3;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 20px 80px;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 6: Create `packages/config-ui/index.html`**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Plugin Configuration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 7: Create minimal `packages/config-ui/src/main.tsx`**

```tsx
import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Server injects these as <script> tags before loading the app
declare global {
  interface Window {
    __CONFIG_SPEC__: Record<string, unknown>;
    __CONFIG_STATE__: Record<string, unknown>;
    __CONFIG_PATH__: string;
    __CSRF_TOKEN__: string;
  }
}

function App() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-text-primary mb-2">
        Config UI Loading...
      </h1>
      <p className="text-text-muted text-sm">
        Spec: {window.__CONFIG_SPEC__ ? 'injected' : 'missing'}
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 8: Add workspace to root `package.json`**

In `package.json`, add `"packages/config-ui"` to the `workspaces` array (it's already covered by `"packages/*"` glob — verify).

- [ ] **Step 9: Install dependencies and verify build**

Run:
```bash
cd /home/coder/workspace/aikero/apex-plugins && npm install
cd packages/config-ui && npx vite build
```
Expected: `dist/index.html` exists as a single self-contained HTML file.

- [ ] **Step 10: Commit**

```bash
git add packages/config-ui/
git commit -m "feat(config-ui): scaffold React app with Vite + Tailwind + json-render"
```

---

## Task 2: Define the Config UI Catalog

**Files:**
- Create: `packages/config-ui/src/catalog.ts`

- [ ] **Step 1: Create the catalog definition**

```typescript
import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

export const configCatalog = defineCatalog(schema, {
  components: {
    Header: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        configPath: z.string().nullable(),
      }),
      slots: ['default'],
      description: 'Page header with title, description, and config file path',
    },
    Section: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        collapsible: z.boolean().nullable(),
        defaultOpen: z.boolean().nullable(),
      }),
      slots: ['default'],
      description: 'Fixed field group with optional collapsible accordion',
    },
    Collection: {
      props: z.object({
        title: z.string(),
        itemLabel: z.string(),
        statePath: z.string(),
        nameEditable: z.boolean().nullable(),
      }),
      slots: ['default'],
      description: 'Dynamic collection with add/remove/rename. Children repeat per item.',
    },
    Field: {
      props: z.object({
        label: z.string(),
        type: z.enum(['text', 'password', 'select', 'number', 'textarea', 'checkbox']),
        required: z.boolean().nullable(),
        help: z.string().nullable(),
        placeholder: z.string().nullable(),
        options: z.array(z.string()).nullable(),
      }),
      description: 'Form input field. Bind value with $bindState or $bindItem.',
    },
    SaveBar: {
      props: z.object({
        saveLabel: z.string().nullable(),
        resetLabel: z.string().nullable(),
      }),
      description: 'Sticky bottom bar with Save and Reset buttons',
    },
  },
  actions: {
    save: {
      params: z.object({}),
      description: 'Write current form state to config file via POST /save',
    },
    reset: {
      params: z.object({}),
      description: 'Reload state from config file, discarding changes',
    },
    addItem: {
      params: z.object({ statePath: z.string() }),
      description: 'Append a new empty item to a collection',
    },
    removeItem: {
      params: z.object({ statePath: z.string(), index: z.number() }),
      description: 'Remove item at index from a collection',
    },
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd packages/config-ui && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/config-ui/src/catalog.ts
git commit -m "feat(config-ui): define json-render catalog with form components and actions"
```

---

## Task 3: Implement Custom Components (Header, Section, Collection, Field, SaveBar)

**Files:**
- Create: `packages/config-ui/src/components/Header.tsx`
- Create: `packages/config-ui/src/components/Section.tsx`
- Create: `packages/config-ui/src/components/Collection.tsx`
- Create: `packages/config-ui/src/components/Field.tsx`
- Create: `packages/config-ui/src/components/SaveBar.tsx`

- [ ] **Step 1: Create `Header.tsx`**

```tsx
import type { ComponentProps } from 'react';

interface HeaderProps {
  title: string;
  description?: string | null;
  configPath?: string | null;
  children?: React.ReactNode;
}

export function Header({ title, description, configPath, children }: HeaderProps) {
  return (
    <div className="w-full max-w-xl mx-auto animate-[fadeUp_0.5s_ease-out]">
      <div className="mb-9 pb-6 border-b border-border">
        <div className="w-9 h-9 rounded-[10px] bg-accent-dim border border-accent/25 flex items-center justify-center mb-4">
          <svg className="w-[18px] h-[18px] text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-text-primary mb-1.5">{title}</h1>
        {description && <p className="text-text-muted text-[0.9rem] leading-relaxed">{description}</p>}
        {configPath && (
          <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-surface border border-border rounded-md font-mono text-[0.72rem] text-text-dim break-all">
            <svg className="w-3 h-3 text-text-dim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" />
            </svg>
            {configPath}
          </div>
        )}
        <p className="text-text-dim text-xs mt-2">You can return to this page anytime to reconfigure.</p>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `Section.tsx`**

```tsx
import { useState } from 'react';

interface SectionProps {
  title: string;
  description?: string | null;
  collapsible?: boolean | null;
  defaultOpen?: boolean | null;
  children?: React.ReactNode;
}

export function Section({ title, description, collapsible, defaultOpen, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen !== false);

  if (!collapsible) {
    return (
      <div className="bg-surface border border-border rounded-lg p-7 mb-4">
        <h2 className="text-sm font-semibold text-text-primary mb-1">{title}</h2>
        {description && <p className="text-text-dim text-xs mb-4">{description}</p>}
        {children}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg mb-4 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-7 py-4 text-left hover:bg-surface-hover transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {description && <p className="text-text-dim text-xs mt-0.5">{description}</p>}
        </div>
        <svg className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      {open && <div className="px-7 pb-6">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Create `Field.tsx`**

```tsx
import { useState } from 'react';

interface FieldProps {
  label: string;
  type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
  required?: boolean | null;
  help?: string | null;
  placeholder?: string | null;
  options?: string[] | null;
  value?: unknown;
  onChange?: (value: unknown) => void;
  children?: React.ReactNode;
}

export function Field({ label, type, required, help, placeholder, options, value, onChange }: FieldProps) {
  const [showPw, setShowPw] = useState(false);
  const val = (value ?? '') as string;

  const inputClasses = 'w-full px-3 py-2.5 bg-[#0e1117] border border-border rounded-md text-text-primary font-mono text-[0.85rem] outline-none transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(63,185,80,0.15)] placeholder:text-text-dim placeholder:font-mono';

  if (type === 'checkbox') {
    return (
      <div className="mb-5 last:mb-0">
        <label className="flex items-center gap-2.5 cursor-pointer py-2.5">
          <input
            type="checkbox"
            checked={val === 'true' || val === true as unknown}
            onChange={(e) => onChange?.(e.target.checked ? 'true' : 'false')}
            className="w-[18px] h-[18px] accent-accent cursor-pointer"
          />
          <span className="text-[0.85rem] text-text-primary select-none">{label}</span>
        </label>
        {help && <span className="block text-[0.75rem] text-text-dim mt-1.5 leading-snug">{help}</span>}
      </div>
    );
  }

  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-[0.85rem] font-medium text-text-primary mb-2">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {type === 'select' ? (
        <select className={inputClasses + ' appearance-none cursor-pointer pr-8'} value={val} onChange={(e) => onChange?.(e.target.value)}>
          {(options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className={inputClasses + ' resize-y min-h-[72px] leading-relaxed'} value={val} placeholder={placeholder ?? ''} onChange={(e) => onChange?.(e.target.value)} rows={3} />
      ) : type === 'password' ? (
        <div className="relative">
          <input className={inputClasses + ' pr-10'} type={showPw ? 'text' : 'password'} value={val} placeholder={placeholder ?? ''} onChange={(e) => onChange?.(e.target.value)} autoComplete="off" />
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-dim hover:text-text-muted transition-colors" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      ) : (
        <input className={inputClasses} type={type} value={val} placeholder={placeholder ?? ''} onChange={(e) => onChange?.(e.target.value)} autoComplete="off" />
      )}

      {help && <span className="block text-[0.75rem] text-text-dim mt-1.5 leading-snug">{help}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Create `Collection.tsx`**

```tsx
import { useState } from 'react';

interface CollectionItem {
  _name: string;
  [key: string]: unknown;
}

interface CollectionProps {
  title: string;
  itemLabel: string;
  statePath: string;
  nameEditable?: boolean | null;
  items?: CollectionItem[];
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  onRenameItem?: (index: number, name: string) => void;
  children?: React.ReactNode | ((item: CollectionItem, index: number) => React.ReactNode);
}

export function Collection({ title, itemLabel, nameEditable, items = [], onAddItem, onRemoveItem, onRenameItem, children }: CollectionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <button
          type="button"
          className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
          onClick={onAddItem}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add {itemLabel}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={item._name + i} className="bg-surface border border-border rounded-lg mb-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <button type="button" className="flex items-center gap-2 text-left flex-1" onClick={() => toggle(i)}>
              <svg className={`w-3.5 h-3.5 text-text-muted transition-transform ${openIndices.has(i) ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l4 4 4-4" />
              </svg>
              {nameEditable ? (
                <input
                  className="bg-transparent border-none text-sm font-medium text-text-primary outline-none focus:text-accent w-40"
                  value={item._name}
                  onChange={(e) => onRenameItem?.(i, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm font-medium text-text-primary">{item._name}</span>
              )}
            </button>
            {items.length > 1 && (
              <button
                type="button"
                className="text-text-dim hover:text-danger transition-colors p-1"
                onClick={() => onRemoveItem?.(i)}
                title={`Remove ${itemLabel}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            )}
          </div>
          {openIndices.has(i) && (
            <div className="px-5 pb-5 border-t border-border pt-4">
              {typeof children === 'function' ? children(item, i) : children}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `SaveBar.tsx`**

```tsx
import { useState } from 'react';

interface SaveBarProps {
  saveLabel?: string | null;
  resetLabel?: string | null;
  onSave?: () => Promise<void>;
  onReset?: () => void;
}

export function SaveBar({ saveLabel, resetLabel, onSave, onReset }: SaveBarProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave?.();
      setSuccess(true);
      setTimeout(() => window.close(), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-[#0e1117]/92 flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center animate-[successPop_0.4s_ease-out]">
          <div className="w-14 h-14 rounded-full bg-accent-dim border-2 border-accent flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Configuration Saved</h2>
          <p className="text-text-muted text-[0.85rem]">You can close this tab and return to your session.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 mt-7 pt-6 border-t border-border">
        <button type="button" className="flex-1 py-2.5 px-5 rounded-md bg-surface border border-border text-text-muted text-[0.85rem] font-medium cursor-pointer hover:bg-surface-hover hover:text-text-primary transition-all" onClick={onReset}>
          {resetLabel ?? 'Reset'}
        </button>
        <button type="button" className="flex-1 py-2.5 px-5 rounded-md bg-accent border-accent text-[#0e1117] text-[0.85rem] font-semibold cursor-pointer hover:bg-[#46c358] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : (saveLabel ?? 'Save Configuration')}
        </button>
      </div>
      {error && (
        <div className="text-center p-4 mt-4 rounded-md bg-danger/10 border border-danger/30 text-danger text-[0.85rem]">
          {error}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 6: Verify all components compile**

Run:
```bash
cd packages/config-ui && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/config-ui/src/components/
git commit -m "feat(config-ui): implement Header, Section, Collection, Field, SaveBar components"
```

---

## Task 4: Create the Registry and App Shell

**Files:**
- Create: `packages/config-ui/src/registry.tsx`
- Create: `packages/config-ui/src/actions.ts`
- Modify: `packages/config-ui/src/main.tsx`

- [ ] **Step 1: Create `actions.ts`**

```typescript
export async function saveConfig(state: Record<string, unknown>, csrfToken: string): Promise<void> {
  const resp = await fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(state),
  });
  const result = await resp.json();
  if (!result.ok) {
    throw new Error(result.error || 'Failed to save');
  }
}

export async function loadConfig(): Promise<Record<string, unknown>> {
  const resp = await fetch('/config');
  return resp.json();
}
```

- [ ] **Step 2: Create `registry.tsx`**

```tsx
import { defineRegistry } from '@json-render/react';
import { configCatalog } from './catalog';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { Collection } from './components/Collection';
import { Field } from './components/Field';
import { SaveBar } from './components/SaveBar';

export function createConfigRegistry(
  getState: () => Record<string, unknown>,
  setState: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
  onSave: () => Promise<void>,
  onReset: () => void,
) {
  return defineRegistry(configCatalog, {
    components: {
      Header: ({ props, children }) => (
        <Header title={props.title} description={props.description} configPath={props.configPath}>
          {children}
        </Header>
      ),
      Section: ({ props, children }) => (
        <Section title={props.title} description={props.description} collapsible={props.collapsible} defaultOpen={props.defaultOpen}>
          {children}
        </Section>
      ),
      Collection: ({ props, children }) => {
        const state = getState();
        const pathParts = props.statePath.split('/').filter(Boolean);
        let items = state as unknown;
        for (const p of pathParts) items = (items as Record<string, unknown>)?.[p];
        const arr = (items as Array<Record<string, unknown>>) ?? [];

        return (
          <Collection
            title={props.title}
            itemLabel={props.itemLabel}
            statePath={props.statePath}
            nameEditable={props.nameEditable}
            items={arr as Array<{ _name: string; [k: string]: unknown }>}
            onAddItem={() => {
              setState((prev) => {
                const copy = structuredClone(prev);
                let target = copy as unknown;
                for (const p of pathParts.slice(0, -1)) target = (target as Record<string, unknown>)[p];
                const arrRef = (target as Record<string, unknown>)[pathParts[pathParts.length - 1]] as Array<Record<string, unknown>>;
                arrRef.push({ _name: `new-${arrRef.length + 1}` });
                return copy;
              });
            }}
            onRemoveItem={(index) => {
              setState((prev) => {
                const copy = structuredClone(prev);
                let target = copy as unknown;
                for (const p of pathParts.slice(0, -1)) target = (target as Record<string, unknown>)[p];
                const arrRef = (target as Record<string, unknown>)[pathParts[pathParts.length - 1]] as unknown[];
                arrRef.splice(index, 1);
                return copy;
              });
            }}
            onRenameItem={(index, name) => {
              setState((prev) => {
                const copy = structuredClone(prev);
                let target = copy as unknown;
                for (const p of pathParts.slice(0, -1)) target = (target as Record<string, unknown>)[p];
                const arrRef = (target as Record<string, unknown>)[pathParts[pathParts.length - 1]] as Array<Record<string, unknown>>;
                arrRef[index]._name = name;
                return copy;
              });
            }}
          >
            {(item, index) => {
              // Render children with item context
              return typeof children === 'function' ? children(item, index) : children;
            }}
          </Collection>
        );
      },
      Field: ({ props }) => (
        <Field
          label={props.label}
          type={props.type}
          required={props.required}
          help={props.help}
          placeholder={props.placeholder}
          options={props.options}
          value={props.value}
          onChange={(v) => props.onChange?.(v)}
        />
      ),
      SaveBar: ({ props }) => (
        <SaveBar saveLabel={props.saveLabel} resetLabel={props.resetLabel} onSave={onSave} onReset={onReset} />
      ),
    },
    actions: {
      save: async (_params, _setState) => {
        await onSave();
      },
      reset: async (_params, _setState) => {
        onReset();
      },
      addItem: async (params, setRendererState) => {
        const path = params.statePath as string;
        setRendererState((prev: Record<string, unknown>) => {
          const copy = structuredClone(prev);
          const pathParts = path.split('/').filter(Boolean);
          let target = copy as unknown;
          for (const p of pathParts.slice(0, -1)) target = (target as Record<string, unknown>)[p];
          const arrRef = (target as Record<string, unknown>)[pathParts[pathParts.length - 1]] as unknown[];
          arrRef.push({ _name: `new-${arrRef.length + 1}` });
          return copy;
        });
      },
      removeItem: async (params, setRendererState) => {
        const path = params.statePath as string;
        const index = params.index as number;
        setRendererState((prev: Record<string, unknown>) => {
          const copy = structuredClone(prev);
          const pathParts = path.split('/').filter(Boolean);
          let target = copy as unknown;
          for (const p of pathParts.slice(0, -1)) target = (target as Record<string, unknown>)[p];
          const arrRef = (target as Record<string, unknown>)[pathParts[pathParts.length - 1]] as unknown[];
          arrRef.splice(index, 1);
          return copy;
        });
      },
    },
  });
}
```

Note: The registry above is a conceptual starting point. The exact API of `defineRegistry` may differ — consult json-render docs during implementation via `context7` MCP. The key pattern is: map catalog component names to React components, and catalog action names to handler functions.

- [ ] **Step 3: Update `main.tsx` to wire everything together**

```tsx
import './styles.css';
import { StrictMode, useState, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Renderer, StateProvider, VisibilityProvider } from '@json-render/react';
import { createConfigRegistry } from './registry';
import { saveConfig as postSave } from './actions';

declare global {
  interface Window {
    __CONFIG_SPEC__: Record<string, unknown>;
    __CONFIG_STATE__: Record<string, unknown>;
    __CONFIG_PATH__: string;
    __CSRF_TOKEN__: string;
  }
}

function App() {
  const spec = window.__CONFIG_SPEC__;
  const initialState = window.__CONFIG_STATE__;
  const csrfToken = window.__CSRF_TOKEN__;

  const [state, setState] = useState<Record<string, unknown>>(initialState);

  const handleSave = useCallback(async () => {
    await postSave(state, csrfToken);
  }, [state, csrfToken]);

  const handleReset = useCallback(() => {
    setState(structuredClone(initialState));
  }, [initialState]);

  const registry = useMemo(
    () => createConfigRegistry(() => state, setState, handleSave, handleReset),
    [state, handleSave, handleReset],
  );

  if (!spec) {
    return <div className="text-danger text-center mt-20">No config spec provided.</div>;
  }

  return (
    <StateProvider initialState={state}>
      <VisibilityProvider>
        <Renderer spec={spec} registry={registry} />
      </VisibilityProvider>
    </StateProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Note: The exact Renderer API may differ. During implementation, use `context7` MCP to fetch the current `@json-render/react` documentation for `Renderer`, `StateProvider`, and `VisibilityProvider` imports and props.

- [ ] **Step 4: Build and verify the app compiles**

Run:
```bash
cd packages/config-ui && npx vite build
```
Expected: `dist/index.html` produced.

- [ ] **Step 5: Commit**

```bash
git add packages/config-ui/src/
git commit -m "feat(config-ui): create registry, actions, and wire App shell"
```

---

## Task 5: Rewrite `@apex/core` config-ui Server

**Files:**
- Modify: `packages/core/src/config-ui.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Define new spec type and state conversion helpers**

In `packages/core/src/config-ui.ts`, replace the entire file:

```typescript
/**
 * config-ui.ts — Launches the bundled json-render Config UI app.
 *
 * Starts a local HTTP server, injects the plugin's json-render spec
 * and existing config as initial state, opens the browser.
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { configPath } from './config.js';
import { PluginError } from './errors.js';
import { requireConfig } from './config.js';

// ── Types ────────────────────────────────────────────────────────────────────

/** A json-render spec. Plugin authors define these directly. */
export interface ConfigSpec {
  root: string;
  elements: Record<string, unknown>;
  state?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Options for collections that need object↔array conversion */
export interface CollectionMapping {
  /** JSON pointer-style path in state, e.g. "/connections" */
  statePath: string;
  /** The key used for the object property name in array form */
  nameKey?: string; // default: "_name"
}

export interface ConfigUIOptions {
  spec: ConfigSpec;
  /** Collection paths that need object↔array conversion on load/save */
  collections?: CollectionMapping[];
  /** Optional validation — return true if config needs re-setup */
  validate?: (config: Record<string, unknown>) => boolean;
}

// ── State ↔ Config conversion ───────────────────────────────────────────────

function objectToArray(obj: Record<string, unknown>, nameKey: string): Array<Record<string, unknown>> {
  return Object.entries(obj).map(([key, val]) => ({
    [nameKey]: key,
    ...(val as Record<string, unknown>),
  }));
}

function arrayToObject(arr: Array<Record<string, unknown>>, nameKey: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const item of arr) {
    const name = String(item[nameKey] ?? `item-${Object.keys(result).length}`);
    const { [nameKey]: _, ...rest } = item;
    result[name] = rest;
  }
  return result;
}

function getNestedPath(obj: unknown, path: string): unknown {
  const parts = path.split('/').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setNestedPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('/').filter(Boolean);
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in cur) || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/** Convert config file (objects) → state (arrays) for collections */
export function configToState(
  config: Record<string, unknown>,
  collections: CollectionMapping[],
): Record<string, unknown> {
  const state = structuredClone(config);
  for (const col of collections) {
    const nameKey = col.nameKey ?? '_name';
    const obj = getNestedPath(state, col.statePath);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      setNestedPath(state, col.statePath, objectToArray(obj as Record<string, unknown>, nameKey));
    }
  }
  return state;
}

/** Convert state (arrays) → config file (objects) for collections */
export function stateToConfig(
  state: Record<string, unknown>,
  collections: CollectionMapping[],
): Record<string, unknown> {
  const config = structuredClone(state);
  for (const col of collections) {
    const nameKey = col.nameKey ?? '_name';
    const arr = getNestedPath(config, col.statePath);
    if (Array.isArray(arr)) {
      setNestedPath(config, col.statePath, arrayToObject(arr, nameKey));
    }
  }
  return config;
}

// ── Bundled HTML loader ─────────────────────────────────────────────────────

function loadBundledHTML(): string {
  // Look for the pre-built single-file HTML from @apex/config-ui
  const candidates = [
    join(dirname(new URL(import.meta.url).pathname), '..', '..', 'config-ui', 'dist', 'index.html'),
    join(dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'packages', 'config-ui', 'dist', 'index.html'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, 'utf-8');
  }
  throw new Error(`Config UI bundle not found. Run: cd packages/config-ui && npm run build`);
}

function injectState(
  html: string,
  spec: ConfigSpec,
  state: Record<string, unknown>,
  cfgPath: string,
  csrfToken: string,
): string {
  const injection = `<script>
window.__CONFIG_SPEC__=${JSON.stringify(spec)};
window.__CONFIG_STATE__=${JSON.stringify(state)};
window.__CONFIG_PATH__=${JSON.stringify(cfgPath)};
window.__CSRF_TOKEN__=${JSON.stringify(csrfToken)};
</script>`;
  return html.replace('</head>', `${injection}\n</head>`);
}

// ── Server ───────────────────────────────────────────────────────────────────

export function launchConfigUI(
  pluginName: string,
  options: ConfigUIOptions,
): Promise<boolean> {
  const cfgPath = configPath(pluginName);
  const collections = options.collections ?? [];

  return new Promise((resolve) => {
    const csrfToken = randomBytes(16).toString('hex');

    // Load existing config and convert to state
    let existing: Record<string, unknown> = {};
    if (existsSync(cfgPath)) {
      try {
        existing = JSON.parse(readFileSync(cfgPath, 'utf-8'));
      } catch { /* empty config */ }
    }
    const state = configToState(existing, collections);

    // Merge spec state defaults with existing
    const mergedState = { ...((options.spec.state ?? {}) as Record<string, unknown>) };
    deepMerge(mergedState, state);

    const bundledHTML = loadBundledHTML();
    const html = injectState(bundledHTML, options.spec, mergedState, cfgPath, csrfToken);

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      if (req.method === 'POST' && req.url === '/save') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const body = Buffer.concat(chunks).toString();

        try {
          const token = req.headers['x-csrf-token'];
          if (token !== csrfToken) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token' }));
            return;
          }

          const newState = JSON.parse(body) as Record<string, unknown>;
          const configData = stateToConfig(newState, collections);

          mkdirSync(dirname(cfgPath), { recursive: true });
          writeFileSync(cfgPath, JSON.stringify(configData, null, 2) + '\n');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));

          setTimeout(() => { server.close(); resolve(true); }, 500);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
        }
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      const url = `http://127.0.0.1:${addr.port}`;
      process.stderr.write(`[setup] Opening configuration form in browser...\n`);
      process.stderr.write(JSON.stringify({ url, port: addr.port }) + '\n');

      const cmd = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${cmd} "${url}"`, () => {});
    });

    setTimeout(() => { server.close(); resolve(false); }, 5 * 60 * 1000);
  });
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
}

// ── High-level config loader with auto-setup ─────────────────────────────────

export async function requireConfigWithSetup<T extends Record<string, unknown>>(
  pluginName: string,
  options: ConfigUIOptions,
): Promise<T> {
  let config: T;

  try {
    config = await requireConfig<T>(pluginName);
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      if (await launchConfigUI(pluginName, options)) {
        try {
          config = await requireConfig<T>(pluginName);
          if (!options.validate || !options.validate(config)) return config;
        } catch { /* fall through */ }
      }
      throw new PluginError(
        `No config found. Run: ${pluginName} setup (or init)`,
        'CONFIG_MISSING',
      );
    }
    throw e;
  }

  if (options.validate && options.validate(config)) {
    process.stderr.write(`[${pluginName}] Configuration is incomplete.\n`);
    if (await launchConfigUI(pluginName, options)) {
      try {
        const newConfig = await requireConfig<T>(pluginName);
        if (!options.validate(newConfig)) return newConfig;
      } catch { /* fall through */ }
    }
    throw new PluginError(
      `Invalid configuration. Run: ${pluginName} setup`,
      'CONFIG_INVALID',
    );
  }

  return config;
}
```

- [ ] **Step 2: Update `packages/core/src/index.ts`**

```typescript
export { configPath, loadConfig, saveConfig, requireConfig } from './config.js';
export { launchConfigUI, requireConfigWithSetup, configToState, stateToConfig } from './config-ui.js';
export type { ConfigSpec, ConfigUIOptions, CollectionMapping } from './config-ui.js';
export { PluginError } from './errors.js';
export type { PluginConfig, SchemaField, HookResult, CLIArgs } from './types.js';
```

- [ ] **Step 3: Build core and verify**

Run:
```bash
cd packages/core && npm run build
```
Expected: compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/config-ui.ts packages/core/src/index.ts
git commit -m "feat(core): rewrite config-ui server for json-render specs with collection support"
```

---

## Task 6: Rewrite Plugin Specs — TickTick

**Files:**
- Modify: `ticktick/src/ticktick.ts`

- [ ] **Step 1: Replace schema with json-render spec**

Find the `TICKTICK_CONFIG_UI_SCHEMA` constant and replace it with:

```typescript
import type { ConfigUIOptions } from '@apex/core';

const TICKTICK_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'TickTick', description: 'Enter your TickTick / Dida365 credentials', configPath: null },
        children: ['section'],
      },
      'section': {
        type: 'Section',
        props: { title: 'Credentials', description: null, collapsible: false, defaultOpen: true },
        children: ['host', 'username', 'password', 'save-bar'],
      },
      'host': {
        type: 'Field',
        props: {
          label: 'Host', type: 'select',
          options: ['ticktick.com', 'dida365.com'],
          required: true,
          help: 'Use dida365.com for China accounts',
          placeholder: null,
        },
      },
      'username': {
        type: 'Field',
        props: { label: 'Username / Email', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'password': {
        type: 'Field',
        props: { label: 'Password', type: 'password', required: true, help: null, placeholder: null, options: null },
      },
      'save-bar': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      host: 'ticktick.com',
      username: '',
      password: '',
    },
  },
  // No collections — flat config
};
```

- [ ] **Step 2: Update all `requireConfigWithSetup` calls**

Replace:
```typescript
requireConfigWithSetup<TickTickConfig>('ticktick', TICKTICK_CONFIG_UI_SCHEMA)
```
With:
```typescript
requireConfigWithSetup<TickTickConfig>('ticktick', TICKTICK_CONFIG_UI)
```

There are 3 call sites in ticktick.ts (line ~381, ~426, ~446). Update all of them.

- [ ] **Step 3: Remove old imports**

Remove `import type { ConfigUISchema } from '@apex/core';` and add `import type { ConfigUIOptions } from '@apex/core';` if not already.

- [ ] **Step 4: Build and verify**

Run:
```bash
cd ticktick && npm run build
```
Expected: compiles without errors.

- [ ] **Step 5: Commit**

```bash
git add ticktick/src/ticktick.ts
git commit -m "feat(ticktick): replace config schema with json-render spec"
```

---

## Task 7: Rewrite Plugin Specs — MySQL

**Files:**
- Modify: `mysql/src/mysql.ts`

- [ ] **Step 1: Replace schema with json-render spec**

Replace `MYSQL_CONFIG_UI_SCHEMA` with:

```typescript
import type { ConfigUIOptions } from '@apex/core';

const MYSQL_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'MySQL', description: 'Configure your database connections', configPath: null },
        children: ['connections', 'save-bar'],
      },
      'connections': {
        type: 'Collection',
        props: {
          title: 'Connections',
          itemLabel: 'Connection',
          statePath: '/connections',
          nameEditable: true,
        },
        children: ['conn-host', 'conn-port', 'conn-user', 'conn-pass', 'conn-db', 'conn-ssl'],
      },
      'conn-host': {
        type: 'Field',
        props: { label: 'Host', type: 'text', required: true, help: null, placeholder: '127.0.0.1', options: null },
      },
      'conn-port': {
        type: 'Field',
        props: { label: 'Port', type: 'number', required: false, help: null, placeholder: '3306', options: null },
      },
      'conn-user': {
        type: 'Field',
        props: { label: 'Username', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'conn-pass': {
        type: 'Field',
        props: { label: 'Password', type: 'password', required: true, help: null, placeholder: null, options: null },
      },
      'conn-db': {
        type: 'Field',
        props: { label: 'Database', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'conn-ssl': {
        type: 'Field',
        props: { label: 'Use SSL', type: 'checkbox', required: false, help: null, placeholder: null, options: null },
      },
      'save-bar': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      connections: [
        { _name: 'default', host: '127.0.0.1', port: '3306', user: '', password: '', database: '', ssl: 'false' },
      ],
    },
  },
  collections: [{ statePath: '/connections' }],
};
```

- [ ] **Step 2: Update `requireConfigWithSetup` call and imports**

Replace:
```typescript
requireConfigWithSetup<MySQLConfig>('mysql', MYSQL_CONFIG_UI_SCHEMA)
```
With:
```typescript
requireConfigWithSetup<MySQLConfig>('mysql', MYSQL_CONFIG_UI)
```

Update import from `ConfigUISchema` to `ConfigUIOptions`.

- [ ] **Step 3: Build and verify**

Run:
```bash
cd mysql && npm run build
```
Expected: compiles without errors.

- [ ] **Step 4: Test with existing config**

Run:
```bash
node mysql/dist/mysql.mjs default "SELECT 1" 2>&1
```
Expected: Query succeeds — existing `~/.cache/apex-plugin/mysql.json` is unchanged and still works.

- [ ] **Step 5: Commit**

```bash
git add mysql/src/mysql.ts
git commit -m "feat(mysql): replace config schema with json-render spec + collection support"
```

---

## Task 8: Rewrite Plugin Specs — PostgreSQL

**Files:**
- Modify: `postgresql/src/postgresql.ts`

- [ ] **Step 1: Replace schema with json-render spec**

Replace `PG_CONFIG_UI_SCHEMA` with:

```typescript
import type { ConfigUIOptions } from '@apex/core';

const PG_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'PostgreSQL', description: 'Configure your database connections', configPath: null },
        children: ['connections', 'save-bar'],
      },
      'connections': {
        type: 'Collection',
        props: {
          title: 'Connections',
          itemLabel: 'Connection',
          statePath: '/connections',
          nameEditable: true,
        },
        children: ['conn-host', 'conn-port', 'conn-user', 'conn-pass', 'conn-db', 'conn-ssl'],
      },
      'conn-host': {
        type: 'Field',
        props: { label: 'Host', type: 'text', required: true, help: null, placeholder: '127.0.0.1', options: null },
      },
      'conn-port': {
        type: 'Field',
        props: { label: 'Port', type: 'number', required: false, help: null, placeholder: '5432', options: null },
      },
      'conn-user': {
        type: 'Field',
        props: { label: 'Username', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'conn-pass': {
        type: 'Field',
        props: { label: 'Password', type: 'password', required: true, help: null, placeholder: null, options: null },
      },
      'conn-db': {
        type: 'Field',
        props: { label: 'Database', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'conn-ssl': {
        type: 'Field',
        props: { label: 'Use SSL', type: 'checkbox', required: false, help: 'Disable for local/VPN connections', placeholder: null, options: null },
      },
      'save-bar': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      connections: [
        { _name: 'default', host: '127.0.0.1', port: '5432', user: '', password: '', database: '', ssl: 'false' },
      ],
    },
  },
  collections: [{ statePath: '/connections' }],
};
```

- [ ] **Step 2: Update `requireConfigWithSetup` call and imports**

Same pattern as MySQL.

- [ ] **Step 3: Build and verify**

Run:
```bash
cd postgresql && npm run build
```

- [ ] **Step 4: Test with existing config**

Run:
```bash
node postgresql/dist/postgresql.mjs dev "SELECT 1" 2>&1
```
Expected: Query succeeds.

- [ ] **Step 5: Commit**

```bash
git add postgresql/src/postgresql.ts
git commit -m "feat(postgresql): replace config schema with json-render spec + collection support"
```

---

## Task 9: Rewrite Plugin Specs — Aliyunlog

**Files:**
- Modify: `aliyunlog/src/aliyunlog.ts`

- [ ] **Step 1: Replace schema with json-render spec**

Replace `ALIYUNLOG_CONFIG_UI_SCHEMA` with:

```typescript
import type { ConfigUIOptions } from '@apex/core';

const ALIYUNLOG_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'Aliyun SLS Log Service', description: 'Configure your Alibaba Cloud SLS credentials', configPath: null },
        children: ['credentials', 'settings', 'environments', 'save-bar'],
      },
      'credentials': {
        type: 'Section',
        props: { title: 'Credentials', description: null, collapsible: false, defaultOpen: true },
        children: ['ak-id', 'ak-secret', 'endpoint'],
      },
      'ak-id': {
        type: 'Field',
        props: { label: 'AccessKey ID', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'ak-secret': {
        type: 'Field',
        props: { label: 'AccessKey Secret', type: 'password', required: true, help: null, placeholder: null, options: null },
      },
      'endpoint': {
        type: 'Field',
        props: { label: 'Endpoint', type: 'text', required: true, help: 'e.g. cn-hangzhou.log.aliyuncs.com', placeholder: 'cn-hangzhou.log.aliyuncs.com', options: null },
      },
      'settings': {
        type: 'Section',
        props: { title: 'Settings', description: null, collapsible: true, defaultOpen: false },
        children: ['default-project'],
      },
      'default-project': {
        type: 'Field',
        props: { label: 'Default Project', type: 'text', required: false, help: null, placeholder: 'e.g. robot-k8s-dev', options: null },
      },
      'environments': {
        type: 'Collection',
        props: {
          title: 'Environments',
          itemLabel: 'Environment',
          statePath: '/environments',
          nameEditable: true,
        },
        children: ['env-project', 'env-endpoint'],
      },
      'env-project': {
        type: 'Field',
        props: { label: 'SLS Project', type: 'text', required: true, help: null, placeholder: null, options: null },
      },
      'env-endpoint': {
        type: 'Field',
        props: { label: 'Endpoint Override', type: 'text', required: false, help: 'Leave empty to use default endpoint', placeholder: null, options: null },
      },
      'save-bar': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      credentials: { accessKeyId: '', accessKeySecret: '', endpoint: 'cn-hangzhou.log.aliyuncs.com' },
      default_project: '',
      environments: [],
    },
  },
  collections: [{ statePath: '/environments' }],
  validate: (config) => {
    const c = config.credentials as Record<string, string> | undefined;
    return !c || !c.accessKeyId || c.accessKeyId.includes('<') || !c.accessKeySecret || c.accessKeySecret.includes('<') || !c.endpoint;
  },
};
```

- [ ] **Step 2: Update `requireConfigWithSetup` call**

Replace:
```typescript
requireConfigWithSetup<AliyunLogConfig>('aliyunlog', ALIYUNLOG_CONFIG_UI_SCHEMA, credentialsNeedSetup)
```
With:
```typescript
requireConfigWithSetup<AliyunLogConfig>('aliyunlog', ALIYUNLOG_CONFIG_UI)
```

The `validate` function is now inside `ALIYUNLOG_CONFIG_UI`, so remove the standalone `credentialsNeedSetup` parameter. Keep the `credentialsNeedSetup` function if it's used elsewhere.

- [ ] **Step 3: Build and verify**

Run:
```bash
cd aliyunlog && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add aliyunlog/src/aliyunlog.ts
git commit -m "feat(aliyunlog): replace config schema with json-render spec + sections and collections"
```

---

## Task 10: Cleanup and Remove Old Config UI

**Files:**
- Delete: `scripts/config-ui.ts`
- Delete: `scripts/dist/config-ui.mjs`

- [ ] **Step 1: Verify no remaining references to old schema format**

Run:
```bash
grep -r "ConfigUISchema" --include="*.ts" .
```
Expected: no matches (or only in old build artifacts).

- [ ] **Step 2: Delete standalone config-ui script**

```bash
rm scripts/config-ui.ts scripts/dist/config-ui.mjs
```

- [ ] **Step 3: Update CLAUDE.md config-ui documentation**

Update the `## Config UI` section in `CLAUDE.md` to reflect the new json-render spec approach. Remove references to `--schema` CLI flags and document the new `ConfigUIOptions` pattern.

- [ ] **Step 4: Build all workspaces**

Run:
```bash
npm run build
```
Expected: all packages and plugins build successfully.

- [ ] **Step 5: End-to-end test — launch TickTick config UI**

Run:
```bash
node ticktick/dist/ticktick.mjs tasks list --today 2>&1
```
With missing/invalid config, this should launch the browser with the new json-render UI.

- [ ] **Step 6: End-to-end test — launch MySQL config UI**

Temporarily rename `~/.cache/apex-plugin/mysql.json` and run:
```bash
mv ~/.cache/apex-plugin/mysql.json ~/.cache/apex-plugin/mysql.json.bak
node mysql/dist/mysql.mjs default "SELECT 1" 2>&1
```
Expected: browser opens with new UI showing a Collection with one "default" connection. Fill in, save, verify `mysql.json` written correctly.

Then restore:
```bash
mv ~/.cache/apex-plugin/mysql.json.bak ~/.cache/apex-plugin/mysql.json
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove old config-ui script, update docs"
```

---

## Task 11: Version Bumps

**Files:**
- Modify: plugin versions via `scripts/bump-plugin-version.sh`

- [ ] **Step 1: Bump all modified plugin versions**

```bash
bash scripts/bump-plugin-version.sh ticktick <next-version>
bash scripts/bump-plugin-version.sh mysql <next-version>
bash scripts/bump-plugin-version.sh postgresql <next-version>
bash scripts/bump-plugin-version.sh aliyunlog <next-version>
```

- [ ] **Step 2: Verify version consistency**

Run:
```bash
bash scripts/check-plugin-versions.sh
```
Expected: all versions consistent across `plugin.json`, `package.json`, `marketplace.json`.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: bump plugin versions for config-ui json-render redesign"
```
