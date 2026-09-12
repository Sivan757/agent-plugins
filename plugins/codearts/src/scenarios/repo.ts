//
// scenarios/repo.ts — CodeArts Repo scenario commands.
//
// CodeArts exposes repository identity in two forms: a UUID (used by the v1
// project APIs) and a numeric id (used by the v4 repository APIs). These
// commands resolve a repository name once and hand the right id to each call,
// so callers never have to know which form an endpoint wants.

import type { Command } from "commander";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import type { CodeartsClient } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";
import { arrayFrom, callAny, matchOne, unwrap } from "./helpers.js";

export interface RepositoryRow {
  /** Numeric id required by the /v4/repositories endpoints. */
  repository_id: string;
  /** UUID used by the /v1/projects/{project_uuid} endpoints. */
  repository_uuid: string;
  name: string;
  group: string;
  http_url: string;
}

async function listRepositories(client: CodeartsClient): Promise<RepositoryRow[]> {
  const projectId = await client.projectId();
  const { response } = await callAny(
    client,
    ["codeartsrepo.GetAllRepositoryByProjectId", "codeartsrepo.ShowAllRepositoryByTwoProjectId"],
    { project_uuid: String(projectId), project_id: String(projectId) }
  );
  return arrayFrom(response.body, ["repositorys", "repositories"])
    .filter(isRecord)
    .map((entry) => ({
      repository_id: String(entry.repoId ?? entry.repository_id ?? entry.id ?? ""),
      repository_uuid: String(entry.id ?? entry.repository_uuid ?? ""),
      name: String(entry.name ?? ""),
      group: String(entry.groupName ?? entry.group_name ?? ""),
      http_url: String(entry.httpUrl ?? entry.http_url ?? ""),
    }));
}

async function resolveRepository(client: CodeartsClient, reference: string): Promise<RepositoryRow> {
  const repositories = await listRepositories(client);
  return matchOne(repositories, reference, {
    idKeys: ["repository_id", "repository_uuid"],
    nameKeys: ["name"],
    label: "repository",
    listHint: "codearts repo list",
  });
}

