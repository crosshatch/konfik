# Agents

- Ensure that you're using the correct Effect primitives. Always refer to [the Effect source
  code][./repos/effect](./repos/effect).
- If you run into any confusion related to the workerd environment or Cloudflare more generally, refer to the following
  source code:
  - [workerd](./repos/workerd)
  - [workers-sdk](./repos/workers-sdk)
  - [agents-sdk](./repos/agents)

## IMPORTANT

- When trying to diagnose incorrect behavior, simply look up the latest traces using the motel skill.
- If you're unable to see information critical to your diagnosis, go ahead and propose some new spanning or logging.
- An ongoing goal of ours is to ensure this repo is instrumented with optimal tracing and logging.

  ```ts
  import * as Spanner from "liminal-util/Spanner"

  const span = Spanner.make(import.meta.url)

  const example1 = Effect.gen(function* () {
    // ...
  }).pipe(span("example-1"))

  const example2 = Effect.fnUntraced(function* () {
    // ...
  }, span("example-2))
  ```

  > This approach ensures that the OTEL traces and logs can be correlated to the source file from which they originate.
