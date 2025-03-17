import { Action, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core"
import { executeBless } from "../utils/bless"

export const executeAction: Action = {
  name: "EXECUTE_BLESS",
  description: "Execute a function on the Bless Network",
  similes: ["RUN_BLESS", "CALL_BLESS", "INVOKE_BLESS"],
  suppressInitialMessage: true,
  handler: async (runtime: IAgentRuntime, message: Memory, state: State, options, callback: HandlerCallback) => {
    try {
      // Extract functionId from the message
      let functionId = "lol"; // Default value
      
      // Look for a functionId pattern in the message (IPFS CID format)
      const functionIdMatch = message.content.text.match(/\b(bafy[a-zA-Z0-9]{50,})\b/);
      if (functionIdMatch && functionIdMatch[1]) {
        functionId = functionIdMatch[1];
      }

      console.log("functionId?", functionId);
      
      // Extract method from the message, default to "blessnet.wasm"
      let method = "blessnet.wasm";
      
      // Check if a specific method is mentioned
      if (message.content.text.toLowerCase().includes("method:")) {
        const methodMatch = message.content.text.match(/method:\s*([a-zA-Z0-9._-]+)/i);
        if (methodMatch && methodMatch[1]) {
          method = methodMatch[1];
        }
      }

      // Extract additional parameters if needed
      const params = {
        functionId,
        method,
        path: "/",
        httpMethod: "GET",
        numberOfNodes: 1
      };

      // Log execution attempt for debugging
      console.log(`Executing Bless function: ${functionId}, method: ${method}`);
      
      const data = await executeBless(params);

      if (!data || !data.results || !data.results[0]) {
        throw new Error("Invalid response from Bless Network");
      }

      // Format the response in a more readable way
      const result = data.results[0].result;
      const peers = data.cluster?.peers || [];
      
      let responseText = "";
      
      if (result.stdout) {
        responseText += result.stdout.trim();
      }
      
      if (result.stderr) {
        responseText += result.stderr ? `\nErrors: ${result.stderr.trim()}` : "";
      }
      
      if (peers.length > 0) {
        responseText += `\n\nExecuted on ${peers.length} node(s): ${peers.join(", ")}`;
      }

      callback({
        text: responseText,
        action: "EXECUTE_BLESS"
      });
  
      return true;
    } catch (error) {
      console.error("Error executing Bless function:", error);
      
      callback({
        text: `Failed to execute function on the Bless Network: ${error.message || "Unknown error"}`,
        action: "EXECUTE_BLESS"
      });
      
      return false;
    }
  },
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const keywords = [
      "bless",
      "blessnetwork",
      "run on bless",
      "execute bless"
    ];
    
    const messageText = message.content.text.toLowerCase();
    
    if (keywords.some((keyword) => messageText.includes(keyword))) {
      console.log("Bless execution validated for:", message.content.text);
      return true;
    }

    return false;
  },
  examples: [
    [
      {
          user: "{{user1}}",
          content: {
              text: "Run this function on bless network: {{functionId}}",
          },
      },
      {
          user: "{{user2}}",
          content: { text: "Sure, I'll run it on the bless network", action: "EXECUTE_BLESS" },
      }
    ],
  ],
};