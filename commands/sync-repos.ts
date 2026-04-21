import { Console, Effect, FileSystem, Path, String } from "effect"
import { Command } from "effect/unstable/cli"
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process"

export const syncRepos = Command.make("sync-repos").pipe(
  Command.withHandler(
    Effect.fn(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner
      const reposDir = path.join(process.cwd(), "repos")
      const entries = yield* fs.readDirectory(reposDir)
      const repos = yield* Effect.filter(
        entries,
        (entry) => fs.stat(path.join(reposDir, entry)).pipe(Effect.map((info) => info.type === "Directory")),
        { concurrency: "unbounded" },
      )
      yield* Effect.forEach(
        repos,
        Effect.fn(function* (entry: string) {
          const repoDir = path.join(reposDir, entry)
          const branch = yield* ChildProcess.make`git rev-parse --abbrev-ref HEAD`.pipe(
            ChildProcess.setCwd(repoDir),
            spawner.string,
            Effect.map(String.trim),
          )
          yield* Console.log(`Syncing "${entry}" (${branch})`)
          yield* ChildProcess.make`git pull origin ${branch}`.pipe(ChildProcess.setCwd(repoDir), spawner.exitCode)
        }),
        { concurrency: "unbounded" },
      )
    }),
  ),
)
