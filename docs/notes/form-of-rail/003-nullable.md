---
title: "#003 - Nullable"
description: "A missing term and a present null are different states. The contract must preserve the difference."
---

# Nullable

While inferring output from a Spiral DTO, we found a gap. `required` says whether a term must be present. It does not say whether its value may be null.

Consider an update: omitting `name` leaves it unchanged; sending `name: null` clears it. That meaning belongs to the operation, not to null itself. But losing the distinction changes what the operation does.

OpenAPI already expresses nullability. Translating a nullable string and a non-nullable string into the same OP term loses information. No reverse translation can recover which contract we started with.

Not every language has null. Rust has `Option`; Haskell has `Maybe`. OP does not require their runtime representations to be identical. It needs to preserve the distinct states their contracts describe.

## Two Independent Questions

OP format 1.1.0 adds optional boolean `nullable` to Term:

| required | nullable | Permitted states |
| --- | --- | --- |
| true | false | Value |
| true | true | Null or value |
| false | false | Omission or value |
| false | true | Omission, null, or value |

Absent `required` means false. In 1.1.0, absent `nullable` also means false. This does not retroactively assign nullability semantics to 1.0 documents.

```json
{
    "id": "name",
    "comment": "Replacement name; null clears it",
    "kind": "string",
    "required": true,
    "nullable": true,
    "trait": []
}
```

The term must be present. Its value may be a string or null. Null does not satisfy a string constraint; it is a separate permitted alternative. `nullable` applies to this term only: a nullable array does not automatically have nullable elements.

This is a fact about permitted values, not an ignorable trait. Emitters and compilers own the mappings and supported-version checks. The contract records the distinction.

## Contract Version

The addition is published as format **1.1.0**, with separate [instruction](../../reference/instruction.v1.1.json), [operation](../../reference/operation.v1.1.json), and [rail](../../reference/rail.v1.1.json) schemas. Nota is unchanged. The 1.0 reference schemas remain available.

Existing document shapes remain accepted. Consumers of 1.1.0 must understand its nullability semantics; an old consumer accepting unknown JSON fields is not evidence that it understands them. Runtime package releases are separate from the contract release.
