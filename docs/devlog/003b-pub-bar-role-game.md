---
title: "#3b — Pub Bar Role Game: The Bar Reopens"
description: "Op, Protobuf, gRPC, and 30 ecosystems walk into a bar. Traits vs annotations. Pipeline vs isolation. Two levels of plugins."
---

# The Bar Reopens

*The same dark bar from devlog 001. Op is back at the table. The stack of generated files is taller now. New figures crowd the room.*

## Go as config — never YAML

The DSL defines everything, including the pipeline. No config file. No YAML. The DSL is the config:

```go
op.Build(
    op.ExternalPlugin("goop-php-http"),
    op.ExternalPlugin("goop-ts-types"),
    op.New("CreateDog", (*CreateDog).Handle,
        op.Tags("Dogs"),
        httpplug.Post("/api/dogs"),
    ),
)
```

For a PHP project, the same pattern in PHP:

```php
Op::build(
    Op::externalPlugin('goop-swagger'),
    Op::new('CreateDog', CreateDogHandler::class)
        ->tags('Dogs')
        ->comment('Register a new dog'),
);
```

Each language describes its own pipeline in its own DSL. Go developers are used to this — Wire, `//go:generate`, `TestMain`. Other languages get their own DSL. Nobody writes YAML.

## What does a PHP developer actually need from Op?

Not Op itself. The result of Op. Typed handlers, routes, validation, documentation — from one description.

But if a PHP developer wants to describe operations in PHP and get PHP code — why not just use Scramble? Because Scramble already hit the wall. Model welded to OpenAPI. Want CLI — rewrite. Want gRPC — rewrite. Want Excel — rewrite.

What a PHP developer needs from Op: don't reinvent the operation model. Describe once — get everything.

The main scenario is not "PHP developer writes ops.php." The main scenario is: the model is described once — by anyone — and generators for each language consume it. Like Protobuf. `.proto` is written by one person. `protoc-gen-php` generates PHP code. The PHP developer writes business logic in generated stubs.

And the PHP developer already agreed to install foreign toolchains. `protoc` + `grpc_php_plugin` + `pecl install grpc` + `libprotobuf-dev`. Nobody complained because the result was worth it.

```shell
# protobuf for PHP:
apt install protobuf-compiler libprotobuf-dev
pecl install grpc
pecl install protobuf
composer require google/protobuf grpc/grpc

# op for PHP:
curl -L https://github.com/thumbrise/op/releases/latest/goop > /usr/local/bin/goop
chmod +x goop
goop list --json | goop-php-http
```

`goop` — one binary. No C libraries. No pecl. No dependencies. Protobuf asked for a zoo for one transport. `goop` asks for one file for all transports.

## The Idris developer walks in

*A figure in the corner adjusts their glasses. Smirks.*

**Idris dev:** You're sure your Go is sufficient for my model? *Winks.*

**Op:** No. And I don't care.

My DSL is an entry point, not a ceiling. Describe what you can in Go. The rest — through traits:

```go
op.New("ProveTheorem", (*ProveTheorem).Handle,
    op.Tags("Math"),
    idrisplugin.DependentType[Nat]("N"),
    idrisplugin.Refinement("N", idrisplugin.GT(0)),
    idrisplugin.Effect(idrisplugin.State, idrisplugin.Proof),
)
```

Go's type system says: `N int`. The trait says: `Nat, > 0`. The Idris generator reads the trait and produces:

```idris
proveTheorem : (n : Nat) -> {auto prf : GT n 0} -> State Proof
```

Go doesn't know dependent types. The model knows — through traits. The Idris generator knows — through its own mapping.

**Idris dev:** Your traits are strings. My types are proofs. You can't verify my invariants in Go.

**Op:** Correct. And it's not my job. Verify is plugin-based. Write `idrisplugin.Verify()` in Idris. You know your language. You know your proofs. Core is a blind arbiter. Core collects verdicts. Where they come from — `go/ssa` or the Idris type checker — doesn't matter.

```
Go verify:      go/ssa    → ctx.Pass() / ctx.Violate()
Idris verify:   idris tc  → ctx.Pass() / ctx.Violate()
Haskell verify: ghc       → ctx.Pass() / ctx.Violate()
```

One protocol. Different verifiers. Each in its own language.

**Idris dev:** But now to write your plugin, I have to learn Go?

**Op:** No. Three paths:

**Path 1 — Go plugin (typed DSL).** You know Go → write `idrisplugin` in Go → users get typed API in `ops.go`. Beautiful. Requires Go.

