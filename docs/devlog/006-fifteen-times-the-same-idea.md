---
title: "Fifteen Times the Same Idea"
description: "The idea that operations should describe themselves has been reinvented fifteen times in forty years. Each time it was locked to a platform, a transport, or a language. We studied them all."
---

# Fifteen Times the Same Idea
We formalized Op. Wrote the manifesto. Studied the history of protocol adoption. It seemed like time to code.

But during the POC, the question returned: has anyone tried to do the same thing? Not "describe an HTTP endpoint" or "serialize data between services." The deeper thing — formalize what an operation is, independent of transport, language, and domain.

We dug. We found a graveyard.

Not a graveyard of bad ideas. A graveyard of correct ideas that could not escape their ecosystem.

## The Reinventions
The idea "an operation should describe itself formally" has appeared at least fifteen times in forty years. Each time in a different context. Each time locked to something specific.

D-Bus (2003). Linux IPC. Every service on the bus exposes an XML description of its methods, signals, and properties. Any client can ask "what can you do?" and receive a machine-readable answer. Runtime introspection of operations. Working since 2003. But locked to the Linux desktop. Nobody pulled this idea beyond the local bus.

UPnP (1999). Devices on a local network announce their capabilities. A TV says "I can play, pause, stop, setVolume." A printer says "I can print, scanToEmail." Discovery plus introspection of operations in the physical world. Chromecast still uses this. But locked to consumer electronics and the local network.

WSDL (2000). The first serious attempt to formally describe web service operations. Inputs, outputs, transport bindings — everything was there. But WSDL did not drown in XML, as commonly believed. XML is just a format. WSDL drowned in scope: XML Schema, SOAP bindings, WS-Security, WS-ReliableMessaging, WS-Addressing — dozens of WS-* specifications. It was CORBA in an XML wrapper. If WSDL had been as simple as Op — five fields, traits for everything else — it would still be alive.

HATEOAS (2000). REST in its purest form: the server tells the client in every response what can be done next. Got a list of dogs — the response contains links to buy, wash, adopt. The client discovers operations at runtime. A self-describing API. Beautiful idea. Almost nobody implemented it, because frontend developers found it easier to hardcode URLs. But the idea itself — the server declares its operations — is exactly what Op does, only at compile-time.

gRPC Reflection (2016). A running gRPC server can answer the question "what services and methods do you have?" grpcurl uses this to call methods without a .proto file. It is D-Bus for gRPC. But only at runtime, only for gRPC, and only if the server enabled reflection.

GraphQL Introspection (2015). A GraphQL server is required to answer introspection queries. Any client can ask "what are your types, queries, mutations?" and receive the full schema. GraphiQL and Apollo Studio are built on this. But locked to GraphQL.

MCP (2024). Anthropic formalized how an LLM agent calls external tools. Transport-agnostic, capability-based. But it is a runtime protocol for calling tools, not a compile-time protocol for describing them.

Erlang/OTP Behaviours (1998). A formal description of a module's contract. gen_server says: you must implement handle_call(Request, From, State) → {reply, Reply, NewState}. Input, output, state. The contract has survived 25 years. Because it is dumb. But locked inside Erlang.

WASI WIT (2019). WebAssembly Interface Types. Describes the boundary between a wasm module and its host. buy-dog: func(input: dog-input) → result<dog-output, error>. Literally an Op operation. But locked to WebAssembly.

Plan 9 (1992). Thompson, Pike, Ritchie — the same people who created UNIX. The core idea: everything is a file. Not the half-truth of UNIX — literally everything. Network connections, processes, windows. One universal interface (read/write) replaces dozens of specialized APIs. Op does the same at a different level: one contract (name, input, output, traits) replaces dozens of IDLs. Plan 9 did not succeed commercially. But its ideas live in Linux (/proc, /sys, FUSE), in Go, and now in Op.

Tcl (1988). Tool Command Language. Created by John Ousterhout — the PhD advisor of Diego Ongaro, author of Raft. Every command: name arg1 arg2 → result. Everything is a string. No types. The dumbest possible contract between components. Still working after 37 years. Tcl is Op for a single process. Op is Tcl for the entire industry. The difference is scale, not philosophy.

COM Type Libraries (1993). Microsoft. Every COM object declares its interfaces through a type library. Any language — VB, C++, Delphi, JavaScript in IE — could call any COM object. Real language-agnostic interoperability in 1993. Died because it was locked to Windows and a binary ABI.

OSGi (1999). Java modules declare their services: what they provide, what they consume. Runtime service registry. Eclipse is built on this. Working for 25 years. But locked to the JVM and describes Java interfaces, not operations.

