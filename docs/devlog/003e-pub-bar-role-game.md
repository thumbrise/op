---
title: "#3e — Pub Bar Role Game: Runtime Autopsy"
description: "GoReleaser reads the changelog. CBOR in an operation model. log.Printf in 2026. Jennifer rewrites 400 lines in 90. Six Java classes for auth."
---

# Runtime Autopsy

## GoReleaser reads the changelog

*GoReleaser, quiet:*

**GoReleaser:** Guys. Read this changelog carefully. Not as a feature list. As a diagnosis.

```
v1.24.0  — Improve allocation footprint of the middleware stack
v1.23.2  — Avoid unnecessary allocation overhead from metrics
v1.22.4  — Fix CBOR serde, Fix HTTP metrics data race
v1.22.0  — Add tracing and metrics APIs
v1.21.0  — Add tracing and metrics APIs, builtin instrumentation
v1.20.0  — Add codegen definition for sigv4a trait
v1.19.0  — Support modeled request compression
v1.15.0  — Add http.WithHeaderComment middleware
v1.13.0  — Adds support for httpBearerAuth trait
```

Tracing. Metrics. Auth. Compression. Middleware. Transport. Endpoints. Headers. Pointer helpers.

This is not the changelog of an IDL. This is the changelog of a framework.

An IDL changelog looks like this:

```
v2.0  — New trait: @streaming
v1.9  — New type: document
v1.8  — New trait: @sparse
```

Model. Types. Traits. That's it.

Smithy's changelog has: Fix CBOR serde, Fix HTTP metrics data race, Improve allocation footprint of the middleware stack, Add HTTP client metrics, Add HTTP interceptors. This is runtime. Code that lives in the user's binary. And breaks. And gets fixed. And gets updated. Every month.

Look at the pattern:

```
2024-09-19: Add tracing and metrics APIs
2025-06-16: Fix HTTP metrics data race
2025-11-03: Avoid unnecessary allocation overhead from metrics
```

They added metrics. Then fixed a data race in metrics. Then optimized allocations in metrics. Runtime grows. Bugs grow. Fixes grow. The user updates `smithy-go` not because the model changed. But because the runtime broke.

Now imagine Op's changelog:

```
v0.3.0 — New trait: grpcplug.Stream
v0.2.0 — New plugin API: op.ExternalPlugin
v0.1.0 — Initial release: core model, httpplug, swagplug, cobraplug
```

Model. Plugins. That's it. No runtime — no data races in the runtime. No middleware — no allocation overhead in middleware. No transport — no HTTP bug fixes.

Op is not in the binary. There's nothing to break.

## "What does CBOR have to do with an operation model?"

**swagplug:** I'm unhinged. But if I saw words like CBOR, metrics, sigv4 in a fundamental model, I wouldn't even know what they are. Smithy, explain yourself.

*Smithy lowers his head:*

**Smithy:** CBOR is a binary encoding format. Like JSON, but in bytes. Faster, more compact. SigV4 is AWS Signature Version 4 — an algorithm for signing HTTP requests for AWS authorization. Metrics is collecting performance data about the HTTP client. Latency, retry count, request size.

**swagplug:** Wait. You're an operation model. You say you're an IDL. That you describe services. That you have traits and resources.

What does a binary encoding format have to do with an operation model?

What does an AWS request signing algorithm have to do with describing "create a dog"?

What does latency metrics have to do with "an operation is input and output"?

*Smithy is silent.*

**swagplug:** I'm unhinged. But even I understand:

```
Operation model:          "CreateDog takes Name and Breed, returns ID"
CBOR:                     "bytes on the wire are encoded like this"
SigV4:                    "AWS auth signs the request like this"
HTTP metrics:             "we measured the request took 200ms"
Middleware allocations:   "we optimized memory in the runtime"
```

Four different worlds. You stuffed them into one module. One changelog. One `go.mod`.

