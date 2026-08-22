using GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LaboratorioController : ControllerBase
    {
        private readonly ILaboratorioService _service;

        public LaboratorioController(ILaboratorioService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<LaboratorioResponse>>> Listar()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<LaboratorioResponse>> ObtenerPorId(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        } 

        [HttpPost]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult<LaboratorioResponse>> Registrar(CreateLaboratorioRequest request)
        {
            var laboratorio = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = laboratorio.Id }, laboratorio);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult> Actualizar(int id, UpdateLaboratorioRequest request)
        {
            await _service.ActualizarAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id:int}/imagen")]
        [Authorize(Roles = RolesSistema.Administrador)]
        [RequestSizeLimit(3 * 1024 * 1024)]
        public async Task<ActionResult<LaboratorioResponse>> SubirImagen(int id, IFormFile archivo)
        {
            if (archivo is null || archivo.Length == 0)
                return BadRequest("Debe adjuntar un archivo de imagen.");

            await using var stream = archivo.OpenReadStream();
            var laboratorio = await _service.ActualizarImagenAsync(id, stream, archivo.FileName);
            return Ok(laboratorio);
        }

        [HttpPatch("{id:int}/estado")]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult> CambiarEstado(int id)
        {
            await _service.CambiarEstadoAsync(id);
            return NoContent();
        }
    }
}
