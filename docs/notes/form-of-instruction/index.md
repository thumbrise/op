---
title: Form Of Instruction - Notes
description: "A public research journal about the form of instruction. We observe, hypothesize, test, and record - in the order it happens."
---

# Form Of Instruction - Notes

This is a public research journal. Not a manifesto. Not a pitch deck. A journal.

## What we are looking at

Every program that has ever been shared — an npm package, a Rust crate, a Docker image — carries a name and a description. Why?

A list of operations doesn't need a name. A list is just content. But a program must be invoked. Shared. Depended upon. Signed. Deployed. Can any of that happen without an identity? We don't know yet. But we suspect the answer is no.

## How we work

**We observe.** We look at package managers, container registries, process supervisors. We notice that every entry point into an ecosystem carries an identifier and a human-readable summary. Always. No exceptions.

**We hypothesize.** If identity is a requirement for invocation, then a program is not just a list of operations. It is a list of operations wrapped in something else. Something that gives it a name. A description. A version. But what is that something?

**We test.** We take the instruction schema — currently just a version field and an array of operations — and we ask: what happens if we add an `id` and a `comment`? Does the schema become more coherent, or less? Does it explain patterns we already see in the wild, or does it create contradictions?

**We record.** Every observation, every hypothesis, every dead end — written down in the order it happened. Devlogs are append-only. We do not edit old entries to look smarter. We do not pretend we knew the answer all along.

## What we do not claim

We do not claim to know what an instruction is. That is why we are here.

We do not claim that identity is required for invocation — not yet. We are testing that hypothesis. If we find a counterexample, we will record it.

We do not claim to be the first to notice that programs have names. We are simply the first to ask: is this pattern accidental, or is it fundamental?

## Who we are

The same researchers, dreamers, and builders who asked what happens if the operation is the fundamental primitive of computation. Now we are asking a different question: what does a program need to be invocable? And is the answer something we haven't named yet — or something we've already found?

Maybe the answer is that identity is fundamental. Maybe the answer is that we're overthinking a packaging convention. The journal will tell.

---

*Want to challenge an entry or write the next one? [Open a PR.](https://github.com/thumbrise/op/edit/main/docs/notes/form-of-instruction/)*