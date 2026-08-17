import { describe, expect, it } from "vitest";
import { DEEPSEEK_MINIMAL_MODE, DEFAULT_MODES, findMode } from "../src/core/modes.ts";

describe("agent modes", () => {
	it("registers the DeepSeek-minimal default with a tiny persona", () => {
		expect(DEEPSEEK_MINIMAL_MODE.systemPrompt).toBe("You are a helpful software engineer assistant.");
		// Bootstrap toolbox is deliberately small (two tools).
		expect(DEEPSEEK_MINIMAL_MODE.initialTools.length).toBe(2);
		// Bootstrap suppresses runtime context injections to save tokens.
		expect(DEEPSEEK_MINIMAL_MODE.includeRuntimeContext).toBe(false);
	});

	it("bootstraps with the edit + bash tool pair", () => {
		expect([...DEEPSEEK_MINIMAL_MODE.initialTools].sort()).toEqual(["bash", "edit"]);
	});

	it("findMode matches case-insensitively", () => {
		expect(findMode(DEFAULT_MODES, "minimal")?.name).toBe("minimal");
		expect(findMode(DEFAULT_MODES, "MINIMAL")?.name).toBe("minimal");
		expect(findMode(DEFAULT_MODES, "nope")).toBeUndefined();
	});
});
