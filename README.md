# op

**The operation is the fundamental primitive of computation.** Every function, every API endpoint, every syscall, every neuron firing, every enzyme catalyzing a reaction — is an operation. Input, output, the possibility of failure. From transistors to business logic. We did not invent it. We formalized it.

```
Op ≔ Σ(id: Id). Σ(c: Comment). (Π(x: Input). Output ⊕ Error) × Traits
```

```
@Trait("http/method", "POST")
operation BuyDog(input: BuyDogInput): BuyDogOutput throws DogNotFound | BudgetExceeded
```

Five fields. Extensions attached from outside. Nothing more.

**Status:** forming. No public API yet. Apache 2.0.

## Before you read anything else

Read these three documents, in this order, before the rest:

1. **[Tim's Dream](https://thumbrise.github.io/op/dreams/)** — a short book. No technical words. Start here if you want to understand what this is about before reading anything else.
2. **[ACKNOWLEDGEMENTS.md](https://thumbrise.github.io/op/ACKNOWLEDGEMENTS)** — every person, project, and discipline this work stands on. Standing on the shoulders of the founders. Respect comes first.
3. **[FAQ.md](https://thumbrise.github.io/op/FAQ)** — how this repository is meant to be read, what is and is not being claimed, common misreadings, common technical objections.
4. **The rest of this README, the devlogs, and the materials** — what we found, after the credit and the framing are in place.

## Why this exists

The operation evolved independently at least fourteen times — in quantum mechanics, biology, neuroscience, CPU architecture, programming languages, game theory, economics, law, and linguistics. Each discipline arrived at the same five-field pattern without coordination. Like the eye evolved forty times because light exists, the operation evolved because interaction exists.

In software, the same form has been approached from many directions. gRPC found it through protobuf. OpenAPI found it through HTTP. tRPC found it through TypeScript. Each one carried part of the form along with one particular transport, language, or vendor. Each one is a shoulder Op stands on.

Op tries to name the form on its own — without the transport, without the language, without the vendor.

## What it is

Op (Operations Protocol) is a formalization of the operation as a universal primitive:

- **Five fields** — `id`, `comment`, `input`, `output`, `errors` — describe any operation at any level. Not an opinion. A fact. Like Church's lambda calculus formalized computation in 1936.
- **Traits** — namespaced key-value extensions attached from outside. HTTP routes, gRPC services, authentication, CLI flags. The operation does not change when a trait is added or removed. Traits are opinions. The operation is the fact.
- **Instructions** — versioned, fully resolved units that flow between **emitters** (DSL compilers, scrapers, handwritten JSON) and **receivers** (framework compilers, documentation portals, AI tool registries, security scanners) through any transport.

**N + M instead of N × M.** New emitter — all receivers for free. New receiver — all emitters for free. The economics of LLVM applied one floor higher.

Op is not a framework, not a compiler, not a DSL. It is the boundary between physics and opinions. Below it — the structure of interaction. Above it — the infinite projections the industry invents. The protocol stands on the boundary. And gets out of the way.

## The research

The [devlog](https://thumbrise.github.io/op/devlog/) documents the full journey — from "I don't want to write Swagger three times" to "the second law of thermodynamics guarantees a non-empty error rail."

The [landing page](https://thumbrise.github.io/op/) shows the problems, the solution, and what it unlocks — in diagrams.

Key findings:
- The operation is [convergent evolution](https://thumbrise.github.io/op/devlog/013-convergent-evolution) — fourteen disciplines, one pattern, zero coordination
- Emitters and receivers are [compilers, not generators](https://thumbrise.github.io/op/devlog/010-there-is-no-generation) — with contracts and guarantees
- The instruction [is the operation](https://thumbrise.github.io/op/devlog/014-the-fact), not a description of it — zero drift between map and territory
- Tim Berners-Lee [dreamed of this in 2001](https://thumbrise.github.io/op/devlog/016-the-founders-dream) — he built seven layers, we built five fields

## Proof of concept — v1.0

The theory predicts that one instruction format can replace N×M integrations with N+M. The proof is a working ecosystem:

- [ ] **Cross-language emission** — the same operation described from Go, PHP, TS, and at least one non-mainstream language produces identical instructions. The primitive is language-agnostic in practice, not just in theory
- [ ] **Cross-platform compilation** — one instruction compiles into a Laravel route, an Express handler, an OpenAPI spec, and an MCP tool definition. Receivers are independent. They do not know about each other. Like GNOME and KDE drawing different icons from the same D-Bus introspection
- [ ] **Real operations** — at least three operations from a production domain (not toy examples) described, compiled, and deployed. The five fields hold under real-world pressure
- [ ] **Validation** — a schema-level proof that every instruction conforms to the five-field structure. Invalid input → precise error. The contract is machine-enforceable
- [ ] **Formal specification** — RFC, JSON Schema (`instruction.v1.json`), versioned and frozen. The protocol is citable, auditable, and forkable

## Forget everything above

This was the bait. Lists. Diagrams. Five fields. The PoC checklist.
All of it true. None of it the point.

Op is not an optimization. Op is a form. Found through long subtractions.
Each subtraction made it more applicable. What remained was five fields.

The goal is not to remove boilerplate. The goal is for programs to
understand each other's capabilities. The consequences run wider than
what we can list today.

If you read this far — you are not a user. You are an early hand.
What is below is for those who want to understand.

- [The Devlog](https://thumbrise.github.io/op/devlog/) — how the form was found.
- [The Conjecture](https://thumbrise.github.io/op/reference/the-primitive-range-conjecture) — the law that holds it.
- [Tim's Dream](https://thumbrise.github.io/op/dreams/) — a book about a world where it worked.
- [The Schema](https://thumbrise.github.io/op/schema/instruction.v1.json) — the form itself.

There is no «Get Started» button here. Op is not for sale.
Op either surfaces in you on its own — or it does not.

## License

[Apache 2.0](LICENSE)
