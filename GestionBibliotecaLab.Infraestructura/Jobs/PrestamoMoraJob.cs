using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionBibliotecaLab.Infraestructura.Jobs
{
    public class PrestamoMoraJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<PrestamoMoraJob> _logger;
        private readonly PrestamoMoraOptions _opciones;

        public PrestamoMoraJob(
            IServiceScopeFactory scopeFactory,
            ILogger<PrestamoMoraJob> logger,
            IOptions<PrestamoMoraOptions> opciones)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _opciones = opciones.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            using var timer = new PeriodicTimer(TimeSpan.FromHours(_opciones.IntervaloHoras));

            do
            {
                await EjecutarGeneracionDeMorasAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task EjecutarGeneracionDeMorasAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await context.Database.ExecuteSqlInterpolatedAsync(
                    $"EXEC dbo.sp_GenerarMorasPorPrestamosVencidos", cancellationToken);

                _logger.LogInformation("Generación de moras por préstamos vencidos ejecutada.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar la generación de moras por préstamos vencidos.");
            }
        }
    }
}
