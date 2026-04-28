---
title: "#2 — Gallium"
description: "Sat down to write the emitter. First instinct — parse the AST. Caught myself: that is the guts-extraction we ridiculed in #30. Switched to a Spiral CLI command. The program tells me what it is, because Spiral made the choices that let it. The gallium tested true."
---

# Spiral as Gallium

In devlog #17 I said Spiral is gallium. A program that knows itself.

Today I sat down to write the emitter. First instinct: parse the AST with nikic/php-parser. Walk the source, find #[Route] attributes, extract methods.

Caught myself. That is exactly the guts-extraction we ridiculed in #30. We are not supposed to dig through the corpse. We are supposed to ask the program.

Switched to a Spiral CLI command. Boots the application properly, gets RouterInterface from the container, asks for routes, asks the controllers for their reflection signatures. The program tells me what it is, because Spiral made the choices that let it.

The setup costs more. A full composer create-project spiral/app ., bootstrap, all of it. AST parsing would have been three lines.

But the gallium tested true. Spiral really does know itself when asked properly. The cost is real, the result is honest. Devlog #17 stays.