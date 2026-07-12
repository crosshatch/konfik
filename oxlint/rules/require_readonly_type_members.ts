import type { Context, ESTree, Rule } from "@oxlint/plugins"

const reportMissingReadonly = (context: Context, node: ESTree.TSIndexSignature | ESTree.TSPropertySignature) => {
  if (node.readonly) return
  context.report({
    node,
    messageId: "missingReadonly",
    fix: (fixer) => fixer.insertTextBeforeRange([node.range[0], node.range[0]], "readonly "),
  })
}

const reportMissingMappedReadonly = (context: Context, node: ESTree.TSMappedType) => {
  if (node.readonly === true || node.readonly === "+") return
  context.report({
    node,
    messageId: "missingReadonly",
    fix: (fixer) => {
      if (node.readonly === "-") {
        const source = context.sourceCode.getText()
        const modifierStart = source.indexOf("-readonly", node.range[0])

        if (modifierStart !== -1 && modifierStart < node.key.range[0]) {
          return fixer.replaceTextRange([modifierStart, modifierStart + "-readonly".length], "readonly")
        }
      }
      const source = context.sourceCode.getText()
      const braceIndex = source.indexOf("{", node.range[0])
      if (braceIndex !== -1 && braceIndex < node.key.range[0]) {
        return fixer.insertTextAfterRange([braceIndex, braceIndex + 1], " readonly")
      }
      return null
    },
  })
}

export const requireReadonlyTypeMembers: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require object type and interface members to be readonly.",
    },
    fixable: "code",
    messages: {
      missingReadonly: "Object type and interface members must be marked readonly.",
    },
    schema: [],
  },
  create: (context) => ({
    TSIndexSignature: (node) => reportMissingReadonly(context, node),
    TSMappedType: (node) => reportMissingMappedReadonly(context, node),
    TSPropertySignature: (node) => reportMissingReadonly(context, node),
  }),
}
