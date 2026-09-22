using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class LibroDashboardQueries
    {
        public static async Task<ResumenLibros> ObtenerResumenAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            var resumen = await context.Libros.AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    EjemplaresTotales = g.Sum(l => l.CantidadTotal),
                    EjemplaresDisponibles = g.Sum(l => l.CantidadDisponible)
                })
                .SingleOrDefaultAsync(ct);

            if (resumen is null) return new ResumenLibros();

            return new ResumenLibros
            {
                TotalLibros = resumen.Total,
                EjemplaresTotales = resumen.EjemplaresTotales,
                EjemplaresDisponibles = resumen.EjemplaresDisponibles,
                EjemplaresPrestados = resumen.EjemplaresTotales - resumen.EjemplaresDisponibles
            };
        }

        public static Task<List<LibroRankingItem>> ObtenerMasPrestadosAsync(
            AppDbContext context, int limite, CancellationToken ct = default)
        {
            return context.Prestamos.AsNoTracking()
                .GroupBy(p => new { p.LibroId, p.Libro.Titulo })
                .Select(g => new LibroRankingItem
                {
                    LibroId = g.Key.LibroId,
                    Titulo = g.Key.Titulo,
                    CantidadPrestamos = g.Count()
                })
                .OrderByDescending(x => x.CantidadPrestamos)
                .Take(limite)
                .ToListAsync(ct);
        }
    }
}