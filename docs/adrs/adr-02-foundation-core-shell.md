# ADR-02: Foundation/Core/Shell Structure

- **Status:** Accepted
- **Date:** 2026-02-14
- **RFC:** [RFC-02](../rfcs/rfc-02-foundation-core-shell.md)

## Context

RFC-01 established Truths as the "foundational layer" within a "layered architecture." As the framework evolved, this framing became imprecise:

- Truths are invariants, not something you stack on
- Values, Roles, Skills are orthogonal abstractions that combine — they don't layer
- "Values" undersells deliberate beliefs about outcomes

## Decision

Adopt Foundation/Core/Shell as the structural model. Rename Values to Principles.

### Structure

| Zone | Components | Function |
|------|------------|----------|
| Foundation | Truths | What's real and inarguable. Premises and their logical consequences. |
| Core | Principles, Roles, Skills | Orthogonal abstractions that combine. |
| Shell | Profiles | Wiring. Configures the core for a specific job. |

**Foundation** is invariant.
**Core** is the model built on that foundation.
**Shell** is how you wire up the core for a specific job.

### Terminology

- "Values" → "Principles" — captures that these are deliberate beliefs about what leads to better outcomes, not mere preferences.

### Supersedes

This ADR supersedes structural language in ADR-01:

- "layered architecture" → Foundation/Core/Shell
- "Truth layer" → Truths (foundation)
- "Values" → Principles

The Truths themselves (T-1 through T-4) and their modification policy remain unchanged.

## Consequences

- Framework documentation uses Foundation/Core/Shell terminology
- References to "layered architecture" or "Truth layer" should be updated to new terminology
- Changes to the Foundation/Core/Shell structure require RFC and ADR
