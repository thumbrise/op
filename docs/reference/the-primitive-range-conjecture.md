---
title: The Primitive Range Conjecture
description: A proposed empirical regularity on the relationship between the size of a shared agreement and the breadth of interaction it enables. Stated in the Popperian frame — not as proven, but as not yet falsified, and open to refutation.
---

# The Primitive Range Conjecture

> Working draft. Not a published paper. Not peer reviewed in the academic sense. Stated as a conjecture in the mathematical and Popperian sense: a proposed regularity, offered for examination, open to falsification on the same terms as every claim in this repository.

## Status

| Field | Value |
|---|---|
| Mode | proposed empirical conjecture |
| Standing | not yet falsified, not yet corroborated at scale |
| Falsifiability | named, see § Falsification conditions |
| Author | Ruslan Kokoev. Standing on the shoulders of those credited in [`ACKNOWLEDGEMENTS.md`](../ACKNOWLEDGEMENTS.md). |

This document may be revised when better evidence arrives.

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

**Interop `interop(P)`.** The number of independent parties that meet through `P` at equilibrium — that is, after sufficient time has passed for adopters to converge on an economically advantageous primitive. *Independent* here means *not designed in coordination*. A USB host and a USB device are independent if they were designed by different teams without prior consultation. Two products from the same company under the same SDK are not independent in this sense. The conjecture states the asymptotic relationship, not the transient one. Periods during which several variants of an in-band primitive coexist are transient by hypothesis.

**Self-description of `P`.** The minimum set of statements `P` must contain to specify what is and is not a valid instance of `P`. If `P` cannot tell a valid instance from an invalid one, `P` carries no agreement. The self-description of TCP/IP is roughly *«bytes flow in order, addressed by IP, errors detected by checksum»*. Without such a description, `P` is not a primitive — it is noise.

**Particular instance.** A concrete case that adopts `P` and adds further commitments. A specific USB device is a particular instance of USB. A specific human language is a particular instance of universal grammar. A specific frying pan is a particular instance of *«flat bottom, heat from below»*.

---

## Convergence as equilibrium

If a real primitive in the band exists at a level, convergence on it is the equilibrium of independent adopters under economic pressure.

The argument is short. Whenever two adopters of different in-band variants attempt to interact, one of three things happens. They invest in a translation layer (cost). One adopts the other's variant (cost). Neither side adapts and the interaction does not happen (opportunity cost). All three are losses against a counterfactual in which both had adopted the same variant from the start. As the number of adopters and interactions grows, the cumulative cost of disagreement grows superlinearly, and the cheapest stable state — convergence on a single variant — becomes the attractor.

This is the same dynamic visible in distributed-systems consensus. A Raft cluster occasionally has periods of leaderlessness or split votes, but the protocol resolves to a single leader because that is the cheapest stable state. The leaderless transient is real; the single-leader equilibrium is also real; one resolves into the other given time.

Convergence is therefore not a separate force from the conjecture. It is the conjecture realising itself in time. The current absence of a single dominant primitive at a given level is, by the conjecture, evidence of one of two things — either no real primitive at that level has yet been found, or the population of adopters is in a transient period before convergence.

For TCP/IP, convergence took roughly two decades. For USB, fifteen years. For the genetic code, on the order of a billion years. For Op as a candidate primitive at the operation level, the equilibrium has not yet been reached. The conjecture predicts that, if Op is a real primitive in the band, convergence will occur — and if it does not occur within a reasonable time after broad exposure, the conjecture itself is falsified for that case.

---

## Predecessors

This conjecture does not stand alone. Each of its three claims has been articulated, in adjacent form, by earlier thinkers. We name them honestly. None stated all three together as a single condition — but all three came from somewhere, and the somewhere belongs in the ledger.

### The narrow-waist principle (1974, 1988)

**Vint Cerf, Bob Kahn**, in the original TCP/IP architecture (1974), and later **David D. Clark** (MIT, *«Designing a Protocol for the Internet»*, 1988) named the *hourglass* shape: a thin layer in the middle, broad surfaces above and below. The narrow waist enables the broad surfaces. This is the *«smaller common, larger interaction»* claim, expressed geometrically.

We use this directly. The Primitive Range Conjecture generalises the narrow-waist principle from network protocols to any shared agreement.

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

The narrow-waist principle gives us *«smaller common, larger interaction»* but does not name the bounds. The Primitive Range Conjecture adds two bounds — the self-sufficiency floor and the particularity ceiling — and binds them into a single falsifiable condition.

If a published paper has stated this combination already, we ask the reader to send the citation, and we will revise this document accordingly.

---

## Falsification conditions

This document is structured for falsification. The conjecture is considered **falsified** when any of the following is demonstrated:

1. **A primitive `P` outside the band that enables broader interaction than a primitive within the band.** For example: a primitive that is *larger* than a particular case, yet admits more independent parties than the smaller primitives in its space. We expect this to be impossible. We invite a counterexample.

2. **A primitive `P` below the self-sufficiency floor that nevertheless functions as an agreement.** That is: a primitive that cannot describe what is and is not a valid instance, yet which independent parties successfully use to meet. If found, the lower bound is wrong.

3. **A primitive `P` above the particularity ceiling that admits genuinely independent parties.** That is: a primitive containing all the commitments of one specific instance, yet still hosting other instances designed without coordination with the first. If found, the upper bound is wrong.

4. **A counterexample to the inverse proportionality itself.** Two primitives `P₁` and `P₂` both within the band, with `|P₁| < |P₂|`, where `interop(P₁) < interop(P₂)`, controlling for adoption time and ecosystem maturity. If found and reproduced, the proportionality direction is wrong.

5. **A real primitive in the band, of which several mutually-incompatible variants persist indefinitely without convergence to one.** If the conjecture holds, economic pressure on independent adopters converges them. If, after a long enough observation window, multiple variants of an in-band primitive remain in active competition without one absorbing the others, the convergence implication is wrong — and with it the conjecture itself.

A counterexample to any of the five falsifies the conjecture as stated. The author commits to revising the document on the public record when any such counterexample is presented with sufficient evidence.

---

## Open questions

The conjecture is stated, not closed. Two questions remain open and honest.

1. **How is `|P|` measured precisely?** *«Number of independent commitments»* is a natural-language definition. A formal metric is still owed.

2. **What is the time scale of convergence at each level?** TCP/IP converged in roughly two decades. USB in fifteen years. The genetic code in perhaps a billion. The conjecture says that convergence happens if the primitive is real — it does not say how fast.

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
