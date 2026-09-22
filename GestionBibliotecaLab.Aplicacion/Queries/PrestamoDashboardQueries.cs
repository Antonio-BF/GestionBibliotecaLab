using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Queries
{
    internal static class PrestamoDashboardQueries
    {
        public static async Task<ResumenPrestamosUsuario> ObtenerResumenUsuarioAsync(
            AppDbContext context, int usuarioId, CancellationToken ct = default)
        {
            return await context.Prestamos.AsNoTracking()
                .Where(p => p.UsuarioId == usuarioId)
                .GroupBy(_ => 1)
                .Select(g => new ResumenPrestamosUsuario
                {
                    Total = g.Count(),
                    Activos = g.Count(p => p.Estado == EstadoPrestamo.Prestado.ToString()),
                    EnMora = g.Count(p => p.Estado == EstadoPrestamo.EnMora.ToString()),
                    Devueltos = g.Count(p => p.Estado == EstadoPrestamo.Devuelto.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenPrestamosUsuario();
        }

        public static async Task<ResumenPrestamosGlobal> ObtenerResumenGlobalAsync(
            AppDbContext context, CancellationToken ct = default)
        {
            return await context.Prestamos.AsNoTracking()
                .GroupBy(_ => 1)
                .Select(g => new ResumenPrestamosGlobal
                {
                    Total = g.Count(),
                    Activos = g.Count(p => p.Estado == EstadoPrestamo.Prestado.ToString()),
                    EnMora = g.Count(p => p.Estado == EstadoPrestamo.EnMora.ToString()),
                    Devueltos = g.Count(p => p.Estado == EstadoPrestamo.Devuelto.ToString())
                })
                .SingleOrDefaultAsync(ct) ?? new ResumenPrestamosGlobal();
        }

        public static Task<List<PrestamoDashboardItem>> ObtenerProximosVencimientosUsuarioAsync(
            AppDbContext context, int usuarioId, DateTime ahora, int diasHaciaAdelante, int limite,
            CancellationToken ct = default)
        {
            var fechaLimite = ahora.AddDays(diasHaciaAdelante);

            return context.Prestamos.AsNoTracking()
                .Where(p => p.UsuarioId == usuarioId &&
                            p.Estado != EstadoPrestamo.Devuelto.ToString() &&
                            p.FechaDevolucionEsperada >= ahora &&
                            p.FechaDevolucionEsperada <= fechaLimite)
                .OrderBy(p => p.FechaDevolucionEsperada)
                .Take(limite)
                .Select(p => new PrestamoDashboardItem
                {
                    Id = p.Id,
                    TituloLibro = p.Libro.Titulo,
                    FechaDevolucionEsperada = p.FechaDevolucionEsperada,
                    Estado = p.Estado,
                    DiasRestantes = EF.Functions.DateDiffDay(ahora, p.FechaDevolucionEsperada)
                })
                .ToListAsync(ct);
        }

        public static Task<List<PrestamoDashboardItem>> ObtenerProximosAVencerGlobalAsync(
            AppDbContext context, int dias, int limite, CancellationToken ct = default)
        {
            var ahora = DateTime.UtcNow;
            var fechaLimite = ahora.AddDays(dias);

            return context.Prestamos.AsNoTracking()
                .Where(p => p.Estado == EstadoPrestamo.Prestado.ToString() &&
                            p.FechaDevolucionEsperada >= ahora &&
                            p.FechaDevolucionEsperada <= fechaLimite)
                .OrderBy(p => p.FechaDevolucionEsperada)
                .Take(limite)
                .Select(p => new PrestamoDashboardItem
                {
                    Id = p.Id,
                    TituloLibro = p.Libro.Titulo,
                    FechaDevolucionEsperada = p.FechaDevolucionEsperada,
                    Estado = p.Estado,
                    DiasRestantes = EF.Functions.DateDiffDay(ahora, p.FechaDevolucionEsperada)
                })
                .ToListAsync(ct);
        }

        public static Task<List<PrestamoMoraDashboardItem>> ObtenerEnMoraAsync(
            AppDbContext context, int limite, CancellationToken ct = default)
        {
            var ahora = DateTime.UtcNow;

            return context.Prestamos.AsNoTracking()
                .Where(p => p.Estado == EstadoPrestamo.EnMora.ToString())
                .OrderBy(p => p.FechaDevolucionEsperada)
                .Take(limite)
                .Select(p => new PrestamoMoraDashboardItem
                {
                    Id = p.Id,
                    NombreUsuario = p.Usuario.Nombres + " " + p.Usuario.Apellidos,
                    TituloLibro = p.Libro.Titulo,
                    FechaDevolucionEsperada = p.FechaDevolucionEsperada,
                    DiasMora = EF.Functions.DateDiffDay(p.FechaDevolucionEsperada, ahora)
                })
                .ToListAsync(ct);
        }

        public static async Task<List<ActividadPeriodoItem>> ObtenerActividadMensualAsync(
            AppDbContext context, int meses, CancellationToken ct = default)
        {
            var desde = DateTime.UtcNow.AddMonths(-meses);

            var agrupado = await context.Prestamos.AsNoTracking()
                .Where(p => p.FechaPrestamo >= desde)
                .GroupBy(p => new { p.FechaPrestamo.Year, p.FechaPrestamo.Month })
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