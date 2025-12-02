import { UserRole } from "@routes/users/users.interface";

export type Permission =
  | "users:read:self"
  | "users:read:any"
  | "users:write:self"
  | "users:write:any"
  | "users:create"
  | "users:delete:any"
  | "moods:read:self"
  | "moods:read:any"
  | "moods:write:self"
  | "moods:write:any"
  | "reports:view:self"
  | "reports:view:any"
  | "reports:generate"
  | "events:read"
  | "events:interact"
  | "events:manage"
  | "permissions:manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    "users:read:self",
    "users:write:self",
    "moods:read:self",
    "moods:write:self",
    "reports:view:self",
    "events:read",
    "events:interact",
  ],
  [UserRole.STAFF]: [
    "users:read:self",
    "users:write:self",
    "moods:read:self",
    "moods:write:self",
    "reports:view:self",
    "events:read",
    "events:interact",
    "users:read:any",
    "users:write:any",
    "moods:read:any",
    "reports:view:any",
    "reports:generate",
    "events:manage",
  ],
  [UserRole.ADMIN]: [
    "users:read:self",
    "users:write:self",
    "moods:read:self",
    "moods:write:self",
    "reports:view:self",
    "events:read",
    "events:interact",
    "users:read:any",
    "users:write:any",
    "users:create",
    "users:delete:any",
    "moods:read:any",
    "moods:write:any",
    "reports:view:any",
    "reports:generate",
    "events:manage",
    "permissions:manage",
  ],
};

export const DEFAULT_ROLE = UserRole.USER;
