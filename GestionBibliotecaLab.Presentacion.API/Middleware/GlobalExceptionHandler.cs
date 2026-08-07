using GestionBibliotecaLab.Aplicacion.Excepciones;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var esExcepcionDeNegocio = exception is ExcepcionAplicacionBase;

            var statusCode = exception switch
            {
                ExcepcionAplicacionBase ex => ex.StatusCode,
                _ => StatusCodes.Status500InternalServerError
            };

            if (esExcepcionDeNegocio)
            {
                _logger.LogWarning(exception,
                    "Excepción de negocio procesando {Metodo} {Ruta}: {Mensaje}",
                    httpContext.Request.Method, httpContext.Request.Path, exception.Message);
            }
            else
            {
                _logger.LogError(exception,
                    "Error no controlado procesando {Metodo} {Ruta}",
                    httpContext.Request.Method, httpContext.Request.Path);
            }

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = esExcepcionDeNegocio ? exception.Message : "Ocurrió un error inesperado en el servidor.",
                Type = $"https://httpstatuses.com/{statusCode}",
                Instance = httpContext.Request.Path
            };

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = "application/problem+json";

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
