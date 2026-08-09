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

        public async Task<LoginResponse> RegistrarAsync(RegistroRequest request)
        {
            var email = request.Email.Trim().ToLower();

            if (await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == email))
                throw new DuplicateResourceException("Ya existe un usuario registrado con ese email.");

            var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Id == request.RolId)
                ?? throw new ResourceNotFoundException($"No se encontró el rol con el ID {request.RolId}.");

            if (string.Equals(rol.Nombre, "Administrador", StringComparison.OrdinalIgnoreCase))
                throw new ForbiddenException("No es posible autorregistrarse con el rol Administrador.");

            var usuario = new Usuario
            {
                Nombres = request.Nombres.Trim(),
                Apellidos = request.Apellidos.Trim(),
                Email = email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RolId = request.RolId
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            usuario.Rol = rol;

            return await GenerarRespuestaConNuevoRefreshTokenAsync(usuario);
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var email = request.Email.Trim().ToLower();

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (usuario is null || !_passwordHasher.VerifyPassword(usuario.PasswordHash, request.Password))
                throw new UnauthorizedException("Email o contraseña incorrectos.");

            return await GenerarRespuestaConNuevoRefreshTokenAsync(usuario);
        }

        public async Task<LoginResponse> RefrescarTokenAsync(RefreshRequest request)
        {
            var hashRecibido = _jwtService.HashRefreshToken(request.RefreshToken);

            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.Usuario)
                    .ThenInclude(u => u.Rol)
                .FirstOrDefaultAsync(rt => rt.Token == hashRecibido);

            if (refreshToken is null)
                throw new UnauthorizedException("El token de actualización no es válido.");

            if (refreshToken.Revocado)
            {
                await RevocarCadenaDeRotacionAsync(refreshToken);
                throw new UnauthorizedException(
                    "Se detectó un uso indebido del token de actualización. Por seguridad, todas las sesiones han sido cerradas.");
            }

            if (refreshToken.FechaExpiracion <= DateTime.UtcNow)
                throw new UnauthorizedException("El token de actualización ha expirado.");

            var usuario = refreshToken.Usuario;

            var (accessToken, expiracionAccess) = _jwtService.GenerarAccessToken(usuario);
            var nuevoTokenPlano = _jwtService.GenerarRefreshToken();
            var nuevoTokenHash = _jwtService.HashRefreshToken(nuevoTokenPlano);

            // Rotación: el token usado queda inutilizable de inmediato.
            refreshToken.Revocado = true;
            refreshToken.FechaRevocacion = DateTime.UtcNow;
            refreshToken.ReemplazadoPorToken = nuevoTokenHash;

            _context.RefreshTokens.Add(new RefreshToken
            {
                UsuarioId = usuario.Id,
                Token = nuevoTokenHash,
                FechaExpiracion = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDias),
                Revocado = false
            });

            await _context.SaveChangesAsync();

            return new LoginResponse
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

        private async Task<LoginResponse> GenerarRespuestaConNuevoRefreshTokenAsync(Usuario usuario)
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

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenPlano,
                FechaExpiracionAccessToken = expiracionAccess,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Rol = usuario.Rol.Nombre
            };
        }

        /// <summary>
        /// Ante un token de refresco reutilizado (ya revocado por una rotación previa),
        /// revoca únicamente los tokens que descienden de él siguiendo ReemplazadoPorToken
        /// hacia adelante, hasta llegar al token activo (la punta de la cadena) o hasta que
        /// la cadena se corte. Deliberadamente NO revoca todas las sesiones del usuario:
        /// una sesión completamente independiente (otro dispositivo, u otro login posterior
        /// al incidente) no comparte linaje con el token comprometido y no debe verse afectada.
        /// </summary>
        private async Task RevocarCadenaDeRotacionAsync(RefreshToken tokenComprometido)
        {
            var hashSiguiente = tokenComprometido.ReemplazadoPorToken;
            var visitados = new HashSet<string> { tokenComprometido.Token };

            // Salvaguarda defensiva: si por algún motivo la cadena tuviera un ciclo,
            // esto evita un bucle infinito en vez de dejar el request colgado indefinidamente.
            const int maxSaltos = 50;
            var saltos = 0;

            while (!string.IsNullOrEmpty(hashSiguiente) && saltos < maxSaltos)
            {
                if (!visitados.Add(hashSiguiente))
                    break;

                var siguienteToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == hashSiguiente);

                // Cadena rota: No hay nada más que revocar.
                if (siguienteToken is null)
                    break;

                if (!siguienteToken.Revocado)
                {
                    siguienteToken.Revocado = true;
                    siguienteToken.FechaRevocacion = DateTime.UtcNow;
                }

                hashSiguiente = siguienteToken.ReemplazadoPorToken;
                saltos++;
            }

            await _context.SaveChangesAsync();
        }
    }
}
