using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PenalizacionController : ControllerBase
    {
        private readonly IPenalizacionService _service;
        private readonly ICurrentUserService _currentUserService;

        public PenalizacionController(IPenalizacionService service, ICurrentUserService currentUserService)
        {
            _service = service;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PaginacionResultado<PenalizacionResponse>>> Listar([FromQuery] PenalizacionFiltroRequest filtro)
             => Ok(await _service.GetAllAsync(filtro));

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PenalizacionResponse>> ObtenerPorId(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpGet("mis-penalizaciones")]
        public async Task<ActionResult<PaginacionResultado<PenalizacionResponse>>> MisPenalizaciones([FromQuery] PenalizacionFiltroRequest filtro)
        {
            filtro.UsuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();
            return Ok(await _service.GetAllAsync(filtro));
        }

        [HttpGet("por-prestamo/{prestamoId:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PaginacionResultado<PenalizacionResponse>>> PorPrestamo(
            int prestamoId, [FromQuery] PenalizacionFiltroRequest filtro)
        {
            filtro.PrestamoId = prestamoId;
            return Ok(await _service.GetAllAsync(filtro));
        }

        [HttpGet("por-reserva/{reservaLabId:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PaginacionResultado<PenalizacionResponse>>> PorReserva(
            int reservaLabId, [FromQuery] PenalizacionFiltroRequest filtro)
        {
            filtro.ReservaLabId = reservaLabId;
            return Ok(await _service.GetAllAsync(filtro));
        }

        [HttpPost]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PenalizacionResponse>> Registrar(CreatePenalizacionRequest request)
        {
            var penalizacion = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = penalizacion.Id }, penalizacion);
        }

        [HttpPatch("{id:int}/pago")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult> Resolver(int id)
        {
            await _service.ResolverAsync(id);
            return NoContent();
        }

        [HttpPatch("{id:int}/anulacion")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult> Anular(int id)
        {
            await _service.AnularAsync(id);
            return NoContent();
        }
    }
}