Thrift IDL (2007). Facebook used it internally not just for RPC but for monitoring, documentation, and testing. Thrift IDL was closer to an operation description protocol than Protobuf ever was. But Facebook never opened that part. The world got only a serializer. And Thrift thinks an operation is an RPC method between two machines. It does not think buyDog could be a CLI command or a shader.

Toast (2019). Plugin-driven CLI for code generation using Go source as IDL. Created by Fanatics. The right idea: Go as IDL, plugin architecture, simplified AST. Last commit — May 2019. 52 stars. Dead.

## Toast and Why Tools Die
Toast deserves a separate examination because it came closest to what early Op does.

Toast offered: parse Go code, get a simplified AST, pass it to plugins, plugins generate code. Go as IDL. Sounds familiar.

But Toast was a tool, not a protocol. Its plugins received proprietary Toast structures. Not an open contract that anyone can read — an internal format of one utility.

If you were one of N Go developers wanting to reach one of M outputs (TypeScript types, OpenAPI, CLI), Toast gave you a pipe from Go into a specific plugin. But the pipe was Toast's. Nobody outside Toast could read it. Toast solved 1×M: one input, several outputs. Op solves N×M: any input, any output, through an open contract.

Toast did not die because the idea was bad. The idea was correct. It died because it never became a protocol. A corporate project without community, without a specification, without a contract that could live independently of the code. The author left — the project died. That is the fate of a tool.

A protocol lives differently. SMTP lives not because Jon Postel maintains it — Postel died in 1998. SMTP lives because the contract is fixed in an RFC and anyone can implement it. TCP/IP lives not because someone updates it — but because it is dumb enough not to need updates.

The difference between Toast and Op is the difference between a library and a protocol. Toast you install. Op you implement.

## The Fundamental and the Opinions
Every one of the fifteen projects discovered the same truth: an operation exists before transport. Buy a dog — that is a fact. POST /dogs — that is an opinion. rpc BuyDog — that is an opinion. mutation buyDog — that is an opinion. The fact is one. The opinions are infinite.

But every project, having discovered the truth, immediately wrapped it in its own opinion. D-Bus wrapped it in XML and Linux IPC. GraphQL wrapped it in a query language. gRPC wrapped it in HTTP/2 and protobuf. As if someone discovered gravity and immediately declared: "gravity only works on apples."

Op separates fact from opinion. An operation is five fields. That is a fact. HTTP route, gRPC service, CLI command, MCP tool, Solana instruction — those are opinions. Opinions live in traits. The fact lives in the core. The core does not change. Opinions are added infinitely.

## The Pattern
Fifteen attempts in forty years. The same idea: an operation should describe itself formally. Each time — a lock:

D-Bus — to Linux IPC. UPnP — to the local network. WSDL — to SOAP and XML. HATEOAS — to HTTP. gRPC Reflection — to gRPC. GraphQL Introspection — to GraphQL. MCP — to LLM tool calling. Erlang behaviours — to Erlang. WASI WIT — to WebAssembly. Plan 9 — to one OS. Tcl — to one process. COM — to Windows. OSGi — to the JVM. Thrift — to RPC. Toast — to one tool.

Nobody pulled the foundation out. Nobody said: an operation is only a name, an input, an output, the possibility of failure. No platform. No transport. No language. Everything else — traits.

Each of these projects climbed 999 steps up the mountain. At step 1000, each turned into its own valley: "well, now let's generate OpenAPI," "well, now let's bind to HTTP/2," "well, now let's lock to the JVM."

Op is the attempt to not turn at step 1000. To stay at the summit.

## Why Not Just Build Bridges?
A fair question: why generalize? Each tool solves its own problem for its own platform. Need a parser — write a parser. OpenAPI to code — there is a generator. Code to OpenAPI — there is a generator. Protobuf to OpenAPI — there is a converter. GraphQL to MCP — there is a bridge. Does the very existence of all these bridges not prove the system works?

No. It proves the system is on fire.

Count the bridges. OpenAPI → code. Code → OpenAPI. Protobuf → OpenAPI. OpenAPI → Protobuf. GraphQL → MCP. OpenAPI → MCP. Code → MCP. Protobuf → GraphQL. Each bridge is a separate project, a separate author, separate bugs, a separate understanding of what an "operation" is. No bridge knows about any other. None uses a shared foundation.

This is not universality. This is a combinatorial explosion. N formats × M formats = N×M bridges. Each bridge — manual labor. Add a new format — N new bridges needed. Add a new language — N more. The industry builds bridges between islands instead of draining the strait.

