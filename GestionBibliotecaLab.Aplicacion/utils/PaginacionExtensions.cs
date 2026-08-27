
using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.utils
{
    internal static class PaginacionExtensions
    {
        //Pagina y proyecta en el mismo SELECT (mapeo vía Expression).
        public static async Task<PaginacionResultado<TDestino>> ToPaginadoAsync<TOrigen, TDestino>(
            this IQueryable<TOrigen> query,
            int pagina,
            int tamanioPagina,
            Expression<Func<TOrigen, TDestino>> proyeccion,
            CancellationToken cancellationToken = default)
        {
            var total = await query.CountAsync(cancellationToken);

            var items = total == 0
                ? new List<TDestino>() : await query.Skip((pagina - 1) * tamanioPagina).Take(tamanioPagina)
                    .Select(proyeccion).ToListAsync(cancellationToken);

            return new PaginacionResultado<TDestino>
            {
                Items = items,
                Pagina = pagina,
                TamanioPagina = tamanioPagina,
                TotalRegistros = total
            };
        }

        // Pagina la entidad completa, sin proyectar — para los casos con mapeo por método estático.
        public static async Task<PaginacionResultado<TOrigen>> ToPaginadoAsync<TOrigen>(
            this IQueryable<TOrigen> query, 
            int pagina, 
            int tamanioPagina, 
            CancellationToken cancellationToken = default)
        {
            var total = await query.CountAsync(cancellationToken);

            var items = total == 0
                ? new List<TOrigen>()
                : await query.Skip((pagina - 1) * tamanioPagina).Take(tamanioPagina)
                    .ToListAsync(cancellationToken);

            return new PaginacionResultado<TOrigen>
            {
                Items = items,
                Pagina = pagina,
                TamanioPagina = tamanioPagina,
                TotalRegistros = total
            };
        }

        // Remapea los Items de un resultado ya paginado, preservando la metadata.
        public static PaginacionResultado<TDestino> Mapear<TOrigen, TDestino>(
            this PaginacionResultado<TOrigen> resultado, 
            Func<TOrigen, TDestino> mapeador)
        {
            return new PaginacionResultado<TDestino>
            {
                Items = resultado.Items.Select(mapeador).ToList(),
                Pagina = resultado.Pagina,
                TamanioPagina = resultado.TamanioPagina,
                TotalRegistros = resultado.TotalRegistros
            };
        }
    }
}
