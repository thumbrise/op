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

## Why this exists

The operation evolved independently at least fourteen times — in quantum mechanics, biology, neuroscience, CPU architecture, programming languages, game theory, economics, law, and linguistics. Each discipline arrived at the same five-field pattern without coordination. Like the eye evolved forty times because light exists, the operation evolved because interaction exists.

Yet the software industry has no shared format for it. Every framework reinvents the same five fields and welds them to one transport. gRPC locks you to protobuf. OpenAPI locks you to HTTP. tRPC locks you to TypeScript. Generators convert one shadow into another shadow. Nobody describes the thing itself.

Op is the thing itself.

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

## What this is not

- Op is not a framework. It does not dictate how to build.
- Op is not transport. It does not dictate how to deliver.
- Op is not an RPC system. It does not dictate how to call.
- Op is not a schema language. It does not dictate how to validate.
- Op is not a serialization format. It does not dictate how to encode.
- Op is not a runtime. It does not dictate how to execute.
- Op is not a standard library. It does not dictate how to implement.
- Op is not a code generator. Typed clients, documentation, OpenAPI specs, MCP tool definitions — those are consequences, not the point.

**Op is the formal definition of the operation** — the primitive that every framework, every transport, every RPC system, every schema language has been reinventing independently since 1957. It does not dictate. It does not compete. It cannot be broken, because there is nothing to break — five fields is the minimum that describes interaction, and the second law of thermodynamics guarantees the error rail cannot be removed.

Op is the future that Berners-Lee dreamed of in 2001 — machines understanding what services can do — approached from the opposite direction. He built seven layers from the top. We found five fields from the bottom. The destination is the same. The road is not. And this time the road has no committees, no ontologies, and no XML. Just a primitive so simple that the ecosystem self-organizes around it. Like language. Like money. Like the internet itself.

## Proof of concept — v1.0

The theory predicts that one instruction format can replace N×M integrations with N+M. The proof is a working ecosystem:

- [ ] **Cross-language emission** — the same operation described from Go, PHP, TS, and at least one non-mainstream language produces identical instructions. The primitive is language-agnostic in practice, not just in theory
- [ ] **Cross-platform compilation** — one instruction compiles into a Laravel route, an Express handler, an OpenAPI spec, and an MCP tool definition. Receivers are independent. They do not know about each other. Like GNOME and KDE drawing different icons from the same D-Bus introspection
- [ ] **Real operations** — at least three operations from a production domain (not toy examples) described, compiled, and deployed. The five fields hold under real-world pressure
- [ ] **Validation** — a schema-level proof that every instruction conforms to the five-field structure. Invalid input → precise error. The contract is machine-enforceable
- [ ] **Formal specification** — RFC, JSON Schema (`instruction.v1.json`), versioned and frozen. The protocol is citable, auditable, and forkable

## License

[Apache 2.0](LICENSE)
