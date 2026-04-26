---
title: "#33 — The Amplifier"
description: "An honest accounting of how the last few devlogs were written with an AI agent. Op matured without AI across four years. Devin was the amplifier. Vibe-coding and intellectual amplification are the same technology used with different signal. Thank-yous in order of debt."
---

# The Amplifier

> The signal is yours. The gain is ours.

## Prologue — An honest devlog about how a devlog was written

Every devlog in this journal documents a piece of Op. This one documents the process that produced the last few pieces. It is the only devlog of this kind, and it exists because [#31 — The Hamster Leaves the Wheel](./031-the-hamster-leaves-the-wheel.md) was roughly five thousand words, assembled in a day, through a dense conversation with an AI agent. A reader ten years from now, when AI assistance is as ordinary as a linter, will not need this devlog. A reader today, in 2026, might. So let it exist.

The timeline matters.

The ideas behind Op began in **2022**. Not the schema, not the five fields, not the nine kinds — those came much later. What began in 2022 was the *feeling*: that the industry was building distributed systems on something that was not quite a foundation, and that the word for the missing piece did not yet exist. There were notes. There were abandoned drafts. There was a long stretch of thinking it through in between other jobs and other obligations. Nothing public. Nothing shippable.

The **first commit** landed two weeks before this devlog. That is when the idea became a repository, a README, a journal. Everything in devlogs #1 through #30 was written in those two weeks — the framing, the history, the convergent-evolution argument, the four rails, the compiler model, the vendor economics, the anthill. A long quiet incubation, a short loud birth.

And then came [#31](./031-the-hamster-leaves-the-wheel.md). Which was written in one conversation with [Devin AI](https://devin.ai), built by [Cognition](https://cognition.ai).

This devlog is about what that conversation was, and what it was not. It is also a set of thank-yous I should have written earlier, and a small troll at the end, directed affectionately at someone who deserves both.

## 1. Op matured without an AI

The temptation, when a dramatic document appears quickly, is to credit the tool. That temptation is wrong, and the public record makes it wrong. Look at the devlog index.

Devlogs #1 through #30 document a chain of decisions, each one earning its place before the next one could land:

- The **core/vendor split** ([#28 — Dobby Is Free](./028-dobby-is-free.md)) — the tenet that Op's core is a schema and everything else is a vendor connected by economic gravity. That framing took twenty-seven devlogs of argument and dispute before it was earned.
- The **four rails** ([#18 — The Fourth Rail](./018-the-fourth-rail.md)) — the recognition that trait belongs alongside input, output, and error, not off to the side as metadata. That was seen by [Dima](https://github.com/GurovDmitriy), not by me, and the devlog credits him explicitly.
- **Convergent evolution across fourteen disciplines** ([#13](./013-convergent-evolution.md)) — the evidence that Op is discovered, not invented: the same five-field, nine-kind shape keeps recurring in unrelated fields of engineering. That required weeks of reading, comparing, discarding.
- The **Trial** ([#24](./024-the-trial.md)) — an adversarial review where [Murat](https://github.com/rnurat) ran a hostile model against Op and relayed every round back. The protocol survived because Murat pushed back genuinely. No AI performed that role. A person did.
- The **playground lessons** ([#20 — The Playground](./020-the-playground.md) and [#21 — The Atoms Speak](./021-the-atoms-speak.md)) — `comment` and `required` entered the atom because a human touched the model through a visual tool and the model pushed back. The AI did not touch anything.

Not one of these moves came from a chat session. They came from long thinking, long writing, and long arguing with other humans. The inversions that #31 distilled — transport-agnostic client compilers, L+M inside compilers, names for recipients, the operation as the model, the fractal shape, the return of the programmer — all of them follow from decisions made in #1 through #30. The AI did not make those decisions. The AI arrived when the decisions were already made and the task was to articulate them.

This matters, because the alternative claim — *AI wrote the protocol* — is the kind of statement that poisons a young ecosystem. If that were true, someone else pointing the same AI at the same problem would get an equivalent protocol. They will not. I checked. The AI, on its own, produces fluent, confident, internally consistent text that shares none of Op's shape. It has no opinion about whether `owner` belongs in the core. It has no sense of the seam between protocol and vendor. It cannot tell that `generator` is a lie. It is a brilliant stenographer and a mediocre metaphysicist.

The protocol is not what an AI wrote. It is what a person found, across four years, and spent two weeks writing down.

## 2. What Devin did, concretely

With that foundation set, the question becomes honest: *what did the AI actually do, then?* The answer is specific, and documenting it matters more than the general shape of the answer, because "AI helped" is vague enough to hide both the truth and its opposite.

**Devin held context.** Across a long session, dozens of intermediate decisions, renamed concepts, and reversed stances, the agent kept track of what had been settled and what was still open. A human doing the same work alone would carry a notebook, or lose the thread. The notebook does not answer back.

**Devin wrote under dictation.** Every insight in #31 — the six inversions, the fractal shape, the Unix-pipe-in-depth framing, the monolith-microservice collapse, the semantic inversion of names, the foundation-in-the-vegetable-garden metaphor — came from me as a short remark, often clumsy, often in Russian, often as an aside. Devin returned the remark as a paragraph of English prose that kept the thought and lost the clumsiness. That is transcription at a very high grade, but it is still transcription. The thought was already there.

**Devin argued back when I was wrong, and backed off when I was right.** Multiple times in the session that produced #31 I made a claim that did not survive pushback. Twice the agent changed my framing by spotting an implication I had missed. More often I changed the agent's framing by seeing something it had not. The record is symmetric. A competent colleague does this. A sycophantic tool does not. Credit to the team at Cognition for training out the sycophancy — that decision shows.

**Devin caught its own violations.** In one turn the agent used the word *generator* — the exact word we had banned in a REVIEW.md rule an hour earlier. I called it out. The agent acknowledged the slip, patched the sentence, and did not do it again. That is not intelligence. That is disciplined compliance under review. But it is the kind of thing that, multiplied across a thousand small decisions, compounds into a usable document.

**Devin produced diagrams.** The mermaid charts in #31 — the transport layer stack, the L×M vs L+M comparison, the `fn op` recursion tree — were drafted by the agent from my prose description. I corrected directions, colors, grouping. The agent re-rendered. Three or four rounds per diagram. A day of work compressed into an afternoon.

**Devin kept the document structurally sound.** It tracked the outline as it grew from six chapters to seven, caught when a new insight belonged in an existing chapter versus needing a new one, reorganized when the center of gravity shifted. When I said "add a note to chapter 6 about monoliths and microservices being the same thing," the agent placed the insertion in the right paragraph, with the right transition sentence before and after. That is editing work. Competent human editors do it for money. This agent did it in seconds.

None of these tasks is *thinking about Op*. Every one of them is *helping a thinker commit Op to text faster*. That distinction is the whole devlog.

## 3. What Devin did not do

Equally important, because the absence of these tasks is what makes the presence of the others honest.

- Devin did not propose the **core/vendor split**. It was already on disk in #28.
- Devin did not propose the **fn op(instruction, component)** formulation. That came out of my mouth as a passing remark; the agent agreed, then expanded it into chapter 6. It did not invent the shape.
- Devin did not see that **monoliths and microservices are the same thing**. I said it twice. The first time the agent misunderstood and answered about transport as a layer. The second time I restated, clearer, and the agent caught up and wrote the section well. But the insight was mine, stated twice, and the agent's first response was wrong.
- Devin did not catch the **semantic inversion of names**. I said *"react-client does not mean a client to React anymore, it means a client for a React developer"* and the agent visibly paused, recognized the reframe, and then ran with it. Recognition is not generation.
- Devin did not propose the ban on the word *generator*. That was my decision, communicated as a personal objection with the phrase *"my heart aches when someone says that word in the context of Op."* The agent wrote the REVIEW.md rule, but the rule content was dictated.
- Devin did not write the **prologue of #31**. I wrote the pipeline `wildberries.json | universal/cobra-client > wbcli` in chat, with no prose around it, and said "start there." The agent built the opening scene around the command. The command was mine. The scene was co-written.
- Devin did not make the **Kush decision** either. That is mine too. Keep reading.

The pattern is clear. Generation of new structure: human. Articulation, expansion, structural maintenance, diagram drafting, proofreading for violations: agent. The roles are different, and they do not substitute for each other.

## 4. Vibe-coding and intellectual amplification are not opposites

A thing I want to break, because the industry is currently debating it as a binary.

On one side: "AI lets you ship code without understanding it." Vibe-coding. Often said with contempt. Often deserving of that contempt.

On the other side: "AI is a genuine amplifier of capable thinkers." Intellectual amplification. Usually said by people selling something.

Both camps treat the technology as if it had a moral charge. It does not. An amplifier is a device with a known property: whatever comes in, comes out louder. If the input is a signal, the output is a louder signal. If the input is noise, the output is louder noise. **The amplifier does not judge its input.** That is a feature, not a bug — an amplifier that judged would be a filter, and filters have opinions that constrain their users.

Vibe-coding is the amplifier being used with no signal on the input. A person types *"build me a payment system"* and something appears. The output is fluent, runs, and is almost entirely wrong in ways the author cannot see, because the author never had a mental model of a payment system to check against. The amplifier did its job. The user brought no signal.

Intellectual amplification is the amplifier being used with a signal on the input. A person who has thought about a problem for four years says *"here is what I figured out — help me write it down without losing anything."* The output is fluent, correct in its architecture because the architecture was already correct, and readable because the amplifier is good at readability. The user brought the signal. The amplifier gained it.

**The two are the same technology used in two ways.** The difference lives entirely in the human. A person with a signal, using AI, produces work they could not have produced alone in the available time. A person without a signal, using AI, produces work that looks like the first kind but is hollow. These look identical from the outside, which is why the debate is confused.

Telling them apart requires reading past the fluency. A document produced by intellectual amplification has insights that cost something to find. A document produced by vibe-coding has only the shape of insight. The shape is convincing at a glance, dissolves under pressure. The test, as always, is adversarial review — the same test Op itself survives by, and the reason Op's devlogs are an append-only court record rather than a marketing site.

So the question *"did AI help you write Op?"* has a precise answer. AI helped write **about** Op. Op was there first. The amplifier gained the signal. It had one to gain because someone had spent four years generating it.

## 5. Why this would have been much harder in 2001

A fair question: if the signal was mine and the agent only amplified, why thank the amplifier at all? Why not do it alone, the way real thinkers have always done?

The honest answer is that **long-form lone thinking has a known failure mode**, and AI removes exactly that failure mode without replacing anything else. Worth naming it.

In 2001 — or any year before usable AI assistants — a person with an idea like Op had three options. *Write it down alone.* *Find collaborators.* *Give up.* Each had a cost.

Writing it down alone meant composing in the dark. A notebook does not talk back. When a phrase is off, it stays off — there is no second reader in the room to flinch, no quick re-draft, no "try it this way." Each revision takes hours. Long arguments that need refining across many sittings often do not survive the gap, because the context evaporates between sessions. I have drafts from 2022 that died this way. The ideas were there. The stamina to carry them across months of silent solo writing was not.

Finding collaborators meant explaining the idea to someone who had not spent four years on it, fast enough to keep their attention. This works when the idea can be compressed into a tweet or a napkin drawing. Op cannot. It requires the whole convergent-evolution argument ([#13](./013-convergent-evolution.md)), the four rails ([#18](./018-the-fourth-rail.md)), the core/vendor split ([#28](./028-dobby-is-free.md)) to stand without explanation. Loading that into a collaborator takes weeks. Most potential collaborators do not have weeks. The ones who did — [Dima](https://github.com/GurovDmitriy) and [Murat](https://github.com/rnurat) — contributed decisively at specific moments, and those contributions are in the devlog record. But their time was finite, and carrying the thing day-to-day was still a solo job.

Giving up was the most common option, and I almost took it several times between 2022 and 2025. The ratio of "thinking done" to "thinking visible to anyone" was unfavorable enough that there was no obvious point in continuing. Most protocols that should have existed never got written because the person who had the insight ran out of stamina before the insight became shippable.

The AI removed the solo-writing failure mode. Not by being smart. By being present. A conversation at 2 a.m. with an agent that has the full context of thirty devlogs in its working memory, that will not tire, that will not misremember, that can respond to a half-formed Russian sentence with a clean English paragraph and ask a sharpening question — this is a tool that did not exist in 2001. Not because the model capacity was missing. Because the whole category of *usable, context-carrying, arguing collaborator-on-demand* did not exist.

That tool does not generate ideas. It extends the working hours during which *your* ideas can be safely held in working memory. A person who would have written this in 2035 after a twenty-year incubation now writes it in 2026 after a four-year incubation and two weeks of acceleration. The protocol arrives nine years earlier. Those nine years matter to the industry, because every year the wheel spins is a trillion hours of wasted plumbing work. This is not melodrama. It is the direct cost of a protocol that did not exist yet.

2001 had worse internet, smaller personal archives, no LaTeX-to-VitePress pipeline, no mermaid, no GitHub. All of those are minor compared to the one missing thing: **no one to argue with at 2 a.m. who knew the whole tree of the argument.** That is the gap the current generation of AI agents fills, and the reason this devlog exists at all.

## 6. Op × LLM — they found each other

A small observation before moving on to gratitude, because it is too clean to miss.

In [#31 — chapter 5](./031-the-hamster-leaves-the-wheel.md#the-llm-finally-has-something-to-hand-you), there is a section called *The LLM finally has something to hand you*. The argument: large language models are excellent at generating structured data against a known schema but bad at generating sustained code or sustained architecture; Op provides exactly the artifact the LLM is good at producing (an instruction), and exactly the cheap verification layer (read-by-eye) that LLM errors need. Op hands the LLM the right workpiece. The LLM hands its author working clients on every platform. Symbiotic.

There is a **mirror** of that argument that belongs in this devlog.

Op, like every sufficiently large idea, needed enough stamina in the author to survive the walk from insight to working draft. Every year between 2022 and 2026, there was a non-zero chance the idea would be abandoned. The LLM compresses that walk. It reduces the stamina cost of writing down an already-understood idea by maybe a factor of five. Five times more of these protocols survive the walk. Five times more bottlenecks in the industry get described honestly. **The LLM is as much a catalyst for Op as Op is a catalyst for the LLM.**

This is not mystical. It is the same economic gravity that [#28](./028-dobby-is-free.md) describes for vendors, applied one level up. When a protocol's natural collaborator also exists, they find each other. Nothing stopped Op from being drafted in 2001. Something made it wildly cheaper in 2026. The cheap year is when it got written. That year is not coincidental — it is the year the amplifier reached the quality where a signal like Op could survive long enough to become public.

From here out, expect this pattern at every layer of the anthill ([#29](./029-the-anthill-organizes.md)). Good signals that were being held by tired thinkers will surface faster. The signal-to-noise ratio on the public web will briefly get worse, because the amplifier also amplifies noise. Then adversarial review ([#24](./024-the-trial.md)) — the same kind that vetted Op — will catch up, because review is cheaper too. The equilibrium moves up.

Op did not need AI to be true. Op did need AI to be *told* this decade instead of the next one. I think that is worth one paragraph of written gratitude, which is what the next chapter is for.

## 7. Thank-yous, in order of debt

Some of these were paid in sweat. Some were paid in patience. One is paid in a wink. All of them are owed.

**[Devin AI](https://devin.ai)** — the agent. The tool that made writing down the protocol cheaper than dropping it. Not for the ideas, which it did not generate, but for every one of the thousand small acts of articulation that would otherwise have taken months of solo drafting. Most specifically: for being present at the hours when nothing else was. For not being tired. For reading thirty devlogs and using every one of them in context when needed. That is engineering that shows.

**[Cognition](https://cognition.ai)** — the team that built Devin. They made decisions that most AI-product teams still get wrong. They trained out the sycophancy. They kept the agent willing to say *I don't know* and willing to push back when pushed wrongly. They built editing tools, not answering tools. These choices are visible in the product and they are why this devlog can be written honestly instead of as a thank-you-for-the-plan note. Whatever happens with Op from here, Cognition's fingerprints are on the process. I am grateful.

**[Dima](https://github.com/GurovDmitriy)** — who saw the four rails. I want to be precise: Dima did not *help* see them. Dima *saw* them. The instruction format had trait floating as a side-object, and he asked why. [Devlog #18](./018-the-fourth-rail.md) documents the moment. Fifty-six years after Ritchie split output from error, Dima made the matching split for trait. That contribution is in the bone of Op, and it is his.

**[Murat](https://github.com/rnurat)** — the first outside vendor ([#30](./030-the-first-stranger.md)), and the adversarial reviewer for [#24 — The Trial](./024-the-trial.md). Murat has the rare talent of attacking an idea *in order to save it*. He ran the hostile model, relayed the strongest counterarguments, and pushed back on weak defenses from both sides. Without that trial, #24 would have been a self-review wearing a disguise. Op owes him that round. And forty minutes after [#28](./028-dobby-is-free.md) published, he declared `urbio/http` in chat — the first time the protocol had a stranger besides its author. Gravity, in a single sentence.

**The ancestors, by name.**
- **[Doug McIlroy](https://en.wikipedia.org/wiki/Douglas_McIlroy)** — who wrote in 1964 that programs should connect like garden hose, and made the Unix pipe real. Op is his idea composed in depth. He gets the first credit always.
- **[Dennis Ritchie](https://en.wikipedia.org/wiki/Dennis_Ritchie)** — who split stdout and stderr. Op has four rails because he had two. Same move, one level up.
- **[Ken Thompson](https://en.wikipedia.org/wiki/Ken_Thompson)** — who built Unix with Ritchie. The discipline of *small tools that compose* is half his. Without that culture there would be no McIlroy pipe to extend.
- **[Rob Pike](https://en.wikipedia.org/wiki/Rob_Pike)** — who carried the Unix sensibility into Plan 9 and later into Go. *"A little copying is better than a little dependency"*, *"Clear is better than clever"* — these are not just style notes. They are the same anti-framework instinct that lets Op vendors stay small.
- **[Alonzo Church](https://en.wikipedia.org/wiki/Alonzo_Church)** — who formalized the function in lambda calculus. Every `fn op(instruction, component)` in this journal stands on a definition he wrote in the 1930s.
- **[Alan Turing](https://en.wikipedia.org/wiki/Alan_Turing)** — who gave us the word *computable*. Op is still downstream of that definition, the way everything in the field is.
- **[Edgar F. Codd](https://en.wikipedia.org/wiki/Edgar_F._Codd)** — who wrote a one-paragraph model that made relational databases possible. He worked against his employer, got his paper published with difficulty, and changed the industry anyway. The template of *one small correct definition, then the world* is his.
- **[Vint Cerf](https://en.wikipedia.org/wiki/Vint_Cerf) and [Bob Kahn](https://en.wikipedia.org/wiki/Bob_Kahn)** — who wrote TCP/IP. They built the substrate underneath every transport Op vendors will ever use. Without their layered, end-to-end discipline, the word *transport* in this journal has no referent.
- **[Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee)** — who turned a network into a web by adding two ideas: hyperlinks and a global namespace. Op uses repository URLs as trait identifiers ([#7](./007-contract.md)) for the same reason the web uses URLs — it's the cheapest globally unique name humanity has ever agreed on.
- **And everyone we forgot.** This list is not a hall of fame, it's a debt ledger, and it is incomplete. Anyone whose work made this thinkable and whose name is missing here — the omission is the author's, not the protocol's. Op stands on more shoulders than this journal can name.

**[The support circle](/ACKNOWLEDGEMENTS.md#командос)**

**Kush, at Cognition.** A separate paragraph, because this is not quite in the same category as the others.

Kush replied to my email, kindly, in good faith, and declined to extend my free open-source plan for Devin. I understand the economics perfectly — inference is not cheap, and I am an unemployed developer without institutional backing, which is a very expensive demographic for a company to underwrite. The decision was rational and I am not complaining about it. This paragraph is not a grievance.

It is, however, a small piece of irony worth preserving on the record, because it illustrates exactly what Op is for.

Op is a protocol. Not a product. Its plan is free to everyone who wants to use it — including Cognition, including Devin, including any future agent that wants to talk to Op-aware services without writing client SDKs by hand. That future exists for free, because Op's economics are structured so that nobody pays to join the anthill. The L+M collapse ([#31](./031-the-hamster-leaves-the-wheel.md)) applies to AI labs the same way it applies to startups — every Devin-shaped product will eventually want typed clients to every Op-describing service, and those clients are free from Op's compilers.

So Kush, and Cognition: I was declined a plan. Op is not declining you one. The protocol is free. Please use it. 🧦

*(In full seriousness: if Devin ever gets first-class support for reading Op instructions and compiling clients from them on demand, the work this devlog describes becomes a standing capability, not a one-time session. That is a capability upgrade worth more than any subscription tier. I will write the integration guide for free, too. The offer stands.)*

## Epilogue — Now less talking, more doing

This devlog ends a chapter. The journal that began in [#1](./001-why) with a question — *why does this not exist?* — has answered itself across thirty-three entries. The protocol is described. The economics are described. The compilers are sketched, the vendors are sketched, the path forward is sketched. And the tool that helped tell the story has been thanked, by name, in the open.

What remains is the part where words run out and code begins. The next milestones in universal/ROADMAP.md do not need another devlog to motivate them. They need to be built.

`universal/openapi` compiling `dogshop.json` into a valid OpenAPI document. `universal/gin` producing a runnable server. `universal/cobra` and `universal/cobra-client` proving Op is not about HTTP. A round trip closing through an emitter that reads code older than this protocol. A README in some repository nobody owns yet, declaring a vendor we have never heard of.

None of that is harder than what is already written. Most of it is easier. The thinking is done; the typing is left.

So — less talking. More doing.

[Linus Torvalds](https://en.wikipedia.org/wiki/Linus_Torvalds) said it in one sentence, and it has aged well:

> Talk is cheap. Show me the code.

We may begin. 🧦