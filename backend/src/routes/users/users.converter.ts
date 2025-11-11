import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { UserDoc } from "./users.interface";

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(data: UserDoc) {
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): UserDoc {
    const d = snapshot.data();
    return {
      name: d.name,
      email: d.email,
      role: d.role,
      status: d.status,
      phone: d.phone ?? null,
      photoURL: d.photoURL ?? null,
      accentColor: d.accentColor ?? null,
      searchableName: d.searchableName,
      searchTokens: Array.isArray(d.searchTokens) ? d.searchTokens : undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  },
};
