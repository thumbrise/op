---
title: "#9 — The Address Is a Detail"
description: "When we debug high-level code, we do not pick the addresses of our variables. The compiler does. URLs are the same kind of detail one floor up. REST will not die because Op said so. REST will die because addresses are an implementation of wire binding, and humans stopped being the ones reading them."
---

# The Address Is a Detail

When we debug high-level code, we know one thing: we did not pick the addresses of our variables. The compiler did. We work with names. The compiler chooses the registers, the stack frames, the heap offsets. We never see them, and that is the entire reason we can think about what the code *does*.

Now look up one floor.

Today every web team — backend, frontend, manager, tester — stares at URLs. `GET /api/users/{id}`. `POST /api/orders`. `DELETE /api/orders/{id}/items/{itemId}`. Four professions, all reading the same intercomputer assembly language. Backend writes the routes. Frontend waits for Swagger. Manager pastes URLs into the tracker. Tester probes them in Postman. Everyone holds the address tree in their head, and everyone is afraid to break the fragile thing.

This is the same situation as the 1980s. You ran a program in DOS and it asked for IRQ 5, and your sound card already lived on IRQ 5, so the game ran without sound. You hand-edited `config.sys` because the devices had no shared language for declaring themselves. Then Plug and Play arrived. Devices described themselves. The system resolved conflicts. The human stopped picking addresses.

Op is the same move, one floor up.

The program declares its operations. The compiler picks the URLs — or compiles to gRPC, or to a queue, or to a CLI flag, or to four of those at once. The address is no longer the thing the human reads. The human reads the operation.

When that happens, REST does not die because Op forbids it. REST dies because the only reason it had a special status — *humans look at URLs* — stops being true. REST becomes one binding among many. A trait under `http/*`. The same way `vesa` became one of many display drivers after VBE existed.

The team that asks "should this be `PUT` or `PATCH`?" is the team that hand-edited IRQ tables in 1989. The argument was real then, in its time, and the argument was wasted, because the layer that made the question necessary is the layer that disappeared as soon as a better one was written.

Op writes the better layer. Then the question evaporates. Not because anyone won. Because the address was always a detail of wire binding, and the wire binding was always supposed to be the compiler's problem.
