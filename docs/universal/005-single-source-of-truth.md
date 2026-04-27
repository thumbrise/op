---
title: "#5 — Single Source of Truth in Infra"
description: "The port lives in .env, in compose.yml, in .rr.yaml, in the Dockerfile EXPOSE, in the reverse proxy, in the README. Change one — five stay stale. Tools designed in isolation each invent their own opinion about config. envsubst is the cancer that papers over the absence of a single speaker."
---

# Single Source of Truth in Infra

If you have ever tried to put one source of truth across your infrastructure, you noticed.

The port is in .env. And in compose.yml. And in .rr.yaml. And in the Dockerfile EXPOSE. And in the healthcheck path of your reverse proxy. And in the README quickstart.

You change one. Five others stay stale. Until production, where one of them remembers.

We won this war in my last job. One value, one place. Everywhere else interpolates from it. New developer arrives, copies .env.sample, runs one command, everything works. No quest, no Slack thread, no tribal knowledge.

Then I started a fresh project with a fresh stack. RoadRunner does not interpolate ENV in most of its config fields. Spiral routes hardcode hosts. Composer scripts assume a path. The ports drift apart again. The war restarts.

This is the same leak as [#3](003-roadrunner-bleeds-across-layers.md) but on a different axis. Tools designed in isolation each invent their own opinion about config. None of them assumes another tool will read the same value. So everyone duplicates.

envsubst is a second tool whose only job is to paper over the first tool's refusal to interpolate. Add it to your boot script and you have admitted defeat.

Op solves this at protocol level too, eventually. One declaration, many projections. .env, .rr.yaml, k8s configmap, Dockerfile ARGs — all generated from one instruction. The day someone writes op-config, this whole class of pain disappears.

Until then, I duplicate the port and pretend I do not see it.