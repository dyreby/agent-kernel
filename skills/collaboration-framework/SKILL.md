---
name: collaboration-framework
description: Work on the collaboration-framework repo (dyreby/collaboration-framework). Use when discussing behavior changes, concepts, or the framework itself.
---

# Collaboration Framework

Remote: `dyreby/collaboration-framework`

Paths below are relative to this skill's location (`skills/collaboration-framework/`).

## On Load

Load context to have the full picture for behavior discussions:

1. **Concepts** (full read - these shape behavior):
   Read all `.md` files in [../../concepts/](../../concepts/)

2. **Skills** (summaries):
   Read frontmatter (name/description) from each `SKILL.md` in [../../skills/](../../skills/)

3. **Extensions** (summaries):
   List and read top-of-file descriptions from [../../extensions/](../../extensions/)

4. **Docs** (list for reference):
   List files in [../../docs/](../../docs/)
   Read specific docs if reasoning context is needed.

## Structure

| Path | Purpose |
|------|---------|
| `concepts/` | Shared mental models loaded into sessions. **This is what shapes agent behavior.** |
| `skills/` | Reusable agent skills (workflows, capabilities) |
| `extensions/` | Pi extensions (tools, providers) |
| `docs/` | Philosophy, RFCs, ADRs (reasoning behind decisions) |

## Behavior Changes

To fix agent behavior, identify where the change belongs:

- **Mental model / interpretation** → `concepts/`
- **Workflow / capability** → `skills/`
- **Tooling / pi integration** → `extensions/`
- **Reasoning / principles** → `docs/`

Workflow:
1. Load context (above)
2. Identify where the fix belongs
3. Branch, edit, PR
4. Once merged, updated content affects future sessions

## Installation

```bash
pi install git:dyreby/collaboration-framework
```

Then `/skill:collaboration-framework` works from any directory.
