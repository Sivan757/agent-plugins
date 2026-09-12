//
// scenarios/pipeline.ts — CodeArts Pipeline scenario commands.
//
// Golden path: list pipelines, start one against a branch with variables, and
// follow the run to a terminal status. The caller works with names and
// branches; ids and polling stay inside the command.

import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { formatTimestamp, isTerminalStatus, matchOne, parseAssignments, poll } from "./helpers.js";

export interface PipelineRow {
  pipeline_id: string;
  name: string;
  [key: string]: unknown;
}

export async function listPipelines(client: CodeartsClient, options: { search?: string; limit?: number } = {}) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartspipeline",
    method: "POST",
    path: "/v5/{project_id}/api/pipelines/list",
    projectId,
    body: {
      ...(options.search ? { name: options.search } : {}),
      offset: 0,
      limit: options.limit ?? 50,
    },
  });
  const pipelines = valueAtPath(response.body, "pipelines");
  return Array.isArray(pipelines) ? (pipelines as PipelineRow[]) : [];
}

async function resolvePipeline(client: CodeartsClient, reference: string): Promise<PipelineRow> {
  const pipelines = await listPipelines(client, { limit: 200 });
  return matchOne(pipelines, reference, {
    idKeys: ["pipeline_id"],
    nameKeys: ["name"],
    label: "pipeline",
    listHint: "codearts pipeline list",
  });
}

export function runRows(pipeline: PipelineRow): Record<string, unknown> {
  const latest = isRecord(pipeline.latest_run) ? pipeline.latest_run : {};
  return {
    pipeline_id: pipeline.pipeline_id,
    name: pipeline.name,
    last_run_id: latest.pipeline_run_id ?? "",
    last_status: latest.status ?? statusFromStages(latest.stage_status_list),
    last_executor: latest.executor_name ?? "",
    last_started: formatTimestamp(latest.start_time),
  };
}

function statusFromStages(stages: unknown): string {
  if (!Array.isArray(stages) || stages.length === 0) return "";
  const statuses = stages.map((stage) => (isRecord(stage) ? String(stage.status ?? "") : ""));
  if (statuses.some((status) => status === "FAILED")) return "FAILED";
  if (statuses.every((status) => status === "COMPLETED" || status === "IGNORED" || status === "SKIPPED")) {
    return "COMPLETED";
  }
  const running = statuses.find((status) => status === "RUNNING");
  return running ?? statuses.find(Boolean) ?? "";
}

async function fetchRunDetail(client: CodeartsClient, pipelineId: string, runId?: string) {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartspipeline",
    method: "GET",
    path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/detail",
    pathParams: { project_id: String(projectId), pipeline_id: pipelineId },
    query: runId ? { pipeline_run_id: runId } : {},
  });
  return response.body;
}

function stageRows(detail: unknown): Record<string, unknown>[] {
  const stages = valueAtPath(detail, "stages");
  if (!Array.isArray(stages)) return [];
  return stages.filter(isRecord).map((stage) => ({
    stage: stage.name ?? stage.identifier ?? "",
    status: stage.status ?? "",
    started: formatTimestamp(stage.start_time),
    ended: formatTimestamp(stage.end_time),
  }));
}

