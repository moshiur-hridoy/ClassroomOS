export type Role = "admin" | "manager" | "stockholder"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  branchId?: string
}

export const demoUsers: Record<Role, User> = {
  admin: {
    id: "u-admin",
    name: "Admin",
    email: "admin@classroomos.com",
    role: "admin",
  },
  manager: {
    id: "u-manager",
    name: "Branch Manager",
    email: "sarah@classroomos.com",
    role: "manager",
    branchId: "b1",
  },
  stockholder: {
    id: "u-stockholder",
    name: "Stockholder",
    email: "mike@classroomos.com",
    role: "stockholder",
  },
}

export type Feature =
  | "branches"
  | "batches"
  | "holidays"
  | "planner"
  | "attendance"
  | "stockholderDashboard"

export type Permission = "create" | "read" | "update" | "delete"

export function can(user: User | null, feature: Feature, action: Permission, resourceBranchId?: string) {
  if (!user) return false
  switch (user.role) {
    case "admin":
      return true
    case "manager": {
      const own = user.branchId && resourceBranchId && user.branchId === resourceBranchId
      switch (feature) {
        case "branches":
          return action === "update" && own
        case "batches":
        case "planner":
        case "attendance":
          return own && (action === "create" || action === "read" || action === "update" || action === "delete")
        case "holidays":
        case "stockholderDashboard":
          return action === "read"
        default:
          return false
      }
    }
    case "stockholder":
      return action === "read"
    default:
      return false
  }
}


