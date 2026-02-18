# ADR-08: Concepts Only

- **Status:** Accepted
- **Date:** 2026-02-18
- **RFC:** [RFC-08](../rfcs/rfc-08-concepts-only.md)
- **Supersedes:** Profile/concept distinction from ADR-06

## Context

RFC-06 established two artifact types: concepts (what things mean) and profiles (compressed context for specific targets). In practice, this distinction created friction:

- "Is this a concept problem or a profile problem?" obscures the real question: "Does this artifact say what I mean?"
- Profiles are just concepts synthesized from other concepts
- The original model assumed static loading; the real workflow is dynamic composition

Meanwhile, the `[[name]]` syntax was ambiguous (expansion vs. provenance) and collides with wiki-link syntax in many systems.

## Decision

### All Artifacts Are Concepts

Remove `profiles/`. All artifacts live in `concepts/`.

What were "profiles" become concepts that happen to be synthesized from other concepts. The distinction was artificial—compression is valuable, a separate artifact type isn't.

### `[[cf:name]]` Syntax

`[[cf:name]]` marks provenance, not expansion. It means: "this text was influenced by the concept called 'name'."

The `cf:` prefix:
- Avoids collision with wiki syntax (Obsidian, etc.)
- Reads as "collaboration framework" or "concept for:"
- Makes framework markers unambiguous in any context

The content following the marker is complete and standalone. If context would help, the full concept can always be loaded.

### Preamble Convention

A preamble explains the philosophy, syntax, and collaboration protocol:

```xml
<collaboration-framework>
Models are only as good as the shared understanding of the concepts behind them.

This context uses concepts from github.com/dyreby/collaboration-framework. When you see [[cf:choose-kindness]], that's a reference to concepts/choose-kindness.md, marking shared understanding for how that concept applies here. Misalignment means your interpretation differs from the user's or the source concept. On misalignment: read the source and align with the user. If the user now understands, continue. If the concept needs refinement, file a PR or issue in the concept's repo. If proceeding without alignment, assess whether the gap is minor or fundamental and advise the user of the risk.
</collaboration-framework>
```

The preamble encodes:
- **Philosophy**: models are only as good as shared understanding
- **Syntax**: `[[cf:name]]` → `concepts/name.md`
- **Protocol**: the alignment loop and its outcomes

This preamble is:
- Injected by the pi extension automatically
- Documented in README for non-pi users
- Stable—shouldn't change once established

### Dynamic Composition

The workflow is:
1. Start clean (no concepts loaded)
2. Activate concepts as needed
3. Do work
4. On friction, activate `concept_alignment`
5. Refine—edit concepts or update synthesis
6. Continue or end session

## Consequences

- `profiles/` directory removed
- All artifacts are concepts in `concepts/`
- `[[cf:]]` has one meaning: provenance
- Preamble documented in README, injected by pi extension
- Framework works without tooling; tooling makes it easier
- `concept_alignment` is the meta-concept for resolving friction
