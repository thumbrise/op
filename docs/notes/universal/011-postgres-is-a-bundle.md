---
title: "#11 — Bundle"
description: "Postgres is not a database. Postgres is a bundle. Storage, planner, MVCC, WAL, vacuum, replication, statistics — welded together because no contract existed to make a smaller unit. SQLite, DuckDB, CockroachDB already pulled pieces out and quietly shipped them. The bundle leaked. Op gives the leak its name."
---

# Postgres Is a Bundle

Postgres is not a database. It is a *bundle*.

Storage engine. B-tree. MVCC. WAL. Query planner. Statistics. Vacuum. Replication. Extensions. All welded together. You cannot take only the planner. You cannot swap the storage. MySQL tried — InnoDB vs MyISAM — and that timid split never escaped one product.

The bundle is the unit of distribution because no contract existed to make a smaller unit.

Same shape as `.rr.yaml` mixing four concerns. Thirty years older. A million times the deployment scale.

The leak has already started.

SQLite ships in every phone as one storage engine. No server. No planner pretending to be PostgreSQL.

DuckDB took columnar OLAP and walked away from the rest of the bundle.

CockroachDB took Raft and replaced part of the Postgres-shaped guts with it.

Each one is a single component, pulled out, shown to work alone. None of them put it in the headline. They just shipped, and the bundle leaked.

What is missing is the form. Today, "our storage layer satisfies contract X" is marketing — there is no X. With Op, the contract becomes a technical statement, checkable by a compiler. Storage from one team. Planner from another. Vacuum from a third. All speaking the same shape.

Postgres does not get replaced. It gets *unbundled*. The minds that built it stay where they are — inside the part of the program that stays. The application on the other side stops needing to know there is a Postgres at all.

Business applications are not in the business of compressing dead tuples on disk. They are in the business of solving business problems. The bundle exists because the line between the two is not drawn yet.

Op draws the line.
