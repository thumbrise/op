---
name: books
description: >
  Master engineering skill. Activated for ANY task involving architecture,
  design, coding, refactoring, testing, domain modeling, data systems,
  production stability, legacy code, or general software improvement.
  Do NOT invoke manually — the skill automatically analyses the request
  and loads the correct engineering rulebooks.
---

# Engineering Rulebooks — Router

This skill does NOT contain rules itself. When activated, it analyses the
user's request and selects the appropriate book(s) from the same directory.

## Instructions for the Agent

1. Read the user's request and identify its core engineering challenge.
2. Map the challenge to the book descriptions below. Do NOT search for
   specific keywords — instead, match the *intent* of the task to the
   *purpose* of the books.
3. Load ALL books that are relevant. It is safe (and often correct) to
   combine books when the task spans multiple concerns.
4. If the mapping is unclear, load `./clean-code/SKILL.md` and
   `./the-pragmatic-programmer/SKILL.md` as a sensible minimum baseline.
5. Apply the rules from the loaded books to the task.

## Available Books

- `./clean-code/SKILL.md` — readability, naming, small functions, responsibilities,
  tests, and simplicity. Good default for everyday coding.
- `./code-complete/SKILL.md` — disciplined implementation: routines, classes, control
  flow, defensive programming, standards, testing.
- `./the-pragmatic-programmer/SKILL.md` — general engineering principles: DRY,
  orthogonality, automation, fast feedback, adaptability.
- `./clean-architecture/SKILL.md` — stable boundaries, dependency rule, separating
  business policies from frameworks / databases / UI.
- `./a-philosophy-of-software-design/SKILL.md` — fighting complexity through deep
  modules, simple interfaces, and information hiding.
- `./refactoring/SKILL.md` — safe structural improvements, small steps, code smell
  detection, behaviour preservation.
- `./refactoring-guru/SKILL.md` — practical refactoring catalog and smell treatment.
- `./domain-driven-design/SKILL.md` — domain modeling, ubiquitous language, bounded
  contexts, tactical & strategic design.
- `./domain-driven-design-distilled/SKILL.md` — accessible DDD: subdomains, contexts,
  context mapping, basic tactical patterns.
- `./implementing-domain-driven-design/SKILL.md` — real-world DDD: aggregates, domain
  events, integrations, application architecture.
- `./patterns-of-enterprise-application-architecture/SKILL.md` — enterprise patterns:
  layers, service layer, domain model, data mapper, repository, etc.
- `./designing-data-intensive-applications/SKILL.md` — reliability, scalability,
  consistency, replication, partitioning, transactions, streams.
- `./release-it/SKILL.md` — production stability: circuit breakers, bulkheads,
  timeouts, retries, backpressure, observability, deployment.
- `./working-effectively-with-legacy-code/SKILL.md` — reclaiming control: seams,
  characterization tests, sprout method, wrap method, incremental risk
  reduction.