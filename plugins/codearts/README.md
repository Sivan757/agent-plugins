# Huawei Cloud CodeArts

Drive the Huawei Cloud CodeArts development-to-operations chain from one local CLI:
pipelines, compilation builds, code checks, code repositories, deployments,
artifact repositories, wiki documents and board data.

## What you can do

- Run a pipeline against a branch, follow it to a terminal status, and read the stage results
- Trigger a compilation build and report the resulting build number
- Run a code check, then summarise the defects it found
- Open, inspect and merge merge requests, and reply to review comments
- Deploy an application and read back the deployment history
- Search artifact repositories and move files in and out
- Read wiki documents and project files
- Query Board datasets
- Reach any of the 782 documented CodeArts API operations, even when no
  scenario command exists yet

## Golden path

Everyday work goes through scenario commands. They resolve task, pipeline, application and
repository **names** to ids for you; a few (a build record, a merge-request iid, a wiki document)
still take the id you already have:

```bash
codearts pipeline run 发布流水线 --branch release/1.2 --var ENV=staging --watch
codearts build run 订单服务构建 --branch main --watch
codearts check run 订单服务检查 --watch && codearts check defects 订单服务检查
codearts repo mr create 订单服务 --source feature/x --target main --title "修复超时"
codearts deploy run 订单服务 --param version=1.2.3
codearts flow --project <name>      # 流水线 / 构建 / 检查 / 部署 最新状态一屏总览
```

Projects are chosen per command rather than pinned as a default, so the same CLI serves the
frontend and the backend project without a sticky setting:

```bash
codearts build list --project backend-project
codearts check list --project frontend-project
```

With several projects visible and no `--project`, commands stop and list the candidates instead of
guessing.

## Fallback primitives

Beyond the scenario commands, `codearts api` exposes the full generated catalog of
documented operations — use it for inspection, manual compensation, or interfaces
that have no scenario wrapper:

```bash
codearts services                                 # the 8 covered services
codearts api list pipeline --search 流水线           # discover operations
codearts api show codeartspipeline.RunPipeline     # method, path and parameters
codearts api call codeartspipeline.RunPipeline \
  --param project_id=<id> --param pipeline_id=<id>   # guarded parameter routing
```

`api call` routes `--param` values into the path, query string or body using the
catalog, and rejects unknown names with the valid parameter list. `--query`,
`--body` and `--header` remain explicit escape hatches for undocumented fields.
For `api call`, `--dry-run` prints the exact signed request without sending it. For a scenario
command it prints the first request only — the one that resolves a name — because the real call
cannot be built until that name is an id.

## Configuration

```bash
codearts config --ui  # browser form, pre-filled: gateway, auth mode, credentials
codearts config       # endpoint and credential summary
codearts doctor     # verify configuration, catalog and gateway connectivity
```

Credentials are stored by the shared config center under
`~/.cache/agent-plugins/codearts/` and are never printed in plaintext.
Two authentication modes are supported: AK/SK request signing
(`SDK-HMAC-SHA256`) and an IAM-issued project token.

A masked key still has to be judgeable, so `codearts config` prints each secret's
length and whether its shape matches what the deployment expects — enough to tell
a truncated paste (`len=18 shape=UNEXPECTED`) from a correct one without the value
ever reaching the terminal. After the first successful call of a run the CLI
records the time, the endpoint and a one-way digest of the credentials in
`verification.json`; a later 401/403 therefore reports whether the same
credentials have worked before, separating a wrong key from a permissions
problem. Upstream messages are scrubbed of any configured secret before they are
printed, since the gateway echoes an unknown access key back in `ak <AK> not exist`.

Endpoints are configured, not guessed: each service either uses a shared gateway
address or its own host. Public-cloud deployments document one region-derived
host per service; private (Huawei Cloud Stack) deployments usually serve each
service from its own host and the documentation only says to ask an
administrator. `codearts endpoint discover --region <region> --domain <domain>`
probes the candidate hosts and reports which one answers for each service; add
`--write` to save them, or pin one with `codearts endpoint set <service> <url>`.
`codearts endpoint list` shows which address each service will use.

## API catalog

`dist/api-catalog.json` is generated from the CodeArts API documentation and
records, for every documented operation, its method, resource path, path/query/
body parameters, required flags and descriptions.

```bash
npm run extract --prefix plugins/codearts     # refresh from the documentation
```

The extraction is cached under `~/.cache/codearts-doc-cache`, so re-runs are
cheap and can run offline from a warm cache. Point it at another mirror with
`CODEARTS_DOC_BASE` and `CODEARTS_DOC_LOCALE`.

## Skills

| Skill | Covers |
| --- | --- |
| `codearts-shared` | configuration, auth, output formats, project resolution, generic API calls |
| `codearts-pipeline` | pipeline list, run, status, logs, stop |
| `codearts-build` | build task list, run, status, records |
| `codearts-check` | check task list, run, progress, defects |
| `codearts-repo` | repositories, branches, merge requests, review comments |
| `codearts-deploy` | applications, environments, deployment runs, hosts |
| `codearts-artifact` | repositories, artifact search, upload and download |
| `codearts-wiki` | document tree, document content, file library |
| `codearts-board` | self-service dataset queries |
| `codearts-delivery-flow` | composing the services into a delivery flow (check gate, build, image, deploy) |

`skills/codearts-shared/references/troubleshooting.md` collects the failures that only show up
against a real deployment — gateway error codes, the two different project ids, pagination quirks —
with a symptom-to-fix table.