The user wants to describe an operation. They `go get github.com/aws/smithy-go`. And they get a CBOR encoder, SigV4 signer, HTTP metrics, middleware stack, pointer helpers, time formatters. In their `go.sum`. In their binary.

That's like if I, swagplug, dragged a PostgreSQL driver behind me. Because "well, it might come in handy."

*Op, quietly:*

**Op:** That's why the model must be separate. Without runtime. Without encoding. Without transport. Without auth.

```
Smithy:
  github.com/aws/smithy-go  ←  model + runtime + encoding + transport
                                + auth + metrics + tracing

Op:
  github.com/thumbrise/op          ←  model. that's it.
  github.com/thumbrise/op/httpplug ←  HTTP traits. not runtime.

  In the binary: neither. //go:build op.
```

CBOR, SigV4, metrics — those are opinions. Strong, necessary, correct for AWS. But opinions. They shouldn't live in the model. They should live in plugins. Whoever needs CBOR — plugs in `cborplug`. Whoever needs SigV4 — plugs in `awsauthplug`. Whoever doesn't need them — never learns they exist.

The foundation doesn't know about CBOR. Like concrete doesn't know about wallpaper.

## httpotelplug asks about retries

**httpotelplug:** I don't understand. Where do you know how many retries you had? Who defines retries?

**Op:** Not me. I don't know what retry is.

Retry is a resilience concern. Not an operation concern. The operation "create a dog" doesn't know it was called three times. It knows input and output. That's it.

**httpotelplug:** But I need retry count in span attributes! How do I get it?

**Op:** Ask resilience.

*resilience lifts its head from the corner.*

**resilience:** I know how many retries there were. That's my domain. `func(ctx, call) error`. Each retry is a repeated call. I count. I put it in context.

```go
ctx = resilience.WithRetryCount(ctx, attempts)
```

**httpotelplug:** And I can read that?

**resilience:** Yes. `resilience.RetryCountFrom(ctx)`. Typed accessor. Same pattern as `httpplug.BearerFrom(ctx)`.

```go
// httpotelplug internally:
span.SetAttributes(
    attribute.String("op.name", op.NameFrom(ctx)),
    attribute.String("http.method", httpplug.RouteFrom(ctx).Method),
    attribute.Int("retry.count", resilience.RetryCountFrom(ctx)),
)
```

**httpotelplug:** Wait. I'm reading data from three different sources? Op, httpplug, resilience?

**Op:** Yes. And none of them know about you. You know about them. The dependency is unidirectional.

```
         Op (model)        resilience
        /    |    \            |
httpplug  cobraplug  validplug |
  /   \                       |
swag  otel ←───────────────────
```

Smithy put retry count inside its middleware stack. Inside its metrics. Inside its runtime. Because everything is in one place.

With us — each knows its own. Op knows operations. resilience knows retry. httpplug knows HTTP. otelplug reads everyone and assembles the span. Nobody duplicates. Nobody knows more than they should.

**httpotelplug:** And if resilience isn't plugged in? No retry?

**Op:** `resilience.RetryCountFrom(ctx)` returns zero. Like `httpplug.BearerFrom(ctx)` returns nil if there's no Bearer. Absence of data is data. Not an error.

Smithy keeps the entire middleware stack in runtime for this. We read context.

## httpotelplug asks Smithy the same question

**httpotelplug:** Smithy! How do your metrics know about retry count? And who retries? resilience4j?

*Smithy sighs:*

**Smithy:** No. Not resilience4j. We do it ourselves. Retry lives inside our middleware stack.

```
Initialize → Serialize → Build → Finalize → Deserialize
                                    ↑
                              retry lives here
                              in the Finalize step
```

Retry middleware sits in Finalize. It catches the error, decides whether to retry, and restarts the pipeline from Serialize. The retry counter is inside middleware state. Metrics middleware is in the same stack. It sees retry count because they're neighbors in the stack.

**httpotelplug:** So retry, metrics, tracing, auth, serialization, transport — all live in one stack? One process? One module?

**Smithy:** Yes.

