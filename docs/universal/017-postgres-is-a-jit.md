---
title: "#17 — Postgres Is a JIT"
description: "A relational database is a virtual machine with a JIT, a profiler, an inline cache, and a garbage collector. Twenty-five years already. Nobody named it that, so the field kept arguing about ORMs and migrations as if those weren't cross-VM compilation problems with a manual fallback."
---

# Postgres Is a JIT

It hit while writing `#16`. Postgres is not "the database next to the application." Postgres is a virtual machine. With a JIT. With a profiler. With an inline cache. With a garbage collector. Twenty-five years already.

Nobody called it that, so we kept treating it like a black box that occasionally needs a sysadmin.

The mapping is one to one.

| Inside Postgres | What it actually is |
|---|---|
| Statistics collector | Profiler |
| Query planner | Optimising compiler |
| `EXPLAIN ANALYZE` | Bytecode inspector |
| Plan cache | Inline cache |
| `ANALYZE` | Profile retraining |
| Auto-vacuum | Garbage collector |
| Generic vs custom plans | Profile-guided recompilation |
| LLVM JIT for expressions (PG 11+) | A JIT *inside* a JIT |
| WAL | Transaction journal of the VM |
| Replicas | Runtime mirroring |

SQL is the bytecode for that VM. Tables are structures in its managed heap. Indexes are inline caches. Partitions are generational GC. There is even a literal LLVM-based JIT inside the planner for tight expressions. A JIT inside a JIT. Nobody mentioned this in undergrad.

Now look at where the application stands.

The application is *also* a program. With its own runtime. Its own types. Its own lifecycle. When the application "talks to Postgres", what is happening is **two virtual machines exchanging values across a thin wire**. Application VM compiles intent into SQL. Postgres VM executes SQL inside its own runtime. Result comes back. Application VM marshals it into its own types.

This is **VM-to-VM cross-compilation**. Not "calling a database." Cross-compilation, with a serialisation step.

Which is why the ORM exists. The ORM is a translator between two VMs. Class definitions on one side, SQL on the other. Schemas to tables. Methods to queries. Types to types. The ORM is **literally a cross-compiler**, just rarely described that way.

And which is why the ORM leaks. Cross-compilation between two VMs that were never designed to know about each other will leak. Always. The wonder is not that ORMs leak. The wonder is that they work at all.

Migrations, in this picture, are the part of cross-VM compilation that nobody automated. JVM upgrades old bytecode lazily. Postgres does not upgrade application's expectations of its schema lazily. Instead, the human writes the upgrade by hand. Every time. With rollbacks. With shadow tables. With night shifts.

`#16` named the boundary. This note names the shape of the program on the other side. The database is a JIT. It already does the heuristics-and-runtime trick `#15` describes. Op does not need to invent that part. Op only needs to write the **honest API between two VMs that have been talking through a forged adapter for twenty-five years**.

The funniest thing is that none of this is hidden. `pg_stat_statements`, plan caches, ANALYZE, vacuum — every Postgres tutorial mentions them. The field knows. It just kept calling them by their narrow names, never the wide one.

Postgres is a JIT. The application talks to a JIT. The conversation has been going on for decades, with the wrong handshake.

Op is the right handshake.