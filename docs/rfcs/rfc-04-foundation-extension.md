# RFC-04: Foundation Extension

- **Status:** Proposed
- **Created:** 2026-02-15
- **Extends:** RFC-03 (Foundation Revision)

## Summary

Extend the Foundation from three truths to five, adding two truths that bridge objectives and world models and establish the structural advantage of simplicity.

## Motivation

RFC-03 established three truths:
- T-1: Agents act from objectives
- T-2: World models are incomplete, fallible, and mutable
- T-3: World input and conclusions are distinct

Through further analysis, we identified two gaps:

1. **Missing bridge**: T-1 and T-2 are independent claims. Nothing explicitly connects objectives to world models. We assumed agents *use* their world models to pursue objectives, but never stated it.

2. **Missing complexity claim**: We want to derive "simpler models are better" as a consequence, not a principle. But it's not derivable from T-1, T-2, T-3 alone. We need an explicit claim about complexity and input requirements.

### The Bridge Problem

To derive "a better world model leads to better outcomes," we need:
- T-1: Agents have objectives
- T-2: Agents have world models
- **Missing**: Agents *use* world models to select actions in pursuit of objectives

Without the bridge, T-1 and T-2 are disconnected. An agent could have objectives and a world model that don't interact.

### The Simplicity Problem

We want "simpler models are more robust" to be structural, not opinion. To derive it:
- T-2: Models are incomplete (always missing information)
- **Missing**: More complex models require more input to be useful

With this claim, the derivation follows: since models are always incomplete, and complex models require more input, simpler models are more robust to incompleteness.

## Proposal

### Extended Truths

**T-1: Objective-Driven Action** (unchanged)
Agents act from internal objectives.

**T-2: World Model** (unchanged)
Agents have internal world models that are incomplete, fallible, and mutable.

**T-3: Model Complexity** (new)
More complex models require more input.

- A model with more parts needs more information to be useful
- This is definitional, not learned experience
- Combined with T-2 (incompleteness), simpler models are structurally advantaged

**T-4: Model-Objective Bridge** (new)
Agents use their world models to select actions in pursuit of objectives.

- Connects T-1 (objectives) to T-2 (world models)
- Enables derivation: better model → better action selection → higher objective achievement
- This is structural, not opinion

**T-5: Input Distinction** (renumbered from T-3)
World input and model-derived conclusions are distinct. World input is taken as given.

### What Changed from RFC-03

| RFC-03 | RFC-04 | Rationale |
|--------|--------|-----------|
| T-1: Objectives | T-1: Objectives | Unchanged |
| T-2: World Model | T-2: World Model | Unchanged |
| — | T-3: Model Complexity | New; enables "simpler is better" as structural consequence |
| — | T-4: Model-Objective Bridge | New; connects objectives to world models |
| T-3: Input Distinction | T-5: Input Distinction | Renumbered |

### Derived Consequences

These truths enable structural derivations:

**"Better model → better outcomes"**
- T-1: Agent has objectives
- T-2: Agent uses world model
- T-4: Agent uses model to select actions in pursuit of objectives
- Derivation: More accurate model → better predictions → better action selection → higher probability of achieving objectives

**"Simpler models are more robust"**
- T-2: Models are always incomplete
- T-3: Complex models require more input
- Derivation: Since you never have complete information, models that require less information are more robust

**"Simplicity is structural advantage"**
- Follows from above
- Not a preference or principle — a consequence of T-2 + T-3

### Encoding for LLM Context

The five truths, encoded minimally:

```
## Truths

T-1: Agents act from internal objectives.

T-2: Agents have internal world models that are incomplete, fallible, and mutable.

T-3: More complex models require more input.

T-4: Agents use their world models to select actions in pursuit of objectives.

T-5: World input and model-derived conclusions are distinct. World input is taken as given.
```

## Discussion

### Why is "complex models require more input" a truth and not obvious?

It's definitional — what "more complex" means is "more parts" which means "more information needed." But it's not obvious that this should be stated as a foundation truth.

The reason to state it: without it, we can't derive "simpler is better" structurally. It would remain a principle (opinion about what works) rather than a consequence (logical derivation from truths).

### Why is the bridge a separate truth?

You could argue it's implied — why else would agents have world models if not to pursue objectives? But implications aren't derivations. Making it explicit means downstream reasoning doesn't have to re-derive it.

### Does the order matter?

The logical flow is:
1. Agents have objectives (why they act)
2. Agents have world models (what they work with)
3. Complex models need more input (property of models)
4. Agents use models to pursue objectives (how 1 and 2 connect)
5. Input and conclusions are distinct (epistemic strategy)

T-3 and T-4 could swap, but T-3 before T-4 groups model properties (T-2, T-3) before the bridge (T-4).

## Migration

- This RFC extends RFC-03 (not supersedes — the original truths remain)
- ADR-04 will reference this RFC
- Version increments to v0.3.0

## References

- RFC-03: Foundation Revision
- ADR-03: Foundation Revision
