---
title: "#10 — Fifty Triggers, Fifty Barrels"
description: "Modern infrastructure: a pistol with fifty triggers and fifty barrels. Every layer added one. None ever took one away. The arsenal grows because no floor in the building described the form of a single shot."
---

# Fifty Triggers, Fifty Barrels

Open the stack.

Kubernetes manifests. Helm values. Terraform plans. Prometheus rules. Grafana dashboards. OpenTelemetry collectors. Istio meshes. ArgoCD apps. Vault policies. cert-manager issuers. Each one solves a real problem. None of them subtracts. The arsenal grows.

The application developer is supposed to know all of them. Not deeply — a career each — but enough to wire them together without losing a finger. A pistol with fifty triggers and fifty barrels. Don't memorise the use cases — don't pull the wrong one.

Nobody designed this. Each layer was someone's honest answer to the layer below. Helm because raw manifests duplicated. Terraform because cloud APIs drifted. Prometheus because metrics had no shared shape. Each one, alone, was a small relief.

The relief stops compounding when nobody on the floor names *the shot*. Helm wraps manifests. Terraform wraps cloud calls. Prometheus wraps metrics. None of them say what the application is *doing* — operation, input, output, error. The shape of the shot is missing. Every layer adds another barrel for another angle, and somebody has to keep the pistol balanced.

Op does not replace any of these. They each do their layer. Op writes the line that was never written: *here is the shot*. Once that line exists, fifty barrels stop being fifty hand-decisions. They become outputs of a compiler reading one operation against one target.

Until that line is written, the pistol stays in the developer's hand.
