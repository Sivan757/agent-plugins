//
// scenarios/build.ts — CodeArts Build scenario commands.
//
// Golden path: find a build task by name, run it against a branch with
// parameters, and report the resulting build number and step status.

import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { formatTimestamp, matchOne, parseAssignments, shiftTime } from "./helpers.js";

export interface JobRow {
  id: string;
  job_name: string;
  [key: string]: unknown;
}

export async function listJobs(
  client: CodeartsClient,
  options: { search?: string; limit?: number; projectId?: string } = {}
): Promise<JobRow[]> {
  const limit = options.limit ?? 50;
  const search = options.search;
  // The documented page_index/page_size pair filters this endpoint down to an
  // empty list even when `total` is non-zero, so page locally instead.
  const response = await client.request({
    service: "codeartsbuild",
    method: "GET",
    path: "/v1/job/list",
    ...(search ? { query: { search } } : {}),
  });
  const jobs = valueAtPath(response.body, "result.job_list");
  const all = (Array.isArray(jobs) ? jobs.filter(isRecord) : []) as JobRow[];
  // This endpoint lists the caller's jobs across every project, so a project
  // view has to filter locally.
  const scoped = options.projectId
    ? all.filter((job) => String(job.project_id ?? "") === options.projectId)
    : all;
  return scoped.slice(0, limit);
}

async function resolveJob(client: CodeartsClient, reference: string): Promise<JobRow> {
  // `/v1/job/list` is user-scoped: without this filter a task from another
  // project could be picked while the caller asked for a specific project.
  const scopedProject = client.ctx.projectId ? await client.projectId() : undefined;
  const jobs = await listJobs(client, { limit: 200, projectId: scopedProject });

  if (jobs.length === 0 && scopedProject) {
    // Say what the caller is actually looking at, instead of "nothing exists".
    const elsewhere = await listJobs(client, { limit: 200 });
    if (elsewhere.length > 0) {
      throw new PluginError(
        `No build task in the selected project.\n` +
          `These tasks exist in other projects — drop --project or choose the right one:\n` +
          elsewhere
            .slice(0, 15)
            .map((job) => `  ${job.job_name}   (project ${job.project_name ?? job.project_id ?? "?"})`)
            .join("\n"),
        "QUERY_FAILED"
      );
    }
  }

  return matchOne(jobs, reference, {
    idKeys: ["id"],
    nameKeys: ["job_name"],
    label: "build task",
    listHint: "codearts build list",
  });
}

export async function listJobsForContext(client: CodeartsClient, search?: string) {
  return listJobs(client, { search });
}

export function jobRows(jobs: JobRow[]): Record<string, unknown>[] {
  return jobs.map((job) => ({
    job_id: job.id,
    name: job.job_name,
    project: job.project_name ?? job.project_id ?? "",
    last_status: job.last_build_status ?? "",
    last_running: job.last_job_running_status ?? "",
    last_built: formatTimestamp(job.last_build_time),
  }));
}

