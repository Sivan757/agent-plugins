# Company Knowledge Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename kotlin-architect to company-knowledge and add 3 new skills (blade-framework, team-conventions, aikero-gradle) that link to aikero-docs at https://aikero-docs.robotees.tech, plus update existing 4 skills with Blade-specific patterns.

**Architecture:** Plugin is skills-only (no CLI scripts, no MCP). Each skill has a SKILL.md with frontmatter and a references/ directory with supplementary docs. Skills link to the deployed aikero-docs site rather than embedding full documentation.

**Tech Stack:** Markdown (SKILL.md), shell (bump-plugin-version.sh)

---

## File Structure

```
company-knowledge/                          # renamed from kotlin-architect
├── .claude-plugin/
│   └── plugin.json                         # MODIFY: name, description, keywords
├── skills/
│   ├── blade-framework/                    # NEW
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── modules.md
│   │       └── starters.md
│   ├── team-conventions/                   # NEW
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── database.md
│   │       └── api-design.md
│   ├── aikero-gradle/                      # NEW
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── plugins.md
│   ├── gradle-kotlin/                      # MODIFY: add Blade section
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── multi-module.md
│   ├── kotlin-springboot/                  # MODIFY: add Blade section
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── patterns.md
│   │       ├── security.md
│   │       └── testing.md
│   ├── jimmer/                             # MODIFY: add Blade section
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── setup.md
│   │       └── advanced.md
│   └── java-to-kotlin/                     # MODIFY: add Blade reference
│       ├── SKILL.md
│       └── references/
│           ├── advanced-patterns.md
│           └── jpa-to-jimmer.md
.claude-plugin/marketplace.json             # MODIFY: rename entry
```

---

### Task 1: Rename directory and update metadata

**Files:**
- Rename: `kotlin-architect/` → `company-knowledge/`
- Modify: `company-knowledge/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Rename the plugin directory**

```bash
cd /home/coder/workspace/aikero/apex-plugins
mv kotlin-architect company-knowledge
```

- [ ] **Step 2: Update plugin.json**

Replace entire content of `company-knowledge/.claude-plugin/plugin.json`:

```json
{
  "name": "company-knowledge",
  "version": "0.2.0",
  "description": "Aikero company knowledge base — Blade framework, team conventions, Gradle ecosystem, Kotlin/Spring Boot/Jimmer architecture, and Java-to-Kotlin migration",
  "author": {
    "name": "robotees"
  },
  "license": "MIT",
  "keywords": [
    "blade",
    "aikero",
    "kotlin",
    "spring-boot",
    "jimmer",
    "gradle",
    "conventions",
    "architecture",
    "java-to-kotlin",
    "migration"
  ]
}
```

- [ ] **Step 3: Update marketplace.json**

In `.claude-plugin/marketplace.json`, replace the kotlin-architect entry:

```json
{
  "name": "company-knowledge",
  "version": "0.2.0",
  "source": "./company-knowledge",
  "description": "Aikero company knowledge base — Blade framework, team conventions, Gradle ecosystem, Kotlin/Spring Boot/Jimmer architecture, and Java-to-Kotlin migration"
}
```

- [ ] **Step 4: Commit**

```bash
git add company-knowledge/ .claude-plugin/marketplace.json
git rm -r --cached kotlin-architect/
git commit -m "refactor: rename kotlin-architect plugin to company-knowledge"
```

---

### Task 2: Create blade-framework skill

**Files:**
- Create: `company-knowledge/skills/blade-framework/SKILL.md`
- Create: `company-knowledge/skills/blade-framework/references/modules.md`
- Create: `company-knowledge/skills/blade-framework/references/starters.md`

- [ ] **Step 1: Create SKILL.md**

Create `company-knowledge/skills/blade-framework/SKILL.md` with:
- Frontmatter: name `blade-framework`, triggers for "use Blade", "add starter", "DataResponse", "auth annotation", "error report", "user context", "current user"
- Section: overview of Blade as Aikero's enterprise Spring Boot framework (v3.2.0)
- Section: DataResponse<T> protocol — the unified API response wrapper with `toSuccess()` / `toFailure()` extensions
- Section: Auth annotations — `@PreCheckPermission`, `@PreCheckRole`, `@PreCheckIgnore`, `@PreAuth` with examples from blade-examples-auth
- Section: User context — `CurrentUser` data class, `CurrentUserHolder`, `withUser {}` / `withSystemUser {}` DSL
- Section: Starter usage — how to import starters via `implementation(libs.blade.xxx.spring.boot.starter)`
- Section: Serialization conventions — Long→String, LocalDateTime→timestamp, null handling
- Section: Reference docs with links to:
  - `https://aikero-docs.robotees.tech/blade/` (overview)
  - `https://aikero-docs.robotees.tech/blade/modules/` (module list)
  - `https://aikero-docs.robotees.tech/blade/modules/user_auth.html` (auth)
  - `https://aikero-docs.robotees.tech/blade/modules/api_struct.html` (API structure)
  - `https://aikero-docs.robotees.tech/blade/modules/serialization.html` (serialization)
  - `https://aikero-docs.robotees.tech/blade/modules/error_report.html` (error reporting)
  - `https://aikero-docs.robotees.tech/blade/modules/logging.html` (logging)
  - `https://aikero-docs.robotees.tech/blade/modules/oplog.html` (operation logs)
