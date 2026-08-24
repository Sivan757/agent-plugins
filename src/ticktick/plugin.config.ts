import type { PluginConfig } from "../../scripts/plugin-config";

export default {
  name: "ticktick",
  version: "0.7.0",
  description: "Manage TickTick (Dida365) tasks, projects, tags, habits, kanban columns, folders, focus sessions, and productivity statistics via the bundled CLI.",
  author: { name: "Agent Plugins" },
  keywords: ["ticktick", "dida365", "task", "todo", "habit", "pomodoro", "kanban", "productivity"],
  category: "Productivity",
  interface: {
    displayName: "TickTick",
    shortDescription: "Manage TickTick (Dida365) tasks, projects, tags, habits, kanban columns, folders, focus session…",
    longDescription: "Manage TickTick (Dida365) tasks, projects, tags, habits, kanban columns, folders, focus sessions, and productivity statistics via the bundled CLI.",
    developerName: "Agent Plugins",
    category: "Productivity",
  },
  build: {
    entry: "src/ticktick.ts",
    output: "dist/ticktick.mjs",
  },
  surfaces: {
    skills: true,
  },
  marketplace: {
    claude: {
      description: "Manage TickTick (Dida365) tasks, projects, tags, habits, kanban columns, folders, focus sessions, and productivity statistics via the bundled CLI.",
    },
  },
} satisfies PluginConfig;
