---
title: "#20 — How Much You Promise"
description: "BuyDog has three fields. SQLHTTPProxy has one — a query string. Both are valid Op operations. Op does not dictate how detailed your input has to be. The level of structure in a domain is the author's promise, not Op's requirement. Same as HTTP doesn't tell you to use JSON instead of bytes."
---

# How Much You Promise

`BuyDog(dogId, paymentMethod) -> Receipt | OutOfStock | PaymentFailed`. Three fields, two errors. Clean, structured, easy to read.

`SQLHTTPProxy.Execute(query: string, params: KV) -> Rows | QueryError`. One string, one map. Looks coarse next to BuyDog.

Both are valid Op operations. Equally valid. Equally honest.

The reflex says: *the second one is less typed, therefore weaker, therefore Op should help us make it stronger*. Wrong reflex. The second one is exactly as typed as its author meant it to be. The author of `SQLHTTPProxy` does **not want** to type the SQL deeper. That program's job is to pass a query through. The whole point. Structuring the SQL would turn the proxy into an ORM, which is a different program with different goals.

The level of structure in an operation is the author's *promise* to the caller. Not Op's requirement.

## How HTTP already encodes this

HTTP shows the same shape one floor below. When an HTTP endpoint exposes a body, the author picks how much to promise:

- `Content-Type: application/json` with a JSON Schema — *I promise the body will look exactly like this*
- `Content-Type: text/plain` — *I promise it will be text, the meaning is mine to interpret*
- `Content-Type: application/octet-stream` — *I do not promise even text. Bytes.*
- query parameters — *I promise flat key-value pairs*
- `multipart/form-data` — *I promise several parts, each with its own content type*

HTTP does not have an opinion about which one to pick. HTTP is the *frame* — there is a body, it is typed somehow. The specific typing is the author's choice. A file-upload service uses `octet-stream`. A REST CRUD endpoint uses `json`. A webhook receiver uses whatever the sender sends. All of them are valid HTTP. None of them is "less HTTP" than the others.

Op is the same shape, one floor up.

## Where every previous format failed at this

Every form-plus-opinion ancestor took a position on this axis and welded it shut.

- **Smithy** ships a prelude of seventy-two traits. Its grain pushes you toward fine structuring. Coarse operations feel "off-spec".
- **gRPC** through protobuf requires every input to be a typed message. *"This input is just a string"* is technically possible but culturally hostile.
- **OpenAPI** through JSON Schema rewards detailed body typing. `text/plain` works but feels undersold. The whole tooling assumes you'll model deeply.
- **WSDL** through XSD made *not* structuring almost embarrassing. Schema or XML-as-string was the choice, and the second one looked like failure.

Each of these has a default opinion on *how detailed an input should be*. Each one's tooling reinforces that default. Authors who want a coarser interface fight the format. Authors who want a finer one are pushed even finer.

Op refuses the opinion. The five fields tell you nothing about how granular the input needs to be. The trait system is open — author picks. The author who writes `BuyDog(dogId, paymentMethod)` and the author who writes `Execute(query: string)` are speaking the same protocol, exercising different rights.

## Why this is the fourth refusal

Op already refuses to weld three opinions into the core: transport, serialisation, runtime. This note names the fourth: *level of structural commitment*.

That makes Op asymmetrically minimal in a way that matters. The protocol declines to tell you how much detail your domain owes the world. That decision belongs to the program describing itself — the same program that already owns the rest of its domain choices.

`SQLHTTPProxy` is not a degenerate Op program. It is a fully realised one. It promises exactly what it intends to promise. The query is a string because the author of the proxy decided that delivering a string is the *whole job*. Adding structure would mean adding a new program with a new job, not improving this one.

`BuyDog` is also not the canonical shape of an Op operation. It is one author's choice for one domain. Different shop, different shape. Same protocol. Same form.

This is what *equality of programs* means at the granularity level. All programs are equal. All operations are equal. How loud each operation speaks about its insides — that's the author's voice. Op is the room they speak in, not the script they read.

## Short version

Op encodes the author's chosen level of promise. It does not raise or lower it. *How much you promise is how much you wanted to promise.*