export function registerBuild(program: Command): void {
  const build = program.command("build").description("Trigger and inspect CodeArts compilation builds");

  build
    .command("list")
    .description("List build tasks visible to the current user")
    .option("--search <keyword>", "filter by task name")
    .option("--limit <n>", "maximum tasks to return", "50")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const jobs = await listJobs(client, {
          search: options.search as string | undefined,
          limit: Number(options.limit ?? 50),
          projectId: client.ctx.projectId ? await client.projectId() : undefined,
        });
        emit(command, jobRows(jobs), {
          columns: ["job_id", "name", "last_status", "last_running", "last_built"],
        });
        note(command, `${jobs.length} build task(s) returned.`);
      })
    );

  build
    .command("show")
    .argument("<job>", "build task id or name")
    .description("Show one build task and its recent records")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const job = await resolveJob(client, reference);
        const response = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/job/{job_id}/info",
          pathParams: { job_id: job.id },
        });
        emit(command, response.body);
      })
    );

  build
    .command("run")
    .argument("<job>", "build task id or name")
    .description("Run a build task, optionally against a branch with parameters")
    .option("--branch <name>", "branch or tag to build")
    .option("--param <name=value>", "build parameter (repeatable)", collect, [])
    .option("--watch", "follow the build until it finishes")
    .option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const job = await resolveJob(client, reference);
        const parameters = parseAssignments(options.param as string[], "--param");

        const body: Record<string, unknown> = {
          job_id: job.id,
          ...(Object.keys(parameters).length > 0
            ? {
                parameter: Object.entries(parameters).map(([name, value]) => ({ name, value })),
              }
            : {}),
          ...(options.branch
            ? { scm: { branch: options.branch, build_type: "branch" } }
            : {}),
        };

        const response = await client.request({
          service: "codeartsbuild",
          method: "POST",
          path: "/v1/job/execute",
          body,
        });

        const buildNumber = valueAtPath(response.body, "actual_build_number") ?? valueAtPath(response.body, "daily_build_number");
        emit(command, {
          job_id: job.id,
          name: job.job_name,
          build_number: buildNumber ?? "",
          daily_build_number: valueAtPath(response.body, "daily_build_number") ?? "",
        });

        if (!options.watch) return;

        const deadline = Number(options.watchTimeout ?? 1800) * 1000;
        const started = Date.now();
        for (;;) {
          const status = await client.request({
            service: "codeartsbuild",
            method: "GET",
            path: "/v1/job/{job_id}/status",
            pathParams: { job_id: job.id },
          });
          const state = valueAtPath(status.body, "result.status") ?? valueAtPath(status.body, "status");
          note(command, `status=${String(state)}`);
          if (!isRecord(status.body) || isFinished(state)) {
            process.stdout.write(`${JSON.stringify(status.body, null, 2)}\n`);
            // A non-success terminal status must fail the command so callers can
            // chain `build run --watch && deploy run ...` as a release gate.
            if (!isSuccess(state)) {
              throw new PluginError(
                `Build task ${job.id} finished with status "${String(state)}".`,
                "QUERY_FAILED"
              );
            }
            return;
          }
          if (Date.now() - started > deadline) {
            throw new PluginError(
              `Gave up waiting after ${Math.round((Date.now() - started) / 1000)}s; the build is still running.\n` +
                `Re-check it with: codearts build status ${job.id}`,
              "QUERY_FAILED"
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      })
    );

  build
    .command("status")
    .argument("<job>", "build task id or name")
    .description("Show whether a build task is running and its step status")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const job = await resolveJob(client, reference);
        const running = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/job/{job_id}/running-status",
          pathParams: { job_id: job.id },
        });
        const steps = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/job/{job_id}/status",
          pathParams: { job_id: job.id },
        });
        process.stdout.write(`${JSON.stringify({ running: running.body, steps: steps.body }, null, 2)}\n`);
      })
    );

  build
    .command("records")
    .argument("<job>", "build task id or name")
    .description("List recent build records of a task")
    .option("--since <time>", "start of the window, e.g. -7d or an ISO timestamp", "-7d")
    .option("--until <time>", "end of the window, defaults to now")
    .option("--limit <n>", "maximum records to return", "20")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const job = await resolveJob(client, reference);
        const response = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/record/{job_id}/list",
          pathParams: { job_id: job.id },
          query: {
            start_time: shiftTime(options.since as string, 7 * 86_400_000),
            end_time: options.until ? shiftTime(options.until as string, 0) : Date.now(),
            page_size: Number(options.limit ?? 20),
          },
        });
        emit(command, response.body);
      })
    );

  build
    .command("record")
    .argument("<record-id>", "build record id, from `codearts build records`")
    .description("Show one build record, including its stages")
    .action(
      action(async (recordId: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const detail = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/record/{record_id}/info",
          pathParams: { record_id: recordId },
        });
        const stages = await client.request({
          service: "codeartsbuild",
          method: "GET",
          path: "/v1/record/{record_id}/full-stages",
          pathParams: { record_id: recordId },
        });
        process.stdout.write(`${JSON.stringify({ record: detail.body, stages: stages.body }, null, 2)}\n`);
      })
    );

  build
    .command("stop")
    .argument("<job>", "build task id or name")
    .description("Stop a running build task")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const job = await resolveJob(client, reference);
        const response = await client.request({
          service: "codeartsbuild",
          method: "POST",
          path: "/v1/job/{job_id}/stop",
          pathParams: { job_id: job.id },
        });
        process.stdout.write(`Stop requested for build task ${job.id}.\n`);
      })
    );
}

/** Statuses that mean the build succeeded. */
function isSuccess(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  return ["finished", "success", "successful", "ok"].includes(String(status).toLowerCase());
}

/** Build statuses that mean the task stopped producing progress. */
function isFinished(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  return ["finished", "success", "successful", "failed", "aborted", "canceled", "stopped"].includes(
    String(status).toLowerCase()
  );
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
