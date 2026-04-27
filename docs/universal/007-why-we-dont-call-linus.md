---
title: "#7 — Why We Don't Call Linus"
description: "Memory is also infrastructure — page tables, NUMA, OOM, /proc/meminfo, vm.swappiness. No application programmer touches it. The boundary was drawn at the right place, on the right abstraction. The web stack never drew that boundary. Op draws the boundary that was missing. Same division of labor that Linus has with us. Just thirty years late."
---

# Why We Don't Call Linus

A modern developer will defend the status quo with one line: "someone has to maintain those programs". Healthchecks, metrics, TLS, pod restarts, retries — these things are real, they exist, they need owners.

True. None of them application work.

So why don't we call Linus to fix alloc() for us?

alloc() is also infrastructure. Memory has to be reserved, freed, defragmented, OOM-handled, NUMA-aware, observed in /proc/meminfo, tuned via vm.swappiness. Massive operational surface. And no application programmer touches any of it.

The application says malloc(size). Glibc implements an allocator. Kernel manages physical pages. Hardware handles cache lines. Four layers, the application sees one.

That is the right shape. The boundary was drawn at the right place, at the right time, on the right abstraction. Linus does the kernel work once, every program gets it, no one calls him.

The web stack never drew that boundary. So today, the application programmer writes the .rr.yaml, the Dockerfile, the k8s manifest, the helm values, the terraform, the prometheus rules, the grafana dashboard. Eight infrastructure axes, all in their code, all maintained by hand.

Op draws the boundary that was missing. Operation in the instruction. Infrastructure in the compilers. Application programmer declares, infra engineer maintains the compiler. Same division of labor that Linus has with us. Just thirty years late.

## One floor up

The same question answers itself one floor up.

A growing business needs to store users and orders, expose an API, ship clients in three languages, write docs, set up monitoring, run tests, plan migrations. Every company hires a team that builds all of this from scratch. Schema, indexes, routes, SDKs, dashboards, runbooks. Each company writes its own version, paid in salaries.

Imagine someone said: "the business is growing — let's hire Linus to write us a special operating system." The room would go quiet. The thought is absurd because the boundary is drawn — Linux is there, every business uses the same kernel, nobody is asked to commission their own.

The boundary one floor up is not drawn yet. So today every business does, in fact, hire its own Linus. The team that writes the schema, the migrations, the indexes, the API, the clients, the docs, the monitoring — that team is doing infrastructure work the planet already knows how to do. They are not building the business. They are rebuilding the floor under it.

The respect goes to those teams. The work is honest, careful, and necessary today. It is necessary today only because the layer above the kernel — the layer where Op lives — has not been drawn yet. When it is, the second Linus becomes one Linus, like the first one. Businesses go back to doing business.