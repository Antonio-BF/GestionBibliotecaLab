using System;
using System.Collections.Generic;
using System.Text;

namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class ResourceNotFoundException : ExcepcionAplicacionBase
    {
        public ResourceNotFoundException(string mensaje) : 
            base(mensaje, 404)
        {
        }
    }
}
