---
name: gh-agent
description: GitHub operations using agent identity. Use when working with GitHub issues, PRs, comments, and reviews.
---

## Overview

Use `gh_agent` for all GitHub operations. This tool runs `gh` CLI commands using a dedicated agent account, keeping agent activity clearly attributed.

## Available Operations

### Issues
- `gh_agent issue create --repo owner/repo --title "..." --body "..."`
- `gh_agent issue comment <number> --repo owner/repo --body "..."`
- `gh_agent issue view <number> --repo owner/repo`
- `gh_agent issue list --repo owner/repo`
- `gh_agent issue edit <number> --repo owner/repo --body "..."` (edit issue body)

### Pull Requests
- `gh_agent pr create --repo owner/repo --title "..." --body "..." --head branch`
- `gh_agent pr comment <number> --repo owner/repo --body "..."`
- `gh_agent pr view <number> --repo owner/repo`
- `gh_agent pr list --repo owner/repo`
- `gh_agent pr diff <number> --repo owner/repo`
- `gh_agent pr review <number> --repo owner/repo --approve|--request-changes|--comment --body "..."`
- `gh_agent pr edit <number> --repo owner/repo --body "..."` (edit PR body)

### Inline Comment Replies

Reply to a review comment on a specific line:
```
gh_agent api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies -X POST -f body="..."
```

### Edit Comments

Edit an issue comment:
```
gh_agent api repos/{owner}/{repo}/issues/comments/{comment_id} -X PATCH -f body="..."
```

Edit an inline review comment:
```
gh_agent api repos/{owner}/{repo}/pulls/comments/{comment_id} -X PATCH -f body="..."
```

## Not Allowed

These operations are blocked for safety (irreversible or high-impact):
- `pr merge` — merging PRs
- `repo delete` — deleting repositories
- Generic `gh api` mutations outside the allow list
- Repository settings, releases, collaborator changes

If you need one of these, tell the user and provide the command for them to run manually.

## Confirmation

Before creating or posting substantive content, briefly summarize what you're about to post and confirm with the user. Quick mechanical operations (viewing, listing) don't need confirmation.
