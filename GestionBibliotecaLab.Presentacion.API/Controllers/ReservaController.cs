using GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using GestionBibliotecaLab.Presentacion.API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReservaController : ControllerBase
    {
        private readonly IReservaService _service;
        private readonly ICurrentUserService _currentUserService;

        public ReservaController(IReservaService service, ICurrentUserService currentUserService)
        {
            _service = service;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<List<ReservaResponse>>> Listar() => Ok(await _service.GetAllAsync());

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<ReservaResponse>> ObtenerPorId(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpGet("mis-reservas")]
        public async Task<ActionResult<List<ReservaResponse>>> MisReservas()
        {
            var usuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();
            return Ok(await _service.GetPorUsuarioAsync(usuarioId));
        }

        [HttpGet("disponibilidad")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<bool>> VerificarDisponibilidad(
            [FromQuery] int laboratorioId, [FromQuery] DateOnly fecha,
            [FromQuery] TimeOnly horaInicio, [FromQuery] TimeOnly horaFin)
        {
            return Ok(await _service.VerificarDisponibilidadAsync(laboratorioId, fecha, horaInicio, horaFin));
        }

        [HttpPost]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult<ReservaResponse>> Registrar(CreateReservaRequest request)
        {
            var reserva = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = reserva.Id }, reserva);
        }

        [HttpPatch("{id:int}/confirmacion")]
        [Authorize(Roles = RolesSistema.AdminYBibliotecario)]
        public async Task<ActionResult> Confirmar(int id)
        {
            await _service.ConfirmarAsync(id);
            return NoContent();
        }

        [HttpPatch("{id:int}/cancelacion")]
        public async Task<ActionResult> Cancelar(int id)
        {
            var usuarioId = _currentUserService.ObtenerUsuarioIdAutenticado();
            await _service.CancelarAsync(id, usuarioId, User.EsPersonalDeGestion());
            return NoContent();
        }
    }
}
