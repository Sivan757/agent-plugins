export declare class PluginError extends Error {
    readonly code: 'CONFIG_MISSING' | 'CONFIG_INVALID' | 'AUTH_FAILED' | 'QUERY_FAILED';
    readonly exitCode: number;
    constructor(message: string, code: 'CONFIG_MISSING' | 'CONFIG_INVALID' | 'AUTH_FAILED' | 'QUERY_FAILED', exitCode?: number);
}
//# sourceMappingURL=errors.d.ts.map