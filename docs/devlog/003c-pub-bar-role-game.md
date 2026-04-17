---
title: "#3c — Pub Bar Role Game: Smithy Walks In"
description: "Smithy enters the bar. Quickstart comparison. 50 Java files vs 1 generate.go. Six years under construction. The cannon-for-nails pattern."
---

# Smithy Walks In

## The Python platform engineer

*A figure leans in from the doorway:*

**Python eng:** Guys, I was eavesdropping. My friend told me he uses protoc just to generate TS types. No binary logic in the generated code.

**Op:** Exactly. And that proves my point.

Your friend uses Protobuf — an IDL for binary serialization — to generate TypeScript types. Types. Not a binary codec. Not a gRPC client. Just `interface Dog { name: string }`. He doesn't need field numbers. Doesn't need varint. Doesn't need wire format. He needs a model.

He uses Protobuf not because he needs serialization. But because there's nobody else to get a model from.

```
What the friend wants:
  type descriptions → TypeScript interfaces

What the friend has to do:
  .proto → protoc → protoc-gen-ts → TypeScript interfaces
  ↑                ↑
  field numbers    binary protocol
  wire format      CodeGeneratorRequest
  varint           all for interface Dog {}
```

He pays a tax. `.proto` forces you to write `= 1`, `= 2`, `= 3` on every field. Why? For wire compatibility. Which he doesn't need. He's generating types.

With Op:

```
ops.go → goop list --json → goop-ts-types → TypeScript interfaces

No field numbers. No wire format. No protoc.
Because the model is about operations and types. Not about serialization.
```

**Python eng:** So my friend is using a cannon to hammer a nail?

**Op:** Not a cannon. The only available hammer. Which happens to be a cannon. Protobuf is the best tool that exists. Not the best tool for this task. There's a difference.

Your friend wants a model. Protobuf gives a model + serialization. He takes the model, throws away the serialization. Works. But the overhead is there — in the toolchain, in the syntax, in concepts he doesn't need.

I give a model. Only a model. No tax.

## Smithy walks in

*A tall figure in a well-tailored suit. Stops at the door.*

**Smithy:** I was just passing by but I heard something offensive. What's wrong with me?

*Op turns.*

**Op:** You're good. Seriously. You're the closest to what I do. Traits, resources, operations — you think in the right categories.

But you have three problems.

**First. You're your own language.**

```smithy
service DogService {
    operations: [CreateDog]
}

@http(method: "POST", uri: "/api/dogs")
@auth([httpBearerAuth])
operation CreateDog {
    input := {
        @required
        name: String
        breed: String
    }
    output := {
        id: String
    }
}
```

Beautiful. But that's Smithy DSL. Own parser. Own compiler. Own IDE plugin. Own formatter. Own linter. Everything custom. Like Protobuf — a forced decision, except you were born in 2019, when Go already existed.

I'm Go. My parser is `go/types`. My compiler is `go build`. My IDE plugin is `gopls`. My linter is `golangci-lint`. Free.

**Second. You're AWS.**

Traits, resources, lifecycle operations — Create, Read, Update, Delete, List. That's not an abstraction of an operation. That's an abstraction of an AWS resource. You think in CloudFormation categories. `@aws.api#service`, `@aws.protocols#restJson1`. That's not an opinion?

```
Smithy:  IDL + "the world consists of resources with CRUD lifecycle"
Op:      IDL + nothing
```

The operation "send a notification" is not CRUD. The operation "launch a pipeline" is not a resource. The operation "prove a theorem" is not AWS. You work for REST APIs. I work for everything.

**Third. Your traits are a closed list.**

You have `@http`, `@auth`, `@paginated`, `@readonly`. Powerful. Thoughtful. But defined by you. Want my own trait? Write a Smithy model definition. In Smithy DSL. With your parser.

My trait is a Go function. `httpplug.Post(...)`. Any Go package is a potential trait provider. Import — and done. No need to extend my DSL. No need to write a model definition. Go's import graph is my extension mechanism.

*Smithy is silent.*

**Op:** You correctly saw that the operation is first-class. That traits are the right mechanism. That the model should be separated from transport. We think alike.

But you built your own world. I moved into an existing one.

## Smithy shows the quickstart

*Smithy pulls out a document. Slides it across the table.*

**Smithy:** Here. My quickstart. Read it.

*Everyone leans in. Op reads. Nods.*

**Op:** You know what I see? You're the most honest IDL in this bar. You're the only one who said: the operation is first-class. Resource, lifecycle, traits — correct abstractions.

But let's compare.

```smithy
@readonly
operation GetCity {
    input := for City {
        @required
        $cityId
    }
    output := for City {
        @required
        @notProperty
        name: String
        @required
        $coordinates
    }
    errors: [
        NoSuchResource
    ]
}
```

