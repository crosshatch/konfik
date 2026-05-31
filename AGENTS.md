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
  import * as Boundary from "liminal-util/Boundary"

  const example1 = Effect.gen(function* () {
    // ...
  }).pipe(Boundary.span("example-1", import.meta.url))

  const example2 = Effect.fnUntraced(
    function* () {
      // ...
    },
    Boundary.span("example-2", import.meta.url),
  )
  ```

  > This approach ensures that the OTEL traces and logs can be correlated to the source file from which they originate.

## TIPS

- If you see a type error related to stable type ordering, run `pnpm clean && pnpm i && pnpm build`.
