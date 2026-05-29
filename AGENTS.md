# Agents

- Ensure that you're using the correct Effect primitives. Always refer to [the Effect source
  code][./repos/effect](./repos/effect).
- If you run into any library/environment/tool confusion, various (likely-relevant) repos are mounted at ./repos –– grep
  through the source.

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

## TIPS

- If you see a type error related to stable type ordering, run `pnpm clean && pnpm i && pnpm build`.
