//
// config-ui.ts — the browser configuration form for the aliyunlog plugin.
//
// Kept as plain data (no CLI wiring, no top-level side effects) so a validator
// can check it against the shared UI catalog without running the plugin.
//
import type { ConfigUIOptions } from '@agent-plugins/config-center';
import type { AliyunLogConfig } from './aliyunlog.js';

export const REASON_NEEDS_CONFIG =
  'SLS needs an AccessKey pair and a service endpoint before any query can run.';
export const CONFIG_UI: ConfigUIOptions = {
  // The browser form is the path that keeps the secret out of the terminal, so
  // error hints point at it rather than at the legacy `setup` wizard.
  setupCommand: 'config --ui',
  reason: REASON_NEEDS_CONFIG,
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: { en: 'Aliyun SLS Log Service', zh: '阿里云日志服务 SLS' }, description: { en: 'Configure your Alibaba Cloud SLS credentials', zh: '配置阿里云日志服务凭证' }, configPath: null },
        children: ['credentials', 'settings', 'environments', 'save'],
      },
      'credentials': {
        type: 'Section',
        props: { title: { en: 'Credentials', zh: '凭证' }, description: null, collapsible: false, defaultOpen: true },
        children: ['cred-accessKeyId', 'cred-accessKeySecret', 'cred-endpoint'],
      },
      'cred-accessKeyId': {
        type: 'Field',
        props: { label: { en: 'AccessKey ID', zh: 'AccessKey ID' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: '/credentials/accessKeyId' },
      },
      'cred-accessKeySecret': {
        type: 'Field',
        props: { label: { en: 'AccessKey Secret', zh: 'AccessKey Secret' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: '/credentials/accessKeySecret' },
      },
      'cred-endpoint': {
        type: 'Field',
        props: { label: { en: 'Endpoint', zh: '服务入口' }, type: 'text', required: true, help: { en: 'e.g. cn-hangzhou.log.aliyuncs.com', zh: '例如 cn-hangzhou.log.aliyuncs.com' }, placeholder: null, options: null, statePath: '/credentials/endpoint' },
      },
      'settings': {
        type: 'Section',
        props: { title: { en: 'Settings', zh: '设置' }, description: null, collapsible: true, defaultOpen: false },
        children: ['setting-default-project'],
      },
      'setting-default-project': {
        type: 'Field',
        props: { label: { en: 'Default Project', zh: '默认项目' }, type: 'text', required: false, help: null, placeholder: { en: 'e.g. example-dev', zh: '例如 example-dev' }, options: null, statePath: '/default_project' },
      },
      'environments': {
        type: 'Collection',
        props: { title: { en: 'Environments', zh: '环境' }, itemLabel: { en: 'Environment', zh: '环境' }, statePath: '/environments', nameEditable: true },
        children: ['env-project', 'env-endpoint'],
      },
      'env-project': {
        type: 'Field',
        props: { label: { en: 'SLS Project', zh: 'SLS 项目' }, type: 'text', required: false, help: null, placeholder: null, options: null, statePath: 'project' },
      },
      'env-endpoint': {
        type: 'Field',
        props: { label: { en: 'Endpoint Override', zh: '服务入口（覆盖）' }, type: 'text', required: false, help: { en: 'Leave empty to use default endpoint', zh: '留空则使用默认服务入口' }, placeholder: null, options: null, statePath: 'endpoint' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      credentials: { accessKeyId: '', accessKeySecret: '', endpoint: 'cn-hangzhou.log.aliyuncs.com' },
      default_project: '',
      environments: [],
    },
  },
  collections: [{ statePath: '/environments' }],
  validate: (config: Record<string, unknown>): boolean => {
    const c = (config as AliyunLogConfig).credentials;
    return !c
      || !c.accessKeyId || c.accessKeyId.includes('<')
      || !c.accessKeySecret || c.accessKeySecret.includes('<')
      || !c.endpoint;
  },
};