Op is not another bridge. Op is the mainland. Describe the operation once in the center. Each island builds one bridge to the mainland, not N bridges to every other island. One Producer, one Consumer, one contract between them. N + M instead of N × M.

## But Doesn't Op Have a Zoo Problem Too?
Yes. Op will also have dozens of emitters and dozens of receivers. But there is a fundamental difference.

In a world without Op, every bridge is a unique pair. openapi-to-protobuf knows both formats and translates between them. graphql-to-mcp knows both formats and translates between them. Every bridge carries two kinds of knowledge in one tool. One format breaks — the bridge breaks.

In the world of Op, every emitter knows only its source and the Instructions contract. Every receiver knows only the Instructions contract and its output. They do not know about each other. op-dsl-go has no idea that op-generator-mcp exists. op-generator-mcp has no idea that op-dsl-go exists. Between them — a contract. One. Stable. Versioned.

A zoo of bridges: every bridge knows two. One of the two breaks — the bridge is dead. A zoo of Op: every tool knows one — the contract. The source breaks — the receiver keeps working with a different emitter. The receiver breaks — the emitter keeps feeding others.

This is not the absence of a zoo. It is a zoo with one shared language instead of a zoo where every cage speaks its own.

## Trees, Not Graphs
There is one more difference that changes everything: topology.

The world of bridges is a graph. Every node connected to every other directly. OpenAPI knows Protobuf. Protobuf knows GraphQL. GraphQL knows MCP. Add a new node — it must negotiate with every existing one. Connections grow quadratically. The graph becomes a tangle. Nobody sees the whole. Every bridge — a separate project with a separate understanding of what an operation is.

Op turns the graph into a tree. At the center — the Instructions contract. Every emitter — a branch toward the center. Every receiver — a branch away from the center. Branches do not know about each other. They know only the trunk. Add a new emitter — one branch. Add a new receiver — one branch. Not N new connections. One.

And the branches do not invent their own compilers. The Go emitter uses go/types — Go's standard toolchain. The PHP emitter uses Reflection API — PHP's standard toolchain. The Rust emitter will use syn — Rust's standard toolchain. Each emitter relies on the existing foundation of its own language for code analysis, then simply translates the result into Instructions. No custom parser. No custom AST. Uses what already exists and works.

Compare with Smithy: a Java compiler that internally reinvents the type systems of Go, TypeScript, Python, Rust. For each language — its own GoWriter.java, its own SymbolVisitor.java. Fifty Java files to teach Java to speak Go. That is not a tree. That is one giant node trying to be the entire graph at once.

In the world of bridges, the industry is a hamster on a wheel. Running, building a bridge from OpenAPI to MCP. Then a bridge from Protobuf to MCP. Then a bridge from GraphQL to MCP. Then a new format appears — and all bridges must be rebuilt. The wheel spins. The hamster is certain it is making progress. The cage does not move.

Op stops the wheel. Not by forbidding bridges. By making them unnecessary. Why build a bridge from OpenAPI to MCP if both can be generated from the same Instructions? Why translate Protobuf to GraphQL if both are projections of the same fact?

Interoperability through bridges is infinite work. Interoperability through a shared foundation is one-time work. Describe the operation once. Project wherever you want. A tree instead of a graph. A fact instead of a translation.

## What About Round-Trips?
A sharp question: doesn't Op have the problem of knowledge loss when attempting a round-trip?

Yes. And we do not try to solve it. Because the round-trip is a false goal.

Round-trip means: Go code → Instructions → OpenAPI → Instructions → Go code. With the expectation that the output will be the same Go code as the input. This is impossible and unnecessary.

Impossible — because projection loses information. OpenAPI does not know what a Go context is, what Go channels are, what Go interfaces are. When you project an operation onto OpenAPI, you lose everything that does not fit HTTP semantics. The reverse projection cannot restore what was never there.

Unnecessary — because Instructions are not an intermediate format for converting between worlds. They are the source of truth. The arrows point outward, not in circles.

Go code → Instructions. That is compilation. The emitter extracts a fact from code.

Instructions → OpenAPI. That is projection. The generator creates an artifact.

Instructions → gRPC. Another projection. Another artifact.

There is no reverse path and there should not be. OpenAPI → Instructions is not a "reverse projection." It is a different emitter that reads OpenAPI as a source and extracts from it what it can. It will get operation names, parameter types, HTTP methods. It will not get Go context, because it was never there.

This is not a bug. This is physics. The shadow of a three-dimensional object on a wall is two-dimensional. You cannot reconstruct the object from its shadow. But from the object you can cast an infinite number of shadows on an infinite number of walls. Instructions are the object. OpenAPI, gRPC, CLI are shadows.

