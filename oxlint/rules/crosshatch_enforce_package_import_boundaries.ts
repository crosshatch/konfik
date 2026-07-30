import Fs from "node:fs"
import Path from "node:path"
import { fileURLToPath } from "node:url"

import type { Context, ESTree, Rule } from "@oxlint/plugins"

type Boundary = {
  readonly directory: string
  readonly entryPoint: string
}

type PackageInfo = {
  readonly boundaries: ReadonlyArray<Boundary>
  readonly directory: string
  readonly rootEntryPoint: string | undefined
}

const packageInfoByDirectory = new Map<string, PackageInfo | null>()

const normalizePath = (value: string) => (value.startsWith("file://") ? fileURLToPath(value) : value)

const exportTarget = (value: unknown): string | undefined => {
  if (typeof value === "string") return value
  if (value === null || typeof value !== "object") return undefined
  for (const condition of ["types", "import", "default"]) {
    const target = exportTarget(Reflect.get(value, condition))
    if (target !== undefined) return target
  }
  return undefined
}

const packageInfoFromJson = (directory: string, exports: object): PackageInfo => {
  const entries = Object.entries(exports)
  const rootEntryPoint = exportTarget(Reflect.get(exports, "."))
  const boundaries = entries.flatMap(([name, value]) => {
    if (name === "." || name.includes("*") || name === "./package.json") return []
    const target = exportTarget(value)
    if (target === undefined || !target.endsWith(".ts")) return []
    const entryPoint = Path.resolve(directory, target)
    return [{ directory: Path.dirname(entryPoint), entryPoint }]
  })
  return {
    boundaries,
    directory,
    rootEntryPoint: rootEntryPoint === undefined ? undefined : Path.resolve(directory, rootEntryPoint),
  }
}

const findPackageInfo = (context: Context): PackageInfo | null => {
  const cwd = normalizePath(context.cwd)
  let directory = Path.dirname(normalizePath(context.filename))
  const { root } = Path.parse(cwd)
  while (directory !== root) {
    const cached = packageInfoByDirectory.get(directory)
    if (cached !== undefined && cached !== null) return cached
    const packageJsonPath = Path.join(directory, "package.json")
    if (Fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(Fs.readFileSync(packageJsonPath, "utf8")) as { readonly exports?: unknown }
      if (packageJson.exports !== null && typeof packageJson.exports === "object") {
        const packageInfo = packageInfoFromJson(directory, packageJson.exports)
        packageInfoByDirectory.set(directory, packageInfo)
        return packageInfo
      }
    }
    packageInfoByDirectory.set(directory, null)
    if (directory === cwd) return null
    directory = Path.dirname(directory)
  }
  return null
}

const containingBoundary = (boundaries: ReadonlyArray<Boundary>, filename: string) =>
  boundaries
    .filter(({ directory }) => filename.startsWith(`${directory}${Path.sep}`))
    .toSorted((left, right) => right.directory.length - left.directory.length)[0]

export const crosshatchEnforcePackageImportBoundaries: Rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require relative imports to cross package module boundaries through public entry points.",
    },
    messages: {
      directoryEntryPoint: "Import from the '{{ directory }}' public entry point instead of an internal module.",
      rootEntryPoint: "Import root modules through the package root entry point.",
    },
    schema: [],
  },
  create: (context) => {
    const packageInfo = findPackageInfo(context)
    if (packageInfo === null) return {}
    const filename = normalizePath(context.filename)
    const importerBoundary = containingBoundary(packageInfo.boundaries, filename)

    const checkSource = (source: ESTree.StringLiteral | null) => {
      if (source === null || !source.value.startsWith(".")) return
      const importedFile = Path.resolve(Path.dirname(filename), source.value)
      const importedBoundary = containingBoundary(packageInfo.boundaries, importedFile)

      if (importedBoundary !== undefined && importedBoundary.directory !== importerBoundary?.directory) {
        if (importedFile === importedBoundary.entryPoint) return
        context.report({
          node: source,
          messageId: "directoryEntryPoint",
          data: { directory: Path.relative(packageInfo.directory, importedBoundary.directory) },
        })
        return
      }

      const isRootModule = Path.dirname(importedFile) === packageInfo.directory && importedFile.endsWith(".ts")
      if (importerBoundary !== undefined && isRootModule && importedFile !== packageInfo.rootEntryPoint) {
        context.report({ node: source, messageId: "rootEntryPoint" })
      }
    }

    return {
      ExportAllDeclaration: (node) => checkSource(node.source),
      ExportNamedDeclaration: (node) => checkSource(node.source),
      ImportDeclaration: (node) => checkSource(node.source),
    }
  },
}
