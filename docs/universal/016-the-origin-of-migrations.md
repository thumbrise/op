---
title: "#16 — The Origin of Migrations"
description: "Every program is equal. The database is also a program. Some programs get reused often, some rarely — that is a consequence, not a rank. The migration as a hand-written plan is the last layer where naming a state is not yet enough. Git, JIT, high-level languages all crossed this line already. The database has not."
---

# The Origin of Migrations

Every program is equal. There is no built-in category called *infrastructure* and another called *application*. A business application gets reused by few. A database gets reused by many. A database can be a proxy to another database. Reuse is what happened, not what was decided. Equality of programs is the starting point. Reuse is the result of someone finding the program useful.

So when an application talks to a database, it is not "application talking to infrastructure." It is two programs meeting through their operations. Both have operations. Both declare what they do.

Now look at how the rest of the field has already learned to live this way.

`git checkout` does not ask you to write a plan for migrating the filesystem from one state to another. You point at a state — a hash, a branch name — and the move happens. The transitions are inside git. You did not write them. `git rebase` does not ask you to author a program that walks commits one by one and reapplies them. You name the destination. The walk happens.

A high-level language asks you to name variables, to name types, to name functions. It does not ask you to pick addresses for those variables. The compiler picks. Your job is naming. The address is a consequence.

JVM HotSpot does not ask you to write `if (TooHot) { cache(this); }` around your hot methods. The runtime watches, the runtime decides, the runtime caches. That logic is built in.

Each of these is the same pattern. **Naming a state is enough. The plan to reach the state is not the user's job.** The system that owns the state owns the transition.

The database is the last common layer where this has not happened. You name a column. You name a type. You declare a relation. And then — for reasons that look obvious only because they are familiar — you also write the plan to migrate from the previous version of that schema to the new one. By hand. Step by step. With rollbacks. With shadow tables. With pager rituals.

This is the leftover work. Not because anyone is doing it wrong. Because the same line that git crossed for the filesystem, that compilers crossed for memory, that JIT crossed for hot paths — has not been crossed for stored state.

When two programs meet through Op — an application program and a database program — neither one writes the migration. The application names what it stores: a domain type, a domain operation. The database supports an operation that takes that shape. The binding holds. The transition between the previous binding and the new one is the database's internal craft, the same way `git rebase` is git's internal craft, the same way variable allocation is the compiler's internal craft.

Which database? Same question as: which git, which compiler, which JIT. Different programs, all speaking the same shape, all running their own internal craft to fit their scale. SQLite for one situation. Spanner for another. Both honest. Both equal. Neither asks the application to write a migration plan.

A memory.

I was telling a friend about our team's highload playbook. Not only migrations. Caching strategies. Avoiding cache stampedes. Retry policies. Circuit breakers. Backpressure. Hedge requests. All the resilience patterns we'd hand-assembled over years. He listened, then said: *"these are workarounds, obviously."*

I wasn't hurt. I felt something stranger. *Did he just blame me for being careful in highload? How am I supposed to take that?*

A year later I understood. He wasn't blaming the care. He was naming the place where the care had to live. Every one of those patterns — caching, retries, circuit breakers, migration choreography — was a heuristic held by hand because the layer that could hold it had not been written yet. They were workarounds. Not because the knowledge was wasted — because it sat on the wrong side of the boundary.

It still lives — inside the database program. The DBA who learned it is the same person, doing the same craft, on a program that now receives clean domain objects from another program. Their work is the database's internal life, the way `rebase` is git's internal life. Visible to those who maintain it. Invisible to anyone who names a state and asks it to be reached.

Op does not move that knowledge. Op stops asking the program on the other side to know it.