export function registerRepo(program: Command): void {
  const repo = program.command("repo").description("Browse CodeArts repositories and merge requests");

  repo
    .command("list")
    .description("List repositories in the project")
    .action(
      action(async (options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const repositories = await listRepositories(client);
        emit(command, repositories, {
          columns: ["repository_id", "name", "group", "http_url"],
        });
        note(command, `${repositories.length} repository(ies) returned.`);
      })
    );

  repo
    .command("show")
    .argument("<repo>", "repository name, numeric id or uuid")
    .description("Show one repository")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          ["codeartsrepo.ShowRepository", "codeartsrepo.zh-cn_topic_0000002501109464"],
          { repository_id: target.repository_id }
        );
        emit(command, unwrap(response.body));
      })
    );

  repo
    .command("branches")
    .argument("<repo>", "repository name, numeric id or uuid")
    .description("List branches of a repository")
    .action(
      action(async (reference: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          [
            "codeartsrepo.ListBranches",
            "codeartsrepo.ListBranchesByRepositoryId",
            "codeartsrepo.ShowBranchesByRepositoryId",
          ],
          { repository_id: target.repository_id }
        );
        const branches = arrayFrom(response.body, ["branches"]);
        emit(
          command,
          branches.filter(isRecord).map((branch) => ({
            name: branch.name ?? "",
            commit: String(branch.commit_id ?? valueAtPath(branch, "commit.id") ?? "").slice(0, 10),
            default: branch.default === true || branch.is_default === true ? "yes" : "",
          })),
          { columns: ["name", "commit", "default"] }
        );
      })
    );

  const mr = repo.command("mr").description("Work with merge requests");

  mr.command("list")
    .argument("<repo>", "repository name, numeric id or uuid")
    .description("List merge requests of a repository")
    .option("--state <state>", "filter by state, e.g. opened, merged, closed")
    .option("--limit <n>", "maximum merge requests to return", "20")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          [
            "codeartsrepo.ListRepositoryMergeRequests",
            "codeartsrepo.ListMergeRequest",
            "codeartsrepo.zh-cn_topic_0000002500949600",
          ],
          {
            repository_id: target.repository_id,
            ...(options.state ? { state: options.state as string } : {}),
            offset: 0,
            limit: Number(options.limit ?? 20),
          }
        );
        const list = arrayFrom(response.body, ["merge_requests", "merge_request", "data"]);
        const rows = list.filter(isRecord).map((entry) => ({
          iid: entry.iid ?? entry.id ?? "",
          title: entry.title ?? "",
          state: entry.state ?? "",
          source: entry.source_branch ?? "",
          target: entry.target_branch ?? "",
          updated: entry.updated_at ?? "",
        }));
        emit(command, rows, { columns: ["iid", "title", "state", "source", "target", "updated"] });
      })
    );

  mr.command("show")
    .argument("<repo>", "repository name, numeric id or uuid")
    .argument("<iid>", "merge request iid")
    .description("Show one merge request")
    .action(
      action(async (reference: string, iid: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        // The two documented generations name this path parameter differently.
        const { response } = await callAny(
          client,
          ["codeartsrepo.ShowMergeRequestDetail", "codeartsrepo.ShowMergeRequest"],
          {
            repository_id: target.repository_id,
            merge_request_iid: iid,
            merge_request_id: iid,
          }
        );
        emit(command, unwrap(response.body));
      })
    );

  mr.command("create")
    .argument("<repo>", "repository name, numeric id or uuid")
    .description("Open a merge request")
    .requiredOption("--source <branch>", "source branch")
    .requiredOption("--target <branch>", "target branch")
    .requiredOption("--title <text>", "merge request title")
    .option("--description <text>", "merge request description")
    .option("--reviewer-ids <ids>", "comma-separated reviewer user ids")
    .option("--assignee-ids <ids>", "comma-separated assignee user ids")
    .option("--squash", "squash commits on merge")
    .option("--remove-source-branch", "delete the source branch after merge")
    .action(
      action(async (reference: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          ["codeartsrepo.CreateMergeRequest", "codeartsrepo.zh-cn_topic_0000002501109512"],
          { repository_id: target.repository_id },
          {
            title: options.title,
            source_branch: options.source,
            target_branch: options.target,
            state: "opened",
            ...(options.description ? { description: options.description } : {}),
            ...(options.reviewerIds ? { reviewer_ids: options.reviewerIds } : {}),
            ...(options.assigneeIds ? { assignee_ids: options.assigneeIds } : {}),
            ...(options.squash ? { squash: true } : {}),
            ...(options.removeSourceBranch ? { force_remove_source_branch: true } : {}),
          }
        );
        emit(command, {
          iid: valueAtPath(response.body, "iid") ?? "",
          id: valueAtPath(response.body, "id") ?? "",
          title: valueAtPath(response.body, "title") ?? "",
          state: valueAtPath(response.body, "state") ?? "",
          source_branch: valueAtPath(response.body, "source_branch") ?? "",
          target_branch: valueAtPath(response.body, "target_branch") ?? "",
        });
      })
    );

  mr.command("merge")
    .argument("<repo>", "repository name, numeric id or uuid")
    .argument("<iid>", "merge request iid")
    .description("Merge a merge request")
    .option("--message <text>", "merge commit message")
    .option("--squash", "squash commits")
    .action(
      action(async (reference: string, iid: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          ["codeartsrepo.MergeMergeRequest", "codeartsrepo.zh-cn_topic_0000002501109508"],
          { repository_id: target.repository_id, merge_request_iid: iid },
          {
            ...(options.message ? { merge_commit_message: options.message } : {}),
            ...(options.squash ? { squash: true } : {}),
          }
        );
        emit(command, {
          state: valueAtPath(response.body, "state") ?? "",
          merged_at: valueAtPath(response.body, "merged_at") ?? "",
          merge_commit_sha: valueAtPath(response.body, "merge_commit_sha") ?? "",
        });
      })
    );

  mr.command("comments")
    .argument("<repo>", "repository name, numeric id or uuid")
    .argument("<iid>", "merge request iid")
    .description("List review comments on a merge request")
    .option("--limit <n>", "maximum comments to return", "50")
    .action(
      action(async (reference: string, iid: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          ["codeartsrepo.ListMergeRequestDiscussions", "codeartsrepo.GetMergeRequestDiscussions"],
          {
            repository_id: target.repository_id,
            merge_request_iid: iid,
            offset: 0,
            limit: Number(options.limit ?? 50),
          }
        );
        const list = arrayFrom(response.body, ["discussions", "reviews"]);
        const rows = (Array.isArray(list) ? list : []).filter(isRecord).map((entry) => ({
          discussion_id: entry.id ?? "",
          individual_note: entry.individual_note ?? "",
          notes: Array.isArray(entry.notes) ? entry.notes.length : "",
        }));
        emit(command, rows, { columns: ["discussion_id", "individual_note", "notes"] });
      })
    );

  mr.command("comment")
    .argument("<repo>", "repository name, numeric id or uuid")
    .argument("<iid>", "merge request iid")
    .description("Add a comment to a merge request")
    .requiredOption("--body <text>", "comment text")
    .action(
      action(async (reference: string, iid: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const target = await resolveRepository(client, reference);
        const { response } = await callAny(
          client,
          [
            "codeartsrepo.CreateMergeRequestDiscussion_0",
            "codeartsrepo.CreateMergeRequestDiscussion",
          ],
          { repository_id: target.repository_id, merge_request_iid: iid },
          { body: options.body }
        );
        emit(command, response.body);
      })
    );
}
