export type UserId = string;

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

// Estructura almacenada en Firestore (sin el id del doc)
export interface UserDoc {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  photoURL?: string | null;
  accentColor?: string | null;
  searchableName?: string;
  searchTokens?: string[];

  // Timestamps
  createdAt: number; // Date.now()
  updatedAt?: number;
}

// Lo que regresa tu API al cliente (incluye id)
export interface User extends UserDoc {
  id: UserId;
}

// DTOs de entrada (lo que aceptan los endpoints)
export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string | null;
  photoURL?: string | null;
  accentColor?: string | null;
}
