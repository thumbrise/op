---
title: "#15 — Black"
description: "JIT is compilation. Escape analysis is compilation. Inline caching is compilation. JVM HotSpot is a compiler that picks its moment. The 'static vs runtime' split is a limit of older tooling, not of the form. A compiler can include heuristics. A compiler can include a runtime. A runtime can include a compiler."
---

# The Black Compiler

A tempting line: compile-time is static, runtime is dynamic, the compiler is the static side.

Easy to teach. Easy to remember. Wrong.

JVM HotSpot is a compiler. It runs at runtime. It watches hot paths, recompiles them with better assumptions, deoptimises when assumptions break, inlines virtual calls when the type history is monomorphic, eliminates allocations through escape analysis. None of that is "runtime patching." All of it is *compilation* — the same translation a static compiler does, with information a static compiler does not yet have.

V8 does the same for JavaScript. PyPy for Python. .NET for CIL. The pattern is mature. A runtime compiler is a compiler that picks its moment.

The question keeps coming back: *"a static compiler cannot know all the heuristics — surely most of the work has to be runtime?"*

That framing puts static and runtime on opposite teams. They are not opposite. They are stages of the same translation. HotSpot proved this twenty years ago.

`op-postgres` does not have to be static-only. The first version probably is — read the instruction, write the migrations, pick indexes from declared inputs. That alone covers a large amount of work. The next generation ships its own runtime: observes queries, detects missing indexes, proposes schema changes, replans. None of that breaks the form. Op still describes the operation. The compiler decides *when* to compile, *how often*, and *with what evidence*.

CockroachDB already does this. Its index recommender watches workloads and suggests indexes. It just isn't called a compiler — because the industry has not wired the pieces together yet.

A compiler can include heuristics.

A compiler can include a runtime.

A runtime can include a compiler.

The simplification was the exotic thing. Not this.
