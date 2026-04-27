---
title: "#13 — The Lock That Disappeared"
description: "Cloud platforms keep one promise honestly: don't think about infrastructure, write a function. The price is the SDK. Once your code is shaped to one cloud's API, leaving is a rewrite. The lock isn't in the bill — it's in the cost of the rewrite. With a portable contract above all of them, the lock evaporates as a category. Clouds compete on real things."
---

# The Lock That Disappeared

Cloud platforms keep one promise honestly: *don't think about infrastructure, write a function*. Lambda. Workers. Machines. Vercel. Railway. The function runs, the request arrives, the response goes back, scaling happens. The infrastructure is genuinely hidden.

Inside their walls.

The price is the SDK. The trigger types. The event shape. The deployment manifest. Once your code is shaped to one cloud's API, leaving is a rewrite. Not because anyone is malicious. Because the promise was kept locally — and the contract was written by the cloud, not by your application.

Every CTO budgets for that lock. *What if AWS triples the price?* is a real question with a real answer in quarters, not weeks. The lock isn't in the bill. It's in the rewrite.

Op describes the operation independently of where it runs. With the contract present, Lambda, Workers, Machines all read the same instruction. Each compiles it into their own runtime. The application stops being shaped to one cloud — it is shaped to its own operations, and the cloud is one compiler away.

The lock does not weaken. It evaporates as a *category of risk*. CTOs stop asking "what if they raise prices" and start asking "is anyone cheaper this quarter." Rewrites become switches. Switches become weekly decisions. Like changing a CDN.

The clouds win first. The hard engineering — globally distributed compute, edge networks, instant scaling — is theirs and stays theirs. The planet would have to redo it from scratch without them. Op does not threaten that work. Op only takes the SDK away from being a moat.

When the moat dries up, the cloud that wins is the one with the better engineering, the better price, the better geography. Real things. The kind of competition the platform business has been waiting for since it started.
