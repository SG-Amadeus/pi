import { describe, expect, it } from "vitest";
import type { CustomEntry } from "../src/core/session-manager.ts";
import { createTestSession } from "./utilities.ts";

/**
 * Resume-safe mode persistence: mode state is written to the session file as a
 * `pi.mode` custom entry so a later resume can re-apply it.
 */
describe("agent mode persistence", () => {
	it("applies the startup mode as bootstrap with only initial tools", async () => {
		const { session, cleanup } = await createTestSession({ agentMode: "minimal" });
		try {
			expect(session.getActiveMode()?.name).toBe("minimal");
			expect(session.getModePhase()).toBe("bootstrap");
			expect(session.getActiveToolNames().sort()).toEqual(["bash", "edit"]);
		} finally {
			cleanup();
		}
	});

	it("writes a persisted mode entry into the session", async () => {
		const { sessionManager, cleanup } = await createTestSession({ agentMode: "minimal" });
		try {
			const modeEntries = sessionManager
				.getBranch()
				.filter((e) => e.type === "custom" && e.customType === "pi.mode");
			expect(modeEntries.length).toBeGreaterThan(0);
			const latest = (modeEntries[modeEntries.length - 1] as CustomEntry).data as {
				name: string;
				phase: "bootstrap" | "resident";
				tools: string[];
			};
			expect(latest.name).toBe("minimal");
			expect(latest.phase).toBe("bootstrap");
			expect(latest.tools.sort()).toEqual(["bash", "edit"]);
		} finally {
			cleanup();
		}
	});

	it("clearing the mode writes a null entry so resume does not resurrect it", async () => {
		const { session, sessionManager, cleanup } = await createTestSession({ agentMode: "minimal" });
		try {
			session.clearMode();
			const modeEntries = sessionManager
				.getBranch()
				.filter((e) => e.type === "custom" && e.customType === "pi.mode");
			const latest = (modeEntries[modeEntries.length - 1] as CustomEntry).data as unknown;
			expect(latest).toBeUndefined();
		} finally {
			cleanup();
		}
	});

	it("a resumed session restores the persisted mode and phase", async () => {
		const first = await createTestSession({ agentMode: "minimal" });
		const shared = first.sessionManager;

		// Simulate resume: a fresh session on the same manager, no startup agentMode.
		const resume = await createTestSession({
			sessionManager: shared,
			sessionStartEvent: { type: "session_start", reason: "resume" },
		});
		try {
			expect(resume.session.getActiveMode()?.name).toBe("minimal");
			expect(resume.session.getModePhase()).toBe("bootstrap");
			expect(resume.session.getActiveToolNames().sort()).toEqual(["bash", "edit"]);
		} finally {
			resume.cleanup();
			first.cleanup();
		}
	});
});
