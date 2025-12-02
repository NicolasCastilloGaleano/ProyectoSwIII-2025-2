import { COLLECTIONS } from "@data/constants";
import { ROLE_PERMISSIONS } from "@data/permissions";
import { formatDate } from "@utils/date";
import { auth, db } from "../../config/firebase";
import { buildSearchMetadata } from "../users/users.service";
import { UserRole, UserStatus } from "../users/users.interface";
import { CreateUserDto, UserData } from "./auth.interface";

/**
 * Crea un usuario en Firebase Auth (email/password) y guarda su documento en Firestore.
 */
export const createUser = async (payload: CreateUserDto): Promise<UserData> => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPassword = payload.password.trim();
  const normalizedName = payload.name.trim();
  const normalizedPhoneDigits = (payload.phone ?? "")
    .replace(/[^\d+]/g, "")
    .trim();
  const normalizedPhone =
    normalizedPhoneDigits.length > 0 ? normalizedPhoneDigits : null;
  const targetRole = payload.role ?? UserRole.USER;
  const targetStatus = payload.status ?? UserStatus.ACTIVE;
  const normalizedAccent = (() => {
    const raw = payload.accentColor?.trim();
    if (!raw) return null;
    return raw.toUpperCase();
  })();
  const searchMeta = buildSearchMetadata(normalizedName);
  const timestamps = Date.now();

  const userRecord = await auth.createUser({
    email: normalizedEmail,
    password: normalizedPassword,
  });

  const uid = userRecord.uid;
  const userDoc = {
    name: normalizedName,
    email: normalizedEmail,
    correo: normalizedEmail,
    role: targetRole,
    roles: [targetRole],
    status: targetStatus,
    phone: normalizedPhone ?? null,
    celular: normalizedPhone ?? undefined,
    accentColor: normalizedAccent,
    photoURL: null,
    createdAt: timestamps,
    updatedAt: timestamps,
    fechaDeCreacion: new Date(timestamps).toISOString(),
    ...searchMeta,
  };

  try {
    await db.collection(COLLECTIONS.USERS).doc(uid).set(userDoc);
  } catch (error) {
    await auth.deleteUser(uid).catch((deleteErr) =>
      console.error("No se pudo revertir la creación de Auth:", deleteErr),
    );
    throw error;
  }

  return {
    ...userDoc,
    id: uid,
    uid,
  } as UserData;
};

export const getUserFromToken = async (uid: string): Promise<UserData> => {
  // const db = admin.firestore();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();

  if (!userDoc.exists) {
    throw new Error("Usuario no encontrado");
  }

  const userData = userDoc.data() as UserData;

  const primaryRole = (userData.role as string | undefined) ?? UserRole.USER;
  const roles = (() => {
    const base =
      Array.isArray(userData.roles) && userData.roles.length > 0
        ? userData.roles
        : [primaryRole];
    return Array.from(new Set(base.map((r) => r?.toString().toUpperCase())));
  })();

  const normalizedUser: UserData = {
    ...userData,
    id: userDoc.id,
    uid: userDoc.id,
    correo: userData.correo || userData.email || "",
    name: userData.name || userData.name || "",
    role: primaryRole,
    roles,
    tipo: userData.tipo,
    celular: userData.celular,
    ciudad: userData.ciudad,
    departamento: userData.departamento,
    pais: userData.pais,
    direccion: userData.direccion,
    documento: userData.documento,
    documentoTipo: userData.documentoTipo,
    fechaDeCreacion: formatDate(userData.fechaDeCreacion),
    creadoPor: userData.creadoPor,
    creadoPorNombre: userData.creadoPorNombre,
    responsable: userData.responsable,
    responsableNombre: userData.responsableNombre,
    logoURL: userData.logoURL,
    permissions: (() => {
      const perms = new Set<string>();
      roles.forEach((r) => {
        const upper = r.toUpperCase() as UserRole;
        ROLE_PERMISSIONS[upper]?.forEach((p) => perms.add(p));
      });
      if (perms.size === 0) {
        ROLE_PERMISSIONS[UserRole.USER]?.forEach((p) => perms.add(p));
      }
      return Array.from(perms);
    })(),
  };

  return normalizedUser;
};
