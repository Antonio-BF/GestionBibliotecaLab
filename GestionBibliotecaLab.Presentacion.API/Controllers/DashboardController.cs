using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        [HttpGet("usuario")]
        [Authorize(Roles = RolesSistema.EstudianteYDocente)]
        public async Task<ActionResult<DashboardUsuarioResponse>> ObtenerDashboardUsuario(
            CancellationToken cancellationToken)
            => Ok(await _service.ObtenerDashboardUsuarioAsync(cancellationToken));

        [HttpGet("bibliotecario")]
        [Authorize(Roles = RolesSistema.Bibliotecario)]
        public async Task<ActionResult<DashboardBibliotecarioResponse>> ObtenerDashboardBibliotecario(
            CancellationToken cancellationToken)
            => Ok(await _service.ObtenerDashboardBibliotecarioAsync(cancellationToken));

        [HttpGet("administrador")]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult<DashboardAdministradorResponse>> ObtenerDashboardAdministrador(
            CancellationToken cancellationToken)
            => Ok(await _service.ObtenerDashboardAdministradorAsync(cancellationToken));
    }
}