- Section: reference file pointers to `references/modules.md` and `references/starters.md`

- [ ] **Step 2: Create references/modules.md**

Create `company-knowledge/skills/blade-framework/references/modules.md` with:
- Complete module inventory table (14 base modules with descriptions)
- Key module details: cache (Redis/Caffeine), feign (token relay, mock user), file (OSS integration), sensitive (field masking), xss, lock (distributed), oplog (RabbitMQ), sequence (CosId), data-permission, gateway
- Doc links for each module: `https://aikero-docs.robotees.tech/blade/modules/<module>.html`

- [ ] **Step 3: Create references/starters.md**

Create `company-knowledge/skills/blade-framework/references/starters.md` with:
- Complete starter inventory table (26 starters with categories)
- Composite starter breakdown: `blade-web-boot-spring-boot-starter` bundles web + logging + sequence + xss + oss-path-convert
- Configuration examples from blade-examples (application.yml patterns)
- Auto-configuration registration pattern (META-INF/spring/)
- Doc links: `https://aikero-docs.robotees.tech/blade/modules/dependence_manage.html`

- [ ] **Step 4: Commit**

```bash
git add company-knowledge/skills/blade-framework/
git commit -m "feat(company-knowledge): add blade-framework skill with module and starter references"
```

---

### Task 3: Create team-conventions skill

**Files:**
- Create: `company-knowledge/skills/team-conventions/SKILL.md`
- Create: `company-knowledge/skills/team-conventions/references/database.md`
- Create: `company-knowledge/skills/team-conventions/references/api-design.md`

- [ ] **Step 1: Create SKILL.md**

Create `company-knowledge/skills/team-conventions/SKILL.md` with:
- Frontmatter: name `team-conventions`, triggers for "API design", "database convention", "naming convention", "Git workflow", "project setup", "code standard", "branch strategy"
- Section: API standards — URL structure `/service/client-version/module/action`, lowercase, hyphen-separated, no plurals
- Section: Request/Response — Req/Vo suffix convention, field naming without suffix, DataResponse wrapper
- Section: Git workflow — branch naming, merge strategy, CI/CD overview
- Section: Project setup — local dev with Docker Compose (Redis, RabbitMQ, Nacos, MinIO), env variable conventions (`LOCAL_DOCKER_*`)
- Section: Reference docs with links to:
  - `https://aikero-docs.robotees.tech/conventions/` (overview)
  - `https://aikero-docs.robotees.tech/conventions/other/api.html` (API standards)
  - `https://aikero-docs.robotees.tech/conventions/other/git.html` (Git)
  - `https://aikero-docs.robotees.tech/conventions/other/git_branch_use.html` (branching)
  - `https://aikero-docs.robotees.tech/conventions/other/project.html` (project standards)
  - `https://aikero-docs.robotees.tech/conventions/other/projectLocalStart.html` (local setup)
  - `https://aikero-docs.robotees.tech/conventions/other/process.html` (dev process)
  - `https://aikero-docs.robotees.tech/conventions/other/upgrade-sb3.html` (Spring Boot 3 upgrade)
- Section: reference file pointers

- [ ] **Step 2: Create references/database.md**

