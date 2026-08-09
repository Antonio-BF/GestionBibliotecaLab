using GestionBibliotecaLab.Aplicacion.Dtos.Auth;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionBibliotecaLab.Presentacion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        [HttpPost("registro")]
        public async Task<ActionResult<LoginResponse>> Registro(RegistroRequest request)
        {
            var resultado = await _service.RegistrarAsync(request);
            return Ok(resultado);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            var resultado = await _service.LoginAsync(request);
            return Ok(resultado);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<LoginResponse>> Refresh(RefreshRequest request)
        {
            var resultado = await _service.RefrescarTokenAsync(request);
            return Ok(resultado);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> Logout(RefreshRequest request)
        {
            await _service.LogoutAsync(request);
            return NoContent();
        }
    }
}
