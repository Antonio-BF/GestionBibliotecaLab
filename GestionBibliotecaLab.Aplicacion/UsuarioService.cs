using GestionBibliotecaLab.Aplicacion.Dtos.Usuario;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
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

        public async Task<List<UsuarioResponse>> GetAllUsuarioAsync()
        {
            return await _context.Usuarios.AsNoTracking()
                .Select(UsuarioMapper)
                .ToListAsync();
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
            
            if(id == usuarioIdActual)
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
        // Helpers privados — responsabilidad única por método
        // ---------------------------------------------------------------

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
            if (await _context.Penalizaciones.AnyAsync(p =>
                    p.UsuarioId == usuarioId && p.Estado == EstadoPenalizacion.Pendiente.ToString()))
                throw new ConflictException("No se puede cambiar el estado del usuario ya que cuenta con penalizaciones activas");

            if (await _context.Prestamos.AnyAsync(pr =>
                    pr.UsuarioId == usuarioId && pr.Estado != EstadoPrestamo.Devuelto.ToString()))
                throw new ConflictException("No se puede eliminar/desactivar al usuario porque cuenta con libros prestados o en mora");

            if (await _context.ReservasLabs.AnyAsync(r =>
                    r.UsuarioId == usuarioId &&
                    (r.Estado == EstadoReserva.Pendiente.ToString() || r.Estado == EstadoReserva.Confirmada.ToString())))
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