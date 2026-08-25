import { HttpContextToken } from "@angular/common/http";

/**
 * Marca una request para que errorInterceptor NO dispare el banner global
 * de NotificationService — se usa en llamadas que se originan desde un
 * formulario con su propio manejo de error inline (login, registro, crear/
 * editar libro), para no mostrar el mismo error dos veces.
 */
export const SILENCIAR_ERROR_GLOBAL = new HttpContextToken<boolean>(() => false);