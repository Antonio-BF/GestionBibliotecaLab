using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab;
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
    public class ReservaService : IReservaService
    {
        private readonly AppDbContext _context;

        public ReservaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginacionResultado<ReservaResponse>> GetAllAsync(ReservaFiltroRequest filtro)
        {
            var query = AplicarFiltros(_context.ReservasLabs.AsNoTracking(), filtro)
                .OrderByDescending(r => r.Fecha).ThenBy(r => r.HoraInicio);

            return await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina, MapearAResponseExpr);
        }

        public async Task<ReservaResponse> GetByIdAsync(int id)
        {
            return await _context.ReservasLabs.AsNoTracking()
                .Where(r => r.Id == id)
                .Select(MapearAResponseExpr)
                .FirstOrDefaultAsync()
                ?? throw new ResourceNotFoundException($"No se encontró la reserva con el id {id}");
        }

        public Task<bool> VerificarDisponibilidadAsync(int laboratorioId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin) =>
            ReservaReglasValidacion.VerificarDisponibilidadAsync(_context, laboratorioId, fecha, horaInicio, horaFin);

        public async Task<ReservaResponse> RegistrarAsync(CreateReservaRequest request)
        {
            var usuario = await ReservaReglasValidacion.ObtenerUsuarioExistenteAsync(_context, request.UsuarioId);

            ReservaReglasValidacion.ValidarHorarioPermitido(request.HoraInicio, request.HoraFin);
            ReservaReglasValidacion.ValidarFechaNoEnElPasado(request.Fecha, request.HoraInicio);

            await ReservaReglasValidacion.ValidarSinPenalizacionesPendientesAsync(_context, usuario.Id);
            await ReservaReglasValidacion.ValidarSinReservaActivaAsync(_context, usuario.Id);

            if (!await ReservaReglasValidacion.VerificarDisponibilidadAsync(
                    _context, request.LaboratorioId, request.Fecha, request.HoraInicio, request.HoraFin))
                throw new ConflictException("El laboratorio no está disponible en el horario solicitado.");

            var reserva = new ReservaLab
            {
                UsuarioId = usuario.Id,
                Usuario = usuario,
                LaboratorioId = request.LaboratorioId,
                Fecha = request.Fecha,
                HoraInicio = request.HoraInicio,
                HoraFin = request.HoraFin,
                Estado = EstadoReserva.Pendiente.ToString()
            };

            _context.ReservasLabs.Add(reserva);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new ConflictException("El laboratorio no está disponible en el horario solicitado.");
            }

            await _context.Entry(reserva).Reference(r => r.Laboratorio).LoadAsync();
            return ReservaMapperCompilado(reserva);
        }

        public async Task ConfirmarAsync(int id)
        {
            var reserva = await _context.ReservasLabs.FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró la reserva con el id {id}");

            ReservaReglasValidacion.ValidarPuedeConfirmar(reserva);

            reserva.Estado = EstadoReserva.Confirmada.ToString();
            await _context.SaveChangesAsync();
        }

        public async Task CancelarAsync(int id, int usuarioIdSolicitante, bool esStaff)
        {
            var reserva = await _context.ReservasLabs.FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró la reserva con el id {id}");

            ReservaReglasValidacion.ValidarPuedeCancelar(reserva, usuarioIdSolicitante, esStaff);

            reserva.Estado = EstadoReserva.Cancelada.ToString();
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarEstadosVencidosAsync()
        {
            var ahoraLocal = ReservaReglasValidacion.ObtenerAhoraLocal();
            var hoy = DateOnly.FromDateTime(ahoraLocal);
            var horaActual = TimeOnly.FromDateTime(ahoraLocal);

            var vencidas = await _context.ReservasLabs
                .Where(r => r.Estado == EstadoReserva.Confirmada.ToString() || r.Estado == EstadoReserva.Pendiente.ToString())
                .Where(r => r.Fecha < hoy || (r.Fecha == hoy && r.HoraFin <= horaActual))
                .ToListAsync();

            if (vencidas.Count == 0) return;

            foreach (var reserva in vencidas)
            {
                reserva.Estado = reserva.Estado == EstadoReserva.Confirmada.ToString()
                    ? EstadoReserva.Finalizada.ToString()
                    : EstadoReserva.Cancelada.ToString();
            }

            await _context.SaveChangesAsync();
        }

        // ---------------------------------------------------------------
        private static IQueryable<ReservaLab> AplicarFiltros(IQueryable<ReservaLab> query, ReservaFiltroRequest filtro)
        {
            if (filtro.UsuarioId.HasValue)
                query = query.Where(r => r.UsuarioId == filtro.UsuarioId);

            if (filtro.LaboratorioId.HasValue)
                query = query.Where(r => r.LaboratorioId == filtro.LaboratorioId);

            if (!string.IsNullOrWhiteSpace(filtro.BuscarUsuario))
            {
                var textoUsuario = filtro.BuscarUsuario.Trim();
                query = query.Where(p => p.Usuario.Nombres.Contains(textoUsuario) ||
                                         p.Usuario.Apellidos.Contains(textoUsuario) ||
                                         p.Usuario.Email.Contains(textoUsuario));
            }

            if (!string.IsNullOrWhiteSpace(filtro.BuscarLaboratorio))
            {
                var textoLaboratorio = filtro.BuscarLaboratorio.Trim();
                query = query.Where(l => l.Laboratorio.Nombre.Contains(textoLaboratorio));
                                       
            }


            if (filtro.Estado.HasValue)
                query = query.Where(r => r.Estado == filtro.Estado.Value.ToString());

            if (filtro.Fecha.HasValue)
                query = query.Where(r => r.Fecha == filtro.Fecha);

            return query;
        }

        private static readonly Expression<Func<ReservaLab, ReservaResponse>> MapearAResponseExpr = r => new ReservaResponse
        {
            Id = r.Id,
            UsuarioId = r.UsuarioId,
            NombreUsuario = r.Usuario.Nombres + " " + r.Usuario.Apellidos,
            EmailUsuario = r.Usuario.Email,
            LaboratorioId = r.LaboratorioId,
            NombreLaboratorio = r.Laboratorio.Nombre,
            Fecha = r.Fecha,
            HoraInicio = r.HoraInicio,
            HoraFin = r.HoraFin,
            Estado = r.Estado
        };

        private static readonly Func<ReservaLab, ReservaResponse> ReservaMapperCompilado = MapearAResponseExpr.Compile();
    }
}
