import { NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { Command } from "effect/unstable/cli"

import { clean } from "./commands/clean.ts"
import { syncRepos } from "./commands/sync-repos.ts"

Command.make("konfik").pipe(
  Command.withSubcommands([clean, syncRepos]),
  Command.run({ version: "internal" }),
  Effect.provide(NodeServices.layer),
  Effect.runFork,
)