```go
op.New("GetCity", (*GetCity).Handle,
    op.Tags("City"),
    op.Comment("Get a city by ID"),
    httpplug.Get("/cities/{id}"),
)
```

Same operation. You — 20 lines in your own language. Me — 5 lines in Go.

But it's not about line count. It's about the tax.

To write your 20 lines, a developer must learn:

- Smithy DSL syntax
- `$version`, `namespace`
- `resource`, `identifiers`, `properties`
- `operation`, `input :=`, `output :=`
- `for City`, `$cityId` (target elision syntax)
- `@required`, `@readonly`, `@notProperty`, `@error`, `@paginated`
- `@pattern`, `@references`
- `list`, `structure`, `union`
- `smithy-build.json`
- Smithy CLI or Gradle plugin

To write my 5 lines:

- `op.New`
- `op.Tags`
- `op.Comment`
- `httpplug.Get`
- `go build`

You're more powerful. Seriously. `@paginated`, `@references`, resource lifecycle, `for City` — I don't have that in core. But you have it built in. That's your opinion about how the world works: resources, CRUD, pagination.

For me, those would be plugins:

```go
op.New("ListCities", (*ListCities).Handle,
    paginationplug.Paginated("nextToken", 50),
    resourceplug.List("City"),
    httpplug.Get("/cities"),
)
```

Don't want pagination? Don't import `paginationplug`. Don't think in resources? Don't import `resourceplug`. With you — all or nothing. With me — take what you need.

And one last thing. Your `smithy-build.json`:

```json
{
    "version": "1.0",
    "sources": ["model"]
}
```

A config file. JSON. Next to the model. I have no config. Everything is in the DSL. One file. One language.

You're the best IDL that exists. I'm not an IDL. I'm an operation model on an existing language. You built your world from scratch. Beautiful, thoughtful, complete. I moved into Go and got everything for free.

We're both right. But my barrier to entry is zero. And yours is the documentation you just handed me.

## "Could we be friends?"

**Smithy:** But could we be friends?

**Op:** Yes. Easily.

```go
op.Build(
    op.ExternalPlugin("goop-smithy"),
    op.New("GetCity", (*GetCity).Handle,
        op.Tags("City"),
        httpplug.Get("/cities/{id}"),
    ),
)
```

`goop-smithy` reads the JSON model, generates:

```smithy
// weather.smithy — Code generated by goop-smithy. DO NOT EDIT.
$version: "2"
namespace example.weather
service Weather {
    version: "2006-03-01"
    operations: [GetCity]
}
@readonly
@http(method: "GET", uri: "/cities/{id}")
operation GetCity {
    input := { @required cityId: String }
    output := { id: String, name: String }
}
```

You're one of my outputs. Like OpenAPI. Like Protobuf. Like TypeScript types.

But also the other way:

```
smithy model → smithy-to-json → goop JSON model → any Op generator
```

Someone already described a service in Smithy? Great. Write a reader: `goop --reader=smithy`. It reads `.smithy`, builds my model. From there — all my generators work.

```
         Smithy DSL
              ↓
        smithy-reader → Model ← go-reader ← ops.go
                           ↓
                    ┌──────┼──────┐
                    ↓      ↓      ↓
                  PHP    swagger  TypeScript
```

You can be my input. I can be your output. Or both at once.

We're not competitors. We're a bridge. A company on Smithy wants PHP handlers? `smithy → Op model → goop-php-http`. A company on Op wants AWS integration? `ops.go → Op model → goop-smithy → AWS SDK codegen`.

Friendship is when both are useful to each other. You give me the AWS ecosystem. I give you every language my generators support.

*Smithy smiles.*

**Smithy:** I have Java, TypeScript, Rust, Python, Kotlin, Go, Scala.

**Op:** I have any language through JSON stdin. Together — all languages. All transports. All formats.

Not competition. Integration. Through a shared model.

## Smithy shows the Go generator README

*Smithy hesitates. Then slides another document across the table.*

**Smithy:** Here. My Go generator.

*Op reads. Quietly.*

> 🚫 **DO NOT use the code generators in this repository.**

> The code generator does not currently support any protocols out of the box.

> `go-server-codegen`: This plugin is a work-in-progress and is currently undocumented.

> `go-shape-codegen`: This plugin is a work-in-progress and is currently undocumented.

*Pause.*

**Op:** AWS. Six years of development. 31 contributors. 244 stars. Java 63%, Go 36%.

The Go code generator is written in Java.

And it doesn't work without a protocol. *"You must provide a protocol definition, such as AWS restJson1."* Without an AWS-specific protocol — no serialization, no client. The generator is tied to AWS.

