import { FileSystem, Path, Console, Effect } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import { glob } from "node:fs/promises"

export const clean = Command.make("clean", {
  ignore: Flag.string("ignore").pipe(Flag.atLeast(0)),
}).pipe(
  Command.withHandler(
    Effect.fn(function* ({ ignore }) {
      const packages = yield* Effect.promise(() => Array.fromAsync(glob("**/package.json", { exclude: ignore })))
      const path = yield* Path.Path
      const fs = yield* FileSystem.FileSystem
      yield* Effect.all(
        packages.map(
          Effect.fn(function* (packageJsonPath: string) {
            const dir = path.dirname(packageJsonPath)
            yield* Console.log(`Cleaning "${dir}"`)
            yield* Effect.all(
              ["tsconfig.tsbuildinfo", "dist", "node_modules", ".tanstack", ".turbo"].map((v) =>
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
