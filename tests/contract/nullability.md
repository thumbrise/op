# Nullability Contract Tests

From the repository root:

```sh
npm ci
node --test tests/contract/nullability.test.mjs
```

Tests validate the reference 1.1 schemas with Ajv Draft 2020-12, including complete instructions and recursive terms. They cover independent presence/nullability declarations and reject malformed nullable flags. A restricted JSON Schema projection illustrates payload states; it is not an OP compiler or OpenAPI adapter.

Format semantics and release notes live in [Nullable](../../docs/notes/form-of-rail/003-nullable.md). Runtime version checks and transport mappings belong to implementations, not this schema test suite.
