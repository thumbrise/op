---
title: "To Build the Future, Look at the Past"
description: "USB, SMTP, SQL, OpenTelemetry, MCP, CORBA — every protocol that solved N×M has a story. We studied them all to avoid repeating the ones that failed."
---

# To Build the Future, Look at the Past

We formalized Op as a protocol. We wrote the manifesto. We felt the rush.

Then we stopped and asked: has anyone walked this path before? Not the "describe operations" path — the deeper one. The path of proposing a universal contract to an industry that doesn't know it needs one.

The answer is yes. Many times. Some succeeded. One failed spectacularly. Each left a lesson we intend to carry.

## USB (1996) — One Plug to Rule Them All

**The pain:** Every device had its own connector. Printers used parallel ports. Mice used PS/2. Modems used COM. Keyboards used DIN. A desk in 1995 was a tangle of incompatible cables.

**Who started it:** Ajay Bhatt, an engineer at Intel. He was tired of the mess. Intel assembled a consortium — Compaq, Microsoft, NEC, IBM, DEC, Nortel. Seven companies. None could do it alone; both device manufacturers and computer manufacturers had to agree simultaneously.

**How it spread:** It didn't. USB 1.0 shipped in 1996 and was ignored. No computers had USB ports. No devices supported USB. The classic chicken-and-egg problem.

**The turning point:** The iMac G3 (1998). Steve Jobs removed *every* legacy port and shipped only USB. Radical. Painful. Peripheral manufacturers had no choice but to build USB devices. Adoption exploded.

**Who won:** No monopolist. The USB Implementers Forum (USB-IF) governs the spec. It's open. But Intel de facto steers the direction.

**Lesson for Op:** A standard can be perfect on paper and dead in practice. It needs a forcing function — a product that *only* speaks the new protocol. Our POC must be that iMac: so useful that people adopt Op not because they believe in the philosophy, but because the tooling is better.

## SMTP (1982) — One Man, One RFC

**The pain:** Every network had its own email format. ARPANET, BITNET, UUCP, FidoNet — sending a message between them required gateways and manual conversion.

**Who started it:** Jon Postel. One person. RFC 821, August 1982. No budget, no company, no marketing. Just a document published through the IETF: "Here is how email should work."

**How it spread:** Organically. ARPANET already used a predecessor (RFC 788). SMTP was a refactoring — a simplification and formalization of what already worked. People switched because it was *simpler* than the alternatives.

**The turning point:** The growth of the public internet in the early 1990s. When all networks converged on TCP/IP, SMTP was the only email protocol that already worked everywhere.

**Who won:** No monopolist. The protocol is open. Gmail, Outlook, Fastmail — all speak SMTP.

**Lesson for Op:** SMTP won not because it was the best. It won because it was *simple enough* and *already working* when the moment of mass adoption arrived. If Op has a working POC when the industry matures, it wins by default.

## SQL (1970–1986) — The Paper, the Product, the Standard

**The pain:** Every database had its own query language, its own data model, its own API. Switching vendors meant rewriting everything.

**Who started it:** Edgar Codd, a researcher at IBM. He published "A Relational Model of Data for Large Shared Data Banks" in 1970. Pure academia. IBM didn't want to build it — they had IMS (a hierarchical database) printing money.

**How it spread:** IBM reluctantly built a prototype called System R (1974). In parallel, Michael Stonebraker at UC Berkeley built Ingres (which later became PostgreSQL). Two independent implementations of the relational model.

Then Larry Ellison read Codd's paper, saw that IBM was hesitating, and built Oracle (1979) — the first commercial relational database. He beat IBM to market with their own idea.

**The turning point:** ANSI standardized SQL in 1986 (SQL-86). This gave the industry confidence: you could write SQL and not be locked to a single vendor. (In practice, dialects diverged anyway, but the base contract held.)

**Who won:** Oracle dominated for decades. Then MySQL (open source, web era). Then PostgreSQL (open source, enterprise). The vendors rotate. SQL the language is the monopoly.

**Lesson for Op:** Codd published the theory. Ellison built the product. ANSI gave the standard. Three phases. We have the same path: devlogs = theory, POC = product, RFC = standard.

## OpenTelemetry (2019) — The Merger

**The pain:** Every application needed observability. Every observability vendor (Datadog, Splunk, Jaeger, Zipkin) had its own SDK, its own format, its own collector. N applications × M backends = N×M integrations.

**Who started it:** Two competing projects — OpenTracing (from Ben Sigelman, creator of Google Dapper) and OpenCensus (from Google). Both solved the same problem. Both had adoption. Both realized that competition was killing adoption faster than it was building it.

They merged into OpenTelemetry under the CNCF (Cloud Native Computing Foundation). Google, Microsoft, Lightstep, Datadog, Splunk, Elastic — everyone invested. Because everyone benefited: vendors needed a standard format to stop writing N collectors.

