/**
 * Configuration loading for gh-agent.
 *
 * Reads agent username from ~/.pi/agent/settings.json
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Config =
  | { ok: true; username: string }
  | { ok: false; error: string };

const SETTINGS_PATH = join(homedir(), ".pi", "agent", "settings.json");

/**
 * Read gh-agent configuration from pi settings.
 */
export function readConfig(): Config {
  try {
    const content = readFileSync(SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(content);

    const username = settings["gh-agent"]?.username;
    if (!username || typeof username !== "string") {
      return {
        ok: false,
        error: `Missing gh-agent.username in ${SETTINGS_PATH}. Add: { "gh-agent": { "username": "your-github-agent-username" } }`,
      };
    }

    return { ok: true, username };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return { ok: false, error: `Settings file not found: ${SETTINGS_PATH}` };
    }
    return { ok: false, error: `Failed to read settings: ${err.message}` };
  }
}
