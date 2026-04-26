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
| Author | Ruslan Kokoev. Standing on the shoulders of those credited in [Acknowledgements](../ACKNOWLEDGEMENTS). |

This document may be revised when better evidence arrives.

---

## What we say

A primitive is a shared form. It is **larger than nothing** (because it must describe itself) and **smaller than any particular case** (because it must admit more than one).

We say three things:

1. **A primitive is bigger than nothing and smaller than an opinion.**
2. **Disagreement is convergence that has not happened yet.**
3. **Convergence is unavoidable, because it is cheaper.**

## Definitions

**Primitive.** A shared form that independent parties accept as the surface of their meeting.

**Nothing.** The form that does not describe itself. In one conversation it is nothing; in another conversation about a different goal it may be a primitive of a different kind. Nothing is not garbage. Nothing is the part of the world that is not in this room.

**Opinion.** A particular case carried as if it were the form. An opinion lets one adopter in; it pushes the rest out. An opinion is the cause of a failed agreement.

**Goal.** What the form is for. The goal does not exist before the form. A primitive is found by removing what does not belong; what remains points back at the goal that the form turned out to serve. Mendeleev did not look for a periodic table; he looked for an order in chemistry. The table came first, then the goal of *predicting unknown elements* came with it.

**Convergence.** The state in which independent adopters of a primitive end up using the same one. Convergence is reached because the cost of disagreement, summed over many encounters, is greater than the cost of switching once.

**Cost.** Time, energy, money, attention, survival — depends on the goal. The form of cost differs by domain. The shape of cost is always the same: less is better.

---

## Why we say it

Three reasons. Independent of each other. We do not need all three to make the case. We have all three.

### One — Op is built this way

Op is five fields: identifier, input, output, error, optional context. Nothing more. The five fields describe themselves in JSON Schema; without one of them, the form does not hold. With one more, the form becomes a particular case. The form was found by removing what did not belong, until removing the next thing would break it. The remaining shape is the primitive of operation. Argument from inside the work. See [#8 — Three Atoms](../devlog/008-three-atoms), [#18 — The Fourth Rail](../devlog/018-the-fourth-rail), [#23 — The Vacant Cell](../devlog/023-the-vacant-cell), [#32 — The Verdict](../devlog/032-the-verdict).

### Two — the industry is moving in one direction

Independent attempts to name an operation have been made since 1989: WSDL+UDDI (2000), Schema.org (2011), OpenAPI (2011), GraphQL Introspection (2015), MCP (2024), and others. Each attempt drops one opinion the previous one carried. WSDL dropped committees and kept XML. Schema.org dropped XML and kept HTML. OpenAPI dropped HTML and kept HTTP. GraphQL dropped HTTP and kept its own runtime. MCP dropped runtime and kept the consumer. The direction is not a forecast; it is what each attempt did relative to the one before it. The next attempt may continue the line or it may not — the line is recorded, not predicted. Argument from observation. See [#16 — The Founder's Dream](../devlog/016-the-founders-dream).

### Three — nature has done this before, without speech

The same shape — a small primitive enabling broad interaction — has been documented independently in many fields, without coordination:

- **Genetics.** Four nucleotides (ATGC), one universal genetic code across all life.
- **Statistical mechanics.** Microstate, macrostate, interpretation — three levels (Boltzmann, 1870s).
- **Lambda calculus.** Variable, abstraction, application — three constructions, sufficient for all computation (Church, 1936).
- **Hardware standards.** USB connector geometry — same shape across decades and vendors.
- **Pheromone signalling.** Six chemical signals coordinate a termite colony of millions.
- **Universal grammar.** Subject-Verb-Object structure across all human languages.
- **Process algebras.** CSP (Hoare, 1978), π-calculus (Milner, 1992), session types (Honda et al., 1998).

Argument from history and biology. See [#13 — Convergent Evolution](../devlog/013-convergent-evolution), [#32 — The Verdict](../devlog/032-the-verdict), and the peer-reviewed verification in [Appendix A — Raw Notes](./rfc-operation-protocol-appendix-a-raw).

The narrow-waist principle (Cerf and Kahn, TCP/IP, 1974; Clark, MIT, 1988) names the same shape in network protocols. We generalise it to any shared form.

---

## How to falsify

The conjecture is falsified when any of the following is demonstrated.

1. **A form smaller than nothing that still works.** A form that does not describe itself, yet independent parties successfully meet through it. If found, the lower bound is wrong.

2. **A form larger than an opinion that still admits more than one.** A form containing the commitments of one particular case, yet hosting other particular cases designed without coordination with the first. If found, the upper bound is wrong.

3. **Two primitives, both bigger than nothing and smaller than an opinion, where the larger admits more parties than the smaller.** Controlled for the same goal. If reproduced, the inverse direction is wrong.

A counterexample to any of these falsifies the conjecture. The document is revised on the public record when one is presented with evidence.

Time is not a falsifier here. Discovery of a primitive may take centuries, as DNA waited for Miescher in 1869 and Watson and Crick in 1953 while existing for nearly four billion years. The shape of the law does not depend on when the law is recognised. Falsification, when it comes, is structural — a counterexample, not a stopwatch.

A counterexample to this conjecture takes the same shape it does in physics or biology: demonstrated, reproduced, and not explained away by «the situation has not finished settling». The atom waited 2300 years from Democritus to Rutherford for confirmation. The black swan was found in Australia. Both arrived eventually. The conjecture is offered in that lineage — an empirical regularity that stands until something concrete breaks it, not a logical theorem closed by proof.

---

## What stays open

The size of a primitive cannot be measured by a formula. Only by feel — by trying, weighing, comparing what was and what is, and watching whether the goal still holds. The metric is empirical. We owe nothing more honest than that.

---

## What follows

Find the smallest form that still describes itself. Refuse to carry commitments that belong to a particular case. Stay between the two.

This is the discipline that produced TCP/IP, USB, the genetic code, and the universal grammar of human languages. The conjecture does not invent the discipline. It names it.

---

## See also

- [Acknowledgements](../ACKNOWLEDGEMENTS) — every name this document leans on.
- [#13 — Convergent Evolution](../devlog/013-convergent-evolution) — convergence across fourteen disciplines.
- [#32 — The Verdict](../devlog/032-the-verdict) — four witnesses.
- [#23 — The Vacant Cell](../devlog/023-the-vacant-cell) — the four-property hole in protocol space.
- [RFC — Operation Protocol](./rfc-operation-protocol) — the protocol that motivated this conjecture.
- [Appendix A — Raw Notes](./rfc-operation-protocol-appendix-a-raw) — peer-reviewed convergence evidence.
