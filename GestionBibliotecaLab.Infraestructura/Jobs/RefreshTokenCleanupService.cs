using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionBibliotecaLab.Infraestructura.Jobs
{
    /// <summary>
    /// Invoca periódicamente sp_LimpiarRefreshTokensExpirados. Vive en Infraestructura
    /// porque su única razón de ser es tocar la base de datos
    /// directamente vía un SP, sin ninguna regla de negocio de por medio    
    /// </summary>
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RefreshTokenCleanupService> _logger;
        private readonly RefreshTokenCleanupOptions _opciones;

        public RefreshTokenCleanupService(
            IServiceScopeFactory scopeFactory,
            ILogger<RefreshTokenCleanupService> logger,
            IOptions<RefreshTokenCleanupOptions> opciones)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _opciones = opciones.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            using var timer = new PeriodicTimer(TimeSpan.FromHours(_opciones.IntervaloHoras));

            do
            {
                await EjecutarLimpiezaAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task EjecutarLimpiezaAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await context.Database.ExecuteSqlInterpolatedAsync(
                    $"EXEC dbo.sp_LimpiarRefreshTokensExpirados @DiasRetencion = {_opciones.DiasRetencion}",
                    cancellationToken);

                _logger.LogInformation(
                    "Limpieza de RefreshTokens ejecutada (retención: {Dias} días).",
                    _opciones.DiasRetencion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar la limpieza de RefreshTokens expirados.");
            }
        }
    }
}