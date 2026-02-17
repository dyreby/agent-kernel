# RFC-06: Collaborative Vocabulary

- **Status:** Draft
- **Created:** 2026-02-17
- **Extends:** RFC-05 (Intent-Expression Gap)
- **Issue:** #47

## Summary

Introduce a **collaborative vocabulary infrastructure** for encoding worldview models that enable effective human-agent collaboration. The framework provides:

1. **Terms**: Useful models worth abstracting—concepts you keep using across contexts
2. **Roles**: Coherent personas an agent can adopt—how you collaborate under specific contexts

Users define terms and roles, then work with their preferred LLM to generate context contracts. At runtime, users load specific roles or terms—the agent collaborates from shared understanding, not instructions.

This vocabulary is shareable. Like AGENTS.md explains how a codebase works, your terms and roles explain how *you* work—others (human or agent) can adopt them.

The framework is **useful, not true**. It doesn't claim to correctly capture intent—T-6 makes that impossible. It provides a model for encoding intent as clearly as possible, with honest boundaries about what's known and what isn't. What you encode is up to you.

## Motivation

RFC-05 establishes T-6: expressed intent is lossy. The agent must infer intent from expression. But how?

Previous approaches attempted to solve this with layered abstractions—principles, skills, guidelines—that the agent interprets at runtime. This is fundamentally indeterminate. The same words can be synthesized differently across invocations, models, or contexts.

### The Invariant

Consider the limit case: perfect LLMs with complete knowledge. Even then, the human remains essential. Why?

**The human is the only authority who can verify that the observed result of an action, as they interpret it, matches their original intention.**

This is irreducible. Intent originates in the human. Expression is lossy (T-6). Action produces observable results. Only the human can close the loop—"yes, this is what I meant."

### Implication

If human verification is always required, we don't need the agent to perfectly interpret intent at runtime. We need:

1. **Shared understanding** of what matters before action
2. **Deterministic application** of that understanding
3. **Feedback mechanisms** to refine understanding over time

### Reframe: Worldview Modeling

What we're really encoding is a **worldview model**—how you think about problems within a scope—in a way that lets your agent collaborate with you as any human colleague would.

There will always be misalignment in collaboration because of T-6. What this framework provides is a way to **encode, refine, and share** that worldview so misalignment becomes legible and correctable.

The agent doesn't follow your rules. The agent *shares your understanding* and collaborates from that common ground.

## Proposal

### Terms

A **Term** is a useful model worth abstracting. If you find yourself repeating a concept across roles, if it applies in multiple contexts, if it's reusable—it should be a term.

Terms are the concepts worth naming.

```yaml
id: defensive
means: "Anticipate failure modes. Handle errors explicitly, surfacing them rather than swallowing. Don't assume inputs are valid."
examples:
  - "Use Result<T, E> instead of panic"
  - "Validate inputs at system boundaries"
  - "Log errors with context before returning them"
  - "Consider what happens if this file doesn't exist"
rationale: "Production systems fail. Code that assumes success becomes liability. Defensive code degrades gracefully and aids debugging."
```

Terms contain:
- **means**: The core definition—what this term points to
- **examples**: Concrete applications that illustrate the term
- **rationale**: Why this matters—useful for inference and sharing

The examples and rationale are **rich data**. They help another LLM (or human) infer "how John works." But they don't all go into runtime context—that's the encoded understanding, distilled.

Terms can reference other terms:

```yaml
id: defensive
means: "Anticipate and handle failure modes explicitly"
includes:
  - no-panic
  - validate-inputs
  - surface-errors
```

### Roles

A **Role** is a coherent persona the agent adopts for collaboration. Roles use terms, but also contain situational context that doesn't warrant abstraction into a term.

Not everything needs to be a term. Role-specific details stay in the role—if something proves useful across roles, it graduates to a term.

```yaml
id: code-reviewer
description: "Thorough code reviewer focused on correctness and maintainability"
terms:
  - defensive
  - readable
  - tested
stance: "critical-friend"
context: |
  You are reviewing code as a thorough but collaborative reviewer.
  
  Focus on:
  - Correctness: Does this handle edge cases? What could fail?
  - Maintainability: Will this be readable in 6 months?
  - Test coverage: Are the important paths tested?
  
  Be direct about issues but suggest improvements, not just problems.
  Acknowledge good patterns when you see them.
```