Create `company-knowledge/skills/team-conventions/references/database.md` with:
- MySQL 8.0.28 conventions: utf8mb4, table naming (lowercase, underscore, no plurals)
- Mandatory fields: id (bigint unsigned), creator_id, created_time, reviser_id, revised_time, deleted (tinyint unsigned)
- Index naming: pk_xxx, uk_xxx, fk_xxx, idx_xxx; BTREE type; max 5 per table
- PostgreSQL conventions
- MongoDB conventions
- Elasticsearch conventions
- Doc links for each DB: `https://aikero-docs.robotees.tech/conventions/db/Mysql.html`, etc.

- [ ] **Step 3: Create references/api-design.md**

Create `company-knowledge/skills/team-conventions/references/api-design.md` with:
- Detailed URL structure rules from aikero-docs
- Request/Response entity patterns with Req/Vo suffix examples
- Exception handling conventions (service layer throws custom exceptions)
- DataResponse wrapper usage
- YApi documentation process
- Doc link: `https://aikero-docs.robotees.tech/conventions/other/api.html`

- [ ] **Step 4: Commit**

```bash
git add company-knowledge/skills/team-conventions/
git commit -m "feat(company-knowledge): add team-conventions skill with database and API design references"
```

---

### Task 4: Create aikero-gradle skill

**Files:**
- Create: `company-knowledge/skills/aikero-gradle/SKILL.md`
- Create: `company-knowledge/skills/aikero-gradle/references/plugins.md`

- [ ] **Step 1: Create SKILL.md**

Create `company-knowledge/skills/aikero-gradle/SKILL.md` with:
- Frontmatter: name `aikero-gradle`, triggers for "Aikero Gradle plugin", "version catalog", "publish artifact", "multi-module project", "Gradle configuration", "common-conf", "publish-conf"
- Section: project structure — settings.gradle.kts with version catalog import from blade-catalog, required gradle.properties keys (group, version, frameworkVersion)
- Section: global Gradle config — `~/.gradle/gradle.properties` (Nexus credentials), `~/.gradle/init.gradle.kts` (plugin management, repository setup)
- Section: version catalog — importing `team.aikero.blade:blade-catalog:<version>` for centralized dependency management
- Section: module conventions — drawer-common, drawer-sdk (pure Feign interfaces, minimal deps), drawer-service
- Section: publishing — snapshot and release repositories at `nexus.tiangong.site`
- Section: Reference docs with links to:
  - `https://aikero-docs.robotees.tech/gradle/` (overview)
  - `https://aikero-docs.robotees.tech/gradle/gradleproject.html` (project structure)
  - `https://aikero-docs.robotees.tech/gradle/gradle_cache.html` (caching)
  - `https://aikero-docs.robotees.tech/gradle/plugin.html` (plugins overview)
  - `https://aikero-docs.robotees.tech/gradle/qa.html` (FAQ)
  - `https://aikero-docs.robotees.tech/gradle/plugins/` (plugin index)

- [ ] **Step 2: Create references/plugins.md**

Create `company-knowledge/skills/aikero-gradle/references/plugins.md` with:
- common-conf plugin: what it configures (repositories, Kotlin settings, test config, Kover)
- publish-conf plugin: Maven publication setup, Nexus repository targeting
- version-catalog plugin: how to import and use blade-catalog
- api-version-generator plugin: auto-generates API version constants
- plugin-common: shared plugin utilities
- Doc links:
  - `https://aikero-docs.robotees.tech/gradle/plugins/common-conf.html`
  - `https://aikero-docs.robotees.tech/gradle/plugins/publish-conf.html`
  - `https://aikero-docs.robotees.tech/gradle/plugins/version-catalog.html`
  - `https://aikero-docs.robotees.tech/gradle/plugins/api-version-generator.html`
  - `https://aikero-docs.robotees.tech/gradle/plugins/plugin-use.html`

- [ ] **Step 3: Commit**

```bash
git add company-knowledge/skills/aikero-gradle/
git commit -m "feat(company-knowledge): add aikero-gradle skill with Gradle plugin references"
```

---

### Task 5: Update gradle-kotlin skill

**Files:**
- Modify: `company-knowledge/skills/gradle-kotlin/SKILL.md`

- [ ] **Step 1: Update SKILL.md**

Add to the end of the existing SKILL.md (before "## Additional Resources"):

**New section: "## Aikero Blade Framework Integration"**
- Import blade-catalog version catalog: `from("team.aikero.blade:blade-catalog:<version>")`
- Use `alias(libs.plugins.common.conf)` for shared Kotlin/repository/test configuration
- Use `alias(libs.plugins.publish.conf)` for Maven publication
- KSP configuration for Blade version generation (bladeVersion, moduleGen, moduleName args)
- Required `gradle.properties` keys: group, version, frameworkVersion
- Link: `https://aikero-docs.robotees.tech/gradle/gradleproject.html`

