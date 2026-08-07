using System;
using System.Collections.Generic;
using System.Text;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Rol
{
    public class RolResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
    }
}
