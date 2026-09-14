//
// config-ui.ts — the browser configuration form for the database plugin.
//
// Kept as plain data (no CLI wiring, no top-level side effects) so a validator
// can check it against the shared UI catalog without running the plugin. The
// only import is the engine list, which carries no dependencies of its own.
//
import type { ConfigUIOptions } from '@agent-plugins/config-center';
import { DRIVER_TYPES } from './drivers/types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIncomplete(connection: Record<string, unknown>): boolean {
  return (
    !String(connection['type'] ?? '').trim() ||
    !String(connection['host'] ?? '').trim() ||
    !String(connection['user'] ?? '').trim()
  );
}

function isConfigIncomplete(config: Record<string, unknown>): boolean {
  const connections = config['connections'];
  if (!isRecord(connections) || Object.keys(connections).length === 0) {
    return true;
  }
  return Object.values(connections).some((connection) => !isRecord(connection) || isIncomplete(connection));
}

export const CONFIG_UI: ConfigUIOptions = {
  setupCommand: 'config --ui',
  reason:
    'Each connection needs an engine type, a host and a user before any query can run.',
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: {
          title: { en: 'Database connections', zh: '数据库连接' },
          description: { en: 'Configure every database this plugin can reach', zh: '配置本插件可访问的所有数据库' },
          configPath: null,
        },
        children: ['connections', 'save'],
      },
      'connections': {
        type: 'Collection',
        props: {
          title: { en: 'Connections', zh: '连接' },
          itemLabel: { en: 'Connection', zh: '连接' },
          statePath: '/connections',
          nameEditable: true,
        },
        children: [
          'conn-type',
          'conn-host',
          'conn-port',
          'conn-user',
          'conn-password',
          'conn-database',
          'conn-ssl',
        ],
      },
      'conn-type': {
        type: 'Field',
        props: {
          label: { en: 'Engine', zh: '数据库类型' },
          type: 'select',
          required: true,
          help: { en: 'Which engine this connection speaks to', zh: '这个连接指向哪种数据库' },
          placeholder: null,
          options: [...DRIVER_TYPES],
          statePath: 'type',
        },
      },
      'conn-host': {
        type: 'Field',
        props: {
          label: { en: 'Host', zh: '主机地址' },
          type: 'text',
          required: true,
          help: null,
          placeholder: '127.0.0.1',
          options: null,
          statePath: 'host',
        },
      },
      'conn-port': {
        type: 'Field',
        props: {
          label: { en: 'Port', zh: '端口' },
          type: 'number',
          required: false,
          help: {
            en: 'Leave empty for the engine default (MySQL 3306, PostgreSQL 5432)',
            zh: '留空即用引擎默认端口（MySQL 3306，PostgreSQL 5432）',
          },
          placeholder: null,
          options: null,
          statePath: 'port',
        },
      },
      'conn-user': {
        type: 'Field',
        props: {
          label: { en: 'Username', zh: '用户名' },
          type: 'text',
          required: true,
          help: null,
          placeholder: null,
          options: null,
          statePath: 'user',
        },
      },
      'conn-password': {
        type: 'Field',
        props: {
          label: { en: 'Password', zh: '密码' },
          type: 'password',
          required: true,
          help: null,
          placeholder: null,
          options: null,
          statePath: 'password',
        },
      },
      'conn-database': {
        type: 'Field',
        props: {
          label: { en: 'Database', zh: '数据库' },
          type: 'text',
          required: false,
          help: {
            en: 'Optional. Leave it empty to describe a server and choose the database per command',
            zh: '可留空。留空即表示只描述一台服务器，库名按命令选择',
          },
          placeholder: null,
          options: null,
          statePath: 'database',
        },
      },
      'conn-ssl': {
        type: 'Field',
        props: {
          label: { en: 'SSL', zh: 'SSL 加密' },
          type: 'checkbox',
          required: false,
          help: { en: 'Turn off for local or VPN connections', zh: '本地或 VPN 连接可关闭' },
          placeholder: null,
          options: null,
          statePath: 'ssl',
        },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      connections: [
        {
          _name: 'default',
          type: 'mysql',
          host: '127.0.0.1',
          port: '',
          user: '',
          password: '',
          database: '',
          ssl: false,
        },
      ],
    },
  },
  collections: [{ statePath: '/connections' }],
  validate: isConfigIncomplete,
};
