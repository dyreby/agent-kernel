# ADR-04: Foundation Extension

- **Status:** Accepted
- **Date:** 2026-02-15
- **RFC:** [RFC-04](../rfcs/rfc-04-foundation-extension.md)
- **Extends:** ADR-03 (Foundation Revision)

## Context

ADR-03 established three Truths as the Foundation. Through further analysis, we found:

1. **T-1 and T-2 are disconnected**: We have objectives (T-1) and world models (T-2), but nothing explicitly states that agents *use* their world models to pursue objectives. This connection was assumed, not stated.

2. **"Simpler is better" requires justification**: We want simplicity to be a structural advantage, not a preference. But it's not derivable from T-1, T-2, T-3 alone. We need an explicit claim about complexity.

## Decision

Extend the Foundation from three Truths to five, adding:
- T-3: Model Complexity (more complex models require more input)
- T-4: Model-Objective Bridge (agents use world models to select actions)

### Extended Truths (Encoded)

**T-1: Objective-Driven Action**
Agents act from internal objectives.

**T-2: World Model**
Agents have internal world models that are incomplete, fallible, and mutable.

**T-3: Model Complexity**
More complex models require more input.

**T-4: Model-Objective Bridge**
Agents use their world models to select actions in pursuit of objectives.

**T-5: Input Distinction**
World input and model-derived conclusions are distinct. World input is taken as given.

### Migration from ADR-03

| ADR-03 | ADR-04 | Rationale |
|--------|--------|-----------|
| T-1: Objectives | T-1: Objectives | Unchanged |
| T-2: World Model | T-2: World Model | Unchanged |
| — | T-3: Model Complexity | New; enables "simpler is better" as derivation |
| — | T-4: Model-Objective Bridge | New; connects objectives to world models |
| T-3: Input Distinction | T-5: Input Distinction | Renumbered |

### Key Derivations Now Possible

**"Better model → better outcomes"**
- T-1 + T-2 + T-4 → more accurate model leads to better action selection

**"Simpler models are more robust"**
- T-2 + T-3 → since models are always incomplete, simpler models require less to be useful

These are now structural consequences, not principles or opinions.

## Consequences

- Framework version increments to v0.3.0
- Foundation encoded as five Truths: T-1 through T-5
- Presuppositions remain unchanged (P-0 through P-4, not encoded)
- ADR-03 remains as historical record; this ADR captures current state
- "Simpler is better" is now derivable, not assumed
- The connection between objectives and world models is explicit
