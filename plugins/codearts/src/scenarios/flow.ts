//
// scenarios/flow.ts — the development-to-operations status board.
//
// Individual services answer "what happened in my area". This command answers
// the question an operator actually starts with: "where is this project right
// now", by reading the latest state from pipelines, builds, checks and
// deployments in one pass.

import type { Command } from "commander";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { formatTimestamp } from "./helpers.js";
import { listPipelines, runRows } from "./pipeline.js";
import { listJobs } from "./build.js";
import { listCheckTasks } from "./check.js";
import { listApps } from "./deploy.js";

interface StatusRow {
  project: string;
  area: string;
  name: string;
  status: string;
  detail: string;
}

/** Areas the board reads, in the order they appear in the output. */
const AREAS = ["pipeline", "build", "check", "deploy"] as const;
type Area = (typeof AREAS)[number];

async function collect(
  client: CodeartsClient,
  area: Area
): Promise<Array<Omit<StatusRow, "project">>> {
  if (area === "pipeline") {
    const pipelines = await listPipelines(client, { limit: 30 });
    return pipelines.map((pipeline) => {
      const row = runRows(pipeline);
      return {
        area: "pipeline",
        name: String(row.name ?? ""),
        status: String(row.last_status ?? ""),
        detail: `run ${row.last_run_id ?? "-"} at ${row.last_started ?? "-"}`,
      };
    });
  }

  if (area === "build") {
    const jobs = await listJobs(client, { limit: 30, projectId: await client.projectId() });
    return jobs.map((job) => ({
      area: "build",
      name: String(job.job_name ?? ""),
      status: String(job.last_build_status ?? ""),
      detail: `last built ${formatTimestamp(job.last_build_time) || "-"}`,
    }));
  }

  if (area === "check") {
    const tasks = await listCheckTasks(client, { limit: 30 });
    return tasks.map((task) => ({
      area: "check",
      name: String(task.task_name ?? ""),
      // The task list carries no status; report when it last ran instead.
      status: task.last_check_time ? "checked" : "never-checked",
      detail: `last check ${String(task.last_check_time ?? "-")}`,
    }));
  }

  const apps = await listApps(client, 30);
  return apps.map((app) => ({
    area: "deploy",
    name: String(app.name ?? ""),
    status: String(app.execution_state ?? ""),
    detail: `last deployed ${formatTimestamp(app.end_time) || "-"}`,
  }));
}

export function registerFlow(program: Command): void {
  program
    .command("flow")
    .description("Show the development-to-operations status of the project")
    .option("--area <area>", "limit to one area: pipeline | build | check | deploy")
    .option("--limit <n>", "maximum rows per area", "30")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const requested = options.area ? String(options.area) : undefined;
        if (requested && !AREAS.includes(requested as Area)) {
          throw new Error(`Unknown area "${requested}". Choose one of: ${AREAS.join(", ")}.`);
        }

        const client = await createClient(command);
        const areas = requested ? [requested as Area] : [...AREAS];
        const limit = Number(options.limit ?? 30);

        // No default project is stored, and a status board is most useful when
        // it covers everything: with no --project, sweep every visible project.
        const targets = client.ctx.projectId
          ? [{ identifier: (await client.projectId()) ?? '', name: client.ctx.projectId ?? '' }]
          : await client.projects();

        const rows: StatusRow[] = [];
        const failures: string[] = [];
        for (const target of targets) {
          const scoped: CodeartsClient = {
            ...client,
            projectId: async () => target.identifier,
          };
          for (const area of areas) {
            try {
              const collected = await collect(scoped, area);
              rows.push(
                ...collected
                  .slice(0, limit)
                  .map((row) => ({ ...row, project: target.name || target.identifier }))
              );
            } catch (error) {
              // One unavailable service must not hide the others.
              failures.push(
                `${target.name || target.identifier} / ${area}: ${(error as Error).message.split("\n")[0]}`
              );
            }
          }
        }

        emit(command, rows, {
          columns: ["project", "area", "name", "status", "detail"],
          footnote: `${rows.length} entr(ies) across ${targets.length} project(s) and ${areas.length} area(s).`,
        });

        if (failures.length > 0) {
          process.stderr.write(`\nUnavailable areas:\n${failures.map((line) => `  ${line}`).join("\n")}\n`);
          note(command, "Retry a single area with: codearts flow --area <area>");
        }
      })
    );
}
