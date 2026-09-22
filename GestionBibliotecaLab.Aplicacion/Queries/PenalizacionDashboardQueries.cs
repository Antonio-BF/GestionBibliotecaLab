using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class PenalizacionDashboardQueries
    {
        public static async Task<ResumenPenalizacionesUsuario> ObtenerResumenUsuarioAsync(
            AppDbContext context, int usuarioId, CancellationToken ct = default)
        {
            return await context.Penalizaciones.AsNoTracking()
                .Where(p => p.UsuarioId == usuarioId)
                .GroupBy(_ => 1)
                .Select(g => new ResumenPenalizacionesUsuario
                {
                    Total = g.Count(),
                    Pendientes = g.Count(p => p.Estado == EstadoPenalizacion.Pendiente.ToString()),
                    Pagadas = g.Count(p => p.Estado == EstadoPenalizacion.Pagada.ToString()),
                    Anuladas = g.Count(p => p.Estado == EstadoPenalizacion.Anulada.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenPenalizacionesUsuario();
        }

        public static async Task<ResumenPenalizacionesGlobal> ObtenerResumenGlobalAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            return await context.Penalizaciones.AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new ResumenPenalizacionesGlobal
                {
                    Total = g.Count(),
                    Pendientes = g.Count(p => p.Estado == EstadoPenalizacion.Pendiente.ToString()),
                    Pagadas = g.Count(p => p.Estado == EstadoPenalizacion.Pagada.ToString()),
                    Anuladas = g.Count(p => p.Estado == EstadoPenalizacion.Anulada.ToString()),
                    MontoPendiente = g.Sum(p =>
                        p.Estado == EstadoPenalizacion.Pendiente.ToString() ? (p.Monto ?? 0) : 0)
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenPenalizacionesGlobal();
        }
    }
}