---
title: "#8 — Configuration Is Not Parameterization"
description: "alloc() does one thing. When you need a different strategy — dlmalloc, tcmalloc, jemalloc, mimalloc — you switch the allocator, not tune one thousand-parameter alloc. Kubernetes does eleven things in one manifest. Real parameterization is printf — you tell the function what to print, you don't write formatting logic. Tooling that lets you write a hundred variants of every value is not freedom. It is an admission that no one knows the right value."
---

# Configuration Is Not Parameterization

DevOps will say: "alloc() has two parameters. Kubernetes has hundreds. Different category."

Technically true. But the wrong category.

alloc() does one thing. It reserves memory. When you need different strategies — dlmalloc, tcmalloc, jemalloc, mimalloc — you don't tune one thousand-parameter alloc(). You switch the allocator. Knowledge lives inside each. You choose, you don't tune.

Kubernetes does eleven things in one manifest: artifacts, transport, storage, config, observability, capacity, identity, scheduling, sidecars. The name is honest — kuber-netes, the Greek for "helmsman". One thing steering everything.

When you "configure" k8s, look closely. Are you parameterizing — telling the tool your context — or are you re-solving the same problem the world has already solved a thousand times?

livenessProbe:
httpGet:
path: /healthz
port: 8080
That is not parameterization. That is copy-paste. Every HTTP service has it. Slightly varied. Written by every application programmer in every project. The same logic, retyped a thousand times across the planet.

Real parameterization is printf("%d\n", x) — you tell the function what to print, you don't write formatting logic. The logic lives once, inside, written for all programs of all eras.

Op-instruction works the same way: declare the trait, the compiler holds the logic. op-k8s writes the probe. op-helm writes the values. op-tf writes the network. Once. For everyone.

Tooling that lets you write a hundred variants of every value is not freedom. It is an admission that no one knows the right value, and the responsibility was passed to you.