Bridges promise round-trips and lie. openapi-to-protobuf → protobuf-to-openapi — and the output is a different file. Always. Because each bridge loses what it does not understand and adds what it considers necessary. Two bridges in sequence — two layers of loss.

Op does not lie. Instructions → OpenAPI is a lossy projection. We know this, document it, and do not pretend otherwise. Honesty is cheaper than the illusion of a round-trip.

## Ousterhout Was Right
John Ousterhout — creator of Tcl, PhD advisor of the author of Raft — wrote a book called "A Philosophy of Software Design." The central thesis: complexity is the primary enemy. Not bugs. Not performance. Complexity. Every layer of abstraction must justify its existence.

WSDL added layers. CORBA added layers. Smithy adds layers. Every layer is one more reason a project can die.

Op — five fields. Tcl — "everything is a string." One principle: be dumb, live long.

Ousterhout was right in 1988. We are trying to be right in 2026. The same principle, a different scale, 38 years between them.

Fifteen projects. Forty years. One idea that keeps being rediscovered and keeps being locked away. Op is the attempt to set it free.

## So What Is Op — a Universal Standard for Code Generators?
No. Code generation is a benefit made possible by the foundation. It is not the goal.

If all you wanted was a code generator, you would not need a protocol. You would need a template and a parser. The industry has hundreds of those. They work. They also cannot talk to each other, cannot share a definition of what an operation is, and die when their author loses interest.

Op is a formal answer to a different question: what is an operation, before it becomes an HTTP endpoint, a CLI command, a gRPC method, or an MCP tool? The answer — name, input, output, error, traits — is small enough to be universal and precise enough to be machine-readable.

Code generation falls out of that answer for free. So does documentation generation. So does linting. So does SDK generation. So does anything that needs to understand what your system can do. A consumer of Instructions does not have to be a code generator — it can be a diagram tool, an audit log, a test harness, a monitoring system. The contract does not care what you do with the fact. It only cares that the fact is described honestly.

Nobody who wrote the OpenAPI spec in 2015 expected that in 2024 people would be generating MCP tool definitions from it. But they are — because the operation was always there, buried under HTTP semantics. Op does not bury it. Op starts with it.

The difference is intent. OpenAPI does not mind being parsed as a source of truth — but it was never designed for that. It was designed to describe HTTP APIs. The fact that it accidentally contains enough operation semantics to generate MCP tools is a lucky side effect, not a goal. Op is the opposite: being the source of truth for operations is the only goal. Everything else — HTTP, gRPC, CLI, MCP, whatever comes next — is a projection.

OpenAPI — tolerates being used as truth.

Op — exists to be it.

The goal is not "generate code." The goal is "describe the operation once, project it everywhere." Generation is one projection. There will be others we have not imagined yet — and unlike OpenAPI, Op will not be surprised when they arrive.

## The OTel Test
An observability tool that ignores the OpenTelemetry contract in 2026 is dead on arrival. Not because OTel is perfect — but because the industry decided that N×M integrations are not worth the pain. The contract won. Vendors comply or die.

We want the same thing for operations. When SuperNewQL appears in 2028 — and something always appears — its authors should ask themselves one question: can our protocol be expressed as an operation plus a trait? If yes — they write one trait, and every existing Op emitter and receiver works with SuperNewQL on day one. No new bridges. No N×M explosion. One trait, full compatibility.

That is the future we are building toward. Not "everyone must use Op." But "everyone who describes operations has a shared foundation to stand on." The difference between a mandate and a foundation is that a foundation invites. A mandate compels. OTel did not compel Datadog to comply. OTel made compliance cheaper than isolation.

Op aims to make the same true for operations.

A natural reaction to this comparison: "OTel has CNCF, Google, and Microsoft behind it. Op has one person with a devlog. Who are you to compare?" Fair — but that criticism targets the author, not the protocol. The valid question is not "who is behind Op" but "is the contract wrong?" Is five fields too few? Do traits fail as an extension mechanism? Is the N×M problem for operations not real? Those are attacks on the foundation. Everything else — team size, funding, corporate backing — is biography, not architecture. SMTP was one man and one RFC. It runs every email on Earth. The protocol does not care who wrote it.

## The Open Question
Can every operation be expressed as a fundamental definition — name, input, output, error — plus traits as the solution to the Expression Problem?

We don't know yet. But we will run as many POCs and contract refinements as it takes to find out. Either it works — and we will show the examples. Or it doesn't — and we will publish the fundamental reasons why an operation cannot have a universal definition.

Both outcomes are worth the dig.