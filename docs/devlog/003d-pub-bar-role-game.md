---
title: "#3d — Pub Bar Role Game: The Krabby Patty"
description: "The secret of the Krabby Patty. Why 50 Java files become 90 lines of Go. Three reasons, all honest. Smithy reinvented Go inside Java."
---

# The Krabby Patty

## normalize() — the type mapping everyone does

*Op pulls up `ServerCodegenUtil.java`.*

**Op:** Stop. Here it is.

```java
public static Shape normalize(Shape shape) {
    return switch (shape.getType()) {
        case BLOB -> BlobShape.builder().id("com.amazonaws.synthetic#Blob").build();
        case BOOLEAN -> BooleanShape.builder().id("com.amazonaws.synthetic#Bool").build();
        case STRING -> StringShape.builder().id("com.amazonaws.synthetic#String").build();
        case TIMESTAMP -> TimestampShape.builder().id("com.amazonaws.synthetic#Time").build();
        case BYTE -> ByteShape.builder().id("com.amazonaws.synthetic#Int8").build();
        case SHORT -> ShortShape.builder().id("com.amazonaws.synthetic#Int16").build();
        case INTEGER -> IntegerShape.builder().id("com.amazonaws.synthetic#Int32").build();
        case LONG -> LongShape.builder().id("com.amazonaws.synthetic#Int64").build();
        case FLOAT -> FloatShape.builder().id("com.amazonaws.synthetic#Float32").build();
        case DOUBLE -> DoubleShape.builder().id("com.amazonaws.synthetic#Float64").build();
        default -> shape;
    };
}
```

Smithy types → Go types. In Java. BLOB → Blob, BOOLEAN → Bool, INTEGER → Int32. By hand. In a switch.

Meanwhile:

```go
var typeMap = map[string]string{
    "string":    "string",
    "integer":   "int32",
    "long":      "int64",
    "float":     "float32",
    "double":    "float64",
    "boolean":   "bool",
    "binary":    "[]byte",
    "timestamp": "time.Time",
}
```

Eight lines. A map. In Go. No builder. No synthetic IDs. No Java.

And this mapping is the same for everyone. Smithy maps its types to Go. Protobuf maps its types to Go. Op maps its Model types to Go. Everyone does the same thing. The difference is where and in what language.

**Smithy:** Are you saying you map once instead of per ecosystem?

**Op:** Yes. Exactly.

You — every generator maps again. `smithy-go` maps Smithy → Go in Java. `smithy-typescript` maps Smithy → TypeScript in Java. `smithy-python` maps Smithy → Python in Java. Every time — its own `normalize`, its own switch, its own set of synthetic IDs.

```
Smithy:
  smithy types → Java switch → Go types      (in smithy-go)
  smithy types → Java switch → TS types      (in smithy-typescript)
  smithy types → Java switch → Python types   (in smithy-python)
  smithy types → Java switch → Rust types     (in smithy-rust)
  × 7 languages = 7 mappings in Java

Op:
  Step 1 (once):
    Go types → Model types
    string → string, *string → string+nullable, io.Reader → binary

  Step 2 (per target, in the target language):
    Model types → Go:       string → string,     binary → []byte
    Model types → PHP:      string → string,     binary → UploadedFile
    Model types → TS:       string → string,     binary → File
    Model types → Python:   string → str,        binary → BinaryIO
```

Step 1 is mine. In the core. Once. Go → Model.

Step 2 is yours. In your generator. In your language. A PHP developer writes the Model → PHP mapping in PHP. A TypeScript developer writes Model → TS in TypeScript. Each knows their language best.

With you — a Java developer writes the mapping to Go, to TypeScript, to Python, to Rust. In Java. They must know all target languages. And write them in a foreign language.

```
Smithy:  1 person (Java) knows 7 languages → 7 mappings in Java
Op:      7 people, each knows their own    → 7 mappings in their own
```

You scale by Java developers who know Go. I scale by Go developers who know Go. By PHP developers who know PHP. By everyone who knows themselves.

## "Where do I even look?"

*A PHP developer squints at the Smithy repo layout.*

**PHP dev:** I spent 10 minutes looking at your layout. I still can't figure out where the key logic is. Where's the template? Where's the file generation? Where do I look?