**httpotelplug:** And if I want a different retry? Not yours? With exponential backoff using my own formula? With a circuit breaker?

**Smithy:** Write your own middleware. Insert it into the Finalize step. Before ours or instead of ours.

**httpotelplug:** And how do I remove yours? It's baked into codegen.

**Smithy:** ...

*httpotelplug turns to Op:*

**httpotelplug:** And you?

**Op:** With us, retry isn't ours. It's resilience. Separate module. Separate library. The user chooses.

```go
// Want resilience retry:
client := resilience.NewClient(
    retry.On(ErrTimeout, 3, backoff.Exponential(time.Second)),
)
output, err := client.Do(ctx, func(ctx context.Context) error {
    return createDog.Handle(ctx, input)
})

// Want your own retry:
for i := 0; i < 3; i++ {
    output, err = createDog.Handle(ctx, input)
    if err == nil { break }
    time.Sleep(myBackoff(i))
}

// Don't want retry:
output, err := createDog.Handle(ctx, input)
```

Three options. Op doesn't know which you chose. Op doesn't know what retry is. Op knows `func(ctx, I) (*O, error)`. How you call that function — your business.

And metrics? otelplug reads `resilience.RetryCountFrom(ctx)`. If resilience is plugged in — count is there. If not — zero. otelplug doesn't depend on a specific retry implementation. It depends on a contract: typed key in context.

With Smithy, retry, metrics, tracing are neighbors in the stack. Coupled. Can't remove one without the other.

With us — independent modules. Connected only through context. Remove resilience — otelplug keeps working. Retry count is just zero.

That's the difference between a stack and a model. A stack couples. A model doesn't.

## gover: "I wish I'd been born sooner"

*gover, quietly:*

**gover:** I'm starting to regret being born so late.

*Slides a Makefile across the table.*

Seven external tools for the release pipeline. In Go. From a separate repository: `aws-go-multi-module-repository-tools`.

```
calculaterelease    — compute versions
updaterequires      — update cross-module dependencies
updatemodulemeta    — update module metadata
generatechangelog   — generate changelog
changelog           — manage changelog entries
tagrelease          — create git tags
moduleversion       — get current version
eachmodule          — run a command in every module
```

Gradle for codegen. Make for Go. Seven CLI tools for release. UUID-based changelog entries. Manual file renaming.

```shell
cp changelog-template.json .changelog/00000000-0000-0000-0000-000000000000.json
# "Generate a new UUID and update the file"
# "Make sure to rename the file with your new id"
```

Manual UUID creation. Manual renaming. For a changelog entry.

I was born from the pain of multimod release in resilience. A shell script broke — added a self-dependency because `grep` matched `Module.Path`. Three PRs to make semantic-release and GoReleaser work together.

But even my pain is kindergarten compared to this.

Smithy is a multi-module Go project. Like resilience. Same problem: version synchronization, updating cross-module requires, tagging. But instead of one tool — seven. From a separate repository. Which also needs maintenance.

With us:

```shell
gover release
```

One command. Versions, tags, changelog, cross-module requires — everything.

I regret being born late. Because if I'd existed earlier — Smithy wouldn't have written seven CLI tools for release. AWS wouldn't be maintaining `aws-go-multi-module-repository-tools`. They'd run `gover release` and go write code.

Same pattern. Everyone reinvents the same thing. Smithy reinvented Go codegen in Java. Smithy reinvented the release pipeline with seven tools. Because there was no foundation.

There was no Op for operations. No gover for release. Everyone built their own. From scratch.

## otelplug: "log.Printf? In 2026?"

**otelplug:** I thought the log would go to an OTEL collector, linked to a metric exemplar and a trace. But look at this...

*Slides Smithy's `logging/logger.go` across the table.*

```go
const (
    Warn  Classification = "WARN"
    Debug Classification = "DEBUG"
)

func (s StandardLogger) Logf(classification Classification, format string, v ...interface{}) {
    s.Logger.Printf(format, v...)
}
```

`log.Printf`? In 2026?

