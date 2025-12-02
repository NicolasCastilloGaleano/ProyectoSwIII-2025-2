import { UserRole, UserStatus } from "../users/users.interface";

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  role?: UserRole;
  status?: UserStatus;
  accentColor?: string | null;
}

export interface UserData {
  id: string;
  uid: string;
  correo: string;
  email?: string;
  name: string;
  role?: string;
  roles: string[];
  permissions?: string[];
  status?: string;
  tipo?: string;
  celular?: string;
  phone?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  direccion?: string;
  documento?: string;
  documentoTipo?: string;
  fechaDeCreacion?: string;
  createdAt?: number;
  updatedAt?: number;
  creadoPor?: string;
  creadoPorNombre?: string;
  responsable?: string;
  responsableNombre?: string;
  logoURL?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