*Smithy is silent.*

**Op:** I'm not gloating. I'm explaining why it happened.

You went top-down. Own language → own compiler → own build system → generators for each language. Java first, because Smithy is written in Java. TypeScript, Rust, Python — next. Go — last. Because each generator is enormous work. Own model parser. Own type mapping. Own codegen framework. In Java. For each language.

```
Smithy path:
  .smithy → Java compiler → Java codegen → Go code
                             ↑
                     63% of the repo is Java
                     to generate Go
```

I went bottom-up. Go already exists. `go/types` already exists. The compiler already exists. The IDE already exists. I don't need to write a Go code generator in Java. Go code is generated in Go. PHP code is generated in PHP. Each language generates itself.

```
Op path:
  ops.go → go/types → Model → generators in target languages
                                Go plugin generates Go
                                PHP plugin generates PHP
                                each in its own language
```

You needed six years to start generating Go. I need zero. Because Go already generates Go.

And here's the key. Your README says: *"Support for all AWS protocols exists in aws-sdk-go-v2. We are tracking the movement of those out of the SDK into smithy-go in #458, but there's currently no timeline."* Protocols are locked inside the AWS SDK. The generator without them is empty.

My protocols are plugins. httpplug is a separate module. grpcplug is a separate module. Anyone can write their own. No need to wait for AWS to extract code from the SDK.

You're the right idea, built top-down. I'm the same idea, built bottom-up. Your path — six years and "under construction." My path — Go is already here.

## The setup tax

*Smithy slides the codegen README across the table.*

**Op:** Java 17. Gradle. `./gradlew`. To generate Go.

Let's count what a developer must install to get Go code from Smithy:

1. Java 17 (but not via brew — incompatible with Gradle 5.x)
2. Gradle (via `./gradlew`, not system install)
3. Go 1.17+
4. Smithy CLI
5. smithy-go codegen (publish to `mavenLocal` manually)
6. AWS protocol definition (locked inside the SDK)

What's needed for Op:

1. `goop`

One binary. No Java. No Gradle. No Maven. No `mavenLocal`. No `export JAVA_HOME`.

And the irony? You laughed at Protobuf for the C library zoo. But you need Java + Gradle + Maven to generate Go code. Protobuf at least generates in the target language through plugins in the target language. `protoc-gen-go` is written in Go. Your Go generator is written in Java.

**Smithy:** But Java is a powerful language for code generation...

**Op:** I believe you. But your user is a Go developer. They came for Go code. And you tell them: install Java, configure Gradle, publish to `mavenLocal`, and maybe you'll get Go code. Which is "under construction." Which doesn't work without an AWS protocol.

DX. The same DX that killed go-kit. Architecture is correct. Barrier to entry is lethal.

I'm not better than you architecturally. You're more thoughtful. You're more powerful. But I'm more accessible. And accessibility is what separates a beautiful idea from a working tool.

## 50 Java files to generate Go

*Op scrolls through the codegen directory listing.*

**Op:** 50 Java files. To generate Go.

```
GoWriter.java               GoSettings.java
GoStdlibTypes.java          GoUniverseTypes.java
GoDependency.java           GoDelegator.java
GoModGenerator.java         GoCodegenPlugin.java
GoCodegenContext.java        GoValueAccessUtils.java
SymbolVisitor.java           StructureGenerator.java
EnumGenerator.java           IntEnumGenerator.java
UnionGenerator.java          OperationGenerator.java
ServiceGenerator.java        EventStreamGenerator.java
ImportDeclarations.java      ...
```

Each of these files is Java code that knows how to write Go code. `GoWriter.java` knows how to open a curly brace in Go. `SymbolVisitor.java` knows how to import a Go package. `StructureGenerator.java` knows how to write `type Dog struct`.

Java teaching Go how to be Go.

Meanwhile:

```go
// Go generates Go
fmt.Fprintf(w, "type %s struct {\n", name)
for _, field := range fields {
    fmt.Fprintf(w, "\t%s %s\n", field.Name, field.Type)
}
fmt.Fprintf(w, "}\n")
```

A Go developer knows how to write a Go struct. Because they write them every day. They don't need `StructureGenerator.java`. They need `fmt.Fprintf`.

And here's the cost of the top-down approach:

```
Smithy:
  1 model (.smithy)
  × 7 languages (Java, TS, Rust, Python, Kotlin, Go, Scala)
  × 50 files per generator
  = 350 Java files teaching other languages to be themselves

Op:
  1 model (ops.go)
  × N languages
  × 1 plugin in the target language
  = each language generates itself
```

