using GestionBibliotecaLab.Aplicacion.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionBibliotecaLab.Aplicacion.job
{
    public class ReservaEstadoJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ReservaEstadoJob> _logger;
        private readonly ReservaEstadoOptions _opciones;

        public ReservaEstadoJob(
            IServiceScopeFactory scopeFactory,
            ILogger<ReservaEstadoJob> logger,
            IOptions<ReservaEstadoOptions> opciones)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _opciones = opciones.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(_opciones.IntervaloMinutos));

            do
            {
                await EjecutarActualizacionAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task EjecutarActualizacionAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var reservaService = scope.ServiceProvider.GetRequiredService<IReservaService>();

                await reservaService.ActualizarEstadosVencidosAsync();

                _logger.LogInformation("Actualización de estados vencidos de reservas ejecutada.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar estados vencidos de reservas.");
            }
        }
    }
}
