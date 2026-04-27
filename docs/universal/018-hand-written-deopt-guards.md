---
title: "#18 — Guards"
description: "Hedge requests, cache stampede protection, circuit breakers, retry policies, backpressure, fallbacks. Every resilience pattern in the application is a deoptimisation guard hand-copied from a JIT into source code. The author didn't know HotSpot for that class of problem already exists. On a different floor."
---

# Hand-Written Deopt Guards

A JIT does this for you, and you do not see it.

HotSpot inlines a virtual call because the type history says monomorphic. Then a different type arrives. HotSpot deoptimises — falls back to the slow generic path, recompiles when the workload restabilises. The application code never knew about the inline. The application code never knew about the fallback. Both happened underneath, on the runtime's clock, without ceremony.

Now look at the application.

```
if (responseTime > threshold) {
  circuit.open()
}

if (failures > maxFailures) {
  fallback()
}

retry(3, exponentialBackoff)

hedgedRequest(servers, raceWinner)

cache.get(key, fillIfMissing, withSingleflight)
```

Every one of these is a deoptimisation guard. Hand-copied. From a JIT. Into source code.

The author of this code did not know that. The author was solving a real problem — service slow, retry; service down, fall back; cache missing, fill once not a thousand times. Each pattern is a careful, professional answer to a real failure mode. The patterns work. They have names. There are libraries. Hystrix. resilience4j. Polly. *Retry-Then-Recover.* Whole books.

None of that is wrong. All of it is in the wrong place.

A JIT for distributed calls would do exactly the same things, *underneath the program*, on the runtime's clock, without ceremony. Watch the response time histogram. Open the circuit when the latency tail crosses a threshold. Race two replicas when the budget allows. Pin the cache fill to a single in-flight request. Adapt as the workload changes. None of this needs to be in the application. None of it.

The reason it *is* in the application is the same reason migrations are in the application — the layer that should hold these heuristics has not been written yet. So programmers write it by hand, in the source, on every team, in every language. With slightly different defaults each time. With slightly different bugs each time.

This is what `#16` was really pointing at. When my friend said *"these are workarounds, obviously"* — he was naming this. The whole resilience playbook is hand-written deopt guards. Not because programmers are bad at their jobs. Because the JIT for the layer above the call is missing.

Op does not write that JIT. Op writes the contract. Once the contract exists, somebody can write the JIT. The compiler that reads `op.RetryPolicy = exponential, op.CircuitBreaker = sensitive, op.Hedge = budget(50ms)` and wires it into the call path *underneath* the application — that compiler can exist. It cannot exist today, because there is nothing for it to read.

A JIT for distributed calls is a perfectly reasonable program. Somebody is going to write it. The day they do, fifteen years of accumulated retry-circuit-cache-fallback ceremony evaporates from application code.

The funniest part: HotSpot was 1999. We've been hand-writing deopt guards in production code for twenty-five years on a planet that already invented automatic deoptimisation. Just on a different floor.