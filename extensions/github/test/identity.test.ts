import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ACCOUNTS,
  getAccountForRepo,
  parseRepoOwner,
} from "../identity.ts";

describe("getAccountForRepo", () => {
  it("returns john-agent for dyreby repos", () => {
    assert.strictEqual(getAccountForRepo("dyreby"), ACCOUNTS.agent);
  });

  it("returns dyreby for other repos", () => {
    assert.strictEqual(getAccountForRepo("octocat"), ACCOUNTS.personal);
    assert.strictEqual(getAccountForRepo("microsoft"), ACCOUNTS.personal);
  });

  it("returns dyreby when no repo detected", () => {
    assert.strictEqual(getAccountForRepo(null), ACCOUNTS.personal);
  });
});

describe("parseRepoOwner", () => {
  it("parses SSH remote URL", () => {
    assert.strictEqual(
      parseRepoOwner("git@github.com:dyreby/collaboration-framework.git"),
      "dyreby"
    );
  });

  it("parses SSH remote URL without .git suffix", () => {
    assert.strictEqual(
      parseRepoOwner("git@github.com:octocat/hello-world"),
      "octocat"
    );
  });

  it("parses HTTPS remote URL", () => {
    assert.strictEqual(
      parseRepoOwner("https://github.com/dyreby/collaboration-framework.git"),
      "dyreby"
    );
  });

  it("parses HTTPS remote URL without .git suffix", () => {
    assert.strictEqual(
      parseRepoOwner("https://github.com/microsoft/vscode"),
      "microsoft"
    );
  });

  it("returns null for non-GitHub URLs", () => {
    assert.strictEqual(
      parseRepoOwner("git@gitlab.com:user/repo.git"),
      null
    );
  });

  it("returns null for invalid URLs", () => {
    assert.strictEqual(parseRepoOwner("not-a-url"), null);
  });
});
