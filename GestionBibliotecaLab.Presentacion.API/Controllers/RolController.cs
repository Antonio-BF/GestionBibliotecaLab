using GestionBibliotecaLab.Aplicacion.Dtos.Rol;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")]
    public class RolController : ControllerBase
    {
        private readonly IRolService _service;

        public RolController(IRolService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> ListarRoles()
        {
            return Ok(await _service.GetAllRol());
        }
        [HttpGet("{id:int}")]
        public async Task<ActionResult> ObtenerPorId(int id)
        {
            return Ok(await _service.GetById(id));
        }

        [HttpPost]
        public async Task<ActionResult<RolResponse>> RegistrarRol(RolRequest request)
        {
            var rol = await _service.SaveRol(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = rol.Id }, rol);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> ActualizarRol(int id, RolRequest request)
        {
            await _service.UpdateRol(id, request);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> EliminarRol(int id)
        {
            await _service.DeleteRol(id);
            return NoContent();
        }

    }
}