**How it spread:** Through CNCF governance. OTEPs (OpenTelemetry Enhancement Proposals) — a public, RFC-like process. Slow, bureaucratic, but legitimate.

**The turning point:** When AWS, Azure, and GCP all supported OTLP as an ingestion format. Vendors stopped resisting and started integrating.

**Who won:** No monopolist. CNCF governance. But Google and Microsoft have disproportionate influence through contributor count.

**Lesson for Op:** OTel won by *merging competitors* and *getting vendor buy-in*. We have no competitors to merge with — nobody is doing what we're doing. But we need early adopters who say "yes, this solves my problem" before we need a foundation.

## MCP (2024) — The Blitz

**The pain:** Every LLM agent needed to call external tools. Every tool had its own integration. Claude needed a Slack plugin, a GitHub plugin, a database plugin — each hand-built. N agents × M tools = N×M integrations. The same pattern, again.

**Who started it:** Anthropic. One blog post, November 2024. "We're sharing the Model Context Protocol as an open standard." Specification, SDK, examples, blog post — all at once.

**How it spread:** Blitzkrieg. No RFC process. No committee. "Here's the standard, use it." Adoption through hype and speed.

**The turning point:** When Cursor, Windsurf, Claude Desktop, and other IDE/agents shipped MCP support out of the box. Users didn't have to do anything — their tools already spoke MCP.

**Who won:** Anthropic controls the specification. Formally open, but governance is Anthropic's.

**Lesson for Op:** MCP proved that *one blog post + a working SDK* can create adoption faster than years of RFC process. Speed > formality at the early stage. Ship the POC, write the manifesto, let people use it. Formalize later.

## CORBA (1991) — The Warning

**The pain:** The same as everyone else's. Objects on different machines, written in different languages, needed to talk to each other. The vision was beautiful: a universal broker that lets any object call any other object, regardless of language or location.

**Who started it:** OMG (Object Management Group) — a consortium of 800+ companies. IBM, Sun, HP, DEC, and hundreds of others. Enormous budgets. Enormous ambitions.

**How it spread:** By committee. The specification grew for years. Every company pushed its own requirements. The result: thousands of pages of documentation, dozens of sub-specifications (IDL, IIOP, IOR, POA, ORB...).

**Why it failed:**

*Complexity.* The specification was so vast that no implementation was complete. Different ORBs (Object Request Brokers) from different vendors were incompatible with each other — the ultimate irony for an interoperability standard.

*Design by committee.* 800 companies = 800 opinions. Every feature was added to satisfy someone. Nobody removed anything.

*Competition from below.* HTTP + XML (SOAP) turned out to be "good enough" and infinitely simpler. Then REST + JSON finished CORBA off entirely.

**Who won:** Nobody. Everyone lost. OMG still exists (they maintain UML and SBVR), but CORBA is dead.

**Lesson for Op:** This is the most important lesson of all. CORBA proved that the *right idea* — separate interface from implementation — dies from complexity and design by committee. Op must stay dumb and small. Five primitives + traits. That's it. The moment we start adding "just one more feature to the core" is the moment we become CORBA.

## The Pattern

| Project | How it started | How it won | How it could have died |
|---|---|---|---|
| USB | One engineer at Intel | iMac killed all other ports | Chicken-and-egg (first 2 years were a failure) |
| SMTP | One RFC by one person | Was already working when the internet scaled | Could have stayed in ARPANET |
| SQL | Academic paper | Oracle built the product, ANSI gave the standard | IBM could have killed it |
| OTel | Merger of two competitors | All cloud vendors supported OTLP | Could have drowned in CNCF bureaucracy |
| MCP | One blog post by Anthropic | IDEs shipped it out of the box | Anthropic-centric governance |
| CORBA | Consortium of 800 companies | **Did not win** | Complexity, design by committee, simpler alternatives |

**What works:** one person or company with a clear idea + a working product + adoption through "it already works when you show up."

**What kills:** committees, scope creep, complexity, absence of a working product.

## Where Op Stands

Op is not CORBA. Op is closer to SMTP.

CORBA standardized *everything* — objects, transport, lifecycle, security, transactions. Op standardizes *one thing*: the operation. Five fields. Traits for everything else.

CORBA was designed by 800 companies. Op is designed by one person with a devlog.

CORBA required an ORB in every application. Op has no runtime.

CORBA lost to "good enough" HTTP+JSON. Op has no "good enough" competitor — nobody has standardized operations.

But CORBA's ghost must hang on the wall of every meeting where someone says "let's add this to the core." The answer is always the same: *make it a trait.* The core stays small. The core stays dumb. The core survives.

---

*To build the future, look at the past. The protocols that survived were simple, working, and ready when their moment came. The ones that died were ambitious, complete, and designed by everyone.*

*Op chooses to be simple. The rest is traits.*
