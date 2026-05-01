# universal/ — first vendors, not a standard library

This directory holds the vendors we are bootstrapping for Op. They are not a standard library. They are the first inhabitants of an otherwise empty world, written so that instructions have somewhere to land while the protocol gets its legs.

## What lives here

- `fixtures/` — shared test instructions for every milestone on the roadmap. The canonical instruction is `dogshop.json`; its broken sibling `dogshop_invalid.json` exists to test refusal behaviour.
- `openapi/` — a compiler from Op instructions to OpenAPI documents (in progress).
- Future siblings declared in `ROADMAP.md` — vendors and compilers we plan to write next.

## What this directory is not

It is not a definition of *what a vendor is*. That definition lives in [devlog #28 — Dobby Is Free](../docs/notes/form-of-operation/028-dobby-is-free.md), and the full framing belongs there. Read it before assuming anything about how this directory should grow.

It is also not a contract that the vendors we ship will be the best ones. Our success condition is the opposite: when somebody else publishes a better `http/`, a better `openapi/`, a `grpc/`, a `kafka/` — we step aside and the anthill keeps moving.

## Where to look next

- [`ROADMAP.md`](./ROADMAP.md) — what we plan to build inside `universal/` next.
- [Devlog #28](../docs/notes/form-of-operation/028-dobby-is-free.md) — why this directory exists at all.
- [Devlog #29](../docs/notes/form-of-operation/029-the-anthill-organizes.md) — why we do not plan beyond the horizon of real need.
