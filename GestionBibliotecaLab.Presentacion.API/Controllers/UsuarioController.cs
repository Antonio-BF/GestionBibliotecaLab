using GestionBibliotecaLab.Aplicacion.Dtos.Usuario;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = RolesSistema.Administrador)]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UsuarioResponse>>> ListarUsuarios()
        {
            return Ok(await _usuarioService.GetAllUsuarioAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UsuarioResponse>> ObtenerPorId(int id)
        {
            return Ok(await _usuarioService.GetByIdAsync(id));
        }
        [HttpPost]
        public async Task<ActionResult<UsuarioResponse>> RegistrarUsuario(CreateUsuarioRequest request)
        {
            var creado = await _usuarioService.RegistrarUsuarioAsync(request);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> ActualizarUsuario(int id, UpdateUsuarioRequest request)
        {
            await _usuarioService.ActualizarUsuarioAsync(id, request);
            return NoContent();
        }


        [HttpPatch("{id:int}/estado")]
        public async Task<ActionResult> CambiarEstadoUsuario(int id)
        {
            await _usuarioService.CambiarEstadoAsync(id);
            return NoContent();
        }



    }
}
