import type { Plugin } from "@elizaos/core";
import { executeAction } from "./actions/execute.ts";

export const blessPlugin: Plugin = {
  name: "bless",
  description: "Bless Plugin for Eliza",
  actions: [
    executeAction,
  ],
  evaluators: [],
  providers: []
};

export default blessPlugin;
