/**
 * github extension
 *
 * Identity switching for GitHub operations:
 * - `dyreby/*` repos → gh commands as `john-agent`
 * - All other repos → gh commands as `dyreby`
 *
 * Git identity (user.name, user.email) is handled by the user's global git config.
 * See GIT_IDENTITY in identity.ts for the expected values.
 *
 * No guardrails—trusted user.
 *
 * Setup:
 *   For each account, run:
 *     GH_CONFIG_DIR=~/.pi/agent/gh-config/<username> gh auth login
 */

import { createBashTool } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
  ACCOUNTS,
  getConfigDir,
  getAuthCommand,
  getAccountForRepo,
  parseRepoOwner,
} from "./identity.ts";
import {
  executeGhCommand,
  containsGhCommand,
  type GhCommandContext,
} from "./gh-command.ts";

/** Communication style injected into system prompt */
const COMMUNICATION_STYLE = `Use "I" for your own perspective. Respond to context, not to people—let the content stand without referencing other parties.`;

export default function (pi: ExtensionAPI) {
  let currentRepoOwner: string | null = null;

  const ghCtx: GhCommandContext = {
    pi,
    getConfigDir: () => getConfigDir(getAccountForRepo(currentRepoOwner)),
    authError: null,
  };

  /**
   * Detect repo owner from git remote.
   */
  async function detectRepoOwner(): Promise<string | null> {
    const result = await pi.exec("git", ["remote", "get-url", "origin"]);
    if (result.code !== 0) {
      return null;
    }
    return parseRepoOwner(result.stdout.trim());
  }

  /**
   * Check if an account is authenticated.
   * Uses bash -c for cross-platform compatibility.
   */
  async function checkAuth(account: string): Promise<boolean> {
    const configDir = getConfigDir(account);
    const result = await pi.exec("bash", [
      "-c",
      `GH_CONFIG_DIR="${configDir}" gh auth status`,
    ]);
    return result.code === 0;
  }

  pi.on("session_start", async (_event, ctx) => {
    // Detect repo owner
    currentRepoOwner = await detectRepoOwner();

    // Check both accounts are authenticated
    const [agentAuth, personalAuth] = await Promise.all([
      checkAuth(ACCOUNTS.agent),
      checkAuth(ACCOUNTS.personal),
    ]);

    const missing: string[] = [];
    if (!agentAuth) missing.push(getAuthCommand(ACCOUNTS.agent));
    if (!personalAuth) missing.push(getAuthCommand(ACCOUNTS.personal));

    if (missing.length > 0) {
      ghCtx.authError = `Auth required. Run:\n${missing.join("\n")}`;
      ctx.ui.notify(`github: ${ghCtx.authError}`, "warning");
      return;
    }

    // Show active identity
    const account = getAccountForRepo(currentRepoOwner);
    const label = currentRepoOwner
      ? `${currentRepoOwner}/* → ${account}`
      : `(no repo) → ${account}`;
    ctx.ui.setStatus("github", ctx.ui.theme.fg("success", `gh: ${label}`));
  });

  // Inject communication style
  pi.on("before_agent_start", async (event, _ctx) => {
    return {
      systemPrompt: event.systemPrompt + `\n\n${COMMUNICATION_STYLE}`,
    };
  });

  // Override bash to intercept gh commands
  const baseBash = createBashTool(process.cwd(), {});

  pi.registerTool({
    ...baseBash,
    async execute(id, params, signal, onUpdate, ctx) {
      const { command } = params as { command: string };

      if (containsGhCommand(command)) {
        // Re-detect repo owner in case we changed directories
        currentRepoOwner = await detectRepoOwner();
        return executeGhCommand(command, ghCtx, signal);
      }

      return baseBash.execute(id, params, signal, onUpdate, ctx);
    },
  });
}
