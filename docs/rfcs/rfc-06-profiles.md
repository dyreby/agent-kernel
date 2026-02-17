# RFC-06: Profiles

- **Status:** Draft
- **Created:** 2026-02-17
- **Extends:** RFC-05 (Intent-Expression Gap)
- **Issue:** #47

## Summary

Introduce **Profiles** as validated contracts that encode shared understanding between users and agents. Profiles are built through two decoupled alignment loops:

1. **Term Alignment**: User and LLM agree on vocabulary—what terms mean
2. **Packet Generation**: User and LLM generate orientation context from aligned terms

Both loops are collaborative (LLM-assisted), validated (human-approved), and committed (versioned in the repository)—creating a deterministic, auditable orientation layer.

## Motivation

RFC-05 establishes T-6: expressed intent is lossy. The agent must infer intent from expression. But how?

Previous approaches attempted to solve this with layered abstractions—principles, skills, guidelines—that the agent interprets at runtime. This is fundamentally indeterminate. The same words can be synthesized differently across invocations, models, or contexts. Testing is impossible because interpretation is opaque.

### The Invariant

Consider the limit case: perfect LLMs with complete knowledge. Even then, the human remains essential. Why?

**The human is the only authority who can verify that the observed result of an action, as they interpret it, matches their original intention.**

This is irreducible. Intent originates in the human. Expression is lossy (T-6). Action produces observable results. Only the human can close the loop—"yes, this is what I meant."

### Implication

If human verification is always required, we don't need the agent to perfectly interpret intent at runtime. We need:

1. **Shared understanding** of what matters before action
2. **Deterministic application** of that understanding
3. **Feedback mechanisms** to refine understanding over time

The agent doesn't guess what you mean. You establish what you mean together, commit it, and the agent applies it consistently.

## Proposal

### Profiles

A **Profile** is a validated contract that captures shared understanding between user and agent. It serves as the lens through which the agent interprets user prompts.

Profiles encode:
- **Principles**: What the user believes (values, priorities)
- **Processes**: How the user works (workflows, conventions)
- **Roles**: What the user expects from the agent (persona, expertise)

```yaml
id: rust-pedantic
description: "Careful Rust development with emphasis on correctness"
terms:
  - defensive
  - no-panic
  - prefer-result
  - explicit-errors
  - functional-core
context: |
  # Orientation
  
  You are assisting with Rust development. Prioritize correctness over convenience.
  
  ## Error Handling
  - Use Result, not panic. Panics are for unrecoverable states only.
  - Surface errors explicitly; never swallow them.
  - Validate inputs at boundaries.
  
  ## Style
  - Prefer functional core, imperative shell.
  - Make invalid states unrepresentable through types.
  ...
```

The `context` field is the actual text prepended to the system prompt. It's generated with LLM assistance but validated and committed by the human.

### Terms

Profiles are composed from **Terms**—atomic units of intent with a name and natural language definition.

```yaml
id: defensive
means: "Anticipate failure modes. Handle errors explicitly, surfacing them rather than swallowing. Don't assume inputs are valid."
```

Terms are the shared vocabulary. When you say "defensive," both you and the agent agree on what that points to.

Terms can reference other terms, enabling hierarchy to emerge:

```yaml
id: defensive
means: "Anticipate and handle failure modes explicitly"
includes:
  - no-panic
  - validate-inputs
  - surface-errors
```

### Two Alignment Loops

The authoring process is decoupled into two distinct OODA loops, each with its own artifact and validation criteria.

#### Loop 1: Term Alignment

**Goal**: Establish shared vocabulary—agree on what terms mean.

**Artifact**: Terms (id + means + examples)

**Validation**: "Do we both understand 'defensive' to mean the same thing?"

```
User: "I want careful error handling, no panics"
LLM:  "Let's define that. How about:
       { id: 'no-panic', means: 'Use Result over panic. Panics are for unrecoverable states only.' }"
User: "Yes, but also mention surfacing errors"
LLM:  "Updated:
       { id: 'no-panic', means: 'Use Result over panic. Panics are for unrecoverable states only. Surface errors explicitly.' }"
User: "That captures it. Commit the term."
```