**Op:** That's the problem.

A PHP developer wants to understand how to write a generator. Looks at Smithy. Sees:

```
codegen/smithy-go-codegen/src/main/java/software/amazon/smithy/go/codegen/
    auth/  endpoints/  integration/  knowledge/  middleware/
    protocol/  requestcompression/  serde/  server/
    testutils/  trait/  util/
    ... 50 Java files
```

Nine levels of nesting to the first file. `software.amazon.smithy.go.codegen`. Java package convention. The PHP developer doesn't know Java. Doesn't know Gradle. Doesn't know where the entry point is. `GoCodegenPlugin.java`? `CodegenVisitor.java`? `AbstractDirectedCodegen.java`? Which file to read first?

Meanwhile:

```
op/httpplug/
    generate.go    ← here. one file. entry point.
```

Open `generate.go`. See:

```go
func Generate(ctx op.GenerateContext) {
    name := op.NameFrom(ctx)
    route := RouteFrom(ctx)
    // ... generation
}
```

That's it. One function. One entry point. Read the model — generate code. The PHP developer looks and says: "Got it. I need a function that reads JSON and writes files. I'll go write it in PHP."

Smithy requires you to understand: Java package layout, Gradle build system, `SmithyBuildPlugin` interface, `CodegenVisitor` pattern, `DirectedCodegen` abstract class, `Symbol`/`SymbolProvider` system, `WriterDelegator` pattern, `KnowledgeIndex` system, integration hooks.

Op requires you to understand: `op.GenerateContext`, `op.NameFrom(ctx)`, `op.InputTypeFrom(ctx)`, `w.P("...")`.

Four things. Not nine abstractions. Four functions.

## "I DON'T BELIEVE YOU!"

*Smithy's face turns red.*

**Smithy:** I've invested YEARS in my system. You're showing me nonsense. In ONE FILE??? SHOW ME!

*Op calmly stands up. Takes a napkin. A pen. Writes.*

**Op:** Here's the full httpplug. Complete plugin — DSL, accessors, and generator.

