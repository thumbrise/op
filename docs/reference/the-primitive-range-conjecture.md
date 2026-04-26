---
title: The Primitive Range Conjecture
description: A proposed empirical regularity on the relationship between the size of a shared agreement and the breadth of interaction it enables. Stated in the Popperian frame — not as proven, but as not yet falsified, and open to refutation.
---

# The Primitive Range Conjecture

> Working draft. Not a published paper. Not peer reviewed in the academic sense. Stated as a conjecture in the mathematical and Popperian sense: a proposed regularity, offered for examination, open to falsification on the same terms as every claim in this repository.

## Status

| Field | Value |
|---|---|
| Version | 0.1.0 |
| Date | 2026-04-26 |
| Mode | proposed empirical conjecture |
| Standing | not yet falsified, not yet corroborated at scale |
| Falsifiability | named, see § Falsification conditions |
| Author | Ruslan Kokoev. Standing on the shoulders of those credited in [`ACKNOWLEDGEMENTS.md`](../ACKNOWLEDGEMENTS.md). |

This document is updated by appending a new version row to the changelog. The current statement may be revised when better evidence arrives, but every previous version remains visible.

---

## Short statement

> The breadth of interaction enabled by a shared primitive is inversely proportional to the size of the primitive — provided that the primitive remains larger than the minimum sufficient to describe itself, and smaller than any particular case it intends to admit.

## Formal statement

Let `P` be a shared primitive. Let `|P|` denote the descriptive size of `P` (number of distinct constraints, fields, rules, or commitments that `P` imposes on any party that adopts it). Let `interop(P)` denote the cardinality of the set of independent parties that can meaningfully meet through `P`.

Then:

```
interop(P)  ∝  1 / |P|
```

subject to the **range constraint**:

```
|self-description(P)|  <  |P|  <  |any particular instance admitted by P|
```

In words:

- `P` must be **at least** large enough to describe itself unambiguously, otherwise it carries no agreement.
- `P` must be **strictly smaller** than any particular case that adopts it, otherwise `P` *is* a particular case and admits no others.
- Within those two bounds, smaller `P` admits more parties.

The lower bound is the **self-sufficiency floor**. The upper bound is the **particularity ceiling**. The valid region between them is the **primitive band**.

---

## Definitions

**Primitive `P`.** A shared form, schema, vocabulary, signal set, or contract that two or more independent parties adopt as the surface of their interaction.

**Descriptive size `|P|`.** The total commitment imposed by `P` on any adopter — measured by the number of independent decisions an adopter cannot make differently without ceasing to be a participant. Examples: USB connector geometry has a descriptive size of roughly seven mechanical and four electrical commitments. The DNA alphabet has a descriptive size of four. The universal grammar of human languages has a descriptive size of three (subject, verb, object). The TCP/IP narrow waist has a descriptive size of approximately one (the IP packet header).

**Interop `interop(P)`.** The number of independent parties that can meet through `P` without further negotiation. *Independent* here means *not designed in coordination*. A USB host and a USB device are independent if they were designed by different teams without prior consultation. Two products from the same company under the same SDK are not independent in this sense.

**Self-description of `P`.** The minimum set of statements `P` must contain to specify what is and is not a valid instance of `P`. If `P` cannot tell a valid instance from an invalid one, `P` carries no agreement. The self-description of TCP/IP is roughly *«bytes flow in order, addressed by IP, errors detected by checksum»*. Without such a description, `P` is not a primitive — it is noise.

**Particular instance.** A concrete case that adopts `P` and adds further commitments. A specific USB device is a particular instance of USB. A specific human language is a particular instance of universal grammar. A specific frying pan is a particular instance of *«flat bottom, heat from below»*.

---

## Predecessors

This conjecture does not stand alone. Each of its three claims has been articulated, in adjacent form, by earlier thinkers. We name them honestly. None stated all three together as a single condition — but all three came from somewhere, and the somewhere belongs in the ledger.

### The narrow-waist principle (1974, 1988)

**Vint Cerf, Bob Kahn**, in the original TCP/IP architecture (1974), and later **David D. Clark** (MIT, *«Designing a Protocol for the Internet»*, 1988) named the *hourglass* shape: a thin layer in the middle, broad surfaces above and below. The narrow waist enables the broad surfaces. This is the *«smaller common, larger interaction»* claim, expressed geometrically.

We use this directly. The Primitive Range Conjecture generalises the narrow-waist principle from network protocols to any shared agreement.

