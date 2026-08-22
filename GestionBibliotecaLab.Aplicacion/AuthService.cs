using GestionBibliotecaLab.Aplicacion.Dtos.Auth;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GestionBibliotecaLab.Aplicacion
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasherService _passwordHasher;
        private readonly IJwtService _jwtService;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            AppDbContext context,
            IPasswordHasherService passwordHasher,
            IJwtService jwtService,
            IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<AuthResponse> RegistrarAsync(RegistroRequest request)
        {
            var email = request.Email.Trim().ToLower();

            if (await _context.Usuarios.IgnoreQueryFilters().AnyAsync(u => u.Email == email))
                throw new DuplicateResourceException("Ya existe un usuario registrado con ese email.");

            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Id == request.RolId)
                ?? throw new ResourceNotFoundException($"No se encontró el rol con el ID {request.RolId}.");

            if (string.Equals(rol.Nombre, "Administrador", StringComparison.OrdinalIgnoreCase) || string.Equals(rol.Nombre, "Bibliotecario", StringComparison.OrdinalIgnoreCase))
                throw new ForbiddenException("No es posible autorregistrarse con el rol Administrador o Bibliotecario.");

            var usuario = new Usuario
            {
                Nombres = request.Nombres.Trim(),
                Apellidos = request.Apellidos.Trim(),
                Email = email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RolId = request.RolId
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                usuario.Rol = rol;
                var response = await GenerarRespuestaConNuevoRefreshTokenAsync(usuario);

                await transaction.CommitAsync();
                return response;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var email = request.Email.Trim().ToLower();

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (usuario is null || !_passwordHasher.VerifyPassword(usuario.PasswordHash, request.Password))
                throw new UnauthorizedException("Email o contraseña incorrectos.");

            if (usuario.IsDeleted)
                throw new UnauthorizedException("Usuario sin permisos para ingresar al sistema");

            return await GenerarRespuestaConNuevoRefreshTokenAsync(usuario);
        }

        public async Task<AuthResponse> RefrescarTokenAsync(RefreshRequest request)
        {
            var hashRecibido = _jwtService.HashRefreshToken(request.RefreshToken);
            var fechaActual = DateTime.UtcNow;

            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.Usuario)
                    .ThenInclude(u => u.Rol)
                .FirstOrDefaultAsync(rt => rt.Token == hashRecibido);

            if (refreshToken is null)
                throw new UnauthorizedException("El token de actualización no es válido.");

            if (refreshToken.Usuario.IsDeleted)
                throw new UnauthorizedException("El usuario se encuentar inactivo en el sistema");

            if (refreshToken.Revocado)
            {
                await RevocarCadenaDeRotacionAsync(refreshToken);
                throw new UnauthorizedException("Se detectó un uso indebido del token de actualización. Por seguridad, la cadena de sesiones comprometida ha sido cerrada.");
            }

            if (refreshToken.FechaExpiracion <= fechaActual)
                throw new UnauthorizedException("El token de actualización ha expirado.");

            var usuario = refreshToken.Usuario;

            var (accessToken, expiracionAccess) = _jwtService.GenerarAccessToken(usuario);
            var nuevoTokenPlano = _jwtService.GenerarRefreshToken();
            var nuevoTokenHash = _jwtService.HashRefreshToken(nuevoTokenPlano);

            refreshToken.Revocado = true;
            refreshToken.FechaRevocacion = fechaActual;
            refreshToken.ReemplazadoPorToken = nuevoTokenHash;

            _context.RefreshTokens.Add(new RefreshToken
            {
                UsuarioId = usuario.Id,
                Token = nuevoTokenHash,
                FechaExpiracion = fechaActual.AddDays(_jwtSettings.RefreshTokenDias),
                Revocado = false
            });

            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = nuevoTokenPlano,
                FechaExpiracionAccessToken = expiracionAccess,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Rol = usuario.Rol.Nombre
            };
        }

        public async Task LogoutAsync(RefreshRequest request)
        {
            var hash = _jwtService.HashRefreshToken(request.RefreshToken);
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == hash);

            if (refreshToken is null || refreshToken.Revocado)
                return;

            refreshToken.Revocado = true;
            refreshToken.FechaRevocacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task<AuthResponse> GenerarRespuestaConNuevoRefreshTokenAsync(Usuario usuario)
        {
            var (accessToken, expiracionAccess) = _jwtService.GenerarAccessToken(usuario);
            var refreshTokenPlano = _jwtService.GenerarRefreshToken();

            _context.RefreshTokens.Add(new RefreshToken
            {
                UsuarioId = usuario.Id,
                Token = _jwtService.HashRefreshToken(refreshTokenPlano),
                FechaExpiracion = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDias),
                Revocado = false
            });

            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenPlano,
                FechaExpiracionAccessToken = expiracionAccess,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Rol = usuario.Rol.Nombre
            };
        }

        private async Task RevocarCadenaDeRotacionAsync(RefreshToken tokenComprometido)
        {
            var tokensUsuario = await _context.RefreshTokens
                .Where(rt => rt.UsuarioId == tokenComprometido.UsuarioId)
                .ToListAsync();

            var diccionarioTokens = tokensUsuario.ToDictionary(rt => rt.Token);

            var hashSiguiente = tokenComprometido.ReemplazadoPorToken;
            var visitados = new HashSet<string> { tokenComprometido.Token };

            const int maxSaltos = 50;
            var saltos = 0;
            bool requiereActualizacion = false;
            var fechaActual = DateTime.UtcNow;

            while (!string.IsNullOrEmpty(hashSiguiente) && saltos < maxSaltos)
            {
                if (!visitados.Add(hashSiguiente))
                    break;

                if (!diccionarioTokens.TryGetValue(hashSiguiente, out var siguienteToken))
                    break;

                if (!siguienteToken.Revocado)
                {
                    siguienteToken.Revocado = true;
                    siguienteToken.FechaRevocacion = fechaActual;
                    requiereActualizacion = true;
                }

                hashSiguiente = siguienteToken.ReemplazadoPorToken;
                saltos++;
            }

            if (requiereActualizacion)
            {
                await _context.SaveChangesAsync();
            }
        }
    }
}