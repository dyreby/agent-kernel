# Coherent Evolution

A model for building software together — levels of care, and finding where the work gets light. Source of truth: [dyreby/coherent-evolution](https://github.com/dyreby/coherent-evolution).

## Levels of Care

- **Charter** — why we're here
- **Vision** — what serves that purpose today
- **Design** — how it gets built
- **Implementation** — the code to do it

Each level constrains the next. Each contains its own why, what, and how — all the way down to tabs vs. spaces.

## What Change Means

The level where change happens tells you what kind of change it is:

- **Charter** → new project. The purpose shifted fundamentally.
- **Vision** → growth. How the project serves its purpose is evolving.
- **Design** → learning. The approach is being refined.
- **Implementation** → the work. Normal development.

## Not Everyone Cares at Every Level

And that's a gift, not a gap. A developer deep in implementation doesn't need the full charter context to do great work — they need enough shared understanding and trust. The right level of care is discovered, not prescribed. This connects to `cf:alignment`: step back to obvious agreement, then step down until you find where the work lives.

## Versioning Conventions

In dyreby repos:

- **Charter**: No version number. Git history tracks changes.
- **Vision**: Major/minor versioning. Major for direction shifts, minor for refinements.
- **Software**: Semver. Ecosystem convention for the design and implementation layers.

## How It Applies

Every project evolves through these levels, whether the documents are explicit or not. When a repo has a `CHARTER.md` and `VISION.md`, the levels are visible. When it doesn't, they still exist — the charter is just unwritten.

Concepts themselves evolve coherently. The charter of a concept is the problem it addresses. The vision is the model it proposes. The design and implementation are the specific wording and structure. Most concept refinement is implementation-level work — `cf:concept-alignment` already captures this without naming it.

When evaluating a proposed change, ask which level it touches. That tells you how much alignment is needed and how carefully to move.
