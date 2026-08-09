namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class UnauthorizedException : ExcepcionAplicacionBase
    {
        public UnauthorizedException(string mensaje)
        : base(mensaje, 401)
        {
        }
    }
}
