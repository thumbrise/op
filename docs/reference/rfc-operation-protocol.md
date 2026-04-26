---
title: "RFC: The Operation Protocol"
description: "Discussion document for the operation protocol. Append-only court record. RFC forming."
status: forming
---

# RFC: The Operation Protocol

## Status

**RFC forming.**

This is a Request For Comments document in the original sense of the term: a working text where ideas are discussed, disputed, and recorded — not a finished standard. The research and proof-of-concept phases are complete. The discussion captured here will, when it stabilizes, give rise to a separate terse normative document.

Until that point, this document exists to (a) reserve the URL, (b) define the update discipline that governs every subsequent change, and (c) hold reserved appendices for material that is ready to land but has not yet been integrated.

The pipeline is intentional: research → proof of concept → RFC → terse normative document. Each stage has a different shape. This is the third stage. It is not the fourth.

## Update rules

This RFC is an **append-only court record**. It is governed by the following rules, which themselves MUST NOT be removed or weakened.

1. **Append-only body.** Once a section is published in a numbered version, its text MUST NOT be rewritten in place. Corrections are made by appending a new section, a new version, or a new appendix. The history of what was said is part of the artifact.
2. **Versioning.** Each substantive change increments the version number at the top. The changelog records every version with date, author, and a one-line summary. Old versions remain readable in the git history and SHOULD be linkable from the changelog where practical.
3. **Disputed points are court records.** When a design decision is contested — by a reviewer, by an adversarial analysis, by an external verifier — the dispute is recorded in the *Disputed points* section in the form *attack / defense / verdict*, exactly like the trial in [#24](../devlog/024-the-trial.md). The dispute MUST NOT be summarized into a single resolved paragraph that erases the conflict; the conflict is part of the evidence.
4. **Falsifiability.** Every normative claim MUST be stated in a form that admits a counterexample. The conventional closing of any non-trivial claim is *"if you find a counterexample, open an issue"* — same discipline as the devlogs.
5. **RFC 2119 keywords.** When this RFC records a position that is intended to survive into the terse normative document, the words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, **MAY** are used in their RFC 2119 sense. They are not used in informational sections, prologues, or appendices unless explicitly noted. Discussion text in the RFC body remains discussion; only positions explicitly marked with these keywords are candidates for the future normative document.
6. **Stub appendices are honest.** When an appendix is reserved but not yet integrated, the appendix MUST say so explicitly: what material is parked, when it was obtained, where the raw notes live, and what completion looks like. A stub appendix is a public commitment to integrate, not a placeholder for vapor.
7. **Tone.** This document is technical and disciplined, but not narrative. It records discussion, positions, and disputes; it does not metaphorize, does not pitch, and does not address the reader as a sales target. Storytelling and rationale belong in the devlogs and the FAQ; this RFC points at them. The future terse normative document derived from this RFC will be even drier — pure rules and consequences, no rationale — but that document is not this one.

## Changelog

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.0.0 | 2026-04-26 | Ruslan Kokoev ([thumbrise](https://github.com/thumbrise)) | Stub created. Update rules and reserved appendices defined. Appendix A records DeepSeek external verification of the convergent witnesses (8 strong, 3 surface, 3 strained, 0 falsifications). No normative content yet. |

## Topics under discussion

The following topics are the major areas this RFC will work through. They are placeholders for discussion, not headings of a finished specification. Each topic, when its discussion stabilizes, contributes the rules that will be lifted into the future terse normative document.

### Topic 1 — Operation

The five fields. Their semantics. Their cardinality. Which are required and why.

*Status: discussion not yet opened.*

### Topic 2 — Term

The structure of the leaf primitive. Identifier, kind, comment. The nine kinds and why exactly nine.

*Status: discussion not yet opened.*

### Topic 3 — Trait

The extension model. Trait identifier as URI. The optional-by-construction rule. The dialect economy.

*Status: discussion not yet opened.*

### Topic 4 — Conformance

What it means to be a conforming emitter. What it means to be a conforming compiler. The minimum interoperability surface.

*Status: discussion not yet opened.*

### Topic 5 — Versioning

How instructions evolve. How traits evolve. How conformance evolves. The breakage discipline.

*Status: discussion not yet opened.*

## Disputed points

This section holds the court record of formal disputes against the protocol once normative content exists.

The first such record is already published in [#24 — The Trial](../devlog/024-the-trial.md), where six attacks against the fundamentality of the protocol were submitted to an external adversarial reviewer (Codex / GPT-5.4) and answered on record. Once the normative specification lands in this RFC, the trial transcript will be cross-referenced here as Disputed Point 1, and any future formal challenges will be appended in the same form.

*Status: reserved. To be populated when normative sections are written.*

## Appendix A — Convergent witnesses, external verification

**Status: stub.**

[Devlog #13 — Convergent Evolution](../devlog/013-convergent-evolution.md) lists fourteen disciplines that, without coordination, arrived at the same five-field structure for describing a unit of interaction. The claim is foundational to the protocol's status as *discovered, not invented*.

To test the claim under the [Popper standard](https://en.wikipedia.org/wiki/Falsifiability) — the same standard applied in [#24 — The Trial](../devlog/024-the-trial.md) — an external peer review was commissioned. A formal query was submitted to **DeepSeek**, an AI with broad access to academic and technical literature. The query's instructions were explicit: *do not flatter, do not invent quotes, find counterexamples or refuse to confirm*.

DeepSeek returned a structural assessment of all fourteen disciplines, with verification mode (verbatim quote, paraphrase of named work, or field consensus) and a structural match level (strong / surface / strained) for each. Summary of the response:

- **Strong structural match (8):** quantum mechanics, thermodynamics, molecular biology, cellular biology, neuroscience, CPU architecture, operating systems, programming languages.
- **Surface match (3):** circuit design (logic gates), network services (REST), economics (double-entry bookkeeping). For each, input/output present, but the error rail or annotation rail not formalized in the canonical literature.
- **Strained analogy (3):** game theory, law, linguistics. The analogy works at high abstraction, but the discipline does not formalize the structure with the same rigour as the natural sciences.
- **Confirmed addition:** cybernetics (Wiener, 1948) and general systems theory (von Bertalanffy) — confirmed as the literal source of the words *input* and *output*, predating computing.
- **Falsifications:** none. No discipline was identified where the canonical literature contradicts the five-field structure.

This appendix will, in its full form, list each discipline with the reviewer's verbatim assessment, the verification mode, the structural match level, and any caveats. The stub records the existence of the verification, the date of the review, and the location of the raw notes, so that the public ledger reflects the work even before integration is complete.

The author commits to integrating the full assessment into this appendix when normative sections of the RFC begin landing. Until that point, this appendix exists to make the verification visible, to be honest about its current incompleteness, and to ensure that any reader of [`ACKNOWLEDGEMENTS.md`](../../ACKNOWLEDGEMENTS.md) — where each of the fourteen disciplines is credited — has a single canonical place to verify the claim that *fourteen independent fields converged*.

**Raw notes:** preserved verbatim in [`rfc-operation-protocol-appendix-a-raw.md`](./rfc-operation-protocol-appendix-a-raw.md). Will be folded into the integrated appendix when the normative sections are written.
**Verification date:** 2026-04-26.
**Reviewer:** DeepSeek (external).
**Methodology:** falsification-first peer review, identical in structure to the methodology used for [#23 — The Vacant Cell](../devlog/023-the-vacant-cell.md) and [#24 — The Trial](../devlog/024-the-trial.md).

*Status: stub. Integration pending.*

## Appendix B — External attacks (reserved)

Reserved for adversarial reviews submitted against future normative sections of this RFC. The first such review — six attacks against the fundamentality of the operation primitive — is already on record in [#24 — The Trial](../devlog/024-the-trial.md) and will be linked here when normative content exists for it to attach to.

*Status: reserved.*

## Appendix C — Vacant cell evidence (reserved)

Reserved for the structured evidence record from [#23 — The Vacant Cell](../devlog/023-the-vacant-cell.md), establishing that no prior protocol satisfies all four properties (transport-agnostic, serialization-agnostic, consumer-agnostic, expression problem solvable).

*Status: reserved.*

## See also

- [README.md](../../README.md) — what Op is, status, proof of concept
- [FAQ.md](../../FAQ.md) — how to read this repository, common misreadings, common objections
- [ACKNOWLEDGEMENTS.md](../../ACKNOWLEDGEMENTS.md) — every reference cited in the materials
- [REVIEW.md](../../REVIEW.md) — review and contribution discipline
- [docs/devlog/](../devlog/) — the research trail (closed, append-only)
- [docs/universal/](../universal/) — field notes from compiler work