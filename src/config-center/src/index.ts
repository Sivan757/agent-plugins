// Barrel re-exports for @agent-plugins/config-center.
// Other plugins import from this package instead of @agent-plugins/core.

export { CACHE_DIR, configDir, configPath, artifactsDir, loadConfig, saveConfig, requireConfig, migrateLegacyConfig } from './config-store.js';
export { launchUI, launchConfigUI, requireConfigWithSetup, configToState, stateToConfig, deepMerge } from './launch-ui.js';
export type { ConfigSpec, ConfigUIOptions, CollectionMapping, LaunchUIOptions, LaunchHandle, CLIOutput } from './launch-ui.js';
export { redact, redactEntry } from './redact.js';
export { PluginError } from './errors.js';
export type { PluginErrorCode } from './errors.js';