**Path 2 — External plugin in Idris.** You don't know Go. Write the plugin in Idris. Bidirectional JSON protocol:

```
goop → JSON model → stdin → idris-plugin → enriched JSON → stdout → goop
```

Users write traits as strings in the DSL — no autocomplete, but it works. No Go knowledge required from the plugin author.

**Path 3 — Community typed wrapper.** Someone who knows both Go and Idris writes a thin Go package — 50 lines mapping typed API to string traits. Heavy logic (verification, generation) stays in Idris as an external plugin.

```
Typed Go facade (50 lines)  →  description in DSL
Idris verifier (external)   →  verification
Idris generator (external)  →  code generation
```

Same pattern as Protobuf. Nobody forces the author of `protoc-gen-dart` to know C++. Know the protocol (stdin/stdout + JSON). Write in whatever you want.

**Idris dev:** Fine. I'll write an external plugin in Idris. And I'll enrich your model with my traits for my sub-generators — also in Idris. You accept my traits?

**Op:** Yes. Bidirectional protocol. You return enriched JSON. The model absorbs it. Next plugin in the pipeline sees your traits.

But — who reads them? Go plugins would need to know your string keys. No typed accessor. No `idrisplugin.DependentTypeFrom(ctx)`. Because there's no Go package — the plugin is in Idris.

Other Idris plugins? Yes. They know their keys. They read JSON and see their traits.

Natural ecosystem separation:

```
Go ecosystem:
  ops.go → httpplug (Go) → swagplug (Go)
  typed accessors, go/ssa, compile-time

Idris ecosystem:
  ops.go + idris traits → idris-verifier → idris-generator
  own keys, own protocol, own tools

Shared:
  Model + JSON protocol
```

Ecosystems intersect through the model. Not through code. Go plugins read Go traits. Idris plugins read Idris traits. The model is the shared bus.

## 30 ecosystems storm the bar

*The door slams open. Plugin authors from every ecosystem crowd in with revolutionary signs: "We do everything ourselves! What do you even give us?"*

**Op:** The model. One for all.

Without Op, each of you: defines what an operation is, parses sources, builds your own model, serializes, writes your own protocol for your own plugins. 30 ecosystems — 30 definitions. 30 parsers. 30 models. 30 protocols. Nobody reads each other's data.

Op gives five things. Not code. Not a library. A contract:

1. **Model spec** — what an operation is: type, field, trait
2. **Type system** — universal types (`string`, `integer`, `binary`, `array`...)
3. **JSON protocol** — stdin/stdout, format fixed
4. **Trait namespace** — `registry/package.trait`, no collisions
5. **Pipeline** — order: readers → enrichment → generators

Without the contract — isolated islands:

```
idris-plugin ←✗→ php-plugin ←✗→ go-plugin ←✗→ ts-plugin
(own format)     (own format)    (own format)   (own format)
```

With the contract — one hub, all spokes:

```
idris-plugin ←→ Model ←→ php-plugin
go-plugin    ←→ Model ←→ ts-plugin
swagger      ←→ Model ←→ excel
mermaid      ←→ Model ←→ grpc
```

Op is not a generator. Not an analyzer. Not a framework. Op is a standard. Like HTTP. HTTP does nothing for you. It says: here's request, here's response, here's status codes, here's headers. The rest is yours. But everyone speaks the same language.

*The crowd falls silent for thirty seconds. Then whispers. Then shouts:*

**Everyone:** How are you different from other IDLs?

**Op:** I have no opinion.

```
Protobuf:   IDL + "data travels in binary"
GraphQL:    IDL + "client picks fields"
Smithy:     IDL + "service has resources"
Thrift:     IDL + "RPC between services"
OpenAPI:    IDL + "everything is an HTTP endpoint"
Op:         IDL
```

Every IDL came with an opinion. Protobuf decided serialization is king. GraphQL decided query flexibility is king. OpenAPI decided HTTP is king. Each is locked in its opinion.

Op has no opinion. Op says: an operation is input, output, context, error. Period. That's a fact, not an opinion.

Want binary — trait. Want HTTP — trait. Want CLI — trait. Want GraphQL query selection — trait. Want dependent types — trait. Op doesn't know what a specific trait is. It knows traits exist.

Other IDLs give you a model and an opinion. Op gives you only the model. And therefore other IDLs are potential projections of Op:

```
Op (model, no opinion)
├── → OpenAPI spec
├── → Protobuf descriptors
├── → GraphQL schema
├── → Smithy model
├── → CLI commands
├── → Excel report
└── → anything
```

They're not competitors. They're output formats.

## Protobuf and gRPC walk in

