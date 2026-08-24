/**
 * Utilidad de solo-lectura para decodificar el payload de un JWT en el cliente.
 * NO valida firma ni expiración de forma criptográfica — esa validación real
 * la hace siempre el backend. Aquí solo se usa para leer claims informativos (id de usuario,
 * email, expiración) y así evitar depender de decodificación manual repetida
 * en distintos servicios.
 */

export interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
  [claim: string]: unknown;
}

export function decodificarJwt(token: string): JwtPayload | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((caracter) => '%' + ('00' + caracter.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function obtenerIdUsuarioDesdeToken(token: string): number | null {
  const payload = decodificarJwt(token);
  const valor = payload?.sub;
  const id = Number(valor);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function tokenExpirado(token: string): boolean {
  const payload = decodificarJwt(token);
  if (!payload?.exp) return true;
  const expiraEnMs = payload.exp * 1000;
  return Date.now() >= expiraEnMs;
}
