//
// scenarios/index.ts — registers every scenario command group.
//
// Scenario commands are the golden path: they take names rather than ids,
// chain the calls that always belong together, and answer the operator's
// question. `codearts api ...` remains available for everything else.

import type { Command } from "commander";
import { registerPipeline } from "./pipeline.js";
import { registerBuild } from "./build.js";
import { registerCheck } from "./check.js";
import { registerRepo } from "./repo.js";
import { registerDeploy } from "./deploy.js";
import { registerArtifact } from "./artifact.js";
import { registerWiki } from "./wiki.js";
import { registerBoard } from "./board.js";
import { registerFlow } from "./flow.js";

export function registerScenarios(program: Command): void {
  registerPipeline(program);
  registerBuild(program);
  registerCheck(program);
  registerRepo(program);
  registerDeploy(program);
  registerArtifact(program);
  registerWiki(program);
  registerBoard(program);
  registerFlow(program);
}
