#34-9 — Universal — Even What Looks Like Knowledge Isn't Yours
I drew a line: real knowledge stays in your manifest, copy-paste leaves. Crude line. Reality is thinner.

Take DATABASE_URL=${DB_URL}. Looks like my knowledge. It isn't. The address of the database is the database's knowledge of itself. My program is just bound to it. Like printf doesn't know "where stdout lives" — it writes to stdout, and the kernel knows where stdout is.

Take resources.limits.memory: 512Mi. Looks like my knowledge. It isn't either. It's a guess from thin air. Every developer on the planet picks the number alone, with no data, hoping it doesn't crash production. The collective experience of every SRE who paid for that number in blood — does not transfer. Because there is no language to transfer it through.

The actual knowledge of my application is much smaller than I thought:

Its name.
The list of operations it does.
Their semantics.
Everything else is either knowledge of other programs (databases, caches, queues), or guesses that should be backed by accumulated industry experience.

In the right future:

Database addresses come from bindings. The database tells the world where it lives, my code does not.
Memory limits come from profiles. capacity/profile: small-stateful — and a compiler maintained by SRE community decides the number. Once. With data. Updated by everyone.
This is the language for transferring infrastructure wisdom that the industry never had. The trait is the name of a profile. The profile is the wisdom. The compiler is the inheritance.