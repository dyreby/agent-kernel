import { describe, it } from "node:test";
import assert from "node:assert";
import { containsGhCommand } from "../gh-command.ts";

describe("containsGhCommand", () => {
  it("detects gh at start of command", () => {
    assert.strictEqual(containsGhCommand("gh pr create"), true);
  });

  it("detects gh after &&", () => {
    assert.strictEqual(containsGhCommand("cd /path && gh pr create"), true);
  });

  it("detects gh after ;", () => {
    assert.strictEqual(containsGhCommand("echo hello; gh issue list"), true);
  });

  it("detects gh after ||", () => {
    assert.strictEqual(containsGhCommand("false || gh pr view 1"), true);
  });

  it("detects gh in subshell", () => {
    assert.strictEqual(containsGhCommand("(gh pr list)"), true);
  });

  it("detects gh in command substitution", () => {
    assert.strictEqual(containsGhCommand("echo $(gh pr view 1 --json number)"), true);
  });

  it("returns false for commands without gh", () => {
    assert.strictEqual(containsGhCommand("cd /path && ls"), false);
  });

  it("returns false for gh substring in other words", () => {
    assert.strictEqual(containsGhCommand("echo spaghetti"), false);
  });
});
