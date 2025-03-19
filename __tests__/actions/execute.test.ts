import { describe, it, expect, beforeEach, vi } from "vitest";
import { executeAction } from "../../src/actions/execute";
import type { Memory, State } from "@elizaos/core";
import * as blessUtils from "../../src/utils/bless";

const BLESS_FUNCTION_ID = "bafybeifexr5igblzhv5pyixvbif5lmrznv7yxvplcgnau6u2jzvzrji3i4";

describe("Execute Action", () => {
  let mockRuntime;
  let mockCallback;

  beforeEach(() => {
    mockRuntime = {
      getSetting: vi.fn().mockReturnValue("test-node-address"),
    };

    mockCallback = vi.fn();

    // Mock the executeBless function
    vi.spyOn(blessUtils, "executeBless").mockResolvedValue({
      results: [{
        result: {
          stdout: "Success output",
          stderr: ""
        }
      }],
      cluster: {
        peers: ["node1", "node2"]
      }
    });
  });

  describe("Bless execution", () => {
    it("should validate if the action is targeting the bless network", async () => {
      const mockMemory: Memory = {
        content: {
          text: `Execute ${BLESS_FUNCTION_ID} on the bless network`
        }
      } as Memory;

      const result = await executeAction.validate(mockRuntime, mockMemory);

      expect(result).toBe(true);
    });

    it("should execute a function on the Bless network", async () => {
      const mockMemory: Memory = {
        content: {
          text: `Execute ${BLESS_FUNCTION_ID} on the bless network`
        }
      } as Memory;

      await executeAction.handler(
        mockRuntime,
        mockMemory,
        {} as State,
        {},
        mockCallback
      );

      expect(mockCallback).toHaveBeenCalledWith({
        text: "Success output\n\nExecuted on 2 node(s): node1, node2",
        action: "EXECUTE_BLESS"
      });
    });
  });
});