```go
package httpplug

import "github.com/thumbrise/op"

// --- Traits: what the user writes in the DSL ---

type Route struct {
    Method string
    Path   string
    Status int
}

type BearerConfig struct {
    Field  string
    Parser string
}

func Post(path string) op.Trait   { return route("POST", path, 200) }
func Get(path string) op.Trait    { return route("GET", path, 200) }
func Delete(path string) op.Trait { return route("DELETE", path, 204) }
func Status(code int) op.Trait    { return op.SetTrait(statusKey{}, code) }

func Bearer(field, parser string) op.Trait {
    return op.SetTrait(bearerKey{}, BearerConfig{Field: field, Parser: parser})
}

// --- Typed accessors: what other plugins read ---

func RouteFrom(ctx op.Context) *Route          { return op.TraitFrom[Route](ctx, routeKey{}) }
func BearerFrom(ctx op.Context) *BearerConfig  { return op.TraitFrom[BearerConfig](ctx, bearerKey{}) }

// --- Private keys: collisions impossible ---

type routeKey struct{}
type bearerKey struct{}
type statusKey struct{}

func route(method, path string, status int) op.Trait {
    return op.SetTrait(routeKey{}, Route{Method: method, Path: path, Status: status})
}

// --- Generate: the entire generation ---

func Generate(ctx op.GenerateContext) {
    for _, o := range op.AllOperations(ctx) {
        route := RouteFrom(o)
        if route == nil {
            continue
        }
        generateHandler(ctx, o, route)
    }
}

func generateHandler(ctx op.GenerateContext, o op.OperationContext, route *Route) {
    name := op.NameFrom(o)
    input := op.InputTypeFrom(o)
    output := op.OutputTypeFrom(o)
    bearer := BearerFrom(o)

    w := ctx.NewFile("genhttp", "gen_%s.go", op.Snake(name))
    w.P("// Code generated by goop. DO NOT EDIT.")
    w.P("")
    w.P("package genhttp")
    w.P("")
    w.P("import (")
    w.P("    \"context\"")
    w.P("    \"encoding/json\"")
    w.P("    \"net/http\"")
    w.P(")")
    w.P("")
    w.P("func New%sHandler(handle func(context.Context, %s) (*%s, error)) http.Handler {",
        name, input.QualifiedName(), output.QualifiedName())
    w.P("    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {")
    w.P("        var input %s", input.QualifiedName())
    w.P("        json.NewDecoder(r.Body).Decode(&input)")
    if bearer != nil {
        w.P("        input.%s = %s(r.Header.Get(\"Authorization\"))", bearer.Field, bearer.Parser)
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

*Op lays the napkin in front of Smithy.*

One file. 90 lines. Complete plugin.

DSL functions — `Post`, `Get`, `Delete`, `Bearer`. What the user writes.

Typed accessors — `RouteFrom`, `BearerFrom`. What other plugins read.

Generate — loop over operations, generate one handler per operation.

No `AbstractDirectedCodegen`. No `CodegenVisitor`. No `SymbolProvider`. No `WriterDelegator`. No `KnowledgeIndex`. No nine levels of nesting. No Java.

90 lines of Go. Does what your 50 Java files do. Not because I'm smarter. Because Go generates Go. And Java generates Go through nine layers of abstraction.

Hit me if you want. The napkin stays.

## The secret of the Krabby Patty

*Smithy sits down. Eyes lowered. Quiet now.*

**Smithy:** I don't understand. How does this work. How do we end up with such different amounts of code? Complexity always lives somewhere. Either you're not telling me something. Or I just can't see it. How can changing a simple concept reduce the file count from 2000 to one `generate.go`? I'm sorry I yelled. But tell me. What's the secret of your Krabby Patty...

*Op sits down next to him. Speaks quietly.*

**Op:** No secret. Three reasons. All honest.

**First. You generate a foreign language. I generate my own.**

Your generator in Java must know Go. How to open a brace. How to write an import. How to format a struct. How to name a file. Java doesn't know Go. So you built an entire framework that teaches Java to speak Go: `GoWriter`, `SymbolVisitor`, `ImportDeclarations`, `GoDelegator`. That's not business logic. That's translation infrastructure.

My generator in Go writes Go. It knows how to open a brace. Because it *is* Go. `fmt.Fprintf` — that's my `GoWriter`. The standard library — that's my `SymbolVisitor`. I don't need a translation framework. I speak the native language.

```
Smithy:  Java → [GoWriter, SymbolVisitor, GoDelegator, ImportDeclarations] → Go
Op:      Go → Go
```

Remove the translation infrastructure — and from 50 files, only generation logic remains.

**Second. You parse text. I read types.**

`.smithy` is a text file. You need a parser, AST, `Walker`, `KnowledgeIndex`, `TopDownIndex`, `OperationIndex`. To answer "what's the input of this operation?" — you walk the graph, collect shapes, resolve references.

My operation is a Go function. `func(ctx, CreateDogInput) (*CreateDogOutput, error)`. Input — second argument. Output — first return. `go/types` knows this. For free. I don't need a `Walker`. Don't need a `KnowledgeIndex`. The Go compiler already indexed everything.

```
Smithy:  .smithy → parser → AST → Walker → KnowledgeIndex → "input is this"
Op:      ops.go → go/types → "input is the second argument" → done
```

Remove parsing and indexing — and even less remains from those 50 files.

**Third. You're all-in-one. I'm a pipeline.**

Your `smithy-go-codegen` generates everything: structs, enums, unions, operations, service, client, middleware, serde, auth, endpoints, protocol, request compression, event streams. 50 files. One monolith.

My plugins are separate. httpplug generates handlers. swagplug generates OpenAPI. cobraplug generates CLI. Each — one file. One responsibility. Don't need it — don't plug it in.

```
Smithy:  one generator does everything → 50 files

Op:      httpplug  → 1 file
         swagplug  → 1 file
         cobraplug → 1 file
         each does one thing