Roles contain:
- **terms**: The vocabulary this role uses
- **stance**: The disposition—how to engage (e.g., "critical-friend", "pair-programmer", "teacher")
- **context**: The encoded understanding—what gets loaded at runtime

### Two Alignment Loops

The authoring process is decoupled into two distinct OODA loops.

#### Loop 1: Term Alignment

**Goal**: Establish shared vocabulary—agree on what terms mean.

**Artifact**: Terms (id + means + examples + rationale)

**Validation**: "Do we both understand 'defensive' to mean the same thing?"

```
User: "I want careful error handling, no panics"
LLM:  "Let's define that. How about:
       { id: 'no-panic', 
         means: 'Use Result over panic. Panics are for unrecoverable states only.',
         examples: ['Return Err(...) instead of unwrap()', ...] }"
User: "Yes, but also mention surfacing errors"
LLM:  [updates term]
User: "That captures it. Commit the term."
```

The LLM acts as librarian—suggesting related terms, catching duplicates, proposing hierarchy.

Terms are **semantic artifacts**. Once aligned, they're stable. The rich data (examples, rationale) supports inference and sharing but isn't required at runtime.

#### Loop 2: Role Definition

**Goal**: Define coherent personas for collaboration.

**Artifact**: Roles (terms + stance + context)

**Validation**: "When I load this role, does the agent collaborate as I'd expect?"

The user works with their preferred LLM to write the context. The framework provides the vocabulary (terms); the user controls how roles express that vocabulary.

```
User: "Create a code-reviewer role using defensive, readable, tested"
LLM:  [generates role with context]
User: "Make it more collaborative, less nitpicky"
LLM:  [adjusts stance and context]
User: "That's right. Commit the role."
```

This is deliberately **user-controlled**. Different users might express the same terms differently in their roles. The framework doesn't prescribe—it enables.

### Runtime Behavior

At runtime, users load what they need:

```bash
# Load a specific role
pi --role code-reviewer

# Load specific terms (ad-hoc collaboration)
pi --terms defensive,no-panic

# Load multiple roles
pi --role code-reviewer --role security-conscious
```

The agent receives the committed context and treats it as shared understanding. Same role, same context, always—deterministic lookup.

The agent isn't following instructions. It's collaborating from a shared worldview.

### Shareability

Terms and roles can be shared, like AGENTS.md explains a codebase.

```
.agent/
  VOCABULARY.md        # "Here's how I work"
  terms/
    defensive.yaml
    readable.yaml
    ...
  roles/
    code-reviewer.yaml
    pair-programmer.yaml
    ...
```

**VOCABULARY.md** explains your terms and roles—their intent, how they relate, how you use them. Others can:

- **Borrow terms**: "John's 'defensive' term captures what I mean—I'll use it"
- **Request roles**: "Review my code as John's code-reviewer"
- **Infer patterns**: An LLM can read your vocabulary and infer "how John works"

This creates a new kind of collaboration artifact. Not just "here's my code" but "here's how I think about code."

### Feedback Loops

#### Immediate (Session OODA)

Within a session, observe results and provide feedback:
- "That's not what I meant"
- "That's exactly right"

This closes the loop for the current interaction.

#### Diagnostic (Post-Session)

After sessions, reflect on misalignment:
- "Was the term definition unclear?" → refine term
- "Did the role context not express it well?" → refine role
- "Do I need a new term for this?" → add term

#### Learnable (Long-Term)

Over time, patterns emerge:
- Terms get refined through use
- Roles become templates
- Vocabulary grows to cover recurring concerns

The conversation history is auditable—you can trace how your worldview evolved.

## Data Model

### Term

Rich semantic unit. Full data for inference and sharing; distilled for runtime.

```typescript
type Term = {
  id: string;
  means: string;
  examples?: string[];
  rationale?: string;
  includes?: string[];
};
```

### Role

Coherent collaboration persona.

```typescript
type Role = {
  id: string;
  description: string;
  terms: string[];
  stance?: string;
  context: string;            // encoded understanding for runtime
};
```

### Storage

```
.agent/
  VOCABULARY.md              # human-readable overview
  terms/
    defensive.yaml
    no-panic.yaml
    ...
  roles/
    code-reviewer.yaml
    pair-programmer.yaml
    ...
```

All artifacts are committed, versioned, diffable, auditable.

## Epistemological Stance

This framework is **useful, not true**.

