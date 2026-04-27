---
title: "#3 — RoadRunner Bleeds Across Layers"
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