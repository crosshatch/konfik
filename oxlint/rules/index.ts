import { crosshatchEnforcePackageImportBoundaries } from "./crosshatch_enforce_package_import_boundaries.ts"
import { noPackageSelfImport } from "./no_package_self_import.ts"
import { requireEffectAllExplicitConcurrency } from "./require_effect_all_explicit_concurrency.ts"
import { requireReadonlyTypeMembers } from "./require_readonly_type_members.ts"

export default {
  meta: { name: "custom" },
  rules: {
    "crosshatch-enforce-package-import-boundaries": crosshatchEnforcePackageImportBoundaries,
    "no-package-self-import": noPackageSelfImport,
    "require-effect-all-explicit-concurrency": requireEffectAllExplicitConcurrency,
    "require-readonly-type-members": requireReadonlyTypeMembers,
  },
}
