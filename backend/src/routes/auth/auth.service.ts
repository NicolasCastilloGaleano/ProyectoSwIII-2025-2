import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@data/constants';
import { formatDate } from '@utils/date';
import { UserData } from './auth.interface';

export const getUserFromToken = async (uid: string): Promise<UserData> => {
  const db = admin.firestore();
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
