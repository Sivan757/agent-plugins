//
// scenarios/check.ts — CodeArts Check scenario commands.
//
// Golden path: list check tasks, run one, follow its progress, then read the
// defect summary and the individual defects.

import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { matchOne, poll } from "./helpers.js";

export interface CheckTask {
  task_id: string;
  task_name: string;
  [key: string]: unknown;
}

/** Task status codes documented for the progress endpoint. */
const TASK_STATUS_LABEL: Record<string, string> = {
  "0": "checking",
  "1": "failed",
  "2": "succeeded",
  "3": "aborted",
};

const DEFECT_LEVEL_LABEL: Record<string, string> = {
  "0": "fatal",
  "1": "severe",
  "2": "general",
  "3": "hint",
};

export async function listCheckTasks(
  client: CodeartsClient,
  options: { limit?: number } = {}
): Promise<CheckTask[]> {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartscheck",
    method: "GET",
    path: "/v2/{project_id}/tasks",
    pathParams: { project_id: String(projectId) },
    query: { offset: 0, limit: options.limit ?? 100 },
  });
  const tasks = valueAtPath(response.body, "tasks");
  return Array.isArray(tasks) ? (tasks.filter(isRecord) as CheckTask[]) : [];
}

async function resolveCheckTask(client: CodeartsClient, reference: string): Promise<CheckTask> {
  // The service rejects large limits (`APIGW.0106 ... limit, too large`); 100 is
  // accepted by every deployment seen so far. A name that only exists beyond
  // the first hundred tasks must be passed as an id.
  const tasks = await listCheckTasks(client, { limit: 100 });
  return matchOne(tasks, reference, {
    idKeys: ["task_id"],
    nameKeys: ["task_name"],
    label: "check task",
    listHint: "codearts check list",
  });
}

async function progress(client: CodeartsClient, taskId: string) {
  const response = await client.request({
    service: "codeartscheck",
    method: "GET",
    path: "/v2/tasks/{task_id}/progress",
    pathParams: { task_id: taskId },
  });
  return response.body;
}

export function registerCheck(program: Command): void {
  const check = program.command("check").description("Run and inspect CodeArts code checks");

  check
    .command("list")
    .description("List code check tasks in the project")
    .option("--limit <n>", "maximum tasks to return", "100")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const tasks = await listCheckTasks(client, { limit: Number(options.limit ?? 100) });
        emit(
          command,
          tasks.map((task) => ({
            task_id: task.task_id,
            name: task.task_name,
            branch: task.git_branch ?? "",
            repository: task.git_url ?? "",
            last_check: task.last_check_time ?? "",
          })),
          { columns: ["task_id", "name", "branch", "last_check"] }
        );
        note(command, `${tasks.length} check task(s) returned.`);
      })
    );

  check
    .command("run")
    .argument("<task>", "check task id or name")
    .description("Start a code check task and optionally follow it to completion")
    .option("--ref <mode>", "incremental download mode, e.g. merge_request")
    .option("--watch", "follow the check until it finishes")
    .option("--watch-timeout <seconds>", "give up watching after this many seconds", "1800")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const response = await client.request({
          service: "codeartscheck",
          method: "POST",
          path: "/v2/tasks/{task_id}/run",
          pathParams: { task_id: task.task_id },
          ...(options.ref ? { body: { ref: options.ref } } : {}),
        });
        const execId = valueAtPath(response.body, "exec_id");
        emit(command, { task_id: task.task_id, name: task.task_name, exec_id: execId ?? "" });
        if (!options.watch) return;

        const detail = await poll(() => progress(client, task.task_id), {
          isDone: (value) => {
            const status = String(valueAtPath(value, "task_status") ?? "");
            return status !== "" && status !== "0";
          },
          timeoutMs: Number(options.watchTimeout ?? 1800) * 1000,
          onTick: (value) => {
            note(command, `progress=${valueAtPath(value, "progress.ratio") ?? "?"}`);
          },
        });

        const statusCode = String(valueAtPath(detail, "task_status") ?? "");
        process.stdout.write(`\nCheck finished with status: ${TASK_STATUS_LABEL[statusCode] ?? statusCode}\n`);
        if (statusCode !== "2") process.exit(1);
      })
    );

  check
    .command("status")
    .argument("<task>", "check task id or name")
    .description("Show the execution status of a check task")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const detail = await progress(client, task.task_id);
        const statusCode = String(valueAtPath(detail, "task_status") ?? "");
        emit(command, {
          task_id: task.task_id,
          name: task.task_name,
          status: TASK_STATUS_LABEL[statusCode] ?? statusCode,
          progress: valueAtPath(detail, "progress.ratio") ?? "",
        });
      })
    );

  check
    .command("summary")
    .argument("<task>", "check task id or name")
    .description("Show the defect and quality summary of a check task")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const response = await client.request({
          service: "codeartscheck",
          method: "GET",
          path: "/v2/tasks/{task_id}/defects-summary",
          pathParams: { task_id: task.task_id },
        });
        emit(command, response.body);
      })
    );

  check
    .command("defects")
    .argument("<task>", "check task id or name")
    .description("List the defects found by a check task")
    .option("--severity <levels>", "comma-separated severity levels: 0 fatal, 1 severe, 2 general, 3 hint")
    .option("--limit <n>", "maximum defects to return", "50")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const response = await client.request({
          service: "codeartscheck",
          method: "GET",
          path: "/v2/tasks/{task_id}/defects-detail",
          pathParams: { task_id: task.task_id },
          query: {
            offset: 0,
            limit: Number(options.limit ?? 50),
            ...(options.severity ? { severity: options.severity as string } : {}),
          },
        });

        const defects = valueAtPath(response.body, "defects");
        const rows = (Array.isArray(defects) ? defects : []).filter(isRecord).map((defect) => ({
          level: DEFECT_LEVEL_LABEL[String(defect.defect_level ?? "")] ?? defect.defect_level ?? "",
          file: defect.file_path ?? "",
          line: defect.line_number ?? "",
          rule: defect.rule_name ?? defect.defect_checker_name ?? "",
          description: defect.defect_content ?? "",
          defect_id: defect.defect_id ?? "",
        }));

        emit(command, rows, {
          columns: ["level", "file", "line", "rule", "description"],
          footnote: `${rows.length} defect(s) shown; total reported by the service: ${
            valueAtPath(response.body, "total") ?? "unknown"
          }.`,
        });
      })
    );

  check
    .command("stop")
    .argument("<task>", "check task id or name")
    .description("Stop a running check task")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const response = await client.request({
          service: "codeartscheck",
          method: "POST",
          path: "/v2/tasks/{task_id}/stop",
          pathParams: { task_id: task.task_id },
        });
        process.stdout.write(`Stop requested for check task ${task.task_id}.\n`);
      })
    );

  check
    .command("history")
    .argument("<task>", "check task id or name")
    .description("Show past scan results of a check task")
    .option("--limit <n>", "maximum records to return", "20")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const task = await resolveCheckTask(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartscheck",
          method: "GET",
          path: "/v2/{project_id}/tasks/{task_id}/checkrecord",
          pathParams: { project_id: String(projectId), task_id: task.task_id },
          query: { offset: 0, limit: Number(options.limit ?? 20) },
        });
        emit(command, response.body);
      })
    );
}

export { resolveCheckTask };

/** Guard against an empty task list producing a confusing mapping. */
export function assertTasksFound(tasks: unknown[], hint: string): asserts tasks is unknown[] {
  if (tasks.length === 0) {
    throw new PluginError(`No check tasks were returned.\n${hint}`, "QUERY_FAILED");
  }
}
