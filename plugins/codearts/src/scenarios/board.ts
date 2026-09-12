//
// scenarios/board.ts — CodeArts Board (efficiency insight) scenario commands.
//
// Board exposes a single integration point: a saved "self-service data
// extraction" API, addressed by name, that returns the dataset it was defined
// with. The command passes through the caller's filters verbatim.

import type { Command } from "commander";
import { action, emit, note } from "../cli-helpers.js";
import { createClient } from "../runtime.js";
import { parseKeyValues } from "../runtime.js";
import { isRecord, valueAtPath } from "../output.js";

export function registerBoard(program: Command): void {
  const board = program.command("board").description("Query CodeArts Board metrics and datasets");

  board
    .command("query")
    .argument("<api-name>", "name of the self-service data extraction API defined in Board")
    .description("Call a Board dataset API and print the returned rows")
    .option("--param <name=value>", "filter passed to the dataset (repeatable)", collect, [])
    .option("--limit <n>", "maximum rows", "100")
    .option("--offset <n>", "row offset", "0")
    .option("--all", "do not truncate the table")
    .action(
      action(async (apiName: string, options: Record<string, unknown>, command: Command) => {
        const client = await createClient(command);
        const body = parseKeyValues(options.param as string[], "--param");
        const response = await client.request({
          service: "codeartsboard",
          method: "POST",
          path: "/v1/{project_id}/access-data-api/{api_name}",
          pathParams: { api_name: apiName },
          query: {
            limit: Number(options.limit ?? 100),
            offset: Number(options.offset ?? 0),
          },
          body,
        });

        const rows =
          (Array.isArray(response.body) ? response.body : undefined) ??
          valueAtPath(response.body, "data") ??
          valueAtPath(response.body, "result");
        if (Array.isArray(rows)) {
          const limited = options.all ? rows : rows.slice(0, 200);
          emit(command, limited);
          note(command, `${rows.length} row(s) returned by ${apiName}.`);
          return;
        }
        if (isRecord(response.body)) {
          emit(command, response.body);
          return;
        }
        emit(command, response.body);
      })
    );

  board
    .command("show")
    .argument("<api-name>", "name of the self-service data extraction API")
    .description("Show the raw response shape of a Board dataset API")
    .action(
      action(async (apiName: string, options: unknown, command: Command) => {
        void options;
        const client = await createClient(command);
        const response = await client.request({
          service: "codeartsboard",
          method: "POST",
          path: "/v1/{project_id}/access-data-api/{api_name}",
          pathParams: { api_name: apiName },
          query: { limit: 1, offset: 0 },
          body: {},
        });
        emit(command, response.body);
      })
    );
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
