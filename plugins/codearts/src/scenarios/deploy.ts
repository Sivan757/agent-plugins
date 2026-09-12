//
// scenarios/deploy.ts — CodeArts Deploy scenario commands.
//
// Golden path: find an application, look at its environments, start a
// deployment, and read back the deployment history.

import type { Command } from "commander";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { formatTimestamp, matchOne, shiftTime } from "./helpers.js";

export interface AppRow {
  id: string;
  name: string;
  [key: string]: unknown;
}

export async function listApps(client: CodeartsClient, size = 100): Promise<AppRow[]> {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartsdeploy",
    method: "POST",
    path: "/v1/applications/list",
    body: { project_id: projectId, page: 1, size },
  });
  const result = valueAtPath(response.body, "result");
  return Array.isArray(result) ? (result.filter(isRecord) as AppRow[]) : [];
}

async function resolveApp(client: CodeartsClient, reference: string): Promise<AppRow> {
  const apps = await listApps(client);
  return matchOne(apps, reference, {
    idKeys: ["id"],
    nameKeys: ["name"],
    label: "deployment application",
    listHint: "codearts deploy apps",
  });
}

export function registerDeploy(program: Command): void {
  const deploy = program
    .command("deploy")
    .description("Deploy applications and inspect deployment environments");

  deploy
    .command("apps")
    .description("List deployment applications in the project")
    .action(
      action(async (options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const apps = await listApps(client);
        emit(
          command,
          apps.map((app) => ({
            application_id: app.id,
            name: app.name,
            state: app.execution_state ?? "",
            last_deployed: formatTimestamp(app.end_time),
            executor: app.executor_nick_name ?? "",
          })),
          { columns: ["application_id", "name", "state", "last_deployed", "executor"] }
        );
        note(command, `${apps.length} application(s) returned.`);
      })
    );

  deploy
    .command("app")
    .argument("<application>", "application id or name")
    .description("Show one deployment application")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const app = await resolveApp(client, reference);
        const response = await client.request({
          service: "codeartsdeploy",
          method: "GET",
          path: "/v1/applications/{application_id}/info",
          pathParams: { application_id: app.id },
        });
        emit(command, response.body);
      })
    );

  deploy
    .command("envs")
    .argument("<application>", "application id or name")
    .description("List the environments of an application")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const app = await resolveApp(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsdeploy",
          method: "GET",
          path: "/v1/applications/{application_id}/environments",
          pathParams: { application_id: app.id },
          query: { project_id: String(projectId), page_index: 1, page_size: 100 },
        });
        const list =
          (Array.isArray(response.body) ? response.body : undefined) ??
          valueAtPath(response.body, "result") ??
          [];
        emit(
          command,
          (Array.isArray(list) ? list : []).filter(isRecord).map((environment) => ({
            environment_id: environment.id ?? environment.environment_id ?? "",
            name: environment.name ?? "",
            description: environment.description ?? "",
          })),
          { columns: ["environment_id", "name", "description"] }
        );
      })
    );

  deploy
    .command("run")
    .argument("<application>", "application id or name")
    .description("Start a deployment and report the created record")
    .option("--param <name=value>", "deployment parameter (repeatable)", collect, [])
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const app = await resolveApp(client, reference);
        const params = parseParams(options.param as string[]);
        const response = await client.request({
          service: "codeartsdeploy",
          method: "POST",
          path: "/v2/tasks/{task_id}/start",
          pathParams: { task_id: app.id },
          body: { params, trigger_source: "API" },
        });
        emit(command, {
          application_id: app.id,
          name: app.name,
          record_id: valueAtPath(response.body, "id") ?? "",
          job_name: valueAtPath(response.body, "job_name") ?? "",
        });
        note(command, `Follow the deployment with: codearts deploy history ${app.id}`);
      })
    );

  deploy
    .command("history")
    .argument("<application>", "application id or name")
    .description("List recent deployment records of an application")
    .option("--since <time>", "window start, e.g. -7d or an ISO timestamp", "-7d")
    .option("--limit <n>", "maximum records to return", "20")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const app = await resolveApp(client, reference);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsdeploy",
          method: "GET",
          path: "/v2/{project_id}/task/{task_id}/history",
          pathParams: { project_id: String(projectId), task_id: app.id },
          query: {
            page: 1,
            size: Number(options.limit ?? 20),
            start_date: new Date(shiftTime(options.since as string, 7 * 86_400_000)).toISOString(),
            end_date: new Date().toISOString(),
          },
        });
        const list =
          (Array.isArray(response.body) ? response.body : undefined) ??
          valueAtPath(response.body, "result") ??
          valueAtPath(response.body, "records") ??
          [];
        emit(
          command,
          (Array.isArray(list) ? list : []).filter(isRecord).map((record) => ({
            record_id: record.id ?? "",
            state: record.state ?? record.execution_state ?? "",
            operator: record.operator ?? record.executor ?? "",
            started: formatTimestamp(record.start_time ?? record.create_time),
            ended: formatTimestamp(record.end_time),
          })),
          { columns: ["record_id", "state", "operator", "started", "ended"] }
        );
      })
    );

  deploy
    .command("hosts")
    .description("List host clusters and their hosts")
    .option("--cluster <id>", "list the hosts of one cluster instead of the cluster list")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const projectId = await client.projectId();
        if (options.cluster) {
          const response = await client.request({
            service: "codeartsdeploy",
            method: "GET",
            path: "/v1/resources/host-groups/{group_id}/hosts",
            pathParams: { group_id: String(options.cluster) },
            query: { page_index: 1, page_size: 100 },
          });
          const hosts = valueAtPath(response.body, "result") ?? [];
          emit(
            command,
            (Array.isArray(hosts) ? hosts : []).filter(isRecord).map((host) => ({
              host_id: host.id ?? "",
              ip: host.ip ?? "",
              name: host.name ?? "",
              os: host.os ?? "",
              connection_status: host.connection_status ?? "",
            })),
            { columns: ["host_id", "ip", "name", "os", "connection_status"] }
          );
          return;
        }

        const response = await client.request({
          service: "codeartsdeploy",
          method: "GET",
          path: "/v1/resources/host-groups",
          query: { project_id: String(projectId), page_index: 1, page_size: 100 },
        });
        const clusters = valueAtPath(response.body, "result") ?? [];
        emit(
          command,
          (Array.isArray(clusters) ? clusters : []).filter(isRecord).map((cluster) => ({
            cluster_id: cluster.id ?? cluster.group_id ?? "",
            name: cluster.name ?? "",
            os: cluster.os ?? "",
            hosts: cluster.host_count ?? "",
          })),
          { columns: ["cluster_id", "name", "os", "hosts"] }
        );
      })
    );
}

function parseParams(values: string[] | undefined): Array<{ name: string; value: string }> {
  const result: Array<{ name: string; value: string }> = [];
  for (const entry of values ?? []) {
    const index = entry.indexOf("=");
    if (index <= 0) continue;
    result.push({ name: entry.slice(0, index), value: entry.slice(index + 1) });
  }
  return result;
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
