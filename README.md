# op

Transport-agnostic, language-agnostic application-layer protocol for describing operations. Solves the Expression Problem with traits.

**Status:** forming. No public API yet.

## v1.0 Acceptance Criteria
- [ ] At least 4 emitters exist (different languages or paradigms)
- [ ] At least 4 receivers exist (different projection targets)
- [ ] At least 3 real operations described through OP
- [ ] Validator passes all examples
- [ ] SDK: Go, TS, PHP — types match schema
- [ ] RFC — single file, changelog at bottom
- [ ] JSON Schema `instruction.v1.json` — no breaking changes since last RFC revision
- [ ] `spec/op` page — versioned, frozen

## What is this

Op (Operations Protocol) is a decentralized interface for operations. An operation is `func(Input) → (Output, error)` — a name, a description, an input type, an output type, and the possibility of failure. Nothing more.

Traits extend operations without changing the core: HTTP routes, gRPC services, authentication, CLI flags — all are namespaced key-value extensions that producers add and consumers read. The core never changes. The ecosystem expands infinitely.

Instructions — versioned, fully resolved units — flow between **producers** (DSL adapters, scripts, handwritten JSON) and **consumers** (compilers, loggers, diagram tools, database migrators) through any transport: stdin, files, HTTP, gRPC, or carrier pigeon.

Op is not a framework, not a compiler, not a DSL. It is the missing layer between business logic and the infinite projections the industry demands.

Read the [devlog](https://thumbrise.github.io/op/devlog/) for the full story.

## License

[Apache 2.0](LICENSE)
