using System;
using System.Collections.Generic;
using System.Text;

namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class DuplicateResourceException : ExcepcionAplicacionBase
    {
        public DuplicateResourceException(string mensaje) : 
            base(mensaje, 409)
        {
        }
    }
}
