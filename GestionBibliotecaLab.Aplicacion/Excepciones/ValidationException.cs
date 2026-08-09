namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class ValidationException : ExcepcionAplicacionBase
    {
        public ValidationException(string mensaje)
       : base(mensaje, 400)
        {
        }
    }
}
