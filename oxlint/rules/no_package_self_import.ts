import Fs from "node:fs"
import Path from "node:path"
import { fileURLToPath } from "node:url"

import type { Context, ESTree, Rule } from "@oxlint/plugins"

type PackageInfo = {
  readonly directory: string
  readonly name: string
}

const packageInfoByDirectory = new Map<string, PackageInfo | null>()

const normalizePath = (value: string) => (value.startsWith("file://") ? fileURLToPath(value) : value)

const findPackageInfo = (context: Context): PackageInfo | null => {
  const cwd = normalizePath(context.cwd)
  let directory = Path.dirname(normalizePath(context.filename))
  const { root } = Path.parse(cwd)
  while (directory !== root) {
    const cached = packageInfoByDirectory.get(directory)
    if (cached) return cached
    const packageJsonPath = Path.join(directory, "package.json")
    if (Fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(Fs.readFileSync(packageJsonPath, "utf8")) as { readonly name?: unknown }
      const packageInfo = typeof packageJson.name === "string" ? { directory, name: packageJson.name } : null
      packageInfoByDirectory.set(directory, packageInfo)
      if (packageInfo !== null) return packageInfo
    } else {
      packageInfoByDirectory.set(directory, null)
    }
    if (directory === cwd) return null
    directory = Path.dirname(directory)
  }
  return null
}

export const noPackageSelfImport: Rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow importing a package by name from within that same package.",
    },
    messages: {
      packageSelfImport: "Do not import '{{ packageName }}' from within itself. Use relative imports instead.",
    },
    schema: [],
  },
  create: (context) => {
    const packageInfo = findPackageInfo(context)
    if (packageInfo === null) return {}

    const checkSource = (source: ESTree.StringLiteral | null) => {
      if (source === null) return
      if (source.value !== packageInfo.name && !source.value.startsWith(`${packageInfo.name}/`)) return

      context.report({
        node: source,
        messageId: "packageSelfImport",
        data: { packageName: packageInfo.name },
      })
    }

    return {
      ExportAllDeclaration: (node) => checkSource(node.source),
      ExportNamedDeclaration: (node) => checkSource(node.source),
      ImportDeclaration: (node) => checkSource(node.source),
    }
  },
}
