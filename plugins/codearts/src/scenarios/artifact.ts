//
// scenarios/artifact.ts — CodeArts Artifact scenario commands.
//
// Golden path: find a repository, search what is inside it, and move a single
// file in or out. Repository listing needs the account (tenant) id, which is
// resolved from configuration, IAM, or `--tenant`.

import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { matchOne } from "./helpers.js";

interface RepositoryRow {
  id: string;
  name: string;
  format: string;
  [key: string]: unknown;
}

/** True when the gateway reports that this path carries no published API. */
function isUnpublished(error: unknown): boolean {
  return /APIGW\.0101/.test((error as Error).message ?? "");
}

async function listRepositories(
  client: CodeartsClient,
  options: { search?: string; format?: string; tenant?: string } = {}
): Promise<RepositoryRow[]> {
  const projectId = await client.projectId();
  const tenantId = options.tenant ?? (await client.tenantId());
  let response;
  try {
    response = await client.request({
    service: "codeartsartifact",
    method: "GET",
    path: "/cloudartifact/v5/{tenant_id}/{project_id}/repositories",
    pathParams: { tenant_id: tenantId, project_id: String(projectId) },
      query: {
        page_no: 1,
        page_size: 100,
        ...(options.search ? { qname: options.search } : {}),
        ...(options.format ? { format: options.format } : {}),
      },
    });
  } catch (error) {
    if (isUnpublished(error)) {
      throw new PluginError(
        "This deployment does not publish the private-repository API " +
          "(/cloudartifact/... is absent from the gateway).\n" +
          "Only the release library is available here; try:\n" +
          "  codearts artifact versions\n" +
          "  codearts artifact release-files <file-name>",
        "QUERY_FAILED"
      );
    }
    throw error;
  }
  const repositories = valueAtPath(response.body, "result.repositories");
  if (!Array.isArray(repositories)) return [];
  return repositories.filter(isRecord).map((entry) => ({
    id: String(entry.id ?? entry.repoId ?? entry.name ?? ""),
    name: String(entry.name ?? entry.repositoryName ?? ""),
    format: String(entry.format ?? ""),
  }));
}

async function resolveRepository(
  client: CodeartsClient,
  reference: string,
  tenant?: string
): Promise<RepositoryRow> {
  const repositories = await listRepositories(client, { tenant });
  return matchOne(repositories, reference, {
    idKeys: ["id"],
    nameKeys: ["name"],
    label: "artifact repository",
    listHint: "codearts artifact repos",
  });
}

