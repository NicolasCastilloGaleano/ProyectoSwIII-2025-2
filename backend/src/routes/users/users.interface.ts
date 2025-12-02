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
  roles?: UserRole[];
  status: UserStatus;
  phone?: string | null;
  photoURL?: string | null;
  accentColor?: string | null;
  /**
   * Campo auxiliar para búsquedas case-insensitive.
   * Se almacena en minúsculas y sin acentos.
   */
  searchableName?: string;
  /**
   * Lista de prefijos normalizados usados para filtrar por nombre.
   */
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
export interface CreateUserDTO {
  name: string;
  email: string;
  role?: UserRole; // default: USER
  status?: UserStatus; // default: ACTIVE
  phone?: string | null;
  photoURL?: string | null;
  accentColor?: string | null;
}

export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string | null;
  photoURL?: string | null;
  accentColor?: string | null;
}

export interface ListUsersFilters {
  /** Texto que puede ser nombre o id. */
  search?: string;
  /** Identificador directo cuando el usuario lo especifica. */
  id?: string;
  /** Alias para mantener compatibilidad con query ?name= */
  name?: string;
  status?: UserStatus;
  limit?: number;
}
