import { NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { Command } from "effect/unstable/cli"

import { clean } from "./commands/clean.ts"

Command.make("konfik").pipe(
  Command.withSubcommands([clean]),
  Command.run({ version: "internal" }),
  Effect.provide(NodeServices.layer),
  Effect.runFork,
)
