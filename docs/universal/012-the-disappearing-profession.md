---
title: "#12 — The Disappearing Profession"
description: "John Ousterhout wrote Raft. He is not an SRE. He is not a distributed-coordination engineer. He is not a site-reliability specialist. He named a form, and the labels in the middle dissolved. 'Highload engineer' is a word of the same class — a name for people holding by hand what the floor above them has not yet been written to hold."
---

# The Disappearing Profession

John Ousterhout wrote Raft. He does not call himself an SRE. He does not call himself a distributed-coordination engineer. He does not call himself a site-reliability specialist. He is a professor. When he writes about Raft, he writes as a researcher of distributed systems.

Why doesn't he carry the labels? Because Raft is a *form*.

After Raft, nobody ships their own Paxos. etcd, Consul, CockroachDB, TiKV, MongoDB — all on Raft. Thousands of engineers who would have been "distributed coordination engineers" without Raft now split cleanly into two groups: authors of Raft implementations, and programmers who just use etcd. The middle dissolved. Not the people. The category.

SRE. Highload engineer. DevOps engineer. Same class of word. Names for people holding by hand what the floor above them has not been written to hold. The work is real. The labels exist because the form is missing.

When the form arrives, the labels go. The people stay — they move into one of two places. Some write the next compiler, the next emitter, the next trait. Their highload knowledge does not evaporate; it becomes the heuristics inside `op-postgres`. Others walk back to being application programmers, no longer holding the basement up by hand.

I haven't been working for half a year. Not because nothing's open. Because almost everything open is *do everything*. The word *backend* now mostly means binding work and reinventing the same eighty percent. JSON in, JSON out, hold the fifty-trigger pistol balanced. I don't want to keep that floor up. I want real work — domain logic, new algorithm implementations, research. So I'm not looking yet. I'm doing research instead.

If Op begins to fragment professions cleanly — compiler-side, application-side, trait-author — every kind of deep knowledge will find a place to land. The worst position will not belong to specialists. It will belong to those who never specialised: programmers whose only skill was holding the whole pistol balanced.

Ousterhout did not invent distributed coordination. He named it. After the naming, the people who knew it kept knowing it — they just stopped being asked to perform it by hand on every team.

Op does not erase professions. It clears the names that exist only because the form is missing.
