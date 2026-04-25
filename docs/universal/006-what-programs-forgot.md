#34-6 — Universal — What Programs Forgot
Programs talk to other programs. That is the original task. 1969, ARPANET. 1971, FTP. Two programs, one wants to call the other, get an answer.

That is all the problem ever was.

What we built around it: TCP, HTTP, REST, JSON, OpenAPI, JSON Schema, Protobuf, gRPC, GraphQL, OAuth, CORS, WebSocket, MQTT, Kafka. Each layer real, each layer added by good engineers solving a real problem.

But somewhere along the road we forgot what we were doing. A programmer writing POST /api/v2/dogs/buy in 2026 has to know HTTP, REST, JSON serialization, headers, status codes, retries, TLS, connection pools, error mapping. None of those have anything to do with buying a dog.

Fifty years of engineering became a thick wall between the programmer and the dog.

Op does not delete the layers. It pushes them down, where they belong. go-http-client knows TLS. op-retry knows 429. op-cache knows freshness. Each layer keeps doing its job. The programmer sees only op(BuyDog, ...) and a return value.

printf did not abolish assembly. It just stopped programmers from writing assembly every time they needed to print a string.

Op does not abolish HTTP. It stops programmers from writing HTTP every time program A wants to call program B.

We remembered the original task.