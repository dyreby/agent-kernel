/**
 * GitHub command execution with identity switching.
 *
 * No guardrails—trusted user. Just routes commands to the correct
 * GitHub account based on repo owner.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export interface GhCommandContext {
  pi: ExtensionAPI;
  getConfigDir: () => string;
  authError: string | null;
}

export interface CommandResult {
  content: Array<{ type: "text"; text: string }>;
  details?: { exitCode: number };
  isError?: boolean;
}

/**
 * Check if a command contains any gh invocations.
 */
export function containsGhCommand(command: string): boolean {
  // Match `gh ` at start or after shell operators/subshell markers
  return /(?:^|[;&|()]|\$\()\s*gh\s/.test(command);
}

/**
 * Execute a command containing gh invocations with the appropriate identity.
 *
 * Sets GH_CONFIG_DIR inline in the bash command for cross-platform compatibility
 * (works in bash on macOS, Linux, Git Bash on Windows, and WSL).
 */
export async function executeGhCommand(
  command: string,
  ctx: GhCommandContext,
  signal?: AbortSignal
): Promise<CommandResult> {
  const { pi, getConfigDir, authError } = ctx;

  if (authError) {
    return {
      content: [{ type: "text", text: `github: ${authError}` }],
      isError: true,
    };
  }

  // Prepend GH_CONFIG_DIR to the command for cross-platform compatibility
  // This syntax works in bash/sh on all platforms including Git Bash on Windows
  const configDir = getConfigDir();
  const wrappedCommand = `GH_CONFIG_DIR="${configDir}" ${command}`;

  const result = await pi.exec("bash", ["-c", wrappedCommand], { signal });

  const output = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .trim();

  return {
    content: [{ type: "text", text: output || "(no output)" }],
    details: { exitCode: result.code },
    isError: result.code !== 0,
  };
}
