using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Libro;
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
    public class LibroController : ControllerBase
    {
        private readonly ILibroService _service;

        public LibroController(ILibroService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PaginacionResultado<LibroResponse>>> Listar([FromQuery] LibroFiltroRequest filtro)
        {
            return Ok(await _service.GetAllAsync(filtro));
        }

        [HttpGet("eliminados")]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult<PaginacionResultado<LibroResponse>>> ListarEliminados([FromQuery] LibroFiltroRequest filtro)
        {
            return Ok(await _service.GetEliminadosAsync(filtro));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<LibroResponse>> ObtenerPorId(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpPost]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult<LibroResponse>> Registrar(CreateLibroRequest request)
        {
            var libro = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = libro.Id }, libro);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesSistema.Administrador)]
        public async Task<ActionResult> Actualizar(int id, UpdateLibroRequest request)
        {
            await _service.ActualizarAsync(id, request);
            return NoContent();
        }

        [HttpPost("{id:int}/portada")]
        [Authorize(Roles = RolesSistema.Administrador)]
        [RequestSizeLimit(3 * 1024 * 1024)]
        public async Task<ActionResult<LibroResponse>> SubirPortada(int id, IFormFile archivo)
        {
            if (archivo is null || archivo.Length == 0)
                return BadRequest("Debe adjuntar un archivo de imagen.");

            await using var stream = archivo.OpenReadStream();
            var libro = await _service.ActualizarPortadaAsync(id, stream, archivo.FileName);
            return Ok(libro);
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
