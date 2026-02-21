/**
 * GitHub identity switching based on repo owner.
 *
 * Identity rules (deterministic):
 * - `dyreby/*` repos → `john-agent` for gh commands
 * - All other repos → `dyreby` for gh commands
 * - Git commits always use John Dyreby <john@isentropic.dev> / `dyreby`
 */

import { homedir } from "node:os";
import { join } from "node:path";

/** The two GitHub accounts used for identity switching */
export const ACCOUNTS = {
  agent: "john-agent",
  personal: "dyreby",
} as const;

/** Git identity (always the same regardless of repo) */
export const GIT_IDENTITY = {
  name: "John Dyreby",
  email: "john@isentropic.dev",
  username: ACCOUNTS.personal,
} as const;

/** Base path for GH config directories */
function getGhConfigBase(): string {
  return join(homedir(), ".pi", "agent", "gh-config");
}

/**
 * Get the GH_CONFIG_DIR path for an account.
 */
export function getConfigDir(account: string): string {
  return join(getGhConfigBase(), account);
}

/**
 * Get the gh auth login command for an account.
 * Uses bash syntax (works in bash on macOS/Linux and Git Bash on Windows).
 */
export function getAuthCommand(account: string): string {
  // Convert Windows paths to forward slashes for bash compatibility
  const configDir = getConfigDir(account).replace(/\\/g, "/");
  return `GH_CONFIG_DIR="${configDir}" gh auth login`;
}

/**
 * Determine which GitHub account to use based on repo owner.
 *
 * @param repoOwner - The owner of the current repo (e.g., "dyreby", "octocat")
 * @returns The GitHub account to use for gh commands
 */
export function getAccountForRepo(repoOwner: string | null): string {
  if (repoOwner === "dyreby") {
    return ACCOUNTS.agent;
  }
  return ACCOUNTS.personal;
}

/**
 * Parse repo owner from a git remote URL.
 *
 * Supports:
 * - git@github.com:owner/repo.git
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo
 */
export function parseRepoOwner(remoteUrl: string): string | null {
  // SSH: git@github.com:owner/repo.git
  const sshMatch = remoteUrl.match(/git@github\.com:([^/]+)\//);
  if (sshMatch) {
    return sshMatch[1];
  }

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = remoteUrl.match(/https:\/\/github\.com\/([^/]+)\//);
  if (httpsMatch) {
    return httpsMatch[1];
  }

  return null;
}
