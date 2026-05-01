---
title: "#24 — Banana"
description: "A banana doesn't think about who will pick it. The earth's surface doesn't want to be convenient for banana transport. The ocean doesn't care what crosses it."
---

# Banana

A banana doesn't think about who will pick it. The earth's surface doesn't want to be convenient for banana transport. The ocean doesn't care what crosses it.

## ANSI

Nobody sat down and invented writing in one go. First there was sound. Then someone decided that *this* sound was "A". That was the first agreement. Alphabets, printing presses, the telegraph - every step was just a new agreement about how to represent meaning. Then machines arrived, and suddenly the problem got a lot worse.

A machine doesn't understand anything. It gets an electric signal - zero or one. That's it. To send the letter "A", you have to agree on exactly which sequence of bits means "A". If the sender uses one sequence and the receiver expects another, you get no 'A'. Communication fails completely. This wasn't some theoretical edge case. This was the fundamental problem engineers faced from day one of the computer era.

In 1963, ANSI published ASCII. Seven bits, 128 characters. For the first time, machines had a shared language. Joe Becker, one of the creators of Unicode, later wrote that ASCII was the greatest standard of all time - but it only spoke English. There was no room for the rest of the world. So in the 80s and 90s, the encoding wars began. IBM made CP437. Microsoft made Windows-1251 for Cyrillic, 1252 for Western Europe. Russia used KOI8-R. The exact same byte - 223 - meant "Я" in Moscow and "ß" in Berlin.

Ever seen a program display gibberish? That's not a bug. That's someone else's agreement, and your program never learned it.

## Unicode

In 1991, Lee Collins, Mark Davis, and Joe Becker founded the Unicode Consortium. Simple idea: every character on Earth gets a unique number. But how do you transmit that number without breaking all the software already out there? Respect for what existed mattered more than revolution. You couldn't just order the world to rewrite everything. 

## UTF-8

In 1992, Ken Thompson and Rob Pike came up with UTF-8. They supposedly sketched it on a napkin in a diner. Old ASCII programs simply didn't notice the extra bytes. New stuff worked. Old stuff survived. Two alien worlds met without a common language.

Nice. What's the catch? We still haven't agreed on how to buy a banana. 

## Banana Shop

You click a button. One program says to another: "Sell me this banana." But one side expects REST and JSON, the other only understands gRPC and binary protobuf. One checks the request's passport against a JSON schema, the other against a protobuf contract. The operation itself hasn't changed. Does the meaning of buying a banana depend on how the data was packed or which wire it travelled? No. But the program written for JSON doesn't understand protobuf. You end up manually interpreting other people's formats, other people's protocols, other people's verification rules.

Do you only know CLI programming? Forget it. The banana shop application doesn't care about your problems. Now, write HTTP bindings yourself.

Imagine having to write an implementation of this, in every single program, just to display text:

```go
func InterpretUnicode(raw []byte) (string, error)
```

You wouldn't write programs. You'd write interpreters for other people's encodings.

Because N programs = N opinions.

## Banana Need

Now picture a banana farmer. He's good at his job. Bananas hang on the tree. A banana doesn't think about who will pick it. The earth's surface doesn't want to be convenient for banana transport. The ocean doesn't care what crosses it. All of this is just the environment. It simply is.

But the world around the banana decided that it should reach a village on the far side of the continent. And the ecosystem did what it always does. On land, trucking companies figured out standard containers. Malcolm McLean, who started with trucks before buying a shipping company, applied that same standard-container thinking to the sea. Nobody ordered anyone to adopt containers. But a competitor who used them could ship more, and cheaper. Resistance became pointless. The agreement became a standard before anyone put the word on a document. They gave it a name later, just to make talking easier.

The banana just hangs there.

Ocean freight companies don't pick bananas. They move containers. Tomorrow the container might hold coconuts instead of bananas - the ship won't notice. A farmer forced to sail his own bananas across the ocean doesn't become a sailor. He leaves for a buyer who provides transport. He forgets the old company like a bad dream and gets on with his life.

The banana hasn't changed. The environment adapted around it. Bananas still don't know about any of these optimisations. They just hang on the tree. A coconut doesn't compare itself to a banana, and someone who needs bananas ignores coconuts entirely.

## Banana Economic

Nobody held a summit. Nobody issued a decree. Economics isn't money - it's gravity. It doesn't ask. Each new participant sees a competitor offering more for less because they aren't busy fighting the ocean or reinventing the container for every new fruit. With each new participant, the agreement becomes more standard. They start calling it a standard long before that word appears in any document. They give it a name just to make it easier to talk about - not to create something, but to mark what's already working.

## UTF-8 Bananization

Then in 1992, two engineers sketched UTF-8 on a napkin. They didn't force the world to rewrite software. No committee. No revolution. They just found a way to represent universal characters so that old programs wouldn't even notice. The new worked. The old survived. Today UTF-8 is a standard. Not because someone ordered it. Because resistance lost its meaning. The ecosystem adapted. Gravity did its work. They gave it a name later.

## Banana Treaty

Treaty of characters, done. Treaty of operations? Never happened. Could there be a minimal contract that lets programs understand each other at the level of what an operation is - leaving opinions about transport, format, and environment to communities and vendors? No revolution. No decree. Just another adaptation that will get its name one day.

---

The banana just hangs there.