using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Queries;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion
{
    /// <summary>
    /// Orquesta las consultas de dashboard por rol. 
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public DashboardService(AppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<DashboardUsuarioResponse> ObtenerDashboardUsuarioAsync(
            CancellationToken ct = default)
        {
            var usuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();

            var usuario = await _context.Usuarios.AsNoTracking()
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == usuarioId, ct)
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {usuarioId}");

            var ahoraUtc = DateTime.UtcNow;
            var ahoraLocal = ReservaReglasValidacion.ObtenerAhoraLocal();

            var prestamos = await PrestamoDashboardQueries.ObtenerResumenUsuarioAsync(_context, usuarioId, ct);
            var reservas = await ReservaDashboardQueries.ObtenerResumenUsuarioAsync(_context, usuarioId, ct);
            var penalizaciones = await PenalizacionDashboardQueries.ObtenerResumenUsuarioAsync(_context, usuarioId, ct);

            var proximosVencimientos = await PrestamoDashboardQueries.ObtenerProximosVencimientosUsuarioAsync(
                _context, usuarioId, ahoraUtc, diasHaciaAdelante: 7, limite: 5, ct);

            var proximasReservas = await ReservaDashboardQueries.ObtenerProximasUsuarioAsync(
                _context, usuarioId, ahoraLocal, limite: 5, ct);

            return new DashboardUsuarioResponse
            {
                NombreUsuario = $"{usuario.Nombres} {usuario.Apellidos}",
                Rol = usuario.Rol.Nombre,
                Prestamos = prestamos,
                Reservas = reservas,
                Penalizaciones = penalizaciones,
                ProximosVencimientos = proximosVencimientos,
                ProximasReservas = proximasReservas,
                ProximasActividades = CombinarProximasActividades(proximosVencimientos, proximasReservas)
            };
        }

        public async Task<DashboardBibliotecarioResponse> ObtenerDashboardBibliotecarioAsync(
            CancellationToken ct = default)
        {
            return new DashboardBibliotecarioResponse
            {
                Prestamos = await PrestamoDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),
                Reservas = await ReservaDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),
                Penalizaciones = await PenalizacionDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),
                Libros = await LibroDashboardQueries.ObtenerResumenAsync(_context, ct),
                Laboratorios = await LaboratorioDashboardQueries.ObtenerResumenAsync(_context, ct),

                ProximosVencimientos = await PrestamoDashboardQueries.ObtenerProximosAVencerGlobalAsync(
                    _context, dias: 5, limite: 10, ct),
                PrestamosEnMora = await PrestamoDashboardQueries.ObtenerEnMoraAsync(_context, limite: 10, ct),
                ReservasPendientes = await ReservaDashboardQueries.ObtenerPendientesAsync(_context, limite: 10, ct),

                LibrosMasPrestados = await LibroDashboardQueries.ObtenerMasPrestadosAsync(_context, limite: 5, ct),
                LaboratoriosMasReservados = await LaboratorioDashboardQueries.ObtenerMasReservadosAsync(_context, limite: 5, ct)
            };
        }

        public async Task<DashboardAdministradorResponse> ObtenerDashboardAdministradorAsync(
            CancellationToken ct = default)
        {
            return new DashboardAdministradorResponse
            {
                Usuarios = await UsuarioDashboardQueries.ObtenerResumenAsync(_context, ct),
                Libros = await LibroDashboardQueries.ObtenerResumenAsync(_context, ct),
                Laboratorios = await LaboratorioDashboardQueries.ObtenerResumenAsync(_context, ct),
                Prestamos = await PrestamoDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),
                Reservas = await ReservaDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),
                Penalizaciones = await PenalizacionDashboardQueries.ObtenerResumenGlobalAsync(_context, ct),

                UsuariosPorRol = await UsuarioDashboardQueries.ObtenerPorRolAsync(_context, ct),
                LibrosMasPrestados = await LibroDashboardQueries.ObtenerMasPrestadosAsync(_context, limite: 10, ct),
                LaboratoriosMasReservados = await LaboratorioDashboardQueries.ObtenerMasReservadosAsync(_context, limite: 10, ct),

                ActividadPrestamos = await PrestamoDashboardQueries.ObtenerActividadMensualAsync(_context, meses: 6, ct),
                ActividadReservas = await ReservaDashboardQueries.ObtenerActividadMensualAsync(_context, meses: 6, ct)
            };
        }

        private static List<ActividadDashboardItem> CombinarProximasActividades(
            List<PrestamoDashboardItem> prestamos, List<ReservaDashboardItem> reservas)
        {
            var actividades = new List<ActividadDashboardItem>(prestamos.Count + reservas.Count);

            actividades.AddRange(prestamos.Select(p => new ActividadDashboardItem
            {
                Tipo = "Prestamo",
                ReferenciaId = p.Id,
                Descripcion = $"Devolver \"{p.TituloLibro}\"",
                Fecha = p.FechaDevolucionEsperada
            }));

            actividades.AddRange(reservas.Select(r => new ActividadDashboardItem
            {
                Tipo = "Reserva",
                ReferenciaId = r.Id,
                Descripcion = $"Reserva en {r.NombreLaboratorio}",
                Fecha = r.Fecha.ToDateTime(r.HoraInicio)
            }));

            return actividades.OrderBy(a => a.Fecha).Take(5).ToList();
        }
    }
}