export function registerArtifact(program: Command): void {
  const artifact = program
    .command("artifact")
    .description("Browse artifact repositories and move files in and out");

  artifact
    .command("repos")
    .description("List artifact repositories")
    .option("--search <keyword>", "filter repositories by name")
    .option("--format-filter <format>", "filter by package format, e.g. maven, npm, docker")
    .option("--tenant <id>", "account (tenant) id when it is not configured")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const repositories = await listRepositories(client, {
          search: options.search as string | undefined,
          format: options.formatFilter as string | undefined,
          tenant: options.tenant as string | undefined,
        });
        emit(command, repositories, { columns: ["name", "format", "id"] });
        note(command, `${repositories.length} repository(ies) returned.`);
      })
    );

  artifact
    .command("versions")
    .description("List release-library versions of the project")
    .option("--build-version <version>", "filter by build version")
    .option("--limit <n>", "maximum versions to return", "20")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsartifact",
          method: "GET",
          path: "/v1/{project_id}/versions",
          pathParams: { project_id: String(projectId) },
          query: {
            offset: 0,
            limit: Number(options.limit ?? 20),
            ...(options.buildVersion ? { build_version: options.buildVersion as string } : {}),
          },
        });
        const result = valueAtPath(response.body, "result");
        if (Array.isArray(result)) {
          emit(command, result);
          return;
        }
        emit(command, response.body);
      })
    );

  artifact
    .command("release-files")
    .argument("<file-name>", "release file name to look up")
    .description("Find the versions of one release file")
    .option("--limit <n>", "maximum rows to return", "20")
    .action(
      action(async (fileName: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsartifact",
          method: "GET",
          path: "/v2/{project_id}/release/files",
          pathParams: { project_id: String(projectId) },
          query: { file_name: fileName, offset: 0, limit: Number(options.limit ?? 20) },
        });
        emit(command, response.body);
      })
    );

  artifact
    .command("release-file")
    .argument("<file-name>", "release file name")
    .argument("<file-path>", "path of the file inside the release library")
    .description("Show one release-library file")
    .action(
      action(
        async (
          fileName: string,
          filePath: string,
          options: unknown,
          command: Command
        ) => {
          void options;
          const client = await createClient(command);
          const projectId = await client.projectId();
          const response = await client.request({
            service: "codeartsartifact",
            method: "GET",
            path: "/v2/{project_id}/release/file",
            pathParams: { project_id: String(projectId) },
            query: { file_name: fileName, file_path: filePath },
          });
          emit(command, response.body);
        }
      )
    );

  artifact
    .command("search")
    .argument("<artifact-name>", "artifact name, or part of it")
    .description("Search artifacts across repositories")
    .option("--type <type>", "artifact type filter")
    .option("--limit <n>", "maximum results", "30")
    .action(
      action(async (name: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const projectId = await client.projectId();
        const response = await client.request({
          service: "codeartsartifact",
          method: "POST",
          path: "/cloudartifact/v5/tree/repos/artifacts",
          body: {
            artifact_name: name,
            project_id: projectId,
            in_project: true,
            page_no: 1,
            page_size: Number(options.limit ?? 30),
            ...(options.type ? { artifact_type: options.type } : {}),
          },
        });
        const list = valueAtPath(response.body, "result.data") ?? valueAtPath(response.body, "result") ?? [];
        emit(
          command,
          (Array.isArray(list) ? list : []).filter(isRecord).map((entry) => ({
            name: entry.name ?? entry.artifact_name ?? "",
            version: entry.version ?? "",
            repository: entry.repo ?? entry.repository_name ?? "",
            path: entry.path ?? "",
          })),
          { columns: ["name", "version", "repository", "path"] }
        );
      })
    );

  artifact
    .command("upload")
    .argument("<repository>", "repository name or id")
    .argument("<file>", "local file to upload")
    .description("Upload one file into an artifact repository")
    .requiredOption("--path <remote-path>", "remote path inside the repository")
    .option("--tenant <id>", "account (tenant) id when it is not configured")
    .action(
      action(
        async (
          reference: string,
          file: string,
          options: Record<string, unknown>,
          command: Command
        ) => {
          const client = await createClient(command);
          const repository = await resolveRepository(
            client,
            reference,
            options.tenant as string | undefined
          );
          const content = readFileSync(file);
          const response = await client.request({
            service: "codeartsartifact",
            method: "PUT",
            path: "/artgalaxy/{repo_id}/{file_path}",
            pathParams: {
              repo_id: repository.id,
              file_path: String(options.path).replace(/^\/+/, ""),
            },
            headers: { "content-type": "application/octet-stream" },
            body: content,
          });
          emit(command, response.body);
          note(command, `Uploaded ${basename(file)} to ${repository.name}.`);
        }
      )
    );

  artifact
    .command("download")
    .argument("<repository>", "repository name or id")
    .argument("<remote-path>", "path of the file inside the repository")
    .description("Download one file from an artifact repository")
    .requiredOption("--out <path>", "local destination file")
    .option("--tenant <id>", "account (tenant) id when it is not configured")
    .action(
      action(
        async (
          reference: string,
          remotePath: string,
          options: Record<string, unknown>,
          command: Command
        ) => {
          const client = await createClient(command);
          const repository = await resolveRepository(
            client,
            reference,
            options.tenant as string | undefined
          );
          const response = await client.request({
            service: "codeartsartifact",
            method: "GET",
            path: "/artgalaxy/{repo_id}/{file_path}",
            pathParams: { repo_id: repository.id, file_path: remotePath.replace(/^\/+/, "") },
          });
          writeFileSync(String(options.out), response.buffer);
          process.stdout.write(
            `Saved ${response.buffer.length} bytes to ${options.out}.\n`
          );
        }
      )
    );
}
