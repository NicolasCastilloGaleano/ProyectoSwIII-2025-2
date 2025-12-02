import { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import { DEFAULT_ROLE, ROLE_PERMISSIONS, type Permission } from "@data/permissions";
import { UserDoc, UserRole } from "@routes/users/users.interface";
import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";

interface DecodedToken extends admin.auth.DecodedIdToken {
  uid: string;
  role?: string;
}

export interface AuthUserContext {
  uid: string;
  role: UserRole;
  roles: UserRole[];
  permissions: Permission[];
  userDoc?: (UserDoc & { id: string }) | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      authUser?: AuthUserContext;
    }
  }
}

const AUTH_CACHE_MS = Number(process.env.AUTH_CONTEXT_CACHE_MS ?? 5 * 60 * 1000);

const authContextCache = new Map<string, { ctx: AuthUserContext; expiresAt: number }>();

function normalizeRole(role?: string | null): UserRole {
  if (!role) return DEFAULT_ROLE;
  const upper = role.toUpperCase();
  return Object.values(UserRole).includes(upper as UserRole)
    ? (upper as UserRole)
    : DEFAULT_ROLE;
}

function resolveRoles(rawRoles: unknown, fallback: UserRole): UserRole[] {
  const roles = new Set<UserRole>();
  if (Array.isArray(rawRoles)) {
    rawRoles.forEach((r) => roles.add(normalizeRole(String(r))));
  }
  roles.add(fallback);
  return Array.from(roles);
}

function resolvePermissions(roles: UserRole[]): Permission[] {
  const perms = new Set<Permission>();
  roles.forEach((role) => {
    ROLE_PERMISSIONS[role]?.forEach((p) => perms.add(p));
  });
  return Array.from(perms);
}

async function loadAuthContext(uid: string): Promise<AuthUserContext> {
  const now = Date.now();
  const cached = authContextCache.get(uid);
  if (cached && cached.expiresAt > now) {
    return cached.ctx;
  }

  const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const doc = snap.exists
    ? ({ id: snap.id, ...(snap.data() as UserDoc) } as UserDoc & { id: string })
    : null;

  const primaryRole = doc?.role ?? DEFAULT_ROLE;
  const roles = resolveRoles(doc?.roles, normalizeRole(primaryRole));
  const permissions = resolvePermissions(roles);

  const ctx: AuthUserContext = {
    uid,
    role: normalizeRole(primaryRole),
    roles,
    permissions,
    userDoc: doc,
  };

  authContextCache.set(uid, { ctx, expiresAt: now + AUTH_CACHE_MS });
  return ctx;
}

export function invalidateAuthContext(uid: string) {
  authContextCache.delete(uid);
}

/**
 * Middleware de autenticación Firebase.
 * Verifica el token Bearer, expone el usuario decodificado y el contexto de permisos.
 * Retorna 401 ante cualquier ausencia o error de validación.
 */
const verifyFirebaseJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = (await admin.auth().verifyIdToken(
      idToken,
    )) as DecodedToken;

    const authContext = await loadAuthContext(decodedToken.uid);

    req.user = decodedToken;
    res.locals.user = decodedToken;
    req.authUser = authContext;
    res.locals.authUser = authContext;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[verifyFirebaseJwt] UID:",
        decodedToken.uid,
        "Role:",
        decodedToken.role,
        "Resolved role:",
        authContext.role,
        "Auth emulator:",
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST,
      );
    }

    return next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ error: "Token invǭlido o expirado" });
  }
};

export function hasPermission(authUser: AuthUserContext | undefined, permission: Permission): boolean {
  if (!authUser) return false;
  return authUser.permissions.includes(permission);
}

export function requirePermission(
  permissions: Permission | Permission[],
  options?: {
    allowSelf?: boolean;
    resourceResolver?: (req: Request) => string | undefined;
    allowRoles?: UserRole[];
  },
) {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = req.authUser;
    if (!ctx) return res.status(401).json({ error: "No autorizado" });

    const allowRoles = options?.allowRoles ?? [];
    if (allowRoles.some((role) => ctx.roles.includes(role))) {
      return next();
    }

    const isSelf =
      options?.allowSelf && options.resourceResolver
        ? options.resourceResolver(req) === ctx.uid
        : false;

    const canSelf =
      isSelf &&
      required.some(
        (perm) =>
          ctx.permissions.includes(perm) ||
          ctx.permissions.includes(perm.replace(":any", ":self") as Permission),
      );

    if (canSelf) return next();

    const allowed = required.some((perm) => ctx.permissions.includes(perm));
    if (!allowed) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    return next();
  };
}

export default verifyFirebaseJwt;
