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
        public async Task<ActionResult<List<PenalizacionResponse>>> Listar() => Ok(await _service.GetAllAsync());

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<PenalizacionResponse>> ObtenerPorId(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpGet("mis-penalizaciones")]
        public async Task<ActionResult<List<PenalizacionResponse>>> MisPenalizaciones()
        {
            var usuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();
            return Ok(await _service.GetPorUsuarioAsync(usuarioId));
        }

        [HttpGet("por-prestamo/{prestamoId:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<List<PenalizacionResponse>>> PorPrestamo(int prestamoId) =>
            Ok(await _service.GetPorPrestamoAsync(prestamoId));

        [HttpGet("por-reserva/{reservaLabId:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<List<PenalizacionResponse>>> PorReserva(int reservaLabId) =>
            Ok(await _service.GetPorReservaAsync(reservaLabId));

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
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult> Anular(int id)
        {
            await _service.AnularAsync(id);
            return NoContent();
        }
    }
}
