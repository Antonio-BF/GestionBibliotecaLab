using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class LaboratorioDashboardQueries
    {
        public static async Task<ResumenLaboratorios> ObtenerResumenAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            return await context.Laboratorios.AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new ResumenLaboratorios
                {
                    Total = g.Count(),
                    Disponibles = g.Count(l => l.Estado == EstadoLaboratorio.Disponible.ToString()),
                    Mantenimiento = g.Count(l => l.Estado == EstadoLaboratorio.Mantenimiento.ToString()),
                    Inactivos = g.Count(l => l.Estado == EstadoLaboratorio.Inactivo.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenLaboratorios();
        }

        public static Task<List<LaboratorioRankingItem>> ObtenerMasReservadosAsync(
            AppDbContext context, int limite, CancellationToken ct = default)
        {
            return context.ReservasLabs.AsNoTracking()
                .GroupBy(r => new { r.LaboratorioId, r.Laboratorio.Nombre })
                .Select(g => new LaboratorioRankingItem
                {
                    LaboratorioId = g.Key.LaboratorioId,
                    Nombre = g.Key.Nombre,
                    CantidadReservas = g.Count()
                })
                .OrderByDescending(x => x.CantidadReservas)
                .Take(limite)
                .ToListAsync(ct);
        }
    }
}