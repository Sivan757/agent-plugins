/**
 * config-ui.ts — Embedded browser-based configuration form for plugins.
 *
 * Launches a local HTTP server with a schema-driven form that writes
 * credentials directly to a config file. Credentials never pass through the LLM.
 *
 * Bundled as a library — no external scripts or file searching required.
 */
export interface ConfigUISchema {
    title: string;
    description?: string;
    fields: Array<{
        key: string;
        label: string;
        type?: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
        required?: boolean;
        default?: string;
        options?: string[];
        placeholder?: string;
        help?: string;
    }>;
}
/**
 * Launch a browser-based configuration form. Starts a local HTTP server,
 * opens the browser, and resolves when the user submits or the timeout expires.
 *
 * @returns true if configuration was saved successfully
 */
export declare function launchConfigUI(pluginName: string, schema: ConfigUISchema): Promise<boolean>;
/**
 * Load config with auto-setup: if config is missing or invalid, automatically
 * launches the browser config form. After the user completes setup, retries.
 *
 * @param pluginName - Plugin name used for config path resolution
 * @param schema - Config-UI schema for the setup form
 * @param validate - Optional function; return true if config needs (re-)setup
 */
export declare function requireConfigWithSetup<T extends Record<string, unknown>>(pluginName: string, schema: ConfigUISchema, validate?: (config: T) => boolean): Promise<T>;
//# sourceMappingURL=config-ui.d.ts.map