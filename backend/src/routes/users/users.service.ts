import { db } from "@config/firebase";
import { COLLECTIONS } from "@data/constants";
import { userConverter } from "./users.converter";
import {
  CreateUserDTO,
  UpdateUserDTO,
  User,
  UserDoc,
  UserRole,
  UserStatus,
} from "./users.interface";

const COL = db.collection(COLLECTIONS.USERS).withConverter(userConverter);

export async function list(): Promise<User[]> {
  const snap = await COL.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function create(data: CreateUserDTO): Promise<{ id: string }> {
  const now = Date.now();
  const toSave: UserDoc = {
    name: data.name,
    email: data.email,
    role: data.role ?? UserRole.USER,
    status: data.status ?? UserStatus.ACTIVE,
    phone: data.phone ?? null,
    photoURL: data.photoURL ?? null,
    createdAt: now,
  };
  const ref = await COL.add(toSave);
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
    ...(data.email !== undefined && { email: data.email }),
    ...(data.role !== undefined && { role: data.role }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.phone !== undefined && { phone: data.phone ?? null }),
    ...(data.photoURL !== undefined && { photoURL: data.photoURL ?? null }),
    updatedAt: Date.now(),
  };
  await COL.doc(id).set(patch, { merge: true });
  return { ok: true };
}

export async function remove(id: string): Promise<{ ok: true }> {
  await COL.doc(id).delete();
  return { ok: true };
}