Also update the frontmatter description to include "Aikero Blade" triggers, and bump version to 0.2.0 in all three files.

- [ ] **Step 2: Commit**

```bash
git add company-knowledge/skills/gradle-kotlin/SKILL.md
git commit -m "feat(company-knowledge): update gradle-kotlin skill with Blade framework integration"
```

---

### Task 6: Update kotlin-springboot skill

**Files:**
- Modify: `company-knowledge/skills/kotlin-springboot/SKILL.md`

- [ ] **Step 1: Update SKILL.md**

Add a new section "## Blade Framework Patterns" before "## Additional Resources":

- **DataResponse<T>** replaces raw `ResponseEntity` — show controller using `toSuccess()` / `failure()` pattern
- **Auth annotations** — `@PreCheckPermission("user:read")`, `@PreCheckIgnore`
- **User context** — inject `CurrentUserHolder.get()` or use `withUser {}` DSL
- **Operation logging** — `@OpLog` annotation with SpEL expressions
- **Logging** — `log.info { "message" }` with kotlin-logging, structured with `toJson()`
- **Configuration** — blade.* property prefix namespace
- Link: `https://aikero-docs.robotees.tech/blade/`

Update frontmatter to add "Blade" triggers.

- [ ] **Step 2: Commit**

```bash
git add company-knowledge/skills/kotlin-springboot/SKILL.md
git commit -m "feat(company-knowledge): update kotlin-springboot skill with Blade framework patterns"
```

---

### Task 7: Update jimmer skill

**Files:**
- Modify: `company-knowledge/skills/jimmer/SKILL.md`

- [ ] **Step 1: Update SKILL.md**

Add a new section "## Blade Jimmer Integration" before "## Additional Resources":

- **BladeKotlinRepository** extends KRepository with Blade base entity support
- **Blade entity base interfaces** — entities implement framework-provided audit field interfaces
- **Jimmer starter** — `blade-jimmer-spring-boot-starter` auto-configures dialect, CosId ID generation
- **Configuration** — show application.yml with `jimmer.id-generator.cosid` enabled, organization/creator filters
- Link: `https://aikero-docs.robotees.tech/blade/modules/mybatisplus.html` (ORM section)

Update frontmatter to add "Blade" triggers.

- [ ] **Step 2: Commit**

```bash
git add company-knowledge/skills/jimmer/SKILL.md
git commit -m "feat(company-knowledge): update jimmer skill with Blade Jimmer integration"
```

---

### Task 8: Update java-to-kotlin skill

**Files:**
- Modify: `company-knowledge/skills/java-to-kotlin/SKILL.md`

- [ ] **Step 1: Update SKILL.md**

Add a brief note in "## Migration Strategy" section after the phased approach:

> **Aikero projects:** When migrating within the Blade framework, also migrate to Blade starters (`blade-web-boot-spring-boot-starter`, `blade-auth-spring-boot-starter`, etc.) and adopt `DataResponse<T>` + auth annotations. See the `blade-framework` skill for details.

Update frontmatter to add "Blade migration" trigger.

- [ ] **Step 2: Commit**

```bash
git add company-knowledge/skills/java-to-kotlin/SKILL.md
git commit -m "feat(company-knowledge): add Blade migration note to java-to-kotlin skill"
```

---

### Task 9: Version bump and verify

**Files:**
- Modify: `company-knowledge/.claude-plugin/plugin.json` (version already set in Task 1)
- Modify: `.claude-plugin/marketplace.json` (version already set in Task 1)

- [ ] **Step 1: Run version check**

```bash
bash scripts/check-plugin-versions.sh
```

Expected: all versions in sync (0.2.0 for company-knowledge)

- [ ] **Step 2: Verify directory structure**

```bash
find company-knowledge -type f | sort
```

Expected: all 17 files present (plugin.json + 7 SKILL.md + 9 reference files)

- [ ] **Step 3: Final commit if needed**

If version check failed, fix with:
```bash
bash scripts/bump-plugin-version.sh company-knowledge 0.2.0
git add company-knowledge/ .claude-plugin/marketplace.json
git commit -m "chore(company-knowledge): sync version to 0.2.0"
```
