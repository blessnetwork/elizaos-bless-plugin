import { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core"
import { executeBless } from "../utils/bless"

export const executeAction: Action = {
  name: "EXECUTE_BLESS",
  description: "Execute a function",
  similes: [],
  suppressInitialMessage: true,
  handler: async (runtime: IAgentRuntime, message: Memory, state: State, options, callback: HandlerCallback) => {
    try {
      const data: any = await executeBless();

      callback({
        text: `${data.results[0].result.stdout}\n${data.cluster.peers.join(", ")}`
      });
  
      return true;
    } catch (error) {
      console.error("BLESSSSSS error executeAction", error);
    }
  },
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const keywords = [
      "bless",
      "blessnetwork"
    ];
    if (
        keywords.some((keyword) =>
            message.content.text.toLowerCase().includes(keyword)
        )
    ) {
      console.log("BLESSSSSS validate done", message.content.text);
        return true;
    }

    console.log("BLESSSSSS validate failed", message.content.text);
    return false;
  },
  examples: [
    [
      {
          user: "{{user1}}",
          content: {
              text: "Can I get a hi from the bless network?",
          },
      },
      {
          user: "{{agent}}",
          content: { text: "bless you!", action: "EXECUTE_BLESS" },
      }
    ],
  ],
};