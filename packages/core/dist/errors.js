export class PluginError extends Error {
    code;
    exitCode;
    constructor(message, code, exitCode = 1) {
        super(message);
        this.code = code;
        this.exitCode = exitCode;
        this.name = 'PluginError';
    }
}
//# sourceMappingURL=errors.js.map