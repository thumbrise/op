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