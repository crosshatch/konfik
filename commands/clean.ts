import { FileSystem, Path, Console, Effect } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import { glob } from "node:fs/promises"

export const clean = Command.make("clean", {
  ignore: Flag.string("ignore").pipe(Flag.atLeast(0)),
}).pipe(
  Command.withHandler(
    Effect.fnUntraced(function* ({ ignore }) {
      const packages = yield* Effect.promise(() => Array.fromAsync(glob("**/package.json"))).pipe(
        Effect.map((v) => v.filter((v) => !ignore.some((w) => v.startsWith(w)))),
      )
      yield* Effect.all(
        packages.map(
          Effect.fn(function* (packageJsonPath: string) {
            const path = yield* Path.Path
            const fs = yield* FileSystem.FileSystem
            const dir = packageJsonPath.split("package.json").shift() ?? ""
            yield* Console.log(`Cleaning "${dir}"`)
            yield* Effect.all(
              [".tsbuildinfo", "dist", "node_modules", ".tanstack", ".turbo"].map((v) =>
                fs.remove(path.join(dir, v), {
                  recursive: true,
                  force: true,
                }),
              ),
              { concurrency: "unbounded" },
            )
          }),
        ),
        { concurrency: "unbounded" },
      )
    }),
  ),
)
