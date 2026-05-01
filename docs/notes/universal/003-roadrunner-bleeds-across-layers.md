---
title: "#3 — Bleed"
description: "Opened .rr.yaml. Four concerns in one file — transport, process management, domain middleware, infrastructure observability. No boundaries between them. Layers welded shut where they should slide independently. Op separates these axes by construction."
---

# RoadRunner Bleeds Across Layers

Opened .rr.yaml for the first time today. Stared.

```yaml
http:
  address: 0.0.0.0:8080
  middleware: [headers]
server:
  command: "php worker.php"
  relay: pipes
logs:
  level: debug
metrics:
  address: localhost:2112
```

Four concerns in one file. Transport. Process management. Domain middleware. Infrastructure observability. No boundaries between them.

In a healthy stack each of these lives in a different place. Caddy or Nginx for transport. PHP-FPM for process management. php.ini for runtime. Application code for domain. Four files, four owners, four languages of expertise. Editing one does not require knowing the others.

RoadRunner collapsed all four into one YAML. Want to change max body size? Hunt across http, server, maybe a separate pool section. Each one has a slightly different syntax. Each one assumes you know its world.

This is the same leak Tim Berners-Lee left in HTTP. Layers welded shut where they should slide independently.

Op separates these axes by construction. Operation is domain. Trait is orientation. Transport is the bottom layer of the compiler. Infrastructure is the deployment manifest, generated, not handwritten.

I am not going to fix RoadRunner. I am going to live with .rr.yaml until somebody writes op-rr that emits it from a clean instruction.

## Line by line

Re-read the same file. Each line is in the wrong place.

`http.address: 0.0.0.0:8080` — welded to HTTP. The very first key assumes the application speaks HTTP. Not a transport-aware program with HTTP as one binding. HTTP is the program now.

`server.command: "php worker.php"` — what is this, even? A possibility? A rule? A constraint? A default? The schema does not say. It is everything and nothing. The reader has to guess.

`server.relay: pipes` — same question. This is the internal mechanism of the process manager talking to its workers. Why is it leaking into the application's deployment file? The application does not pick its own relay. Relay is decided by whoever runs the workers.

`logs.level: debug` — this is a program flag. Literally an option that controls what the program writes to stderr. It belongs next to the binary, not in the server config. As if `.bashrc` required declaring what colour `ls` paints directories.

`metrics.address: localhost:2112` — this one is the loudest. The line says we expose metrics on a port. Which means somewhere, in someone's hand-written code, there is a `net/http` call that scrapes that port. By hand. Because metrics export is not a layer in this stack. It is a chore. Op compiles that chore away — `op-prometheus` reads the operation, emits the scrape, the application code never knew there was a port.

Five lines. Five different professions, smashed into one file, with no schema explaining which line answers which question. The author of this YAML is forced to be all five professions at once. That is the cost of a missing layer.