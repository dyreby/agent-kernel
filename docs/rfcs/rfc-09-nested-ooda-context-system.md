# RFC-09: Nested OODA Context System

- **Status:** Draft
- **Created:** 2026-02-22

## Summary

A model for agent context management built on nested OODA loops: align on what context is needed (Orient), then align on what action to take (Decide). Both alignment moments follow the same structure and can evolve independently as trust builds.

## Motivation

### The Problem

LLMs are powerful but can be fragile and unpredictable in large codebases:

- **Too much context**: Attention dilutes, recency bias dominates, solutions converge prematurely
- **Too little context**: Hallucination, missed cross-cutting concerns, local optimization
- **Manual concept loading**: Conflates the *what* (right context for task) with the *how* (loading mechanisms)

What we actually care about: the agent follows best practices and gets the right amount of context to accomplish a given task.

### The Insight

The context request is an expression of the agent's model. By requiring the agent to articulate *what it thinks it needs* before fetching, the human can observe the agent's understanding and catch misalignment before work happens.

This is the collaboration framework applied mechanically: the request closes the gap between what the agent *thinks* you mean and what you *actually* mean—at the moment it matters most.

### Why Nested Loops

The gap exists at two moments:

1. **Orient**: When the agent expresses what context it thinks it needs
2. **Decide**: When the agent expresses what action it thinks it should take

Both are lossy expressions of the agent's internal model—and the user's intent that triggered the task may itself be lossy. Both benefit from alignment before proceeding.

## Core Model

### The Nested Structure

```
Outer OODA (the task)
│
├─ Observe: Task comes in ("review pr 24")
│
├─ Orient: What do I need to understand this?
│   │
│   └─ INNER OODA #1 (context alignment)
│       ├─ Agent proposes what it thinks it needs
│       ├─ Human reviews/challenges
│       ├─ Iterate until aligned
│       └─ Fetch agreed context
│
├─ Decide: What action do I take?
│   │
│   └─ INNER OODA #2 (action alignment)
│       ├─ Agent proposes the action
│       ├─ Human reviews/challenges
│       ├─ Iterate until aligned
│       └─ Ready to execute
│
└─ Act: Human confirms, action runs
```

The inner loops can re-open. If the agent realizes mid-task it needs more context, that re-enters context OODA. If the proposed action doesn't match intent, iterate before execution.

### Invariants

These don't change as we extend:

1. **Single Gateway**: All context expansion goes through one structured mechanism
2. **Request Shape**: Every request carries purpose, question, scope, escalation
3. **OODA Before Fetch**: Agent proposes → human reviews → fetch happens
4. **Logged**: Every request and decision is recorded (enables evolution)

### Hierarchy

Context and configuration layer without changing core abstractions:

```
Global (user-level)
  └─ Non-negotiables that apply everywhere ("apply best practices")
  └─ Handled by collaboration framework system prompt

Task Types (universal)
  └─ review_pr, create_pr, create_issue, investigate, implement, refactor
  └─ Each has default behaviors and Definition of Done (DoD) templates

Project (repo-level, optional)
  └─ Overrides/extends task-type defaults
  └─ Adds project-specific non-negotiables
  └─ Adds context hints ("auth logic lives in src/auth")
  └─ Version-controlled in repo (e.g., .pi/context/)
```

### Evolution

Both inner loops can collapse as trust builds:

| State | Context Loop (Orient) | Action Loop (Decide) |
|-------|----------------------|---------------------|
| **Early** | "I need X, Y, Z" → review → fetch | "Here's my review + command" → review → confirm |
| **Evolved** | Auto-fetch known-safe, propose only unknowns | "Looks good" → Enter |

The outer OODA never disappears—human always observes result and decides if it hit the mark. But inner loops become fast-path confirmations as alignment improves.

Evolution happens at three layers:

1. **Tool capabilities**: What the extension *can* do (detail levels, resource types, extraction methods)
2. **Task-type workflows**: How the extension *orchestrates* a given task type (what to auto-fetch, what order, default proposals)
3. **Learned patterns**: What the extension has *observed* from approvals/pushbacks (feeds back into workflows)

All three are designed to improve over time.

## Example: "review pr 24"

### Frame (auto-injected)

- Task type: `review_pr`
- Target: PR #24
- Global non-negotiable: "apply best practices" (from collaboration framework)
- DoD template for reviews: correctness, regressions, test adequacy, maintainability, risk summary
- PR metadata: title, body, changed files, diff stats, linked issues (auto-fetched—this is the object of the request)

### Orient (context OODA)

Agent proposes:
> To review this PR, I need:
> - Full diff content
> - New/modified test files
> - (Maybe) surrounding module context if behavior unclear
>
> Question: Does this change do what it claims without breaking anything?
> Escalation: If tests missing or behavior ambiguous, request linked issue details.

Human reviews:
- Approve as-is
- Challenge ("why surrounding module context?")
- Narrow ("just the diff for now")

Iterate until aligned, then fetch.

### Decide (action OODA)

Agent proposes:
> Based on my review:
> - No correctness issues found
> - Tests cover the new behavior
> - One suggestion: extract helper function for readability
>
> Ready to post:
> `gh pr review 24 --approve --body "LGTM. Minor suggestion: ..."`

Human reviews:
- "Looks good" → Enter
- Or challenges/refines

### End State (evolved)

After the system learns patterns for `review_pr`:

```
you: review pr 24

[auto-fetch: PR metadata, diff, changed tests]
[agent reviews]

agent: LGTM. Ready to approve?
       gh pr review 24 --approve --body "..."

you: Looks good <Enter>
```

## Consequences

### Enables

- Context expansion is intentional, auditable, minimal
- Agent reasoning is observable before action
- Misalignment surfaces early (before work, not after)
- System improves over time without losing transparency
- Clean agent can enter any task with right context
- Scales from small repos to monorepos

### Constrains

- Agent cannot freely read/grep outside the gateway
- Every context expansion must be justified
- Human remains in the loop (even if loop becomes fast)

### Supersedes

This RFC supersedes the approach explored in:

- Issue #82: Reframe /concept as a concepts loader
- Issue #113: Rethink concept loading
- Issue #115: Rethink the need for a concept loader

The underlying question—"how does the agent get the right context?"—is answered through task-driven OODA loops rather than manual concept loading.

## Open Questions

These will be discovered through implementation:

1. **Detail levels**: What granularity options does the gateway support? (Start with hammer, add finer levels)
2. **Task-type workflows as data**: How are these represented so they can evolve without code changes?
3. **Learning mechanism**: How do approval/pushback patterns update task-type workflows?
4. **Extension location**: Does this live in collaboration-framework or as a separate pi extension?
5. **Relationship to existing collaboration extension**: How does the context system interact with system prompt injection?

## References

- [README](../../README.md): The Gap, OODA, why/what/how hierarchy
- [Philosophy](../philosophy.md): Expressed intent is lossy, the correction loop
- Issue #115: "What I really care about is that the agent follows best practices and gets the right amount of context"
