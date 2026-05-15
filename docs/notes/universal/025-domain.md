---
title: "#25 — Domain"
description: "An operation doesn't know what Dog or Money is. It knows only form. This note examines how DSLs like Scedel mistake domain types for operations — and why binding operations to named types creates cascading brittleness."
---

# Domain

An operation does not know what Dog or Money is. It knows only form.

This note examines the difference between describing data shapes and describing operations — and why the confusion between the two creates brittleness that compounds over time.

## Physics Does Not Know Names

Consider a physical process: a ball rolls down a slope. The physics does not ask "what type of ball is this?" It asks only: what is the mass, what is the slope angle, what is the friction coefficient? The answers come as numbers — form. Whether the ball is made of lead or rubber is metadata attached from outside, not knowledge baked into the operation itself.

The operation is:

```
(input: {mass, angle, friction}) → (output: {velocity, position})
```

No reference to "Ball". No reference to "Lead". The operation works the same regardless of what the ball is called in any given domain model.

This is not philosophy. This is how every physical law works. Gravitation operates on mass, not on named types. Electromagnetism operates on charge, not on "Electron" or "Proton" as domain concepts. The universe does not couple operations to domain names.

Now consider a software operation:

```
BuyDog(input: Money, dogId: Int) → Dog | InsufficientFunds
```

This says: the operation BuyDog knows what Money is, knows what Dog is. It binds the operation to domain types.

But the operation knows nothing of the sort. The operation knows only: something arrives (form), something leaves (form), or an error occurs. What those somethings mean — that is interpretation, applied from outside.

The correct form:

```
BuyDog(input: BuyDogInput) → BuyDogOutput | BuyDogError
```

Where BuyDogInput, BuyDogOutput are structural descriptions — the shape of the data, not its domain meaning.

## The Scedel Case Study

Scedel is a DSL for describing data schemas. The author set out to solve the problem of synchronising contracts between systems — a genuine problem that many teams face.

In the Scedel example, GitHub publishes its API contract:

```scedel
type GithubUser = {
  id: Ulong
  login: String(min:1)
}

type GithubIssue = {
  id: Ulong
  number: Int(min:1)
  title: String(min:1)
  state: "open" | "closed"
  locked: Bool
  user: GithubUser

  closed_at:
    when this.state = "closed"
    then DateTime
    else absent
}
```

Three observations:

1. **Only data shapes are described.** There is no operation here. No GetIssue, no CreateIssue, no CloseIssue. The schema describes the form of an Issue — but says nothing about what you can *do* with it.

2. **Operations are not the same as data.** An API contract is not a data schema. A contract says: "give me X, I will return Y or fail with Z." A schema says: "here is the shape of Y." These are different things. The first is an operation; the second is a type.

3. **Domain types are embedded.** The field `user: GithubUser` binds the operation to a named domain type. If GithubUser changes, every operation that references it must be re-examined — not because the operation's form changed, but because the type name changed.

This is not a criticism of Scedel's quality. Scedel is well-designed for what it does: describing data shapes. The category error is in the framing — calling this an "API contract" when it describes only half of what a contract entails.

## The Three Facets

### Form Without Interpretation

Scedel: `BuyDog(money: Money) → Dog`

This binds the domain concept "Money" into the operation. The operation now carries an opinion: it expects a domain object named Money, not a data structure that happens to look like money.

OP: `BuyDog(input: BuyDogInput) → BuyDogOutput`

The operation knows only form. What BuyDogInput contains — whether it is called "amount" or "price" or "paymentValue" — is interpretation applied by the consumer.

This is the difference between:

- **Welding interpretation into the core** (Scedel)
- **Keeping interpretation outside the core** (OP)

### Change Cascades

When a domain type changes, operations that reference it must be checked.

In Scedel, if `Money` is renamed to `Payment`, or gains a new field `cryptoAddress`, every operation that used `Money` must be touched:

```
BuyDog(money: Money)
SellDog(dog: Dog)
Deposit(amount: Money)
Withdraw(amount: Money)
```

Change Money → all four operations require review.

In OP, the operations reference form, not name:

```
BuyDog(input: BuyDogInput)
SellDog(input: SellDogInput)
Deposit(input: DepositInput)
Withdraw(input: WithdrawInput)
```

If the internal structure of BuyDogInput changes — if "amount" becomes "value" — only the code that produces BuyDogInput needs to change. The operation itself is unaffected. It still receives BuyDogInput; the shape may have changed, but the operation does not know about Money and therefore does not cascade.

This is coupling by name vs coupling by form — the same insight that makes Go interfaces powerful through duck typing.

### N+M vs N×M Architecture

Scedel is a DSL with code generators inside itself:

- PHP generator for Scedel → PHP code
- JS generator for Scedel → JS types
- Python generator for Scedel → Python validation

Adding a new language requires modifying Scedel's codebase to add a new generator. Each new language multiplies the maintenance burden: N languages × M internal generators = N×M.

OP is a protocol with emitters outside:

- Go emitter → Op instructions
- PHP emitter → Op instructions
- TypeScript emitter → Op instructions

The receivers are also outside:

- OpenAPI receiver (Op → OpenAPI)
- MCP receiver (Op → MCP tools)
- gRPC receiver (Op → protobuf)

Adding a new language requires writing an emitter — which any author can do in a weekend, without touching the protocol itself. Adding a new transport requires writing a receiver. N+M, not N×M.

The economic difference compounds. As the ecosystem grows, Scedel's maintenance curve rises exponentially. OP's rises linearly.

## The Categorical Distinction

Scedel describes data shapes. OP describes operations.

Neither is better. They are different categories, like a hammer and a wrench. Both are useful tools. Neither is a universal solution.

The error is in the claim space: presenting a data schema DSL as a solution for operation contracts. The contract is the operation — what you can request, what you will receive, how it fails. The data shape is one field inside that contract (the output), not the contract itself.

This is a category error, not a quality failure. Scedel does what it does well. It simply does not do what it claims to do.

A protocol that stays at the level of form — that describes what an operation is without saying what the data means — achieves something different. It becomes a substrate that any domain can interpret as it sees fit, without the protocol itself needing to change when domains evolve.

The operation knows only form. That is not a limitation. That is the point.

---

The banana does not know who will pick it. The operation does not know what its data means. Both are better off for it.