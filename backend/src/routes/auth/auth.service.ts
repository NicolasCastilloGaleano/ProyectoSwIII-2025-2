import { COLLECTIONS } from "@data/constants";
import { formatDate } from "@utils/date";
import * as admin from "firebase-admin";
import { auth, db } from "../../config/firebase";
import { CreateUserDto, UserData } from "./auth.interface";

/**
 * Crea un usuario en Firebase Auth (email/password) y guarda su documento en Firestore.
 */
export const createUser = async (payload: CreateUserDto): Promise<UserData> => {
  try {
    const { email, password } = payload;

    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    const uid = userRecord.uid;

    // Documento para Firestore
    const userDoc = {
      email,
      fechaDeCreacion: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Guardar el documento en Firestore
    await db.collection(COLLECTIONS.USERS).doc(uid).set(userDoc);

    // Normalizar y devolver el usuario creado
    return {
      id: uid,
      uid,
      correo: email,
      fechaDeCreacion: new Date().toISOString(), // O usar un formato específico
    } as UserData;
  } catch (err: any) {
    // Re-lanzar para que el controlador maneje el error adecuadamente
    throw err;
  }
};

export const getUserFromToken = async (uid: string): Promise<UserData> => {
  // const db = admin.firestore();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();

  if (!userDoc.exists) {
    throw new Error("Usuario no encontrado");
  }

  const userData = userDoc.data() as UserData;

  const normalizedUser: UserData = {
    ...userData,
    id: userDoc.id,
    uid: userDoc.id,
    correo: userData.correo || userData.email || "",
    nombre: userData.nombre || userData.name || "",
    roles: Array.isArray(userData.roles) ? userData.roles : [],
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
  };

  return normalizedUser;
};