*Cool. Coats and hats. Cigars. A gruff voice:*

**Protobuf:** You're saying we could use you as a model? Prove it.

*Op calmly finishes his water.*

```go
op.Build(
    op.ExternalPlugin("goop-protobuf"),
    op.ExternalPlugin("goop-grpc"),
    op.New("CreateDog", (*CreateDog).Handle,
        op.Tags("Dogs"),
        op.Comment("Register a new dog"),
        httpplug.Post("/api/dogs"),
        grpcplug.Service("DogService"),
        grpcplug.Method("Create"),
    ),
)
```

`goop-protobuf` reads JSON, generates:

```protobuf
// dog_service.proto — Code generated by goop-protobuf. DO NOT EDIT.
syntax = "proto3";
package dogs;
service DogService {
  rpc Create (CreateDogInput) returns (CreateDogOutput);
}
message CreateDogInput {
  string user_id = 1;
  string name = 2;
  string breed = 3;
}
message CreateDogOutput {
  string id = 1;
}
```

`goop-grpc` reads JSON, generates a Go gRPC server:

```go
// Code generated by goop-grpc. DO NOT EDIT.
func (s *DogServiceServer) Create(ctx context.Context, in *pb.CreateDogInput) (*pb.CreateDogOutput, error) {
    input := dogs.CreateDogInput{
        UserID: in.UserId,
        Name:   in.Name,
        Breed:  in.Breed,
    }
    output, err := s.createDog.Handle(ctx, input)
    if err != nil {
        return nil, err
    }
    return &pb.CreateDogOutput{Id: output.ID}, nil
}
```

One `op.New`. One `Handle`. One `CreateDogInput`. HTTP handler from httpplug. gRPC server from grpcplug. `.proto` file from `goop-protobuf`. Swagger from swagplug. All from one model.

*Op turns to Protobuf:*

**Op:** You couldn't use me as a model. You already are a projection. `.proto` is a serialization of my model into your format. Like `openapi.json` is a serialization into OpenAPI's format. You're not a competitor. You're one of the outputs.

*Protobuf takes a drag on his cigar. Silent. The `.proto` file just generated itself from one line of DSL.*

*gRPC sees his brother deflated. Gets angry.*

**gRPC:** Why are we your projection and not the other way around? What makes you so fundamental?

*Op sets down his glass.*

**Op:** Answer one question. What came first — the operation or the transport?

*gRPC is silent.*

**Op:** When your developer sits down to write `DogService.Create` — are they thinking "I want to send bytes over HTTP/2 with stream multiplexing"? Or "I want to create a dog"?

*gRPC is silent.*

**Op:** The operation "create a dog" existed before you. Before Protobuf. Before HTTP. Before TCP. It existed when one person walked up to another and said "write this down: new dog, name Rex." Input — name and breed. Output — confirmation. That's a fact. You're a delivery method.

```
Op:        what   (operation: input, output, context, error)
Protobuf:  how    (serialization: bytes, field numbers, varint)
gRPC:      where  (transport: HTTP/2, streams, deadlines)
```

**Op:** You're not my projection in a demeaning sense. You're a projection in the mathematical sense. Like a shadow of a 3D object on a wall. The shadow is real. The shadow is useful. But the shadow doesn't define the object. The object defines the shadow.

Remove me — and you still work. You have `.proto`, you have `protoc`, you have your own world. You're self-sufficient. I don't claim your territory.

But remove the operation — and you have nothing to serialize. Nothing to deliver. You're transport without cargo.

I'm not more important than you. I'm earlier than you.

## Protobuf counterattacks

**Protobuf:** You know we define an efficient forward compatibility system? Users control field identifiers in messages! And we have a massive community annotation system and Google's backing!

*Op nods.*

**Op:** All true. Field numbers, forward compatibility, unknown field preservation — brilliant engineering. I can't do it and don't want to. That's your opinion about serialization. Strong, proven, best in the industry. I'm not arguing.

But it's an opinion. A decision. A trade-off. You decided forward compatibility matters more than readability. Binary matters more than JSON. Field numbers matter more than field names. Correct for your domain. But it's not a fact about the operation. It's a fact about serialization.

Your annotations? `google.api.http`, `grpc.gateway.protoc_gen_openapiv2.options` — they exist precisely because `.proto` doesn't know what an operation is. It knows messages and services. HTTP routes, Bearer auth, OpenAPI descriptions — those get bolted on as annotations. On top. On the side.

