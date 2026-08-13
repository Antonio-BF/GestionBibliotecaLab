using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using System.Security.Claims;

namespace GestionBibliotecaLab.Presentacion.API.Utils
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int ObtenerUsuarioIdAutenticado()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var claim = user?.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(claim, out int userId))
            {
                return userId;
            }

            throw new UnauthorizedException("Usuario no autenticado o token inválido.");
        }
    }
}