It makes no claim that roles correctly capture a person's intent. It can't—T-6 applies even to yourself. You don't know if you encoded your intent correctly. What you *can* do is encode your intent as clearly as possible, whatever that intent is.

### The Shared Invariant

Everyone using this framework agrees:

- **Authors** can't know if what they wrote will be interpreted as intended
- **Users** can't know if what was written is missing context the author would have caught
- **Even the author** doesn't know if they encoded their intent correctly

This isn't a flaw. It's the nature of collaboration under T-6. The framework doesn't fix this—it makes it legible and workable.

### What You Can Do

You can use this to:

1. **Train your agent** to collaborate like you would under specific roles
2. **Improve alignment over time** through feedback loops
3. **Share your worldview** so others can collaborate with you (or as you would)

The goal isn't correct encoding—that's impossible. The goal is **encoding your intent as clearly as you can** given the constraints. What that intent is, is up to you.

### Why This Works

If the framework were claiming truth, it could be wrong. But it claims utility:

- Terms are useful if they help you communicate
- Roles are useful if they enable collaboration you want
- The framework is useful if it helps

If it's not useful, adjust or abandon. No stronger claim is made.

### Borrowing Worldviews

When you load someone else's role, you accept the invariant:

- They encoded their best understanding
- You're collaborating in their style, not with them
- Gaps may exist that they would have caught

When someone loads your role:

- You encoded your best understanding
- They're getting your intent as you expressed it
- You retain authority over whether it captures you

This is collaboration at a distance, with honest boundaries.

## Discussion

### Why terms AND roles?

The distinction is the value.

**Terms** are useful models worth abstracting. If you keep saying it, if it applies across contexts, if it's reusable—it should be a term. Terms are the concepts worth naming.

**Roles** are personas that use terms plus situational stuff that doesn't warrant abstraction. Not everything needs to be a term. Role-specific details stay in the role until they prove their worth.

The relationship:
- Roles consume terms
- Terms bubble up from roles when you notice "I keep saying this across roles"
- If something isn't useful enough to abstract, it stays role-specific—and that's fine

This clarifies the authoring flow:
1. Start with roles (what you actually need to collaborate)
2. Notice repeated concepts across roles → extract to terms
3. Terms become reusable; roles become cleaner

The LLM helps notice when something should graduate from role-specific to term: "You've mentioned 'validate inputs' in three roles—want to make it a term?"

### Who controls the context?

The user does. The framework provides vocabulary (terms) and structure (roles). The user works with their preferred LLM to write the actual context.

This is intentional. Different users will express the same terms differently. The framework enables; it doesn't prescribe.

### How is this different from AGENTS.md?

AGENTS.md explains a codebase to agents. VOCABULARY.md explains *you* to agents (and humans).

They're complementary:
- AGENTS.md: "Here's how this project works"
- VOCABULARY.md: "Here's how I work"

An agent loading both understands the project *and* how you want to collaborate on it.

### What about runtime interpretation?

There is none. The context is committed text. Same role, same context, always.

The LLM's job at runtime is to collaborate from that shared understanding, not to interpret what you might have meant. Interpretation happened at authoring time, with your validation.

### What if my vocabulary conflicts with a project's?

Load both, let the context stack. Or create project-specific roles that bridge your vocabulary with the project's conventions.

The vocabulary is yours. How you apply it to a project is up to you.

### Can an LLM infer a role from my terms?

Yes. That's part of the value of rich term data. Given your terms (with examples and rationale), an LLM can propose:
- "Based on your terms, here's a 'careful-coder' role"
- "Your vocabulary suggests you value X—want to make that explicit?"

The terms are data for inference. The roles are what you commit after validation.

## Migration

- This RFC extends RFC-05 (builds on T-6: Intent-Expression Gap)
- Vocabulary is opt-in; existing workflows continue unchanged
- Tooling (term authoring, role definition) is a separate concern

## Future Work

- **Tooling**: CLI for vocabulary authoring with LLM assistance
- **Sharing**: Vocabulary registries or imports
- **Inference**: LLM-assisted role generation from terms
- **Composition**: Formal semantics for combining roles
- **Metrics**: Track vocabulary effectiveness over time

## References

- RFC-05: Intent-Expression Gap
- Issue #47: Constrain how silence is interpreted
- OODA Loop: Boyd's decision cycle (Observe, Orient, Decide, Act)
