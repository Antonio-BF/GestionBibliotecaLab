using GestionBibliotecaLab.Aplicacion.Dtos.Categoria;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriaController : ControllerBase
    {
        private readonly ICategoriaService _service;

        public CategoriaController(ICategoriaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<CategoriaResponse>>> Listar()
        {
            return Ok(await _service.GetAllAsync());
        }


        [HttpGet("{id:int}")]
        public async Task<ActionResult<CategoriaResponse>> ObtenerPorId(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }
            
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<CategoriaResponse>> Registrar(CategoriaRequest request)
        {
            var categoria = await _service.RegistrarAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = categoria.Id }, categoria);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Actualizar(int id, CategoriaRequest request)
        {
            await _service.ActualizarAsync(id, request);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Eliminar(int id)
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }
    }
}
