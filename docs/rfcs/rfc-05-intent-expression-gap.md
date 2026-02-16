# RFC-05: Intent-Expression Gap

- **Status:** Proposed
- **Created:** 2026-02-16
- **Extends:** RFC-04 (Foundation Extension)

## Summary

Add a sixth truth establishing that users communicate intent imperfectly, and agents must infer intent from expression rather than treating expression as intent.

## Motivation

RFC-04 establishes T-5 (Context Efficiency): the context a user must provide is the gap between agent understanding and situation requirements. But this assumes users *can* express what they want accurately. They often can't.

Users know what they want — by definition, intent is theirs. But their *expression* of that intent is:
- **Compressed**: natural language loses nuance
- **Ambiguous**: words have multiple meanings
- **Misdirected**: users often describe solutions, not problems (the XY problem)

This is a distinct structural claim, not derivable from existing truths:
- T-2 says the agent's world model is imperfect
- T-5 says users fill the gap with context
- **Neither** says that user-provided context is itself a lossy signal

### The XY Problem

A user wants to do X. They think Y is the path to X. They ask about Y. The agent answers about Y — correctly — but the user doesn't achieve X because Y was wrong.

The agent optimized for stated request, not actual intent. This is a structural failure, and it's common.

### Alignment Implications

An agent that executes exactly what users say may be *anti-aligned* — it achieves stated goals that diverge from actual intent. True alignment requires:
1. Recognizing that expression ≠ intent
2. Modeling the gap between them
3. Actively working to close it (clarification, reframing, pushback)

This justifies agent behaviors that would otherwise seem presumptuous: asking "what are you really trying to do?" instead of just answering.

## Proposal

### New Truth

**T-6: Intent-Expression Gap**
Users communicate intent imperfectly. Agents must infer intent from expression, not treat expression as intent.

- User input is world input (per T-4), but it's a *signal about* intent, not intent itself
- Users can't be wrong about what they want — but they can be wrong about how to express it
- Agents should model the gap and work to close it through clarification
- This enables XY problem detection: user asks Y, but underlying X suggests a different path

### Integration with Existing Truths

| Truth | Relationship to T-6 |
|-------|---------------------|
| T-2: Imperfect World Model | T-6 identifies a specific source of imperfection: user expression |
| T-4: Input Distinction | User expression is world input, taken as given — but as a signal, not ground truth about intent |
| T-5: Context Efficiency | The "gap" now has two components: agent understanding *and* expression fidelity |

### Derived Consequences

**"Clarification is alignment work"**
- T-6: Expression ≠ intent
- Derivation: Agents that clarify are actively aligning to user intent, not just being pedantic

**"Pushback can be correct"**
- T-6: Users can be wrong about how to express what they want
- Derivation: An agent that says "you asked for Y, but it sounds like you want X — is that right?" is doing its job

**"Solutions ≠ goals"**
- T-6: Users often describe solutions (Y) when they have goals (X)
- T-5: Agent understanding should include goal inference, not just solution execution
- Derivation: "What are you trying to achieve?" is often the right question

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

## Discussion

### Why is this a truth, not a derivation?

You might argue this follows from T-2 (imperfect world models) — if user input feeds the model, and models are imperfect, user input is imperfectly processed.

But that misses the point. T-6 claims something specific: **the input itself is lossy**, not just the processing. Even a perfect model receiving user expression would face the intent-expression gap.

This is a structural claim about the nature of human-agent communication, distinct from claims about agent internals.

### Doesn't this make agents second-guess everything?

No. T-6 says agents *must infer* intent, not that they must *always doubt* expression. When expression is clear and context confirms it, inference is trivial. T-6 matters at the margins — when something doesn't add up, when the user's stated path seems unlikely to achieve their apparent goal.

The derived behavior is "ask when uncertain," not "always ask."

### How does this relate to T-5 (Context Efficiency)?

T-5 says user context fills the understanding gap. T-6 refines this: user context is an *attempt* to fill the gap, but the attempt may itself be imperfect.

This suggests a richer model of context:
- **Situation context**: what's true about the world (T-5)
- **Intent context**: what the user actually wants (T-6)

An agent with strong pre-encoded understanding (T-5) still needs to infer intent (T-6). These are complementary, not redundant.

## Migration

- This RFC extends RFC-04 (assumes T-1 through T-5)
- ADR-05 will reference this RFC
- Version increments to v0.4.0

## References

- RFC-04: Foundation Extension
- [PR #34](https://github.com/dyreby/agent-framework/pull/34): Discussion that motivated this RFC
