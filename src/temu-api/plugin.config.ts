import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "temu-api",
  version: "0.1.0",
  description: "Reference knowledge base for Temu Partner/OpenAPI integrations: request signing, region/gateway selection, self-developed app auth, Temu Adapter calls, POD/listing publication, image upload, category/attribute lookup, size chart/model/logistics/template APIs, inventory/price APIs, and any code that calls Temu APIs.",
  author: { name: "Agent Plugins" },
  category: "Coding",
  interface: {
    displayName: "temu-api",
    shortDescription: "Reference knowledge base for Temu Partner/OpenAPI integrations: request signing, region/gateway selection, self-developed app auth, Temu Adapter calls, POD/listing publication, image upload, category/attribute lookup, size chart/model/logistics/template APIs, inventory/price APIs, and any code that calls Temu APIs.",
    longDescription: "Reference knowledge base for Temu Partner/OpenAPI integrations: request signing, region/gateway selection, self-developed app auth, Temu Adapter calls, POD/listing publication, image upload, category/attribute lookup, size chart/model/logistics/template APIs, inventory/price APIs, and any code that calls Temu APIs.",
    developerName: "Agent Plugins",
    category: "Coding",
  },
  surfaces: {
    skills: true,
    hooks: "native",
  },
  marketplace: {
    codex: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    claude: {
      description: "Reference knowledge base for Temu Partner/OpenAPI integrations: request signing, region/gateway selection, self-developed app auth, Temu Adapter calls, POD/listing publication, image upload, category/attribute lookup, size chart/model/logistics/template APIs, inventory/price APIs, and any code that calls Temu APIs.",
    },
  },
} satisfies PluginConfig;
