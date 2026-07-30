import { Console, Effect, FileSystem, Path, Array } from "effect"
import { Command } from "effect/unstable/cli"
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process"

export const syncRepos = Command.make("sync-repos").pipe(
  Command.withHandler(
    Effect.fn(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner
      const reposDir = path.join(process.cwd(), "repos")
      const orgs = yield* fs
        .readDirectory(reposDir)
        .pipe(
          Effect.flatMap((entries) =>
            Effect.filter(
              entries,
              (entry) => fs.stat(path.join(reposDir, entry)).pipe(Effect.map((info) => info.type === "Directory")),
              { concurrency: "unbounded" },
            ),
          ),
        )
      const repos = yield* Effect.forEach(
        orgs,
        Effect.fn(function* (org) {
          const orgDir = path.join(reposDir, org)
          const entries = yield* fs.readDirectory(orgDir)
          const repoNames = yield* Effect.filter(
            entries,
            (entry) => fs.stat(path.join(orgDir, entry)).pipe(Effect.map((info) => info.type === "Directory")),
            { concurrency: "unbounded" },
          )
          return repoNames.map((repo) => ({ entry: `${org}/${repo}`, repoDir: path.join(orgDir, repo) }))
        }),
        { concurrency: "unbounded" },
      ).pipe(Effect.map(Array.flatten))
      yield* Effect.forEach(
        repos,
        Effect.fn(function* ({ entry, repoDir }) {
          yield* Console.log(`Syncing "${entry}" (main)`)
          yield* ChildProcess.make`git fetch origin main`.pipe(
            ChildProcess.setCwd(repoDir),
            spawner.exitCode,
            Effect.filterOrFail(
              (exitCode) => exitCode === 0,
              () => new Error(`Failed to fetch "${entry}"`),
            ),
            Effect.orDie,
          )
          yield* ChildProcess.make`git switch -C main origin/main`.pipe(
            ChildProcess.setCwd(repoDir),
            spawner.exitCode,
            Effect.filterOrFail(
              (exitCode) => exitCode === 0,
              () => new Error(`Failed to switch "${entry}" to main`),
            ),
            Effect.orDie,
          )
          yield* Console.log(`Synced "${entry}" (main)`)
        }),
        { concurrency: "unbounded" },
      )
    }),
  ),
)
