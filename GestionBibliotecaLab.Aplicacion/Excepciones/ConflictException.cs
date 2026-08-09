namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public class ConflictException : ExcepcionAplicacionBase
    {
        public ConflictException(string mensaje) :
            base(mensaje, 409)
        { }
    }
}
