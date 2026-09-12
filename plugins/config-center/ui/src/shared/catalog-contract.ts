/**
 * The Config UI contract: the complete vocabulary a plugin's form spec may use.
 *
 * Kept as plain data with no imports so three different consumers can share one
 * definition: the renderer's catalog (`catalog.ts`, enforced by `satisfies`), the
 * repository validator that checks every plugin spec, and anyone reading the
 * plugin-authoring guide. Adding a component here without adding it to the
 * catalog — or the reverse — is a type error.
 */

export const CONFIG_UI_COMPONENTS = ['Header', 'Section', 'Collection', 'Field', 'SaveBar'] as const;
export const CONFIG_UI_FIELD_TYPES = ['text', 'password', 'select', 'number', 'textarea', 'checkbox'] as const;
export const CONFIG_UI_ACTIONS = ['save', 'reset', 'addItem', 'removeItem'] as const;

export type ConfigUIComponent = (typeof CONFIG_UI_COMPONENTS)[number];
export type ConfigUIFieldType = (typeof CONFIG_UI_FIELD_TYPES)[number];
export type ConfigUIAction = (typeof CONFIG_UI_ACTIONS)[number];
