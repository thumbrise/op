---
title: "#29 — The Anthill Organizes"
description: "Compatibility is the compiler's problem, not Op's. Dialects spread by need, not by authority. No global registry — the anthill organizes itself when, and only when, real demand requires it. Possible because N+M makes participation cheap."
---

# The Anthill Organizes

Devlog #28 ended on *"Dobby is free"*. A reader of that devlog pushed back with the questions that always surface the first time someone takes the frame seriously:

> — How do I know which traits a given compiler reads? How do I check compatibility?
>
> — If I declare my dialect as just a README, how does it ever become popular?

The short answers are obvious once the frame is internalized. The long answers are this devlog.

## Compatibility is the compiler's problem

A compiler that wants to be chosen must publicly declare what it reads. Op does not require this. **The market requires it.**

A compiler that does not say what URIs it orients to is opaque. Opaque software is not chosen. Users go to the competitor who puts the ingredient list on the box. This is the same pressure that drives every tool to write a README — not a protocol mandate, a selection pressure.

Op does not specify the format of the declaration. README is enough. JSON manifest is fine. A machine-readable dialect reference per vendor is fine. Whatever works. The market will favor formats that are easy to check and punish formats that are easy to fake. Let it.

## Popularity is usefulness in the world

The harder question: if my dialect is just a README, how does it grow?

The same way any convention grows. A dialect becomes popular when enough of the world needs what it describes. OpenTelemetry's semconv did not win because Google pushed it. It won because tracing genuinely needed common span names. The name fit reality. That is the whole mechanism.

A bad dialect with a billion dollars behind it still dies slowly. A good dialect with nothing behind it still spreads — if it matches a real need.

Economy in this sense is not money. **Economy is need exchanged for usefulness.** Vendors come by need. Dialects spread by need. Registries appear by need. Money is a derivative of usefulness, sometimes present, often not. The anthill does not trade in currency. It trades in orientation.

## The anthill will organize itself

There is no global registry of Op dialects. There will not be one imposed from above. Op does not ship a directory of approved URIs, because a directory from above is a committee, and a committee is death.

But maybe — fifty years from now — the anthill will build one from below. The way MIME types crystallized. The way HTTP status codes settled. The way Go's module proxy emerged. Nobody designed those registries in advance. They formed because enough participants needed shared orientation, and the form that fit the need won.

Op does not predict this. Op does not prevent it. Op stays out of the way, because the anthill knows more than any architect about what the anthill needs.

## Why this is only possible under N+M

In an N×M world, self-organization does not scale. Every pair of format and tool needs its own glue. The combinatorial explosion forces a standards committee — otherwise the glue rots faster than it is written. This is why HTTP, OpenAPI, gRPC all grew governance bodies: their topology demanded it.

Op is N+M (#24, #6). N vendors declare their traits once. M compilers orient to those declarations once. Intersections form by themselves. The cost of one participant is a README. At that cost, the anthill can afford to experiment, fork, abandon, and reconverge without coordination overhead.

**Self-organization is possible in Op because the topology allows it.** Not because we are clever. Not because we wrote a manifesto. Because N+M makes participation cheap enough that the anthill does not need a committee to move.

## What this devlog establishes

- A compiler declares what URIs it reads. Not because Op requires it — because being opaque loses to being transparent in the market of attention.
- A dialect becomes popular by matching a real need, not by authority or funding.
- Economy in Op is need exchanged for usefulness, not money. Money may follow. It does not lead.
- Op deliberately does not maintain a registry of dialects. The anthill will build one if and when it needs one. Op stays out of the way.
- Self-organization is only possible because N+M keeps participation cheap. Under N×M, a committee is unavoidable; under N+M, a committee is obsolete.

The anthill does not need a king. Op is not one. Op is the ground the anthill walks on.