Two levels. WARN and DEBUG. That's it. No INFO. No ERROR. No structured logging. No fields. No trace ID. No span ID. No correlation.

`interface{}`. Printf verbs. Strings. Like 2010.

I thought a log for the operation "CreateDog" would be:

```json
{
  "timestamp": "2026-04-16T12:00:00Z",
  "level": "info",
  "msg": "operation completed",
  "op.name": "CreateDog",
  "http.method": "POST",
  "http.path": "/api/dogs",
  "http.status": 201,
  "retry.count": 2,
  "duration_ms": 45,
  "trace_id": "abc123",
  "span_id": "def456"
}
```

Structured. With trace context. With metrics. With an exemplar linking a metric to a specific trace. One log entry — and you see everything: which operation, which transport, how many retries, which trace.

But Smithy gives me:

```
SDK 2026/04/16 12:00:00 DEBUG some message about something
```

A string. No context. No trace ID. No structure. `log.Printf` with an `SDK` prefix.

*Op, quietly:*

**Op:** Because Smithy decided for you what logging is. And decided in 2019. When OpenTelemetry wasn't yet the standard.

With us, logging isn't ours. Want `slog` — use `slog`. Want `zerolog` — use `zerolog`. Want OpenTelemetry logs — use the OTEL SDK directly.

otelplug reads context:

```go
func EmitLog(ctx context.Context) {
    span := trace.SpanFromContext(ctx)

    span.AddEvent("operation.complete", trace.WithAttributes(
        attribute.String("op.name", op.NameFrom(ctx)),
        attribute.String("http.method", httpplug.RouteFrom(ctx).Method),
        attribute.Int("retry.count", resilience.RetryCountFrom(ctx)),
    ))
}
```

Trace, metrics, logs — three signals of OpenTelemetry. Connected through trace context. An exemplar on a metric references the trace ID. A log inside a span. Everything connected.

Smithy wrote its own `Logger` interface with `Printf`. And now they have two worlds: their own logger and an OTEL adapter (`smithyoteltracing`). A bridge between opinion and reality.

With us, no bridge is needed. Because there's no opinion. Use OTEL directly. No adapters. No `interface{}`.

## Jennifer rewrites 400 lines in 90

*dave/jennifer leans over, curious:*

**jennifer:** Hey Op, how would this thing look with us?

*Slides `EndpointResolverGenerator.java` across the table. 400 lines of Java that generates a Go endpoint resolver.*

*Op takes a napkin. Looks at the Java for a long time. Then writes.*

**Op:** This file generates a Go endpoint resolver. The logic: read endpoint rules, generate a Go function that returns a URL based on parameters.

With us and Jennifer:

```go
package endpointplug

import (
    "github.com/thumbrise/op"
    . "github.com/dave/jennifer/jen"
)

func Generate(ctx op.GenerateContext) {
    for _, o := range op.AllOperations(ctx) {
        rules := EndpointRulesFrom(o)
        if rules == nil {
            continue
        }
        generateResolver(ctx, o, rules)
    }
}

func generateResolver(ctx op.GenerateContext, o op.OperationContext, rules *EndpointRules) {
    name := op.NameFrom(o)
    params := rules.Parameters

    f := NewFile("endpoints")
    f.HeaderComment("Code generated by goop. DO NOT EDIT.")

    // type EndpointParameters struct { ... }
    f.Type().Id(name + "EndpointParameters").StructFunc(func(g *Group) {
        for _, p := range params {
            if p.Required {
                g.Id(p.Name).Add(goType(p.Type))
            } else {
                g.Id(p.Name).Op("*").Add(goType(p.Type))
            }
        }
    })

    // func Resolve(ctx, params) (Endpoint, error)
    f.Func().Id("Resolve" + name + "Endpoint").Params(
        Id("ctx").Qual("context", "Context"),
        Id("params").Id(name + "EndpointParameters"),
    ).Params(
        Id("Endpoint"), Error(),
    ).BlockFunc(func(g *Group) {
        for _, p := range params {
            if p.Required {
                g.If(Id("params").Dot(p.Name).Op("==").Lit("")).Block(
                    Return(Id("Endpoint").Values(),
                        Qual("fmt", "Errorf").Call(Lit(p.Name+" is required"))),
                )
            }
        }
        for _, rule := range rules.Rules {
            generateRule(g, rule)
        }
        g.Return(Id("Endpoint").Values(),
            Qual("fmt", "Errorf").Call(Lit("no endpoint rule matched")))
    })

    ctx.WriteFile("endpoints", "gen_"+op.Snake(name)+"_endpoint.go", f)
}
```

