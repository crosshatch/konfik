import { requireReadonlyTypeMembers } from "./require_readonly_type_members.ts"

export default {
  meta: { name: "custom" },
  rules: {
    "require-readonly-type-members": requireReadonlyTypeMembers,
  },
}
