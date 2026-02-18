# ADR-07: Collaboration Framework

- **Status:** Accepted
- **Date:** 2026-02-17
- **RFC:** [RFC-07](../rfcs/rfc-07-collaboration-framework.md)
- **Supersedes:** Versioning approach from ADR-01, ADR-03

## Context

RFC-01 established v0.1.0 and RFC-03 incremented to v0.2.0. But semver serves external consumers who need stability guarantees. This framework has none. What we have instead:

- **ADRs** track the evolution of decisions
- **Git history** provides full traceability
- **Profile provenance** (commit + timestamp) traces generated artifacts to their source

Meanwhile, RFC-06 established that the framework is agent-agnostic. The repository name `agent-framework` undersells this scope.

## Decision

### Drop Versioning

Remove semver versioning from the framework. Provenance for generated artifacts:

- **For the author**: Commit hash, or HEAD if you're always current
- **For profiles**: Embed source commit + generation timestamp in frontmatter (per ADR-06)

The profile becomes the versioned artifact, not the framework.

### Rename Repository

Rename `agent-framework` to `collaboration-framework`.

The framework enables collaboration between:
- Human and agent (on projects, on profiles)
- Human and human (sharing concepts, adopting worldviews)
- Human and self across time (refining understanding through iteration)

The common thread is **collaboration**: joint effort where both parties actively shape the outcome through iteration.

## Consequences

- No semver versions to maintain or increment
- ADRs remain the record of framework evolution
- Repository name reflects the framework's actual scope
- Existing ADRs/RFCs are immutable; version references remain as historical artifacts
- README and CONTRIBUTING.md updates tracked separately
