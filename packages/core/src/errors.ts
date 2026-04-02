export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: 'CONFIG_MISSING' | 'CONFIG_INVALID' | 'AUTH_FAILED' | 'QUERY_FAILED',
    public readonly exitCode: number = 1
  ) {
    super(message);
    this.name = 'PluginError';
  }
}
