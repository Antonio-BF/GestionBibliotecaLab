export interface RolResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface RolRequest {
  nombre: string;
  descripcion?: string | null;
}