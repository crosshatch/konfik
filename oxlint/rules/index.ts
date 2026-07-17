import { noPackageSelfImport } from "./no_package_self_import.ts"
import { requireReadonlyTypeMembers } from "./require_readonly_type_members.ts"

export default {
  meta: { name: "custom" },
  rules: {
    "no-package-self-import": noPackageSelfImport,
    "require-readonly-type-members": requireReadonlyTypeMembers,
  },
}
