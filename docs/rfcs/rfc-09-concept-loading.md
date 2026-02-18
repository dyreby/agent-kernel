# RFC-09: Concept Loading

- **Status:** Draft
- **Created:** 2026-02-18
- **Depends on:** RFC-08 (concepts only) if accepted
- **Enables:** Issue #66 (session freshness advisor)

## Summary

Define what it means for concepts to be "loaded" in a session. You can't hand off what you can't name.

## Motivation

Right now, "which concepts are loaded" is implicit:
- A profile is loaded at session start
- That profile may reference `[[concepts]]`
- But there's no explicit model for what's active, whether it can change, or how to reproduce it

This matters because:
1. **Handoffs require naming.** To tell the next session "load these concepts," we need to know what's loaded now.
2. **Dynamic composition.** RFC-08 envisions toggling concepts as needed. That requires a concept of state.
3. **Reproducibility.** "Same setup, new session" should be expressible.

## Proposal

### Concept state is explicit

At any point in a session, there is a defined set of **active concepts**. This set:
- Is initialized at session start
- Can be modified during the session
- Can be queried
- Can be captured

### Operations on concept state

1. **Initialize** — Set active concepts at session start
2. **Load** — Add a concept to the active set
3. **Query** — List what's currently active
4. **Capture** — Serialize current state for handoff

No unload. Concepts are add-only within a session—you can't "unread" something. If you need a different concept set, start fresh with a handoff.

### Handoff as state + context

A handoff includes:

```yaml
concepts:
  - truths
  - best-practices
  - lightest-touch

context: |
  Working on RFC-09. Draft complete, needs review.
  User prefers light touch in concept text.
  
intent: |
  Review the RFC and decide if it's ready to PR.
```

- **concepts**: The active set (reproducible)
- **context**: What the agent knows that isn't in artifacts (lossy but useful)
- **intent**: What the next agent should try to achieve

## Consequences

- Concept state becomes explicit and queryable
- Sessions can be reproduced exactly
- Handoffs transfer full context setup
- Dynamic composition (RFC-08) becomes implementable

## Out of scope

How tooling implements this model (commands, flags, runtime state) is a tooling concern, not a framework concern. See issue #67 for pi implementation notes.

## Open questions

1. **Relationship to profiles.** If RFC-08 lands, profiles become concepts. Does "load profile X" still make sense, or just "load concept X"?

2. **Implicit loading.** If concept A references `[[concept-b]]`, is B auto-loaded? Or is the reference just a marker?

## References

- RFC-08: Concepts Only (pending)
- Issue #66: Session freshness advisor (depends on this)
- Issue #67: Pi implementation of concept loading (tooling)
