using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class UsuarioDashboardQueries
    {
        public static async Task<ResumenUsuarios> ObtenerResumenAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            // IgnoreQueryFilters() es obligatorio aquí: el Global Query Filter
            // (IsDeleted == false) ya excluye a los usuarios dados de baja, así
            // que sin esto "Inactivos" siempre da 0 y "Total" == "Activos".
            return await context.Usuarios.AsNoTracking()
                .IgnoreQueryFilters()
                .GroupBy(_ => 1)
                .Select(g => new ResumenUsuarios
                {
                    Total = g.Count(),
                    Activos = g.Count(u => !u.IsDeleted),
                    Inactivos = g.Count(u => u.IsDeleted)
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenUsuarios();
        }

        public static Task<List<UsuarioPorRolItem>> ObtenerPorRolAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            return context.Usuarios.AsNoTracking()
                .Where(u => !u.IsDeleted)
                .GroupBy(u => u.Rol.Nombre)
                .Select(g => new UsuarioPorRolItem { Rol = g.Key, Cantidad = g.Count() })
                .OrderByDescending(x => x.Cantidad)
                .ToListAsync(ct);
        }
    }
}