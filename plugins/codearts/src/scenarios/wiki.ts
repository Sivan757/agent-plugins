//
// scenarios/wiki.ts — CodeArts Wiki (knowledge base) scenario commands.
//
// The Wiki API is id-based: a project owns one knowledge base, which owns a
// document tree. These commands resolve the project -> knowledge base -> tree
// chain so callers can work with document names.

import { readFileSync, writeFileSync } from "node:fs";
import type { Command } from "commander";
import { PluginError } from "@agent-plugins/config-center";
import { action, emit } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { buildMultipart } from "../http.js";
import { flattenTree } from "./helpers.js";

interface TreeNode {
  id: string;
  name: string;
  type?: number;
  children?: TreeNode[];
}

async function knowledgeBaseId(client: CodeartsClient): Promise<string> {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/project/zhishiku/{project_id}",
    pathParams: { project_id: String(projectId) },
  });
  const id = valueAtPath(response.body, "id");
  if (!id) {
    throw new PluginError(
      `The project has no knowledge base, or the response shape changed.\n${JSON.stringify(
        response.body
      ).slice(0, 300)}`,
      "QUERY_FAILED"
    );
  }
  return String(id);
}

async function fileLibraryId(client: CodeartsClient): Promise<string> {
  const projectId = await client.projectId();
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/project/clouddrive/{project_id}",
    pathParams: { project_id: String(projectId) },
  });
  const id = valueAtPath(response.body, "id");
  if (!id) {
    throw new PluginError(
      `The project has no file library, or the response shape changed.\n${JSON.stringify(
        response.body
      ).slice(0, 300)}`,
      "QUERY_FAILED"
    );
  }
  return String(id);
}

async function documentTree(client: CodeartsClient): Promise<TreeNode[]> {
  const response = await client.request({
    service: "codeartswiki",
    method: "GET",
    path: "/v1/openapi/doc/{zhishiku_id}/tree",
    pathParams: { zhishiku_id: await knowledgeBaseId(client) },
  });
  const children = valueAtPath(response.body, "children");
  return (Array.isArray(children) ? children : []).filter(isRecord) as unknown as TreeNode[];
}

function treeRows(root: TreeNode[]): Record<string, unknown>[] {
  return flattenTree(root).map((node) => ({
    depth: node.depth,
    id: node.id ?? "",
    name: `${"  ".repeat(Number(node.depth))}${node.name ?? ""}`,
    type: node.type ?? "",
  }));
}

export function registerWiki(program: Command): void {
  const wiki = program.command("wiki").description("Read CodeArts Wiki documents and files");

  wiki
    .command("tree")
    .description("Show the document tree of the project knowledge base")
    .action(
      action(async (options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const tree = await documentTree(client);
        emit(command, treeRows(tree), { columns: ["id", "name", "type"] });
      })
    );

  wiki
    .command("doc")
    .argument("<document>", "document id")
    .description("Print a wiki document")
    .action(
      action(async (documentId: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const response = await client.request({
          service: "codeartswiki",
          method: "GET",
          path: "/v1/openapi/content/doc/{id}",
          pathParams: { id: documentId },
        });
        const body = response.body;
        const content =
          valueAtPath(body, "content") ??
          valueAtPath(body, "doc_content") ??
          valueAtPath(body, "body") ??
          valueAtPath(body, "data.content");
        if (typeof content === "string") {
          process.stdout.write(`${content}\n`);
          return;
        }
        emit(command, body);
      })
    );

  wiki
    .command("files")
    .description("Show the file tree of the project file library")
    .action(
      action(async (options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const response = await client.request({
          service: "codeartswiki",
          method: "GET",
          path: "/v1/openapi/clouddrive/{zhishiku_id}/tree",
          pathParams: { zhishiku_id: await fileLibraryId(client) },
        });
        const children = valueAtPath(response.body, "children");
        emit(command, treeRows((Array.isArray(children) ? children : []) as TreeNode[]), {
          columns: ["id", "name", "type"],
        });
      })
    );

  wiki
    .command("download")
    .requiredOption("--id <file-id>", "file id from `codearts wiki files`")
    .requiredOption("--out <path>", "local destination file")
    .description("Download a file from the project file library")
    .action(
      action(async (options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const response = await client.request({
          service: "codeartswiki",
          method: "GET",
          path: "/v1/openapi/file/download",
          query: { id: String(options.id) },
        });
        writeFileSync(String(options.out), response.buffer);
        process.stdout.write(`Saved ${response.buffer.length} bytes to ${options.out}.\n`);
      })
    );

  wiki
    .command("upload")
    .argument("<file>", "local file to upload")
    .description("Upload a file into a project file library folder")
    .requiredOption("--parent-id <id>", "parent folder id from `codearts wiki files`")
    .action(
      action(async (file: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const projectId = await client.projectId();
        const content = readFileSync(file);
        const multipart = buildMultipart(
          { project_id: String(projectId), parent_id: String(options.parentId) },
          [{ field: "file", filename: file.split("/").pop() ?? "file", content }]
        );
        const response = await client.request({
          service: "codeartswiki",
          method: "POST",
          path: "/v1/openapi/prj/upload",
          headers: { "content-type": multipart.contentType },
          body: multipart.body,
        });
        emit(command, response.body);
      })
    );

  wiki
    .command("find")
    .argument("<name>", "document name, or part of it")
    .description("Find document ids by name")
    .action(
      action(async (name: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const tree = await documentTree(client);
        const rows = flattenTree(tree).filter((node) =>
          String(node.name ?? "").includes(name)
        );
        if (rows.length === 0) {
          throw new PluginError(
            `No document matches "${name}".\nBrowse the tree with: codearts wiki tree`,
            "QUERY_FAILED"
          );
        }
        emit(
          command,
          rows.map((node) => ({ id: node.id ?? "", name: node.name ?? "", type: node.type ?? "" })),
          { columns: ["id", "name", "type"] }
        );
      })
    );
}
