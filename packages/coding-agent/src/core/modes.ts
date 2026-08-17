/**
 * Agent modes — switchable presets borrowed from DeepSeek's "minimal" agent.
 *
 * A mode drives a two-phase lifecycle within a session:
 *
 * 1. *bootstrap* — the first request. The system prompt is exactly the mode's
 *    `systemPrompt` (`complete: true`: nothing is stacked on top), only
 *    `initialTools` are enabled, and every automatic injection (AGENTS.md digest,
 *    APPEND_SYSTEM.md, skills catalog, pi-docs reminders, per-tool guidelines) is
 *    suppressed via the build gate. The first real tool call or assistant message
 *    *promotes* the session to the resident phase.
 *
 * 2. *resident* — every later request. Standard injections are restored and the
 *    full tool registry is enabled (all tools plus the bootstrap pair become
 *    available, so the model can use whatever it needs).
 *
 * A mode is inert if it is never applied: sessions without an active mode behave
 * exactly as before.
 */

export interface AgentMode {
	/** Unique mode identifier used by `/mode <name>` and `--mode <name>`. */
	name: string;
	/** Short human-readable description shown by `/mode`. */
	description?: string;
	/**
	 * The *complete* system prompt for this mode (used in both phases).
	 * During bootstrap it is the entire prompt; nothing else is appended.
	 * Port of the DeepSeek persona block with `complete: true`.
	 */
	systemPrompt: string;
	/**
	 * Tools enabled during bootstrap. Only these tools' one-line descriptions are
	 * carried in the system prompt while bootstrapping.
	 */
	initialTools: string[];
	/**
	 * When `false` (default for minimal modes), bootstrap suppresses every
	 * automatic injection (AGENTS.md digest, skills catalog, append files).
	 * Port of `includeRuntimeContext: false`. Resident phase always restores them.
	 */
	includeRuntimeContext?: boolean;
	/**
	 * When `false`, the `Current working directory:` line is omitted from the
	 * system prompt so bootstrap carries only the persona. Defaults to `true`.
	 */
	includeCwd?: boolean;
}

/** Session phase. Only meaningful while a mode is active. */
export type ModePhase = "bootstrap" | "resident";

/**
 * The default DeepSeek "minimal" preset, mapped onto pi's built-in tool names.
 * `initialTools` mirrors DeepSeek's "bash + str_replace_editor" real pair. All
 * tools become available once the session promotes to resident.
 */
export const DEEPSEEK_MINIMAL_MODE: AgentMode = {
	name: "minimal",
	description: "Minimal bootstrap: tiny system prompt, two tools, then full tools",
	systemPrompt: "You are a helpful software engineer assistant.",
	initialTools: ["edit", "bash"],
	includeRuntimeContext: false,
	includeCwd: false,
};

/** Built-in mode registry. Order = `/mode` listing order. */
export const DEFAULT_MODES: AgentMode[] = [DEEPSEEK_MINIMAL_MODE];

/** Resolve a mode by name (case-insensitive). Returns `undefined` if absent. */
export function findMode(modes: AgentMode[], name: string): AgentMode | undefined {
	const normalized = name.trim().toLowerCase();
	return modes.find((mode) => mode.name.toLowerCase() === normalized);
}