export function registerPipeline(program: Command): void {
  const pipeline = program
    .command("pipeline")
    .description("Run and inspect CodeArts pipelines");

  pipeline
    .command("list")
    .description("List pipelines in the project with their latest run status")
    .option("--search <keyword>", "filter by pipeline name")
    .option("--limit <n>", "maximum pipelines to return", "50")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const pipelines = await listPipelines(client, {
          search: options.search as string | undefined,
          limit: Number(options.limit ?? 50),
        });
        emit(command, pipelines.map(runRows), {
          columns: ["pipeline_id", "name", "last_status", "last_run_id", "last_started"],
        });
        note(command, `${pipelines.length} pipeline(s) returned.`);
      })
    );

  pipeline
    .command("run")
    .argument("<pipeline>", "pipeline id or name")
    .description("Start a pipeline, optionally on a branch with variables")
    .option("--branch <name>", "branch or tag to build")
    .option("--var <name=value>", "pipeline variable (repeatable)", collect, [])
    .option("--sources <json>", "full sources array, overriding --branch")
    .option("--description <text>", "run description")
    .option("--watch", "follow the run until it reaches a terminal status")
    .option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolvePipeline(client, reference);
        const pipelineId = target.pipeline_id;
        const projectId = await client.projectId();

        const variables = parseAssignments(options.var as string[], "--var");
        const sources = options.sources
          ? (JSON.parse(options.sources as string) as unknown)
          : options.branch
            ? [
                {
                  type: "code",
                  params: { build_params: { build_type: "branch", target_branch: options.branch } },
                },
              ]
            : undefined;

        const body: Record<string, unknown> = {};
        if (sources) body.sources = sources;
        if (options.description) body.description = options.description;
        if (Object.keys(variables).length > 0) {
          body.variables = Object.entries(variables).map(([name, value]) => ({ name, value }));
        }

        const response = await client.request({
          service: "codeartspipeline",
          method: "POST",
          path: "/v5/{project_id}/api/pipelines/{pipeline_id}/run",
          projectId,
          body,
        });

        const runId = valueAtPath(response.body, "pipeline_run_id");
        if (!runId) {
          throw new PluginError(
            `Pipeline started but no pipeline_run_id was returned.\n${JSON.stringify(response.body)}`,
            "QUERY_FAILED"
          );
        }

        if (!options.watch) {
          emit(command, { pipeline_id: pipelineId, pipeline_run_id: runId, name: target.name });
          return;
        }

        const detail = await poll(() => fetchRunDetail(client, pipelineId, String(runId)), {
          isDone: (value) => isTerminalStatus(valueAtPath(value, "status")),
          timeoutMs: Number(options.watchTimeout ?? 1800) * 1000,
          onTick: (value) => {
            note(command, `status=${valueAtPath(value, "status") ?? "unknown"}`);
          },
        });

        emit(command, {
          pipeline_id: pipelineId,
          pipeline_run_id: runId,
          name: valueAtPath(detail, "name") ?? target.name,
          status: valueAtPath(detail, "status"),
          run_number: valueAtPath(detail, "run_number"),
          start_time: formatTimestamp(valueAtPath(detail, "start_time")),
          end_time: formatTimestamp(valueAtPath(detail, "end_time")),
        });

        const stages = stageRows(detail);
        if (stages.length > 0) {
          process.stdout.write("\n");
          emit(command, stages, { columns: ["stage", "status", "started", "ended"] });
        }

        if (String(valueAtPath(detail, "status")) !== "COMPLETED") process.exit(1);
      })
    );

  pipeline
    .command("status")
    .argument("<pipeline>", "pipeline id or name")
    .argument("[run-id]", "pipeline run id; defaults to the most recent run")
    .description("Show the status and stages of one pipeline run")
    .action(
      action(async (reference: string, runId: string | undefined, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const target = await resolvePipeline(client, reference);
        const detail = await fetchRunDetail(client, target.pipeline_id, runId);
        emit(command, {
          pipeline_id: target.pipeline_id,
          pipeline_run_id: valueAtPath(detail, "id") ?? runId ?? "",
          name: valueAtPath(detail, "name") ?? target.name,
          status: valueAtPath(detail, "status"),
          run_number: valueAtPath(detail, "run_number"),
          executor: valueAtPath(detail, "executor_name"),
          start_time: formatTimestamp(valueAtPath(detail, "start_time")),
          end_time: formatTimestamp(valueAtPath(detail, "end_time")),
        });
        const stages = stageRows(detail);
        if (stages.length > 0) {
          process.stdout.write("\n");
          emit(command, stages, { columns: ["stage", "status", "started", "ended"] });
        }
      })
    );

  pipeline
    .command("runs")
    .argument("<pipeline>", "pipeline id or name")
    .description("List recent runs of a pipeline")
    .option("--limit <n>", "maximum runs to return", "20")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolvePipeline(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartspipeline",
          method: "POST",
          path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/list",
          pathParams: { project_id: String(projectId), pipeline_id: target.pipeline_id },
          body: { limit: Number(options.limit ?? 20), offset: 0 },
        });
        const runs = valueAtPath(response.body, "pipeline_runs") ?? valueAtPath(response.body, "runs");
        const rows = (Array.isArray(runs) ? runs : []).filter(isRecord).map((run) => ({
          run_id: run.pipeline_run_id ?? run.id ?? "",
          status: run.status ?? "",
          run_number: run.run_number ?? "",
          executor: run.executor_name ?? "",
          started: formatTimestamp(run.start_time),
          ended: formatTimestamp(run.end_time),
        }));
        emit(command, rows, { columns: ["run_id", "status", "run_number", "started", "ended"] });
      })
    );

  pipeline
    .command("stop")
    .argument("<pipeline>", "pipeline id or name")
    .argument("<run-id>", "pipeline run id")
    .description("Stop a running pipeline instance")
    .action(
      action(async (reference: string, runId: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const target = await resolvePipeline(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartspipeline",
          method: "POST",
          path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/{pipeline_run_id}/stop",
          pathParams: {
            project_id: String(projectId),
            pipeline_id: target.pipeline_id,
            pipeline_run_id: runId,
          },
        });
        process.stdout.write(`Stop requested for run ${runId}.\n`);
      })
    );

  pipeline
    .command("logs")
    .argument("<pipeline>", "pipeline id or name")
    .argument("<run-id>", "pipeline run id")
    .requiredOption("--job-run-id <id>", "job run id, from `pipeline status <pipeline> <run> --format json`")
    .requiredOption("--step-run-id <id>", "step run id, from the same payload")
    .description("Print the log of one pipeline step")
    .option("--limit <n>", "log characters to fetch", "5000")
    .action(
      action(
        async (
          reference: string,
          runId: string,
          options: Record<string, unknown>,
          command: Command
        ) => {
          const client = await createClient(command);
          const target = await resolvePipeline(client, reference);
          const projectId = await client.projectId();
          const response = await client.request({
            service: "codeartspipeline",
            method: "POST",
            path: "/v5/{project_id}/api/pipelines/{pipeline_id}/pipeline-runs/{pipeline_run_id}/jobs/{job_run_id}/steps/{step_run_id}/logs",
            pathParams: {
              project_id: String(projectId),
              pipeline_id: target.pipeline_id,
              pipeline_run_id: runId,
              job_run_id: String(options.jobRunId),
              step_run_id: String(options.stepRunId),
            },
            body: {
              start_offset: 0,
              end_offset: 0,
              limit: Number(options.limit ?? 5000),
              sort: "asc",
            },
          });
          const log = valueAtPath(response.body, "log");
          process.stdout.write(typeof log === "string" ? `${log}\n` : `${JSON.stringify(response.body, null, 2)}\n`);
        }
      )
    );
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