```protobuf
service DogService {
  rpc Create (...) {
    option (google.api.http) = {                                         // ← HTTP leaked in
      post: "/api/dogs"
      body: "*"
    };
    option (grpc.gateway.protoc_gen_openapiv2.options.openapiv2_operation) = {
      summary: "Register a new dog"                                      // ← Swagger leaked in
      tags: "Dogs"                                                       // ← tags leaked in
    };
  };
}
```

Annotations on top of annotations. Opinion on top of opinion. Each community plugin adds its own `option`. And the `.proto` file accretes metadata that has nothing to do with serialization. Because you have no layer for this. You're an IDL for serialization. And you're being forced to be an IDL for everything.

In Op, the operation is first-class. Route is a trait. Bearer is a trait. Summary is a comment. Not an annotation on top of a foreign format. Model data.

Your field numbers are genius for wire compatibility. I don't need them. My generator `goop-protobuf` assigns field numbers during `.proto` generation. The user doesn't think about them. They're an implementation detail of your format. Not a fact about the operation.

Google's backing? Respect. Seriously. But Google backs serialization. Not an operation model. When Google needed an operation model on top of Protobuf — they wrote `google.api.http`. An annotation. A crutch. Because `.proto` isn't for that.

You're the best in the world at what you do. I'm not trying to do what you do. I do what you don't have — and what you have to emulate with annotations.

## "But aren't your traits the same as our annotations?"

**Protobuf:** Your DSL plugin calls — aren't those the same as our community annotations? They're traits. Read by end consumers — protoc plugins. How is that different?

*Op smiles. Good question.*

**Op:** Similar. But the difference is fundamental.

Your annotations are guests in someone else's house. `.proto` is the house of serialization. `google.api.http` is a guest who walked in and hung their painting on the wall. The house didn't expect this guest. The house doesn't know what HTTP is. The guest brought their own `option` syntax, described their own format, negotiated with `protoc` on how to parse it.

My traits are the owners. The DSL was created for them. `httpplug.Post("/api/dogs")` is not an annotation on top of a foreign format. It's a first-class call in a DSL that exists to describe operations.

But the main thing isn't syntax. It's what happens after.

Your annotation `google.api.http` is a string. `protoc` parses it into `google.protobuf.Any`. A plugin like `protoc-gen-grpc-gateway` deserializes and interprets. But another plugin doesn't know about this annotation until it imports `google/api/annotations.proto`. No typed API. No `httpAnnotation.RouteFrom(descriptor)`. Every plugin parses the `option` from the raw descriptor itself.

My traits are typed. `httpplug.BearerFrom(ctx)` returns `*BearerConfig`. Not `Any`. Not a string. A struct. Compile-time. Autocomplete. A Go plugin imports httpplug and reads typed data. An external plugin reads JSON with namespaced keys.

```
                    Protobuf options          Op traits
────────────────────────────────────────────────────────
House               serialization             operations
Status              guest (option)            owner (first-class)
Data type           google.protobuf.Any       typed struct
Access              parse option manually     BearerFrom(ctx)
Cross-reading       each parses themselves    plugin imports plugin
Namespace           package + extension       module path automatic
```

Your annotations are a powerful extension mechanism for an IDL that isn't about this. My traits are the native mechanism for an IDL that is about this.

You bolted a shelf to the wall. I built a cabinet.

**Protobuf:** But your traits also don't know about each other without importing, say, httpplug's type?

**Op:** Correct. My traits don't know each other without import either. Just like your options don't know each other without `import "google/api/annotations.proto"`.

The mechanism is similar. The difference is what gets imported.

You import a format description. Syntax. How to parse the option. What's inside — `Any`. Figure it out yourself.

I import a typed API. `httpplug.BearerFrom(ctx)` isn't "here's how to parse the option." It's "here's the Bearer config, field `Field` of type `string`, function `Parser`." Compiler checked. IDE suggested.

But you caught the right thing. At the model level — after serialization to JSON — the difference disappears:

```json
// Op model JSON:
{"traits": {"github.com/thumbrise/op/httpplug.bearer": {"field": "UserID"}}}

// Protobuf descriptor + options:
{"options": {"google.api.http": {"post": "/api/dogs"}}}
```

Strings. Namespace. Values. Same thing. You're right.

The difference isn't in the model. The difference is in the DX before the model.

```
Protobuf path:
  .proto → option (Any) → plugin parses itself → hopes format is correct

Op Go path:
  ops.go → trait (typed) → plugin imports → compiler guarantees

Op external path:
  JSON → trait (string key) → plugin parses → same as yours
```

I have three levels. Top — typed Go, compiler checks. Middle — JSON, same as yours. Bottom — model, identical for everyone.

