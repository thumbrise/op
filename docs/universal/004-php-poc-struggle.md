#34-4 — Universal — PHP POC Struggle
PHP frameworks are not built for proof-of-concept. They are built for production day one.

Started a small emitter. Wanted to read three Spiral routes and emit JSON. Twenty minutes of work, in a sane world.

Ended up with: composer create-project, app bootstrap, DI container, runtime config, RoadRunner binary download, file permissions on a mounted volume, UID/GID mapping in Dockerfile, delgroup dialout to avoid GID conflicts on macOS, xdebug.ini for IDE step-debugging, env-driven port assignment to avoid hardcoded duplicates across three configs.

Two hours before I wrote a single line of emitter logic.

This is not Spiral's fault. Every PHP framework is like this. Laravel, Symfony, Spiral — all of them assume you are deploying production from minute one. They give you everything. They make you carry everything before you can do anything.

Compare to writing the same thing in Go. go mod init, one file, one main(), build. Nine minutes including download.

This is the exact pain Op solves at protocol level. Not by replacing PHP — by letting the operation declaration live outside the framework. Future PHP projects bootstrap themselves from dogshop.json. The framework adapts to the instruction, not the other way around.

For now I carry the framework weight. The emitter is the apology fee.