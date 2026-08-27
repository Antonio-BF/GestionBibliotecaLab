using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Usuario;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.utils;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GestionBibliotecaLab.Aplicacion
{
    public class UsuarioService : IUsuarioService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasherService _passwordHasher;
        private readonly ICurrentUserService _currentUserService;

        public UsuarioService(AppDbContext context, IPasswordHasherService passwordHasher, ICurrentUserService currentUserService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _currentUserService = currentUserService;
        }

        public async Task<PaginacionResultado<UsuarioResponse>> GetAllUsuarioAsync(UsuarioFiltroRequest filtro)
        {
            var query = AplicarFiltros(_context.Usuarios.AsNoTracking(), filtro)
                .OrderBy(u => u.Apellidos).ThenBy(u => u.Nombres);

            return await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina, UsuarioMapper);
        }

        public async Task<PaginacionResultado<UsuarioResponse>> GetEliminadosAsync(UsuarioFiltroRequest filtro)
        {
            var query = AplicarFiltros(
                    _context.Usuarios.IgnoreQueryFilters().AsNoTracking().Where(u => u.IsDeleted),
                    filtro)
                .OrderByDescending(u => u.FechaActualizacion);

            return await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina, UsuarioMapper);
        }

        public async Task<UsuarioResponse> GetByIdAsync(int id)
        {
            return await _context.Usuarios.AsNoTracking()
                .Where(u => u.Id == id)
                .Select(UsuarioMapper)
                .FirstOrDefaultAsync()
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {id}");
        }

        public async Task<UsuarioResponse> RegistrarUsuarioAsync(CreateUsuarioRequest request)
        {
            var email = NormalizarEmail(request.Email);

            await ValidarEmailDisponibleAsync(email);
            var rol = await ObtenerRolExistenteAsync(request.RolId);

            var usuario = new Usuario
            {
                Nombres = request.Nombres.Trim(),
                Apellidos = request.Apellidos.Trim(),
                Email = email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RolId = rol.Id,
                Rol = rol
            };

            _context.Usuarios.Add(usuario);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException("Ya existe un usuario registrado con ese email.");
            }

            return UsuarioMapperCompilado(usuario);
        }

        public async Task ActualizarUsuarioAsync(int id, UpdateUsuarioRequest request)
        {
            var usuario = await _context.Usuarios.FindAsync(id)
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {id}");

            var email = NormalizarEmail(request.Email);

            await ValidarEmailDisponibleAsync(email, idAExcluir: id);
            var rol = await ObtenerRolExistenteAsync(request.RolId);

            usuario.Nombres = request.Nombres.Trim();
            usuario.Apellidos = request.Apellidos.Trim();
            usuario.Email = email;
            usuario.RolId = rol.Id;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                usuario.PasswordHash = _passwordHasher.HashPassword(request.Password);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException("Ya existe un usuario registrado con ese email.");
            }
        }

        public async Task CambiarEstadoAsync(int id)
        {
            var usuarioIdActual = _currentUserService.ObtenerUsuarioIdAutenticado();

            if (id == usuarioIdActual)
                throw new ForbiddenException("No puedes cambiar el estado de tu propia cuenta");

            var usuario = await _context.Usuarios
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {id}");

            var seVaADesactivar = !usuario.IsDeleted;

            if (seVaADesactivar)
            {
                await ValidarSinRecursosActivosAsync(id);
            }

            usuario.IsDeleted = !usuario.IsDeleted;
            await _context.SaveChangesAsync();
        }

        // ---------------------------------------------------------------
        private static IQueryable<Usuario> AplicarFiltros(IQueryable<Usuario> query, UsuarioFiltroRequest filtro)
        {
            if (!string.IsNullOrWhiteSpace(filtro.Busqueda))
            {
                var busqueda = filtro.Busqueda.Trim();
                query = query.Where(u =>
                    u.Nombres.Contains(busqueda) ||
                    u.Apellidos.Contains(busqueda) ||
                    u.Email.Contains(busqueda));
            }

            if (filtro.RolId.HasValue)
                query = query.Where(u => u.RolId == filtro.RolId);

            return query;
        }

        private static string NormalizarEmail(string email) => email.Trim().ToLower();

        private async Task ValidarEmailDisponibleAsync(string email, int? idAExcluir = null)
        {
            var yaExiste = await _context.Usuarios.IgnoreQueryFilters()
                .AnyAsync(u => u.Email == email && (idAExcluir == null || u.Id != idAExcluir));

            if (yaExiste)
                throw new DuplicateResourceException("Ya existe un usuario registrado con ese email.");
        }

        private async Task<Rol> ObtenerRolExistenteAsync(int rolId)
        {
            return await _context.Roles.FirstOrDefaultAsync(r => r.Id == rolId)
                ?? throw new ResourceNotFoundException($"No se encontró el rol con el ID {rolId}.");
        }

        private async Task ValidarSinRecursosActivosAsync(int usuarioId)
        {
            if (await EstadosActivosQueries.UsuarioTienePenalizacionesPendientesAsync(_context, usuarioId))
                throw new ConflictException("No se puede cambiar el estado del usuario ya que cuenta con penalizaciones activas");

            if (await EstadosActivosQueries.UsuarioTienePrestamosActivosAsync(_context, usuarioId))
                throw new ConflictException("No se puede eliminar/desactivar al usuario porque cuenta con libros prestados o en mora");

            if (await EstadosActivosQueries.UsuarioTieneReservasActivasAsync(_context, usuarioId))
                throw new ConflictException("No se puede eliminar/desactivar al usuario porque cuenta con reservas pendientes o confirmadas");
        }

        private static readonly Expression<Func<Usuario, UsuarioResponse>> UsuarioMapper = u => new UsuarioResponse
        {
            Id = u.Id,
            Nombres = u.Nombres,
            Apellidos = u.Apellidos,
            Email = u.Email,
            RolId = u.RolId,
            NombreRol = u.Rol.Nombre,
            FechaCreacion = u.FechaCreacion,
            FechaActualizacion = u.FechaActualizacion,
            IsDeleted = u.IsDeleted
        };

        private static readonly Func<Usuario, UsuarioResponse> UsuarioMapperCompilado = UsuarioMapper.Compile();
    }
}