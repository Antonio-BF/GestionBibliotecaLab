using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.utils;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GestionBibliotecaLab.Aplicacion
{
    public class PenalizacionService : IPenalizacionService
    {
        private readonly AppDbContext _context;

        public PenalizacionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginacionResultado<PenalizacionResponse>> GetAllAsync(PenalizacionFiltroRequest filtro)
        {
            var query = AplicarFiltros(_context.Penalizaciones.AsNoTracking(), filtro)
                .OrderByDescending(p => p.FechaGeneracion);

            return await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina, MapearAResponseExpr);
        }

        public async Task<PenalizacionResponse> GetByIdAsync(int id)
        {
            return await _context.Penalizaciones.AsNoTracking()
                .Where(p => p.Id == id)
                .Select(MapearAResponseExpr)
                .FirstOrDefaultAsync()
                ?? throw new ResourceNotFoundException($"No se encontró la penalización con el id {id}");
        }

        public async Task<PenalizacionResponse> RegistrarAsync(CreatePenalizacionRequest request)
        {
            PenalizacionReglasValidacion.ValidarCombinacionOrigenTipo(request.Origen, request.Tipo);

            var penalizacion = request.Origen == OrigenPenalizacion.Prestamo
                ? await ConstruirDesdePrestamoAsync(request)
                : await ConstruirDesdeReservaAsync(request);

            _context.Penalizaciones.Add(penalizacion);
            await _context.SaveChangesAsync();

            return PenalizacionMapperCompilado(penalizacion);
        }

        public async Task GenerarPorDevolucionTardiaAsync(int prestamoId, int usuarioId)
        {
            await PenalizacionReglasValidacion.ValidarSinPenalizacionPendienteDuplicadaAsync(
                _context, prestamoId, reservaLabId: null);

            _context.Penalizaciones.Add(new Penalizacion
            {
                UsuarioId = usuarioId,
                PrestamoId = prestamoId,
                Tipo = TipoPenalizacion.DevolucionTardia.ToString(),
                Motivo = "Devolución tardía registrada al momento de recibir el libro.",
                Estado = EstadoPenalizacion.Pendiente.ToString()
            });

            await _context.SaveChangesAsync();
        }

        public async Task ResolverAsync(int id)
        {
            var penalizacion = await _context.Penalizaciones.FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró la penalización con el id {id}");

            PenalizacionReglasValidacion.ValidarPuedeResolver(penalizacion);

            penalizacion.Estado = EstadoPenalizacion.Pagada.ToString();
            penalizacion.FechaResolucion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task AnularAsync(int id)
        {
            var penalizacion = await _context.Penalizaciones.FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró la penalización con el id {id}");

            PenalizacionReglasValidacion.ValidarPuedeAnular(penalizacion);

            penalizacion.Estado = EstadoPenalizacion.Anulada.ToString();
            penalizacion.FechaResolucion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // ---------------- Helpers privados de construcción ----------------
        private async Task<Penalizacion> ConstruirDesdePrestamoAsync(CreatePenalizacionRequest request)
        {
            var prestamo = await PenalizacionReglasValidacion.ObtenerPrestamoParaPenalizarAsync(_context, request.OrigenId);
            await PenalizacionReglasValidacion.ValidarSinPenalizacionPendienteDuplicadaAsync(_context, prestamo.Id, null);

            return new Penalizacion
            {
                UsuarioId = prestamo.UsuarioId,
                Usuario = prestamo.Usuario,
                PrestamoId = prestamo.Id,
                Tipo = request.Tipo.ToString(),
                Motivo = request.Motivo.Trim(),
                Monto = request.Monto,
                Estado = EstadoPenalizacion.Pendiente.ToString()
            };
        }

        private async Task<Penalizacion> ConstruirDesdeReservaAsync(CreatePenalizacionRequest request)
        {
            var reserva = await PenalizacionReglasValidacion.ObtenerReservaParaPenalizarAsync(_context, request.OrigenId);
            await PenalizacionReglasValidacion.ValidarSinPenalizacionPendienteDuplicadaAsync(_context, null, reserva.Id);

            return new Penalizacion
            {
                UsuarioId = reserva.UsuarioId,
                Usuario = reserva.Usuario,
                ReservaLabId = reserva.Id,
                Tipo = request.Tipo.ToString(),
                Motivo = request.Motivo.Trim(),
                Monto = request.Monto,
                Estado = EstadoPenalizacion.Pendiente.ToString()
            };
        }

        // ---------------------------------------------------------------
        private static IQueryable<Penalizacion> AplicarFiltros(IQueryable<Penalizacion> query, PenalizacionFiltroRequest filtro)
        {
            if (filtro.UsuarioId.HasValue)
                query = query.Where(p => p.UsuarioId == filtro.UsuarioId);

            if (filtro.PrestamoId.HasValue)
                query = query.Where(p => p.PrestamoId == filtro.PrestamoId);

            if (filtro.ReservaLabId.HasValue)
                query = query.Where(p => p.ReservaLabId == filtro.ReservaLabId);

            if (filtro.Origen.HasValue)
            {
                query = filtro.Origen.Value == OrigenPenalizacion.Prestamo
                    ? query.Where(p => p.PrestamoId != null)
                    : query.Where(p => p.ReservaLabId != null);
            }

            if (!string.IsNullOrWhiteSpace(filtro.BuscarUsuario))
            {
                var textoUsuario = filtro.BuscarUsuario.Trim();
                query = query.Where(p => p.Usuario.Nombres.Contains(textoUsuario) ||
                                         p.Usuario.Apellidos.Contains(textoUsuario) ||
                                         p.Usuario.Email.Contains(textoUsuario));
            }

            if (filtro.Tipo.HasValue)
                query = query.Where(p => p.Tipo == filtro.Tipo.Value.ToString());

            if (filtro.Estado.HasValue)
                query = query.Where(p => p.Estado == filtro.Estado.Value.ToString());

            return query;
        }

        // ---------------- Mapeo ----------------
        private static readonly Expression<Func<Penalizacion, PenalizacionResponse>> MapearAResponseExpr = p => new PenalizacionResponse
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            NombreUsuario = p.Usuario.Nombres + " " + p.Usuario.Apellidos,
            EmailUsuario = p.Usuario.Email,
            PrestamoId = p.PrestamoId,
            ReservaLabId = p.ReservaLabId,
            Tipo = p.Tipo,
            Motivo = p.Motivo,
            Monto = p.Monto,
            FechaGeneracion = p.FechaGeneracion,
            FechaResolucion = p.FechaResolucion,
            Estado = p.Estado
        };

        private static readonly Func<Penalizacion, PenalizacionResponse> PenalizacionMapperCompilado = MapearAResponseExpr.Compile();
    }
}
