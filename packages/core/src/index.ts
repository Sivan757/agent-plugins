export { configPath, loadConfig, saveConfig, requireConfig } from './config.js';
export { launchConfigUI, requireConfigWithSetup, configToState, stateToConfig, deepMerge } from './config-ui.js';
export type { ConfigSpec, ConfigUIOptions, CollectionMapping } from './config-ui.js';
export { PluginError } from './errors.js';
export type { PluginConfig, SchemaField, HookResult, CLIArgs } from './types.js';
