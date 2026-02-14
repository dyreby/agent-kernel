/**
 * gh-agent Extension
 *
 * Provides a single `gh_agent` tool for GitHub CLI operations using a dedicated
 * agent identity. All operations run as the configured agent account, with an
 * allow list restricting which commands are permitted.
 *
 * Configuration in ~/.pi/agent/settings.json:
 *   {
 *     "gh-agent": {
 *       "user": "your-agent-username"
 *     }
 *   }
 *
 * Setup:
 *   1. gh auth login (for both personal and agent accounts)
 *   2. Configure the agent username in settings.json
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Type } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// Commands and subcommands that are allowed
// Format: "command subcommand" or "command" for top-level
const ALLOWED_COMMANDS = [
  // Issues - create, comment, view, list, edit body
  "issue create",
  "issue comment",
  "issue view",
  "issue list",
  "issue edit",

  // PRs - create, comment, view, list, diff, review, edit body
  "pr create",
  "pr comment",
  "pr view",
  "pr list",
  "pr diff",
  "pr review",
  "pr edit",

  // API endpoints - specific allowed patterns
  // Inline PR comment replies
  "api repos/*/pulls/*/comments/*/replies",
  // Edit issue comments
  "api repos/*/issues/comments/*",
  // Edit PR review comments
  "api repos/*/pulls/comments/*",
];

/**
 * Check if a command is allowed.
 * Supports exact matches and glob patterns for API endpoints.
 */
function isCommandAllowed(command: string): { allowed: boolean; reason?: string } {
  const trimmed = command.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 2) {
    return { allowed: false, reason: "Command requires at least: gh_agent <command> <subcommand>" };
  }

  const cmdSubcmd = `${parts[0]} ${parts[1]}`;

  // Check non-API commands
  for (const allowed of ALLOWED_COMMANDS) {
    if (!allowed.startsWith("api ")) {
      if (cmdSubcmd === allowed) {
        return { allowed: true };
      }
    }
  }

  // Check API commands with pattern matching
  if (parts[0] === "api") {
    const endpoint = parts[1];
    for (const allowed of ALLOWED_COMMANDS) {
      if (allowed.startsWith("api ")) {
        const pattern = allowed.slice(4); // Remove "api "
        if (matchesPattern(endpoint, pattern)) {
          // For API mutations, only allow specific methods
          const methodArg = parts.indexOf("-X");
          const method = methodArg !== -1 ? parts[methodArg + 1]?.toUpperCase() : "GET";

          // Replies endpoint only allows POST
          if (pattern.includes("/replies") && method !== "POST") {
            return { allowed: false, reason: `API endpoint ${endpoint} only allows POST method` };
          }

          // Comment edit endpoints only allow PATCH
          if ((pattern.includes("/issues/comments/") || pattern.includes("/pulls/comments/")) &&
              !pattern.includes("/replies") && method !== "PATCH" && method !== "GET") {
            return { allowed: false, reason: `API endpoint ${endpoint} only allows GET or PATCH method` };
          }

          return { allowed: true };
        }
      }
    }
  }

  return {
    allowed: false,
    reason: `Command not in allow list: ${cmdSubcmd}. Allowed: ${ALLOWED_COMMANDS.filter(c => !c.startsWith("api ")).join(", ")}`,
  };
}

/**
 * Simple glob pattern matching for API endpoints.
 * Supports * as a wildcard for path segments.
 */
function matchesPattern(endpoint: string, pattern: string): boolean {
  const endpointParts = endpoint.split("/");
  const patternParts = pattern.split("/");

  if (endpointParts.length !== patternParts.length) {
    return false;
  }

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === "*") {
      continue;
    }
    if (patternParts[i] !== endpointParts[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Read the gh-agent configuration from pi settings.
 */
function readConfig(): { user: string } | { error: string } {
  const settingsPath = join(homedir(), ".pi", "agent", "settings.json");

  try {
    const content = readFileSync(settingsPath, "utf-8");
    const settings = JSON.parse(content);

    if (!settings["gh-agent"]?.user) {
      return {
        error: `Missing gh-agent.user in ${settingsPath}. Add: { "gh-agent": { "user": "your-agent-username" } }`,
      };
    }

    return { user: settings["gh-agent"].user };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return { error: `Settings file not found: ${settingsPath}` };
    }
    return { error: `Failed to read settings: ${e}` };
  }
}

export default function (pi: ExtensionAPI) {
  let agentToken: string | null = null;
  let configError: string | null = null;

  pi.on("session_start", async (_event, ctx) => {
    const config = readConfig();

    if ("error" in config) {
      configError = config.error;
      ctx.ui.notify(`gh-agent: ${config.error}`, "error");
      return;
    }

    // Fetch the token for the agent user
    const result = await pi.exec("gh", ["auth", "token", "-u", config.user]);

    if (result.code !== 0) {
      configError = `Failed to get token for ${config.user}: ${result.stderr}. Run: gh auth login`;
      ctx.ui.notify(`gh-agent: ${configError}`, "error");
      return;
    }

    agentToken = result.stdout.trim();
    ctx.ui.setStatus("gh-agent", ctx.ui.theme.fg("success", `gh-agent: ${config.user}`));
  });

  pi.registerTool({
    name: "gh_agent",
    label: "GitHub Agent",
    description: "Run GitHub CLI commands as the agent identity. Usage: gh_agent <command> [args]",
    parameters: Type.Object({
      command: Type.String({
        description: "Full gh command (without 'gh' prefix), e.g. 'issue create --repo owner/repo --title ...'",
      }),
    }),

    async execute(_toolCallId, params, signal, _onUpdate, _ctx) {
      const { command } = params as { command: string };

      // Check for config errors
      if (configError) {
        return {
          content: [{ type: "text", text: `Configuration error: ${configError}` }],
          isError: true,
        };
      }

      if (!agentToken) {
        return {
          content: [{ type: "text", text: "Agent token not available. Check gh-agent configuration." }],
          isError: true,
        };
      }

      // Validate command against allow list
      const validation = isCommandAllowed(command);
      if (!validation.allowed) {
        return {
          content: [{ type: "text", text: `Command not allowed: ${validation.reason}` }],
          isError: true,
        };
      }

      // Parse command into args
      // Simple parsing - splits on whitespace, respects quotes
      const args = parseCommand(command);

      // Execute with agent token
      const result = await pi.exec("gh", args, {
        signal,
        env: { ...process.env, GH_TOKEN: agentToken },
      });

      const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();

      return {
        content: [{ type: "text", text: output || "(no output)" }],
        details: { exitCode: result.code },
        isError: result.code !== 0,
      };
    },
  });
}

/**
 * Parse a command string into an array of arguments.
 * Handles quoted strings (both single and double quotes).
 */
function parseCommand(command: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuote: string | null = null;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (char === " " || char === "\t") {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    args.push(current);
  }

  return args;
}
