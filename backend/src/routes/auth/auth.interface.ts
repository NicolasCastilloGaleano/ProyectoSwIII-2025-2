export interface UserData {
  id: string;
  uid: string;
  correo: string;
  email?: string;
  nombre: string;
  name?: string;
  roles: string[];
  tipo?: string;
  celular?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  direccion?: string;
  documento?: string;
  documentoTipo?: string;
  fechaDeCreacion?: string;
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