The LLM acts as librarian—suggesting related terms, catching duplicates, proposing hierarchy:

```
User: "I want it to always validate inputs"
LLM:  "This relates to your existing 'defensive' term. Options:
       (a) Add 'validate-inputs' as an example under 'defensive'
       (b) Create standalone 'validate-inputs' term
       (c) Both—term exists, 'defensive' references it"
```

Terms are **semantic artifacts**. Once aligned, they're stable—you don't revisit what "defensive" means every session.

#### Loop 2: Packet Generation

**Goal**: Generate usable orientation context from aligned terms.

**Artifact**: Orientation packet (system prompt text)

**Validation**: "Does this text correctly express our agreed terms for the acting LLM?"

```
User: "Generate an orientation packet for rust-pedantic using: defensive, no-panic, functional-core"
LLM:  [generates context]
       "# Orientation
        You are assisting with Rust development. Prioritize correctness...
        ## Error Handling
        - Use Result, not panic..."
User: "The error handling section is good but expand functional-core"
LLM:  [regenerates with expanded section]
User: "That's right. Commit the packet."
```

Packets are **syntactic artifacts**. They express meaning for the acting LLM. You might iterate on rendering without reopening term definitions—better phrasing, different emphasis, model-specific adjustments.

#### Why Two Loops?

Decoupling provides:

- **Independent evolution**: Refine how packets render "defensive" without reopening what "defensive" means
- **Clear validation criteria**: Loop 1 validates meaning, Loop 2 validates expression
- **Reuse**: Same terms, different packets for different contexts (rust-pedantic vs rust-prototype)
- **Debugging**: When something goes wrong, you can ask: "Did we misalign on the term, or did the packet not express it well?"

### Runtime Behavior

At runtime, Orient is deterministic:

```
Orient(profile_id) → context (text)
```

Same profile, same context, always. The LLM synthesis happened at build-time. The human validated it. Now it's just lookup.

The agent receives the committed context and treats it as shared understanding—not instructions to interpret, but a contract both parties agreed to.

### Feedback Loops

Beyond the two alignment loops (term alignment and packet generation), there are runtime feedback loops that inform future refinement.

#### Immediate (Session OODA)

Within a session, the user observes results and provides feedback:
- "That's not what I meant"
- "Why did you do X instead of Y?"
- "That's exactly right"

This closes the loop for the current interaction.

#### Diagnostic (Post-Session)

After sessions, user and LLM can reflect on misalignment:
- "Why wasn't my intent understood?"
- "Was the term definition unclear, or did the packet not express it well?"
- "What new term would have captured this?"

This reflection feeds back into the appropriate loop:
- Term misalignment → revisit Loop 1
- Packet misexpression → revisit Loop 2

#### Learnable (Long-Term)

Over time, patterns emerge:
- Terms that consistently cause confusion get refined
- Packets that work well become templates
- The vocabulary grows to cover recurring concerns

The conversation history is auditable—you can trace how your shared understanding evolved.

### Scaling with LLM Capability

Every step leverages LLM capability:
- **Authoring**: LLM helps articulate intent
- **Curation**: LLM suggests structure, catches conflicts
- **Generation**: LLM synthesizes terms into coherent context
- **Reflection**: LLM helps diagnose misalignment

As LLMs improve:
- Generation requires less iteration
- Suggestions get sharper
- Reflection yields better insights

But the invariant holds: human validates, human commits. The LLM is a collaborator, not an authority.

## Data Model

The data model reflects the two-loop structure: Terms (semantic) and Orientation Packets (syntactic), composed into Profiles.

### Term

Artifact of Loop 1. Captures shared meaning.

```typescript
type Term = {
  id: string;                    // unique identifier
  means: string;                 // natural language definition
  examples?: string[];           // concrete examples of how this applies
  includes?: string[];           // references to other terms (optional)
};
```

