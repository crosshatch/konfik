import type { Rule } from "@oxlint/plugins"

export const requireEffectAllExplicitConcurrency: Rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require Effect.all calls to specify the optional second argument.",
    },
    messages: {
      missingExplicitConcurrency: "Effect.all must specify its optional second argument.",
    },
    schema: [],
  },
  create: (context) => ({
    CallExpression: (node) => {
      if (
        node.callee.type !== "MemberExpression" ||
        node.callee.computed ||
        node.callee.object.type !== "Identifier" ||
        node.callee.object.name !== "Effect" ||
        node.callee.property.type !== "Identifier" ||
        node.callee.property.name !== "all"
      ) {
        return
      }

      if (node.arguments.length >= 2) return

      context.report({ node, messageId: "missingExplicitConcurrency" })
    },
  }),
}
