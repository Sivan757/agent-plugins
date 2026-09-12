//
// config-ui.ts — the browser configuration form for the ticktick plugin.
//
// Kept as plain data (no CLI wiring, no top-level side effects) so a validator
// can check it against the shared UI catalog without running the plugin.
//
import type { ConfigUIOptions } from '@agent-plugins/config-center';

export const REASON_NEEDS_CONFIG =
  'TickTick needs the username, password and X-Device header that authenticate this account.';
export const CONFIG_UI: ConfigUIOptions = {
  // `setup` here means `setup x-device`, so it must not be offered as the way to
  // open the form.
  setupCommand: 'config --ui',
  reason: REASON_NEEDS_CONFIG,
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'TickTick', description: { en: 'Enter your TickTick / Dida365 credentials', zh: '输入你的 TickTick / 滴答清单 凭证' }, configPath: null },
        children: ['credentials'],
      },
      'credentials': {
        type: 'Section',
        props: { title: { en: 'Credentials', zh: '凭证' }, collapsible: false, defaultOpen: true, description: null },
        children: ['host', 'username', 'password', 'save'],
      },
      'host': {
        type: 'Field',
        props: {
          label: { en: 'Host', zh: '服务器' },
          type: 'select',
          required: true,
          help: { en: 'Use dida365.com for China accounts', zh: '中国账号请使用 dida365.com' },
          placeholder: null,
          options: ['ticktick.com', 'dida365.com'],
          statePath: '/host',
        },
      },
      'username': {
        type: 'Field',
        props: { label: { en: 'Username / Email', zh: '用户名 / 邮箱' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: '/username' },
      },
      'password': {
        type: 'Field',
        props: { label: { en: 'Password', zh: '密码' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: '/password' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: { host: 'ticktick.com', username: '', password: '' },
  },
};
