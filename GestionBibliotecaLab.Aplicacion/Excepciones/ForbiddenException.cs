namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class ForbiddenException : ExcepcionAplicacionBase
    {
        public ForbiddenException(string mensaje)
            : base(mensaje, 403)
        {
        }
    }
}
