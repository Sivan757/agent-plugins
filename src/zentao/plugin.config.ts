import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "zentao",
  version: "0.1.7",
  description: "Zentao (禅道) CLI skill — query and operate Zentao project-management data (programs, products, projects, executions, stories, bugs, tasks, test cases, plans, releases, feedback, users, attachments) via the zentao command-line tool",
  author: { name: "Agent Plugins" },
  keywords: ["zentao", "禅道", "project-management", "cli", "bug", "task"],
  category: "Productivity",
  interface: {
    displayName: "Zentao",
    shortDescription: "Query and operate Zentao (禅道) project-management data through the zentao CLI — stories, bugs, tasks, executions, releases and more.",
    longDescription:
      "Ported from easysoft/zentao-skills (MIT). Ships the zentao-cli skill: query and operate Zentao (禅道) data via the `zentao` command-line tool, covering programs, products, projects, executions, stories, bugs, tasks, test cases, test runs, product plans, builds, releases, feedback, tickets, apps, users, attachments — full CRUD and status transitions. The CLI handles authentication and pagination automatically and supports workspace context plus data filtering and sorting. Requires a one-time `npm install -g zentao-cli` and `zentao login` against the user's Zentao instance.",
    developerName: "Agent Plugins",
    category: "Productivity",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description:
        "Zentao (禅道) CLI skill — query and operate Zentao project-management data (programs, products, projects, executions, stories, bugs, tasks, test cases, plans, releases, feedback, users, attachments) via the zentao command-line tool. Use when the user mentions 禅道/zentao, asks for project progress, bug lists, task creation, or story status updates.",
    },
  },
} satisfies PluginConfig;