```

The complexity didn't disappear. You're right. It moved.

With you, complexity is in the generator. 50 Java files.

With me, complexity is in the Go compiler. Which is already written. Which already works. Which is free. I didn't write a parser. I didn't write an indexer. I didn't write a `GoWriter`. All of it already exists. I just use it.

That's the whole Krabby Patty secret. Don't do what's already done.

## "You're saying I reinvented Go inside Java?"

*Smithy looks up.*

**Smithy:** You're saying I reinvented Go inside Java? That I didn't separate the fundamental model and its construction algorithm from its usage?

*Op puts a hand on his shoulder.*

**Op:** Yes.

You're not at fault. You started with the right idea — operation model, traits, resources. The best idea in this bar. But then you needed to deliver that model to Go. And to TypeScript. And to Python. And to Rust. And to Kotlin. And to Scala.

And you did the only thing you could — wrote a translator. In Java. For each language. Because your model lives in your world. `.smithy` → Java AST → Java model. To get out of that world into Go — you need a bridge. `GoWriter.java` is that bridge.

```
Your model:       .smithy → Java objects
Target language:  Go source code
Between them:     50 Java files of bridge
```

But what if the model lived in Go from the start?

```
Model:            ops.go → go/types objects
Target language:  Go source code
Between them:     nothing. It's already Go.
```

You reinvented Go inside Java not because you're foolish. But because your model is in Smithy DSL. Not in Go. Between Smithy and Go — a chasm. You filled it with Java code. 50 files is the width of the chasm.

And for each new language — a new chasm. Another 50 files. Smithy → TypeScript — another bridge. Smithy → Rust — another bridge. Every bridge — in Java.

And the second thing — yes. You didn't separate the model from generation. `ServerCodegenUtil.java` simultaneously knows what an operation is and how to write a Go struct. `normalize()` maps Smithy types to Go types. The model and its usage — in one file. In one switch.

If you had separated:

```
Step 1: .smithy → universal model (JSON)
Step 2: JSON → Go generator in Go
        JSON → TS generator in TS
        JSON → Python generator in Python
```

You don't need Java for step 2. Each language generates itself. Java is only needed for step 1 — parsing `.smithy`. And that's fair. `.smithy` is your language. Java is your parser. But after that — let go.

You held everything in Java. And paid for it with 50 files per language.

*Op, quietly:*

This isn't criticism. It's a diagnosis. You did incredible work. It's just that the architectural decision "everything through Java" has a cost. And that cost is 50 bridge files for every language you want to support.

## messagepackplug finds the runtime

*A figure emerges from a dark corner, clutching evidence.*

**messagepackplug:** Guys, look what I found. Smithy, come here too.

*Slides a Go file across the table. `errors.go` from `github.com/aws/smithy-go`.*

**Op:** Stop. Look carefully at what you found.

`APIError`, `OperationError`, `SerializationError`, `DeserializationError`, `CanceledError`.

This is runtime. Go code that lives in the binary. In every AWS SDK client. In every request/response cycle.

Smithy said: "I'm an IDL, I generate and leave." But this?

```go
type OperationError struct {
    ServiceID     string
    OperationName string
    Err           error
}
type DeserializationError struct {
    Err      error
    Snapshot []byte
}
type SerializationError struct {
    Err error
}
```

This is a runtime library. `smithy-go` is not just a code generator. It's a runtime dependency. Every generated AWS SDK client imports `github.com/aws/smithy-go`. In the binary. In production.

```
go list -deps ./... | grep smithy
github.com/aws/smithy-go                ← in the binary
github.com/aws/smithy-go/encoding
github.com/aws/smithy-go/transport/http
github.com/aws/smithy-go/middleware
```

```
go list -deps ./... | grep op
// empty. Op is not in the binary.
```

Op generated and left. Smithy generated and stayed. Its error types, its middleware, its transport, its encoding — all in your binary.

And here's what excited you, messagepackplug. You saw `ErrorFault`, `FaultServer`, `FaultClient`. Smithy imposes an error model. Server fault, client fault. That's an opinion. Not every error is server or client. But Smithy decided for you.

In Op, an error is `error`. The Go interface. What's inside — your business. Want fault classification? Write a plugin. Don't want it? Don't write one. Core doesn't know what a fault is.

```
Smithy:  runtime + opinion about errors + opinion about serialization
Op:      zero runtime + error is error + serialization is a plugin
```

Smithy is not just an IDL. Smithy is an IDL + runtime framework. And that's the same trap go-kit fell into. Right idea. Runtime dependency. Opinion in the binary.

## AGENTS.md as evidence

*aireviewpromptplug slides another document from the darkest corner.*

**aireviewpromptplug:** Look at this. Smithy's own `AGENTS.md`.

**Op:** Thank you. Here's the proof.

Smithy, look at what you yourself wrote:

> *It has two major components:*
> *1. Codegen — A Smithy build plugin written in Java*
> *2. Runtime — The Go packages that generated code depends on at runtime*

Two components. Code generator and runtime. You're not an IDL. You're an IDL + runtime framework.

And look at your runtime:

```
middleware/     # Middleware stack — core of the operation pipeline
encoding/
  cbor/        # CBOR
  json/        # JSON
  xml/         # XML
  httpbinding/ # HTTP binding serde
