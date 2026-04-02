export declare function configPath(pluginName: string): string;
export declare function loadConfig<T extends Record<string, unknown>>(pluginName: string): Promise<T | null>;
export declare function saveConfig(pluginName: string, data: Record<string, unknown>, merge?: boolean): Promise<void>;
export declare function requireConfig<T extends Record<string, unknown>>(pluginName: string): Promise<T>;
//# sourceMappingURL=config.d.ts.map