# Plugin Metadata And Release Pipeline Design

**Date:** 2026-05-02
**Status:** Draft
**Scope:** Introduce generated plugin metadata and clean compiled release artifacts without inventing cross-agent runtime semantics.

## Problem

The repository currently uses one `plugins/<name>` directory as both the development source tree and the installable plugin tree. That makes TypeScript plugins look noisy after build because the same directory contains source files, workspace metadata, generated `dist/*.mjs`, copied config UI assets, manifests, hooks, skills, and package files.

There is also repeated metadata across `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, marketplace entries, package versions, and build scripts. Some of that repetition is useful because Codex and Claude have different native surfaces, but the common manifest metadata is mechanical and should not be edited in several places.

## Design Principle

The generator owns metadata and packaging, not runtime semantics.

Generated files may describe the same plugin to multiple clients, but they must not hide client-specific runtime behavior behind a custom abstraction. Hooks, MCP server configs, app configs, skills, commands, and agent definitions remain native files because those are runtime contracts with the host agent.

## Decisions

1. Add a per-plugin source-of-truth metadata file, `plugin.config.ts` or `plugin.config.json`.
2. Generate `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` from that metadata.
3. Generate or validate marketplace entries from the same metadata.
4. Add a pack stage that writes clean installable plugin directories under a generated output root.
5. Keep hook files native. The pipeline may copy and validate hook files, but it must not translate hooks through a custom cross-agent DSL.
6. Keep source plugin directories optimized for development, and release plugin directories optimized for installation.

## Non-Goals

- No custom hook language.
- No cross-agent hook semantic mapper.
- No generated skill content.
- No generated `.mcp.json` behavior.
- No generated `.app.json` behavior.
- No runtime dependency on npm workspaces inside installable plugin artifacts.
- No immediate removal of all existing manifest files until the generated path is validated.

## Plugin Metadata

Each plugin gets one metadata source file at the plugin root:

```ts
// plugins/mysql/plugin.config.ts
export default {
  name: "mysql",
  version: "0.11.1",
  description: "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-database connection support.",
  author: { name: "Agent Plugins" },
  keywords: ["mysql", "sql", "database", "query", "mysql2", "node"],
  category: "Coding",
  interface: {
    displayName: "MySQL",
    shortDescription: "Enables AI to execute SQL queries against MySQL databases.",
    longDescription: "Enables AI to execute SQL queries against MySQL databases via Node.js scripts with multi-database connection support.",
    developerName: "Agent Plugins"
  },
  build: {
    entry: "src/mysql.ts",
    output: "dist/mysql.mjs"
  },
  surfaces: {
    skills: true,
    hooks: "native",
    mcp: false,
    app: false
  }
};
```

The exact TypeScript type should live in a repo-local package or script module so config files are checked consistently. JSON may be supported later for metadata-only plugins, but TypeScript is more useful for typed authoring and comments.

## Native Runtime Files

Hooks stay as native files:

```text
plugins/<name>/hooks.json              # Codex native hook config
plugins/<name>/hooks/hooks.json        # Claude native hook config
```

For plugins where the two files are intentionally identical, the pipeline can treat one as canonical and mirror it to the other. For plugins where Codex and Claude diverge, both files should exist explicitly and be validated as native host files.

MCP and app configs follow the same rule:

```text
plugins/<name>/.mcp.json
plugins/<name>/.app.json
```

The generator may copy these files into the release artifact and check that generated manifests reference them correctly. It must not reinterpret their behavior.

## Generated Source-Tree Files

During the transition, generated files may remain in the source tree so current local workflows keep working:

```text
plugins/<name>/.codex-plugin/plugin.json
plugins/<name>/.claude-plugin/plugin.json
```

The generator should mark these files as generated with a stable top-level convention only if the host clients tolerate the extra field. If not, generated status should live in comments outside JSON, documentation, or validation output rather than inside the manifests.

Source-tree generation is a compatibility bridge. The long-term cleaner path is to rely on generated release artifacts for installation.

## Release Artifact Layout

The pack stage writes installable plugin directories to a generated output root, for example `.build/plugins/<name>`:

```text
.build/plugins/mysql/
  .codex-plugin/plugin.json
  .claude-plugin/plugin.json
  dist/mysql.mjs
  dist/config-ui/dist/index.html
  skills/
  hooks.json
  hooks/hooks.json
```

Source-only files are excluded:

```text
src/
package.json
package-lock.json
tsconfig.json
plugin.config.ts
node_modules/
*.tsbuildinfo
```

Plugin-specific static runtime files, such as `dist/sls.proto` for `aliyunlog`, must be declared in metadata or discovered through an explicit allowlist so they are copied intentionally.

## Build And Pack Flow

```text
plugin.config.ts
      |
      v
generate manifests and marketplace metadata
      |
      v
build TypeScript entries with esbuild
      |
      v
copy native runtime surfaces and static assets
      |
      v
validate release artifact as an installable plugin tree
```

Root commands should separate concerns:

```text
npm run generate:plugins       # generate source-tree metadata files
npm run build                  # build workspace packages and plugin runtime bundles
npm run pack:plugins           # create clean installable artifacts
npm run validate:plugins       # validate source-tree compatibility
npm run validate:plugin-packs  # validate generated artifacts
```

The existing `scripts/dev.sh` can keep using source-tree plugins during migration. A later option can allow launching Codex or Claude against packed artifacts.

## Validation

The validators should be updated in layers:

1. Validate `plugin.config.ts` shape and required metadata.
2. Validate generated manifest content matches metadata.
3. Validate native runtime files exist when metadata declares them.
4. Validate hooks as native files, not as generated semantic models.
5. Validate release artifact layout excludes source-only files.
6. Validate release artifact manifests point only to files present inside the artifact root.

Existing validation rules still apply: manifest directories stay minimal, Codex paths remain `./`-relative to plugin root, Claude hook paths use `./hooks/hooks.json`, and local marketplace entries use the expected local source shape.

## Migration Plan

1. Add metadata schema and generator script.
2. Add `plugin.config.ts` for one representative runtime plugin, preferably `mysql`.
3. Generate its Codex and Claude manifests and compare output with current files.
4. Add pack support for that plugin and validate the generated artifact.
5. Extend to `postgresql`, `aliyunlog`, `ticktick`, and `notebook`.
6. Extend to metadata-only or MCP-only plugins.
7. Update marketplace generation once plugin metadata coverage is complete.
8. Decide whether generated source-tree manifests stay committed or become build-only artifacts.

## Risks

**Generated metadata drift:** A developer may edit generated files directly.
Mitigation: validation should fail when generated manifests do not match `plugin.config.ts`.

**Release artifact misses a runtime file:** A plugin may depend on a static file outside generic directories.
Mitigation: require explicit artifact include rules for plugin-specific files.

**Hook abstraction creep:** The generator may gradually start encoding behavior.
Mitigation: keep hooks as copied and validated native files only.

**Client compatibility break:** Codex or Claude may reject generated manifests if fields are added incorrectly.
Mitigation: generate only known accepted fields and keep existing validators as the compatibility contract.

## Open Decision

The remaining policy decision is whether generated source-tree manifests should stay committed after the transition. The safer first version keeps them committed and validates them. A later cleanup can move installation entirely to generated release artifacts once local dev and marketplace flows support that cleanly.
