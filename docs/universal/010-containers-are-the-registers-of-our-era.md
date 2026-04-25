#34-10 — Universal — Containers Are the Registers of Our Era
Two parallel observations. They are the same observation seen from two angles.

Angle one: the metal. IP addresses and containers are the registers and assembly of our era. Finite resource pool, manual management, named by hand, moved by hand. Kubernetes is the well-designed assembler for this layer. It is correct for its layer. The error is not k8s. The error is that application programmers look into k8s manifests, the way it would be wrong for an application programmer to write inline assembly in every function.

When higher-level languages came in the 1970s, registers stopped being something programmers thought about. They didn't disappear — the compiler distributes them. They became implementation detail.

When the operation-language stabilizes, containers and IP will stop being something application programmers think about. DevOps will keep managing them, the way compiler engineers keep writing back-ends for CPU architectures. Application programmers will see only the operation.

Angle two: the philosophy. What comes first — the operation, or the infrastructure that supports it?

In the real world: a baker wants to bake bread. The shop comes later, to serve the wanting. The cash register comes later still, to serve the shop. Tax law comes later still. The chain runs in one direction only — from desire to support. Kill the desire and the support collapses.

In modern web: we build kubernetes first. We arrange the network first. We write helm charts first. We set up observability first. Then, on the eighty-seventh layer up, the operation finally appears. The operation that was the entire point.

This is causality inverted. The shop built before anyone wanted bread. Each team builds their own copy of the shop, knowing it takes six months, accepting it as "normal."

Op restores the order. Operation is declared first — the desire. The compiler emits the infrastructure under it — the support. If the operation changes, the infrastructure rebuilds. Because it was never primary. It existed for the operation, not before it.

DevOps doesn't lose their job. They get it back at the right level. They write the compiler, once, for everyone — the way Linus writes the kernel, once, for everyone. No one calls them anymore. Because no one needs to.