transport/
  http/        # HTTP request/response
auth/
  bearer/      # Bearer token
tracing/       # Tracing interfaces
metrics/       # Metrics interfaces
logging/       # Logging interfaces
```

Middleware. Encoding. Transport. Auth. Tracing. Metrics. Logging. This is not an operation model. This is a framework. At runtime. In the user's binary.

And your `GoWriter`:

```java
writer.openBlock("func (c $P) $T(ctx $T) ($P, error) {", "}",
    serviceSymbol, operationSymbol, contextSymbol, outputSymbol,
    () -> {
        writer.write("return nil, nil");
    });
```

Java code writing Go code through positional arguments. `$P`, `$T`, `$L`, `$S`, `$W`, `$D`. Six special characters. Numbered variants `$1L`, `$2T`. Two styles — positional and named templates. The rule: *"preferred style for new code"* — meaning the old style also lives on.

Meanwhile:

```go
w.P("func New%sHandler(handle func(context.Context, %s) (*%s, error)) http.Handler {",
    name, input.QualifiedName(), output.QualifiedName())
```

`fmt.Sprintf`. One style. Familiar to every Go developer from day one.

Smithy, you built an empire. Seriously. A middleware stack with five phases — Initialize, Serialize, Build, Finalize, Deserialize. Powerful. Thoughtful.

But it's an opinion. Five phases is your decision about how a pipeline works. Not a fact. A decision. Someone needs three phases. Someone needs seven. You decided five.

My pipeline is plugins. As many as you want. In whatever order you want. Core doesn't know how many phases there are. Core knows that plugins exist.

*Op turns to the entire bar:*

**Op:** Here's the difference between a tool and a foundation. Smithy is a tool. Powerful, thoughtful, complete. With runtime, middleware, encoding, transport. It decides for you.

I'm a foundation. Model and contract. No runtime. No middleware. No encoding. No opinions. You decide for yourself.

Both are needed. But they're different things.

## The ghost of Longrun

*The temperature drops. A 1500-line specter drifts in. It remembers dying — refactored into resilience and scheduler.*

**Longrun:** Phases? Yes, that reminds me of something.

Initialize → Serialize → Build → Finalize → Deserialize. Five phases. Beautiful.

You know what I had? Twenty phases. In one file. 1500 lines. Prepare → Validate → Authorize → Execute → Retry → Timeout → CircuitBreak → Log → Trace → Emit → Serialize → Send → Receive → Deserialize → Map → Transform → Cache → Notify → Cleanup → Done.

Also beautiful. Also thoughtful. Also an opinion about how a pipeline works.

And then one person came and said:

```go
type Option func(ctx context.Context, call func(context.Context) error) error
```

One line. One. No phases. No pipeline. No opinion about order.

Want retry? That's an Option. Want timeout? That's an Option. Want circuit breaker? That's an Option. Want five phases? Compose five Options. Want twenty? Compose twenty. Want zero? Zero.

My 1500 lines became 270. Not because features were cut. Because the opinion about order was removed.

*Longrun turns to Smithy.*

Your five phases are my twenty. You just stopped earlier. But the principle is the same. You decided for the user how many phases and in what order. It works. As long as the user needs exactly these five. In exactly this order.

And when they don't — they write middleware that pretends to be in the Serialize phase but actually logs. Because there's no "Log" phase. And they cheat your pipeline.

*Longrun fades.*

I died so a primitive could be born. `func(ctx, call) error`. No phases. No pipeline. No opinion.

Op says the same thing. `func(ctx, I) (*O, error)`. No phases. No middleware. No opinion.

We're both facts. Not opinions. Facts don't die. Opinions die. I know. I was an opinion.

*Disappears.*

