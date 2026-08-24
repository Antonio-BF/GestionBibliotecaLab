export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rolId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  fechaExpiracionAccessToken: string;
  nombres: string;
  apellidos: string;
  rol: string;
}
