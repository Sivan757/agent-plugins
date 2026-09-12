// Barrel re-exports for @agent-plugins/config-center.
// Other plugins import from this package instead of @agent-plugins/core.

export { CACHE_DIR, cacheRoot, configDir, configPath, artifactsDir, pluginFilePath, ensurePrivateConfigDir, ensurePrivateConfigDirSync, ensurePrivatePluginDirSync, writePluginFile, deepMerge, loadConfig, saveConfig, requireConfig } from './config-store.js';
export { launchUI, launchConfigUI, requireConfigWithSetup, configToState, stateToConfig, mergeSubmittedConfig } from './launch-ui.js';
export type { ConfigSpec, ConfigUIOptions, CollectionMapping, LaunchUIOptions, LaunchHandle, CLIOutput } from './launch-ui.js';
export { openConfigUI, reconfigure, summarizeConfig } from './config-flow.js';
export type { ConfigIntent, OpenConfigOptions, OpenConfigResult } from './config-flow.js';
export {
  redact,
  redactStructure,
  describeSecret,
  describeCharset,
  fingerprintOf,
  fingerprintAll,
} from './redact.js';
export type { SecretExpectation, SecretReport } from './redact.js';
export {
  verificationPath,
  readVerification,
  readVerificationSync,
  recordVerification,
  clearVerification,
  assessCredentials,
} from './verification.js';
export type { VerificationRecord, CredentialAssessment } from './verification.js';
export { PluginError } from './errors.js';
export type { PluginErrorCode } from './errors.js';
