/**
 * Forma de ProblemDetails que arma GlobalExceptionHandler para toda excepción
 * que hereda de ExcepcionAplicacionBase (400/401/403/404/409) y para errores
 * 500 no controlados.
 */
export interface ProblemDetails {
  status?: number;
  title?: string;
  type?: string;
  instance?: string;
}

/**
 * Forma que devuelve ASP.NET Core automáticamente ante un 400 de Data
 * Annotations (antes de llegar al controlador, por [ApiController]) —
 * distinta de ProblemDetails: usa un diccionario "errors" campo -> mensajes.
 */
export interface ValidationProblemDetails extends ProblemDetails {
  errors?: { [campo: string]: string[] };
}

/** Error ya normalizado para consumo uniforme en componentes. */
export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: { [campo: string]: string[] };
}
