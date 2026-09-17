import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "zentao",
  version: "0.1.8",
  description:
    "Zentao (禅道) CLI skill — query and operate Zentao project-management data (programs, products, projects, executions, stories, bugs, tasks, test cases, plans, releases, feedback, users, attachments) via the zentao command-line tool",
  author: { name: "Agent Plugins" },
  keywords: ["zentao", "禅道", "project-management", "cli", "bug", "task"],
  marketplace: {
    description:
      "Zentao (禅道) CLI skill — query and operate Zentao project-management data (programs, products, projects, executions, stories, bugs, tasks, test cases, plans, releases, feedback, users, attachments) via the zentao command-line tool. Use when the user mentions 禅道/zentao, asks for project progress, bug lists, task creation, or story status updates.",
  },
} satisfies PluginConfig;
