using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class ReservaDashboardQueries
    {
        public static async Task<ResumenReservasUsuario> ObtenerResumenUsuarioAsync(
            AppDbContext context, int usuarioId, CancellationToken ct = default)
        {
            return await context.ReservasLabs.AsNoTracking()
                .Where(r => r.UsuarioId == usuarioId)
                .GroupBy(_ => 1)
                .Select(g => new ResumenReservasUsuario
                {
                    Total = g.Count(),
                    Pendientes = g.Count(r => r.Estado == EstadoReserva.Pendiente.ToString()),
                    Confirmadas = g.Count(r => r.Estado == EstadoReserva.Confirmada.ToString()),
                    Finalizadas = g.Count(r => r.Estado == EstadoReserva.Finalizada.ToString()),
                    Canceladas = g.Count(r => r.Estado == EstadoReserva.Cancelada.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenReservasUsuario();
        }

        public static async Task<ResumenReservasGlobal> ObtenerResumenGlobalAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            return await context.ReservasLabs.AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new ResumenReservasGlobal
                {
                    Total = g.Count(),
                    Pendientes = g.Count(r => r.Estado == EstadoReserva.Pendiente.ToString()),
                    Confirmadas = g.Count(r => r.Estado == EstadoReserva.Confirmada.ToString()),
                    Finalizadas = g.Count(r => r.Estado == EstadoReserva.Finalizada.ToString()),
                    Canceladas = g.Count(r => r.Estado == EstadoReserva.Cancelada.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenReservasGlobal();
        }

        /// <summary>
        /// "ahoraLocal" debe venir de ReservaReglasValidacion.ObtenerAhoraLocal() —
        /// esta clase no depende de Aplicacion.Validaciones para mantenerse desacoplada;
        /// el llamador (DashboardService) resuelve la hora local y la pasa como parámetro.
        /// </summary>
        public static Task<List<ReservaDashboardItem>> ObtenerProximasUsuarioAsync(
            AppDbContext context, int usuarioId, DateTime ahoraLocal, int limite, CancellationToken ct = default)
        {
            var hoy = DateOnly.FromDateTime(ahoraLocal);

            return context.ReservasLabs.AsNoTracking()
                .Where(r => r.UsuarioId == usuarioId &&
                            (r.Estado == EstadoReserva.Pendiente.ToString() ||
                             r.Estado == EstadoReserva.Confirmada.ToString()) &&
                            r.Fecha >= hoy)
                .OrderBy(r => r.Fecha).ThenBy(r => r.HoraInicio)
                .Take(limite)
                .Select(r => new ReservaDashboardItem
                {
                    Id = r.Id,
                    LaboratorioId = r.LaboratorioId,
                    NombreLaboratorio = r.Laboratorio.Nombre,
                    Fecha = r.Fecha,
                    HoraInicio = r.HoraInicio,
                    HoraFin = r.HoraFin,
                    Estado = r.Estado
                })
                .ToListAsync(ct);
        }

        public static Task<List<ReservaDashboardItem>> ObtenerPendientesAsync(
            AppDbContext context, int limite, CancellationToken ct = default)
        {
            return context.ReservasLabs.AsNoTracking()
                .Where(r => r.Estado == EstadoReserva.Pendiente.ToString())
                .OrderBy(r => r.Fecha).ThenBy(r => r.HoraInicio)
                .Take(limite)
                .Select(r => new ReservaDashboardItem
                {
                    Id = r.Id,
                    LaboratorioId = r.LaboratorioId,
                    NombreLaboratorio = r.Laboratorio.Nombre,
                    Fecha = r.Fecha,
                    HoraInicio = r.HoraInicio,
                    HoraFin = r.HoraFin,
                    Estado = r.Estado
                })
                .ToListAsync(ct);
        }

        public static async Task<List<ActividadPeriodoItem>> ObtenerActividadMensualAsync(
            AppDbContext context, int meses, CancellationToken ct = default)
        {
            var desde = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-meses));

            var agrupado = await context.ReservasLabs.AsNoTracking()
                .Where(r => r.Fecha >= desde)
                .GroupBy(r => new { r.Fecha.Year, r.Fecha.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Cantidad = g.Count()
                })
                .ToListAsync(ct);

            return agrupado
                .Select(x => new ActividadPeriodoItem
                {
                    Periodo = new DateTime(x.Year, x.Month, 1),
                    Cantidad = x.Cantidad
                })
                .OrderBy(x => x.Periodo)
                .ToList();
        }
    }
}