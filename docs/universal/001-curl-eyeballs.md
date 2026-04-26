---
title: "#1 — Curl Eyeballs"
description: "VPN broke curl. Browser kept working — Happy Eyeballs hedges connections in parallel. Twenty years of retry libraries inside every framework. In Op it is forty lines, one trait, and every client gets it for free."
---

# Curl Eyeballs

Turned on the VPN. Browser works fine. Curl hangs.

Spent an hour digging. Turns out the VPN returns one IP per DNS query, and the route to that one IP is broken. A second later the same domain resolves to a different IP, also broken half the time.

Browser does not notice. It does Happy Eyeballs — fires connections to multiple IPs in parallel, first one to respond wins. Curl is naive — takes the first IP, waits a full TCP timeout, gives up.

Hedging. Speculative concurrency. Browser in 2026, curl in 1996.

And then I saw it. This is not browser magic. This is a pattern. Hystrix, resilience4j, Polly in dotnet, every retry library you have ever used. Twenty years of rewriting the same thing inside every framework, in every language, by every team, alone.

In Op it is just a component. Forty lines. trait: hedge/parallel: 3. Any client gets hedging for free, whether it knows about hedging or not.

The browser is not magical. The browser has a contract between its internal parts. CLI tools never had one. We are about to give them one.