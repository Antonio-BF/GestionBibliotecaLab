using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Rol
{
    public class RolRequest
    {
        [Required(ErrorMessage = "El campo es requerido")]
        [MaxLength(50,ErrorMessage ="El campo solo acepta 50 caracteres")]
        public string Nombre { get; set; } = null!;

        [MaxLength(200, ErrorMessage = "El campo solo acepta 200 caracteres")]
        public string? Descripcion { get; set; }
    }
}
