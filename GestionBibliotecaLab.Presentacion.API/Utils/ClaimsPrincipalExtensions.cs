using GestionBibliotecaLab.Aplicacion.Seguridad;
using System.Security.Claims;

namespace GestionBibliotecaLab.Presentacion.API.Utils
{
    public static class ClaimsPrincipalExtensions
    {
        public static bool EsPersonalDeGestion(this ClaimsPrincipal user) =>
            user.IsInRole(RolesSistema.Administrador) || user.IsInRole(RolesSistema.Bibliotecario);
    }
}