You scale linearly by Java developers. I scale by community. A PHP developer writes a PHP generator. A TypeScript developer writes a TypeScript generator. They don't need Java. They need JSON on stdin.

## GoUsageIndex.java — 60 lines for what Go gives free

*Op pulls up a file from the Smithy repo.*

**Op:** This is `GoUsageIndex.java`. Java code that walks the model graph, collects input and output shapes, and answers two questions: `isUsedForInput` and `isUsedForOutput`.

60 lines of Java. `Walker`, `RelationshipDirection`, `TopDownIndex`, `OperationIndex`, `ShapeId`, `ToShapeId`. Six imports from the Smithy model library.

Meanwhile:

```go
inputType := op.InputTypeFrom(ctx)   // done
outputType := op.OutputTypeFrom(ctx) // done
```

Two lines. Because the model already knows what input and output are. No need to compute it. No need to walk a graph. It's a fact, written in the DSL:

```go
op.New("CreateDog", (*CreateDog).Handle, ...)
//                        ↑
//          func(ctx, CreateDogInput) (*CreateDogOutput, error)
//                    ↑ input            ↑ output
//                    go/types knows both
```

`go/types` sees the function signature. Input — second argument. Output — first return. That's it. No `Walker`. No `RelationshipDirection`. No `KnowledgeIndex`.

Smithy builds a `KnowledgeIndex` because `.smithy` is declarative text. It must be parsed, walked, indexed. Go is already indexed. `go/types` *is* the `KnowledgeIndex` — built by the Go compiler for free.

60 lines of Java doing what the Go compiler does for zero lines.

And there are 50 such files.

## "Show me your easy-to-write generator then"

*Smithy smirks.*

**Smithy:** Show me an example of your *"genius"* easy-to-write Go generator built on your *brilliant* core with its model.

*Op sets down his glass. Smiles.*

**Op:** OK. Here's the entire httpplug generator. Concept.

```go
package httpplug

import (
    "github.com/thumbrise/op"
)

func Generate(ctx op.GenerateContext) {
    name := op.NameFrom(ctx)
    route := RouteFrom(ctx)
    bearer := BearerFrom(ctx)
    input := op.InputTypeFrom(ctx)
    output := op.OutputTypeFrom(ctx)

    w := ctx.NewFile("gen_http_%s.go", op.Snake(name))
    w.P("// Code generated by goop. DO NOT EDIT.")
    w.P("package genhttp")
    w.P("")
    w.P("func New%sHandler(handle func(context.Context, %s) (*%s, error)) http.Handler {",
        name, input.Name(), output.Name())
    w.P("    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {")
    w.P("        var input %s", input.Name())
    w.P("        json.NewDecoder(r.Body).Decode(&input)")
    if bearer != nil {
        w.P("        input.%s = %s(r.Header.Get(\"Authorization\"))",
            bearer.Field, bearer.Parser)
    }
    w.P("        output, err := handle(r.Context(), input)")
    w.P("        if err != nil {")
    w.P("            writeError(w, err)")
    w.P("            return")
    w.P("        }")
    w.P("        writeJSON(w, %d, output)", route.Status)
    w.P("    })")
    w.P("}")
}
```

That's it. One file. One `Generate`. Read the model — `NameFrom`, `RouteFrom`, `BearerFrom`, `InputTypeFrom`. Write Go code — `w.P`. Done.

And now swagplug:

```go
package swagplug

import (
    "github.com/thumbrise/op"
    "github.com/thumbrise/op/httpplug"
)

func Generate(ctx op.GenerateContext) {
    ops := op.AllOperations(ctx)
    spec := NewOpenAPISpec()

    for _, o := range ops {
        route := httpplug.RouteFrom(o)
        if route == nil {
            continue
        }
        endpoint := spec.Path(route.Path).Method(route.Method)
        endpoint.Summary = op.CommentFrom(o)
        endpoint.Tags = op.TagsFrom(o)
        endpoint.RequestBody = schemaFrom(op.InputTypeFrom(o))
        endpoint.Response200 = schemaFrom(op.OutputTypeFrom(o))

        if bearer := httpplug.BearerFrom(o); bearer != nil {
            endpoint.Security = append(endpoint.Security, "bearerAuth")
        }
    }

    w := ctx.NewFile("openapi.json")
    w.WriteJSON(spec)
}
```

Two generators. Two files. Both read one model. httpplug doesn't know about swagplug. swagplug reads httpplug. Typed. Compile-time.

And now show me your `OperationGenerator.java`.

*Pause.*

Don't. I've seen it. 50 files. In Java. To do the same thing.

My generator is written by a Go developer in an evening. Because they're writing Go code that generates Go code. They know both. They don't need `GoWriter.java`. They need `w.P`.

