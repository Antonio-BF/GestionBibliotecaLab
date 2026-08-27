using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Prestamo;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrestamoController : ControllerBase
    {
        private readonly IPrestamoService _service;
        private readonly ICurrentUserService _currentUserService;

        public PrestamoController(IPrestamoService service, ICurrentUserService currentUserService)
        {
            _service = service;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PaginacionResultado<PrestamoResponse>>> Listar([FromQuery] PrestamoFiltroRequest filtro)
             => Ok(await _service.GetAllAsync(filtro));

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PrestamoResponse>> ObtenerPorId(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpGet("mis-prestamos")]
        public async Task<ActionResult<PaginacionResultado<PrestamoResponse>>> MisPrestamos([FromQuery] PrestamoFiltroRequest filtro)
        {
            filtro.UsuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();
            return Ok(await _service.GetAllAsync(filtro));
        }

        [HttpPost]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PrestamoResponse>> Registrar(CreatePrestamoRequest request)
        {
            var prestamo = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = prestamo.Id }, prestamo);
        }

        [HttpPatch("{id:int}/devolucion")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PrestamoResponse>> Devolver(int id) => Ok(await _service.DevolverAsync(id));

        [HttpPatch("{id:int}/renovacion")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PrestamoResponse>> Renovar(int id, RenovarPrestamoRequest request)
            => Ok(await _service.RenovarAsync(id, request));
    }
}