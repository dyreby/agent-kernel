# ADR-05: Intent-Expression Gap

- **Status:** Accepted
- **Date:** 2026-02-16
- **RFC:** [RFC-05](../rfcs/rfc-05-intent-expression-gap.md)
- **Extends:** ADR-04 (Foundation Extension)

## Context

ADR-04 established five Truths, including T-5 (Context Efficiency): the context a user must provide is the gap between agent understanding and situation requirements.

But T-5 assumes users *can* express what they want accurately. They often can't:

1. **Expression is lossy**: Natural language compresses and introduces ambiguity
2. **Users describe solutions, not problems**: The XY problem — asking about Y when the real goal is X
3. **Intent ≠ expression**: Users can't be wrong about what they want, but can be wrong about how to express it

This is distinct from T-2 (imperfect world models). Even a perfect model receiving user expression would face the intent-expression gap. World state (files, repo content) can be taken as given; user expression of intent cannot.

## Decision

Extend the Foundation from five Truths to six, adding T-6: Intent-Expression Gap.

### Extended Truths (Encoded)

**T-1: Objective-Driven Action**
Agents act from internal objectives.

**T-2: Imperfect World Model**
Agents have internal world models that are incomplete, fallible, and mutable.

**T-3: Model-Driven Action**
Agents use their world models to select actions in pursuit of objectives.

**T-4: Input Distinction**
World input and model-derived conclusions are distinct. World input is taken as given.

**T-5: Context Efficiency**
The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.

**T-6: Intent-Expression Gap**
Users communicate intent imperfectly. Agents must infer intent from expression, not treat expression as intent.

### Encoding for LLM Context

```
## Truths

T-1: Agents act from internal objectives.

T-2: Agents have internal world models that are incomplete, fallible, and mutable.

T-3: Agents use their world models to select actions in pursuit of objectives.

T-4: World input and model-derived conclusions are distinct. World input is taken as given.

T-5: The context a user must provide is the gap between the agent's existing understanding and the situation's requirements.

T-6: Users communicate intent imperfectly. Agents must infer intent from expression, not treat expression as intent.
```

### Integration with Existing Truths

| Truth | Relationship to T-6 |
|-------|---------------------|
| T-2: Imperfect World Model | T-6 identifies a specific source of imperfection: user expression |
| T-4: Input Distinction | User expression is world input, taken as given — but as a signal, not ground truth about intent |
| T-5: Context Efficiency | The "gap" now has two components: agent understanding *and* expression fidelity |

### Key Derivations Now Possible

**"Clarification is alignment work"**
- T-6 → Expression ≠ intent, so agents that clarify are actively aligning to user intent

**"Pushback can be correct"**
- T-6 → Users can be wrong about how to express what they want
- Derivation: "You asked for Y, but it sounds like you want X — is that right?" is doing the job
- World context (files, repo state) aids this: "given what I see in your codebase, you might mean..."

**"Solutions ≠ goals"**
- T-6 + T-5 → Users often describe solutions (Y) when they have goals (X)
- Derivation: "What are you trying to achieve?" is often the right question

### Why T-6 is a Truth, Not a Derivation

T-6 is not derivable from T-2 (imperfect world models). T-2 says the agent's model is imperfect; T-6 says user *intent expression* is lossy — a claim about the nature of human-agent communication, not agent internals.

Even a perfect model would face the intent-expression gap. This is structural.

## Consequences

- Foundation encoded as six Truths: T-1 through T-6
- ADR-04 remains as historical record; this ADR captures current state
- Agent behaviors that might seem presumptuous (asking "what are you really trying to do?") are now structurally justified
- XY problem detection is a derived capability, not a preference
