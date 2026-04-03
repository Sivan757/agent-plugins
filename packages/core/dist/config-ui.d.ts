/**
 * config-ui.ts — Serves a pre-bundled React config form for plugins.
 *
 * Launches a local HTTP server that injects plugin specs + config state into
 * the bundled React app from packages/config-ui/dist/index.html. Credentials
 * flow browser → file, never through the LLM.
 */
export interface ConfigSpec {
    root: string;
    elements: Record<string, unknown>;
    state?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface CollectionMapping {
    /** JSON-pointer-style path to the collection, e.g. "/connections" */
    statePath: string;
    /** Key within each item used as the object key. Default: "_name" */
    nameKey?: string;
}
export interface ConfigUIOptions {
    spec: ConfigSpec;
    collections?: CollectionMapping[];
    validate?: (config: Record<string, unknown>) => boolean;
}
/**
 * Deep-merge `source` into `target`. Returns a new object; inputs are not
 * mutated. Arrays are replaced, not concatenated.
 */
export declare function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown>;
/**
 * Convert config-file format (keyed objects) → UI state format (arrays with
 * `_name` injected from the key).
 *
 * Config: `{ connections: { "default": {host, port}, "qa": {host, port} } }`
 * State:  `{ connections: [{_name: "default", host, port}, {_name: "qa", host, port}] }`
 */
export declare function configToState(config: Record<string, unknown>, collections?: CollectionMapping[]): Record<string, unknown>;
/**
 * Convert UI state format (arrays with `_name`) → config-file format (keyed
 * objects with `_name` stripped).
 *
 * State:  `{ connections: [{_name: "default", host, port}, {_name: "qa", host, port}] }`
 * Config: `{ connections: { "default": {host, port}, "qa": {host, port} } }`
 */
export declare function stateToConfig(state: Record<string, unknown>, collections?: CollectionMapping[]): Record<string, unknown>;
/**
 * Launch a browser-based configuration form. Starts a local HTTP server,
 * opens the browser, and resolves when the user submits or the timeout expires.
 *
 * @returns true if configuration was saved successfully
 */
export declare function launchConfigUI(pluginName: string, options: ConfigUIOptions): Promise<boolean>;
/**
 * Load config with auto-setup: if config is missing or invalid, automatically
 * launches the browser config form. After the user completes setup, retries.
 *
 * @param pluginName - Plugin name used for config path resolution
 * @param options - ConfigUIOptions containing spec, collections, and optional validate
 */
export declare function requireConfigWithSetup<T extends Record<string, unknown>>(pluginName: string, options: ConfigUIOptions): Promise<T>;
//# sourceMappingURL=config-ui.d.ts.map