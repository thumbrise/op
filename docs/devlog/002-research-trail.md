---
title: "#2 — Research Trail"
description: "What we found inside Scramble, Huma, and Wire — and why nobody built the missing layer."
---

# Research Trail

Before writing code, we opened the hood on three tools that came closest to what Op is trying to be. Each one discovered something fundamental. Each one stopped short.

This is a frozen snapshot of the research — evidence for the future RFC, not a specification.

## Scramble: the model that stayed locked inside

[dedoc/scramble](https://github.com/dedoc/scramble) is a PHP/Laravel tool that generates OpenAPI documentation from source code. No annotations. It parses controller methods, resolves return types, unwraps generic collections, follows call chains to infer what `PostRepository::find()` returns. Enormous engineering effort.

**What they built internally:**

- Route discovery via Laravel's `RouteFacade::getRoutes()`
- Input type resolution from `FormRequest` classes and PHP 8 attributes
- Deep return type inference (`Infer`) — follows method calls through the codebase
- Generic collection unwrapping (`Collection<User>`, pagination wrappers, API resources)

**The critical finding:** there is no intermediate operation descriptor. The `OperationBuilder` produces an OpenAPI `Operation` object directly — with fields like `servers`, `security`, `responses` keyed by HTTP status codes. The "parse operations from source" pipeline and the "generate OpenAPI" pipeline are entangled in the `Generator` class. There is no clean boundary.

```
Source code → OperationBuilder → OpenAPI Operation (directly)
                                  ↑
                          No intermediate model.
                          No transport-agnostic layer.
                          No public API for the parsed data.
```

**What this means:** Scramble *had* a full operation model. Input types, output types, method signatures, generic resolution — all of it. But the model was born as an OpenAPI object and never existed independently. Want to generate a CLI command from the same parsed data? Dig through the source. Want to build your own projection? No API. Want advanced features? Pro version.

They formulated the fundamental. Then welded it to one output format and put a price tag on it.

## Huma: one step away

[danielgtaylor/huma](https://github.com/danielgtaylor/huma) is the closest anyone got in Go. It reads Go structs via runtime reflection, infers OpenAPI schemas, generates documentation — no annotations, no external IDL. And unlike Scramble, Huma has a **public** `Operation` struct. You can create it, inspect it, pass it around.

**What they got right:**

- Operations are first-class objects, not hidden internals
- Clean boundary between "describe the operation" (`huma.Operation`) and "register it" (`huma.Register`)
- Router-agnostic — adapters for chi, gin, fiber, net/http
- Input/Output types are plain Go structs — your use case stays clean

**What's baked in:**

The `Operation` struct carries `Method`, `Path`, `Parameters` with `in:"path"` — HTTP semantics are part of the model, not a projection. The operation *is* an HTTP endpoint. There is no layer where the operation exists before HTTP touches it.

```
huma.Operation {
    OperationID  string       // ✓ fundamental
    Summary      string       // ✓ fundamental
    Tags         []string     // ✓ fundamental
    Method       string       // ✗ HTTP-specific
    Path         string       // ✗ HTTP-specific
    Parameters   []Param      // ✗ HTTP-specific (in:"path", in:"query")
    Security     []map[...]   // ✗ HTTP-specific
    Servers      []Server     // ✗ HTTP-specific
}
```

**Runtime reflection consequences:**

- Types are analyzed at runtime, not compile time — errors surface when the server starts, not when you build
- No generated artifacts — nothing to commit, nothing to verify in CI, nothing for external tools to consume
- Can't generate CLI commands, gRPC stubs, or anything else from the model — the model only exists inside a running process
- Huma's built-in CLI (`humacli`) is for server management (start, stop, config), not for projecting operations onto CLI commands

**The verdict:** Huma discovered the same fundamental — "an operation is a typed unit with input and output." They even made it public. But `Method` and `Path` are fields on the descriptor, not traits on a projection. The operation and its HTTP binding are the same object. One step from transport-agnostic. One step they didn't take.

## Wire: the precedent

[google/wire](https://github.com/google/wire) is not about operations. It's about dependency injection. But it proved the model that Op inherits: Go code as DSL → static analysis → generated Go code → compiler verifies.

**The three-phase pipeline:**

1. **Parse** — `go/packages` loads source, AST finds `wire.Build()` and `wire.NewSet()` calls, builds internal structures (`ProviderSet`, `Provider`, `IfaceBinding`)
2. **Analyze** — dependency graph is checked for cycles (`verifyAcyclic`), then `solve` linearizes it into a sequence of constructor calls
3. **Generate** — `text/template` produces `wire_gen.go` with typed, compilable Go code

This is the architecture Op follows. Parse the DSL. Build the model. Generate from the model. Three phases, clean boundaries.

**What Wire got right:**

- Go types as IDL — no external schema language, no annotations
- `go/types` + `go/packages` as the analysis toolchain — same tools Op uses
- Generated code is committed, reviewed, compiled — not runtime magic
- Golden file testing — run generator on `testdata/` packages, compare output with `.go` files. The standard for testing generators.

**Where Wire stopped:**

- **Internal model** — `ProviderSet` and `Provider` are unexported. One projection (DI wiring) doesn't need a public model. Three projections (verify, generate, describe) do. Op must export `Descriptor` from day one.
- **No generics** — Wire predates Go 1.18. Op starts on Go 1.26. Generics are a must.
- **Single projection** — Wire generates one artifact (`wire_gen.go`). No linter. No `wire list --json`. The model exists only to serve generation. Op's model serves three masters: verify, generate, describe.
- **Error reporting** — Wire can be verbose and unclear when the dependency graph has issues. Op should collect diagnostics across all phases and present them together.

**What Op inherits:**

```
Wire:  wire.Build(providers...)  →  go/types  →  wire_gen.go
Op:    op.New(name, handle, ...) →  go/types  →  plugins → _gen.go files
```

Same toolchain. Same contract: DSL in, typed code out, compiler verifies. Different domain — dependencies vs operations. And Op adds two projections Wire never had: verify (linter) and describe (structured JSON).

## The convergence table

| Tool | Discovered | Stopped at | Op takes further |
|---|---|---|---|
| **Scramble** | Operations can be parsed from source code. Types contain everything. | Entangled with OpenAPI. No public model. Pro paywall. | Explicit DSL instead of auto-parsing. Model is public. Plugins are projections. |
| **Huma** | Operations are first-class objects. Go types as schema source. | HTTP baked into the descriptor. Runtime only. | Transport-agnostic descriptor. HTTP is a trait, not a field. Compile-time. |
| **Wire** | Go code as DSL. `go/types` for static analysis. Generated code committed and compiled. | Single projection. Internal model. No generics. | Three projections (verify, generate, describe). Public model. Plugin architecture. |
| **Protobuf** | Transport-agnostic IDL. Plugin ecosystem. Community generators. | Not Go. External toolchain. HTTP leaked in via `google.api.http`. | Go types *are* the IDL. No external compiler. Traits instead of annotations. |
| **swaggo** | Documentation lives in the code. | Asked developers to write it a third time in comments. | Types are the documentation. No annotations. |

## Discovery: traits are invariants

During the design session, we realized that traits are not annotations. A trait is an **invariant** — a statement that must be true for the entire call chain of an operation.

`httpplug.Bearer("UserID", parseBearer)` is not "mark this endpoint as Bearer in swagger." It is a statement: **"in the call chain of this operation, the Authorization header is read, validated via Bearer scheme, and the result is placed in the UserID field of Input."** If the statement is false — the program is incorrect.

This changes what `goop generate` does. It's not just a code generator. It's a **verifier first**:

```
$ goop generate

  VERIFY  checking 12 operations...

  ERROR  CreateDog

    Invariant violation: httpplug.Bearer("UserID", parseBearer)

    The operation declares Bearer authentication, but no authorization
    check was found in the call chain:

      mux.Handle("POST /api/dogs", genhttp.CreateDog)
        → genhttp handler calls CreateDog.Handle(ctx, input)
          → dogs.Create(ctx, ...)
            → db.Exec(ctx, ...)

    Nobody in this chain reads r.Header.Get("Authorization").

  FAIL  generation aborted — 1 invariant violation
```

Verify runs first. Always. If invariants are violated — generation does not start. You cannot generate code from a dishonest model.

This is possible because Go gives us `go/ssa` — Static Single Assignment form of the entire program. Full call graph. We can trace from the HTTP handler entry point down through every function call and check whether a specific operation (like reading the Authorization header) exists anywhere in the chain.

Every Go HTTP library ultimately calls `r.Header.Get("Authorization")` or equivalent. There is no other way to read a header in Go. The primitive is finite. The analysis is sound.

## Discovery: Input is everything the operation needs

A use case is a method on a struct: `func (c *CreatePost) Handle(ctx context.Context, input CreatePostInput) (*CreatePostOutput, error)`. The struct holds dependencies (injected via constructor). Input holds **per-call data** — everything the operation needs for this specific invocation.

UserID from a JWT token? That's Input. Not context magic. Not a hidden dependency. A field on the Input struct:

```go
type CreateDogInput struct {
    UserID string
    Name   string
    Breed  string
}
```

The domain doesn't know where UserID comes from. httpplug fills it from the Authorization header. cobraplug fills it from a `--token` flag. Tests fill it directly. The use case sees a populated struct. Clean. Honest. Testable:

```go
output, err := createDog.Handle(ctx, CreateDogInput{
    UserID: "usr_123",
    Name:   "Rex",
    Breed:  "Shepherd",
})
```

No middleware setup. No context values. No magic. Blackbox test.

httpplug knows which fields come from the client (JSON body) and which are bound from other sources. Bound fields are excluded from the request body schema automatically. No struct tags needed — the DSL is the source of truth:

```go
httpAuthorized := op.NewSet(
    httpplug.Bearer("UserID", parseBearer),
)

op.New("CreateDog", (*CreateDog).Handle,
    httpAuthorized,
    op.Tags("Dogs"),
    httpplug.Post("/api/dogs"),
)
```

## Discovery: plugins read each other, not duplicate

swagplug depends on httpplug. When httpplug declares `Bearer("UserID", parseBearer)` on an operation, swagplug sees it through its explicit dependency and writes `security: [bearerAuth: []]` in the OpenAPI spec. No separate `swagplug.Security(...)` trait needed. One source of truth. Zero duplication.

```go
// swagplug internally:
bearer := httpplug.BearerFrom(ctx)
if bearer != nil {
    // add security to spec
}
```

If httpplug says Bearer — swagplug documents Bearer. If httpplug says nothing — swagplug documents nothing. The spec cannot lie about auth because it reads the same trait that generates the auth check.

cobraplug doesn't know about httpplug. It has its own mechanism:

```go
cliAuthorized := op.NewSet(
    cobraplug.Token("UserID", parseTokenFromEnv),
)
```

Same field (`UserID`). Same operation. Different transport, different source. Each plugin reads only what it knows. Each plugin ignores what it doesn't.

## Discovery: context as descriptor

`op.Tags("Posts")` is not `descriptor.Tags = append("Posts")`. It's `op.AddTag(ctx, "Posts")` — a function that enriches a build context. The descriptor is not a struct with fixed fields. It's a **context** with typed accessors:

```go
// Core provides helpers
op.Tags(ctx)    // → []string
op.Name(ctx)    // → string
op.Comment(ctx) // → string

// httpplug provides its own
httpplug.RouteFrom(ctx)   // → Route{Method, Path}
httpplug.BearerFrom(ctx)  // → *BearerConfig

// Plugins read what they need, ignore the rest
```

No fixed struct. No fields to add when a new plugin appears. Core never changes. New plugin = new typed key in context. OCP through Go's import graph — the same collision/knowledge principle proven in the resilience stress debate.

## Discovery: zero runtime overhead

DSL files carry a build tag:

```go
//go:build op

package dogs

import (
    "github.com/thumbrise/op"
    "github.com/thumbrise/op/httpplug"
)

func Operations() []op.Descriptor {
    return []op.Descriptor{
        op.New("CreateDog", (*CreateDog).Handle,
            httpAuthorized,
            op.Tags("Dogs"),
            httpplug.Post("/api/dogs"),
        ),
    }
}
```

`//go:build op` — `go build` does not see this file. `goop generate` does. Same pattern as Wire's `//go:build wireinject`.

What's in the binary: your use cases, generated `_gen.go` handlers, your `main.go`. What's **not** in the binary: `github.com/thumbrise/op`, `op/httpplug`, `op/swagplug`, `op/cobraplug`. Zero runtime dependencies on Op. Zero. Op came, generated, left.

```
go list -deps ./... | grep op
// empty. Op is not in the binary's dependency graph.
```

Huma pulls `reflect` into every request. Scramble pulls the entire analyzer into runtime. Op pulls **nothing**. The generated code is self-contained typed Go. The compiler verifies it. The binary knows nothing about Op.

## Discovery: composable sets

Traits compose via `op.NewSet`. Sets can include other sets. This eliminates repetition across operations without coupling them:

```go
httpAuthorized := op.NewSet(
    httpplug.Bearer("UserID", parseBearer),
)

dogs := op.NewSet(
    op.Tags("Dogs"),
    httpAuthorized,
)

op.New("CreateDog", (*CreateDog).Handle,
    dogs,
    op.Comment("Register a new dog"),
    httpplug.Post("/api/dogs"),
)

op.New("DeleteDog", (*DeleteDog).Handle,
    dogs,
    op.Comment("Remove a dog"),
    httpplug.Delete("/api/dogs/{id}"),
)

op.New("ListBreeds", (*ListBreeds).Handle,
    op.Tags("Dogs"),  // no httpAuthorized — public endpoint
    op.Comment("List all available breeds"),
    httpplug.Get("/api/breeds"),
)
```

`ListBreeds` uses `op.Tags("Dogs")` directly, without `httpAuthorized`. No Bearer trait — no auth invariant — `goop verify` does not require an auth check. Public endpoint. Honest.

Same pattern as Wire's `wire.NewSet` — grouping providers. Op groups traits.

## Discovery: static analysis for route coverage

`goop verify --check-coverage` can compare routes registered in the mux with operations declared in the DSL. Every Go HTTP router ultimately calls a method like `mux.Handle(pattern, handler)` — `go/ssa` sees these calls, extracts patterns, and compares with httpplug traits:

```
$ goop verify --check-coverage

  Coverage: 3/6 routes covered by Op DSL

  ✓ GET    /api/breeds       → ListBreeds
  ✓ POST   /api/dogs         → CreateDog
  ✓ DELETE /api/dogs/{id}    → DeleteDog

  Not in DSL:
    GET  /health        (main.go:45)
    GET  /metrics       (main.go:46)
    GET  /debug/pprof   (main.go:47)
```

Not an error — a visibility tool. Like `go test -cover`. Infrastructure endpoints (`/health`, `/metrics`) don't belong in the operation model. But a business endpoint missing from the DSL is a gap — no swagger, no invariants, no verify. `--check-coverage` makes the gap visible.

Router detection is extensible — new routers are added via configuration, not core changes. The pattern is always the same: method call on a router type, pattern string in argument N, handler in argument M. Blind core, extensible through data.

## Discovery: multi-module architecture

Op is a multi-module Go project. One repository, synchronized versions:

```
github.com/thumbrise/op              — core DSL
github.com/thumbrise/op/httpplug     — HTTP plugin
github.com/thumbrise/op/swagplug     — OpenAPI plugin
github.com/thumbrise/op/cobraplug    — CLI plugin
github.com/thumbrise/op/goop         — CLI binary (generate, verify, list)
```

All modules share the same version tag. `op@v0.3.0` + `op/httpplug@v0.3.0` — compatibility guaranteed. User imports only what they use. Don't need cobraplug? Don't pull it. Clean `go.sum`.

And none of these modules end up in the user's binary — they're behind the `//go:build op` tag. Development-time tools, not runtime dependencies.

## What we take forward

The research and design session confirmed seven things:

1. **The fundamental is known.** Everyone who looked at the problem saw the same thing: an operation is a typed unit with input, output, and semantics. This is not a new discovery. It's a formalization of what functional programming knew decades ago.

2. **Nobody separated it.** Every tool welded the fundamental to one subjective output — OpenAPI, HTTP handlers, binary serialization. The model either doesn't exist as a separate layer (Scramble), exists but carries transport specifics (Huma), or lives in a different language entirely (Protobuf, Smithy).

3. **The toolchain is ready.** Wire proved that `go/types` + `go/packages` + code generation + compiler verification is a production-grade pipeline. The gap is not tooling. The gap is that nobody pointed this pipeline at operations.

4. **Traits are invariants, not annotations.** A trait is a verifiable statement about the operation's call chain. `go/ssa` can prove or disprove it at compile time. This makes verify a first-class projection — generation does not start until all invariants pass.

5. **Minimum responsibility at every layer.** Core knows names, signatures, and traits. Plugins know their transport. Use cases know their domain. Nobody takes more responsibility than needed. Nobody knows more than they should. Extensibility is a consequence of ignorance.

6. **Zero runtime footprint.** Build tags (`//go:build op`) exclude the entire DSL and all plugins from the binary. Generated code is self-contained. Op is a development-time tool, not a runtime dependency. Wire proved this works.

7. **Multi-module, synchronized versions.** One repository, submodules with shared version tags. User imports only what they need. Compatibility guaranteed by version alignment.

## What we dream of

- `goop generate` — verify invariants, generate typed code, describe operations. One command. Three projections.
- Traits as invariants — verified via `go/ssa` call graph analysis before generation starts.
- Zero runtime overhead — `//go:build op` excludes the entire DSL and all plugins from the binary. Op is not in your `go list -deps`.
- Plugin ecosystem — httpplug, swagplug, cobraplug as first-party. Community plugins through the same trait mechanism.
- `goop list --json` — structured operation metadata on stdout. Pipe it. Unix way.
- Multi-module architecture — one repository, synchronized versions, import only what you use.
- Progressive disclosure — three lines of DSL for a junior. Invariant-verified multi-transport bindings for a senior. Same tool.

### The flow we envision

**Step 1: Use cases — pure domain, no transport knowledge.**

```go
package dogs

type CreateDog struct {
    repo DogRepository
}

func NewCreateDog(repo DogRepository) *CreateDog {
    return &CreateDog{repo: repo}
}

func (c *CreateDog) Handle(ctx context.Context, input CreateDogInput) (*CreateDogOutput, error) {
    // input.UserID is already here. Populated. Validated. From somewhere.
    dog, err := c.repo.Create(ctx, input.UserID, input.Name, input.Breed)
    if err != nil {
        return nil, err
    }
    return &CreateDogOutput{ID: dog.ID}, nil
}

type CreateDogInput struct {
    UserID string
    Name   string
    Breed  string
}

type CreateDogOutput struct {
    ID string
}
```

No imports from Op. No imports from httpplug. No struct tags. Clean domain.

**Step 2: DSL — behind a build tag, invisible to the binary.**

```go
//go:build op

package dogs

import (
    "github.com/thumbrise/op"
    "github.com/thumbrise/op/httpplug"
)

var httpAuthorized = op.NewSet(
    httpplug.Bearer("UserID", parseBearer),
)

func Operations() []op.Descriptor {
    return []op.Descriptor{
        op.New("CreateDog", (*CreateDog).Handle,
            httpAuthorized,
            op.Tags("Dogs"),
            op.Comment("Register a new dog"),
            httpplug.Post("/api/dogs"),
        ),
        op.New("DeleteDog", (*DeleteDog).Handle,
            httpAuthorized,
            op.Tags("Dogs"),
            op.Comment("Remove a dog"),
            httpplug.Delete("/api/dogs/{id}"),
        ),
        op.New("ListBreeds", (*ListBreeds).Handle,
            op.Tags("Dogs"),
            op.Comment("List all available breeds"),
            httpplug.Get("/api/breeds"),
        ),
    }
}
```

`go build` does not see this file. `goop generate` does.

**Step 3: Generate.**

```shell
$ goop generate

  VERIFY
    CreateDog   — Bearer("UserID"): CreateDogInput.UserID string ✓
    CreateDog   — Bearer: auth check in call chain ✓
    DeleteDog   — Bearer("UserID"): DeleteDogInput.UserID string ✓
    DeleteDog   — Bearer: auth check in call chain ✓
    ListBreeds  — no invariants, skip ✓

  GENERATE
    httpplug:   3 handlers → dogs/genhttp/
    cobraplug:  3 commands → dogs/gencli/
    swagplug:   openapi.json

  DESCRIBE
    goop.json

  OK  3 operations, 0 violations
```

**Step 4: Generated code — committed, reviewed, compiled.**

HTTP handler — from JSON body + Bearer token:

```go
// dogs/genhttp/create_dog.go
// Code generated by goop. DO NOT EDIT.

package genhttp

func NewCreateDogHandler(handle func(context.Context, dogs.CreateDogInput) (*dogs.CreateDogOutput, error)) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        var input dogs.CreateDogInput
        json.NewDecoder(r.Body).Decode(&input)
        input.UserID = parseBearer(r.Header.Get("Authorization"))
        output, err := handle(r.Context(), input)
        if err != nil {
            writeError(w, err)
            return
        }
        writeJSON(w, 200, output)
    })
}
```

CLI command — from flags + env token. Same Input. Same Handle. Different source:

```go
// dogs/gencli/create_dog.go
// Code generated by goop. DO NOT EDIT.

package gencli

func NewCreateDogCommand(handle func(context.Context, dogs.CreateDogInput) (*dogs.CreateDogOutput, error)) *cobra.Command {
    var input dogs.CreateDogInput
    cmd := &cobra.Command{
        Use:   "create-dog",
        Short: "Register a new dog",
        RunE: func(cmd *cobra.Command, args []string) error {
            input.UserID = parseTokenFromEnv()
            output, err := handle(cmd.Context(), input)
            if err != nil {
                return err
            }
            fmt.Printf("Created dog: %s\n", output.ID)
            return nil
        },
    }
    cmd.Flags().StringVar(&input.Name, "name", "", "Dog name")
    cmd.Flags().StringVar(&input.Breed, "breed", "", "Dog breed")
    return cmd
}
```

Same `CreateDogInput`. Same `Handle`. HTTP fills UserID from Bearer header. CLI fills UserID from env. Domain doesn't know. Domain doesn't care.

**Step 5: Main — wire it up.**

```go
package main

func main() {
    createDog := dogs.NewCreateDog(repo)

    mux := http.NewServeMux()

    // Generated handlers
    mux.Handle("POST /api/dogs", authMiddleware(genhttp.NewCreateDogHandler(createDog.Handle)))
    mux.Handle("DELETE /api/dogs/{id}", authMiddleware(genhttp.NewDeleteDogHandler(deleteDog.Handle)))
    mux.Handle("GET /api/breeds", genhttp.NewListBreedsHandler(listBreeds.Handle))

    // Infrastructure — not in Op, not in swagger, and that's fine
    mux.Handle("GET /health", healthHandler)

    http.ListenAndServe(":8080", mux)
}
```

Op is not imported. httpplug is not imported. swagplug is not imported. They are behind `//go:build op`. The binary contains your code and generated code. Nothing else.

```
go list -deps ./... | grep op
// empty.
```

**And then someone writes another plugin.**

The same DSL. The same operations. Different projection.

```shell
# Markdown docs from the same operations
$ goop list --json | op-gen-docs
  → OPERATIONS.md

# Mermaid diagram from the same operations
$ goop list --json | op-gen-mermaid
  → operations.mmd  (flowchart: auth → CreateDog, auth → DeleteDog, public → ListBreeds)

# Excel report for the PM who asked "what endpoints do we have?"
$ goop list --json | op-gen-xlsx
  → operations.xlsx

# Your own internal plugin that nobody else needs
$ goop list --json | my-company-gen-grpc
  → dogs/gengrpc/create_dog.go
```

We don't know what you need. We don't want to know. `goop list --json` gives you the model. Pipe it. Build your own projection. The operation is the same. The output is yours.

## What we are not

**IDL / Schema languages** — Protobuf, Smithy, Thrift, GraphQL SDL. They solve the problem of "describe a contract in a neutral language, generate for any programming language." We are not building a neutral language. We use Go types as the IDL. Our niche is Go-to-Go: operations described in Go, analyzed in Go, generated in Go, compiled by Go. If you need cross-language contracts — Protobuf exists and deserves respect.

**Algebraic effects / effect systems** — Koka, Eff, Unison, Haskell effect libraries. They formalize side effects in the type system: the compiler *proves* that all effects are handled. Go does not have an effect system and never will. We are not emulating algebraic effects. We borrow one idea — an operation has a formal description (input, output, effects) — and implement it through DSL + static analysis instead of a type system.

**Dependent types / refinement types** — Idris, Agda, Liquid Haskell. They allow a type to carry a *proof*: `AuthenticatedRequest` only compiles if the compiler can prove the token was checked. Go does not have dependent types. We are not emulating them. We borrow one idea — invariants can be verified before runtime — and implement it through `go/ssa` call graph analysis instead of a type checker.

**Design by Contract** — Eiffel (Bertrand Meyer), Ada SPARK. Preconditions, postconditions, and invariants are formalized in the language. `require: token.is_valid` — checked at runtime, but declared in code. Go has no contracts. We are not adding contracts to Go. We borrow one idea — a trait is a precondition of an operation — and the verify projection checks it statically.

**Tagless Final / Free Monads** — patterns from FP for separating "what to do" (algebra) from "how to do it" (interpreter). Different interpreters for the same algebra: production, test, logging. Op DSL is the algebra. httpplug, cobraplug, swagplug are interpreters. But we are not building a monadic DSL. We are building a Go DSL with functions and context.

We are not replacing **Huma, Scramble, or swaggo**. They solve their problems well. We are building the layer they did not build — a transport-agnostic operation model that exists before any transport touches it.

## What we refuse to do

We did the hard work. We parsed the operations. We resolved the types. We verified the invariants. We built the model.

We refuse to then say "now let's generate Swagger" and stop there.

The model is yours. Add your own traits. Write your own plugins. Generate HTTP handlers, CLI commands, OpenAPI specs, gRPC stubs, GraphQL schemas, Excel reports, documentation sites, test scaffolds — whatever your context demands. We don't know what you need. We don't want to know. That's the point.

**The operation is fundamental. The context is just your opinion.**

---

*This is a frozen research snapshot. Concrete IDs, version numbers, and architectural details reflect the state at the time of investigation. The RFC will formalize decisions; this devlog preserves the trail.*