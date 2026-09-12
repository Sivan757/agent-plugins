//
// config-ui.ts — the browser configuration form for the postgresql plugin.
//
// Kept as plain data (no CLI wiring, no top-level side effects) so a validator
// can check it against the shared UI catalog without running the plugin.
//
import type { ConfigUIOptions } from '@agent-plugins/config-center';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isConfigIncomplete(config: Record<string, unknown>): boolean {
  const connections = config['connections'];
  if (!isRecord(connections) || Object.keys(connections).length === 0) {
    return true;
  }

  return Object.values(connections).some((connection) => {
    if (!isRecord(connection)) return true;
    return !String(connection['host'] ?? '').trim()
      || !String(connection['user'] ?? '').trim()
      || !String(connection['database'] ?? '').trim();
  });
}
export const CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'PostgreSQL', description: { en: 'Configure your database connections', zh: '配置数据库连接' }, configPath: null },
        children: ['connections', 'save'],
      },
      'connections': {
        type: 'Collection',
        props: { title: { en: 'Connections', zh: '连接' }, itemLabel: { en: 'Connection', zh: '连接' }, statePath: '/connections', nameEditable: true },
        children: ['conn-host', 'conn-port', 'conn-user', 'conn-password', 'conn-database', 'conn-ssl'],
      },
      'conn-host': {
        type: 'Field',
        props: { label: { en: 'Host', zh: '主机地址' }, type: 'text', required: true, help: null, placeholder: '127.0.0.1', options: null, statePath: 'host' },
      },
      'conn-port': {
        type: 'Field',
        props: { label: { en: 'Port', zh: '端口' }, type: 'number', required: false, help: null, placeholder: '5432', options: null, statePath: 'port' },
      },
      'conn-user': {
        type: 'Field',
        props: { label: { en: 'Username', zh: '用户名' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: 'user' },
      },
      'conn-password': {
        type: 'Field',
        props: { label: { en: 'Password', zh: '密码' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: 'password' },
      },
      'conn-database': {
        type: 'Field',
        props: { label: { en: 'Database', zh: '数据库' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: 'database' },
      },
      'conn-ssl': {
        type: 'Field',
        props: { label: { en: 'SSL', zh: 'SSL 加密' }, type: 'checkbox', required: false, help: { en: 'Disable for local/VPN connections', zh: '本地或 VPN 连接可关闭' }, placeholder: null, options: null, statePath: 'ssl' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      connections: [
        { _name: 'default', host: '127.0.0.1', port: '5432', user: '', password: '', database: '', ssl: false },
      ],
    },
  },
  collections: [{ statePath: '/connections' }],
  validate: isConfigIncomplete,
  setupCommand: 'config --ui',
  reason:
    'Each connection needs a host, a user and a password before any query can run.',
};
