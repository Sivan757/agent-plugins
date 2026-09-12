export type PluginErrorCode =
  | 'CONFIG_MISSING'
  | 'CONFIG_INVALID'
  | 'CONFIG_PERMISSIONS'
  | 'AUTH_FAILED'
  | 'QUERY_FAILED';

export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: PluginErrorCode,
    public readonly exitCode: number = 1
  ) {
    super(message);
    this.name = 'PluginError';
  }
}
