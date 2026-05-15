---
title: "#002 — The Term Opinion"
description: "We gave operations opinions. It wasn't enough. Now terms have opinions too. Why the extension was necessary to prevent a war of implementations."
---

# The Term Opinion

The operation took four years. The rails took four days. The term-level trait took four weeks — not because it was hard, but because we had to accept that the atom wasn't complete.

The operation was the missing word. The rails were the missing names. The term-level trait was the missing voice.

## The Treaty of Four

We gave operations four rails. Input, output, error, trait. Every operation had a place for opinion — the trait rail. "This operation is called via HTTP GET." "This operation belongs to the billing domain." "This operation is idempotent."

The trait rail was our peace treaty. It said: here is where you put opinions. The facts stay pure. The opinions stay in their lane.

This worked.

Until it didn't.

## The Mute Atom

The treaty was signed at the operation level. But the war was waiting at the term level.

A term is an atomic unit of meaning. It has an id, a comment, a type — facts. But when you look at a term through the eyes of an HTTP emitter, a gRPC compiler, a documentation generator, you see more than facts. You see *intent*. Is this term a path parameter, a query parameter, a header field, a body member? Is it optional because the domain says so, or because HTTP says so? Is it a field that should be rendered in bold, a field that should be hidden, a field that should be validated by the frontend?

These are opinions. And the term was mute about them.

## The War Before It Started

Imagine the alternative. Without a place for term-level opinions, every vendor invents their own place. The HTTP vendor writes a convention: "a term whose id matches `path:.*` is a path parameter." The gRPC vendor writes a different convention: "a term whose parent object is named `PathParams` is a path parameter." The documentation vendor invents a third convention: "a term with a comment containing `@path` is a path parameter."

Three vendors. Three conventions. One term. No way to reconcile them.

Worse: these conventions would bleed into the term's identity. `some1[some2].some3.some4.[some5]` — a nested path of meaning, where each vendor hopes nobody else is using the same namespace. The term becomes a battlefield. The simplicity of the atom is lost.

We saw this coming. We had already lived through this in the framework wars. Spring. Jakarta. Laravel. Every framework that lacked a native place for opinion invented its own annotation layer. And every annotation layer fought every other annotation layer for the same syntactic space. We refused to let that happen to terms.

## The Extension

So we gave the term a voice.

The term now carries a trait rail of its own. It can say about itself what an operation says about itself. A term that is an HTTP path parameter carries a trait that says so. A term that should be rendered in bold carries a trait that says so. A term that is a field in a protobuf message carries a trait that says so.

The term is no longer mute. It has opinions. It has a place to put them.

## The Treaty of Five, Extended

The Treaty of Five was about operations. Five fields — id, comment, input, output, error. Exactly five. No more, no less. That number is a peace treaty against framework wars.

But the treaty never said opinions can't live on terms. It only said they can't live on the *operation's core fields*. The term-level trait is not a sixth field on the operation. It is a first field on the term — a field that was always missing, and now it's here.

Operation-level traits remain. Term-level traits join them. They coexist. They don't collide. An HTTP emitter reads the operation-level trait to understand the method and path. It reads the term-level trait to understand which parameters go where. Two levels. One philosophy.

## The Asymmetry, Completed

Operation: four years. Rails: four days. Term-level trait: four weeks.

The first was a discovery. The second was a recognition. The third was a confession — that the atom was incomplete, that the treaty had a gap, that the war was waiting to happen.

Now it's closed.

The term has a voice. The treaty holds. The war is averted.