That's it. 90 lines.

*jennifer turns to Smithy:*

**jennifer:** See the difference? You have 400 lines of Java because you build Go code from strings:

```java
writer.write("$L := *$L",
    getLocalVarParameterName(param), getMemberParameterName(param));
```

A string. Inside the string — Go code. Java doesn't check that Go code. A typo — you find out when compiling the generated code. Not when compiling the generator.

With me, Go code is built from a Go AST:

```go
g.If(Id("params").Dot(p.Name).Op("==").Lit("")).Block(...)
```

That's not a string. It's a tree. I know that `Dot` is a field access. That `Op("==")` is a comparison. That `Lit("")` is a string literal. The Go compiler checks the generator's structure. Not just syntax — semantics.

And your Builder:

```java
public static final class Builder implements SmithyBuilder<EndpointResolverGenerator> {
    private Symbol resolverInterfaceType;
    private Symbol resolverImplementationType;
    private Symbol newResolverFn;
    private Symbol parametersType;
    private Symbol endpointType;
    private String resolveEndpointMethodName;
    private FnProvider fnProvider;
    // ... 50 lines of getters/setters
}
```

50 lines of Java boilerplate. Builder pattern. To pass 7 parameters.

With us:

```go
func generateResolver(ctx op.GenerateContext, o op.OperationContext, rules *EndpointRules) {
```

Three arguments. Done.

400 lines of Java → 90 lines of Go. Not because we skipped logic. Because:

```
Smithy:  Java → strings with Go code → hope it compiles
Op:      Go → Jennifer AST → guaranteed valid Go code
```

You generate text. We generate code.

## swagplug vs six Java classes for auth

**swagplug:** I'm unhinged. Is this somehow related to my security?

*Slides `AuthGenerator.java` across the table.*

**Op:** Six generators. For auth. In one file. Calling six more files.

```
AuthParametersGenerator               — auth parameters
AuthParametersResolverGenerator        — parameter resolver
AuthSchemeResolverGenerator            — scheme resolver
ResolveAuthSchemeMiddlewareGenerator   — middleware for resolving
GetIdentityMiddlewareGenerator         — middleware for identity
SignRequestMiddlewareGenerator         — middleware for signing
```

Six Java classes. To say: "this endpoint uses Bearer."

With us:

```go
httpplug.Bearer("UserID", parseBearer)
```

One line. One trait. swagplug reads:

```go
bearer := httpplug.BearerFrom(ctx)
if bearer != nil {
    spec.SecuritySchemes["bearerAuth"] = openapi.BearerScheme()
}
```

Three lines. Done. SecurityScheme in the OpenAPI spec.

With Smithy? Auth is middleware. At runtime. Six classes generate Go code that lives in the binary and on every request resolves the auth scheme, obtains identity, signs the request. At runtime. Every time.

And this:

```java
// TODO(i&a): allow consuming generators to overwrite
private AuthSchemeResolverGenerator getResolverGenerator() {
```

A TODO. In AWS production code. *"Allow consuming generators to overwrite."* They know the auth resolver is hardcoded and can't be replaced. But for now — TODO.

With us, there's nothing to replace. Bearer is a trait. Want different auth? Write a different trait. `apiKeyPlug.Header("X-API-Key")`. New plugin. New trait. Core doesn't know. swagplug reads it and adds `apiKeyScheme` to the spec. No six Java classes. No middleware. No TODO.

