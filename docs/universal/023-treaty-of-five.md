---
title: "#23 — Treaty"
description: "Anti-war is not fewer than five fields. Anti-war is not more than five fields. It is exactly five. Less leaves something unsaid and forces the language to bolt on attributes, decorators, annotations — and the moment a language relies on those for self-knowledge, the framework wars begin. More puts an opinion inside the core, and the moment the core has an opinion, competitors add theirs. The pact is the count."
---

# Treaty of Five

Five fields. Exactly five. Not four. Not six. That number is not aesthetics. It is a peace treaty.

A language that wants self-knowledge — that wants to answer *what can this program do, by name, with which inputs, returning what, failing how* — needs five things and only five. Every living language already has the mechanism for each of them: a name, a comment, a parameter list, a return type, an error declaration. No extra runtime, no extra DSL, no extra plugin layer. The five mechanisms are already in the grammar.

That is the whole pact. Build a language with these five mechanisms and let people use them. Self-knowledge is on by default. The language is Op-ready without knowing Op exists.

## Why fewer than five starts a war

Drop one of the five and the form is incomplete.

- Drop **id** and you cannot point at one operation among many.
- Drop **comment** and you cannot say what the operation is for in the form itself.
- Drop **input** and you cannot describe what the operation receives.
- Drop **output** and you cannot describe what it returns.
- Drop **error** and you have to pretend failure does not exist — which the second law of thermodynamics says you cannot do honestly.

Each removal leaves a real thing unsaid. The unsaid thing does not disappear. It moves *outside* the core, into a side channel — which is exactly how attributes, decorators, annotations, struct tags, and metadata systems get their start. *"The language doesn't say it, so we add a layer that says it."*

The moment that side channel exists as a first-class mechanism, the framework wars begin.

`@Component`, `@Service`, `@Controller` from Spring. `@Inject`, `@Provided`, `@Bean` from another DI library. `@Entity`, `@Table`, `@Id` from one ORM, `@Document`, `@Index` from another. Each of these is a *fix* for something the language did not say, written by people solving real problems. And each fix lives in the same syntactic space as every other fix. Two libraries claim `@Validated` with different semantics. A method ends up wearing fifteen attributes from four frameworks. Removing one breaks something invisible. Adding one collides with something hidden.

This is the war. Not between languages — *inside* each language, between the frameworks that filled the gap left by missing core fields. A developer no longer chooses a language; they choose a tribe inside the language, and the choice they make at year zero locks them out of choices at year ten.

Op closes that door at the language layer by saying: the language already has five mechanisms, use them, that's it. Self-knowledge does not need a side channel. There is nothing for frameworks to fight over inside the core.

## Why more than five starts the same war from the other side

Add a sixth field and somebody is now welding an opinion into the core.

The candidates that almost made it but did not:

**Why `auth` is not a core field.** Authorisation belongs to a specific layer (transport, gateway, IAM). Putting it in the core would mean every Op-aware language needs to model OAuth, mTLS, API keys, capability tokens, etc. — none of which generalise across all interaction. A bee dance has no `auth`. A music box has no `auth`. The five fields stay. `auth` lives in traits, where vendors that care about it can publish their dialects.

**Why `version` is not a core field.** Versioning is a discipline of *evolution over time*, not a property of *one operation*. The conjecture talks about evolution of primitives separately. Different vendors solve it differently — semver, content hash, monotonic id, breaking-change branches. The core stays out of it. Versioning lives in traits or in the binding.

**Why `transport` is not a core field.** This is the obvious one (`#16`, `#17`, `#19`). The whole point of the form is to be transport-agnostic. The moment transport sits in the core, OpenAPI happens — and the lesson of OpenAPI is what made Op refuse the weld.

**Why `serialization` is not a core field.** Same shape. JSON in the materials is the chalk on a blackboard, not the rule (`#14` in the FAQ misreading list). The form does not own a wire format. Serialisation is downstream.

**Why `effects` is not a core field.** Pure / impure / IO-tagged etc. — every language with an effect system has a different model (Haskell's IO, Koka's effects, Roc's effects, OCaml's planned effects). Putting effects in the core would pick one of these over the others. Op does not. Effects, if a language wants them, live in traits or the type system itself.

**Why `runtime` is not a core field.** This is the gRPC and Smithy lesson. The runtime is opinion. Op stays above runtimes.

**Why `language` is not a core field.** The whole point.

**Why `granularity` is not a core field** (`#20`). The author chooses how detailed each operation is. The core does not impose a granularity floor or ceiling.

Each of these refusals is a small act of restraint that took thinking to articulate. Together they are the whole reason Op stayed at five. Every additional field would have welded an opinion that *somebody*, somewhere, would prefer differently — and once one opinion is welded in, the next vendor is right to weld their own. War.

## What stays at five

Five fields are what every language already produces in normal grammar:

- **Name** — every function has one.
- **Comment** — every language has docstrings, doc comments, or doc-extractable annotations.
- **Input** — every function has parameters with types or names.
- **Output** — every function has a return type or yields a value.
- **Error** — every language has exceptions, Result types, error returns, panics, or sentinels.

A language designer who wants self-knowledge for free does not need to add anything. They need to *not break* what is already there. Keep the five mechanisms accessible to reflection, keep the comment syntax machine-extractable, keep the type system honest about errors. That is the entire ask.

If a language already passes that bar, an Op compiler is one library away. If it does not, the language has a different problem (no reflection, hidden errors, untyped parameters) — that problem was there before Op and will be there after.

## The pact in one sentence

Five fields, exactly. Not four (something escapes into attributes — war). Not six (something opinionated lands in the core — war). The number is the pact.

Anti-war is not "fewer fields, less to argue about." Anti-war is not "more fields, less missing." Anti-war is exactly five — every language can hit it, no opinion sneaks in, no gap forces a side channel. The peace is structural.

Languages of the future that ship Op-readiness from the start will not be the ones that bolted on a richer attribute system. They will be the ones that respected the five.

That is the treaty. Five names. Five mechanisms every language already has. No war.