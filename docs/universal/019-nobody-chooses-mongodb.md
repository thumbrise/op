---
title: "#19 — MongoDB"
description: "Choosing a database today is an act of identity. 'We use Mongo.' 'We're a Postgres shop.' In a world with a clean contract above storage, that choice flattens into a compiler flag. Replication is a flag. Sharding is a flag. The technology survives. The act of choosing it as a brand does not."
---

# Nobody Chooses MongoDB

Today choosing a database is identity work.

*"We're a Postgres shop."* *"We use Mongo."* *"We're moving to ClickHouse."* These sentences mean something. They tell you what the team values. They predict what conferences they go to. They're an act.

In a Go program, nobody says *"we put this variable on the heap."* Escape analysis decided. The variable lives where it lives because the compiler said so. The decision is a result, not an act. Nobody puts it on a slide.

In a world with a clean contract above storage, the database flattens to the same shape.

The application names its domain — types, operations, invariants. The compiler picks the storage that fits the workload best. Replication: a flag. Sharding: a flag. Multi-region: a flag. Migrating from one storage to another: `op compile --target=other_storage`. The choice that today takes a quarter and a steering committee — flattens to a benchmark.

When that flattening happens, what wins is the storage that holds the *domain shape* fastest. Not the storage with the better marketing. Not the storage your team already knows. Not the storage that has a community on Twitter.

This is brutal to brands. It is not brutal to technology.

The Postgres planner — the JIT — keeps existing. Twenty-five years of work on cost-based optimisation does not evaporate because the application stopped naming Postgres. The Mongo storage engine does not stop being good at unindexed document scans because the application stopped naming Mongo. The technology survives. The act of choosing it as a brand does not.

What evaporates is the *vendor lock as defence*. Today MongoDB Inc. is partly protected by the cost of leaving. Tomorrow leaving is one command. The brand has to win on substance. Every quarter. Against every benchmark.

Some storages will lose hard under that pressure. Some will quietly thrive — they were good all along, they were just sharing a market with their own marketing. The market evens out. The choice as identity dies. The technology lives or dies on what it does, not who runs the conference.

This is what "Op stops asking the program on the other side to know it" means at scale. It does not erase Postgres. It does not erase Mongo. It erases the part of the developer's brain that has to *commit* to one of them by name.

Nobody chooses MongoDB. The compiler does. The compiler answers to the workload, not the brand.