# universal/ — roadmap

What we plan to build next inside `universal/`. Not a contract. A direction.

Each milestone is a verifiable state of the world, not a category of work. A milestone closes when someone from the outside can run it and observe the result.

See [devlog #28 — Dobby Is Free](../docs/notes/form-of-operation/028-dobby-is-free.md) for why `universal/` exists at all, and [devlog #29 — The Anthill Organizes](../docs/notes/form-of-operation/029-the-anthill-organizes.md) for why we do not plan beyond the horizon of real need.

## Fixtures — shared across all milestones

One canonical instruction lives at `universal/fixtures/dogshop.json` — adapted from the playground tutorial. Every compiler and every emitter on this roadmap consumes the same fixture. A broken sibling lives at `universal/fixtures/dogshop_invalid.json` — deliberately malformed for testing refusal behaviour.

The instruction does not belong to any one compiler. Fixtures are shared at the `universal/` level, not nested under a vendor.

## Milestone 1 — `universal/openapi` compiles `dogshop.json` into valid OpenAPI

Atomic dependency: `openapi` and `http` are one milestone, not two. Neither is observable without the other.

- `universal/openapi/` — a compiler. Deterministic. Knows its own boundaries of validity. Refuses invalid input.
- `universal/http/` — shapes for HTTP: method, path (with `{param}` placeholder convention), header, status. Shapes, not enumerations.
- The compiler collects **all** validation errors in one pass, not just the first. That is the baseline every serious compiler hits — Go, Rust, TypeScript, Elm — and ours must too.
- The compiler **ignores unknown traits** without warning. A trait from a vendor it does not know is not an error — it is orientation the compiler chose not to declare. See devlog #28.
- Refusal on invalid input is a first-class feature, not a defensive check. The compiler protects its own reputation by being explicit about what it cannot produce.

Proof: `dogshop.json` produces a valid OpenAPI document that opens in Swagger UI. `dogshop_invalid.json` produces a full list of violations and a non-zero exit code.

## Milestone 2 — `universal/auth` and `universal/owner` exist, and `universal/openapi` understands them

Two small trait vendors land together because they share a shape — each is a single trait read by the OpenAPI compiler — and because each is independently observable in the produced document.

- `universal/auth/` — one shape. A trait declaring the authentication mechanism of an operation.
- `universal/owner/` — one shape. A trait declaring which group an operation belongs to. Maps to OpenAPI `tags`.
- `universal/openapi` is wired to understand a small, fixed set of URIs: `universal/auth` directly, the `Authorization` header from `universal/http` per RFC 7235, and `universal/owner`. Nothing else.

How the compiler reconciles these internally is its own business, not part of the protocol. We do not publish that logic as a pattern. Vendors handle their own coexistence concerns. That is implementation, not Op.

Proof: the lock icon appears in Swagger UI for operations that declare auth, and Swagger UI groups operations by their owner under separate sections.

## Milestone 3 — `universal/gin` compiler. Instruction → Gin application

The other side of the HTTP story. Not documentation — code.

- `universal/gin/` — a compiler. Reads `dogshop.json`, produces Gin routes, handlers, types, error mappings.
- Path parameters `{id}` from `universal/http` are translated into Gin-native `:id`.
- The same discipline as M1: all errors in one pass, unknown traits ignored.

Proof: a runnable Gin application compiled from the fixture. Requests to declared routes return declared shapes.

## Milestone 4 — Gin emitter. Gin application → instruction. Round trip closes

An emitter extracts an instruction from a Gin application that already exists in the world. This is archaeology of the guts — scaffolding against the era of amnesia, per [devlog #30](../docs/notes/form-of-operation/030-the-first-stranger.md).

- The emitter reads Gin source, walks routes, extracts methods, paths, types, statuses.
- Output is an instruction with `universal/http` traits.

Proof: `compile(emit(app)) ≈ app`. The round trip closes. The same vendor (`universal/http`) is read by a compiler and produced by an emitter. Semantic equivalence preserved.

## Milestone 5 — `universal/cobra` compiler + `universal/cli`. Instruction → CLI

The final milestone is the one that matters most ideologically. Op is not about HTTP. Op is about operations. This milestone proves it.

- `universal/cli/` — a vendor. One shape: the command name a CLI uses to expose an operation. Nothing else — everything else (flags, output, errors) is derived from the core Op rails.
- `universal/cobra/` — a compiler. Reads the same `dogshop.json`, produces a Cobra CLI application. Flags from the input rail, exit codes from errors, output serialization from kinds.
- Same discipline: all errors in one pass, unknown traits ignored.

Proof: the same fixture that became OpenAPI in M1 and Gin in M3 now becomes a working command-line tool. The vendors and compilers from earlier milestones compose with a new vendor (`universal/cli`) and a new compiler (`universal/cobra`) without modification. N+M proven in the flesh.

## Side products — not milestones

- URI constants for Go and PHP. Each vendor may publish them in its own subdirectory if a compiler actually consumes them. They are born where they are used, not as a planned phase.

## Deliberately not planned

- No `universal/grpc`, `universal/kafka`, `universal/websocket`, `universal/graphql`. Those belong to vendors who know those waters. We will not preempt them.
- No `universal/validate`. Validation is an opinion we are not ready to impose. Awaiting someone bolder.
- No `universal/resilience`, no `universal/otel`, no `universal/example`. If a consumer appears, a vendor appears. Not before.
- No global registry of dialects. The anthill will organize one if and when it needs one (see devlog #29).
- The playground is not rewired to consume `universal/fixtures/`. Not yet. One cup at a time — the fundamentals must not move while we are pouring.

## Success condition

When readers look at this roadmap and see most items crossed out by people who are not us, we have won.
