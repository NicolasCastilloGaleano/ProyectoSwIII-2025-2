import { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import type {
  CollectionReference,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { invalidateAuthContext } from "@middlewares/verifyFirebaseJwt";
import { userConverter } from "./users.converter";
import {
  CreateUserDTO,
  ListUsersFilters,
  UpdateUserDTO,
  User,
  UserDoc,
  UserRole,
  UserStatus,
} from "./users.interface";

const LIMITS = {
  DEFAULT: 50,
  MIN: 5,
  MAX: 100,
};

const FALLBACK_SCAN = 120;

const COL = db.collection(COLLECTIONS.USERS).withConverter(userConverter);

type UsersQuery = Query<UserDoc> | CollectionReference<UserDoc>;

function docToUser(doc: QueryDocumentSnapshot<UserDoc>): User {
  return { id: doc.id, ...doc.data() };
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buildSearchMetadata(name: string): {
  searchableName?: string;
  searchTokens?: string[];
} {
  const normalized = normalizeText(name);
  const tokens = new Set<string>();
  if (normalized.length > 0) {
    tokens.add(normalized);
    normalized
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => {
        let prefix = "";
        for (const char of word) {
          prefix += char;
          tokens.add(prefix);
        }
      });
  }
  return {
    searchableName: normalized || undefined,
    searchTokens: tokens.size > 0 ? Array.from(tokens) : undefined,
  };
}

function sanitizeLimit(limit?: number): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) {
    return LIMITS.DEFAULT;
  }
  return Math.max(LIMITS.MIN, Math.min(LIMITS.MAX, Math.floor(limit)));
}

function withStatusFilter(query: UsersQuery, status?: UserStatus): UsersQuery {
  if (!status) return query;
  return query.where("status", "==", status) as UsersQuery;
}

async function fetchById(id: string, status?: UserStatus): Promise<User | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;
  const snap = await COL.doc(cleanId).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data) return null;
  if (status && data.status !== status) return null;
  return { id: snap.id, ...data };
}

async function searchByTokens(
  term: string,
  limit: number,
  status?: UserStatus,
): Promise<User[]> {
  const normalized = normalizeText(term);
  if (!normalized) return [];
  let query = withStatusFilter(COL, status).where(
    "searchTokens",
    "array-contains",
    normalized,
  );
  query = query.limit(limit);
  const snap = await query.get();
  return snap.docs.map(docToUser);
}

async function fallbackSearch(
  term: string,
  limit: number,
  status?: UserStatus,
): Promise<User[]> {
  const normalized = normalizeText(term);
  if (!normalized) return [];
  const sample = await withStatusFilter(COL, status)
    .limit(Math.max(limit, FALLBACK_SCAN))
    .get();
  return sample.docs
    .map(docToUser)
    .filter((user) => normalizeText(user.name).includes(normalized))
    .slice(0, limit);
}

export async function list(filters: ListUsersFilters = {}): Promise<User[]> {
  const limit = sanitizeLimit(filters.limit);
  const status = filters.status;
  const searchText = (filters.search ?? filters.name ?? "").trim();

  if (filters.id) {
    const direct = await fetchById(filters.id, status);
    return direct ? [direct] : [];
  }

  if (searchText) {
    const direct = await fetchById(searchText, status);
    if (direct) return [direct];

    const tokenMatches = await searchByTokens(searchText, limit, status);
    if (tokenMatches.length > 0) return tokenMatches;

    return fallbackSearch(searchText, limit, status);
  }

  const snap = await withStatusFilter(COL, status).limit(limit).get();
  return snap.docs.map(docToUser);
}

export async function create(data: CreateUserDTO): Promise<{ id: string }> {
  const now = Date.now();
  const searchMeta = buildSearchMetadata(data.name);
  const role = data.role ?? UserRole.USER;
  const toSave: UserDoc = {
    name: data.name,
    email: data.email,
    role,
    roles: [role],
    status: data.status ?? UserStatus.ACTIVE,
    phone: data.phone ?? null,
    photoURL: data.photoURL ?? null,
    accentColor: data.accentColor ?? null,
    createdAt: now,
    ...searchMeta,
  };
  const ref = await COL.add(toSave);
  invalidateAuthContext(ref.id);
  return { id: ref.id };
}

export async function getById(id: string): Promise<User> {
  const doc = await COL.doc(id).get();
  if (!doc.exists)
    throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return { id: doc.id, ...doc.data()! };
}

export async function update(
  id: string,
  data: UpdateUserDTO,
): Promise<{ ok: true }> {
  const patch: Partial<UserDoc> = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.role !== undefined && { role: data.role, roles: [data.role] }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.phone !== undefined && { phone: data.phone ?? null }),
    ...(data.photoURL !== undefined && { photoURL: data.photoURL ?? null }),
    ...(data.accentColor !== undefined && {
      accentColor: data.accentColor ?? null,
    }),
    updatedAt: Date.now(),
  };

  if (data.name !== undefined) {
    Object.assign(patch, buildSearchMetadata(data.name));
  }

  await COL.doc(id).set(patch, { merge: true });
  invalidateAuthContext(id);
  return { ok: true };
}

export async function remove(id: string): Promise<{ ok: true }> {
  await COL.doc(id).delete();
  invalidateAuthContext(id);
  return { ok: true };
}
