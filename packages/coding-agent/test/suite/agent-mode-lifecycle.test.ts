import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import { afterEach, describe, expect, it } from "vitest";
import { createHarness, type Harness } from "./harness.ts";

/**
 * Agent mode lifecycle: bootstrap restricts to the minimal tool pair; after the
 * first turn the session promotes to resident and the full tool registry becomes
 * available for all later turns.
 */
describe("agent mode lifecycle", () => {
	const harnesses: Harness[] = [];
	afterEach(() => {
		while (harnesses.length > 0) {
			harnesses.pop()?.cleanup();
		}
	});

	it("bootstrap restricts tools, then resident enables all tools", async () => {
		const harness = await createHarness();
		harnesses.push(harness);
		harness.session.setMode("minimal");

		// Bootstrap: only the minimal tool pair is active.
		expect(harness.session.getModePhase()).toBe("bootstrap");
		expect(harness.session.getActiveToolNames().sort()).toEqual(["bash", "edit"]);

		// The bootstrap system prompt is just the persona.
		expect(harness.session.systemPrompt).toContain("You are a helpful software engineer assistant.");

		// Turn 1: complete the prompt; the session promotes to resident.
		harness.setResponses([fauxAssistantMessage("ok")]);
		await harness.session.prompt("hello");
		expect(harness.session.getModePhase()).toBe("resident");

		// Resident: the full registered tool set is available.
		const residentTools = harness.session.getActiveToolNames().sort();
		expect(residentTools).toContain("bash");
		expect(residentTools).toContain("edit");
		expect(residentTools).toContain("read");
		expect(residentTools).toContain("write");
		expect(residentTools).toContain("grep");

		// Turn 2 keeps all tools enabled.
		harness.setResponses([fauxAssistantMessage("done")]);
		await harness.session.prompt("please continue");
		expect(harness.session.getActiveToolNames().sort()).toEqual(residentTools);
	});
});
