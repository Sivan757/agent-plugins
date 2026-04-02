export interface PluginConfig {
    [key: string]: unknown;
}
export interface SchemaField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'number' | 'textarea' | 'checkbox';
    required?: boolean;
    options?: string[];
    placeholder?: string;
    lang?: Record<string, string>;
}
export interface HookResult {
    exitCode: number;
    message?: string;
}
export interface CLIArgs {
    command: string;
    flags: Record<string, string | boolean | number>;
    positional: string[];
}
//# sourceMappingURL=types.d.ts.map