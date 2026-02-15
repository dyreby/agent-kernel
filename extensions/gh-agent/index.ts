/**
 * gh-agent extension
 *
 * Transparently intercepts `gh` commands in bash and runs them
 * with the configured agent identity. The LLM doesn't need to know
 * about this — it just uses `gh` normally.
 *
 * Setup:
 *   1. gh auth login (for both personal and agent accounts)
 *   2. Configure in ~/.pi/agent/settings.json:
 *      { "gh-agent": { "username": "your-github-agent-username" } }
 */

import { createBashTool } from "@mariozechner/pi-coding-agent";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isAllowed } from "./allow-list.ts";
import { readConfig } from "./config.ts";

export default function (pi: ExtensionAPI) {
  let agentToken: string | null = null;
  let configError: string | null = null;

  pi.on("session_start", async (_event, ctx) => {
    const config = readConfig();

    if (!config.ok) {
      configError = config.error;
      ctx.ui.notify(`gh-agent: ${config.error}`, "error");
      return;
    }

    const result = await pi.exec("gh", ["auth", "token", "-u", config.username]);

    if (result.code !== 0) {
      configError = `Failed to get token for ${config.username}: ${result.stderr}. Run: gh auth login`;
      ctx.ui.notify(`gh-agent: ${configError}`, "error");
      return;
    }

    agentToken = result.stdout.trim();
    ctx.ui.setStatus(
      "gh-agent",
      ctx.ui.theme.fg("success", `gh: ${config.username}`)
    );
  });

  const baseBash = createBashTool(process.cwd(), {});

  pi.registerTool({
    ...baseBash,
    async execute(id, params, signal, onUpdate, ctx) {
      const { command } = params as { command: string };

      // Only intercept gh commands
      if (!command.trim().startsWith("gh ")) {
        return baseBash.execute(id, params, signal, onUpdate, ctx);
      }

      // Check configuration
      if (configError) {
        return {
          content: [{ type: "text", text: `gh-agent configuration error: ${configError}` }],
          isError: true,
        };
      }

      if (!agentToken) {
        return {
          content: [{ type: "text", text: "gh-agent: Agent token not available. Check configuration." }],
          isError: true,
        };
      }

      // Validate against allow list
      const validation = isAllowed(command);
      if (!validation.allowed) {
        return {
          content: [{ type: "text", text: `gh-agent: ${validation.reason}` }],
          isError: true,
        };
      }

      // Execute with agent token
      const result = await pi.exec("bash", ["-c", command], {
        signal,
        env: { ...process.env, GH_TOKEN: agentToken },
      });

      const output = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();

      return {
        content: [{ type: "text", text: output || "(no output)" }],
        details: { exitCode: result.code },
        isError: result.code !== 0,
      };
    },
  });
}