### Orientation Packet

Artifact of Loop 2. Captures expression for the acting LLM.

```typescript
type OrientationPacket = {
  id: string;                    // unique identifier
  description: string;           // human-readable summary
  terms: string[];               // term ids this packet expresses
  context: string;               // generated system prompt text
  generated_at: string;          // ISO timestamp
  terms_hash: string;            // hash of terms at generation time
};
```

### Profile

Composition that binds terms to a packet for a given use case.

```typescript
type Profile = {
  id: string;                    // unique identifier
  description: string;           // human-readable summary
  packet: string;                // orientation packet id
};
```

### Storage

```
.agent/
  terms/
    defensive.yaml
    no-panic.yaml
    validate-inputs.yaml
    ...
  packets/
    rust-pedantic-orientation.yaml
    rust-prototype-orientation.yaml
    ...
  profiles/
    rust-pedantic.yaml
    rust-prototype.yaml
    ...
```

All artifacts are committed to the repository, versioned with git, diffable, auditable. The `terms_hash` field in packets enables staleness detection—if terms change, packets can be flagged for regeneration.

## Discussion

### Why not just write system prompts directly?

You can. Profiles don't prevent direct authoring.

But direct authoring doesn't compose. You can't say "rust + pedantic + fast-iteration" and get coherent context. You can't test that your profile includes certain constraints. You can't share terms across profiles.

Profiles give you:
- **Composition**: Combine terms into coherent wholes
- **Reuse**: Same term in multiple profiles
- **Testability**: Assert term presence, context properties
- **Auditability**: Trace how understanding evolved

### What about conflicts between terms?

The LLM surfaces conflicts during generation. If "move-fast" and "pedantic" contradict, the LLM flags it:

```
LLM: "These terms may conflict:
      - 'move-fast': Ship quickly, iterate later
      - 'pedantic': Prioritize correctness over speed
      How should I resolve this in the context?"
```

The human decides. The resolution is captured in the committed context.

### How do you know a profile works?

You don't—until you use it. The runtime OODA loop provides feedback:
1. **Observe**: See agent behavior
2. **Orient**: Compare to expectation
3. **Decide**: Is this aligned?
4. **Act**: Refine and feed back into the appropriate loop

When misalignment occurs, diagnosis determines where to fix:
- "We didn't agree on what 'defensive' means" → Loop 1 (term alignment)
- "The packet didn't express 'defensive' well" → Loop 2 (packet generation)

The profile doesn't guarantee alignment—it establishes shared understanding that makes misalignment *legible and actionable*.

### Isn't this just prompt engineering with extra steps?

Yes, in the same way that software engineering is "just typing with extra steps."

The extra steps are the point:
- Structured vocabulary (terms)
- Composition semantics (profiles)
- Validation checkpoint (human review)
- Version control (git)
- Feedback integration (learnable loops)

Raw prompts are artisanal. Profiles are engineered.

### What if the taxonomy becomes unwieldy?

Start small. You don't need hierarchy on day one.

```yaml
id: careful
means: "Think before acting. Consider edge cases. Ask if uncertain."
```

That's a complete term. Hierarchy emerges when you notice patterns—"these five terms are all aspects of 'defensive.'" The LLM helps notice these patterns.

If taxonomy becomes burdensome, flatten it. The human is always in control.

## Migration

- This RFC extends RFC-05 (builds on T-6: Intent-Expression Gap)
- Profiles are opt-in; existing workflows continue to work
- Tooling (term authoring, profile generation) is a separate concern

## Future Work

- **Tooling**: CLI for term/profile authoring with LLM assistance
- **Sharing**: Term libraries that can be imported across projects
- **Composition operators**: Explicit semantics for combining profiles
- **Conflict detection**: Static analysis of term compatibility
- **Metrics**: Track profile effectiveness over time

## References

- RFC-05: Intent-Expression Gap
- Issue #47: Constrain how silence is interpreted
- OODA Loop: Boyd's decision cycle (Observe, Orient, Decide, Act)