### The Robustness Principle (1980)

**Jon Postel**, RFC 761 (1980): *«Be conservative in what you do, be liberal in what you accept from others.»* This carved the discipline of *«narrow specification, broad acceptance»* into the conscience of internet engineering.

**Martin Thomson**, RFC 9413 (2023), critiqued and refined Postel's principle: too liberal acceptance creates de-facto vendor lock through accidental dependencies. This work is the closest existing literature to our **upper bound** — the recognition that a primitive can be too large by absorbing too many particular cases.

We use both. Postel gives us the spirit of the lower bound. Thomson gives us the sharp edge of the upper bound.

### The Principle of Least Authority — POLA (1970s–2000s)

**Jerome Saltzer** and **Michael D. Schroeder** (*«The Protection of Information in Computer Systems»*, 1975) named the *Principle of Least Privilege*. **Mark S. Miller**, in the design of the E programming language (early 2000s) and capability-based security, refined this into the *Principle of Least Authority*: *«the smallest set of capabilities sufficient for the task is also the most composable.»*

This is closely related to our claim. POLA is about **authority** as the variable. The Primitive Range Conjecture generalises to any *shared commitment* — not only authority.

### Self-reference and minimum expressiveness (1931)

**Kurt Gödel**, *«Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme I»* (1931), established that any formal system must be at least powerful enough to express its own metalanguage to be subject to incompleteness. The implicit converse — that there is a minimum expressiveness threshold below which a system cannot make agreements about itself — is the philosophical ancestor of our **lower bound**.

We name Gödel honestly. We do not claim to extend his result. We claim only that the lower bound of the primitive band has the same shape as Gödel's minimum-expressiveness condition: *the system must contain enough to describe itself*.

### Occam's Razor (XIV century)

**William of Ockham**: *«entities should not be multiplied beyond necessity.»* The oldest articulation of *«smaller is better, all else equal.»* The Primitive Range Conjecture adds the *«not below self-sufficiency»* qualifier that Occam did not need to state because his razor was applied to descriptions, not to interfaces between independent parties.

### The convergent witnesses (independent fields, last 200 years)

The Primitive Range Conjecture's claim that *the regularity is real* rests on convergence. The same shape — a small primitive enabling broad interaction — has been documented independently in:

- **Genetics.** Four nucleotides (ATGC), two pairings, one universal genetic code across all life.
- **Statistical mechanics.** Microstate, macrostate, interpretation — three levels, no fewer, no more (Boltzmann, 1870s).
- **Lambda calculus.** Variable, abstraction, application — three constructions, sufficient for all computation (Church, 1936).
- **Hardware standards.** USB-IF connector geometry, ~1996, enabling permissionless device-host interaction across decades and vendors.
- **Pheromone signalling.** Six chemical signals sufficient to coordinate a termite colony of millions (*Macrotermes michaelseni*, observed throughout the 20th century).
- **Universal grammar.** Subject-Verb-Object structure, observed across all human languages (Chomsky and others, 1950s–present).
- **Process algebras.** CSP (Hoare, 1978), π-calculus (Milner, 1992), session types (Honda et al., 1998) — each minimal in its alphabet, broad in its compositions.

In each case, the primitive sits within a band: large enough to describe itself, small enough not to be any particular case. None of these literatures stated the band condition explicitly. They demonstrated it by surviving.

The structural-convergence argument is developed at length in [`docs/devlog/032-the-verdict.md`](../devlog/032-the-verdict.md) and [`docs/devlog/013-convergent-evolution.md`](../devlog/013-convergent-evolution.md). The peer-reviewed verification of the convergence claim across fourteen disciplines is recorded in [`rfc-operation-protocol-appendix-a-raw.md`](./rfc-operation-protocol-appendix-a-raw.md).

---

## What is new in this statement

The claim of this document is not that any of the three components (narrow-waist, self-sufficiency floor, particularity ceiling) is novel. Each has been articulated, in some form, by earlier thinkers.

The claim is that **stating them together as one condition** has, to our knowledge, not been done in the literature available to us. Specifically:

1. **Postel and Thomson** articulated the upper bound but did not formally pair it with the lower bound.
2. **Gödel** articulated the lower bound but for formal logic, not for shared interfaces.
3. **Cerf, Kahn, Clark** articulated the inverse-proportionality but not the bounds.
4. **Saltzer–Schroeder, Miller** articulated POLA but for authority, not for general primitives.

