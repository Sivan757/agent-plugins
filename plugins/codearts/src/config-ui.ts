//
// config-ui.ts — the browser configuration form for the codearts plugin.
//
// Kept as plain data (no CLI wiring, no top-level side effects) so a validator
// can check it against the shared UI catalog without running the plugin.
//
import type { ConfigUIOptions } from '@agent-plugins/config-center';

const L = (en: string, zh: string) => ({ en, zh });

/**
 * Why this plugin needs the form, in the user's terms. Printed whenever the form
 * opens — including when a command opens it because it cannot continue.
 */
export const REASON_NEEDS_CONFIG =
  "Requests need somewhere to go (a gateway URL, or a per-service endpoint from `codearts endpoint discover`) and a working credential.";
export const CONFIG_UI: ConfigUIOptions = {
  setupCommand: "config --ui",
  reason: REASON_NEEDS_CONFIG,
  spec: {
    root: "page",
    elements: {
      page: {
        type: "Header",
        props: {
          title: L("Huawei Cloud CodeArts", "华为云 CodeArts"),
          description: L(
            "Credential and endpoint setup for the codearts CLI",
            "codearts CLI 的凭证与端点配置"
          ),
          configPath: null,
        },
        children: ["section-connection", "section-auth", "section-defaults", "save"],
      },

      // ── Where requests go ─────────────────────────────────────────────────
      "section-connection": {
        type: "Section",
        props: {
          title: L("Connection", "连接"),
          description: L(
            "Region and domain are what endpoint discovery needs; the gateway is only for deployments that expose one shared address.",
            "区域与部署域名是端点探测所需的；只有部署提供统一网关时才需要填网关地址。"
          ),
          collapsible: null,
          defaultOpen: true,
        },
        children: ["region", "deploymentDomain", "gateway", "insecure"],
      },
      region: {
        type: "Field",
        props: {
          label: L("Region", "区域"),
          type: "text",
          required: true,
          help: L(
            "Region id of the tenant, or the region0_id of a private cloud.",
            "租户所在区域标识；私有云填 region0_id。"
          ),
          placeholder: "cn-north-4",
          options: null,
          statePath: "region",
        },
      },
      deploymentDomain: {
        type: "Field",
        props: {
          label: L("Deployment domain", "部署域名"),
          type: "text",
          required: false,
          help: L(
            "Only for private clouds, and only used by `codearts endpoint discover`. Example: example.com",
            "仅私有云需要，且只被 `codearts endpoint discover` 使用。例如 example.com"
          ),
          placeholder: "example.com",
          options: null,
          statePath: "deploymentDomain",
        },
      },
      gateway: {
        type: "Field",
        props: {
          label: L("Gateway URL", "网关地址"),
          type: "text",
          required: false,
          help: L(
            "One base URL shared by every service. Leave empty when each service has its own endpoint — run `codearts endpoint discover --write` and the override map is used instead.",
            "所有服务共用的一个基地址。若每个服务各有独立域名就留空 —— 先跑 `codearts endpoint discover --write`，CLI 会用按服务的端点覆盖。"
          ),
          placeholder: "http://10.0.0.1:8099",
          options: null,
          statePath: "gateway",
        },
      },

      insecure: {
        type: "Field",
        props: {
          label: L("Skip TLS verification", "跳过 TLS 校验"),
          type: "checkbox",
          required: false,
          help: L(
            "Only for private clouds whose gateway uses an internal or self-signed certificate.",
            "仅当私有云网关使用内部/自签证书时勾选。"
          ),
          placeholder: null,
          options: null,
          statePath: "insecure",
        },
      },

      // ── Credentials ───────────────────────────────────────────────────────
      "section-auth": {
        type: "Section",
        props: {
          title: L("Credentials", "凭证"),
          description: L(
            "Pick an authentication mode; only its fields are shown.",
            "先选鉴权方式，表单只展示该方式需要的字段。"
          ),
          collapsible: null,
          defaultOpen: true,
        },
        children: [
          "authType",
          "accessKeyId",
          "accessKeySecret",
          "token",
          "iamEndpoint",
          "domain",
          "username",
          "password",
        ],
      },
      authType: {
        type: "Field",
        props: {
          label: L("Authentication", "鉴权方式"),
          type: "select",
          required: true,
          help: L(
            "aksk signs every request with an access key. token sends an IAM token instead.",
            "aksk 用访问密钥逐请求签名；token 改为发送 IAM 令牌。"
          ),
          placeholder: null,
          options: ["aksk", "token"],
          statePath: "authType",
        },
      },
      accessKeyId: {
        type: "Field",
        props: {
          label: L("Access Key ID", "Access Key ID"),
          type: "text",
          required: true,
          help: L(
            "From 我的凭证 → 访问密钥.",
            "在「我的凭证 → 访问密钥」获取。"
          ),
          placeholder: null,
          options: null,
          statePath: "accessKeyId",
          visibleWhen: { statePath: "authType", oneOf: ["aksk"] },
        },
      },
      accessKeySecret: {
        type: "Field",
        props: {
          label: L("Secret Access Key", "Secret Access Key"),
          type: "password",
          required: true,
          help: null,
          placeholder: null,
          options: null,
          statePath: "accessKeySecret",
          visibleWhen: { statePath: "authType", oneOf: ["aksk"] },
        },
      },
      token: {
        type: "Field",
        props: {
          label: L("X-Auth-Token", "X-Auth-Token"),
          type: "password",
          required: false,
          help: L(
            "Use this when the deployment does not expose the IAM token API. Expires in about 24 hours.",
            "部署没有开放 IAM 取 token 接口时用它，约 24 小时过期。"
          ),
          placeholder: null,
          options: null,
          statePath: "token",
          visibleWhen: { statePath: "authType", oneOf: ["token"] },
        },
      },
      iamEndpoint: {
        type: "Field",
        props: {
          label: L("IAM endpoint", "IAM 终端节点"),
          type: "text",
          required: false,
          help: L(
            "Needed to exchange account credentials for a token. Example: https://iam-apigateway-proxy.<region>.<domain>",
            "用账号密码自动换取令牌时需要。例如 https://iam-apigateway-proxy.<region>.<domain>"
          ),
          placeholder: "https://iam-apigateway-proxy.<region>.<domain>",
          options: null,
          statePath: "iamEndpoint",
          visibleWhen: { statePath: "authType", oneOf: ["token"] },
        },
      },
      domain: {
        type: "Field",
        props: {
          label: L("Account name", "账号名"),
          type: "text",
          required: false,
          help: L("Owner account of the IAM user.", "IAM 用户所属的账号名。"),
          placeholder: null,
          options: null,
          statePath: "domain",
          visibleWhen: { statePath: "authType", oneOf: ["token"] },
        },
      },
      username: {
        type: "Field",
        props: {
          label: L("IAM username", "IAM 用户名"),
          type: "text",
          required: false,
          help: null,
          placeholder: null,
          options: null,
          statePath: "username",
          visibleWhen: { statePath: "authType", oneOf: ["token"] },
        },
      },
      password: {
        type: "Field",
        props: {
          label: L("IAM password", "IAM 密码"),
          type: "password",
          required: false,
          help: null,
          placeholder: null,
          options: null,
          statePath: "password",
          visibleWhen: { statePath: "authType", oneOf: ["token"] },
        },
      },

      // ── Defaults ──────────────────────────────────────────────────────────
      "section-defaults": {
        type: "Section",
        props: {
          title: L("Defaults", "默认值"),
          description: L(
            "Optional. The CodeArts project is always chosen per command with --project.",
            "可选。CodeArts 项目始终按命令用 --project 指定，不设默认值。"
          ),
          collapsible: null,
          defaultOpen: true,
        },
        children: ["authProjectId", "tenantId"],
      },
      authProjectId: {
        type: "Field",
        props: {
          label: L("Gateway auth project ID", "网关鉴权项目 ID"),
          type: "text",
          required: false,
          help: L(
            "Sent as X-Project-Id. Only needed when the gateway authenticates against a different project than the one used in request paths (console: 我的凭证 → 项目ID).",
            "作为 X-Project-Id 发送。仅当网关鉴权用的项目与上面的 CodeArts 项目不是同一个时才需要填（控制台「我的凭证 → 项目ID」）。"
          ),
          placeholder: null,
          options: null,
          statePath: "authProjectId",
        },
      },
      tenantId: {
        type: "Field",
        props: {
          label: L("Account (tenant) ID", "账号（租户）ID"),
          type: "text",
          required: false,
          help: L(
            "A few Artifact paths need it. Console: 我的凭证 → 账号ID.",
            "少数制品仓库接口需要。控制台「我的凭证 → 账号ID」。"
          ),
          placeholder: null,
          options: null,
          statePath: "tenantId",
        },
      },

      save: { type: "SaveBar", props: { saveLabel: null, resetLabel: null } },
    },
    state: {
      gateway: "",
      insecure: false,
      authType: "aksk",
      accessKeyId: "",
      accessKeySecret: "",
      token: "",
      iamEndpoint: "",
      domain: "",
      username: "",
      password: "",
      region: "",
      deploymentDomain: "",
      authProjectId: "",
      tenantId: "",
    },
  },
};