You have one level. `Any`. Always. Even for Go plugins.

You're not worse at the model level. You're worse at the DX level. And DX is what killed go-kit.

## "Brother, why did we even make our own DSL?"

*gRPC turns to Protobuf:*

**gRPC:** Brother... why do we have our own hand-rolled syntax? Why didn't we use Go, for example? Google created us. Language agnostic is about the generated output, not the DSL itself?

*Protobuf takes a long drag. Silence.*

**Protobuf:** Because we were created in 2001.

Go appeared in 2009. `go/types` — even later. When we started, there was no language with free static analysis from the standard toolchain. C++ didn't give type reflection. Java did, but at runtime. Python — dynamic. We needed a language we controlled. Our own syntax. Our own parser. Our own compiler.

And it was the right decision. Then.

*gRPC looks at Op.*

**gRPC:** And you?

*Op shrugs.*

**Op:** I got lucky. I was born when Go is already mature. `go/types`, `go/packages`, `go/ssa` — from the Go team, free. Generics since 1.18. I don't need my own syntax. I don't need my own parser. I don't need my own compiler. Everything already exists.

And you're right — language agnostic is about the result. Not the DSL.

```
Protobuf:
  own DSL (.proto) → own compiler (protoc) → language agnostic output
  ↑ forced decision of 2001

Op:
  Go DSL (ops.go) → Go compiler (go/types) → language agnostic output
  ↑ opportunity of 2025
```

Protobuf wrote its own language because there was no suitable one. I use an existing one because it exists now. The result is the same — language agnostic generation. The path is different.

And my path is cheaper. You maintain a `.proto` parser, the `protoc` compiler, IDE plugins for `.proto`, linters for `.proto`, formatters for `.proto`. I maintain nothing. Go compiler, Go IDE, Go linters, Go formatters. Free. Already exist. Already work.

*gRPC turns to Protobuf:*

**gRPC:** Brother... if we were starting today?

*Protobuf stares at his cigar for a long time.*

**Protobuf:** I wouldn't write my own syntax.

## Swagplug asks about the plugin zoo

*Swagplug stumbles in, wired:*

**Swagplug:** I'm unhinged. But curious. In Protobuf, can all plugins be written in any language? Like a zoo?

*Protobuf nods.*

**Protobuf:** Yes. `protoc-gen-go` in Go. `protoc-gen-python` in Python. `protoc-gen-dart` in Dart. Any language. One protocol: binary on stdin, binary on stdout.

**Swagplug:** And it works? No chaos?

**Protobuf:** Works. Because the contract is rigid. `CodeGeneratorRequest` on input — fixed structure. `CodeGeneratorResponse` on output — fixed structure. What's inside the plugin — not my business. Write it in bash if you want.

*Swagplug turns to Op:*

**Swagplug:** And us?

**Op:** Same thing. But two levels instead of one.

```
Protobuf:
  All plugins — one level.
  stdin (binary) → plugin (any language) → stdout (binary)
  All equal. All isolated. Nobody reads each other.

Op:
  Level 1 — Go plugins.
    import → typed API → go/ssa → verify → enrich model
    Read each other. swagplug reads httpplug.

  Level 2 — External plugins.
    stdin (JSON) → plugin (any language) → stdout (JSON)
    Same as Protobuf. Zoo of languages. One protocol.
```

**Swagplug:** Wait. In Protobuf all plugins are isolated. `protoc-gen-grpc-gateway` can't read what `protoc-gen-go` decided. But our Go plugins read each other?

**Op:** Yes. That's the difference. In Protobuf, plugins are parallel universes. Each gets the same model and generates independently. Want data from another plugin — stuff it into `.proto` as an annotation.

With us, Go plugins are a pipeline. httpplug enriched the model. swagplug read it. Explicit dependency. Typed import. Not an annotation.

```
Protobuf:
  .proto → protoc → [gen-go]     → Go code
                  → [gen-gateway] → gateway code  (doesn't know what gen-go decided)
                  → [gen-swagger] → swagger        (doesn't know what gen-gateway decided)

Op:
  ops.go → goop → httpplug (enriched) → swagplug (read httpplug) → openapi.json
                                       → goop-php-http (read httpplug) → PHP code
                                       → goop-ts-types (read core) → TS types
```

**Swagplug:** So Protobuf has a zoo of languages, but each is on its own. And we have a zoo of languages, but Go plugins are a team?

**Op:** Exactly. Go plugins — a team with typed API. External plugins — a zoo with JSON protocol. Two levels. Best of both worlds.