The Primitive Range Conjecture combines them into a single, falsifiable statement. We do not claim authorship of any component. We claim only the integration.

If a published paper has stated this combination already, **we ask the reader to send the citation**, and we will revise this document accordingly — moving the integration credit to the actual prior author and noting our independent re-derivation.

---

## Falsification conditions

This document is structured for falsification. The conjecture is considered **falsified** when any of the following is demonstrated:

1. **A primitive `P` outside the band that enables broader interaction than a primitive within the band.** For example: a primitive that is *larger* than a particular case, yet admits more independent parties than the smaller primitives in its space. We expect this to be impossible. We invite a counterexample.

2. **A primitive `P` below the self-sufficiency floor that nevertheless functions as an agreement.** That is: a primitive that cannot describe what is and is not a valid instance, yet which independent parties successfully use to meet. If found, the lower bound is wrong.

3. **A primitive `P` above the particularity ceiling that admits genuinely independent parties.** That is: a primitive containing all the commitments of one specific instance, yet still hosting other instances designed without coordination with the first. If found, the upper bound is wrong.

4. **A counterexample to the inverse proportionality itself.** Two primitives `P₁` and `P₂` both within the band, with `|P₁| < |P₂|`, where `interop(P₁) < interop(P₂)`, controlling for adoption time and ecosystem maturity. If found and reproduced, the proportionality direction is wrong.

A counterexample to any of the four falsifies the conjecture as stated. The author commits to revising the document on the public record when any such counterexample is presented with sufficient evidence.

---

## Open questions

The conjecture is stated, not closed. Several questions remain.

1. **How is `|P|` measured precisely?** *«Number of independent commitments»* is a natural-language definition. A formal metric — perhaps in bits, perhaps in axioms, perhaps in something else — is still owed.

2. **What does *«describe itself»* mean precisely?** The lower bound borrows the shape of Gödel's minimum-expressiveness condition without inheriting his formalism. A formal restatement is owed.

3. **Is `interop(P)` symmetric across domains?** Counting *«parties»* is straightforward for protocols and hardware standards. It is less clear for genetic codes (every cell? every species? every kingdom?) or for natural languages (every speaker? every sentence?). The metric may need domain-specific refinement.

4. **What is the time scale of the proportionality?** Some primitives appear to gain interop slowly (USB took two decades). The conjecture states the asymptotic relationship; transient dynamics are not covered.

5. **Are there primitives that are *anti-fragile to expansion*?** That is — primitives that grow over time without losing interop? HTTP/2 is a candidate. If such cases exist, they may live at the upper edge of the band rather than violate it.

These questions are open. The conjecture is offered as it stands, and the questions are offered alongside.

---

## Practical consequence

If the conjecture holds, design discipline follows directly:

- **Find the smallest primitive that still describes itself.** That is your floor.
- **Refuse to adopt commitments that belong to a particular case.** That is your ceiling.
- **Stay between the two.** Within the band, smaller is better.

This is the discipline that produced TCP/IP, USB, the genetic code, the universal grammar of human languages, and — the author proposes — every other long-lived shared agreement on the planet. The conjecture does not invent the discipline. It names it.

---

## See also

- [`ACKNOWLEDGEMENTS.md`](../ACKNOWLEDGEMENTS.md) — every name this document leans on, named.
- [`docs/devlog/013-convergent-evolution.md`](../devlog/013-convergent-evolution.md) — the convergence argument across fourteen disciplines.
- [`docs/devlog/032-the-verdict.md`](../devlog/032-the-verdict.md) — the four-witness analysis (biology, thermodynamics, lambda, Op).
- [`docs/devlog/023-the-vacant-cell.md`](../devlog/023-the-vacant-cell.md) — the four-property hole in protocol space.
- [`rfc-operation-protocol.md`](./rfc-operation-protocol.md) — the protocol that motivated this conjecture.
- [`rfc-operation-protocol-appendix-a-raw.md`](./rfc-operation-protocol-appendix-a-raw.md) — peer-reviewed convergence evidence.
- [RFC 761 (Postel, 1980)](https://datatracker.ietf.org/doc/html/rfc761) — Robustness Principle.
- [RFC 9413 (Thomson, 2023)](https://datatracker.ietf.org/doc/html/rfc9413) — Maintaining Robust Protocols.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-04-26 | Initial public draft. The conjecture as stated above. Predecessors named. Falsification conditions named. Open questions named. |
